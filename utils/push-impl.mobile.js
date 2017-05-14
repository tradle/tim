import { Platform } from 'react-native'
import Push from 'react-native-push-notification'
import once from 'once'
import ENV from './env'

let resolveWithToken
let promiseToken = new Promise(resolve => resolveWithToken = resolve)

exports.init = once(function init ({ onNotification, requestPermissions=false }) {
  Push.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: device => resolveWithToken(device.token),

    // (required) Called when a remote or local notification is opened or received
    onNotification,

    // ANDROID ONLY: (optional) GCM Sender ID.
    senderID: ENV.GCM_SENDER_ID,

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true
    },

    /**
      * IOS ONLY: (optional) default: true
      * - Specified if permissions will requested or not,
      * - if not, you must call PushNotificationsHandler.requestPermissions() later
      */
    requestPermissions
  })
})

exports.localNotification = function localNotification (opts) {
  return Push.localNotification(opts)
}

exports.register = async function register () {
  if (Platform.OS === 'ios') {
    Push.requestPermissions()
    return promiseToken
  }

  let backoff = 1000
  while (true) {
    Push.requestPermissions()
    try {
      await Promise.race([
        promiseToken,
        failIn(5000)
      ])

      return promiseToken
    } catch (err) {
      backoff = Math.min(backoff * 2, 60000)
    }
  }
}

function failIn (millis) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('timed out'))
    }, millis)
  })
}
