'use strict';

var utils = require('../utils/utils');
import Icon from 'react-native-vector-icons/Ionicons';
var reactMixin = require('react-mixin');
var constants = require('@tradle/constants');
var buttonStyles = require('../styles/buttonStyles');

import {
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableHighlight,
} from 'react-native'

import React, { Component } from 'react'

class VerificationButton extends Component {
  render() {
    var resource = this.props.resource;
    if (utils.isVerifiedByMe(resource))
      return <View />;

    var model = utils.getModel(resource[constants.TYPE]).value;

    let self = this
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={[buttonStyles.container1, {paddingVertical: 3}]}>
          <TouchableHighlight underlayColor='transparent' onPress={() =>
            Alert.alert(
              'Verify ' + utils.getDisplayName(resource, model.properties),
              null,
              [
                {text: 'Cancel', onPress: () => console.log('Canceled!')},
                {text: 'Verify', onPress: this.props.verify.bind(this)},
              ]
            )
          }>
           <View>
             <View style={buttonStyles.buttonContent} />
             <View style={buttonStyles.row1}>
               <Icon name='ios-checkmark-outline' size={25}  color='#ffffff' style={buttonStyles.icon1}/>
               <Text style={buttonStyles.text1}>{'Verify'}</Text>
             </View>
           </View>
          </TouchableHighlight>
        </View>
        <View style={[buttonStyles.container1, {paddingVertical: 3}]}>
          <TouchableHighlight underlayColor='transparent' onPress={() =>
            self.props.edit()
          }>
            <View>
               <View style={buttonStyles.buttonContent} />
               <View style={buttonStyles.row1}>
                 <Icon name='ios-compose-outline' size={25}  color='#ffffff' style={buttonStyles.icon1}/>
                 <Text style={buttonStyles.text1}>{'Edit'}</Text>
               </View>
            </View>
          </TouchableHighlight>
        </View>
      </View>
      )
  }
}

module.exports = VerificationButton;
