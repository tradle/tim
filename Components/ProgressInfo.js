'use strict'

import {
  View,
  StyleSheet
} from 'react-native'

import React, { Component, PropTypes } from 'react'
import { constants } from '@tradle/engine'
import utils from '../utils/utils'

const Store = require('../Store/Store');
const Reflux = require('reflux');
const reactMixin = require('react-mixin');

import ProgressBar from 'react-native-progress/Bar';

const { PERMALINK } = constants

class ProgressInfo extends Component {
  static propTypes = {
    recipient: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props)
    this.state = { progress: 0 }
    this._finishTimeout = null
  }
  componentDidMount() {
    this.listenTo(Store, 'onProgressUpdate');
  }
  onProgressUpdate({ action, recipient, progress }) {
    if (action !== 'progressUpdate' || !recipient) return

    recipient = recipient[PERMALINK] || recipient
    clearTimeout(this._finishTimeout)
    this.setState({ progress, recipient })
    if (progress !== 1) return

    this._finishTimeout = setTimeout(() => {
      this.setState({ recipient, progress: 0 })
    }, 1000)
  }

  render() {
    if (!this.state.progress) return null

    return (
      <View style={[styles.progress, { height: StyleSheet.hairlineWidth, backgroundColor: '#DCF3FF'}]}>
        <ProgressBar progress={this.state.progress} width={utils.dimensions().width} color='#7AAAC3' borderWidth={0} height={3} />
      </View>
    )
  }
}
reactMixin(ProgressInfo.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  progress: {
    justifyContent: 'center',
    alignSelf: 'center'
  }
});

module.exports = ProgressInfo
