'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
import CustomIcon from '../styles/customicons'
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin');
var equal = require('deep-equal')
// var BG_IMAGE = require('../img/verificationBg.jpg')

import { makeResponsive } from 'react-native-orient'
var Actions = require('../Actions/Actions')
var StyleSheet = require('../StyleSheet')
var chatStyles = require('../styles/chatStyles')
var reactMixin = require('react-mixin');

import {
  Image,
  // StyleSheet,
  Text,
  TouchableOpacity,
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
    if (this.props.orientation !== nextProps.orientation  &&  this.props.orientation !== 'UNKNOWN'  &&  nextProps.orientation !== 'UNKNOWN')
      return true
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
             ? <Text style={chatStyles.date} numberOfLines={1}>{time}</Text>
             : <View />;

    var isMyMessage = this.isMyMessage();

    var dType = utils.getType(resource.document)
    var msgModel = utils.getModel(dType).value
    var orgName = resource._verifiedBy
                ? resource._verifiedBy.title
                : resource.organization  ? resource.organization.title : ''

    let isThirdPartyVerification
    let isReadOnlyChat
    if (this.props.context) {
      let me = utils.getMe()
      if (me.isEmployee) {
        isReadOnlyChat = utils.isReadOnlyChat(this.props.to)
        if  (isReadOnlyChat)
          isThirdPartyVerification = utils.getId(resource.organization) !== utils.getId(this.props.context.to.organization)
        else if (this.props.to[constants.TYPE] === constants.TYPES.PROFILE)
          isThirdPartyVerification = utils.getId(me) !== utils.getId(this.props.context.to) || (resource._verifiedBy  &&  utils.getId(me.organization) !== utils.getId(resource._verifiedBy))
      }
      else
        isThirdPartyVerification = resource._verifiedBy != null && utils.getId(resource._verifiedBy)  !== utils.getId(resource.organization)// &&  utils.getId(this.props.context.to.organization) !== utils.getId(resource._verifiedBy)
    }
    let isShared = this.isShared()
    isMyMessage = isShared
    let bankStyle = this.props.bankStyle
    let color
    let vHeaderTextColor
    if (isThirdPartyVerification) {
      color = '#93BEBA'
      vHeaderTextColor = color
    }
    else {
      // color = bankStyle.VERIFIED_LINK_COLOR
      vHeaderTextColor = bankStyle.VERIFIED_HEADER_TEXT_COLOR || bankStyle.VERIFIED_LINK_COLOR
    }

    let verifiedBy = isShared ? translate('youShared', orgName) : translate('verifiedBy', orgName)

    var w = utils.dimensions(VerificationMessageRow).width
    let msgWidth = Math.min(Math.floor(w * 0.8), 600)
    if (isReadOnlyChat)
      msgWidth -= 50 // provider icon and padding
    let numberOfCharacters = msgWidth / 12
    if (verifiedBy.length > numberOfCharacters)
      verifiedBy = verifiedBy.substring(0, numberOfCharacters) + '..'

    let headerStyle = [
      styles.header,
      isMyMessage ? styles.headerRight : styles.headerLeft,
      {backgroundColor: bankStyle.VERIFIED_HEADER_COLOR, marginTop: 0, paddingVertical: 10}
    ]
    // let bulletStyle = {color: color, marginHorizontal: 7, alignSelf: 'center'}
    let row = this.formatDocument({
                model: msgModel,
                verification: resource,
                onPress: this.verify.bind(this),
                isAccordion: isThirdPartyVerification,
                isMyMessage: isMyMessage
              })

    let state, confidence
    if (resource.sources) {
      resource.sources.forEach((r) => {
        if (r.method  &&  r.method.rawData)
          state = <Text style={{color: r.method.rawData.result === 'clear' ? 'green' : 'red', fontSize: 20}}>{r.method.rawData.result}</Text>
        else if (r.method.confidence)
          confidence = <Text style={{color: r.method.confidence > 0.67 ? 'green' : 'red', fontSize: 20, paddingLeft: 5}}>{translate('Confidence') + ': ' + r.method.confidence}</Text>
      })
      if (state || confidence)
        state = <View style={{alignItems: 'flex-end', paddingHorizontal: 10}}>
                  {state}
                  {confidence}
                </View>
    }
    // renderedRow = <View>
    //                 <View style={headerStyle}>
    //                   <Icon style={[chatStyles.verificationIcon, {color: color}]} size={20} name={'md-checkmark'} />
    //                   <Text style={[chatStyles.verificationHeaderText, styles.verificationHeaderText]}>{verifiedBy}</Text>
    //                 </View>
    //                 <View style={styles.separator}>
    //                   <View style={[styles.separatorPart, {width: msgWidth * 0.2}]} />
    //                   <Text style={bulletStyle}>🔸</Text>
    //                   <View style={[styles.separatorPart, {width: msgWidth * 0.2}]} />
    //                 </View>
    //                 <View>{row}</View>
    //               </View>
    renderedRow = <View>
                    <View style={headerStyle}>
                      <Icon style={[chatStyles.verificationIcon, {color: vHeaderTextColor}]} size={20} name={'md-checkmark'} />
                      <Text style={[chatStyles.verificationHeaderText, styles.verificationHeaderText, {color: vHeaderTextColor}]}>{verifiedBy}</Text>
                    </View>
                    <View style={{marginVertical: 10}}>
                      {row}
                      {state}
                    </View>
                  </View>

    var viewStyle = {
      width: msgWidth,
      flexDirection: 'row',
      alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
      backgroundColor: 'transparent',
      marginBottom: 3,
    }

    let addStyle = [
      { borderWidth: 0, backgroundColor: 'transparent'}, /*, backgroundColor: isShared ? '#ffffff' : bankStyle.VERIFIED_BG,*/
      isMyMessage ? styles.headerRight : styles.headerLeft
    ];

    let shareWith
    if (this.props.shareWithRequestedParty) {
      let title = this.props.shareWithRequestedParty.organization && this.props.shareWithRequestedParty.organization.title
      shareWith = <View style={styles.shareWithInquirer}>
                    <TouchableOpacity onPress={this.shareWithRequestedParty.bind(this)}>
                       <View style={[chatStyles.shareButton, {marginLeft: 15, justifyContent: 'flex-start'}]}>
                        <CustomIcon name='tradle' style={{color: '#4982B1' }} size={32} />
                        <Text style={chatStyles.shareText}>{translate('Share')}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.center}>
                      <Text style={styles.shareWithText}>{'with ' + title}</Text>
                    </View>
                  </View>
    }
    else
      shareWith = <View/>

    let messageBody =
          <TouchableOpacity onPress={this.verify.bind(this, resource)} style={{marginTop: 10}}>
            <View style={styles.messageBody}>
              <View style={[chatStyles.row, viewStyle]}>
                {this.getOwnerPhoto(isMyMessage)}
                <View style={[chatStyles.textContainer, addStyle]}>
                  <View style={[{width: msgWidth}, styles.imageFrame, {backgroundColor: '#ffffff', borderWidth: 1, borderColor: bankStyle.VERIFIED_BORDER_COLOR}, isMyMessage ? styles.headerRight : styles.headerLeft]}>
                    <View style={[{width: msgWidth-2}, styles.image, addStyle]}>
                      {renderedRow}
                    </View>
                    {shareWith}
                  </View>
                </View>
                 <Icon name='ios-flower-outline' size={40} color={bankStyle.VERIFIED_BORDER_COLOR} style={{position: 'absolute', right: isReadOnlyChat ? -50 : 0, top: -15}} />
              </View>
              {this.getSendStatus()}
            </View>
          </TouchableOpacity>

    // let messageBody =
    //       <TouchableOpacity onPress={this.verify.bind(this, resource)}>
    //         <View style={styles.messageBody}>
    //           <View style={[chatStyles.row, viewStyle]}>
    //             {this.getOwnerPhoto(isMyMessage)}
    //             <View style={[chatStyles.textContainer, addStyle]}>
    //               <View style={[{width: msgWidth}, styles.imageFrame, isMyMessage ? styles.headerRight : styles.headerLeft]}>
    //                 <Image source={BG_IMAGE} style={[{width: msgWidth-2}, styles.image, addStyle]} >
    //                   {renderedRow}
    //                 </Image>
    //                 {shareWith}
    //              </View>
    //           </View>
    //         </View>
    //         {this.getSendStatus()}
    //         </View>
    //       </TouchableOpacity>

    // let bg
    // if (this.props.bankStyle.BACKGROUND_IMAGE)
    //   bg = 'transparent'
    // else
    //   bg = bankStyle.BACKGROUND_COLOR
    var viewStyle = { margin: 1} //, backgroundColor: bg }
    return (
      <View style={viewStyle} key={this.getNextKey()}>
        {date}
        {messageBody}
      </View>
    );
  }
  shareWithRequestedParty() {
    this.props.navigator.pop()
    Actions.share(this.props.resource, this.props.shareWithRequestedParty.organization, this.props.originatingMessage) // forRequest - originating message
  }
  verify(event) {
    var resource = this.props.resource;
    var isVerification = resource[constants.TYPE] === constants.TYPES.VERIFICATION;
    var r = resource // isVerification &&  !resource.sources  &&  !resource.method  ? resource.document : resource

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
    let title
    if (r[constants.TYPE] === constants.TYPES.VERIFICATION) {
      let type = utils.getType(r.document)
      if (type)
        title = translate(utils.getModel(type).value)
    }
    if (!title)
      title = translate(model)
    var route = {
      id: 5,
      component: MessageView,
      backButtonTitle: translate('back'),
      passProps: passProps,
      title: title
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
  shareWithInquirer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderColor: '#dddddd',
    // marginHorizontal: -7,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopColor: '#dddddd',
    borderWidth: 0.5
  },
  separator: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: -5
  },
  separatorPart: {
    height: 1,
    backgroundColor: '#cccccc',
    alignSelf: 'center'
  },
  verificationHeaderText: {
    color: '#555555',
    fontStyle: 'italic'
  },
  header: {
    marginTop: 10,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    paddingVertical: 5,
    justifyContent: 'center'
  },
  headerRight: {
    borderTopRightRadius: 0,
    borderTopLeftRadius: 10
  },
  headerLeft: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 10
  },
  messageBody: {
    flexDirection: 'column',
    flex: 1,
    margin: 2,
    paddingVertical: 3
  },
  image: {
    borderRadius: 10,
    // minHeight: 110,
    // resizeMode: 'cover',
    overflow: 'hidden'
  },
  imageFrame: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    // borderColor: '#D4D4B8'
  },
  center: {
    justifyContent: 'center'
  },
  shareWithText: {
    fontSize: 16,
    color: '#757575'
  }

})
reactMixin(VerificationMessageRow.prototype, RowMixin);
VerificationMessageRow = makeResponsive(VerificationMessageRow)

module.exports = VerificationMessageRow;

