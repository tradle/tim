'use strict';

var utils = require('../utils/utils');
var PageView = require('./PageView')
var extend = require('extend');
import Icon from 'react-native-vector-icons/Ionicons';

var StyleSheet = require('../StyleSheet')
import platformStyles from '../styles/platform'

import {
  Platform,
  View,
  Text,
  ScrollView,
} from 'react-native';

import React, { Component, PropTypes } from 'react'
// import { makeResponsive } from 'react-native-orient'
var SignaturePad = require('react-native-signature-pad')

class SignatureView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    prop: PropTypes.object.isRequired,
    callback: PropTypes.func,
    returnRoute: PropTypes.object,
  };

  constructor(props) {
    super(props);
    let {resource, prop} = props
    this.state = {
      value: resource[prop.name] || ''
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes()
    var currentRoutesLength = currentRoutes.length
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.done.bind(this)

    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
  }
  done() {
    let {navigator, callback, prop} = this.props
    navigator.pop()
    callback(prop, this.state.value)
  }
  onScroll(e) {
    this._contentOffset = { ...e.nativeEvent.contentOffset }
  }
  render() {
    let {bankStyle, resource} = this.props
    let {width, height} = utils.dimensions(SignatureView)
    return (
      <PageView style={platformStyles.container}>
        <View style={{flex: 1}}>
        <Text style={{fontSize: 24, padding: 10, alignSelf: 'center', color: '#aaaaaa'}}>Please sign here</Text>
          <SignaturePad onError={this._signaturePadError}
                        lockToLandscape={true}
                        onChange={this.onChangeText.bind(this)}
                        style={{flex: 1, backgroundColor: 'white'}}/>
        </View>
      </PageView>
    )
  }
  onChangeText({base64DataUrl}) {
    // let val = format(value, this.props.resource)
    this.setState({value: base64DataUrl})
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
})
SignatureView.orientation = 'LANDSCAPE'
module.exports = SignatureView;
