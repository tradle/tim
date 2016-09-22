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

var reactMixin = require('react-mixin');

const VERIFICATION_BG = '#FBFFE5' //'#F6FFF0';

import {
  Image,
  StyleSheet,
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
           this.props.sendStatus !== nextProps.sendStatus
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var renderedRow = [];

    var time = this.getTime(resource);
    var date = time
             ? <Text style={styles.date} numberOfLines={1}>{time}</Text>
             : <View />;

    var isMyMessage = this.isMyMessage();
//    var msgWidth = isMyMessage ? DeviceWidth - 70 : DeviceWidth - 50;

    var msgModel = utils.getModel(resource.document[constants.TYPE]).value;
    var orgName = resource.organization  ? resource.organization.title : ''

    let me = utils.getMe()
    let isThirdPartyVerification
    if (me.isEmployee  &&  !this.props.to.organization) {
      // Check if I am the employee of the organization I opened a chat with or the customer
      isThirdPartyVerification = !utils.isEmployee(resource.organization)
    }
    let bgColor =  isThirdPartyVerification ? '#93BEBA' : this.props.bankStyle.VERIFIED_HEADER_COLOR
    let verifiedBy = translate('verifiedBy', orgName)
    if (verifiedBy.length > 25)
      verifiedBy = verifiedBy.substring(0, 25) + '..'
    renderedRow = <View>
                    <View style={[styles.verifiedHeader, {backgroundColor: bgColor}]}>
                      <Icon style={styles.verificationIcon} size={20} name={'md-checkmark'} />
                      <Text style={styles.verificationHeaderText}>{verifiedBy}</Text>
                    </View>
                    <View style={{paddingTop: 5}}>
                      {this.formatDocument(msgModel, resource, this.verify.bind(this), isThirdPartyVerification)}
                    </View>
                  </View>

    var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start', backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}
    if (isMyMessage)
      viewStyle.marginLeft = 70
    else
      viewStyle.marginRight = 50
    let addStyle = [styles.verificationBody, {backgroundColor: this.props.bankStyle.VERIFICATION_BG, borderColor: bgColor}];
    let messageBody =
          <TouchableHighlight onPress={this.verify.bind(this, resource)} underlayColor='transparent'>
            <View style={[styles.row, viewStyle]}>
              {this.getOwnerPhoto(isMyMessage)}
              <View style={[styles.textContainer, addStyle]}>
                <View style={{flex: 1}}>
                  {renderedRow}
               </View>
              </View>
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

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  date: {
    flex: 1,
    color: '#999999',
    fontSize: 12,
    alignSelf: 'center',
    paddingTop: 10
  },
  row: {
    // alignItems: 'center',
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
  },
  verifiedHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginHorizontal: -8,
    marginTop: -6,
    justifyContent: 'center'
  },
  verificationHeaderText: {
    fontSize: 18,
    fontWeight: '500',
    alignSelf: 'center',
    color: '#FBFFE5'
  },
  verificationBody: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 2
  },
  verificationIcon: {
    width: 20,
    height: 20,
    color: '#ffffff',
  },
});
reactMixin(VerificationMessageRow.prototype, RowMixin);

module.exports = VerificationMessageRow;

