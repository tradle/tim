import crypto from 'crypto'
console.log('requiring db.js')
import {
  getPassword,
  setPassword,
  promisifyDB
} from '../utils/utils'

import leveldown from './leveldown'
import createKeeper from '../utils/keeper'

const KEY_PREFIX = 'dbencryptionkey'
const KEY_ENCODING = 'hex'

module.exports = async function createEncryptedDB ({ path }) {
  const keyName = `${KEY_PREFIX}_${path}`
  const encryptionKey = await getOrCreateEncryptionKey(keyName)
  const keeper = createKeeper({
    path,
    db: leveldown,
    encryption: {
      key: encryptionKey
    }
  })

  return promisifyDB(keeper)
}

async function getOrCreateEncryptionKey (keyName) {
  let encryptionKey
  try {
    encryptionKey = await getPassword(keyName)
    encryptionKey = new Buffer(encryptionKey, KEY_ENCODING)
  } catch (err) {
    encryptionKey = crypto.randomBytes(32)
    await setPassword(keyName, encryptionKey.toString(KEY_ENCODING))
  }

  return encryptionKey
}
