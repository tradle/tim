
import { isWeb } from '../utils/utils'

module.exports = isWeb() ? require('./DatePicker.web.js') : require('react-native-datepicker')
