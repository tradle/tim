
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import {
  View,
  ViewPropTypes
} from 'react-native'

class Circle extends Component {
  static propTypes = {
    size: PropTypes.number.isRequired,
    style: ViewPropTypes.style        // style
  };

  render() {
    return (
      <View style={[
        circleStyle(this.props.size),
        this.props.style
      ]}>
        {this.props.children}
      </View>
    )
  }
}

function circleStyle (size) {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
}

module.exports = {
  Circle
}
