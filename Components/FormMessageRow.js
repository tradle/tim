console.log('requiring FormMessageRow.js')
'use strict';

import utils from '../utils/utils'
var translate = utils.translate
import ArticleView from './ArticleView'
import MessageView from './MessageView'
import NewResource from './NewResource'
import dateformat from 'dateformat'
import PhotoList from './PhotoList'
import Icon from 'react-native-vector-icons/Ionicons';
import constants from '@tradle/constants'
import RowMixin from './RowMixin'
import equal from 'deep-equal'
import { makeResponsive } from 'react-native-orient'
import { makeStylish } from './makeStylish'

import StyleSheet from '../StyleSheet'
import chatStyles from '../styles/chatStyles'
import reactMixin from 'react-mixin'

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
  View,
  Image
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'

class FormMessageRow extends Component {
  static displayName = 'FormMessageRow'
  constructor(props) {
    super(props);
    this.onPress = this.onPress.bind(this)
  }
  shouldComponentUpdate(nextProps, nextState) {
    let {resource, to, orientation, application} = this.props
    if (application) {
      let thisRM = application.relationshipManager
      let nextRM = nextProps.application.relationshipManager
      if (thisRM) {
        if (nextProps.application  &&  (!nextRM  ||  utils.getId(nextRM) !== utils.getId(thisRM)))
          return true
      }
      else if (nextRM)
        return true
    }
    if (this.props.bankStyle !== nextProps.bankStyle)
      return true
    return utils.getId(resource) !== utils.getId(nextProps.resource) ||
           !equal(to, nextProps.to)             ||
           // (nextProps.addedItem  &&  utils.getId(nextProps.addedItem) === utils.getId(resource)) ||
           orientation != nextProps.orientation ||
           resource._sendStatus !== nextProps.resource._sendStatus ||
           resource._latest !== nextProps.resource._latest
           // (this.props.sendStatus !== SENT  &&  this.props.sendStatus !== nextProps.sendStatus)
  }

  onPress(event) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: this.props.resource.message}
    });
  }
  render() {
    let { resource, to, bankStyle, application } = this.props
    let model = utils.getModel(resource[TYPE])
    let photos = utils.getResourcePhotos(model, resource)
    let photoUrls = []
    let isMyMessage = this.isMyMessage()
    let isShared = this.isShared()
    let isSharedContext

    var len = photoUrls.length;
    var inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
    var photoStyle
    var width = utils.getMessageWidth(FormMessageRow)
    if (application)
      width -= 50 // provider icon and padding
    if (inRow > 0) {
      if (inRow === 1) {
        var ww = Math.min(240, photoUrls[0].width)
        var hh = (ww / photoUrls[0].width) * photoUrls[0].height
        photoStyle = {
          borderRadius: 10,
          margin: 1,
          width:  ww,
          height: hh,
          marginTop: -2
        }
      }
      else if (inRow === 2)
        photoStyle = chatStyles.mediumImage;
      else
        photoStyle = chatStyles.image;
    }
    let sendStatus = this.getSendStatus()
    let val = this.getTime(resource);
    let date = val
             ? <Text style={chatStyles.date} numberOfLines={1}>{val}</Text>
             : <View />;
    let bg = bankStyle.backgroundImage ? {} : {backgroundColor: bankStyle.backgroundColor}

    let styles = createStyles({bankStyle, isMyMessage, isShared, width, isSharedContext, application})
    let photoListStyle = {height: 3};
    if (photos) {
      photoUrls = photos
      // photos.forEach((p) => {
      //   photoUrls.push({url: utils.getImageUri(p.url)});
      // })
      isSharedContext = utils.isContext(to[TYPE]) && utils.isReadOnlyChat(resource._context)
      photoListStyle = styles.photoListStyle
      // photoListStyle = {
      //   flexDirection: 'row',
      //   alignSelf: isMyMessage || isShared ? 'flex-end' : 'flex-start',
      //   borderRadius: 10,
      //   marginBottom: 3,
      // }
      // if (isSharedContext || application)
      //   photoListStyle.marginLeft = 40
    }
    let stub = this.formStub(resource, to, styles)
    if (resource[TYPE] !== PRODUCT_REQUEST)
      stub = <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, null)} underlayColor='transparent'>
               {stub}
             </TouchableHighlight>

    return  <View style={styles.pageView}>
              {date}
              {stub}
              <View style={photoListStyle}>
                <PhotoList photos={photoUrls} resource={resource} style={photoStyle} navigator={this.props.navigator} numberInRow={inRow} chat={to} />
              </View>
              {sendStatus}
            </View>
  }
  formStub(resource, toChat, styles) {
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
    let renderedRow = []
    let isMyMessage = this.isMyMessage()

    let isShared = this.isShared()
    // let isSharedContext = toChat  &&  utils.isContext(toChat[TYPE]) && resource._context  &&  utils.isReadOnlyChat(resource._context)

    var width = utils.getMessageWidth(FormMessageRow)
    let { bankStyle, application } = this.props
    // if (application)
    //   width -= 50 // provider icon and padding

    // let viewStyle = {
    //   // width: width,
    //   alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
    //   // marginLeft: isMyMessage ? 30 : 0, //(hasOwnerPhoto ? 45 : 10),
    //   backgroundColor: 'transparent', //this.props.bankStyle.BACKGROUND_COLOR,
    //   flexDirection: 'row',
    // }
    this.formatRow(isMyMessage || isShared, renderedRow, styles)
    let noContent = !hasSentTo &&  !renderedRow.length

    let headerStyle = [
      chatStyles.verifiedHeader,
      // noContent ? {borderBottomLeftRadius: 10, borderBottomRightRadius: 10} : {},
      {backgroundColor: isMyMessage ? bankStyle.myMessageBackgroundColor : bankStyle.sharedWithBg}, // opacity: isShared ? 0.5 : 1},
      isMyMessage || isShared ? {borderTopRightRadius: 0, borderTopLeftRadius: 10 } : {borderTopRightRadius: 10, borderTopLeftRadius: 0 }
    ]

    let sealedStatus = resource.txId  &&  <Icon name='md-done-all' size={20} color='#EBFCFF'/>
    let model = utils.getModel(resource[TYPE])
    if (noContent) {
      let prop = model.properties.time
      if (prop  &&  resource[prop.name]) {
        let val = dateformat(new Date(resource[prop.name]), 'mmm d, yyyy')
        renderedRow = [this.getPropRow(prop, resource, val)]
        noContent = false
      }
    }
    let sentTo
    if (hasSentTo)
      sentTo = <View style={styles.sentToView}>
                 <Text style={styles.sentTo}>{translate('asSentTo', resource.to.organization.title)}</Text>
               </View>
    let row = <View style={{paddingVertical: noContent ? 0 : 5}}>
                {renderedRow}
                {sentTo}
              </View>
    let contextId = this.getContextId(resource)

    let ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let arrowIcon
    if (!utils.isContext(resource))
      arrowIcon = <Icon color='#EBFCFF' size={20} name={'ios-arrow-forward'}/>
    return (
      <View style={styles.viewStyle} key={this.getNextKey()}>
        {ownerPhoto}
        <View style={[{flex:1, width: width}, chatStyles.verificationBody]}>
          <View style={[headerStyle, {justifyContent: 'space-between', paddingLeft: 5, paddingRight: 7}, noContent  &&  styles.noContentStyle]}>
            <Text style={chatStyles.verificationHeaderText}>{translate(model) + ' '}
              {sealedStatus}
            </Text>
            {arrowIcon}
          </View>
          {row}
          {contextId}
        </View>
      </View>
    );
  }

  formatRow(isMyMessage, renderedRow, styles) {
    let resource = this.props.resource;
    let model = utils.getModel(resource[TYPE] || resource.id);

    let viewCols = model.gridCols || model.viewCols;
    if (!viewCols) {
      viewCols = model.required
      if (!viewCols)
        return
    }
    let first = true;

    let properties = model.properties;
    let onPressCall;

    let vCols = [];
    let isShared = this.isShared()
    if (viewCols)
      viewCols = utils.ungroup(model, viewCols)

    viewCols.forEach((v) => {
      if (vCols.length > MAX_PROPS_IN_FORM)
        return
      if (properties[v].markdown)
        return
      if (properties[v].type === 'array') {
        if (resource[v]  &&  properties[v].items.ref  &&  utils.getModel(properties[v].items.ref).subClassOf === ENUM) {
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
      let style = chatStyles.resourceTitle
      if (isMyMessage || isShared)
        style = [style, styles.myMsg];

      if (resource[v]                      &&
          properties[v].type === 'string'  &&
          (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
        onPressCall = this.onPress;
        vCols.push(<Text style={style} key={this.getNextKey()}>{resource[v]}</Text>);
      }
      if (resource[v]  &&  properties[v].signature)
        vCols.push(
          <View key={this.getNextKey()}>
            <Text style={styles.title}>{properties[v].title}</Text>
            <Image style={styles.sig} source={{uri: resource[v]}}/>
          </View>
        )

      else if (!model.autoCreate) {
        let val
        if (properties[v].type === 'date')
          // val = dateformat(new Date(resource[v]), 'mmm d, yyyy')
          val = resource[v] ? dateformat(new Date(resource[v]), 'mmm d, yyyy') : null
        else if (properties[v].displayAs)
          val = utils.templateIt(properties[v], resource)
        else if (model.id === PRODUCT_REQUEST  &&  v === 'requestFor')
          val = utils.makeModelTitle(utils.getModel(resource[v]))
        else
          val = properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];

        if (!val)
          return
        // if (model.properties.verifications  &&  !isMyMessage && !utils.isVerifier(resource))
        //   onPressCall = this.verify.bind(this)
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
    // if (onPressCall)
    //   return {onPressCall: onPressCall}
    // return {onPressCall: this.props.onSelect.bind(this, resource, null)}
  }
}

var createStyles = utils.styleFactory(FormMessageRow, function (params) {
  let { dimensions, bankStyle, isMyMessage, isShared, width, isSharedContext, application } = params
  let moreHeader = isMyMessage || isShared ? {borderTopRightRadius: 0, borderTopLeftRadius: 10 } : {borderTopRightRadius: 10, borderTopLeftRadius: 0 }
  let bg = isMyMessage ? bankStyle.myMessageBackgroundColor : bankStyle.sharedWithBg
  let pageBg = bankStyle.backgroundImage ? {} : {backgroundColor: bankStyle.backgroundColor}
  let w, h = 70
  if (dimensions.width > dimensions.height)
    w = Math.round((dimensions.width * 70)/(dimensions.height - 100))
  else
    w = Math.round((dimensions.height * 70)/(dimensions.width - 100))
  return StyleSheet.create({
    myMsg: {
      justifyContent: 'flex-end',
      // color: '#ffffff'
    },
    youSharedText: {
      color: '#ffffff',
      fontSize: 18
    },
    noContentStyle: {
      marginBottom: -6,
      borderBottomRightRadius: 10,
      borderBottomLeftRadius: 10
    },
    sentTo: {
      color: '#7AAAC3',
      fontSize: 14,
      alignSelf: 'flex-end'
    },
    sentToView: {
      padding: 5
    },
    row: {
      flexDirection: 'row'
    },
    viewStyle: {
      // width: width,
      alignSelf: isMyMessage || isShared ? 'flex-end' : 'flex-start',
      // marginLeft: isMyMessage || isShared ? 30 : 0,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      // margin: 1,
      // paddingRight: 10,
    },
    headerStyle: {
      ...moreHeader,
      backgroundColor: bg
    },
    sig: {
      width: w,
      height: h
    },
    title: {
      fontSize: 18,
      color: '#aaaaaa'
    },
    pageView: {
      margin: 1,
      ...pageBg
    },
    photoListStyle: {
      flexDirection: 'row',
      alignSelf: isMyMessage || isShared ? 'flex-end' : 'flex-start',
      borderRadius: 10,
      marginBottom: 3,
      marginLeft: isSharedContext || application ? 40 : 0
    }
  })
});
reactMixin(FormMessageRow.prototype, RowMixin);
FormMessageRow = makeStylish(FormMessageRow)
FormMessageRow = makeResponsive(FormMessageRow)

module.exports = FormMessageRow;
