import '../../utils/shim'
import debounce from 'lodash/debounce'
import React from 'react'
import {
  Alert,
  AppRegistry,
  StyleSheet,
  View,
} from 'react-native'

import { RNCamera } from 'react-native-camera'
import SplashScreen from 'react-native-splash-screen'

if (SplashScreen) {
  SplashScreen.hide()
}

const prettify = obj => obj ? JSON.stringify(obj, null, 2) : ''

class Scanner extends React.Component {
  onBarCodeRead = debounce(result => {
    Alert.alert('barcode read', prettify(result))
  }, 500, { leading: true, trailing: false })

  render = () => {
    return (
      <View style={styles.container}>
        <RNCamera
            ref={ref => {
              this.camera = ref
            }}
            style = {styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.off}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onBarCodeRead={this.onBarCodeRead}
        />
      </View>
    )
  }

  // takePicture = async function() {
  //   if (this.camera) {
  //     const options = { quality: 0.5, base64: true }
  //     const data = await this.camera.takePictureAsync(options)
  //     console.log(data.uri)
  //   }
  // }
}

AppRegistry.registerComponent('Tradle', () => Scanner)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
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
