'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var NewResource = require('./NewResource');
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin')
var extend = require('extend')
var equal = require('deep-equal')
var Actions = require('../Actions/Actions');
import { makeResponsive } from 'react-native-orient'
var StyleSheet = require('../StyleSheet')
var reactMixin = require('react-mixin');
var chatStyles = require('../styles/chatStyles')
import ImageInput from './ImageInput'

const FORM_ERROR = 'tradle.FormError'
const ENUM = 'tradle.Enum'
const PHOTO = 'tradle.Photo'

const DEFAULT_LINK_COLOR = '#2892C6'

import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  Alert,
  Navigator,
  View,
  Platform,
  processColor
} from 'react-native'

import React, { Component } from 'react'
import ENV from '../utils/env'

class FormErrorRow extends Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !equal(this.props.resource, nextProps.resource)   ||
           !equal(this.props.to, nextProps.to)               ||
           this.props.addedItem !== nextProps.addedItem      ||
           this.props.orientation !== nextProps.orientation  ||
           this.props.sendStatus !== nextProps.sendStatus
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    var isMyMessage = this.isMyMessage()//  &&  !isRemediationCompleted
    var to = this.props.to;
    var ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    var renderedRow = [];
    var ret = this.formatRow(isMyMessage, renderedRow);
    let onPressCall = ret ? ret.onPressCall : null

    var addStyle

    let message = resource.message

    const bankStyle = this.props.bankStyle

    if (!renderedRow.length) {
      var vCols = utils.getDisplayName(resource, model.properties);
      if (vCols)
        renderedRow = <Text style={chatStyles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else {
      var fromHash = resource.from.id;
      if (isMyMessage)
        addStyle = [chatStyles.myCell, {backgroundColor: bankStyle.MY_MESSAGE_BACKGROUND_COLOR}]
      else {
        let borderColor = bankStyle.REQUEST_FULFILLED
        let mstyle = {
          borderColor: borderColor,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 0
        }
        addStyle = [chatStyles.verificationBody, {flex: 1}, mstyle]
      }

      addStyle = [addStyle, chatStyles.verificationBody, {backgroundColor: bankStyle.FORM_ERROR_BG, borderColor: resource.documentCreated ? bankStyle.REQUEST_FULFILLED : bankStyle.FORM_ERROR_BORDER}]; //model.style];
    }
    var properties = model.properties;

    var rowStyle = [chatStyles.row, {backgroundColor: 'transparent'}];
    var val = this.getTime(resource);
    var date = val
             ? <Text style={chatStyles.date} numberOfLines={1}>{val}</Text>
             : <View />;

    var messageBody;
    var sendStatus = <View />
    // HACK that solves the case when the message is short and we don't want it to be displayed
    // in a bigger than needed bubble
    if (message) {
      let parts = utils.splitMessage(message)
      if (parts.length == 2)
        message = parts[0].length > parts[1].length ? parts[0] : parts[1]
      else
        message = parts[0]
      let strName = utils.getStringName(message)
      if (strName)
        message = translate(strName)
      if (resource.form) {
        let formTitle = translate(resource.form)
        if (formTitle.length > message.length)
          message = formTitle
      }
    }
    let prop =  this.isOnePropForm()
    // HACK
    var w = utils.dimensions(FormErrorRow).width
    let msgWidth = w * 0.8
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)

    var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start', width: utils.getMessageWidth(FormErrorRow)};

    if (this.props.sendStatus  &&  this.props.sendStatus !== null)
      sendStatus = this.getSendStatus()
    var sealedStatus = (resource.txId)
                     ? <View style={chatStyles.sealedStatus}>
                         <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                       </View>
                     : <View />

    let cellStyle
    if (addStyle)
      cellStyle = addStyle
    else
      cellStyle = chatStyles.textContainer
    if (prop  &&  prop.ref == PHOTO) {
      if (utils.isWeb() && ENV.canUseWebcam) {
        let icon = <Icon style={{marginTop: 2, marginRight: 2, color: isMyMessage ? bankStyle.MY_MESSAGE_LINK_COLOR : bankStyle.LINK_COLOR}} size={20} name={'ios-arrow-forward'} />
        messageBody = <View key={this.getNextKey()}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TouchableHighlight style={{flex: 1}} underlayColor='transparent' onPress={this.showCamera.bind(this, prop)}>
                    <View style={cellStyle}>
                      {renderedRow}
                    </View>
                  </TouchableHighlight>
                 {resource.documentCreated ? null : icon}
                </View>
              </View>
      }
      else
        messageBody = <View style={[rowStyle, viewStyle]}>
                       <ImageInput prop={prop} style={{flex: 1}} onImage={item => this.onSetMediaProperty(prop.name, item)}>
                        <View style={cellStyle}>
                        {renderedRow}
                        </View>
                       </ImageInput>
                     </View>
    }
    else {
      let msgContent =  <View style={[rowStyle, viewStyle]}>
                          <View style={{marginTop: 2}}>
                          {ownerPhoto}
                          </View>
                          <View style={cellStyle}>
                            <View style={styles.container}>
                            {this.isShared()
                              ? <View style={[chatStyles.verifiedHeader, {backgroundColor: bankStyle.SHARED_WITH_BG}]}>
                                  <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
                                </View>
                              : <View />
                            }
                            {renderedRow}
                           </View>
                           {sealedStatus}
                          </View>
                        </View>


      messageBody = <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
                      {msgContent}
                    </TouchableHighlight>
    }
    // var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var bg = bankStyle.BACKGROUND_IMAGE ? 'transparent' : bankStyle.BACKGROUND_COLOR
    return (
      <View style={[viewStyle, {backgroundColor: bg}]}>
        {date}
        {messageBody}
        {sendStatus}
      </View>
    )
  }
  onSetMediaProperty(propName, item) {
    if (!item)
      return;
    let formRequest = this.props.resource
    Actions.addItem({
      disableFormRequest: formRequest,
      resource: {
        [constants.TYPE]: formRequest.prefill[constants.TYPE],
        [propName]: item,
        _context: formRequest._context,
        from: utils.getMe(),
        to: formRequest.from  // FormRequest.from
      }
    })
  }

  showEditResource() {
    let errs = {}
    let r = this.props.resource.prefill
    if (Array.isArray(this.props.resource.errors)) {
      for (let p of this.props.resource.errors)
        errs[p.name] = p.error
    }
    else
      errs = this.props.resource.errors

    let me = utils.getMe()
    r.from = {
      id: utils.getId(me),
      title: utils.getDisplayName(me)
    }
    r.to = this.props.resource.from

    // Prefill for testing and demoing
    // var isPrefilled = model.id in formDefaults
    // if (isPrefilled)
    //   extend(true, resource, formDefaults[model.id])
    let type = utils.getType(r)
    let model = utils.getModel(type).value
    this.props.navigator.push({
      id: 4,
      title: translate(model),
      rightButtonTitle: 'Done',
      backButtonTitle: 'Back',
      component: NewResource,
      // titleTextColor: '#7AAAC3',
      passProps:  {
        model: model,
        resource: r,
        isPrefilled: true,
        errs: errs,
        currency: this.props.currency,
        bankStyle: this.props.bankStyle,
        originatingMessage: this.props.resource
      }
    });

  }
  formatRow(isMyMessage, renderedRow) {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    let isReadOnlyChat = this.props.to[constants.TYPE]  &&  utils.isReadOnlyChat(resource, this.props.context) //this.props.context  &&  this.props.context._readOnly

    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var self = this;

    var properties = model.properties;

    var cnt = 0;
    var self = this

    var vCols = [];

    viewCols.forEach((v) => {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;

      if (properties[v].ref) {
        if (resource[v])
          vCols.push(this.getPropRow(properties[v], resource, resource[v].title || resource[v]))
        return;
      }
      var style = chatStyles.resourceTitle
      if (isMyMessage)
        style = [style, {justifyContent: 'flex-end', color: '#ffffff'}];

      let rtype = resource.prefill[constants.TYPE] || utils.getId(resource.prefill).split('_')[0]
      let iconName = resource.documentCreated ? 'ios-done-all' : 'ios-arrow-forward'
      let iconSize = resource.documentCreated ? 30 : 20

      vCols.push(
        <View key={self.getNextKey()} style={{paddingBottom: 3}}>
          <Text style={[style, {color: '#555555'}]}>{resource.message} </Text>
          <View style={chatStyles.rowContainer}>
            <Text style={[style, {color: resource.documentCreated || isReadOnlyChat ?  '#aaaaaa' : self.props.bankStyle.FORM_ERROR_COLOR}]}>{translate(utils.getModel(rtype).value)}</Text>
            <Icon name={iconName} size={iconSize} color={resource.documentCreated || isReadOnlyChat ? self.props.bankStyle.REQUEST_FULFILLED : self.props.bankStyle.FORM_ERROR_COLOR} style={Platform.OS === 'web' ? {marginTop: -3} : {}}/>
          </View>
        </View>
      )
    });
    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      })
    }
    if (isReadOnlyChat)
      return null
    if (resource.documentCreated)
      return null
    if (utils.getId(resource.from) === utils.getId(utils.getMe()))
      return null
    else
      return {onPressCall: this.showEditResource.bind(this)}
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  white18: {
    color: '#ffffff',
    fontSize: 18
  },
});
reactMixin(FormErrorRow.prototype, RowMixin);
reactMixin(FormErrorRow.prototype, ResourceMixin)
FormErrorRow = makeResponsive(FormErrorRow)

module.exports = FormErrorRow;
