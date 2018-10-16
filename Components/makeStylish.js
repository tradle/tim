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
import _ from 'lodash'

import reactMixin from 'react-mixin'
import Store from '../Store/Store'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import Reflux from 'reflux'

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
        _.extend(style, defaultBankStyle)
        _.extend(style, provider.style)
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
