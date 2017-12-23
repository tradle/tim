if (__DEV__) console.log('requiring PageView.js')
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
      <View style={[this.props.style, this.props.separator || styles.separator]}>
        {this.props.children}
      </View>
    )
  }
}
var styles = StyleSheet.create({
  separator: {
    borderColor: '#ffffff',
    borderTopColor: '#cccccc',
    borderWidth: StyleSheet.hairlineWidth
  }
})

module.exports = PageView
