'use strict'

import {
  View,
  StyleSheet,
  Text,
  Alert,
  Animated,
  TouchableOpacity
} from 'react-native'

import React, { Component } from 'react'
import utils from '../utils/utils'
var translate = utils.translate
var constants = require('@tradle/constants');
const TYPE = constants.TYPE
const ORGANIZATION = constants.TYPES.ORGANIZATION

class NetworkInfoProvider extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let isOrg = this.props.resource  &&  this.props.resource[TYPE] === ORGANIZATION
    let providerOffline = this.props.resource  &&  isOrg  &&  !this.props.online
    let dn = this.props.resource
           ? this.props.isConnected
               ? translate('learnMoreDescriptionTo', utils.getDisplayName(this.props.resource))
               : translate('learnMoreServerIsDown', utils.getDisplayName(this.props.resource))
           : translate('learnMoreDescription')
    if (this.props.connected  &&  !providerOffline && !this.props.serverOffline)
      return <View/>

    let msg = this.props.connected
            ? (providerOffline ? translate('providerIsOffline', utils.getDisplayName(this.props.resource)) : translate('serverIsUnreachable'))
            : translate('noNetwork')

    return <View style={styles.bar}>
             <Text style={styles.text}>{msg}</Text>
             <TouchableOpacity onPress={() => Alert.alert(translate('offlineMode'), dn, null)}>
               <Text style={styles.text}>{translate('learnMore')}</Text>
             </TouchableOpacity>
           </View>
  }
}

var styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FF9B30',
    padding: 7,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  text: {
    fontSize: 18,
    color: '#ffffff',
    alignSelf: 'center',
    marginHorizontal: 10
  },
});

module.exports = NetworkInfoProvider
