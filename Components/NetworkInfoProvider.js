'use strict'

var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var ResourceList = require('./ResourceList');

import {
  View,
  StyleSheet,
  Text
} from 'react-native'

import React, { Component } from 'react'

class NetworkInfoProvider extends Component {
  constructor(props) {
    super(props)
    // this.state = {isConnected: this.props.connected}
  }
  // componentDidMount() {
  //   this.listenTo(Store, 'onChange')
  // }

  // onChange(params) {
  //   if (params.action === 'connectivity')
  //     this.setState({isConnected: params.isConnected})
  // }

  render() {
    // let pageView = <View/>
    // if (this.props.component === 'ResourceList')
    //   pageView = <ResourceList navigator={this.props.navigator} {...this.props.route.passProps}/>

    return this.props.connected
          ? <View/>
          : <View style={styles.bar}>
              <Text style={styles.text}>no network</Text>
            </View>

  }
}

reactMixin(NetworkInfoProvider.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FF9B30',
    // borderColor: '#FF9B30',
    // borderWidth: 1,
    // borderBottomColor: '#FF6D0D'
  },
  text: {
    fontSize: 18,
    color: '#ffffff',
    padding: 5,
    alignSelf: 'center'
  },
});

module.exports = NetworkInfoProvider
