'use strict';

import {
  StyleSheet,
  View,
  Text
} from 'react-native'

var constants = require('@tradle/constants');
var ResourceList = require('./ResourceList')
var BG_IMAGE = require('../img/bg.png')
import CustomIcon from '../styles/customicons'
var BackgroundImage = require('./BackgroundImage')
import React, { Component } from 'react'
import utils from '../utils/utils'

class DashboardView extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let backgroundColor = this.props.bankStyle  &&  this.props.bankStyle.menuColor || '#ffffff'
    let nav = this.props.navigator
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
        <View style={[styles.leftPanel, {backgroundColor: backgroundColor, flex: 1}]}>
        <BackgroundImage source={BG_IMAGE} />
          <CustomIcon name='tradle' size={40} color='#ffffff' style={{position: 'absolute', left: 10, top : 10}}/>
          <this.props.menu navigator={nav} {...this.props.menuProps} />
        </View>
        <View style={[{flex: 1}]}>
          <this.props.mainComponent navigator={nav} {...this.props.mainComponentProps} />
        </View>
      </View>
    )
  }
}
var styles = StyleSheet.create({
  separator: {
    borderColor: '#ffffff',
    borderTopColor: '#cccccc',
    borderWidth: StyleSheet.hairlineWidth
  },
  leftPanel: {
    // marginTop: 0,
    width: 300,
    borderColor: '#ffffff',
    borderRightWidth: 10,
    borderRightColor: '#205988'
  },
  rightPanel: {
    // marginTop: 0,
    borderColor: '#ffffff',
    borderLeftWidth: 10,
    borderLeftColor: '#205988'
  }
})

module.exports = DashboardView
