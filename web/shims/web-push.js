
'use strict'

import utils from '../../utils/utils'
import Actions from '../../Actions/Actions'
import ENV from '../../utils/env'
import { constants } from '@tradle/engine'
const TYPE = constants.TYPE
const debug = require('debug')('tradle:sse-push')
// http://michalzalecki.com/progressive-web-apps-with-webpack/
const swURL = require('file?name=service-worker.js!./service-worker')
const pushServerURL = __DEV__ ? `http://${ENV.LOCAL_IP}:48284` : 'https://push1.tradle.io'
// const pushServerURL = `http://${ENV.LOCAL_IP}:48284`

let initialized
let initialize = new Promise(resolve => {
  initialized = resolve
})

const Local = require('./no-push')

exports.init = function (opts) {
  Local.init(opts)

  const node = opts.node
  return navigator.serviceWorker.register(swURL)
  .then(function(registration) {
    // Use the PushManager to get the user's subscription to the push service.
    return registration.pushManager.getSubscription()
      .then(function(subscription) {
        // If a subscription was found, return it.
        if (subscription) {
          return subscription
        }

        // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
        // send notifications that don't have a visible effect for the user).
        return registration.pushManager.subscribe({ userVisibleOnly: true })
      })
  })
  .then(function(subscription) {
    return postWithRetry(node, '/subscriber', {
      [TYPE]: 'tradle.PNSRegistration',
      identity: node.identity,
      token: subscription.endpoint.split('/').pop(),
      // endpoint: subscription.endpoint,
      protocol: 'gcm'
    })
  })
  .then(
    () => initialized(opts),
    err => {
      console.error('failed to register service worker for Push notifications', err)
      throw err
    }
  )
}

exports.subscribe = function (publisher) {
  return initialize.then(opts => {
    const node = opts.node
    return postWithRetry(node, '/subscription', {
      [TYPE]: 'tradle.PNSSubscription',
      publisher: publisher,
      subscriber: node.permalink
    })
  })
}

exports.resetBadgeNumber = function () {
  return Promise.resolve()
}

// function S4() {
//   return (((1+Math.random())*0x10000)|0).toString(16).slice(1)
// }

// // generate the user private channel and save it at the local storage
// // so we always use the same channel for each user
// function generateUserChannel(){
//   userChannel = localStorage.getItem('channel')
//   if (userChannel == null || userChannel == 'null'){
//     guid = (S4() + S4() + '-' + S4() + '-4' + S4().substr(0,3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase()
//     userChannel = 'channel-' + guid
//     localStorage.setItem('channel', userChannel)
//   }

//   return userChannel
// }


/**
 * Copied from utils/push.js
 * TODO: factor out
 *
 * POST until successful
 * @param  {[type]} path [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function postWithRetry (node, path, body) {
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
