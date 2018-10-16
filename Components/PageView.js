import {
  StyleSheet,
  View,
} from 'react-native'

import React, { Component } from 'react'
import platformStyles from '../styles/platform'

class PageView extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { bankStyle, separator, style, children } = this.props
    let platformSeparator
    if (bankStyle  &&  separator)
      platformSeparator = <View style={[{backgroundColor: bankStyle.navBarBackgroundColor}, separator || styles.separator, platformStyles.navBarSeparator]}/>

    return (
      <View style={style}>
        {platformSeparator}
        {children}
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
