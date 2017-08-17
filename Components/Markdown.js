'use strict';

import React, { Component, PropTypes } from 'react'
import createMarkdownRenderer from 'rn-markdown'
import ArticleView from './ArticleView'
import {
  TouchableOpacity,
  View
} from 'react-native'

const Markdown = createMarkdownRenderer()

Markdown.renderer.link = props => {
  const { markdown } = props
  const { href } = markdown
  return (
    <TouchableOpacity onPress={() => {
      this.props.navigator.push({
        id: 7,
        component: ArticleView,
        backButtonTitle: 'Back',
        title: translate(markdown.children[0].children[0].text),
        passProps: {
          bankStyle: this.props.bankStyle,
          href: href
        }
      })

    }}>
      <View>
        {props.children}
      </View>
    </TouchableOpacity>
  )
}

module.exports = Markdown