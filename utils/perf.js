
import Q from 'q'
import Debug from './debug'

const timerDebug = Debug('TIMER')
const noop = () => {}

// export const timeFunctions = (obj, overwrite) => {
//   var timed = overwrite ? obj : {}
//   var totals = {}
//   Object.keys(obj).forEach((k) => {
//     var orig = obj[k]
//     if (typeof orig !== 'function') {
//       timed[k] = orig
//       return
//     }

//     const total = totals[k] = {
//       calls: 0,
//       time: 0
//     }

//     timed[k] = function () {
//       var stopTimer = tradleTimer(k)
//       var ret = orig.apply(this, arguments)
//       if (!Q.isPromiseAlike(ret)) {
//         recordDuration()
//         return ret
//       }

//       return ret
//         .then(val => {
//           recordDuration()
//           return val
//         }, err => {
//           recordDuration()
//           throw err
//         })

//       function recordDuration () {
//         var ms = stopTimer(false)
//         total.time += ms
//         total.calls++
//         if (ms > 50) {
//           console.log(`TIMER: ${k} took`, '' + ms)
//         }

//         if (ms < 5) return

//         timerDebug(`${k} took ${ms}ms. ${total.calls} calls totaled ${total.time}ms`)
//       }
//     }
//   })

//   return timed
// }

export const timeAsyncFunctions = (obj, fns, onInvocationFinished=noop) => fns.reduce((timed, name) => {
  timed[name] = timeAsyncFunction(obj[name].bind(obj), info => onInvocationFinished({ ...info, name }))
  return timed
}, {})

// global.tradleTimer = tradleTimer
export const timeAsyncFunction = (fn, onInvocationFinished = noop) => {
  return function (...args) {
    const stack = new Error().stack.split('\n').slice(2).join('\n')
    const start = Date.now()
    const cb = args.pop()
    const baseArgs = args.slice()
    args.push(function (...results) {
      const time = Date.now() - start
      try {
        onInvocationFinished({ args: baseArgs, stack, time, results })
      } finally {
        cb.apply(this, results)
      }
    })

    return fn.apply(this, args)
  }
}

global.tradleTimeAsyncFunction = timeAsyncFunction
global.tradleTimeAsyncFunctions = timeAsyncFunctions

// function tradleTimer (name) {
//   var now = Date.now()
//   return function (print=true) {
//     var time = Date.now() - now
//     if (print && time > 100) {
//       console.log(`TIMER ${name}: ${time}ms`)
//     }

//     return time
//   }
// }
