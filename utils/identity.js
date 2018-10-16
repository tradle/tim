import Q from 'q'
import { utils as tradleUtils } from '@tradle/engine'
import { useKeychain, isWeb } from './env'
import allNetworks from './networks'

const Keychain = useKeychain !== false && !isWeb() && require('./keychain')

module.exports = {
  async generateIdentity (opts={}) {
    const { networks=allNetworks } = opts
    if (!isWeb()) {
      if (Keychain) {
        const keys = await Keychain.generateNewSet({ networks })
        return Q.ninvoke(tradleUtils, 'newIdentityForKeys', keys)
      }

      return Q.ninvoke(tradleUtils, 'newIdentity', ({ networks }))
    }

    const defaultKeySet = tradleUtils.defaultKeySet(networks)
    const keys = await Q.all(defaultKeySet.map(async function (spec) {
      const key = await Q.ninvoke(tradleUtils, 'genKey', spec)
      key.set('purpose', spec.purpose)
      return key
    }))

    return Q.ninvoke(tradleUtils, 'newIdentityForKeys', keys)
  }
}
