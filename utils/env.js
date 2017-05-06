
import {
  Platform
} from 'react-native'

import DeviceInfo from 'react-native-device-info'
import extend from 'xtend'
// import environment from '../environment.json'
import environment from '../env/a2-local.json'
import locale from './locale'
import browser from './browser'

const getUserMedia = (function () {
  if (browser.isIE) return false
  if (browser.isSafari && !browser.isMobile) return false

  try {
    return require('getusermedia')
  } catch (err) {
    console.log('getUserMedia not supported', err)
  }
}())

console.log('getUserMedia is available', !!getUserMedia)

const LOCAL_IP = window.location.hostname

const splash = {
  tradle: require('../img/splash1536x2048.png'),
  aviva: require('../img/Aviva.png')
}

const splashContrastColor = {
  tradle: '#eeeeee',
  aviva: '#004db5'
}

const brandBG = {
  tradle: require('../img/bg.png'),
  aviva: require('../img/Aviva.png')
}

const navBarHeight = Platform.select({
  android: 85,
  ios: 64,
  web: browser.navBarHeight
})

const merged = extend({
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
  allowAddServer: true,
  allowForgetMe: true,
  get prefillForms() {
    if (typeof PREFILL_FORMS === 'boolean') return PREFILL_FORMS

    return __DEV__
  },
  serverToSendLog: __DEV__ ? `http://${LOCAL_IP}:44444/userlog` : 'https://azure1.tradle.io/userlog',
  showMyQRCode: false,
  homePage: true,
  useKeychain: true,
  pauseOnTransition: true,
  profileTitle: 'profile',
  homePageScanQRCodePrompt: false,
  // auth settings
  // require touch id or device passcode
  initWithDeepLink: '/profile',
  lenientPassword: true,
  requireDeviceLocalAuth: false,
  autoOptInTouchId: false,
  requireSoftPIN: Platform.OS === 'web',
  canUseWebcam: !!getUserMedia,
  locale: locale,
  autoRegister: false,
  // timeout after partial scan results have been processed
  blinkIDScanTimeoutInternal: 10000,
  // timeout from beginning to end of scan operation
  blinkIDScanTimeoutExternal: 30000,
  registerForPushNotifications: true,
  hideVerificationsInChat: false,
  hideProductApplicationInChat: false,
  landingPage: null, //"AvivaIntroView",
  showCollapsed: null, //{'tradle.PhotoID': 'document'}
  splashBackground: 'tradle',
  splashContrastColor: 'tradle',
  brandBackground: 'tradle',
  delayBetweenExpensiveTasks: 100,
  appName: 'Tradle',
  ie: {
    min: 11
  },
  navBarHeight: navBarHeight,
  timeZoneOffset: new Date().getTimezoneOffset() * 60 * 1000,
  analyticsIdIsPermalink: __DEV__,
  analyticsEnabled: !__DEV__,
  deepLinkHost: 'link.tradle.io'
}, environment)

merged.splashBackground = splash[merged.splashBackground]
merged.splashContrastColor = splashContrastColor[merged.splashContrastColor]
merged.brandBackground = brandBG[merged.brandBackground]

exports = module.exports = merged
