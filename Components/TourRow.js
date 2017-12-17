'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
import Icon from 'react-native-vector-icons/Ionicons';
var constants = require('@tradle/constants');
import uiUtils from './uiUtils'
const {
  TYPE,
  ROOT_HASH
} = constants

const LIMIT = 20
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin')
import { makeResponsive } from 'react-native-orient'
var StyleSheet = require('../StyleSheet')
var TourPage = require('./TourPage')
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
    let { resource, to, bankStyle, navigator } = this.props
    let w = utils.dimensions(TourRow).width
    let width = w * 0.8
    let rowStyle = [chatStyles.row, {backgroundColor: 'transparent', flexDirection: 'row', alignSelf: 'flex-start'}];
    let ownerPhoto = this.getOwnerPhoto(false)

    let mstyle = {
      borderColor: '#efefef',
      backgroundColor: '#ffeffe',
      borderTopLeftRadius: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 7,
      width
    }
    let cellStyle = [chatStyles.verificationBody, mstyle]

    let msgContent =  <View style={rowStyle}>
                        <View style={{marginTop: 2}}>
                          {ownerPhoto}
                        </View>
                        <View style={cellStyle}>
                          <Text style={styles.resourceTitle} key={this.getNextKey()}>{resource.message}</Text>
                          <Text style={{fontSize: 30, color: bankStyle.linkColor}}>☞</Text>
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
      title: translate('Tour'),
      component: TourRow,
      id: 35,
      // backButtonTitle: __DEV__ ? 'Back' : null,
      passProps: {
        bankStyle: bankStyle,
        resource: to,
        tour: resource,
      }
    })
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1
  },
  resourceTitle: {
    // flex: 1,
    fontSize: 20,
    // marginBottom: 2,
  },
});
reactMixin(TourRow.prototype, RowMixin);
TourRow = makeResponsive(TourRow)

module.exports = TourRow;
