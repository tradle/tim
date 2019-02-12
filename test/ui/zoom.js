import '../../utils/shim'
import React from 'react'
import {
  Platform,
  AppRegistry,
  TouchableHighlight,
  StyleSheet,
  ScrollView,
  View,
  Text,
} from 'react-native'

import SplashScreen from 'react-native-splash-screen'
import Zoom from 'react-native-facetec-zoom'
import Image from '../../Components/Image'

import ENV from '../../utils/env'

if (SplashScreen) {
  SplashScreen.hide()
}

Zoom.preload()

const bigText = (text, style) => <Text style={[styles.bigText, style]}>{text}</Text>
const createButton = ({ text, ...props }) => (
  <TouchableHighlight {...props} style={styles.button}>
    {bigText(text, styles.buttonText)}
  </TouchableHighlight>
)

const prettify = obj => obj ? JSON.stringify(obj, null, 2) : ''

class ZoomUI extends React.Component {
  constructor() {
    super()
    this.verifyLiveness = this.verifyLiveness.bind(this)
    this.state = {}
  }
  verifyLiveness = async () => {
    const { success, status } = await Zoom.initialize({
      appToken: Platform.select(ENV.ZoomSDK.token),
      showPreEnrollmentScreen: false,
      showUserLockedScreen: false,
      showRetryScreen: false,
    })

    if (!success) {
      // see constants.js SDKStatus for explanations of various
      // reasons why initialize might not have gone through
      throw new Error(`failed to init. SDK status: ${status}`)
    }

    // launch Zoom's verification process
    return await Zoom.verify({
      // no options at this point
    })
  }
  render = () => {
    const button = createButton({
      key: 'button',
      text: 'Verify Liveness',
      onPress: async () => {
        try {
          this.setState({
            result: await this.verifyLiveness()
          })
        } catch (error) {
          this.setState({ error })
        }
      }
    })

    return (
      <View style={styles.container}>
        {bigText('Variants:')}
        {button}
        {bigText('Result:')}
        {this.renderResult()}
        {bigText('Error:')}
        {this.renderError()}
      </View>
    )
  }
  renderResult = () => {
    const { result } = this.state
    if (!result) return

    const { faceMetrics={} } = result
    const { auditTrail=[] } = faceMetrics
    const images = auditTrail.map((uri, i) => <Image key={`image${i}`} style={styles.image} source={{uri}} />)
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {bigText(prettify(result))}
        {images}
      </ScrollView>
    )
  }
  renderError = () => {
    return <View key='error'>{bigText(prettify(this.state.error))}</View>
  }
}

AppRegistry.registerComponent('Tradle', () => ZoomUI);

const styles = StyleSheet.create({
  scrollContainer: {},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 10,
  },
  buttonText: {
    color: 'blue',
  },
  bigText: {
    fontSize: 30,
  },
  image: {
    flex:1,
    minWidth: 100,
    minHeight: 100,
  },
})
