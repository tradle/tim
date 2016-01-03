
import { AlertIOS } from 'react-native'
import TouchID from 'react-native-touch-id'

var SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
var AUTH_FAILED_MSG = 'Authentication failed'
var AUTHENTICATION_EXPIRES_IN = 60000
var authenticated = false

export async function unauthenticateUser () {
  authenticated = false
}

export async function authenticateUser () {
  if (authenticated) return authenticated

  try {
    await TouchID.isSupported()
  } catch (err) {
    AlertIOS.alert(SETUP_MSG)
    return false
  }

  try {
    await TouchID.authenticate('authenticate yourself!', true) // fall back to passcode
  } catch (err) {
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

    return false
  }

  authenticated = true
  setTimeout(unauthenticateUser, AUTHENTICATION_EXPIRES_IN)
  return authenticated
}
