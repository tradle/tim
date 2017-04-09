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
