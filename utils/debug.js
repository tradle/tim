import { EventEmitter } from 'events'
import debug from 'debug'

import './crashlytics'

// const localDebug = debug('tradle:logger')
const MAX_LENGTH = 5000

// require('ErrorUtils').setGlobalHandler(function (e, isFatal) {
//   Alert.alert(e.stack)
//   localDebug('Failed to handle error:')
//   localDebug(e)
//   throw e
//   // if (__DEV__) throw e
// })

const CONSOLE_NAMESPACE_COLOR = 'color: #aaa'
const consoleMethods = Object.keys(console).filter(k => {
  return k !== 'table' && typeof console[k] === 'function'
})

const enabled = [
  'console',
  'tradle:*',
  'sendy:ws:client',
  'multiqueue:*',
  '@tradle/*'
].concat(consoleMethods.map(method => 'console.' + method))

if (__DEV__) {
  console.ignoredYellowBox = ['jsSchedulingOverhead']
  enabled.push(
    'sendy:symmetric',
    'TIMER'
  )
}

debug.enable(enabled.join(','))

const rawConsole = {}

consoleMethods.forEach(method => {
  const orig = console[method]
  if (!orig) return

  const namespace = 'console.' + method
  rawConsole[method] = orig.bind(console)
  // console[method] = debug(namespace)
})

EventEmitter.call(debug)
for (var p in EventEmitter.prototype) {
  if (typeof EventEmitter.prototype[p] === 'function') {
    debug[p] = EventEmitter.prototype[p].bind(debug)
  }
}

let lines = []
debug.log = function (...args) {
  // preserve colors
  let toConsole = __DEV__ && args.slice()
  args.unshift(getNow())
  lines.push(args)
  debug.emit('change', args)

  if (lines.length > MAX_LENGTH + 100) {
    lines = lines.slice(lines.length - MAX_LENGTH)
  }

  if (__DEV__) {
    if (toConsole[0].slice(0, 2) === '%c') {
      toConsole = [
        '%c' + getNow() + ' ' + toConsole[0],
        CONSOLE_NAMESPACE_COLOR
      ].concat(toConsole.slice(1))
    }

    toConsole = toConsole.filter(val => val != null && val !== undefined)
    const method = this.namespace.indexOf('console.') === 0 && this.namespace.split('.')[1]
    const logFn = rawConsole[method] || rawConsole.log
    logFn(...toConsole)
  }
}

debug.getLines = () => lines.slice()
debug.get = debug.getLines

debug.clear = function () {
  lines.length = 0
}

debug.getText = () => debug
  .get()
  .map(debug.lineToPlainText)
  .join('\n')

debug.lineToPlainText = line => debug.stripColors(line)
  .map(line => Array.isArray(line) ? line.join(' ') : line)
  .join('\n')

debug.post = function (url) {
  const body = debug.getText()
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text'
    },
    body
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
    .filter(part => {
      if (part == null) return

      return typeof part !== 'string' || part.indexOf('color:') !== 0
    })
    .map(part => typeof part === 'string' ? part.replace(/\%c/g, '') : part)
}

function getNow () {
  const now = new Date()
  return `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
}

module.exports = debug
