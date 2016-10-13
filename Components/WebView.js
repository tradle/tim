
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

    src = src || source.uri
    style = style || {}
    return (
      <iframe src={src} style={style}></iframe>
    )
  }
} else {
  module.exports = WebView
}
