import React, { Component } from 'react'
import PropTypes from 'prop-types'
import reactMixin from 'react-mixin'
import _ from 'lodash'
import {Column as Col, Row} from 'react-native-flexbox-grid'
import { makeResponsive } from 'react-native-orient'
import { TYPE, ROOT_HASH } from '@tradle/constants'
import utils from '../utils/utils'
import PhotoCarouselMixin from './PhotoCarouselMixin'
import RowMixin from './RowMixin'
import {
  StyleSheet,
  View,
  ListView,
  Animated,
  TouchableHighlight,
} from 'react-native'

import Image from './Image'

const MIN_WIDTH = 140
const PHOTO = 'tradle.Photo'

// import Animated from 'Animated'
class PhotoList extends Component {
  static displayName = 'PhotoList'
  constructor(props) {
    super(props);
    let dataSource = new ListView.DataSource({
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
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.resource[ROOT_HASH] !== nextProps.resource[ROOT_HASH])
      return true

    return nextProps.forceUpdate  ||  !_.isEqual(this.props.resource.photos, nextProps.resource.photos)  ||
           !_.isEqual(this.props.photos, nextProps.photos)
  }
  render() {
    let photos = this.props.photos;
    if (!photos ||  !photos.length) // || (photos.length === 1  &&  this.props.isView))
      return null;

    let val = this.renderPhotoList(photos);
    return (
       <View style={this.props.style ? {} : {marginHorizontal: 5}} key={this.getNextKey()}>
         {val}
       </View>
     );
  }

  renderPhotoList(photos) {
    let imageStyle = this.props.style;
    let len = photos.length
    if (!imageStyle  ||  !imageStyle.width)
      imageStyle = this.getPhotoStyle(photos)

    let inRow = this.props.numberInRow || Math.floor(utils.getContentWidth(PhotoList) / imageStyle.width) //- 1 // 2 is padding
    let rows = []
    for (let i=0; i<len; i++) {
      let cols = []
      for (let j = 0; j<inRow  &&  i < len; j++, i++)
        cols.push(this.renderCol(photos[i], imageStyle))
      rows.push(<Row  size={inRow} key={this.getNextKey()}>{cols}</Row>)
      i--
    }
    return <View style={styles.center}>{rows}</View>
  }
  renderCol(photo, imageStyle)  {
    let uri = photo.url
    if (!uri)
      return
    let { isView, callback } = this.props
    let onPress
    if (callback)
      onPress = callback.bind(this, photo)
    else {
      if (photo.url.indexOf(':application/pdf') !== -1)
        return <View/>
      onPress = this.showCarousel.bind(this, {photo, isView})
    }

    let isDataUrl = utils.isImageDataURL(photo.url)
    let isPng = isDataUrl  &&  photo.url.indexOf('data:image/png;') === 0
    let source = {uri: uri};
    if (isDataUrl  ||  uri.charAt(0) == '/')
      source.isStatic = true;
    let item = <Image resizeMode='cover' style={[styles.thumbCommon, imageStyle, {backgroundColor: isPng && '#ffffff' || 'transparent'}]} source={source} />
    return (
      <Col size={1}  key={this.getNextKey() + '_photo'}>
        <Animated.View style={[{margin: 1, transform: [{scale: this.state.anim}]}, imageStyle]}>
          <TouchableHighlight underlayColor='transparent' onPress={onPress}>
             {item}
          </TouchableHighlight>
        </Animated.View>
      </Col>
    )
  }
  getPhotoStyle(photos) {
    let width = utils.getContentWidth(PhotoList)
    let d3 = Math.min((width / 3) - 5, 240)
    let d4 = Math.min((width / 4) - 5, 190)
    let d5 = Math.min((width / 5) - 5, MIN_WIDTH)
    // return {width: d5, height: d5};
    // switch (photos.length) {
    // case 1:
    // case 2:
    // case 3:
    //   return {width: d3, height: d3};
    // case 4:
    //   return {width: d4, height: d4};
    // default:
    // case 5:
      return {width: d5, height: d5};
    // }
  }
}
reactMixin(PhotoList.prototype, PhotoCarouselMixin);
reactMixin(PhotoList.prototype, RowMixin);
PhotoList = makeResponsive(PhotoList)

var styles = StyleSheet.create({
  thumbCommon: {
    borderWidth: .5,
    borderRadius: 10,
    margin: 1,
    borderColor: '#999999'
  },
  row: {
    flexDirection: 'row'
  },
  center: {
    alignSelf: 'center'
  }
})

module.exports = PhotoList;
