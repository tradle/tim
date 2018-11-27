import React, { Component } from 'react'
import {
  Alert,
  AppRegistry,
  StyleSheet,
  View,
  ScrollView,
  Text,
  Dimensions,
} from 'react-native'

import SplashScreen from 'react-native-splash-screen'
if (SplashScreen && SplashScreen.hide) {
  SplashScreen.hide()
}

import { scan, Scenario } from '../../utils/regula'
import Image from '../../Components/Image'
import dummyResult from '../../data/sample-regula-result.json'

class App extends Component {
  state = {
    // comment this out to shoot a new one
    // ...dummyResult,
  }

  async componentDidMount() {
    if (this.state.results) return
    let scanOpts = {
      processParams: {
        scenario: Scenario.fullProcess,
        multipageProcessing: true
      },
      functionality: {
        showCaptureButton: true
      }
    }

    // if (bothSides)
    //   scanOpts.processParams.multipageProcessing = true

    const result = await scan(scanOpts)
    this.setState(result)
  }

  render() {
    let { results, imageFront, imageBack, json } = this.state
    if (!results) {
      return <View/>
    }
    if (imageFront.startsWith('/')) {
      // data uri
      imageFront = 'data:image/jpeg;base64,' + imageFront
    }
    if (imageBack) {
      imageBack = 'data:image/jpeg;base64,' + imageBack
      imageBack = <Image source={{uri:imageBack}} style={styles.image} />
    }
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{uri:imageFront}} style={styles.image} />
        {imageBack}
        <Text>{JSON.stringify(json, null, 2)}</Text>
      </ScrollView>
    )
  }
}

const dimensions = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  image: {
    resizeMode: 'contain',
    // flipped
    height: dimensions.width,
  },
})

AppRegistry.registerComponent('Tradle', () => App)
