import ReactNative from 'react-native'
const noop = () => {}
const noopWithRemove = () => {
  return { remove: noop }
}

ReactNative.DeviceEventEmitter = {
  addListener: noopWithRemove,
  removeSubscription: noop,
  removeAllListeners: noop
}
