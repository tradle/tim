console.log('requiring OnePropFormMixin.js')
'use strict';

import { Alert } from 'react-native'
import { CardIOModule, CardIOUtilities } from 'react-native-awesome-card-io'
import _ from 'lodash'

import constants from '@tradle/constants'
var {
  TYPE
} = constants

import utils from '../utils/utils'
const translate = utils.translate
import Actions from '../Actions/Actions'
import CameraView from './CameraView'
import SignatureView from './SignatureView'
import Navigator from './Navigator'

const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'

var OnePropFormMixin = {
  onSetSignatureProperty(prop, item) {
    if (!item)
      return;

    let resource = this.props.resource

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
    let params = {resource}
    if (formRequest)
      params.disableFormRequest = formRequest
    Actions.addChatItem(params)
  },
  showSignatureView(prop, onSet) {
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

  showCamera(params) {
    let { prop } = params
    // if (utils.isAndroid()) {
    //   return Alert.alert(
    //     translate('oops') + '!',
    //     translate('noScanningOnAndroid')
    //   )
    // }
    let scanner = prop.scanner
    let pname = prop.name
    if (scanner) {
      if (scanner === 'id-document') {
        if (pname === 'scan')  {
          if (this.state.resource.documentType  &&  this.state.resource.country) {
            this.showBlinkIDScanner(pname)
          }
          else
            Alert.alert('Please choose country and document type first')
          return
        }
      }
      else if (scanner === 'payment-card') {
        if (!utils.isWeb())
          this.scanCard(prop)
        return
      }
    }
    this.props.navigator.push({
      // title: 'Take a pic',
      backButtonTitle: 'Back',
      noLeftButton: true,
      id: 12,
      component: CameraView,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        cameraType: prop.cameraType,
        onTakePic: this.onTakePic.bind(this, params)
      }
    });
  },
  onTakePic(params, photo) {
    if (!photo)
      return
    let { prop } = params
    let { width, height, data } = photo

    let resource = this.props.resource
    let isFormError = resource[TYPE] === FORM_ERROR
    Actions.addChatItem({
      disableFormRequest: resource,
      resource: {
        [TYPE]: isFormError ? resource.prefill[TYPE] : resource.form,
        [prop.name]: {
          width,
          height,
          url: data
        },
        _context: resource._context,
        from: utils.getMe(),
        to: resource.from
      }
    })

    this.props.navigator.pop();
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
  },
}
module.exports = OnePropFormMixin;
