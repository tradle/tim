
import { Platform } from 'react-native'

module.exports = {
  isIE: (function isIE () {
    if (Platform.OS !== 'web') return false

    var ua = global.navigator.userAgent
    var msie = ua.indexOf("MSIE ")
    if (msie > 0) return true

    // IE11
    return !(global.ActiveXObject) && "ActiveXObject" in global
  })()
}
