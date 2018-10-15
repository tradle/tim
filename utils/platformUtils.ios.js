import { Linking } from 'react-native'
import Camera from 'react-native-camera'
import Alert from '../Components/Alert'

const requestCameraAccess = async (opts={}) => {
  const { video=true, audio=false } = opts

  if (!(video || audio)) throw new Error('expected "video" and/or "audio"')

  let request
  if (video && audio) {
    request = Camera.checkDeviceAuthorizationStatus()
  } else if (video) {
    request = Camera.checkVideoAuthorizationStatus()
  } else {
    request = Camera.checkAudioAuthorizationStatus()
  }

  const granted = await request
  if (granted) return true

  Alert.alert(
    'cameraAccess',
    'enableCameraAccess',
    [
      { text: 'cancel' },
      {
        text: 'settings',
        onPress: () => {
          Linking.openURL('app-settings:')
        }
      }
    ]
  )
}

module.exports = {
  ...require('./platformUtilsMobile'),
  requestCameraAccess,
}
