'use strict';

// var ArticleView = require('./ArticleView');
var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin')
var ResourceMixin = require('./ResourceMixin')
var reactMixin = require('react-mixin')
var dateformat = require('dateformat')
var Accordion = require('./Accordion')
import Icon from 'react-native-vector-icons/Ionicons'
var NOT_SPECIFIED = '[not specified]'
var DEFAULT_CURRENCY_SYMBOL = '£'
var CURRENCY_SYMBOL
var TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const ENUM = 'tradle.Enum'
const PHOTO = 'tradle.Photo'
const BLOCKCHAIN_EXPLORERS = [
  'https://rinkeby.etherscan.io/tx/0x$TXID',
  // 'https://etherchain.org/tx/0x$TXID' // doesn't support rinkeby testnet
]

import ActionSheet from 'react-native-actionsheet'
import Prompt from 'react-native-prompt'
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

import React, { Component, PropTypes } from 'react'
class ShowPropertiesView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    checkProperties: PropTypes.func,
    currency: PropTypes.string,
    showRefResources: PropTypes.func,
    bankStyle: PropTypes.object,
    errorProps: PropTypes.object,
    excludedProperties: PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      promptVisible: null
    }
    CURRENCY_SYMBOL = props.currency ? props.currency.symbol || props.currency : DEFAULT_CURRENCY_SYMBOL
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
    if (this.state.promptVisible !== nextState.promptVisible)
      return true
    if (!this.props.errorProps  ||  !nextProps.errorProps)
      return true
    return (this.props.errorProps != nextProps.errorProps) ? true : false
  }
  getViewCols(resource, model) {
    if (!resource)
      resource = this.props.resource
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var vCols = model.viewCols

    var props = model.properties;
    if (this.props.checkProperties) {
      if (!vCols) {
        vCols = []
        for (var p in resource) {
          if (p.charAt(0) === '_'  ||  !props[p])
            continue
          vCols.push(p)
        }
      }
      else
        vCols = utils.ungroup(model, vCols)
      let v = []
      vCols.forEach((p) => {
        if (p.charAt(0) === '_'  ||  props[p].hidden) //  ||  props[p].readOnly) //  ||  p.indexOf('_group') === p.length - 6)
          return
        v.push(p)
        // let idx = p.indexOf('_group')
        // if (idx !== -1  &&  idx === p.length - 6)
        //   props[p].list.forEach((p) => v.push(p))
      })
      vCols = v
    }

    var excludedProperties = this.props.excludedProperties;
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
      vCols = [];
      for (var p in props) {
        if (p != constants.TYPE)
          vCols.push(p)
      }
      // HACK
      if (utils.isMessage(resource)) {
        if (!excludedProperties)
          excludedProperties = []
        excludedProperties.push('from')
        excludedProperties.push('to')
      }
    }
    var isMessage = utils.isMessage(model)
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
    let isPartial = model.id === 'tradle.Partial'
    let isMethod = model.subClassOf === 'tradle.Method'

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
        else if (this.props.checkProperties) {
          if (p.indexOf('_group') === p.length - 6) {
            return (<View style={{padding: 15}} key={this.getNextKey()}>
                      <View key={this.getNextKey()}  style={{borderBottomColor: this.props.bankStyle.linkColor, borderBottomWidth: 1, paddingBottom: 5}}>
                        <Text style={{fontSize: 22, color: this.props.bankStyle.linkColor}}>{translate(pMeta)}</Text>
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
        if (pMeta.ref == constants.TYPES.MONEY) {
          let c = utils.normalizeCurrencySymbol(val.currency)
          val = (c || CURRENCY_SYMBOL) + val.value
        }
        else if (pMeta.inlined  ||  utils.getModel(pMeta.ref).value.inlined) {
          if (!val[constants.TYPE])
            val[constants.TYPE] = pMeta.ref
          return this.getViewCols(val, utils.getModel(val[constants.TYPE]).value)
        }
        else if (pMeta.mainPhoto)
          return
        // Could be enum like props
        else if (utils.getModel(pMeta.ref).value.subClassOf === ENUM)
          val = val.title
        else if (this.props.showRefResource) {
          // ex. property that is referencing to the Organization for the contact
          var value = val[constants.TYPE] ? utils.getDisplayName(val) : val.title;
          if (!value)
            value = utils.makeModelTitle(utils.getType(val))
          val = <TouchableOpacity onPress={this.props.showRefResource.bind(this, val, pMeta)}>
                 <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
               </TouchableOpacity>

          isRef = true;
        }
      }

      // else if (pMeta[constants.SUB_TYPE] === 'email') {
      //   isEmail = true
      //   val = <TouchableOpacity onPress={() => Communications.email([val], null, null, 'My Subject','My body text')}>
      //       <Text  style={[styles.title, styles.linkTitle]}>{val}</Text>
      //   </TouchableOpacity>

      // }

      if (isUndefined)
        return //<View key={this.getNextKey()}></View>;
      if (!isRef) {
        if (isPartial  &&  p === 'leaves') {
          let labels = []
          let type = val.find((l) => l.key === constants.TYPE  &&  l.value).value
          let lprops = utils.getModel(type).value.properties
          val.forEach((v) => {
            let key
            if (v.key.charAt(0) === '_') {
              if (v.key === constants.TYPE) {
                key = 'type'
                value = utils.getModel(v.value).value.title
              }
              else
                return
            }
            else {
              key = lprops[v.key]  &&  lprops[v.key].title
              if (v.value  &&  v.key  && (v.key === 'product'  ||  v.key === 'form'))
                value = utils.getModel(v.value).value.title
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
          if (utils.getModel(pMeta.items.ref).value.subClassOf === ENUM) {
            let values = val.map((v) => utils.getDisplayName(v)).join(', ')
            return <View style={{paddingLeft: 10}} key={this.getNextKey()}>
                     <Text style={[styles.title]}>{pMeta.title}</Text>
                     <Text style={[styles.description]}>{values}</Text>
                  </View>
          }
        }
        val = this.renderSimpleProp(val, pMeta, modelName, ShowPropertiesView)
      }
      var title
      if (!pMeta.skipLabel  &&  !isItems)
        title = <Text style={modelName === TERMS_AND_CONDITIONS ? styles.bigTitle : styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
      var separator = <View/>
      // var separator = first
      //               ? <View />
      //               : <View style={styles.separator}></View>;

      first = false;
      let isPromptVisible = this.state.promptVisible !== null
      if (isPromptVisible)
        console.log(this.state.promptVisible)
      let canReject
      if (this.props.checkProperties) {
        canReject = <View style={styles.checkProperties}>
                      <TouchableOpacity underlayColor='transparent' onPress={() => {
                        this.setState({promptVisible: pMeta})
                      }}>
                        <Icon key={p} name={this.props.errorProps && this.props.errorProps[p] ? 'ios-close-circle' : 'ios-radio-button-off'} size={30} color={this.props.errorProps && this.props.errorProps[p] ? 'red' : this.props.bankStyle.linkColor} style={{marginTop: 10}}/>
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
      if (this.props.checkProperties)
        isDirectionRow = true
               // <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

      let style = [styles.textContainer, {padding: 10}]
      if (isDirectionRow) {
        style.push({flexDirection: 'row'})
        if (canReject)
          style.push({justifyContent: 'space-between', flex: 10})
      }
      else
        style.push({flexDirection: 'column'})

      return (<View key={this.getNextKey()}>
               {separator}
               <View style={isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}}>
                 <View style={[style, {flexDirection: 'column'}]}>
                   {title}
                   {val}
                 </View>
                 {canReject}
               </View>
             </View>
             );
    });
    // if (!resource.txId)
    //   resource.txId = 'oqiuroiuouodifugidfgodigu'
    if (resource.txId) { // || utils.isSealableModel(model)) {
      let bankStyle = this.props.bankStyle

      let header = (<View style={{padding: 10 }} key={this.getNextKey()}>
                      <View style={[styles.textContainer, styles.row]}>
                        <Text style={styles.bigTitle}>{translate('dataSecurity')}</Text>
                        <Icon color={bankStyle.linkColor} size={20} name={'ios-arrow-down'} style={{marginRight: 10, marginTop: 7}}/>
                      </View>
                      <View style={{height: 1, marginTop: 5, marginBottom: 10, marginHorizontal: -10, alignSelf: 'stretch', backgroundColor: bankStyle.linkColor}} />
                    </View>)
      let description = 'This app uses blockchain technology to ensure you can always prove the contents of your data and whom you shared it with.'
      let txs = (
        <View>
          {
            BLOCKCHAIN_EXPLORERS.map((url, i) => {
              url = url.replace('$TXID', resource.txId)
              return this.getBlockchainExplorerRow(url, i)
            })
          }
        </View>
      )

      let content = <View style={{paddingHorizontal: 10}}>
                     <TouchableOpacity onPress={this.onPress.bind(this, 'http://thefinanser.com/2016/03/the-best-blockchain-white-papers-march-2016-part-2.html/')}>
                       <Text style={styles.content}>{description}
                         <Text style={{color: bankStyle.linkColor, paddingHorizontal: 7}}> Learn more</Text>
                       </Text>
                     </TouchableOpacity>
                     {txs}
                    </View>
      let self = this
      let row = <Accordion
                  sections={['txId']}
                  onPress={() => {
                    self.refs.propertySheet.measure((x,y,w,h,pX,pY) => {
                      if (h  &&  y > pY)
                        this.props.onPageLayout(pY, h)
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
      // viewCols.push(<View key={this.getNextKey()}>
      //                 <View style={[styles.textContainer, {padding: 10}]}>
      //                  <Text style={styles.title}>{translate('dataSecurity')}</Text>
      //                  <TouchableOpacity onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + resource.txId)}>
      //                    <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 1'}</Text>
      //                  </TouchableOpacity>
      //                  <TouchableOpacity onPress={this.onPress.bind(this, 'https://test-insight.bitpay.com/tx/' + resource.txId)}>
      //                    <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 2'}</Text>
      //                  </TouchableOpacity>
      //                 </View>
      //               </View>)
    }
    return viewCols;
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
    // var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    // this.props.navigator.push({
    //   id: 7,
    //   backButtonTitle: 'Back',
    //   title: utils.getDisplayName(this.props.resource, model.properties),
    //   component: ArticleView,
    //   passProps: {url: url ? url : this.props.resource.url}
    // });
  }
}
reactMixin(ShowPropertiesView.prototype, RowMixin);
reactMixin(ShowPropertiesView.prototype, ResourceMixin);
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
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginHorizontal: 15
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
  photo: {
    width: 86,
    height: 86,
    marginLeft: 1,
  },
  icon: {
    width: 40,
    height: 40
  },
  checkProperties: {
    flex: 1,
    justifyContent: 'flex-end',
    alignSelf: 'center',
    marginRight: 10
  },
  bigTitle: {
    fontSize: 20,
    // fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#7AAAC3'
  },

});

module.exports = ShowPropertiesView;
  // let buttons = {[translate('sendEmail'), translate('sendSMS'), translate('cancel')]}
  // <ActionSheet
  //   ref={(o) => {
  //     this.ActionSheet = o
  //   }}
  //   options={buttons}
  //   cancelButtonIndex={buttons.length - 1}
  //   onPress={(index) => {
  //     switch (index) {
  //     case 0:
  //       Communications.email([val], null, null, 'My Subject','My body text')
  //       break
  //     case 1:
  //       Communications.text(val)
  //       break;
  //     default:
  //       return
  //     }
  //   }}
  // />
  // npm i react-native-message-composer
  // sendEmail(val) {
  //   Communications.email([val], null, null, 'My Subject','My body text')
  // }
  // sendSMS(val) {
  //   // Communications.text(val)
  //   var Composer = require('NativeModules').RNMessageComposer
  //   Composer.messagingSupported(supported => {
  //     let s = 'may be show something'
  //   });

  //   // inside your code where you would like to send a message
  //   Composer.composeMessageWithArgs({
  //       'messageText':'My sample message body text',
  //       // 'subject':'My Sample Subject',
  //       'recipients':[val]
  //     },
  //     (result) => {
  //       switch(result) {
  //       case Composer.Sent:
  //         console.log('the message has been sent');
  //         break;
  //       case Composer.Cancelled:
  //         console.log('user cancelled sending the message');
  //         break;
  //       case Composer.Failed:
  //         console.log('failed to send the message');
  //         break;
  //       case Composer.NotSupported:
  //         console.log('this device does not support sending texts');
  //         break;
  //       default:
  //         console.log('something unexpected happened');
  //         break;
  //       }
  //     }
  //   );
  // }
