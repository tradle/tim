console.log('requiring NoBacksies.js')
import React, { PropTypes, Component } from 'react'
import {
  View,
  Text,
  StyleSheet
} from 'react-native'

export default class BackButtonDisabled extends Component {
  static backButtonDisabled = true;
  render() {
    return this.props.children
  }
}
