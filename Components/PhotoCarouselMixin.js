'use strict';

var PhotoCarousel = require('./PhotoCarousel');
import {
  Navigator
} from 'react-native'
import utils from '../utils/utils'
var TYPE = require('@tradle/constants').TYPE

var PhotoCarouselMixin = {
  showCarousel(currentPhoto, isView) {
    // let backButtonTitle = isView
    //                     ? utils.translate('backTo', utils.getDisplayName(this.props.resource))
    //                     : this.props.chat
    //                        ? utils.translate('backTo', utils.getDisplayName(this.props.chat)) : utils.translate('backToResults')
    this.props.navigator.push({
      id: 14,
      title: utils.translate(utils.getModel(this.props.resource[TYPE]).value),
      // noLeftButton: true,
      backButtonTitle: 'Back',
      component: PhotoCarousel,
      passProps: {
        currentPhoto: currentPhoto,
        photos: this.props.mainPhoto ? [this.props.mainPhoto] : this.props.resource.photos,
        resource: this.props.resource
      },
      // rightButtonTitle: 'Done',
      // titleTintColor: 'black',
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
