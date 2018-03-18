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
  // const { host } = parseUrl(href)
  // if (host === window.location.host) {
  //   return (
  //     <TouchableOpacity onPress={() => Actions.triggerDeepLink(href)}>
  //       <View>
  //         {props.children}
  //       </View>
  //     </TouchableOpacity>
  //   )
  // }

  return <a href={href} target="_blank">{props.children}</a>

  // return <View>
  //         {props.children}
  //        </View>

}

module.exports = Markdown
