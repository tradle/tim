
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

async function getReferringURL () {
  const params = await Branch.getFirstReferringParams()
  console.log('react-native-branch initial params', JSON.stringify(params))
  return getUrlFromBundle({ params }) || await Linking.getInitialURL()
}

async function getInitialURL() {
  // const bundle = await new Promise(resolve => Branch.getInitSession(resolve))
  // const params = await Branch.getFirstReferringParams()
  // console.log('react-native-branch initial params', JSON.stringify(params))
  // return getUrlFromBundle({ params }) || await Linking.getInitialURL()
  return await Linking.getInitialURL()
}

function getUrlFromBundle ({ params, error }) {
  if (error) {
    console.error('react-native-branch error', error.stack)
    return
  }

  console.log('react-native-branch event', JSON.stringify(params))
  if (params['+non_branch_link']) {
    const nonBranchUrl = params['+non_branch_link']
    return matchURI(nonBranchUrl)
  }

  if (!params['+clicked_branch_link']) {
    // Indicates initialization success and some other conditions.
    // No link was opened.
    return
  }

  if (params['~referring_link']) {
    return matchURI(params['~referring_link'])
  }

  const link = params['$deeplink_path']
  return link && stripProtocol(link)
}

function stripProtocol (url) {
  // turn tradle://profile into /profile
  return url.replace(/^.*?:\/\//, '/')
}

const instance = new EventEmitter()
instance.getInitialURL = getInitialURL
instance.getReferringURL = getReferringURL
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
