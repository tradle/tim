import ReactNative from 'react-native'
const noop = () => {}
const noopWithFn = () => noop

ReactNative.DeviceEventEmitter = {
  addListener: noopWithFn,
  removeSubscription: noop,
  removeAllListeners: noop
}
