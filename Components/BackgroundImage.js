import React, { Component } from 'react'
import {
  StyleSheet,
  Image,
  Dimensions
} from 'react-native'

import { makeResponsive } from 'react-native-orient'

class BackgroundImage extends Component {
  render() {
    const props = this.props
    const { width, height } = Dimensions.get('window')
    return <Image {...props} style={[
      styles.backgroundImage,
      props.style,
      { width, height }
    ]} />
  }
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    position:'absolute',
    left: 0,
    top: 0
  }
})

module.exports = makeResponsive(BackgroundImage)
