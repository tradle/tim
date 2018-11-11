import '../../utils/shim'
import React, { Component } from 'react'
import {
  Alert,
  AppRegistry,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TouchableHighlight,
} from 'react-native'

// import { RNCamera } from 'react-native-camera'
import promisify from 'pify'
import SplashScreen from 'react-native-splash-screen'
import CameraView from '../../Components/CameraView'
// import ImagePicker from 'react-native-image-picker'
import utils from '../../utils/utils'
import { capture as defaultCapture } from '../../utils/camera'
import { capture as useCamera} from '../../utils/camera.rncamera'
import { capture as useImagePicker } from '../../utils/camera.imagepicker'
import Navigator from '../../Components/Navigator'

if (SplashScreen && SplashScreen.hide) {
  SplashScreen.hide()
}

const time = (fn, name) => async function (...args) {
  const start = Date.now()
  try {
    return fn.apply(this, args)
  } finally {
    console.log(`TIMED FUNCTION ${name} toom ${(Date.now() - start)} ms`)
  }
}

class CameraTest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initialRoute: {
        component: MainRoute,
        passProps: {
          cameraType: 'front',
        }
      }
    }

    // this.renderScene = this.renderScene.bind(this)
  }

  render() {
    return (
      <Navigator
        style={styles.container}
        initialRoute={this.state.initialRoute}
        renderScene={({ passProps={}, component }, navigator) => {
          const props = { ...passProps, navigator }
          if (component === MainRoute) {
            return <MainRoute {...props} />
          }

          if (component === CameraView) {
            return <CameraView {...props} />
          }

          throw new Error('no component passed to navigator!')
        }}
      />
    )
  }

  // renderScene({ component, passProps={} }, navigator) {
  //   const instance = new component({
  //     ...passProps,
  //     navigator,
  //   })

  //   return instance
  // }
}

class MainRoute extends Component {
  static defaultProps = {
    quality: 1,
    cameraType: 'back',
    useBase64: false,
  }

  state = {
    camera: false,
    preview: null,
  }

  constructor(props) {
    super(props)
    this.captureWith = fn => async () => {
      const start = Date.now()
      const image = await fn({
        ...props,
        returnBase64: props.useBase64,
        saveToFS: !props.useBase64,
      })

      if (image) {
        this.onImage({ ...image, time: Date.now() - start })
      }
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        {this.renderPreview()}
        <TouchableHighlight style={styles.button} key="image-picker" onPress={this.captureWith(useImagePicker)}>
          <Text>Image Picker</Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.button} key="camera" onPress={this.captureWith(useCamera)}>
          <Text>Camera</Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.button} key="default" onPress={this.captureWith(defaultCapture)}>
          <Text>Default</Text>
        </TouchableHighlight>
      </ScrollView>
    )
  }

  renderPreview() {
    const { preview } = this.state
    if (!preview) return null

    const { uri, dataUrl, width, height } = preview
    return <Image style={[styles.preview, { width, height }]} source={{uri: uri || dataUrl}} />
  }

  onImage(data) {
    const { navigator, ...settings } = this.props
    const { dataUrl='', uri, ...moreData } = data
    Alert.alert('took pic', JSON.stringify({
      ...settings,
      base64Length: dataUrl.length,
      useFS: !!uri,
      ...moreData,
    }, null, 2))

    // Alert.alert('took pic', `length: ${data.base64.length}, image: ${data.base64.slice(0, 100)}`)
    this.setState({
      camera: false,
      preview: data,
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  button: {
    flex: 1,
    padding: 50,
  },
})

AppRegistry.registerComponent('Tradle', () => CameraTest)
