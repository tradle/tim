const Promise = require('bluebird')
const path = require('path')
const writeFileAtomic = require('write-file-atomic')
const Translate = require('@google-cloud/translate')

const translate = new Translate();

const HELP = `
  Usage:

  translateStrings -d ./utils -l es,fr,fil,bn

  Options:
  --dictionary, -d path/to/strings directory
  --languages, -l comma separated languages like: es,fr,fil,nl
`

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    d: 'dictionary',
    h: 'help',
    l: 'languages'
  }
})
const { help, dictionary, languages } = argv

if (help) {
  console.log(HELP)
  process.exit(0)
}
new Promise(resolve => writeStrings(dictionary, languages))

async function writeStrings(stringsDir, lang) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Please set environment variable GOOGLE_APPLICATION_CREDENTIALS to allow models translation')
    return
  }
  let langs = lang.split(',')
  await Promise.all(langs.map(lang => writeFile(stringsDir, lang)))
}
async function writeFile(stringsDir, lang) {
  if (lang === 'en')
    return
  let fn = 'strings_' + lang + '.js'
  let fnStrings = path.resolve(stringsDir, fn)
  let enFn = 'strings_en.js'
  let stringsLang, stringsEN
  let currentIds
  try {
    stringsEN = require(path.resolve(stringsDir, enFn))
    stringsLang = require(fnStrings)
    for (let p in stringsLang) {
      if (!currentIds) currentIds = {}
      currentIds[p] = true
    }
  } catch (err) {
    console.log(err.message)
    if (!stringsEN)
      return
    stringsLang = {}
  }
  let promises = []
  for (let p in stringsEN) {
    if (!stringsLang[p])
      promises.push(translateText({strings: stringsLang, lang, key: p, text: stringsEN[p]}))
  }
  await Promise.all(promises, { concurrency: 20 })

  // Check if some models/props were deleted
  let hasChanged = promises.length
  if (!currentIds)
    hasChanged = true
  else {
    for (let p in currentIds) {
      // Cleanup not used translations
      if (!stringsEN[p]) {
        delete stringsLang[p]
        hasChanged = true
      }
    }
  }
  if (hasChanged)
    writeFileAtomic(fnStrings, 'module.exports = ' + JSON.stringify(stringsLang, 0, 2), console.log)
}
async function translateText({strings, key, text, lang}) {
  const results = await translate.translate(text, lang)
  const translation = results[0];
  strings[key] = translation
}

