console.log('requiring PhotoCarousel.js')
'use strict'

import Carousel from 'react-native-carousel';
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
import { makeResponsive } from 'react-native-orient'

import {
  StyleSheet,
  Image,
  View,
} from 'react-native'

import React, { Component } from 'react'

class PhotoCarousel extends Component {
  static displayName = 'PhotoCarousel'
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return utils.resized(this.props, nextProps)
  }
  render() {
    let photoUrls = [];
    let currentPhoto = this.props.currentPhoto || (this.props.photos && this.props.photos[0])
    let currentPhotoIndex = -1;
    let n = this.props.photos && this.props.photos.length || 1;

    let model = utils.getModel(this.props.resource[constants.TYPE]);
    let isVertical = currentPhoto.isVertical
    let cnt = 2000
    let r = this.props.resource
    let styles = createStyles()
    let photos = []
    let {width, height} = utils.dimensions(PhotoCarousel)
    for (let j=0; j<2; j++) {
      for (let i=0; i<n; i++) {
        let photo = this.props.photos[i];

        if (currentPhotoIndex == -1  &&  photo.url !== currentPhoto.url)
          continue;
        if (currentPhotoIndex == -1)
          currentPhotoIndex = i;
        let key = r[constants.ROOT_HASH] + cnt++

        if (photo.width) {
          let w = width, h, padding

          if (height > width) {
            if (photo.width > width)
              h = photo.height * width / photo.width
            else {
              h = photo.height
              w = photo.width
              padding = (width - photo.width) / 2
            }

            if (h > 0.8 * height)
              h = Math.floor(0.8 * height)
          }
          else {
            h = Math.floor(0.8 * height)
            if (photo.height > h)
              w = photo.width * h / photo.height
            else {
              h = photo.height
              w = photo.width
            }
          }

          photos.push(
                        <View style={[styles.container]} key={key}>
                          <Image resizeMode='contain' source={{uri: photo.url}} style={{width: w, height: h}}/>
                        </View>
                     )
        }
        else
          photos.push(
            isVertical  ? <View style={styles.container} key={key}>
                            <Image resizeMode='contain' source={{uri: photo.url}} style={styles.imageV}/>
                          </View>

                        : <View style={styles.container} key={key}>
                            <Image resizeMode='contain' source={{uri: photo.url}} style={styles.image}/>
                          </View>
        )
      }
      n = currentPhotoIndex
    }
    if (!photos.length) {
      debugger
      return <View/>
    }
    return (
      <Carousel width={width}
                loop={false}
                animate={false}
                indicatorOffset={20}
                indicatorColor={'#efefef'}>
        {photos}
      </Carousel>
    );
  }
}

let createStyles = utils.styleFactory(PhotoCarousel, function ({ dimensions }) {
  return StyleSheet.create({
    image: {
      width: dimensions.width,
      height: dimensions.height - 200,
    },
    imageH: {
      width: dimensions.width,
      height: dimensions.width - 100
    },
    imageV: {
      width: dimensions.width,
      height: dimensions.height - 200,
    },
    container: {
      width: dimensions.width,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
  })
})

PhotoCarousel = makeResponsive(PhotoCarousel)
module.exports = PhotoCarousel;
