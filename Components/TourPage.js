import React, { Component, PropTypes } from 'react'
import {
  StyleSheet,
  View,
} from 'react-native'
import WebView from './WebView'
import AppIntro from 'react-native-app-intro'
import utils from '../utils/utils'
var translate = utils.translate

import { makeResponsive } from 'react-native-orient'

class TourPage extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    tour: PropTypes.string.isRequired,
    callback: PropTypes.func,
  };
  render() {
    let {width, height} = utils.dimensions(TourPage)

    let {pages} = this.props.tour
    if (!pages) //  &&  !introImage  && !introTitle)
      return <View/>

    let tpages = []
    if (pages)
      tpages = pages.map((p, i) => (
         <WebView style={[styles.webView, {width, height}]} key={'tour_' + i}
                 source={{uri: p}}
                 startInLoadingState={true}
                 automaticallyAdjustContentInsets={false} />
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
    // marginTop: 60,
    // height: 350,
  },
});

module.exports = makeResponsive(TourPage)
