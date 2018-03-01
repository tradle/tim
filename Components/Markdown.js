console.log('requiring Markdown.js')
'use strict';

import React, { Component, PropTypes } from 'react'
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
  if (href.indexOf('localhost:3001') !== -1) {
    return (
      <TouchableOpacity onPress={() => Actions.triggerDeepLink(href)}>
        <View>
          {props.children}
        </View>
      </TouchableOpacity>
    )
  }

  return <a href={href}>{props.children}</a>

  // return <View>
  //         {props.children}
  //        </View>

}

module.exports = Markdown
