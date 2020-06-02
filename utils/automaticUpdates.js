import { Alert } from 'react-native'
import Debug from 'debug'
import { runWithTimeout } from '@tradle/promise-utils'
import utils from './utils'
import Actions from '../Actions/Actions'
import AsyncStorage from './async-storage'

const debug = Debug('tradle:auto-update')
let CodePush = !__DEV__ && !utils.isWeb() && require('react-native-code-push')

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

const hasUpdate = async () => {
  if (downloadedUpdate) return true

  try {
    const item = await AsyncStorage.getItem(CODE_UPDATE_KEY)
    downloadedUpdate = !!item
  } catch (err)  {
    return false
  }
}

const install = async (opts={}) => {
  const { warn=true, delay=3000 } = opts
  const item = await AsyncStorage.getItem(CODE_UPDATE_KEY)
  if (!item) return false

  if (warn) {
    Actions.showModal({
      title: utils.translate('installingUpdate') + '...',
      message: utils.translate('restartingApp')
    })
  }

  if (typeof delay === 'number' && delay > 0) {
    await utils.promiseDelay(delay)
  }

  Actions.hideModal()

  // give modal time to hide
  await Promise.all([
    utils.promiseDelay(100),
    AsyncStorage.removeItem(CODE_UPDATE_KEY)
  ])

  CodePush.restartApp()
  return true
}

const sync = async (opts={}) => {
  if (!(CodePush && ON)) return false
  if (downloadedUpdate) return true

  const { timeout } = opts
  if (currentSync) {
    return runWithTimeout(currentSync, timeout)
  }

  currentSync = CodePush.sync(
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
        debug('downloaded update')
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

  return sync(opts)
}

const on = (period) => {
  if (CodePush) {
    ON = true
    checkPeriodically(period)
  }
}

const off = () => {
  if (CodePush) ON = false
}

const checkPeriodically = (millis=DEFAULT_INTERVAL) => {
  if (CHECKING) return CHECKING

  return CHECKING = sync()
    .catch(err => {
      debug('sync failed', err.message)
    })
    .then(() => utils.promiseDelay(millis))
    .then(() => {
      if (!downloadedUpdate) {
        // loop
        return ON && checkPeriodically(millis)
      }
    })
}

sync().catch(err => debug('sync failed', err.message))

module.exports = {
  hasUpdate,
  install,
  sync,
  on,
  off,
}
