'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');

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
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;

    var hasPhoto = resource.photos && resource.photos.length; 
    var currentPhoto = this.state.currentPhoto || (hasPhoto  &&  resource.photos[0]);

    if (!currentPhoto)
      return <View/>;

    var url = currentPhoto.url;
    var nextPhoto = resource.photos.length == 1
    if (resource.photos.length == 1)
      return <Image source={{uri: (url.indexOf('http') === 0 ? url : 'http://' + url)}} style={styles.image} />; 
    else {           
      var nextPhoto;
      var len = resource.photos.length;
      for (var i=0; i<len  &&  !nextPhoto; i++) {
        var p = resource.photos[i].url;
        if (p === url)
          nextPhoto = i === len - 1 ? resource.photos[0] : resource.photos[i + 1];
      }
      return <TouchableHighlight underlayColor='#ffffff' onPress={this.changePhoto.bind(this, nextPhoto)}>
                <Image source={{uri: (url.indexOf('http') == 0 ? url : 'http://' + url)}} style={styles.image} />
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
});

module.exports = PhotoView;