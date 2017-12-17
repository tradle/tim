'use strict'
// export default class StyleProvider {
//   constructor(props) {
//     super(props)
//   }
//   componentWillMount() {
//     this.listenTo(Store, 'handleEvent')
//   }
//   handleEvent(event) {
//     const { action, customStyles } = event
//     if (action === 'customStyles') {
//       this.setState({ customStyles })
//     }
//   }
//   render() {
//     <View {...this.props} customStyles={this.state.customStyles}>
//       {...this.props.childen}
//     </View>
//   }
// }

import React, { Component } from 'react'

var reactMixin = require('react-mixin')
var Store = require('../Store/Store')
var extend = require('extend');
var defaultBankStyle = require('../styles/defaultBankStyle.json')
var Reflux = require('reflux')

export function makeStylish (WrappedComponent) {
  class Stylish extends Component {
    constructor(props) {
      super(props)
    }
    componentWillMount() {
      this.listenTo(Store, 'handleEvent')
    }
    handleEvent(event) {
      const { action, provider } = event
      if (action === 'customStyles') {
        let style = {}
        extend(style, defaultBankStyle)
        extend(style, provider.style)
        this.setState({ provider, bankStyle: style })
      }
    }
    render() {
      return (
        <WrappedComponent {...this.props} {...this.state} />
      )
    }
  }
  reactMixin(Stylish.prototype, Reflux.ListenerMixin)
  return Stylish
}
