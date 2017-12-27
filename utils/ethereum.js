console.log('requiring ethereum.js')

import createAdapter from '@tradle/ethereum-adapter-etherscan'
import { etherscanApiKey } from './env'

module.exports = function createEthereumAdapter (networkName) {
  return createAdapter({ networkName, apiKey: etherscanApiKey })
}
