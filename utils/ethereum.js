if (__DEV__) console.log('requiring ethereum.js')

const { etherscanApiKey } = require('./env')

module.exports = function createEthereumAdapter (networkName) {
  const createAdapter = require('@tradle/ethereum-adapter-etherscan')
  return createAdapter({ networkName, apiKey: etherscanApiKey })
}
