'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var ResourceView = require('./ResourceView')
var NewResource = require('./NewResource');
var ProductChooser = require('./ProductChooser');
var PhotoList = require('./PhotoList');
var Icon = require('react-native-vector-icons/Ionicons');
var groupByEveryN = utils.groupByEveryN
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin')
var extend = require('extend')
var equal = require('deep-equal')
var formDefaults
if (__DEV__) {
  formDefaults = require('../data/formDefaults.json')
}

var TradleW = require('../img/TradleW.png')
var Actions = require('../Actions/Actions');
import { makeResponsive } from 'react-native-orient'
var StyleSheet = require('../StyleSheet')
var reactMixin = require('react-mixin');
var chatStyles = require('../styles/chatStyles')

const MY_PRODUCT = 'tradle.MyProduct'
const FORM_ERROR = 'tradle.FormError'
const FORM = 'tradle.Form'
const SHARE_CONTEXT = 'tradle.ShareContext'
const ENUM = 'tradle.Enum'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const PRODUCT_LIST = 'tradle.ProductList'
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'
const REMEDIATION_SIMPLE_MESSAGE = 'tradle.RemediationSimpleMessage'
const CONFIRMATION = 'tradle.Confirmation'
const APPLICATION_DENIAL = 'tradle.ApplicationDenial'
const INTRODUCTION = 'tradle.Introduction'

var CURRENCY_SYMBOL
var LINK_COLOR

const DEFAULT_CURRENCY_SYMBOL = '£'
const DEFAULT_LINK_COLOR = '#2892C6'

import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  Alert,
  Navigator,
  View,
  Platform,
  processColor
} from 'react-native'

import React, { Component } from 'react'
import ENV from '../utils/env'

class MessageRow extends Component {
  constructor(props) {
    super(props);
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    LINK_COLOR = this.props.bankStyle.LINK_COLOR
    CURRENCY_SYMBOL = props.currency ? props.currency.symbol || props.currency : DEFAULT_CURRENCY_SYMBOL
  }
  shouldComponentUpdate(nextProps, nextState) {
    return utils.resized(this.props, nextProps)              ||
           !equal(this.props.resource, nextProps.resource)   ||
           !equal(this.props.to, nextProps.to)               ||
           this.props.addedItem !== nextProps.addedItem      ||
           this.props.orientation !== nextProps.orientation  ||
           this.props.sendStatus !== nextProps.sendStatus
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    var me = utils.getMe();

    let isRemediationCompleted = resource[constants.TYPE] === REMEDIATION_SIMPLE_MESSAGE
    var isMyMessage = this.isMyMessage()//  &&  !isRemediationCompleted
    var to = this.props.to;
    var ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    var renderedRow = [];
    var ret = this.formatRow(isMyMessage, renderedRow);
    let onPressCall = ret ? ret.onPressCall : null
    let isConfirmation = resource[constants.TYPE] === CONFIRMATION
    var isFormError = resource[constants.TYPE] === FORM_ERROR

    var photoUrls = [];
    var photoListStyle = {height: 3};
    var addStyle, inRow;

    var isProductApplication = model.id === PRODUCT_APPLICATION
    let message = isProductApplication ? ret.message : resource.message

    var noMessage = !message  ||  !message.length;
    var isSimpleMessage = resource[constants.TYPE] === constants.TYPES.SIMPLE_MESSAGE
    var isForgetting = model.id === constants.TYPES.FORGET_ME || model.id === constants.TYPES.FORGOT_YOU
    const bankStyle = this.props.bankStyle
    if (!renderedRow.length) {
      var vCols = noMessage ? null : utils.getDisplayName(resource, model.properties);
      if (vCols)
        renderedRow = <Text style={chatStyles.resourceTitle}>{vCols}</Text>;
    }
    else {
      var fromHash = resource.from.id;
      if (isMyMessage) {
        if (!noMessage)
          addStyle = [chatStyles.myCell, {backgroundColor: bankStyle.MY_MESSAGE_BACKGROUND_COLOR}]
      }
      else if (isForgetting)
        addStyle = styles.forgetCell
      else {
        if (isConfirmation)
          addStyle = [chatStyles.verificationBody, {borderColor: '#cccccc', backgroundColor: bankStyle.CONFIRMATION_BG}, styles.myConfCell]
        else {
          let borderColor = isFormError ? bankStyle.REQUEST_FULFILLED : '#efefef'
          let mstyle = {
            borderColor: borderColor,
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 0
          }
          addStyle = (isSimpleMessage && message.length < 30)
                   ? [chatStyles.verificationBody, mstyle]
                   : [chatStyles.verificationBody, {flex: 1}, mstyle]
        }
      }

      if (isFormError)
        addStyle = [addStyle, chatStyles.verificationBody, {backgroundColor: bankStyle.FORM_ERROR_BG, borderColor: resource.documentCreated ? bankStyle.REQUEST_FULFILLED : bankStyle.FORM_ERROR_BORDER}]; //model.style];

      let isRemediationCompleted = resource[constants.TYPE] === REMEDIATION_SIMPLE_MESSAGE
      if (isMyMessage  &&  !isSimpleMessage && !isFormError  &&  !isRemediationCompleted) {
        let st = isProductApplication
               ? {backgroundColor: bankStyle.CONTEXT_BACKGROUND_COLOR}
               : {backgroundColor: bankStyle.STRUCTURED_MESSAGE_COLOR}
        addStyle = [addStyle, chatStyles.verificationBody, st]; //model.style];
      }
    }
    var properties = model.properties;
    var verPhoto;
    if (properties.photos) {
      if (resource.photos) {
        var len = resource.photos.length;
        inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
        var style;
        if (inRow === 1)
          style = chatStyles.bigImage;
        else if (inRow === 2)
          style = chatStyles.mediumImage;
        else
          style = chatStyles.image;
        resource.photos.forEach((p) => {
          photoUrls.push({url: utils.getImageUri(p.url)});
        })

        let isReadOnlyChat = to[constants.TYPE] === PRODUCT_APPLICATION && utils.isReadOnlyChat(this.props.context) //this.props.context  &&  this.props.context._readOnly
        photoListStyle = {
          flexDirection: 'row',
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
          marginLeft: isReadOnlyChat ? 45 : 30, //(hasOwnerPhoto ? 45 : 10),
          borderRadius: 10,
          marginBottom: 3,
        }
      }
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }

    var rowStyle = [chatStyles.row, {backgroundColor: 'transparent'}];
    var val = this.getTime(resource);
    var date = val
             ? <Text style={chatStyles.date}>{val}</Text>
             : <View />;

    var showMessageBody;
    if (noMessage) {
      if (hasOwnerPhoto)
        showMessageBody = true;
      else if (!model.properties['message'])
        showMessageBody = true;
    }
    else
      showMessageBody = true;
    var messageBody;
    var sendStatus = <View />
    // HACK that solves the case when the message is short and we don't want it to be displayed
    // in a bigger than needed bubble
    if (message  &&  !isProductApplication) {
      let parts = utils.splitMessage(message)
      if (parts.length == 2)
        message = parts[0].length > parts[1].length ? parts[0] : parts[1]
      else
        message = parts[0]
      let strName = utils.getStringName(message)
      if (strName)
        message = translate(strName)
      if (resource.form) {
        let formTitle = translate(resource.form)
        if (formTitle.length > message.length)
          message = formTitle
      }
    }
    // HACK
    var w = utils.dimensions().width
    let msgWidth = utils.getMessageWidth(MessageRow)
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)

    let longMessage = isSimpleMessage  &&  message ? numberOfCharsInWidth < message.length : false
    if (showMessageBody) {
      var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
      if (message) {
        if (/*message.charAt(0) === '['  || */ longMessage)
          viewStyle.maxWidth = msgWidth; //isMyMessage || !hasOwnerPhoto ? w - 70 : w - 50;
      }
      if (!isSimpleMessage  &&  model.id !== PRODUCT_LIST) {
        let msgW = message.length * utils.getFontSize(18) + 40
        // if (msgW > msgWidth)
          viewStyle.maxWidth =  msgW > msgWidth ? msgWidth : msgW
      }


      if (this.props.sendStatus  &&  this.props.sendStatus !== null)
        sendStatus = this.getSendStatus()
      var sealedStatus = (resource.txId)
                       ? <View style={chatStyles.sealedStatus}>
                           <Icon name={'ios-ribbon-outline'} size={30} color='#316A99' style={{opacity: 0.5}} />
                         </View>
                       : <View />

      let cellStyle
      if (addStyle) {
        if (/*hasOwnerPhoto  ||  */!isSimpleMessage  ||  longMessage)
          cellStyle = [chatStyles.textContainer, addStyle]
        else
          cellStyle = addStyle
      }
      else
        cellStyle = chatStyles.textContainer
      if (isFormError) {
        viewStyle.maxWidth = Math.min(600, msgWidth)
        viewStyle.width =  Math.min(600, message.length * utils.getFontSize(10) + 40)
      }

      let msgContent =  <View style={[rowStyle, viewStyle]}>
                          <View style={{marginTop: 2}}>
                          {ownerPhoto}
                          </View>
                          <View style={cellStyle}>
                            <View style={styles.container}>
                            {this.isShared()
                              ? <View style={[chatStyles.verifiedHeader, {backgroundColor: bankStyle.SHARED_WITH_BG}]}>
                                  <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
                                </View>
                              : <View />
                            }
                            {renderedRow}
                           </View>
                           {sealedStatus}
                          </View>
                        </View>

      messageBody = isSimpleMessage || isProductApplication || isConfirmation
                  ? msgContent
                  : <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
                      {msgContent}
                    </TouchableHighlight>
    }
    else
      messageBody = <View style={{height: 5}}/>

    var len = photoUrls.length;
    var inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
    var photoStyle = {};
    // var height;

    if (inRow > 0) {
      if (inRow === 1) {
        var ww = Math.max(240, msgWidth / 2)
        var hh = ww * 280 / 240
        photoStyle = [styles.bigImage, {
          width:  ww,
          height: hh
        }]
      }
      else if (inRow === 2)
        photoStyle = styles.mediumImage;
      else
        photoStyle = chatStyles.image;
    }

    var viewStyle = { margin:1, backgroundColor: '#f7f7f7', whiteSpace: 'pre-wrap' }
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;
    var photoStyle = (isLicense  &&  len === 1) ? chatStyles.bigImage : photoStyle;
    var bg = bankStyle.BACKGROUND_IMAGE ? 'transparent' : bankStyle.BACKGROUND_COLOR
    return (
      <View style={[viewStyle, {backgroundColor: bg, paddingRight: isMyMessage ? 10 : 0}]}>
        {date}
        {messageBody}
        <View style={photoListStyle}>
          <PhotoList photos={photoUrls} resource={this.props.resource} style={[photoStyle, {marginTop: -5}]} navigator={this.props.navigator} numberInRow={inRow} />
        </View>
        {sendStatus}
      </View>
    )
    // return (
    //   <View style={[viewStyle, {backgroundColor: bankStyle.BACKGROUND_COLOR}]}>
    //     {date}
    //     {messageBody}
    //     <View style={photoListStyle}>
    //       <PhotoList photos={photoUrls} resource={this.props.resource} style={[photoStyle, {marginTop: -5}]} navigator={this.props.navigator} numberInRow={inRow} />
    //     </View>
    //     {sendStatus}
    //     {shareables}
    //   </View>
    // )
  }

  editVerificationRequest() {
    var resource = this.props.resource.document;
    var rmodel = utils.getModel(resource[constants.TYPE]).value;
    var title = utils.getDisplayName(resource, rmodel.properties);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      // titleTextColor: '#999999',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: rmodel,
        resource: resource,
        additionalInfo: this.props.resource,
        editCols: ['photos']
      }
    })
  }
  showEditResource() {
    let errs = {}
    let r = this.props.resource.prefill
    if (Array.isArray(this.props.resource.errors)) {
      for (let p of this.props.resource.errors)
        errs[p.name] = p.error
    }
    else
      errs = this.props.resource.errors

    let me = utils.getMe()
    r.from = {
      id: utils.getId(me),
      title: utils.getDisplayName(me)
    }
    r.to = this.props.resource.from

    // Prefill for testing and demoing
    // var isPrefilled = model.id in formDefaults
    // if (isPrefilled)
    //   extend(true, resource, formDefaults[model.id])
    let type = utils.getType(r)
    let model = utils.getModel(type).value
    this.props.navigator.push({
      id: 4,
      title: translate(model),
      rightButtonTitle: 'Done',
      backButtonTitle: 'Back',
      component: NewResource,
      // titleTextColor: '#7AAAC3',
      passProps:  {
        model: model,
        resource: r,
        isPrefilled: true,
        errs: errs,
        currency: this.props.currency,
        bankStyle: this.props.bankStyle,
        originatingMessage: this.props.resource
      }
    });

  }
  onPress(link, text) {
    this.props.navigator.push({
      id: 7,
      title: text || '',
      backButtonTitle: 'Back',
      component: ArticleView,
      passProps: {url: link}
    });
  }
  createNewResource(model, isMyMessage) {
    var resource = {
      'from': this.props.resource.to,
      'to': this.props.resource.from,
    }
    resource.message = this.props.resource.message;
    resource[constants.TYPE] = model.id;

    // Prefill for testing and demoing
    var isPrefilled = ENV.prefillForms && model.id in formDefaults
    if (isPrefilled) {
      extend(true, resource, formDefaults[model.id])
      // console.log(JSON.stringify(resource, 0, 2))
    }

    this.props.navigator.push({
      id: 4,
      title: translate(model),
      rightButtonTitle: isMyMessage ? null : 'Done',
      backButtonTitle: 'Back',
      component: NewResource,
      // titleTextColor: '#7AAAC3',
      passProps:  {
        model: model,
        resource: resource,
        isPrefilled: isPrefilled,
        currency: this.props.currency,
        bankStyle: this.props.bankStyle,
        originatingMessage: this.props.resource
      }
    });
  }

  verify(event) {
    var resource = this.props.resource;
    var isVerification = resource[constants.TYPE] === constants.TYPES.VERIFICATION;
    var r = isVerification ? resource.document : resource

    var passProps = {
      resource: r,
      bankStyle: this.props.bankStyle,
      currency: this.props.currency
    }
    if (!isVerification)
      passProps.verify = true
    else
      passProps.verification = resource

    var model = utils.getModel(r[constants.TYPE]).value;
    var route = {
      id: 5,
      component: MessageView,
      backButtonTitle: 'Back',
      passProps: passProps,
      title: translate(model)
    }
    if (this.isMyMessage()) {
      route.rightButtonTitle = 'Edit';
      route.onRightButtonPress = {
        title: 'Edit',
        component: NewResource,
        // titleTextColor: '#7AAAC3',
        id: 4,
        passProps: {
          resource: r,
          metadata: model,
          bankStyle: this.props.bankStyle,
          currency: this.props.currency,
          callback: this.props.onSelect.bind(this, r)
        }
      };
    }
    this.props.navigator.push(route);
  }

  formatRow(isMyMessage, renderedRow) {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    let isReadOnlyChat = this.props.to[constants.TYPE]  &&  utils.isReadOnlyChat(resource, this.props.context) //this.props.context  &&  this.props.context._readOnly

    if (model.id === PRODUCT_APPLICATION) {
      let msgModel = utils.getModel(resource.product).value
      let str = !this.props.navigator.isConnected  &&  this.props.isLast
              ? translate('noConnectionForNewProduct', utils.getMe().firstName, translate(msgModel))
              : translate('newProductMsg', translate(msgModel))
      let color = isMyMessage ? this.props.bankStyle.CONTEXT_TEXT_COLOR : '#757575'
      let msg = !this.props.navigator.isConnected  &&  this.props.isLast
              ? <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, {color: color}]}>{str}</Text>
                </View>
              : <View key={this.getNextKey()} style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Text style={[chatStyles.resourceTitle, {color: color, marginTop: 3, paddingRight: 20}]}>{str}</Text>
                  <Icon name='ios-folder-open-outline' size={25} color={color}/>
                </View>
      renderedRow.push(msg);
      return ({message: str})
    }
    if (model.id === APPLICATION_DENIAL  ||  (model.id === CONFIRMATION  &&  isMyMessage)) {
      let iname = model.id === APPLICATION_DENIAL ? 'md-close-circle' : 'ios-ribbon-outline'
      let icolor = model.id === APPLICATION_DENIAL ? 'red' : '#ffffff'
      let msg = <View key={this.getNextKey()}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flex: 1}}>
                      <Text style={[chatStyles.resourceTitle, {color: isMyMessage ? '#ffffff' : '#555555'}]}>{resource.message}</Text>
                    </View>
                    <View style={{justifyContent: 'flex-end', paddingLeft:10}}>
                      <Icon style={{color: icolor}} size={20} name={iname} />
                    </View>
                  </View>
                </View>

      renderedRow.push(msg)
      return {onPressCall: null}

    }
    let isRemediationCompleted = resource[constants.TYPE] === REMEDIATION_SIMPLE_MESSAGE
    if (isRemediationCompleted) {
      let msg = <View key={this.getNextKey()}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      <Text style={[chatStyles.resourceTitle, {color: isMyMessage ? '#ffffff' : '#555555'}]}>{resource.message}</Text>
                    </View>
                    <Icon style={{position: 'absolute', bottom: 0, right: 2, color: this.props.bankStyle.LINK_COLOR}} size={20} name={'ios-arrow-forward'} />
                  </View>
                </View>

      renderedRow.push(msg)
      return {onPressCall: isMyMessage ? this.showMyData.bind(this) : null}
    }

    var isProductList = model.id === constants.TYPES.PRODUCT_LIST
    if (isProductList) {
      // Case when the needed form was sent along with the message
      if (resource.welcome) {
        let msg = <View key={this.getNextKey()}>
                <Text style={chatStyles.resourceTitle}>{translate('hello', utils.getMe().firstName)}</Text>
                <View style={chatStyles.rowContainer}>
                  <Text style={[chatStyles.resourceTitle, {color: LINK_COLOR}]}>{translate('listOfProducts')} </Text>
                  <Icon style={{color: LINK_COLOR, paddingLeft: 100}} size={20} name={'ios-arrow-forward'} />
                </View>
              </View>
        renderedRow.push(msg);
        return {onPressCall: this.onChooseProduct.bind(this, true)}
      }
    }
    let isSelfIntroduction = model.id === constants.TYPES.SELF_INTRODUCTION
    let isCustomerWaiting = model.id === constants.TYPES.CUSTOMER_WAITING
    if (isSelfIntroduction || isCustomerWaiting) {
      let msg = <View key={this.getNextKey()}>
                  <View style={chatStyles.rowContainer}>
                    <Text style={[chatStyles.resourceTitle, {paddingRight: 20, color: isMyMessage ? '#ffffff' : '#757575', fontStyle: isCustomerWaiting ? 'italic' : 'normal'}]}>{resource.message}</Text>
                    <Icon style={{color: LINK_COLOR, backgroundColor: 'transparent',  paddingLeft: 5}} size={20} name={'ios-person'} />
                  </View>
                </View>
      renderedRow.push(msg);
      return null
      // return {onPressCall: this.addContact.bind(this)}
    }
    if (model.id === INTRODUCTION) {
      let profile
      if (resource.profile)
        profile = <Text style={[chatStyles.resourceTitle, {paddingRight: 20, color: isMyMessage ? '#ffffff' : '#757575', fontStyle: isCustomerWaiting ? 'italic' : 'normal'}]}>{resource.profile.firstName + ' ' + (resource.profile.lastName ||  '')}</Text>

      let msg = <View key={this.getNextKey()}>
                  <View style={chatStyles.rowContainer}>
                    <Text style={[chatStyles.resourceTitle, {paddingRight: 20, color: isMyMessage ? '#ffffff' : '#757575', fontStyle: isCustomerWaiting ? 'italic' : 'normal'}]}>{resource.message}</Text>
                    {profile}
                    <Icon style={{color: LINK_COLOR, backgroundColor: 'transparent',  paddingLeft: 5}} size={20} name={'ios-person'} />
                  </View>
                </View>
      renderedRow.push(msg);
      return null
    }

    if (model.id === SHARE_CONTEXT) {
      let msg = <View key={this.getNextKey()}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'column'}}>
                      <Text style={[chatStyles.resourceTitle, {color: '#ffffff'}]}>{resource.message}</Text>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                      <Icon style={{color: '#ffffff', backgroundColor: 'transparent',  paddingLeft: 5}} size={20} name={'md-share'} />
                    </View>
                  </View>
                </View>
      renderedRow.push(msg);
      return null
    }
    if (model.id === APPLICATION_SUBMITTED) {
      let msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, {color: this.props.bankStyle.CONFIRMATION_COLOR}]}>{resource.message}</Text>
                </View>
      renderedRow.push(msg);
      return null
    }
    var isForgetting = model.id === constants.TYPES.FORGET_ME || model.id === constants.TYPES.FORGOT_YOU
    if (isForgetting) {
      let msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, styles.white18]} key={this.getNextKey()}>{resource.message}</Text>
                </View>
      renderedRow.push(msg)
      return null
    }

    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var isFormError = model.id === FORM_ERROR
    var first = true;
    var self = this;

    var properties = model.properties;
    var noMessage = !resource.message  ||  !resource.message.length;
    var onPressCall;

    let isMyProduct = model.subClassOf === MY_PRODUCT
    var isSimpleMessage = model.id === constants.TYPES.SIMPLE_MESSAGE
    var isConfirmation = model.id === CONFIRMATION
    var cnt = 0;
    var self = this

    var vCols = [];

    viewCols.forEach((v) => {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;

      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(this.getPropRow(properties[v], resource, resource[v].title || resource[v]))
          first = false;
        }
        return;
      }
      var style = isSimpleMessage || isFormError ? chatStyles.resourceTitle : chatStyles.description; //resourceTitle; //(first) ? chatStyles.resourceTitle : styles.description;
      if (isMyMessage)
        style = [style, {justifyContent: 'flex-end', color: isMyProduct ? '#2892C6' : '#ffffff'}];

      if (resource[v]                      &&
          properties[v].type === 'string'  &&
          (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
        onPressCall = this.onPress.bind(self, this.props.resource.message);
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1} key={self.getNextKey()}>{resource[v]}</Text>);
      }
      else if (isConfirmation) {
        style = [style, {color: self.props.bankStyle.CONFIRMATION_COLOR}, chatStyles.resourceTitle]
        vCols.push(
          <View key={self.getNextKey()}>
            <Text style={[style]}>{resource[v]}</Text>
            <Icon style={[{color: self.props.bankStyle.CONFIRMATION_COLOR, alignSelf: 'flex-end', width: 50, height: 50, marginTop: -25, opacity: 0.2}]} size={45} name={'ios-flower'} />
            <Icon style={{color: self.props.bankStyle.CONFIRMATION_COLOR, alignSelf: 'flex-end', marginTop: -30}} size={30} name={'ios-done-all'} />
          </View>
        );

      }
      else if (isFormError) {
        let rtype = (resource.prefill[constants.TYPE]) ? resource.prefill[constants.TYPE] : utils.getId(resource.prefill).split('_')[0]
        let iconName = resource.documentCreated ? 'ios-done-all' : 'ios-alert-outline'
        let iconSize = resource.documentCreated ? 30 : 25
        let instruction = resource.message
        // if (isMyMessage) {
        //   instruction = translate('errorNotification')
        // } else if (resource.message.indexOf('Importing') === 0) {
        //   // hack for tradle.Remediation
        //   instruction = resource.message
        // } else {
        //   instruction = translate('pleaseCorrect')
        // }

        vCols.push(
          <View key={self.getNextKey()} style={{paddingBottom: 3}}>
            <Text style={[style, {color: '#555555'}]}>{instruction} </Text>
            <View style={chatStyles.rowContainer}>
              <Text style={[style, {color: resource.documentCreated || isReadOnlyChat ?  '#aaaaaa' : self.props.bankStyle.FORM_ERROR_COLOR}]}>{translate(utils.getModel(rtype).value)}</Text>
              <Icon name={iconName} size={iconSize} color={resource.documentCreated || isReadOnlyChat ? self.props.bankStyle.REQUEST_FULFILLED : self.props.bankStyle.FORM_ERROR_COLOR} style={Platform.OS === 'web' ? {marginTop: -3} : {}}/>
            </View>
          </View>
        )
      }
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];

        if (!val)
          return
        if (model.properties.verifications  &&  !isMyMessage)
          onPressCall = self.verify.bind(self);
        if (!isMyMessage)
          style = [style, {paddingBottom: 10, color: '#2892C6'}];
        vCols.push(self.getPropRow(properties[v], resource, val))
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          if (resource.welcome) {
            let bg  = isMyMessage
                      ? self.props.bankStyle.MY_MESSAGE_BACKGROUND_COLOR
                      : '#ffffff'
            let color = isMyMessage ? self.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR
            let msg = <View key={self.getNextKey()}>
                        <Text style={style}>{msgParts[0]}</Text>
                        <View style={chatStyles.rowContainer}>
                          <Text style={[style, {backgroundColor: bg, color: color}]}>{msgParts[1]} </Text>
                          <Icon style={{color: LINK_COLOR, marginTop: 2}} size={20} name={'ios-arrow-forward'} />
                        </View>
                      </View>
            vCols.push(msg);
            onPressCall = self.onChooseProduct.bind(self, true)
            return;
          }
          let s = msgParts[1].split('_')
          var msgModel = utils.getModel(s[0]);
          let color, link
          if (msgModel) {
            // if (self.props.shareableResources  &&  !isSimpleMessage)
            //   style = /*isSimpleMessage ? chatStyles.resourceTitle : */chatStyles.description;
            msgModel = msgModel.value;
            let shareMyProduct = msgModel.subClassOf === MY_PRODUCT
            if (shareMyProduct) {
              color = {color: '#aaaaaa'}
              onPressCall = null
              link = <Text style={[style, color]}>{translate(msgModel)}</Text>
            }
            else {
              if (!msgParts[0].length)
                msgParts[0] = 'I just sent you a request for '; // + msgModel.title;
              if (s.length === 2)
                onPressCall = self.editForm.bind(self, msgParts[1], msgParts[0])
              else if (!isMyMessage  &&  !resource.documentCreated)
                onPressCall = self.createNewResource.bind(self, msgModel, isMyMessage);

              color = isMyMessage  &&  !isFormError
                    ? {color: self.props.bankStyle.MY_MESSAGE_LINK_COLOR}
                    : {color: '#2892C6'}
              if (isMyMessage)
                link = <Text style={[style, color]}>{translate(msgModel)}</Text>
              else
                link = <View style={chatStyles.rowContainer}>
                           <Text style={[style, {color: resource.documentCreated ?  '#757575' : LINK_COLOR}]}>{translate(msgModel)}</Text>
                           <Icon style={[{marginTop: 2}, resource.documentCreated || isReadOnlyChat ? chatStyles.linkIconGreyed : {color: isMyMessage ? self.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
                       </View>
            }
            let strName = isMyProduct
                        ? translate('shareProduct', translate(msgModel))
                        : utils.getStringName(msgParts[0])
            let str = strName ? utils.translate(strName) : msgParts[0]
            let msg = <View key={self.getNextKey()}>
                       <Text style={style}>{str}</Text>
                       {link}
                     </View>
            vCols.push(msg);
            return;
          }
        }
        // else
        //   isConfirmation = resource[v].indexOf('Congratulations!') !== -1

        let pVal = resource[v]
        let linkIdx = pVal.indexOf('<http')
        if (linkIdx !== -1) {
          let endLink = pVal.indexOf('>', linkIdx)
          let link = pVal.substring(linkIdx + 1, endLink)

          let textIdx = pVal.indexOf('[')
          let text
          if (textIdx) {
            text = pVal.substring(textIdx + 1, linkIdx - 1)
            linkIdx = textIdx
          }
          vCols.push(<TouchableHighlight underlayColor='transparent' onPress={this.onPress.bind(this, link, text)}  key={self.getNextKey()}>
                      <Text style={style}>
                        {pVal.substring(0, linkIdx)}
                        <Text style={[style, {color: this.props.bankStyle.LINK_COLOR}]}>{text || link} </Text>
                        {pVal.substring(endLink + 1)}
                      </Text>
                     </TouchableHighlight>
          // vCols.push(<Text key={self.getNextKey()}>
          //               <Text style={style}>{pVal.substring(0, linkIdx)}</Text>
          //               <TouchableHighlight underlayColor='transparent' onPress={this.onPress.bind(this, link, text)}>
          //                 <Text style={[style, {color: this.props.bankStyle.LINK_COLOR}]}>{text || link}</Text>
          //               </TouchableHighlight>
          //               <Text style={style}>{pVal.substring(endLink + 1)}</Text>
          //             </Text>
            )
          return null
        }
        else if (isSimpleMessage) {
          let row = utils.parseMessage(resource, resource[v], this.props.bankStyle)
          if (typeof row === 'string')
            vCols.push(<Text style={style} key={self.getNextKey()}>{resource[v]}</Text>)
          else
            vCols.push(row)
        }
        else
          vCols.push(<Text style={style} key={self.getNextKey()}>{resource[v]}</Text>)
      }
      first = false;

    });
    if (!isSimpleMessage  &&  !isFormError  &&  !isMyProduct  &&  !isConfirmation)  {
      let title = translate(model)
      // if (title.length > 30)
      //   title = title.substring(0, 27) + '...'

      vCols.push(<Text style={[chatStyles.resourceTitle, chatStyles.formType, {color: isMyMessage ? '#EBFCFF' : this.props.bankStyle.STRUCTURED_MESSAGE_BORDER}]} key={this.getNextKey()}>{title}</Text>);
    }
    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      })
    }
    if (isReadOnlyChat)
      return null
    if (onPressCall)
      return {onPressCall: onPressCall}
    if (isFormError) {
      if (resource.documentCreated)
        return null
      if (utils.getId(resource.from) === utils.getId(utils.getMe()))
        return null
      else
        return {onPressCall: this.showEditResource.bind(this)}
    }
    if (isSimpleMessage)
      return isConfirmation ? {isConfirmation: true} : null
    return {onPressCall: this.props.onSelect.bind(this, resource, null)}
  }
  showMyData() {
    let me = utils.getMe()
    let title = translate('profile')
    this.props.navigator.push({
      title: title,
      id: 3,
      component: ResourceView,
      backButtonTitle: translate('back'),
      passProps: {
        resource: me,
        bankStyle: this.props.bankStyle
      }
    })
    // let n = this.props.navigator.getCurrentRoutes().length
    // this.props.navigator.popN(n - 2)
    // this.showResources(me, utils.getModel(me[constants.TYPE]).value.properties.myForms)
  }

  onChooseProduct() {
    if (this.props.isAggregation)
      return
    var modelName = constants.TYPES.MESSAGE
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface)
      return;

    var resource = this.props.to
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate('iNeed'), //I need...',
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        products: this.props.resource.list,
        callback: this.props.callback,
        bankStyle: this.props.bankStyle
      },
    });
  }
  editForm(rUri, message) {
    let s = rUri.split('_')
    let resource = {
      [constants.TYPE]: s[0],
      [constants.ROOT_HASH]: s[1]
    }

    let rmodel = utils.getModel(s[0]).value;
    let title = translate(rmodel);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      // titleTextColor: '#999999',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: rmodel,
        resource: resource,
        message: message
      }
    })
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  forgetCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
    borderTopLeftRadius: 0,
    backgroundColor: 'red',
  },
  myConfCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderTopLeftRadius: 0,
    borderRadius: 10,
  },
  white18: {
    color: '#ffffff',
    fontSize: 18
  },
});
reactMixin(MessageRow.prototype, RowMixin);
reactMixin(MessageRow.prototype, ResourceMixin)
MessageRow = makeResponsive(MessageRow)

module.exports = MessageRow;
