if (__DEV__) console.log('requiring platformUtilsMobile.js')

import {
  findNodeHandle,
  NativeModules,
  Platform
} from 'react-native'

import NavigationBarStylesIOS from 'NavigatorNavigationBarStylesIOS'
import NavigationBarStylesAndroid from 'NavigatorNavigationBarStylesAndroid'

const NavBarStyles = Platform.OS === 'ios' ? NavigationBarStylesIOS : NavigationBarStylesAndroid
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
  },
  navBarHeight: NavBarStyles.General.NavBarHeight
}
