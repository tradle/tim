import withDefaults from 'lodash/defaults'
import CameraView from '../Components/CameraView'
import Navigator from '../Components/Navigator'
import { normalizeImageCaptureData } from './image-utils'
import { onNextTransitionStart, onNextTransitionEnd } from './utils'
import CameraDefaults from './camera-defaults'

const DEFAULTS = {}

export const capture = async props => {
  const {
    // nav options
    navigator,
    title,
    backButtonTitle='Back',
    // camera options
    quality,
    cameraType,
  } = withDefaults(props, CameraDefaults, DEFAULTS)

  if (!navigator) {
    throw new Error('expected "navigator"')
  }

  // TODO: reject if user cancels
  return new Promise((resolve, reject) => {
    // user navigates to camera view
    onNextTransitionStart(navigator, () => {
      // user navigates elsewhere
      onNextTransitionStart(navigator, () => reject(new Error('user canceled')))
    })

    navigator.push({
      title,
      backButtonTitle: backButtonTitle || 'Back',
      id: 12,
      component: CameraView,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        quality,
        cameraType,
        onTakePic: data => {
          try {
            resolve(normalizeImageCaptureData({ ...data, quality }))
          } catch (err) {
            reject(err)
          }

          navigator.pop()
        },
      }
    })
  })
}
