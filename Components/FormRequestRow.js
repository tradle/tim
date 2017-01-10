'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var NewResource = require('./NewResource');
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin');
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
const FORM = 'tradle.Form'
const FORM_REQUEST = 'tradle.FormRequest'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'

var LINK_COLOR

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

class FormRequestRow extends Component {
  constructor(props) {
    super(props);
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    LINK_COLOR = this.props.bankStyle.LINK_COLOR
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !equal(this.props.resource, nextProps.resource)   ||
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
    let onPressCall = this.formRequest(resource, renderedRow)


    var fromHash = resource.from.id;
    let borderColor = '#efefef'
    let mstyle = {
      borderColor: borderColor,
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 0
    }
    let message = resource.message

    var rowStyle = [chatStyles.row, {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}];
    var val = this.getTime(resource);
    var date = val
             ? <Text style={chatStyles.date} numberOfLines={1}>{val}</Text>
             : <View />;

    var sendStatus = <View />
    // HACK that solves the case when the message is short and we don't want it to be displayed
    // in a bigger than needed bubble
    let parts = utils.splitMessage(message)
    if (parts.length == 2)
      message = parts[0].length > parts[1].length ? parts[0] : parts[1]
    else
      message = parts[0]
    let strName = utils.getStringName(message)
    if (strName)
      message = translate(strName)
    let formTitle = translate(resource.form)
    if (formTitle.length > message.length)
      message = formTitle
    // HACK
    var w = utils.dimensions(FormRequestRow).width
    let msgWidth = w * 0.8
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)

    var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
    if (message) {
      if (message.charAt(0) === '[')
        viewStyle.width = msgWidth; //isMyMessage || !hasOwnerPhoto ? w - 70 : w - 50;
    }
    viewStyle.width =  Math.min(msgWidth, message.length * utils.getFontSize(18) + 40)


    if (this.props.sendStatus  &&  this.props.sendStatus !== null)
      sendStatus = this.getSendStatus()
    var sealedStatus = (resource.txId)
                     ? <View style={chatStyles.sealedStatus}>
                         <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                       </View>
                     : <View />

    let addStyle = message.length < 30
                 ? [chatStyles.verificationBody, mstyle]
                 : [chatStyles.verificationBody, {flex: 1}, mstyle]
    let cellStyle
    if (addStyle)
      cellStyle = [chatStyles.textContainer, addStyle]
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

    let messageBody = <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
                        {msgContent}
                      </TouchableHighlight>

    var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var shareables = resource.documentCreated
                   ? <View />
                   : this.showShareableResources(rowStyle, viewStyle, addStyle);

    return (
      <View style={[viewStyle, {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}]}>
        {date}
        {messageBody}
        {sendStatus}
        {shareables}
      </View>
    )
  }
  showShareableResources(rowStyle, viewStyle, addStyle) {
    if (!this.props.shareableResources) // || !this.props.resource.message)
      return <View/>;

    var resource = this.props.resource;
    let formModel = utils.getModel(resource.form).value
    let isMultientryForm = isMultientry(resource)
    let entries = (isMultientryForm && this.props.productToForms[resource.product])
                ? this.props.productToForms[resource.product][resource.form]
                : null
    var vtt = [];
    var cnt = 0;
    var chatOrg = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  utils.getId(this.props.to)
    let shareableResources = this.props.shareableResources.verifications
    let providers = this.props.shareableResources.providers
    for (var t in  shareableResources) {
      if (t !== formModel.id)
        continue
      var ver = shareableResources[t];
      var r = ver[0]
      var totalShareables = ver.length
      ver.forEach((r) => {
        let document = r.document
        if (entries  &&  (entries.indexOf(utils.getId(document)) !== -1  ||  entries.indexOf(r.document[constants.NONCE]) !== -1))
          return
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
        vtt.push(doc);
        cnt++;
      })
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

    let w = utils.dimensions(FormRequestRow).width * 0.8
    let space = Platform.OS === 'android' ? {width: 40} : {width: 0}
    return (
      <View style={[rowStyle, viewStyle, {width: w}]} key={this.getNextKey()}>
        <View style={space}/>
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
  createNewResource(model, isMyMessage) {
    var resource = {
      'from': this.props.resource.to,
      'to': this.props.resource.from,
      _context: this.props.context
    }
    // if (this.props.resource[constants.TYPE] !== FORM_REQUEST)
    //   resource.message = this.props.resource.message;
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
              ? {color: '#AFBBA8'}
              : {color: '#2892C6'}
    let link
    let isReadOnly = utils.isReadOnlyChat(this.props.resource, this.props.context) //this.props.context  &&  this.props.context._readOnly
    let self = this
    if (sameFormRequestForm  &&  !resource.documentCreated) {
       link = <View style={[chatStyles.rowContainer, {paddingVertical: 10, alignSelf: 'center'}]}>
               <View style={chatStyles.textContainer}>
               <TouchableHighlight underlayColor='transparent' style={{paddingRight: 15}} onPress={() => {
                 this.createNewResource(form, isMyMessage)
               }}>
                 <View style={styles.multiEntryButton}>
                   <Text style={styles.multiEntryText}>   {translate('addSameForm')}   </Text>
                 </View>
               </TouchableHighlight>
               <TouchableHighlight underlayColor='transparent' onPress={() => {
                  Alert.alert(
                    translate('areYouSureAboutNextForm', translate(form)),
                    null,
                    [
                      {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                      {text: translate('Ok'), onPress: onOK.bind(this)},
                    ]
                  )
               }}>
                 <View style={styles.multiEntryButton}>
                   <Text style={styles.multiEntryText}>   {translate('getNextForm')}   </Text>
                 </View>
              </TouchableHighlight>
              </View>
             </View>

    }
    else if (isMyMessage)
      link = <Text style={[chatStyles.resourceTitle, color]}>{translate(form)}</Text>
    else {
      let notLink = resource.documentCreated  ||  isReadOnly  ||  form.subClassOf === MY_PRODUCT
      link = <View style={chatStyles.rowContainer}>
                   <Text style={[chatStyles.resourceTitle, {color: resource.documentCreated  ||  notLink ?  '#757575' : resource.verifiers ? 'green' : LINK_COLOR}]}>{translate(form)}</Text>
                   <Icon style={[{marginTop: 2}, resource.documentCreated  ? chatStyles.linkIconGreyed : {color: isMyMessage ? this.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
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
    function onOK() {
      Actions.addMessage({msg: {
        from: resource.to,
        to: resource.from,
        _context: self.props.context,
        [constants.TYPE]: NEXT_FORM_REQUEST,
        after: form.id
      }})
      var params = {
        value: {documentCreated: true},
        doneWithMultiEntry: true,
        resource: resource,
        meta: utils.getModel(resource[constants.TYPE]).value
      }
      Actions.addItem(params)
    }
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
  assistentText: {
    color: '#757575',
    fontStyle: 'italic',
    fontSize: 17
  },
  assistentBox: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 5,
    // borderRadius: 5,
    borderTopRightRadius: 10,
    paddingHorizontal: 7,
    marginTop: -7,
    marginHorizontal: -7
  },
  multiEntryButton:  {
    borderRadius: 10,
    borderColor: '#77ADFC',
    borderWidth: 1,
    padding: 10
  },
  multiEntryText: {
    fontSize: 18
  },
  white18: {
    color: '#ffffff',
    fontSize: 18
  },
});
reactMixin(FormRequestRow.prototype, RowMixin);
FormRequestRow = makeResponsive(FormRequestRow)

module.exports = FormRequestRow;
