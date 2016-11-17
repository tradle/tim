'use strict';

var ArticleView = require('./ArticleView');
var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin')
var ResourceMixin = require('./ResourceMixin')
var reactMixin = require('react-mixin')
var dateformat = require('dateformat')
var Accordion = require('react-native-accordion')
var Icon = require('react-native-vector-icons/Ionicons')
var NOT_SPECIFIED = '[not specified]'
var DEFAULT_CURRENCY_SYMBOL = '£'
var CURRENCY_SYMBOL
var TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const ENUM = 'tradle.Enum'

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
} from 'react-native'

import React, { Component } from 'react'
class ShowPropertiesView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    checkProperties: PropTypes.func,
    currency: PropTypes.string,
    showRefResources: PropTypes.func,
    showItems: PropTypes.func,
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

  shouldComponentUpdate(nextProps, nextState) {
    // Prompt for employee to write a correction message
    if (this.state.promptVisible !== nextState.promptVisible)
      return true
    if (!this.props.errorProps  ||  !nextProps.errorProps)
      return true
    return (this.props.errorProps != nextProps.errorProps) ? true : false
  }
  getViewCols(resource, model) {
    var resource = this.props.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var vCols = vCols = model.viewCols
    if (vCols  &&  this.props.checkProperties) {
      let props = model.properties
      let v = []
      vCols.forEach((p) => {
        if (p.charAt(0) === '_'  ||  props[p].hidden  ||  props[p].readOnly) //  ||  p.indexOf('_group') === p.length - 6)
          return
        v.push(p)
        let idx = p.indexOf('_group')
        if (idx !== -1  &&  idx === p.length - 6)
          props[p].list.forEach((p) => v.push(p))
      })
      vCols = v
    }

    var excludedProperties = this.props.excludedProperties;
    var props = model.properties;
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
    }
    var isMessage = model.interfaces;
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
    var viewCols = vCols.map((p) => {
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;

      var val = resource[p];
      var pMeta = model.properties[p];
      var isRef;
      var isItems
      var isDirectionRow;
      // var isEmail
      if (!val) {
        if (pMeta.displayAs)
          val = utils.templateIt(pMeta, resource);
        else if (this.props.checkProperties) {
          if (p.indexOf('_group') === p.length - 6) {
            return (<View style={{padding: 15}} key={this.getNextKey()}>
                      <View key={this.getNextKey()}  style={{borderBottomColor: this.props.bankStyle.LINK_COLOR, borderBottomWidth: 1, paddingBottom: 5}}>
                        <Text style={{fontSize: 22, color: this.props.bankStyle.LINK_COLOR}}>{translate(pMeta)}</Text>
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
      else if (pMeta.ref) {
        if (pMeta.ref == constants.TYPES.MONEY) {
          let c = utils.normalizeCurrencySymbol(val.currency)
          val = (c || CURRENCY_SYMBOL) + val.value
        }
        // Could be enum like props
        else if (utils.getModel(pMeta.ref).value.subClassOf === ENUM)
          val = val.title
        else if (this.props.showRefResource) {
          // ex. property that is referencing to the Organization for the contact
          var value = val[constants.TYPE] ? utils.getDisplayName(val, utils.getModel(val[constants.TYPE]).value.properties) : val.title;

          val = <TouchableOpacity onPress={this.props.showRefResource.bind(this, val, pMeta)}>
                 <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
               </TouchableOpacity>

          isRef = true;
        }
      }
      else if (pMeta.type === 'date')
        val = dateformat(new Date(val), 'fullDate')
        // val = utils.formatDate(val);
      // else if (pMeta[constants.SUB_TYPE] === 'email') {
      //   isEmail = true
      //   val = <TouchableOpacity onPress={() => Communications.email([val], null, null, 'My Subject','My body text')}>
      //       <Text  style={[styles.title, styles.linkTitle]}>{val}</Text>
      //   </TouchableOpacity>

      // }

      if (!val)
        return <View key={this.getNextKey()}></View>;
      if (!isRef) {
        if (val instanceof Array) {
          if (pMeta.items.backlink)
            return <View  key={this.getNextKey()} />
          var vCols = pMeta.viewCols;
          var cnt = val.length;
          val = <View style={{marginHorizontal: 7}}>{this.renderItems(val, pMeta)}</View>

          isItems = true
          first = false;
          title = <View style={{flexDirection: 'row'}}>
                    <Text style={styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
                    {cnt > 3  &&  modelName !== TERMS_AND_CONDITIONS
                      ? <Icon name={'ios-arrow-down'} size={15} color='#7AAAC3' style={{position: 'absolute', right: 10, top: 10}}/>
                      : <View />
                    }
                  </View>

          if (cnt > 3  &&  modelName !== TERMS_AND_CONDITIONS)
            val = <View key={this.getNextKey()}>
                    {separator}
                    <Accordion
                      header={title}
                      content={val}
                      underlayColor='transparent'
                      easing='easeInCirc' />
                 </View>
          else {
            val = <View key={this.getNextKey()}>
                   {title}
                   {val}
                 </View>
          }
        }
        else  {
          if (props[p].units  &&  props[p].units.charAt(0) != '[')
            val += ' ' + props[p].units

          if (val === NOT_SPECIFIED)
            val = <Text style={[styles.description, {color: this.props.bankStyle.LINK}]}>{val}</Text>
          else if (typeof val === 'number'  ||  typeof val === 'boolean')
            val = <Text style={styles.description}>{val ? 'Yes' : 'No'}</Text>;
          else if (pMeta.type === 'boolean')
            val = <Text style={styles.description}>{val.title}</Text>;
          else if (pMeta.type !== 'object'  &&  (typeof val === 'string')  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
            val = <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: '#7AAAC3'}]}>{val}</Text>;
          // else if (pMeta.range) {
          //   if (pMeta.range === 'email')
          //     val = <TouchableOpacity onPress={this.sendEmail.bind(this, val)}>
          //             <Text  style={[styles.title, styles.linkTitle]}>{val}</Text>
          //           </TouchableOpacity>
          //   else if (pMeta.range === 'phone') {
          //     val = <TouchableOpacity onPress={this.sendSMS.bind(this, val)}>
          //             <Text  style={[styles.title, styles.linkTitle]}>{val}</Text>
          //           </TouchableOpacity>
          //   }
          // }
          else if (modelName === TERMS_AND_CONDITIONS)
            val = <Text style={[styles.description, {flexWrap: 'wrap'}]}>{val}</Text>;
          else
            val = <Text style={[styles.description]} numberOfLines={2}>{val}</Text>;

        }
      }
      var title = pMeta.skipLabel  ||  isItems
                ? <View />
                : <Text style={modelName === TERMS_AND_CONDITIONS ? styles.bigTitle : styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
      var separator = first
                    ? <View />
                    : <View style={styles.separator}></View>;

      first = false;
      let isPromptVisible = this.state.promptVisible !== null
      if (isPromptVisible)
        console.log(this.state.promptVisible)
      let canReject = this.props.checkProperties
                    ? <View style={styles.checkProperties}>
                        <TouchableOpacity underlayColor='transparent' onPress={() => {
                          this.setState({promptVisible: pMeta})
                        }}>
                          <Icon key={p} name={this.props.errorProps && this.props.errorProps[p] ? 'ios-close-circle' : 'ios-radio-button-off'} size={25} color={this.props.errorProps && this.props.errorProps[p] ? 'red' : this.props.bankStyle.LINK_COLOR} style={{marginTop: 10, marginRight: 20}}/>
                        </TouchableOpacity>
                        <Prompt
                          title='Please write a message to the customer'
                          placeholder="Start typing"
                          visible={isPromptVisible}
                          onCancel={() => this.setState({ promptVisible: null })}
                          onSubmit={(value) => {
                            this.setState({ promptVisible: null})
                            this.props.checkProperties(this.state.promptVisible, value)
                          }}/>
                      </View>
                    : <View />
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
    if (resource.txId) {
      viewCols.push(<View key={this.getNextKey()}>
                     <View style={styles.separator}></View>
                     <View style={[styles.textContainer, {padding: 10}]}>
                       <Text style={styles.title}>{translate('irrefutableProofs')}</Text>
                       <TouchableOpacity onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + resource.txId)}>
                         <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 1'}</Text>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={this.onPress.bind(this, 'https://test-insight.bitpay.com/tx/' + resource.txId)}>
                         <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 2'}</Text>
                       </TouchableOpacity>
                      </View>
                    </View>)
    }
    return viewCols;
  }
  onPress(url, event) {
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    this.props.navigator.push({
      id: 7,
      backButtonTitle: 'Back',
      title: utils.getDisplayName(this.props.resource, model.properties),
      component: ArticleView,
      passProps: {url: url ? url : this.props.resource.url}
    });
  }
}
reactMixin(ShowPropertiesView.prototype, RowMixin);
reactMixin(ShowPropertiesView.prototype, ResourceMixin);
var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
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
  bigTitle: {
    fontSize: 20,
    // fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#7AAAC3'
  },
  linkTitle: {
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
});

module.exports = ShowPropertiesView;
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
