
const debug = require('debug')('tim:local-auth')
import { AlertIOS } from 'react-native'
import LocalAuth from 'react-native-local-auth'
import Errors from 'react-native-local-auth/data/errors'

import Q from 'q'

// const SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
const AUTH_FAILED_MSG = 'Authentication failed'
const DEFAULT_OPTS = {
  reason: 'unlock Tradle to proceed',
  fallbackToPasscode: false,
  suppressEnterPassword: false
}

let authenticated = false
let pendingAuth

exports.Errors = require('react-native-local-auth/data/errors')

export function hasTouchID () {
  return LocalAuth.hasTouchID()
}

export function isAuthenticated () {
  return authenticated
}

export function setAuthenticated (val) {
  authenticated = val
}

export function unauthenticateUser () {
  authenticated = false
}

export function authenticateUser (opts) {
  if (authenticated) return Q(authenticated)
  // prevent two authentication requests from
  // going in concurrently and causing problems
  if (pendingAuth) return pendingAuth

  opts = typeof opts === 'string' ? { reason: opts} : opts || {}
  opts = { ...DEFAULT_OPTS, ...opts }
  return pendingAuth = LocalAuth.authenticate(opts)
    .then(() => {
      authenticated = true
      pendingAuth = undefined
    })
    .catch((err) => {
      authenticated = false
      pendingAuth = undefined

      if (__DEV__ && !(err.name in Errors)) {
        let message = `error: ${err.message}, stack: ${err.stack}`
        debug(JSON.stringify(err))
        AlertIOS.alert(message)
      }

      throw err
    })
}
