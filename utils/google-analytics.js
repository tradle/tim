import {
  GoogleAnalyticsTracker,
  // GoogleTagManager,
  // GoogleAnalyticsSettings
} from 'react-native-google-analytics-bridge'

import ENV from './env.js'

const debug = require('debug')('tradle:app:analytics')
let TRACKER

if (ENV.gaTrackerId) {
  TRACKER = new GoogleAnalyticsTracker(ENV.gaTrackerId)
  setAppName(ENV.appName)
  // setDryRun(__DEV__)
}

module.exports = (function () {
  const api = {
    sendEvent,
    sendTiming,
    sendException,
    setUserId,
    setAppName
  }

  Object.keys(api).forEach(method => {
    let fn = api[method]
    api[method] = function (...args) {
      try {
        if (!TRACKER) {
          debug(`tracker not set, ignoring ${method}: ${JSON.stringify(args)}`)
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

function sendEvent ({ category, action, data }) {
  category = prefixDev(category)
  TRACKER.trackEvent(category, action, data)
}

function sendTiming ({ category, time, data }) {
  category = prefixDev(category)
  TRACKER.trackTiming(category, time, data)
}

function sendException ({ message, fatal=false }) {
  message = prefixDev(message)
  TRACKER.trackException(message, fatal)
}

function setUserId (userId) {
  userId = prefixDev(userId)
  TRACKER.setUser(userId)
}

function setAppName (appName) {
  TRACKER.setAppName(appName)
}

// function setDryRun (bool=false) {
//   GoogleAnalyticsSettings.setDryRun(bool)
// }

function prefixDev (str) {
  return __DEV__ ? 'dev:' + str : str
}
