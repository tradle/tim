
'use strict'

import {
  AppState,
  Alert
} from 'react-native'

import Push from 'react-native-push-notification'
const debug = require('debug')('tradle:push')
import extend from 'xtend/mutable'
import once from 'once'
import utils from './utils'
import ENV from './env'

const { translate } = utils
const constants = require('@tradle/engine').constants
const TYPE = constants.TYPE
const Actions = require('../Actions/Actions')
const DENIED_ERROR = new Error('denied')
// const PushModal = require('../Components/PushModal')
const pushServerURL = ENV.pushServerURL
const isMobile = () => utils.isIOS() || utils.isAndroid()

let onInitialized
let onRegistered
const whenInitialized = new Promise(resolve => onInitialized = resolve)
const whenRegistered = new Promise(resolve => onRegistered = resolve)

// only allow this to run once
exports.init = once(function (opts) {
  return onInitialized(createPusher(opts))
})

exports.register = async function () {
  const pusher = await whenInitialized
  return pusher.register()
}

exports.subscribe = async function (publisher) {
  const pusher = await whenInitialized
  await whenRegistered
  return pusher.subscribe(publisher)
}

exports.resetBadgeNumber = async function () {
  const pusher = await whenInitialized
  await whenRegistered
  return pusher.resetBadgeNumber()
}

function waitsFor (prerequisite, fn) {
  return async function runAfterPrerequisite (...args) {
    await prerequisite
    return fn(...args)
  }
}

function createPusher (opts) {
  // if (__DEV__ || utils.isSimulator() || !isMobile() || !ENV.registerForPushNotifications) {
  if (!isMobile() || !ENV.registerForPushNotifications) {
    return getAPIPlaceholder(opts)
  }

  const { me, node, Store } = opts
  const { identity } = node

  let registered = me.registeredForPushNotifications
  if (registered) onRegistered()

  let regPromise
  let unread = me.unreadPushNotifications || 0
  let resolveWithToken
  let gotToken = new Promise(resolve => resolveWithToken = resolve)

  Push.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: device => {
      // console.log(device)
      resolveWithToken(device.token)
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: onNotification,

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
    requestPermissions: false
  })

  return {
    isRegistered,
    register: waitsFor(whenInitialized, register),
    subscribe: waitsFor(whenRegistered, subscribe),
    resetBadgeNumber: waitsFor(whenRegistered, resetBadgeNumber)
  }

  function isRegistered () {
    return registered
  }

  function register () {
    if (isRegistered()) return Promise.resolve()
    if (me.pushNotificationsAllowed === false) return Promise.resolve()
    if (!regPromise) {
      regPromise = makeRegistrationAttempt()
    }

    return regPromise
  }

  async function makeRegistrationAttempt () {
    if (!me.pushNotificationsAllowed) {
      const pushNotificationsAllowed = await preAskUser()
      if (!pushNotificationsAllowed) {
        Actions.updateMe({ pushNotificationsAllowed })
        return
      }
    }

    const token = await getToken()
    Actions.updateMe({ pushNotificationsAllowed: true })

    await postWithRetry('/subscriber', {
      [TYPE]: 'tradle.PNSRegistration',
      identity: identity,
      token: token,
      // apple push notifications service
      protocol: ENV.isIOS() ? 'apns' : 'gcm'
    })

    registered = true
    Actions.updateMe({ registeredForPushNotifications: true })
    onRegistered()
  }

  function getToken () {
    if (utils.isIOS()) {
      Push.requestPermissions()
      return gotToken
    }

    return utils.tryWithExponentialBackoff(() => {
      // retry requesting until we succeed
      return Promise.race([
        gotToken,
        failIn(5000)
      ])
    }, { initialDelay: 1000 })
  }

  function failIn (millis) {
    return utils.promiseDelay(millis)
      .then(() => {
        throw new Error('timed out')
      })
  }

  /**
   * POST until successful
   * @param  {[type]} path [description]
   * @param  {[type]} body [description]
   * @return {[type]}      [description]
   */
  function postWithRetry (path, body) {
    // if (__DEV__) return

    while (path[0] === '/') {
      path = path.slice(1)
    }

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
    return postWithRetry('/subscription', {
      [TYPE]: 'tradle.PNSSubscription',
      publisher: publisher,
      subscriber: node.permalink
    })
  }

  function onNotification (notification) {
// {
//     foreground: false, // BOOLEAN: If the notification was received in foreground or not
//     userInteraction: false, // BOOLEAN: If the notification was opened by the user from the notification area or not
//     message: 'My Notification Message', // STRING: The notification message
//     data: {}, // OBJECT: The push data
// }

    debug('NOTIFICATION:', notification)
    if (notification.foreground) {
      return resetBadgeNumber()
    }

    if (unread) return

    Actions.updateMe({ unreadPushNotifications: ++unread })

    const unsubscribe = Store.listen(function (event) {
      if (AppState.currentState === 'active') return unsubscribe()
      if (event.action !== 'receivedMessage') return

      const msg = event.msg

      unsubscribe()

      // const type = msg.object.object[TYPE]

      const localNotification = {
        message: 'You have unread messages'
      }

      if (ENV.isAndroid()) {
        extend(localNotification, {
          id: 0, // only ever show one
          title: "Tradle", // (optional)
          // ticker: "My Notification Ticker", // (optional)
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          // subText: "This is a subText", // (optional) default: none
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        })
      }

      Push.localNotification(localNotification)
    })

    setTimeout(unsubscribe, 20000)

    // example
    // const foreground = notification.foreground ? 'foreground' : 'background'
    // PushNotification.localNotification({
    //     /* Android Only Properties */
    //     id: 0, // (optional) default: Autogenerated Unique ID
    //     title: "My Notification Title", // (optional)
    //     ticker: "My Notification Ticker", // (optional)
    //     autoCancel: true, (optional) default: true
    //     largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
    //     smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
    //     bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
    //     subText: "This is a subText", // (optional) default: none
    //     color: "red", // (optional) default: system default
    //     vibrate: true, // (optional) default: true
    //     vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
    //     tag: 'some_tag', // (optional) add tag to message
    //     group: "group", // (optional) add group to message

    //     /* iOS only properties */
    //     alertAction: // (optional) default: view
    //     category: // (optional) default: null
    //     userInfo: // (optional) default: null (object containing additional notification data)

    //     /* iOS and Android properties */
    //     message: "My Notification Message" // (required)
    //     playSound: false, // (optional) default: true
    //     number: 10 // (optional) default: none (Cannot be zero)
    // });

    // PushNotification.localNotificationSchedule({
    //     message: "My Notification Message", // (required)
    //     date: new Date(Date.now() + (60 * 1000)) // in 60 secs
    // });
  }

  function resetBadgeNumber () {
    unread = 0
    Actions.updateMe({ unreadPushNotifications: 0 })
    if (ENV.isAndroid()) return Push.cancelAllLocalNotifications()
    if (!ENV.isIOS()) return

    Push.getApplicationIconBadgeNumber(num => {
      if (!num) return

      postWithRetry('/clearbadge', {
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

function getAPIPlaceholder ({ me }) {
  const unbreakable = Promise.resolve()
  const willResolve = () => unbreakable

  return {
    isRegistered: () => me.registeredForPushNotifications,
    register: willResolve,
    subscribe: willResolve,
    resetBadgeNumber: willResolve
  }
}

async function preAskUser () {
  const askUser = new Promise((resolve, reject) => {
    Actions.showModal({
      title: translate('neverMissAMessage'),
      message: translate('receiveNotifications?'),
      buttons: [
        {
          text: translate('no'),
          onPress: () => resolve(false)
        },
        {
          text: translate('yes'),
          onPress: () => resolve(true)
        }
      ]
    })
  })


  const result = await askUser
  Actions.hideModal()
  // give modal time to hide
  // https://github.com/facebook/react-native/issues/10471
  await utils.promiseDelay(800)
  return result
}
