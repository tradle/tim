import promisify from 'pify'
import flatten from 'lodash/flattenDeep'
import { TYPE, TYPES } from '@tradle/constants'
import { linkString } from '@tradle/protocol'
import createBaseKeeper from '@tradle/keeper'
import cachifyKeeper from '@tradle/keeper/cachify'

const debug = require('debug')('tradle:app:keeper')
const { MESSAGE } = TYPES

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

  // deep replace
  const replaceEmbeddedObjects = ({ key, value, type }) => {
    if (value[TYPE] !== MESSAGE) return [{ key, value, type }]

    const objLink = linkString(value.object)
    const sub = replaceEmbeddedObjects({
      key: objLink,
      value: value.object,
      type
    })

    debug('stripping object embedded in message', objLink)
    return flatten(sub).concat({
      key,
      value: {
        ...value,
        object: objLink,
      },
      type,
    })
  }

  const put = (key, value, cb) => batch([{
    type: 'put',
    key,
    value,
  }], cb)

  const expand = batch => {
    const expanded = []
    for (const item of batch) {
      if (item.type === 'put') {
        expanded.push(...replaceEmbeddedObjects(item))
      } else {
        expanded.push(item)
      }
    }

    return expanded
  }

  const batch = (batch, cb) => {
    const expanded = expand(batch)
    keeper.batch(expanded, cb)
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
