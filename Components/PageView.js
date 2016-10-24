'use strict';

import {
  StyleSheet,
  View,
} from 'react-native'

import React, { Component } from 'react'
import utils from '../utils/utils'

class PageView extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
        <View style={[this.props.style, styles.separator, {flex: 1}]}>
          {this.props.children}
        </View>
    )
  }
}
var styles = StyleSheet.create({
  separator: {
    borderColor: 'transparent',
    borderTopColor: '#cccccc',
    borderWidth: StyleSheet.hairlineWidth
  },
})

module.exports = PageView
