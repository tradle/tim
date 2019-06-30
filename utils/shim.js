if (typeof __dirname === 'undefined') global.__dirname = '/'
if (typeof __filename === 'undefined') global.__filename = ''
if (typeof process === 'undefined') {
  global.process = require('process')
} else {
  const bProcess = require('process')
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p]
    }
  }
}

if (typeof self === 'undefined') {
  // bluebird, i'm looking at you
  // ...and other libraries that expect global.self as an alias of global.window in a browser-like environment
  global.self = global
}

try {
  window.navigator.userAgent = 'react-native'
} catch (err) {
  // must be read-only
}

process.browser = false
process.title = 'browser' // for MQTT's benefit
process.env['NODE_ENV'] = __DEV__ ? 'development' : 'production'
if (typeof localStorage !== 'undefined') {
  localStorage.debug = __DEV__ ? '*' : ''
}

process.on('exit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('uncaughtException', function (err) {
  console.log('Uncaught exception, caught in process catch-all: ' + err.message)
  console.log(err.stack)
})

function cleanup (err) {
  console.log('cleanup', arguments)
}

if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer

if (typeof btoa === 'undefined') global.btoa = require('btoa')

require('debug').formatters.j = require('json-stringify-safe')

require('any-promise/register/bluebird')

// error-ex, this is for you!
if (!Error.captureStackTrace) {
  Error.captureStackTrace = function (error) {
    const container = new Error()

    Object.defineProperty(error, 'stack', {
      configurable: true,
      get: function getStack() {
        var stack = container.stack

        Object.defineProperty(this, 'stack', {
          value: stack
        })

        return stack
      }
    })
  }
}

require('react-native').YellowBox.ignoreWarnings([
  'ImageStore is deprecated'
])

// global.location = global.location || { port: 80 }

// ;[
//   "assert",
//   "zlib",
//   "inherits",
//   "console",
//   "constants",
//   "crypto",
//   "dns",
//   "domain",
//   "events",
//   "http",
//   "https",
//   "os",
//   "path",
//   "punycode",
//   "querystring",
//   "fs",
//   "dgram",
//   "readable-stream",
//   "stream",
//   "string_decoder",
//   "timers",
//   "tty",
//   "url",
//   "util",
//   "net",
//   "vm"
// ].forEach(function (m) {
//   try {
//     require(m)
//   } catch (err) {}
// })
