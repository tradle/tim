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
              <Text style={styles.text}>waiting for the network</Text>
            </View>

  }
}

reactMixin(NetworkInfoProvider.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FF6D0D',
    borderColor: '#FF6D0D',
    borderWidth: 1,
    borderBottomColor: '#3A5280'
  },
  text: {
    fontSize: 18,
    color: '#ffffff',
    padding: 3,
    alignSelf: 'center'
  },
});

module.exports = NetworkInfoProvider