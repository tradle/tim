require('promise.prototype.finally').shim()

import { Platform } from 'react-native'

if (Platform.OS !== 'web') {
  if (typeof __dirname === 'undefined') global.__dirname = '/'
  if (typeof __filename === 'undefined') global.__filename = ''
  if (typeof process === 'undefined') {
    global.process = require('process')
  } else {
    var bProcess = require('process')
    for (var p in bProcess) {
      if (!(p in process)) {
        process[p] = bProcess[p]
      }
    }
  }
  try {
    window.navigator.userAgent = 'react-native'
  } catch (err) {
    // must be read-only
  }

  process.browser = false
  process.env['NODE_ENV'] = __DEV__ ? 'development' : 'production'

  if (typeof btoa === 'undefined') global.btoa = require('btoa')

  require('debug').formatters.j = require('json-stringify-safe')

  // global.location = global.location || { port: 80 }
}

if (typeof localStorage !== 'undefined') {
  localStorage.debug = __DEV__ ? 'tradle:*' : ''
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('uncaughtException', function (err) {
  console.log('Uncaught exception, caught in process catch-all: ' + err.message)
  console.log(err.stack)
})

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer
}

require('any-promise/register/bluebird')

function cleanup (err) {
  console.log('cleanup', arguments)
}
