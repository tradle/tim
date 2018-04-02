console.log('requiring NoResources.js')
'use strict'

import {
  Text,
  StyleSheet,
  View,
} from 'react-native'
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons'
import utils from '../utils/utils'
import React, { Component } from 'react'

class NoResources extends Component {
  render() {
    var noRes
    if (this.props.message) {
      let icon = this.props.icon
      let message = this.props.message
      if (!icon)
        noRes = <Text style={styles.NoResourcesTextBlue}>{message}</Text>
      else {
        let idx = message.indexOf('{icon}')
        noRes = <Text style={styles.NoResourcesTextBlue}>{message.substring(0, idx) + ' '}
                  <View style={this.props.iconStyle || {}}>
                    <Icon name={icon} color={this.props.iconColor || '#7AAAC2'} size={this.props.iconSize || 20} />
                  </View>
                  <Text style={styles.NoResourcesTextBlue}>{' ' + message.substring(idx + 6)}</Text>
                </Text>
      }
    }
    else if (this.props.filter)
      noRes = <Text style={styles.NoResourcesText}>{`No results for “${this.props.filter}”`}</Text>
    else if (!this.props.isLoading)
      // If we're looking at the latest resources, aren't currently loading, and
      // still have no results, show a message
      noRes = <Text style={styles.NoResourcesText}>{'Empty list'}</Text>
    else
      return <View />
    return (
      <View style={[styles.container, styles.centerText]}>
        {noRes}
      </View>
    );
  }

}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    marginTop: 100,
    maxWidth: 360,
    paddingHorizontal: 30
  },
  centerText: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  NoResourcesTextBlue: {
    // marginTop: height > 800 ? height/5 : height / 4,
    color: '#7AAAC2',
    fontSize: 25
  },
  NoResourcesText: {
    // marginTop: height > 800 ? height/5 : height / 4,
    color: '#888888',
    fontSize: 18
  }
});

module.exports = NoResources;
