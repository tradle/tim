import { EventEmitter } from 'events'
import Actions from '../../Actions/Actions'

const notificationsSupported = 'Notification' in global
if (notificationsSupported) requestPermissions()

let tabIsFocused = true
let me

window.addEventListener('blur', function () {
  tabIsFocused = false
})

window.addEventListener('focus', function () {
  if (me && me.unreadPushNotifications) {
    Actions.updateMe({ unreadPushNotifications: 0 })
  }

  tabIsFocused = true
})

const emitter = module.exports = exports = new EventEmitter()

emitter.init = function (opts) {
  if (!notificationsSupported) return Promise.resolve()

  me = opts.me
  const node = opts.node
  node.on('message', msg => {
    if (tabIsFocused || Notification.permission !== 'granted') return

    // TODO: show logo of msg sender
    const n = new Notification('You have a message waiting!', {
      body: 'Click to open your Tradle tab',
      icon: '/img/logo.png'
    })

    n.onclick = function () {
      try {
        window.focus()
        Actions.viewChat(msg)
      } catch (e) {}

      clearTimeout(closeTimeout)
      n.close()
    }

    const closeTimeout = setTimeout(() => n.close(), 5000)
  })
}

emitter.subscribe = function (publisher) {
  return Promise.resolve()
}

emitter.resetBadgeNumber = function () {
  return Promise.resolve()
}

function requestPermissions () {
  if (Notification.permission === 'granted') return

  // Let's check whether notification permissions have already been granted
  if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      if (permission === 'granted') {
        console.log('notifications permission granted')
      }
    })
  }
}
