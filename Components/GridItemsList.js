console.log('requiring GridItemsList.js')
'use strict';

import PhotoList from './PhotoList'
import PageView from './PageView'
import utils from '../utils/utils'
var translate = utils.translate
import ImagePicker from 'react-native-image-picker';
import extend from 'extend'
import equal from 'deep-equal'
import Icon from 'react-native-vector-icons/Ionicons'
import constants from '@tradle/constants'
// import ActionSheet from 'react-native-actionsheet'

import {
  StyleSheet,
  Platform,
  ScrollView,
  TouchableHighlight,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import platformStyles from '../styles/platform'
import ImageInput from './ImageInput'

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

    this._onImage = this._onImage.bind(this)
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextState.err                         ||
           nextState.forceUpdate                 ||
           // nextState.show !== this.state.show    ||
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
    var m = utils.getModel(this.props.resource[constants.TYPE])
    var prop = m.properties[this.props.prop]
    // var buttons = [translate('addNew', prop.title), translate('cancel')]
    let icon = Platform.OS === 'ios' ?  'md-add' : 'md-add'
    let color = Platform.OS === 'android' ? 'red' : '#ffffff'
    // let actionSheet = this.renderActionSheet(buttons)
    return (
      <PageView style={platformStyles.container}>
        <ScrollView  ref='this'>
        <View style={{flex: 1}}>
          <PhotoList photos={this.state.list} forceUpdate={this.state.forceUpdate} callback={this.cancelItem.bind(this)} navigator={this.props.navigator} resource={this.props.resource}/>
        </View>
        </ScrollView>
        <View style={styles.footer}>
          <ImageInput
            ref={input => this._imageInput = input}
            prop={prop}
            underlayColor='transparent'
            onPress={utils.isWeb() ? null : () => this._imageInput.showImagePicker()}
            onImage={this._onImage}>
            <View style={platformStyles.menuButton}>
              <Icon name={icon}  size={33}  color={color} />
            </View>
          </ImageInput>
        </View>
      </PageView>
    )
  }

  // renderActionSheet(buttons) {
  //   if (utils.isWeb()) return

  //   return (
  //     <ActionSheet
  //       ref={(o) => {
  //         this.ActionSheet = o
  //       }}
  //       options={buttons}
  //       cancelButtonIndex={buttons.length - 1}
  //       onPress={(index) => {
  //         if (index === 0) this._imageInput.showImagePicker()
  //       }}
  //     />
  //   )
  // }

      // returnIsVertical: true,
      // chooseFromLibraryButtonTitle: __DEV__ ? 'Choose from Library' : null
  _onImage(item) {
    let l = []
    this.state.list.forEach((r) => {
      let lr = {}
      extend(lr, r)
      l.push(lr)
    })
    l.push(item)
    this.props.onAddItem('photos', item);
    this.setState({list: l, forceUpdate: true})
    // this.setState({resouce: resource})
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
  //   var m = utils.getModel(this.props.resource[constants.TYPE])
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
