console.log('requiring ChatMessage.js')
'use strict'

import utils from '../utils/utils'
import constants from '@tradle/constants'
import TimerMixin from 'react-timer-mixin'
import reactMixin from 'react-mixin'

import {
  View,
  TextInput,
  Text,
  StyleSheet
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
// Component is used in 2 other components
// 1. NewResource for sending the correct verification form to your friend/customer to help them with finding the right one
// 2. AddNewMessage for submitting regular chat message. AddNewResource is used in ResourceList component when it shows chat messages
class ChatMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {userInput: ''};
  }
  render() {
    var model = this.props.model;
    var resource = this.props.resource;
    var isMessage = utils.isMessage(resource)
    if (!isMessage)
      return <View/>
    var title = resource.to[constants.TYPE]
              ? utils.getDisplayName(resource.to, utils.getModel(resource.to[constants.TYPE]).properties)
              : resource.to.title;
    if (resource.message  &&  utils.splitMessage(resource.message).length === 1)
      return <View></View>;
    var alignStyle = model.isInterface ? {alignSelf: 'center', marginTop: 10} : {alignSelf: 'stretch'};
            // autoFocus={true}
    var t = model.isInterface ? 'Say something' : 'Send this form to ' + title;
    var messageField =
        <View style={[styles.chat, alignStyle]}>
          <TextInput ref='chat'
            autoCapitalize='none'
            autoCorrect={false}
            bufferDelay={20}
            placeholder={t}
            placeholderTextColor='#aaaaaa'
            style={styles.chatInput}
            value={this.state.userInput}
            onChange={this.handleChange.bind(this)}
            onSubmitEditing={this.onSubmitEditing.bind(this)}
          />
        </View>

    // This is the case of when you want to send your friend/customer
    // a verification form that corresponds to his/her needs
    if (model.isInterface)
      return messageField;
    return  (
      <View>
        <View style={styles.view} />
        {messageField}
      </View>
      );
  }
  clear() {
    this.setState({userInput: ''});
  }
  handleChange(event) {
    if (this.props.onChange)
      this.props.onChange(event);
    this.setState({userInput: event.nativeEvent.text});
  }
  onSubmitEditing() {
    var msg = this.state.userInput;
    if (!msg)
      return;
    this.props.onSubmitEditing(msg);
    this.setTimeout(function() {
      this.setState({userInput: ''});
      this.refs.chat.focus();
    }.bind(this), 0);
  }
}
reactMixin(ChatMessage.prototype, TimerMixin);

var styles = StyleSheet.create({
  view: {
    marginTop: 30
  },
  chat: {
    marginBottom: 5,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#eeeeee',
    borderTopColor: '#eeeeee',
    borderRightColor: '#eeeeee',
    borderLeftColor: '#eeeeee',
    borderWidth: 1,
    borderBottomColor: '#aaaaaa',
    marginLeft: -15,
  },
  chatInput: {
    height: 30,
    fontSize: 18,
    // paddingLeft: 5,
    backgroundColor: '#eeeeee',
    fontWeight: 'bold',
    alignSelf: 'stretch',
    // borderColor: '#eeeeee',
  },
});

module.exports = ChatMessage;

