
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
    let { progress, width, color, height } = this.props
    progress *= 10
    return (
      <View style={[styles.row, {borderColor: color, width: width}]}>
        <View style={{flex: progress, backgroundColor: color, height: height}} />
        <View style={{flex: 10 - progress, backgroundColor: '#ffffff', height: height}} />
      </View>
    )
  }
}
var styles = StyleSheet.create({
  row: {
    justifyContent: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    borderWidth: 1,
  }
});

module.exports = ProgressBar
