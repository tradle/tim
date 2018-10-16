import {
  TouchableHighlight
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import Camera from 'react-native-camera'
import debounce from 'debounce'

import Icon from 'react-native-vector-icons/Ionicons'
var Dir = Camera.constants.Type

class QRCodeScanner extends Component {
  static displayName = 'QRCodeScanner';
  constructor(props) {
    super(props)
    this.state = {
      cameraType: Camera.constants.Type.back,
      scanned: false
    }

    this._onBarCodeRead = debounce(this._onBarCodeRead.bind(this), 500, true)
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
        captureAudio={false}
        onBarCodeRead={this._onBarCodeRead}
        ref={(cam) => {
            this.camera = cam;
          }}
        type={this.state.cameraType}>
        <TouchableHighlight onPress={this._switchCamera.bind(this)} style={styles.flip}>
          <Icon name='ios-reverse-camera' size={30} color='#eeeeee' />
        </TouchableHighlight>
      </Camera>
    )
  }
  _onBarCodeRead(e) {
    if (this.state.scanned) return

    this.setState({
      scanned: true
    }, async () => {
      const done = await this.props.onread(e)
      if (done === false) {
        this.setState({ scanned: false })
      }
    })
  }
  _switchCamera() {
    var cameraType = this.state.cameraType === Dir.back ? Dir.front : Dir.back
    this.setState({cameraType})
  }
}

var styles = {
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'transparent',
  },
  flip: {
    position: 'absolute',
    top: 30,
    right: 10
  }
}

module.exports = QRCodeScanner
