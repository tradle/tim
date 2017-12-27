console.log('requiring network-adapters.js')

module.exports = function createNetworkAdapters ({ blockchainName, networkName }) {
  const adapter = getAdapterImplementation(blockchainName)
  return adapter(networkName)
}

function getAdapterImplementation (blockchainName) {
  switch (blockchainName) {
    case 'bitcoin':
      return require('./bitcoin')
    case 'ethereum':
      return require('./ethereum')
    default:
      throw new Error(`unknown blockchain: ${blockchainName}`)
  }
}
