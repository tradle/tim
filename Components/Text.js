import React from 'react'
import {
  Text as RawText,
  Platform
} from 'react-native'
import _ from 'lodash'
var fontFamily
// import { translate } from '../utils/utils'
export function setFontFamily(style) {
  if (!style.fontFamily)
    fontFamily = 'BentonSans Regular'
  else
  fontFamily = Platform.OS === 'android'  &&  style.fontFamilyAndroid  ||  style.fontFamily
}
export function resetFontFamily(ff) {
  fontFamily = null
}

export const Text = props => {
  let { children, style, ...rest } = props
  // let ff = {fontFamily: Platform.OS === 'ios' ? fontFamily || 'Bradley Hand' : 'notoserif'}
  let st
  if (fontFamily) {
    if (!style  ||  !Array.isArray(style))
      st = { fontFamily }
    else {
      st = _.clone(style)
      st.splice(0, 0, { fontFamily })
    }
  }
  else
    st = style || {}
  // if (typeof children === 'string') {
  //   children = translate(children)
  // }

  return <RawText style={st} {...rest}>{children}</RawText>
}

