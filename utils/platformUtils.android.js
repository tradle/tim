
import {
  PermissionsAndroid,
} from 'react-native'

const requestCameraAccess = async opts => {
  const { translate } = require('./utils')
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      'title': translate('cameraAccess'),
      'message': translate('enableCameraAccess')
    }
  )

  return result === PermissionsAndroid.RESULTS.GRANTED
}

module.exports = {
  ...require('./platformUtilsMobile'),
  requestCameraAccess,
}
