
import {
  Platform,
  ActivityIndicator,
  ActivityIndicatorIOS
} from 'react-native'

const impl = ActivityIndicator || ActivityIndicatorIOS
export default impl
