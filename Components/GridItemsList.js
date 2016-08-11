'use strict';

var PhotoList = require('./PhotoList')
var utils = require('../utils/utils');
var translate = utils.translate
import ImagePicker from 'react-native-image-picker';
var extend = require('extend')
var equal = require('deep-equal')
var Icon = require('react-native-vector-icons/Ionicons')
var constants = require('@tradle/constants');
import ActionSheet from 'react-native-actionsheet'

import {
  StyleSheet,
  PropTypes,
  Platform,
  TouchableHighlight,
  View,
} from 'react-native'

import React, { Component } from 'react'
import platformStyles from '../styles/platform'

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
      show: false
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
           nextState.show !== this.state.show    ||
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
    var m = utils.getModel(this.props.resource[constants.TYPE]).value
    var buttons = [translate('addNew', m.properties[this.props.prop].title), translate('cancel')]

    let icon = Platform.OS === 'ios' ?  'md-add' : 'md-add'
    let color = Platform.OS === 'ios' ? '#ffffff' : 'red'
    return (
      <View style={styles.container}>
        <View style={{flex: 1}}>
          <PhotoList photos={this.state.list} forceUpdate={this.state.forceUpdate} callback={this.cancelItem.bind(this)} navigator={this.props.navigator} numberInRow={3} resource={this.props.resource}/>
        </View>

        <View style={styles.footer}>
          <TouchableHighlight underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
            <View style={platformStyles.menuButton}>
              <Icon name={icon}  size={33}  color={color} />
            </View>
          </TouchableHighlight>
        </View>

        <ActionSheet
          ref={(o) => {
            this.ActionSheet = o
          }}
          options={buttons}
          cancelButtonIndex={buttons.length - 1}
          onPress={(index) => {
            if (index === 0)
              this.showChoice()
          }}
        />
      </View>
    )
  }
  showChoice() {
    var self = this;
    imports.setState({
      show: false,
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
    marginTop: 60,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: 45,
    // paddingTop: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eeeeee',
    borderColor: '#eeeeee',
    borderWidth: 1,
    borderTopColor: '#cccccc',
  },
  icon: {
    marginLeft: -30,
    marginTop: -25,
    color: 'red'
  },
});

module.exports = GridItemsList;

  // showMenu() {
  //   var m = utils.getModel(this.props.resource[constants.TYPE]).value
  //   var buttons = [translate('addNew', m.properties[this.props.prop].title), translate('cancel')]
  //   var self = this;
  //   ActionSheetIOS.showActionSheetWithOptions({
  //     options: buttons,
  //     cancelButtonIndex: 1
  //   }, function(buttonIndex) {
  //     switch (buttonIndex) {
  //     case 0:
  //       self.showChoice();
  //       break
  //     }
  //   });
  // }
