'use strict'

var React = require('react-native');
var Carousel = require('react-native-carousel');

var {
  StyleSheet,
  Component,
  Image,
  View,
} = React;

class PhotoCarousel extends Component {
  constructor(props) {
    super(props);    
  }
  render() {
    var photos = [];
    var currentPhoto = this.props.currentPhoto || this.props.photos[0];
    var currentPhotoIndex = -1;
    var n = this.props.photos.length;
    for (var j=0; j<2; j++) {
      for (var i=0; i<n; i++) {
        var photo = this.props.photos[i];

        if (currentPhotoIndex == -1  &&  photo.url !== currentPhoto.url)
          continue;
        if (currentPhotoIndex == -1)
          currentPhotoIndex = i;
        photos.push(
          <View style={styles.container}>
            <Image source={{uri: photo.url}} style={styles.image}/>
          </View>
        )
      }
      n = currentPhotoIndex;
    }
    return (
      <Carousel width={375}>
        {photos}
      </Carousel>
    );
  }
}

var styles = StyleSheet.create({
  image: {
    width: 375,
    height: 400
  },
  container: {
    width: 375,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
module.exports = PhotoCarousel;