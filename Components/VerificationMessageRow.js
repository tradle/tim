'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ArticleView = require('./ArticleView');
var MessageView = require('./MessageView');
var NewResource = require('./NewResource');
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('@tradle/constants');
import LinearGradient from 'react-native-linear-gradient'
var RowMixin = require('./RowMixin');
var Accordion = require('react-native-accordion')
var extend = require('extend')
var equal = require('deep-equal')
var TradleW = require('../img/TradleW.png')

var reactMixin = require('react-mixin');

const VERIFICATION_BG = '#FBFFE5' //'#F6FFF0';
const MY_PRODUCT = 'tradle.MyProduct'
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

class VerificationMessageRow extends Component {
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
  onPress(event) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: this.props.resource.message}
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
        row = self.getPropRow(properties[v], resource, resource[v], /*style,*/ true)
      }
      vCols.push(row);
    });

    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      });
    }
  }

}

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  resourceTitle: {
    // flex: 1,
    fontSize: 17,
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
  employeeImage: {
    // backgroundColor: '#dddddd',
    height: 30,
    marginRight: 3,
    marginLeft: 0,
    width: 30,
  },

  msgImage: {
    // backgroundColor: '#dddddd',
    height: 30,
    marginRight: 3,
    marginLeft: 0,
    width: 30,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  verySmallLetters: {
    fontSize: 17,
    // alignSelf: 'flex-end',
    color: '#757575'
    // color: '#b4c3cb'
  },
  orgImage: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  cellRoundImage: {
    paddingVertical: 1,
    borderRadius: 20,
    height: 40,
    width: 40,
    alignSelf: 'center'
  },
  cellText: {
    marginTop: 8,
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 18,
    backgroundColor: 'transparent'
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
  },
  description: {
    color: '#757575',
    fontSize: 14,
  },
  verifiedHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 7,
    marginHorizontal: -8,
    marginTop: -6,
    justifyContent: 'center'
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
    fontSize: 17,
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
});
reactMixin(VerificationMessageRow.prototype, RowMixin);

module.exports = VerificationMessageRow;

