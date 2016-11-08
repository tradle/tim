
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
import extend from 'extend'

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
    let options = {returnIsVertical: true, quality: utils.imageQuality}
    if (utils.isSimulator())
      ImagePicker.launchImageLibrary(options, (response) => this.respond(response))
    else if (!prop._allowPicturesFromLibrary)
      ImagePicker.launchCamera(options, (response) => this.respond(response))
    else {
      extend(options, {
        chooseFromLibraryButtonTitle: 'Choose from Library',
        takePhotoButtonTitle: 'Take Photo…',
      })
      ImagePicker.showImagePicker(options, (response) => this.respond(response))
    }
  }
  respond(response) {
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
  }
}

module.exports = ImageInput
