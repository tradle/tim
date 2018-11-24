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
    ...dummyResult,
  }

  async componentDidMount() {
    if (this.state.results) return

    const result = await scan({ scenario: Scenario.mrz })
    this.setState(result)
  }

  render() {
    let { results, image } = this.state
    if (!results) {
      return <View/>
    }

    if (image.startsWith('/')) {
      // data uri
      image = 'data:image/jpeg;base64,' + image
    }

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{uri:image}} style={styles.image} />
        <Text>{JSON.stringify(results, null, 2)}</Text>
      </ScrollView>
    )
  }
}

const dimensions = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    resizeMode: 'contain',
    // flipped
    height: dimensions.width,
  },
})

AppRegistry.registerComponent('Tradle', () => App)
