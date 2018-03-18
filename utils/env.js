console.log('requiring env.js')
import {
  Platform
} from 'react-native'

import DeviceInfo from 'react-native-device-info'
import extend from 'xtend'
import environment from '../environment.json'
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

const DEV_PUSH_SERVER = 'https://push1.tradle.io' //`http://${LOCAL_IP}:48284`
const PROD_PUSH_SERVER = 'https://push1-prod.tradle.io'

const splash = {
  get tradle() { return require('../img/splash1536x2048.png') },
  get aviva() { return require('../img/Aviva.png') }
}

const splashContrastColor = {
  tradle: '#eeeeee',
  aviva: '#004db5'
}

const brandBG = {
  get tradle() { return require('../img/bg.png') },
  get aviva() { return require('../img/Aviva.png') }
}

const navBarHeight = Platform.select({
  android: 85,
  ios: 64,
  web: browser.navBarHeight
})
// LOCAL_TRADLE_SERVER: `http://${LOCAL_IP}:44444`,

const bundleId = DeviceInfo.getBundleId()
const APP_URL = Platform.select({
  ios: `https://itunes.apple.com/us/app/${bundleId}`,
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
    // `http://${LOCAL_IP}:21013`,
    // slim
    'https://zxoapug0li.execute-api.us-east-1.amazonaws.com/dev',
    // // tradle.io
    // 'https://xwkirqs1x0.execute-api.us-east-1.amazonaws.com/dev',
    // // friendly.io
    // 'https://mwv4egtz17.execute-api.us-east-1.amazonaws.com/dev',
    // // safere.io
    // 'https://xefpez2yf0.execute-api.us-east-1.amazonaws.com/dev',
    // // easybank.io
    // 'https://dxceehvttl.execute-api.us-east-1.amazonaws.com/dev',
    // // perpetualguardian.co.nz
    // 'https://hkooibqf60.execute-api.us-east-1.amazonaws.com/dev',
    // // r3.com
    // 'https://9xzhlnx5fb.execute-api.us-east-1.amazonaws.com/dev',
  ],
  LOCAL_TRADLE_SERVER: 'https://wtpo3stsji.execute-api.us-east-1.amazonaws.com/dev/', // Goofy
  // pushServerURL: __DEV__ ? DEV_PUSH_SERVER : PROD_PUSH_SERVER,
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
  allowForgetMe: true,
  get prefillForms() {
    if (typeof PREFILL_FORMS === 'boolean') return PREFILL_FORMS

    return __DEV__
  },
  serverToSendLog: __DEV__ ? `http://${LOCAL_IP}:44444/userlog` : 'https://azure1.tradle.io/userlog',
  showMyQRCode: false,
  homePage: true,
  useKeychain: true,
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
  autoRegister: true,
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
  // blockchain start
  blockchainName: 'ethereum',
  networkName: 'rinkeby',
  // blockchain end
  appName: 'Tradle',
  ie: {
    min: 11
  },
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
  APP_URL
}, environment)

merged.splashBackground = splash[merged.splashBackground]
merged.splashContrastColor = splashContrastColor[merged.splashContrastColor]
merged.brandBackground = brandBG[merged.brandBackground]
if (!__DEV__) {
  merged.paintContextIds = false
}

exports = module.exports = merged
