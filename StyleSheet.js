
import {PixelRatio, StyleSheet} from 'react-native'

module.exports = {
  ...StyleSheet,
  create: function (styles) {
    return StyleSheet.create(adjust(styles))
  }
}
function adjust (styles) {
  let fontScale = PixelRatio.getFontScale()
// Alert.alert('' + fontScale)
  if (!fontScale  ||  fontScale <= 3)
    return styles
  for (let style in styles) {
    let fontSize = styles[style].fontSize

    if (fontSize)
      styles[style].fontSize = Math.floor(fontSize * (fontScale < 3.5 ? 0.95 : 0.9))
      // styles[style].fontSize = Math.floor(fontSize * (!fontScale || fontScale <= 3
      //       ? (Platform.OS === 'android' ? 1 : 1.1)
      //       : (fontScale < 3.5) ? 0.95 : 0.87))
  }
  return styles
}
