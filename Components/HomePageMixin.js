console.log('requiring HomePageMixin.js')
'use strict';

import React from 'react'
import extend from 'extend'

import utils, { translate } from '../utils/utils'
import constants from '@tradle/constants'
import QRCodeScanner from './QRCodeScanner'
import Actions from '../Actions/Actions'
import ResourceList from './ResourceList'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import MessageList from './MessageList'
import TourPage from './TourPage'
import SplashPage from './SplashPage'
import qrCodeDecoder from '@tradle/qr-schema'
import {
  Alert,
  StatusBar
} from 'react-native'

const debug = require('debug')('tradle:app:HomePageMixin')
const WEB_TO_MOBILE = '0'
const TALK_TO_EMPLOYEEE = '1'
const APP_QR_CODE = '5'
const {
  PROFILE,
  ORGANIZATION,
  MESSAGE
} = constants.TYPES

var HomePageMixin = {
  scanFormsQRCode(isView) {
    this.setState({hideMode: false})
    this.props.navigator.push({
      title: 'Scan QR Code',
      id: 16,
      component: QRCodeScanner,
      titleTintColor: '#eeeeee',
      backButtonTitle: 'Cancel',
      // rightButtonTitle: 'ion|ios-reverse-camera',
      passProps: {
        onread: this.onread.bind(this, isView)
      }
    })
  },

  onUnknownQRCode() {
    Alert.alert(
      translate('error'),
      translate('unknownQRCodeFormat')
    )

    this.props.navigator.pop()
  },

  async onread(isView, result) {
    try {
      result = qrCodeDecoder.fromHex(result.data)
    } catch (err) {
      debug('failed to parse qrcode', result.data)
      this.onUnknownQRCode()
      return
    }

    const { schema, data } = result
    let h, code
    // if (typeof result.data === 'string') {
    //   if (result.data.charAt(0) === '{') {
    //     let h = JSON.parse(result.data)
    //     Actions.sendPairingRequest(h)
    //     this.props.navigator.pop()
    //     return
    //   }
    //   else {
    //     h = result.data.split(';')
    //     code = h[0]
    //   }
    // }
    // else
     code = schema === 'ImportData' ? WEB_TO_MOBILE : "0" // result.dataHash, result.provider]

    // post to server request for the forms that were filled on the web
    let me = utils.getMe()
    switch (code) {
    case WEB_TO_MOBILE:
      Actions.showModal({title: 'Connecting to ' + result.host, showIndicator: true})
// Alert.alert('Connecting to ' + result.host)
      let r = {
        _t: 'tradle.DataClaim',
        claimId: data.dataHash,
        from: {
          id: utils.getId(me),
          title: utils.getDisplayName(me)
        },
        to: {
          id: utils.makeId(PROFILE, data.provider)
        }
      }
      Actions.addChatItem({
        resource: r,
        value: r,
        provider: {
          url: data.host,
          hash: data.provider
        },
        meta: utils.getModel('tradle.DataClaim').value,
        disableAutoResponse: true})
      break
    // case TALK_TO_EMPLOYEEE:
    //   Actions.getEmployeeInfo(data.substring(code.length + 1))
    //   break
    case APP_QR_CODE:
      Actions.addApp(data.substring(code.length + 1))
      break
    default:
      // keep scanning
      this.onUnknownQRCode()
      break
    }
  },
  mergeStyle(newStyle) {
    let style = {}
    extend(style, defaultBankStyle)
    return newStyle ? extend(style, newStyle) : style
  },
  showChat(params) {
    if (!params.to)
      return
    let style = this.mergeStyle(params.to.style)

    var route = {
      title: params.to.name,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: params.to,
        filter: '',
        modelName: MESSAGE,
        noLoadingIndicator: true,
        currency: params.to.currency,
        bankStyle:  style,
        dictionary: params.dictionary,
      }
    }
    // this.props.navigator.push(route)
    this.props.navigator.replace(route)
  },
  showBanks() {
    this.props.navigator.push({
      title: translate('officialAccounts'),
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        officialAccounts: true,
        serverOffline: this.state.serverOffline,
        bankStyle: this.props.bankStyle,
        modelName: ORGANIZATION
      }
    })
  },
  showTourOrSplash({resource, termsAccepted, action, callback, style}) {
    let { navigator, bankStyle } = this.props
    if (resource._tour  &&  !resource._noTour) {
      StatusBar.setHidden(true)
      navigator.push({
        title: "",
        component: TourPage,
        id: 35,
        backButtonTitle: null,
        // backButtonTitle: __DEV__ ? 'Back' : null,
        passProps: {
          bankStyle: style || bankStyle,
          noTransitions: true,
          tour: resource._tour,
          callback: () => {
            resource._noTour = true
            resource._noSplash = true
            Actions.addItem({resource: resource})
            // resource._noSplash = true
            callback({resource, termsAccepted, action: 'replace'})
          }
        }
      })
      return true
    }
    if (resource._noSplash)
      return
    StatusBar.setHidden(true)
    let splashscreen = resource.style  &&  resource.style.splashscreen
    if (!splashscreen)
      return
    let resolvePromise
    let promise = new Promise(resolve => {
      navigator.push({
        title: "",
        component: SplashPage,
        id: 36,
        backButtonTitle: null,
        passProps: {
          splashscreen: splashscreen
        }
      })
      resolvePromise = resolve
    })
    // return
    setTimeout(() => {
      resolvePromise()
      resource._noSplash = true
      Actions.addItem({resource: resource})
      callback({resource, termsAccepted, action: 'replace'})
    }, 2000)
    return true
  }
}

module.exports = HomePageMixin;
