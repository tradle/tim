console.log('requiring yuki.js')
import { AsyncStorage } from 'react-native'
import { utils } from '@tradle/engine'
import ENV from '../utils/env'
import { generateIdentity } from '../utils/identity'
import Yuki from '@tradle/yuki'
import onboard from '@tradle/yuki/onboard'
import locale from './locale.json'
import DeviceInfo from 'react-native-device-info'
import { getYukiForRegion } from './locale'

import YUKI_PER_REGION from './locale.json'

const Keychain = ENV.useKeychain !== false && !ENV.isWeb() && require('../utils/keychain')
const YUKI_KEY = '~yuki'
const NOT_FOUND = new Error('NotFound')

module.exports = {
  load,
  create,
  loadOrCreate
}

async function load ({ node, db }) {
  let yukiInfo = await AsyncStorage.getItem(YUKI_KEY)
  if (!yukiInfo) throw NOT_FOUND

  yukiInfo = JSON.parse(yukiInfo)
  if (!yukiInfo.keys) {
    yukiInfo.keys = await Keychain.lookupKeys(yukiInfo.identity.pubkeys)
  }

  return inflate({ ...yukiInfo, node, db })
}

async function create({ node, db }) {
  const { networkName } = node
  const yukiInfo = await generateIdentity({
    // yuki doesn't need blockchain keys
    networks: {}
  })

  AsyncStorage.setItem(YUKI_KEY, JSON.stringify({
    identity: yukiInfo.identity,
    keys: Keychain ? null : yukiInfo.keys.map(key => key.toJSON(true))
  }))

  return inflate({ ...yukiInfo, node, db })
}

async function loadOrCreate(opts) {
  try {
    return await load(opts)
  } catch (err) {
    if (err !== NOT_FOUND) {
      console.log('failed to load yuki', err)
    }

    return await create(opts)
  }
}

function inflate ({ node, identity, keys, db }) {
  const yuki = Yuki.yuki({
    counterparty: node,
    identity,
    keys,
    db
  })

  // let tz = DeviceInfo.getTimezone()
  // let yukiPerRegion = tz  &&  (YUKI_PER_REGION[tz] ||  YUKI_PER_REGION[tz.split('/')[0]].yuki)
  // let yukiName = yukiPerRegion  &&  yukiPerRegion.name

  let yukiPerLocale = getYukiForRegion()
  let yukiName = yukiPerLocale  &&  yukiPerLocale.name

  const api = yukiName && yuki.use(onboard({ name: yukiName })) || yuki.use(onboard())
  yuki.welcome = api.welcome
  return yuki
}
