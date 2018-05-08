console.log('requiring PhotoList.js')
'use strict';

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'
import _ from 'lodash'
import utils from '../utils/utils'
import constants from '@tradle/constants'
import PhotoCarouselMixin from './PhotoCarouselMixin'
import RowMixin from './RowMixin'
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
const MIN_WIDTH = 140
const PHOTO = 'tradle.Photo'
const {
  ROOT_HASH,
  TYPE
} = constants

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
       <View style={[styles.photoContainer, this.props.style ? {} : {marginHorizontal: 5}]} key={this.getNextKey()}>
         {val}
       </View>
     );
  }
  renderPhotoList(photos) {
    let imageStyle = this.props.style;
    let len = photos.length
    if (!imageStyle  ||  utils.isEmpty(imageStyle))
      imageStyle = this.getPhotoStyle(photos)

    let inRow = this.props.numberInRow || Math.floor(utils.dimensions(PhotoList).width / imageStyle.width) - 1 // 2 is padding
    let rows = []

    // cols.push(<Col sm={colSize} md={1} lg={1} style={[styles.col, {justifyContent: 'center'}]} key={key + '_check'}>
    //             <View style={styles.multiChooser}>
    //              <TouchableOpacity underlayColor='transparent' onPress={this.chooseToShare.bind(this)}>
    //                <Icon name={this.state.isChosen ? 'ios-checkmark-circle-outline' : 'ios-radio-button-off'}  size={30}  color={bankStyle && bankStyle.linkColor  ||  '#7AAAC3'} />
    //              </TouchableOpacity>
    //            </View>
    //          </Col>)


    for (let i=0; i<len; i++) {
      let row = []
      for (let j = 0; j<inRow  &&  i < len; j++, i++)
        row.push(this.renderRow(photos[i], imageStyle))

      rows.push(<Row size={inRow} style={imageStyle} key={'row' + i} nowrap>
                  {row}
                </Row>)
      i--
    }
    return (
      <View style={{flexDirection: 'column', alignSelf: 'center'}}>
        {rows}
      </View>
    );
  }

  renderPhotoList1(photos) {
    let imageStyle = this.props.style;
    let len = photos.length
    if (!imageStyle  ||  utils.isEmpty(imageStyle))
      imageStyle = this.getPhotoStyle(photos)

    let inRow = this.props.numberInRow || Math.floor(utils.dimensions(PhotoList).width / imageStyle.width) - 1 // 2 is padding
    let rows = []
    for (let i=0; i<len; i++) {
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
    let uri = photo.url
    if (!uri)
      return
    let source = {uri: uri};
    if (uri.indexOf('data') === 0  ||  uri.charAt(0) == '/')
      source.isStatic = true;
    let item
    if (photo[TYPE]  &&  photo[TYPE] !== PHOTO) {
        item = <View style={[imageStyle, {alignItems: 'center'}]}>
                 <Icon name='ios-paper-outline' size={50} color='#cccccc'/>
                 <Text style={{fontSize: 10}}>{photo.name}</Text>
               </View>
    }
    else
      item = <Image resizeMode='cover' style={[styles.thumbCommon, imageStyle]} source={source} />
    return (
      <View style={[{margin: 1}, imageStyle]} key={this.getNextKey()}>
        <TouchableHighlight underlayColor='transparent' onPress={this.props.callback ? this.props.callback.bind(this, photo) : this.showCarousel.bind(this, photo)}>
           {item}
        </TouchableHighlight>
      </View>
    )
  }
  renderRow1(photo, imageStyle)  {
    let uri = photo.url
    if (!uri)
      return
    let source = {uri: uri};
    if (uri.indexOf('data') === 0  ||  uri.charAt(0) == '/')
      source.isStatic = true;
    let item
    if (photo[TYPE]  &&  photo[TYPE] !== PHOTO) {
        item = <View style={[imageStyle, {alignItems: 'center'}]}>
                 <Icon name='ios-paper-outline' size={50} color='#cccccc'/>
                 <Text style={{fontSize: 10}}>{photo.name}</Text>
               </View>
    }
    else
      item = <Image resizeMode='cover' style={[styles.thumbCommon, imageStyle]} source={source} />
    return (
      <View style={[{margin: 1}, imageStyle]} key={this.getNextKey()}>
        <TouchableHighlight underlayColor='transparent' onPress={this.props.callback ? this.props.callback.bind(this, photo) : this.showCarousel.bind(this, photo)}>
           {item}
        </TouchableHighlight>
      </View>
    )
  }

  getPhotoStyle(photos) {
    let width = utils.dimensions(PhotoList).width
    let d3 = Math.min((width / 3) - 5, 240)
    let d4 = Math.min((width / 4) - 5, 190)
    let d5 = Math.min((width / 5) - 5, MIN_WIDTH)
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
