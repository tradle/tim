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
        minDate: this.props.minDate,
        maxDate: this.props.maxDate,
        selectedDate: this.props.date || this.props.maxDate || new Date(),
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
    const { date, customStyles, format } = this.props
    let dateFormat = format === 'LL' && 'mmm dS, yyyy' || format
    const dateString = date ? dateformat(date, dateFormat) : this.props.placeholder
    const textStyle = customStyles && customStyles.placeholderText
    // return (
    //   <TouchableHighlight underlayColor="transparent" style={this.props.style} onPress={() => this.onPress()}>
    //     <View>
    //       <Text style={textStyle}>{dateString}</Text>
    //       <input style={styles.hidden} type="text" onFocus={() => this.onPress()} />
    //     </View>
    //   </TouchableHighlight>
    // )
    return (
      <TouchableHighlight underlayColor="transparent" style={this.props.style} onPress={() => this.onPress()}>
        <View>
          <Text style={textStyle}>{dateString}</Text>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = {
  fix: {
  },
  hidden: {
    width: 0,
    height: 0
  }
}
