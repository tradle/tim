console.log('requiring PageView.js')
'use strict';

import {
  StyleSheet,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import utils from '../utils/utils'
import platformStyles from '../styles/platform'

class PageView extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { bankStyle, separator, style } = this.props
    let platformSeparator
    if (this.props.bankStyle  &&  separator)
      platformSeparator = <View style={[{backgroundColor: bankStyle.navBarBackgroundColor}, separator || styles.separator, platformStyles.navBarSeparator]}/>

    return (
      <View style={[style]}>
        {platformSeparator}
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
