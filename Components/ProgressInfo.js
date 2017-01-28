'use strict'

import {
  View,
  StyleSheet,
  Text,
} from 'react-native'

import React, { Component } from 'react'
import utils from '../utils/utils'
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var reactMixin = require('react-mixin');

var translate = utils.translate
var constants = require('@tradle/constants');
const TYPE = constants.TYPE
const ORGANIZATION = constants.TYPES.ORGANIZATION
import ProgressBar from 'react-native-progress/Bar';

class ProgressInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {progress: 1}
  }
  componentDidMount() {
    this.listenTo(Store, 'onProgressUpdate');
  }
  onProgressUpdate(params) {
    if (params.action === 'progressUpdate')
      this.setState({progress: params.progress, recipient: params.recipient})
  }

  render() {
    if (this.state.progress !== 1)
      return <View style={[styles.progress, {height: this.state.progress === 1 ? 0 : StyleSheet.hairlineWidth, backgroundColor: '#DCF3FF'}]}>
               <ProgressBar progress={this.state.progress} width={utils.dimensions().width} color='#7AAAC3' borderWidth={0} height={3} />
             </View>
    else
      return null
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
