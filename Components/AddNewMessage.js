'use strict'

var React = require('react-native');
var utils = require('../utils/utils');
var ChatMessage = require('./ChatMessage');
var SelectPhotoList = require('./SelectPhotoList');
var Icon = require('./FAKIconImage');
var extend = require('extend');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var KeyboardEvents = require('react-native-keyboardevents');
var constants = require('tradle-constants');

var KeyboardEventEmitter = KeyboardEvents.Emitter;
var UIImagePickerManager = require('NativeModules').UIImagePickerManager;

var {
  View,
  TouchableHighlight,
  Navigator,
  Image,
  StyleSheet,
  LayoutAnimation,
  Component
} = React;

var ActionSheetIOS = require('ActionSheetIOS');

var interfaceToTypeMapping = {
  'tradle.Message': 'tradle.SimpleMessage'
};

class AddNewMessage extends Component {
  constructor(props) {
    super(props);

    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
    this.state = {
      keyboardSpace: 0,
      selectedAssets: {},
      userInput: ''
    }
  }
  updateKeyboardSpace(frames) {
    // LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: frames.end.height});
  }

  resetKeyboardSpace() {
    // LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: 0});
  }  

  componentDidMount() {
    this.listenTo(Store, 'onAddMessage');
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    KeyboardEventEmitter.on(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }

  componentWillUnmount() {
    KeyboardEventEmitter.off(KeyboardEvents.KeyboardDidShowEvent, this.updateKeyboardSpace);
    KeyboardEventEmitter.off(KeyboardEvents.KeyboardWillHideEvent, this.resetKeyboardSpace);
  }

  onAddMessage(params) {
    if (params.action !== 'addMessage')
      return;
    var resource = params.resource;
    if (!resource)
      return;
    if (params.error) {
      if (resource[constants.TYPE] == this.props.resource[constants.TYPE]) 
        this.setState({err: params.error});
      return;    
    }
    var model = utils.getModel(resource[constants.TYPE]).value;
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
      <View style={{height: this.state.keyboardSpace + 45}}>
      <View style={styles.addNew}>
        <TouchableHighlight style={{paddingLeft: 5}} underlayColor='#eeeeee'
          onPress={this.props.onAddNewPressed.bind(this)}>
         <Image source={require('image!clipadd')} style={styles.image} />
        </TouchableHighlight>
        <View style={styles.searchBar}>
          <ChatMessage ref="chat" resource={resource} 
                       model={model} 
                       callback={this.props.callback} 
                       onSubmitEditing={this.onSubmitEditing.bind(this)}
                       onChange={this.onChange.bind(this)}
                       onEndEditing={this.onEndEditing.bind(this)} />
        </View>
        <TouchableHighlight style={{paddingRight: 5}} underlayColor='transparent'
          onPress={this.showChoice.bind(this)}>
            <Icon name='ion|ios-camera' style={styles.image} size={35} color='#aaaaaa' />
        </TouchableHighlight>
        </View>
      </View> 
    );
  }

  onChange(event) {
    this.setState({userInput: event.nativeEvent.text});    
  }
  showChoice1() {
    var self = this;
    UIImagePickerManager.showImagePicker(null, (type, response) => {
      if (type !== 'cancel') {
        var selectedAssets = self.state.selectedAssets;
        if (type === 'data')  // New photo taken -  response is the 64 bit encoded image data string
          selectedAssets['data:image/jpeg;base64,' + response] = 'y'; //, isStatic: true};
        else { // Selected from library - response is the URI to the local file asset
          // unselect if was selected before
          if (selectedAssets[response])
            delete selectedAssets[response];
          else
            selectedAssets[response] = 'y';
          // source = {uri: response};
        }

        self.onSubmitEditing(self.state.userInput); 
      } else {
        console.log('Cancel');
      }
    });
  }

  showChoice() {
    var buttons = ['Take photo', 'Photo library', 'Cancel'];
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: buttons,
      cancelButtonIndex: 2
    }, function(buttonIndex) {
    if (buttonIndex == 0)
      self.props.onTakePicPressed();
    else
      self.selectPhotoFromTheLibrary();
    });
  }
  onButtonPress(buttonIndex) {
    if (buttonIndex == 0)
      this.props.onTakePicPressed();
    else if (buttonIndex == 1)
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
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
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
  onEndEditing(userInput, clearCallback) {
    this.setState({userInput: userInput});

    if (clearCallback)
      this.state.clearCallback = clearCallback;
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

    var toName = utils.getDisplayName(resource.to, utils.getModel(resource.to[constants.TYPE]).value.properties);
    var meta = utils.getModel(me[constants.TYPE]).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = 'tradle.SimpleMessage';
    var value = {
      message: msg 
              ?  model.isInterface ? msg : '[' + this.state.userInput + '](' + this.props.model.id + ')'
              : '',
      from: me,
      to: resource.to,
      time: new Date().getTime()
    }
    value[constants.TYPE] = modelName;
    if (!isNoAssets) {
      var photos = [];
      for (var assetUri in assets) 
        photos.push({url: assetUri, title: 'photo'});
      
      value.photos = photos;
    }
    this.setState({userInput: '', selectedAssets: {}});
    if (this.state.clearCallback)
      this.state.clearCallback();
    Actions.addMessage(value); //, this.state.resource, utils.getModel(modelName).value);
  }
}
reactMixin(AddNewMessage.prototype, Reflux.ListenerMixin);
var animations = {
  layout: {
    spring: {
      duration: 400,
      create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 1,
      },
    },
    easeInEaseOut: {
      duration: 400,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    },
  },
};
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