import { NativeModules } from 'react-native'
import Errors from './iproov-errors'

const iProov = promisify(NativeModules.RNIproov || {})

module.exports = {
  ...iProov,
  Errors
}

;function promisify (obj) {
  const pified = {}
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (typeof val === 'function') {
      pified[key] = promisifyFn(val.bind(obj))
    } else {
      pified[key] = val
    }
  })

  return pified
}

function promisifyFn (fn) {
  return function promisified (...args) {
    return new Promise((resolve, reject) => {
      args.push(function (err, result) {
        if (err) return reject(normalizeError(err))

        resolve(result)
      })

      return fn(...args)
    })
  }
}

function normalizeError (err) {
  const normalized = new Error(err.message)
  normalized.code = err.code
  normalized.name = Errors[err.code]
  return normalized
}
