'use strict'

import {
  View,
  StyleSheet
} from 'react-native'

import React, { Component } from 'react'
import DatePicker from 'react-datepicker'
require('react-datepicker/dist/react-datepicker.css')

import moment from 'moment'

export default class DatePickerAdapter extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <DatePicker
      dateFormat={this.props.format}
      selected={moment(this.props.date)}
      placeholderText={this.props.placeholder}
      style={this.props.style}
      onChange={this.props.onDateChange}
    />
  }
}
