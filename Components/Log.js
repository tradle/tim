console.log('requiring Log.js')

import debug from '../utils/debug'
import React, { Component } from 'react'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'

import {
  View,
  ListView,
  Text,
  StyleSheet
} from 'react-native'
import PropTypes from 'prop-types'

export default class Log extends Component {
  constructor(props) {
    super(props)
    this.onChange = this.onChange.bind(this)
    this.renderRow = this.renderRow.bind(this)
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
    this.state = {
      log: ds.cloneWithRows(debug.get())
    }
   }
  componentWillMount() {
    this._unmounting = false
    debug.on('change', this.onChange)
  }
  componentDidMount() {
    if (this._updateOnMount) {
      this._updateOnMount = false
      this.setState(this.state)
    }
  }
  componentWillUnmount() {
    this._unmounting = true
    debug.removeListener('change', this.onChange)
  }
  componentWillUpdate() {
    this._unmounting = false
  }
  onChange(line) {
    const self = this

    // debounce a bit
    clearTimeout(this._updateTimeout)
    this._updateTimeout = this.setTimeout(function () {
      const lines = debug.get()
      self.state = {
        lines,
        log: self.state.log.cloneWithRows(lines)
      }

      if (self._unmounting) {
        self._updateOnMount = true
      } else {
        self.setState(self.state)
      }
    }, 50)
  }
  render() {
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.log}
          renderRow={this.renderRow}
        />
      </View>
    );
  }
  renderRow(line) {
    const color = debug.getColor(line)
    line = debug.stripColors(line)

    return line.length && (
      <Text style={{color, fontSize:10}}>
        {line.join(' ')}
      </Text>
    )
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
