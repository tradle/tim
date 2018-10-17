import { Platform } from 'react-native'
import withDefaults from 'lodash/defaults'
import CameraView from '../Components/CameraView'
import Navigator from '../Components/Navigator'
import CameraDefaults from './camera-defaults'

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
  } = withDefaults(props, CameraDefaults, DEFAULTS)

  if (!navigator) {
    throw new Error('expected "navigator"')
  }

  return new Promise((resolve, reject) => {
    navigator.push({
      title,
      backButtonTitle: backButtonTitle || 'Back',
      id: 12,
      component: CameraView,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      noLeftButton: Platform.OS !== 'web',
      passProps: {
        quality,
        cameraType,
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
