
import {
  Platform
} from 'react-native'

const LOCAL_IP = require('./localIP')

module.exports = {
  GCM_SENDER_ID: '633104277721',
  serviceID: 'tradle',
  accessGroup: '94V7783F74.io.tradle.dev',
  LOCAL_IP: Platform.OS === 'android' ? '10.0.2.2' : LOCAL_IP,
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
  autoOptInTouchId: true,
  allowAddServer: true,
  allowForgetMe: true
}
