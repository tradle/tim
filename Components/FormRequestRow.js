'use strict';

const debug = require('debug')('tradle:app:FormRequestRow')
var utils = require('../utils/utils');
var translate = utils.translate
var NewResource = require('./NewResource');
var RemediationItemsList = require('./RemediationItemsList')
import Icon from 'react-native-vector-icons/Ionicons';
var constants = require('@tradle/constants');
var ResourceList = require('./ResourceList')
var RowMixin = require('./RowMixin');
var CameraView = require('./CameraView')
import ImageInput from './ImageInput'

import CustomIcon from '../styles/customicons'
var extend = require('extend')
var equal = require('deep-equal')
var formDefaults = require('../data/formDefaults.json')
var TradleW = require('../img/TradleW.png')
var Actions = require('../Actions/Actions');
var StyleSheet = require('../StyleSheet')
var reactMixin = require('react-mixin');

var chatStyles = require('../styles/chatStyles')

const TYPE = constants.TYPE
const MY_PRODUCT = 'tradle.MyProduct'
const FORM = 'tradle.Form'
const PHOTO = 'tradle.Photo'
const ENUM = 'tradle.Enum'
const FORM_REQUEST = 'tradle.FormRequest'
const CONFIRM_PACKAGE_REQUEST = 'tradle.ConfirmPackageRequest'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const ITEM = 'tradle.Item'
const IPROOV_SELFIE = 'tradle.IProovSelfie'

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
  // Animated,
  // Easing,
  processColor
} from 'react-native'

import React, { Component } from 'react'

import ENV from '../utils/env'

class FormRequestRow extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    LINK_COLOR = this.props.bankStyle.linkColor
  }
  // componentWillMount() {
  //   this.animatedValue = new Animated.Value(60)
  // }
  // componentDidMount() {
  //   Animated.timing(this.animatedValue, {
  //     toValue: 35,
  //     duration: 500,
  //     easing: Easing.in(Easing.easy)
  //   }).start()
  // }
  shouldComponentUpdate(nextProps, nextState) {
    let {resource, to, orientation} = this.props
    if (this.props.sendStatus !== nextProps.sendStatus)
      return true
    let rid = utils.getId(resource)
    if (resource._documentCreated !== nextProps.resource._documentCreated ||
        resource._sendStatus !== nextProps.resource._sendStatus)
      return true
    // if (nextProps.addedItem  &&  utils.getId(nextProps.addedItem) === rid) {
    //   // HACK for when the form status that is fulfilling this request changes the rendering uses
    //   // the old list for that
    //   if (nextProps.addedItem._documentCreated  &&  !nextProps.resource._documentCreated)
    //     return false
    //   return true
    // }
    if (rid !== utils.getId(nextProps.resource) ||  //!equal(resource, nextProps.resource)    ||
        !equal(to, nextProps.to)                ||
        utils.resized(this.props, nextProps))
      return true
    return false
  }
  render() {
    let resource = this.props.resource;
    let model = utils.getModel(resource[TYPE] || resource.id).value;

    let me = utils.getMe();

    let isMyMessage = this.isMyMessage();
    let to = this.props.to;
    let ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    let message = resource.message
    let renderedRow = [];

    let onPressCall
    let isFormRequest = resource[TYPE] === FORM_REQUEST
    let prop =  this.isOnePropForm()
    let bankStyle = this.props.bankStyle
    var w = utils.dimensions(FormRequestRow).width
    let msgWidth = utils.getMessageWidth(FormRequestRow)
    if (isFormRequest)
      onPressCall = this.formRequest(resource, renderedRow, prop)
    else {
      onPressCall = resource._documentCreated ? null : this.reviewFormsInContext.bind(this)
      let icon = <Icon style={{marginTop: 2, marginRight: 2, color: isMyMessage ? bankStyle.myMessageLinkColor : LINK_COLOR}} size={20} name={'ios-arrow-forward'} />
      let msg = utils.parseMessage(resource, message, bankStyle)
      if (typeof msg === 'string') {
        let idx = message.indexOf('...')
        if (idx !== -1)
          idx += 3
        else
          idx = 0
        msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{message.substring(0, idx)}</Text>
                  <View style={chatStyles.rowContainer}>
                    <Text style={[chatStyles.resourceTitle, {width: msgWidth - 25}, resource._documentCreated || !idx ? {color: '#757575'} : {color: LINK_COLOR}]}>{message.substring(idx).trim()}</Text>
                    {resource._documentCreated  ? null : icon}
                  </View>
                </View>
      }
      else
        msg = <View style={chatStyles.rowContainer} key={this.getNextKey()}>
                <View style={{flex: 1}}>
                  {msg}
                </View>
                {resource._documentCreated  ? null : icon}
              </View>
      renderedRow.push(msg)
    }
    let fromHash = resource.from.id;
    let mstyle = {
      borderColor: 'transparent',
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 0
    }

    var rowStyle = [chatStyles.row];
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
    var w = utils.dimensions(FormRequestRow).width
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)

    var viewStyle = {flexDirection: 'row', borderTopRightRadius: 10, alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
    if (message) {
      if (message.charAt(0) === '[')
        viewStyle.width = msgWidth; //isMyMessage || !hasOwnerPhoto ? w - 70 : w - 50;
    }
    viewStyle.width =  Math.min(msgWidth, message.length * utils.getFontSize(18) + 35)

    if (this.state  &&  this.state.sendStatus  &&  this.state.sendStatus !== null)
      sendStatus = this.getSendStatus()
    var sealedStatus = (resource.txId)
                     ? <View style={chatStyles.sealedStatus}>
                         <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                       </View>
                     : <View />


    let addStyle = message.length < 30
                 ? [chatStyles.verificationBody, mstyle]
                 : [chatStyles.verificationBody, {flex: 1}, mstyle]
    var mainStyle = { margin:1, backgroundColor: '#ffffff', whiteSpace: 'pre-wrap' }
    var shareables = !isFormRequest  || resource._documentCreated
                   ? null
                   : this.showShareableResources(rowStyle, mainStyle, viewStyle.width);

    let cellStyle
    if (addStyle)
      cellStyle = [chatStyles.textContainer, addStyle]
    else
      cellStyle = chatStyles.textContainer
    let share
    let msgStyle = {justifyContent: 'center'}
    // Check if it is needed
    if (!isFormRequest || resource._documentCreated)
      msgStyle.minHeight = 35
    if (this.isShared())
      share = <View style={[chatStyles.verifiedHeader, {backgroundColor: bankStyle.sharedWithBg}]}>
                <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
              </View>
    let msgContent =  <View style={[rowStyle, viewStyle, shareables ? {backgroundColor: '#ffffff', paddingBottom: 10} : {}]}>
                        <View style={{marginTop: 2}}>
                        {ownerPhoto}
                        </View>
                        <View style={[cellStyle, {backgroundColor: this.props.bankStyle.incomingMessageBgColor}, shareables ? styles.shareables : {}]}>
                          <View style={[styles.container, msgStyle]}>
                          {share}
                          {renderedRow}
                         </View>
                         {sealedStatus}
                        </View>
                      </View>

    // onPressCall = prop  &&  !prop.allowPicturesFromLibrary ? this.showCamera({prop: prop}) : onPressCall
    let messageBody
    let isMyProduct = isFormRequest  &&  utils.getModel(resource.form).value.subClassOf === MY_PRODUCT
    if (prop  ||  isMyProduct)
      messageBody = msgContent
    else
      messageBody = <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
                      {msgContent}
                    </TouchableHighlight>

    var bg = bankStyle.backgroundImagae ? 'transparent' : bankStyle.backgroundColor
    return (
      <View style={[mainStyle, {margin:2, paddingVertical: 3, backgroundColor: bg}]}>
        {date}
        <View style={shareables ? {borderWidth: 1, width: viewStyle.width + 2, borderColor: '#dddddd', backgroundColor: bankStyle.incomingMessageBgColor, borderRadius: 10, borderTopLeftRadius: 0} : {}}>
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
  chooser(prop) {
    let oResource = this.props.resource
    let model = utils.getModel(oResource.form).value
    let resource = {
      [TYPE]: model.id,
      from: utils.getMe(),
      to: oResource.from
    }
    if (oResource._context)
      resource._context = oResource._context

    var propRef = prop.ref
    var m = utils.getModel(propRef).value;
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate(prop), //m.title,
      // titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        isChooser:      true,
        prop:           prop,
        modelName:      propRef,
        resource:       resource,
        returnRoute:    currentRoutes[currentRoutes.length - 1],
        callback:       (prop, val) => {
          resource[prop.name] = utils.buildRef(val)
          Actions.addItem({resource: resource, disableFormRequest: oResource})
        },
      }
    });
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
    var chatOrg = this.props.to[TYPE] === constants.TYPES.ORGANIZATION  &&  utils.getId(this.props.to)
    let shareableResources = this.props.shareableResources.verifications
    let providers = this.props.shareableResources.providers
    let resourceContextId = resource._context  &&  utils.getId(resource._context)
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
        // Dont' share forms for the same product
        if (resourceContextId  &&  document._context  && resourceContextId === utils.getId(document._context))
          return
        var vModel = utils.getModel(r[TYPE]);
        var doc = this.formatShareables({
          model: formModel,
          verification: r,
          // isAccordion: totalShareables > 1,
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

    let bankStyle = this.props.bankStyle
    let or
    if (formModel.subClassOf === MY_PRODUCT)
      or = <View style={{paddingVertical: 5}}>
            <View style={{backgroundColor: bankStyle.verifiedBg, height: 1, flex: 1, alignSelf: 'stretch'}}/>
          </View>
    else
      or = <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{backgroundColor: bankStyle.verifiedBg, height: 1, flex: 5, alignSelf: 'center'}}/>
            <View style={{width: 5}} />
            <View style={[styles.assistentBox, {backgroundColor: bankStyle.verifiedBg}]}>
              <Text style={styles.orText}>{'OR'}</Text>
            </View>
            <View style={{width: 5}} />
            <View style={{backgroundColor: bankStyle.verifiedBg, height: 1, flex: 5, alignSelf: 'center'}}/>
          </View>


    return (
      <View style={[rowStyle, viewStyle, {marginTop: -10, width: width, backgroundColor: '#ffffff', borderBottomLeftRadius: 10, borderBottomRightRadius: 10}]} key={this.getNextKey()}>
        <View style={{flex: 1}}>
          {or}
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
    let providers = params.providers  // providers the document was shared with

    var document = verification.document

    var docModel = utils.getModel(document[TYPE]).value;
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

    let msgWidth = Math.floor(utils.dimensions(FormRequestRow) * 0.8) - 100
    let hs = /*isShared ? chatStyles.description :*/ [styles.header, {fontSize: 16, width: msgWidth - 100}]
    let bankStyle = this.props.bankStyle
    let arrow = <Icon color={bankStyle.verifiedHeaderColor} size={20} name={'ios-arrow-forward'} style={{marginRight: 10, marginTop: 5}}/>
    var headerContent = <View style={headerStyle}>
                          <Text style={[hs, {color: '#555555'}]}>{utils.getDisplayName(document)}</Text>
                        </View>

    let header = <TouchableHighlight underlayColor='transparent' onPress={this.props.onSelect.bind(this, document, verification)}>
                   <View style={styles.header}>
                     {headerContent}
                     {arrow}
                   </View>
                 </TouchableHighlight>
    var orgRow = <View/>
    let resource = this.props.resource
    let doShareDocument = (typeof resource.requireRawData === 'undefined')  ||  resource.requireRawData
    let isItem = utils.isSavedItem(document)
    if (verification  && (verification.organization || isItem)) {
      var orgPhoto = !isItem  &&  verification.organization.photo
                   ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={[styles.orgImage, {marginTop: -5}]} />
                   : <View />
      var shareView = <View style={[chatStyles.shareButton, {marginHorizontal: 0, opacity: this.props.resource._documentCreated ? 0.3 : 1}]}>
                        <CustomIcon name='tradle' style={{color: '#4982B1' }} size={32} />
                        <Text style={chatStyles.shareText}>{translate('Share')}</Text>
                      </View>
      var orgTitle = this.props.to[TYPE] === constants.TYPES.ORGANIZATION
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
        verifiedBy = doShareDocument ? translate('verifiedBy', orgs) : translate('verificationBy', orgs)
      }
      else if (isItem)
        verifiedBy = translate('fromMyData')
      else {
        let meId = utils.getId(utils.getMe())
        if (utils.getId(document.from) === meId)
          verifiedBy = translate('sentTo', verification.organization.title)
        else
          verifiedBy = translate('issuedBy', verification.organization.title)
      }

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
      else if (this.props.resource._documentCreated) {
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
    return <View style={{flex: 1}} key={this.getNextKey()}>
             {header}
             {content}
           </View>
  }

  createNewResource(model, isMyMessage) {
    var resource = {
      from: this.props.resource.to,
      to: this.props.resource.from,
      _context: this.props.resource._context,
      [TYPE]: model.id
    }
    // if (this.props.resource[TYPE] !== FORM_REQUEST)
    //   resource.message = this.props.resource.message;
    // resource[TYPE] = model.id;
    var isPrefilled = this.props.resource.prefill
    // Prefill for testing and demoing
    if (isPrefilled)
      extend(true, resource, this.props.resource.prefill)
    else {
      // isPrefilled = false
      isPrefilled = ENV.prefillForms && model.id in formDefaults
      if (isPrefilled)
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
        country: this.props.country,
        bankStyle: this.props.bankStyle,
        originatingMessage: this.props.resource,
        defaultPropertyValues: this.props.defaultPropertyValues,
      }
    });
  }

  formRequest(resource, vCols, prop) {
    const { bankStyle } = this.props
    let message = resource.message
    let messagePart
    if (resource._documentCreated)
      message = resource.message.replace(/\*/g, '')
    else
      messagePart = utils.parseMessage(resource, message, bankStyle)
    if (typeof messagePart === 'string')
      messagePart = null

    let form = utils.getModel(resource.form).value
    // if (this.props.shareableResources)
    //   style = styles.description;
    let onPressCall
    // if (s.length === 2)
    //   onPressCall = this.editForm.bind(self, msgParts[1], msgParts[0])
    let sameFormRequestForm
    let isMyProduct = form.subClassOf === MY_PRODUCT
    if (!resource._documentCreated  &&  resource.product  &&  !isMyProduct) {
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
    let link, icon
    let isReadOnly = utils.isReadOnlyChat(this.props.resource, this.props.resource._context) //this.props.context  &&  this.props.context._readOnly
    let self = this
    // let strName = sameFormRequestForm ? translate('addAnotherFormOrGetNext', translate(form)) : utils.getStringName(message)
    // let str = messagePart ? messagePart : (strName ? utils.translate(strName) : message)

    let str = messagePart ? messagePart : message
    messagePart = null
    let msg

    if (sameFormRequestForm  &&  !resource._documentCreated) {
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
    // else if (isMyMessage)
    //   link = <Text style={[chatStyles.resourceTitle, color]}>{translate(form)}</Text>
    else {
      let notLink = resource._documentCreated  ||  isReadOnly  ||  isMyProduct
      if (!isMyProduct)
        icon = <Icon  name={'ios-arrow-forward'} style={{color: isMyMessage ? bankStyle.myMessageLinkColor : LINK_COLOR}} size={20} />
      if (!notLink) {
        if (resource.verifiers)
          onPressCall = this.props.chooseTrustedProvider.bind(this, this.props.resource, form, isMyMessage)
        else if (!prop)
          onPressCall = this.createNewResource.bind(this, form, isMyMessage)
        else {
          if (prop.ref === PHOTO) {
            // TODO: re-use logic from NewResourceMixin
            if (utils.isWeb() && ENV.canUseWebcam) {
              msg = <View key={this.getNextKey()}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableHighlight style={{flex: 1}} underlayColor='transparent' onPress={this.showCamera.bind(this, prop)}>
                          <Text style={[chatStyles.resourceTitle, resource.documentCreated ? {color: '#aaaaaa'} : {}]}>{str}</Text>
                        </TouchableHighlight>
                       {resource.documentCreated ? null : icon}
                      </View>
                    </View>
            }
            else {
              msg = <View key={this.getNextKey()}>
                     <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                       <ImageInput prop={prop} style={{flex: 1}} onImage={item => this.onSetMediaProperty(prop.name, item)}>
                         <Text style={[chatStyles.resourceTitle, resource.documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{str}</Text>
                       </ImageInput>
                       {resource.documentCreated ? null : icon}
                     </View>
                   </View>
            }
          }
          else if (form.id === IPROOV_SELFIE) {
            msg = <View key={this.getNextKey()}>
                  <TouchableHighlight onPress={() => this.showIproovScanner(prop, prop.name)} underlayColor='transparent'>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <Text style={[chatStyles.resourceTitle, {flex: 1, color: bankStyle.incomingMessageTextColor}, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{str}</Text>
                      {resource._documentCreated ? null : icon}
                    </View>
                  </TouchableHighlight>
               </View>
          }
          else {
            msg = <View key={this.getNextKey()} style={{justifyContent: 'center'}}>
                  <TouchableHighlight onPress={() => this.chooser(prop)} underlayColor='transparent'>
                    <View style={{flexDirection: 'row', minHeight: 35, justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text style={[chatStyles.resourceTitle, {color: bankStyle.incomingMessageTextColor}, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{str}</Text>
                      {resource._documentCreated ? null : icon}
                    </View>
                  </TouchableHighlight>
               </View>
            // const animatedStyle = {minHeight: this.animatedValue}
            // msg = <View key={this.getNextKey()} style={{justifyContent: 'center'}}>
            //       <TouchableHighlight onPress={() => this.chooser(prop)} underlayColor='transparent'>
            //         <Animated.View style={[{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, animatedStyle]}>
            //           <Text style={[chatStyles.resourceTitle, {color: bankStyle.incomingMessageTextColor}, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{str}</Text>
            //           {resource._documentCreated ? null : icon}
            //         </Animated.View>
            //       </TouchableHighlight>
            //    </View>
          }
        }
      }
    }

    if (!msg) {
      messagePart = <Text style={[chatStyles.resourceTitle, {flex: 1, color: bankStyle.incomingMessageTextColor}, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{str}</Text>
      msg = <View key={this.getNextKey()}>
               <View style={{flexDirection: 'row', minHeight: 35, alignItems: 'center'}}>
                 {messagePart}
                 {resource._documentCreated ? null : icon}
               </View>
               {link}
             </View>
    }
    vCols.push(msg);
    return isReadOnly ? null : onPressCall
    function onOK() {
      Actions.addMessage({msg: {
        from: resource.to,
        to: resource.from,
        _context: self.props.context,
        [TYPE]: NEXT_FORM_REQUEST,
        after: form.id
      }})
      var params = {
        value: {_documentCreated: true, _document: utils.getId(resource)},
        doneWithMultiEntry: true,
        resource: resource,
        meta: utils.getModel(resource[TYPE]).value
      }
      Actions.addItem(params)
    }
  }

  reviewFormsInContext() {
    Alert.alert(
      translate('importDataPrompt'),
      utils.getDisplayName(this.props.to),
      [
        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
        {text: translate('Import'), onPress: this.submitAllForms.bind(this)},
      ]
    )
    // this.props.navigator.push({
    //   id: 29,
    //   title: translate("importData"),
    //   backButtonTitle: 'Back',
    //   component: RemediationItemsList,
    //   rightButtonTitle: 'Done',
    //   passProps: {
    //     modelName: CONFIRM_PACKAGE_REQUEST,
    //     resource: this.props.resource,
    //     bankStyle: this.props.bankStyle,
    //     reviewed: {},
    //     to: this.props.to,
    //     list: this.props.resource.items,
    //     currency: this.props.currency
    //   }
    // })
  }
  submitAllForms() {
    // utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.addAll(this.props.resource, this.props.to, translate('confirmedMyData'))
    // });
    // this.props.navigator.pop()
  }

  // showCamera(prop) {
  //   this.props.navigator.push({
  //     title: 'Take a pic',
  //     backButtonTitle: 'Back',
  //     id: 12,
  //     component: CameraView,
  //     sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
  //     passProps: {
  //       onTakePic: this.onTakePic.bind(this, prop)
  //     }
  //   });
  // }

  // onTakePic(prop, data) {
  //   if (!data)
  //     return
  //   utils.onTakePic(prop, data, this.props.resource)
  //   this.props.navigator.pop()
  // }
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
    width: 30,
    height: 30,
    marginTop: 0,
    alignSelf: 'center',
    borderRadius: 15
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
    paddingRight: 3,
    backgroundColor: '#ffffff'
  },
  orgView: {
    maxWidth: utils.getMessageWidth(FormRequestRow) - 150,
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center'
  },
  orText: {
    fontStyle: 'italic',
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 16,
  }
});
reactMixin(FormRequestRow.prototype, RowMixin)

module.exports = FormRequestRow;
