'use strict'

import {
  View,
  StyleSheet,
  TouchableHighlight,
  Text
} from 'react-native'

import React, { Component } from 'react'
// import DatePicker from 'react-datepicker/dist/react-datepicker'
// require('react-datepicker/dist/react-datepicker.css')

import moment from 'moment'
import dateformat from 'dateformat'
import Actions from '../../Actions/Actions'
import createCalendarModal from '../../Components/CalendarModal'

export default class DatePickerAdapter extends Component {
  onPress() {
    const { onDateChange } = this.props
    Actions.showModal({
      contents: createCalendarModal({
        selectedDate: this.props.date || Date.now(),
        onConfirm: function (date) {
          Actions.hideModal()
          onDateChange(new Date(date))
        },
        onCancel: function () {
          Actions.hideModal()
        }
      })
    })
  }
  render() {
    const { date, customStyles } = this.props
    const dateString = date ? dateformat(date, 'UTC:mmm dS, yyyy') : this.props.placeholder
    const textStyle = customStyles && customStyles.placeholderText
    return (
      <TouchableHighlight underlayColor="transparent" style={this.props.style} onPress={() => this.onPress()}>
        <Text style={textStyle}>{dateString}</Text>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  fix: {
  }
})
