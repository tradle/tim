import React, { Component } from 'react'
import {
  // StyleSheet,
  View,
  // Text,
  TouchableOpacity,
  Linking,
} from 'react-native'

import PropTypes from 'prop-types'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'
import reactMixin from 'react-mixin'
import dateformat from 'dateformat'
import moment from 'moment'
import Prompt from 'react-native-prompt'

import constants from '@tradle/constants'
import validateModel from '@tradle/validate-model'

import utils, { translate, translateEnum, isEnum, isStub } from '../utils/utils'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import { Text } from './Text'
import defaultBankStyle from '../styles/defaultBankStyle.json'

const NOT_SPECIFIED = '[not specified]'
const DEFAULT_CURRENCY_SYMBOL = '£'
const TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const OBJECT = 'tradle.Object'

const PHOTO = 'tradle.Photo'
const METHOD = 'tradle.Method'
const PARTIAL = 'tradle.Partial'
const FILE = 'tradle.File'
const CHECK = 'tradle.Check'

const {
  TYPE,
  ROOT_HASH,
  // PREV_HASH
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
    excludedProperties: PropTypes.array,
    pieChart: PropTypes.object
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
    // return (
    //   <ScrollView ref={(scroll) => {this.scroll = scroll}} style={{paddingBottom: 100}} key={this.getNextKey}>
    //     {viewCols}
    //   </ScrollView>
    // );
  }
  // scrollToBottom() {
  //   this.scroll.scrollToEnd()
  // }
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
    let { checkProperties, excludedProperties, bankStyle, currency, showRefResource, pieChart } = this.props
    var modelName = utils.getType(resource)
    if (!model)
      model = this.props.model  ||  utils.getModel(modelName)
    if (model.id !== modelName  &&  !utils.isSubclassOf(modelName, model.id))
      model = utils.getModel(modelName)
    var vCols

    let styles = createStyles({bankStyle: bankStyle || defaultBankStyle})
    var props = model.properties;
    vCols = model.viewCols
    if (vCols)
      vCols = utils.ungroup({model, viewCols: vCols})
    if (!resource[ROOT_HASH]) {
      if (!vCols)
        vCols = []
      for (let p in resource) {
        if (p.charAt(0) !== '_'  && props[p]  &&  vCols.indexOf(p) === -1)
          vCols.push(p)
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

    if (!vCols)
      vCols = utils.getViewCols(model)
    var isMessage = utils.isMessage(this.props.resource)
    if (!isMessage) {
      var len = vCols.length;
      for (var i=0; i<len; i++) {
        if (props[vCols[i]].displayName) {
          vCols.splice(i, 1);
          len--;
        }
      }
    }
    let isPartial = model.id === PARTIAL
    let isMethod = utils.isSubclassOf(model, METHOD)
    let me = utils.getMe()
    // if (me.isEmployee  &&  !checkProperties  && resource._sourceOfData) {
    //   vCols.push('_sourceOfData')
    //   // vCols.push('_dataLineage')
    // }

    const ObjectModel = utils.getModel(OBJECT)

    var viewCols = []
    vCols.forEach((p) => {
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;
      var pMeta = props[p];
      if (pMeta  &&  utils.isHidden(p, resource))
        return
      if (!pMeta)
        pMeta = ObjectModel.properties[p]

      // if (pMeta.type === 'array'  &&  pMeta.items.ref  &&  !pMeta.inlined)
      //   return
      var val = resource[p];
      if (pMeta.range === 'json') {
        if (!val  ||  utils.isEmpty(val))
          return
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

        let isOnfido = isMethod  &&  resource.api  &&  resource.api.name === 'onfido'

        let params = {prop: pMeta, json: val, pieChart, showTree: true, isView: true, jsonRows, isOnfido}
        // let params = {prop: pMeta, json: val, isView: true, jsonRows: jsonRows, isOnfido: isOnfido, scrollToBottom: this.scrollToBottom.bind(this)}
        let jVal = this.showJson(params)
        if (!jVal)
          return

        if (!Array.isArray(jVal))
          viewCols.push(jVal)
        else if (jVal.length)
          viewCols.push(
            <View key={this.getNextKey()}>
               <View style={isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}}>
                 {jVal}
               </View>
             </View>
             )
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
          val = <Text style={styles.title}>{val}</Text>
        }
        else if (checkProperties) {
          if (p.indexOf('_group') === p.length - 6) {
            viewCols.push(
              <View style={{padding: 15}} key={this.getNextKey()}>
                <View style={styles.groupStyle}>
                  <Text style={styles.groupStyleText}>{translate(pMeta, model)}</Text>
                </View>
              </View>
            )
            return
          }
          else if (pMeta.items) {
            if (pMeta.items.ref  &&  !utils.isEnum(pMeta.items.ref))
              return
          }
          val = <Text style={styles.title}>{NOT_SPECIFIED}</Text>
        }
        else
          return;
      }
      else if (pMeta.type === 'date') {
        // let valueMoment = moment.utc(val)
        // let date = new Date(valueMoment.year(), valueMoment.month(), valueMoment.date(), valueMoment.hours(), valueMoment.minutes())
        // val = utils.formatDate(date)
        val = utils.formatDate(val)
      }
      else if (pMeta.ref) {
        if (pMeta.ref === PHOTO) {
          if (vCols.length === 1  &&  resource._time)
            viewCols.push(
              <View  key={this.getNextKey()} style={{padding: 10}}>
                <Text style={styles.title}>{translate('Date')}</Text>
                <Text style={[styles.title, styles.description]}>{dateformat(new Date(resource._time), 'mmm d, yyyy')}</Text>
              </View>
            )
          if (!checkProperties)
            return
          val = <Image source={{uri: val.url}} resizeMode='cover' style={styles.thumb} />
        }
        else if (val && utils.isSubclassOf(pMeta.ref, FILE)) {
          let idx = val.url.indexOf(',')
          let dn = val.url.substring(0, idx)
          val = <Text style={[styles.title, styles.linkTitle]}>{dn}</Text>
        }
        else if (pMeta.ref == MONEY) {
          let CURRENCY_SYMBOL = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
          let c = utils.normalizeCurrencySymbol(val.currency)
          val = (c || CURRENCY_SYMBOL) + val.value
        }
        else if (pMeta.ref === IDENTITY) {
          let title = val.title
          if (!title)
            title = val.id.split('_')[0] === me[ROOT_HASH] ? 'Me' : 'Not me'
          val = <Text style={[styles.title, styles.linkTitle]}>{title}</Text>
        }
        else if (pMeta.inlined  ||  utils.getModel(pMeta.ref).inlined) {
          if (isStub(val)) {
            val[TYPE] = utils.getType(val.id)
            val = <TouchableOpacity style={{flexDirection: 'row'}} onPress={showRefResource.bind(this, val, pMeta)}>
                    <Text style={[styles.title, styles.linkTitle]}>{val.title}</Text>
                    <Icon name='ios-open-outline' size={15} color='#aaaaaa' style={styles.link}/>
                  </TouchableOpacity>
            isRef = true
          }
          else {
            if (!val[TYPE])
              val[TYPE] = pMeta.ref
            let pViewCols = this.getViewCols(val, utils.getModel(val[TYPE]), bankStyle)
            if (pViewCols.length) {
              pViewCols.forEach((v) => viewCols.push(v))
              return
            }
            val = <TouchableOpacity style={{flexDirection: 'row'}} onPress={showRefResource.bind(this, val, pMeta)}>
                    <Text style={[styles.title, styles.linkTitle]}>{utils.getDisplayName(val)}</Text>
                    <Icon name='ios-open-outline' size={15} color='#aaaaaa' style={styles.link}/>
                  </TouchableOpacity>
            isRef = true
          }
        }
        // else if (pMeta.mainPhoto)
        //   return
        // Could be enum like props
        else if (isEnum(pMeta.ref)) {
          if (typeof val === 'object')
            val = translateEnum(val)
        }
        else if (showRefResource) {
          // ex. property that is referencing to the Organization for the contact
          var value = utils.getDisplayName(val)
          if (!value)
            value = translate(utils.getModel(utils.getType(val)))
          val = <TouchableOpacity style={{flexDirection: 'row'}} onPress={showRefResource.bind(this, val, pMeta)}>
                  <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
                  <Icon name='ios-open-outline' size={15} color='#aaaaaa' style={styles.link}/>
               </TouchableOpacity>

          isRef = true;
        }
      }

      let checkForCorrection = !model.notEditable  && !pMeta.immutable &&  !pMeta.readOnly  &&  this.getCheckForCorrection(pMeta)
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

      var isDirectionRow;
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
           <View style={{width: utils.getContentWidth(ShowPropertiesView), flexDirection: isDirectionRow ? 'row' : 'column'}}>
             <View style={[style, {flexDirection: 'column'}]}>
               {title}
               {val}
             </View>
             {checkForCorrection}
           </View>
         </View>
      )
    })
    // if (isMessage  &&  utils.isSubclassOf(model, FORM)  &&  me.isEmployee) {
    //   if (resource[PREV_HASH]  &&  resource[PREV_HASH] !== resource[ROOT_HASH]) {
    //     let title = utils.getDisplayName(resource)
    //     viewCols.push(
    //       <TouchableOpacity onPress={showRefResource.bind(this, {id: `${resource[TYPE]}_${resource[ROOT_HASH]}_${resource[PREV_HASH]}`, title }, ObjectModel.properties[PREV_HASH])} key={this.getNextKey()}>
    //         <Text style={styles.title}>{translate('previousVersion')}</Text>
    //         <Text style={[styles.title, styles.linkTitle]}>{title}</Text>
    //       </TouchableOpacity>
    //     )
    //   }
    // }
    if (resource.txId) { // || utils.isSealableModel(model)) {
      viewCols.push(
          <View key={this.getNextKey()} ref='propertySheet'>
            {this.addDataSecurity(resource)}
          </View>
        )
    }
    return viewCols;
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
                     <Text style={[styles.title, {color: '#2e3b4e'}]}>{value}</Text>
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
reactMixin(ShowPropertiesView.prototype, RowMixin);
reactMixin(ShowPropertiesView.prototype, ResourceMixin);

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
    description: {
      fontSize: 18,
      marginVertical: 3,
      marginHorizontal: 7,
      color: '#2E3B4E',
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

module.exports = ShowPropertiesView;

  // getCheckForCorrection(pMeta) {
  //   let { checkProperties, errorProps, bankStyle } = this.props
  //   if (!checkProperties)
  //     return
  //   let p = pMeta.name
  //   let isPromptVisible = this.state.promptVisible !== null

  //   return <View>
  //             <TouchableOpacity underlayColor='transparent' onPress={() => {
  //               if (errorProps  &&  errorProps[p]) {
  //                 delete errorProps[p]
  //                 this.setState({promptVisible: null, uncheck: p})
  //               }
  //               else
  //                 this.setState({promptVisible: pMeta})
  //             }}>
  //               <Icon key={p} name={errorProps && errorProps[p] ? 'ios-close-circle' : 'ios-radio-button-off'} size={30} color={this.props.errorProps && errorProps[p] ? 'deeppink' : bankStyle.linkColor} style={{marginTop: 10, marginRight: 10}}/>
  //             </TouchableOpacity>
  //             <Prompt
  //               title={translate('fieldErrorMessagePrompt')}
  //               placeholder={translate('thisValueIsInvalidPlaceholder')}
  //               visible={isPromptVisible}
  //               onCancel={() => this.setState({ promptVisible: null })}
  //               onSubmit={(value) => {
  //                 this.setState({ promptVisible: null})
  //                 this.props.checkProperties(this.state.promptVisible, value)
  //               }}/>
  //          </View>
  // }
