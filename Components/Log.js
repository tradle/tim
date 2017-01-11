
import debug from '../utils/debug'
import React, { Component } from 'react'
import {
  View,
  ListView,
  Text,
  StyleSheet
} from 'react-native'

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
    debug.on('change', this.onChange)
  }
  componentWillUnmount() {
    debug.removeListener('change', this.onChange)
  }
  onChange(line) {
    // debounce a bit
    clearTimeout(this._updateTimeout)
    this._updateTimeout = setTimeout(() => {
      const lines = debug.get()
      this.setState({
        lines,
        log: this.state.log.cloneWithRows(lines)
      })
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
      <Text style={{color, fontSize:10, flex: 1}}>
        {line.join(' ')}
      </Text>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
})
