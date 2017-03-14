
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
    try {
      taskPromise = q.push(fn)
      if (timeout) {
        await race([
          taskPromise,
          promiseTimeout(timeout)
        ])
      } else {
        await taskPromise
      }

      debug('task completed')
    } catch (err) {
      debug('task failed', err)
    } finally {
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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(TIMED_OUT)
    }, millis)
  })
}
