if (__DEV__) console.log('requiring ActivityIndicator.js')

import {
  Platform,
  ActivityIndicator,
  ActivityIndicatorIOS
} from 'react-native'

const impl = ActivityIndicator || ActivityIndicatorIOS
export default impl
