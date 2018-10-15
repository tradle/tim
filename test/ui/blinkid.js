import '../../utils/shim'
import React from 'react'
import {
  AppRegistry,
  TouchableHighlight,
  StyleSheet,
  View,
  Text,
} from 'react-native'

import { scan, recognizers as RecognizerImpls } from '../../Components/BlinkID'
import SplashScreen from 'react-native-splash-screen'

if (SplashScreen) {
  SplashScreen.hide()
}

const bigText = (text, style) => <Text style={[styles.bigText, style]}>{text}</Text>
const createButton = ({ text, ...props }) => (
  <TouchableHighlight {...props} style={styles.button}>
    {bigText(text, styles.buttonText)}
  </TouchableHighlight>
)

const prettify = obj => obj ? JSON.stringify(obj, null, 2) : ''
const baseOpts = {
  quality: 0.2,
  base64: true,
  timeout: 60000,
  tooltip: 'Center that shit',
}

const variants = Object.keys(RecognizerImpls).map(recognizer => ({
  ...baseOpts,
  recognizers: [recognizer],
}))

class Blink extends React.Component {
  constructor() {
    super()
    this.scan = this.scan.bind(this)
    this.state = {}
  }
  scan = async (opts) => {
    try {
      const result = await scan(opts)
      this.setState({
        result,
        error: null,
      })
    } catch (err) {
      this.setState({
        result: null,
        error: err.message,
      })
    }
  }
  render = () => {
    return (
      <View style={styles.container}>
        {bigText('Variants:')}
        {variants.map(this.renderVariant)}
        {bigText('Result:')}
        {this.renderResult()}
        {bigText('Error:')}
        {this.renderError()}
      </View>
    )
  }
  renderVariant = (opts, i) => {
    return createButton({
      key: `variant${i}`,
      text: opts.recognizers.join(' + '),
      onPress: () => this.scan({
        ...opts,
        country: {},
        recognizers: opts.recognizers.map(name => RecognizerImpls[name]),
        firstSideInstructions: 'this is the first side of many!',
        secondSideInstructions: 'just kidding, there are only two!',
        firstSideInstructionsRID: parseInt('0x7f0c004f'),
      })
    })
  }
  renderResult = () => {
    return <View key='result'>{bigText(prettify(this.state.result))}</View>
  }
  renderError = () => {
    return <View key='error'>{bigText(prettify(this.state.error))}</View>
  }
}

AppRegistry.registerComponent('Tradle', () => Blink);

const styles = StyleSheet.create({
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
  }
})
