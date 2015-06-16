'use strict';
 
var React = require('react-native');
var t = require('tcomb-form-native');
var utils = require('../utils/utils');
var extend = require('extend');
var logError = require('logError');
var SelectPhotoList = require('./SelectPhotoList');

var Form = t.form.Form;

var {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Component,
  TouchableHighlight,
} = React;

class NewItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAssets: {}
    }
  }
  onSavePressed() {
    var value = this.refs.form.getValue();
    if (!value)
      return;
    var propName = this.props.metadata.name;
    var json = JSON.parse(JSON.stringify(value));
    if (utils.isEmpty(this.state.selectedAssets)) 
      this.props.onAddItem(propName, json);
    else {
      for (var assetUri in this.state.selectedAssets) {
        var newJson = {};
        extend(newJson, json);
        newJson = {url: assetUri, title: 'photo'};
        this.props.onAddItem(propName, newJson);    
      }
      this.props.navigator.pop();
    }
  }
  addItem() {
    var propName = this.props.metadata.name;
    var json = JSON.parse(JSON.stringify(value));
    this.props.onAddItem(propName, json);    
    return true;
  }
  render() {
    var props = this.props;
    var parentBG = {backgroundColor: '#7AAAC3'};
    var err = props.err || '';

    var meta =  props.metadata;
    var model = {};
    var params = {
        meta: meta,
        model: model,
        onSubmitEditing: this.onSavePressed.bind(this)
    };

    var options = utils.getFormFields(params);
    var Model = t.struct(model);
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    return (
      <ScrollView
        initialListSize={10}
        pageSize={4}      
      >
      <View style={styles.container}>
        <Text style={errStyle}>{err}</Text>
        <View style={{'padding': 20}}>
          <Form ref='form' type={Model} options={options} />
          <SelectPhotoList 
            metadata={this.props.metadata} 
            navigator={this.props.navigator} 
            onSelect={this.onSelect.bind(this)} />
        </View>
      </View>
      </ScrollView>
    );
  }
  onSelect(asset) {    
    var selectedAssets = this.state.selectedAssets;
    // unselect if was selected before
    if (selectedAssets[asset.node.image.uri])
      delete selectedAssets[asset.node.image.uri];
    else
      selectedAssets[asset.node.image.uri] = asset;
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60
  },
  imageContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    alignSelf: 'center'
  },
  buttons: { 
    flex: 1,
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
  },
  button: {
    height: 36,
    width: 100,
    flex: 1,
    backgroundColor: '#ffffff',
    borderColor: '#6093ae',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    alignSelf: 'center'
  },
  err: {
    paddingTop: 10,
    paddingLeft: 20,
    fontSize: 20,
    color: 'darkred',
  },

});
module.exports = NewItem;
