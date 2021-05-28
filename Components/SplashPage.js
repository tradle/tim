import React, { Component } from 'react'
import {
  WebView,
} from '@tradle/react-native-webview'
import PropTypes from 'prop-types'
import utils from '../utils/utils'
import TourPage from './TourPage'

import { makeResponsive } from 'react-native-orient'
// const tour = {
//   "_t": "tradle.Tour",
//   "message": "Take a quick tour of chat bot?",
//   "showDots": false,
//   "showSkipButton": false,
//   "showDoneButton": false,
//   "pages": [
//     {
//       "title": "Ready?",
//       "description": "Finally, you will be in control of your own private information!",
//       "img": "https://s3.amazonaws.com/app.tradle.io/pg/PG.png",
//       "imgStyle": {
//         "height": 59,
//         "width": 59
//       },
//       "backgroundColor": "#4CB0CA",
//       "fontColor": "#fff",
//       "level": 10
//     }]
// }
class SplashPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    splashscreen: PropTypes.object.isRequired,
  };
  render() {
    const { splashscreen } = this.props
    const { width, height } = utils.dimensions(SplashPage)
    if (typeof splashscreen === 'string') {
      return <WebView style={{width, height}}
                   source={{uri: this.props.splashscreen}}
                   useWebKit={true}
                   startInLoadingState={true}
                   automaticallyAdjustContentInsets={false} />
    }

    const tour = {
      "_t": "tradle.Tour",
      "showDots": false,
      "showSkipButton": false,
      "showDoneButton": false,
      "pages": [
        splashscreen
        // page
      ]
    }

    return <TourPage navigator={navigator} customStyles={splashStyle} tour={tour} callback={() => {}} />
  }
}

const splashStyle = {
  title: {
    fontWeight: '100',
    fontSize: 50
  }
}

module.exports = makeResponsive(SplashPage)
