'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var ProductChooser = require('./ProductChooser');
var PhotoList = require('./PhotoList');
var Icon = require('react-native-vector-icons/Ionicons');
var groupByEveryN = require('groupByEveryN');
var constants = require('@tradle/constants');
import LinearGradient from 'react-native-linear-gradient'
var RowMixin = require('./RowMixin');
var Accordion = require('react-native-accordion')
var extend = require('extend')
var equal = require('deep-equal')
var formDefaults = require('@tradle/models').formDefaults;
var TradleW = require('../img/TradleW.png')
var Actions = require('../Actions/Actions');

var reactMixin = require('react-mixin');

const VERIFICATION_BG = '#FBFFE5' //'#F6FFF0';
const MY_PRODUCT = 'tradle.MyProduct'
const FORM_ERROR = 'tradle.FormError'
const FORM = 'tradle.Form'
const FORM_REQUEST = 'tradle.FormRequest'
const ENUM = 'tradle.Enum'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'

var CURRENCY_SYMBOL
var LINK_COLOR
var STRUCTURED_MESSAGE_COLOR

const DEFAULT_CURRENCY_SYMBOL = '£'
const DEFAULT_LINK_COLOR = '#2892C6'

import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  Alert,
  Modal,
  Navigator,
  Dimensions,
  View,
  processColor
} from 'react-native'

import React, { Component } from 'react'

var DeviceWidth = Dimensions.get('window').width

class MessageRow extends Component {
  constructor(props) {
    super(props);
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var me = utils.getMe();
    LINK_COLOR = this.props.bankStyle.LINK_COLOR
    STRUCTURED_MESSAGE_COLOR = this.props.bankStyle.STRUCTURED_MESSAGE_COLOR
    CURRENCY_SYMBOL = props.currency ? props.currency.symbol || props.currency : DEFAULT_CURRENCY_SYMBOL
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !equal(this.props.resource, nextProps.resource) ||
           !equal(this.props.to, nextProps.to)             ||
           this.props.sendStatus !== nextProps.sendStatus
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    // if (model.id === constants.TYPES.VERIFICATION)
    //   return this.renderVerification()
    // if (model.subClassOf === MY_PRODUCT)
    //   return this.renderMyProduct()

    var me = utils.getMe();

    var isMyMessage = this.isMyMessage();
    // var isVerifier = utils.isVerifier(resource)
    var to = this.props.to;
    var ownerPhoto = this.getOwnerPhoto(isMyMessage)
    let hasOwnerPhoto = !isMyMessage &&  to  &&  to.photos;

    var renderedRow = [];
    var ret = this.formatRow(isMyMessage, renderedRow);
    let onPressCall = ret ? ret.onPressCall : null
    let isNewProduct = ret ? ret.isNewProduct : null
    let isConfirmation = ret ? ret.isConfirmation : null

    var isFormError = resource[constants.TYPE] === FORM_ERROR
    // if (isFormError)
    //   onPressCall = this.showEditResource.bind(this)
    if (isNewProduct) {
      if (to  &&  to.photos) {
        var uri = utils.getImageUri(to.photos[0].url);
        ownerPhoto = <Image source={{uri: uri}} style={styles.msgImage} />
        hasOwnerPhoto = true;
        isMyMessage = false
      }
    }
    var photoUrls = [];
    var photoListStyle = {height: 3};
    var addStyle, inRow;
    var noMessage = !resource.message  ||  !resource.message.length;
    var isSimpleMessage = resource[constants.TYPE] === constants.TYPES.SIMPLE_MESSAGE
    var isForgetting = model.id === constants.TYPES.FORGET_ME || model.id === constants.TYPES.FORGOT_YOU
    var isAdditionalInfo = !isSimpleMessage  &&  resource[constants.TYPE] === constants.TYPES.ADDITIONAL_INFO;
    if (!renderedRow.length) {
      var vCols = noMessage ? null : utils.getDisplayName(resource, model.properties);
      if (vCols)
        renderedRow = <Text style={styles.resourceTitle} numberOfLines={2}>{vCols}</Text>;
    }
    else {
      var fromHash = resource.from.id;
      if (isMyMessage) {
        if (!noMessage)
          addStyle = styles.myCell
      }
      else if (isForgetting)
        addStyle = styles.forgetCell
      else {
        if (isConfirmation)
          addStyle = [styles.verificationBody, {borderColor: '#cccccc', backgroundColor: this.props.bankStyle.CONFIRMATION_BG}, styles.myConfCell]
        else {
          if (isSimpleMessage && resource.message.length < 30)
            addStyle = [styles.verificationBody, {borderColor: isFormError ? this.props.bankStyle.REQUEST_FULFILLED : '#efefef', backgroundColor: '#ffffff'}];
          else
            addStyle = [styles.verificationBody, {flex: 1, borderColor: isFormError ? this.props.bankStyle.REQUEST_FULFILLED : '#efefef', backgroundColor: '#ffffff'}];

        }
      }
      // if (model.style)
      //   addStyle = [addStyle, styles.verificationBody, {backgroundColor: STRUCTURED_MESSAGE_COLOR, borderColor: '#deeeb4'}]; //model.style];
      // else if (isAdditionalInfo)
      //   addStyle = [addStyle, styles.verificationBody, {backgroundColor: '#FCF1ED', borderColor: '#FAE9E3'}]; //model.style];
      // else {
      if (isFormError)
        addStyle = [addStyle, styles.verificationBody, {backgroundColor: this.props.bankStyle.FORM_ERROR_BG, borderColor: resource.documentCreated ? this.props.bankStyle.REQUEST_FULFILLED : this.props.bankStyle.FORM_ERROR_BORDER}]; //model.style];
      if (isMyMessage  &&  !isSimpleMessage && !isFormError)
        addStyle = [addStyle, styles.verificationBody, {backgroundColor: STRUCTURED_MESSAGE_COLOR, borderColor: '#C1E3E8'}]; //model.style];
      // }
    }
    var properties = model.properties;
    var verPhoto;
    if (properties.photos) {
      if (resource.photos) {
        var len = resource.photos.length;
        inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
        var style;
        if (inRow === 1)
          style = styles.bigImage;
        else if (inRow === 2)
          style = styles.mediumImage;
        else
          style = styles.image;
        resource.photos.forEach((p) => {
          photoUrls.push({url: utils.getImageUri(p.url)});
        })

        photoListStyle = {
          flexDirection: 'row',
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
          marginLeft: isMyMessage ? 30 : 45, //(hasOwnerPhoto ? 45 : 10),
          borderRadius: 10,
          marginBottom: 3,
        }
      }
      else
        verPhoto = <View style={{height: 0, width:0}} />
    }
    var rowStyle = [styles.row, {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}];
    var val = this.getTime(resource);
    var date = val
             ? <Text style={styles.date} numberOfLines={1}>{val}</Text>
             : <View />;

    var showMessageBody;
    if (noMessage) {
      if (hasOwnerPhoto)
        showMessageBody = true;
      else if (!model.properties['message'])
        showMessageBody = true;
    }
    else
      showMessageBody = true;
    var messageBody;
    var w = Dimensions.get('window').width
    var msgWidth = isMyMessage || !hasOwnerPhoto ? w - 70 : w - 50;
    var sendStatus = <View />
    // HACK that solves the case when the message is short and we don't want it to be displayed
    // in a bigger than needed bubble
    let longMessage = isSimpleMessage  &&  resource.message ? (msgWidth / 11) < resource.message.length : false
    if (showMessageBody) {
      var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? (isNewProduct ? 'center' : 'flex-end') : 'flex-start'};
      if (resource.message) {
        if (resource.message.charAt(0) === '['  ||  longMessage)
          viewStyle.width = msgWidth; //isMyMessage || !hasOwnerPhoto ? w - 70 : w - 50;
      }
      if (!isSimpleMessage)
        viewStyle.width = msgWidth


      if (this.props.sendStatus  &&  this.props.sendStatus !== null) {
        switch (this.props.sendStatus) {
        case 'Sent':
          sendStatus = <View style={styles.sendStatus}>
                         <Text style={{fontSize: 14, color: '#009900', marginRight: 3}}>{this.props.sendStatus}</Text>
                         <Icon name={'ios-checkmark-outline'} size={15} color='#009900' />
                       </View>
          break
        default:
          sendStatus = <Text style={{alignSelf: 'flex-end', fontSize: 14, color: '#757575', marginHorizontal: 5, paddingBottom: 20}}>{this.props.sendStatus}</Text>
          break
        }
      }
      var sealedStatus = (resource.txId)
                       ? <View style={styles.sealedStatus}>
                           <Icon name={'ios-ribbon'} size={30} color='#316A99' style={{opacity: 0.5}} />
                         </View>
                       : <View />

      let cellStyle
      if (addStyle) {
        if (/*hasOwnerPhoto  ||  */!isSimpleMessage  ||  longMessage)
          cellStyle = [styles.textContainer, addStyle]
        else
          cellStyle = addStyle
      }
      else
        cellStyle = styles.textContainer
      messageBody =
        <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
          <View style={[rowStyle, viewStyle]}>
            {ownerPhoto}
            <View style={cellStyle}>
              <View style={{flex: 1}}>
              {this.isShared()
                ? <View style={[styles.verifiedHeader, {backgroundColor: this.props.bankStyle.SHARED_WITH_BG}]}>
                    <Text style={{color: '#ffffff', fontSize: 18}}>{translate('youShared', resource.to.organization.title)}</Text>
                  </View>
                : <View />
              }

                {renderedRow}
             </View>
             {sealedStatus}
            </View>
          </View>
        </TouchableHighlight>
    }
    else
      messageBody = <View style={{height: 5}}/>

    var len = photoUrls.length;
    var inRow = len === 1 ? 1 : (len == 2 || len == 4) ? 2 : 3;
    var photoStyle = {};
    // var height;

    if (inRow > 0) {
      if (inRow === 1) {
        var ww = Math.max(240, msgWidth / 2)
        var hh = ww * 280 / 240
        photoStyle = [styles.bigImage, {
          width:  ww,
          height: hh
        }]
      }
      else if (inRow === 2)
        photoStyle = styles.mediumImage;
      else
        photoStyle = styles.image;
    }

    var viewStyle = { margin:1, backgroundColor: '#f7f7f7' }
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    var isLicense = model.id.indexOf('License') !== -1  ||  model.id.indexOf('Passport') !== -1;
    var photoStyle = (isLicense  &&  len === 1) ? styles.bigImageH : photoStyle;
    var shareables = resource.documentCreated || model.id !== FORM_REQUEST
                   ? <View />
                   : this.showShareableResources(rowStyle, viewStyle, addStyle);
      // <View style={viewStyle} ref={resource[constants.ROOT_HASH]}>

    return (
      <View style={[viewStyle, {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}]}>
        {date}
        {messageBody}
        <View style={photoListStyle}>
          <PhotoList photos={photoUrls} resource={this.props.resource} style={[photoStyle, {marginTop: -5}]} navigator={this.props.navigator} numberInRow={inRow} />
        </View>
        {sendStatus}
        {shareables}
      </View>
    )
  }
  isShared() {
    var resource = this.props.resource
    var to = this.props.to
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    if (model.subClassOf !== constants.TYPES.FORM  ||  !resource.to.organization)
      return false
    return utils.getId(resource.to.organization) !== utils.getId(to)
  }

  editVerificationRequest() {
    var resource = this.props.resource.document;
    var rmodel = utils.getModel(resource[constants.TYPE]).value;
    var title = utils.getDisplayName(resource, rmodel.properties);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      // titleTextColor: '#999999',
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('done'),
      passProps: {
        model: rmodel,
        resource: resource,
        additionalInfo: this.props.resource,
        editCols: ['photos']
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
    let type = r[constants.TYPE] || utils.getId(r).split('_')[0]
    let model = utils.getModel(type).value
    this.props.navigator.push({
      id: 4,
      title: translate(model),
      rightButtonTitle: translate('done'),
      backButtonTitle: translate('back'),
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
  showShareableResources(rowStyle, viewStyle, addStyle) {
    if (!this.props.shareableResources) // || !this.props.resource.message)
      return <View/>;

    var resource = this.props.resource;
    // var msgParts = utils.splitMessage(resource.message);
    // // Case when the needed form was sent along with the message
    // if (msgParts.length != 2)
    //   return <View/>

    // var msgModel = utils.getModel(msgParts[1]);
    let formModel = utils.getModel(resource.form).value
    let isMultientryForm = isMultientry(resource)
    let entries = (isMultientryForm && this.props.productToForms[resource.product])
                ? this.props.productToForms[resource.product][resource.form]
                : null
    // if (!formModel)
    //   return <View/>;
    // formModel = formModel.value;
    var vtt = [];
    var cnt = 0;
    var self = this;
    var chatOrg = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  utils.getId(this.props.to)
    for (var t in  this.props.shareableResources) {
      if (t === formModel.id) {
        var ver = this.props.shareableResources[t];
        var r = ver[0]
        var totalShareables = ver.length
        ver.forEach(function(r) {
          if (entries  &&  (entries.indexOf(utils.getId(r.document)) !== -1  ||  entries.indexOf(r.document[constants.NONCE]) !== -1))
            return
          // if (chatOrg  &&  utils.getId(r.organization) === chatOrg) {
          //   totalShareables--
          //   return
          // }
          // if (!cnt) {x
            var vModel = utils.getModel(r[constants.TYPE]);
            var doc = self.formatDocument(formModel, r, null, totalShareables > 1);
            if (cnt) {
              doc = <View key={self.getNextKey()}>
                      <View style={{height: 1, backgroundColor: '#dddddd'}} />
                      {doc}
                    </View>
            }
          // }
          vtt.push(doc);
          cnt++;
        })
      }
    }
    if (!vtt.length)
      return <View />;

    var modelTitle = translate(formModel)
    var idx = modelTitle.indexOf('Verification');
    var docType;
    if (idx === -1)
      docType = modelTitle;
    else
      docType = modelTitle.substring(0, idx) + (modelTitle.length === idx + 12 ? '' : modelTitle.substring(idx + 12))

    let org = this.props.to.organization ? (this.props.to.organization.title + '.') : this.props.to.name;
    let msg = (vtt.length === 1)
            ? (formModel.subClassOf === MY_PRODUCT
                ? translate('shareMyProduct', translate(formModel), org)
                : translate('shareOne', utils.getMe().firstName, docType, org)
              )
            : translate('shareOneOfMany', utils.getMe().firstName, docType, org)


    return (
      <View style={[rowStyle, viewStyle, {width: DeviceWidth - 50}]} key={this.getNextKey()}>
        <View style={{width: 30}}/>
        <View style={[addStyle ? [styles.textContainer, addStyle] : styles.textContainer]}>
          <View style={{flex: 1}}>
            <View style={styles.assistentBox}>
              <Text style={styles.assistentText}>{msg}</Text>
            </View>
            {vtt}
         </View>
        </View>
      </View>
     );
  }
  formatDocument(model, verification, onPress, isAccordion) {
    var resource = verification.document;

    var docModel = utils.getModel(resource[constants.TYPE]).value;
    var isMyProduct = docModel.subClassOf === MY_PRODUCT
    var docModelTitle = docModel.title;
    var idx = docModelTitle.indexOf('Verification');
    var docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    var msg;
    if (resource.message  &&  docModel.subClassOf !== FORM)
      msg = <View><Text style={styles.description}>{resource.message}</Text></View>
    else {
      var rows = [];
      this.formatDocument1(model, resource, rows);
      msg = <View>{rows}</View>
    }


    var hasPhotos = resource  &&  resource.photos  &&  resource.photos.length
    var photo = hasPhotos
              ? <Image source={{uri: utils.getImageUri(resource.photos[0].url)}}  style={styles.cellImage} />
              : <View />;
    var headerStyle = {paddingTop: 5, alignSelf: 'center'}
    var header =  <View style={headerStyle}>
                    <Text style={[styles.resourceTitle, {fontSize: 20, color: '#B6C2A7'}]}>{translate(model)}</Text>
                  </View>
    header = hasPhotos
            ?  <View style={[styles.rowContainer, styles.verification]}>
                 {photo}
                 {header}
               </View>
            :  <View style={[{alignSelf: 'stretch'}, styles.verification]}>
                 {header}
               </View>


    var orgRow = <View/>
    if (verification  && verification.organization) {
      var orgPhoto = verification.organization.photo
                   ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={[styles.orgImage, {marginTop: -5}]} />
                   : <View />
      var shareView = <View style={{flexDirection: 'row', marginLeft: 0, justifyContent: 'space-between', padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#215A89', backgroundColor: '#4982B1', opacity: this.props.resource.documentCreated ? 0.3 : 1}}>
                        <Image source={TradleW} style={{width: 35, height: 35}}/>
                        <Text style={{color: '#fefefe', fontSize: 20, paddingHorizontal: 3, marginTop: 6}}>{translate('Share')}</Text>
                      </View>
      var orgTitle = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION
                   ? this.props.to.name
                   : (this.props.to.organization ? this.props.to.organization.title : null);
      // let o = verification.organization.title.length < 25 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'
      let verifiedBy
      if (isMyProduct)
        verifiedBy = translate('issuedBy', verification.organization.title)
      // Not verified Form - still shareable
      else if (verification[constants.ROOT_HASH])
        verifiedBy = translate('verifiedBy', verification.organization.title)
      else
        verifiedBy = translate('sentTo', verification.organization.title)

      if (verifiedBy.length > 25)
        verifiedBy = verifiedBy.substring(0, 25) + '..'
      var orgView =   <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15}}>
                         <Text style={[styles.verySmallLetters, {fontSize: 14}]}>{verifiedBy}</Text>
                      </View>

                         // <Text style={[styles.verySmallLetters, {color: '#2E3B4E'}]}>{verification.organization.title.length < 30 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'}</Text>
      if (onPress) {
        if (!this.props.resource.documentCreated)
            <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
                      Alert.alert(
                        'Sharing ' + docTitle + ' ' + verifiedBy,
                        'with ' + orgTitle,
                        [
                          {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
                          {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                        ]
                    )}>
              {shareView}
            </TouchableHighlight>

      }
      else if (this.props.resource.documentCreated) {
          orgRow = <View style={{flexDirection: 'row', marginTop: 5, paddingBottom: 5, justifyContent:'space-between'}}>
                     {shareView}
                    <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, verification)} underlayColor='transparent'>
                      {orgView}
                    </TouchableHighlight>
                  </View>
      }
      else {
        orgRow = <View style={{flexDirection: 'row', marginTop: 5, paddingBottom: 5, justifyContent:'space-between'}}>
          <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
                    Alert.alert(
                      'Sharing ' + docTitle + ' ' + verifiedBy,
                      'with ' + orgTitle,
                      [
                        {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
                        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                      ]
                  )}>
            {shareView}
          </TouchableHighlight>
          <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, verification)} underlayColor='transparent'>
            {orgView}
          </TouchableHighlight>
        </View>
      }
    }
    let content = <View style={{flex:1}}>
                     <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, verification)} underlayColor='transparent'>
                       {msg}
                     </TouchableHighlight>
                     {orgRow}
                   </View>

    var verifiedBy = verification && verification.organization ? verification.organization.title : ''
    return isAccordion
        ? ( <View style ={{marginTop: 5}} key={this.getNextKey()}>
             <Accordion
               header={header}
               style={{padding: 5}}
               content={content}
               underlayColor='transparent'
               easing='easeOutCirc' />
            </View>
          )
        : ( <View style={{flex: 1, paddingVertical: 5}} key={this.getNextKey()}>
               {header}
               {content}
             </View>
           );
  }

  formatDocument1(model, resource, renderedRow) {
    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var vCols = [];
    var self = this;

    if (resource[constants.TYPE] != model.id)
      return;

    var properties = model.properties;
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      var style = styles.verySmallLetters;
      if (properties[v].ref) {
      // if (properties[v].ref) {
        if (resource[v]) {
          var val
          if (properties[v].type === 'object') {
            if (properties[v].ref) {
              if (properties[v].ref === constants.TYPES.MONEY) {
                val = resource[v] //(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
                if (typeof val === 'string')
                  val = {value: val, currency: CURRENCY_SYMBOL}
                else {
                  let c = utils.normalizeCurrencySymbol(val.currency)
                  val.currency = c
                }
              }
              else {
                var m = utils.getModel(properties[v].ref).value
                if (m.subClassOf  &&  m.subClassOf == ENUM)
                  val = resource[v].title
              }
            }
          }
          if (!val)
            val = resource[v].title  ||  resource[v]
          vCols.push(self.getPropRow(properties[v], resource, val, true))
        }
        return;
      }
      var row
      if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
        row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];
        if (!val)
          return
        row = self.getPropRow(properties[v], resource, val || resource[v], true)
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            vCols.push(<View key={self.getNextKey()}>
                         <Text style={style}>{msgParts[0]}</Text>
                         <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : LINK_COLOR}]}>{msgModel.value.title}</Text>
                       </View>);
            return;
          }
        }
        row = self.getPropRow(properties[v], resource, resource[v], true)
      }
      vCols.push(row);
    });

    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      });
    }
  }

  onPress(event) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: this.props.resource.message}
    });
  }
  createNewResource(model, isMyMessage) {
    var resource = {
      'from': this.props.resource.to,
      'to': this.props.resource.from,
    }
    if (this.props.resource[constants.TYPE] !== FORM_REQUEST)
      resource.message = this.props.resource.message;
    resource[constants.TYPE] = model.id;

    // Prefill for testing and demoing
    var isPrefilled = __DEV__ && model.id in formDefaults
    if (isPrefilled)
      extend(true, resource, formDefaults[model.id])

    this.props.navigator.push({
      id: 4,
      title: translate(model),
      rightButtonTitle: isMyMessage ? null : translate('done'),
      backButtonTitle: translate('back'),
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

  formatRow(isMyMessage, renderedRow) {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    var isProductApplication = model.id === PRODUCT_APPLICATION
    if (isProductApplication) {
      let msgModel = utils.getModel(resource.product).value
      let color = {color: LINK_COLOR, fontWeight: '400', fontSize: 18}


      let msg = !this.props.navigator.isConnected  &&  this.props.isLast
              ? <View key={this.getNextKey()}>
                  <Text style={[styles.resourceTitle, {color: '#FF6D0D'}]}>{translate('noConnectionForNewProduct', utils.getMe().firstName, translate(msgModel))}</Text>
                </View>
              : <View key={this.getNextKey()}>
                  <Text style={[styles.resourceTitle, {color: '#757575'}]}>{translate('newProductMsg', utils.getMe().firstName, translate(msgModel))}</Text>
                </View>
      renderedRow.push(msg);
      return {isNewProduct: true}
    }
    var isProductList = model.id === constants.TYPES.PRODUCT_LIST
    if (isProductList) {
      var msgParts = utils.splitMessage(resource.message);
      // Case when the needed form was sent along with the message
      if (resource.welcome) {
        let msg = <View key={this.getNextKey()}>
                <Text style={styles.resourceTitle}>{translate('hello', utils.getMe().firstName)}</Text>
                <View style={styles.rowContainer}>
                  <Text style={[styles.resourceTitle, {color: LINK_COLOR}]}>{translate('listOfProducts')} </Text>
                  <Icon style={[styles.linkIcon, {color: LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
                </View>
              </View>
        renderedRow.push(msg);
        return {onPressCall: this.onChooseProduct.bind(this, true)}
      }
    }
    let isSelfIntroduction = model.id === constants.TYPES.SELF_INTRODUCTION
    let isCustomerWaiting = model.id === constants.TYPES.CUSTOMER_WAITING
    if (isSelfIntroduction || isCustomerWaiting) {
      let msg = <View key={this.getNextKey()}>
                  <View style={styles.rowContainer}>
                    <Text style={[styles.resourceTitle, {color: isMyMessage ? '#ffffff' : '#757575'}]}>{resource.message}</Text>
                    <Icon style={[styles.linkIcon, {color: LINK_COLOR, paddingLeft: 5}]} size={20} name={'ios-person'} />
                  </View>
                </View>
      renderedRow.push(msg);
      return null
      // return {onPressCall: this.addContact.bind(this)}
    }
    var isForgetting = model.id === constants.TYPES.FORGET_ME || model.id === constants.TYPES.FORGOT_YOU
    if (isForgetting) {
      let msg = <View key={this.getNextKey()}>
                  <Text style={[styles.resourceTitle, {fontSize: 18, color: '#ffffff'}]} key={this.getNextKey()}>{resource.message}</Text>
                </View>
      renderedRow.push(msg)
      return null
    }
    if (model.id === FORM_REQUEST) {
      if (resource.product  &&  utils.getModel(resource.product).value.subClassOf !== MY_PRODUCT)
        return {onPressCall: this.formRequest(resource, renderedRow)}
      else
        return
    }

    var isFormError = model.id === FORM_ERROR
    // if (isFormError) {
    //   renderedRow.push(
    //     <View key={self.getNextKey()}>
    //       <Text style={styles.resourceTitle}>{resource.message} </Text>
    //       <View style={styles.rowContainer}>
    //         <Text style={[styles.resourceTitle, {color: resource.documentCreated ?  '#757575' : LINK_COLOR}]}>{translate(utils.getModel(resource.prefill[constants.TYPE]).value)}</Text>
    //         <Icon style={resource.documentCreated  ? styles.linkIconGreyed : [self.linkIcon, {color: LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
    //       </View>
    //     </View>)
    //   return null
    // }

    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var first = true;
    var self = this;

    var properties = model.properties;
    var noMessage = !resource.message  ||  !resource.message.length;
    var onPressCall;

    let isMyProduct = model.subClassOf === MY_PRODUCT
    var isSimpleMessage = model.id === constants.TYPES.SIMPLE_MESSAGE
    var cnt = 0;
    var isConfirmation
    var self = this

    var vCols = [];
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;

      if (properties[v].ref) {
        if (resource[v]) {
          vCols.push(self.getPropRow(properties[v], resource, resource[v].title || resource[v]))
          first = false;
        }
        return;
      }
      var style = isSimpleMessage || isFormError ? styles.resourceTitle : styles.description; //resourceTitle; //(first) ? styles.resourceTitle : styles.description;
      if (isMyMessage)
        style = [style, {justifyContent: 'flex-end', color: isMyProduct ? '#2892C6' : '#ffffff'}];

      if (resource[v]                      &&
          properties[v].type === 'string'  &&
          (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0)) {
        onPressCall = self.onPress.bind(self);
        vCols.push(<Text style={style} numberOfLines={first ? 2 : 1} key={self.getNextKey()}>{resource[v]}</Text>);
      }
      else if (isFormError) {
        let rtype = (resource.prefill[constants.TYPE]) ? resource.prefill[constants.TYPE] : utils.getId(resource.prefill).split('_')[0]
        let iconName = resource.documentCreated ? 'ios-done-all' : 'ios-information-circle-outline'
        let iconSize = 30
        vCols.push(
          <View key={self.getNextKey()}>
            <Text style={[style, {color: '#757575'}]}>{isMyMessage ? translate('errorNotification') : resource[v]} </Text>
            <Text style={[style, {color: resource.documentCreated ?  '#757575' : self.props.bankStyle.FORM_ERROR_COLOR}]}>{translate(utils.getModel(rtype).value)}</Text>
            <Icon name={iconName} size={iconSize} color={resource.documentCreated ? self.props.bankStyle.REQUEST_FULFILLED : self.props.bankStyle.FORM_ERROR_COLOR} style={styles.errorBadge} />
          </View>
        )
      }
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];

        if (!val)
          return
        if (model.properties.verifications  &&  !isMyMessage)
          onPressCall = self.verify.bind(self);
        if (!isMyMessage)
          style = [style, {paddingBottom: 10, color: '#2892C6'}];
        vCols.push(self.getPropRow(properties[v], resource, val))
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          if (resource.welcome) {
            msg = <View key={self.getNextKey()}>
                    <Text style={style}>{msgParts[0]}</Text>
                    <View style={styles.rowContainer}>
                      <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : isMyMessage ? self.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]}>{msgParts[1]} </Text>
                      <Icon style={[styles.linkIcon, {color: LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
                    </View>
                  </View>
            vCols.push(msg);
            onPressCall = self.onChooseProduct.bind(self, true)
            return;
          }
          let s = msgParts[1].split('_')
          var msgModel = utils.getModel(s[0]);
          let color, link
          if (msgModel) {
            if (self.props.shareableResources  &&  !isSimpleMessage)
              style = /*isSimpleMessage ? styles.resourceTitle : */styles.description;
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
                onPressCall = self.editForm.bind(self, msgParts[1], msgParts[0])
              else if (!isMyMessage  &&  !resource.documentCreated)
                onPressCall = self.createNewResource.bind(self, msgModel, isMyMessage);

              color = isMyMessage  &&  !isFormError
                    ? {color: self.props.bankStyle.MY_MESSAGE_LINK_COLOR} //{color: STRUCTURED_MESSAGE_COLOR}
                    : {color: '#2892C6'}
              if (isMyMessage)
                link = <Text style={[style, color]}>{translate(msgModel)}</Text>
              else
                link = <View style={styles.rowContainer}>
                           <Text style={[style, {color: resource.documentCreated ?  '#757575' : LINK_COLOR}]}>{translate(msgModel)}</Text>
                           <Icon style={resource.documentCreated  ? styles.linkIconGreyed : [self.linkIcon, {color: isMyMessage ? self.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
                       </View>
            }
            let strName = isMyProduct
                        ? translate('shareProduct', translate(msgModel))
                        : utils.getStringName(msgParts[0])
            let str = strName ? utils.translate(strName) : msgParts[0]
            let msg = <View key={self.getNextKey()}>
                       <Text style={style}>{str}</Text>
                       {link}
                     </View>
            vCols.push(msg);
            return;
          }
        }
        else
          isConfirmation = resource[v].indexOf('Congratulations!') !== -1

        if (isConfirmation) {
          style = [style, {color: self.props.bankStyle.CONFIRMATION_COLOR, fontSize: 18}]
          vCols.push(
            <View key={self.getNextKey()}>
              <Text style={[style]}>{resource[v]}</Text>
              <Icon style={[{color: self.props.bankStyle.CONFIRMATION_COLOR, alignSelf: 'flex-end', width: 50, height: 50, marginTop: -45, opacity: 0.2}]} size={50} name={'ios-flower'} />
              <Icon style={{color: self.props.bankStyle.CONFIRMATION_COLOR, alignSelf: 'flex-end', marginTop: -10}} size={30} name={'ios-done-all'} />
            </View>
          );

        }
        else
          vCols.push(<Text style={style} key={self.getNextKey()}>{resource[v]}</Text>);
      }
      first = false;

    });
    if (!isSimpleMessage  &&  !isFormError  &&  !isMyProduct)  {
      let title = translate(model)
      if (title.length > 30)
        title = title.substring(0, 27) + '...'

      vCols.push(<Text style={[styles.resourceTitle, styles.formType, {color: isMyMessage ? '#EBFCFF' : this.props.bankStyle.STRUCTURED_MESSAGE_BORDER}]} key={this.getNextKey()}>{title}</Text>);
    }
    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      })
    }
    if (onPressCall)
      return {onPressCall: onPressCall}
    if (isFormError) {
      if (utils.getId(resource.from) === utils.getId(utils.getMe()))
        return null
      else
        return {onPressCall: this.showEditResource.bind(this)}
    }
    if (isSimpleMessage)
      return isConfirmation ? {isConfirmation: true} : null
    return {onPressCall: this.props.onSelect.bind(this, resource, null)}
  }

  formRequest(resource, vCols) {
    let form = utils.getModel(resource.form).value
    let multiEntryForms = utils.getModel(resource.product).value.multiEntryForms
    // if (this.props.shareableResources)
    //   style = styles.description;
    let message = resource.message
    let onPressCall
    // if (s.length === 2)
    //   onPressCall = this.editForm.bind(self, msgParts[1], msgParts[0])
    let sameFormRequestForm
    if (!resource.documentCreated) {
      if (multiEntryForms  &&  multiEntryForms.indexOf(form.id) !== -1) {
        let productToForms = this.props.productToForms
        if (productToForms) {
          let product = productToForms[resource.product]
          if (product) {
            let formsArray = product[resource.form]
            if (formsArray)
              sameFormRequestForm = true
          }
          // onPressCall = this.getNextFormAlert.bind(this)
        }
      }
      if (!sameFormRequestForm)
        onPressCall = this.createNewResource.bind(this, form, isMyMessage);
    }
    var isMyMessage = this.isMyMessage();

    let color = isMyMessage
              ? {color: this.props.bankStyle.MY_MESSAGE_LINK_COLOR} //{color: STRUCTURED_MESSAGE_COLOR}
              : {color: '#2892C6'}
    let link = sameFormRequestForm  &&  !resource.documentCreated
             ? <View style={[styles.rowContainer, {paddingVertical: 10, alignSelf: 'center'}]}>
                 <View style={styles.textContainer}>
                 <TouchableHighlight underlayColor='transparent' style={{paddingRight: 15}} onPress={() => {
                   this.createNewResource(form, isMyMessage)
                 }}>
                   <View style={styles.multiEntryButton}>
                     <Text style={styles.multiEntryText}>   {translate('addSameForm')}   </Text>
                   </View>
                 </TouchableHighlight>
                 <TouchableHighlight underlayColor='transparent' onPress={() => {
                    Alert.alert(
                      translate('areYouSureAboutNextForm', translate(form)),
                      null,
                      [
                        {text: translate('Ok'), onPress: () => {
                          Actions.addMessage({
                            from: resource.to,
                            to: resource.from,
                            [constants.TYPE]: NEXT_FORM_REQUEST,
                            after: form.id
                          })
                          var params = {
                            value: {documentCreated: true},
                            resource: resource,
                            meta: utils.getModel(resource[constants.TYPE]).value
                          }
                          Actions.addItem(params)
                         }},
                        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                      ]
                    )
                 }}>
                   <View style={styles.multiEntryButton}>
                     <Text style={styles.multiEntryText}>   {translate('getNextForm')}   </Text>
                   </View>
                </TouchableHighlight>
                </View>
               </View>
              : isMyMessage
                 ? <Text style={[style, color]}>{translate(form)}</Text>
                 : <View style={styles.rowContainer}>
                     <Text style={[styles.resourceTitle, {color: resource.documentCreated ?  '#757575' : LINK_COLOR}]}>{translate(form)}</Text>
                     <Icon style={resource.documentCreated  ? styles.linkIconGreyed : [this.linkIcon, {color: isMyMessage ? this.props.bankStyle.MY_MESSAGE_LINK_COLOR : LINK_COLOR}]} size={20} name={'ios-arrow-forward'} />
                   </View>

    let strName = sameFormRequestForm ? translate('addAnotherFormOrGetNext', translate(form)) : utils.getStringName(message)
    let str = strName ? utils.translate(strName) : message
    let msg = <View key={this.getNextKey()}>
               <Text style={styles.resourceTitle}>{str}</Text>
               {link}
             </View>
    vCols.push(msg);
    return onPressCall
  }

  onChooseProduct(sendForm) {
    if (this.props.isAggregation)
      return
    var modelName = constants.TYPES.MESSAGE
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface)
      return;

    var resource = this.props.to
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate('iNeed'), //I need...',
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: translate('cancel'),
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        products: this.props.resource.list,
        callback: this.props.callback,
        bankStyle: this.props.bankStyle
      },
    });
  }
  editForm(rUri, message) {
    let s = rUri.split('_')
    let resource = {
      [constants.TYPE]: s[0],
      [constants.ROOT_HASH]: s[1]
    }

    let rmodel = utils.getModel(s[0]).value;
    let title = translate(rmodel);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      // titleTextColor: '#999999',
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('done'),
      passProps: {
        model: rmodel,
        resource: resource,
        message: message
      }
    })
  }
}

function isMultientry(resource) {
  if (!resource.product)
    return false
  let form = utils.getModel(resource.form).value
  let product = utils.getModel(resource.product).value
  let multiEntryForms = product.multiEntryForms
  return  multiEntryForms && multiEntryForms.indexOf(form.id) !== -1 ? true : false
}

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  resourceTitle: {
    // flex: 1,
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 2,
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
  myCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
    backgroundColor: '#77ADFC' //#569bff',
  },
  forgetCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
    backgroundColor: 'red',
  },
  myConfCell: {
    paddingVertical: 5,
    paddingHorizontal: 7,
    justifyContent: 'flex-end',
    borderRadius: 10,
  },
  shareIcon: {
    height: 20,
    color: '#7aaac3',
    width: 20,
  },
  bigImage: {
    width: 240,
    height: 280,
    margin: 1,
    borderRadius: 10
  },
  bigImageH: {
    width: 270,
    height: 200,
    margin: 1,
    borderRadius: 10
  },
  mediumImage: {
    width: 120,
    height: 120,
    margin: 1,
    borderRadius: 10
  },
  image: {
    width: 88,
    height: 88,
    margin: 1,
    borderRadius: 10
  },
  verySmallLetters: {
    fontSize: 18,
    // alignSelf: 'flex-end',
    color: '#757575'
    // color: '#b4c3cb'
  },
  orgImage: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  cellImage: {
    // backgroundColor: '#dddddd',
    height: 40,
    width: 40,
    marginRight: 10,
    borderColor: 'transparent',
    borderRadius:10,
    borderWidth: 1,
  },
  verificationIcon: {
    width: 20,
    height: 20,
    color: '#ffffff',
    // marginRight: -10
  },
  linkIcon: {
    width: 20,
    height: 20,
    color: '#2892C6'
  },
  linkIconGreyed: {
    width: 20,
    height: 20,
    color: '#cccccc'
  },
  description: {
    // flexWrap: 'wrap',
    color: '#757575',
    fontSize: 14,
  },
  descriptionB: {
    // flexWrap: 'wrap',
    // color: '#757575',
    fontSize: 18,
  },
  assistentText: {
    color: '#757575',
    fontStyle: 'italic',
    fontSize: 18
  },
  assistentBox: {
    backgroundColor: '#efefef',
    paddingVertical: 5,
    borderRadius: 5,
    paddingHorizontal: 7,
    marginTop: -7,
    marginHorizontal: -7
  },
  formType: {
    color: '#EBFCFF',
    fontSize: 20,
    fontWeight: '600',
    opacity: 0.5,
    alignSelf: 'flex-end',
    marginTop: 10
  },
  verifiedHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginHorizontal: -8,
    marginTop: -6,
    justifyContent: 'center'
  },
  sendStatus: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginHorizontal: 5,
    marginTop: -5
  },
  sealedStatus: {
    // alignSelf: 'flex-end',
    // flexDirection: 'row',
    position: 'absolute',
    bottom: 1,
    left: 10,
  },
  errorBadge: {
    position: 'absolute',
    opacity: 0.5,
    bottom: -5,
    right: 0
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  verification: {
    marginHorizontal: -7,
    marginTop: -10,
    padding: 7,
    backgroundColor: '#EDF2CE'
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
  multiEntryButton:  {
    borderRadius: 10,
    borderColor: '#77ADFC',
    borderWidth: 1,
    padding: 10
  },
  multiEntryText: {
    fontSize: 18
  },
  viewStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    width: DeviceWidth - 50
  }
});
reactMixin(MessageRow.prototype, RowMixin);

module.exports = MessageRow;
  // employeeImage: {
  //   // backgroundColor: '#dddddd',
  //   height: 30,
  //   marginRight: 3,
  //   marginLeft: 0,
  //   width: 30,
  // },

  // msgImage: {
  //   // backgroundColor: '#dddddd',
  //   height: 30,
  //   marginRight: 3,
  //   marginLeft: 0,
  //   width: 30,
  //   borderRadius: 15,
  //   borderColor: '#cccccc',
  //   borderWidth: 1
  // },
  // cellRoundImage: {
  //   paddingVertical: 1,
  //   borderRadius: 20,
  //   height: 40,
  //   width: 40,
  //   alignSelf: 'center'
  // },
  // cellText: {
  //   marginTop: 8,
  //   alignSelf: 'center',
  //   color: '#ffffff',
  //   fontSize: 18,
  //   backgroundColor: 'transparent'
  // },

/*
  renderVerification() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var renderedRow = [];

    var time = this.getTime(resource);
    var date = time
             ? <Text style={styles.date} numberOfLines={1}>{time}</Text>
             : <View />;

    var isMyMessage = this.isMyMessage();
    var msgWidth = isMyMessage ? DeviceWidth - 70 : DeviceWidth - 50;

    var msgModel = utils.getModel(resource.document[constants.TYPE]).value;
    var orgName = resource.organization  ? resource.organization.title : ''

    let me = utils.getMe()
    let isThirdPartyVerification
    if (me.isEmployee  &&  !this.props.to.organization) {
      // Check if I am the employee of the organization I opened a chat with or the customer
      isThirdPartyVerification = !utils.isEmployee(resource.organization)
      // let orgId = utils.getId(resource.organization)
      // if (orgId !== utils.getId(me.organization))
      //   isThirdPartyVerification = true
    }
    let bgColor =  isThirdPartyVerification ? '#93BEBA' : this.props.bankStyle.VERIFIED_HEADER_COLOR
    renderedRow = <View>
                    <View style={[styles.verifiedHeader, {backgroundColor: bgColor}]}>
                      <Icon style={styles.verificationIcon} size={20} name={'ios-checkmark'} />
                      <Text style={styles.verificationHeaderText}>{translate('verifiedBy', orgName)}</Text>
                    </View>
                    <View style={{paddingTop: 5}}>
                      {this.formatDocument(msgModel, resource, this.verify.bind(this), isThirdPartyVerification)}
                    </View>
                  </View>

    var viewStyle = {flexDirection: 'row', alignSelf: isMyMessage ? 'flex-end' : 'flex-start', width: msgWidth, backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}
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

  renderMyProduct() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var renderedRow = [];

    var ret = this.formatRow(false, renderedRow);
    let onPressCall = ret ? ret.onPressCall : null

    let addStyle = [addStyle, styles.verificationBody, {backgroundColor: this.props.bankStyle.PRODUCT_BG_COLOR , borderColor: this.props.bankStyle.CONFIRMATION_COLOR}];
    let rowStyle = [styles.row,  {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR}];
    var val = this.getTime(resource);
    var date = val
             ? <Text style={styles.date} numberOfLines={1}>{val}</Text>
             : <View />;

    // var viewStyle = {flexDirection: 'row', alignSelf: 'flex-start', width: DeviceWidth - 50};

    var hdrStyle = {backgroundColor: '#289427'} //this.props.bankStyle.PRODUCT_BG_COLOR ? {backgroundColor: this.props.bankStyle.PRODUCT_BG_COLOR} : {backgroundColor: '#289427'}
    var orgName = resource.from.organization  ? resource.from.organization.title : ''
    renderedRow.splice(0, 0, <View  key={this.getNextKey()} style={[styles.verifiedHeader, hdrStyle, {marginHorizontal: -8, marginTop: -7, marginBottom: 7, paddingBottom: 5}]}>
                       <Text style={{fontSize: 18, alignSelf: 'center', color: '#fff'}}>{translate('issuedBy', orgName)}</Text>
                    </View>
                    );
    let title = translate(model)
    if (title.length > 30)
      title = title.substring(0, 27) + '...'

    renderedRow.push(<Text  key={this.getNextKey()} style={[styles.formType, {color: '#289427'}]}>{title}</Text>);
    rowStyle = addStyle ? [styles.textContainer, addStyle] : styles.textContainer
    let messageBody =
      <TouchableHighlight onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
        <View style={styles.viewStyle}>
          {this.getOwnerPhoto()}
          <View style={rowStyle}>
            <View style={{flex: 1}}>
              {renderedRow}
           </View>
          </View>
        </View>
      </TouchableHighlight>


    var viewStyle = { margin: 1, paddingTop: 7} //, backgroundColor: this.props.bankStyle.BACKGROUND_COLOR }
    return (
      <View style={viewStyle} key={this.getNextKey()}>
        {date}
        {messageBody}
      </View>
    );
  }

  getPropRow(prop, resource, val, isVerification) {
    var style = {flexDirection: 'row'}
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

    let propTitle = translate(prop, model)
    if (isVerification) {
      if (!this.props.isAggregation)
        style = [style, {borderWidth: 1, paddingVertical: 3, borderColor: VERIFICATION_BG, borderTopColor: '#eeeeee'}]
      return (
        <View style={style} key={this.getNextKey()}>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Text style={[styles.verySmallLetters, {color: '#333333'}]}>{propTitle}</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Text style={styles.verySmallLetters}>{val + (prop.units &&  prop.units.charAt(0) !== '[' ? ' ' + prop.units : '')}</Text>
          </View>
        </View>
      )
    }
    else {
      let isMyProduct = model.subClassOf === MY_PRODUCT
      let isForm = model.subClassOf === constants.TYPES.FORM
      let isMyMessage = this.isMyMessage()
      if (!this.props.isAggregation  &&  (isMyMessage || isForm) &&  !isMyProduct)
        style = [style, {borderWidth: 1, paddingVertical: 3, borderColor: isMyMessage ? STRUCTURED_MESSAGE_COLOR : '#ffffff', borderBottomColor: this.props.bankStyle.STRUCTURED_MESSAGE_BORDER}]
      let color = this.isMyMessage() && !isMyProduct ? {color: '#FFFFEE'} : {color: '#757575'}
      return (
        <View style={style} key={this.getNextKey()}>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Text style={[styles.descriptionB, color]}>{propTitle}</Text>
          </View>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Text style={[styles.descriptionB, color]}>{val + (prop.units &&  prop.units.charAt(0) !== '[' ? ' ' + prop.units : '')}</Text>
          </View>
       </View>
      )
    }

  }
  formatDocument(model, verification, onPress, isAccordion) {
    var resource = verification.document;

    var docModel = utils.getModel(resource[constants.TYPE]).value;
    var isMyProduct = docModel.subClassOf === MY_PRODUCT
    var docModelTitle = docModel.title;
    var idx = docModelTitle.indexOf('Verification');
    var docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    var msg;
    if (resource.message  &&  docModel.subClassOf !== FORM)
      msg = <View><Text style={styles.description}>{resource.message}</Text></View>
    else {
      var rows = [];
      this.formatDocument1(model, resource, rows);
      msg = <View>{rows}</View>
    }


    var hasPhotos = resource  &&  resource.photos  &&  resource.photos.length
    var photo = hasPhotos
              ? <Image source={{uri: utils.getImageUri(resource.photos[0].url)}}  style={styles.cellImage} />
              : <View />;
    var headerStyle = {paddingTop: 5, alignSelf: 'center'}
    var header =  <View style={headerStyle}>
                    <Text style={[styles.resourceTitle, {fontSize: 20, color: '#B6C2A7'}]}>{translate(model)}</Text>
                  </View>
    header = hasPhotos
            ?  <View style={[styles.rowContainer, styles.verification]}>
                 {photo}
                 {header}
               </View>
            :  <View style={[{alignSelf: 'stretch'}, styles.verification]}>
                 {header}
               </View>


    var orgRow = <View/>
    if (verification  && verification.organization) {
      var orgPhoto = verification.organization.photo
                   ? <Image source={{uri: utils.getImageUri(verification.organization.photo)}} style={[styles.orgImage, {marginTop: -5}]} />
                   : <View />
      var shareView = <View style={{flexDirection: 'row', marginLeft: 0, justifyContent: 'space-between', padding: 5, borderRadius: 10, borderWidth: 1, borderColor: '#215A89', backgroundColor: '#4982B1', opacity: this.props.resource.documentCreated ? 0.3 : 1}}>
                        <Image source={TradleW} style={{width: 35, height: 35}}/>
                        <Text style={{color: '#fefefe', fontSize: 20, paddingHorizontal: 3, marginTop: 6}}>{translate('Share')}</Text>
                      </View>
      var orgTitle = this.props.to[constants.TYPE] === constants.TYPES.ORGANIZATION
                   ? this.props.to.name
                   : (this.props.to.organization ? this.props.to.organization.title : null);
      // let o = verification.organization.title.length < 25 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'
      let verifiedBy
      if (isMyProduct)
        verifiedBy = translate('issuedBy', verification.organization.title)
      // Not verified Form - still shareable
      else if (verification[constants.ROOT_HASH])
        verifiedBy = translate('verifiedBy', verification.organization.title)
      else
        verifiedBy = translate('sentTo', verification.organization.title)

      if (verifiedBy.length > 25)
        verifiedBy = verifiedBy.substring(0, 25) + '..'
      var orgView =   <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15}}>
                         <Text style={[styles.verySmallLetters, {fontSize: 14}]}>{verifiedBy}</Text>
                      </View>

                         // <Text style={[styles.verySmallLetters, {color: '#2E3B4E'}]}>{verification.organization.title.length < 30 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'}</Text>
      if (onPress) {
        if (!this.props.resource.documentCreated)
            <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
                      Alert.alert(
                        'Sharing ' + docTitle + ' ' + verifiedBy,
                        'with ' + orgTitle,
                        [
                          {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
                          {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                        ]
                    )}>
              {shareView}
            </TouchableHighlight>

      }
      else if (this.props.resource.documentCreated) {
          orgRow = <View style={{flexDirection: 'row', marginTop: 5, paddingBottom: 5, justifyContent:'space-between'}}>
                     {shareView}
                    <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, verification)} underlayColor='transparent'>
                      {orgView}
                    </TouchableHighlight>
                  </View>
      }
      else {
        orgRow = <View style={{flexDirection: 'row', marginTop: 5, paddingBottom: 5, justifyContent:'space-between'}}>
          <TouchableHighlight underlayColor='transparent' onPress={onPress ? onPress : () =>
                    Alert.alert(
                      'Sharing ' + docTitle + ' ' + verifiedBy,
                      'with ' + orgTitle,
                      [
                        {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
                        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                      ]
                  )}>
            {shareView}
          </TouchableHighlight>
          <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, verification)} underlayColor='transparent'>
            {orgView}
          </TouchableHighlight>
        </View>
      }
    }
    let content = <View style={{flex:1}}>
                     <TouchableHighlight onPress={this.props.onSelect.bind(this, resource, verification)} underlayColor='transparent'>
                       {msg}
                     </TouchableHighlight>
                     {orgRow}
                   </View>

    var verifiedBy = verification && verification.organization ? verification.organization.title : ''
    return isAccordion
        ? ( <View style ={{marginTop: 5}} key={this.getNextKey()}>
             <Accordion
               header={header}
               style={{padding: 5}}
               content={content}
               underlayColor='transparent'
               easing='easeOutCirc' />
            </View>
          )
        : ( <View style={{flex: 1, paddingVertical: 5}} key={this.getNextKey()}>
               {header}
               {content}
             </View>
           );
  }

  formatDocument1(model, resource, renderedRow) {
    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var vCols = [];
    var self = this;

    if (resource[constants.TYPE] != model.id)
      return;

    var properties = model.properties;
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      var style = styles.verySmallLetters;
      if (properties[v].ref) {
      // if (properties[v].ref) {
        if (resource[v]) {
          var val
          if (properties[v].type === 'object') {
            if (properties[v].ref) {
              if (properties[v].ref === constants.TYPES.MONEY) {
                val = resource[v] //(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
                if (typeof val === 'string')
                  val = {value: val, currency: CURRENCY_SYMBOL}
                else {
                  let c = utils.normalizeCurrencySymbol(val.currency)
                  val.currency = c
                }
              }
              else {
                var m = utils.getModel(properties[v].ref).value
                if (m.subClassOf  &&  m.subClassOf == ENUM)
                  val = resource[v].title
              }
            }
          }
          if (!val)
            val = resource[v].title  ||  resource[v]
          vCols.push(self.getPropRow(properties[v], resource, val, true))
        }
        return;
      }
      var row
      if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
        row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : properties[v].type === 'boolean' ? (resource[v] ? 'Yes' : 'No') : resource[v];
        if (!val)
          return
        row = self.getPropRow(properties[v], resource, val || resource[v], true)
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            vCols.push(<View key={self.getNextKey()}>
                         <Text style={style}>{msgParts[0]}</Text>
                         <Text style={[style, {color: isMyMessage ? STRUCTURED_MESSAGE_COLOR : LINK_COLOR}]}>{msgModel.value.title}</Text>
                       </View>);
            return;
          }
        }
        row = self.getPropRow(properties[v], resource, resource[v], true)
      }
      vCols.push(row);
    });

    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      });
    }
  }
  addContact() {
    Alert.alert(
      translate('addContact', utils.getDisplayName(this.props.resource.from)),
      null,
      [
        {text: translate('Ok'), onPress: () => console.log('Ok!') },
        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
      ]
    )
  }
  editForm(rUri, message) {
    let s = rUri.split('_')
    let resource = {
      [constants.TYPE]: s[0],
      [constants.ROOT_HASH]: s[1]
    }

    let rmodel = utils.getModel(s[0]).value;
    let title = translate(rmodel);
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      // titleTextColor: '#999999',
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('done'),
      passProps: {
        model: rmodel,
        resource: resource,
        message: message
      }
    })
  }
*/