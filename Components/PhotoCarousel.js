'use strict'

var React = require('react-native');
var Carousel = require('react-native-carousel');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');

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

    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var isVertical = currentPhoto.isVertical
    var isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;
    var isUtility = !isLicense  &&  model.id.indexOf('Utility') !== -1
    var cnt = 2000
    var r = this.props.resource
    for (var j=0; j<2; j++) {
      for (var i=0; i<n; i++) {
        var photo = this.props.photos[i];

        if (currentPhotoIndex == -1  &&  photo.url !== currentPhoto.url)
          continue;
        if (currentPhotoIndex == -1)
          currentPhotoIndex = i;
        var key = r[constants.ROOT_HASH] + cnt++
        photos.push(
          isVertical  ? <View style={styles.container} key={key}>
                          <Image source={{uri: photo.url}} style={styles.imageV}/>
                        </View>

                      : (isLicense
                         ? <View style={styles.container} key={key}>
                              <Image source={{uri: photo.url}} style={styles.imageH}/>
                            </View>
                         : <View style={styles.container} key={key}>
                              <Image source={{uri: photo.url}} style={styles.image}/>
                            </View>
                      )
        )
        // photos.push(
        //   isLicense ? <View style={styles.container}>
        //                <Image source={{uri: photo.url}} style={styles.imageH}/>
        //               </View>
        //             : (isUtility
        //               ? <View style={styles.container}>
        //                   <Image source={{uri: photo.url}} style={styles.imageV}/>
        //                 </View>

        //               : <View style={styles.container}>
        //                   <Image source={{uri: photo.url}} style={styles.image}/>
        //                 </View>
        //               )
        // )
      }
      n = currentPhotoIndex
    }
    return (
      <Carousel width={375} loop={false} animate={false}>
        {photos}
      </Carousel>
    );
  }
}

var styles = StyleSheet.create({
  image: {
    width: 375,
    height: 400,
  },
  imageH: {
    width: 375,
    height: 250
  },
  imageV: {
    width: 375,
    height: 450
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
