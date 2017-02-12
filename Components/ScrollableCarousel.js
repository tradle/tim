'use strict'

import Carousel from 'react-native-carousel';
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
import { makeResponsive } from 'react-native-orient'
// import platformStyles from '../styles/platformStyles'

import {
  StyleSheet,
  Image,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native'

import React, { Component } from 'react'

class ScrollableCarousel extends Component {
  static displayName = 'ScrollableCarousel'
  constructor(props) {
    super(props)
  }
  shouldComponentUpdate(nextProps, nextState) {
    return utils.resized(this.props, nextProps)
  }
  next() {
    this.carousel.next()
  }
  onPress(screen) {
    if (screen.onPress) {
      screen.onPress({ carousel: this })
    } else {
      this.next()
    }
  }
  renderOne(screen) {
    let { image, width, height } = screen
    const screenWidth = utils.dimensions().width
    if (width > screenWidth) {
      const scaleFactor = screenWidth / width
      height *= scaleFactor
      width *= scaleFactor
    }

    return (
      <ScrollView>
        <TouchableOpacity style={styles.container} onPress={this.onPress.bind(this, screen)}>
          <Image source={{ uri: image }} resizeMode='cover' style={[styles.image, { width, height }]} />
        </TouchableOpacity>
      </ScrollView>
    )
  }
  render() {
    const screens = this.props.screens.map(screen => this.renderOne(screen))
    return (
      <Carousel
        ref={ref => this.carousel = ref}
        loop={false}
        animate={false}
        indicatorOffset={20}
        indicatorColor={'#efefef'}>
        {screens}
      </Carousel>
    );
  }
}

ScrollableCarousel = makeResponsive(ScrollableCarousel)
export default ScrollableCarousel

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  image: {

  }
})
