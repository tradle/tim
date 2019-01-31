const Promise = require('bluebird')
const path = require('path')
const writeFileAtomic = require('write-file-atomic')
const Translate = require('@google-cloud/translate')
const fs = require('fs')
const parser = require('fast-xml-parser');

const translate = new Translate();

const HELP = `
  Usage:

  translateStrings -d ./utils -l es,fr,fil,bn

  Options:
  --dictionary, -d path/to/strings directory
  --languages, -l comma separated languages like: es,fr,fil,nl
  --forceGen, -f
`

const argv = require('minimist')(process.argv.slice(2), {
  alias: {
    d: 'dictionary',
    h: 'help',
    l: 'languages',
    f: 'forceGen'
  }
})
const { help, dictionary, languages, forceGen } = argv

if (help) {
  console.log(HELP)
  process.exit(0)
}
new Promise(resolve => writeStrings(dictionary, languages, forceGen))

async function writeStrings(stringsDir, lang, forceGen) {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Please set environment variable GOOGLE_APPLICATION_CREDENTIALS to allow models translation')
    return
  }
  let langs = lang.split(',')
  let isRegulaXml = stringsDir === './android/app/src/main/res/values'
  await Promise.all(langs.map(lang => isRegulaXml ? writeRegulaFile(stringsDir, lang, forceGen) : writeFile(stringsDir, lang, forceGen)))
}
async function writeRegulaFile(stringsDir, lang, forceGen) {
  if (lang === 'en')
    return
  let fn = 'strings.xml'
  let enFnStrings = path.resolve(stringsDir, fn)

  let langStrings = path.resolve(stringsDir + '-' + lang)

  if (!fs.existsSync(langStrings))
    fs.mkdirSync(langStrings)

  langStrings = path.resolve(langStrings, fn)
  if (!forceGen  &&  fs.existsSync(langStrings))
    return

  let stringsLang = {}, stringsEN = {}
  try {
    let content = fs.readFileSync(enFnStrings, { encoding: 'utf8' })
    if( parser.validate(content) === true) { //optional (it'll return an object in case it's not valid)
      parser.parse(content, {
        attrNodeName: 'name',
        parseAttributeValue: true,
        ignoreAttributes: false,
        textNodeName : 'text',
        attributeNamePrefix : '_',
      }).resources.string.forEach(obj => stringsEN[obj.name._name] = obj.text)
    }
  } catch (err) {
    console.log(err.message)
    if (!stringsEN)
      return
  }
  let exclude = ['app_name', 'branch_app_link', 'branch_path_prefix']
  let promises = []
  for (let p in stringsEN) {
    if (exclude.indexOf(p) === -1)
      promises.push(translateText({strings: stringsLang, lang, key: p, text: stringsEN[p]}))
  }
  await Promise.all(promises, { concurrency: 20 })
  let strings = '<resources>'
  exclude.forEach(s =>
    strings += `\n<string name="${s}">${stringsEN[s]}</string>`
  )
  for (let s in stringsLang) {
    strings += `\n<string name="${s}">${stringsLang[s].replace(/'/g, "\\'")}</string>`
  }
  strings += '\n</resources>'
  writeFileAtomic(langStrings, strings, console.log)
/*
    <string name="app_name">Tradle</string>
    <string name="branch_app_link">link.tradle.io</string>
    <string name="branch_path_prefix">/HvsP</string>
    <string name="strLookingDocument">Searching for a document…</string>
    <string name="strApplicationDoNotHavePermission">The application doesn\'t have permission to use the camera, please change the privacy settings</string>
    <string name="strProcessingDocument">Document processing...</string>
    <string name="strPhotoProcessing">Photo processing…</string>
    <string name="strKeepDeviceStill">Hold the device still</string>
    <string name="strHoldDocumentStraight">Hold the document straight</string>
    <string name="strGlaresOnDocument">Avoid glare on the document</string>
    <string name="strPrepareCamera">Preparing the camera…</string>
    <string name="strUnableCaptureMedia">Camera configuration failed</string>
    <string name="strDocumentTooSmall">Fit the document into the frame</string>
    <string name="strPlacePhoneOnDoc">Place the phone on the document please</string>
    <string name="strValue">Value</string>
    <string name="strReadingRFID">Reading RFID chip data</string>
    <string name="strReadingRFIDDG">Reading RFID %s data</string>
    <string name="RSDT_RFID_READING_FINISHED">RFID data reading is finished</string>
    <string name="strCameraUnavailable">Camera unavailable</string>
    <string name="strTorchUnavailable">Torch unavailable</string>
    <string name="strNfcTagNotFound">NFC tag not detected! Please move your phone closer to the NFC tag</string>
*/
}
async function writeFile(stringsDir, lang, forceGen) {
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
    if (!stringsLang[p] || forceGen)
      promises.push(translateText({strings: stringsLang, lang, key: p, text: stringsEN[p]}))
  }
  await Promise.all(promises, { concurrency: 20 })

  // Check if some models/props were deleted
  let hasChanged = promises.length
  if (!currentIds  ||  forceGen)
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

