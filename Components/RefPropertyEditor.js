import React, { Component } from 'react'
import {
  View,
  // Text,
  TouchableOpacity,
  Alert,
} from 'react-native'
import _ from 'lodash'
const debug = require('debug')('tradle:app:blinkid')
import Icon from 'react-native-vector-icons/Ionicons';
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io';
import debounce from 'p-debounce'

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
import utils, { translate, translateEnum, isWeb, isSimulator, buildStubByEnumTitleOrId } from '../utils/utils'
import ENV from '../utils/env'
import Analytics from '../utils/analytics'
import ImageInput from './ImageInput'
import Actions from '../Actions/Actions'
// import BlinkID from './BlinkID'
import Regula from './Regula'
import Navigator from './Navigator'
import GridList from './GridList'
import NewResource from './NewResource'
import { capture } from '../utils/camera'
import Errors from '@tradle/errors'
import Image from './Image'

const PHOTO = 'tradle.Photo'
const COUNTRY = 'tradle.Country'
const DOCUMENT_SCANNER = 'tradle.DocumentScanner'
const PHOTO_ID = 'tradle.PhotoID'
const ID_CARD = 'tradle.IDCardType'

class RefPropertyEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isRegistration: !utils.getMe()  && this.props.model.id === PROFILE  &&  (!this.props.resource || !this.props.resource[ROOT_HASH])
    }
    this.regulaScan = !isSimulator() && !isWeb()  &&  debounce(Regula.regulaScan.bind(this), 500, { leading: true })
  }
  shouldComponentUpdate(nextProps, nextState) {
    let prop = this.props.prop
    if (prop !== nextProps.prop)
      return false
    let pName = prop.name
    if (!_.isEqual(nextProps.resource[pName], this.props.resource[pName]))
      return true

    if (nextProps.error) {
      if (!this.props.error || this.props.error !== nextProps.error)
        return true
    }
    // in case document type was changed a different scanning could be replaced by taking a photo and vice versa
    if (prop.scanner  &&  !this.props.resource[pName])
      return true
    return false
  }
  render() {
    let { prop, resource, error, styles, model, bankStyle, country,
          search, photo, component, paintError, paintHelp, required } = this.props
    let labelStyle = styles.labelClean
    let textStyle = styles.labelDirty
    let props
    let pName = prop.name

    let lcolor = {color: this.getLabelAndBorderColor(pName)}
    let isVideo = pName === 'video'
    let isPhoto = pName === 'photos'  ||  prop.ref === PHOTO
    let isIdentity = prop.ref === IDENTITY

    // let required = model  &&  utils.ungroup(model.required)
    if (required  &&  prop.ref === COUNTRY) { //  &&  required.indexOf(pName)) {
      // Don't overwrite default country on provider
      if (resource  &&  !resource[pName])
        resource[pName] = country
    }
    let val = resource && resource[pName]
    if (Array.isArray(val)  &&  !val.length)
      val = null

    let pLabel = this.getPropertyLabel(prop) + (!search  &&  required ? ' *' : '')
    let label, propLabel, isImmutable
    if (!val)
      label = pLabel
    else {
      isImmutable = prop.immutable  &&  resource[ROOT_HASH]
      if (isPhoto)
        label = pLabel
      else
        label = this.getRefLabel(prop, resource)
      propLabel = <Text style={[styles.labelDirty, lcolor]}>{pLabel}</Text>
    }
    let photoR = isPhoto && (photo || resource[pName])
    let isRegistration = this.state.isRegistration
    let linkColor = bankStyle.linkColor
    let color
    if (isRegistration)
      color = '#eeeeee'
    else if (val)
      color = /*isImmutable  &&  linkColor ||*/ '#555555'
    else
      color = '#AAAAAA'
    let propView
    if (photoR)
      propView = <View style={{ marginTop: !isWeb()  &&  !isSimulator() && 5 || 0 }}>
                   <Image source={{uri: photoR.url}} style={[styles.thumb, {marginBottom: 5}]} />
                 </View>
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
        propView = <Text style={[styles.input, {marginTop, justifyContent: 'flex-end', color, width}]}>{label}</Text>
      }
    }

    let iconColor
    if (isRegistration)
      iconColor =  '#eeeeee'
    else if (isImmutable)
      iconColor = '#555'
    else
      iconColor = linkColor
    let icon
    if (!isImmutable) {
      if (isVideo)
        icon = <Icon name='ios-play-outline' size={25}  color={linkColor} />
      else if (isPhoto)
        icon = <Icon name='ios-camera-outline' size={25}  color={linkColor} style={[val && styles.photoIcon || (styles.photoIconEmpty, {marginTop: 15})]}/>
      else if (isIdentity)
        icon = <Icon name='ios-qr-scanner' size={25}  color={linkColor} style={val && styles.photoIcon || styles.photoIconEmpty}/>
      else
        icon = <Icon name='ios-arrow-down'  size={15}  color={iconColor} style={styles.customIcon} />
    }
    else
      icon = <Icon name='ios-lock-outline' size={25} color={iconColor} style={styles.immutable} />
    let content = <View  style={[styles.chooserContainer, {flexDirection: 'row', justifyContent: 'space-between'}]}>
                    {propView}
                    {icon}
                  </View>

    let help = paintHelp(prop)
    let actionItem
    if (isImmutable)
      actionItem = content
    else if (isIdentity && !isWeb())
       actionItem = <TouchableOpacity onPress={() => this.scanQRAndSet(prop)}>
                      {content}
                    </TouchableOpacity>
    else if (isVideo ||  isPhoto) {
      // HACK
      if (useImageInput({resource, prop})) {
        let aiStyle = {flex: 7, paddingTop: resource[pName] &&  10 || 0}
        actionItem = <ImageInput nonImageAllowed={isVideo} cameraType={prop.cameraType} allowPicturesFromLibrary={prop.allowPicturesFromLibrary} style={aiStyle} onImage={item => this.onSetMediaProperty(pName, item)}>
                       {content}
                     </ImageInput>
      }
      else
        actionItem = <TouchableOpacity onPress={this.showCameraView.bind(this, {prop})}>
                       {content}
                     </TouchableOpacity>
    }
    else if (!utils.isEnum(prop.ref  ||  prop.items.ref)  && (prop.inlined  ||  utils.getModel(prop.ref).inlined)) {
      actionItem = <TouchableOpacity onPress={this.createNew.bind(this, prop)}>
                     {content}
                   </TouchableOpacity>
    }
    else {
      actionItem = <TouchableOpacity onPress={this.chooser.bind(this, prop, pName)}>
                     {content}
                   </TouchableOpacity>
    }
    return (
      <View key={pName} style={{paddingBottom: error ? 0 : 10, margin: 0}} ref={pName}>
        {propLabel}
        {actionItem}
        {paintError({errors: error && {[pName]: error} || null , prop: prop, paddingBottom: 0})}
        {help}
      </View>
    );
  }
  getRefLabel(prop, resource) {
    let rModel = utils.getModel(prop.ref  ||  prop.items.ref)
    // let m = utils.getId(resource[pName]).split('_')[0]
    let pName = prop.name
    let label
    if (utils.isEnum(rModel)) {
      if (prop.type === 'array') {
        let l = resource[pName].map(r => translateEnum(r))
        label = l.join(',')
      }
      else {
        let val = resource[pName]
        if (Array.isArray(val))
          label = val.map(r => translateEnum(r)).join(',')
        else
          label = translateEnum(val)
      }
    }
    else
      label = utils.getDisplayName(resource[pName], rModel)
    if (!label) { // see if stub
      label = resource[pName].title
      if (!label)
        label = prop.title
    }
    return label
  }
  createNew(prop) {
    let { navigator, bankStyle, model, resource, currency } = this.props
    let refModel = utils.getModel(prop.ref)
    navigator.push({
      id: 4,
      title: translate('addNew', translate(refModel)), // Add new ' + bl.title,
      backButtonTitle: 'Back',
      component: NewResource,
      rightButtonTitle: 'Done',
      passProps: {
        model: refModel,
        bankStyle,
        prop,
        parentResource: resource,
        parentMeta: model,
        currency
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
  getLabelAndBorderColor(prop) {
    let bankStyle = this.props.bankStyle
    if (this.state.isRegistration)
      return '#eeeeee'
    if (this.props.inFocus === prop)
      return bankStyle  &&  bankStyle.linkColor || '#757575'
    else
      return '#b1b1b1'
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
    let result
    try {
      result = await this.regulaScan({bothSides}) //Regula.regulaScan({bothSides})
    } catch (err) {
      debug('regula scan failed:', err.message)
      debugger
    }
    if (result.canceled)
      return
    if (!result) {
      Alert.alert(translate('retryScanning', translateEnum(resource.documentType)))
      return
    }

    if (result.documentType  &&  type !== 'other') {
      let docTypeModel = utils.getModel(ID_CARD)
      let rDocumentType = result.documentType.charAt(0)
      let documentType
      if (rDocumentType === 'P')
        documentType = buildStubByEnumTitleOrId(docTypeModel, 'passport')
      else if (rDocumentType === 'I')
        documentType = buildStubByEnumTitleOrId(docTypeModel, 'id')
      else if (rDocumentType === 'D')
        documentType = buildStubByEnumTitleOrId(docTypeModel, 'license')
      if (documentType.id !== resource.documentType.id) {
        Alert.alert(translate('wrongDocumentTypePleaseTryAgain'))
        return
      }
    }

    const r = _.cloneDeep(resource)
    r.scanJson = result.scanJson
    // r.documentType = result.documentType
    r.country = result.country

    if (result.imageFront) {
      r[prop.name] = {
        url: result.imageFront,
      }
    }
    if (result.imageBack) {
      // HACK
      if (utils.getModel(utils.getType(resource)).properties.otherSideScan) {
        r.otherSideScan = {
          url: result.imageBack,
        }
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
        detectionMode: CardIOUtilities.IMAGE_AND_NUMBER
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
  chooser(prop, propName,event) {
    let { isRegistration } = this.state
    let { resource, model, bankStyle, search, navigator, originatingMessage, onChange, exploreData } = this.props
    if (model  &&  !resource) {
      resource = {};
      resource[TYPE] = model.id;
    }

    let isFinancialProduct = model  &&  utils.isSubclassOf(model, FINANCIAL_PRODUCT)
    // let value = parent.refs.form.input // this.refs.form.input;

    let filter = event.nativeEvent.text;
    let propRef = prop.ref || prop.items.ref
    let m = utils.getModel(propRef);
    let currentRoutes = navigator.getCurrentRoutes();

    if (originatingMessage) {
      let pmodel = utils.getLensedModel(originatingMessage)
      prop = pmodel.properties[propName]
    }

    let route = {
      title: this.getPropertyLabel(prop), //m.title,
      id:  30,
      component: GridList,
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
        returnRoute:    currentRoutes[currentRoutes.length - 1],
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

    navigator.push(route)
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
function useImageInput({resource, prop}) {
  let pName = prop.name
  const isScan = pName === 'scan'
  let rtype = utils.getType(resource)
  let { documentType } = resource
  if (isWeb()  ||  isSimulator())
    return isScan || !ENV.canUseWebcam || prop.allowPicturesFromLibrary
  else if (rtype === PHOTO_ID  &&  isScan  &&  documentType  &&  documentType.id.indexOf('other') !== -1)
    return true
  else
    return prop.allowPicturesFromLibrary  &&  (!isScan  ||  !prop.scanner)
    // return prop.allowPicturesFromLibrary  &&  (!isScan || (!BlinkID  &&  !prop.scanner))
}
function getDocumentTypeFromTitle (title='') {
  title = title.toLowerCase()
  const match = title.match(/(licen[cs]e|passport|card|other)/)
  if (!match) return
  switch (match[1]) {
  case 'passport':
    return 'passport'
  case 'license':
  case 'licence':
    return 'license'
  case 'card':
    return 'card'
  case 'other':
    return 'other'
  }
}
module.exports = RefPropertyEditor;
  // async showBlinkIDScanner(prop) {
  //   let { resource } = this.props
  //   const { documentType, country } = resource
  //   const type = getDocumentTypeFromTitle(documentType.title)
  //   let recognizers
  //   let tooltip
  //   let firstSideInstructions, secondSideInstructions
  //   let scanBothSides
  //   // let isPassport
  //   // HACK
  //   if (!recognizers  &&  prop === 'otherSideScan')
  //     recognizers = BlinkID.recognizers.documentFace
  //   else {
  //     switch (type) {
  //     case 'passport':
  //       tooltip = translate('centerPassport')
  //       // isPassport = true
  //       // machine readable travel documents (passport)
  //       recognizers = BlinkID.recognizers.mrtd
  //       firstSideInstructions = translate('scanPassport')
  //       break
  //     case 'card':
  //       firstSideInstructions = translate('centerIdCard')
  //       // machine readable travel documents (passport)
  //       // should be combined
  //       // if (country.title === 'Bangladesh')
  //       //   recognizers = BlinkID.recognizers.mrtd
  //       //   // recognizers = [BlinkID.recognizers.documentFace, BlinkID.recognizers.mrtd]
  //       // else if (country.title === "Philippines")
  //       //   recognizers = BlinkID.recognizers.pdf417
  //       // else
  //         // recognizers = BlinkID.recognizers.mrtd
  //       recognizers = BlinkID.recognizers.mrtdCombined //[BlinkID.recognizers.mrtd, BlinkID.recognizers.pdf417]
  //       break
  //     case 'license':
  //     case 'licence':
  //       firstSideInstructions = translate('centerLicence')
  //       if (country.title === 'United States') {
  //         secondSideInstructions = translate('documentBackSide')
  //         recognizers = BlinkID.recognizers.usdlCombined
  //         // recognizers = BlinkID.recognizers.usdl
  //       }
  //       else if (country.title === 'New Zealand')
  //         recognizers = BlinkID.recognizers.nzdl //[BlinkID.recognizers.nzdl, BlinkID.recognizers.documentFace]
  //       else if (country.title === 'Australia') {
  //         scanBothSides = true
  //         recognizers = [BlinkID.recognizers.australiaFront, BlinkID.recognizers.australiaBack]
  //       }
  //       else {
  //         recognizers = BlinkID.recognizers.eudl
  //       }
  //       break
  //     default:
  //       tooltip = translate('centerID')
  //       break
  //     }
  //   }

  //   const blinkIDOpts = {
  //     // quality: 0.2,
  //     // base64: true,
  //     // timeout: ENV.blinkIDScanTimeoutInternal,
  //     documentType,
  //     country,
  //     firstSideInstructions,
  //     secondSideInstructions,
  //     scanBothSides,
  //     recognizers: recognizers ? [].concat(recognizers) : [BlinkID.recognizers.documentFace]
  //   }

  //   Analytics.sendEvent({
  //     category: 'widget',
  //     action: 'scan_document',
  //     label: `blinkid:${type}`
  //   })

  //   let result
  //   try {
  //     result = await BlinkID.scan(blinkIDOpts)
  //   } catch (err) {
  //     debug('scan failed:', err.message)
  //     debugger
  //   }
  //   if (!result)
  //     return

  //   const r = _.cloneDeep(resource)
  //   if (result.image) {
  //     r[prop] = {
  //       url: result.image.base64,
  //     }
  //   }
  //   if (result.backImage) {
  //     // HACK
  //     if (utils.getModel(utils.getType(resource)).properties.otherSideScan) {
  //       r.otherSideScan = {
  //         url: result.backImage.base64,
  //       }
  //     }
  //   }
  //   if (result.images) {
  //     let { faceImage, signatureImage } = result.images
  //     if (faceImage)
  //       r.faceImage = { url: faceImage }
  //     if (signatureImage)
  //       r.signatureImage = { url: signatureImage }
  //   }

  //   let dateOfExpiry //, dateOfBirth, documentNumber
  //   ;['mrtd', 'mrtdCombined', 'usdl', 'usdlCombined', 'eudl', 'nzdl', 'australiaFront'].some(docType => {
  //     const scan = result[docType]
  //     if (!scan) return

  //     // const { personal, document } = scan
  //     // documentNumber = document.documentNumber
  //     // if (personal.dateOfBirth)
  //     //   dateOfBirth = personal.dateOfBirth
  //     // if (document.dateOfIssue) {
  //     //   document.dateOfIssue = formatDate(document.dateOfIssue)
  //     // }
  //     const { document } = scan
  //     if (document.dateOfExpiry)
  //       dateOfExpiry = document.dateOfExpiry

  //     r[prop + 'Json'] = scan
  //     return
  //   })

  //   if (dateOfExpiry && dateOfExpiry < Date.now()) {
  //     // give the BlinkID view time to disappear
  //     // 800ms is a bit long, but if BlinkID view is still up, Alert will just not show
  //     await utils.promiseDelay(800)
  //     Alert.alert(
  //       translate('documentExpiredTitle'),
  //       translate('documentExpiredMessage')
  //     )

  //     return
  //   }
  //   // let chipScan
  //   // if (isPassport  &&  Platform.OS === 'android') {
  //   //   Alert.alert('Please press the back of your android phone against the passport')
  //   //   chipScan = await this.scanPassport({documentNumber, dateOfBirth, dateOfExpiry})
  //   // }

  //   let docScannerProps = utils.getPropertiesWithRef(DOCUMENT_SCANNER, utils.getModel(r[TYPE]))
  //   if (docScannerProps  &&  docScannerProps.length)
  //     r[docScannerProps[0].name] = buildStubByEnumTitleOrId(utils.getModel(DOCUMENT_SCANNER), 'blinkId')
  //   this.afterScan(r, prop)
  // }

