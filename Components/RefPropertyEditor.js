import React, { Component } from 'react'
import {
  View,
  // Text,
  TouchableOpacity,
  Alert,
  // Image as RawImage,
} from 'react-native'
import _ from 'lodash'
// const debug = require('debug')('tradle:app:blinkid')
const debug = require('debug')('tradle:app:document')
import Icon from 'react-native-vector-icons/Ionicons';
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io';
import debounce from 'p-debounce'
import reactMixin from 'react-mixin'

import constants from '@tradle/constants'
const {
  TYPE,
  ROOT_HASH
} = constants
const {
  IDENTITY,
  PROFILE,
  ENUM,
  FINANCIAL_PRODUCT
} = constants.TYPES

import { Text } from './Text'
import utils, { translate, translateEnum, isWeb, isSimulator, buildStubByEnumTitleOrId, isDataUrl, isPDF } from '../utils/utils'
import ENV from '../utils/env'
import Analytics from '../utils/analytics'
import ImageInput from './ImageInput'
import DocumentInput from './DocumentInput'
import Actions from '../Actions/Actions'
// import BlinkID from './BlinkID'
import Regula from './Regula'
import Navigator from './Navigator'
import { capture } from '../utils/camera'
import Errors from '@tradle/errors'
import Image from './Image'
import PhotoCarouselMixin from './PhotoCarouselMixin'
import HomePageMixin from './HomePageMixin'

const PHOTO = 'tradle.Photo'
const COUNTRY = 'tradle.Country'
const DOCUMENT_SCANNER = 'tradle.DocumentScanner'
const PHOTO_ID = 'tradle.PhotoID'
const ID_CARD = 'tradle.IDCardType'
const TREE = 'tradle.Tree'
const FILE = 'tradle.File'

const PDF_ICON = 'https://tradle-public-images.s3.amazonaws.com/pdf-icon.png'

class RefPropertyEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isRegistration: !utils.getMe()  && props.model.id === PROFILE  &&  (!props.resource || !props.resource[ROOT_HASH]),
    }
    this.regulaScan = !isSimulator() && !isWeb()  &&  debounce(Regula.regulaScan.bind(this), 500, { leading: true })
  }
  shouldComponentUpdate(nextProps, nextState) {
    let prop = this.props.prop
    if (prop !== nextProps.prop)
      return false
    if (this.props.inFocus !== nextProps.inFocus)
      return true
    let pName = prop.name
    if (!_.isEqual(nextProps.resource[pName], this.props.resource[pName]))
      return true

    if (nextProps.error !== this.props.error) {
      // if (!this.props.error || this.props.error !== nextProps.error)
        return true
    }
    // in case document type was changed a different scanning could be replaced by taking a photo and vice versa
    if (prop.scanner  &&  !this.props.resource[pName])
      return true
    if (prop.set)
      return true
    return false
  }
  render() {
    let { prop, parentMeta, metadata, resource, error, styles, model, bankStyle, country, labelAndBorder, bookmark, isRefresh,
          search, photo, component, paintError, paintHelp, required, exploreData, allowedMimeTypes, floatingProps } = this.props
    let labelStyle = styles.labelClean
    let textStyle = styles.labelDirty
    let props
    let pName = prop.name

    let { lcolor, bcolor } = labelAndBorder(pName)
    let isVideo = pName === 'video'
    let isPhoto = pName === 'photos'  ||  prop.ref === PHOTO
    let isFile = prop.ref  &&  (prop.ref === FILE ||  utils.isSubclassOf(prop.ref, FILE))
    let isIdentity = prop.ref === IDENTITY

    let isInlineArray = parentMeta  &&  metadata
    let ipName = isInlineArray  &&  `${metadata.name}_${pName}`
    if (required  &&  prop.ref === COUNTRY  &&  country) { //  &&  required.indexOf(pName)) {
      // Don't overwrite default country on provider
      if (resource  &&  !resource[pName]  &&  country) {
        resource[pName] = country
        floatingProps[pName] = country
      }
      else if (isInlineArray && resource[ipName])
        floatingProps[ipName] = resource[ipName]
    }
    let val
    if (isInlineArray) {
      if (resource[ipName])
        val = resource[ipName]
    }
    else {
      val = resource && resource[pName]
      if (Array.isArray(val)  &&  !val.length)
        val = null
    }
    let pLabel = this.getPropertyLabel(prop) + (!search  &&  required ? ' *' : '')
    let label, propLabel
    let isImmutable = prop.immutable  &&  resource[ROOT_HASH]

    if (!val)
      label = pLabel
    else if (utils.getModel(prop.ref || prop.items.ref).abstract) {
      let vtype = utils.getType(val)
      let vm = utils.getModel(vtype)
      if (typeof val === 'object'  &&  vtype  &&  !vm.abstract)
        label = this.getRefLabel(prop, val, resource)
      else
        label = translate(vm)
      propLabel = <Text style={[styles.labelDirty, { color: lcolor}]}>{pLabel}</Text>
    }
    else {
      if (isPhoto)
        label = pLabel
      else if (isFile  &&  resource[pName].name)
        label = resource[pName].name
      if (!label)
        label = this.getRefLabel(prop, val, resource)
      propLabel = <Text style={[styles.labelDirty, { color: lcolor}]}>{pLabel}</Text>
    }
    let photoR = isPhoto && (photo || resource[pName])
    let isRegistration = this.state.isRegistration
    let linkColor = bankStyle.linkColor
    let color
    if (isRegistration)
      color = '#eeeeee'
    else if (val)
      color = '#555555'
    else
      color = '#888888'
    let isDocument = prop.range === 'document'
    let propView
    if (photoR) {
      let pVal = resource[pName]
      let source
      if (isDocument  &&  pVal) {
        let { fileName, url } = pVal
        let isPdf = fileName  &&  fileName.toLowerCase().indexOf('.pdf') !== -1
        if (!isPdf)
          isPdf = url.indexOf('data:application/pdf') === 0
        if (isPdf)
          source = PDF_ICON
      }
      if (!source)
        source = photoR.url
      propView = <View style={{ marginTop: 15, flexDirection: 'row' }}>
                   <Image source={{uri: source}} style={[styles.thumb]} />
                 </View>
    }
    else {
      let img = photo
      if (img) {
        propView = <View style={{flexDirection: 'row', marginTop: 15, marginBottom: 5}}>
                      <Image source={{uri: img.url}} style={styles.thumb} />
                      <Text style={[styles.input, {color}]}>{' ' + label}</Text>
                   </View>
      }
      else {
        let marginTop = 15
        let width = utils.dimensions(component).width - 60
        let scanned
        if (prop.scanner  &&  resource[prop.name + 'Json'])
          propView = <Text style={[styles.input, {marginTop, justifyContent: 'flex-end', color: 'darkblue', width}]}>{translate('Scanned')}</Text>
        else {
          propView = <Text numberOfLines={prop.type === 'array' && 5 || 1} style={[styles.input, {maxWidth: width, marginTop, justifyContent: 'flex-end', color, width}]}>{label}</Text>
        }
      }
    }

    let iconColor
    if (isRegistration)
      iconColor =  '#eeeeee'
    else if (isImmutable)
      iconColor = '#555'
    else
      iconColor = linkColor

    let isReadOnly = utils.isReadOnly(prop)
    let icon, hasLock
    let isBookmarkSealed = bookmark  &&  bookmark.bookmark[pName]
    if (!isImmutable  &&  !isBookmarkSealed  &&  !isReadOnly) {
      if (isVideo)
        icon = <Icon name='ios-play-outline' size={25}  color={linkColor} />
      else if (isPhoto)
        icon = <Icon name='ios-camera-outline' size={25}  color={linkColor} style={val && styles.photoIcon || styles.photoIconEmpty}/>
      else if (isIdentity)
        icon = <Icon name='ios-qr-scanner' size={25}  color={linkColor} style={val && styles.photoIcon || styles.photoIconEmpty}/>
      else
        icon = <Icon name='ios-arrow-down'  size={15}  color={iconColor} style={styles.customIcon} />
    }
    else {
      hasLock = true
      icon = <Icon name='ios-lock-outline' size={25} color={iconColor} style={styles.lockIcon} />
    }
    let content = <View style={styles.chooserContainer}>
                    {propView}
                    {icon}
                  </View>

    let help = paintHelp({prop, styles})
    let actionItem
    if (isBookmarkSealed || (!exploreData  &&  (isImmutable || isReadOnly)))
      actionItem = content
    else if (isIdentity && !isWeb())
      actionItem = <TouchableOpacity onPress={() => this.scanQRAndSet(prop)}>
                     {content}
                   </TouchableOpacity>
    else if (isVideo  ||  isPhoto  ||  isFile) {
      // HACK
      if (useImageInput({resource, prop, isFile})) {
        let aiStyle = {flex: 7, paddingTop: resource[pName] &&  10 || 0}
        if (isDocument) {
          let mimeTypes
          if (isRefresh) {
            actionItem = <TouchableOpacity onPress={() => this.onDocument(pName, resource[pName])}>
                           {content}
                         </TouchableOpacity>
          }
          else {
            let mimeTypes
            if (prop.allowedMimeTypes) {
              let mt = allowedMimeTypes || []
              mimeTypes = [...prop.allowedMimeTypes, ...mt]
            }
            else
              mimeTypes = allowedMimeTypes

            actionItem = <DocumentInput style={aiStyle} onDocument={item => this.onDocument(pName, item)} allowedMimeTypes={mimeTypes}>
                           {content}
                         </DocumentInput>
          }
        }
        else
          actionItem = <ImageInput nonImageAllowed={isVideo ||  prop.range === 'document'}
                                   cameraType={prop.cameraType}
                                   allowPicturesFromLibrary={prop.allowPicturesFromLibrary}
                                   style={aiStyle}
                                   allowedMimeTypes={allowedMimeTypes}
                                   onImage={item => this.onSetMediaProperty(pName, item)}>
                         {content}
                       </ImageInput>
      }
      else
        actionItem = <TouchableOpacity onPress={this.showCameraView.bind(this, {prop})}>
                       {content}
                     </TouchableOpacity>
    }
    else {
      let ref = prop.ref  ||  prop.items.ref
      let refM = utils.getModel(ref)
      let isEnum = utils.isEnum(ref)
      if (!isEnum  &&  !utils.isSubclassOf(refM, TREE)  &&  (prop.inlined  ||  refM.inlined)) {
        actionItem = <TouchableOpacity onPress={this.createNew.bind(this, prop)}>
                       {content}
                     </TouchableOpacity>
      }
      else if (isEnum   &&  !prop.items  &&  this.props.customChooser && !exploreData &&  refM.enum.length < 20) {
        actionItem = <TouchableOpacity onPress={() => this.props.customChooser(prop.name)}>
                       {content}
                     </TouchableOpacity>
      }
      else {
        actionItem = <TouchableOpacity onPress={this.chooser.bind(this, prop, pName)}>
                       {content}
                     </TouchableOpacity>
      }
    }
    let addStyle = hasLock ? {backgroundColor: bankStyle.backgroundColor || '#f7f7f7'} : {}

    return (
      <View key={pName} style={{margin: 0, marginBottom: 10}} ref={pName}>
        <View style={[styles.formInput, addStyle, {borderColor: bcolor, minHeight: 60}]}>
          {propLabel}
          {actionItem}
        </View>
        {paintError({errors: error && {[pName]: error} || null, prop: prop, paddingBottom: 0, styles})}
        {help}
      </View>
    );
  }
  onDocument(propName, item) {
    const { model, navigator } = this.props
    const { type, fileName, url, isText } = item
    if (!url)
      return
    if (isPDF(url) || (fileName   &&  fileName.endsWith('.pdf'))) {
      let dataUrl = isDataUrl(url) && url || `data:application/pdf;base64,${url}`
      this.props.navigator.push({
        title: translate(model, model.properties[propName]),
        backButtonTitle: 'Back',
        componentName: 'PdfView',
        rightButtonTitle: 'Done',
        passProps: {
          prop: propName,
          onSubmit: () => this.onSetMediaProperty(propName, {...item, url: dataUrl}),
          item: {isPdf: true, ...item}
        }
      });
    }
    else if (isText) {
      this.onSetMediaProperty(propName, {...item, url})
    }
    else {
      let iurl = `data:image/jpeg;base64,${url}`
      let photo = {url: iurl}
      this.showCarousel({photo, title: translate('preview'), done: () => this.onSetMediaProperty(propName, photo)})
    }
  }
  getRefLabel(prop, val) {
    let rModel = utils.getModel(prop.ref  ||  prop.items.ref)
    let label
    if (utils.isEnum(rModel)) {
      if (prop.type === 'array') {
        let l = val.map(r => translateEnum(r))
        label = l.join(', ')
      }
      else if (Array.isArray(val))
        label = val.map(r => translateEnum(r)).join(',')
      else
        label = translateEnum(val)
    }
    if (!label) { // see if stub
      label = val.title || utils.getDisplayName({resource: val})
      if (!label)
        label = prop.title
    }
    return label
  }
  createNew(prop) {
    let { navigator, bankStyle, model, resource, currency, allowedMimeTypes } = this.props
    let refModel = utils.getModel(prop.ref)
    navigator.push({
      title: translate('addNew', translate(refModel)), // Add new ' + bl.title,
      backButtonTitle: 'Back',
      componentName: 'NewResource',
      rightButtonTitle: 'Done',
      passProps: {
        model: refModel,
        bankStyle,
        prop,
        parentResource: resource,
        parentMeta: model,
        currency,
        allowedMimeTypes
      }
    });
  }
  getPropertyLabel(prop) {
    const { model, metadata } = this.props
    if (model)
      return translate(prop, model)
    let m
    if (!metadata.items)
      m = metadata
    else
      m = utils.getModel(metadata.items.ref)

    return translate(prop, m)
  }
  onSetMediaProperty(propName, item) {
    // debugger
    if (!item)
      return;
    if (item.file && item.file.constructor.name === 'File') {
      item.type = item.file.type
      item.name = item.file.name
      delete item.file
    }
    else {
      item.name = item.fileName
    }
    let { model, floatingProps, resource } = this.props
    const props = model.properties
    if (props[propName].ref)
      item[TYPE] = props[propName].ref
    let r = _.cloneDeep(resource)
    r[propName] = item
    floatingProps[propName] = item
    let state = {
      resource: r,
      prop: propName,
      inFocus: propName
    }
    // this.setState(state);
    this.props.onChange(state)
  }
  async showCameraView(params) {
    // if (utils.isAndroid()) {
    //   return Alert.alert(
    //     translate('oops') + '!',
    //     translate('noScanningOnAndroid')
    //   )
    // }
    let { resource, model, prop } = this.props
    let pName = prop.name
    let props = model.properties
    let scanner = props[pName].scanner
    if (scanner) {
      if (scanner === 'id-document') {
        if (pName === 'scan')  {
          if (resource.documentType) { //  &&  resource.country) {
            this.showRegulaScanner(params)
            // this.showBlinkIDScanner(pName)
          }
          else
            Alert.alert(translate('pleaseChooseDT'))
          return
        }
      }
      else if (scanner === 'payment-card') {
        if (!isWeb())
          this.scanCard(pName)
        return
      }
    }
    // else if (pName === 'otherSideScan') {
    //   this.showBlinkIDScanner(pName)
    //   return
    // }

    const result = await capture({
      navigator: this.props.navigator,
      title: translate(prop, model),
      backButtonTitle: translate('back'),
      quality: utils.getCaptureImageQualityForModel(model),
    })

    if (result) {
      this.onTakePicture(params, result)
    }
  }
  onTakePicture(params, data) {
    if (!data)
      return

    let { prop } = params
    if (prop.ref === PHOTO) {
      let { width, height, url } = data
      let d = { width, height, url }
      this.onSetMediaProperty(prop.name, d)
    }
    else {
      this.props.resource.video = data
      this.props.floatingProps.video = data
    }
  }
  async showRegulaScanner(params) {
    let { resource, model, prop, navigator } = this.props
    const type = getDocumentTypeFromTitle(resource.documentType.title)
    Analytics.sendEvent({
      category: 'widget',
      action: 'scan_document',
      label: `regula:${type}`
    })
    let bothSides = type !== 'passport'  &&  type !== 'other'
    let isCC = type === 'credit'

    let result
    try {
      await this.regulaScan({bothSides, isCC, callback: this.handleRegulaResults.bind(this)}) //Regula.regulaScan({bothSides})
    } catch (err) {
      debug('regula scan failed:', err.message)
      debugger
    }
  }
  handleRegulaResults(result) {
    let { resource, prop } = this.props
    const type = getDocumentTypeFromTitle(resource.documentType.title)
    if (!result) {
      Alert.alert(translate('retryScanning', translateEnum(resource.documentType)))
      return
    }
    let { canceled, documentType, scanJson, imageFront, imageFace, imageBack,
          imageSignature, rfidImageFace, country } = result
    if (canceled)
      return

    if (documentType  &&  type !== 'other') {
      let docTypeModel = utils.getModel(ID_CARD)
      let rDocumentType = documentType.charAt(0)
      if (rDocumentType === 'P')
        documentType = buildStubByEnumTitleOrId(docTypeModel, 'passport')
      else if (rDocumentType === 'I')
        documentType = buildStubByEnumTitleOrId(docTypeModel, 'id')
      else if (rDocumentType === 'D')
        documentType = buildStubByEnumTitleOrId(docTypeModel, 'license')
      // if (documentType.id !== resource.documentType.id) {
      //   Alert.alert(translate('retryScanning', translateEnum(resource.documentType)))
      //   return
      // }
    }

    const r = _.cloneDeep(resource)
    r.scanJson = scanJson
    // r.documentType = documentType
    r.country = country

    if (imageFront) {
      r[prop.name] = {
        url: imageFront,
      }
    }
    const rtype = utils.getType(resource)
    const props = utils.getModel(rtype).properties
    const { otherSideScan, face, signature, rfidFace } = props
    if (imageBack) {
      // HACK
      if (otherSideScan) {
        r.otherSideScan = {
          url: imageBack,
        }
      }
    }
    if (imageFace  &&  face  &&  face.ref === PHOTO) {
      r.face = {
        url: imageFace
      }
    }
    if (rfidImageFace  &&  rfidFace  &&  rfidFace.ref === PHOTO) {
      r.rfidFace = {
        url: rfidImageFace
      }
    }
    if (imageSignature  &&  signature  &&  signature.ref === PHOTO) {
      r.signature = {
        url: imageSignature
      }
    }

    let docScannerProps = utils.getPropertiesWithRef(DOCUMENT_SCANNER, utils.getModel(r[TYPE]))
    if (docScannerProps  &&  docScannerProps.length)
      r[docScannerProps[0].name] = buildStubByEnumTitleOrId(utils.getModel(DOCUMENT_SCANNER), 'regula')
    this.afterScan(r, prop.name)
  }
  afterScan(resource, prop) {
    this.props.floatingProps[prop] = resource[prop]
    this.props.floatingProps[prop + 'Json'] = resource[prop + 'Json']
    this.setState({ resource })
    if (!this.props.search) {
      Actions.getRequestedProperties({resource})
      Actions.saveTemporary(resource)
    }
  }

  async scanCard(prop) {
    let cardJson
    try {
      const card = await CardIOModule.scanCard({
        hideCardIOLogo: true,
        suppressManualEntry: true,
        // suppressConfirmation: true,
        scanExpiry: true,
        requireExpiry: true,
        requireCVV: true,
        // requirePostalCode: true,
        requireCardholderName: true,
        keepStatusBarStyle: true,
        suppressScannedCardImage: true,
        scanInstructions: 'Frame FRONT of card.\nBonus: get all the edges to light up',
        detectionMode: CardIOUtilities.AUTOMATIC
      })
      cardJson = utils.clone(card)
    } catch (err) {
      // user canceled
      return
    }

    let resource = this.props.resource
    let r = utils.clone(resource)
    let props = utils.getModel(utils.getType(r)).properties
    for (let p in cardJson) {
      if (cardJson[p]  &&  props[p]) {
        r[p] = cardJson[p]
        this.props.floatingProps[p] = cardJson[p]
      }
    }
    cardJson = utils.sanitize(cardJson)
    for (let p in cardJson)
      if (!cardJson[p])
        delete cardJson[p]
    this.props.floatingProps[prop + 'Json'] = cardJson
    r[prop + 'Json'] = cardJson
    this.setState({ r })
    Actions.addChatItem({resource: r, disableFormRequest: this.props.originatingMessage})
  }
  chooser(prop, propName, event, pRef) {
    let { isRegistration } = this.state
    let { resource, model, bankStyle, search, navigator, originatingMessage, onChange, exploreData } = this.props

    let propRef = pRef || prop.ref || prop.items.ref
    let m = utils.getModel(propRef);

    if (m.abstract) {
      let subList = utils.getAllSubclasses(m.id)
      let callback = val =>  this.chooser(prop, propName, event, utils.getModel(val).id)

      this.showSubclasses({ list: subList, callback, notModel: true, title: translate(model) })
      return
    }

    if (model  &&  !resource) {
      resource = {};
      resource[TYPE] = model.id;
    }

    let isFinancialProduct = model  &&  utils.isSubclassOf(model, FINANCIAL_PRODUCT)
    // let value = parent.refs.form.input // this.refs.form.input;

    let filter = event.nativeEvent.text;
    let currentRoutes = navigator.getCurrentRoutes();

    if (originatingMessage) {
      let pmodel = utils.getLensedModel(originatingMessage)
      if (!pmodel.abstract)
        prop = pmodel.properties[propName]
    }

    let route = {
      title: this.getPropertyLabel(prop), //m.title,
      componentName: 'GridList',
      backButtonTitle: 'Back',
      sceneConfig: isFinancialProduct ? Navigator.SceneConfigs.FloatFromBottom : Navigator.SceneConfigs.FloatFromRight,
      passProps: {
        filter,
        prop,
        resource,
        search,
        isRegistration,
        bankStyle,
        isChooser:      true,
        modelName:      propRef,
        isModel:        m.abstract  &&  exploreData,
        returnRoute:    !pRef && currentRoutes[currentRoutes.length - 1],
        callback:       onChange
      }
    }
    if ((search  ||  prop.type === 'array')  && utils.isEnum(m)) {
      route.passProps.multiChooser = true
      if (resource[propName])
        route.passProps.pin = resource[propName]
      route.rightButtonTitle = 'Done'
      route.passProps.onDone = this.multiChooser.bind(this, prop)
    }
    // navigator.push(route)
    navigator[pRef ? 'replace' : 'push'](route)
  }
  multiChooser(prop, values) {
    const { navigator, onChange } = this.props
    let vArr = []
    for (let v in values)
      vArr.push(values[v])
    onChange(prop.name, vArr)
    navigator.pop()
  }

  async scanQRAndSet(prop) {
    const result = await this.scanFormsQRCode()
    Actions.getIdentity({prop, ...result.data })
  }
}
function useImageInput({resource, prop, isFile}) {
  let pName = prop.name
  const isScan = pName === 'scan'
  let rtype = utils.getType(resource)
  let { documentType } = resource
  if (isWeb()  ||  isSimulator())
    return isScan || !ENV.canUseWebcam || prop.allowPicturesFromLibrary
  else if (rtype === PHOTO_ID  &&  isScan  &&  documentType  &&  documentType.id.indexOf('other') !== -1)
    return true
  else if (isFile)
    return true
  else
    return prop.allowPicturesFromLibrary  &&  (!isScan  ||  !prop.scanner)
    // return prop.allowPicturesFromLibrary  &&  (!isScan || (!BlinkID  &&  !prop.scanner))
}
function getDocumentTypeFromTitle (title='') {
  title = title.toLowerCase()
  const match = title.match(/(licen[cs]e|passport|credit|card|other)/)
  if (!match) return
  switch (match[1]) {
  case 'passport':
    return 'passport'
  case 'license':
  case 'licence':
    return 'license'
  case 'card':
    return 'card'
  case 'credit':
    return 'credit'
  case 'other':
    return 'other'
  }
}
reactMixin(RefPropertyEditor.prototype, PhotoCarouselMixin);
reactMixin(RefPropertyEditor.prototype, HomePageMixin);
module.exports = RefPropertyEditor;
