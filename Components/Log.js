
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

class Log extends Component {
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
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        directionalLockEnabled={true}
        bounces={true}
        scrollsToTop={false}
      >
        <View style={styles.container}>
          <Text>{this.state.text}</Text>
        </View>
      </ScrollView>
    );
  }
}
reactMixin(Log.prototype, TimerMixin);

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  }
})
module.exports = Log