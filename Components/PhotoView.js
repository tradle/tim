'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('@tradle/constants');
var PhotoCarousel = require('./PhotoCarousel')
var reactMixin = require('react-mixin');
var PhotoCarouselMixin = require('./PhotoCarouselMixin');
var Device = require('react-native-device')
var {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableHighlight,
  Component
} = React;

class PhotoView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
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
    var currentPhoto = this.state.currentPhoto || (hasPhoto  &&  resource.photos[0]);
    if (!currentPhoto) {
      var icon;
      if (model.id === constants.TYPES.IDENTITY)
        return <Icon name={'person'} size={200}  color='#f6f6f4'  style={styles.icon} />

        // icon = 'ion|person';
      else
        return <View />
        // return <View style={{height: 50}} />
        // icon = 'ion|chatboxes'
      // return <Icon name={icon} size={200}  color='#f6f6f4'  style={styles.icon} />
    }

    var url = currentPhoto.url;
    var nextPhoto = resource.photos.length == 1
    var uri = utils.getImageUri(url);
    var source = uri.charAt(0) == '/' || uri.indexOf('data') === 0
               ? {uri: uri, isStatic: true}
               : {uri: uri}
    // var style = (currentPhoto.width)
    //           ? [styles.image, {height: currentPhoto.height * (currentPhoto.width/400)}]
    //           : styles.image
    if (resource.photos.length == 1)
      return <Image source={source} style={styles.image} />;
    else {
      var nextPhoto;
      var len = resource.photos.length;
      for (var i=0; i<len  &&  !nextPhoto; i++) {
        var p = resource.photos[i].url;
        if (p === url)
          nextPhoto = i === len - 1 ? resource.photos[0] : resource.photos[i + 1];
      }
      return <TouchableHighlight underlayColor='#ffffff' onPress={this.showCarousel.bind(this, resource.photos[0])}>
                <Image source={source} style={styles.image} />
              </TouchableHighlight>
    }
  }
}
reactMixin(PhotoView.prototype, PhotoCarouselMixin);

var styles = StyleSheet.create({
  image: {
    width: 400,
    height: 350,
    alignSelf: 'stretch'
  },
  icon: {
    // marginTop: 50,
    width: 200,
    height: 200,
    alignSelf: 'center'
  },
});

module.exports = PhotoView;
