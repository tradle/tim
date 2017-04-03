
import {
  Platform,
  WebView
} from 'react-native'

if (Platform.OS === 'web') {
  module.exports = props => {
    var {
      src,
      source,
      style
    } = props

    if (typeof source === 'string' && source.trim()[0] === '<') {
      return <iframe ref={onRef} style={style} />

      function onRef (ref) {
        const iframedoc = ref.contentDocument || ref.contentWindow.document
        iframedoc.body.innerHTML = source
      }
    }

    src = src || source.uri
    style = style || {}
    return (
      <iframe src={src} style={style}></iframe>
    )
  }
} else {
  module.exports = WebView
}
