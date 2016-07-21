'use strict'

import {
  View,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native'

import utils from '../utils/utils'
var translate = utils.translate
import React, { Component } from 'react'

class NetworkInfoProvider extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let dn = this.props.resource
           ? translate('learnMoreDescriptionTo', utils.getDisplayName(this.props.resource))
           : translate('learnMoreDescription')
    return this.props.connected
          ? <View/>
          : <View style={styles.bar}>
              <Text style={styles.text}>{translate('noNetwork')}</Text>
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
