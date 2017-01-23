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
  if (!randomBytes) randomBytes = require('crypto').randomBytes

  const bytes = randomBytes(arr.length)
  for (var i = 0; i < bytes.length; i++) {
    arr[i] = bytes[i]
  }
}
