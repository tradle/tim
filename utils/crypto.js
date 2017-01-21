
// important that this comes before require('crypto')
const algos = require('browserify-sign/algos')
if (!algos.sha256) {
  algos.sha256 = {
    "sign": "ecdsa",
    "hash": "sha256",
    "id": new Buffer("")
  }
}

if (typeof window === 'object') {
  const wCrypto = window.crypto = window.crypto || {}
  if (!wCrypto.getRandomValues) {
    const randomBytes = require('react-native-randombytes').randomBytes
    wCrypto.getRandomValues = function getRandomValues (arr) {
      const bytes = randomBytes(arr.length)
      for (var i = 0; i < bytes.length; i++) {
        arr[i] = bytes[i]
      }
    }
  }
}
