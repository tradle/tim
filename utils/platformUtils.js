
import {
  Platform
} from 'react-native'

module.exports = Platform.OS === 'web' ? require('./platformUtils.web') : require('./platformUtils.ios')
