
import LocalizedStrings from 'react-native-localization'
import ENV from './env'
import { fetchWithBackoff } from './utils'

const RAW_STRINGS = {
  en: require('./strings_en.js'),
  // es: require('./strings_es.js'),
  // fr: require('./strings_fr.js'),
  // fil: require('./strings_fil.js'),
  // bn: require('./strings_bn.js'),
  // vi: require('./strings_vi.js'),
  // nl: require('./strings_nl.js')
}

const STRINGS = {
  en: envify(RAW_STRINGS.en, ENV),
  // nl: envify(RAW_STRINGS.nl, ENV),
  // es: envify(RAW_STRINGS.es, ENV),
  // fr: envify(RAW_STRINGS.fr, ENV),
  // bn: envify(RAW_STRINGS.bn, ENV),
  // vi: envify(RAW_STRINGS.vi, ENV),
  // fil: envify(RAW_STRINGS.fil, ENV),
}
const URL = 'https://s3.eu-west-2.amazonaws.com/tradle.io/strings/'

const DEFAULT_LANGUAGE = new LocalizedStrings({ en: {} }).getLanguage()

let currentLanguage = DEFAULT_LANGUAGE
let currentStrings = STRINGS[DEFAULT_LANGUAGE]
let currentEnv = { ...ENV }

const StringUtils = module.exports = {
  get strings() { return currentStrings },
  get language() { return currentLanguage },
  getDefaultLanguage() {
    return DEFAULT_LANGUAGE
  },
  async setLanguage(languageCode=DEFAULT_LANGUAGE) {
    currentLanguage = languageCode
    let headers = { cache: 'no-cache' }

    let res, strings
    if (currentLanguage === DEFAULT_LANGUAGE)
      strings = RAW_STRINGS[DEFAULT_LANGUAGE]
    else {
      let fn = `strings_${languageCode.replace('-', '')}.js`
      try {
        res = await fetchWithBackoff(`${URL}${fn}`, { headers }, 5000)
        strings = await res.text()
        strings = JSON.parse(strings.split('=')[1].trim())
      } catch (err) {
        strings = RAW_STRINGS[DEFAULT_LANGUAGE]
        debugger
      }
    }
    currentStrings = StringUtils.envify(strings, currentEnv)
    return currentStrings
  },
  async envify(strings, env) {
    currentEnv = { ...ENV, ...env }
    currentStrings = envify(strings, currentEnv)
    return currentStrings
  },
  getCurrentStrings() {
    return currentStrings
  }
}

function envify (strings, { appName, profileTitle }) {
  // TODO: generalize if we need to replace other variables
  const preparsed = {}

  for (let key in strings) {
    let str = strings[key]
    preparsed[key] = str
      .replace(/\{appName\}/g, appName)
      .replace(/\{profileTitle\}/g, strings[profileTitle])
  }

  preparsed.profile = strings[profileTitle] || strings.profile
  return preparsed
}
// async envify(env) {
//   currentEnv = { ...ENV, ...env }

//   if (RAW_STRINGS[currentLanguage])
//     currentStrings = envify(RAW_STRINGS[currentLanguage], currentEnv)
//   else
//     currentStrings = envify(RAW_STRINGS['en'], currentEnv)
//   return currentStrings
// }
