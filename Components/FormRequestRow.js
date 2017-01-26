'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var NewResource = require('./NewResource');
var RemediationItemsList = require('./RemediationItemsList')
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin');
import CustomIcon from '../styles/customicons'
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
const CONFIRM_PACKAGE_REQUEST = 'tradle.ConfirmPackageRequest'
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

    let message = resource.message
    var renderedRow = [];
    let onPressCall
    let isFormRequest = resource[constants.TYPE] === FORM_REQUEST
    if (isFormRequest)
      onPressCall = this.formRequest(resource, renderedRow)
    else {
      onPressCall = resource.documentCreated ? null : this.reviewFormsInContext.bind(this)
      let idx = message.indexOf('...') + 3
      let icon = <Icon style={{marginTop: 2, marginRight: 2, color: isMyMessage ? this.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}} size={20} name={'ios-arrow-forward'} />
      let msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, resource.documentCreated ? {color: '#aaaaaa'} : {}]}>{message.substring(0, idx)}</Text>
                  <View style={chatStyles.rowContainer}>
                    <Text style={[chatStyles.resourceTitle, resource.documentCreated ? {color: '#757575'} : {color: LINK_COLOR}]}>{message.substring(idx).trim()}</Text>
                    {resource.documentCreated  ? null : icon}
                  </View>
                </View>

      renderedRow.push(msg)
    }
    var fromHash = resource.from.id;
    let mstyle = {
      borderColor: 'transparent',
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 0
    }

    var rowStyle = [chatStyles.row, {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}];
    var val = this.getTime(resource);
    var date = val
             ? <Text style={chatStyles.date}>{val}</Text>
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
    let formTitle = isFormRequest ? translate(resource.form) : 'Forms'
    if (formTitle.length > message.length)
      message = formTitle
    // HACK
    var w = utils.dimensions(FormRequestRow).width
    let msgWidth = Math.floor(w * 0.7)
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)

    var viewStyle = {flexDirection: 'row', borderTopRightRadius: 10, alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
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
    var mainStyle = { margin:1, backgroundColor: '#ffffff' }
    var shareables = !isFormRequest  || resource.documentCreated
                   ? null
                   : this.showShareableResources(rowStyle, mainStyle, viewStyle.width);

    let cellStyle
    if (addStyle)
      cellStyle = [chatStyles.textContainer, addStyle]
    else
      cellStyle = chatStyles.textContainer
    let msgContent =  <View style={[rowStyle, viewStyle, shareables ? {backgroundColor: '#ffffff'} : {}]}>
                        <View style={{marginTop: 2}}>
                        {ownerPhoto}
                        </View>
                        <View style={[cellStyle, shareables ? styles.shareables : {}]}>
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
    return (
      <View style={[mainStyle, {margin:2, paddingVertical: 3, backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}]}>
        {date}
        <View style={shareables ? {borderWidth: 1, width: viewStyle.width + 2, borderColor: this.props.bankStyle.VERIFIED_HEADER_COLOR, borderRadius: 10, borderTopLeftRadius: 0} : {}}>
          {messageBody}
          {sendStatus}
          {shareables}
        </View>
      </View>
    )
    // return (
    //   <View style={[mainStyle, {margin:2, paddingVertical: 3, backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}]}>
    //     {date}
    //     <View style={shareables ? {borderWidth: 1, width: msgWidth + 2, borderColor: this.props.bankStyle.VERIFIED_HEADER_COLOR, borderRadius: 10, borderTopLeftRadius: 0} : {}}>
    //       {messageBody}
    //       {sendStatus}
    //       {shareables}
    //     </View>
    //   </View>
    // )
  }
  showShareableResources(rowStyle, viewStyle, width) {
    if (!this.props.shareableResources) // || !this.props.resource.message)
      return null

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
        var doc = this.formatShareables({
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
      return null

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

    let color = this.props.bankStyle.VERIFIED_HEADER_COLOR
    return (
      <View style={[rowStyle, viewStyle, {marginTop: -10, width: width, backgroundColor: this.props.bankStyle.VERIFIED_BG, borderBottomLeftRadius: 10, borderBottomRightRadius: 10}]} key={this.getNextKey()}>
        <View style={{flex:1}}>
          <View style={[styles.assistentBox, {backgroundColor: color}]}>
            <Text style={styles.orText}>{'OR'}</Text>
          </View>
          <View style={styles.shareablesList}>
            {vtt}
          </View>
        </View>
      </View>
     );
  }
  formatShareables(params) {
    let model = params.model
    let verification = params.verification
    let onPress = params.onPress
    let isAccordion = false //params.isAccordion
    let providers = params.providers  // providers the document was shared with

    var document = verification.document

    var docModel = utils.getModel(document[constants.TYPE]).value;
    var isMyProduct = docModel.subClassOf === MY_PRODUCT
    var docModelTitle = docModel.title || utils.makeLabel(docModel.id)
    var idx = docModelTitle.indexOf('Verification');
    var docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    var msg;
    if (document.message  &&  docModel.subClassOf !== FORM)
      msg = <View><Text style={chatStyles.description}>{document.message}</Text></View>
    else
      msg = <View/>
    var headerStyle = {paddingTop: 5, paddingLeft: 10}
    var isShared = this.isShared(verification)
    let addStyle = {}//onPress ? {} : {borderBottomColor: '#efefef', borderBottomWidth: 1}

    let hs = /*isShared ? chatStyles.description :*/ [styles.header, {fontSize: 16}]
    let arrow = <Icon color={this.props.bankStyle.VERIFIED_HEADER_COLOR} size={20} name={'ios-arrow-forward'} style={{marginRight: 10, marginTop: 5}}/>
    var headerContent =  <View style={headerStyle}>
                          <Text style={[hs, {color: '#555555'}]}>{utils.getDisplayName(document)}</Text>
                        </View>

    let header = <View style={[addStyle, styles.header]}>
                   {headerContent}
                   {arrow}
                 </View>
   if (!isAccordion)
      header = <TouchableHighlight underlayColor='transparent' onPress={this.props.onSelect.bind(this, document, verification)}>
                 {header}
               </TouchableHighlight>


    var orgRow = <View/>
    if (verification  && verification.organization) {
      var orgPhoto = verification.organization.photo
                   ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={[styles.orgImage, {marginTop: -5}]} />
                   : <View />
      var shareView = <View style={[chatStyles.shareButton, {marginHorizontal: 0, backgroundColor: this.props.bankStyle.SHARE_BUTTON_BACKGROUND_COLOR, opacity: this.props.resource.documentCreated ? 0.3 : 1}]}>
                        <CustomIcon name='tradle' style={{color: '#ffffff' }} size={32} />
                        <Text style={chatStyles.shareText}>{translate('Share')}</Text>
                      </View>
      var orgTitle = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION
                   ? this.props.to.name
                   : (this.props.to.organization ? this.props.to.organization.title : null);
      // let o = verification.organization.title.length < 25 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'
      let verifiedBy
      // Not verified Form - still shareable
      if (verification[constants.ROOT_HASH]) {
        let orgs
        if (providers) {
          providers.forEach((p) => {
            if (!orgs)
              orgs = p.title
            else
              orgs += ', ' + p.title
          })
        }
        else
          orgs = verification.organization.title
        verifiedBy = translate('verifiedBy', orgs)
      }
      else
        verifiedBy = translate('sentTo', verification.organization.title)

      var orgView = <View style={styles.orgView}>
                      <Text style={[chatStyles.description, {paddingRight: 5}]}>
                        {verifiedBy}
                      </Text>
                        {verification.dateVerified
                          ? <View style={{flexDirection: 'row'}}>
                              <Text style={{fontSize: 12, color: '#757575', fontStyle: 'italic'}}>{utils.formatDate(verification.dateVerified)}</Text>
                            </View>
                          : <View/>
                        }
                      </View>
      if (onPress) {
      }
      else if (this.props.resource.documentCreated) {
        orgRow =  <View style={chatStyles.shareView}>
                    {shareView}
                    <TouchableHighlight onPress={this.props.onSelect.bind(this, document, verification)} underlayColor='transparent'>
                      {orgView}
                    </TouchableHighlight>
                  </View>
      }
      else {
        orgRow = <View style={[chatStyles.shareView]}>
                   <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
                            Alert.alert(
                              'Sharing ' + docTitle + ' ' + verifiedBy,
                              'with ' + orgTitle,
                              [
                                {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                                {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
                              ]
                          )}>
                    {shareView}
                   </TouchableHighlight>
                   <TouchableHighlight onPress={this.props.onSelect.bind(this, document, verification)} underlayColor='transparent'>
                     {orgView}
                   </TouchableHighlight>
                </View>
      }
    }
    let content = <View style={{flex:1, paddingVertical: 3}}>
                     <TouchableHighlight onPress={this.props.onSelect.bind(this, document, verification)} underlayColor='transparent'>
                       {msg}
                     </TouchableHighlight>
                     {orgRow}
                   </View>

    // var verifiedBy = verification && verification.organization ? verification.organization.title : ''
    return isAccordion
        ? ( <View style={{marginTop: 5}} key={this.getNextKey()}>
             <Accordion
               header={header}
               style={{padding: 5}}
               content={content}
               underlayColor='transparent'
               easing='easeOutCirc' />
            </View>
          )
        : ( <View style={{flex: 1}} key={this.getNextKey()}>
               {header}
               {content}
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
               <View style={[chatStyles.textContainer, {justifyContent: 'center'}]}>
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
      let icon = <Icon  name={'ios-arrow-forward'} style={{marginTop: 2, marginRight: 2, color: isMyMessage ? this.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}} size={20} />
      link = <View style={chatStyles.rowContainer}>
                   <Text style={[chatStyles.resourceTitle, {color: resource.documentCreated  ||  notLink ?  '#757575' : resource.verifiers ? 'green' : LINK_COLOR}]}>{translate(form)}</Text>
                   {resource.documentCreated ? null : icon}
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
               <Text style={[chatStyles.resourceTitle, resource.documentCreated ? {color: '#aaaaaa'} : {}]}>{str}</Text>
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
  reviewFormsInContext() {
    this.props.navigator.push({
      id: 29,
      title: translate("importData"),
      backButtonTitle: 'Back',
      component: RemediationItemsList,
      rightButtonTitle: 'Done',
      passProps: {
        modelName: CONFIRM_PACKAGE_REQUEST,
        resource: this.props.resource,
        bankStyle: this.props.bankStyle,
        reviewed: {},
        to: this.props.to,
        list: this.props.resource.items,
        currency: this.props.currency
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
  assistentText: {
    color: '#757575',
    fontStyle: 'italic',
    fontSize: 17
  },
  assistentBox: {
    backgroundColor: 'transparent',
    // marginTop: -8,
    justifyContent: 'center',
    width: 36,
    height: 36,
    marginTop: 0,
    alignSelf: 'center',
    borderRadius: 18
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
  header: {
    marginRight: -4,
    marginLeft: -1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  shareables: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#ffffff'
  },
  shareablesList: {
    marginHorizontal: 0,
    paddingRight: 3
  },
  orgView: {
    maxWidth: 0.7 * utils.dimensions().width - 150,
    paddingLeft: 3,
    marginRight: 10,
    flex: 1,
    justifyContent: 'center'
  },
  orText: {
    fontStyle: 'italic',
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 18,
  }
});
reactMixin(FormRequestRow.prototype, RowMixin);
FormRequestRow = makeResponsive(FormRequestRow)

module.exports = FormRequestRow;
