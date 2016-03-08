
import { AlertIOS } from 'react-native'

let CodePush = false && !__DEV__ && require('react-native-code-push')

let noop = () => {}
let ON = false
let timeout
// every 10 mins
let interval = 10 * 60 * 1000

export function sync () {
  if (!CodePush) return

  clearTimeout(timeout)
  CodePush.sync({
    // use our own dialog below when the download completes
    updateDialog: false,
    installMode: CodePush.InstallMode.ON_NEXT_RESUME
  }, (syncStatus) => {
    switch (syncStatus) {
      case CodePush.SyncStatus.UPDATE_INSTALLED:
        AlertIOS.alert('Update available', 'Please install the update.', [{
          text: 'Install',
          onPress: () => CodePush.restartApp()
        }])
        break
    }
  })

  if (ON) {
    timeout = setTimeout(sync, interval)
  }
}

export function on () {
  if (!CodePush) return
  if (!ON) {
    ON = true
    sync()
  }
}

export function off () {
  if (!CodePush) return

  clearTimeout(timeout)
  ON = false
}

export function setInterval (syncInterval) {
  interval = syncInterval
}
