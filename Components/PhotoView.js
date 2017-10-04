'use strict';

var utils = require('../utils/utils');
import Icon from 'react-native-vector-icons/Ionicons';
var constants = require('../utils/constants');
var reactMixin = require('react-mixin');
var PhotoCarouselMixin = require('./PhotoCarouselMixin');

import Gallery from 'react-native-gallery'

var equal = require('deep-equal')
import {
  StyleSheet,
  Image,
  View,
  Text,
  Modal,
  Animated,
  Easing,
  TouchableHighlight
} from 'react-native'

import React, { Component } from 'react'
import * as Animatable from 'react-native-animatable'


class PhotoView extends Component {
  constructor(props) {
    super(props);
    // this.state = {}
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
    var model = utils.getModel(modelName).value;
    if (!model.interfaces  &&  !model.isInterface  &&  !resource[constants.ROOT_HASH])
      return <View />

    var hasPhoto = resource.photos && resource.photos.length;
    var currentPhoto = this.state.currentPhoto || this.props.mainPhoto || (hasPhoto  &&  resource.photos[0]);
    if (!currentPhoto)
      return <View />

    let coverPhoto = utils.getPropertiesWithAnnotation(model, 'coverPhoto')
    coverPhoto = coverPhoto  &&  resource[Object.keys(coverPhoto)[0]]

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
    let image = {
      width: width < height ? width : height,
      height: Math.round(width < height ? height / 4 : width / 2),
      // alignSelf: 'stretch'
    }
    let style={transform: [{scale: this.state.anim}]}
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
    if (coverPhoto) {
      let coverPhotoUri = coverPhoto.url
      var coverPhotoSource = coverPhotoUri.charAt(0) == '/' || coverPhotoUri.indexOf('data') === 0
               ? {uri: coverPhotoUri, isStatic: true}
               : {uri: coverPhotoUri}
      var title = utils.getDisplayName(this.props.resource)
      let fontSize = title.length < 15 ? 30 : 24
      photoView = (
        <Image resizeMode='cover' source={coverPhotoSource} style={image}>
          <View style={{height: 50, backgroundColor: '#000000', alignSelf: 'stretch', opacity: 0.2, position: 'absolute', left: 0, bottom: 0, width: width}} />
          <Image source={source} style={{width: 80, height: 80, /*borderWidth: 2, borderColor: '#ffffff',*/ position: 'absolute', left: 10, bottom: 10}} />
          <Text style={{fontSize: fontSize, fontWeight: '600', color: '#ffffff', position: 'absolute', left: 100, bottom: 10}}>{title}</Text>
        </Image>
      )
    }
    else
      photoView = <Image resizeMode='cover' source={source} style={image} />

    return (
          <Animated.View style={style}>
            <TouchableHighlight underlayColor='transparent' onPress={this.showCarousel.bind(this, this.props.mainPhoto || resource.photos[0], true)}>
              {photoView}
            </TouchableHighlight>
          </Animated.View>
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
