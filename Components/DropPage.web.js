'use strict';

import {
  StyleSheet,
  View,
  Text,
  Dimensions
} from 'react-native'

import React, { Component, PropTypes } from 'react'
import Dropzone from 'react-dropzone'
import { makeResponsive } from 'react-native-orient'
import deepEqual from 'deep-equal'
import utils from '../utils/utils'
import { navBarHeight } from '../utils/env'

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

  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextState, this.state) || !deepEqual(nextProps, this.props)
  }

  render() {
    const height = Dimensions.get('window').height - navBarHeight
    let overlay
    if (this.state.active) {
      overlay = <View style={[styles.overlay, { height }]} />
    }

    return (
      <Dropzone
        {...this.props}
        onDragStart={() => this.onDragEvent('start')}
        onDragEnter={() => this.onDragEvent('enter')}
        onDragLeave={() => this.onDragEvent('leave')}
        onDragOver={() => this.onDragEvent('over')}
        onDrop={this.onDrop}
        disableClick={true}
      >
        {overlay}
        <View style={[styles.inner, { height }]}>
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
    flexGrow: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 100, 0, 0.2)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgb(0, 100, 0)'
  },
  inner: {
    flexGrow: 1
  },
  separator: {
    borderColor: 'transparent',
    borderTopColor: '#eeeeee',
    borderWidth: StyleSheet.hairlineWidth
  },
})

module.exports = makeResponsive(DropPage)
