import { createHash } from 'crypto'
import typeforce from 'typeforce'
import extend from 'xtend/mutable'
import Q from 'q'
import kiki from '@tradle/kiki'
import * as ec from 'react-native-ecc'
import * as RNKeychain from 'react-native-keychain'
import { pick } from './utils'
import { ec as ellipticEC } from 'elliptic'

let debug = require('debug')('tim-keychain')

let rejectNotFound = function () {
  return Q.reject(new Error('NotFound'))
}

let ellipticCurves = {}
let getCurve = function (name) {
  if (!ellipticCurves[name]) ellipticCurves[name] = new ellipticEC(name)

  return ellipticCurves[name]
}

let defaultKeySet = [
  {
    type: 'bitcoin',
    purpose: 'payment'
  },
  {
    type: 'bitcoin',
    purpose: 'messaging'
  },
  // {
  //   type: 'bitcoin',
  //   purpose: 'ecdh',
  //   privExportable: true
  // },
  {
    type: 'ec',
    curve: 'p256',
    purpose: 'sign',
    secureEnclave: true
  },
  {
    type: 'ec',
    curve: 'p256',
    purpose: 'update',
    secureEnclave: true
  },
  {
    type: 'dsa',
    purpose: 'sign'
  }
]

export const PASSWORD_ITEM_KEY = 'app-password'

export function generateNewSet (opts = {}) {
  typeforce({
    networkName: 'String'
  }, opts)

  typeforce('String', ec.getServiceID())

  return Q.all(defaultKeySet.map(function (keyProps) {
    keyProps = extend({}, keyProps)
    let isInSecureEnclave = keyProps.secureEnclave
    delete keyProps.secureEnclave
    return isInSecureEnclave
      ? newSecureEnclaveKey(keyProps)
      : newKeychainKey(keyProps, opts.networkName)
  }))
}

export function saveKey (pub, priv) {
  let serviceID = ec.getServiceID()
  typeforce('String', pub)
  typeforce('String', priv)
  typeforce('String', serviceID)
  console.log('saving', pub)
  return RNKeychain.setGenericPassword(
    pub,
    priv,
    serviceID
  )
}

// function toKey (keyProps) {
//   let key = ec.keyFromPublic(new Buffer(keyProps.value, ec.encoding))
//   return extendKey(key, keyProps)
// }

export function lookupKeys (keys) {
  return Q.all(keys.map(lookupKey))
}

function lookupKey (pubKey) {
  typeforce({
    value: 'String'
  }, pubKey)

  let isInSecureEnclave = pubKey.curve && pubKey.type !== 'bitcoin'
  let secureEnclaveLookup = isInSecureEnclave
    ? lookupSecureEnclaveKey(pubKey)
    : rejectNotFound()

  let keychainLookup = isInSecureEnclave
    ? rejectNotFound()
    : lookupKeychainKey(pubKey)

  let pubKeyString = pubKey.value
  return secureEnclaveLookup
    .then(function (secKey) {
      // console.log('found', pubKeyString)
      return extendKey(secKey, pubKey)
    })
    .catch(function (err) {
      if (err.message !== 'NotFound') throw err

      return fromKeychain()
    })

  function fromKeychain () {
    return keychainLookup
      .then(function (priv) {
        var priv = extend({ priv }, pubKey)
        return kiki.toKey(priv)
      })
      .catch(function (err) {
        console.log('not found', pubKeyString)
        debugger
      })
  }
}

function lookupKeychainKey (pub) {
  return Q.ninvoke(RNKeychain, 'getGenericPassword', pub.value, ec.getServiceID())
}

async function lookupSecureEnclaveKey (pub) {
  let keyPair = getCurve(pub.curve).keyFromPublic(new Buffer(pub.value, 'hex'))
  let compressed = keyPair.getPublic(true, true)
  let uncompressed = keyPair.getPublic(false, true)
  let tryCompressed = Q.ninvoke(ec, 'lookupKey', new Buffer(compressed))
  let tryUncompressed = Q.ninvoke(ec, 'lookupKey', new Buffer(uncompressed))
  let key
  try {
    key = await tryCompressed
  } catch (err) {
    key = await tryUncompressed
  }

  return key
}

function newKeychainKey (keyProps, networkName) {
  let key = extend({}, keyProps)
  if (key.type === 'bitcoin') {
    key.networkName = networkName
  }

  key = kiki.toKey(key, true)
  return saveKey(key.pubKeyString(), key.exportPrivate().priv)
    .then(() => key)
}

function newSecureEnclaveKey (keyProps) {
  // { sign, verify, pub }
  return Q.ninvoke(ec, 'keyPair', keyProps.curve)
    .then((key) => {
      console.log('made', key.pub.toString('hex'))
      return extendKey(key, keyProps)
    })
}

function extendKey (key, keyProps) {
  let kikiKey = kiki.toKey(extend({
    pub: getCurve(keyProps.curve).keyFromPublic(key.pub)
  }, keyProps))

  kikiKey._sign = key.sign
  // let maxAttempts = 3
  // kikiKey._sign = function (hash, cb) {
  //   let attempts = 0
  //   trySign()

  //   function trySign () {
  //     key.sign(hash, function (err, sig) {
  //       if (!err) return cb(null, sig)

  //       if (!/34018/.test(err.message)) {
  //         if (attempts++ < maxAttempts) {
  //           debug('34018...trying again')
  //           trySign()
  //         }

  //         debug('giving up on 34018')
  //         return cb(err)
  //       }

  //       return trySign()
  //     })
  //   }
  // }
  return kikiKey
}
