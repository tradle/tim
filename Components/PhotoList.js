console.log('requiring PhotoList.js')
'use strict';

import utils from '../utils/utils'
import constants from '@tradle/constants'
import reactMixin from 'react-mixin'
import PhotoCarouselMixin from './PhotoCarouselMixin'
import RowMixin from './RowMixin'
import equal from 'deep-equal'
var cnt = 1000
import {
  StyleSheet,
  Image,
  View,
  ListView,
  Text,
  Animated,
  Easing,
  Platform,
  TextInput,
  TouchableHighlight,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
// const MIN_WIDTH = 140
export const MIN_WIDTH = 140

// import Animated from 'Animated'
class PhotoList extends Component {
  static displayName = 'PhotoList'
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2
    });
    this.state = {
      photos: this.props.photos,
      anim: new Animated.Value(0.7),
      // bounceValue: new Animated.Value(0),
      dataSource: dataSource
    }
  }

  componentDidMount() {
    Animated.timing(      // Uses easing functions
      this.state.anim,    // The value to drive
      {toValue: 1,
      duration: 500}        // Configuration
    ).start();
  }
  // componentDidMount() {
  //  // this.state.bounceValue.setValue(1.5);     // Start large
  //   Animated.spring(                          // Base: spring, decay, timing
  //     this.state.bounceValue,                 // Animate `bounceValue`
  //     {
  //       toValue: 0.8,                         // Animate to smaller size
  //       friction: 1,                          // Bouncier spring
  //     }
  //   ).start();                                // Start the animation

  // }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.resource[constants.ROOT_HASH] !== nextProps.resource[constants.ROOT_HASH])
      return true

    return nextProps.forceUpdate  ||  !equal(this.props.resource.photos, nextProps.resource.photos)  ||
           !equal(this.props.photos, nextProps.photos)
  }
  render() {
    var photos = this.props.photos;
    if (!photos ||  !photos.length) // || (photos.length === 1  &&  this.props.isView))
      return null;

    var val = this.renderPhotoList(photos);
    return (
       <View style={[styles.photoContainer, this.props.style ? {} : {marginHorizontal: 5}]} key={this.getNextKey()}>
         {val}
       </View>
     );
  }
  renderPhotoList(photos) {
    var imageStyle = this.props.style;
    var len = photos.length
    if (!imageStyle  ||  utils.isEmpty(imageStyle))
      imageStyle = this.getPhotoStyle(photos)

    let inRow = this.props.numberInRow || Math.floor(utils.dimensions(PhotoList).width / imageStyle.width) - 1 // 2 is padding
    let rows = []
    for (var i=0; i<len; i++) {
      let row = []
      for (let j = 0; j<inRow  &&  i < len; j++, i++)
        row.push(this.renderRow(photos[i], imageStyle))

      rows.push(<View style={{flexDirection: 'row'}} key={this.getNextKey()}>
                  {row}
                </View>)
      i--
    }
    return (
      <View style={{flexDirection: 'column', alignSelf: 'center'}}>
        {rows}
      </View>
    );
  }
  renderRow(photo, imageStyle)  {
    var uri = photo.url
    if (!uri)
      return
    var source = {uri: uri};
    if (uri.indexOf('data') === 0  ||  uri.charAt(0) == '/')
      source.isStatic = true;

    return (
      <View style={[{margin: 1}, imageStyle]} key={this.getNextKey()}>
        <TouchableHighlight underlayColor='transparent' onPress={this.props.callback ? this.props.callback.bind(this, photo) : this.showCarousel.bind(this, photo)}>
           <Image resizeMode='cover' style={[styles.thumbCommon, imageStyle]} source={source} />
        </TouchableHighlight>
      </View>
    )
  }

  getPhotoStyle(photos) {
    var width = utils.dimensions(PhotoList).width
    var d3 = Math.min((width / 3) - 5, 240)
    var d4 = Math.min((width / 4) - 5, 190)
    var d5 = Math.min((width / 5) - 5, MIN_WIDTH)
    switch (photos.length) {
    case 1:
    case 2:
    case 3:
      return {width: d3, height: d3};
    case 4:
      return {width: d4, height: d4};
    default:
    case 5:
      return {width: d5, height: d5};
    }
  }
}
reactMixin(PhotoList.prototype, PhotoCarouselMixin);
reactMixin(PhotoList.prototype, RowMixin);

var styles = StyleSheet.create({
  photoContainer: {
    paddingTop: 5,
  },
  thumbCommon: {
    borderWidth: 0.5,
    margin: 1,
    borderColor: '#999999'
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
})

module.exports = PhotoList;
