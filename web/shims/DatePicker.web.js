'use strict'

import {
  View,
  StyleSheet
} from 'react-native'

import React, { Component } from 'react'
import DatePicker from 'react-datepicker'

export default class DatePickerAdapter extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    <DatePicker
      dateFormat={this.props.format}
      selected={this.props.date}
      placeholderText={this.props.placeholder}
      style={this.props.style}
      onChange={this.props.onDateChange}
    />
  }
}
