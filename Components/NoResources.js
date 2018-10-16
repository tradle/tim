import {
  Text,
  StyleSheet,
  View,
} from 'react-native'
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons'

import React, { Component } from 'react'
class NoResources extends Component {
  static propTypes = {
    filter: PropTypes.string,
    message: PropTypes.string,
    icon: PropTypes.string,
    iconColor: PropTypes.string,
    iconSize: PropTypes.number,
    iconStyle: PropTypes.object,
    isLoading: PropTypes.bool
  };
  render() {
    let noRes
    let { message, filter, icon, iconColor, iconStyle, iconSize, isLoading } = this.props
    if (message) {
      let idx = message.indexOf('{icon}')
      if (!icon  &&  idx === -1)
        noRes = <Text style={styles.NoResourcesTextBlue}>{message}</Text>
      else {
        let iconComponent = icon  &&  <View style={iconStyle || {}}>
                    <Icon name={icon} color={iconColor || '#7AAAC2'} size={iconSize || 20} />
                  </View>
        let msg1 = message.substring(0, idx).trim()
        let msg2 = message.substring(idx + 6)
        if (!icon)
          msg2 = msg2.trim()
        noRes = <Text style={styles.NoResourcesTextBlue}>{msg1 + ' '}
                  {iconComponent}
                  <Text style={styles.NoResourcesTextBlue}>{msg2}</Text>
                </Text>
      }
    }
    else if (filter)
      noRes = <Text style={styles.NoResourcesText}>{`No results for “${filter}”`}</Text>
    else if (!isLoading)
      // If we're looking at the latest resources, aren't currently loading, and
      // still have no results, show a message
      noRes = <Text style={styles.NoResourcesText}>{'Empty list'}</Text>
    if (noRes)
      return (
        <View style={[styles.container, styles.centerText]}>
          {noRes}
          {this.props.children}
        </View>
      );
  }

}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    // marginTop: 100,
    maxWidth: 360,
    paddingLeft: 30,
    paddingRight:10
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
