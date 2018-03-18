console.log('requiring TourRow.js')
'use strict';

import utils from '../utils/utils'
var translate = utils.translate
import uiUtils from './uiUtils'
import Icon from 'react-native-vector-icons/Ionicons';
import constants from '@tradle/constants'
const {
  TYPE,
  ROOT_HASH
} = constants

const LIMIT = 20
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import TourPage from './TourPage'
import { makeResponsive } from 'react-native-orient'
import StyleSheet from '../StyleSheet'
import reactMixin from 'react-mixin'
import chatStyles from '../styles/chatStyles'

const TOUR = 'tradle.Tour'

import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Platform,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'

class TourRow extends Component {
  static displayName = 'TourRow'
  constructor(props) {
    super(props);
  }
  render() {
    let { resource, to, bankStyle, navigator } = this.props
    let ownerPhoto = this.getOwnerPhoto(false)
    let cellStyle = [chatStyles.verificationBody, styles.mstyle]
    let msgContent =  <View style={chatStyles.row}>
                        <View style={{marginTop: 2}}>
                          {ownerPhoto}
                        </View>
                        <View style={cellStyle}>
                          <Icon name='md-information-circle' size={30} color='#77ADFC'/>
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
      component: TourPage,
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

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  resourceTitle: {
    fontSize: 20,
    paddingTop: 5,
    paddingLeft: 7,
    color: '#555555'
  },
  mstyle: {
    borderColor: '#efefef',
    // backgroundColor: '#ffeffe',
    borderTopLeftRadius: 0,
    flexDirection: 'row',
    // justifyContent: 'center',
    paddingVertical: 7,
    width: utils.getMessageWidth(TourRow)
  }
})
reactMixin(TourRow.prototype, RowMixin);
TourRow = makeResponsive(TourRow)

module.exports = TourRow;
