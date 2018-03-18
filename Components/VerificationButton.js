console.log('requiring VerificationButton.js')
'use strict';

import utils from '../utils/utils'
import Icon from 'react-native-vector-icons/Ionicons';
import reactMixin from 'react-mixin'
import constants from '@tradle/constants'
import buttonStyles from '../styles/buttonStyles'

import {
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableHighlight,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'

class VerificationButton extends Component {
  render() {
    var resource = this.props.resource;
    if (utils.isVerifiedByMe(resource))
      return <View />;

    let self = this
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={[buttonStyles.container1, {paddingVertical: 3}]}>
          <TouchableHighlight underlayColor='transparent' onPress={() =>
            Alert.alert(
              'Verify ' + utils.getDisplayName(resource),
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
