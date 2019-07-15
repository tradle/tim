
import {
  View,
  StyleSheet
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react';

const debug = require('debug')('tradle:app:progressbar')

class ProgressBar extends Component {
  // static propTypes = {
  //   recipient: PropTypes.string.isRequired
  // };
  render() {
    let { progress, width, color, height, borderWidth, borderRadius } = this.props
    progress *= 10
    return (
      <View style={[styles.row, {borderColor: color, width, borderWidth, borderRadius}]}>
        <View style={{flex: progress, backgroundColor: color, height}} />
        <View style={{flex: 10 - progress, backgroundColor: '#ffffff', height}} />
      </View>
    )
  }
}
var styles = StyleSheet.create({
  row: {
    // justifyContent: 'center',
    // alignSelf: 'center',
    flexDirection: 'row',
    marginLeft: 7,
    borderWidth: 1
  }
});

module.exports = ProgressBar
