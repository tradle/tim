console.log('requiring OnePropFormMixin.js')
'use strict';

import React from 'react'
import {
  Alert,
} from 'react-native'
import constants from '@tradle/constants'
import _ from 'lodash'
import utils from '../utils/utils'
import Actions from '../Actions/Actions'
import CameraView from './CameraView'
import Navigator from './Navigator'

var {
  TYPE
} = constants

const debug = require('debug')('tradle:app:OnePropForm')
const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'

var OnePropFormMixin = {
  // onSetSignatureProperty(prop, item) {
  //   if (!item)
  //     return;

  //   let resource = this.props.resource

  //   let formRequest
  //   if (resource[TYPE] === FORM_REQUEST) {
  //     formRequest = resource
  //     resource = formRequest.prefill  ||  {}
  //   }
  //   // Form request for new resource
  //   if (formRequest)
  //     _.extend(resource, {
  //         [TYPE]: formRequest.form,
  //         _context: formRequest._context,
  //         from: utils.getMe(),
  //         to: formRequest.from
  //       }
  //     )
  //   resource[prop.name] = item
  //   let params = {resource}
  //   if (formRequest)
  //     params.disableFormRequest = formRequest
  //   Actions.addChatItem(params)
  // },
  showCamera(params) {
    let { prop } = params
    // if (utils.isAndroid()) {
    //   return Alert.alert(
    //     translate('oops') + '!',
    //     translate('noScanningOnAndroid')
    //   )
    // }
    let props = utils.getModel(this.props.resource[TYPE]).properties
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
  onTakePic(params, data) {
    if (!data)
      return
    let { prop } = params
    let { width, height, base64 } = data

    let resource = this.props.resource
    let isFormError = resource[TYPE] === FORM_ERROR
    Actions.addChatItem({
      disableFormRequest: resource,
      resource: {
        [TYPE]: isFormError ? resource.prefill[TYPE] : resource.form,
        [prop.name]: {
          width,
          height,
          url: 'data:image/jpeg;base64,' + base64
        },
        _context: resource._context,
        from: utils.getMe(),
        to: resource.from
      }
    })

    this.props.navigator.pop();
  },

}
module.exports = OnePropFormMixin;
