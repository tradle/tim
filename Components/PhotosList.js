'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var groupByEveryN = require('groupByEveryN');

var {
  StyleSheet,
  Image, 
  View,
  ListView,
  LayoutAnimation,
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
      resource: this.props.resource,
      viewStyle: {margin: 3},
      dataSource: dataSource
    }
  }
  zoomPhoto(photo) {
    // LayoutAnimation.configureNext(
    //   LayoutAnimation.Presets.spring,
    //   () => {
    //     this.setState(
    //       {thumb: {width: 280}}
    //     );
    //   },
    //   (error) => { throw new Error(JSON.stringify(error)); }
    // );
    // this.setState({
    //   viewStyle: {
    //     margin: this.state.viewStyle.margin > 3 ? 3 : 10,
    //   }
    // });
  
    // this.setState({currentPhoto: photo});
  }
  // onViewLayout(e) {
  //   this.setState({viewLayout: e.nativeEvent.layout});
  // }
  // onTextLayout(e) {
  //   this.setState({textLayout: e.nativeEvent.layout});
  // }
  // onImageLayout(e) {
  //   this.setState({imageLayout: e.nativeEvent.layout});
  // }
  render() { 
    var resource = this.state.resource;
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;
    
    var photosProp = utils.getCloneOf('tradle.Message.photos', model.properties);
    if (!photosProp)
      photosProp = model.properties.photos  ? 'photos' : null
    if (!photosProp)
      return null;
    
    var val = resource[photosProp];
    if (!val  ||  val.length === 1)
      return null;

    val = this.renderPhotoList(val);        
    return (
       <View style={styles.photoContainer}>
         {val}
       </View>
     );
  }

  renderPhotoList(val) {
    var dataSource = this.state.dataSource.cloneWithRows(
      groupByEveryN(val, 3)
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
    var photos = photos.map((photo) => {
      if (photo === null) 
        return null;
      return (
        <View style={this.state.viewStyle}>
          <TouchableHighlight onPress={this.zoomPhoto.bind(this, photo)} underlayColor='#ffffff'>
            <Image style={styles.thumb} source={{uri: utils.getImageUri(photo.url)}} />
          </TouchableHighlight>
          <Text style={styles.photoTitle}>{photo.title}</Text>
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
var styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    padding: 5
  },
  photoTitle: {
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 5,
    color: '#656565',
  },
  thumb: {
    width: 110,
    height: 110,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 3,
    borderColor: '#2E3B4E'
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
});

module.exports = PhotosList;