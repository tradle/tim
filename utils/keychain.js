import typeforce from 'typeforce'
import promisify from 'pify'
import * as ec from 'react-native-ecc'
import nkeyECDSA from 'nkey-ecdsa'
import utils from './utils'
import { serviceID, accessGroup } from './env'
ec.setServiceID(serviceID)
if (accessGroup) ec.setAccessGroup(accessGroup)

import { utils as tradleUtils } from '@tradle/engine'
import nkeySE from './nkey-se'
import { tryWithExponentialBackoff } from './backoff'

if (!utils.isWeb()) {
  // 3 aliases for the same curve
  ;['p256', 'prime256v1', 'secp256r1'].forEach(alias => {
    nkeyECDSA.setImplementationForCurve(alias, nkeySE)
  })
}

const debug = require('debug')('tradle:app:keychain')

if (__DEV__) {
  createKeychainNativeKey = utils.addCatchLogger('createKeychainNativeKey', createKeychainNativeKey)
  createKeychainResidentKey = utils.addCatchLogger('createKeychainResidentKey', createKeychainResidentKey)
  lookupKey = utils.addCatchLogger('lookupKey', lookupKey)
}

export const PASSWORD_ITEM_KEY = 'app-password'

export async function generateNewSet (opts={}) {
  typeforce({
    networks: 'Object'
  }, opts)

  const { networks } = opts
  const defaultKeySet = tradleUtils.defaultKeySet(networks)
  debug(`generating ${defaultKeySet.length} keys`)
  return await Promise.all(defaultKeySet.map(async (keyProps) => {
    keyProps = { ...keyProps } // defensive copy
    const gen = isKeychainNative(keyProps)
      ? createKeychainNativeKey(keyProps)
      : createKeychainResidentKey(keyProps, networks)

    const key = await gen
    key.set('purpose', keyProps.purpose)
    return key
  }))
}

export function saveKey (pub, priv) {
  typeforce('String', pub)
  typeforce('String', priv)
  return utils.setPassword(
    pub,
    priv
  )
}

export function lookupKeys (keys) {
  return Promise.all(keys.map(key => lookupKeyUntilFound(key)))
}

function lookupKeyUntilFound (pubKey, delay) {
  delay = delay || 1000
  return tryWithExponentialBackoff(async () => {
    try {
      return await lookupKey(pubKey)
    } catch (err) {
      debug('key not found, will retry', err)
      throw err
    }
  }, {
    intialDelay: 1000,
    maxDelay: 1000,
    maxAttempts: 5,
  })
}

function lookupKey (pubKey) {
  typeforce({
    pub: 'String'
  }, pubKey)

  if (!isKeychainNative(pubKey)) {
    return fromKeychain()
  }

  return lookupKeychainNativeKey(pubKey)
    .catch(function (err) {
      if (err.message !== 'NotFound') throw err

      return fromKeychain()
    })

  function fromKeychain () {
    return lookupKeychainResidentKey(pubKey)
      .then(function (priv) {
        var priv = { ...pubKey, priv }
        return tradleUtils.importKey(priv)
      })
      .catch(function (err) {
        console.error('key not found', pubKey)
        throw err
      })
  }
}

function lookupKeychainResidentKey (pubKey) {
  return utils.getPassword(pubKey.pub)
}

async function lookupKeychainNativeKey (pubKey) {
  const key = ec.keyFromPublic(new Buffer(pubKey.pub, 'hex'))
  return nkeySE.fromJSON({ ...pubKey, ...key })
}

function createKeychainResidentKey (keyProps, networks) {
  keyProps = { ...keyProps }
  const { type } = keyProps
  if (type in networks) {
    keyProps.networkName = networks[type]
  }

  const key = tradleUtils.genKey(keyProps)
  return saveKey(key.pubKeyString, key.toJSON(true).priv)
    .then(() => key)
}

function createKeychainNativeKey (keyProps) {
  return promisify(nkeySE.gen)(keyProps)
}

function isKeychainNative (key) {
  return !utils.isWeb() && key.type === 'ec' && key.curve in ec.curves
  // return utils.isIOS() && key.type === 'ec' && key.curve in ec.curves //key.curve === 'p256'
}
