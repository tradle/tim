import React, { Component } from 'react'
import {
  // StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking
} from 'react-native'

import _ from 'lodash'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/Ionicons'
import reactMixin from 'react-mixin'
import dateformat from 'dateformat'
import moment from 'moment'
import Prompt from 'react-native-prompt'

import constants from '@tradle/constants'
import validateModel from '@tradle/validate-model'

import utils, { translate, translateEnum, isEnum, isStub, getRootHash } from '../utils/utils'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
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

const {
  TYPE,
  ROOT_HASH,
} = constants
const {
  IDENTITY,
  MONEY,
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
      <View style={{paddingBottom: 50}} key={this.getNextKey()}>
        {viewCols}
      </View>
    );
  }
  shouldComponentUpdate(nextProps, nextState) {
    // Prompt for employee to write a correction message
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
    let { checkProperties, excludedProperties, bankStyle, currency, locale, isItem } = this.props
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

    var viewCols = []
    vCols.forEach(pMeta => {
      let p = pMeta.name
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;

      // var pMeta = props[p];
      if (pMeta  &&  utils.isHidden(p, resource))
        return
      if (!pMeta)
        pMeta = ObjectModel.properties[p]
      if (!me.isEmployee  &&  pMeta.internalUse)
        return
      var val = resource[p];
      if (pMeta.range === 'json') {
        this.renderJsonProp(val, model, pMeta, viewCols)
        return
      }
      var isRef;
      var isItems
      // var isEmail
      let isUndefined = !val  &&  (typeof val === 'undefined')
      if (isUndefined) {
        if (pMeta.displayAs) {
          val = utils.templateIt(pMeta, resource);
          if (!val)
            return
          val = <Text style={styles.link}>{val}</Text>
        }
        else if (p.endsWith('_group')) {
          viewCols.push(
            <View style={{padding: 15}} key={this.getNextKey()}>
              <View style={styles.groupStyle}>
                <Text style={styles.groupStyleText}>{translate(pMeta, model)}</Text>
              </View>
            </View>
          )
          return
        }
        else if (checkProperties) {
          if (pMeta.items) {
            if (pMeta.items.ref  &&  !utils.isEnum(pMeta.items.ref))
              return
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
        ({val, isRef} = this.renderRefProperty({val, pMeta, viewCols, vCols, styles, resource}))
        if (!val)
          return
      }

      let checkForCorrection = !notEditable  && !pMeta.immutable &&  !pMeta.readOnly  &&  this.getCheckForCorrection(pMeta)
      if (!isRef) {
        if (isPartial  &&  p === 'leaves') {
          viewCols.push(this.addForPartial(val, styles))
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
          return
        }
        isItems = Array.isArray(val)
        let iref = isItems  &&  pMeta.items.ref
        if (iref) {
          if (iref === PHOTO)
            return
          if (isEnum(iref)) {
            let values = val.map((v) => translateEnum(v)).join(', ')
            viewCols.push(
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}} key={this.getNextKey()}>
                <View style={{paddingLeft: 10}}>
                  <Text style={styles.title}>{translate(pMeta, model)}</Text>
                  <Text style={styles.description}>{values}</Text>
                </View>
                {checkForCorrection}
              </View>
              )
            return
          }
          if (pMeta.items.backlink)
            return
        }
        val = this.renderSimpleProp(val, pMeta, modelName, ShowPropertiesView)
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

      viewCols.push(
        <View key={this.getNextKey()}>
           <View style={{flexDirection: isDirectionRow && 'row' || 'column'}}>
             <View style={[style, {flexDirection: 'column'}]}>
               {title}
               {val}
             </View>
             {checkForCorrection}
           </View>
         </View>
      )
    })
    if (resource.txId) { // || utils.isSealableModel(model)) {
      viewCols.push(
          <View key={this.getNextKey()} ref='propertySheet'>
            {this.addDataSecurity(resource)}
          </View>
        )
    }
    return viewCols
  }
  renderJsonProp(val, model, pMeta, viewCols) {
    if (!val  ||  utils.isEmpty(val))
      return
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
        return
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
      // jVal = <View />
    }
    else
      jVal = this.showJson(params)

    if (!jVal)
      return

    if (!Array.isArray(jVal)) {
      viewCols.push(jVal)
      return
    }
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
  }
  renderRefProperty({val, pMeta, viewCols, vCols, styles, resource}) {
    // debugger
    let { showRefResource, currency, bankStyle, checkProperties, locale } = this.props
    let { ref } = pMeta
    if (!ref)
      ref = pMeta.items  &&  pMeta.items.ref
    if (ref === PHOTO) {
      if (vCols.length === 1  &&  resource._time)
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
      if (pMeta.title.toLowerCase() !== m.title.toLowerCase())
        typeRow = <Text style={[styles.title, styles.smallLetters]}>{translate(m)}</Text>

      val = <View>
             <TouchableOpacity style={{flexDirection: 'row'}} onPress={showRefResource.bind(this, val, pMeta)}>
               <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
               <Icon name='ios-open-outline' size={15} color='#aaaaaa' style={styles.link}/>
             </TouchableOpacity>
             {typeRow}
           </View>

      return { val, isRef: true }
    }
    if (isStub(val)  &&  val.title)
      val = <Text style={[styles.title, styles.linkTitle]}>{val.title}</Text>
    return {val}
  }
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
    navigator.push({
      componentName: 'CreditScoreDetails',
      backButtonTitle: 'Back',
      title: `${resource.applicantName}  →  ${translate(m.properties.creditScoreDetails, m)}`,
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
      alignSelf: 'center'
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
    groupStyle: {
      borderBottomColor: bankStyle.linkColor,
      borderBottomWidth: 1,
      paddingBottom: 5
    },
    groupStyleText: {
      fontSize: 22,
      color: bankStyle.linkColor
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
    }
  })
})

module.exports = ShowPropertiesView

