console.log('requiring Markdown.js')
'use strict';

import { parse as parseUrl } from 'url'
import { deepLinkHost } from '../utils/env'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import createMarkdownRenderer from 'rn-markdown'
import ArticleView from './ArticleView'
import utils from '../utils/utils'
var translate = utils.translate
import Actions from '../Actions/Actions'

import {
  TouchableOpacity,
  View,
  Linking
} from 'react-native'

const Markdown = createMarkdownRenderer()
Markdown.renderer.container = View

Markdown.renderer.link = props => {
  const { markdown } = props
  const { href } = markdown
  return (
    <TouchableOpacity onPress={() => {
      let host = parseUrl(href).host
      if (host === deepLinkHost  ||  host.indexOf('localhost') !== -1)
        Actions.openURL(href)
      else
        Linking.openURL(href)
      // props.passThroughProps.navigator.push({
      //   id: 7,
      //   component: ArticleView,
      //   backButtonTitle: 'Back',
      //   title: translate(markdown.children[0].text),
      //   passProps: {
      //     bankStyle: props.passThroughProps.bankStyle,
      //     href: href
      //   }
      // })

    }}>
      <View>
        {props.children}
      </View>
    </TouchableOpacity>
  )
  // return <View>
  //         {props.children}
  //        </View>

}

module.exports = Markdown
