'use strict';

import {
  StyleSheet,
  View,
  Text
} from 'react-native'

import React, { Component, PropTypes } from 'react'
import Dropzone from 'react-dropzone'
import utils from '../utils/utils'

class DropPage extends Component {
  static propTypes = Dropzone.propTypes;
  static defaultProps = Dropzone.defaultProps;

  constructor(props) {
    super(props)
    this.state = { active: false }
    this.onDrop = this.onDrop.bind(this)
  }

  onDrop(...args) {
    this.setState({ active: false })
    this.props.onDrop(...args)
  }

  onDragEvent(event) {
    const active = event !== 'leave'
    if (active !== this.state.active) {
      this.setState({ active })
    }
  }

  render() {
    console.log('DROPPAGE active', this.state.active)
    let overlay
    if (this.state.active) {
      overlay = <View style={styles.overlay} />
    }

    return (
      <Dropzone
        style={this.props.style}
        onDragStart={() => this.onDragEvent('start')}
        onDragEnter={() => this.onDragEvent('enter')}
        onDragLeave={() => this.onDragEvent('leave')}
        onDragOver={() => this.onDragEvent('over')}
        onDrop={this.onDrop}
        disableClick="true"
      >
        {overlay}
        <View style={styles.inner}>
          {this.props.children}
        </View>
      </Dropzone>
    )
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 100, 0, 0.2)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgb(0, 100, 0)'
  },
  inner: {
    flex: 1,
    height: '100%'
  },
  separator: {
    borderColor: 'transparent',
    borderTopColor: '#eeeeee',
    borderWidth: StyleSheet.hairlineWidth
  },
})

module.exports = DropPage
