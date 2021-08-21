import {
  // Text,
  TouchableHighlight,
  View,
  Platform,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { makeResponsive } from 'react-native-orient'
import equal from 'lodash/isEqual'

import constants from '@tradle/constants'
const { TYPE } = constants

import utils, { translate } from '../utils/utils'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import StyleSheet from '../StyleSheet'
import reactMixin from 'react-mixin'
import chatStyles from '../styles/chatStyles'
import ImageInput from './ImageInput'
import { parseMessage } from '../utils/uiUtils'
import { Text } from './Text'

const PHOTO = 'tradle.Photo'
const IPROOV_SELFIE = 'tradle.IProovSelfie'

class FormErrorRow extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    bankStyle: PropTypes.object,
    to: PropTypes.object,
    sendStatus: PropTypes.bool,
  };
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    let { resource, to } = this.props
    if (this.props.sendStatus !== nextProps.sendStatus)
      return true
    if (resource._documentCreated !== nextProps.resource._documentCreated ||
        resource._sendStatus !== nextProps.resource._sendStatus)
      return true
    let rid = utils.getId(resource)
    if (rid !== utils.getId(nextProps.resource) ||
        !equal(to, nextProps.to)                ||
        utils.resized(this.props, nextProps))
      return true
    return false
  }

  render() {
    let { resource, bankStyle } = this.props

    let isMyMessage = this.isMyMessage()//  &&  !isRemediationCompleted

    let renderedRow = [];
    let ret = this.formatRow(isMyMessage, renderedRow);
    let onPressCall = ret ? ret.onPressCall : null

    let addStyle

    let message = resource.message

    if (!renderedRow.length) {
      let vCols = utils.getDisplayName({ resource })
      if (vCols)
        renderedRow = <Text style={chatStyles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else {
      if (isMyMessage)
        addStyle = [chatStyles.myCell, {backgroundColor: bankStyle.myMessageBackgroundColor}]
      else
        addStyle = [chatStyles.verificationBody, {flex: 1, borderTopLeftRadius: 0}]

      addStyle = [addStyle, chatStyles.verificationBody, {backgroundColor: bankStyle.formErrorBg, borderColor: resource._documentCreated ? bankStyle.fixErrorColor : bankStyle.formErrorBorder}]; //model.style];
    }
    let rowStyle = [chatStyles.row, {backgroundColor: 'transparent'}];
    let val = this.getTime(resource);
    let date = val
             ? <Text style={chatStyles.date} numberOfLines={1}>{val}</Text>
             : <View />;

    let props = utils.getEditableProperties(resource)
    let prop = props.length === 1  &&  props[0]
    // HACK
    let msgWidth = utils.getMessageWidth(FormErrorRow)

    let width =  message ? Math.min(msgWidth, message.length * utils.getFontSize(18) + 40) : msgWidth
    if (!isMyMessage)
      width -= 43
    let viewStyle = { width }
    let sendStatus = this.getSendStatus()
    let sealedStatus = (resource.txId)
                     ? <View style={chatStyles.sealedStatus}>
                         <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                       </View>
                     : <View />

    let cellStyle
    if (addStyle)
      cellStyle = addStyle
    else
      cellStyle = chatStyles.textContainer
    let messageBody
    if (prop) {
      if (prop.ref == PHOTO) {
        messageBody = <View style={[rowStyle, viewStyle]}>
                       <ImageInput cameraType={prop.cameraType} allowPicturesFromLibrary={prop.allowPicturesFromLibrary} style={{flex: 1}} onImage={item => this.onSetMediaProperty(prop.name, item)}>
                        <View style={cellStyle}>
                          {renderedRow}
                        </View>
                       </ImageInput>
                     </View>
      }
      else if (resource.prefill[TYPE] === IPROOV_SELFIE) {
        messageBody = <View key={this.getNextKey()}>
                        <TouchableHighlight onPress={() => this.showIproovScanner(prop, prop.name)} underlayColor='transparent'>
                        <View style={cellStyle}>
                           {renderedRow}
                        </View>
                        </TouchableHighlight>
                     </View>
      }
    }
    if (!messageBody) {
      let shared
      if (this.isShared())
        shared = <View style={[chatStyles.verifiedHeader, {backgroundColor: bankStyle.sharedWithBg}]}>
                   <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
                 </View>

      messageBody = <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
                      <View style={viewStyle}>
                        <View style={cellStyle}>
                          <View style={styles.container}>
                            {shared}
                            {renderedRow}
                         </View>
                         {sealedStatus}
                        </View>
                      </View>
                    </TouchableHighlight>
      if (!isMyMessage) {
        messageBody = <View style={chatStyles.row}>
                        <View style={{marginTop: 2}}>
                          {this.getOwnerPhoto(isMyMessage)}
                        </View>
                        {messageBody}
                      </View>
      }
    }
    let bg = bankStyle.backgroundImage ? 'transparent' : bankStyle.backgroundColor
    return (
      <View style={[styles.viewStyle, {backgroundColor: bg, width: width, alignSelf: isMyMessage ? 'flex-end' : 'flex-start'}]}>
        {date}
        {messageBody}
        {sendStatus}
      </View>
    )
  }

  showEditResource() {
    let errs = {}
    let requestedProperties = {}
    let { resource, allowedMimeTypes, navigator, currency, bankStyle } = this.props
    let r = resource.prefill
    if (resource.errors  &&  resource.errors.length) {
      if (Array.isArray(resource.errors)) {
        for (let p of resource.errors)
          errs[p.name] = p.error
      }
      else
        errs = resource.errors
    }
    else if (resource.requestedProperties) {
      for (let p of resource.requestedProperties) {
        requestedProperties[p.name] = p.message || ''
        if (!resource.errors)
          resource.errors = []
        resource.errors.push({name: [p.name], error: translate('thisFieldIsRequired')})
      }
    }

    let me = utils.getMe()
    r.from = {
      id: utils.getId(me),
      title: utils.getDisplayName({ resource: me })
    }
    r.to = resource.from

    // Prefill for testing and demoing
    // let isPrefilled = model.id in formDefaults
    // if (isPrefilled)
    //   extend(true, resource, formDefaults[model.id])
    let type = utils.getType(r)
    let model = utils.getModel(type)
    navigator.push({
      title: translate(model),
      rightButtonTitle: 'Done',
      backButtonTitle: 'Back',
      componentName: 'NewResource',
      // titleTextColor: '#7AAAC3',
      passProps:  {
        model: utils.getLensedModel(resource), //model,
        lensId: resource.lens,
        resource: r,
        isPrefilled: true,
        errs,
        requestedProperties,
        currency,
        bankStyle,
        originatingMessage: resource,
        allowedMimeTypes
      }
    });

  }
  formatRow(isMyMessage, renderedRow) {
    let {resource, to, application, bankStyle } = this.props
    let model = utils.getModel(resource[TYPE] || resource.id)

    let isContext = to[TYPE]  &&  utils.isContext(to[TYPE])
    let context = isContext ? to : resource._context

    let isReadOnlyChat
    if (application)
      isReadOnlyChat = true
    else if (context) {
      if (context.from) {
        if (utils.getId(context.from) !== utils.getId(utils.getMe())) {
          if (!utils.isMyMessage({resource: context}))
            isReadOnlyChat = true
        }
      }
      else if (utils.isReadOnlyChat(resource, context))
        isReadOnlyChat = true
    }

    let viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return

    let properties = model.properties;

    let vCols = [];

    viewCols.forEach((v) => {
      if (properties[v].type === 'array'  ||
          properties[v].type === 'date'   ||
          properties[v].range === 'json'  ||
          properties[v].partial)
        return;

      if (properties[v].ref) {
        if (resource[v])
          vCols.push(this.getPropRow(properties[v], resource, resource[v].title || resource[v]))
        return;
      }
      let style = chatStyles.resourceTitle
      if (isMyMessage)
        style = [style, styles.myMessage];

      let rtype = resource.prefill[TYPE] || utils.getId(resource.prefill).split('_')[0]
      let iconName = resource._documentCreated ? 'ios-done-all' : 'ios-arrow-forward'
      let iconSize = resource._documentCreated ? 30 : 20
      let noLink = resource._documentCreated ||  (application  &&  !this.canEmployeePrefill(resource))
      let params = { resource, message: resource.message, bankStyle, noLink }

      let msg = parseMessage(params)
      if (typeof msg === 'string') {
        vCols.push(
          <View key={this.getNextKey()} style={{paddingBottom: 3}}>
            <Text style={[style, {color: '#555555'}]}>{resource.message} </Text>
            <View style={chatStyles.rowContainer}>
              <Text style={[style, {color: resource._documentCreated || isReadOnlyChat ?  '#aaaaaa' : this.props.bankStyle.formErrorColor}]}>{translate(utils.getModel(rtype))}</Text>
              <Icon name={iconName} size={iconSize} color={resource._documentCreated || isReadOnlyChat ? this.props.bankStyle.fixErrorColor : this.props.bankStyle.formErrorColor} style={Platform.OS === 'web' ? {marginTop: -3} : {}}/>
            </View>
          </View>
        )
      }
      else {
        vCols.push(
          <View style={chatStyles.rowContainer} key={this.getNextKey()}>
                <View style={styles.container}>
                  {msg}
                </View>
                <Icon name={iconName} size={iconSize} color={resource._documentCreated || isReadOnlyChat ? this.props.bankStyle.fixErrorColor : this.props.bankStyle.formErrorColor} style={Platform.OS === 'web' ? {marginTop: -3} : {}}/>
              </View>
        )
      }
    });
    if (vCols  &&  vCols.length) {
      vCols.forEach((v) => {
        renderedRow.push(v);
      })
    }
    if (isReadOnlyChat)
      return null
    if (resource._documentCreated)
      return null
    if (utils.getId(resource.from) === utils.getId(utils.getMe()))
      return null
    else
      return {onPressCall: this.showEditResource.bind(this)}
  }
  canEmployeePrefill(resource) {
    const { application } = this.props
    return !resource._documentCreated  &&  application  &&  utils.isRM(application)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  white18: {
    color: '#ffffff',
    fontSize: 18
  },
  viewStyle: {
    margin: 1,
    backgroundColor: '#f7f7f7'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  myMessage: {
    justifyContent: 'flex-end',
    color: '#ffffff'
  }
});
reactMixin(FormErrorRow.prototype, RowMixin);
reactMixin(FormErrorRow.prototype, ResourceMixin)
FormErrorRow = makeResponsive(FormErrorRow)

module.exports = FormErrorRow;
