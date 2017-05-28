'use strict';

var utils = require('../utils/utils');
var MessageList = require('./MessageList');
import Icon from 'react-native-vector-icons/Ionicons';
var constants = require('@tradle/constants');
var buttonStyles = require('../styles/buttonStyles');

import {
  View,
  Text,
  TouchableHighlight
} from 'react-native'

import React, { Component } from 'react'

class MoreLikeThis extends Component {
  showMoreLikeThis() {
    var self = this;
    var modelName = this.props.resource[constants.TYPE];
    this.props.navigator.push({
      title: utils.getModel(modelName).value.title,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: utils.getMe(),
        filter: '',
        isAggregation: true,
        modelName: modelName,
      }
    });
  }
  render() {
    if (this.props.resource[constants.TYPE] === constants.TYPES.SIMPLE_MESSAGE || this.props.resource[constants.TYPE] === constants.TYPES.VERIFICATION)
      return null;
    return (
      <View style={[buttonStyles.container1, {top: 35}]}>
      <TouchableHighlight underlayColor='transparent' onPress={this.showMoreLikeThis.bind(this)}>
       <View>
         <View style={buttonStyles.buttonContent} />
         <View style={buttonStyles.row1}>
           <Icon name='arrow-shrink'  size={25}  color='#ffffff'  style={buttonStyles.icon1}/>
           <Text style={buttonStyles.text1}>More like this</Text>
         </View>
       </View>
      </TouchableHighlight>
      </View>
    );
  }
}

module.exports = MoreLikeThis;
