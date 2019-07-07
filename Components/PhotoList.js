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
    let { photos, isView, style } = this.props
    if (!photos ||  !photos.length) // || (photos.length === 1  &&  this.props.isView))
      return null;
    // if (this.props.isView  &&  photos.length === 1  &&  Platform.OS !== 'web')
    //   return null
    let val = this.renderPhotoList(photos);
    let addStyle = style && {}  ||  {marginHorizontal: 5}
    if (isView)
      addStyle.marginTop = -7
    return (
       <View style={[styles.photoContainer, addStyle]} key={this.getNextKey() + '_photo'}>
         {val}
       </View>
     );
  }
  renderPhotoList(photos) {
    let imageStyle = this.props.style;
    let len = photos.length
    if (!imageStyle  ||  !imageStyle.width)
      imageStyle = this.getPhotoStyle(photos)
    let width = utils.dimensions(PhotoList).width
    let w = imageStyle.width
    let inRow = this.props.numberInRow || Math.floor(width / w)
    let rows = []
    for (let i=0; i<len; ) {
      let cols = []
      for (let j = 0; j<inRow  &&  i < len; j++, i++)
        cols.push(this.renderCol(photos[i], imageStyle))

      rows.push(<Row  size={inRow} key={this.getNextKey()}>{cols}</Row>)
    }
    return <View>{rows}</View>
  }
  getPhotoStyle(photos) {
    let len = photos.length

    let width = utils.dimensions().width
    let d1 = Math.floor(width / 3) * 2
    d1 = Math.min(d1, 240)
    let d3 = Math.floor((width / 3) - 6)
    let d4 = Math.floor((width / 4) - 5)
    let d5 = Math.floor((width / 5) - 5)
    // return  {width: d5, height: d5};
    switch (len) {
    case 1:
      return {width: d1, height: d1 / 1.5};
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
  renderCol(photo, imageStyle)  {
    let uri = photo.url
    if (!uri)
      return
    let { isView, callback } = this.props
    let source = {uri: uri};
    let isDataUrl = utils.isImageDataURL(photo.url)
    let isPng = isDataUrl  &&  photo.url.indexOf('data:image/png;') === 0
    if (isDataUrl  ||  uri.charAt(0) == '/')
      source.isStatic = true;
    let item = <Image resizeMode='cover' style={[styles.thumbCommon, imageStyle, {backgroundColor: isPng && '#ffffff' || 'transparent'}]} source={source} />

    return (
      <Col size={1}  key={this.getNextKey() + '_photo'}>
        <Animated.View style={[{margin: 1, transform: [{scale: this.state.anim}]}, imageStyle]}>
          <TouchableHighlight underlayColor='transparent' onPress={callback ? callback.bind(this, photo) : this.showCarousel.bind(this, {photo, isView})}>
             {item}
          </TouchableHighlight>
        </Animated.View>
      </Col>
    )
  }

}
reactMixin(PhotoList.prototype, PhotoCarouselMixin);
reactMixin(PhotoList.prototype, RowMixin);
PhotoList = makeResponsive(PhotoList)

var styles = StyleSheet.create({
  photoContainer: {
    paddingTop: 9,
    paddingBottom: 4
  },
  thumbCommon: {
    borderWidth: .5,
    borderRadius: 10,
    margin: 1,
    borderColor: '#999999'
  }
})

module.exports = PhotoList;
  // renderPhotoList(val, styles) {
  //   var dataSource = this.state.dataSource.cloneWithRows(
  //     groupByEveryN(val, this.props.numberInRow || 3)
  //   );
  //   return (
  //     <View style={styles.row}>
  //        <ListView
  //           scrollEnabled = {true}
  //           removeClippedSubviews={false}
  //           enableEmptySections={true}
  //           style={{overflow: 'visible'}}
  //           renderRow={this.renderRow.bind(this, styles)}
  //           dataSource={dataSource} />
  //     </View>
  //   );
  // }

  // renderRow(styles, photos)  {
  //   var len = photos.length;
  //   var imageStyle = this.props.style;
  //   if (!imageStyle) {
  //     switch (len) {
  //       case 1:
  //       case 2:
  //       case 3:
  //         imageStyle = [styles.thumb3];
  //         break;
  //       case 4:
  //         imageStyle = [styles.thumb4];
  //         break;
  //       default:
  //       case 5:
  //         imageStyle = [styles.thumb5];
  //         break;
  //      }
  //    }
  //    var photos = photos.map((photo) => {
  //     if (photo === null)
  //       return null;
  //     // var title = !photo.title || photo.title === 'photo'
  //     //           ? <View />
  //     //           : <Text style={styles.photoTitle}>{photo.title}</Text>

  //     // return (
  //     // <Animated.Image                         // Base: Image, Text, View
  //     //   source={{uri: utils.getImageUri(photo.url)}}
  //     //   style={{
  //     //     flex: 1,
  //     //     transform: [                        // `transform` is an ordered array
  //     //       {scale: this.state.bounceValue},  // Map `bounceValue` to `scale`
  //     //     ]
  //     //   }}
  //     // />);
  //     // var uri = utils.getImageUri(photo.url)
  //     var uri = photo.url
  //     if (!uri)
  //       return <View />
  //     var source = {uri: uri};
  //     if (uri.indexOf('data') === 0  ||  uri.charAt(0) == '/')
  //       source.isStatic = true;

  //     return (
  //       <View style={[{paddingTop: 2, margin: 1, flexDirection: 'column'}, imageStyle[0]]} key={this.getNextKey() + '_photo'}>
  //         <TouchableHighlight underlayColor='transparent' onPress={this.props.callback ? this.props.callback.bind(this, photo) : this.showCarousel.bind(this, photo)}>
  //            <Image resizeMode='cover' style={[styles.thumbCommon, imageStyle]} source={source} />
  //         </TouchableHighlight>
  //       </View>
  //     );
  //   });

  //   return (
  //     <View style={styles.row}>
  //       {photos}
  //     </View>
  //   );
  // }
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
