console.log('requiring Log.js')

import debug from '../utils/debug'
import React, { Component } from 'react'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'

import {
  View,
  ScrollView,
  Text,
  StyleSheet
} from 'react-native'

export default class Log extends Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.state = {
      text: debug.getText(),
    }
   }
  componentWillMount() {
    debug.on('change', this.onChange)
  }
  componentWillUnmount() {
    clearTimeout(this._updateTimeout)
    debug.removeListener('change', this.onChange)
  }
  onChange(line) {
    line = debug.lineToPlainText(line)

    // debounce a bit
    clearTimeout(this._updateTimeout)
    this._updateTimeout = this.setTimeout(() => {
      const newState = {
        text: this.state.text + '\n' + line,
      }

      this.setState(newState)
    }, 50)
  }
  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          directionalLockEnabled={true}
          bounces={true}
          scrollsToTop={false}
        >
          <Text>{this.state.text}</Text>
        </ScrollView>
      </View>
    );
  }
}
reactMixin(Log.prototype, TimerMixin);

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
})
