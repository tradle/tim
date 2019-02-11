
import {
  View,
  StyleSheet
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react';
import { constants } from '@tradle/engine'
import utils from '../utils/utils'

const debug = require('debug')('tradle:app:progressbar')
import Store from '../Store/Store'
import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import TimerMixin from 'react-timer-mixin'

import ProgressBar from './ProgressBar';

const { PERMALINK } = constants

class ProgressInfo extends Component {
  static propTypes = {
    recipient: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props)
    this.state = { progress: 0 }
    this._finishInterval = null
    this._finishTimeout = null
  }
  componentDidMount() {
    this.listenTo(Store, 'onProgressUpdate');
  }
  _reset() {
    this.clearInterval(this._finishInterval)
    this.clearTimeout(this._finishTimeout)
  }
  onProgressUpdate({ action, recipient, progress }) {
    if (action !== 'progressUpdate' || !recipient) return

    debug(`${recipient} progress ${progress}`)
    recipient = recipient[PERMALINK] || recipient
    if (this.state.progress > progress) {
      debug(`delaying ${recipient} progress update`)
      return this.setTimeout(() => {
        this.onProgressUpdate({ action, recipient, progress })
      }, 100)
    }

    this._reset()

    // smoothly get to desired progress from where we are
    const dest = progress
    progress = this.state.progress > dest ? 0 : this.state.progress
    this._finishInterval = this.setInterval(() => {
      if (progress >= dest) {
        this._reset()
        if (progress >= 1) {
          debug('finished, scheduling clear')
          this._finishTimeout = this.setTimeout(() => {
            this._reset()
            this.setState({ progress: 0 })
          }, 30)
        }

        return
      }

      const bigInc = (dest - progress) / 3
      progress += Math.max(bigInc, 0.01)
      progress = Math.min(dest, progress)
      // debug(`updating ${recipient} progress: ${progress}`)
      this.setState({ progress })
    }, 30)
  }

  render() {
    if (!this.state.progress) return null

    return (
      <View style={[styles.progress, { height: StyleSheet.hairlineWidth, backgroundColor: '#DCF3FF'}]}>
        <ProgressBar progress={this.state.progress} width={utils.dimensions().width} color={this.props.color} borderWidth={0} height={3} />
      </View>
    )
  }
}
reactMixin(ProgressInfo.prototype, Reflux.ListenerMixin);
reactMixin(ProgressInfo.prototype, TimerMixin);

var styles = StyleSheet.create({
  progress: {
    justifyContent: 'center',
    alignSelf: 'center'
  }
});

module.exports = ProgressInfo
