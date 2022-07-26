import _ from 'lodash'
import React, { Component } from 'react'
import {
  View,
  StatusBar,
  // WebView
} from 'react-native'
import { WebView } from 'react-native-webview'
import PropTypes from 'prop-types'
import AppIntro from 'react-native-app-intro'
import utils, { translate } from '../utils/utils'

import { makeResponsive } from 'react-native-orient'
import { models } from '@tradle/models'

const PageModel = models['tradle.TourPage']
const pageProps = Object.keys(PageModel.properties)

class TourPage extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    tour: PropTypes.object.isRequired,
    callback: PropTypes.func,
    customStyles: PropTypes.object
  };
  render() {
    const {pages, dotColor, activeDotColor, leftTextColor, rightTextColor, nextBtnLabel} = this.props.tour
    if (!pages)
      return <View/>
    StatusBar.setHidden(true)
    const {width, height} = utils.dimensions(TourPage)
    const tpages = pages.map(page => typeof page === 'string' ? { url: page } : page)
    const [withUrls, withoutUrl] = _.partition(tpages, ({ url }) => url)
    if (withUrls.length && withoutUrl.length) {
      console.warn('invalid TourPage array, expected either all pages to have a "url", or none', pages)
    }
    let { showSkipButton, showDoneButton, showDots } = this.props.tour
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
      pageArray = withoutUrl.map(page => {
        let p = _.pick(page, pageProps)
        let pp = _.cloneDeep(p)
        if (p.title)
          pp.title = translate(p.title)
        if (p.description)
          pp.description = translate(p.description)
        return pp
      })
    }
    let next = nextBtnLabel || '>'
    let props = {
      onNextBtnClick: this.nextBtnHandle,
      onDoneBtnClick: this.doneBtnHandle,
      onSkipBtnClick: this.onSkipBtnHandle,
      onSlideChange: this.onSlideChangeHandle,
      skipBtnLabel: translate('Skip'),
      doneBtnLabel: translate('Done'),
      nextBtnLabel: translate(next),
      showSkipButton: typeof showSkipButton === 'undefined' ? true : showSkipButton,
      showDoneButton: typeof showDoneButton === 'undefined' ? true : showDoneButton,
      showDots: typeof showDots === 'undefined' ? true : showDots,
      dotColor: dotColor || '#eeeeee',
      activeDotColor: activeDotColor || '#ffffff',
      rightTextColor: rightTextColor || '#ffffff',
      leftTextColor: leftTextColor || '#ffffff',
      customStyles: this.props.customStyles,
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
