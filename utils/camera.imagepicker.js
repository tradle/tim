import { Platform } from 'react-native'
import { isEmulator } from 'react-native-device-info'
import withDefaults from 'lodash/defaults'
import ImagePicker from 'react-native-image-picker'
import { translate } from './utils'
import { normalizeImageCaptureData } from './image-utils'
import CameraDefaults from './camera-defaults'

const isIosSimulator = Platform.OS === 'ios' && isEmulator()
const DEFAULTS = {
  // image picker
  returnIsVertical: true,
  cancelButtonTitle: translate('cancel'),
  storageOptions: {
    skipBackup: true,
    store: false
  },
  mediaType: 'photo',
}

export const capture = props => new Promise((resolve, reject) => {
  const {
    // common
    title,
    quality,
    cameraType,

    // specific to image picker
    returnIsVertical,
    cancelButtonTitle,
    storageOptions,
    mediaType,
  } = withDefaults(props, CameraDefaults, DEFAULTS)

  if (!quality) throw new Error('expected "number" quality')

  let method = 'launchCamera'
  if (isIosSimulator) {
    method = 'launchImageLibrary'
  }

  ImagePicker[method]({
    title,
    quality,
    cameraType,
    returnIsVertical,
    cancelButtonTitle,
    storageOptions,
    mediaType,
    // due to out-of-memory issues
    // maxWidth: 1536,
    // maxHeight: 1536,
  }, ({ error, didCancel, ...result }) => {
    if (didCancel) return reject(new Error('user canceled'))
    if (error) return reject(new Error(error))

    resolve(normalizeImageCaptureData({
      ...result,
      extension: quality === 1 ? 'png' : 'jpeg',
      base64: result.data,
      quality,
    }))
  })
})
