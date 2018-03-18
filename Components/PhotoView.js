console.log('requiring PhotoView.js')
'use strict';

import utils from '../utils/utils'
import Icon from 'react-native-vector-icons/Ionicons';
import constants from '@tradle/constants'
import reactMixin from 'react-mixin'
import PhotoCarouselMixin from './PhotoCarouselMixin'

import Gallery from 'react-native-gallery'

import equal from 'deep-equal'
import {
  StyleSheet,
  Image,
  View,
  Text,
  Modal,
  Animated,
  Easing,
  TouchableHighlight,
  ImageBackground
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import * as Animatable from 'react-native-animatable'


class PhotoView extends Component {
  constructor(props) {
    super(props);
    this.state = {anim: new Animated.Value(1.5), isModalOpen: false};
  }
  componentDidMount() {
     Animated.timing(      // Uses easing functions
       this.state.anim,    // The value to drive
       {toValue: 1,
       duration: 500}        // Configuration
     ).start();
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.resource[constants.ROOT_HASH] !== nextProps.resource[constants.ROOT_HASH] ||
        this.state.isModalOpen !== nextState.isModalOpen)
      return true

    return !equal(this.props.resource.photos, nextProps.resource.photos)
  }
  render() {
    var resource = this.props.resource;
    if (!resource)
      return <View />;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName);
    if (!model.interfaces  &&  !model.isInterface  &&  !resource[constants.ROOT_HASH])
      return <View />

    var hasPhoto = resource.photos && resource.photos.length;
    var currentPhoto = this.state.currentPhoto || this.props.mainPhoto || (hasPhoto  &&  resource.photos[0]);
    if (!currentPhoto)
      return <View />

    var url = currentPhoto.url;
    // var nextPhoto = resource.photos && resource.photos.length == 1
    var uri = utils.getImageUri(url);
    var source = uri.charAt(0) == '/' || uri.indexOf('data') === 0
               ? {uri: uri, isStatic: true}
               : {uri: uri}
    var nextPhoto;
    var len = resource.photos  &&  resource.photos.length;
    for (var i=0; i<len  &&  !nextPhoto; i++) {
      var p = resource.photos[i].url;
      if (p === url)
        nextPhoto = i === len - 1 ? resource.photos[0] : resource.photos[i + 1];
    }
    let {width, height} = utils.dimensions(PhotoView)
    // let baseW = 0.8 * width
    // let baseH = 0.8 * height
    // let image = utils.isWeb()
    //           ? {
    //               width: Math.floor(width < height ? baseW : baseH),
    //               height: Math.floor(width < height ? baseH / 2 : baseW / 2),
    //             }
    //           : {
    //               width: width < height ? width : height,
    //               height: Math.floor(width < height ? height / 2 : width / 2),
    //             }

    let image = {
      width: utils.getContentWidth(PhotoView) + 2,
      height: Math.floor(height / 2.5),
      // alignSelf: 'stretch'
    }
            // <TouchableHighlight underlayColor='transparent' onPress={this.showCarousel.bind(this, currentPhoto, true)}>
    // let style={transform: [{scale: this.state.anim}]}
 // onPress={() => {
 //              Animated.spring(this.state.anim, {
 //                toValue: 0,   // Returns to the start
 //                velocity: 3,  // Velocity makes it move
 //                tension: 1, // Slow
 //                friction: 100,  // Oscillate a lot
 //              }).start();
 //              this.shwCarousel(resource.photos[0])
 //          }}
    let photoView
    let coverPhoto = utils.getPropertiesWithAnnotation(model, 'coverPhoto')
    coverPhoto = coverPhoto  &&  resource[Object.keys(coverPhoto)[0]]
    if (coverPhoto) {
      // let cpHeight = coverPhoto.height * width / coverPhoto.width

      let coverPhotoUri = coverPhoto.url
      var coverPhotoSource = { uri: coverPhotoUri, cache: 'force-cache' }
      if (coverPhotoUri.charAt(0) == '/' || coverPhotoUri.indexOf('data') === 0)
        coverPhotoSource.isStatic = true
      // else if (coverPhotoUri.indexOf('..') === 0)
      //   coverPhotoSource = require(coverPhotoUri)

      var title = utils.getDisplayName(this.props.resource)
              // <Image resizeMode='cover' source={coverPhotoSource} style={{width: width, height: cpHeight}}>

      let fontSize = title.length < 15 ? 30 : 24
      photoView = (
        <ImageBackground resizeMode='cover' source={coverPhotoSource} style={image}>
          <View style={{height: 50, backgroundColor: '#000000', alignSelf: 'stretch', opacity: 0.2, position: 'absolute', left: 0, bottom: 0, width: width}} />
          <Image resizeMode='cover' source={source} style={{width: 80, height: 80, /*borderWidth: 2, borderColor: '#ffffff',*/ position: 'absolute', left: 10, bottom: 10}} />
          <Text style={{fontSize: fontSize, color: '#ffffff', position: 'absolute', left: 100, bottom: 10}}>{title}</Text>
        </ImageBackground>
      )
    }
    else
      photoView = <Image resizeMode='contain' source={source} style={image} />

    return (
          <View>
            <TouchableHighlight underlayColor='transparent' onPress={this.showCarousel.bind(this, this.props.mainPhoto || resource.photos[0], true)}>
              {photoView}
            </TouchableHighlight>
          </View>
    )
            // {this.props.children}
    // return (
    //       <Animated.View style={style}>
    //         <TouchableHighlight underlayColor='transparent' onPress={this.openModal.bind(this)}>
    //           <Image resizeMode='cover' source={source} style={image} />
    //         </TouchableHighlight>
    //     <Modal style={{width: width, height: height}} animationType={'fade'} visible={this.state.isModalOpen} transparent={true} onRequestClose={() => this.closeModal()}>
    //       <TouchableHighlight  onPress={() => this.closeModal()} underlayColor='transparent'>
    //         <View style={styles.modalBackgroundStyle}>
    //           {this.shwCarousel(resource.photos[0])}
    //         </View>
    //       </TouchableHighlight>
    //     </Modal>
    //       </Animated.View>
    // )
  }
  /*
  shwCarousel(currentPhoto) {
    var photoUrls = [];
    // var currentPhoto = this.props.currentPhoto || this.props.photos[0];
    var currentPhotoIndex = -1;

    for (var i=0; i<this.props.resource.photos.length; i++) {
      var photo = this.props.resource.photos[i];

      if (currentPhotoIndex === -1  &&  photo.url === currentPhoto.url)
        currentPhotoIndex = i;
      photoUrls.push(photo.url)
    }
    return (
      <Gallery
        style={{flex: 1}}
        images={photoUrls}
        initialPage={currentPhotoIndex}
      />
    );

  }
  */
  openModal() {
    this.setState({isModalOpen: true});
  }
  closeModal() {
    this.setState({isModalOpen: false});
  }

}
reactMixin(PhotoView.prototype, PhotoCarouselMixin);

var styles = StyleSheet.create({
  photoBG: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignSelf: 'stretch'
  },
  modalBackgroundStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    // padding: 20,
  },
});

module.exports = PhotoView;
