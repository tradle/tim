// important that this comes before require('crypto')
const algos = require('browserify-sign/algos')
if (!algos.sha256) {
  algos.sha256 = {
    "sign": "ecdsa",
    "hash": "sha256",
    "id": new Buffer("")
  }
}

let crypto
if (typeof window === 'object') {
  if (!window.crypto) window.crypto = {}
  crypto = window.crypto
} else {
  crypto = require('crypto')
}

if (!crypto.getRandomValues) {
  crypto.getRandomValues = getRandomValues
}

let randomBytes

function getRandomValues (arr) {
  if (!randomBytes) randomBytes = require('react-native-randombytes').randomBytes

  const bytes = randomBytes(arr.length)
  for (var i = 0; i < bytes.length; i++) {
    arr[i] = bytes[i]
  }
}

const encryptionOpts = {
  algorithm:'aes-256-cbc',
  ivBytes: 16
}

module.exports = {
  encrypt: function (data, opts) {
    opts = { ...encryptionOpts, ...opts }
    const key = opts.key
    const iv = opts.iv || crypto.randomBytes(opts.ivBytes)
    const cipher = crypto.createCipheriv(opts.algorithm, key, iv)
    const ciphertext = Buffer.concat([cipher.update(data), cipher.final()])
    const parts = [
      iv,
      ciphertext
    ]

    return serialize(parts)
  },

  decrypt: function (data, opts) {
    opts = { ...encryptionOpts, ...opts }
    const parts = unserialize(data)
    const iv = parts[0]
    const ciphertext = parts[1]
    const key = opts.key
    const decipher = crypto.createDecipheriv(opts.algorithm, key, iv)
    const m = decipher.update(parts[1])
    return Buffer.concat([m, decipher.final()])
  }
}

function unserialize (buf) {
  const parts = []
  const l = buf.length
  let idx = 0
  while (idx < l) {
    let dlen = buf.readUInt32BE(idx)
    idx += 4
    let start = idx
    let end = start + dlen
    let part = buf.slice(start, end)
    parts.push(part)
    idx += part.length
  }

  return parts
}

function serialize (buffers) {
  const parts = []
  let idx = 0
  buffers.forEach(function (part) {
    const len = Buffer(4)
    if (typeof part === 'string') part = Buffer(part)
    len.writeUInt32BE(part.length, 0)
    parts.push(len)
    idx += len.length
    parts.push(part)
    idx += part.length
  })

  return Buffer.concat(parts)
}
