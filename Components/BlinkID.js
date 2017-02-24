import { Platform } from 'react-native'
import BlinkID from 'react-native-blinkid'
import { microblink } from '../utils/env'
import { isSimulator } from '../utils/utils'

module.exports = (function () {
  if (isSimulator()) return
  if (!microblink || !BlinkID || BlinkID.notSupportedBecause) return

  const licenseKey = typeof microblink.licenseKey === 'object'
    ? Platform.select(microblink.licenseKey)
    : microblink.licenseKey

  if (!licenseKey) return

  BlinkID.setLicenseKey(licenseKey)
  return BlinkID
}())
