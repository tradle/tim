
import { Platform } from 'react-native'

let ffPrivateDetector
let _isFFPrivateBrowsing
const isFF = /Firefox/.test(navigator.userAgent)
const isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1
const isChrome = navigator.userAgent.indexOf('Chrome') !== -1

module.exports = {
  isIE: (function isIE () {
    if (Platform.OS !== 'web') return false

    var ua = global.navigator.userAgent
    var msie = ua.indexOf("MSIE ")
    if (msie > 0) return true

    // IE11
    return !(global.ActiveXObject) && "ActiveXObject" in global
  })(),
  isFF,
  isChrome,
  isSafari,
  get _isFFPrivateBrowsing() {
    return _isFFPrivateBrowsing
  },
  isFFPrivateBrowsing: function () {
    if (!isFF) return _isFFPrivateBrowsing = false
    if (!ffPrivateDetector) {
      ffPrivateDetector = detectFFPrivateBrowsing()
      ffPrivateDetector.then(result => _isFFPrivateBrowsing = result)
    }

    return ffPrivateDetector
  }
}

// adapted from https://gist.github.com/cou929/7973956
async function detectFFPrivateBrowsing () {
  if (!window.indexedDB) return false

  let db
  try {
    db = window.indexedDB.open('testffprivatebrowsing')
  } catch(e) {
    return true
  }

  return new Promise((resolve, reject) => {
    let tries = 50
    const interval = setInterval(function () {
      if (db.readyState === 'done') {
        resolve(!db.result)
      } else if (--tries === 0) {
        reject(new Error('cannot detect'))
      } else {
        return
      }

      clearInterval(interval)
    }, 10)
  })
}
