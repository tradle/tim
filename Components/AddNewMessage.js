'use strict'

var utils = require('../utils/utils');
var ChatMessage = require('./ChatMessage');
// var SelectPhotoList = require('./SelectPhotoList');
import Icon from 'react-native-vector-icons/Ionicons';
var extend = require('extend');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var constants = require('@tradle/constants');

import ImagePicker from 'react-native-image-picker'

import {
  View,
  TouchableHighlight,
  Navigator,
  StyleSheet,
  LayoutAnimation,
  Image,
  Text,
  Platform
} from 'react-native';

var Keyboard
if (Platform.OS !== 'web') {
  Keyboard = require('Keyboard')
}

import React, { Component } from 'react'

var interfaceToTypeMapping = {
  'tradle.Message': constants.TYPES.SIMPLE_MESSAGE
};

class AddNewMessage extends Component {
  constructor(props) {
    super(props);

    var isOrg = this.props.resource[constants.TYPE] == constants.TYPES.ORGANIZATION;
    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
    this.state = {
      keyboardSpace: 0,
      selectedAssets: {},
      userInput: '',
    }

  }
  updateKeyboardSpace(frames) {
    // LayoutAnimation.configureNext(animations.layout.spring);
    var height = frames.endCoordinates ? frames.endCoordinates.height : frames.end.height
    this.setState({keyboardSpace: height});
  }

  resetKeyboardSpace() {
    // LayoutAnimation.configureNext(animations.layout.spring);
    this.setState({keyboardSpace: 0});
  }
  shouldComponentUpdate(newProps, newState) {
    return this.state.userInput !== newState.userInput  ||  this.state.keyboardSpace !== newState.keyboardSpace
  }
  componentDidMount() {
    this.listenTo(Store, 'onAddMessage');
    if (!Keyboard) return

    Keyboard.addListener('keyboardWillShow', (e) => {
      this.updateKeyboardSpace(e)
    });

    Keyboard.addListener('keyboardWillHide', (e) => {
      this.resetKeyboardSpace(e)
    })
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
    var isMessage = model.interfaces  &&  model.interfaces.indexOf(constants.TYPES.MESSAGE) != -1;
    if (isMessage  &&  this.state.userInput.length) {
      this.setState({userInput: ''});
    }
  }
  render() {
    var me = utils.getMe();
    var resource = {from: me, to: this.props.resource};
    var model = utils.getModel(this.props.modelName).value;
    var pushForm;
    // var isLloyds = resource.to[constants.TYPE] == constants.TYPES.ORGANIZATION  &&  resource.to.name === 'Lloyds';
    // if (!isLloyds)
    //   isLloyds = resource[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  resource.name === 'Lloyds'
    var isOrg = false; //resource.to[constants.TYPE] == constants.TYPES.ORGANIZATION  ||  resource[constants.TYPE] === constants.TYPES.ORGANIZATION
    if (isOrg)
      pushForm = <TouchableHighlight underlayColor='#79AAF2'
                   onPress={this.props.onAddNewPressed.bind(this, true)}>
                     <Text style={[styles.products, {paddingTop: 7, color: '#ffffff', fontSize: 20}]}>Choose a product</Text>
                 </TouchableHighlight>
    // else
    //   if (me.organization                                                       &&
    //          this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION  &&
    //          me.organization.title === this.props.resource.name)
    //   pushForm = <TouchableHighlight style={{paddingLeft: 20}} underlayColor='#eeeeee'
    //                onPress={this.props.onAddNewPressed.bind(this, true)}>
    //                  <Icon name={'ios-arrow-thin-up'} size={25} style={styles.imageOutline} color='#757575' />
    //              </TouchableHighlight>
    else
      pushForm = <View style={{marginLeft: 10}}/>
          // <TouchableHighlight style={{paddingRight: 5}} underlayColor='#eeeeee'
          //   onPress={this.props.onAddNewPressed.bind(this)}>
          //      <Image source={require('../img/edit.png')} style={[styles.image]} />
          // </TouchableHighlight>
    var chat = isOrg
             ? <View />
             : <View style={styles.searchBar}>
                  <ChatMessage ref='chat' resource={resource}
                               model={model}
                               callback={this.props.callback}
                               onSubmitEditing={this.onSubmitEditing.bind(this)}
                               onChange={this.onChange.bind(this)}
                               onEndEditing={this.onEndEditing.bind(this)} />
               </View>
    var menu = <TouchableHighlight underlayColor='transparent'
                    onPress={this.props.onMenu.bind(this)}>
                  <View style={{marginLeft: 15, paddingRight: 0, marginRight: 10, marginBottom: 0}}>
                    <Icon name='md-more' size={30} color='#999999' />
                  </View>
                </TouchableHighlight>
    var camera = isOrg
               ? <View />
               : <TouchableHighlight underlayColor='transparent'
                    onPress={this.showChoice.bind(this)}>
                  <View style={{paddingRight: 0, marginBottom: 5, marginRight: 10}}>
                    <Icon name='ios-camera' size={30} color='#999999' />
                  </View>
                </TouchableHighlight>

    var style = isOrg ? {alignSelf: 'center'} : {flexDirection: 'row', marginLeft: -8}
    return (
      <View style={{height: this.state.keyboardSpace + 45}}>
      <View style={isOrg ? styles.addNewProduct : styles.addNew}>
        <View style={style}>
          {pushForm}
        </View>
        {menu}
        {chat}
        </View>
      </View>
    );
  }

  onChange(event) {
    this.setState({userInput: event.nativeEvent.text});
  }
  showChoice() {
    var self = this;
    ImagePicker.showImagePicker({
      returnBase64Image: true,
      returnIsVertical: true,
      quality: utils.imageQuality
    }, (doCancel, response) => {
      if (!doCancel) {
        var selectedAssets = self.state.selectedAssets;
        var dataUri = 'data:image/jpeg;base64,' + response.data
        var uri = response.uri
        if (uri) {
          if (selectedAssets[uri])
            delete selectedAssets[uri]
          else
            selectedAssets[uri] = {
              // url: response.uri,
              url: dataUri,
              isVertical: response.isVertical
            }
        }
        else {
          var i = 0
          for (; i<selectedAssets.length; i++) {
            if (selectedAssets[i].data === dataUri)
              break
          }
          if (i < selectedAssets.length)
            delete selectedAssets[i]
          else
            selectedAssets[selectedAssets.length] = {
              // url: response.uri,
              url: dataUri,
              isVertical: response.isVertical
            }
        }


        // if (selectedAssets[dataUri])
        //   delete selectedAssets[dataUri]
        // else
        //   selectedAssets[dataUri] = 'y'
        // if (type === 'data')  // New photo taken -  response is the 64 bit encoded image data string
        //   selectedAssets['data:image/jpeg;base64,' + response] = 'y'; //, isStatic: true};
        // else {
        //   // Selected from library - response is the URI to the local file asset
        //   // unselect if was selected before
        //   if (typeof response === 'object')
        //     response = response.uri
        //   if (selectedAssets[response])
        //     delete selectedAssets[response];
        //   else
        //     selectedAssets[response] = 'y';
        //   // source = {uri: response};
        // }

        self.onSubmitEditing(self.state.userInput);
      }
    });
  }

  // showChoice1() {
  //   var buttons = ['Take photo', 'Photo library', 'Cancel'];
  //   var self = this;
  //   ActionSheetIOS.showActionSheetWithOptions({
  //     options: buttons,
  //     cancelButtonIndex: 2
  //   }, function(buttonIndex) {
  //   if (buttonIndex == 0)
  //     self.props.onTakePicPressed();
  //   else
  //     self.selectPhotoFromTheLibrary();
  //   });
  // }
  // onButtonPress(buttonIndex) {
  //   if (buttonIndex == 0)
  //     this.props.onTakePicPressed();
  //   else if (buttonIndex == 1)
  //     this.selectPhotoFromTheLibrary();
  // }
  // onPhotoSelect(asset) {
  //   var selectedAssets = this.state.selectedAssets;
  //   // unselect if was selected before
  //   if (selectedAssets[asset.node.image.uri])
  //     delete selectedAssets[asset.node.image.uri];
  //   else
  //     selectedAssets[asset.node.image.uri] = asset;
  // }

  // selectPhotoFromTheLibrary() {
  //   var model = utils.getModel(this.props.modelName).value;
  //   if (model.isInterface)
  //     model = utils.getModel(interfaceToTypeMapping[this.props.modelName]).value;

  //   var self = this;
  //   this.props.navigator.push({
  //     id: 13,
  //     title: 'Select photos',
  //     component: SelectPhotoList,
  //     rightButtonTitle: 'Done',
  //     onRightButtonPress: {
  //       before: self.beforeDone.bind(self),
  //       stateChange: self.onSubmitEditing.bind(self)
  //     },
  //     sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
  //     passProps: {
  //       navigator: self.props.navigator,
  //       onSelect: self.onPhotoSelect.bind(self),
  //       onSelectingEnd: self.onSubmitEditing.bind(self),
  //       metadata: model.properties.photos,
  //     }
  //   })
  // }
  // beforeDone() {
  //   this.props.navigator.pop();
  // }
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
    var modelName = constants.TYPES.SIMPLE_MESSAGE;
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
      for (var a in assets)
        photos.push({url: assets[a].url, isVertical: assets[a].isVertical, title: 'photo'});

      value.photos = photos;
    }
    this.setState({userInput: '', selectedAssets: {}});
    if (this.state.clearCallback)
      this.state.clearCallback();
    Actions.addMessage({resource: value}); //, this.state.resource, utils.getModel(modelName).value);
  }
}
reactMixin(AddNewMessage.prototype, Reflux.ListenerMixin);
// var animations = {
//   layout: {
//     spring: {
//       duration: 400,
//       create: {
//         duration: 300,
//         type: LayoutAnimation.Types.easeInEaseOut,
//         property: LayoutAnimation.Properties.opacity,
//       },
//       update: {
//         type: LayoutAnimation.Types.spring,
//         springDamping: 1,
//       },
//     },
//     easeInEaseOut: {
//       duration: 400,
//       create: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//         property: LayoutAnimation.Properties.scaleXY,
//       },
//       update: {
//         type: LayoutAnimation.Types.easeInEaseOut,
//       },
//     },
//   },
// };
var styles = StyleSheet.create({
  searchBar: {
    flex: 4,
    padding: 10,
    paddingTop: 3,
    height: 45,
    marginLeft: 5,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
  },
  // searchBar: {
  //   flex: 4,
  //   padding: 10,
  //   paddingTop: 3,
  //   height: 45,
  //   paddingBottom: 13,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#eeeeee',
  // },
  products: {
    flex: 4,
    padding: 10,
    paddingTop: 3,
    height: 45,
    paddingBottom: 13,
    // flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#79AAF2',
  },
  image: {
    width: 30,
    height: 30,
    marginLeft: 5,
    color: '#aaaaaa'
  },
  imageW: {
    width: 35,
    height: 35,
    marginLeft: 5,
    color: '#eeeeee'
  },
  icon: {
    width: 30,
    height: 30,
  },
  // imageOutline: {
  //   width: 25,
  //   height: 25,
  //   borderRadius: 13,
  //   borderColor: '#aaaaaa',
  //   paddingLeft: 8,
  //   borderWidth: 1,
  //   color: '#79AAF2'
  // },
  addNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
    borderBottomColor: '#eeeeee',
    borderRightColor: '#eeeeee',
    borderLeftColor: '#eeeeee',
    borderWidth: 1,
    borderTopColor: '#cccccc',
    // paddingLeft: 35
  },
  addNewProduct: {
    // flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#79AAF2',
    borderBottomColor: '#79AAF2',
    borderRightColor: '#79AAF2',
    borderLeftColor: '#79AAF2',
    borderWidth: 1,
    borderTopColor: '#60879C',
  }});

module.exports = AddNewMessage;
