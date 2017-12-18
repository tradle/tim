'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
import uiUtils from './uiUtils'
import Icon from 'react-native-vector-icons/Ionicons';
var constants = require('@tradle/constants');
const {
  TYPE,
  ROOT_HASH
} = constants

const LIMIT = 20
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin')
import { makeResponsive } from 'react-native-orient'
var StyleSheet = require('../StyleSheet')
var reactMixin = require('react-mixin');
var chatStyles = require('../styles/chatStyles')

const TOUR = 'tradle.Tour'

import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Platform,
} from 'react-native'

import React, { Component } from 'react'

class TourRow extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let styles = createStyles()
    let { resource, to, bankStyle, navigator } = this.props
    // let width = utils.dimensions(TourRow).width * 0.8
    let rowStyle = [chatStyles.row, {backgroundColor: 'transparent', flexDirection: 'row', alignSelf: 'flex-start'}];
    let ownerPhoto = this.getOwnerPhoto(false)

    let cellStyle = [chatStyles.verificationBody, styles.mstyle]

    let msgContent =  <View style={rowStyle}>
                        <View style={{marginTop: 2}}>
                          {ownerPhoto}
                        </View>
                        <View style={cellStyle}>
                          <Icon name='ios-information-circle' size={30} color='#77ADFC'/>
                          <Text style={styles.resourceTitle} key={this.getNextKey()}>{resource.message}</Text>
                        </View>
                      </View>
    return (
      <View>
        <TouchableHighlight onPress={this.showTour.bind(this)} underlayColor='transparent'>
          {msgContent}
        </TouchableHighlight>
      </View>
    )
  }
  showTour() {
    let {resource, navigator, to, bankStyle} = this.props
    this.props.navigator.push({
      title: "",
      component: TourRow,
      id: 35,
      backButtonTitle: null,
      // backButtonTitle: __DEV__ ? 'Back' : null,
      passProps: {
        bankStyle: bankStyle,
        resource: to,
        tour: resource,
      }
    })
  }
}

var createStyles = utils.styleFactory(TourRow, function ({ dimensions }) {
  var { width, height } = utils.dimensions(TourRow)
  return StyleSheet.create({
    container: {
      flex: 1
    },
    resourceTitle: {
      fontSize: 20,
      paddingTop: 2
    },
    mstyle: {
      borderColor: '#efefef',
      // backgroundColor: '#ffeffe',
      borderTopLeftRadius: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 7,
      width: width * 0.8
    }
  })
})
reactMixin(TourRow.prototype, RowMixin);
TourRow = makeResponsive(TourRow)

module.exports = TourRow;
