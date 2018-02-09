console.log('requiring MessageRow.js')
'use strict';

import extend from 'extend'
import equal from 'deep-equal'
import { makeResponsive } from 'react-native-orient'
import reactMixin from 'react-mixin'
import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  Alert,
  Navigator,
  View,
  Platform,
  WebView,
  processColor
} from 'react-native'

import React, { Component } from 'react'
import utils, {
  translate
} from '../utils/utils'

import ArticleView from './ArticleView'
import MessageView from './MessageView'
import ResourceView from './ResourceView'
import NewResource from './NewResource'
import ProductChooser from './ProductChooser'
import SplashPage from './SplashPage'
import PhotoList from './PhotoList'
import Icon from 'react-native-vector-icons/Ionicons'
import constants from '@tradle/constants'
import uiUtils from './uiUtils'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import formDefaults from '../data/formDefaults'
import Actions from '../Actions/Actions'
import StyleSheet from '../StyleSheet'
import chatStyles from '../styles/chatStyles'
import ENV from '../utils/env'

const MY_PRODUCT = 'tradle.MyProduct'
const SHARE_CONTEXT = 'tradle.ShareContext'
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'
// const REMEDIATION_SIMPLE_MESSAGE = 'tradle.RemediationSimpleMessage'
const DATA_BUNDLE = 'tradle.DataBundle'
const DATA_CLAIM = 'tradle.DataClaim'
const CONFIRMATION = 'tradle.Confirmation'
const APPLICATION_DENIAL = 'tradle.ApplicationDenial'
const INTRODUCTION = 'tradle.Introduction'
const BOOKMARK = 'tradle.Bookmark'
const {
  TYPE,
  ROOT_HASH
} = constants

const {
  MESSAGE,
  SIMPLE_MESSAGE,
  FORGET_ME,
  FORGOT_YOU,
  VERIFICATION,
  FORM,
  SELF_INTRODUCTION,
  CUSTOMER_WAITING,
  ENUM,
  // PRODUCT_LIST
} = constants.TYPES
const LIMIT = 20


class MessageRow extends Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    let {to, resource, orientation} = this.props
    return !equal(resource, nextProps.resource)   ||
           !equal(to, nextProps.to)               ||
           // (nextProps.addedItem  &&  utils.getId(nextProps.addedItem) === utils.getId(resource)) ||
           // this.props.addedItem !== nextProps.addedItem      ||
           // sendStatus !== nextProps.sendStatus               ||
           utils.resized(this.props, nextProps)
  }
  render() {
    let { resource, to, bankStyle, navigator } = this.props

    let me = utils.getMe();

    let isMyMessage = this.isMyMessage()//  &&  !isRemediationCompleted
    let ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    let renderedRow = [];
    let ret = this.formatRow(isMyMessage, renderedRow);
    let onPressCall = ret ? ret.onPressCall : null
    let isConfirmation = resource[TYPE] === CONFIRMATION

    let photoUrls = [];
    let photoListStyle = {height: 3};
    let addStyle

    let model = utils.getModel(resource[TYPE] || resource.id).value;

    let isContext = utils.isContext(model)
    let message = isContext ? ret.message : resource.message

    let noMessage = !message  ||  !message.length;
    let isSimpleMessage = resource[TYPE] === SIMPLE_MESSAGE

    let noBg = (isSimpleMessage  &&  resource.message.toLowerCase().indexOf('http') === 0)

    let isForgetting = model.id === FORGET_ME || model.id === FORGOT_YOU
    if (!renderedRow.length) {
      let vCols = noMessage ? null : utils.getDisplayName(resource);
      if (vCols)
        renderedRow = <Text style={chatStyles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else {
      let fromHash = resource.from.id;
      if (isMyMessage) {
        if (!noMessage)
          addStyle = [chatStyles.myCell,
                      noBG ? {borderColor: bankStyle.myMessageBackgroundColor, borderWidth: 1, backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0, borderRadius: 0}
                           : {backgroundColor: bankStyle.myMessageBackgroundColor}]
      }
      else if (isForgetting)
        addStyle = styles.forgetCell
      else {
        if (isConfirmation)
          addStyle = [chatStyles.verificationBody, {borderColor: '#cccccc', backgroundColor: bankStyle.confirmationBg}, styles.myConfCell]
        else {
          let mstyle = {
            borderColor: '#efefef',
            backgroundColor: model.id === DATA_BUNDLE ? '#eeffee' : '#ffffff',
            borderTopLeftRadius: 0
          }
          addStyle = (isSimpleMessage && message.length < 30)
                   ? [chatStyles.verificationBody, mstyle]
                   : [chatStyles.verificationBody, {flex: 1}, mstyle]
        }
      }

      // let isRemediationCompleted = resource[TYPE] === REMEDIATION_SIMPLE_MESSAGE
      // if (isMyMessage  &&  !isSimpleMessage  &&  !isRemediationCompleted) {
      //   let st = {backgroundColor: bankStyle.contextBackgroundColor}
      //   addStyle = [addStyle, chatStyles.verificationBody, st]; //model.style];
      // }
      let isDataBundle = resource[TYPE] === DATA_BUNDLE
      if (isMyMessage  &&  !isSimpleMessage  &&  !isDataBundle) {
        let st = {backgroundColor: bankStyle.contextBackgroundColor}
        addStyle = [addStyle, chatStyles.verificationBody, st]; //model.style];
      }
    }
    let properties = model.properties
    let inRow
    let verPhoto;
    if (properties.photos) {
      if (resource.photos) {
        let len = resource.photos.length;
        inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
        let style;
        if (inRow === 1)
          style = chatStyles.bigImage;
        else if (inRow === 2)
          style = chatStyles.mediumImage;
        else
          style = chatStyles.image;
        resource.photos.forEach((p) => {
          photoUrls.push({url: utils.getImageUri(p.url)});
        })

        let isReadOnlyChat = utils.isContext(to[TYPE])  &&  utils.isReadOnlyChat(resource._context) //context  &&  context._readOnly
        photoListStyle = {
          flexDirection: 'row',
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
          marginLeft: isReadOnlyChat ? 45 : 30, //(hasOwnerPhoto ? 45 : 10),
          borderRadius: 10,
          marginBottom: 3,
        }
      }
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }

    let rowStyle = [chatStyles.row, {backgroundColor: 'transparent'}];
    let val = this.getTime(resource);
    let date = val
             ? <Text style={chatStyles.date}>{val}</Text>
             : <View />;

    let showMessageBody;
    if (noMessage) {
      if (hasOwnerPhoto)
        showMessageBody = true;
      else if (!model.properties['message'])
        showMessageBody = true;
    }
    else
      showMessageBody = true;
    let messageBody;
    // HACK that solves the case when the message is short and we don't want it to be displayed
    // in a bigger than needed bubble
    if (message  &&  !isContext) {
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
    // HACK
    let w = utils.dimensions(MessageRow).width
    let msgWidth = w * 0.8
    let numberOfCharsInWidth = msgWidth / utils.getFontSize(10)
    let sendStatus
    let longMessage = isSimpleMessage  &&  message ? numberOfCharsInWidth < message.length : false
    if (showMessageBody) {
      let viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start'};
      if (message) {
        if (message.charAt(0) === '['  ||  longMessage)
          viewStyle.width = msgWidth; //isMyMessage || !hasOwnerPhoto ? w - 70 : w - 50;
      }
      if (!isSimpleMessage)
        viewStyle.width =  message ? Math.min(msgWidth, message.length * utils.getFontSize(18) + 40) : msgWidth


      sendStatus = this.getSendStatus()
      let sealedStatus = (resource.txId)
                       ? <View style={chatStyles.sealedStatus}>
                           <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                         </View>
                       : <View />

      let cellStyle
      if (addStyle) {
        if (/*hasOwnerPhoto  ||  */!isSimpleMessage  ||  longMessage)
          cellStyle = [chatStyles.textContainer, addStyle]
        else
          cellStyle = addStyle
      }
      else
        cellStyle = chatStyles.textContainer
      let msgContent =  <View style={[rowStyle, viewStyle]}>
                          <View style={{marginTop: 2}}>
                          {ownerPhoto}
                          </View>
                          <View style={cellStyle}>
                            <View style={styles.container}>
                            {this.isShared()
                              ? <View style={[chatStyles.verifiedHeader, {backgroundColor: bankStyle.sharedWithBg}]}>
                                  <Text style={styles.white18}>{translate('youShared', resource.to.organization.title)}</Text>
                                </View>
                              : <View />
                            }
                            {renderedRow}
                           </View>
                           {sealedStatus}
                          </View>
                        </View>

      messageBody = isSimpleMessage || isContext || isConfirmation
                  ? msgContent
                  : <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
                      {msgContent}
                    </TouchableHighlight>
    }
    else
      messageBody = <View style={{height: 5}}/>

    let len = photoUrls.length;
    inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
    let photoStyle = {};
    // let height;

    if (inRow > 0) {
      if (inRow === 1) {
        let ww = Math.max(240, msgWidth / 2)
        let hh = ww * 280 / 240
        photoStyle = [styles.bigImage, {
          width:  ww,
          height: hh
        }]
      }
      else if (inRow === 2)
        photoStyle = styles.mediumImage;
      else
        photoStyle = chatStyles.image;
    }
    photoStyle = (isLicense  &&  len === 1) ? chatStyles.bigImage : photoStyle;

    let viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
    let isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;

    let bg = bankStyle.backgroundImage ? 'transparent' : bankStyle.backgroundColor
    let contextId = this.getContextId(resource)
    return (
      <View style={[viewStyle, {backgroundColor: bg}]}>
        {date}
        {messageBody}
        {contextId}
        <View style={photoListStyle}>
          <PhotoList photos={photoUrls} resource={resource} style={[photoStyle, {marginTop: -5}]} navigator={navigator} numberInRow={inRow} />
        </View>
        {sendStatus}
      </View>
    )
    // return (
    //   <View style={[viewStyle, {backgroundColor: bankStyle.BACKGROUND_COLOR}]}>
    //     {date}
    //     {messageBody}
    //     <View style={photoListStyle}>
    //       <PhotoList photos={photoUrls} resource={resource} style={[photoStyle, {marginTop: -5}]} navigator={navigator} numberInRow={inRow} />
    //     </View>
    //     {sendStatus}
    //     {shareables}
    //   </View>
    // )
  }

  editVerificationRequest() {
    let resource = this.props.resource.document;
    let title = utils.getDisplayName(resource);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      // titleTextColor: '#999999',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: utils.getModel(resource[TYPE]).value,
        resource: resource,
        additionalInfo: this.props.resource,
        editCols: ['photos']
      }
    })
  }
  onPress(link, text) {
    this.props.navigator.push({
      id: 7,
      title: text || '',
      backButtonTitle: 'Back',
      component: ArticleView,
      passProps: {url: link}
    });
  }
  createNewResource(model, isMyMessage) {
    let resource = {
      'from': this.props.resource.to,
      'to': this.props.resource.from,
    }
    resource.message = this.props.resource.message;
    resource[TYPE] = model.id;

    // Prefill for testing and demoing
    let isPrefilled = ENV.prefillForms && model.id in formDefaults
    if (isPrefilled) {
      extend(true, resource, formDefaults[model.id])
      // console.log(JSON.stringify(resource, 0, 2))
    }

    this.props.navigator.push({
      id: 4,
      title: translate(model),
      rightButtonTitle: isMyMessage ? null : 'Done',
      backButtonTitle: 'Back',
      component: NewResource,
      // titleTextColor: '#7AAAC3',
      passProps:  {
        model: model,
        resource: resource,
        isPrefilled: isPrefilled,
        currency: this.props.currency,
        bankStyle: this.props.bankStyle,
        originatingMessage: this.props.resource
      }
    });
  }

  verify(event) {
    let resource = this.props.resource;
    let isVerification = resource[TYPE] === VERIFICATION;
    let r = isVerification ? resource.document : resource

    let passProps = {
      resource: r,
      bankStyle: this.props.bankStyle,
      currency: this.props.currency
    }
    if (!isVerification)
      passProps.verify = true
    else
      passProps.verification = resource

    let model = utils.getModel(r[TYPE]).value;
    let route = {
      id: 5,
      component: MessageView,
      backButtonTitle: 'Back',
      passProps: passProps,
      title: translate(model)
    }
    if (this.isMyMessage()) {
      route.rightButtonTitle = 'Edit';
      route.onRightButtonPress = {
        title: 'Edit',
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

  formatRow(isMyMessage, renderedRow) {
    let { resource, bankStyle, navigator, to, isLast, currency } = this.props
    let model = utils.getModel(resource[TYPE] || resource.id).value;

    let isReadOnlyChat = to[TYPE]  &&  utils.isReadOnlyChat(resource, resource._context) //this.props.context  &&  this.props.context._readOnly

    if (utils.isContext(model)) {
      let msgModel = utils.getModel(resource.product).value
      let str = !navigator.isConnected  &&  isLast
              ? translate('noConnectionForNewProduct', utils.getMe().firstName, translate(msgModel))
              : translate('newProductMsg', translate(msgModel))
      let color = isMyMessage ? bankStyle.contextTextColor : '#757575'
      let maxWidth = Math.floor(0.8 * utils.dimensions().width) - (isReadOnlyChat ? 90 : 40) // message width - icon size and all the paddings
      let msg = !navigator.isConnected  &&  isLast
              ? <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, {color: color}]}>{str}</Text>
                </View>
              : <View key={this.getNextKey()} style={{flexDirection: 'row'}}>
                  <View style={{flexDirection: 'column', maxWidth: maxWidth}}>
                    <Text style={[chatStyles.resourceTitle, {color: color, marginTop: 3}]}>{str}</Text>
                  </View>
                  <Icon name='ios-folder-open-outline' size={25} color={color} style={{position: 'absolute', right: 0}}/>
                </View>
      renderedRow.push(msg);
      return ({message: str})
    }
    if (model.id === APPLICATION_DENIAL  ||  (model.id === CONFIRMATION  &&  isMyMessage)) {
      let iname = model.id === APPLICATION_DENIAL ? 'md-close-circle' : 'ios-ribbon'
      let icolor = model.id === APPLICATION_DENIAL ? 'red' : '#ffffff'
      let msg = <View key={this.getNextKey()}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
                      <Text style={[chatStyles.resourceTitle, {color: isMyMessage ? '#ffffff' : '#555555'}]}>{resource.message}</Text>
                    </View>
                    <Icon style={{position: 'absolute', bottom: 0, right: 2, color: icolor}} size={20} name={iname} />
                  </View>
                </View>

      renderedRow.push(msg)
      return {onPressCall: null}

    }
    // let isRemediationCompleted = resource[TYPE] === REMEDIATION_SIMPLE_MESSAGE
    // if (isRemediationCompleted) {
    //   let msg = <View key={this.getNextKey()}>
    //               <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
    //                 <View style={{flex: 1}}>
    //                   <Text style={[chatStyles.resourceTitle, {color: isMyMessage ? '#ffffff' : '#555555'}]}>{resource.message}</Text>
    //                 </View>
    //                 <Icon style={{color: bankStyle.linkColor, paddingLeft: 10}} size={20} name={'ios-arrow-forward'} />
    //               </View>
    //             </View>

    //   renderedRow.push(msg)
    //   return {onPressCall: isMyMessage ? this.showMyData.bind(this) : null}
    // }

    if (resource[TYPE] === DATA_BUNDLE) {
      let message = 'Click here to see ' + resource.items.length + ' resources imported from ' + resource.from.title + ' on your profile page.'
      let msg = <View key={this.getNextKey()}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flex: 1}}>
                      <Text style={[chatStyles.resourceTitle, {color: isMyMessage ? '#ffffff' : '#555555'}]}>{resource.message || message}</Text>
                    </View>
                    <Icon style={{color: bankStyle.linkColor, paddingLeft: 10, alignSelf: 'center'}} size={20} name={'ios-arrow-forward'} />
                  </View>
                </View>

      renderedRow.push(msg)
      return {onPressCall: this.showMyData.bind(this)}
    }
    // let isProductList = model.id === PRODUCT_LIST
    // if (isProductList) {
    //   // Case when the needed form was sent along with the message
    //   if (resource.welcome) {
    //     let msg = <View key={this.getNextKey()}>
    //             <Text style={chatStyles.resourceTitle}>{translate('hello', utils.getMe().firstName)}</Text>
    //             <View style={chatStyles.rowContainer}>
    //               <Text style={[chatStyles.resourceTitle, {color: bankStyle.linkColor}]}>{translate('listOfProducts')} </Text>
    //               <Icon style={{color: bankStyle.linkColor, marginTop: 2}} size={20} name={'ios-arrow-forward'} />
    //             </View>
    //           </View>
    //     renderedRow.push(msg);
    //     return {onPressCall: this.onChooseProduct.bind(this, true)}
    //   }
    // }
    let isSelfIntroduction = model.id === SELF_INTRODUCTION
    let isCustomerWaiting = model.id === CUSTOMER_WAITING
    if (isSelfIntroduction || isCustomerWaiting) {
      let msg = <View key={this.getNextKey()}>
                  <View style={chatStyles.rowContainer}>
                    <Text style={[chatStyles.resourceTitle, {color: isMyMessage ? '#ffffff' : '#757575', fontStyle: isCustomerWaiting ? 'italic' : 'normal'}]}>{resource.message}</Text>
                    <Icon style={{color: bankStyle.linkColor, backgroundColor: 'transparent',  paddingLeft: 5}} size={20} name={'ios-person'} />
                  </View>
                </View>
      renderedRow.push(msg);
      return null
      // return {onPressCall: this.addContact.bind(this)}
    }
    if (model.id === INTRODUCTION) {
      let profile
      if (resource.profile)
        profile = <Text style={[chatStyles.resourceTitle, {paddingRight: 20, color: isMyMessage ? '#ffffff' : '#757575', fontStyle: isCustomerWaiting ? 'italic' : 'normal'}]}>{resource.profile.firstName + ' ' + (resource.profile.lastName ||  '')}</Text>

      let msg = <View key={this.getNextKey()}>
                  <View style={chatStyles.rowContainer}>
                    <Text style={[chatStyles.resourceTitle, {paddingRight: 20, color: isMyMessage ? '#ffffff' : '#757575', fontStyle: isCustomerWaiting ? 'italic' : 'normal'}]}>{resource.message}</Text>
                    {profile}
                    <Icon style={{color: bankStyle.linkColor, backgroundColor: 'transparent',  paddingLeft: 5}} size={20} name={'ios-person'} />
                  </View>
                </View>
      renderedRow.push(msg);
      return null
    }
    if (model.id === DATA_CLAIM) {
      let message = 'Request for remediation to \n' + resource.to.organization.title
      let msg = <View key={this.getNextKey()}>
                  <View style={chatStyles.rowContainer}>
                    <Icon size={50} name='md-qr-scanner' color='#ffffff' style={{paddingHorizontal: 10}} />
                    <Text style={[chatStyles.resourceTitle, {color: '#ffffff', justifyContent: 'center'}]}>{resource.message || message}</Text>
                  </View>
                </View>
      renderedRow.push(msg);
      return null
    }

    if (model.id === SHARE_CONTEXT) {
      let w = Math.floor(0.8 * utils.dimensions().width) - 40 // message width - icon size and all the paddings
      let msg = <View key={this.getNextKey()}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{flexDirection: 'column', width: w}}>
                      <Text style={[chatStyles.resourceTitle, {color: '#ffffff'}]}>{resource.message}</Text>
                    </View>
                    <View style={{justifyContent: 'center'}}>
                      <Icon style={{color: '#ffffff', backgroundColor: 'transparent',  paddingLeft: 5}} size={20} name={'md-share'} />
                    </View>
                  </View>
                </View>
      renderedRow.push(msg);
      return null
    }
    if (model.id === APPLICATION_SUBMITTED) {
      let msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, {color: bankStyle.confirmationColor}]}>{resource.message}</Text>
                </View>
      renderedRow.push(msg);
      return null
    }
    if (model.id === BOOKMARK) {
      let params = {filterResource: resource, search: true, modelName: resource[TYPE], limit: LIMIT * 2, first: true}
      let msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, {color: '#ffffff'}]}>{translate('Bookmark was created')}</Text>
                  <Text style={[chatStyles.resourceTitle, {color: '#ffffff'}]}>{resource.message || utils.makeModelTitle(model)}</Text>
                </View>
      renderedRow.push(msg);
      return {onPressCall: () => uiUtils.showBookmarks(this.props)}
    }
    let isForgetting = model.id === FORGET_ME || model.id === FORGOT_YOU
    if (isForgetting) {
      let msg = <View key={this.getNextKey()}>
                  <Text style={[chatStyles.resourceTitle, styles.white18]} key={this.getNextKey()}>{resource.message}</Text>
                </View>
      renderedRow.push(msg)
      return null
    }

    let viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    let first = true;

    let properties = model.properties;
    let noMessage = !resource.message  ||  !resource.message.length;
    let onPressCall;

    let isMyProduct = model.subClassOf === MY_PRODUCT
    let isSimpleMessage = model.id === SIMPLE_MESSAGE
    let isConfirmation = model.id === CONFIRMATION
    let cnt = 0;

    let vCols = [];

    viewCols.forEach((v) => {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;

      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(this.getPropRow(properties[v], resource, resource[v].title || resource[v]))
          first = false;
        }
        return;
      }
      let style = isSimpleMessage ? chatStyles.resourceTitle : chatStyles.description; //resourceTitle; //(first) ? chatStyles.resourceTitle : styles.description;
      if (isMyMessage)
        style = [style, {justifyContent: 'flex-end', color: isMyProduct ? '#2892C6' : '#ffffff'}];

      if (resource[v]                      &&
          properties[v].type === 'string'  &&
          (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
        if (resource[v].trim().indexOf(' ') === -1) {
          let {width, height} = utils.dimensions(MessageRow)
          vCols.push(<WebView key={this.getNextKey()} style={{width: width * 0.8, height: 150}}
             source={{uri: resource[v]}}
             startInLoadingState={true}
             automaticallyAdjustContentInsets={false} />)
        }
        else {
          onPressCall = this.onPress.bind(this, resource.message);
          vCols.push(<Text style={style} numberOfLines={first ? 2 : 1} key={this.getNextKey()}>{resource[v]}</Text>);
        }
      }
      else if (isConfirmation) {
        style = [style, {color: this.props.bankStyle.confirmationColor}, chatStyles.resourceTitle]
        vCols.push(
          <View key={this.getNextKey()}>
            <Text style={[style]}>{resource[v]}</Text>
            <Icon style={[{color: this.props.bankStyle.confirmationColor, alignSelf: 'flex-end', width: 50, height: 50, marginTop: -25, opacity: 0.2}]} size={45} name={'ios-flower'} />
            <Icon style={{color: this.props.bankStyle.confirmationColor, alignSelf: 'flex-end', marginTop: -30}} size={30} name={'ios-done-all'} />
          </View>
        );

      }
      else if (!model.autoCreate) {
        let val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];

        if (!val)
          return
        if (model.properties.verifications  &&  !isMyMessage)
          onPressCall = this.verify.bind(this);
        if (!isMyMessage)
          style = [style, {paddingBottom: 10, color: '#2892C6'}];
        vCols.push(this.getPropRow(properties[v], resource, val))
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return
        let msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          if (resource.welcome) {
            let bg  = isMyMessage
                      ? this.props.bankStyle.myMessageBackgroundColor
                      : '#ffffff'
            let color = isMyMessage ? this.props.bankStyle.myMessageLinkColor : bankStyle.linkColor
            let msg = <View key={this.getNextKey()}>
                        <Text style={style}>{msgParts[0]}</Text>
                        <View style={chatStyles.rowContainer}>
                          <Text style={[style, {backgroundColor: bg, color: color}]}>{msgParts[1]} </Text>
                          <Icon style={{color: bankStyle.linkColor, marginTop: 2}} size={20} name={'ios-arrow-forward'} />
                        </View>
                      </View>
            vCols.push(msg);
            onPressCall = this.onChooseProduct.bind(this, true)
            return;
          }
          let s = msgParts[1].split('_')
          let msgModel = utils.getModel(s[0]);
          let color, link
          if (msgModel) {
            // if (this.props.shareableResources  &&  !isSimpleMessage)
            //   style = /*isSimpleMessage ? chatStyles.resourceTitle : */chatStyles.description;
            msgModel = msgModel.value;
            let shareMyProduct = msgModel.subClassOf === MY_PRODUCT
            if (shareMyProduct) {
              color = {color: '#aaaaaa'}
              onPressCall = null
              link = <Text style={[style, color]}>{translate(msgModel)}</Text>
            }
            else {
              if (!msgParts[0].length)
                msgParts[0] = 'I just sent you a request for '; // + msgModel.title;
              if (s.length === 2)
                onPressCall = this.editForm.bind(this, msgParts[1], msgParts[0])
              else if (!isMyMessage  &&  !resource._documentCreated)
                onPressCall = this.createNewResource.bind(this, msgModel, isMyMessage);

              color = isMyMessage
                    ? {color: this.props.bankStyle.myMessageLinkColor}
                    : {color: '#2892C6'}
              if (isMyMessage)
                link = <Text style={[style, color]}>{translate(msgModel)}</Text>
              else
                link = <View style={chatStyles.rowContainer}>
                           <Text style={[style, {color: resource._documentCreated ?  '#757575' : bankStyle.linkColor}]}>{translate(msgModel)}</Text>
                           <Icon style={[{marginTop: 2}, resource._documentCreated || isReadOnlyChat ? chatStyles.linkIconGreyed : {color: isMyMessage ? this.props.bankStyle.myMessageLinkColor : bankStyle.linkColor}]} size={20} name={'ios-arrow-forward'} />
                       </View>
            }
            let strName = isMyProduct
                        ? translate('shareProduct', translate(msgModel))
                        : utils.getStringName(msgParts[0])
            let str = strName ? utils.translate(strName) : msgParts[0]
            let msg = <View key={this.getNextKey()}>
                       <Text style={style}>{str}</Text>
                       {link}
                     </View>
            vCols.push(msg);
            return;
          }
        }
        // else
        //   isConfirmation = resource[v].indexOf('Congratulations!') !== -1

        let pVal = resource[v]
        let linkIdx = pVal.indexOf('<http')
        if (linkIdx !== -1) {
          let endLink = pVal.indexOf('>', linkIdx)
          let link = pVal.substring(linkIdx + 1, endLink)

          let textIdx = pVal.indexOf('[')
          let text
          if (textIdx) {
            text = pVal.substring(textIdx + 1, linkIdx - 1)
            linkIdx = textIdx
          }
          vCols.push(<TouchableHighlight underlayColor='transparent' onPress={this.onPress.bind(this, link, text)}  key={this.getNextKey()}>
                      <Text style={style}>
                        {pVal.substring(0, linkIdx)}
                        <Text style={[style, {color: bankStyle.linkColor}]}>{text || link} </Text>
                        {pVal.substring(endLink + 1)}
                      </Text>
                     </TouchableHighlight>
          // vCols.push(<Text key={this.getNextKey()}>
          //               <Text style={style}>{pVal.substring(0, linkIdx)}</Text>
          //               <TouchableHighlight underlayColor='transparent' onPress={this.onPress.bind(this, link, text)}>
          //                 <Text style={[style, {color: bankStyle.bankStyle.linkColor}]}>{text || link}</Text>
          //               </TouchableHighlight>
          //               <Text style={style}>{pVal.substring(endLink + 1)}</Text>
          //             </Text>
            )
          return null
        }
        else if (isSimpleMessage) {
          let params = { resource, message: resource[v], bankStyle, noLink: true }
          let row = utils.parseMessage(params)
          if (typeof row === 'string') {
            if (this.isUrl(resource[v])) {
              let {width, height} = utils.dimensions(MessageRow)
              vCols.push(<WebView key={this.getNextKey()} style={{width: width * 0.8, height: 150}}
                 source={{uri: resource[v]}}
                 startInLoadingState={true}
                 automaticallyAdjustContentInsets={false} />)
            }
            else
              vCols.push(<Text style={style} key={this.getNextKey()}>{resource[v]}</Text>)
          }
          else
            vCols.push(row)
        }
        else
          vCols.push(<Text style={style} key={this.getNextKey()}>{resource[v]}</Text>)
      }
      first = false;

    });
    if (!isSimpleMessage  &&  !isMyProduct  &&  !isConfirmation)  {
      let title = translate(model)
      if (title.length > 30)
        title = title.substring(0, 27) + '...'

      vCols.push(<Text style={[chatStyles.resourceTitle, chatStyles.formType, {color: (isMyMessage  &&  '#EBFCFF') || bankStyle.contextBorderColor}]} key={this.getNextKey()}>{title}</Text>);
    }
    if (vCols  &&  vCols.length) {
      vCols.forEach((v) => {
        renderedRow.push(v);
      })
    }
    if (isReadOnlyChat)
      return null
    if (onPressCall)
      return {onPressCall: onPressCall}
    if (isSimpleMessage)
      return isConfirmation ? {isConfirmation: true} : null
    return {onPressCall: this.props.onSelect.bind(this, resource, null)}
  }
  isUrl(message) {
    let s = message.toLowerCase()
    if (s.indexOf('http://') == 0  ||  s.indexOf('https://') == 0) {
      if (s.trim().indexOf(' ') === -1)
        return true
    }
    return false
  }
  showMyData() {
    let me = utils.getMe()
    let title = translate('profile')
    this.props.navigator.push({
      title: title,
      id: 3,
      component: ResourceView,
      backButtonTitle: translate('back'),
      passProps: {
        resource: me,
        bankStyle: this.props.bankStyle
      }
    })
    // let n = this.props.navigator.getCurrentRoutes().length
    // this.props.navigator.popN(n - 2)
    // this.showResources(me, utils.getModel(me[TYPE]).value.properties.myForms)
  }

  // onChooseProduct() {
  //   if (this.props.isAggregation)
  //     return
  //   let modelName = MESSAGE
  //   let model = utils.getModel(modelName).value;
  //   let isInterface = model.isInterface;
  //   if (!isInterface)
  //     return;

  //   let resource = this.props.to
  //   let currentRoutes = this.props.navigator.getCurrentRoutes();
  //   this.props.navigator.push({
  //     title: translate('iNeed'), //I need...',
  //     id: 15,
  //     component: ProductChooser,
  //     sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
  //     backButtonTitle: 'Back',
  //     passProps: {
  //       resource: resource,
  //       returnRoute: currentRoutes[currentRoutes.length - 1],
  //       products: this.props.resource.list,
  //       callback: this.props.callback,
  //       bankStyle: this.props.bankStyle
  //     },
  //   });
  // }
  editForm(rUri, message) {
    let s = rUri.split('_')
    let resource = {
      [TYPE]: s[0],
      [ROOT_HASH]: s[1]
    }

    let rmodel = utils.getModel(s[0]).value;
    let title = translate(rmodel);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      // titleTextColor: '#999999',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: rmodel,
        resource: resource,
        message: message
      }
    })
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1
  },
  forgetCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
    borderTopLeftRadius: 0,
    backgroundColor: 'red',
  },
  myConfCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderTopLeftRadius: 0,
    borderRadius: 10,
  },
  white18: {
    color: '#ffffff',
    fontSize: 18
  },
});
reactMixin(MessageRow.prototype, RowMixin);
reactMixin(MessageRow.prototype, ResourceMixin)
MessageRow = makeResponsive(MessageRow)

module.exports = MessageRow;
