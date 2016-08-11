
import {
  Platform,
  StatusBar
} from 'react-native'

import { isWeb } from '../utils/utils'
const noop = () => {}
const mock = {
  setHidden: noop
}

const impl = isWeb() ? mock : StatusBar

export default impl
