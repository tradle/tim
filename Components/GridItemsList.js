'use strict';

var PhotoList = require('./PhotoList')
var utils = require('../utils/utils');
var translate = utils.translate
var UIImagePickerManager = require('NativeModules').ImagePickerManager;
var extend = require('extend')
var equal = require('deep-equal')
var Icon = require('react-native-vector-icons/Ionicons')
var constants = require('@tradle/constants');
import {
  StyleSheet,
  PropTypes,
  TouchableHighlight,
  ActionSheetIOS,
  View,
} from 'react-native'

import React, { Component } from 'react'

class GridItemsList extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    list: PropTypes.array.isRequired,
    callback: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object.isRequired,
    prop: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      list: this.props.list,
    };
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = () => {
      props.callback(props.prop, this.state.list)
      props.navigator.popToRoute(props.returnRoute);
    }

  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.err                         ||
           nextState.forceUpdate                 ||
           this.state.list.length != nextState.list.length
  }
  cancelItem(item) {
    var list = [];
    extend(list, this.state.list);
    for (var i=0; i<list.length; i++) {
      if (equal(list[i], item)) {
        list.splice(i, 1);
        break;
      }
    }
    if (list.length !== 0)
      this.setState({
        list: list,
      })
    else {
      this.props.callback(this.props.prop, list)
      this.props.navigator.popToRoute(this.props.returnRoute);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <PhotoList photos={this.state.list} forceUpdate={this.state.forceUpdate} callback={this.cancelItem.bind(this)} navigator={this.props.navigator} numberInRow={3} resource={this.props.resource}/>
      <View style={styles.footer}>
        <TouchableHighlight underlayColor='transparent' onPress={this.showMenu.bind(this)}>
          <View style={{marginTop: -10}}>
            <Icon name='plus-circled'  size={55}  color='#ffffff' style={styles.icon} />
          </View>
        </TouchableHighlight>
      </View>
      </View>
    )
  }
  showMenu() {
    var m = utils.getModel(this.props.resource[constants.TYPE]).value
    var buttons = [translate('addNew', m.properties[this.props.prop].title), translate('cancel')]
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: buttons,
      cancelButtonIndex: 1
    }, function(buttonIndex) {
      switch (buttonIndex) {
      case 0:
        self.showChoice();
        break
      }
    });
  }
  showChoice() {
    var self = this;
    UIImagePickerManager.showImagePicker({
      returnIsVertical: true,
      chooseFromLibraryButtonTitle: __DEV__ ? 'Choose from Library' : null
    }, (response) => {
      if (response.didCancel)
        return;
      if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        return
      }
      var item = {
        // title: 'photo',
        url: 'data:image/jpeg;base64,' + response.data,
        isVertical: response.isVertical,
        width: response.width,
        height: response.height,
        chooseFromLibraryButtonTitle: ''
      };
      let l = []
      self.state.list.forEach((r) => {
        let lr = {}
        extend(lr, r)
        l.push(lr)
      })
      l.push(item)
      self.props.onAddItem('photos', item);
      self.setState({list: l, forceUpdate: true})
      // this.setState({resouce: resource})
    });
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'transparent',
    borderTopColor: 'red',
    borderTopWidth: 0.5,
    marginTop: 60,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    height: 45,
    paddingTop: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eeeeee',
    borderColor: '#eeeeee',
    borderWidth: 1,
    borderTopColor: '#cccccc',
  },
  icon: {
    marginLeft: -30,
    marginTop: -25,
    // color: '#629BCA',
    color: 'red'
  },
});

module.exports = GridItemsList;

