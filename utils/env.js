
import {
  Platform
} from 'react-native'

import DeviceInfo from 'react-native-device-info'

const MACHINE_LOCAL_IP = require('./localIP.json')
const LOCAL_IP = (function () {
  if (Platform.OS === 'android') return '10.0.2.2'

  if (Platform.OS === 'web' || DeviceInfo.getModel() === 'Simulator') {
    return 'localhost'
  }

  return MACHINE_LOCAL_IP
})()

module.exports = {
  GCM_SENDER_ID: '633104277721',
  serviceID: 'tradle',
  accessGroup: '94V7783F74.io.tradle.dev',
  LOCAL_IP: LOCAL_IP,
  LOCAL_SERVER: `http://${LOCAL_IP}:44444`,
  pushServerURL: __DEV__ ? `http://${LOCAL_IP}:48284` : 'https://push1.tradle.io',
  isAndroid: function () {
    return Platform.OS === 'android'
  },
  isIOS: function () {
    return Platform.OS === 'ios'
  },
  isWeb: function () {
    return Platform.OS === 'web'
  },
  autoOptInTouchId: false,
  lenientPassword: true,
  allowAddServer: true,
  allowForgetMe: true,
  get prefillForms() {
    if (typeof PREFILL_FORMS === 'boolean') return PREFILL_FORMS

    return __DEV__
  },
  serverToSendLog: __DEV__ ? `http://${LOCAL_IP}:44444/userlog` : 'https://azure1.tradle.io/userlog',
  showMyQRCode: false,
  requireDeviceLocalAuth: false
}
