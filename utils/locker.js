console.log('requiring locker.js')
import mutexify from 'mutexify'

module.exports = function (opts={}) {
  const { timeout } = opts
  const locks = new Map()
  return function lockID (something) {
    let lock = locks.get(something)
    if (!lock) {
      lock = mutexify()
      locks.set(something, lock)
    }

    return new Promise(function (resolve, reject) {
      lock(function (unlock) {
        resolve(unlock)
        if (!timeout) return

        setTimeout(() => {
          reject(new Error('timed out'))
          unlock()
        }, timeout)
      })
    })
  }
}
