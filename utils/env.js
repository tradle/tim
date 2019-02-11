import {
  Platform
} from 'react-native'

import DeviceInfo from 'react-native-device-info'
import extend from 'xtend'
import environment from '../environment-cloud.json'

const LOCAL_IP = (function () {
  if (Platform.OS === 'web') {
    return 'localhost'
  }

  if (DeviceInfo.isEmulator()) {
    return Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
  }


  return require('./localIP')
})()

const PROD_PUSH_SERVER = 'https://push1-prod.tradle.io'

const splash = {
  get tradle() { return require('../img/splash1536x2048.png') },
  // get aviva() { return require('../img/Aviva.png') }
}

const splashContrastColor = {
  tradle: '#eeeeee',
  // aviva: '#004db5'
}

const brandBG = {
  get tradle() { return require('../img/bg.png') },
  // get aviva() { return require('../img/Aviva.png') }
}

const navBarHeight = Platform.select({
  android: 85,
  ios: 64
})
// LOCAL_TRADLE_SERVER: `http://${LOCAL_IP}:44444`,

const idInAppStore = Platform.select({
  ios: '1227944773'
})

const bundleId = DeviceInfo.getBundleId()
const APP_URL = Platform.select({
  // ios: `itms-apps://itunes.apple.com/us/app/tradle/id${idInAppStore}?mt=8`,
  ios: `https://itunes.apple.com/us/app/tradle/id${idInAppStore}?mt=8`,
  android: `https://play.google.com/store/apps/details?id=${bundleId}`,
  web: 'https://app.tradle.io'
})

const merged = extend({
  GCM_SENDER_ID: '633104277721',
  serviceID: 'tradle',
  accessGroup: '94V7783F74.io.tradle.dev',
  LOCAL_IP: LOCAL_IP,
  LOCAL_TRADLE_SERVERS: [
    `http://${LOCAL_IP}:21012`,
    // // silly
    // 'https://4uxjw2j0cc.execute-api.ap-southeast-2.amazonaws.com/dev',
    // // `http://${LOCAL_IP}:21013`,
    // hats
    // 'https://ho0ys6dppg.execute-api.us-east-1.amazonaws.com/dev',
    // friendly.io
    'https://tv5n42vd5f.execute-api.us-east-1.amazonaws.com/dev',
    // // tradle.io
    // 'https://t22ju1ga5c.execute-api.us-east-1.amazonaws.com/dev',
    // // safere.io
    // 'https://a87crkepec.execute-api.us-east-1.amazonaws.com/dev',
    // // easybank.io
    // 'https://m6rpwdztvk.execute-api.us-east-1.amazonaws.com/dev',
    // // perpetualguardian.co.nz
    // 'https://hkooibqf60.execute-api.us-east-1.amazonaws.com/dev',
    // // r3.com
    // 'https://9xzhlnx5fb.execute-api.us-east-1.amazonaws.com/dev',
    // lenka
    // 'https://xt2n679eyk.execute-api.us-east-1.amazonaws.com/dev',
  ],
  pushServerURL: PROD_PUSH_SERVER,
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
  allowForgetMe: false,
  allowWipe: true,
  allowPairDevices: false,
  get prefillForms() {
    if (typeof PREFILL_FORMS === 'boolean') return PREFILL_FORMS

    return __DEV__
  },
  // userLogEndpoint: 'https://azure1.tradle.io/userlog',
  userLogEndpoint: 'https://mc84jjb1a6.execute-api.us-east-1.amazonaws.com/dev/logs/userlog',
  userLogEndpointAPIKey: null,
  showMyQRCode: true,
  homePage: true,
  useKeychain: true,
  profileTitle: 'profile',
  homePageScanQRCodePrompt: false,
  // auth settings
  // require touch id or device passcode
  // initWithDeepLink: 'https://link.tradle.io/chat?url=https%3A%2F%2Fyy6zli69ab.execute-api.us-east-1.amazonaws.com%2Fdev%2F&permalink=39861772703ae85fa134255f0b44749a8a70d85ba26dde287c1cb3f3ab932fbb',
  requireDeviceLocalAuth: false,
  autoOptInTouchId: false,
  autoRegister: false,
  requireSoftPIN: false,
  locale: {
    language: DeviceInfo.getDeviceLocale(),
    country: DeviceInfo.getDeviceCountry()
  },
  // documentScanner: 'blinkid',
  // timeout after partial scan results have been processed
  blinkIDScanTimeoutInternal: 10000,
  // timeout from beginning to end of scan operation
  blinkIDScanTimeoutExternal: 30000,
  registerForPushNotifications: true,
  hideVerificationsInChat: false,
  hideProductApplicationInChat: false,
  // landingPage: "AvivaIntroView",
  // tour: "TourPage",
  // tourPages: {
  //   pages: [
  //     'https://tradle.io/images/bot-big.png',
  //     'https://tradle.io/',
  //     'https://blog.tradle.io/',
  //     'https://youtube.com/'
  //   ]
  // },
  showCollapsed: null, //{'tradle.PhotoID': 'document'}
  splashBackground: 'tradle',
  splashContrastColor: 'tradle',
  brandBackground: 'tradle',
  delayBetweenExpensiveTasks: 100,
  appName: 'Tradle',
  navBarHeight: navBarHeight,
  timeZoneOffset: new Date().getTimezoneOffset() * 60 * 1000,
  analyticsIdIsPermalink: __DEV__,
  analyticsEnabled: !__DEV__,
  deepLinkHost: 'link.tradle.io',
  appScheme: 'tradle',
  yukiOn: false,
  paintContextIds: false,
  tradleAPIKey: null,
  tradleAPIEndpoint: 'https://suqwvc3g0d.execute-api.us-east-1.amazonaws.com/dev/',
  resetCheckpoint: 0,
  APP_URL,
  SILENT_TYPES: [
    'tradle.Seal',
    'tradle.CustomerWaiting',
    'tradle.ModelsPack',
    'tradle.StylesPack',
    'tradle.Introduction',
    'tradle.SelfIntroduction',
    'tradle.IdentityPublished',
    'tradle.AssignRelationshipManager',
  ],
  // JPEG compression
  imageQuality: 1, //0.2,
}, environment)

merged.splashBackground = splash[merged.splashBackground]
merged.splashContrastColor = splashContrastColor[merged.splashContrastColor]
merged.brandBackground = brandBG[merged.brandBackground]
if (!__DEV__) {
  merged.paintContextIds = false
}

exports = module.exports = merged
