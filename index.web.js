// if (window.history && !localStorage._tradleTimeTraveled) {
//   if (history.length > 2) {
//     localStorage.setItem('_tradleTimeTraveled', 'y')
//     history.go(-(history.length - 2))
//   }
// }

// localStorage.removeItem('_tradleTimeTraveled')

// if we wake up on a non-zero route, go back to route 0
//
// will not be necessary when we switch to redux and save all state including history
// and get our bearings from the url

import {
  isFF,
  isSafari,
  isIE,
  ieVersion,
  isFFPrivateBrowsing,
  isSafariPrivateBrowsing
} from './utils/browser'

if (global.history && global.history.length) {
  const historyIndex = parseInt(location.hash.replace('#/scene_', ''))
  if (historyIndex) {
    location.href = location.href.slice(0, location.href.indexOf('#') + 1)
  }
}

const Alert = require('./web/shims/Alert')
require('react-native').Alert = Alert
require('./css/customicons.css')
require('./css/ionicons.min.css')
require('./css/styles.css')

const BROWSER_RECOMMENDATION = 'Please use Chrome, Safari, Firefox or IE11+'
const ENV = require('./environment.json')

if ((ENV.offerKillSwitchAfterApplication || ENV.wipeAfterApplication) && localStorage.userWipedDevice) {
  try {
    localStorage.removeItem('userWipedDevice')
  } catch (err) {}

  showAlert({
    title: `All is well`,
    message: `Local data successfully deleted. We are now processing your verification details and will contact you again shortly. Your data has been erased from the browser's local storage.`
  })
} else {
  testEnvironment().then(init, alertError)
}

function ensureOneTab () {
  const isOnlyTab = require('onetab')
  isOnlyTab.timeout = 5000
  isOnlyTab(function (err, yes) {
    if (err || !yes) {
      return alertError('This application is open in another tab. Please close one of the two tabs and refresh the page.')
    }
  })
}

function init () {
  ensureOneTab()
  if (!console.table) console.table = console.log

  require('whatwg-fetch')
  require('./web/shims/deviceEventEmitter')
  require('./web/shims/orientation')
  require('./index.common')

  const AppRegistry = require('react-native').AppRegistry
  const app = document.createElement('div')
  document.body.appendChild(app)
  AppRegistry.runApplication('Tradle', {
    rootTag: app
  })

  setTimeout(function () {
    const splash = document.getElementById('splashscreen')
    splash.parentNode.removeChild(splash)
  }, 500)
}

async function testEnvironment () {
  if (/Mobi/.test(navigator.userAgent)) {
    throw new Error('This application is not supported in mobile browsers. ' + BROWSER_RECOMMENDATION + ' on desktop')
  }

  if (typeof window === 'object') {
    const crypto = window.crypto || window.msCrypto
    if (!(crypto && crypto.getRandomValues)) {
      throw new Error('This application is not supported in browsers without a strong random number generator. ' + BROWSER_RECOMMENDATION)
    }
  }

  if (!window.indexedDB) {
    throw new Error('This application is not supported in this browser. ' + BROWSER_RECOMMENDATION)
  }

  if (isSafari) {
    if (isSafariPrivateBrowsing) {
      throw new Error('This application cannot be used in Private Browsing mode, due to storage and security limitations')
    }
  }

  if (isIE) {
    if (ENV.ie === false) {
      throw new Error('This application is not supported in this browser. ' + BROWSER_RECOMMENDATION)
    }

    if (ENV.ie && ENV.ie.min && ieVersion < ENV.ie.min) {
      throw new Error('This application is not supported this version of this browser. ' + BROWSER_RECOMMENDATION)
    }

    if (!window.indexedDB) {
      throw new Error('This application cannot be used in InPrivate Browsing mode, due to storage and security limitations')
    }
  }

  if (isFF) {
    let isPrivateBrowsing
    try {
      isPrivateBrowsing = await isFFPrivateBrowsing()
    } catch (err) {
      throw new Error('Something has gone wrong. Please refresh.')
    }

    if (isPrivateBrowsing) {
      throw new Error('This application cannot be used in Private Browsing mode, due to storage and security limitations')
    }
  }
}

function alertError (err) {
  showAlert({
    title: 'Oh no!',
    message: err.message || err
  })
}

function showAlert ({ title, message }) {
  const rootEl = document.createElement('div')
  rootEl.className = 'body'
  document.body.appendChild(rootEl)
  Alert.alert(title, message, [])
}
