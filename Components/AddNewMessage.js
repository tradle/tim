'use strict'

var React = require('react-native');
var utils = require('../utils/utils');
var ChatMessage = require('./ChatMessage');
var SelectPhotoList = require('./SelectPhotoList');
var Icon = require('FAKIconImage');
var extend = require('extend');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');

var {
  View,
  TouchableHighlight,
  Navigator,
  Image,
  StyleSheet,
  Component
} = React;

var ActionSheetIOS = require('ActionSheetIOS');

var interfaceToTypeMapping = {
  'tradle.Message': 'tradle.SimpleMessage'
};

class AddNewMessage extends Component {
  constructor(props) {
    this.state = {
      selectedAssets: {},
      userInput: ''
    }
  }
  componentDidMount() {
    this.listenTo(Store, 'onAddMessage');
  }
  onAddMessage(params) {
    if (params.action !== 'addMessage')
      return;
    var resource = params.resource;
    if (!resource)
      return;
    if (params.error) {
      if (resource['_type'] == this.props.resource['_type']) 
        this.setState({err: params.error});
      return;    
    }
    var model = utils.getModel(resource['_type']).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    if (isMessage) {
      if (this.props.callback) {
        this.props.callback('');
        this.setState({userInput: ''});
        // setTimeout(function() {
        //   this.setState({textValue: this.state.userInput});
        //   this.refs.chat.focus();
        // }.bind(this), 0);
      }
    }
  }
  render() {
    var resource = {from: utils.getMe(), to: this.props.resource};
    var model = utils.getModel(this.props.modelName).value;
    return (
      <View style={styles.addNew}>
        <TouchableHighlight style={{paddingLeft: 5}} underlayColor='#eeeeee'
          onPress={this.props.onAddNewPressed.bind(this)}>
         <Image source={require('image!clipadd')} style={styles.image} />
        </TouchableHighlight>
        <View style={styles.searchBar}>
          <ChatMessage resource={resource} 
                       model={model} 
                       callback={this.props.callback} 
                       onSubmitEditing={this.onSubmitEditing.bind(this)}
                       onEndEditing={this.onEndEditing.bind(this)} />
        </View>
        <TouchableHighlight style={{paddingRight: 5}} underlayColor='#eeeeee'
          onPress={this.showChoice.bind(this)}>
            <Icon name='ion|ios-camera' style={styles.image} size={35} color='#aaaaaa' />
        </TouchableHighlight>
      </View> 
    );
  }
  showChoice() {
    var buttons = ['Take photo', 'Photo library', 'Cancel'];
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: buttons,
      cancelButtonIndex: 2
    }, function(buttonIndex) {
      self.onButtonPress(buttonIndex);
    });
  }
  onButtonPress(buttonIndex) {
    if (buttonIndex == 0)
      this.props.onTakePicPressed();
    else
      this.selectPhotoFromTheLibrary();
  }
  onPhotoSelect(asset) {
    var selectedAssets = this.state.selectedAssets;
    // unselect if was selected before
    if (selectedAssets[asset.node.image.uri])
      delete selectedAssets[asset.node.image.uri];
    else
      selectedAssets[asset.node.image.uri] = asset;
  }

  selectPhotoFromTheLibrary() {
    var model = utils.getModel(this.props.modelName).value;
    if (model.isInterface)
      model = utils.getModel(interfaceToTypeMapping[this.props.modelName]).value;

    var self = this;
    this.props.navigator.push({
      id: 13,
      title: 'Select photos',
      component: SelectPhotoList,
      rightButtonTitle: 'Done',
      onRightButtonPress: {
        before: this.beforeDone.bind(this),
        stateChange: this.onSubmitEditing.bind(this)
      },      
      passProps: {
        navigator: self.props.navigator,
        onSelect: self.onPhotoSelect.bind(this),
        onSelectingEnd: self.onSubmitEditing.bind(this),
        metadata: model.properties.photos,
      }
    })
  }
  beforeDone() {
    this.props.navigator.pop();
  }
  onEndEditing(userInput) {
    this.setState({userInput: userInput});
  }

  onSubmitEditing(msg) {
    msg = msg ? msg : this.state.userInput;
    var assets = this.state.selectedAssets;
    var isNoAssets = utils.isEmpty(assets);
    if (!msg  &&  isNoAssets)
      return;
    var me = utils.getMe();
    var resource = {from: utils.getMe(), to: this.props.resource};
    var model = utils.getModel(this.props.modelName).value;

    var toName = utils.getDisplayName(resource.to, utils.getModel(resource.to['_type']).value.properties);
    var meta = utils.getModel(me['_type']).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = 'tradle.SimpleMessage';
    var value = {
      '_type': modelName,  
      message: msg 
              ?  model.isInterface ? msg : '[' + this.state.userInput + '](' + this.props.model.id + ')'
              : '',
      from: me,
      to: resource.to,
      time: new Date().getTime()
    }
    if (!isNoAssets) {
      var photos = [];
      for (var assetUri in assets) 
        photos.push({url: assetUri, title: 'photo'});
      
      value.photos = photos;
    }
    this.setState({userInput: '', selectedAssets: {}});
    // setTimeout(function() {
    //   this.setState({textValue: this.state.userInput, selectedAssets: {}});
    //   this.refs.chat.focus();
    // }.bind(this), 0);
    Actions.addMessage(value); //, this.state.resource, utils.getModel(modelName).value);
  }
}
reactMixin(AddNewMessage.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  searchBar: {
    flex: 4,
    padding: 10,
    paddingTop: 3,
    height: 45,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee', 
  },
  image: {
    width: 40,
    height: 40,
  },
  addNew: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#eeeeee',
    borderBottomColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 1,
    borderTopColor: '#cccccc',
  }
});

module.exports = AddNewMessage;