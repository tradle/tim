import {
  Alert
} from 'react-native'

import {
  setJSExceptionHandler,
  setNativeExceptionHandler
} from 'react-native-exception-handler'

let afterFatalError

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
  // submit first fatal error, but don't go into infinite loop
  if (!__DEV__ && !afterFatalError) {
    await submitLog()
  }
}

async function errorHandler (e, isFatal) {
  await reporter(e, isFatal)
  if (__DEV__) return

  if (!afterFatalError && isFatal) {
    afterFatalError = true
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

if (__DEV__) {
  require('./track-rejections')
}
