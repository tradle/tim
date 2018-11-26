
import PropTypes from 'prop-types';
import React, { Component } from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Text
} from 'react-native'

import Camera from 'react-webcam'
import Icon from 'react-native-vector-icons/Ionicons'
import { makeResponsive, getDimensions } from 'react-native-orient'
import { translate, getFontSize } from '../utils/utils'
import { normalizeImageCaptureData } from '../utils/image-utils'

const debug = require('debug')('tradle:app:camera')
const ICON_COLOR = '#77ADFC'
const BG_COLOR = '#fff'
const DEFAULT_ASPECT_RATIO = 1.33333

class CameraView extends Component {
  static propTypes = {
    callback: PropTypes.func.isRequired,
    screenshotFormat: PropTypes.oneOf(['image/jpeg', 'image/png']),
    getUserMediaUnknownError: PropTypes.string,
    getUserMediaPermissionError: PropTypes.string,
  };

  static defaultProps = {
    screenshotFormat: 'image/jpeg',
    getUserMediaUnknownError: translate('getUserMediaUnknownError'),
    getUserMediaPermissionError: translate('getUserMediaPermissionError')
  };

  constructor(props) {
    super(props)
    this.state = {}
  }

  async capture() {
    const canvas = this.refs.cam.getCanvas()
    const { width, height } = canvas
    const base64 = canvas.toDataURL(this.props.screenshotFormat)
    const photo = await normalizeImageCaptureData({ base64, width, height })
    this.setState({ photo })
  }
  renderShootButtons() {
    return (
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => this.capture()}>
          <Icon name='ios-camera' size={80} color={ICON_COLOR} />
        </TouchableOpacity>
      </View>
    )
  }
  renderConfirmButtons() {
    return (
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => this.setState({ photo: null })}>
          <Icon name='ios-close' size={50} color={ICON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.callback(null, this.state.photo)}>
          <Icon name='ios-checkmark' size={50} color={ICON_COLOR} />
        </TouchableOpacity>
      </View>
    )
  }
  renderButtons() {
    if (this.state.photo) {
      return this.renderConfirmButtons()
    } else {
      return this.renderShootButtons()
    }
  }
  renderCamera() {
    const { width, height } = getCameraDimensions(this)
    return (
      <Camera
        ref='cam'
        screenshotFormat={this.props.screenshotFormat}
        audio={false}
        video={true}
        style={styles.camera}
        width={width}
        height={height}
        onUserMedia={userMediaError => {
          if (userMediaError) {
            debug('getUserMedia error', userMediaError)
            this.setState({ userMediaError })
          }
        }}
      />
    )
  }

  renderError() {
    const error = this.state.userMediaError
    const message = error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError'
      ? this.props.getUserMediaPermissionError
      : this.props.getUserMediaUnknownError

    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{message}</Text>
        </View>
      </View>
    )
  }

  render() {
    const error = this.state.userMediaError
    if (error) return this.renderError()

    let media
    if (this.state.photo) {
      const { url, width, height } = this.state.photo
      media = <Image source={{uri: url}} style={{width, height}} />
    } else {
      media = this.renderCamera()
    }

    const dimensions = getDimensions(this)
    const width = dimensions.width / 2
    return (
      <View style={styles.container}>
        {media}
        <View style={{ width }}>
          {this.renderButtons()}
        </View>
        <canvas ref="canvas" style={canvasStyle}></canvas>
      </View>
    )
  }
}

function getCameraDimensions (component, ratio=DEFAULT_ASPECT_RATIO) {
  const dimensions = getDimensions(this)
  let { width, height } = dimensions
  if (height * ratio > width) {
    height = width / ratio
  }

  height = Math.min(height, dimensions.height - 200)
  width = height * ratio
  return { width, height }
}

CameraView = makeResponsive(CameraView)
module.exports = CameraView

// mus be plain object
const canvasStyle = {
  width: 0,
  height: 0
}

const styles = {
  container: {
    flex: 1,
    marginTop: 64,
    backgroundColor: BG_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: '#eeeeee',
    borderTopWidth: StyleSheet.hairlineWidth
  },
  camera: {
  },
  buttonsContainer: {
    bottom: 0,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  errorContainer: {
    paddingHorizontal: 50
  },
  error: {
    fontSize: getFontSize(30)
  }
}
