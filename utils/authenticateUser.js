
import { AlertIOS } from 'react-native'
import TouchID from 'react-native-touch-id'

var SETUP_MSG = 'Please set up Touch ID first, so the app can better protect your data.'
var AUTH_FAILED_MSG = 'Authentication failed'

export default async function authenticateUser () {
  try {
    await TouchID.isSupported()
  } catch (err) {
    AlertIOS.alert(SETUP_MSG)
    return false
  }

  try {
    await TouchID.authenticate('authenticate yourself!')
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
    }

    if (message) AlertIOS.alert(message)

    return false
  }

  return true
}
