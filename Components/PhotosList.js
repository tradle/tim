'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var groupByEveryN = require('groupByEveryN');
var PhotoCarousel = require('./PhotoCarousel');

var {
  StyleSheet,
  Image, 
  View,
  ListView,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class PhotosList extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      photos: this.props.photos,
      dataSource: dataSource
    }
  }
  render() { 
    var photos = this.props.photos;
    if (!photos) //  ||  photos.length <= 1)
      return null;

    var val = this.renderPhotoList(photos);        
    return (
       <View style={[styles.photoContainer, this.props.style ? {} : {marginHorizontal: 5}]}>
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
          imageStyle = styles.thumb3;
          break;
        case 4:  
          imageStyle = styles.thumb4;
          break;
        default:
        case 5:
          imageStyle = styles.thumb5;
          break;      
       }
     }
     var photos = photos.map((photo) => {
      if (photo === null) 
        return null;
      var title = !photo.title || photo.title === 'photo'
                ? <View />
                : <Text style={styles.photoTitle}>{photo.title}</Text>
      return (
        <View style={{paddingTop: 2, paddingRight: 1, flexDirection: 'column'}}>
          <TouchableHighlight underlayColor='transparent' onPress={this.showCarousel.bind(this, photo)}>
            <View>
             <Image style={[imageStyle, styles.thumbCommon]} source={{uri: utils.getImageUri(photo.url)}} />
            {title}
            </View>
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
  showCarousel(currentPhoto) {
    this.props.navigator.push({
      id: 14,
      title: 'Photos',
      noLeftButton: true,
      component: PhotoCarousel,
      passProps: {
        currentPhoto: currentPhoto,
        photos: this.props.photos
      },
      rightButtonTitle: 'Done',
      titleTintColor: 'black',
      tintColor: '#dddddd',
      onRightButtonPress: {
        stateChange: this.closeCarousel.bind(this)
      }
    })
  }
  closeCarousel() {
    this.props.navigator.pop();
  }

}
var styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    paddingTop: 5,
    alignSelf: 'center'
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
    marginHorizontal: 1,
    borderColor: 'transparent'
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
});

module.exports = PhotosList;