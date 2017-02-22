import { Platform } from 'react-native'
import BlinkID from 'react-native-blinkid'
import { microblink } from '../utils/env'

if (microblink && BlinkID) {
  const licenseKey = typeof microblink.licenseKey === 'object'
    ? Platform.select(microblink.licenseKey)
    : microblink.licenseKey

  if (licenseKey) BlinkID.setLicenseKey(licenseKey)
}

export default BlinkID
