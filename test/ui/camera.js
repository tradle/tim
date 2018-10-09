import '../../utils/shim'
import React from 'react'
import {
  Alert,
  AppRegistry,
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
} from 'react-native'

// import { RNCamera } from 'react-native-camera'
import promisify from 'pify'
import SplashScreen from 'react-native-splash-screen'
import CameraView from '../../Components/CameraView'
import ImagePicker from 'react-native-image-picker'
import utils from '../../utils/utils'

if (SplashScreen) {
  SplashScreen.hide()
}

const fakeNav = {
  pop: () => {}
}

const time = (fn, name) => async function (...args) {
  const start = Date.now()
  try {
    return fn.apply(this, args)
  } finally {
    console.log(`TIMED FUNCTION ${name} toom ${(Date.now() - start)} ms`)
  }
}

const normalizeImageData = data => ({
  ...data,
  base64: utils.createDataUri({
    extension: data.extension,
    base64: data.base64,
  }),
})

class CameraTest extends React.Component {
  static defaultProps = {
    quality: 0.5,
    cameraType: 'back',
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    if (this.state.camera) {
      return this.renderCamera()
    }

    return (
      <View style={styles.container}>
        <TouchableHighlight style={styles.button} key="image-picker" onPress={() => this.useImagePicker()}>
          <Text>Image Picker</Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.button} key="camera" onPress={() => this.useCamera()}>
          <Text>Camera</Text>
        </TouchableHighlight>
      </View>
    )
  }

  useImagePicker = () => {
    ImagePicker.launchCamera({
      returnIsVertical: true,
      quality: this.props.quality,
      cameraType: this.props.cameraType || 'back',
      // due to out-of-memory issues
      // maxWidth: 1536,
      // maxHeight: 1536,
      storageOptions: {
        skipBackup: true,
        store: false
      },

    }, ({ error, data }) => {
      if (error) return Alert.alert('Error', error)

      this.onImage({ base64: data })
    })
  }

  useCamera = () => this.setState({ camera: true })

  renderCamera = () => {
    return (
      <CameraView
        navigator={fakeNav}
        cameraType="front"
        onTakePic={data => this.onImage(data)}
      />
    )
  }

  onImage(data) {
    data.extension = this.props.quality === 1 ? 'png' : 'jpeg'
    data = normalizeImageData(data)
    Alert.alert('took pic', `length: ${data.base64.length}, prefix: ${data.base64.slice(0, 100)}`)
    this.setState({ camera: false })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'column',
    // backgroundColor: 'black'
  },
  button: {
    flex: 1,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  }
})

AppRegistry.registerComponent('Tradle', () => CameraTest)
