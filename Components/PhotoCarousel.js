'use strict'

// import { makeResponsive } from 'react-native-orient'
import Gallery from 'react-native-gallery'

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
    var photoUrls = [];
    var currentPhoto = this.props.currentPhoto || this.props.photos[0];
    var currentPhotoIndex = -1;

    for (var i=0; i<this.props.photos.length; i++) {
      var photo = this.props.photos[i];

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
