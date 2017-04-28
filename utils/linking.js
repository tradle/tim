
import EventEmitter from 'EventEmitter'
import { Linking } from 'react-native'

import Branch from 'react-native-branch'

Branch.subscribe(bundle => {
  const url = getUrlFromBundle(bundle)
  if (url) instance.emit('url', url)
})

async function getInitialURL() {
  const bundle = await new Promise(resolve => Branch.getInitSession(resolve))
  return getUrlFromBundle(bundle) || await Linking.getInitialURL()
}

function getUrlFromBundle ({ uri, params, error }) {
  if (error) return

  const branchLink = params && params['$deeplink_path']
  return stripProtocol(branchLink || uri)
}

function stripProtocol (url) {
  // turn tradle://profile into /profile
  return url && url.replace(/^.*?:\/\//, '/')
}

const instance = new EventEmitter()
instance.getInitialURL = getInitialURL
instance.addEventListener = instance.addListener
instance.removeEventListener = instance.removeListener

export default instance
