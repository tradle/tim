import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

// ios-chatbubbles is 26x32
const EXTRA_MARGIN_TO_MAKE_SQUARE = 8

export default function (props={}) {
  const style = [
    {
      color: '#77ADFC',
      marginRight: 10 + EXTRA_MARGIN_TO_MAKE_SQUARE
    },
    props.style || {}
  ]

  return <Icon {...props} size={props.size || 45} name='ios-chatbubbles' style={style} />
}
