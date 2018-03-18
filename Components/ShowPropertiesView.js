console.log('requiring ShowPropertiesView.js')
'use strict';

// import ArticleView from './ArticleView'
import utils from '../utils/utils'
var translate = utils.translate
import constants from '@tradle/constants'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import reactMixin from 'react-mixin'
import dateformat from 'dateformat'
import Accordion from './Accordion'
import Icon from 'react-native-vector-icons/Ionicons'
var NOT_SPECIFIED = '[not specified]'
var DEFAULT_CURRENCY_SYMBOL = '£'
var TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const ENUM = 'tradle.Enum'
const PHOTO = 'tradle.Photo'
const METHOD = 'tradle.Method'
const PARTIAL = 'tradle.Partial'

const {
  TYPE,
  ROOT_HASH
} = constants
const {
  IDENTITY,
  MONEY
} = constants.TYPES

const BLOCKCHAIN_EXPLORERS = [
  'https://rinkeby.etherscan.io/tx/0x$TXID',
  // 'https://etherchain.org/tx/0x$TXID' // doesn't support rinkeby testnet
]

import ActionSheet from 'react-native-actionsheet'
import Prompt from 'react-native-prompt'
import { makeResponsive } from 'react-native-orient'
// import Communications from 'react-native-communications'
import StyleSheet from '../StyleSheet'
import {
  // StyleSheet,
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
class ShowPropertiesView extends Component {
  props: {
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
      promptVisible: null
    }
  }

  render() {
    return (
      <View key={this.getNextKey()}>
        {this.getViewCols()}
      </View>
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Prompt for employee to write a correction message
    if (utils.resized(this.props, nextProps))
      return true
    if (this.state.promptVisible !== nextState.promptVisible)
      return true
    if (!this.props.errorProps  ||  !nextProps.errorProps)
      return true
    return (this.props.errorProps != nextProps.errorProps) ? true : false
  }
  getViewCols(resource, model) {
    if (!resource)
      resource = this.props.resource
    let { checkProperties, excludedProperties, bankStyle, currency, showRefResource, onPageLayout } = this.props
    var modelName = resource[TYPE];
    if (!model)
      model = this.props.model  ||  utils.getModel(modelName);
    var vCols

    var props = model.properties;
    if (checkProperties) {
      vCols = utils.getEditCols(model)
      if (vCols)
        vCols = Object.keys(vCols)
      // let exclude = ['from', 'to']
      // if (vCols)
      //   vCols = utils.clone(vCols)
      // vCols = []
      // for (var p in resource) {
      //   if (p.charAt(0) === '_'  ||  !props[p])
      //     continue
      //   if (exclude.indexOf(p) === -1  && vCols.indexOf(p) === -1)
      //     vCols.push(p)
      // }

      // vCols = utils.ungroup(model, vCols)
      // let v = []
      // vCols.forEach((p) => {
      //   if (p.charAt(0) === '_'  ||  props[p].hidden) //  ||  props[p].readOnly) //  ||  p.indexOf('_group') === p.length - 6)
      //     return
      //   v.push(p)
      //   // let idx = p.indexOf('_group')
      //   // if (idx !== -1  &&  idx === p.length - 6)
      //   //   props[p].list.forEach((p) => v.push(p))
      // })
      // vCols = v
    }
    else {
      vCols = model.viewCols
      if (vCols)
        vCols = utils.ungroup(model, vCols)
    }
    // else {
    //   let v = []
    //   vCols.forEach((p) => {
    //     if (p.charAt(0) === '_'  ||  props[p].hidden) //  ||  props[p].readOnly) //  ||  p.indexOf('_group') === p.length - 6)
    //       return
    //     v.push(p)
    //     // let idx = p.indexOf('_group')
    //     // if (idx !== -1  &&  idx === p.length - 6)
    //     //   props[p].list.forEach((p) => v.push(p))
    //   })
    //   vCols = v

    // }

    if (excludedProperties) {
      var mapped = [];
      excludedProperties.forEach((p) =>  {
        if (props[p]) {
          mapped.push(p);
        }
      })
      excludedProperties = mapped;
    }

    if (!vCols) {
      vCols = utils.getViewCols(model)
      // vCols = [];
      // for (var p in props) {
      //   if (p != TYPE)
      //     vCols.push(p)
      // }
      // // HACK
      // if (utils.isMessage(resource)) {
      //   if (!excludedProperties)
      //     excludedProperties = []
      //   excludedProperties.push('from')
      //   excludedProperties.push('to')
      // }
    }
    var isMessage = utils.isMessage(resource)
    if (!isMessage) {
      var len = vCols.length;
      for (var i=0; i<len; i++) {
        if (props[vCols[i]].displayName) {
          vCols.splice(i, 1);
          len--;
        }
      }
    }
    var first = true;
    let self = this
    let isPartial = model.id === PARTIAL
    let isMethod = model.subClassOf === METHOD

    var viewCols = vCols.map((p) => {
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;
      if (utils.isHidden(p, resource))
        return
      var pMeta = props[p];
      if (pMeta.type === 'array'  &&  pMeta.items.ref  &&  !pMeta.inlined)
        return
      var val = resource[p];
      if (pMeta.range === 'json') {
        if (!val)
          return
        let jsonRows = []

        let isOnfido = isMethod  &&  resource.api  &&  resource.api.name === 'onfido'

        let params = {prop: pMeta, json: val, isView: true, jsonRows: jsonRows, isOnfido: isOnfido}
        return this.showJson(params)
      }
      var isRef;
      var isItems
      var isDirectionRow;
      // var isEmail
      let isUndefined = !val  &&  (typeof val === 'undefined')
      if (isUndefined) {
        if (pMeta.displayAs)
          val = utils.templateIt(pMeta, resource);
        else if (checkProperties) {
          if (p.indexOf('_group') === p.length - 6) {
            return (<View style={{padding: 15}} key={this.getNextKey()}>
                      <View style={{borderBottomColor: bankStyle.linkColor, borderBottomWidth: 1, paddingBottom: 5}}>
                        <Text style={{fontSize: 22, color: bankStyle.linkColor}}>{translate(pMeta)}</Text>
                      </View>
                    </View>
             );
          }
          else
            val = NOT_SPECIFIED
        }
        else
          return;
      }
      else if (pMeta.type === 'date')
        val = utils.getDateValue(val)
      else if (pMeta.ref) {
        if (pMeta.ref === PHOTO) {
          if (vCols.length === 1  &&  resource.time)
            return <View  key={this.getNextKey()} style={{padding: 10}}>
                     <Text style={styles.title}>{translate('Date')}</Text>
                     <Text style={[styles.title, styles.description]}>{dateformat(new Date(resource.time), 'mmm d, yyyy')}</Text>
                   </View>
          return
        }
        if (pMeta.ref == MONEY) {
          let CURRENCY_SYMBOL = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
          let c = utils.normalizeCurrencySymbol(val.currency)
          val = (c || CURRENCY_SYMBOL) + val.value
        }
        else if (pMeta.ref === IDENTITY) {
          let title = val.title
          if (!title)
            title = val.id.split('_')[0] === utils.getMe()[ROOT_HASH] ? 'Me' : 'Not me'
          val = <Text style={[styles.title, styles.linkTitle]}>{title}</Text>
        }
        else if (pMeta.inlined  ||  utils.getModel(pMeta.ref).inlined) {
          if (!val[TYPE])
            val[TYPE] = pMeta.ref
          return this.getViewCols(val, utils.getModel(val[TYPE]))
        }
        else if (pMeta.mainPhoto)
          return
        // Could be enum like props
        else if (utils.getModel(pMeta.ref).subClassOf === ENUM)
          val = val.title
        else if (showRefResource) {
          // ex. property that is referencing to the Organization for the contact
          var value = val[TYPE] ? utils.getDisplayName(val) : val.title;
          if (!value)
            value = utils.makeModelTitle(utils.getType(val))
          val = <TouchableOpacity onPress={showRefResource.bind(this, val, pMeta)}>
                 <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
               </TouchableOpacity>

          isRef = true;
        }
      }

      if (isUndefined) {
        if (!checkProperties)
          return
        val = <Text style={styles.title}>{NOT_SPECIFIED}</Text>
      }
      let checkForCorrection = this.getCheckForCorrection(pMeta)
      if (!isRef) {
        if (isPartial  &&  p === 'leaves') {
          let labels = []
          let type = val.find((l) => l.key === TYPE  &&  l.value).value
          let lprops = utils.getModel(type).properties
          val.forEach((v) => {
            let key
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
        isItems = Array.isArray(val)
        if (isItems  &&  pMeta.items.ref) {
          if  (pMeta.items.ref === PHOTO)
            return
          if (utils.getModel(pMeta.items.ref).subClassOf === ENUM) {
            let values = val.map((v) => utils.getDisplayName(v)).join(', ')
            return <View style={{flexDirection: 'row', justifyContent: 'space-between'}} key={this.getNextKey()}>
                     <View style={{paddingLeft: 10}}>
                       <Text style={[styles.title]}>{pMeta.title}</Text>
                       <Text style={[styles.description]}>{values}</Text>
                     </View>
                     {checkForCorrection}
                  </View>

          }
        }
        val = this.renderSimpleProp(val, pMeta, modelName, ShowPropertiesView)
      }
      var title
      if (!pMeta.skipLabel  &&  !isItems)
        title = <Text style={modelName === TERMS_AND_CONDITIONS ? styles.bigTitle : styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>

      first = false;
      let isPromptVisible = this.state.promptVisible !== null
      if (isPromptVisible)
        console.log(this.state.promptVisible)
      if (checkProperties)
        isDirectionRow = true
               // <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

      let style = [styles.textContainer, {padding: 10}]
      if (isDirectionRow) {
        style.push({flexDirection: 'row'})
        if (checkForCorrection)
          style.push({justifyContent: 'space-between', flex: 10})
      }
      else
        style.push({flexDirection: 'column'})

      return (<View key={this.getNextKey()}>
               <View style={{width: utils.getContentWidth(ShowPropertiesView), flexDirection: isDirectionRow ? 'row' : 'column'}}>
                 <View style={[style, {flexDirection: 'column'}]}>
                   {title}
                   {val}
                 </View>
                 {checkForCorrection}
               </View>
             </View>
             );
    })
    let { txId, blockchain, networkName } = resource
    if (txId) { // || utils.isSealableModel(model)) {
      let content
      let header = (<View style={{padding: 10}} key={this.getNextKey()}>
                      <View style={[styles.textContainer, styles.row]}>
                        <Text style={styles.bigTitle}>{translate('dataSecurity')}</Text>
                        <Icon color={bankStyle.linkColor} size={20} name={'ios-arrow-down'} style={{marginRight: 10, marginTop: 7}}/>
                      </View>
                      <View style={{height: 1, marginTop: 5, marginBottom: 10, marginHorizontal: -10, alignSelf: 'stretch', backgroundColor: bankStyle.linkColor}} />
                    </View>)
      if (blockchain === 'corda') {
        let description = 'You\'ll be able to verify this transaction when you launch your Corda node.'
        content = <View style={{paddingHorizontal: 10}}>
                   <View style={{flexDirection: 'row', paddingVertical: 3}}>
                     <Text style={styles.dsTitle}>Blockchain: </Text>
                     <Text style={styles.dsValue}>{blockchain}</Text>
                   </View>
                   <View style={{flexDirection: 'row'}}>
                     <Text style={styles.dsTitle}>Network: </Text>
                     <Text style={styles.dsValue}>{networkName}</Text>
                   </View>
                   <View>
                     <Text style={styles.title}>TxID: </Text>
                     <Text style={styles.dsValue}>{txId}</Text>
                   </View>
                   <Text style={[styles.content, {marginTop: 20}]}>{description}</Text>
                  </View>
      }
      else {
        let description = 'This app uses blockchain technology to ensure you can always prove the contents of your data and whom you shared it with.'
        let txs = (
          <View>
            {
              BLOCKCHAIN_EXPLORERS.map((url, i) => {
                url = url.replace('$TXID', txId)
                return this.getBlockchainExplorerRow(url, i)
              })
            }
          </View>
        )

        content = <View style={{paddingHorizontal: 10}}>
                     <TouchableOpacity onPress={this.onPress.bind(this, 'http://thefinanser.com/2016/03/the-best-blockchain-white-papers-march-2016-part-2.html/')}>
                       <Text style={styles.content}>{description}
                         <Text style={{color: bankStyle.linkColor, paddingHorizontal: 7}}> Learn more</Text>
                       </Text>
                     </TouchableOpacity>
                     {txs}
                    </View>
      }
      let self = this
      let row = <Accordion
                  sections={['txId']}
                  onPress={() => {
                    self.refs.propertySheet.measure((x,y,w,h,pX,pY) => {
                      if (h  &&  y > pY)
                        onPageLayout(pY, h)
                    })
                  }}
                  header={header}
                  content={content}
                  underlayColor='transparent'
                  easing='easeIn' />
      viewCols.push(
          <View key={this.getNextKey()} ref='propertySheet'>
            {row}
          </View>
        )
    }
    return viewCols;
  }
  getCheckForCorrection(pMeta) {
    let { checkProperties, errorProps, bankStyle, width } = this.props
    if (!checkProperties)
      return
    let p = pMeta.name
    let isPromptVisible = this.state.promptVisible !== null

    return <View>
              <TouchableOpacity underlayColor='transparent' onPress={() => {
                this.setState({promptVisible: pMeta})
              }}>
                <Icon key={p} name={errorProps && errorProps[p] ? 'ios-close-circle' : 'ios-radio-button-off'} size={30} color={this.props.errorProps && errorProps[p] ? 'deeppink' : bankStyle.linkColor} style={{marginTop: 10, marginRight: 10}}/>
              </TouchableOpacity>
              <Prompt
                title={translate('fieldErrorMessagePrompt')}
                placeholder={translate('thisValueIsInvalidPlaceholder')}
                visible={isPromptVisible}
                onCancel={() => this.setState({ promptVisible: null })}
                onSubmit={(value) => {
                  this.setState({ promptVisible: null})
                  this.props.checkProperties(this.state.promptVisible, value)
                }}/>
           </View>
  }
  getBlockchainExplorerRow(url, i) {
    const { bankStyle } = this.props
    return (
      <TouchableOpacity onPress={this.onPress.bind(this, url)} key={`url${i}`}>
        <Text style={[styles.description, {color: bankStyle.linkColor}]}>{translate('independentBlockchainViewer') + ' ' + (i+1)}</Text>
      </TouchableOpacity>
    )
  }
  onPress(url, event) {
    Linking.openURL(url)
  }
}
reactMixin(ShowPropertiesView.prototype, RowMixin);
reactMixin(ShowPropertiesView.prototype, ResourceMixin);
ShowPropertiesView = makeResponsive(ShowPropertiesView)

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  content: {
    color: '#9b9b9b',
    fontSize: 16,
    marginHorizontal: 7,
    paddingBottom: 10
  },
  title: {
    fontSize: 16,
    // fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  linkTitle: {
    fontSize: 18,
    color: '#2892C6'
  },
  description: {
    fontSize: 18,
    marginVertical: 3,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  dsTitle: {
    width: 90,
    fontSize: 16,
    // fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  dsValue: {
    fontSize: 18,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  icon: {
    width: 40,
    height: 40
  },
  bigTitle: {
    fontSize: 20,
    // fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#7AAAC3'
  }
});

module.exports = ShowPropertiesView;
