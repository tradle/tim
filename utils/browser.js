
import { Platform } from 'react-native'

module.exports = {
  isIE: (function isIE () {
    if (Platform.OS !== 'web') return false

    var ua = global.navigator.userAgent
    var msie = ua.indexOf("MSIE ")
    return msie > 0
  })()
}
