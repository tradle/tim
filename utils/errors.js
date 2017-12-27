console.log('requiring errors.js')
import {
  Alert
} from 'react-native'

import {
  setJSExceptionHandler,
  setNativeExceptionHandler
} from 'react-native-exception-handler'

setJSExceptionHandler(errorHandler, true)
setNativeExceptionHandler(errorHandler, true)

function restarter () {
  const { restartApp } = require('./utils')
  restartApp()
}

function submitLog () {
  return require('./utils').submitLog()
}

async function reporter (error, isFatal) {
  const pre = isFatal ? 'experienced fatal error' : 'experienced error'
  console.error(pre, error, error.stack)
  if (!__DEV__) {
    await submitLog()
  }
}

async function errorHandler (e, isFatal) {
  await reporter(e, isFatal)
  if (!__DEV__  &&  isFatal) {
    Alert.alert(
      'Unexpected error occurred',
      'We have reported this to our team! Click Restart App to restart the app!',
      [{
        text: 'Restart App',
        onPress: restarter
      }]
    )
  }
}
