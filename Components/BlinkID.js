import { Platform } from 'react-native'
import BlinkID from 'react-native-blinkid'
import { microblink } from '../utils/env'

module.exports = (function () {
  if (!microblink || !BlinkID || BlinkID.notSupportedBecause) return

  const licenseKey = typeof microblink.licenseKey === 'object'
    ? Platform.select(microblink.licenseKey)
    : microblink.licenseKey

  if (!licenseKey) return

  BlinkID.setLicenseKey(licenseKey)
  return BlinkID
}())
