
import { AlertIOS } from 'react-native'
import LocalAuth from 'react-native-local-auth'
import Q from 'q'

// var SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
var AUTH_FAILED_MSG = 'Authentication failed'
var authenticated = false
var pendingAuth

export function isAuthenticated () {
  return authenticated
}

export function unauthenticateUser () {
  authenticated = false
}

export function authenticateUser (reason) {
  if (authenticated) return Q(authenticated)
  // prevent two authentication requests from
  // going in concurrently and causing problems
  if (pendingAuth) return pendingAuth

  return pendingAuth = LocalAuth.authenticate({
      reason: reason || 'unlock Tradle with your fingerprint',
      fallbackToPasscode: true,
      suppressEnterPassword: true
    })
    .then(() => {
      authenticated = true
    })
    .catch((err) => {
      var message
      switch (err.name) {
        case 'LAErrorUserCancel':
          break
        // case 'RCTTouchIDNotSupported':
        //   // fall through
        // case 'LAErrorTouchIDNotAvailable':
        //   throw new Error('device not supported')
        // case 'LAErrorTouchIDNotEnrolled':
        //   message = SETUP_MSG
        //   break
        case 'LAErrorSystemCancel':
          message = 'Authentication failed. Please restart the app before trying again.'
          break
        default:
          message = __DEV__
            ? `error: ${err.message}, stack: ${err.stack}`
            : AUTH_FAILED_MSG
          break
      }

      if (message) AlertIOS.alert(message)

      authenticated = false
    })
    .then(() => {
      pendingAuth = undefined
      return authenticated
    })
}
