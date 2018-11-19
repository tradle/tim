import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import ArticleView from './ArticleView'
import Image from './Image'
import utils from '../utils/utils'
import TOUCH_ID_IMG from '../img/touchid2.png'

const LINK_COLOR = '#7AAAC3'
const BTN_COLOR = LINK_COLOR

class TouchIDOptIn extends Component {
  static propTypes = {
    optIn: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired
  };
  learnMore() {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      passProps: {
        url: 'https://support.apple.com/en-us/HT204587'
      }
    })
  }
  render() {
        // <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width: Device.width, height: Device.height}} />
    let { width } = utils.dimensions(TouchIDOptIn)
          // <Text style={[styles.text, { paddingTop: 20, fontSize: 15 }]}>
          //   You can always enable/disable it on your profile
          // </Text>
    return (
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Text style={[styles.text, { fontSize: 30 }]}>
            Enable Touch ID?
          </Text>
        </View>
        <View style={styles.imgContainer}>
          <Image resizeMode='contain' source={TOUCH_ID_IMG} />
        </View>
        <View style={styles.quoteContainer}>
          <Text style={[styles.text, styles.quoteText]}>
            "iOS and other apps never access your fingerprint data, it's never stored on
            Apple servers, and it's never backed up to iCloud or anywhere else."
          </Text>
          <TouchableHighlight underlayColor='transparent' onPress={this.learnMore.bind(this)}>
            <Text style={[styles.text, styles.optInText, { color: LINK_COLOR }]}>
              -Apple
            </Text>
          </TouchableHighlight>
        </View>
        <TouchableHighlight
            underlayColor={BTN_COLOR}
            style={[styles.btnContainer, { width: width }]}
            onPress={this.props.optIn}>
           <Text style={styles.btnText}>
             Enable
           </Text>
        </TouchableHighlight>
      </View>
    )
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headingContainer: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgContainer: {
    flex: 0.2,
    justifyContent: 'center'
  },
  quoteContainer: {
    flex: 0.4,
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  btnContainer: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BTN_COLOR
  },
  text: {
    // color: '#ffffff'
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: 'transparent'
  },
  optInText: {
    fontSize: 15
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    paddingBottom: 20
  },
  btnText: {
    fontSize: 20,
    color: '#ffffff',
    // color: LINK_COLOR
  }
})

module.exports = TouchIDOptIn
