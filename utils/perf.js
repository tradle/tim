
import Q from 'q'
import Debug from './debug'
var timerDebug = Debug('TIMER')

global.timeFunctions = exports.timeFunctions = function timeFunctions (obj, overwrite) {
  if (!__DEV__) return obj

  var timed = overwrite ? obj : {}
  var totals = {}
  Object.keys(obj).forEach((k) => {
    var orig = obj[k]
    if (typeof orig !== 'function') {
      timed[k] = orig
      return
    }

    const total = totals[k] = {
      calls: 0,
      time: 0
    }

    timed[k] = function () {
      var stopTimer = tradleTimer(k)
      var ret = orig.apply(this, arguments)
      if (!Q.isPromiseAlike(ret)) {
        recordDuration()
        return ret
      }

      return ret
        .then(val => {
          recordDuration()
          return val
        }, err => {
          recordDuration()
          throw err
        })

      function recordDuration () {
        var ms = stopTimer(false)
        total.time += ms
        total.calls++
        if (ms > 50) {
          console.log(`TIMER: ${k} took`, '' + ms)
        }

        if (ms < 5) return

        timerDebug(`${k} took ${ms}ms. ${total.calls} calls totaled ${total.time}ms`)
      }
    }
  })

  return timed
}

global.tradleTimer = tradleTimer
global.timeAsyncFunction = function (fn) {
  return function (...args) {
    const start = Date.now()
    const cb = args.pop()
    args.push(function () {
      const time = Date.now() - start
      console.log(`TIMER: ${fn.name} took ${time}ms`)
      cb.apply(this, arguments)
    })

    return fn.apply(this, args)
  }
}

function tradleTimer (name) {
  var now = Date.now()
  return function (print=true) {
    var time = Date.now() - now
    if (print && time > 100) {
      console.log(`TIMER ${name}: ${time}ms`)
    }

    return time
  }
}
