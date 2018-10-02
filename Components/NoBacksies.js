console.log('requiring NoBacksies.js')
import React, { Component } from 'react';

export default class BackButtonDisabled extends Component {
  static backButtonDisabled = true;
  render() {
    return this.props.children
  }
}
