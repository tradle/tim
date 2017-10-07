'use strict';

const debug = require('debug')('tradle:app:RowMixin')
var React = require('react');
var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var Actions = require('../Actions/Actions');
import Icon from 'react-native-vector-icons/Ionicons';
import CustomIcon from '../styles/customicons'
var CameraView = require('./CameraView')
var StyleSheet = require('../StyleSheet')
var chatStyles = require('../styles/chatStyles')
var cnt = 0;
import {
  Text,
  View,
  Alert,
  Navigator,
  // StyleSheet,
  Platform,
  Image
} from 'react-native';

import { coroutine as co } from 'bluebird'
import ENV from '../utils/env'

const SHOW_TIME_INTERVAL = 60000
var CURRENCY_SYMBOL
const DEFAULT_CURRENCY_SYMBOL = '£'
const SENT = 'Sent'


const MY_PRODUCT = 'tradle.MyProduct'
const FORM = 'tradle.Form'
const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const PHOTO = 'tradle.Photo'
const ENUM = 'tradle.Enum'
const IPROOV_SELFIE = 'tradle.IProovSelfie'
const PRODUCT_REQUEST = 'tradle.ProductRequest'

var BORDER_WIDTH = StyleSheet.hairlineWidth

var RowMixin = {
  addDateProp(dateProp, style) {
    var resource = this.props.resource;
    var properties = utils.getModel(resource[constants.TYPE] || resource.id).value.properties;
    if (properties[dateProp]  &&  properties[dateProp].style)
      style = [style, properties[dateProp].style];
    var val = utils.formatDate(new Date(resource[dateProp]));
    return <Text style={style} key={this.getNextKey()}>{val}</Text>;
  },
  getNextKey() {
    return this.props.resource[constants.ROOT_HASH] + '_' + cnt++
  },
  getPropRow(prop, resource, val, isVerification) {
    CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol || this.props.currency : DEFAULT_CURRENCY_SYMBOL

    if (prop.ref) {
      if (prop.ref === constants.TYPES.MONEY) {
        let c = utils.normalizeCurrencySymbol(val.currency)
        val = (c || CURRENCY_SYMBOL) + val.value
        // val = (val.currency || CURRENCY_SYMBOL) + val.value
      }
      else {
        let m = utils.getModel(prop.ref).value
        if (m.subClassOf === ENUM) {
          if (typeof val === 'string')
            val = utils.createAndTranslate(val)
          else
            val = utils.createAndTranslate(val.title)
        }
      }
    }
    let model = utils.getModel(resource[constants.TYPE]).value

    var style = {flexDirection: 'row', justifyContent: 'center'}
    let propTitle = translate(prop, model)
    if (isVerification) {
      if (!this.props.isAggregation)
        style = [style, {borderWidth: BORDER_WIDTH, paddingVertical: 3, borderColor: this.props.bankStyle.verifiedBg, borderTopColor: '#eeeeee'}]
      return (
        <View style={style} key={this.getNextKey()}>
          <View style={styles.column}>
            <Text style={[styles.title, {color: '#333333'}]}>{propTitle}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.title}>{val + (prop.units &&  prop.units.charAt(0) !== '[' ? ' ' + prop.units : '')}</Text>
          </View>
        </View>
      )
    }
    else {
      let isMyProduct = model.subClassOf === MY_PRODUCT
      let isForm = model.subClassOf === FORM
      let isMyMessage = this.isMyMessage()
      if (!this.props.isAggregation  &&  (isMyMessage || isForm) &&  !isMyProduct)
        style = [style, {borderWidth: 0, paddingVertical: 3, borderColor: isMyMessage ? this.props.bankStyle.STRUCTURED_MESSAGE_COLOR : '#ffffff', borderBottomColor: isMyMessage ? this.props.bankStyle.STRUCTURED_MESSAGE_BORDER : '#eeeeee'}]
      let value = val + (prop.units &&  prop.units.charAt(0) !== '[' ? ' ' + prop.units : '')
      let ratio = value.length / propTitle.length
      let flexVal = (propTitle.length > value.length || ratio < 1.2) ? 1 : ratio < 1.5 ? 2 : 3
      return (
        <View style={style} key={this.getNextKey()}>
          <View style={[styles.column, {flex: 1}]}>
            <Text style={[styles.descriptionG]}>{propTitle}</Text>
          </View>
          <View style={[styles.column, {paddingLeft: 3, flex: flexVal}]}>
            <Text style={styles.descriptionB}>{value}</Text>
          </View>
       </View>
      )
    }

  },
  getOwnerPhoto(isMyMessage) {
    let isSharedContext = this.props.to[constants.TYPE] === PRODUCT_APPLICATION && utils.isReadOnlyChat(this.props.context)
    if (/*Platform.OS !== 'android'  &&*/  !isSharedContext)
      return <View/>

    var to = this.props.to;
    let isProductApplication = to[constants.TYPE]  === PRODUCT_APPLICATION
    if (!isProductApplication && (isMyMessage  || !to /* ||  !to.photos*/))
      return <View style={{marginVertical: 0}}/>

    let resource = this.props.resource
    let isVerification  = resource[constants.TYPE] === constants.TYPES.VERIFICATION
    if (!isMyMessage) {
      let photo = isVerification && resource._verifiedBy  &&  resource._verifiedBy.photo
                ? resource._verifiedBy.photo
                : resource.from.photo
      if  (photo) {
        let uri = utils.getImageUri(photo.url)
        photo = <View style={{paddingRight: 3}}>
                  <Image source={{uri: uri}} style={styles.cellRoundImage} />
                </View>
        return photo
      }
      // return isProductApplication
      //      ? <TouchableHighlight underlayColor='transparent' onPress={this.props.switchChat.bind(this)}>
      //          {photo}
      //        </TouchableHighlight>
      //      : photo
    }
    if (to.photos) {
      var uri = utils.getImageUri(to.photos[0].url);
      return <Image source={{uri: uri}} style={styles.msgImage} />
    }
    if (!isMyMessage) {
      var title = resource.from.title.split(' ').map(function(s) {
        return s.charAt(0);
      }).join('');

      return <View style={{paddingRight: 3}}>
               <View style={[{color: '#ffffff', backgroundColor: this.props.bankStyle.linkColor}, styles.cellRoundImage]}>
                 <Text style={styles.cellText}>{title}</Text>
               </View>
             </View>
    }
  },
  getTime(resource) {
    if (!resource.time)
      return
    var previousMessageTime = this.props.previousMessageTime;
    var showTime = !previousMessageTime  ||  this.props.isAggregation;

    if (!showTime)  {
      var prevDate = new Date(previousMessageTime);
      var curDate = new Date(resource.time);
      showTime = resource.time - previousMessageTime > SHOW_TIME_INTERVAL ||
                 prevDate.getDate()  !== curDate.getDate()    ||
                 prevDate.getMonth() !== curDate.getMonth()   ||
                 prevDate.getYear()  !== curDate.getYear()
    }

    if (showTime)
      return utils.formatDate(resource.time);
  },
  isMyMessage(to) {
    if (this.props.isAggregation)
      return
    var r = this.props.resource
    var fromHash = utils.getId(r.from);
    var me = utils.getMe()
    if (fromHash === utils.getId(me))
      return true;

    if (utils.getModel(r[constants.TYPE]).value.subClassOf == MY_PRODUCT) {
      let org = r.from.organization
      if (org  &&  utils.getId(r.from.organization) !== utils.getId(this.props.to))
        return true
    }
    if (me.isEmployee  &&  r.from.organization) {
      let meId = utils.getId(me.organization)
      if (meId === utils.getId(r.from.organization)) {
        if (to  &&  utils.getId(to) === meId)
          return false
        else
          return true
      }

    }
  },
  isShared() {
    let resource = this.props.resource
    // Is resource was originally created in this chat or shared from a different chat
    // if (!resource.organization  ||  (this.props.context  &&  this.props.context._readOnly))
    if (!resource.organization  ||  utils.isReadOnlyChat(this.props.resource))
      return false
    let to = this.props.to
    if (to[constants.TYPE] === constants.TYPES.PROFILE || to[constants.TYPE] === PRODUCT_APPLICATION)
      return false
    if (to[constants.TYPE] === PRODUCT_APPLICATION  &&  utils.isReadOnlyChat(to)) {
      if (utils.getId(resource.from) === utils.getId(utils.getMe()))
        return false
    }
    return utils.getId(resource.organization) !== utils.getId(to)
  },
  getSendStatus() {
    let { resource } = this.props
    let sendStatus = resource._sendStatus
    if (!sendStatus)
      return <View />
    let icon, msg
    if (sendStatus === SENT) {
      icon = <Icon name={'md-done-all'} size={15} color={this.props.bankStyle.messageSentStatus || '#009900'} />
      if (resource._sentTime)
        msg = <Text style={styles.sentStatus}>{utils.formatDate(resource._sentTime)}</Text>
    }
    else
        msg = <Text style={styles.sentStatus}>{sendStatus}</Text>

    let routes = this.props.navigator.getCurrentRoutes()
    var w = utils.dimensions(routes[routes.length - 1].component).width
    let msgWidth = Math.min(Math.floor(w * 0.8), 600)

    var isMyMessage = this.isMyMessage();

    let view = <View style={styles.sendStatus}>
                 {msg}
                 {icon}
               </View>
    if (isMyMessage)
      return view
    return <View style={{width: msgWidth}}>
             {view}
           </View>
  },

  isOnePropForm() {
    const resource = this.props.resource;
    let type = resource[constants.TYPE]
    let isFormRequest = type === FORM_REQUEST
    let isFormError = type === FORM_ERROR
    if (!isFormRequest  &&  !isFormError)
      return
    let ftype = isFormRequest
              ? resource.form
              : utils.getType(resource.prefill)
    const model = utils.getModel(ftype).value
    const props = model.properties
    let eCols = []
    for (let p in props) {
      let prop = props[p]
      if (!prop.readOnly  &&
        !prop.hidden      &&
        !prop.list )
        eCols.push(props[p])
    }

    if (eCols.length === 1) {
      let p = eCols[0]
      if (ftype === IPROOV_SELFIE)
        return p
      if (ftype === PRODUCT_REQUEST)
        return p
      if (p  &&  p.type === 'object'  &&  (p.ref === PHOTO ||  utils.getModel(p.ref).value.subClassOf === ENUM))
        return p
    }
    return
  },
  showCamera(prop) {
    this.props.navigator.push({
      title: 'Take a pic',
      backButtonTitle: 'Back',
      id: 12,
      component: CameraView,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        onTakePic: this.onTakePic.bind(this, prop)
      }
    });
  },

  onTakePic(prop, data) {
    if (!data)
      return
    utils.onTakePic(prop, data, this.props.resource)
    this.props.navigator.pop()
  },
  onSetMediaProperty(propName, item) {
    if (!item)
      return;

    let r = this.props.resource
    let isFormError = r[constants.TYPE] === FORM_ERROR
    Actions.addItem({
      disableFormRequest: r,
      resource: {
        [constants.TYPE]: isFormError ? r.prefill[constants.TYPE] : r.form,
        [propName]: item,
        _context: r._context,
        from: utils.getMe(),
        to: r.from
      }
    })
  },

  showIproovScanner: co(function* () {
    const apiKey = ENV.iProov && Platform.select(ENV.iProov.apiKey)
    if (!apiKey) {
      return Alert.alert('IProov is not set up')
    }

    const IProov = require('../utils/iproov')
    const me = utils.getMe()
    const opts = {
      username: me[constants.ROOT_HASH],
      serviceProvider: apiKey,
      animated: true
    }

    const enroll = !me.iproovEnrolled
    let result
    try {
      if (enroll) {
        result = yield IProov.enroll(opts)
      } else {
        result = yield IProov.verify(opts)
      }
    } catch (err) {
      debug('experienced iProov error', err.code, err.name)
      Alert.alert(translate('iproovErrorTitle'), translate('iproovErrorMessage'))
      return
    }

    const { success, token, reason } = result
    if (!success) {
      debug('iProov failed', reason)
      Alert.alert(translate('iproovFailedTitle'), translate('iproovFailedMessage'))
      return
    }

    debug('iProov succeeded!')
    if (enroll) {
      Actions.updateMe({ iproovEnrolled: true })
    }

    const r = this.props.resource
    r.token = token

    let isFormError = r[constants.TYPE] === FORM_ERROR
    Actions.addItem({
      disableFormRequest: r,
      resource: {
        [constants.TYPE]: isFormError ? r.prefill[constants.TYPE] : r.form,
        token: token,
        enroll: enroll,
        from: r.to,
        to: r.from,
        _context: r._context
      }
    })
  }),
}

var styles = StyleSheet.create({
  title: {
    fontSize: 17,
    color: '#757575'
  },
  descriptionG: {
    fontSize: 17,
    justifyContent: 'center',
    color: '#aaaaaa',
    marginTop: 1
  },
  descriptionB: {
    fontSize: 17,
    color: '#757575'
  },
  msgImage: {
    // backgroundColor: '#dddddd',
    height: 40,
    marginRight: 3,
    marginLeft: 0,
    width: 40,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: BORDER_WIDTH
  },
  cellText: {
    marginTop: 8,
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 18,
    backgroundColor: 'transparent'
  },
  cellRoundImage: {
    paddingVertical: 1,
    borderRadius: 20,
    height: 40,
    width: 40,
    alignSelf: 'center'
  },
  cellImage: {
    marginLeft: 10,
    height: 40,
    width: 40,
    marginRight: 10,
    borderColor: 'transparent',
    borderRadius:10,
    borderWidth: BORDER_WIDTH,
  },
  orgImage: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  column: {
    flex: 1,
    flexDirection: 'column'
  },
  orgView: {
    maxWidth: utils.getMessageWidth() - 150,
    paddingLeft: 3,
    marginRight: 10,
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    fontSize: 18,
    marginTop: 2,
    color: '#757575'
    // paddingRight: 10
  },
  sentStatus: {
    fontSize: 12,
    color: '#757575',
    marginRight: 3
  },
  sendStatus: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginHorizontal: 5,
    marginTop: -2
  },
});

module.exports = RowMixin;

  // formatDocument(params) {
  //   const me = utils.getMe()
  //   let model = params.model
  //   let verification = params.verification
  //   let onPress = params.onPress
  //   let providers = params.providers  // providers the document was shared with

  //   var document = verification.document

  //   let isThirdParty = !document[constants.TYPE]
  //   let type = document[constants.TYPE] || utils.getType(document)
  //   var docModel = utils.getModel(type).value;
  //   var isMyProduct = docModel.subClassOf === MY_PRODUCT
  //   var docModelTitle = docModel.title || utils.makeLabel(docModel.id)
  //   var idx = docModelTitle.indexOf('Verification');
  //   var docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

  //   var msg;
  //   if (document.message  &&  docModel.subClassOf !== FORM)
  //     msg = <View><Text style={chatStyles.description}>{document.message}</Text></View>
  //   // else if (!onPress) {
  //   //   msg = <View><Text style={styles.description}>{translate('seeTheForm')}</Text></View>
  //   //   // var rows = [];
  //   //   // this.formatDocument1(model, document, rows);
  //   //   // msg = <View>{rows}</View>
  //   // }
  //   else
  //     msg = <View/>

  //   // var hasPhotos = document  &&  document.photos  &&  document.photos.length
  //   // var photo = hasPhotos
  //   //           ? <Image source={{uri: utils.getImageUri(document.photos[0].url)}}  style={styles.cellImage} />
  //   //           : <View />;
  //   var headerStyle = {flex: 1, paddingTop: verification.dateVerified ? 0 : 5, marginLeft: 10}
  //   var isShared = this.isShared(verification)

  //                   // {verification.dateVerified
  //                   //   ? <View style={{flexDirection: 'row'}}>
  //                   //       <Text style={{fontSize: 12, color: this.props.bankStyle.VERIFIED_HEADER_COLOR, fontStyle: 'italic'}}>{utils.formatDate(verification.dateVerified)}</Text>
  //                   //     </View>
  //                   //   : <View/>
  //                   // }
  //                         // <Text style={{fontSize: 12, color: 'darkblue', fontStyle: 'italic'}}>{'Date '}</Text>
  //   let addStyle = onPress ? {} : {backgroundColor: this.props.bankStyle.verifiedBg, borderWidth: BORDER_WIDTH, borderColor: this.props.bankStyle.verifiedBg, borderBottomColor: this.props.bankStyle.verifiedHeaderColor}

  //   let hs = /*isShared ? chatStyles.description :*/ [styles.header, {fontSize: 16}]
  //   // let arrow = <Icon color={this.props.bankStyle.VERIFIED_HEADER_COLOR} size={20} name={'ios-arrow-forward'} style={{top: 10, position: 'absolute', right: 30}}/>
  //   let arrow = <Icon color={this.props.bankStyle.verifiedLinkColor} size={20} name={'ios-arrow-forward'} style={{marginRight: 10, marginTop: 3}}/>

  //   let docName
  //   if (!isThirdParty)
  //     docName = <Text style={[hs, {color: '#555555'}]}>{utils.getDisplayName(document)}</Text>

  //   var headerContent = <View style={headerStyle}>
  //                         <Text style={[hs, {fontSize: isThirdParty ? 16 : 12}]}>{translate(model)}</Text>
  //                         {docName}
  //                       </View>



  //   let header = <TouchableHighlight underlayColor='transparent' onPress={this.props.onSelect.bind(this, me.isEmployee ? verification : document, verification)}>
  //                  <View style={[addStyle, {flexDirection: 'row', justifyContent: 'space-between'}]}>
  //                    {headerContent}
  //                    {arrow}
  //                  </View>
  //                </TouchableHighlight>
  //     // header = <TouchableHighlight underlayColor='transparent' onPress={this.props.onSelect.bind(this, this.props.shareWithRequestedParty ? document : verification, verification)}>


  //   var orgRow = <View/>
  //   if (verification  && verification.organization) {
  //     var orgPhoto = verification.organization.photo
  //                  ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={[styles.orgImage, {marginTop: -5}]} />
  //                  : <View />
  //     var shareView = <View style={[chatStyles.shareButton, {backgroundColor: this.props.bankStyle.shareButtonBackgroundColor, opacity: this.props.resource._documentCreated ? 0.3 : 1}]}>
  //                       <CustomIcon name='tradle' style={{color: '#ffffff' }} size={32} />
  //                       <Text style={chatStyles.shareText}>{translate('Share')}</Text>
  //                     </View>
  //     var orgTitle = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION
  //                  ? this.props.to.name
  //                  : (this.props.to.organization ? this.props.to.organization.title : null);
  //     // let o = verification.organization.title.length < 25 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'
  //     let verifiedBy
  //     if (isMyProduct)
  //       verifiedBy = translate('issuedBy', verification.organization.title)
  //     // Not verified Form - still shareable
  //     else if (verification[constants.ROOT_HASH]) {
  //       let orgs
  //       if (providers) {
  //         providers.forEach((p) => {
  //           if (!orgs)
  //             orgs = p.title
  //           else
  //             orgs += ', ' + p.title
  //         })
  //       }
  //       else
  //         orgs = verification.organization.title
  //       verifiedBy = translate('verifiedBy', orgs)
  //     }
  //     else if (utils.isSavedItem(verification.document))
  //       verifiedBy = translate('fromMyData')
  //     else
  //       verifiedBy = translate('sentTo', verification.organization.title)

  //     var orgView = <View style={styles.orgView}>
  //                     <Text style={chatStyles.description}>
  //                       {verifiedBy}
  //                     </Text>
  //                       {verification.dateVerified
  //                         ? <View style={{flexDirection: 'row'}}>
  //                             <Text style={{fontSize: 12, color: '#757575', fontStyle: 'italic'}}>{utils.formatDate(verification.dateVerified)}</Text>
  //                           </View>
  //                         : <View/>
  //                       }
  //                     </View>

  //                        // <Text style={[styles.title, {color: '#2E3B4E'}]}>{verification.organization.title.length < 30 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'}</Text>
  //     if (onPress) {
  //       // if (!this.props.resource._documentCreated)
  //       //      <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
  //       //                     Alert.alert(
  //       //                       'Sharing ' + docTitle + ' ' + verifiedBy,
  //       //                       'with ' + orgTitle,
  //       //                       [
  //       //                         {text: translate('cancel'), onPress: () => console.log('Canceled!')},
  //       //                         {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
  //       //                       ]
  //       //                   )}>
  //       //             {shareView}
  //       //           </TouchableHighlight>

  //     }
  //     else if (this.props.resource._documentCreated) {
  //       orgRow = <View style={chatStyles.shareView}>
  //                  {shareView}
  //                 <TouchableHighlight onPress={this.props.onSelect.bind(this, verification, verification)} underlayColor='transparent'>
  //                   {orgView}
  //                 </TouchableHighlight>
  //               </View>
  //     }
  //     else {
  //       orgRow = <View style={chatStyles.shareView}>
  //                  <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
  //                           Alert.alert(
  //                             'Sharing ' + docTitle + ' ' + verifiedBy,
  //                             'with ' + orgTitle,
  //                             [
  //                               {text: translate('cancel'), onPress: () => console.log('Canceled!')},
  //                               {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
  //                             ]
  //                         )}>
  //                   {shareView}
  //                  </TouchableHighlight>
  //                  <TouchableHighlight onPress={this.props.onSelect.bind(this, verification, verification)} underlayColor='transparent'>
  //                    {orgView}
  //                  </TouchableHighlight>
  //               </View>
  //     }
  //   }
  //   let content = <View style={{flex:1}}>
  //                    <TouchableHighlight onPress={this.props.onSelect.bind(this, verification, verification)} underlayColor='transparent'>
  //                      {msg}
  //                    </TouchableHighlight>
  //                    {orgRow}
  //                  </View>

  //   // var verifiedBy = verification && verification.organization ? verification.organization.title : ''
  //   return  <View style={{flex: 1}} key={this.getNextKey()}>
  //              {header}
  //              {content}
  //            </View>
  // },

  // formatDocument1(model, resource, renderedRow) {
  //   var viewCols = model.gridCols || model.viewCols;
  //   if (!viewCols)
  //     return
  //   var vCols = [];
  //   var self = this;

  //   if (resource[constants.TYPE] != model.id)
  //     return;

  //   var properties = model.properties;
  //   viewCols.forEach(function(v) {
  //     if (properties[v].type === 'array'  ||  properties[v].type === 'date')
  //       return;
  //     var style = styles.title;
  //     if (properties[v].ref) {
  //     // if (properties[v].ref) {
  //       if (resource[v]) {
  //         var val
  //         if (properties[v].type === 'object') {
  //           if (properties[v].ref) {
  //             if (properties[v].ref === constants.TYPES.MONEY) {
  //               val = resource[v] //(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
  //               if (typeof val === 'string')
  //                 val = {value: val, currency: CURRENCY_SYMBOL}
  //               else {
  //                 let c = utils.normalizeCurrencySymbol(val.currency)
  //                 val.currency = c
  //               }
  //             }
  //             else {
  //               var m = utils.getModel(properties[v].ref).value
  //               if (m.subClassOf  &&  m.subClassOf == ENUM)
  //                 val = resource[v].title
  //             }
  //           }
  //         }
  //         if (!val)
  //           val = resource[v].title  ||  resource[v]
  //         vCols.push(self.getPropRow(properties[v], resource, val, true))
  //       }
  //       return;
  //     }
  //     var row
  //     if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
  //       row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
  //     else if (!model.autoCreate) {
  //       var val = (properties[v].displayAs)
  //               ? utils.templateIt(properties[v], resource)
  //               : properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];
  //       if (!val)
  //         return
  //       row = self.getPropRow(properties[v], resource, val || resource[v], true)
  //     }
  //     else {
  //       if (!resource[v]  ||  !resource[v].length)
  //         return;
  //       var msgParts = utils.splitMessage(resource[v]);
  //       // Case when the needed form was sent along with the message
  //       if (msgParts.length === 2) {
  //         var msgModel = utils.getModel(msgParts[1]);
  //         if (msgModel) {
  //           let color
  //           if (this.isMyMessage())
  //             color = this.props.bankStyle.myMessageBackgroundColor
  //           else
  //             color = this.props.bankStyle.linkColor
  //           vCols.push(<View key={self.getNextKey()}>
  //                        <Text style={style}>{msgParts[0]}</Text>
  //                        <Text style={[style, {color: color}]}>{msgModel.value.title}</Text>
  //                      </View>);
  //           return;
  //         }
  //       }
  //       row = self.getPropRow(properties[v], resource, resource[v], /*style,*/ true)
  //     }
  //     vCols.push(row);
  //   });

  //   if (vCols  &&  vCols.length) {
  //     vCols.forEach(function(v) {
  //       renderedRow.push(v);
  //     });
  //   }
  // },
  // onUpdateRow(params) {
  //   let {action, resource, sendStatus} = params
  //   if (action === 'updateItem'  &&  utils.getId(resource) === utils.getId(this.props.resource)) {
  //     this.setState({
  //       resource: resource,
  //       sendStatus: sendStatus
  //     })
  //   }
  // }


  // anyOtherRow(prop, backlink, styles) {
  //   var row;
  //   var resource = this.props.resource;
  //   var propValue = resource[prop.name];
  //   if (propValue  &&  (typeof propValue != 'string'))
  //     row = <Text style={style} numberOfLines={1}>{propValue}</Text>;
  //   else if (!backlink  &&  propValue  && (propValue.indexOf('http://') == 0  ||  propValue.indexOf('https://') == 0))
  //     row = <Text style={style} onPress={this.onPress.bind(this)} numberOfLines={1}>{propValue}</Text>;
  //   else {
  //     var val = prop.displayAs ? utils.templateIt(prop, resource) : propValue;
  //     let msgParts = utils.splitMessage(val);
  //     if (msgParts.length <= 2)
  //       val = msgParts[0];
  //     else {
  //       val = '';
  //       for (let i=0; i<msgParts.length - 1; i++)
  //         val += msgParts[i];
  //     }
  //     row = <Text style={style}>{val}</Text>;
  //   }
  //   return row;
  // }
