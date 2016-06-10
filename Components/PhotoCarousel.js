'use strict'

var Carousel = require('react-native-carousel');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');

import {
  StyleSheet,
  Image,
  Dimensions,
  View,
} from 'react-native'

import React, { Component } from 'react'

class PhotoCarousel extends Component {
  constructor(props) {
    super(props);
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
    for (var j=0; j<2; j++) {
      for (var i=0; i<n; i++) {
        var photo = this.props.photos[i];

        if (currentPhotoIndex == -1  &&  photo.url !== currentPhoto.url)
          continue;
        if (currentPhotoIndex == -1)
          currentPhotoIndex = i;
        var key = r[constants.ROOT_HASH] + cnt++
        if (photo.width) {
          var w = Dimensions.get('window').width
          var h, padding
          if (photo.width > Dimensions.get('window').width) {
            h = photo.height * Dimensions.get('window').width / photo.width
            // if (photo.isVertical)
            //   h = Dimensions.get('window').width * 1.2
            // else
            //   h = Dimensions.get('window').width / 1.2
          }
          else {
            h = photo.height
            w = photo.width
            padding = (Dimensions.get('window').width - photo.width) / 2
          }

          if (h > 3 * Dimensions.get('window').height / 4)
            h = 3 * Dimensions.get('window').height / 4

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
      <Carousel width={Dimensions.get('window').width}
                loop={false}
                animate={false}
                indicatorOffset={40}
                indicatorColor={'#efefef'}>
        {photos}
      </Carousel>
    );
  }
}

var styles = StyleSheet.create({
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
  imageH: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width - 100
  },
  imageV: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 200,
  },
  container: {
    width: Dimensions.get('window').width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
module.exports = PhotoCarousel;
