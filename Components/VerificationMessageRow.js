'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin');
var equal = require('deep-equal')
import { makeResponsive } from 'react-native-orient'
var StyleSheet = require('../StyleSheet')
var chatStyles = require('../styles/chatStyles')
var reactMixin = require('react-mixin');

import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  Alert,
  Modal,
  Navigator,
  View,
  processColor
} from 'react-native'

import React, { Component } from 'react'

class VerificationMessageRow extends Component {
  constructor(props) {
    super(props);
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !equal(this.props.resource, nextProps.resource) ||
           !equal(this.props.to, nextProps.to)             ||
           this.props.orientation != nextProps.orientation ||
           this.props.sendStatus !== nextProps.sendStatus
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var renderedRow = [];

    var time = this.getTime(resource);
    var date = time
             ? <Text style={chatStyles.date} numberOfLines={1}>{time}</Text>
             : <View />;

    var isMyMessage = this.isMyMessage();
    var w = utils.dimensions(VerificationMessageRow).width

    var msgModel = utils.getModel(resource.document[constants.TYPE]).value;
    var orgName = resource._verifiedBy
                ? resource._verifiedBy.title
                : resource.organization  ? resource.organization.title : ''

    let me = utils.getMe()
    let isThirdPartyVerification
    if (this.props.context) {
      let me = utils.getMe()
      if (me.isEmployee) {
        if  (utils.isReadOnlyChat(this.props.to))
          isThirdPartyVerification = utils.getId(resource.organization) !== utils.getId(this.props.context.to.organization)
        else if (this.props.to[constants.TYPE] === constants.TYPES.PROFILE)
          isThirdPartyVerification = utils.getId(me) !== utils.getId(this.props.context.to) || (resource._verifiedBy  &&  utils.getId(me.organization) !== utils.getId(resource._verifiedBy))
      }
      else
        isThirdPartyVerification = resource._verifiedBy != null && utils.getId(resource._verifiedBy)  !== utils.getId(resource.organization)// &&  utils.getId(this.props.context.to.organization) !== utils.getId(resource._verifiedBy)
    }
    let isShared = this.isShared()
    isMyMessage = isShared
    let bgColor
    if (isThirdPartyVerification)
      bgColor = '#93BEBA'
    else if (isShared)
      bgColor = this.props.bankStyle.SHARED_WITH_BG
    else
      bgColor = this.props.bankStyle.VERIFIED_HEADER_COLOR
    let verifiedBy = isShared ? translate('youShared', orgName) : translate('verifiedBy', orgName)
    let msgWidth = w * 0.8
    let numberOfCharacters = msgWidth / 12
    if (verifiedBy.length > numberOfCharacters)
      verifiedBy = verifiedBy.substring(0, numberOfCharacters) + '..'

    let headerStyle = [
      chatStyles.verifiedHeader,
      {backgroundColor: bgColor}, // opacity: isShared ? 0.5 : 1},
      isMyMessage ? {borderTopRightRadius: 0, borderTopLeftRadius: 10} : {borderTopLeftRadius: 0, borderTopRightRadius: 10}
    ]

    renderedRow = <View>
                    <View style={headerStyle}>
                      {isShared
                       ? <View/>
                       : <Icon style={chatStyles.verificationIcon} size={20} name={'md-checkmark'} />
                      }
                      <Text style={chatStyles.verificationHeaderText}>{isShared ? translate(msgModel) : verifiedBy}</Text>
                    </View>
                    <View>
                      {
                        this.formatDocument({
                          model: msgModel,
                          verification: resource,
                          onPress: this.verify.bind(this),
                          isAccordion: isThirdPartyVerification
                        })
                      }
                    </View>
                  </View>

    var viewStyle = {
      width: msgWidth,
      flexDirection: 'row',
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
      backgroundColor: this.props.bankStyle.BACKGROUND_COLOR
    }
    let addStyle = [
      chatStyles.verificationBody,
      {backgroundColor: isShared ? '#ffffff' : this.props.bankStyle.VERIFICATION_BG, borderColor: bgColor},
      isMyMessage ? {borderTopRightRadius: 0} : {borderTopLeftRadius: 0}
    ];
    let messageBody =
          <TouchableHighlight onPress={this.verify.bind(this, resource)} underlayColor='transparent'>
          <View style={{flexDirection: 'column', flex: 1}}>
            <View style={[chatStyles.row, viewStyle]}>
              {this.getOwnerPhoto(isMyMessage)}
              <View style={[chatStyles.textContainer, addStyle]}>
                <View style={{flex: 1}}>
                  {renderedRow}
               </View>
            </View>
          </View>
              {this.getSendStatus()}
            </View>
          </TouchableHighlight>

    var viewStyle = { margin: 1, backgroundColor: this.props.bankStyle.BACKGROUND_COLOR }
    return (
      <View style={viewStyle} key={this.getNextKey()}>
        {date}
        {messageBody}
      </View>
    );
  }
  verify(event) {
    var resource = this.props.resource;
    var isVerification = resource[constants.TYPE] === constants.TYPES.VERIFICATION;
    var r = isVerification ? resource.document : resource

    var passProps = {
      resource: r,
      bankStyle: this.props.bankStyle,
      currency: this.props.currency
    }
    if (!isVerification)
      passProps.verify = true
    else
      passProps.verification = resource

    var model = utils.getModel(r[constants.TYPE]).value;
    var route = {
      id: 5,
      component: MessageView,
      backButtonTitle: translate('back'),
      passProps: passProps,
      title: translate(model)
    }
    if (this.isMyMessage()) {
      route.rightButtonTitle = translate('edit');
      route.onRightButtonPress = {
        title: translate('edit'),
        component: NewResource,
        // titleTextColor: '#7AAAC3',
        id: 4,
        passProps: {
          resource: r,
          metadata: model,
          bankStyle: this.props.bankStyle,
          currency: this.props.currency,
          callback: this.props.onSelect.bind(this, r)
        }
      };
    }
    this.props.navigator.push(route);
  }
}

reactMixin(VerificationMessageRow.prototype, RowMixin);
VerificationMessageRow = makeResponsive(VerificationMessageRow)

module.exports = VerificationMessageRow;

