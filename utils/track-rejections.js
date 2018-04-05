import { Alert } from 'react-native'
import Bluebird from 'bluebird'
import { enable } from 'promise/setimmediate/rejection-tracking'

const alertUnhandled = err => {
  console.error('unhandled rejection', err.stack)
  Alert.alert('unhandled rejection', err.stack)
  debugger
}

enable({
  allRejections: true,
  onUnhandled: (id, error = {}) => {
    alertUnhandled(error)
  }
});

Bluebird.onPossiblyUnhandledRejection(alertUnhandled)
