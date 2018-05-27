module.exports = function createNetworkAdapters ({ blockchain, networkName }) {
  const adapter = getAdapterImplementation(blockchain)
  try {
    return adapter(networkName)
  } catch (err) {
    console.warn(`unsupported network: ${networkName}`, err.message)
  }
}

function getAdapterImplementation (blockchain) {
  switch (blockchain) {
    case 'bitcoin':
      return require('./bitcoin')
    case 'ethereum':
      return require('./ethereum')
    case 'corda':
      return {}
    default:
      console.warn(`unknown blockchain: ${blockchain}`)
      return null
      // throw new Error(`unknown blockchain: ${blockchain}`)
  }
}
