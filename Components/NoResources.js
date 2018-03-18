console.log('requiring NoResources.js')
'use strict'

import {
  Text,
  StyleSheet,
  View,
} from 'react-native'
import PropTypes from 'prop-types';
import utils from '../utils/utils'
import React, { Component } from 'react'

class NoResources extends Component {
  render() {
    var noRes
    if (this.props.filter)
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
    paddingVertical: 10
  },
  centerText: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  NoResourcesText: {
    // marginTop: height > 800 ? height/5 : height / 4,
    color: '#888888',
    fontSize: 18
  }
});

module.exports = NoResources;
