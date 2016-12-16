'use strict';

var utils = require('../utils/utils');
var ENV = require('../utils/env')
var translate = utils.translate
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var ProductChooser = require('./ProductChooser');
var PhotoList = require('./PhotoList');
var Icon = require('react-native-vector-icons/Ionicons');
var groupByEveryN = utils.groupByEveryN
var constants = require('@tradle/constants');
import LinearGradient from 'react-native-linear-gradient'
var RowMixin = require('./RowMixin');
var Accordion = require('react-native-accordion')
var extend = require('extend')
var equal = require('deep-equal')
var formDefaults = require('../data/formDefaults.json')
var TradleW = require('../img/TradleW.png')
var Actions = require('../Actions/Actions');
import { makeResponsive } from 'react-native-orient'
var StyleSheet = require('../StyleSheet')
var reactMixin = require('react-mixin');
var chatStyles = require('../styles/chatStyles')

const MY_PRODUCT = 'tradle.MyProduct'
const FORM_ERROR = 'tradle.FormError'
const FORM = 'tradle.Form'
const FORM_REQUEST = 'tradle.FormRequest'
const ENUM = 'tradle.Enum'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const PRODUCT_LIST = 'tradle.ProductList'
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'

var CURRENCY_SYMBOL
var LINK_COLOR
var STRUCTURED_MESSAGE_COLOR

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
  processColor
} from 'react-native'

import React, { Component } from 'react'

class MessageRow extends Component {
  constructor(props) {
    super(props);
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    LINK_COLOR = this.props.bankStyle.LINK_COLOR
    STRUCTURED_MESSAGE_COLOR = this.props.bankStyle.STRUCTURED_MESSAGE_COLOR
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

    var isMyMessage = this.isMyMessage();
    var to = this.props.to;
    var ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    var renderedRow = [];
    var ret = this.formatRow(isMyMessage, renderedRow);
    let onPressCall = ret ? ret.onPressCall : null
    let isConfirmation = ret ? ret.isConfirmation : null
    var isFormError = resource[constants.TYPE] === FORM_ERROR

    var photoUrls = [];
    var photoListStyle = {height: 3};
    var addStyle, inRow;

    var isProductApplication = model.id === PRODUCT_APPLICATION
    let message = isProductApplication ? ret.message : resource.message

    var noMessage = !message  ||  !message.length;
    var isSimpleMessage = resource[constants.TYPE] === constants.TYPES.SIMPLE_MESSAGE
    var isFormRequest = model.id === FORM_REQUEST
    var isForgetting = model.id === constants.TYPES.FORGET_ME || model.id === constants.TYPES.FORGOT_YOU
    if (!renderedRow.length) {
      var vCols = noMessage ? null : utils.getDisplayName(resource, model.properties);
      if (vCols)
        renderedRow = <Text style={chatStyles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else {
      var fromHash = resource.from.id;
      if (isMyMessage) {
        if (model.id === FORM_REQUEST)
          addStyle = [chatStyles.myCell, {backgroundColor: '#F1FFE7', borderColor: '#D7DACA', borderWidth: 1}]
        else if (!noMessage)
          addStyle = chatStyles.myCell
      }
      else if (isForgetting)
        addStyle = styles.forgetCell
      else {
        if (isConfirmation)
          addStyle = [chatStyles.verificationBody, {borderColor: '#cccccc', backgroundColor: this.props.bankStyle.CONFIRMATION_BG}, styles.myConfCell]
        else {
          let borderColor = isFormError ? this.props.bankStyle.REQUEST_FULFILLED : '#efefef'
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
        addStyle = [addStyle, chatStyles.verificationBody, {backgroundColor: this.props.bankStyle.FORM_ERROR_BG, borderColor: resource.documentCreated ? this.props.bankStyle.REQUEST_FULFILLED : this.props.bankStyle.FORM_ERROR_BORDER}]; //model.style];
      if (isMyMessage  &&  !isSimpleMessage && !isFormError && !model.id === FORM_REQUEST)
        addStyle = [addStyle, chatStyles.verificationBody, {backgroundColor: STRUCTURED_MESSAGE_COLOR, borderColor: '#C1E3E8'}]; //model.style];
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

        photoListStyle = {
          flexDirection: 'row',
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
          marginLeft: isMyMessage ? 30 : 45, //(hasOwnerPhoto ? 45 : 10),
          borderRadius: 10,
          marginBottom: 3,
        }
      }
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }
    var rowStyle = [chatStyles.row, {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}];
    var val = this.getTime(resource);
    var date = val
             ? <Text style={chatStyles.date} numberOfLines={1}>{val}</Text>
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
    var w = utils.dimensions(MessageRow).width
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
    let msgWidth = Math.floor(w * 0.8)
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)

    let longMessage = (isSimpleMessage || isFormRequest)  &&  message ? numberOfCharsInWidth < message.length : false
    if (showMessageBody) {
      var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
      if (message) {
        if (/*message.charAt(0) === '['  || */ longMessage)
          viewStyle.maxWidth = msgWidth; //isMyMessage || !hasOwnerPhoto ? w - 70 : w - 50;
      }
      if (!isSimpleMessage  &&  model.id !== FORM_REQUEST  &&  model.id !== PRODUCT_LIST) {
        let msgW = message.length * utils.getFontSize(12) + 40
        // if (msgW > msgWidth)
          viewStyle.maxWidth =  msgW > msgWidth ? msgWidth : msgW
      }


      if (this.props.sendStatus  &&  this.props.sendStatus !== null)
        sendStatus = this.getSendStatus()
      var sealedStatus = (resource.txId)
                       ? <View style={chatStyles.sealedStatus}>
                           <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
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
      let msgContent =  <View style={[rowStyle, viewStyle]}>
                          <View style={{marginTop: 2}}>
                          {ownerPhoto}
                          </View>
                          <View style={cellStyle}>
                            <View style={styles.container}>
                            {this.isShared()
                              ? <View style={[chatStyles.verifiedHeader, {backgroundColor: this.props.bankStyle.SHARED_WITH_BG}]}>
                                  <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
                                </View>
                              : <View />
                            }
                            {renderedRow}
                           </View>
                           {sealedStatus}
                          </View>
                        </View>

      messageBody = isSimpleMessage || isProductApplication
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

    var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;
    var photoStyle = (isLicense  &&  len === 1) ? styles.bigImageH : photoStyle;
    var shareables = resource.documentCreated || model.id !== FORM_REQUEST
                   ? <View />
                   : this.showShareableResources(rowStyle, viewStyle, addStyle);
      // <View style={viewStyle} ref={resource[constants.ROOT_HASH]}>

    return (
      <View style={[viewStyle, {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR, paddingRight: isMyMessage ? 10 : 0}]}>
        {date}
        {messageBody}
        <View style={photoListStyle}>
          <PhotoList photos={photoUrls} resource={this.props.resource} style={[photoStyle, {marginTop: -5}]} navigator={this.props.navigator} numberInRow={inRow} />
        </View>
        {sendStatus}
        {shareables}
      </View>
    )
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
    let type = r[constants.TYPE] || utils.getId(r).split('_')[0]
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
  showShareableResources(rowStyle, viewStyle, addStyle) {
    if (!this.props.shareableResources) // || !this.props.resource.message)
      return <View/>;

    var resource = this.props.resource;
    // var msgParts = utils.splitMessage(resource.message);
    // // Case when the needed form was sent along with the message
    // if (msgParts.length != 2)
    //   return <View/>

    // var msgModel = utils.getModel(msgParts[1]);
    let formModel = utils.getModel(resource.form).value
    let isMultientryForm = isMultientry(resource)
    let entries = (isMultientryForm && this.props.productToForms[resource.product])
                ? this.props.productToForms[resource.product][resource.form]
                : null
    // if (!formModel)
    //   return <View/>;
    // formModel = formModel.value;
    var vtt = [];
    var cnt = 0;
    var chatOrg = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  utils.getId(this.props.to)
    let shareableResources = this.props.shareableResources.verifications
    let providers = this.props.shareableResources.providers
    for (var t in  shareableResources) {
      if (t === formModel.id) {
        var ver = shareableResources[t];
        var r = ver[0]
        var totalShareables = ver.length
        ver.forEach((r) => {
          let document = r.document
          if (entries  &&  (entries.indexOf(utils.getId(document)) !== -1  ||  entries.indexOf(r.document[constants.NONCE]) !== -1))
            return
          // if (chatOrg  &&  utils.getId(r.organization) === chatOrg) {
          //   totalShareables--
          //   return
          // }
          // if (!cnt) {x
            var vModel = utils.getModel(r[constants.TYPE]);
            var doc = this.formatDocument({
              model: formModel,
              verification: r,
              isAccordion: totalShareables > 1,
              providers: providers  &&  providers[document[constants.ROOT_HASH]]
            })
            if (cnt) {
              doc = <View key={this.getNextKey()}>
                      <View style={{height: 1, backgroundColor: '#dddddd'}} />
                      {doc}
                    </View>
            }
          // }
          vtt.push(doc);
          cnt++;
        })
      }
    }
    if (!vtt.length)
      return <View />;

    var modelTitle = translate(formModel)
    var idx = modelTitle.indexOf('Verification');
    var docType;
    if (idx === -1)
      docType = modelTitle;
    else
      docType = modelTitle.substring(0, idx) + (modelTitle.length === idx + 12 ? '' : modelTitle.substring(idx + 12))

    let org = this.props.to.organization ? (this.props.to.organization.title + '.') : this.props.to.name;
    let msg = (vtt.length === 1)
            ? (formModel.subClassOf === MY_PRODUCT
                ? translate('shareMyProduct', translate(formModel), org)
                : translate('shareOne', utils.getMe().firstName, docType, org)
              )
            : translate('shareOneOfMany', utils.getMe().firstName, docType, org)

    let w = utils.dimensions(MessageRow).width * 0.8
    return (
      <View style={[rowStyle, viewStyle, {width: w}]} key={this.getNextKey()}>
        <View style={{width: 40}}/>
        <View style={[addStyle ? [chatStyles.textContainer, addStyle] : chatStyles.textContainer]}>
          <View style={{flex: 1}}>
            <View style={styles.assistentBox}>
              <Text style={styles.assistentText}>{msg}</Text>
            </View>
            <View style={{marginHorizontal: -7}}>
            {vtt}
            </View>
         </View>
        </View>
      </View>
     );
  }
  onPress(event) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: this.props.resource.message}
    });
  }
  createNewResource(model, isMyMessage) {
    var resource = {
      'from': this.props.resource.to,
      'to': this.props.resource.from,
    }
    if (this.props.resource[constants.TYPE] !== FORM_REQUEST)
      resource.message = this.props.resource.message;
    resource[constants.TYPE] = model.id;

    // Prefill for testing and demoing
    var isPrefilled = ENV.prefillWithTestData && model.id in formDefaults
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

    if (model.id === PRODUCT_APPLICATION) {
      let msgModel = utils.getModel(resource.product).value
      let str = !this.props.navigator.isConnected  &&  this.props.isLast
              ? translate('noConnectionForNewProduct', utils.getMe().firstName, translate(msgModel))
              : translate('newProductMsg', translate(msgModel))
      let color = isMyMessage ? '#ffffff' : '#757575'
      let msg = !this.props.navigator.isConnected  &&  this.props.isLast
              ? <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, {color: color}]}>{str}</Text>
                </View>
              : <View key={this.getNextKey()} style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Text style={[styles.resourceTitle, {color: color, marginTop: 3, paddingRight: 20}]}>{str}</Text>
                  <Icon name='ios-folder-open-outline' size={25} color={color}/>
                </View>
      renderedRow.push(msg);
      return ({message: str})
    }
    var isProductList = model.id === constants.TYPES.PRODUCT_LIST
    if (isProductList) {
      // Case when the needed form was sent along with the message
      if (resource.welcome) {
        let msg = <View key={this.getNextKey()}>
                <Text style={styles.resourceTitle}>{translate('hello', utils.getMe().firstName)}</Text>
                <View style={styles.rowContainer}>
                  <Text style={[styles.resourceTitle, {color: LINK_COLOR}]}>{translate('listOfProducts')} </Text>
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
                  <View style={styles.rowContainer}>
                    <Text style={[styles.resourceTitle, {paddingRight: 20, color: isMyMessage ? '#ffffff' : '#757575', fontStyle: isCustomerWaiting ? 'italic' : 'normal'}]}>{resource.message}</Text>
                    <Icon style={{color: LINK_COLOR, backgroundColor: 'transparent',  paddingLeft: 5}} size={20} name={'ios-person'} />
                  </View>
                </View>
      renderedRow.push(msg);
      return null
      // return {onPressCall: this.addContact.bind(this)}
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
    if (model.id === FORM_REQUEST) {
      if (!resource.product  || utils.getModel(resource.product).value.subClassOf !== MY_PRODUCT)
        return {onPressCall: this.formRequest(resource, renderedRow)}
      else
        return
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
    var cnt = 0;
    var isConfirmation
    var self = this

    var vCols = [];

    let isReadOnly = utils.isReadOnlyChat(resource, this.props.context) //this.props.context  &&  this.props.context._readOnly
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;

      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(self.getPropRow(properties[v], resource, resource[v].title || resource[v]))
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
        onPressCall = self.onPress.bind(self);
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1} key={self.getNextKey()}>{resource[v]}</Text>);
      }
      else if (isFormError) {
        let rtype = (resource.prefill[constants.TYPE]) ? resource.prefill[constants.TYPE] : utils.getId(resource.prefill).split('_')[0]
        let iconName = resource.documentCreated ? 'ios-done-all' : 'ios-information-circle-outline'
        let iconSize = 30
        vCols.push(
          <View key={self.getNextKey()}>
            <Text style={[style, {color: '#757575'}]}>{isMyMessage ? translate('errorNotification') : resource[v]} </Text>
            <Text style={[style, {color: resource.documentCreated || isReadOnly ?  '#757575' : self.props.bankStyle.FORM_ERROR_COLOR}]}>{translate(utils.getModel(rtype).value)}</Text>
            <Icon name={iconName} size={iconSize} color={resource.documentCreated || isReadOnly ? self.props.bankStyle.REQUEST_FULFILLED : self.props.bankStyle.FORM_ERROR_COLOR} style={styles.errorBadge} />
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
            msg = <View key={self.getNextKey()}>
                    <Text style={style}>{msgParts[0]}</Text>
                    <View style={chatStyles.rowContainer}>
                      <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : isMyMessage ? self.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]}>{msgParts[1]} </Text>
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
            if (self.props.shareableResources  &&  !isSimpleMessage)
              style = /*isSimpleMessage ? chatStyles.resourceTitle : */chatStyles.description;
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
                    ? {color: self.props.bankStyle.MY_MESSAGE_LINK_COLOR} //{color: STRUCTURED_MESSAGE_COLOR}
                    : {color: '#2892C6'}
              if (isMyMessage)
                link = <Text style={[style, color]}>{translate(msgModel)}</Text>
              else
                link = <View style={chatStyles.rowContainer}>
                           <Text style={[style, {color: resource.documentCreated ?  '#757575' : LINK_COLOR}]}>{translate(msgModel)}</Text>
                           <Icon style={[{marginTop: 2}, resource.documentCreated || isReadOnly ? styles.linkIconGreyed : {color: isMyMessage ? self.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
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
        else
          isConfirmation = resource[v].indexOf('Congratulations!') !== -1

        if (isConfirmation) {
          style = [style, {color: self.props.bankStyle.CONFIRMATION_COLOR}, chatStyles.resourceTitle]
          vCols.push(
            <View key={self.getNextKey()}>
              <Text style={[style]}>{resource[v]}</Text>
              <Icon style={[{color: self.props.bankStyle.CONFIRMATION_COLOR, alignSelf: 'flex-end', width: 50, height: 50, marginTop: -30, opacity: 0.2}]} size={50} name={'ios-flower'} />
              <Icon style={{color: self.props.bankStyle.CONFIRMATION_COLOR, alignSelf: 'flex-end', marginTop: -10}} size={30} name={'ios-done-all'} />
            </View>
          );

        }
        else
          vCols.push(<Text style={style} key={self.getNextKey()}>{resource[v]}</Text>);
      }
      first = false;

    });
    if (!isSimpleMessage  &&  !isFormError  &&  !isMyProduct)  {
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
    if (isReadOnly)
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

  formRequest(resource, vCols) {
    let form = utils.getModel(resource.form).value

    // if (this.props.shareableResources)
    //   style = styles.description;
    let message = resource.message
    let onPressCall
    // if (s.length === 2)
    //   onPressCall = this.editForm.bind(self, msgParts[1], msgParts[0])
    let sameFormRequestForm
    if (!resource.documentCreated  &&  resource.product  &&  form.subClassOf !== MY_PRODUCT) {
      let multiEntryForms = utils.getModel(resource.product).value.multiEntryForms
      if (multiEntryForms  &&  multiEntryForms.indexOf(form.id) !== -1) {
        let productToForms = this.props.productToForms
        if (productToForms) {
          let product = productToForms[resource.product]
          if (product) {
            let formsArray = product[resource.form]
            if (formsArray)
              sameFormRequestForm = true
          }
          // onPressCall = this.getNextFormAlert.bind(this)
        }
      }
      if (!sameFormRequestForm)
        onPressCall = this.createNewResource.bind(this, form, isMyMessage);
    }
    var isMyMessage = this.isMyMessage();

    let color = isMyMessage
              ? {color: '#AFBBA8'} //{color: STRUCTURED_MESSAGE_COLOR}
              : {color: '#2892C6'}
    let link
    let isReadOnly = utils.isReadOnlyChat(this.props.resource, this.props.context) //this.props.context  &&  this.props.context._readOnly
    if (sameFormRequestForm  &&  !resource.documentCreated) {
       // let isReadOnly = utils.isReadOnlyChat(this.props.resource) // this.props.context  &&  this.props.context._readOnly

       link = <View style={[styles.rowContainer, {paddingVertical: 10, alignSelf: 'center'}]}>
               <View style={styles.textContainer}>
               <TouchableHighlight underlayColor='transparent' style={{paddingRight: 15}} onPress={() => {
                 this.createNewResource(form, isMyMessage)
               }}>
                 <View style={styles.multiEntryButton}>
                   <Text style={styles.resourceTitle}>   {translate('addSameForm')}   </Text>
                 </View>
               </TouchableHighlight>
               <TouchableHighlight underlayColor='transparent' onPress={() => {
                  Alert.alert(
                    translate('areYouSureAboutNextForm', translate(form)),
                    null,
                    [
                      {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                      {text: translate('Ok'), onPress: () => {
                        Actions.addMessage({
                          from: resource.to,
                          to: resource.from,
                          _context: this.props.context,
                          [constants.TYPE]: NEXT_FORM_REQUEST,
                          after: form.id
                        })
                        var params = {
                          value: {documentCreated: true},
                          resource: resource,
                          meta: utils.getModel(resource[constants.TYPE]).value
                        }
                        Actions.addItem(params)
                       }},
                    ]
                  )
               }}>
                 <View style={styles.multiEntryButton}>
                   <Text style={styles.resourceTitle}>   {translate('getNextForm')}   </Text>
                 </View>
              </TouchableHighlight>
              </View>
             </View>
    }
    else if (isMyMessage)
      link = <Text style={[chatStyles.resourceTitle, color]}>{translate(form)}</Text>
    else {
      let notLink = resource.documentCreated  ||  isReadOnly  ||  form.subClassOf === MY_PRODUCT
      link = <View style={styles.rowContainer}>
               <Text style={[styles.resourceTitle, {color: resource.documentCreated  ||  notLink ?  '#757575' : LINK_COLOR}]}>{translate(form)}</Text>
               <Icon style={[{marginTop: 2, paddingLeft: 100}, resource.documentCreated  ? styles.linkIconGreyed : {color: isMyMessage ? this.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
             </View>
      onPressCall = notLink
                  ? null
                  : resource.verifiers
                     ? this.props.chooseTrustedProvider.bind(this, this.props.resource, form, isMyMessage)
                     : this.createNewResource.bind(this, form, isMyMessage)
    }
    let strName = sameFormRequestForm ? translate('addAnotherFormOrGetNext', translate(form)) : utils.getStringName(message)
    let str = strName ? utils.translate(strName) : message
    let msg = <View key={this.getNextKey()}>
               <Text style={chatStyles.resourceTitle}>{str}</Text>
               {link}
             </View>
    vCols.push(msg);
    return isReadOnly ? null : onPressCall
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

function isMultientry(resource) {
  if (!resource.product)
    return false
  let form = utils.getModel(resource.form).value
  let product = utils.getModel(resource.product).value
  let multiEntryForms = product.multiEntryForms
  return  multiEntryForms && multiEntryForms.indexOf(form.id) !== -1 ? true : false
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  resourceTitle: {
    fontSize: 18,
  },
  date: {
    flex: 1,
    color: '#999999',
    fontSize:  14,
    alignSelf: 'center',
    paddingTop: 10
  },
  row: {
    // alignItems: 'center',
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
  },
  myCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
    borderTopRightRadius: 0,
    backgroundColor: '#77ADFC' //#569bff',
  },
  // resourceTitle: {
  //   // flex: 1,
  //   fontSize: 18,
  //   // fontWeight: '400',
  //   // marginBottom: 2,
  // },
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
  bigImageH: {
    width: 270,
    height: 200,
    margin: 1,
    borderRadius: 10
  },
  linkIconGreyed: {
    color: '#cccccc'
  },
  assistentText: {
    color: '#757575',
    fontStyle: 'italic',
    flexWrap: 'wrap',
    fontSize: 17
  },
  assistentBox: {
    backgroundColor: '#efefef',
    paddingVertical: 5,
    // borderRadius: 5,
    borderTopRightRadius: 10,
    paddingHorizontal: 7,
    marginTop: -7,
    marginHorizontal: -7
  },
  errorBadge: {
    position: 'absolute',
    opacity: 0.5,
    bottom: -5,
    right: 0
  },
  multiEntryButton:  {
    borderRadius: 10,
    borderColor: '#77ADFC',
    borderWidth: 1,
    padding: 10
  },
  msgImage: {
    height: 30,
    marginRight: 3,
    marginLeft: 0,
    width: 30,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  multiEntryText: {
    fontSize: 18
  },
  // msgImage: {
  //   height: 30,
  //   marginRight: 3,
  //   marginLeft: 0,
  //   width: 30,
  //   borderRadius: 15,
  //   borderColor: '#cccccc',
  //   borderWidth: 1
  // },
  productAppIcon: {
    alignSelf: 'flex-end',
    marginTop: -30,
    backgroundColor: 'transparent'
  },
  white18: {
    color: '#ffffff',
    fontSize: 18
  },
});
reactMixin(MessageRow.prototype, RowMixin);
MessageRow = makeResponsive(MessageRow)

module.exports = MessageRow;
