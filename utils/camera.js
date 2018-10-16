import { Platform } from 'react-native'
import { isEmulator } from 'react-native-device-info'
import omit from 'lodash/omit'
import * as CameraViaImagePicker from './camera.imagepicker'
import * as CameraViaRNCamera from './camera.rncamera'
import { translate } from './utils'
import platformUtils from './platformUtils'

const USE_IMAGE_PICKER = Platform.OS === 'android'
const CameraImpl = USE_IMAGE_PICKER ? CameraViaImagePicker : CameraViaRNCamera
const RN_CAMERA_ONLY = [
  'navigator',
  'backButtonTitle',
  'instructions',
]

const IMAGE_PICKER_ONLY = [
  'returnIsVertical',
  'cancelButtonTitle'
]

const OMIT_PROPS = USE_IMAGE_PICKER ? RN_CAMERA_ONLY : IMAGE_PICKER_ONLY

const getPlatformProps = props => omit(props, OMIT_PROPS)

export const capture = async props => {
  props = getPlatformProps(props)
  return await CameraImpl.capture(props)
}

export const captureWithImagePicker = (...args) => CameraViaImagePicker.capture(...args)
export const captureWithRNCamera = (...args) => CameraViaRNCamera.capture(...args)
export const requestCameraAccess = async () => {
  if (isEmulator()) return true

  return platformUtils.requestCameraAccess()
}
