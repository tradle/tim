import promisify from 'pify'
import flatten from 'lodash/flattenDeep'
import omit from 'lodash/omit'
import setPropertyAtPath from 'lodash/set'
import traverse from 'traverse'
import { TYPE, TYPES } from '@tradle/constants'
import { linkString } from '@tradle/protocol'
import Errors from '@tradle/errors'
import _createOldKeeper from '@tradle/keeper'
import cachifyKeeper from '@tradle/keeper/cachify'
import NativeKeeper from 'react-native-tradle-keeper'
import ImageStore from 'react-native-image-store'
import { buildKeeperUri as _buildKeeperUri, parseKeeperUri } from '@tradle/embed'
import { timeAsyncFunctions } from './perf'

const buildKeeperUri = props => _buildKeeperUri({
  algorithm: DIGEST_ALGORITHM,
  ...props,
})

const debug = require('debug')('tradle:app:keeper')
const { MESSAGE } = TYPES
const asyncNoop = async () => {}
const isNotFoundError = err => Errors.matches(err, { name: 'NotFound' })

const keeperMethodsToPromisify = [
  'get',
  'put',
  'batch',
  'del',
  'close',
  'prefetch',
  'prefetchUri',
  'uncache',
  'uncacheUri'
]

const toHex = hexStrOrBuf => Buffer.isBuffer(hexStrOrBuf) ? hexStrOrBuf.toString('hex') : hexStrOrBuf
const isFallbackKeeperNeeded = opts => haveNativeKeeper && !opts.encryption.hmacKey

const DIGEST_ALGORITHM = 'sha256'
const haveNativeKeeper = typeof NativeKeeper === 'function'
const createNativeKeeper = ({ hmacKey, encryptionKey }) => new NativeKeeper({
  encryptionKey: toHex(encryptionKey),
  hmacKey: toHex(hmacKey || encryptionKey), // old users don't have hmacKey
  digestAlgorithm: DIGEST_ALGORITHM,
  encoding: 'base64',
})

const createOldKeeper = opts => promisifyKeeper(_createOldKeeper({
  ...opts,
  // opts format changed for native keeper
  encryption: {
    key: opts.encryption.encryptionKey,
  }
}))

const promisifyMethods = (obj, methods) => {
  const promisified = {}
  for (let key in obj) {
    if (methods.includes(key)) {
      promisified[key] = promisify(obj[key].bind(obj))
    } else {
      proxyProp(obj, promisified, key)
    }
  }

  return promisified
}

const proxyProp = (source, target, key) => Object.defineProperty(target, key, {
  enumerable: true,
  get() { return source[key] },
  set(value) { source[value] = value },
})

const genSuccessCallback = cb => result => cb(null, result)

// dangerous, assumes obj only has async functions as props
const supportCallbacksForMethods = (obj, methods) => Object.keys(obj).reduce((callbackBased, key) => {
  if (methods.includes(key)) {
    callbackBased[key] = (...args) => {
      if (typeof args[args.length - 1] !== 'function') {
        return obj[key](...args)
      }

      const cb = args.pop()
      obj[key](...args).then(genSuccessCallback(cb), cb)
    }
  } else {
    proxyProp(obj, callbackBased, key)
  }

  return callbackBased
}, {})

/**
 * @return API backwards compatible with promisified @tradle/keeper
 */
const wrapNativeKeeper = nativeKeeper => {
  const get = async key => {
    const { value } = await nativeKeeper.get({
      key,
      encoding: 'utf8',
      returnValue: true
    })

    return JSON.parse(value)
  }

  const put = (key, value) => {
    let encoding = 'utf8'
    if (Buffer.isBuffer(value)) {
      value = value.toString('base64')
    } else if (typeof value !== 'string') {
      value = JSON.stringify(value)
    }

    return nativeKeeper.put({ key, value, encoding })
  }

  const del = key => nativeKeeper.del({ key })
  // WARNING: this loses atomicity
  // TODO: add native batch() support
  const batch = batch => Promise.all(batch.map(({ type, key, value }) => {
    return type === 'put' ? put(key, value) : del(key)
  }))

  const keyToImageTag = new Map()
  // const getKeeperUriCacheKeys = keeperUri => ([keeperUri, parseKeeperUri(keeperUri).hash])
  const getKeyFromKeeperUri = uri => parseKeeperUri(uri).hash
  const getCacheKeyForKeeperUri = getKeyFromKeeperUri
  const cacheImageKey = (key, imageTag) => keyToImageTag.set(key, imageTag)
  const uncacheImageKey = (key, imageTag) => keyToImageTag.delete(key)
  const cacheKeeperUri = (keeperUri, imageTag) => {
    cacheImageKey(getCacheKeyForKeeperUri(keeperUri), imageTag)
  }

  const uncacheKeeperUri = keeperUri => {
    uncacheImageKey(getCacheKeyForKeeperUri(keeperUri))
  }

  const _prefetch = async key => {
    const { imageTag } = await nativeKeeper.prefetch({ key })
    return imageTag
  }

  const prefetch = async key => {
    let imageTag = keyToImageTag.get(key)
    if (!imageTag) {
      // cache promise so that concurrent requests don't
      // cause multiple fetches
      const promise = _prefetch(key).catch(err => {
        uncacheImageKey(key)
      })

      cacheImageKey(key, promise)
      imageTag = await promise
    }

    return imageTag
  }

  const prefetchUri = uri => prefetch(getKeyFromKeeperUri(uri))
  const uncacheUri = async uri => {
    const imageTag = keyToImageTag.get(getKeyFromKeeperUri(uri))
    keyToImageTag.delete(uri)
    await nativeKeeper.removeFromImageStore({ imageTag })
  }

  const importFromImageStore = async imageTag => {
    const { key, ...details } = await nativeKeeper.importFromImageStore({ imageTag })
    const keeperUri = buildKeeperUri({
      hash: key,
      ...details,
    })

    cacheKeeperUri(keeperUri, imageTag)
    return keeperUri
  }
  const getBase64ForKeeperUri = async keeperUri => {
    const imageTag = await prefetchUri(keeperUri)
    if (imageTag)
      return await ImageStore.getBase64ForTag({ imageTag })
  }

  const replaceDataUrls = async object => {
    if (!NativeKeeper) return object

    const dataUrlProps = []
    traverse(object).forEach(function (value) {
      if (typeof value === 'string' &&
        (value.startsWith('data:image/') || value.startsWith('data:application/pdf;'))
        ) {
        dataUrlProps.push({ path: this.path, value })
      }
    })
    if (dataUrlProps.length)
      debugger
    await Promise.all(dataUrlProps.map(async ({ path, value }) => {
      const imageTag = await ImageStore.addImageFromBase64({ base64: value })
      const keeperUri = await importFromImageStore(imageTag)
      setPropertyAtPath(object, path, keeperUri)
    }))

    return object
  }

  const ret = {
    get,
    put,
    del,
    batch,
    prefetch,
    prefetchUri,
    uncache: uncacheImageKey,
    uncacheUri,
    importFromImageStore,
    replaceDataUrls,
    getBase64ForKeeperUri,
    close: asyncNoop,
  }

  return ret
}

const stripEmbeddedObjects = keeper => {
  // don't promisify statically as keeper.get may change
  const getStored = key => keeper.get(key)
  const getAndResolveEmbeds = async (key) => {
    const result = await getStored(key)
    if (result[TYPE] === MESSAGE && typeof result.object === 'string') {
      // recurse
      debug('resolving object embedded in message')
      result.object = await getAndResolveEmbeds(result.object)
    }

    return result
  }

  const get = getAndResolveEmbeds

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

  const put = async (key, value) => batch([{
    type: 'put',
    key,
    value,
  }])

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

  const batch = async batch => {
    const expanded = expand(batch)
    return keeper.batch(expanded)
  }

  const createReadStream = () => {
    throw new Error('keeper.createReadStream is not implemented')
  }

  const ret = {
    get,
    put,
    batch,
    createReadStream,
    // may not be available
  }

  // pass through other methods
  const passThrough = omit(keeper, Object.keys(ret))
  Object.keys(passThrough)
    .forEach(key => proxyProp(keeper, ret, key))

  return ret
  // return {
  //   ...ret,
  //   ...timeAsyncFunctions(ret, keeperMethodsToPromisify, info => {
  //     const { name, stack, time, args, results } = info
  //     if (time > 1000) {
  //       debug(`${name} took ${time}ms!`)
  //     }
  //   })
  // }
}

const addFallback = ({
  primary,
  fallback,
  method,
  shouldFallBack,
}) => {
  const orig = primary[method]
  primary[method] = async (...args) => {
    try {
      return await orig.apply(primary, args)
    } catch (err) {
      if (!shouldFallBack(err)) throw err

      return fallback[method](...args)
    }
  }
}

const createKeeper = ({ caching, ...opts }) => {
  let keeper = haveNativeKeeper
    ? wrapNativeKeeper(createNativeKeeper(opts.encryption))
    : createOldKeeper(opts)

  if (isFallbackKeeperNeeded(opts)) {
    const fallback = createOldKeeper(opts)
    addFallback({
      primary: keeper,
      fallback,
      method: 'get',
      shouldFallBack: isNotFoundError,
    })
  }

  keeper = stripEmbeddedObjects(keeper)

  // export regular API, for @tradle/engine to consume
  const callbackBased = supportCallbacksForMethods(keeper, keeperMethodsToPromisify)
  if (caching) {
    cachifyKeeper(callbackBased, caching)
  }

  return callbackBased
}

const {
  setGlobalKeeper,
  getGlobalKeeper,
} = (() => {
  let keeper
  return {
    setGlobalKeeper: value => {
      keeper = value
    },
    getGlobalKeeper: () => keeper,
  }
})();

const promisifyKeeper = keeper => promisifyMethods(keeper, keeperMethodsToPromisify)

module.exports = {
  promisifyKeeper,
  createKeeper,
  setGlobalKeeper,
  getGlobalKeeper,
}
