'use strict'

import {
  View,
  StyleSheet
} from 'react-native'

import React, { Component } from 'react'
import DatePicker from 'react-datepicker/dist/react-datepicker'
require('react-datepicker/dist/react-datepicker.css')

import moment from 'moment'

export default class DatePickerAdapter extends Component {
  render() {
    return <DatePicker
      dateFormat={this.props.format}
      selected={this.props.date && moment(this.props.date)}
      placeholderText={this.props.placeholder}
      style={this.props.style}
      onChange={this.props.onDateChange}
    />
  }
}
