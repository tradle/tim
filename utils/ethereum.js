import { createNetwork } from '@tradle/ethereum-adapter-etherscan'
import { etherscanApiKey } from './env'

module.exports = networkName => createNetwork({ networkName, apiKey: etherscanApiKey })
