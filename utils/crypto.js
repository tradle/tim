
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
  var wCrypto = window.crypto = window.crypto || {}
  wCrypto.getRandomValues = wCrypto.getRandomValues || getRandomValues
}

var crypto = require('crypto')
var randomBytes = crypto.randomBytes
crypto.randomBytes = function (size, cb) {
  if (cb) return randomBytes.apply(crypto, arguments)

  var arr = new Buffer(size)
  getRandomValues(arr)
  return arr
}

crypto.getRandomValues = crypto.getRandomValues || getRandomValues

function getRandomValues (arr) {
  // console.warn('WARNING: generating insecure psuedorandom number')
  for (var i = 0; i < arr.length; i++) {
    arr[i] = Math.random() * 256 | 0
  }

  return arr
}
