
import utils from '../utils/utils'
import Icon from 'react-native-vector-icons/Ionicons';
import RowMixin from './RowMixin'
import { makeResponsive } from 'react-native-orient'
import StyleSheet from '../StyleSheet'
import reactMixin from 'react-mixin'
import chatStyles from '../styles/chatStyles'

import {
  Text,
  TouchableHighlight,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'

class TourRow extends Component {
  static displayName = 'TourRow'
  constructor(props) {
    super(props);
  }
  render() {
    let { resource } = this.props
    // let width = utils.dimensions(TourRow).width * 0.8
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
    navigator.push({
      title: "",
      componentName: 'TourPage',
      backButtonTitle: null,
      // backButtonTitle: __DEV__ ? 'Back' : null,
      passProps: {
        bankStyle,
        resource: to,
        tour: resource,
      }
    })
  }
}

var styles = StyleSheet.create({
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
