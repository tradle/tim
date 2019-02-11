
import React from 'react'
import {
  Text as RawText,
  Platform
} from 'react-native'
import _ from 'lodash'
var fontFamily
var fonts = {
  "Benton Sans": "BentonSans Regular"
}
// import { translate } from '../utils/utils'
const fonts = {
  'Benton Sans': 'BentonSans Regular'
}

export function setFontFamily(style) {
  if (!style.fontFamily)
    fontFamily = 'BentonSans Regular'
  else
  fontFamily = Platform.OS === 'android'  &&  style.fontFamilyAndroid  ||  style.fontFamily
  if (fonts[fontFamily])
    fontFamily = fonts[fontFamily]
}
export function resetFontFamily(ff) {
  fontFamily = null
}
export function getFontMapping(font) {
  return fonts[font] || font
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

