import promisify from 'pify'
import { TYPE, TYPES } from '@tradle/constants'
import { linkString } from '@tradle/protocol'
import createBaseKeeper from '@tradle/keeper'
import cachifyKeeper from '@tradle/keeper/cachify'

const debug = require('debug')('tradle:app:keeper')
const { MESSAGE } = TYPES
const noop = () => {}

const stripEmbeddedObjects = keeper => {
  const getStored = promisify(keeper.get.bind(keeper))
  const getAndResolveEmbeds = async (key) => {
    const result = await getStored(key)
    if (result[TYPE] === MESSAGE && typeof result.object === 'string') {
      // recurse
      debug('resolving object embedded in message')
      result.object = await getAndResolveEmbeds(result.object)
    }

    return result
  }

  const get = async (key, cb) => {
    let result
    try {
      result = await getAndResolveEmbeds(key)
    } catch (err) {
      return cb(err)
    }

    cb(null, result)
  }

  // only one level down
  // @tradle/engine runs keeper.put on both message and object
  // but not nested messages
  const replaceEmbeddedObjects = val => {
    if (val[TYPE] !== MESSAGE) return val

    debug('stripping object embedded in message')
    return {
      ...val,
      object: linkString(val.object)
    }
  }

  const put = (key, val, cb) => keeper.put(key, replaceEmbeddedObjects(val), cb)
  const batch = (batch, cb) => {
    batch = batch.map(({ value, ...rest }) => ({
      value: value && replaceEmbeddedObjects(value),
      ...rest,
    }))

    keeper.batch(batch, cb)
  }

  const createReadStream = () => {
    throw new Error('keeper.createReadStream is not implemented')
  }

  return {
    get,
    put,
    batch,
    del: keeper.del.bind(keeper),
    close: keeper.close.bind(keeper),
    createReadStream,
  }
}

const createKeeper = ({ caching, ...opts }) => {
  const keeper = createBaseKeeper(opts)
  if (caching) {
    cachifyKeeper(keeper, caching)
  }

  return stripEmbeddedObjects(keeper)
}

module.exports = {
  createKeeper,
}
