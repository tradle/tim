'use strict';

var PhotoCarousel = require('./PhotoCarousel');
import {
  Navigator
} from 'react-native'
var PhotoCarouselMixin = {
  showCarousel(currentPhoto) {
    this.props.navigator.push({
      id: 14,
      // title: 'Photos',
      noLeftButton: true,
      component: PhotoCarousel,
      passProps: {
        currentPhoto: currentPhoto,
        photos: this.props.resource.photos,
        resource: this.props.resource
      },
      rightButtonTitle: 'Done',
      titleTintColor: 'black',
      sceneConfig: Navigator.SceneConfigs.FadeAndroid,
      tintColor: '#dddddd',
      onRightButtonPress: {
        stateChange: this.closeCarousel.bind(this)
      }
    })
  },
  closeCarousel() {
    this.props.navigator.pop();
  }

}
module.exports = PhotoCarouselMixin;
