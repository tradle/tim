import { Alert } from 'react-native'
import Bluebird from 'bluebird'
import { enable } from 'promise/setimmediate/rejection-tracking'

const alertUnhandled = (id, error) => {
  let message
  let stack

  const stringValue = Object.prototype.toString.call(error)
  if (stringValue === '[object Error]') {
    message = Error.prototype.toString.call(error)
    stack = error.stack
  } else {
    message = require('pretty-format')(error)
  }

  const warning =
    `Possible Unhandled Promise Rejection (id: ${id}):\n` +
    `${message}\n` +
    (stack == null ? '' : stack);

  console.warn(warning);
  Alert.alert('possibly unhandled rejection', error.stack)
  debugger
}

enable({
  allRejections: true,
  onUnhandled: (id, error = {}) => alertUnhandled(id, error),
  onHandled: (id) => {
    const warning =
      `Promise Rejection Handled (id: ${id})\n` +
      'This means you can ignore any previous messages of the form ' +
      `"Possible Unhandled Promise Rejection (id: ${id}):"`;
    console.warn(warning);
  },
});

Bluebird.onPossiblyUnhandledRejection(err => alertUnhandled(null, err))
