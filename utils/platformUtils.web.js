console.log('requiring platformUtils.web.js')

import ReactDOM from 'react-dom'
import extend from 'xtend'
import NavigationBarStylesIOS from 'react-native-deprecated-custom-components/src/NavigatorNavigationBarStylesIOS'

module.exports = {
  getNode: function getNode (component) {
    return typeof component === 'number' ? component : ReactDOM.findDOMNode(component)
  },
  measure: function (scrollView, domNode, cb) {
    const rect = domNode.getBoundingClientRect()
    const scrollNode = ReactDOM.findDOMNode(scrollView)
    let top = rect.top + scrollNode.scrollTop
    // let parentNode = scrollNode
    // while (parentNode = parentNode.parentNode) {
    //   top -= (parentNode.offsetTop || 0)
    // }

    cb(null, {
      width: rect.width,
      height: rect.height,
      top: top,
      left: rect.left + scrollNode.scrollLeft,
      bottom: top + rect.height,
      right: rect.right + scrollNode.scrollLeft
    })
  },
  scrollTo: function (scrollView, x, y) {
    scrollView.scrollTo({ x, y })
  },
  navBarHeight: NavigationBarStylesIOS.General.NavBarHeight
}
