
import ReactDOM from 'react-dom'

module.exports = {
  getNode: function getNode (component) {
    return typeof component === 'number' ? component : ReactDOM.findDOMNode(component)
  },
  measure: function (scrollView, domNode, cb) {
    cb(null, domNode.getBoundingClientRect())
  },
  scrollTo: function (scrollView, x, y) {
    scrollView.scrollTo({ x, y })
  }
}
