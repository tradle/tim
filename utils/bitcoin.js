if (__DEV__) console.log('requiring bitcoin.js')

import Networks from '@tradle/bitcoin-adapter'

module.exports = function createAdapter (networkName) {
  const network = Networks[networkName]
  const blockchain = network.createBlockchainAPI()
  return {
    network,
    blockchain
  }
}
