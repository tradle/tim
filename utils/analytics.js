// import {
//   Platform
// } from 'react-native'

// import firebase from 'react-native-firebase'
import ENV from './env'
import { getRouteName } from './utils'

let ENABLED
let PREV_ROUTE
const debug = require('debug')('tradle:app:analytics')
// const Analytics = firebase.analytics()
const noop = () => {}
// mock of firebase analytics api, to be used later
// stubbed out when removed firebase
const Analytics = {
  setAnalyticsCollectionEnabled: noop,
  logEvent: noop,
  setUserId: noop,
  setUserProperty: noop,
}

setEnabled(ENV.analyticsEnabled)

module.exports = (function () {
  const api = {
    sendEvent,
    sendNavigationEvent,
    setUserId,
    setUserProperty,
    setEnabled
  }

  Object.keys(api).forEach(method => {
    let fn = api[method]
    api[method] = function (...args) {
      try {
        if (!ENABLED) {
          debug(`analytics not enabled, ignoring "${method}"`)
          return
        }

        return fn(...args)
      } catch (err) {
        debug(`tracker method ${method} failed`, err)
      }
    }
  })

  return api
}())

function setEnabled (bool=true) {
  ENABLED = bool
  debug(`analytics on: ${bool}`)
  Analytics.setAnalyticsCollectionEnabled(bool)
}

function sendEvent ({ category, action, label, value }) {
  // event = prefixDev(event)
  Analytics.logEvent(action, { category, label, value })
}

function sendNavigationEvent ({ route }) {
  const scene = getRouteName(route)
  if (scene === PREV_ROUTE) return

  PREV_ROUTE = scene
  debug('navigated to ' + scene)
  sendEvent({
    category: 'ui',
    action: 'nav',
    label: scene
  })
}

function setUserId (userId) {
  // Firebase limits the length
  userId = userId.slice(0, 20)
  userId = prefixDev(userId)
  Analytics.setUserId(userId)
}

function setUserProperty (key, value) {
  key = prefixDev(key)
  Analytics.setUserProperty(key, value)
}

function prefixDev (str) {
  return __DEV__ ? 'dev:' + str : str
}
