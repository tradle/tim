
import EventEmitter from 'EventEmitter'
import {
  Platform,
  Linking,
} from 'react-native'
import Branch from 'react-native-branch'
import debounce from 'debounce'
import { translate } from './utils'
import { appScheme, deepLinkHost } from './env'

const uriRegexes = [
  `https?://${deepLinkHost}/(.*)`,
  `${appScheme}://(.*)`
].map(pattern => new RegExp(pattern))

const matchURI = uri => {
  for (let regex of uriRegexes) {
    let match = regex.exec(uri)
    if (match) return '/' + match[1]
  }
}

async function getInitialURL() {
  // const bundle = await new Promise(resolve => Branch.getInitSession(resolve))
  const params = await Branch.getFirstReferringParams()
  return getUrlFromBundle({ params }) || await Linking.getInitialURL()
}

function getUrlFromBundle ({ uri, params, error }) {
  if (uri || error) {
    return matchURI(uri)
  }

  const branchLink = params && params['$deeplink_path']
  const link = branchLink || uri
  return link && stripProtocol(link)
}

function stripProtocol (url) {
  // turn tradle://profile into /profile
  return url.replace(/^.*?:\/\//, '/')
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
