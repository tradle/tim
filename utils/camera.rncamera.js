import { Platform } from 'react-native'
import withDefaults from 'lodash/defaults'
import Navigator from '../Components/Navigator'
import CameraDefaults from './camera-defaults'
import { onNextTransitionStart } from './utils'

const DEFAULTS = {}

export const capture = async props => {
  const {
    // nav options
    navigator,
    title,
    backButtonTitle,
    // camera options
    quality,
    cameraType,
    width,
    height,
  } = withDefaults(props, CameraDefaults, DEFAULTS)

  if (!navigator) {
    throw new Error('expected "navigator"')
  }

  return new Promise((resolve, reject) => {
    // nav to camera view
    onNextTransitionStart(navigator, () => {
      // nav away from camera view
      onNextTransitionStart(navigator, () => resolve())
    })

    navigator.push({
      title,
      backButtonTitle: backButtonTitle || 'Back',
      componentName: 'CameraView',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      noLeftButton: Platform.OS !== 'web',
      passProps: {
        quality,
        cameraType,
        width,
        height,
        callback: (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }

          navigator.pop()
        },
      }
    })
  })
}
