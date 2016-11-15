
import {
  Platform
} from 'react-native'

const LOCAL_IP = require('./localIP.json')

module.exports = {
  GCM_SENDER_ID: '633104277721',
  serviceID: 'tradle',
  accessGroup: '94V7783F74.io.tradle.dev',
  LOCAL_IP: LOCAL_IP,
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
  get prefillWithTestData() {
    if (typeof global.PREFILL_FORMS === 'boolean') {
      return global.PREFILL_FORMS
    }

    return __DEV__
  },
  lenientPassword: true
}
