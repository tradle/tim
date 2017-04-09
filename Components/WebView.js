
import React, { Component } from 'react'

import {
  Platform,
  WebView
} from 'react-native'

import deepEqual from 'deep-equal'

class MyWebView extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextProps, this.props)
  }
  render() {
    let { src, source, style } = this.props
    if (typeof source === 'string' && source.trim()[0] === '<') {
      return <iframe ref={onRef} style={style} />

      function onRef (ref) {
        if (!ref) return

        // this is for you, oh naughty Firefox
        setTimeout(function () {
          const iframedoc = ref.contentDocument || (ref.contentWindow && ref.contentWindow.document)
          if (iframedoc) {
            iframedoc.body.innerHTML = source
          }
        }, 100)
      }
    }

    src = src || source.uri
    style = style || {}
    return (
      <iframe src={src} style={style}></iframe>
    )
  }
}


module.exports = MyWebView
