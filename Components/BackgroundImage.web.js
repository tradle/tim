import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  Image,
  Dimensions,
  View
} from 'react-native'

import { makeResponsive, getDimensions } from 'react-native-orient'

class BackgroundImage extends Component {
  render() {
    const props = this.props
    const { width, height } = Dimensions.get('window')
    return (
      <View {...props} style={[
        props.style,
        {
          background: `url(${props.source.uri || props.source}) no-repeat center center fixed`,
          backgroundSize: 'cover',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }
      ]} />
    )
  }
}

module.exports = makeResponsive(BackgroundImage)
