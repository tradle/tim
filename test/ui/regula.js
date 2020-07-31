import React, { Component } from 'react'
import { Alert, AppRegistry, StyleSheet, View, ScrollView, Text, Dimensions } from 'react-native'

import SplashScreen from 'react-native-splash-screen'
if (SplashScreen && SplashScreen.hide) {
  SplashScreen.hide()
}
import RegulaProxy, { Scenario } from '../../utils/RegulaProxy'
// import { scan, Scenario, prepareDatabase } from '../../utils/regula'
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
        multipageProcessing: false,
      },
      functionality: {
        showCaptureButton: true,
      },
    }

    // if (bothSides)
    //   scanOpts.processParams.multipageProcessing = true

    await RegulaProxy.prepareDatabase('Full')
    await RegulaProxy.initialize()
    const result = await RegulaProxy.scan(scanOpts)
    this.setState(result)
  }

  render() {
    let { imageFront, imageBack, imageFace, json } = this.state
    if (!imageFront) {
      return <View />
    }
    imageFront = <Image source={{ uri: imageFront }} style={styles.image} />
    if (imageBack)
      imageBack = <Image source={{ uri: imageBack }} style={styles.image} />

    if (imageFace)
      imageBack = <Image source={{uri: imageFace}} style={styles.image} />

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {imageFront}
        {imageFace}
        {imageBack}
        <Text>{json  &&  JSON.stringify(json, null, 2) || ''}</Text>
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
