import React, { Component } from 'react'
import {
  // StyleSheet,
  View,
  // Text,
  TouchableOpacity,
  Linking
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'
import reactMixin from 'react-mixin'
import dateformat from 'dateformat'
import moment from 'moment'
import Prompt from 'react-native-prompt'
import LinearGradient from 'react-native-linear-gradient'

import constants from '@tradle/constants'

import utils, { translate, translateEnum, isEnum, isStub, isForm, getRootHash } from '../utils/utils'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import { Text } from './Text'
import defaultBankStyle from '../styles/defaultBankStyle.json'

const NOT_SPECIFIED = '[not specified]'
const DEFAULT_CURRENCY_SYMBOL = '$'
const TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const OBJECT = 'tradle.Object'

const PHOTO = 'tradle.Photo'
const METHOD = 'tradle.Method'
const PARTIAL = 'tradle.Partial'
const FILE = 'tradle.File'
const CHECK = 'tradle.Check'
const CHECK_OVERRIDE = 'tradle.CheckOverride'
const APPLICATION = 'tradle.Application'
const DURATION = 'tradle.Duration'
const VERIFICATION = 'tradle.Verification'
const PDF_ICON = 'https://tradle-public-images.s3.amazonaws.com/pdf-icon.png' //https://tradle-public-images.s3.amazonaws.com/Pdf.png'

const {
  TYPE,
  ROOT_HASH,
} = constants
const {
  IDENTITY,
  MONEY,
  FORM
} = constants.TYPES

import StyleSheet from '../StyleSheet'
import Image from './Image'

class ShowPropertiesView extends Component {
  static displayName = 'ShowPropertiesView';

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    checkProperties: PropTypes.func,
    currency: PropTypes.string,
    bankStyle: PropTypes.object,
    errorProps: PropTypes.object,
    excludedProperties: PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      promptVisible: null,
      uncheck: null
    }
  }

  render() {
    let viewCols = this.getViewCols()
    return (
      <View style={{paddingLeft: 3, paddingBottom: 50}} key={this.getNextKey()}>
        {viewCols}
      </View>
    );
  }
  shouldComponentUpdate(nextProps, nextState) {
    // Prompt for employee to write a correction message
    if (utils.resized(this.props, nextProps))
      return true
    if (this.state.promptVisible !== nextState.promptVisible)
      return true
    if (this.state.uncheck !== nextState.uncheck)
      return true
    if (this.props.resource !== nextProps.resource)
      return true
    if (this.props.isVerifier !== nextProps.isVerifier)
      return true
    // if (!this.props.errorProps  ||  !nextProps.errorProps)
    //   return true
    return this.props.errorProps != nextProps.errorProps
  }
  getViewCols(resource, model) {
    if (!resource)
      resource = this.props.resource
    let { checkProperties, excludedProperties, bankStyle, currency, locale, isItem, isVerifier } = this.props
    var modelName = utils.getType(resource)
    if (!model)
      model = this.props.model  ||  utils.getModel(modelName)
    if (model.id !== modelName  &&  !utils.isSubclassOf(modelName, model.id))
      model = utils.getModel(modelName)

    let styles = createStyles({bankStyle: bankStyle || defaultBankStyle})
    var props = model.properties;
    let vCols = utils.getPaintViewCols(model)
    // if (vCols)
    //   vCols = utils.ungroup({model, viewCols: vCols})
    // see if it is inlined resource like 'prefill' in tradle.FormPrefill and show all of the properties
    if (!resource[ROOT_HASH]) {
      if (!vCols)
        vCols = []
      for (let p in resource) {
        if (p.charAt(0) !== '_'  && props[p]  &&  vCols.findIndex(pr => pr.name !== p) === -1)
          vCols.push(props[p])
      }
    }

    if (excludedProperties) {
      var mapped = [];
      excludedProperties.forEach((p) =>  {
        if (props[p]) {
          mapped.push(p);
        }
      })
      excludedProperties = mapped;
    }

    // if (!vCols)
    //   vCols = utils.getViewCols(model)
    var isMessage = utils.isMessage(this.props.resource)
    if (!isMessage  &&  !isItem) {
      var len = vCols.length;
      for (var i=0; i<len; i++) {
        if (vCols[i].displayName) {
          vCols.splice(i, 1);
          len--;
        }
      }
    }
    let isPartial = model.id === PARTIAL
    let isMethod = utils.isSubclassOf(model, METHOD)
    let me = utils.getMe()

    const ObjectModel = utils.getModel(OBJECT)

    let notEditable = model.notEditable || utils.isSubclassOf(model, CHECK_OVERRIDE)

    let viewCols = []
    let groups = []
    let propsIn = []

    let hasGroups
    let propsDisplayed
    vCols.forEach(pMeta => {
      let p = pMeta.name
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1) {
        return
      }

      // var pMeta = props[p];
      if (pMeta  &&  utils.isHidden(p, resource)) {
        return
      }
      if (!pMeta)
        pMeta = ObjectModel.properties[p]

      if (pMeta.internalUse &&  (!me.isEmployee || me.counterparty))
        return

      let val = resource[p]
      if (pMeta.range === 'json') {
        if (this.renderJsonProp(val, model, pMeta, viewCols))
          propsIn.push(p)
        return
      }
      let isRef;
      let isItems
      // let isEmail
      let isUndefined = !val  &&  (typeof val === 'undefined')
      if (isUndefined) {
        if (pMeta.displayAs) {
          val = utils.templateIt(pMeta, resource)
          if (!val)
            return

          val = <Text style={styles.link}>{val}</Text>
        }
        else if (p.endsWith('_group')) {
          viewCols.push(
            <View style={{paddingHorizontal: 15, paddingTop: 15}} key={this.getNextKey()}>
              <View style={{flexDirection: 'row', paddingVertical: 5}}>
                <View style={styles.accent}/>
                <Text style={styles.groupStyleText}>{translate(pMeta, model)}</Text>
              </View>
            </View>
          )
          if (!isVerifier) {
            hasGroups = true
            groups.push(propsIn.length)

            // groups.push(viewCols.length - 1)
          }
          propsIn.push(p)
          return
        }
        else if (checkProperties) {
          if (pMeta.items) {
            if (pMeta.items.ref  &&  !utils.isEnum(pMeta.items.ref)) {
              propsIn.splice(propsIn.length - 1, 1)
              return
            }
          }
          val = <Text style={styles.title}>{NOT_SPECIFIED}</Text>
        }
        else
          return
      }
      else if (pMeta.type === 'date') {
        if (pMeta.format)
          val = dateformat(val, pMeta.format)
        else {
          // let valueMoment = moment.utc(val)
          // let date = new Date(valueMoment.year(), valueMoment.month(), valueMoment.date(), valueMoment.hours(), valueMoment.minutes())
          // val = utils.formatDate(date)
          val = utils.formatDate(val)
        }
      }
      else if (!pMeta.range  &&  pMeta.type === 'number')
        val = utils.formatNumber(pMeta, val, locale)
      else if (pMeta.ref) {
        ({val, isRef} = this.renderRefProperty({val, pMeta, viewCols, vCols, styles, resource, hasGroups}))
        if (!val)
          return
      }

      let checkForCorrection = !notEditable  && !pMeta.immutable &&  !pMeta.readOnly  &&  this.getCheckForCorrection(pMeta)
      if (!isRef) {
        if (isPartial  &&  p === 'leaves') {
          viewCols.push(this.addForPartial(val, styles))
          propsIn.push(p)
          return
        }
        else if (pMeta.range === 'property') {
          let m = utils.getModel(modelName)
          if (m.subClassOf === CHECK)
            val = translate(utils.getModel(utils.getType(resource.form)).properties[val], m)
          else
            val = translate(m.properties[val], m)
          viewCols.push(<View style={{paddingLeft: 10}}>
                          <Text style={styles.title}>{translate(pMeta, model)}</Text>
                          <Text style={styles.description}>{val}</Text>
                        </View>)
          propsIn.push(p)
          return
        }
        isItems = Array.isArray(val)
        let iref = isItems  &&  pMeta.items.ref
        if (iref) {
          if (iref === PHOTO  &&  pMeta.range === 'photo') {
            return
          }
          if (isEnum(iref)) {
            let values = val.map((v) => translateEnum(v)).join(', ')
            viewCols.push(
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}} key={this.getNextKey()}>
                <View style={{paddingLeft: 10, width: utils.getContentWidth(ShowPropertiesView)}}>
                  <Text style={styles.title}>{translate(pMeta, model)}</Text>
                  <Text style={[styles.description, {fontSize: 16}]}>{values}</Text>
                </View>
                {checkForCorrection}
              </View>
              )
            propsIn.push(p)
            return
          }
          if (pMeta.items.backlink)
            return
        }
        val = this.renderSimpleProp({val, pMeta, modelName, component: ShowPropertiesView, hasGroups, showResourceProperty: this.showResourceProperty.bind(this)})
      }
      var title
      if (!pMeta.skipLabel  &&  !isItems)
        title = <Text style={modelName === TERMS_AND_CONDITIONS ? styles.bigTitle : styles.title}>{translate(pMeta, model)}</Text>

      let isPromptVisible = this.state.promptVisible !== null
      if (isPromptVisible)
        console.log(this.state.promptVisible)

      var isDirectionRow
      if (checkProperties)
        isDirectionRow = true

      let style = [styles.textContainer, {padding: 10}]
      if (isDirectionRow) {
        style.push({flexDirection: 'row'})
        if (checkForCorrection)
          style.push({justifyContent: 'space-between', flex: 10})
      }
      else
        style.push({flexDirection: 'column'})
      if (hasGroups)
        style.push({flex: 1})

      viewCols.push(
        <View key={this.getNextKey()}>
           <View style={isItem ? {} : {width: utils.getContentWidth(ShowPropertiesView), flexDirection: isDirectionRow ? 'row' : 'column'}}>
             <View style={[style, {flexDirection: 'column'}]}>
               {title}
               {val}
             </View>
             {checkForCorrection}
           </View>
         </View>
      )
      propsIn.push(p)
    })
    if (groups.length)
      viewCols = this.renderGroups(resource, viewCols, groups, propsIn, styles)

    if (resource.txId  &&  !isItem) { // || utils.isSealableModel(model)) {
      viewCols.push(
          <View key={this.getNextKey()} ref='propertySheet'>
            {this.addDataSecurity(resource)}
          </View>
        )
    }
    return viewCols
  }
  showResourceProperty(displayingPart) {
    let { bankStyle, currency } = this.props
    let styles = createStyles({bankStyle: bankStyle || defaultBankStyle})
    return <View style={{paddingVertical: 3}}>
        <View style={styles.itemBackground}>
          <Text style={styles.itemTitle}>{translate(utils.getModel(displayingPart[TYPE]))}</Text>
        </View>
        <ShowPropertiesView resource={displayingPart}
                            currency={currency}
                            bankStyle={bankStyle}
                            isItem={true}
                            navigator={navigator} />
      </View>
  }
  renderGroups(resource, viewCols, groups, propsIn, styles) {
    let groupEnd = viewCols.length
    const { bankStyle, noGradient } = this.props
    let props = utils.getModel(resource[TYPE]).properties
    let isSmall = utils.isSmallScreen(ShowPropertiesView) || resource[TYPE] === VERIFICATION
    let cardGradient = bankStyle.cardGradient || '#dcf8ef,#fee2f8'// '#d7e1ec, #ffffff'
    const colors = cardGradient.split(',').map(c => c.trim())
    let retGroups = []
    for (let i=groups.length - 1, j=1; i>=0; i--, j++) {
      let groupStart = groups[i]
      let size = groupEnd - groupStart - 1
      if (!size) {
        groupEnd--
        continue
      }
      let groupView
      let hasMarkdown, hasItems
      for (let ii=groupStart; ii<groupEnd && !hasMarkdown && !hasItems; ii++) {
        const prop = props[propsIn[ii]]
        if (prop.markdown)
          hasMarkdown = true
        if (prop.inlined && prop.type === 'array')
          hasItems = true
      }
      let cols = viewCols.slice(groupStart, groupEnd)
      if (isSmall  ||  size < 4  ||  hasMarkdown || hasItems) {
        if (hasMarkdown  ||  hasItems  ||  i > 0 || noGradient) {
          groupView = <View style={{marginVertical: 10}}>
                        <View style={{backgroundColor: '#fafafa', borderColor: '#eeeeee', borderRadius: 15, borderWidth: 1}}>
                          {i === 0  &&  this.getDateView({resource, styles, noGradient: true})}
                          {cols}
                        </View>
                      </View>
        }
        else {
          let groupBody = <View style={{flex: 1}}>
                              {i === 0  &&  this.getDateView({resource, styles})}
                              {cols.slice(0, 1)}
                              <View style={styles.oneGroup}>
                                {cols.slice(1, cols.length)}
                              </View>
                          </View>
          if (hasMarkdown  ||  hasItems || noGradient) {
            groupView = <View style={{margin: 10 }}>
                          {groupBody}
                        </View>
          }
          else if (i === 0) {
            groupView = <View style={{margin: 10 }}>
                          <LinearGradient colors={colors} style={styles.linearGradient}>
                            {groupBody}
                          </LinearGradient>
                        </View>
          }
        }
/*
        let groupBody = <View style={{flex: 1}}>
                            {i === 0  &&  this.getDateView({resource, styles})}
                            {cols.slice(0, 1)}
                            <View style={{padding: 5, flex: 1}}>
                              {cols.slice(1, cols.length)}
                            </View>
                        </View>
        if (hasMarkdown  ||  hasItems) {
          groupView = <View style={{margin: 10 }}>
                      {groupBody}
                    </View>
        }

 */
      }
      else {
        let colSize = Math.round(size / 2)
        let groupBody = <View styles={{flex: 1}}>
                          {i === 0  &&  this.getDateView({resource, styles})}
                          {cols.slice(0, 1)}
                          <View style={{flexDirection: 'row', paddingBottom: 10}}>
                            <View style={{padding: 5, flex: 1, borderRightColor:'#ccc', borderRightWidth: 1}}>
                              {cols.slice(1, colSize + 1)}
                            </View>
                            <View style={{padding: 5, flex: 1, width: isSmall ? '50%' : '100%'}}>
                              {cols.slice(colSize + 1)}
                            </View>
                          </View>
                        </View>

        if (i === 0) {
          groupBody = <LinearGradient colors={colors} style={styles.linearGradient}>
                        {groupBody}
                      </LinearGradient>
          groupView = <View style={{marginVertical: 10 }}>
                        {groupBody}
                      </View>
        }
        else
          groupView = <View style={{marginVertical: 10, backgroundColor: i===0 ? 'transparent' : '#fafafa', borderColor: '#eeeeee', borderRadius: 15, borderWidth: 1, paddingBottom: 10 }}>
                        {groupBody}
                      </View>
      }
      retGroups.push(groupView)

      groupEnd = groupEnd - cols.length
    }
    return retGroups.reverse()
  }
  getDateView({resource, styles, noGradient}) {
    let dateView

    if (resource._time) {
      let date = utils.formatDate(new Date(resource._time))
      dateView = <View style={styles.band}>
                  <Text style={styles.dateLabel}>{translate('submissionDate')}</Text>
                  <Text style={styles.dateValue}>{date}</Text>
                </View>
    }
    return dateView
  }
  renderJsonProp(val, model, pMeta, viewCols) {
    if (!val  ||  utils.isEmpty(val))
      return false
    let { resource, bankStyle, checkProperties } = this.props
    if (pMeta.ref) {
      let v = _.cloneDeep(val)
      let rprops = utils.getModel(v[TYPE]  ||  pMeta.ref).properties
      let exclude = [TYPE, '_time']
      for (let p in v) {
        if (!rprops[p]  ||  exclude.includes(p))
          delete v[p]
      }
      if (utils.isEmpty(v))
        return false
      val = v
    }
    let jsonRows = []

    let isMethod = utils.isSubclassOf(model, METHOD)
    let isOnfido = isMethod  &&  resource.api  &&  resource.api.name === 'onfido'

    let params = {showTree: true, prop: pMeta, json: val, isView: true, jsonRows, isOnfido}
    // let params = {prop: pMeta, json: val, isView: true, jsonRows: jsonRows, isOnfido: isOnfido, scrollToBottom: this.scrollToBottom.bind(this)}
    let jVal
    if (model.id !== APPLICATION)
      jVal = this.showJson(params)
    else if (pMeta.name === 'scoreDetails') {
      jVal = <View style={{backgroundColor:'#f7f7f7'}}>
               <View style={{flex: 1}}>
                 <TouchableOpacity onPress={this.showScoreDetails.bind(this)}>
                   <Text style={{padding: 17, color: bankStyle.linkColor, fontWeight: '600', fontSize: 18}}>{translate(pMeta, model).toUpperCase()}</Text>
                 </TouchableOpacity>
               </View>
              </View>
    }
    else if (pMeta.name === 'creditScoreDetails') {
      jVal = <View style={{backgroundColor:'#f7f7f7'}}>
               <View style={{flex: 1}}>
                 <TouchableOpacity onPress={this.showCreditScoreDetails.bind(this)}>
                   <Text style={{padding: 17, color: bankStyle.linkColor, fontWeight: '600', fontSize: 18}}>{translate(pMeta, model).toUpperCase()}</Text>
                 </TouchableOpacity>
               </View>
              </View>
    }
    else
      jVal = this.showJson(params)

    if (!jVal)
      return false

    if (!Array.isArray(jVal))
      viewCols.push(jVal)

    if (jVal.length) {
      var isDirectionRow
      if (checkProperties)
        isDirectionRow = true
      viewCols.push(
        <View key={this.getNextKey()}>
           <View style={isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}}>
             {jVal}
           </View>
         </View>
         )
    }
    return true
  }
  renderRefProperty({val, pMeta, viewCols, vCols, styles, resource, hasGroups}) {
    let { showRefResource, currency, bankStyle, checkProperties, locale } = this.props
    let { ref } = pMeta
    if (!ref)
      ref = pMeta.items  &&  pMeta.items.ref
    if (ref === PHOTO  && pMeta.range !== 'document') {
      if (vCols.length === 1  &&  resource._time  &&  !isForm(utils.getModel(resource[TYPE])))
        viewCols.push(
          <View  key={this.getNextKey()} style={{padding: 10}}>
            <Text style={styles.title}>{translate('Date')}</Text>
            <Text style={[styles.title, styles.description]}>{dateformat(new Date(resource._time), 'mmm d, yyyy')}</Text>
          </View>
        )
      if (!checkProperties)
        return {}
      return {val: <Image source={{uri: val.url}} resizeMode='cover' style={styles.thumb} />}
    }
    if (val  &&  utils.isSubclassOf(ref, FILE)) {
      let idx = val.url.indexOf(',')
      let dn = val.url.substring(0, idx)
      return {val: <Text style={[styles.title, styles.linkTitle]}>{dn}</Text>}
    }
    if (ref === MONEY) {
      let CURRENCY_SYMBOL = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
      let c = utils.normalizeCurrencySymbol(val.currency)
      if (c  &&  locale)
        return {val: utils.formatCurrency(val, locale)}

      return {val: (c || CURRENCY_SYMBOL) + utils.formatNumber(pMeta, val.value, locale)}
    }
    if (ref === DURATION)
      return {val: utils.formatNumber(pMeta, val.value, locale) + ' ' + translate(val.durationType)}

    if (ref === IDENTITY) {
      let title = val.title
      let me = utils.getMe()
      if (!title)
        title = getRootHash(val) === me[ROOT_HASH] ? 'Me' : 'Not me'
      return {val: <Text style={[styles.title, styles.linkTitle]}>{title}</Text>, isRef: true}
    }
    if (pMeta.inlined  ||  utils.getModel(ref).inlined) {
      if (isStub(val)) {
        val[TYPE] = utils.getType(val.id)
        val = <TouchableOpacity style={{flexDirection: 'row'}} onPress={showRefResource.bind(this, val, pMeta)}>
                <Text style={[styles.title, styles.linkTitle]}>{val.title}</Text>
                <Icon name='ios-open-outline' size={15} color='#aaaaaa' style={styles.link}/>
              </TouchableOpacity>
        return { val, isRef: true }
      }
      if (pMeta.range === 'document') {
        let model = utils.getModel(resource[TYPE])
        let v
        if (val.name)
          v = <Text style={[styles.title, styles.linkTitle]}>{val.name}</Text>
        else
          v = <Image resizeMode='cover' style={{width: 43, height: 43, opacity: 0.8}} source={PDF_ICON} />

        val = <TouchableOpacity onPress={this.showPDF.bind(this, {photo: val})} style={{justifyContent: 'flex-end'}}>
                {v}
              </TouchableOpacity>
        return {val, isRef: false}
      }
      if (!val[TYPE])
        val[TYPE] = ref
      let pViewCols = this.getViewCols(val, utils.getModel(val[TYPE]), bankStyle)
      if (pViewCols.length) {
        pViewCols.forEach((v, i) => viewCols.push(v))
        return {}
      }
      val = <TouchableOpacity style={{flexDirection: 'row'}} onPress={showRefResource.bind(this, val, pMeta)}>
              <Text style={[styles.title, styles.linkTitle]}>{utils.getDisplayName({ resource: val })}</Text>
              <Icon name='ios-open-outline' size={15} color='#aaaaaa' style={styles.link}/>
            </TouchableOpacity>
      return { val, isRef: true }
    }
    // Could be enum like props
    if (isEnum(ref)) {
      if (typeof val === 'object')
        return {val: translateEnum(val)}
      else
        return {val}
    }
    if (showRefResource) {
      // ex. property that is referencing to the Organization for the contact
      var value = utils.getDisplayName({ resource: val })
      if (!value)
        value = translate(utils.getModel(utils.getType(val)))
      let type = utils.getType(val)
      let m = utils.getModel(type)
      let typeRow
      // if (pMeta.title.toLowerCase() !== m.title.toLowerCase())
      //   typeRow = <Text style={[styles.title, styles.smallLetters]}>{translate(m)}</Text>
      val = <View>
              <TouchableOpacity style={{flexDirection: 'row', width: hasGroups ? '45%' : '100%'}} onPress={showRefResource.bind(this, val, pMeta)}>
                <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
                <Icon name='ios-open-outline' size={15} color='#aaaaaa' style={styles.link}/>
              </TouchableOpacity>
              {typeRow}
            </View>

      return { val, isRef: true }
    }
    if (isStub(val)  &&  val.title)
      val = <Text style={[styles.title, styles.linkTitle]}>{val.title}</Text>

    return { val }
  }
  // showPDF({photo}) {
  //   let route = {
  //     backButtonTitle: 'Back',
  //     componentName: 'ArticleView',
  //     passProps: {
  //       href: photo.url
  //     },
  //     // sceneConfig: Navigator.SceneConfigs.FadeAndroid,
  //   }
  //   this.props.navigator.push(route)
  // }
  showScoreDetails() {
    let m = utils.getModel(APPLICATION)
    let { navigator, bankStyle, resource } = this.props
    navigator.push({
      componentName: 'ScoreDetails',
      backButtonTitle: 'Back',
      title: `${resource.applicantName}  →  ${translate(m.properties.score, m)} ${resource.score}`,
      passProps: {
        bankStyle,
        resource
      }
    })
  }
  showCreditScoreDetails() {
    let m = utils.getModel(APPLICATION)
    let { navigator, bankStyle, resource, locale, currency } = this.props
    let title = ''
    if (resource.applicantName)
       title = `${resource.applicantName}  →  `
    title += translate(m.properties.creditScoreDetails, m)
    navigator.push({
      componentName: 'CreditScoreDetails',
      backButtonTitle: 'Back',
      title,
      passProps: {
        bankStyle,
        resource,
        locale,
        currency
      }
    })
  }
  addForPartial(val, styles) {
    let labels = []
    let type = val.find((l) => l.key === TYPE  &&  l.value).value
    let lprops = utils.getModel(type).properties
    val.forEach((v) => {
      let key, value
      if (v.key.charAt(0) === '_') {
        if (v.key === TYPE) {
          key = 'type'
          value = utils.getModel(v.value).title
        }
        else
          return
      }
      else {
        key = lprops[v.key]  &&  lprops[v.key].title
        if (v.value  &&  v.key  && (v.key === 'product'  ||  v.key === 'form'))
          value = utils.getModel(v.value).title
        else
          value = v.value || '[not shared]'
        if (typeof value === 'object')
          value = value.title
      }

      if (!key)
        return
      labels.push(<View style={styles.row} key={this.getNextKey()}>
                     <Text style={[styles.title]}>{key}</Text>
                     <Text style={[styles.title, {color: '#555555'}]}>{value}</Text>
                  </View>)
    })
    return <View style={{paddingLeft: 10}} key={this.getNextKey()}>
             <Text  style={[styles.title, {paddingVertical: 3}]}>{'Properties Shared'}</Text>
             {labels}
           </View>
  }
  getCheckForCorrection(pMeta) {
    let { checkProperties, errorProps, bankStyle, navigator, resource } = this.props
    if (!checkProperties  ||  pMeta.immutable)
      return

    let p = pMeta.name
    let icon = errorProps && errorProps[p] ? 'ios-close-circle' : 'ios-radio-button-off'
    return (
      <View>
        <TouchableOpacity underlayColor='transparent' onPress={() => {
          if (errorProps  &&  errorProps[p]) {
            delete errorProps[p]
            this.setState({uncheck: p})
          }
          else {
            this.props.checkProperties(pMeta, translate(this.genErrorMessage(pMeta)))
          }
        }}>
          <Icon key={p} name={icon} size={30} color={this.props.errorProps && errorProps[p] ? 'deeppink' : bankStyle.linkColor} style={{marginTop: 10, marginRight: 10}}/>
        </TouchableOpacity>
     </View>
    )
  }
  onPress(url, event) {
    Linking.openURL(url)
  }
  genErrorMessage(pMeta) {
    let resource = this.props.resource
    if (!resource[pMeta.name])
      return 'enterValidValue'
    if (pMeta.scanner)
      return 'rescan'
    else
      return 'invalidValue'
  }
}
reactMixin(ShowPropertiesView.prototype, RowMixin)
reactMixin(ShowPropertiesView.prototype, ResourceMixin)

var createStyles = utils.styleFactory(ShowPropertiesView, function ({ dimensions, bankStyle }) {
  return StyleSheet.create({
    textContainer: {
      flex: 1,
    },
    row: {
      justifyContent: 'space-between',
      flexDirection: 'row'
    },
    title: {
      fontSize: 16,
      // fontFamily: 'Avenir Next',
      marginTop: 3,
      marginBottom: 0,
      marginHorizontal: 7,
      color: '#9b9b9b'
    },
    link: {
      color: '#555555',
      alignSelf: 'center',
      marginTop: 2
    },
    linkTitle: {
      fontSize: 18,
      color: bankStyle.linkColor
    },
    smallLetters: {
      fontSize: 12,
      color: '#aaaaaa',
    },
    description: {
      fontSize: 18,
      marginVertical: 3,
      marginHorizontal: 7,
      color: '#555555',
    },
    icon: {
      width: 40,
      height: 40
    },
    groupStyleText: {
      fontSize: 26,
      fontWeight: '500',
      color: bankStyle.linkColor,
      fontFamily: bankStyle.headerFont
    },
    bigTitle: {
      fontSize: 20,
      // fontFamily: 'Avenir Next',
      marginTop: 3,
      marginBottom: 0,
      marginHorizontal: 7,
      color: '#7AAAC3'
    },
    thumb: {
      width: 40,
      height: 40
    },
    accent: {
      width: 12,
      borderLeftColor: bankStyle.accentColor || 'orange',
      borderLeftWidth: 5,
    },
    band: {
      paddingTop: 3,
      paddingBottom: 5,
      // marginHorizontal: -15,
      // flex: 1,
      backgroundColor: bankStyle.linkColor,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    date: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      alignSelf: 'flex-end',
      color: '#2E3B4E'
      // color: '#b4c3cb'
    },
    dateLabel: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      color: '#EEE'
      // color: '#b4c3cb'
    },
    dateValue: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      color: '#FFF'
      // color: '#b4c3cb'
    },
    linearGradient: {
      flex: 1,
      // paddingLeft: 15,
      // paddingRight: 15,
      borderRadius: 15
    },
    oneGroup: {
      padding: 5,
      flex: 1
    },
    itemBackground: {
      paddingVertical: 3,
      marginHorizontal: -10,
      // alignItems: 'center',
      backgroundColor: 'aliceblue'
    },
    itemTitle: {
      fontSize: 16,
      marginBottom: 0,
      paddingVertical: 3,
      marginHorizontal: 10,
      fontWeight: '600',
      color: '#757575',
    },
  })
})

module.exports = ShowPropertiesView

