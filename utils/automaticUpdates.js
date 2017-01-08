
import { AsyncStorage, Alert } from 'react-native'
import utils from './utils'
import Actions from '../Actions/Actions'

let CodePush = !__DEV__ && !utils.isSimulator() && require('react-native-code-push')
if (CodePush) CodePush.notifyAppReady()

let ON = !!CodePush
let CHECKING
// every 10 mins
let DEFAULT_INTERVAL = 10 * 60 * 1000
let downloadedUpdate = false
let currentSync
const CODE_UPDATE_KEY = '~hascodeupdate'
const noop = () => {}

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
  if (downloadedUpdate) return Promise.resolve(true)

  return AsyncStorage.getItem(CODE_UPDATE_KEY)
    .then(
      item => downloadedUpdate = !!item,
      err => false
    )
}

function install (opts = {
  alert: 'Installing update...',
  delay: 3000
}) {
  let { alert, delay } = opts
  return AsyncStorage.getItem(CODE_UPDATE_KEY)
    .then(item => {
      if (!item) return

      return AsyncStorage.removeItem(CODE_UPDATE_KEY)
        .then(() => {
          if (alert) {
            delay = delay || 3000
            Alert.alert(typeof alert === 'string' ? alert: 'installing update...')
          }

          if (delay) {
            return utils.promiseDelay(delay)
          }
        })
        .then(() => CodePush.restartApp())
    })
}

function checkPeriodically (millis) {
  if (CHECKING) return CHECKING

  millis = millis || DEFAULT_INTERVAL
  return CHECKING = utils.promiseDelay(millis)
    .then(sync)
    .then(() => {
      if (!downloadedUpdate) {
        // loop
        return ON && checkPeriodically(millis)
      }
    })
}

function sync (opts={}) {
  if (!(CodePush && ON)) return Promise.resolve(false)
  if (downloadedUpdate) return Promise.resolve(true)
  if (currentSync) return currentSync

  return currentSync = CodePush.sync(
    {
      // use our own dialog below when the download completes
      updateDialog: false,
      installMode: CodePush.InstallMode.ON_NEXT_RESTART
    },
    opts.onSyncStatusChanged,
    opts.onDownloadProgress
  )
  .then(
    syncStatus => {
      if (syncStatus === CodePush.SyncStatus.UPDATE_INSTALLED) {
        return AsyncStorage.setItem(CODE_UPDATE_KEY, '1')
          .then(() => {
            downloadedUpdate = true
            Actions.downloadedCodeUpdate()
          })
      }
    },
    err => false
  )
  .then(result => {
    currentSync = null
    return result
  })
}

function on (period) {
  if (CodePush) {
    ON = true
    checkPeriodically(period)
  }
}

function off () {
  if (CodePush) ON = false
}
