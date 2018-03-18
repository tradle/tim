console.log('requiring NoBacksies.js')
import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
