'use strict'

var Carousel = require('react-native-carousel');
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
    return this.props.orientation !== nextProps.orientation
  }
  render() {
    var photos = [];
    var currentPhoto = this.props.currentPhoto || this.props.photos[0];
    var currentPhotoIndex = -1;
    var n = this.props.photos.length;

    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var isVertical = currentPhoto.isVertical
    var isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;
    var isUtility = !isLicense  &&  model.id.indexOf('Utility') !== -1
    var cnt = 2000
    var r = this.props.resource
    var styles = createStyles()
    for (var j=0; j<2; j++) {
      for (var i=0; i<n; i++) {
        var photo = this.props.photos[i];

        if (currentPhotoIndex == -1  &&  photo.url !== currentPhoto.url)
          continue;
        if (currentPhotoIndex == -1)
          currentPhotoIndex = i;
        var key = r[constants.ROOT_HASH] + cnt++
        if (photo.width) {
          var {width, height} = utils.dimensions(PhotoCarousel)
          var w = width, h, padding
          if (photo.width > width) {
            h = photo.height * width / photo.width
            // if (photo.isVertical)
            //   h = Dimensions.get('window').width * 1.2
            // else
            //   h = Dimensions.get('window').width / 1.2
          }
          else {
            h = photo.height
            w = photo.width
            padding = (width - photo.width) / 2
          }

          if (h > 3 * height / 4)
            h = 3 * height / 4

          photos.push(
                        <View style={[styles.container, {paddingHorizontal: padding}]} key={key}>
                          <Image source={{uri: photo.url}} style={{width: w, height: h}}/>
                        </View>
                     )

        }
        else
          photos.push(
            isVertical  ? <View style={styles.container} key={key}>
                            <Image source={{uri: photo.url}} style={styles.imageV}/>
                          </View>

                        : (isLicense
                           ? <View style={styles.container} key={key}>
                                <Image source={{uri: photo.url}} style={styles.imageH}/>
                              </View>
                           : <View style={styles.container} key={key}>
                                <Image source={{uri: photo.url}} style={styles.image}/>
                              </View>
                        )
        )
        // photos.push(
        //   isLicense ? <View style={styles.container}>
        //                <Image source={{uri: photo.url}} style={styles.imageH}/>
        //               </View>
        //             : (isUtility
        //               ? <View style={styles.container}>
        //                   <Image source={{uri: photo.url}} style={styles.imageV}/>
        //                 </View>

        //               : <View style={styles.container}>
        //                   <Image source={{uri: photo.url}} style={styles.image}/>
        //                 </View>
        //               )
        // )
      }
      n = currentPhotoIndex
    }
    return (
      <Carousel width={width}
                loop={false}
                animate={false}
                indicatorOffset={40}
                indicatorColor={'#efefef'}>
        {photos}
      </Carousel>
    );
  }
}
PhotoCarousel = makeResponsive(PhotoCarousel)

var createStyles = utils.styleFactory(PhotoCarousel, function ({ dimensions }) {
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
module.exports = PhotoCarousel;
