
import {
  findNodeHandle,
  NativeModules
} from 'react-native'

const RCTUIManager = NativeModules.UIManager

module.exports = {
  getNode: function getNode (component) {
    return typeof component === 'number' ? component : findNodeHandle(component)
  },
  autoScroll: function (scrollView, toHandle, additionalOffset) {
    // debugger
    const scrollResponder = scrollView.getScrollResponder()
    scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
      findNodeHandle(toHandle),
      additionalOffset,
      true
    )
  },
  measure: function (scrollView, handle, cb) {
    RCTUIManager.measureLayout(handle, findNodeHandle(scrollView.getInnerViewNode()), cb, function (left, top, width, height) {
      cb(null, { left, top, width, height })
    })
  },
  scrollTo: function (scrollView, x, y) {
    const scrollResponder = scrollView.getScrollResponder()
    scrollResponder.scrollResponderScrollTo({ x, y, animated: true});
  }
}
