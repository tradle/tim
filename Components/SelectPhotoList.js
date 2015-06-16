'use strict';
 
var React = require('react-native');
var t = require('tcomb-form-native');
var utils = require('../utils/utils');
var logError = require('logError');
var groupByEveryN = require('groupByEveryN');
var Icon = require('FAKIconImage');

var Form = t.form.Form;

var {
  StyleSheet,
  View,
  Image,
  CameraRoll,
  ListView,
  Component,
  TouchableHighlight,
} = React;

class SelectPhotoList extends Component {
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
    this.state = {
      assets: [],
      batchSize: 21,
      groupTypes: 'All',
      lastCursor: null,
      selected: {},
      noMore: false,
      imagesPerRow: this.props.imagesPerRow || 3,
      loadingMore: false,
      dataSource: dataSource,
    };
  }
  componentDidMount() {
    this.fetch();
  }
  fetch(clear) {
    if (!this.state.loadingMore) {
      this.setState({loadingMore: true}, () => { this.fetchAssets(clear); });
    }
  }

  render() {
    if (this.props.metadata.name !== 'photos')
      return false;
    return (
      <ListView
        renderRow={this.renderRow.bind(this)}
        style={styles.photoContainer}
        dataSource={this.state.dataSource}
        onEndReached={this.onEndReached} />
    );
  }
  fetchAssets(clear) {
    if (clear) {
      this.fetch();
      this.setState(this.state, this.fetch);
      return;
    }

    var fetchParams: Object = {
      first: this.state.batchSize,
      groupTypes: 'All'
    };
    if (this.state.lastCursor) {
      fetchParams.after = this.state.lastCursor;
    }

    CameraRoll.getPhotos(fetchParams, this._appendAssets.bind(this), logError);
  }
  onEndReached() {
    if (!this.state.noMore) {
      this.fetch();
    }
  }
  renderRow(assets, sectionID, rowID)  {
    var photos = assets.map((asset) => {
      if (asset === null) 
        return null;
      var icon = (this.state.selected[asset.node.image.uri])
               ? 'ion|ios-checkmark-outline'
               : 'ion|ios-circle-outline';
      return (
              <View>
                 <TouchableHighlight onPress={this.onSelect.bind(this, asset)} underlayColor='#ffffff'>
                    <Image style={styles.image} source={asset.node.image} />
                 </TouchableHighlight>
                 <TouchableHighlight onPress={this.onSelect.bind(this, asset)} underlayColor='#ffffff'>
                    <Icon name={icon} size={20} color='blue' style={styles.icon} />
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
  onSelect(asset) {    
    this.props.onSelect(asset);
    var selected = this.state.selected;
    selected[asset.node.image.uri] = asset;

    var newDataSource = this.state.dataSource.cloneWithRows(
      groupByEveryN(this.state.assets, this.state.imagesPerRow)
    );

    this.setState({selected: selected, dataSource: newDataSource});

  }

  _appendAssets(data) {
    var assets = data.edges;
    var state = { loadingMore: false };

    if (!data.page_info.has_next_page) 
      state.noMore = true;    

    if (assets.length > 0) {
      state.lastCursor = data.page_info.end_cursor;
      state.assets = this.state.assets.concat(assets);
      state.dataSource = this.state.dataSource.cloneWithRows(
        groupByEveryN(state.assets, this.state.imagesPerRow)
      );
    }

    this.setState(state);
  }
}

var styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    alignSelf: 'center'
  },
  image: {
    margin: 5,
    marginVertical: 10,
    width: 100,
    height: 100
  },
  icon: {
    width: 20,
    height: 20,
    marginTop: -33,
    marginLeft: 7,
    borderWidth: 2,
    borderColor: '#D7E6ED',
    backgroundColor: '#eeeeee',
    borderRadius: 10,
  },

});
module.exports = SelectPhotoList;
