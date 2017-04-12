import {
  Platform
} from 'react-native'

import Analytics from 'react-native-firebase-analytics'
import ENV from './env.js'

let ENABLED
let PREV_ROUTE
const debug = require('debug')('tradle:app:analytics')

setEnabled(!__DEV__)
// setEnabled()

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
  Analytics.setEnabled(bool)
}

function sendEvent (event, data) {
  // event = prefixDev(event)
  Analytics.logEvent(event, data)
}

function sendNavigationEvent ({ route }) {
  let scene = route.component.displayName
  if (!scene) {
    if (typeof route.component === 'function') {
      scene = route.component.name || route.component.toString().match(/function (.*?)\s*\(/)[1]
    }
  }

  if (scene === PREV_ROUTE) return

  PREV_ROUTE = scene
  debug('navigated to ' + scene)
  sendEvent('nav', { scene })
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
