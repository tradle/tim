import _ from 'lodash'
import querystring from 'querystring'
import EventEmitter from 'EventEmitter'
import {
  Linking,
} from 'react-native'
import Branch from 'react-native-branch'
import debounce from 'debounce'
import { appScheme, deepLinkHost } from './env'

const BRANCH_SPECIAL_CHARS = '$+~'
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

// async function getReferringURL () {
//   const params = await Branch.getFirstReferringParams()
//   console.log('react-native-branch initial params', JSON.stringify(params))
//   return getUrlFromBundle({ params }) || await Linking.getInitialURL()
// }

async function getInitialURL() {
  const params = await Branch.getLatestReferringParams()
  const url = getUrlFromBundle({ params })
  if (url) {
    // prevent entering the chat with the same url after refresh
    Branch.logout()
    return url
  }

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

  const link = params['$deeplink_path']
  if (link) {
    return stripProtocol(link) + '?' + querystring.stringify(getOriginalQuery(params))
  }

  if (params['~referring_link']) {
    return matchURI(params['~referring_link'])
  }
}

function getOriginalQuery (params) {
  return _.pickBy(params, (value, key) => !BRANCH_SPECIAL_CHARS.includes(key[0]))
}

function stripProtocol (url) {
  // turn tradle://profile into /profile
  return url.replace(/^.*?:\/\//, '/')
}

const instance = new EventEmitter()
instance.getInitialURL = getInitialURL
// instance.getReferringURL = getReferringURL
instance.addEventListener = instance.addListener
instance.removeEventListener = instance.removeListener

let initialized
Branch.subscribe(debounce(bundle => {
  // the first value is not an event, it's the cached initial url
  if (!initialized) {
    initialized = true
    return
  }

  const url = getUrlFromBundle(bundle)
  if (url) instance.emit('url', { url })
}, 2000, true))

export default instance
