console.log('requiring FormRequestRow.js')
'use strict';

import _ from 'lodash'
import { makeResponsive } from 'react-native-orient'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons';
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io';
const debug = require('debug')('tradle:app:FormRequestRow')

import constants from '@tradle/constants'

import utils from '../utils/utils'
var translate = utils.translate
import NewResource from './NewResource'
import RemediationItemsList from './RemediationItemsList'
import RowMixin from './RowMixin'
import CameraView from './CameraView'
import StringChooser from './StringChooser'
import ImageInput from './ImageInput'
import ShareResourceList from './ShareResourceList'
import ResourceList from './ResourceList'

import CustomIcon from '../styles/customicons'
import formDefaults from '../data/formDefaults'
import Actions from '../Actions/Actions'
import StyleSheet from '../StyleSheet'

import { circled } from '../styles/utils'
import SignatureView from './SignatureView'

import chatStyles from '../styles/chatStyles'

const MY_PRODUCT = 'tradle.MyProduct'
const PHOTO = 'tradle.Photo'
const FORM_REQUEST = 'tradle.FormRequest'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const CONFIRM_PACKAGE_REQUEST = 'tradle.ConfirmPackageRequest'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const ITEM = 'tradle.Item'
const IPROOV_SELFIE = 'tradle.IProovSelfie'
const DEFAULT_MESSAGE = 'Would you like to...'
const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const {
  TYPE,
  ROOT_HASH
} = constants

const {
  ORGANIZATION,
  FORM,
  ENUM
} = constants.TYPES

import Navigator from './Navigator'
import {
  Image,
  // StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  View,
  Platform,
  Animated,
  Easing,
  processColor
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'

import ENV from '../utils/env'
class FormRequestRow extends Component {
  static displayName = 'FormRequestRow';

  constructor(props) {
    super(props);
    this.state = {}
    this.zoomIn = new Animated.Value(1)
    this.zoomIn1 = new Animated.Value(0)
    this.springValue = new Animated.Value(0)
    this.spinValue = new Animated.Value(0)
  }
  componentWillMount() {
    if (Platform.OS !== 'ios')
      return
    let resource = this.props.resource
    if (resource[TYPE] !== FORM_REQUEST)
      return

    if (utils.hasPaymentCardScannerProperty(utils.getType(resource.form)))
      CardIOUtilities.preload();
  //   this.animatedValue = new Animated.Value(60)
  }
  componentDidMount() {
    Animated.timing(
      this.spinValue,
      {
        toValue: 1,
        duration: 700,
        delay: 100,
        easing: Easing.linear
      }
    ).start()
    Animated.spring(
      this.springValue,
      {
        toValue: 1,
        bounceness: 100,
        speed: 1,
        // friction: 2
      }
    ).start()
    Animated.timing(      // Uses easing functions
      this.zoomIn,    // The value to drive
      { toValue: 1,
        delay: 500,
        duration: 250,
        easing: Easing.bounce
      }        // Configuration
    ).start();
    Animated.timing(      // Uses easing functions
      this.zoomIn1,    // The value to drive
      {
        toValue: 1,
        delay: 700,
        duration: 250,
        easing: Easing.bounce
      }        // Configuration
    ).start();
  }

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
        !_.isEqual(to, nextProps.to)                ||
        utils.resized(this.props, nextProps))
      return true
    return false
  }
  render() {
    let { resource, to, bankStyle, application } = this.props
    let model = utils.getModel(resource[TYPE] || resource.id);

    let me = utils.getMe();

    var isMyMessage = this.isMyMessage(to[TYPE] === ORGANIZATION ? to : null);
    let ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    let message = resource.message
    let renderedRow = [];

    let onPressCall
    let isFormRequest = resource[TYPE] === FORM_REQUEST

    let props = utils.getEditableProperties(resource)
    let prop = props.length === 1  &&  props[0]

    let linkColor
    if (application)
      linkColor = '#757575'
    else
      linkColor = isMyMessage ? bankStyle.myMessageLinkColor : bankStyle.linkColor

    let styles = createStyles({bankStyle, isMyMessage, resource, application})
    let msgWidth = utils.getMessageWidth(FormRequestRow)
    if (isFormRequest)
      onPressCall = this.formRequest(resource, renderedRow, prop, styles)
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

    let msgL = this.hasSharables() ? msgWidth : message.length * utils.getFontSize(10) + 35
    var viewStyle = {
      flexDirection: 'row',
      borderTopRightRadius: 10,
      width:  Math.min(msgWidth, msgL),
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
                 ? [chatStyles.verificationBody, styles.mstyle]
                 : [chatStyles.verificationBody, styles.container, styles.mstyle]
    var shareables = !isFormRequest  || resource._documentCreated
                   ? null
                   : this.showShareableResources(styles);

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
    if (this.isShared()  &&  !isFormRequest)
      share = <View style={[chatStyles.verifiedHeader, {backgroundColor: bankStyle.sharedWithBg}]}>
                <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
              </View>
    let msgContent =  <View style={[viewStyle, shareables ? {backgroundColor: '#ffffff'} : {}]}>
                        <View style={{marginTop: 2}}>
                          {ownerPhoto}
                        </View>
                        <View style={[cellStyle, {backgroundColor: bankStyle.incomingMessageBgColor}, shareables ? styles.shareablesArea : {}]}>
                          <View style={[styles.container, msgStyle]}>
                            {share}
                            {renderedRow}
                           </View>
                             {sealedStatus}
                          </View>
                      </View>

    // onPressCall = prop  &&  !prop.allowPicturesFromLibrary ? this.showCamera({prop: prop}) : onPressCall
    let messageBody
    let isMyProduct = isFormRequest  &&  utils.getModel(resource.form).subClassOf === MY_PRODUCT
    if (prop  ||  isMyProduct  ||  application  ||  resource._documentCreated)
      messageBody = msgContent
    else
      messageBody = <TouchableOpacity onPress={onPressCall ? onPressCall : () => {}}>
                      {msgContent}
                    </TouchableOpacity>

    let contextId = this.getContextId(resource)
    return (
      <View style={styles.formRequest}>
        {date}
        <View style={shareables ? {borderWidth: 1, width: viewStyle.width + 5, borderColor: '#dddddd', backgroundColor: bankStyle.incomingMessageBgColor, borderRadius: 10, borderTopLeftRadius: 0} : {}}>
          {messageBody}
          {sendStatus}
          {shareables}
        </View>
        {contextId}
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

  showShareableResources(styles) {
    let { resource, to, shareableResources, productToForms, bankStyle } = this.props
    if (!shareableResources) // || !this.props.resource.message)
      return null

    let formModel = utils.getModel(resource.form)
    let isMultientryForm = isMultientry(resource)
    let { product } = resource
    let entries = (isMultientryForm  &&  productToForms  &&  productToForms[product])
                ? productToForms[product][resource.form]
                : null
    var vtt = [];
    var cnt = 0;
    var chatOrg = to[TYPE] === ORGANIZATION  &&  utils.getId(to)
    let { verifications, providers, multientryResources } = shareableResources
    let resourceContextId = resource._context  &&  utils.getId(resource._context)
    let hasMultientry = !utils.isEmpty(multientryResources)
    if (hasMultientry) {
      for (let t in  multientryResources) {
        if (t !== formModel.id)
          continue
        // let contexts = multientryResources[t]
        // for (let c in contexts) {
        //   if (c === resourceContextId)
        //     continue
        //   let meShare = this.formatMultiEntryShareable({context: c, verifications: contexts[c], model: formModel})
          let meverifications = multientryResources[t]
          if (meverifications.length > 1) {
            let meShare = this.formatMultiEntryShareable({verifications: meverifications, model: formModel, multiChooser: true, styles})
            vtt.push(meShare)
          }
        // }
      }
    }
    if (!vtt.length) {
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
            styles,
            // isAccordion: totalShareables > 1,
            providers: providers  &&  providers[document[ROOT_HASH]]
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

    // let w = utils.dimensions(FormRequestRow).width * 0.8 - 2
    // let or
    // if (formModel.subClassOf === MY_PRODUCT)
    //   or = <View style={{paddingVertical: 5}}>
    //         <View style={styles.myProductSeparator}/>
    //       </View>
    // else {
    //   let abStyle = {backgroundColor: bankStyle.verifiedBg, height: 1, flex: 5, alignSelf: 'center'}
    //   or = <View style={styles.row}>
    //         <View style={abStyle}/>
    //         <View style={styles.assistentBox}>
    //           <Text style={[styles.orText, {color: bankStyle.verifiedBg}]}>{'or share'}</Text>
    //         </View>
    //         <View style={abStyle}/>
    //       </View>
    // }
    // if (!hasMultientry  &&  vtt.length > 3) {
    //   let documents = verifications[formModel.id].map((v) => v.document)
    //   let meShare = this.formatMultiEntryShareable({verifications: verifications[formModel.id], model: formModel, multiChooser: false})
    //   vtt = []
    //   vtt.push(meShare)
    // }
    let number = numbers[vtt.length]
    let offerToShare
    if (number)
      offerToShare = `Good news! You already have ${number}. To share tap icon below.`
    else
      offerToShare = `Good news! You already have quite a few. To share tap icon below.`
    return (
      <View style={styles.shareable} key={this.getNextKey()}>
        <View style={{padding: 10, backgroundColor: '#efefef', marginHorizontal: -1}}>
          <Text style={styles.assistentText}>{offerToShare}</Text>
        </View>
        <View style={styles.container}>
          <View style={styles.shareablesList}>
            {vtt}
          </View>
        </View>
      </View>
     );
  }
  formatShareables(params) {
    let { model, verification, onPress, providers, styles } = params
    let { bankStyle, resource, onSelect, to, share } = this.props

    let document = verification.document

    let docModel = utils.getModel(document[TYPE]);
    let isMyProduct = docModel.subClassOf === MY_PRODUCT
    let docModelTitle = docModel.title || utils.makeLabel(docModel.id)
    let idx = docModelTitle.indexOf('Verification');
    let docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    let msg;
    if (document.message  &&  docModel.subClassOf !== FORM)
      msg = <View><Text style={chatStyles.description}>{document.message}</Text></View>
    let msgWidth = utils.getMessageWidth(FormRequestRow) - 50
    let headerStyle = {paddingLeft: 10, width: msgWidth}
    let isShared = this.isShared(verification)

    let hs = /*isShared ? chatStyles.description :*/ {fontSize: 16, color: '#555555'}
    let arrow = <Icon color={bankStyle.verifiedHeaderColor} size={20} name={'ios-arrow-forward'} style={styles.arrow}/>

    let displayName
    if (docModel.subClassOf === MY_PRODUCT)
      displayName = utils.makeModelTitle(docModel)
    else
      displayName = utils.getDisplayName(document)
    let headerContent = <View style={headerStyle}>
                          <Text style={hs}>{displayName}</Text>
                        </View>

    // headerContent = <TouchableOpacity onPress={onSelect.bind(this, document, verification)}>
    //                <View style={styles.header}>
    //                  {headerContent}
    //                  {arrow}
    //                </View>
    //              </TouchableOpacity>
    headerContent = <TouchableOpacity onPress={onSelect.bind(this, document, verification)}>
                   <View style={styles.header}>
                     {headerContent}
                   </View>
                 </TouchableOpacity>
    let orgRow = <View/>
    // let doShareDocument = (typeof resource.requireRawData === 'undefined')  ||  resource.requireRawData
    let isItem = utils.isSavedItem(document)
    let verifiedBy
    if (verification  && (verification.organization || isItem)) {
      let {verifiedBy, orgPhoto, shareView, orgTitle, orgView} = this.getParts(verification, isItem, styles)
      if (onPress) {
      }
      else if (resource._documentCreated) {
        orgRow =  <View style={chatStyles.shareView}>
                    {shareView}
                    <TouchableOpacity onPress={onSelect.bind(this, document, verification)}>
                      {orgView}
                    </TouchableOpacity>
                  </View>
      }
      else {
        orgRow = <View style={chatStyles.shareView}>
                   <TouchableOpacity onPress={onPress ? onPress : () =>
                            Alert.alert(
                              'Sharing ' + docTitle + ' ' + verifiedBy,
                              'with ' + orgTitle,
                              [
                                {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                                {text: translate('Share'), onPress: share.bind(this, verification, to, resource)},
                              ]
                          )}>
                    {shareView}
                   </TouchableOpacity>
                   <View>
                     {headerContent}
                     <TouchableOpacity onPress={onSelect.bind(this, document, verification)}>
                       {orgView}
                     </TouchableOpacity>
                   </View>
                </View>
      }
    }
    let content = <View style={{flex:1, paddingVertical: 3}}>
                     <TouchableOpacity onPress={onSelect.bind(this, document, verification)}>
                       {msg}
                     </TouchableOpacity>
                     {orgRow}
                   </View>

    // let verifiedBy = verification && verification.organization ? verification.organization.title : ''
    return <View style={styles.container} key={this.getNextKey()}>
             {content}
           </View>
  }
  getParts(verification, isItem, styles) {
    let { resource, to, shareableResources, bankStyle } = this.props
    let document = verification.document
    let providers = shareableResources.providers
    let doShareDocument = (typeof resource.requireRawData === 'undefined')  ||  resource.requireRawData
    let orgPhoto = !isItem  &&  verification.organization.photo
                 ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={styles.orgImage} />
                 : <View />
    // let shareView = <View style={[chatStyles.shareButton, {marginHorizontal: 0, opacity: resource._documentCreated ? 0.3 : 1}]}>
    //                   <CustomIcon name='tradle' style={{color: '#4982B1' }} size={32} />
    //                   <Text style={chatStyles.shareText}>{translate('Share')}</Text>
    //                 </View>

    // let zoomIn = {transform: [{scale: this.zoomIn}]}
    // let style={transform: [{scale: this.springValue}]}
    // let style={transform: [{scale: this.zoomOut}]}
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })
    let style = {transform: [{rotate: spin}]}
    let shareView =  <Animated.View style={style}>
                       <View style={styles.shareButton}>
                         <Icon name='md-share' size={20} color='#fff'/>
                       </View>
                     </Animated.View>

    let orgTitle = to[TYPE] === ORGANIZATION
                 ? to.name
                 : (to.organization ? to.organization.title : null);
    let verifiedBy
    if (verification[ROOT_HASH]) {
      let orgs
      if (providers) {
        if (Array.isArray(providers)) {
          providers.forEach((p) => {
            if (!orgs)
              orgs = p.title
            else
              orgs += ', ' + p.title
          })
        }
        else {
          let arr = providers[verification.document[ROOT_HASH]]
          // for (let pr in providers) {
          //   let arr = providers[pr]
          arr.forEach((p) => {
            if (!orgs)
              orgs = p.title
            else
              orgs += ', ' + p.title
          })
          // }
        }
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
    let orgView = <View style={styles.orgView}>
                    <Text style={chatStyles.description}>
                      {verifiedBy}
                    </Text>
                      {verification.dateVerified
                        ? <View style={{flexDirection: 'row'}}>
                            <Text style={styles.verifiedDate}>{utils.formatDate(verification.dateVerified)}</Text>
                          </View>
                        : <View/>
                      }
                    </View>
    return {verifiedBy, orgPhoto, shareView, orgTitle, orgView}
  }
  formatMultiEntryShareable(params) {
    // let { model, verifications, onPress, context, providers } = params
    let { model, verifications, onPress, providers, multiChooser, styles } = params
    let { bankStyle, resource, onSelect, to, share } = this.props

    let documents = verifications.map((v) => v.document)
    let verification = verifications[0]
    let document = documents[0]

    let docModel = model
    let isMyProduct = docModel.subClassOf === MY_PRODUCT
    let docModelTitle = docModel.title || utils.makeLabel(docModel.id)
    let idx = docModelTitle.indexOf('Verification');
    let docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    let msg;
    if (document.message  &&  docModel.subClassOf !== FORM)
      msg = <View><Text style={chatStyles.description}>{document.message}</Text></View>

    let headerStyle = {paddingTop: 5, paddingLeft: 10}
    let isShared = this.isShared(verification)

    let msgWidth = utils.getMessageWidth(FormRequestRow) - 100
    let hs = /*isShared ? chatStyles.description :*/ [styles.header, {fontSize: 14, width: msgWidth - 100, color: bankStyle.linkColor}]
    let arrow = <Icon color={bankStyle.verifiedHeaderColor} size={20} name={'ios-arrow-forward'} style={styles.arrow}/>

    // let docRows = documents.map((d) => {
    //   return <TouchableOpacity onPress={onSelect.bind(this, document, verification)} key={this.getNextKey()}>
    //            <Text style={hs}>{utils.getDisplayName(d)}</Text>
    //          </TouchableOpacity>
    // })

    let orgRow
    let doShareDocument = (typeof resource.requireRawData === 'undefined')  ||  resource.requireRawData
    let isItem = utils.isSavedItem(document)
    let verifiedBy
    let headerContent = <View style={headerStyle}>
                          <Text style={hs}>{translate('multientryToShare', documents.length)}</Text>
                        </View>

    if (verification  && (verification.organization || isItem)) {
      let {verifiedBy, orgPhoto, shareView, orgTitle, orgView} = this.getParts(verification, isItem, styles)
      if (onPress) {
      }
      else if (resource._documentCreated) {
        orgRow =  <View style={chatStyles.shareView}>
                    {shareView}
                    <View>
                     {headerContent}
                    <TouchableOpacity onPress={onSelect.bind(this, document, verification)}>
                      {orgView}
                    </TouchableOpacity>
                    </View>
                  </View>
      }
      else {
        orgRow = <View style={chatStyles.shareView}>
                   <TouchableOpacity underlayColor='transparent' onPress={this.showDocuments.bind(this, {documents, verifications, verifiedBy: verifiedBy || '', multiChooser: multiChooser})}>
                    {shareView}
                   </TouchableOpacity>
                   <View>
                   {headerContent}
                   <TouchableOpacity onPress={onSelect.bind(this, documents, verifications)}>
                     {orgView}
                   </TouchableOpacity>
                   </View>
                </View>
      }
    }

    // let header = <TouchableOpacity onPress={this.showDocuments.bind(this, {documents, verifications, verifiedBy: verifiedBy || '', multiChooser: true})}>
    //                <View style={styles.header}>
    //                  {headerContent}
    //                  {arrow}
    //                </View>
    //              </TouchableOpacity>
    let content = <View style={{flex:1, paddingVertical: 3}}>
                     {orgRow && <View style={styles.hr}/>}
                     {orgRow}
                   </View>

    // let verifiedBy = verification && verification.organization ? verification.organization.title : ''
    return <View style={styles.container} key={this.getNextKey()}>
             {content}
           </View>
  }
  showDocuments({documents, verifications, verifiedBy, multiChooser}) {
    let { navigator, bankStyle, resource, to } = this.props
    // navigator.push({
    //   title: utils.makeModelTitle(documents[0][TYPE]),
    //   id: 37,
    //   component: SimpleResourceList,
    //   backButtonTitle: 'Back',
    //   passProps: {
    //     list: documents,
    //     bankStyle: bankStyle
    //   }
    // })
    let modelName = documents[0][TYPE]
    navigator.push({
      title: utils.makeModelTitle(modelName) + (verifiedBy  &&  ('  →  '  + verifiedBy)),
      id: 37,
      component: ShareResourceList,
      backButtonTitle: 'Back',
      passProps: {
        multiChooser,
        verifications,
        to,
        modelName,
        bankStyle,
        list: documents,
        formRequest: resource,
      }
    })
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

    // Prefill for testing and demoing
    let isPrefilled
    if (ENV.prefillForms && model.id in formDefaults) {
      _.extend(r, formDefaults[model.id])
      isPrefilled = true
    }

    if (resource.prefill) {
      _.extend(r, resource.prefill)
      isPrefilled = true
    }
    else {
      // isPrefilled = false
      isPrefilled = /* utils.isSimulator() &&*/  ENV.prefillForms && model.id in formDefaults
      if (isPrefilled)
        _.extend(r, formDefaults[model.id])
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

  formRequest(resource, vCols, prop, styles) {
    const { bankStyle, to, application, context, productToForms, chooseTrustedProvider, shareableResources } = this.props
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

    let form = utils.getModel(resource.form)
    // if (this.props.shareableResources)
    //   style = styles.description;
    let onPressCall
    // if (s.length === 2)
    //   onPressCall = this.editForm.bind(self, msgParts[1], msgParts[0])
    let sameFormRequestForm
    let isMyMessage = this.isMyMessage(to[TYPE] === ORGANIZATION ? to : null);
    let { product } = resource
    let isMyProduct = utils.getModel(resource.form).subClassOf === MY_PRODUCT
    if (!resource._documentCreated  &&  product) {
      let multiEntryForms = utils.getModel(product).multiEntryForms
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
      if (!sameFormRequestForm  &&  !isMyProduct)
        onPressCall = this.createNewResource.bind(this, form, isMyMessage);
    }

    let color = isMyMessage
              ? {color: '#AFBBA8'}
              : {color: '#2892C6'}
    let icon
    let isReadOnlyContext = context  &&  utils.isReadOnlyChat(context)
    let me = utils.getMe()
    let switchToContext = me.isEmployee  &&  context  &&  resource.product  && context.to.organization  &&  context.to.organization.id === me.organization.id

    let isReadOnly = application != null

    if (!isReadOnly)
      isReadOnly = !switchToContext  && !context &&  (!isMyMessage  &&  utils.isReadOnlyChat(this.props.resource, this.props.resource._context)) //this.props.context  &&  this.props.context._readOnly

    let addMessage = messagePart || message
    messagePart = null
    let msg, link

    let hasSharables = this.hasSharables()

    let isRequestForNext = sameFormRequestForm  &&  !resource._documentCreated
    let msgWidth = utils.getMessageWidth(FormRequestRow)
    if (isRequestForNext) {
      let animStyle = {transform: [{scale: this.springValue}]}

// this.springValue.interpolate({
//   inputRange: [0, 1],
//   outputRange: [0, 100],
// });
       link = <View style={{flex: 1}}>
               <View style={{flex: 1, paddingTop: 10}}>
                 {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage, isAnother: true})}
                 <View style={styles.hr}/>
                 <TouchableOpacity onPress={() => {
                    Alert.alert(
                      translate('areYouSureAboutNextForm', translate(form)),
                      null,
                      [
                        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                        {text: translate('Ok'), onPress: onOK.bind(this)},
                      ]
                    )
                 }}>
                   <View style={[styles.row, {paddingTop: 10}]}>
                     <Animated.View style={animStyle}>
                       <View style={hasSharables  && styles.addButton  ||  styles.shareButton}>
                         <Icon name='ios-arrow-forward' size={20} color={hasSharables && bankStyle.linkColor || '#ffffff'}/>
                       </View>
                     </Animated.View>
                     <View style={{justifyContent: 'center'}}>
                       <Text style={styles.addMore}>{translate('moveToTheNextForm')}</Text>
                     </View>
                    </View>
                </TouchableOpacity>
              </View>
             </View>
    }
    else {
      let linkColor = isMyMessage ? bankStyle.myMessageLinkColor : bankStyle.linkColor

      let notLink = resource._documentCreated  ||  isReadOnly  ||  isMyProduct  || resource.form === PRODUCT_REQUEST
      icon = <Icon  name={'ios-arrow-forward'} color={linkColor} size={20} />
      if (notLink) {
        if (form.id  === PRODUCT_REQUEST) {
          const rotateX = this.spinValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '180deg', '0deg']
          })
          // addMessage = 'You can choose the product by clicking on a red  menu button'
          let style = {transform: [{rotate: rotateX}]}
          msg = <TouchableOpacity onPress={() => this.props.productChooser(prop)} style={styles.message}  key={this.getNextKey()}>
                  <Animated.View style={style}>
                    <View style={[styles.addButton, {backgroundColor: '#007EFF', marginRight: 10}]}>
                      <Icon name='md-information' size={35} color='#ffffff' />
                    </View>
                  </Animated.View>
                  <Text style={[chatStyles.resourceTitle, {color: '#757575', width: msgWidth - 70}]}>{addMessage}</Text>
                </TouchableOpacity>
        }
        else if (isMyProduct) {
          msg = <View style={{justifyContent: 'center'}} key={this.getNextKey()}>
                  <Text style={styles.addMore}>{addMessage}</Text>
                </View>
        }
      }
      else {
        if (resource.verifiers)
          onPressCall = chooseTrustedProvider.bind(this, this.props.resource, form, isMyMessage)
        else if (!prop)
          onPressCall = this.createNewResource.bind(this, form, isMyMessage)
        else {
          if (prop.scanner === 'payment-card') {
            if (!utils.isWeb()) {
              msg = <View key={this.getNextKey()}>
                      <View style={styles.messageLink}>
                        {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage, onPress: this.scanCard.bind(this, prop)})}
                      </View>
                    </View>
            }
          }
          else if (prop.ref == PHOTO) {
            // TODO: re-use logic from NewResourceMixin
            if (utils.isWeb() && ENV.canUseWebcam) {
              msg = <View key={this.getNextKey()}>
                      <View style={styles.row}>
                        <TouchableOpacity style={styles.container} underlayColor='transparent' onPress={this.showCamera.bind(this, prop)}>
                          <Text style={[chatStyles.resourceTitle, resource.documentCreated ? {color: '#aaaaaa'} : {}]}>{addMessage}</Text>
                        </TouchableOpacity>
                       {resource.documentCreated ? null : icon}
                      </View>
                    </View>
            }
            else {
              msg = <View key={this.getNextKey()}>
                     <View style={styles.row}>
                       <ImageInput prop={prop} style={styles.container} onImage={item => this.onSetMediaProperty(prop.name, item)}>
                         <Text style={[chatStyles.resourceTitle, resource.documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{addMessage}</Text>
                       </ImageInput>
                       {resource.documentCreated ? null : icon}
                     </View>
                   </View>
            }
          }
          else if (form.id === IPROOV_SELFIE) {
            let mColor
            if (resource._documentCreated)
              mColor = bankStyle.incomingMessageOpaqueTextColor
            else
              mColor = bankStyle.incomingMessageTextColor

             msg = <View key={this.getNextKey()}>
                     <TouchableOpacity onPress={() => this.showIproovScanner(prop, prop.name)}>
                       <View style={styles.row}>
                         <Text style={[chatStyles.resourceTitle, {flex: 1, color: mColor}]}>{addMessage}</Text>
                         {resource._documentCreated ? null : icon}
                       </View>
                     </TouchableOpacity>
                   </View>
          }
          else if (prop.signature) {
            msg = <View key={this.getNextKey()}>
                    <View style={styles.messageLink}>
                      {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage, onPress: this.showSignatureView.bind(this, prop)})}
                    </View>
                  </View>
          }
        }
      }
    }

    if (!msg) {
      let mColor, addMore
      if (resource._documentCreated)
        mColor = bankStyle.incomingMessageOpaqueTextColor
      else {
        mColor = bankStyle.incomingMessageTextColor
        if (!sameFormRequestForm) {
          addMore = <View style={{ marginLeft: -5}}>
                      {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage})}
                    </View>
          // if (!shareableResources)
            addMessage = null
        }
      }
      if (addMessage) {
        // if (isRequestForNext  ||  shareableResources)
        //   addMessage = DEFAULT_MESSAGE
        if (!isRequestForNext)
          messagePart = <Text style={[chatStyles.resourceTitle, {flex: 1, alignSelf: 'flex-start', color: mColor}, this.hasSharables() && {paddingBottom: 15}]}>{addMessage}</Text>
      }
      msg = <View key={this.getNextKey()}>
               <View style={styles.messageLink}>
                 {messagePart}
                 {addMore}
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
        _context: resource._context,
        // _context: self.props.context  ||  resource._context,
        [TYPE]: NEXT_FORM_REQUEST,
        after: form.id
      }})
      var params = {
        value: {_documentCreated: true, _document: utils.getId(resource)},
        doneWithMultiEntry: true,
        resource: resource,
        meta: utils.getModel(resource[TYPE])
      }
      Actions.addChatItem(params)
    }
  }
  hasSharables() {
    let shareableResources = this.props.shareableResources
    if (!shareableResources)
      return
    let rtype = this.props.resource.form
    let multientryResources = shareableResources.multientryResources
    if (!utils.isEmpty(multientryResources)  &&  multientryResources[rtype])
      return true

    let verifications = shareableResources.verifications
    if (!utils.isEmpty(verifications)  &&  verifications[rtype])
      return true
  }
  makeButtonLink({form, isMyMessage, styles, msg, isAnother, onPress}) {
    if (!msg)
      msg = translate(isAnother ? 'createNext' : 'createNew', utils.makeModelTitle(form))
    let width = utils.getMessageWidth(FormRequestRow) - 40
    let { application, bankStyle } = this.props
    if (application) {
      return (
         <View style={[styles.row, isAnother ? {paddingBottom: 5} : {}]}>
           <View style={{justifyContent: 'center', width}}>
             <Text style={styles.addMore}>{msg}</Text>
           </View>
         </View>
      )
    }
    let zoomIn = {transform: [{scale: this.springValue}]}
    let hasSharables = this.hasSharables()
    return <TouchableOpacity style={{paddingRight: 15}} onPress={onPress || this.createNewResource.bind(this, form, isMyMessage)}>
             <View style={[styles.row, isAnother ? {paddingBottom: 5} : {}]}>
              <Animated.View style={zoomIn}>
                <View style={hasSharables  && styles.addButton  ||  styles.shareButton}>
                  <Icon name='md-add' size={20} color={hasSharables && bankStyle.linkColor || '#ffffff'}/>
                </View>
              </Animated.View>
               <View style={{justifyContent: 'center', width}}>
                 <Text style={styles.addMore}>{msg}</Text>
               </View>
             </View>
           </TouchableOpacity>

  }
  async scanCard(prop) {
    let cardJson
    try {
      const card = await CardIOModule.scanCard({
        hideCardIOLogo: true,
        suppressManualEntry: true,
        // suppressConfirmation: true,
        // scanExpiry: true,
        requireExpiry: true,
        requireCVV: true,
        // requirePostalCode: true,
        requireCardholderName: true,
        keepStatusBarStyle: true,
        suppressScannedCardImage: true,
        scanInstructions: 'Frame FRONT of card.\nBonus: get all the edges to light up',
        detectionMode: CardIOUtilities.IMAGE_AND_NUMBER
      })
      cardJson = utils.clone(card)
    } catch (err) {
      // user canceled
      return
    }

    let resource = this.props.resource
    let r = { [TYPE]: resource.form, to: resource.from, from: utils.getMe() }
    let props = utils.getModel(r[TYPE]).properties
    for (let p in cardJson) {
      if (cardJson[p]  &&  props[p])
        r[p] = cardJson[p]
    }
    for (let p in cardJson)
      if (!cardJson[p])
        delete cardJson[p]
    r[prop.name + 'Json'] = cardJson
    this.setState({ r })

    Actions.addChatItem({resource: r, disableFormRequest: resource})
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

  chooser(prop) {
    let oResource = this.props.resource
    let model = utils.getModel(oResource.form)
    let resource = {
      [TYPE]: model.id,
      from: utils.getMe(),
      to: oResource.from
    }
    if (oResource._context)
      resource._context = oResource._context

    var propRef = prop.ref
    var m = utils.getModel(propRef);
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
          Actions.addChatItem({resource: resource, disableFormRequest: oResource})
        },
      }
    });
  }
  showSignatureView(prop) {
    const { navigator, bankStyle } = this.props
    let sigView
    navigator.push({
      title: translate(prop), //m.title,
      // titleTextColor: '#7AAAC3',
      id: 32,
      component: SignatureView,
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      onRightButtonPress: () => {
        const sig = sigView.getSignature()
        navigator.pop()
        this.onSetSignatureProperty(prop, sig.url)
      },
      passProps: {
        ref: ref => {
          sigView = ref
        },
        bankStyle,
        sigViewStyle: bankStyle
      }
    })
  }
}

function isMultientry(resource) {
  if (!resource.product)
    return false
  let form = utils.getModel(resource.form)
  let product = utils.getModel(resource.product)
  let multiEntryForms = product.multiEntryForms
  return  multiEntryForms && multiEntryForms.indexOf(form.id) !== -1 ? true : false
}

var createStyles = utils.styleFactory(FormRequestRow, function ({ dimensions, bankStyle }) {
  let msgWidth = utils.getMessageWidth(FormRequestRow)
  return StyleSheet.create({
    container: {
      flex: 1
    },
    row: {
      flexDirection: 'row',
      paddingHorizontal: 3,
      // paddingVertical: 5,
      // justifyContent: 'space-between'
    },
    hr: {
      backgroundColor: '#eeeeee',
      height: 1,
      marginHorizontal: -10,

    },
    assistentText: {
      color: '#757575',
      fontStyle: 'italic',
      fontSize: 17,
      alignSelf: 'center'
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
    shareablesArea: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      backgroundColor: '#ffffff'
    },
    shareablesList: {
      paddingTop: 3,
      marginHorizontal: 0,
      paddingRight: 3,
      // backgroundColor: '#ffffff'
    },
    orgView: {
      // maxWidth: msgWidth - 150,
      paddingLeft: 10,
      marginRight: 10,
      flex: 1,
      justifyContent: 'center'
    },
    // orText: {
    //   fontStyle: 'italic',
    //   alignSelf: 'center',
    //   color: '#aaaaaa',
    //   fontSize: 16,
    // },
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
      paddingBottom: 3,
      backgroundColor: '#dddddd'
    },
    arrow: {
      marginRight: 10,
      marginTop: 5
    },
    link: {
      paddingBottom: 15,
    },
    center: {
      justifyContent: 'center'
    },
    messageLink: {
      // flexDirection: 'row',
      flex: 1,
      // minHeight: 35,
      paddingLeft: 5,
      // alignItems: 'center',
      justifyContent: 'space-between',
    },
    message: {
      flexDirection: 'row',
      // flex: 1,
      minHeight: 35,
      paddingLeft: 5,
      // justifyContent: 'center'
      alignItems: 'center',
      // justifyContent: 'space-between',
    },
    shareButton: {
      ...circled(40),
      backgroundColor: bankStyle.linkColor,
      shadowOpacity: 0.7,
      opacity: 0.9,
      shadowRadius: 5,
      shadowColor: '#afafaf',
    },
    addButton: {
      ...circled(40),
      backgroundColor: '#eeeeee',
      shadowOpacity: 0.7,
      shadowRadius: 5,
      shadowColor: '#afafaf',
      borderColor: bankStyle.linkColor,
      borderWidth: StyleSheet.hairlineWidth,
    },
    // myProductSeparator: {
    //   backgroundColor: bankStyle.verifiedBg,
    //   height: 1,
    //   flex: 1,
    //   alignSelf: 'stretch'
    // },
    addMore: {
      color: '#757575', // bankStyle.linkColor,
      fontSize: 18,
      paddingHorizontal: 10,
      width: msgWidth - 50
    },
    // next: {
    //   color: '#555555',
    //   fontSize: 16,
    //   // paddingLeft: 10
    // },
    mstyle: {
      borderColor: 'transparent',
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 0,
      paddingVertical: 10
    },
    shareable: {
      margin: 1,
      // marginTop: -37,
      marginTop: -5,
      flex: 1,
      // width: msgWidth - 155,
      backgroundColor: '#ffffff',
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10
    },
    formRequest: {
      // backgroundColor: '#ffffff',
      margin: 2,
      paddingVertical: 3,
      backgroundColor: bankStyle.backgroundImage && 'transparent' || bankStyle.backgroundColor
    },
  })
})
reactMixin(FormRequestRow.prototype, RowMixin)
FormRequestRow = makeResponsive(FormRequestRow)

module.exports = FormRequestRow;
