import Promise from 'bluebird'
import stubTrue from 'lodash/stubTrue'

export const tryWithExponentialBackoff = async (fn, opts={}) => {
  let {
    initialDelay=1000,
    maxAttempts=10,
    maxTime=60000,
    factor=2,
    shouldTryAgain=stubTrue,
    maxDelay,
    logger
  } = opts

  if (typeof maxDelay !== 'number') maxDelay = maxTime / 2

  const start = Date.now()
  let millisToWait = initialDelay
  let attempts = 0
  while (Date.now() - start < maxTime && attempts++ < maxAttempts) {
    try {
      return await fn()
    } catch (err) {
      if (!shouldTryAgain(err)) {
        throw err
      }

      if (logger) logger.debug(`backing off ${millisToWait}`)

      await Promise.delay(millisToWait)
      millisToWait = Math.min(
        maxDelay,
        millisToWait * factor,
        maxTime - (Date.now() - start)
      )

      if (millisToWait < 0) {
        if (logger) logger.debug('giving up')
        break
      }
    }
  }

  throw new Error('timed out')
}
