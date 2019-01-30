import React, { Component } from 'react'
import {
  StyleSheet,
  // Image,
  Dimensions
} from 'react-native'

import { makeResponsive } from 'react-native-orient'
import { makeStylish } from './makeStylish'
import Image from './Image'

class BackgroundImage extends Component {
  constructor(props) {
    super(props)
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.width !== nextProps.width   ||
        this.props.height !== nextProps.height)
      return true

    return this.props.source.uri !== nextProps.source.uri
  }
  render() {
    const props = this.props
    const { width, height } = this.props
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

BackgroundImage = makeStylish(BackgroundImage)
module.exports = makeResponsive(BackgroundImage)
