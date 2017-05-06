'use strict';

var React = require('react');
var debug = require('debug')('tradle:app:HomePageMixin')
var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var QRCodeScanner = require('./QRCodeScanner')
var Actions = require('../Actions/Actions')
var ResourceList = require('./ResourceList')
var MessageList = require('./MessageList')
var defaultBankStyle = require('../styles/bankStyle.json')
var MessageList = require('./MessageList')
var extend = require('extend')
const qrCodeDecoder = require('@tradle/qr-schema')

import {
  Alert
} from 'react-native';

const WEB_TO_MOBILE = '0'
const TALK_TO_EMPLOYEEE = '1'
const APP_QR_CODE = '5'
const PROFILE = constants.TYPES.PROFILE

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

  onread(isView, result) {
    // Pairing devices QRCode
    try {
      result = qrCodeDecoder.fromHex(result.data).data
    } catch (err) {
      debug('failed to parse qrcode', result.data)
      this.onUnknownQRCode()
      return
    }

    let h, code
    if (typeof result.data === 'string') {
      if (result.data.charAt(0) === '{') {
        let h = JSON.parse(result.data)
        Actions.sendPairingRequest(h)
        this.props.navigator.pop()
        return
      }
      else {
        h = result.data.split(';')
        code = h[0]
      }
    }
    else
     code = result.schema === 'ImportData' ? WEB_TO_MOBILE : "0" // result.dataHash, result.provider]

    // post to server request for the forms that were filled on the web
    let me = utils.getMe()
    switch (code) {
    case WEB_TO_MOBILE:
      let r = {
        _t: 'tradle.GuestSessionProof',
        session: result.dataHash,
        from: {
          id: utils.getId(me),
          title: utils.getDisplayName(me)
        },
        to: {
          id: PROFILE + '_' + result.provider
        }
      }
      Actions.addItem({
        resource: r,
        value: r,
        provider: {
          url: result.host,
          hash: result.provider
        },
        meta: utils.getModel('tradle.GuestSessionProof').value,
        disableAutoResponse: true})
      break
    case TALK_TO_EMPLOYEEE:
      Actions.getEmployeeInfo(result.data.substring(code.length + 1))
      break
    case APP_QR_CODE:
      Actions.addApp(result.data.substring(code.length + 1))
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
        modelName: constants.TYPES.MESSAGE,
        currency: params.to.currency,
        bankStyle:  style,
        dictionary: params.dictionary,
      }
    }
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
        modelName: constants.TYPES.ORGANIZATION
      }
    });
  }
}

module.exports = HomePageMixin;
