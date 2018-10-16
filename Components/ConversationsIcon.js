import React from 'react'
import { Platform } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

// ios-chatbubbles is 26x32
const EXTRA_MARGIN_TO_MAKE_SQUARE = Platform.OS === 'web' ? 0 : 8

export default function (props={}) {
  const style = [
    {
      marginRight: 10 + EXTRA_MARGIN_TO_MAKE_SQUARE
    },
    props.style || {}
  ]

  return <Icon {...props} size={props.size || 45} color={props.color || '#77ADFC'} name='ios-chatbubbles' style={style} />
}
