
var crypto = require('crypto')
crypto.randomBytes = function (size) {
  console.warn('WARNING: generating insecure psuedorandom number')
  var arr = new Buffer(size)
  for (var i = 0; i < arr.length; i++) {
    arr[i] = Math.random() * 256 | 0
  }

  return arr
}
