import React, { Component } from 'react'
import { Alert, AppRegistry, StyleSheet, View, ScrollView, Text, Dimensions } from 'react-native'

import SplashScreen from 'react-native-splash-screen'
if (SplashScreen && SplashScreen.hide) {
  SplashScreen.hide()
}
import RegulaProxy, { Scenario, isRFIDAvailable } from '../../utils/RegulaProxy'
// import { scan, Scenario, prepareDatabase } from '../../utils/regula'
import Image from '../../Components/Image'
import dummyResult from '../../data/sample-regula-result.json'
const lKey = ""

class App extends Component {
  state = {
    // comment this out to shoot a new one
    // ...dummyResult,
  }

  async componentDidMount() {
    if (this.state.results) return

    // if (bothSides)
    //   scanOpts.processParams.multipageProcessing = true

    RegulaProxy.setLicenseKey(lKey)
    await RegulaProxy.prepareDatabase('Full')

    let scanOpts = {
      processParams: {
        scenario: 'Ocr', //Scenario.Ocr,
        multipageProcessing: false,
        doRfid: true, //isRFIDAvailable || false,
      },
      functionality: {
        showCaptureButton: true,
      },
    }
    await RegulaProxy.scan(scanOpts, async (result) => {
      if (!result)
        return
      debugger
      return Promise.resolve(result)
      .then(result => {
        debugger
        let { error, imageFront, imageBack, imageFace, imageSignature, results, json } = result
        if (error)
          return
        this.setState({imageFront, imageBack, imageFace, imageSignature})
        // let { scanResult, country, documentType } = normalizeResult({results, json})
        // return postProcessResult({result: scanResult, imageFront, imageBack, imageFace, imageSignature, country, json, documentType})
        // return callback(postProcessResult({result: scanResult, imageFront, imageBack, imageFace, imageSignature, country, json, documentType}))
      })
    })
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
      imageFace = <Image source={{uri: imageFace}} style={styles.image} />
        // <Text>{json  &&  JSON.stringify(json, null, 2) || ''}</Text>

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {imageFront}
        {imageFace}
        {imageBack}
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
