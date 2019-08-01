import defaults from 'lodash/defaults'
import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions
} from 'react-native'

import InfiniteCalendar from 'react-infinite-calendar'
import 'react-infinite-calendar/styles.css'
import dateformat from 'dateformat'

const DEFAULT_MIN_DATE = new Date('1900/01/01')

module.exports = function createCalendarModal (props) {
  const screen = Dimensions.get('window')
  // let minDim = Math.min(screen.width, screen.height)
  // if (minDim === screen.height) minDim -= 250

  let {
    onCancel,
    onConfirm,
    width=screen.width * 0.8,
    height=screen.height * 0.5,
    animationType='slide',
    ...calendarProps
  } = props

  if (!(onConfirm && onCancel)) {
    throw new Error('expected "onConfirm" and "onCancel" functions')
  }

  const display = calendarProps.display || 'years'
  const locale = calendarProps.locale || getDefaultLocaleForDisplay(display)

  // sensible defaults
  const selDate = props.selectedDate ||  new Date()
  calendarProps = defaults(calendarProps, {
    display,
    locale,
    theme: defaultTheme,
    showTodayHelper: false,
    selectedDate: selDate,
    selected: dateformat(new Date(selDate), 'yyyy-mm-dd'),
    minDate: DEFAULT_MIN_DATE,
  })

  // don't render dates outside allowed range
  if (calendarProps.minDate) {
    calendarProps.min = calendarProps.minDate
  }

  if (calendarProps.maxDate) {
    calendarProps.max = calendarProps.maxDate
  }

  let { theme, selectedDate } = calendarProps
  if (selectedDate.getTime) {
    selectedDate = selectedDate.getTime()
  }

  const okButtonStyle = {
    backgroundColor: theme.selectionColor
  }

  const okTextStyle = {
    color: theme.textColor.active
  }

  return (
    <Modal animationType={animationType}>
      <View style={styles.container}>
        <View style={styles.box}>
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: '#333' /*calendarProps.theme.headerColor*/ }]}>
              Scroll to find the right date
            </Text>
          </View>
          <InfiniteCalendar
            onSelect={onSelect}
            width={width}
            height={height}
            {...calendarProps}
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={() => onCancel()} style={[styles.button, styles.cancel]}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(selectedDate)} style={[styles.button, okButtonStyle]}>
              <Text style={okTextStyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  function onSelect (date) {
    // throw out timezone data
    selectedDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10
  },
  header: {
    fontSize: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  box: {
    padding: 20,
    // maxWidth: 600,
    backgroundColor: '#ffffff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 10, height: 10 },
    // boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)'
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10
  },
  button: {
    flex: 1,
    alignItems: 'center',
    // borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eeeeee',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  cancel: {
    marginRight: 5
  },
  ok: {
    marginLeft: 5
  }
})

const defaultTheme = {
  textColor: {
    default: '#333',
    active: '#FFF'
  },
  selectionColor: '#559FFF',
  todayColor: '#FFA726',
  weekdayColor: '#559FFF',
  headerColor: '#448AFF',
  floatingNav: {
    background: 'rgba(56, 87, 138, 0.94)',
    color: '#FFF',
    chevron: '#FFA726'
  }
}

const usLocale = {
  name: 'en',
  todayLabel: {
    long: 'Today'
  },
  blank: 'Select a date...',
  headerFormat: 'ddd, MMM Do',
  week: {
    dow: 0,
    doy: 4
  }
}

const euLocale = {
  name: 'en',
  todayLabel: {
    long: 'Today'
  },
  blank: 'Select a date...',
  headerFormat: 'ddd, MMM Do',
  week: {
    dow: 1,
    doy: 4
  }
}

function getDefaultLocaleForDisplay (display) {
  if (display === 'years') {
    return {
      ...euLocale,
      blank: 'Select a year'
    }
  }

  return euLocale
}
