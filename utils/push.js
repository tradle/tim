
'use strict'

import {
  Platform,
  AppState
} from 'react-native'

import Push from 'react-native-push-notification'
const debug = require('debug')('tradle:push')
import utils from './utils'
const constants = require('@tradle/engine').constants
const TYPE = constants.TYPE
const Actions = require('../Actions/Actions')
const pushServerURL = __DEV__ ? `http://${utils.localIP}:48284` : 'https://push.tradle.io'
const noop = () => {}

let INSTANCE
let onInitialized
let promiseInit = new Promise(resolve => {
  onInitialized = resolve
})

exports.init = function (opts) {
  if (INSTANCE) throw new Error('init can only be called once')

  INSTANCE = createPusher(opts)
  onInitialized()
}

exports.subscribe = function (publisher) {
  return promiseInit.then(() => INSTANCE.subscribe && INSTANCE.subscribe(publisher))
}

exports.resetBadgeNumber = function () {
  return promiseInit.then(() => INSTANCE.resetBadgeNumber && INSTANCE.resetBadgeNumber())
}

function createPusher (opts) {
  const node = opts.node
  const Store = opts.Store
  const me = opts.me
  if (utils.isSimulator() || Platform.OS === 'android') return {}

  const identity = node.identity
  Push.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: device => {
      // Alert.alert('device token: ' + JSON.stringify(device))
      // console.log(device)
      post('/subscriber', {
        [TYPE]: 'tradle.PNSRegistration',
        identity: identity,
        token: device.token,
        // apple push notifications service
        protocol: 'apns'
      })
      .then(
        () => Actions.updateMe({ registeredForPushNotifications: true }),
        err => console.error('failed to register for push notifications', err)
      )
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: onNotification,

    // ANDROID ONLY: (optional) GCM Sender ID.
    // senderID: "YOUR GCM SENDER ID",

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
    requestPermissions: !me.registeredForPushNotifications
  })

  return {
    subscribe,
    resetBadgeNumber
  }

  function post (path, body) {
    if (path[0] === '/') path = path.slice(1)

    return node.sign({
      object: body
    })
    .then(result => {
      // TODO: encode body with protocol buffers to save space
      return utils.fetchWithBackoff(`${pushServerURL}/${path}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(result.object)
      }, 10000)
    })
  }

  function subscribe (publisher) {
    return post('/subscription', {
      [TYPE]: 'tradle.PNSSubscription',
      publisher: publisher,
      subscriber: node.permalink
    })
  }

  function onNotification (notification) {
    // {
    //     foreground: false, // BOOLEAN: If the notification was received in foreground or not
    //     message: 'My Notification Message', // STRING: The notification message
    //     data: {}, // OBJECT: The push data
    // }

    debug('NOTIFICATION:', notification)
    if (notification.foreground) {
      return resetBadgeNumber()
    }

    // Push.getApplicationIconBadgeNumber(num => {
    //   if (num) return

      const unsubscribe = Store.listen(function (event) {
        if (AppState.currentState === 'active') return unsubscribe()
        if (event.action !== 'receivedMessage') return

        const msg = event.msg

        unsubscribe()
        // const type = msg.object.object[TYPE]

        Push.localNotification({
          message: 'You have unread messages'
        })
      })

      setTimeout(unsubscribe, 20000)
    // })

    // example
    // const foreground = notification.foreground ? 'foreground' : 'background'
    // Push.localNotification({
    //     /* Android Only Properties */
    //     // title: `${notification.message} [${foreground}]`, // (optional)
    //     // ticker: "My Notification Ticker", // (optional)
    //     // autoCancel: true, (optional) default: true,
    //     // largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
    //     // smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
    //     // bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
    //     // subText: "This is a subText", // (optional) default: none
    //     // number: 10, // (optional) default: none (Cannot be zero)
    //     // color: "red", // (optional) default: system default

    //     /* iOS and Android properties */
    //   message: `${notification.message} [${foreground}]`
    // });
  }

  function resetBadgeNumber () {
    if (Platform.OS !== 'ios') return

    Push.getApplicationIconBadgeNumber(num => {
      if (!num) return

      post('/clearbadge', {
        // TODO: add nonce to prevent replays
        [TYPE]: 'tradle.APNSClearBadge',
        subscriber: node.permalink
      })
      .then(
        () => Push.setApplicationIconBadgeNumber(0),
        err => console.error('failed to clear push notifications badge', err)
      )
    })
  }
}
