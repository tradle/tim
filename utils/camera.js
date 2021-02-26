import { Platform } from 'react-native'
import omit from 'lodash/omit'
import * as CameraViaImagePicker from './camera.imagepicker'
import * as CameraViaRNCamera from './camera.rncamera'
import { translate, isEmulator } from './utils'
import platformUtils from './platformUtils'
import { getGlobalKeeper } from './keeper'

const CameraImpl = Platform.select({
  default: CameraViaImagePicker,
  web: CameraViaRNCamera,
})

const RN_CAMERA_ONLY = [
  'navigator',
  'backButtonTitle',
  'instructions',
]

const IMAGE_PICKER_ONLY = [
  'returnIsVertical',
  'cancelButtonTitle'
]

const OMIT_PROPS = CameraImpl === CameraViaImagePicker ? RN_CAMERA_ONLY : IMAGE_PICKER_ONLY

const getPlatformProps = props => omit(props, OMIT_PROPS)
const isDataUrl = url => url.startsWith('data:image/')

export const capture = async props => {
  props = getPlatformProps(props)
  const result = await CameraImpl.capture(props)
  if (result && !isDataUrl(result.url)) {
    const { keeper=getGlobalKeeper() } = props
    result.url = await keeper.importFromImageStore(result.url)
  }

  return result
}

// export const captureAndCommitToKeeper = async ({ keeper=getGlobalKeeper(), ...props }) => {
//   const result = await capture(props)
//   const keeperUri = await keeper.importFromImageStore(result.cacheUri)
//   return {
//     ...result,
//     keeperUri,
//   }
// }

export const captureWithImagePicker = (...args) => CameraViaImagePicker.capture(...args)
export const captureWithRNCamera = (...args) => CameraViaRNCamera.capture(...args)
export const requestCameraAccess = async () => {
  if (isEmulator()) return true

  return platformUtils.requestCameraAccess()
}
