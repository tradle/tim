
var LinearGradient
import { Platform, View } from 'react-native'
if (Platform.OS === 'android') LinearGradient = require('react-native-linear-gradient/index.android').default
else if (Platform.OS === 'ios') LinearGradient = require('react-native-linear-gradient/index.ios').default
else LinearGradient = View

export default LinearGradient
