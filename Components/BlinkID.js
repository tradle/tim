console.log('requiring BlinkID.js')
import { Platform } from 'react-native'
import PropTypes from 'prop-types'
import BlinkID from 'react-native-blinkid'
import { microblink } from '../utils/env'
import { isSimulator } from '../utils/utils'
import validateResource from '@tradle/validate-resource'

const { sanitize } = validateResource.utils

module.exports = (function () {
  if (isSimulator()) return
  if (!microblink || !BlinkID || BlinkID.notSupportedBecause) return

  const licenseKey = typeof microblink.licenseKey === 'object'
    ? Platform.select(microblink.licenseKey)
    : microblink.licenseKey

  if (!licenseKey) return

  BlinkID.setLicenseKey(licenseKey)
  const { scan } = BlinkID
  return {
    ...BlinkID,
    async scan (...args) {
      const result = await scan.call(BlinkID, ...args)
      return sanitize(result).sanitized
    }
  }
}())
