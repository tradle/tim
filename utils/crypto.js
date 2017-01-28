// important that this comes before require('crypto')
const algos = require('browserify-sign/algos')
if (!algos.sha256) {
  algos.sha256 = {
    "sign": "ecdsa",
    "hash": "sha256",
    "id": new Buffer("")
  }
}
