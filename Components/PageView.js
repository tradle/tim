console.log('requiring PageView.js')
'use strict';

import {
  StyleSheet,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import utils from '../utils/utils'

class PageView extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <View style={[this.props.style, this.props.separator || styles.separator, {flex: 1}]}>
        {this.props.children}
      </View>
    )
  }
}
var styles = StyleSheet.create({
  separator: {
    borderColor: 'transparent',
    borderTopColor: '#eeeeee',
    borderWidth: StyleSheet.hairlineWidth
  },
})

module.exports = PageView
