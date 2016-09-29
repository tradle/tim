import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native'

import { makeResponsive, getDimensions } from 'react-native-orient'

class BackgroundImage extends Component {
  render() {
    const props = this.props
    const { width, height } = Dimensions.get('window')
    return (
      <Image {...props} style={[
        props.style,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }
      ]} />
    )
  }
}

module.exports = makeResponsive(BackgroundImage)
