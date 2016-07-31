
import { AsyncStorage } from 'react-native'
import utils from './utils'
import Actions from '../Actions/Actions'

let CodePush = false//!__DEV__ && require('react-native-code-push')
let ON = false
let CHECKING
// every 10 mins
let DEFAULT_INTERVAL = 10 * 60 * 1000
let downloadedUpdate = false
const CODE_UPDATE_KEY = '~hascodeupdate'

// remove on app start
// in case the user restarted the app manually
AsyncStorage.removeItem(CODE_UPDATE_KEY)

module.exports = {
  sync,
  on,
  off,
  hasUpdate,
  install
}

function hasUpdate () {
  return AsyncStorage.getItem(CODE_UPDATE_KEY)
    .then(item => !!item, err => false)
}

function install () {
  return AsyncStorage.getItem(CODE_UPDATE_KEY)
    .then(item => {
      if (item) {
        return AsyncStorage.removeItem(CODE_UPDATE_KEY)
          .then(() => CodePush.restartApp())
      }
    })
}

function checkPeriodically (millis) {
  if (CHECKING) return CHECKING

  millis = millis || DEFAULT_INTERVAL
  return CHECKING = sync()
    .then(() => utils.promiseDelay(millis))
    // loop
    .then(() => ON && checkPeriodically(millis))
}

function sync () {
  if (!(CodePush && ON)) return Promise.resolve(false)
  if (downloadedUpdate) return Promise.resolve(true)

  return CodePush.sync({
    // use our own dialog below when the download completes
    updateDialog: false,
    installMode: CodePush.InstallMode.ON_NEXT_RESTART
  })
  .then(
    syncStatus => {
      if (syncStatus === CodePush.SyncStatus.UPDATE_INSTALLED) {
        AsyncStorage.setItem(CODE_UPDATE_KEY, '1')
        return downloadedUpdate = true
      }
    },
    err => false
  )
}

function on (period) {
  if (CodePush && !ON) {
    ON = true
    checkPeriodically(period)
  }
}

function off () {
  if (CodePush) ON = false
}
