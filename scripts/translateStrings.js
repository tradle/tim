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
  let isRegulaXml = stringsDir === './android/app/src/main/res/values'
  if (lang) {
    let langs = lang.split(',')
    await Promise.all(langs.map(lang => isRegulaXml ? writeRegulaFile(stringsDir, lang, forceGen) : writeFile(stringsDir, lang, forceGen)))
    return
  }

  let [languages] = await translate.getLanguages()

  for (let i=0; i<languages.length; ) {
    let promises = []
    for (let j=0; j<5 && i < languages.length; j++, i++) {
      let lang = languages[i].code
      isRegulaXml ? await writeRegulaFile(stringsDir, lang, forceGen) : await writeFile(stringsDir, lang, forceGen)
      // promises.push(lang => isRegulaXml ? writeRegulaFile(stringsDir, lang, forceGen) : writeFile(stringsDir, lang, forceGen))
    }
  }
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

const google_languages = {
  languages: [
    {
      "code": "af",
      "name": "Afrikaans"
    },
    {
      "code": "ar",
      "name": "Arabic"
    },
    {
      "code": "bn",
      "name": "Bengali"
    },
    {
      "code": "bs",
      "name": "Bosnian"
    },
    {
      "code": "bg",
      "name": "Bulgarian"
    },
    {
      "code": "ca",
      "name": "Catalan"
    },
    {
      "code": "ceb",
      "name": "Cebuano"
    },
    {
      "code": "ny",
      "name": "Chichewa"
    },
    {
      "code": "zh",
      "name": "Chinese (Simplified)"
    },
    {
      "code": "zh-TW",
      "name": "Chinese (Traditional)"
    },
    {
      "code": "co",
      "name": "Corsican"
    },
    {
      "code": "hr",
      "name": "Croatian"
    },
    {
      "code": "cs",
      "name": "Czech"
    },
    {
      "code": "da",
      "name": "Danish"
    },
    {
      "code": "nl",
      "name": "Dutch"
    },
    {
      "code": "en",
      "name": "English"
    },
    {
      "code": "eo",
      "name": "Esperanto"
    },
    {
      "code": "et",
      "name": "Estonian"
    },
    {
      "code": "tl",
      "name": "Filipino"
    },
    {
      "code": "fi",
      "name": "Finnish"
    },
    {
      "code": "fr",
      "name": "French"
    },
    {
      "code": "fy",
      "name": "Frisian"
    },
    {
      "code": "gl",
      "name": "Galician"
    },
    {
      "code": "ka",
      "name": "Georgian"
    },
    {
      "code": "de",
      "name": "German"
    },
    {
      "code": "el",
      "name": "Greek"
    },
    {
      "code": "gu",
      "name": "Gujarati"
    },
    {
      "code": "ht",
      "name": "Haitian Creole"
    },
    {
      "code": "ha",
      "name": "Hausa"
    },
    {
      "code": "haw",
      "name": "Hawaiian"
    },
    {
      "code": "iw",
      "name": "Hebrew"
    },
    {
      "code": "hi",
      "name": "Hindi"
    },
    {
      "code": "hmn",
      "name": "Hmong"
    },
    {
      "code": "hu",
      "name": "Hungarian"
    },
    {
      "code": "is",
      "name": "Icelandic"
    },
    {
      "code": "ig",
      "name": "Igbo"
    },
    {
      "code": "id",
      "name": "Indonesian"
    },
    {
      "code": "ga",
      "name": "Irish"
    },
    {
      "code": "it",
      "name": "Italian"
    },
    {
      "code": "ja",
      "name": "Japanese"
    },
    {
      "code": "jw",
      "name": "Javanese"
    },
    {
      "code": "kn",
      "name": "Kannada"
    },
    {
      "code": "kk",
      "name": "Kazakh"
    },
    {
      "code": "km",
      "name": "Khmer"
    },
    {
      "code": "ko",
      "name": "Korean"
    },
    {
      "code": "ku",
      "name": "Kurdish (Kurmanji)"
    },
    {
      "code": "ky",
      "name": "Kyrgyz"
    },
    {
      "code": "lo",
      "name": "Lao"
    },
    {
      "code": "la",
      "name": "Latin"
    },
    {
      "code": "lv",
      "name": "Latvian"
    },
    {
      "code": "lt",
      "name": "Lithuanian"
    },
    {
      "code": "lb",
      "name": "Luxembourgish"
    },
    {
      "code": "mk",
      "name": "Macedonian"
    },
    {
      "code": "mg",
      "name": "Malagasy"
    },
    {
      "code": "ms",
      "name": "Malay"
    },
    {
      "code": "ml",
      "name": "Malayalam"
    },
    {
      "code": "mt",
      "name": "Maltese"
    },
    {
      "code": "mi",
      "name": "Maori"
    },
    {
      "code": "mr",
      "name": "Marathi"
    },
    {
      "code": "mn",
      "name": "Mongolian"
    },
    {
      "code": "my",
      "name": "Myanmar (Burmese)"
    },
    {
      "code": "ne",
      "name": "Nepali"
    },
    {
      "code": "no",
      "name": "Norwegian"
    },
    {
      "code": "ps",
      "name": "Pashto"
    },
    {
      "code": "fa",
      "name": "Persian"
    },
    {
      "code": "pl",
      "name": "Polish"
    },
    {
      "code": "pt",
      "name": "Portuguese"
    },
    {
      "code": "pa",
      "name": "Punjabi"
    },
    {
      "code": "ro",
      "name": "Romanian"
    },
    {
      "code": "ru",
      "name": "Russian"
    },
    {
      "code": "sm",
      "name": "Samoan"
    },
    {
      "code": "gd",
      "name": "Scots Gaelic"
    },
    {
      "code": "sr",
      "name": "Serbian"
    },
    {
      "code": "st",
      "name": "Sesotho"
    },
    {
      "code": "sn",
      "name": "Shona"
    },
    {
      "code": "sd",
      "name": "Sindhi"
    },
    {
      "code": "si",
      "name": "Sinhala"
    },
    {
      "code": "sk",
      "name": "Slovak"
    },
    {
      "code": "sl",
      "name": "Slovenian"
    },
    {
      "code": "so",
      "name": "Somali"
    },
    {
      "code": "es",
      "name": "Spanish"
    },
    {
      "code": "su",
      "name": "Sundanese"
    },
    {
      "code": "sw",
      "name": "Swahili"
    },
    {
      "code": "sv",
      "name": "Swedish"
    },
    {
      "code": "tg",
      "name": "Tajik"
    },
    {
      "code": "ta",
      "name": "Tamil"
    },
    {
      "code": "te",
      "name": "Telugu"
    },
    {
      "code": "th",
      "name": "Thai"
    },
    {
      "code": "tr",
      "name": "Turkish"
    },
    {
      "code": "uk",
      "name": "Ukrainian"
    },
    {
      "code": "ur",
      "name": "Urdu"
    },
    {
      "code": "uz",
      "name": "Uzbek"
    },
    {
      "code": "vi",
      "name": "Vietnamese"
    },
    {
      "code": "cy",
      "name": "Welsh"
    },
    {
      "code": "xh",
      "name": "Xhosa"
    },
    {
      "code": "yi",
      "name": "Yiddish"
    },
    {
      "code": "yo",
      "name": "Yoruba"
    },
    {
      "code": "zu",
      "name": "Zulu"
    }
  ]
}
