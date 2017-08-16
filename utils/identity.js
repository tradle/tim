import Q from 'q'
import { utils as tradleUtils } from '@tradle/engine'
import ENV from './env'

const Keychain = ENV.useKeychain !== false && !ENV.isWeb() && require('./keychain')

module.exports = {
  async generateIdentity ({ networkName }) {
    if (!ENV.isWeb()) {
      if (Keychain) {
        const keys = await Keychain.generateNewSet({ networkName })
        return Q.ninvoke(tradleUtils, 'newIdentityForKeys', keys)
      }

      return Q.ninvoke(tradleUtils, 'newIdentity', { networkName })
    }

    const defaultKeySet = tradleUtils.defaultKeySet(networkName)
    const keys = await Q.all(defaultKeySet.map(async function (spec) {
      const key = await Q.ninvoke(tradleUtils, 'genKey', spec)
      key.set('purpose', spec.purpose)
      return key
    }))

    return Q.ninvoke(tradleUtils, 'newIdentityForKeys', keys)
  }
}
