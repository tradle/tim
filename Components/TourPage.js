console.log('requiring TourPage.js')
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import {
  View,
  StatusBar,
  WebView
} from 'react-native'
import AppIntro from 'react-native-app-intro'
import utils from '../utils/utils'

import { makeResponsive } from 'react-native-orient'
import { models } from '@tradle/models'

const PageModel = models['tradle.TourPage']
const pageProps = Object.keys(PageModel.properties)

class TourPage extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    tour: PropTypes.string.isRequired,
    callback: PropTypes.func,
  };
  render() {
    const {pages, doneBtnLabel, skipBtnLabel, nextBtnLabel, dotColor, activeDotColor, leftTextColor, rightTextColor} = this.props.tour
    if (!pages)
      return <View/>
    StatusBar.setHidden(true)
    const {width, height} = utils.dimensions(TourPage)
    const tpages = pages.map(page => typeof page === 'string' ? { url: page } : page)
    const [withUrls, withoutUrl] = _.partition(tpages, ({ url }) => url)
    if (withUrls.length && withoutUrl.length) {
      console.warn('invalid TourPage array, expected either all pages to have a "url", or none', pages)
    }

    let children = []
    let pageArray
    if (withUrls.length) {
      children = withUrls.map((page, i) => {
        return <WebView style={{width, height}} key={'tour_' + i}
               source={{uri: page.url}}
               startInLoadingState={true}
               automaticallyAdjustContentInsets={false} />
      })
    } else {
      // in case some extra props snuck in
      pageArray = withoutUrl.map(page => _.pick(page, pageProps))
    }

    const props = {
      onNextBtnClick: this.nextBtnHandle,
      onDoneBtnClick: this.doneBtnHandle,
      onSkipBtnClick: this.onSkipBtnHandle,
      onSlideChange: this.onSlideChangeHandle,
      dotColor: dotColor || '#eeeeee',
      activeDotColor: activeDotColor || '#ffffff',
      rightTextColor: rightTextColor || '#ffffff',
      leftTextColor: leftTextColor || '#ffffff',
    }

    if (pageArray) {
      return <AppIntro {...props} pageArray={pageArray} />
    }

    return (
      <AppIntro {...props}>
        {children}
      </AppIntro>
    )
  }
  onSkipBtnHandle = (index) => this.action();
  doneBtnHandle = () => this.action();

  action() {
    let { callback, navigator, noTransitions } = this.props
    if ((!utils.isWeb()  &&  !noTransitions) ||  !callback)
      navigator.pop()
    if (callback)
      callback()
    StatusBar.setHidden(false)
  }

  nextBtnHandle = (index) => {
    console.log(index);
  }
  onSlideChangeHandle = (index, total) => {
    console.log(index, total);
  }
}

module.exports = makeResponsive(TourPage)
