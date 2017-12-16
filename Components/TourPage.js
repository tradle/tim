import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  View,
  WebView,
} from 'react-native'
import AppIntro from 'react-native-app-intro'
import utils from '../utils/utils'
var translate = utils.translate

import { makeResponsive } from 'react-native-orient'

class TourPage extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    tourConf: PropTypes.string.isRequired,
    callback: PropTypes.func,
  };
  render() {
    let {width, height} = utils.dimensions(TourPage)
    let url = 'https://github.com/facebook/react-native'
    // let url = 'https://tradle.io/'

    let {pages} = this.props.tourConf
    if (!pages) //  &&  !introImage  && !introTitle)
      return <View/>

    let tpages = []
    if (pages)
      tpages = pages.map((p, i) => (
        <View style={[styles.slide, {position: 'absolute', height: height + 60, left: 0, top: -30}]} key={'tour_' + (i+1)}>
         <WebView style={[styles.webView, {width}]}
                 source={{uri: p}}
                 startInLoadingState={true}
                 automaticallyAdjustContentInsets={false} />
        </View>
      ))

    return (
      <AppIntro
        onNextBtnClick={this.nextBtnHandle}
        onDoneBtnClick={this.doneBtnHandle}
        onSkipBtnClick={this.onSkipBtnHandle}
        onSlideChange={this.onSlideChangeHandle}
        dotColor='#C6E5F5'
        activeDotColor='#7aaac3'
        rightTextColor='#7aaac3'
        leftTextColor='#7aaac3'
      >
        {tpages}
      </AppIntro>
    )
  }
  onSkipBtnHandle = (index) => this.action();
  doneBtnHandle = () => this.action();

  action() {
    let { callback, navigator } = this.props
    navigator.pop()
    if (callback)
      callback()
  }

  nextBtnHandle = (index) => {
    console.log(index);
  }
  onSlideChangeHandle = (index, total) => {
    console.log(index, total);
  }
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  webView: {
    backgroundColor: '#ffffff',
    marginTop: 60,
    height: 350,
  },
});

module.exports = makeResponsive(TourPage)
