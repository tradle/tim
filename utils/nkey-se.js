
import crypto from 'crypto'
import * as ec from 'react-native-ecc'
import thunky from 'thunky'
import nkey from 'nkey'
const type = 'ec'

module.exports = exports = nkey.wrapAPI({
  gen, fromJSON
})

exports.DEFAULT_ALGORITHM = 'sha256'

function gen (opts, cb) {
  ec.keyPair(opts.curve, function (err, key) {
    if (err) return cb(err)

    cb(null, fromJSON({ ...opts, ...key }))
  })
}

function fromJSON (json) {
  const pubKeyString = json.pub.toString('hex')
  const pub = Buffer.isBuffer(json.pub) ? json.pub : new Buffer(json.pub, 'hex')
  const fingerprint = crypto.createHash('sha256').update(pub).digest('hex')
  const curve = json.curve
  const doSign = json.sign
  const doVerify = json.verify
  if (doSign) {
    return nkey.wrapInstance({
      ...json,
      type,
      pubKeyString,
      fingerprint,
      toJSON,
      sign,
      verify,
      isPrivateKey: true
    })
  }

  const lookup = thunky(cb => lookupKey(pub, cb))
  const afterLookup = fn => {
    return function (...args) {
      const cb = args[args.length - 1]
      lookup(function (err, key) {
        if (err) return cb(err)

        fn(...args)
      })
    }
  }

  return fromJSON({
    ...json,
    sign: afterLookup(sign),
    verify: afterLookup(verify)
  })

  function sign (data, algorithm, cb) {
    if (typeof algorithm === 'function') {
      cb = algorithm
      algorithm = exports.DEFAULT_ALGORITHM
    }

    doSign({ data, algorithm }, cb)
  }

  function verify (data, algorithm, sig, cb) {
    if (typeof sig === 'undefined') {
      sig = algorithm
      algorithm = exports.DEFAULT_ALGORITHM
    }

    doVerify({ data, algorithm, sig }, cb)
  }

  function toJSON (exportPrivateKey) {
    if (exportPrivateKey) throw new Error('cannot export private key')

    return {
      type,
      curve,
      pub: pubKeyString,
      fingerprint
    }
  }
}
