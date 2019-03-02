import { Alert, Platform } from 'react-native'
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io'
import _ from 'lodash'
import Zoom from 'react-native-facetec-zoom'

import Errors from '@tradle/errors'
import constants from '@tradle/constants'
var {
  TYPE
} = constants

import utils, { translate, isWeb } from '../utils/utils'
import Actions from '../Actions/Actions'
// import CameraView from './CameraView'
// import VideoCamera from './VideoCamera'
import SignatureView from './SignatureView'
import Navigator from './Navigator'
import { capture } from '../utils/camera'
import ENV from '../utils/env'

const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'
const SELFIE = 'tradle.Selfie'

var OnePropFormMixin = {
  onSetSignatureProperty(prop, item) {
    if (!item)
      return;

    let { resource, isRefresh } = this.props

    let formRequest
    if (resource[TYPE] === FORM_REQUEST) {
      formRequest = resource
      resource = formRequest.prefill  ||  {}
    }
    // Form request for new resource
    if (formRequest)
      _.extend(resource, {
          [TYPE]: formRequest.form,
          _context: formRequest._context,
          from: utils.getMe(),
          to: formRequest.from
        }
      )
    if (!resource[prop.name])
      this.props.navigator.pop()
    resource[prop.name] = item
    let params = {resource, isRefresh}
    if (formRequest)
      params.disableFormRequest = formRequest
    Actions.addChatItem(params)
  },
  showSignatureView(prop, onSet) {
    const { navigator, bankStyle, isRefresh } = this.props
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
        onSet(prop, sig.url)
      },
      passProps: {
        ref: ref => {
          sigView = ref
        },
        bankStyle,
        onSignature: this.onSetSignatureProperty.bind(this, prop),
        sigViewStyle: bankStyle
      }
    })
  },

  async showCamera(params) {
    let { prop, resource } = params
    // if (utils.isAndroid()) {
    //   return Alert.alert(
    //     translate('oops') + '!',
    //     translate('noScanningOnAndroid')
    //   )
    // }
    let pname = prop.name
    let scanner = prop.scanner
    if (scanner) {
      if (scanner === 'id-document') {
        if (pname === 'scan')  {
          debugger
          // if (this.state.resource.documentType  &&  this.state.resource.country) {
          //   this.showBlinkIDScanner(pname)
          // }
          // else
          //   Alert.alert('Please choose country and document type first')
          return
        }
      }
      else if (scanner === 'payment-card') {
        if (!isWeb())
          this.scanPaymentCard(prop)
        return
      }
    }
    let { navigator, bankStyle } = this.props
    if (!resource)
      resource = this.props.resource
    let model = utils.getModel(utils.getType(resource.form || resource[TYPE]))

    const result = await capture({
      navigator,
      title: isWeb() &&  translate(prop, model),
      backButtonTitle: translate('back'),
      cameraType: utils.isAgent()  ? 'back' : prop.cameraType,
      quality: utils.getCaptureImageQualityForModel(model),
    })

    if (result) {
      this.onTakePic(params, result)
      return result
    }
  },
  // verify liveness with facetec ZOOM
  async verifyLiveness(params) {
    // ensure zoom is initialized
    // this only needs to be done once
    if (!ENV.ZoomSDK) {
      this.showCamera(params)
      return
    }
    let result
    try {
      if (!ENV.ZoomSDK.initialized) {
        const { success, status } = await Zoom.initialize({
          appToken: Platform.select(ENV.ZoomSDK.token),
          // optional customization options
          // see defaults.js for the full list
          // showZoomIntro: false,
          showPreEnrollmentScreen: false,
          showUserLockedScreen: false,
          showRetryScreen: false,
          // showSuccessScreen: false,
          // showFailureScreen: false,
        })

        if (!success) {
          // see constants.js SDKStatus for explanations of various
          // reasons why initialize might not have gone through
          throw new Error(`failed to init. SDK status: ${status}`)
        }
        else
          ENV.ZoomSDK.initialized = true
      }
        // launch Zoom's verification process
      result = await Zoom.verify({
        // no options at this point
      })
    } catch (err) {
      this.showCamera(params)
      return
    }
    debugger

    if (result.status == 'FailedBecauseUserCancelled')
      return
    if (!result.faceMetrics) {
      Alert.alert('Something is wrong with Zoom scan', result)
      console.log('Something is wrong with Zoom scan', result)
      return
    }

    let { livenessResult, livenessScore, auditTrail, facemap } = result.faceMetrics
    // let { width, height } = utils.dimensions()
    let selfie = {
      from: utils.getMe(),
      to: this.props.resource.from,
      _context: this.props.resource._context,
      [TYPE]: SELFIE,
      selfie: {
        url: auditTrail[0],
        // width,
        // height
      },
      sessionId: result.sessionId
    }
    if (facemap)
      selfie.facemap = {url: facemap}
    if (auditTrail) {
      auditTrail.splice(0, 1)
      if (auditTrail.length > 1) {
        selfie.auditTrail = auditTrail.map((imgUrl) => {
          return {
            url: imgUrl, //: 'data:image/png;base64,' + url,
            // width,
            // height
          }
        })
      }
    }
    selfie.selfieJson = result

    Actions.addChatItem({
      resource: selfie
    })

    // result looks like this:
    // {
    //   "countOfZoomSessionsPerformed": 1,
    //   "sessionId": "45D5D648-3B14-46B1-86B0-55A91AB9E7DD",
    //   "faceMetrics": {
    //     "livenessResult": "Alive",
    //     "livenessScore": 86.69999694824219,
    //     "auditTrail": [
    //       "..base64 image 1..",
    //       "..base64 image 2..",
    //       "..base64 image 3.."
    //     ],
    //     "externalImageSetVerificationResult": "CouldNotDetermineMatch"
    //   }
    // }
  },

  onTakePic(params, photo) {
    if (!photo)
      return
    let { width, height, url } = photo
    let { isRefresh } = this.props

    let { prop, resource } = params
    if (!resource)
      resource = this.props.resource
    let isFormError = resource[TYPE] === FORM_ERROR
    let r
    if (isRefresh)
      r = resource
    else {
      r = {
        [TYPE]: isFormError && resource.prefill || resource.form,
        _context: resource._context,
        from: utils.getMe(),
        to: isRefresh && resource.to || resource.from
      }
    }
    _.extend(r, {
        [prop.name]: { width, height, url }
      })
    Actions.addChatItem({
      disableFormRequest: !isRefresh  &&  resource,
      isRefresh,
      resource: r
    })

    // this.props.navigator.pop();
  },
  async scanPaymentCard(prop) {
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

    let { resource, isRefresh } = this.props
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

    Actions.addChatItem({resource: r, disableFormRequest: resource, isRefresh})
  },
}
module.exports = OnePropFormMixin;
