import React, { Component, PropTypes } from 'react'
import {
  WebView,
} from 'react-native'
import AppIntro from 'react-native-app-intro'
import utils from '../utils/utils'

import { makeResponsive } from 'react-native-orient'

class TourPage extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    tour: PropTypes.string.isRequired,
    callback: PropTypes.func,
  };
  render() {
    let {pages} = this.props.tour
    if (!pages)
      return <View/>

    let {width, height} = utils.dimensions(TourPage)
    let tpages = []
    if (pages)
      tpages = pages.map((p, i) => (
         <WebView style={{width, height}} key={'tour_' + i}
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
    if (!utils.isWeb())
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

module.exports = makeResponsive(TourPage)
