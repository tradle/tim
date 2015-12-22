
var crypto = require('crypto')
var randomBytes = crypto.randomBytes
crypto.randomBytes = function (size, cb) {
  if (cb) return randomBytes.apply(crypto, arguments)

  // console.warn('WARNING: generating insecure psuedorandom number')
  var arr = new Buffer(size)
  for (var i = 0; i < arr.length; i++) {
    arr[i] = Math.random() * 256 | 0
  }

  return arr
}