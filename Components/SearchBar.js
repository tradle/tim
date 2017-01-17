'use strict'

import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Platform,
  TextInput
} from 'react-native'

import ActivityIndicator from './ActivityIndicator'

class SearchBar extends Component {
  render() {
    return (
      <View style={{padding: 7}}>
        <TextInput
          style={styles.searchBarInput}
          autoCapitalize='none'
          onChange={this.props.onChangeText.bind(this)}
          placeholder='Search'
          placeholderTextColor='#bbbbbb'
          value={this.props.filter}
        />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  searchBarInput: {
    height: Platform.OS === 'android' ? 40 : 32,
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingVertical: 5,
    fontSize: 18,
    paddingLeft: 10,
    fontWeight: '600',
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 1,
    color: '#757575',
    borderColor: '#eeeeee',
  }
});

module.exports = SearchBar;
