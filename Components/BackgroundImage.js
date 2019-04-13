import React, { Component } from 'react'
import {
  StyleSheet,
  // Image,
  Dimensions
} from 'react-native'

import { makeResponsive } from 'react-native-orient'
import Image from './Image'

class BackgroundImage extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.source.uri !== nextProps.source.uri)
      return true
    if (this.props.orientation  !==  nextProps.orientation)
      return true
    else
      return false
  }
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
