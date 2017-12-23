if (__DEV__) console.log('requiring strings.js')

import LocalizedStrings from 'react-native-localization'
import ENV from './env'

const RAW_STRINGS = {
  en: require('./strings_en.json'),
  nl: require('./strings_nl.json')
}

const STRINGS = {
  en: envify(RAW_STRINGS.en, ENV),
  nl: envify(RAW_STRINGS.nl, ENV)
}

const DEFAULT_LANGUAGE = new LocalizedStrings({ en: {}, nl: {} }).getLanguage()

let currentLanguage = DEFAULT_LANGUAGE
let currentStrings = STRINGS[DEFAULT_LANGUAGE]
let currentEnv = { ...ENV }

const StringUtils = module.exports = {
  get strings() { return currentStrings },
  get language() { return currentLanguage },
  getDefaultLanguage() {
    return DEFAULT_LANGUAGE
  },
  setLanguage(languageCode=DEFAULT_LANGUAGE) {
    currentLanguage = languageCode
    return currentStrings = StringUtils.envify(currentEnv)
  },
  envify(env) {
    currentEnv = { ...ENV, ...env }
    currentStrings = envify(RAW_STRINGS[currentLanguage], currentEnv)
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
