console.log('requiring PhotoCarousel.js')
'use strict'

// import { makeResponsive } from 'react-native-orient'
import Gallery from 'react-native-gallery'
import utils from '../utils/utils'

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
    var photoUrls = [];
    var currentPhoto = this.props.currentPhoto || (this.props.photos && this.props.photos[0])
    var currentPhotoIndex = -1;
    let photos = (!this.props.photos  &&  currentPhoto) ? [currentPhoto] : this.props.photos
    for (var i=0; i<photos.length; i++) {
      var photo = photos[i];

      if (currentPhotoIndex === -1  &&  photo.url === currentPhoto.url)
        currentPhotoIndex = i;
      photoUrls.push(photo.url)
    }
    return (
      <Gallery
        style={{flex: 1, backgroundColor: 'black'}}
        images={photoUrls}
        initialPage={currentPhotoIndex}
      />
    );
  }
}
// PhotoCarousel = makeResponsive(PhotoCarousel)
module.exports = PhotoCarousel;
