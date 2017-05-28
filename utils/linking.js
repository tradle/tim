
import EventEmitter from 'EventEmitter'
import {
  Platform,
  Linking
} from 'react-native'
import Branch from 'react-native-branch'
import debounce from 'debounce'
import { translate } from './utils'
import { deepLinkHost } from './env'

async function getInitialURL() {
  // const bundle = await new Promise(resolve => Branch.getInitSession(resolve))
  const bundle = await Branch.getFirstReferringParams()
  if (Object.keys(bundle).length) debugger
  return getUrlFromBundle(bundle) || await Linking.getInitialURL()
}

function getUrlFromBundle ({ uri, params, error }) {
  if (error) {
    const match = uri && new RegExp(`https?://${deepLinkHost}/(.*)`).exec(uri)
    if (match) return '/' + match[1]

    return null
  }

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

;(async function init () {
  await getInitialURL()
  Branch.subscribe(debounce(bundle => {
    // if (error) {
    //   if (Platform.OS === 'ios' && error.indexOf('310') !== -1) {
    //     Alert.alert(translate('oops'), translate('behindProxy'))
    //   } else {
    //     Alert.alert(translate('oops'), translate('invalidDeepLink'))
    //   }

    //   return
    // }

    const url = getUrlFromBundle(bundle)
    if (url) instance.emit('url', { url })
  }, 2000, true))
}())

export default instance
