
import React from 'react'
import {
  Text as RawText,
  Platform
} from 'react-native'
import _ from 'lodash'

import { isWeb, isAndroid } from '../utils/utils'
// import { translate } from '../utils/utils'
var fontFamily

export function setFontFamily(style) {
  if (!isWeb()  ||  !style)
    return
  if (style.textFont)
    fontFamily = style.textFont
  // else
  //   fontFamily = Platform.OS === 'android'  &&  style.fontFamilyAndroid  ||  style.fontFamily

  // if (fonts[fontFamily])
  //   fontFamily = fonts[fontFamily]
}
export function resetFontFamily(ff) {
  fontFamily = null
}
export function getFontMapping(font) {
  return font
  // return fonts[font] || font
}
export const Text = props => {
  let { children, ...rest } = props
  // let ff = {fontFamily: Platform.OS === 'ios' ? fontFamily || 'Bradley Hand' : 'notoserif'}
  if (!fontFamily)
    return <RawText {...rest}>{children}</RawText>

  let { style, other } = rest
  let st
  if (!style)
    st = { fontFamily }
  else if (!Array.isArray(style))
    st = [{ fontFamily }, style]
  else {
    st = _.clone(style)
    st.splice(0, 0, { fontFamily })
  }
  return <RawText style={st} {...other}>{children}</RawText>

  // if (typeof children === 'string') {
  //   children = translate(children)
  // }

}

