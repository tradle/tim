
import { race } from 'bluebird'
import createQueue from 'ya-promise-queue'

const debug = require('debug')('tradle:app:polite-queue')
const TIMED_OUT = new Error('timed out')

module.exports = function politeQueue ({ wait, timeout }) {
  const q = createQueue()
  return {
    ...q,
    push
  }

  async function push (fn) {
    let taskPromise
    let timeoutPromise
    try {
      taskPromise = q.push(fn)
      if (timeout) {
        timeoutPromise = promiseTimeout(timeout)
        await race([
          taskPromise,
          timeoutPromise
        ])
      } else {
        await taskPromise
      }

      debug('task completed')
    } catch (err) {
      debug('task failed', err)
    } finally {
      if (timeoutPromise) timeoutPromise.clearTimeout()

      try {
        await wait()
      } catch (err) {
        debug('wait function failed', err)
      }
    }

    // preserve return value
    return taskPromise
  }
}

function promiseTimeout (millis) {
  let timeout
  const promise = new Promise((resolve, reject) => {
    timeout = setTimeout(() => {
      reject(TIMED_OUT)
    }, millis)
  })

  promise.clearTimeout = () => clearTimeout(timeout)
  return promise
}
