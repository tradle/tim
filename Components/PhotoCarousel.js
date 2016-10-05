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
    var n = this.props.photos.length;

    var r = this.props.resource
    for (var j=0; j<2; j++) {
      for (var i=0; i<n; i++) {
        var photo = this.props.photos[i];

        if (currentPhotoIndex == -1  &&  photo.url !== currentPhoto.url)
          continue;
        photoUrls.push(photo.url)

        if (currentPhotoIndex == -1)
          currentPhotoIndex = i;
      }
      n = currentPhotoIndex
    }
    return (
      <Gallery
        style={{flex: 1, backgroundColor: 'black'}}
        images={photoUrls}
      />
    );
  }
}
// PhotoCarousel = makeResponsive(PhotoCarousel)
module.exports = PhotoCarousel;
