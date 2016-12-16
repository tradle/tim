
import {
  Platform
} from 'react-native'

let LOCAL_IP
try {
  LOCAL_IP = require('./localIP.json')
} catch (err) {
  LOCAL_IP = 'localhost'
}

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
  get prefillWithTestData() {
    if (typeof global.PREFILL_FORMS === 'boolean') {
      return global.PREFILL_FORMS
    }

    return __DEV__
  },
  autoOptInTouchId: false,
  lenientPassword: true,
  allowAddServer: true,
  allowForgetMe: true
}
