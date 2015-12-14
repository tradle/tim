'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var groupByEveryN = require('groupByEveryN');
var PhotoCarousel = require('./PhotoCarousel');
var constants = require('@tradle/constants');
var reactMixin = require('react-mixin');
var PhotoCarouselMixin = require('./PhotoCarouselMixin');
var RowMixin = require('./RowMixin')
var cnt = 1000
var {
  StyleSheet,
  Image,
  View,
  ListView,
  Text,
  // Animated,
  TextInput,
  TouchableHighlight,
  Component
} = React;
// var Animated = require('Animated');
class PhotoList extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      photos: this.props.photos,
      // bounceValue: new Animated.Value(0),
      dataSource: dataSource
    }
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
  render() {
    var photos = this.props.photos;
    if (!photos || !photos.length  ||  (photos.length <= 1  &&  this.props.isView))
      return null;

    var inRow = photos.length, height;

    switch (photos.length) {
      case 1:
      case 2:
      case 3:
        height = 150;
        break;
      case 4:
        height = 120;
        break;
      default:
      case 5:
        height = 100;
        inRow = 5;
        break;
    }
    var rows = photos.length / inRow;
    if (photos.length % inRow)
      rows++;
    height *= rows;
    var val = this.renderPhotoList(photos);
    return (
       <View style={[styles.photoContainer, this.props.style ? {} : {marginHorizontal: 5, marginTop: -20, height: height}]} key={this.getNextKey() + '_photo'}>
         {val}
       </View>
     );
  }

  renderPhotoList(val) {
    var dataSource = this.state.dataSource.cloneWithRows(
      groupByEveryN(val, this.props.numberInRow || 3)
    );
    return (
      <View style={styles.row}>
         <ListView
            scrollEnabled = {false}
            renderRow={this.renderRow.bind(this)}
            dataSource={dataSource} />
      </View>
    );
  }

  renderRow(photos)  {
    var len = photos.length;
    var imageStyle = this.props.style;
    if (!imageStyle) {
      switch (len) {
        case 1:
        case 2:
        case 3:
          imageStyle = [styles.thumb3];
          break;
        case 4:
          imageStyle = [styles.thumb4];
          break;
        default:
        case 5:
          imageStyle = [styles.thumb5];
          break;
       }
     }
     var photos = photos.map((photo) => {
      if (photo === null)
        return null;
      // var title = !photo.title || photo.title === 'photo'
      //           ? <View />
      //           : <Text style={styles.photoTitle}>{photo.title}</Text>

      // return (
      // <Animated.Image                         // Base: Image, Text, View
      //   source={{uri: utils.getImageUri(photo.url)}}
      //   style={{
      //     flex: 1,
      //     transform: [                        // `transform` is an ordered array
      //       {scale: this.state.bounceValue},  // Map `bounceValue` to `scale`
      //     ]
      //   }}
      // />);
      // var uri = utils.getImageUri(photo.url)
      var uri = photo.url
      if (!uri)
        return <View />
      var source = {uri: uri};
      if (uri.indexOf('data') === 0  ||  uri.charAt(0) == '/')
        source.isStatic = true;

      return (
        <View style={[{paddingTop: 2, margin: 1, flexDirection: 'column'}, imageStyle[0]]} key={this.getNextKey() + '_photo'}>
          <TouchableHighlight underlayColor='transparent' onPress={this.showCarousel.bind(this, photo)}>
             <Image style={[styles.thumbCommon, imageStyle]} source={source} />
          </TouchableHighlight>
        </View>
      );
    });

    return (
      <View style={styles.row}>
        {photos}
      </View>
    );
  }
}
reactMixin(PhotoList.prototype, PhotoCarouselMixin);
reactMixin(PhotoList.prototype, RowMixin);

var styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    paddingTop: 5,
    alignSelf: 'center',
  },
  photoTitle: {
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 5,
    color: '#656565',
  },
  thumb3: {
    width: 120,
    height: 120,
  },
  thumb4: {
    width: 90,
    height: 90,
  },
  thumb5: {
    width: 70,
    height: 70,
  },
  thumbCommon: {
    borderRadius: 5,
    borderWidth: 1,
    margin: 1,
    borderColor: 'transparent'
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },

});

module.exports = PhotoList;
