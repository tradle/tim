
import React, {
  Component
} from 'react'

import {
  TouchableHighlight,
} from 'react-native'
import PropTypes from 'prop-types'
import ImagePicker from 'react-native-image-picker'
import _ from 'lodash'
const debug = require('debug')('tradle:app:ImageInput')

import utils, { translate } from '../utils/utils'
import ENV from '../utils/env'
import { normalizeImageCaptureData } from '../utils/image-utils'
import { requestCameraAccess } from '../utils/camera'

const imageInputPropTypes = {
  ...TouchableHighlight.propTypes,
  prop: PropTypes.string.isRequired,
  onImage: PropTypes.func.isRequired
}

class ImageInput extends Component {
  static propTypes = imageInputPropTypes;
  static defaultProps = {
    quality: ENV.imageQuality,
  }

  constructor(props) {
    super(props)
    this.showImagePicker = this.showImagePicker.bind(this)
  }
  render() {
    const touchableProps = { ...this.props }
    delete touchableProps.prop
    delete touchableProps.onImage

    const onPress = this.props.onPress || this.showImagePicker
    // allow override onPress
    return (
      <TouchableHighlight
        underlayColor='transparent'
        {...touchableProps}
        onPress={onPress}>
        {this.props.children}
      </TouchableHighlight>
    )
  }
  async showImagePicker() {
    if (this._active) {
      return debug('ignoring showImagePicker() request, as it is already active')
    }

    this._active = true
    try {
      await this._doShowImagePicker()
    } finally {
      this._active = false
    }
  }
  async _doShowImagePicker () {
    const { prop, onImage, quality } = this.props
    let options = {
      returnIsVertical: true,
      quality,
      cameraType: this.props.prop.cameraType || 'back',
      cancelButtonTitle: translate('cancel'),
      // due to out-of-memory issues
      // maxWidth: 1536,
      // maxHeight: 1536,
      storageOptions: {
        skipBackup: true,
        store: false
      },
      // not needed for jpeg
      // fixOrientation: false
    }

    let action
    if (utils.isIOS() && utils.isSimulator())
      action = 'launchImageLibrary'
    else if (!prop.allowPicturesFromLibrary)
      action = 'launchCamera'
    else {
      action = 'showImagePicker'
      _.extend(options, {
        chooseFromLibraryButtonTitle: 'Choose from Library',
        takePhotoButtonTitle: 'Take Photo…',
      })
    }

    const allowed = requestCameraAccess()
    if (!allowed) return

    ImagePicker[action](options, (response) => {
      if (response.didCancel)
        return

      if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        return
      }

      const data = normalizeImageCaptureData({
        extension: quality === 1 ? 'png' : 'jpeg',
        base64: response.data,
        isVertical: response.isVertical,
        width: response.width,
        height: response.height
      })

      onImage({
        ...data,
        url: data.base64,
      })
    })
  }
}

module.exports = ImageInput
