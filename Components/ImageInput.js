
import React, {
  Component,
  PropTypes
} from 'react'

import {
  Platform,
  TouchableHighlight
} from 'react-native'

import ImagePicker from 'react-native-image-picker'
import utils from '../utils/utils'

const imageInputPropTypes = {
  ...TouchableHighlight.propTypes,
  prop: PropTypes.string.isRequired,
  onImage: PropTypes.func.isRequired
}

class ImageInput extends Component {
  props: imageInputPropTypes;
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
  showImagePicker() {
    const { prop, onImage } = this.props
    ImagePicker.showImagePicker({
      returnIsVertical: true,
      chooseFromLibraryButtonTitle: utils.isSimulator() || prop._allowPicturesFromLibrary ? 'Choose from Library' : null,
      takePhotoButtonTitle: utils.isSimulator() ? null : 'Take Photo…',
      quality: utils.imageQuality
    }, (response) => {
      if (response.didCancel) {
        return// onImage(new Error('canceled'))
      }

      if (response.error) {
        console.log('ImagePickerManager Error: ', response.error);
        return// onImage(new Error(response.error))
      }

      onImage({
        // title: 'photo',
        url: 'data:image/jpeg;base64,' + response.data,
        isVertical: response.isVertical,
        width: response.width,
        height: response.height,
        chooseFromLibraryButtonTitle: ''
      })
    })
  }
}

module.exports = ImageInput
