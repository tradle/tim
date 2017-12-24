console.log('requiring db.js')
import {
  getPassword,
  setPassword,
  randomHex
} from '../utils/utils'

import leveldown from './leveldown'
import createKeeper from '../utils/keeper'
import promisify from 'q-level'

const KEY_PREFIX = 'dbencryptionkey'

module.exports = async function encryptedDB ({ path }) {
  const keyName = `${KEY_PREFIX}_${path}`
  const encryptionKey = await getOrCreateEncryptionKey(keyName)
  const keeper = createKeeper({
    path,
    db: leveldown,
    encryption: {
      key: new Buffer(encryptionKey, 'hex')
    }
  })

  return promisify(keeper)
}

async function getOrCreateEncryptionKey (keyName) {
  let encryptionKey

  try {
    encryptionKey = await getPassword(keyName)
  } catch (err) {
    encryptionKey = randomHex(32)
    await setPassword(keyName, encryptionKey)
  }

  return encryptionKey
}
