
import React, {
  Component
} from 'react'

import {
  TouchableHighlight,
  Platform,
} from 'react-native'
import PropTypes from 'prop-types'
import ImagePicker from 'react-native-image-picker'
import pick from 'lodash/pick'
import extend from 'lodash/extend'
const debug = require('debug')('tradle:app:ImageInput')

import utils, { translate } from '../utils/utils'
import ENV from '../utils/env'
import { normalizeImageCaptureData } from '../utils/image-utils'
import { requestCameraAccess } from '../utils/camera'

const imageInputPropTypes = {
  ...TouchableHighlight.propTypes,
  allowPicturesFromLibrary: PropTypes.bool,
  cameraType: PropTypes.string,
  nonImageAllowed: PropTypes.bool,
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
    const { allowPicturesFromLibrary, cameraType, onImage, quality } = this.props
    let options = {
      returnIsVertical: true,
      quality,
      cameraType: cameraType || 'back',
      cancelButtonTitle: translate('cancel'),
      // due to out-of-memory issues
      // maxWidth: 1536,
      // maxHeight: 1536,
      noData: Platform.OS !== 'web',
      addToImageStore: true,
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
    else if (!allowPicturesFromLibrary)
      action = 'launchCamera'
    else {
      action = 'showImagePicker'
      extend(options, {
        chooseFromLibraryButtonTitle: 'Choose from Library',
        takePhotoButtonTitle: 'Take Photo…',
      })
    }

    const allowed = requestCameraAccess()
    if (!allowed) return

    ImagePicker[action](options, async ({ didCancel, error, data, isVertical, width, height, imageTag }) => {
      if (didCancel) return
      if (error) {
        console.log('ImagePickerManager Error: ', error);
        return
      }

      const normalized = await normalizeImageCaptureData({
        extension: quality === 1 ? 'png' : 'jpeg',
        base64: data,
        isVertical,
        width,
        height,
        imageTag,
      })

      if (Platform.OS !== 'web') {
        normalized.url = await require('../utils/keeper')
          .getGlobalKeeper()
          .importFromImageStore(imageTag)
      }

      const result = pick(normalized, ['isVertical', 'width', 'height', 'url'])
      onImage(result)
    })
  }
}

module.exports = ImageInput
