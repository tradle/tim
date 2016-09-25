
import { NativeModules } from 'react-native'
const noop = () => {}
const orientation = 'LANDSCAPE'

NativeModules.Orientation = {
  initialOrientation: orientation,
  getOrientation: cb => process.nextTick(() => cb(null, orientation)),
  getSpecificOrientation: cb => process.nextTick(() => cb(null, orientation)),
  // addOrientationListener: noop,
  // removeOrientationListener: noop,
  lockToPortrait: noop,
  lockToLandscape: noop,
  lockToLandscapeLeft: noop,
  lockToLandscapeRight: noop,
  unlockAllOrientations: noop
}
