import React, { Component, PropTypes } from 'react'
import WebView from './WebView'
import utils from '../utils/utils'

import { makeResponsive } from 'react-native-orient'

class SplashPage extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    splashscreen: PropTypes.string.isRequired,
  };
  render() {
    let {width, height} = utils.dimensions(SplashPage)
    return <WebView style={{width, height}}
                 source={{uri: this.props.splashscreen}}
                 startInLoadingState={true}
                 javaScriptEnabled={false}
                 domStorageEnabled={false}
                 automaticallyAdjustContentInsets={false} />
  }
}

module.exports = makeResponsive(SplashPage)
