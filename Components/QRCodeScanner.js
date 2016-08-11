
import {
  StyleSheet,
  TouchableHighlight,
  Platform
} from 'react-native'

import React, { Component, PropTypes } from 'react'
import utils from '../utils/utils'

var Camera = utils.isWeb() ? null : require('react-native-camera').default

var ICON_BORDER_COLOR = '#D7E6ED'
var Icon = require('react-native-vector-icons/Ionicons')
var Dir = Camera && Camera.Type

class QRCodeScanner extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cameraType: Camera.constants.Type.back
    }
  }
  propTypes: {
    onread: PropTypes.func.isRequired
  }
    // !(element && (typeof element.type === 'function' || typeof element.type === 'string'))
    // ? process.env.NODE_ENV !== 'production'
    //       ? invariant(false, 'Element type is invalid: expected a string (for built-in components) ' + 'or a class/function (for composite components) but got: %s.%s', element.type == null
    //         ? element.type
    //         : typeof element.type, getDeclarationErrorAddendum(element._owner))
    //       : invariant(false)
    // : void 0;


  render() {
    return (
      <Camera
        style={styles.container}
        onBarCodeRead={this._onBarCodeRead.bind(this)}
        ref={(cam) => {
            this.camera = cam;
          }}
        type={this.state.cameraType}>
        <TouchableHighlight onPress={this._switchCamera.bind(this)} style={styles.flip}>
          <Icon name='ios-reverse-camera' size={25} color='#eeeeee' style={styles.icon} />
        </TouchableHighlight>
      </Camera>
    )
  }
  _onBarCodeRead(e) {
    if (this._finished) return

    this.props.onread(e)
    this._finished = true
  }
  _switchCamera() {
    var cameraType = this.state.cameraType === Dir.back ? Dir.front : Dir.back
    this.setState({cameraType})
  }
}

var styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  icon: {
    width: 30,
    height: 30
  },
  flip: {
    position: 'absolute',
    top: 30,
    right: 10
  }
}

module.exports = Camera && QRCodeScanner
