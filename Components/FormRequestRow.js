import {
  // Text,
  TouchableOpacity,
  Alert,
  View,
  Platform,
  Animated,
  Easing,
} from 'react-native'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import _ from 'lodash'
import { CardIOUtilities } from 'react-native-awesome-card-io';
import { makeResponsive } from 'react-native-orient'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons';
import Reflux from 'reflux'
// const debug = require('debug')('tradle:app:FormRequestRow')

import constants from '@tradle/constants'

import { Text } from './Text'
import utils, { translate } from '../utils/utils'
import { parseMessage } from '../utils/uiUtils'
import RowMixin from './RowMixin'
import ImageInput from './ImageInput'
import OnePropFormMixin from './OnePropFormMixin'

// import CustomIcon from '../styles/customicons'
import formDefaults from '../data/formDefaults'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import StyleSheet from '../StyleSheet'

import { circled } from '../styles/utils'

import chatStyles from '../styles/chatStyles'
import Image from './Image'
import strings from '../utils/strings_en'

const PHOTO = 'tradle.Photo'
const FORM_REQUEST = 'tradle.FormRequest'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const CONFIRM_PACKAGE_REQUEST = 'tradle.ConfirmPackageRequest'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const IPROOV_SELFIE = 'tradle.IProovSelfie'
const SELFIE = 'tradle.Selfie'
const REFRESH = 'tradle.Refresh'
// const DEFAULT_MESSAGE = 'Would you like to...'
const {
  TYPE,
  ROOT_HASH
} = constants

const {
  ORGANIZATION,
  FORM,
} = constants.TYPES

import Navigator from './Navigator'

import ENV from '../utils/env'
class FormRequestRow extends Component {
  static displayName = 'FormRequestRow';
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    bankStyle: PropTypes.object,
    to: PropTypes.object,
    sendStatus: PropTypes.bool,
    application: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    shareableResources: PropTypes.object,
    share: PropTypes.func
  };

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

    this.listenTo(Store, 'onAction');
  }
  onAction(params) {
    const { action, shareableResources, resource } = params
    if (action !== 'showShare')
      return
    if (resource[ROOT_HASH] !== this.props.resource[ROOT_HASH])
      return
    this.showDocumentsToShare(shareableResources)
  }
  shouldComponentUpdate(nextProps, nextState) {
    let { resource, to } = this.props
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
    const { resource, to, bankStyle, application } = this.props

    var isMyMessage = this.isMyMessage(to[TYPE] === ORGANIZATION ? to : null);
    let ownerPhoto = this.getOwnerPhoto(isMyMessage)

    let message = resource.message
    let renderedRow = [];

    let onPressCall
    let isFormRequest = resource[TYPE] === FORM_REQUEST

    let props = utils.getEditableProperties(resource)
    let prop = props.length === 1  &&  props[0]
    let hasMoreProps
    if (!prop  &&  isFormRequest) {
      const formModel = utils.getModel(resource.form)
      const editCols = formModel.editCols
      // if (editCols  &&  editCols.length === 1) {
      //   let p = formModel.properties[editCols[0]]
      //   if (p.scanner  &&  p.scanner === 'payment-card')
      //     prop = p
      // }
      const props = formModel.properties
      if (editCols) {
        prop = editCols.find(p => props[p]  &&  props[p].scanner === 'payment-card')
        if (prop  &&  editCols.length) {
          prop = props[prop]
          hasMoreProps = true
        }
      }
    }

    let linkColor
    if (application)
      linkColor = '#757575'
    else
      linkColor = isMyMessage ? bankStyle.myMessageLinkColor : bankStyle.linkColor

    let styles = createStyles({bankStyle, isMyMessage, resource, application})
    let msgWidth = utils.getMessageWidth(FormRequestRow)
    if (isFormRequest)
      onPressCall = this.formRequest({resource, renderedRow, prop, styles, hasMoreProps})
    else {
      onPressCall = resource._documentCreated ? null : this.reviewFormsInContext.bind(this)
      let icon = <Icon style={{marginTop: 2, marginRight: 2, color: linkColor}} size={20} name={'ios-arrow-forward'} />
      let params = { resource, message, bankStyle, noLink: application != null || resource._documentCreated }
      let msg = parseMessage(params)
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
    let msgL = this.hasSharables() ? msgWidth : message.length * utils.getFontSize(16)
    var viewStyle = {
      flexDirection: 'row',
      borderTopRightRadius: 10,
      width:  Math.min(msgWidth, msgL),
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start'
    }

    if (this.state  &&  this.state.sendStatus  &&  this.state.sendStatus !== null)
      sendStatus = this.getSendStatus()
    var sealedStatus = resource.txId  &&
                      <View style={chatStyles.sealedStatus}>
                         <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                       </View>

    let addStyle = [chatStyles.verificationBody, styles.mstyle]
    if (message.length < 30)
      addStyle.push(styles.container)
    var shareables
    if (isFormRequest  && !resource._documentCreated)
      shareables = this.showShareableResources(styles)

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

    let messageBody
    let isMyProduct = isFormRequest  &&  utils.isMyProduct(resource.form)
    if (prop  ||  isMyProduct  ||  application  ||  resource._documentCreated)
      messageBody = msgContent
    else
      messageBody = <TouchableOpacity onPress={onPressCall ? onPressCall : () => {}}>
                      {msgContent}
                    </TouchableOpacity>

    let contextId = this.getContextId(resource)
    return (
      <View style={styles.formRequest}>
        {this.getChatDate(resource)}
        <View style={shareables ? {borderWidth: 1, width: msgWidth + 2, borderColor: '#dddddd', backgroundColor: bankStyle.incomingMessageBgColor, borderRadius: 10, borderTopLeftRadius: 0} : {}}>
          {messageBody}
          {sendStatus}
          {shareables}
        </View>
        {contextId}
      </View>
    )
  }

  showShareableResources(styles) {
    let { resource, shareableResources, productToForms, bankStyle, to } = this.props
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
    let { verifications, providers, multientryResources } = shareableResources
    let resourceContextId = resource._context  &&  utils.getId(resource._context)
    let hasMultientry = !utils.isEmpty(multientryResources)
    if (hasMultientry) {
      for (let t in  multientryResources) {
        if (t !== formModel.id)
          continue
        let meverifications = multientryResources[t]
        if (meverifications.length > 1) {
          let meShare = this.formatMultiEntryShareable({verifications: meverifications, model: formModel, multiChooser: true, styles})
          vtt.push(meShare)
        }
      }
    }
    if (!vtt.length) {
      for (var t in  verifications) {
        if (t !== formModel.id)
          continue
        let ver = verifications[t]
        let totalShareables = ver.length
        let r = ver[0]
        // ver.forEach((r) => {
          let document = r.document
          if (entries  &&  (entries.indexOf(utils.getId(document)) !== -1  ||  entries.indexOf(r.document[constants.NONCE]) !== -1))
            return
          // Dont' share forms for the same product
          if (resourceContextId  &&  document._context  && resourceContextId === utils.getId(document._context))
            return
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
          if (totalShareables === 1)
            vtt.push(doc);
          else {
            let total = `You have ${totalShareables} resource to share`
            vtt.push(
              <View key={this.getNextKey()}>
                {doc}
                <TouchableOpacity onPress={() => Actions.showAllShareables(resource, to)} style={{alignItems: 'center', padding: 10, borderTopWidth: 1, marginTop: 5, borderTopColor: '#ddd'}}>
                  <Text style={{fontSize: 14, color: bankStyle.buttonBgColor || bankStyle.linkColor}}>{total}</Text>
                </TouchableOpacity>
              </View>
             )
          }
          cnt++;
        // })
      }
    }
    if (!vtt.length)
      return null

    var modelTitle = translate(formModel)
    let number = vtt.length //numbers[vtt.length]
    let offerToShare = "orShare"


    let or
    if (formModel.subClassOf === 'tradle.MyProduct')
      or = <View style={{paddingVertical: 5}}>
            <View style={{backgroundColor: bankStyle.verifiedBg, height: 1, flex: 1, alignSelf: 'stretch'}}/>
          </View>
    else {
      let abStyle = {backgroundColor: bankStyle.verifiedBg, height: 1, flex: 5, alignSelf: 'center'}
      or = <View style={styles.row}>
            <View style={abStyle}/>
            <View style={styles.assistentBox}>
              <Text style={[styles.orText, {color: bankStyle.verifiedBg}]}>{translate('orShare')}</Text>
            </View>
            <View style={abStyle}/>
          </View>
    }

    return (
      <View style={styles.shareable} key={this.getNextKey()}>
        {or}
        <View style={styles.container}>
          <View style={styles.shareablesList}>
            {vtt}
          </View>
        </View>
      </View>
     );
  }
  formatShareables(params) {
    let { verification, onPress, styles } = params
    let { resource, onSelect, to, share } = this.props

    let document = verification.document

    let docModel = utils.getModel(document[TYPE]);
    let docModelTitle = docModel.title || utils.makeLabel(docModel.id)
    let idx = docModelTitle.indexOf('Verification');
    let docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    let msg;
    if (document.message  &&  !utils.isForm(docModel))
      msg = <View><Text style={chatStyles.description}>{document.message}</Text></View>

    let displayName
    let propLabel
    if (utils.isMyProduct(docModel))
      displayName = translate(docModel)
    else {
      let propsUsed = []
      displayName = utils.getDisplayName(document, docModel, propsUsed)
      if (propsUsed.length)
        propLabel = <Text style={styles.propertyTitle}>{translate(propsUsed[0], docModel)}</Text>
    }

    let headerContent = <View style={styles.headerStyle}>
                          {propLabel}
                          <Text style={styles.docText}>{displayName}</Text>
                        </View>

    headerContent = <TouchableOpacity onPress={onSelect.bind(this, {resource: document, verification})}>
                     <View style={styles.header}>
                       {headerContent}
                     </View>
                   </TouchableOpacity>
    let orgRow = <View/>
    // let doShareDocument = (typeof resource.requireRawData === 'undefined')  ||  resource.requireRawData
    let isItem = utils.isSavedItem(document)
    if (verification  && (verification.organization || isItem)) {
      let {verifiedBy, shareView, orgTitle, orgView} = this.getParts(verification, isItem, styles)
      if (onPress) {
      }
      else if (resource._documentCreated) {
        orgRow =  <View style={chatStyles.shareView}>
                    {shareView}
                    <TouchableOpacity onPress={onSelect.bind(this, { resource: document, verification })}>
                      {orgView}
                    </TouchableOpacity>
                  </View>
      }
      else {
        orgRow = <View style={chatStyles.shareView}>
                   <TouchableOpacity onPress={onPress ? onPress : () =>
                            Alert.alert(
                              `Sharing "${docTitle}"`,
                              null,
                              [
                                {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                                {text: translate('Share'), onPress: share.bind(this, verification, to, resource)},
                              ]
                          )}>
                    {shareView}
                   </TouchableOpacity>
                   <View style={{justifyContent:'center'}}>
                     {headerContent}
                     <TouchableOpacity onPress={onSelect.bind(this, { resource: document, verification })}>
                       {orgView}
                     </TouchableOpacity>
                   </View>
                </View>
      }
    }
    let content = <View style={{flex:1, paddingVertical: 3}}>
                     <TouchableOpacity onPress={onSelect.bind(this, { resource: document, verification })}>
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
    let { resource, to, shareableResources } = this.props
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

    // let style={transform: [{scale: this.zoomIn}]}
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
      else if (document._sentTo)
        verifiedBy = translate('sentTo', document._sentTo.title)
    }
    let verifiedByView
    if (verifiedBy)
      verifiedByView = <Text style={chatStyles.description}>
                         {verifiedBy}
                       </Text>

    let date = verification.dateVerified || document._time
    let dateView = <View style={{flexDirection: 'row'}}>
                     <Text style={styles.verifiedDate}>{utils.formatDate(date)}</Text>
                   </View>

    let orgView = <View style={styles.orgView}>
                    {verifiedByView}
                    {dateView}
                  </View>
    return {verifiedBy, orgPhoto, shareView, orgTitle, orgView}
  }
  formatMultiEntryShareable(params) {
    // let { model, verifications, onPress, context, providers } = params
    let { verifications, onPress, multiChooser, styles } = params
    let { bankStyle, resource, onSelect } = this.props

    let documents = verifications.map((v) => v.document)
    let verification = verifications[0]
    let document = documents[0]

    let headerStyle = {paddingTop: 5, paddingLeft: 10}

    let orgRow
    let isItem = utils.isSavedItem(document)
    let headerContent = <View style={headerStyle}>
                          <Text style={styles.multiEntryDocText}>{translate('multientryToShare', documents.length)}</Text>
                        </View>

    if (verification  && (verification.organization || isItem)) {
      let { verifiedBy, shareView, orgView } = this.getParts(verification, isItem, styles)
      if (onPress) {
      }
      else if (resource._documentCreated) {
        orgRow =  <View style={chatStyles.shareView}>
                    {shareView}
                    <View>
                      {headerContent}
                      <TouchableOpacity onPress={onSelect.bind(this, { resource: document, verification })}>
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
                     <TouchableOpacity onPress={onSelect.bind(this, { resource: documents, verifications })}>
                       {headerContent}
                     </TouchableOpacity>
                     <TouchableOpacity onPress={onSelect.bind(this, { resource: documents, verifications })}>
                       {orgView}
                     </TouchableOpacity>
                   </View>
                </View>
      }
    }
    let content = <View style={{flex:1, paddingVertical: 3}}>
                     {orgRow}
                   </View>

    return <View style={styles.container} key={this.getNextKey()}>
             {content}
           </View>
  }
  showDocumentsToShare(shareableResources) {
    const { navigator, resource, to } = this.props
    let { verifications } = shareableResources
    verifications = verifications[resource.form]
    let documents = verifications.map((v) => v.document)
    this.showDocuments({documents, verifications, verifiedBy: to.name || to.title, multiChooser: false})
  }
  showDocuments({documents, verifications, verifiedBy, multiChooser}) {
    let { navigator, bankStyle, resource, to } = this.props
    let modelName = documents[0][TYPE]
    let m = utils.getModel(modelName)
    let title = translate(m) + (verifiedBy  &&  ('  →  '  + verifiedBy))
    navigator.push({
      title,
      componentName: 'ShareResourceList',
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

  createNewResource({model, isMyMessage, resource}) {
    let { currency, country, bankStyle, defaultPropertyValues, navigator } = this.props
    if (!model)
      model = utils.getModel(resource[TYPE])
    if (model.abstract) {
      let subList = utils.getAllSubclasses(model.id)

      navigator.push({
        title: translate(model),
        componentName: 'StringChooser',
        backButtonTitle: 'Back',
        sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
        passProps: {
          strings: subList, // model.additionalForms,
          notModel: true,
          bankStyle,
          callback:  val => this.createNewResource({model: utils.getModel(val)})
        }
      });
      return
    }
    let formRequest = this.props.resource
    let isPrefilled
    let r
    if (resource)
      r = resource
    else {
      r = {
        from: formRequest.to,
        to: formRequest.from,
        _context: formRequest._context,
        [TYPE]: model.id
      }

      // Prefill for testing and demoing
      if (ENV.prefillForms  &&  model.id in formDefaults) {
        _.extend(r, formDefaults[model.id])
        isPrefilled = true
      }

      if (formRequest.prefill) {
        _.defaults(r, formRequest.prefill)
        isPrefilled = true
      }
    }
    if (!resource  &&  model.autoCreate) {
      Actions.addChatItem({resource: r}) //, cb: this.createNewResource.bind(this)})
      return
    }

    let action = utils.getModel(formRequest.form).abstract && 'replace' || 'push'
    navigator[action]({
      title: translate(model),
      rightButtonTitle: isMyMessage ? null : 'Done',
      backButtonTitle: 'Back',
      componentName: 'NewResource',
      // titleTextColor: '#7AAAC3',
      passProps:  {
        model,
        resource: r,
        isPrefilled,
        currency,
        country,
        bankStyle,
        originatingMessage: formRequest,
        defaultPropertyValues,
      }
    });
  }

  formRequest({resource, renderedRow, prop, styles, hasMoreProps}) {
    const { bankStyle, to, application, context, productToForms, chooseTrustedProvider } = this.props
    let message = resource.message
    let params = { resource, message, bankStyle, noLink: application != null  || resource._documentCreated }
    let messagePart = parseMessage(params)
    if (typeof messagePart === 'string')
      messagePart = null

    let form = utils.getModel(resource.form)
    let onPressCall
    let sameFormRequestForm
    let isMyMessage = this.isMyMessage(to[TYPE] === ORGANIZATION ? to : null);
    let { product } = resource
    let isMyProduct = utils.isMyProduct(resource.form)
    if (!resource._documentCreated  &&  product) {
      let multiEntryForms = utils.getModel(product).multiEntryForms
      let hasMultiEntry = multiEntryForms  &&  productToForms
      if (multiEntryForms  &&  multiEntryForms.indexOf(form.id) !== -1  &&  productToForms) {
        let forms = productToForms[product]
        if (forms) {
          let formsArray = forms[resource.form]
          if (!formsArray  &&  utils.getModel(resource.form).abstract) {
            for (let f in forms) {
              if (utils.getModel(f).subClassOf === resource.form)
                sameFormRequestForm = true
            }
          }
          if (formsArray)
            sameFormRequestForm = true
        }
      }
      if (!sameFormRequestForm  &&  !isMyProduct)
        onPressCall = this.createNewResource.bind(this, {model: form, isMyMessage});
    }

    let icon
    let me = utils.getMe()
    let switchToContext = me.isEmployee  &&  context  &&  resource.product  && context.to.organization  &&  context.to.organization.id === me.organization.id

    let isReadOnly = application != null

    if (!isReadOnly)
      isReadOnly = !switchToContext  && !context &&  (!isMyMessage  &&  utils.isReadOnlyChat(this.props.resource, this.props.resource._context)) //this.props.context  &&  this.props.context._readOnly

    let addMessage = messagePart || translate(message)
    messagePart = null
    let msg, link

    let hasSharables = this.hasSharables()

    let isRequestForNext = sameFormRequestForm  &&  !resource._documentCreated
    // HACK
    if (isRequestForNext) {
      if (resource.message.startsWith(strings.reviewScannedProperties))
        isRequestForNext = false
    }

    let msgWidth = utils.getMessageWidth(FormRequestRow)
    let isRefresh = resource.form === REFRESH
    if (isRequestForNext) {
      let animStyle = {transform: [{scale: this.springValue}], paddingLeft: 5, marginLeft: -3}
      let buttons = (
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
      )
      // this.springValue.interpolate({
      //   inputRange: [0, 1],
      //   outputRange: [0, 100],
      // });
      link = (
        <View style={{flex: 1}}>
          <View style={{flex: 1, paddingTop: 10}}>
            {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage, isAnother: true})}
            <View style={styles.hr}/>
            <TouchableOpacity onPress={this.moveToTheNextForm.bind(this, form)}>
              {buttons}
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    else {
      let linkColor = isMyMessage ? bankStyle.myMessageLinkColor : bankStyle.linkColor

      let notLink = resource._documentCreated  ||  isReadOnly  ||  isMyProduct  || resource.form === PRODUCT_REQUEST
      if (notLink) {
        if (form.id  === PRODUCT_REQUEST) {
          const rotateX = this.spinValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '180deg', '0deg']
          })
          // addMessage = 'You can choose the product by clicking on a red  menu button'
          let style = {transform: [{rotate: rotateX}], paddingLeft: 5, marginLeft: -3}
          msg = <TouchableOpacity onPress={() => this.props.productChooser(prop)} style={[styles.message, {paddingVertical: utils.isAndroid() ? 5 : 0}]}  key={this.getNextKey()}>
                  <Animated.View style={style}>
                    <View style={styles.infoButton}>
                      <Icon name='md-information' size={35} color='#ffffff' />
                    </View>
                  </Animated.View>
                  <Text style={[chatStyles.resourceTitle, {color: '#757575', width: msgWidth - 60}]}>{addMessage}</Text>
                </TouchableOpacity>
        }
        else if (isMyProduct) {
          msg = <View style={{justifyContent: 'center'}} key={this.getNextKey()}>
                  <Text style={styles.addMore}>{addMessage}</Text>
                </View>
        }
      }
      else {
        if (isRefresh) {
          // onPressCall = this.reviewFormsInContext.bind(this, {isRefresh})
          msg = <View key={this.getNextKey()}>
                  <View style={styles.messageLink}>
                    {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage, onPress: this.reviewFormsInContext.bind(this, {isRefresh})})}
                  </View>
                </View>
        }
        else if (resource.verifiers)
          onPressCall = chooseTrustedProvider.bind(this, this.props.resource, form, isMyMessage)
        else if (!prop)
          onPressCall = this.createNewResource.bind(this, {model: form, isMyMessage})
        else {
          icon = <Icon  name={'ios-arrow-forward'} color={linkColor} size={20} style={styles.arrowForward}/>

          if (prop.scanner === 'payment-card') {
            if (!utils.isWeb()) {
              msg = <View key={this.getNextKey()}>
                      <View style={styles.messageLink}>
                        {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage, onPress: this.scanPaymentCard.bind(this, {prop, dontCreate: hasMoreProps})})}
                      </View>
                    </View>
            }
          }
          else if (prop.signature) {
            msg = <View key={this.getNextKey()}>
                    <View style={styles.messageLink}>
                      {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage, onPress: this.showSignatureView.bind(this, prop, this.onSetSignatureProperty.bind(this))})}
                    </View>
                  </View>
          }
          else if (prop.ref === PHOTO) {
            let useImageInput
            const isScan = prop.scanner //  &&  prop.scanner === 'id-document'
            if (utils.isWeb())
              useImageInput = isScan || !ENV.canUseWebcam || prop.allowPicturesFromLibrary
            else
              useImageInput = utils.isSimulator()  ||  (prop.allowPicturesFromLibrary  &&  !isScan)

            let actionItem
            if (useImageInput)
              actionItem = this.makeButtonLink({form, isMyMessage, prop, styles, msg: addMessage, onPress: (item) => this.onSetMediaProperty(prop.name, item), useImageInput})
            else {
              let isSelfie = resource.form === SELFIE
              actionItem = this.makeButtonLink({
                form,
                isMyMessage,
                prop,
                styles,
                msg: addMessage,
                onPress: () => {
                  if (isSelfie)
                    this.verifyLiveness({prop, component: resource.prefill  &&  resource.prefill.component})
                  else
                    this.showCamera({prop: prop})
                }
              })
              // actionItem = <TouchableOpacity underlayColor='transparent' onPress={isSelfie && this.verifyLiveness.bind(this, {prop}) || this.showCamera.bind(this, {prop})}>
              //                <Text style={[chatStyles.resourceTitle, resource._documentCreated ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{addMessage}</Text>
              //              </TouchableOpacity>
            }

            msg = <View key={this.getNextKey()}>
                   <View style={styles.thumbView}>
                     {actionItem}
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
                     <TouchableOpacity onPress={() => this.showIproovScanner(prop, prop.name)}>
                       <View style={styles.row}>
                         <Text style={[chatStyles.resourceTitle, {flex: 1, color: mColor}]}>{addMessage}</Text>
                         {resource._documentCreated ? null : icon}
                       </View>
                     </TouchableOpacity>
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
          addMore = <View style={{ marginLeft: -5 }}>
                      {this.makeButtonLink({form, isMyMessage, styles, msg: addMessage})}
                    </View>
          // if (!shareableResources)
            addMessage = null
        }
      }
      if (addMessage) {
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
    renderedRow.push(msg);
    return isReadOnly || isRefresh ? null : onPressCall
  }
  moveToTheNextForm(form) {
   Alert.alert(
     translate('areYouSureAboutNextForm', translate(form)),
     null,
     [
       {text: translate('cancel'), onPress: () => console.log('Canceled!')},
       {text: translate('Ok'), onPress: this.onOK.bind(this)},
     ]
   )
  }
  onOK() {
    let { resource } = this.props
    let form = utils.getModel(resource.form)

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
  makeButtonLink({form, prop, isMyMessage, styles, msg, isAnother, onPress, useImageInput}) {
    if (!msg)
      msg = translate(isAnother ? 'createNext' : 'createNew', translate(utils.getModel(form)))
    let { application, bankStyle } = this.props
    if (application) {
      return (
         <View style={[styles.row, isAnother ? {paddingBottom: 5} : {}]}>
           <View style={{justifyContent: 'center'}}>
             <Text style={styles.addMore}>{msg}</Text>
           </View>
         </View>
      )
    }
    let zoomIn = {transform: [{scale: this.springValue}], justifyContent: 'center', paddingLeft: 5, marginLeft: -3}
    let hasSharables = this.hasSharables()
    let content = <View style={[styles.row, isAnother ? {paddingBottom: 5} : {}]}>
                    <Animated.View style={zoomIn}>
                      <View style={hasSharables  && styles.addButton  ||  styles.shareButton}>
                        <Icon name='md-add' size={20} color={hasSharables && bankStyle.linkColor || '#ffffff'} style={{marginTop: utils.isIOS() ? 2 : 0}}/>
                      </View>
                    </Animated.View>
                     <View style={{justifyContent: 'center'}}>
                       <Text style={styles.addMore}>{msg}</Text>
                     </View>
                   </View>
    if (useImageInput)
      return <ImageInput allowPicturesFromLibrary={prop.allowPicturesFromLibrary} cameraType={prop.cameraType} style={styles.container} onImage={onPress}>
               {content}
             </ImageInput>

    return <TouchableOpacity style={{paddingRight: 15}} onPress={onPress || this.createNewResource.bind(this, {model: form, isMyMessage})}>
             {content}
           </TouchableOpacity>

  }

  reviewFormsInContext({isRefresh}) {
    // Alert.alert(
    //   translate('importDataPrompt'),
    //   utils.getDisplayName(this.props.to),
    //   [
    //     {text: translate('cancel'), onPress: () => console.log('Canceled!')},
    //     {text: translate('Import'), onPress: this.submitAllForms.bind(this)},
    //   ]
    // )
    const { navigator, bankStyle, resource, to, currency, list } = this.props
    this.props.navigator.push({
      title: translate('reviewData'),
      backButtonTitle: 'Back',
      componentName: 'RemediationItemsList',
      rightButtonTitle: 'Done',
      passProps: {
        modelName: CONFIRM_PACKAGE_REQUEST,
        resource,
        bankStyle,
        isRefresh,
        reviewed: {},
        to,
        list: resource.items || list,
        currency
      }
    })
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
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate(prop), //m.title,
      componentName: 'ResourceList',
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
    headerStyle: {
      paddingLeft: 10,
      paddingBottom: 3,
      width: msgWidth - 50
    },
    hr: {
      backgroundColor: '#eeeeee',
      height: 1,
      marginHorizontal: -10,
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
      maxWidth: msgWidth - 40,
      paddingLeft: 10,
      marginRight: 5,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-end'
    },
    orText: {
      fontStyle: 'italic',
      alignSelf: 'center',
      color: '#aaaaaa',
      paddingHorizontal: 5,
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
      height: StyleSheet.hairlineWidth,
      marginBottom: 3,
      marginHorizontal: -3,
      backgroundColor: '#dddddd'
    },
    arrow: {
      marginRight: 10,
      marginTop: 5
    },
    arrowForward: {
      paddingLeft: 5
    },
    link: {
      paddingBottom: 15,
    },
    center: {
      justifyContent: 'center'
    },
    messageLink: {
      // flexDirection: 'row',
      // flex: 1,
      // minHeight: 35,
      marginLeft: -5,
      paddingLeft: 5,
      // alignItems: 'center',
      // justifyContent: 'space-between',
    },
    message: {
      flexDirection: 'row',
      flex: 1,
      minHeight: 35,
      // paddingLeft: 5,
      // justifyContent: 'center'
      alignItems: 'center',
      // justifyContent: 'space-between',
    },
    shareButton: {
      ...circled(40),
      backgroundColor: bankStyle.buttonBgColor || bankStyle.linkColor,
      shadowOpacity: 0.7,
      opacity: 1,
      shadowRadius: 5,
      shadowColor: '#afafaf',
    },
    addButton: {
      ...circled(40),
      backgroundColor: '#eeeeee',
      shadowOpacity: 0.7,
      shadowRadius: 5,
      shadowColor: '#afafaf',
      borderColor: bankStyle.buttonBgColor || bankStyle.linkColor,
      borderWidth: StyleSheet.hairlineWidth,
    },
    infoButton: {
      ...circled(40),
      shadowOpacity: 0.7,
      shadowRadius: 5,
      shadowColor: '#afafaf',
      backgroundColor: bankStyle.buttonBgColor || bankStyle.linkColor,
      // borderWidth: StyleSheet.hairlineWidth,
      marginRight: 7
    },
    addMore: {
      color: '#757575', // bankStyle.linkColor,
      fontSize: 18,
      paddingHorizontal: 10,
      width: msgWidth - 50
    },
    mstyle: {
      borderColor: 'transparent',
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 0,
      paddingVertical: 10
    },
    shareable:{
      margin: 1,
      // marginTop: -37,
      marginTop: -5,
      // width: msgWidth - 115,
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
    propertyTitle: {
      color: '#aaaaaa',
      fontSize: 14,
      marginTop: -5,
      paddingBottom: 5
    },
    docText: {
      fontSize: 16,
      color: '#555555'
    },
    multiEntryDocText: {
      marginRight: -4,
      marginLeft: -1,
      fontSize: 14,
      width: msgWidth - 200,
      color: bankStyle.linkColor
    }
  })
})
reactMixin(FormRequestRow.prototype, RowMixin)
reactMixin(FormRequestRow.prototype, OnePropFormMixin)
reactMixin(FormRequestRow.prototype, Reflux.ListenerMixin)
FormRequestRow = makeResponsive(FormRequestRow)

module.exports = FormRequestRow;
