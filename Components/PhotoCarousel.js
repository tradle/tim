import Carousel from 'react-native-carousel';
import { ROOT_HASH } from '@tradle/constants'
import { makeResponsive } from 'react-native-orient'
import ViewPager from '@react-native-community/viewpager'

import {
  StyleSheet,
  View,
} from 'react-native'

import React, { Component } from 'react'
import utils from '../utils/utils'
import Image from './Image'

class PhotoCarousel extends Component {
  static displayName = 'PhotoCarousel'
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return utils.resized(this.props, nextProps)
  }
  render() {
    let rPhotos = this.props.photos
    let currentPhoto = this.props.currentPhoto || (rPhotos.length  &&  rPhotos[0])
    let currentPhotoIndex = -1;
    if (!rPhotos)
      rPhotos = [currentPhoto]
    let n = rPhotos.length

    let isVertical = currentPhoto.isVertical
    let cnt = 2000
    let r = this.props.resource
    let styles = createStyles()
    let photos = []
    let {width, height} = utils.dimensions(PhotoCarousel)

    for (let j=0; j<2; j++) {
      for (let i=0; i<n; i++) {
        let photo = rPhotos[i];

        if (currentPhotoIndex === -1  &&  photo.url !== currentPhoto.url) {
          if (n !== 1)
            continue;
        }
        if (currentPhotoIndex === -1)
          currentPhotoIndex = i;
        let key = r[ROOT_HASH] + cnt++
        let style
        let isPNG = utils.isImageDataURL(photo.url)  &&  photo.url.indexOf('data:image/png;') === 0
        if (photo.width) {
          style = {width, height, backgroundColor: isPNG && '#ffffff' || 'transparent'}
        }
        else {
          if (isVertical)
            style = isPNG && styles.imagePngV || styles.imageV
          else
            style = isPNG && styles.imagePng || styles.image
        }
        photos.push(
          <View style={styles.container} key={key}>
            <Image resizeMode='contain' source={{uri: photo.url}} style={style}/>
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
                component={utils.isAndroid()  &&  ViewPager}
                loop={false}
                animate={false}
                indicatorOffset={20}
                indicatorColor={'#efefef'}>
        {photos}
      </Carousel>
    );
  }
}

const createStyles = utils.styleFactory(PhotoCarousel, function ({ dimensions }) {
  const { width, height } = dimensions
  return StyleSheet.create({
    image: {
      width,
      height: height - 100,
    },
    imageV: {
      width,
      height: height - 200,
    },
    imagePng: {
      width,
      height: height - 100,
      backgroundColor: '#ffffff'
    },
    imagePngV: {
      width,
      height: height - 200,
      backgroundColor: '#ffffff'
    },
    container: {
      width,
      paddingTop: height > width  &&  30 || 0,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
  })
})

PhotoCarousel = makeResponsive(PhotoCarousel)
module.exports = PhotoCarousel;
