
import {
  Platform
} from 'react-native'

module.exports = {
  GCM_SENDER_ID: '1069381032456',
  serviceID: 'tradle',
  accessGroup: '94V7783F74.io.tradle.dev',
  LOCAL_IP: __DEV__ && require('./localIP.json'),
  isAndroid: function () {
    return Platform.OS === 'android'
  },
  isIOS: function () {
    return Platform.OS === 'ios'
  },
  isWeb: function () {
    return Platform.OS === 'web'
  },
}
