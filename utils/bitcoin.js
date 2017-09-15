
module.exports = function createAdapter (networkName) {
  const Networks = require('@tradle/bitcoin-adapter')
  const network = Networks[networkName]
  const blockchain = network.createBlockchainAPI()
  return {
    network,
    blockchain
  }
}
