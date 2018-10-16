
import { parse as parseUrl } from 'url'
import { deepLinkHost } from '../utils/env'
import React from 'react';
import createMarkdownRenderer from 'rn-markdown'
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
  let host = parseUrl(href).host

  if (host === deepLinkHost  ||  host.indexOf('localhost') !== -1) {
    return (
      <TouchableOpacity onPress={() => {
          Actions.openURL(href)
      }}>
        <View>
          {props.children}
        </View>
      </TouchableOpacity>
    )
  }

  return <a href={href} target="_blank">{props.children}</a>
  // return <View>
  //         {props.children}
  //        </View>

}

module.exports = Markdown
