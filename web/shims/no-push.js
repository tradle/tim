if ('Notification' in global) {
  requestPermissions()
}

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

exports.init = function (opts) {
  me = opts.me
  const node = opts.node
  node.on('message', function () {
    if (tabIsFocused || Notification.permission !== 'granted') return

    // TODO: show logo of msg sender
    const n = new Notification('You have a message waiting!', {
      body: 'Click to open your Tradle tab',
      icon: '/img/logo.png'
    })

    n.onclick = function () {
      try {
        window.focus()
      } catch (e) {}

      clearTimeout(closeTimeout)
      n.close()
    }

    const closeTimeout = setTimeout(() => n.close(), 5000)
  })
}

exports.subscribe = function () {
  return Promise.resolve()
}

exports.resetBadgeNumber = function () {
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
