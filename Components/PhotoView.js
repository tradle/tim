'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var Icon = require('react-native-icons');
var constants = require('tradle-constants');

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
    if (!resource  ||  !resource[constants.ROOT_HASH])
      return <View />;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;

    var hasPhoto = resource.photos && resource.photos.length; 
    var currentPhoto = this.state.currentPhoto || (hasPhoto  &&  resource.photos[0]);

    if (!currentPhoto) {
      var icon;
      if (model.id === constants.TYPES.IDENTITY)
        icon = 'ion|person';
      else
        icon = 'ion|chatboxes'
      return <Icon name={icon} size={200}  color='#f6f6f4'  style={styles.icon} />
    }

    var url = currentPhoto.url;
    var nextPhoto = resource.photos.length == 1
    var uri = utils.getImageUri(url);
    if (resource.photos.length == 1)
      return <Image source={{uri: uri}} style={styles.image} />; 
    else {           
      var nextPhoto;
      var len = resource.photos.length;
      for (var i=0; i<len  &&  !nextPhoto; i++) {
        var p = resource.photos[i].url;
        if (p === url)
          nextPhoto = i === len - 1 ? resource.photos[0] : resource.photos[i + 1];
      }
      return <TouchableHighlight underlayColor='#ffffff' onPress={this.changePhoto.bind(this, nextPhoto)}>
                <Image source={{uri: uri}} style={styles.image} />
              </TouchableHighlight>
    }
  }
}

var styles = StyleSheet.create({
  image: {
    width: 400,
    height: 350,
    alignSelf: 'stretch'
  },
  icon: {
    width: 300,
    height: 250,
    alignSelf: 'center'
  },
});

module.exports = PhotoView;