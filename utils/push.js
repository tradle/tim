import {
  AppState,
  Platform
} from 'react-native'

import Push from 'react-native-push-notification'
const debug = require('debug')('tradle:app:push')
import extend from 'xtend/mutable'
import once from 'once'
import utils from './utils'
import ENV from './env'
import PushImpl from './push-impl'
import { constants } from '@tradle/engine'
import Actions from '../Actions/Actions'

// class Pusher extends EventEmitter {
//   constructor() {
//     super()
//     this._promiseInitialized = new Promise(resolve => {
//       this.once('init', resolve)
//     })

//     this._promiseRegistered = new Promise(resolve => {
//       this.once('register', resolve)
//     })
//   }

//   register = async () => {
//     // make sure initialization is done first
//     await this._promiseInitialized
//     // register
//     this.emit('register')
//   }

//   subscribe = async () => {
//     // make sure registration has already been done
//     await this._promiseRegistered
//     // subscribe
//   }

//   init = once(async () => {
//     // do init stuff
//     this.emit('init')
//   })
// }

const { translate, waitsFor } = utils
const TYPE = constants.TYPE
const pushServerURL = ENV.pushServerURL
const NOTIFICATION_CAN_HAVE_DATA = Platform.OS === 'ios' || Platform.OS === 'web'

let onInitialized
let onRegistered
const whenInitialized = new Promise(resolve => {
  onInitialized = (...args) => {
    debug('initialized')
    resolve(...args)
  }
})

const whenRegistered = new Promise(resolve => {
  onRegistered = (...args) => {
    debug('registered')
    resolve(...args)
  }
})

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

function createPusher (opts) {
  if (!ENV.registerForPushNotifications) {
    return getAPIPlaceholder(opts)
  }

  const { me, node, Store } = opts
  const { identity } = node

  let registered = me.registeredForPushNotifications
  if (registered) onRegistered()

  let regPromise
  PushImpl.init({ onNotification, node })

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
      let pushNotificationsAllowed
      if (PushImpl.havePermission) {
        pushNotificationsAllowed = await PushImpl.havePermission()
      }

      if (!pushNotificationsAllowed) {
        const pushNotificationsAllowed = await preAskUser()
        if (!pushNotificationsAllowed) {
          Actions.updateMe({ pushNotificationsAllowed })
          return
        }
      }
    }

    const token = await PushImpl.register()
    debug('my push token', token)
    Actions.updateMe({ pushNotificationsAllowed: true })

    if (token) {
      await postWithRetry('/subscriber', {
        [TYPE]: 'tradle.PNSRegistration',
        identity: identity,
        token: token,
        // apple push notifications service
        protocol: ENV.isIOS() ? 'apns' : 'gcm'
      })
    }

    registered = true
    Actions.updateMe({
      pushNotificationsAllowed: true,
      registeredForPushNotifications: true
    })

    onRegistered()
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
    .then(async result => {
      // TODO: encode body with protocol buffers to save space
      let res
      do {
        res = await utils.fetchWithBackoff(`${pushServerURL}/${path}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(result.object)
        }, 10000)
      } while (!res.ok)

      return res
    })
  }

  function subscribe (publisher) {
    return postWithRetry('/subscription', {
      [TYPE]: 'tradle.PNSSubscription',
      publisher: publisher,
      subscriber: node.permalink
    })
  }

  function onLocalNotification ({ message }) {
    Actions.viewChat({
      permalink: message.author
    })
  }

  function onNotification (notification) {
// {
//     foreground: false, // BOOLEAN: If the notification was received in foreground or not
//     userInteraction: false, // BOOLEAN: If the notification was opened by the user from the notification area or not
//     message: 'My Notification Message', // STRING: The notification message
//     data: {}, // OBJECT: The push data
// }

    const appIsActive = AppState.currentState === 'active'
    const { userInteraction, data } = notification
    debug('notification:', {
      notification,
      appIsActive,
    })

    if (appIsActive) {
      debug(`ignoring notification, i'm in foreground`)
      return
    }

    if (appIsActive) resetBadgeNumber()

    if (NOTIFICATION_CAN_HAVE_DATA && userInteraction) {
      const author = data && data.message && data.message.author
      if (author) return onLocalNotification(data)
    }

    // if (unread) {
    //   // debug('already have unread notifications, not ')
    //   return
    // }

    // Actions.updateMe({ unreadPushNotifications: unread + 1 })

    // don't show local notification until
    // we know we have a message in our inbox
    const showLocalNotification = ({ message }) => {
      // show 1, because receiving a push notification
      // doesn't actually mean there's a message to be received,
      // as "poking" clients is something any tradle mycloud can do
      Actions.updateMe({ unreadPushNotifications: 1 })

      const localNotification = {
        message: translate('unreadMessages')
      }

      const userInfo = {
        message: {
          type: message.object[TYPE],
          author: message.author
        }
      }

      switch (Platform.OS) {
      case 'android':
        extend(localNotification, {
          id: 0, // only ever show one
          title: ENV.appName, // (optional)
          // ticker: "My Notification Ticker", // (optional)
          autoCancel: true, // (optional) default: true
          largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
          smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
          // subText: "This is a subText", // (optional) default: none
          vibrate: true, // (optional) default: true
          vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        })

        break
      default:
        localNotification.userInfo = userInfo
        break
      }

      PushImpl.localNotification(localNotification)
    }

    const unsubscribe = Store.listen(function (event) {
      if (AppState.currentState === 'active') return unsubscribe()
      if (event.action !== 'receivedMessage') return

      const { deepPayloadType } = event
      if (ENV.SILENT_TYPES.includes(deepPayloadType)) {
        debug('ignoring silent type', deepPayloadType)
        return
      }

      unsubscribe()
      showLocalNotification({ message: event.msg })
    })

    debug(`waiting for a message...`)
    setTimeout(() => {
      debug(`giving up waiting for messages`)
      unsubscribe()
    }, 20000)

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
    Actions.updateMe({ unreadPushNotifications: 0 })
    if (ENV.isAndroid()) return Push.cancelAllLocalNotifications()
    if (!ENV.isIOS()) return

    Push.setApplicationIconBadgeNumber(0)
    // Push.getApplicationIconBadgeNumber(num => {
    //   if (!num) return

    //   postWithRetry('/clearbadge', {
    //     // TODO: add nonce to prevent replays
    //     [TYPE]: 'tradle.APNSClearBadge',
    //     subscriber: node.permalink
    //   })
    //   .then(
    //     () => Push.setApplicationIconBadgeNumber(0),
    //     err => console.error('failed to clear push notifications badge', err)
    //   )
    // })
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
