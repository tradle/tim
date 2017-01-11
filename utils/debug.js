
import { EventEmitter } from 'events'
import debug from 'debug'

const localDebug = debug('tradle:logger')
const MAX_LENGTH = 10000

// require('ErrorUtils').setGlobalHandler(function (e, isFatal) {
//   Alert.alert(e.stack)
//   localDebug('Failed to handle error:')
//   localDebug(e)
//   throw e
//   // if (__DEV__) throw e
// })

if (__DEV__) {
  console.ignoredYellowBox = ['jsSchedulingOverhead']
  debug.enable([
    'tradle:*',
    'sendy:symmetric',
    'sendy:ws:client'
  ].join(','))
} else {
  // debug.disable()
  debug.enable([
    'tradle:*',
    'sendy:ws:client'
  ].join(','))
}

EventEmitter.call(debug)
for (var p in EventEmitter.prototype) {
  if (typeof EventEmitter.prototype[p] === 'function') {
    debug[p] = EventEmitter.prototype[p].bind(debug)
  }
}

let lines = []
debug.log = function (...args) {
  args.unshift(getNow())
  if (__DEV__) {
    console.log.apply(console, arguments)
  }

  lines.push(args)
  debug.emit('change', args)

  if (lines.length > MAX_LENGTH + 100) {
    lines = lines.slice(lines.length - MAX_LENGTH)
  }
}

debug.get = function () {
  return lines.slice()
}

debug.clear = function () {
  lines.length = 0
}

debug.post = function (url) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text'
    },
    body: debug.get().map(debug.stripColors).join('\n')
  })
}

debug.getColor = function (line) {
  let color
  line.find(part => {
    if (typeof part === 'string' &&
      part.indexOf('color:') === 0 &&
      part.indexOf('color: inherit') !== 0) {
      return color = part.slice(7)
    }
  })

  return color
}

debug.stripColors = function (line) {
  return line
    .filter(str => {
      return typeof str !== 'string' || str.indexOf('color:') !== 0
    })
    .map(line => line.replace ? line.replace(/\%c/g, '') : line)
}

function getNow () {
  const now = new Date()
  return `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
}

module.exports = debug
