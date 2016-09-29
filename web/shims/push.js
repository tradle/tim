
// TODO:
//   https://github.com/mozilla/serviceworker-cookbook/tree/master/push-get-payload
//   https://github.com/markdalgleish/serviceworker-loader

exports.init = function () {
  return Promise.resolve()
}

exports.subscribe = function (publisher) {
  return Promise.resolve()
}

exports.resetBadgeNumber = function () {
  return Promise.resolve()
}

function init () {
  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    alert('This browser does not support desktop notification')
    return Promise.resolve()
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === 'granted') {
    // If it's okay let's create a notification
    var notification = new Notification('Hi there!')
    return Promise.resolve()
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    return new Promise(function (resolve, reject) {
      Notification.requestPermission(function (permission) {
        // If the user accepts, let's create a notification

        if (permission.granted) resolve()
        else reject()
        // if (permission === 'granted') {
        //   var notification = new Notification('Hi there!')
        // }
      })
    })
  } else {
    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
  }
}
