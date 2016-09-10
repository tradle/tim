'use strict';

var React = require('react');
var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
import LinearGradient from 'react-native-linear-gradient'
var cnt = 0;
import {
  Text,
  View,
  StyleSheet,
  Image
} from 'react-native';

const VERIFICATION_BG = '#FBFFE5' //'#F6FFF0';
const MY_PRODUCT = 'tradle.MyProduct'
const FORM_ERROR = 'tradle.FormError'
const FORM = 'tradle.Form'
const FORM_REQUEST = 'tradle.FormRequest'
const ENUM = 'tradle.Enum'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
var STRUCTURED_MESSAGE_COLOR

var RowMixin = {
  addDateProp(dateProp, style) {
    var resource = this.props.resource;
    var properties = utils.getModel(resource[constants.TYPE] || resource.id).value.properties;
    if (properties[dateProp]  &&  properties[dateProp].style)
      style = [style, properties[dateProp].style];
    var val = utils.formatDate(new Date(resource[dateProp]));

    return !properties[dateProp]  ||  properties[dateProp].skipLabel
        ? <Text style={style} key={this.getNextKey()}>{val}</Text>
        : <View style={{flexDirection: 'row'}} key={this.getNextKey()}><Text style={style}>{properties[dateProp].title}</Text><Text style={style}>{val}</Text></View>

    return <Text style={[style]} numberOfLines={1} key={this.getNextKey()}>{val}</Text>;
  },
  getNextKey() {
    return this.props.resource[constants.ROOT_HASH] + '_' + cnt++
  },
  getPropRow(prop, resource, val, isVerification) {
    STRUCTURED_MESSAGE_COLOR = this.props.bankStyle.STRUCTURED_MESSAGE_COLOR
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

    var style = {flexDirection: 'row'}
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

  },
  getOwnerPhoto(isMyMessage) {
    var to = this.props.to;

    if (isMyMessage  || !to /* ||  !to.photos*/)
      return <View style={{marginVertical: 0}}/>

    if (!isMyMessage   &&  this.props.resource.from.photo) {
      let uri = utils.getImageUri(this.props.resource.from.photo.url)
      return <Image source={{uri: uri}} style={styles.employeeImage} />
    }
    if (to.photos) {
      var uri = utils.getImageUri(to.photos[0].url);
      return <Image source={{uri: uri}} style={styles.msgImage} />
    }
    if (!isMyMessage) {
      var title = this.props.resource.from.title.split(' ').map(function(s) {
        return s.charAt(0);
      }).join('');

      return <View style={{paddingRight: 3}}>
               <LinearGradient colors={['#2B6493', '#417AA9', '#568FBE']} style={styles.cellRoundImage}>
                 <Text style={styles.cellText}>{title}</Text>
               </LinearGradient>
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
      showTime = resource.time - previousMessageTime > 3600000 ||
                 prevDate.getDate()  !== curDate.getDate()  ||
                 prevDate.getMonth() !== curDate.getMonth() ||
                 prevDate.getYear()  !== curDate.getYear()
    }

    if (showTime)
      return utils.formatDate(resource.time);
  },
  isMyMessage() {
    if (this.props.isAggregation)
      return
    var r = this.props.resource
    // return utils.isMyMessage(r)
    var fromHash = utils.getId(r.from);
    var me = utils.getMe()
    if (fromHash === utils.getId(me))
      return true;
    if (utils.getModel(r[constants.TYPE]).value.subClassOf == MY_PRODUCT) {
      let org = r.from.organization
      if (org  &&  utils.getId(r.from.organization) !== utils.getId(this.props.to))
        return true
    }
  }

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
}

var styles = StyleSheet.create({
  verySmallLetters: {
    fontSize: 18,
    // alignSelf: 'flex-end',
    color: '#757575'
    // color: '#b4c3cb'
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
  cellText: {
    marginTop: 8,
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 18,
    backgroundColor: 'transparent'
  },
  employeeImage: {
    // backgroundColor: '#dddddd',
    height: 30,
    marginRight: 3,
    marginLeft: 0,
    width: 30,
  },
  cellRoundImage: {
    paddingVertical: 1,
    borderRadius: 20,
    height: 40,
    width: 40,
    alignSelf: 'center'
  },
});

module.exports = RowMixin;
