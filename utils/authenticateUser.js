
import { AlertIOS } from 'react-native'
import TouchID from 'react-native-touch-id'
import Q from 'q'

var SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
var AUTH_FAILED_MSG = 'Authentication failed'
var AUTHENTICATION_EXPIRES_IN = 60000
var authenticated = false

export function unauthenticateUser () {
  authenticated = false
}

export function authenticateUser () {
  if (authenticated) return Q(authenticated)

  return TouchID.authenticate('please unlock the app', true) // fall back to passcode
    .then(() => {
      setTimeout(unauthenticateUser, AUTHENTICATION_EXPIRES_IN)
      return authenticated = true
    })
    .catch((err) => {
      var message
      switch (err.name) {
        case 'LAErrorUserCancel':
          break
        case 'RCTTouchIDNotSupported':
          // fall through
        case 'LAErrorTouchIDNotAvailable':
          throw new Error('device not supported')
        case 'LAErrorTouchIDNotEnrolled':
          message = SETUP_MSG
          break
        default:
          message = AUTH_FAILED_MSG
          break
      }

      if (message) AlertIOS.alert(message)

      return authenticated = false
    })
}
