
const { etherscanApiKey } = require('./env')

module.exports = function createEthereumAdapter (networkName) {
  const createAdapter = require('@tradle/ethereum-adapter-etherscan')
  return createAdapter({ networkName, apiKey: etherscanApiKey })
}
