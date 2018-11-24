import React, { Component } from 'react'
import {
  Alert,
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native'

import SplashScreen from 'react-native-splash-screen'
if (SplashScreen && SplashScreen.hide) {
  SplashScreen.hide()
}

import { scan } from '../../utils/regula'

class App extends Component {
  state = {}
  async componentDidMount() {
    const result = await scan({})
    this.setState(result)
  }
  render() {
    return (
      <View style={styles.container}>
        {JSON.stringify(this.state, null, 2)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex:1,
    minWidth: 100,
    minHeight: 100,
  },
})

AppRegistry.registerComponent('Tradle', () => App)
