
import { AlertIOS } from 'react-native'
import LocalAuth from 'react-native-local-auth'
import Q from 'q'

// var SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
var AUTH_FAILED_MSG = 'Authentication failed'
var timeout
var AUTHENTICATION_EXPIRES_IN = 300000
var authenticated = false

export function unauthenticateUser () {
  authenticated = false
}

export function authenticateUser () {
  if (authenticated) return Q(authenticated)

  return LocalAuth.authenticate({
      reason: 'please unlock the app',
      fallbackToPasscode: true,
      suppressEnterPassword: true
    })
    .then(() => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(unauthenticateUser, AUTHENTICATION_EXPIRES_IN)
      return authenticated = true
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

      return authenticated = false
    })
}
