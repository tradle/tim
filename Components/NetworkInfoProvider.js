'use strict'

import {
  View,
  StyleSheet,
  Text
} from 'react-native'

import React, { Component } from 'react'

class NetworkInfoProvider extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return this.props.connected
          ? <View/>
          : <View style={styles.bar}>
              <Text style={styles.text}>no network</Text>
            </View>

  }
}

var styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FF9B30',
    padding: 5,
  },
  text: {
    fontSize: 18,
    color: '#ffffff',
    alignSelf: 'center'
  },
});

module.exports = NetworkInfoProvider
