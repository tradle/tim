
import React, { Component } from 'react'
import {
  Dimensions,
  // View
} from 'react-native'

import Orientation from 'react-native-orientation'

var orientation = Orientation.getInitialOrientation()
Orientation.addOrientationListener(o => orientation = o)

module.exports = function (WrappedComponent) {
  return class Responsive extends WrappedComponent {
    constructor(props) {
      super(props)
      this._updateOrientation = this._updateOrientation.bind(this)
      this.state = { orientation, ...Dimensions.get('window') }
    }
    componentWillMount() {
      Orientation.addOrientationListener(this._updateOrientation)
    }
    componentWillUnmount() {
      Orientation.removeOrientationListener(this._updateOrientation)
    }
    _updateOrientation(orientation) {
      this.setState({ orientation, ...Dimensions.get('window') })
    }
    shouldComponentUpdate(newProps, newState) {
      for (var p in newProps) {
        if (newProps[p] !== this.props[p]) return true
      }

      for (var p in newState) {
        if (newState[p] !== this.state[p]) return true
      }

      return false
    }
    render() {
      return (
        <WrappedComponent {...this.props} {...this.state} />
      )
    }
  }
}
