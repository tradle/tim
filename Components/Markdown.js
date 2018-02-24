console.log('requiring Markdown.js')
'use strict';

import React, { Component, PropTypes } from 'react'
import createMarkdownRenderer from 'rn-markdown'
import ArticleView from './ArticleView'
import utils from '../utils/utils'
var translate = utils.translate

import {
  TouchableOpacity,
  View
} from 'react-native'

const Markdown = createMarkdownRenderer()
Markdown.renderer.container = View

Markdown.renderer.link = props => {
  const { markdown } = props
  const { href } = markdown
  return (
    <TouchableOpacity onPress={() => {
      props.passThroughProps.navigator.push({
        id: 7,
        component: ArticleView,
        backButtonTitle: 'Back',
        title: translate(markdown.children[0].text),
        passProps: {
          bankStyle: props.passThroughProps.bankStyle,
          href: href
        }
      })

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
