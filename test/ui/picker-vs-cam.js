
import '../../utils/errors'
import '../../utils/shim'
import React, { Component } from 'react'
import {
  View,
  Text,
  Image,
  AppRegistry,
  TouchableOpacity,
  Dimensions
} from 'react-native'

import { RNCamera } from 'react-native-camera'
import ImageInput from '../../Components/ImageInput'

const pickDimensions = props => {
  const { width, height } = props
  return { width, height }
}

const getScreenDimensions = () => pickDimensions(Dimensions.get('window'))

const toFullScreenImage = ({ uri }) => ({
  uri,
  ...getScreenDimensions()
})

const toThumb = ({ uri }) => ({
  uri,
  width: 100,
  height: 100,
  // height: getScreenDimensions().height / 2,
  // width: getScreenDimensions().width
})

const defaultState = { previewWithBase64: true }

class PickerApp extends Component {
  state = defaultState
  render() {
    const { previewWithBase64 } = this.state
    return (
      <View style={styles.container}>
        <ImageInput
          prop={{}}
          style={styles.container}
          quality={0.5}
          onImage={img => {
            this.setState({
              image: toFullScreenImage({
                uri: previewWithBase64 ? img.url : img.file,
              })
            })
          }}
        >
          <View style={styles.container}>
            <Text style={styles.textStyle}>react-native-image-picker</Text>
            {this.state.image && <Image source={this.state.image} resizeMode='contain'/>}
          </View>
        </ImageInput>
      </View>
    )
  }
}

class CameraApp extends Component {
  state = defaultState
  render() {
    const button = (
      <TouchableOpacity onPress={() => {
        if (this.state.showCamera) {
          this.takePicture()
        } else {
          this.setState({ showCamera: true })
        }
      }}>
        <View>
          <Text style={styles.textStyle}>REACT-NATIVE-CAMERA</Text>
          {this.state.image && <Image source={this.state.image} resizeMode='contain'/>}
        </View>
      </TouchableOpacity>
    )

    if (this.state.showCamera) {
      return (
        <RNCamera
          ref='cam'
          style={styles.container}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          base64='true'
          >
          {button}
        </RNCamera>
      )
    }

    return (
      <View style={styles.container}>
        {button}
      </View>
    )
  }

  takePicture = async () => {
    const options = { quality: 0.5, base64: true };
    const data = await this.refs.cam.takePictureAsync(options);
    const { previewWithBase64 } = this.state
    this.setState({
      showCamera: false,
      image: toFullScreenImage({
        uri: previewWithBase64 ? 'data:image/jpeg;base64,' + data.base64 : data.uri,
      })
    })
  }
}

class App extends Component {
  state={}
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.setState({
          previewWithBase64: !this.state.previewWithBase64
        })} style={styles.container}>
          <Text style={styles.textStyle}>Preview with base64: {String(!!this.state.previewWithBase64)}</Text>
        </TouchableOpacity>
        <PickerApp previewWithBase64={this.state.previewWithBase64} />
        <CameraApp previewWithBase64={this.state.previewWithBase64} />
      </View>
    )
  }
}

AppRegistry.registerComponent('Tradle', function() {
  return PickerApp
  // return CameraApp
  // return App
});

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 25
  }
}
