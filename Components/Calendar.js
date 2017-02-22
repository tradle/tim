import React, { Component, PropTypes } from 'react'
import {
  View,
  StyleSheet
} from 'react-native'

import InfiniteCalendar from 'react-infinite-calendar'
import 'react-infinite-calendar/styles.css'
import { makeResponsive } from 'react-native-orient'

// var today = new Date();
// var minDate = Number(new Date()) - (24*60*60*1000) * 7; // One week before today

const noop = function () {}
const ERROR_CANCELED = new Error('canceled')

class Calendar extends Component {
  static propTypes = {
    onDate: PropTypes.func.isRequired,
    ...InfiniteCalendar.propTypes
  };

  static defaultProps = {
    selectedDate: Date.now(),
    keyboardSupport: true
  };

  constructor(props) {
    super(props)
    this.state = {
      selectedDate: props.selectedDate
    }
  }

  onConfirm () {
    this.props.onDate(selectedDate)
  }

  onSelect (selectedDate) {
    this.setState({
      selectedDate: selectedDate.toDate().getTime()
    })
  }

  render() {
    let { width, height, ...rest } = this.props

    width *= 0.8
    height -= 250

    return (
      <View style={styles.container}>
        <InfiniteCalendar
          selectedDate={this.state.selectedDate}
          afterSelect={date => this.onSelect(date)}
          width={width}
          height={height}
          { ...rest }
        />
      </View>
    )
  }
}

module.exports = makeResponsive(Calendar)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 30
  }
})
