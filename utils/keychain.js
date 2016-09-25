import { createHash } from 'crypto'
import typeforce from 'typeforce'
import Q from 'q'
import * as ec from 'react-native-ecc'
import utils from './utils'
import { serviceID, accessGroup } from './env'
ec.setServiceID(serviceID)
if (accessGroup) ec.setAccessGroup(accessGroup)

import { ec as ellipticEC } from 'elliptic'
import { utils as tradleUtils } from '@tradle/engine'
import nkeySE from './nkey-se'

const debug = require('debug')('tradle:app:keychain')
const ellipticCurves = {}
const DEFAULT_KEY_SET = tradleUtils.defaultKeySet()

export const PASSWORD_ITEM_KEY = 'app-password'

export function generateNewSet (opts = {}) {
  typeforce({
    networkName: 'String'
  }, opts)

  return Promise.all(DEFAULT_KEY_SET.map(function (keyProps) {
    keyProps = { ...keyProps } // defensive copy
    const gen = isKeyInSecureEnclave(keyProps)
      ? createSecureEnclaveKey(keyProps)
      : createKeychainKey(keyProps, opts.networkName)

    return gen.then(key => {
      key.set('purpose', keyProps.purpose)
      return key
    })
  }))
}

export function saveKey (pub, priv) {
  typeforce('String', pub)
  typeforce('String', priv)
  console.log('saving', pub)
  return utils.setPassword(
    pub,
    priv
  )
}

export function lookupKeys (keys) {
  return Promise.all(keys.map(lookupKey))
}

function lookupKey (pubKey) {
  typeforce({
    pub: 'String'
  }, pubKey)

  if (!isKeyInSecureEnclave(pubKey)) {
    return fromKeychain()
  }

  return lookupSecureEnclaveKey(pubKey)
    .catch(function (err) {
      if (err.message !== 'NotFound') throw err

      return fromKeychain()
    })

  function fromKeychain () {
    return lookupKeychainKey(pubKey)
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

function lookupKeychainKey (pubKey) {
  return utils.getPassword(pubKey.pub)
}

async function lookupSecureEnclaveKey (pubKey) {
  const keyPair = getCurve(pubKey.curve).keyFromPublic(new Buffer(pubKey.pub, 'hex'))
  const compressed = keyPair.getPublic(true, true)
  const uncompressed = keyPair.getPublic(false, true)
  const tryCompressed = Q.ninvoke(ec, 'lookupKey', new Buffer(compressed))
  const tryUncompressed = Q.ninvoke(ec, 'lookupKey', new Buffer(uncompressed))
  let key
  try {
    key = await tryCompressed
  } catch (err) {
    key = await tryUncompressed
  }

  return nkeySE.fromJSON({ ...pubKey, ...key })
}

function createKeychainKey (keyProps, networkName) {
  keyProps = { ...keyProps }
  if (keyProps.type === 'bitcoin') {
    keyProps.networkName = networkName
  }

  const key = tradleUtils.genKey(keyProps)
  return saveKey(key.pubKeyString, key.toJSON(true).priv)
    .then(() => key)
}

function createSecureEnclaveKey (keyProps) {
  // { sign, verify, pub }
  return Q.ninvoke(nkeySE, 'gen', keyProps)
  // return Q.ninvoke(ec, 'keyPair', keyProps.curve)
  //   .then((key) => {
  //     console.log('made', key.pub.toString('hex'))
  //     return extendKey(key, keyProps)
  //   })
}

function rejectNotFound () {
  return Promise.reject(new Error('NotFound'))
}

function getCurve (name) {
  if (!ellipticCurves[name]) ellipticCurves[name] = new ellipticEC(name)

  return ellipticCurves[name]
}

function isKeyInSecureEnclave (key) {
  return utils.isIOS() && key.curve === 'p256'
}
