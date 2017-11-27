'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var dateformat = require('dateformat')
var PhotoList = require('./PhotoList');
import Icon from 'react-native-vector-icons/Ionicons';
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin');
var equal = require('deep-equal')
import { makeResponsive } from 'react-native-orient'

var StyleSheet = require('../StyleSheet')
var chatStyles = require('../styles/chatStyles')
var reactMixin = require('react-mixin');

const MAX_PROPS_IN_FORM = 1
const PHOTO = 'tradle.Photo'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const SENT = 'Sent'

const { IDENTITY, ENUM, VERIFICATION } = constants.TYPES
var { TYPE } = constants
import {
  // StyleSheet,
  Text,
  TouchableHighlight,
  Navigator,
  View,
  Image
} from 'react-native'

import React, { Component } from 'react'

class FormMessageRow extends Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate(nextProps, nextState) {
    let {resource, to, orientation} = this.props
    return utils.getId(resource) !== utils.getId(nextProps.resource) ||
           !equal(to, nextProps.to)             ||
           // (nextProps.addedItem  &&  utils.getId(nextProps.addedItem) === utils.getId(resource)) ||
           orientation != nextProps.orientation ||
           resource._sendStatus !== nextProps.resource._sendStatus
           // (this.props.sendStatus !== SENT  &&  this.props.sendStatus !== nextProps.sendStatus)
  }

  onPress(event) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: this.props.resource.message}
    });
  }
  verify(event) {
    var resource = this.props.resource;
    var isVerification = resource[TYPE] === VERIFICATION;
    var r = isVerification ? resource.document : resource
    var bankStyle = this.props.bankStyle
    var passProps = {
      resource: r,
      bankStyle: bankStyle,
      currency: this.props.currency
    }
    if (!isVerification)
      passProps.verify = true
    else
      passProps.verification = resource

    var model = utils.getModel(r[TYPE]).value;
    var route = {
      id: 5,
      component: MessageView,
      backButtonTitle: 'Back',
      passProps: passProps,
      title: translate(model)
    }
    if (this.isMyMessage()) {
      route.rightButtonTitle = 'Edit'
      route.onRightButtonPress = {
        title: 'Edit',
        component: NewResource,
        // titleTextColor: '#7AAAC3',
        id: 4,
        passProps: {
          resource: r,
          metadata: model,
          bankStyle: bankStyle,
          currency: this.props.currency,
          callback: this.props.onSelect.bind(this, r),
          defaultPropertyValues: this.props.defaultPropertyValues,
        }
      };
    }
    this.props.navigator.push(route);
  }
  render() {
    let { resource, to, bankStyle, application } = this.props
    var model = utils.getModel(resource[TYPE]).value
    let photos = utils.getResourcePhotos(model, resource)
    var photoListStyle = {height: 3};
    var photoUrls = []
    var isMyMessage = this.isMyMessage()
    let isShared = this.isShared()

    if (photos) {
      photoUrls = photos
      // photos.forEach((p) => {
      //   photoUrls.push({url: utils.getImageUri(p.url)});
      // })
      let isSharedContext = utils.isContext(to[TYPE]) && utils.isReadOnlyChat(resource._context)
      photoListStyle = {
        flexDirection: 'row',
        alignSelf: isMyMessage || isShared ? 'flex-end' : 'flex-start',
        marginLeft: isMyMessage || isShared ? 30 : isSharedContext || application ? 43 : 0, //(hasOwnerPhoto ? 45 : 10),
        borderRadius: 10,
        marginBottom: 3,
      }
    }
    var len = photoUrls.length;
    var inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
    var photoStyle = {};
    if (inRow > 0) {
      if (inRow === 1) {
        var ww = Math.min(240, photoUrls[0].width)
        var hh = (ww / photoUrls[0].width) * photoUrls[0].height
        photoStyle = [chatStyles.bigImage, {
          width:  ww,
          height: hh
        }]
      }
      else if (inRow === 2)
        photoStyle = chatStyles.mediumImage;
      else
        photoStyle = chatStyles.image;
    }
    let sendStatus = this.getSendStatus()
    var val = this.getTime(resource);
    var date = val
             ? <Text style={chatStyles.date} numberOfLines={1}>{val}</Text>
             : <View />;
    let bg = bankStyle.backgroundImage ? {} : {backgroundColor: bankStyle.backgroundColor}

    let stub = this.formStub(resource, to)
    if (resource[TYPE] !== PRODUCT_REQUEST)
      stub = <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, null)} underlayColor='transparent'>
               {stub}
             </TouchableHighlight>

    return  <View style={[{margin: 1}, bg]}>
              {date}
              {stub}
              <View style={photoListStyle}>
                <PhotoList photos={photoUrls} resource={resource} style={[photoStyle, {marginTop: -5}]} navigator={this.props.navigator} numberInRow={inRow} chat={to} />
              </View>
              {sendStatus}
            </View>
  }
  formStub(resource, toChat) {
    let hasSentTo
    if (!toChat)
      hasSentTo = true
    else {
      hasSentTo = (resource.to.organization  && utils.getId(toChat) !== utils.getId(resource.to.organization))
      if (hasSentTo) {
        let me = utils.getMe()
        if (me.isEmployee) {
          if (utils.getId(me.organization) === utils.getId(resource.to.organization))
            hasSentTo = false
        }
      }
    }
    let sentTo = hasSentTo
               ? <View style={{padding: 5}}>
                   <Text style={{color: '#7AAAC3', fontSize: 14, alignSelf: 'flex-end'}}>{translate('asSentTo', resource.to.organization.title)}</Text>
                 </View>
               : <View/>

    let renderedRow = []
    let ret = this.formatRow(isMyMessage || isShared, renderedRow)
    let noContent = !hasSentTo &&  !renderedRow.length

    let isMyMessage = this.isMyMessage()
    let isShared = this.isShared()
    // let isSharedContext = toChat  &&  utils.isContext(toChat[TYPE]) && resource._context  &&  utils.isReadOnlyChat(resource._context)

    let width = Math.floor(utils.dimensions().width * 0.8) // - (isSharedContext  ? 45 : 0))
    let { bankStyle, application } = this.props
    // if (application)
    //   width -= 50 // provider icon and padding

    var viewStyle = {
      width: width, // - (isSharedContext  ? 45 : 0),
      alignSelf: isMyMessage || isShared ? 'flex-end' : 'flex-start',
      marginLeft: isMyMessage || isShared ? 30 : 0, //(hasOwnerPhoto ? 45 : 10),
      backgroundColor: 'transparent', //this.props.bankStyle.BACKGROUND_COLOR,
      flexDirection: 'row',
    }

    let headerStyle = [
      chatStyles.verifiedHeader,
      noContent ? {borderBottomLeftRadius: 10, borderBottomRightRadius: 10} : {},
      {backgroundColor: isMyMessage ? bankStyle.myMessageBackgroundColor : bankStyle.sharedWithBg}, // opacity: isShared ? 0.5 : 1},
      isMyMessage || isShared ? {borderTopRightRadius: 0, borderTopLeftRadius: 10 } : {borderTopRightRadius: 10, borderTopLeftRadius: 0 }
    ]

    var st = {
      margin: 1,
      paddingRight: 10,
      // flexDirection: 'row',
      backgroundColor: 'transparent', // this.props.bankStyle.BACKGROUND_COLOR
    }
    var sealedStatus = (resource.txId)
                     ? <View style={chatStyles.sealedStatus}>
                         <Icon style={{marginTop: 2}} name='md-done-all' size={20} color='#EBFCFF'/>
                       </View>
                     : <View />

    let row
    if (noContent)
      row = <View/>
    else
      row = <View style={{paddingVertical: 5}}>
              {renderedRow}
              {sentTo}
            </View>
    let contextId = this.getContextId(resource)

    var ownerPhoto = this.getOwnerPhoto(isMyMessage)
    var arrowIcon
    if (!utils.isContext(resource))
      arrowIcon = <Icon color='#EBFCFF' size={20} name={'ios-arrow-forward'}/>
    return (
      <View style={st, viewStyle} key={this.getNextKey()}>
        {ownerPhoto}
        <View style={[{flex:1}, chatStyles.verificationBody]}>
          <View style={[headerStyle, {justifyContent: 'space-between', paddingLeft: 5, paddingRight: 7}]}>
            <View>
              {sealedStatus}
              <Text style={chatStyles.verificationHeaderText}>{translate(utils.getModel(resource[TYPE]).value)}</Text>
            </View>
            {arrowIcon}
          </View>
          {row}
          {contextId}
        </View>
      </View>
    );
  }

  formatRow(isMyMessage, renderedRow) {
    var resource = this.props.resource;
    var model = utils.getModel(resource[TYPE] || resource.id).value;

    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols) {
      viewCols = model.required
      if (!viewCols)
        return
    }
    var first = true;
    var self = this;

    var properties = model.properties;
    var onPressCall;

    var vCols = [];
    let isShared = this.isShared()

    viewCols.forEach((v) => {
      if (vCols.length > MAX_PROPS_IN_FORM)
        return
      if (properties[v].type === 'array') {
        if (resource[v]  &&  properties[v].items.ref  &&  utils.getModel(properties[v].items.ref).value.subClassOf === ENUM) {
          let val
          resource[v].forEach((r) => {
            let title = utils.getDisplayName(r)
            val = val ? val + '\n' + title : title
          })
          vCols.push(this.getPropRow(properties[v], resource, val))
        }
        return;
      }
      if (utils.isHidden(v, resource))
        return
      let ref = properties[v].ref
      if (ref) {
        if (resource[v]  &&  ref !== PHOTO  &&  ref !== IDENTITY) {
          vCols.push(this.getPropRow(properties[v], resource, resource[v].title || resource[v]))
          first = false;
        }
        return;
      }
      var style = chatStyles.resourceTitle
      if (isMyMessage || isShared)
        style = [style, styles.myMsg];

      if (resource[v]                      &&
          properties[v].type === 'string'  &&
          (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
        onPressCall = this.onPress.bind(self);
        vCols.push(<Text style={style} key={this.getNextKey()}>{resource[v]}</Text>);
      }
      if (resource[v]  &&  properties[v].signature) {
        let {width, height} = utils.dimensions(FormMessageRow)
        let h = 70
        let w
        if (width > height)
          w = (width * 70)/(height - 100)
        else
          w = (height * 70)/(width - 100)
        w = Math.round(w)
        vCols.push(<View style={{flexDirection: 'row'}} key={this.getNextKey()}>
                      <View style={[styles.column, {flex: 1}]}>
                        <Text style={[styles.descriptionG]}>{properties[v].title}</Text>
                      </View>
                      <View style={[styles.column, {paddingLeft: 3, flex: 3}]}>
                       <Image style={{width: w, height: h}} source={{uri: resource[v]}}/>
                     </View>
                   </View>)
      }
      else if (!model.autoCreate) {
        let val
        if (properties[v].type === 'date')
          // val = dateformat(new Date(resource[v]), 'mmm d, yyyy')
          val = resource[v] ? dateformat(new Date(resource[v]), 'mmm d, yyyy') : null
        else if (properties[v].displayAs)
          val = utils.templateIt(properties[v], resource)
        else if (model.id === PRODUCT_REQUEST  &&  v === 'requestFor')
          val = utils.makeModelTitle(utils.getModel(resource[v]).value)
        else
          val = properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];

        if (!val)
          return
        if (model.properties.verifications  &&  !isMyMessage && !utils.isVerifier(resource))
          onPressCall = this.verify.bind(self);
        if (!isMyMessage && !isShared)
          style = [style, {paddingBottom: 10, color: '#2892C6'}];
        vCols.push(this.getPropRow(properties[v], resource, val))
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return
        vCols.push(<Text style={style} key={this.getNextKey()}>{resource[v]}</Text>);
      }
      first = false;

    });

    if (vCols.length > MAX_PROPS_IN_FORM)
      vCols.splice(MAX_PROPS_IN_FORM, 1)

    if (vCols  &&  vCols.length) {
      vCols.forEach((v) => {
        renderedRow.push(v);
      })
    }
    if (onPressCall)
      return {onPressCall: onPressCall}
    return {onPressCall: this.props.onSelect.bind(this, resource, null)}
  }
}

var styles = StyleSheet.create({
  myMsg: {
    justifyContent: 'flex-end',
    // color: '#ffffff'
  },
  youSharedText: {
    color: '#ffffff',
    fontSize: 18
  }
});
reactMixin(FormMessageRow.prototype, RowMixin);
FormMessageRow = makeResponsive(FormMessageRow)

module.exports = FormMessageRow;
