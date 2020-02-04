
import {
  View,
  Text,
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
    let { progress, width, color, height, borderWidth, borderRadius, showProgress } = this.props
    let percentage, opacity = 1
    if (showProgress) {
      percentage = <Text style={{position: 'absolute', top: 1, left: width/2 - 10, fontSize: 12, alignSelf: 'center'}}>{Math.round(progress * 100) + '%'}</Text>
      if (height < 16) {
        height = 16
        borderRadius = 5
        opacity = 0.5
      }
    }
    progress *= 10

    return (
      <View style={[styles.row, {borderColor: color, width, borderWidth, borderRadius}]}>
        <View style={{flex: progress, backgroundColor: color, height, opacity}} />
        {percentage}
        <View style={{flex: 10 - progress, backgroundColor: '#ffffff', height, opacity}} />
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
