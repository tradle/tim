console.log('requiring FormRequestRow.js')
'use strict';

const debug = require('debug')('tradle:app:FormRequestRow')
import utils from '../utils/utils'
var translate = utils.translate
import NewResource from './NewResource'
import RemediationItemsList from './RemediationItemsList'
import Icon from 'react-native-vector-icons/Ionicons';
import constants from '@tradle/constants'
import ResourceList from './ResourceList'
import RowMixin from './RowMixin'
import CameraView from './CameraView'
import StringChooser from './StringChooser'
import ImageInput from './ImageInput'

import CustomIcon from '../styles/customicons'
import extend from 'extend'
import equal from 'deep-equal'
import formDefaults from '../data/formDefaults'
import Actions from '../Actions/Actions'
import StyleSheet from '../StyleSheet'
import reactMixin from 'react-mixin'

import chatStyles from '../styles/chatStyles'

const MY_PRODUCT = 'tradle.MyProduct'
const PHOTO = 'tradle.Photo'
const FORM_REQUEST = 'tradle.FormRequest'
const CONFIRM_PACKAGE_REQUEST = 'tradle.ConfirmPackageRequest'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const ITEM = 'tradle.Item'
const IPROOV_SELFIE = 'tradle.IProovSelfie'

const {
  TYPE
} = constants

const {
  ORGANIZATION,
  FORM,
  ENUM
} = constants.TYPES

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
    let { resource, to, bankStyle, application } = this.props
    let model = utils.getModel(resource[TYPE] || resource.id).value;

    let me = utils.getMe();

    var isMyMessage = this.isMyMessage(to[TYPE] === ORGANIZATION ? to : null);
    let ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    let message = resource.message
    let renderedRow = [];

    let onPressCall
    let isFormRequest = resource[TYPE] === FORM_REQUEST
    let prop =  utils.isOnePropForm(resource)

    let linkColor
    if (application)
      linkColor = '#757575'
    else
      linkColor = isMyMessage ? bankStyle.myMessageLinkColor : bankStyle.linkColor

    let msgWidth = Math.floor(utils.dimensions(FormRequestRow).width * 0.8)
    if (isFormRequest)
      onPressCall = this.formRequest(resource, renderedRow, prop)
    else {
      onPressCall = resource._documentCreated ? null : this.reviewFormsInContext.bind(this)
      let icon = <Icon style={{marginTop: 2, marginRight: 2, color: linkColor}} size={20} name={'ios-arrow-forward'} />
      let params = { resource, message, bankStyle, noLink: application != null || resource._documentCreated }
      let msg = utils.parseMessage(params)
      if (typeof msg === 'string') {
        let idx = message.indexOf('...')
        if (idx !== -1)
          idx += 3
        else
          idx = 0
        msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{message.substring(0, idx)}</Text>
                  <View style={chatStyles.rowContainer}>
                    <Text style={[chatStyles.resourceTitle, {width: msgWidth - 25}, resource._documentCreated || !idx ? {color: '#757575'} : {color: bankStyle.linkColor}]}>{message.substring(idx).trim()}</Text>
                    {resource._documentCreated  ? null : icon}
                  </View>
                </View>
      }
      else
        msg = <View style={chatStyles.rowContainer} key={this.getNextKey()}>
                <View style={styles.container}>
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
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)

    var viewStyle = {
      flexDirection: 'row',
      borderTopRightRadius: 10,
      width:  Math.min(msgWidth, message.length * utils.getFontSize(18) + 35),
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start'
    }

    if (this.state  &&  this.state.sendStatus  &&  this.state.sendStatus !== null)
      sendStatus = this.getSendStatus()
    var sealedStatus = (resource.txId)
                     ? <View style={chatStyles.sealedStatus}>
                         <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                       </View>
                     : <View />


    let addStyle = message.length < 30
                 ? [chatStyles.verificationBody, mstyle]
                 : [chatStyles.verificationBody, styles.container, mstyle]
    var mainStyle = { margin:1, backgroundColor: '#ffffff' }
    var shareables = !isFormRequest  || resource._documentCreated
                   ? null
                   : this.showShareableResources(mainStyle);

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
    if (this.isShared() && !isFormRequest)
      share = <View style={[chatStyles.verifiedHeader, {backgroundColor: bankStyle.sharedWithBg}]}>
                <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
              </View>
    let msgContent =  <View style={[viewStyle, shareables ? {backgroundColor: '#ffffff', paddingBottom: 10} : {}]}>
                        <View style={{marginTop: 2}}>
                          {ownerPhoto}
                        </View>
                        <View style={[cellStyle, {backgroundColor: bankStyle.incomingMessageBgColor}, shareables ? styles.shareables : {}]}>
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
    if (prop  ||  isMyProduct  ||  application  ||  resource._documentCreated)
      messageBody = msgContent
    else
      messageBody = <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
                      {msgContent}
                    </TouchableHighlight>

    var bg = bankStyle.backgroundImage ? 'transparent' : bankStyle.backgroundColor
    let contextId = this.getContextId(resource)
    return (
      <View style={[mainStyle, {margin:2, paddingVertical: 3, backgroundColor: bg}]}>
        {date}
        <View style={shareables ? {borderWidth: 1, width: msgWidth + 2, borderColor: '#dddddd', backgroundColor: bankStyle.incomingMessageBgColor, borderRadius: 10, borderTopLeftRadius: 0} : {}}>
          {messageBody}
          {sendStatus}
          {shareables}
        </View>
        {contextId}
      </View>
    )
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
    this.props.navigator.push({
      title: translate(prop),
      id: 33,
      component: StringChooser,
      backButtonTitle: 'Back',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        strings:   oResource.chooser.oneOf,
        bankStyle: this.props.bankStyle,
        callback:  (val) => {
          resource[prop.name] = val
          Actions.addChatItem({resource: resource, disableFormRequest: oResource})
        },
      }
    });
  }

  showShareableResources(viewStyle) {
    let { resource, to, shareableResources, productToForms, bankStyle } = this.props
    if (!shareableResources) // || !this.props.resource.message)
      return null

    let formModel = utils.getModel(resource.form).value
    let isMultientryForm = isMultientry(resource)
    let { product } = resource
    let entries = (isMultientryForm  &&  productToForms  &&  productToForms[product])
                ? productToForms[product][resource.form]
                : null
    var vtt = [];
    var cnt = 0;
    var chatOrg = to[TYPE] === ORGANIZATION  &&  utils.getId(to)
    let { verifications, providers } = shareableResources
    let resourceContextId = resource._context  &&  utils.getId(resource._context)
    for (var t in  verifications) {
      if (t !== formModel.id)
        continue
      var ver = verifications[t];
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
                  <View style={styles.separator} />
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

    let org = to.organization ? (to.organization.title + '.') : to.name;
    let msg = (vtt.length === 1)
            ? (formModel.subClassOf === MY_PRODUCT
                ? translate('shareMyProduct', translate(formModel), org)
                : translate('shareOne', utils.getMe().firstName, docType, org)
              )
            : translate('shareOneOfMany', utils.getMe().firstName, docType, org)

    let w = utils.dimensions(FormRequestRow).width * 0.8 - 2
    let or
    if (formModel.subClassOf === MY_PRODUCT)
      or = <View style={{paddingVertical: 5}}>
            <View style={{backgroundColor: bankStyle.verifiedBg, height: 1, flex: 1, alignSelf: 'stretch'}}/>
          </View>
    else {
      let abStyle = {backgroundColor: bankStyle.verifiedBg, height: 1, flex: 5, alignSelf: 'center'}
      or = <View style={styles.row}>
            <View style={abStyle}/>
            <View style={styles.assistentBox}>
              <Text style={[styles.orText, {color: bankStyle.verifiedBg}]}>{'or share'}</Text>
            </View>
            <View style={abStyle}/>
          </View>
    }

    let shareStyle = {marginTop: -15, width: w, backgroundColor: '#ffffff', borderBottomLeftRadius: 10, borderBottomRightRadius: 10}
    return (
      <View style={[viewStyle, shareStyle]} key={this.getNextKey()}>
        <View style={styles.container}>
          {or}
          <View style={styles.shareablesList}>
            {vtt}
          </View>
        </View>
      </View>
     );
  }
  formatShareables(params) {
    let { model, verification, onPress, providers } = params
    let { bankStyle, resource, onSelect, to, share } = this.props

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
    let hs = /*isShared ? chatStyles.description :*/ [styles.header, {fontSize: 16, width: msgWidth - 100, color: '#555555'}]
    let arrow = <Icon color={bankStyle.verifiedHeaderColor} size={20} name={'ios-arrow-forward'} style={styles.arrow}/>
    var headerContent = <View style={headerStyle}>
                          <Text style={hs}>{utils.getDisplayName(document)}</Text>
                        </View>

    let header = <TouchableHighlight underlayColor='transparent' onPress={onSelect.bind(this, document, verification)}>
                   <View style={styles.header}>
                     {headerContent}
                     {arrow}
                   </View>
                 </TouchableHighlight>
    var orgRow = <View/>
    let doShareDocument = (typeof resource.requireRawData === 'undefined')  ||  resource.requireRawData
    let isItem = utils.isSavedItem(document)
    if (verification  && (verification.organization || isItem)) {
      var orgPhoto = !isItem  &&  verification.organization.photo
                   ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={styles.orgImage} />
                   : <View />
      var shareView = <View style={[chatStyles.shareButton, {marginHorizontal: 0, opacity: resource._documentCreated ? 0.3 : 1}]}>
                        <CustomIcon name='tradle' style={{color: '#4982B1' }} size={32} />
                        <Text style={chatStyles.shareText}>{translate('Share')}</Text>
                      </View>
      var orgTitle = to[TYPE] === ORGANIZATION
                   ? to.name
                   : (to.organization ? to.organization.title : null);
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
                              <Text style={styles.verifiedDate}>{utils.formatDate(verification.dateVerified)}</Text>
                            </View>
                          : <View/>
                        }
                      </View>
      if (onPress) {
      }
      else if (resource._documentCreated) {
        orgRow =  <View style={chatStyles.shareView}>
                    {shareView}
                    <TouchableHighlight onPress={onSelect.bind(this, document, verification)} underlayColor='transparent'>
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
                                {text: translate('Share'), onPress: share.bind(this, verification, to, resource)},
                              ]
                          )}>
                    {shareView}
                   </TouchableHighlight>
                   <TouchableHighlight onPress={onSelect.bind(this, document, verification)} underlayColor='transparent'>
                     {orgView}
                   </TouchableHighlight>
                </View>
      }
    }
    let content = <View style={{flex:1, paddingVertical: 3}}>
                     <TouchableHighlight onPress={onSelect.bind(this, document, verification)} underlayColor='transparent'>
                       {msg}
                     </TouchableHighlight>
                     {orgRow}
                   </View>

    // var verifiedBy = verification && verification.organization ? verification.organization.title : ''
    return <View style={styles.container} key={this.getNextKey()}>
             {header}
             {content}
           </View>
  }

  createNewResource(model, isMyMessage) {
    let { resource, currency, country, bankStyle, defaultPropertyValues, navigator } = this.props
    let r = {
      from: resource.to,
      to: resource.from,
      _context: resource._context,
      [TYPE]: model.id
    }
    // if (resource[TYPE] !== FORM_REQUEST)
    //   resource.message = resource.message;
    // resource[TYPE] = model.id;
    var isPrefilled = resource.prefill
    // Prefill for testing and demoing
    if (isPrefilled)
      extend(true, r, resource.prefill)
    else {
      // isPrefilled = false
      isPrefilled = ENV.prefillForms && model.id in formDefaults
      if (isPrefilled)
        extend(true, r, formDefaults[model.id])
        // console.log(JSON.stringify(resource, 0, 2))
    }
    let rightButtonTitle = 'Done'
    if (isMyMessage) {
      let me = utils.getMe()
      if (!me.isEmployee  ||  utils.getId(me.organization) !== utils.getId(resource.to.organization))
        rightButtonTitle = null
    }
    navigator.push({
      id: 4,
      title: translate(model),
      rightButtonTitle: isMyMessage ? null : 'Done',
      backButtonTitle: 'Back',
      component: NewResource,
      // titleTextColor: '#7AAAC3',
      passProps:  {
        model: model,
        resource: r,
        isPrefilled: isPrefilled,
        currency: currency,
        country: country,
        bankStyle: bankStyle,
        originatingMessage: resource,
        defaultPropertyValues: defaultPropertyValues,
      }
    });
  }

  formRequest(resource, vCols, prop) {
    const { bankStyle, to, application, context, productToForms, chooseTrustedProvider } = this.props
    let message = resource.message
    let messagePart
    if (resource._documentCreated) {
      if (resource.message)
        message = resource.message.replace(/\*/g, '')
      else
        message = ''
    }
    else {
      let params = { resource, message, bankStyle, noLink: application != null  || resource._documentCreated }
      messagePart = utils.parseMessage(params)
    }
    if (typeof messagePart === 'string')
      messagePart = null

    let form = utils.getModel(resource.form).value
    // if (this.props.shareableResources)
    //   style = styles.description;
    let onPressCall
    // if (s.length === 2)
    //   onPressCall = this.editForm.bind(self, msgParts[1], msgParts[0])
    let sameFormRequestForm
    let isMyMessage = this.isMyMessage(to[TYPE] === ORGANIZATION ? to : null);
    let { product } = resource
    if (!resource._documentCreated  &&  product) {
      let multiEntryForms = utils.getModel(product).value.multiEntryForms
      if (multiEntryForms  &&  multiEntryForms.indexOf(form.id) !== -1) {
        if (productToForms) {
          let forms = productToForms[product]
          if (forms) {
            let formsArray = forms[resource.form]
            if (formsArray)
              sameFormRequestForm = true
          }
          // onPressCall = this.getNextFormAlert.bind(this)
        }
      }
      if (!sameFormRequestForm)
        onPressCall = this.createNewResource.bind(this, form, isMyMessage);
    }

    let color = isMyMessage
              ? {color: '#AFBBA8'}
              : {color: '#2892C6'}
    let link, icon
    let isReadOnlyContext = context  &&  utils.isReadOnlyChat(context)
    let me = utils.getMe()
    let switchToContext = me.isEmployee  &&  context  &&  resource.product  && context.to.organization  &&  context.to.organization.id === me.organization.id

    let isReadOnly = application != null

    if (!isReadOnly)
      isReadOnly = !switchToContext  && !context &&  (!isMyMessage  &&  utils.isReadOnlyChat(this.props.resource, this.props.resource._context)) //this.props.context  &&  this.props.context._readOnly
    let self = this
    // let strName = sameFormRequestForm ? translate('addAnotherFormOrGetNext', translate(form)) : utils.getStringName(message)
    // let str = messagePart ? messagePart : (strName ? utils.translate(strName) : message)

    let str = messagePart ? messagePart : message
    messagePart = null
    let msg

    if (sameFormRequestForm  &&  !resource._documentCreated) {
      link = <View style={[chatStyles.rowContainer, styles.link]}>
               <View style={[chatStyles.textContainer, styles.center]}>
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
      let linkColor = isMyMessage ? bankStyle.myMessageLinkColor : bankStyle.linkColor

      let notLink = resource._documentCreated  ||  isReadOnly
      icon = <Icon  name={'ios-arrow-forward'} style={{color: linkColor}} size={20} />
      if (!notLink) {
        if (resource.verifiers)
          onPressCall = chooseTrustedProvider.bind(this, this.props.resource, form, isMyMessage)
        else if (!prop)
          onPressCall = this.createNewResource.bind(this, form, isMyMessage)
        else  {
          if (prop.ref == PHOTO) {
            msg = <View key={this.getNextKey()}>
                   <View style={styles.thumbView}>
                     <ImageInput prop={prop} style={styles.container} onImage={item => this.onSetMediaProperty(prop.name, item)}>
                       <Text style={[chatStyles.resourceTitle, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{str}</Text>
                     </ImageInput>
                     {resource._documentCreated ? null : icon}
                   </View>
                 </View>
          }
          else if (form.id === IPROOV_SELFIE) {
            let mColor
            if (resource._documentCreated)
              mColor = bankStyle.incomingMessageOpaqueTextColor
            else
              mColor = bankStyle.incomingMessageTextColor

             msg = <View key={this.getNextKey()}>
                     <TouchableHighlight onPress={() => this.showIproovScanner(prop, prop.name)} underlayColor='transparent'>
                       <View style={styles.row}>
                         <Text style={[chatStyles.resourceTitle, {flex: 1, color: mColor}]}>{str}</Text>
                         {resource._documentCreated ? null : icon}
                       </View>
                     </TouchableHighlight>
                   </View>
          }
          else {
            msg = <View key={this.getNextKey()} style={styles.center}>
                  <TouchableHighlight onPress={() => this.chooser(prop)} underlayColor='transparent'>
                    <View style={styles.message}>
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
      let mColor = resource._documentCreated
                 ? bankStyle.incomingMessageOpaqueTextColor
                 : bankStyle.incomingMessageTextColor
      messagePart = <Text style={[chatStyles.resourceTitle, {flex: 1, color: mColor}]}>{str}</Text>
      msg = <View key={this.getNextKey()}>
               <View style={styles.message}>
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
        _context: self.props.context  ||  resource._context,
        [TYPE]: NEXT_FORM_REQUEST,
        after: form.id
      }})
      var params = {
        value: {_documentCreated: true, _document: utils.getId(resource)},
        doneWithMultiEntry: true,
        resource: resource,
        meta: utils.getModel(resource[TYPE]).value
      }
      Actions.addChatItem(params)
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
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
    // width: 30,
    height: 30,
    marginTop: 0,
    alignSelf: 'center',
    borderRadius: 15,
    paddingHorizontal: 10
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
    maxWidth: 0.8 * utils.dimensions().width - 100,
    paddingLeft: 20,
    marginRight: 10,
    flex: 1,
    justifyContent: 'center'
  },
  orText: {
    fontStyle: 'italic',
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 16,
  },
  verifiedDate: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic'
  },
  orgImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginTop: -5
  },
  thumbView: {
    flexDirection: 'row',
    minHeight: 35,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  separator: {
    height: 1,
    backgroundColor: '#dddddd'
  },
  arrow: {
    marginRight: 10,
    marginTop: 5
  },
  link: {
    paddingVertical: 10,
    alignSelf: 'center'
  },
  center: {
    justifyContent: 'center'
  },
  message: {
    flexDirection: 'row',
    minHeight: 35,
    alignItems: 'center',
    justifyContent: 'space-between',
  }
});
reactMixin(FormRequestRow.prototype, RowMixin)

module.exports = FormRequestRow;
