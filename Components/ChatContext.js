'use strict'

import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native'
import React, { Component, PropTypes } from 'react'
import utils from '../utils/utils'
var translate = utils.translate
import Icon from 'react-native-vector-icons/Ionicons'
const REMEDIATION = 'tradle.Remediation'
var constants = require('@tradle/constants');
const PRODUCT_APPLICATION = 'tradle.ProductApplication'

class ChatContext extends Component {
  props: {
    chat: PropTypes.object.isRequired,
    context: PropTypes.object.isRequired,
    contextChooser: PropTypes.func.isRequired,
    shareWith: PropTypes.func.isRequired,
    bankStyle: PropTypes.object.isRequired,
    allContexts: PropTypes.bool.isRequired
  };
  constructor(props) {
    super(props)
  }

  render() {
    let context = this.props.context
    if (!context  ||  context.product === REMEDIATION)
      return <View/>
    let me = utils.getMe()
    if (me.isEmployee) {
      if (this.props.chat[constants.TYPE] === constants.TYPES.PROFILE  &&  !me.organization.canShareContext)
        return <View/>
    }
    // if (!this.props.context  ||  this.props.context._readOnly)
    //   return <View/>
    let r = this.props.chat
    let isReadOnlyChat = utils.isReadOnlyChat(context)
    let bankStyle = this.props.bankStyle
    let isShareContext = r[constants.TYPE] === PRODUCT_APPLICATION && isReadOnlyChat

    let content = <Text style={[{color: this.props.allContexts ? bankStyle.CURRENT_CONTEXT_TEXT_COLOR : bankStyle.SHARE_CONTEXT_TEXT_COLOR}, styles.text]}>{translate(utils.getModel(context.product).value)}</Text>
    let chooser = context  &&  isShareContext
                ? <View style={styles.contextBar}>{content}</View>
                : <TouchableOpacity onPress={this.props.contextChooser} style={styles.contextBar}>
                    {content}
                  </TouchableOpacity>
    // HACK: if me is employee no sharing for now
    let share
    if (this.props.allContexts || isReadOnlyChat)
      share = <View/>
    // else if (utils.getMe().isEmployee  &&  this.props.chat[constants.TYPE] === constants.TYPES.PROFILE)
    //   share = <View/>
    else
      share = <TouchableOpacity onPress={this.props.shareWith} style={{position: 'absolute', right: 10, padding: 10}}>
                <Icon size={22} name='md-share' color={bankStyle.SHARE_CONTEXT_TEXT_COLOR} style={{marginRight: 10, paddingLeft: 20}} />
              </TouchableOpacity>
    let bar = {backgroundColor: this.props.allContexts ? bankStyle.CURRENT_CONTEXT_BACKGROUND_COLOR : bankStyle.SHARE_CONTEXT_BACKGROUND_COLOR}
    return (
            <View style={[bar, styles.bar, {flexDirection: 'row'}]}>
              {chooser}
              {share}
            </View>
            )
  }

}

var styles = StyleSheet.create({
  contextBar: {
    flex: 1,
    padding: 10
  },
  bar: {
    // borderTopColor: '#dddddd',
    // borderTopWidth: StyleSheet.hairlineWidth,
    // padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  text: {
    fontSize: 20,
    // alignSelf: 'center',
    marginHorizontal: 10
  }
});

module.exports = ChatContext
