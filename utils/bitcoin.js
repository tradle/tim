console.log('requiring bitcoin.js')

import Networks from '@tradle/bitcoin-adapter'

module.exports = networkName => Networks[networkName]
