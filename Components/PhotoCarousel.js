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
    for (var photo of this.props.photos) {
      photos.push(
        <View style={styles.container}>
          <Image source={{uri: photo.url}} style={styles.image}/>
        </View>
      )
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