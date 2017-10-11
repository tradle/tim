'use strict';

var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var translate = utils.translate
var StyleSheet = require('../StyleSheet')

var DEFAULT_PRODUCT_ROW_BG_COLOR = '#f7f7f7'
var DEFAULT_PRODUCT_ROW_TEXT_COLOR = '#757575'
var PRODUCT_ROW_BG_COLOR, PRODUCT_ROW_TEXT_COLOR
const CONTEXT = 'tradle.Context'
import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  Platform,
  View
} from 'react-native'

import React, { Component } from 'react'

class MessageTypeRow extends Component {
  constructor(props) {
    super(props);
    PRODUCT_ROW_BG_COLOR = (this.props.bankStyle  &&  this.props.bankStyle.productRowBgColor) || DEFAULT_PRODUCT_ROW_BG_COLOR
    PRODUCT_ROW_TEXT_COLOR = (this.props.bankStyle  &&  this.props.bankStyle.productRowTextColor) || DEFAULT_PRODUCT_ROW_TEXT_COLOR
  }
  render() {
    var resource = this.props.resource;
    if (resource.autoCreate)
      return <View style={{height: 0}} />;
    var me = utils.getMe();
    var to = this.props.to;
    var ownerPhoto, hasOwnerPhoto;
    if (resource.owner  &&  resource.owner.photos)  {
      hasOwnerPhoto = true;
      var uri = utils.getImageUri(resource.owner.photos[0].url);
      ownerPhoto =
        <View style={[styles.cell, {marginVertical: 2}]}>
          <Image source={{uri: uri}} style={styles.msgImage} />
        </View>
    }
    else
      ownerPhoto = <View style={[styles.cell, {marginVertical: 20}]} />
    var onPressCall = this.props.onSelect;

    var title
    if (resource.id)
      title = translate(resource)
    else if (resource[constants.TYPE] === CONTEXT)
      title = utils.getModel(resource.product) ? utils.getModel(resource.product).value.title : resource.product
    else
      title = utils.getDisplayName(resource)
    let renderedRow = <Text style={[styles.modelTitle, {color: PRODUCT_ROW_TEXT_COLOR}]} numberOfLines={2}>{title}</Text>;

    var verPhoto;
    if (resource.owner  &&  resource.owner.photos) {
      var ownerImg = resource.owner.photos[0].url;
      var url = utils.getImageUri(ownerImg);
      verPhoto = <Image source={{uri: ownerImg}} style={styles.ownerImage} />
    }
    var viewStyle = { marginVertical: StyleSheet.hairlineWidth, backgroundColor: PRODUCT_ROW_BG_COLOR }
    return (
      <TouchableHighlight style={viewStyle} onPress={onPressCall ? onPressCall : () => {}} underlayColor='transparent'>
        {renderedRow}
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
  modelTitle: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 20,
    fontWeight: '400',
    marginVertical: 15,
    marginLeft: 15
  },
  cell: {
    paddingLeft: 20
  },
  msgImage: {
    backgroundColor: '#dddddd',
    height: 40,
    marginRight: 5,
    width: 40,
    borderRadius: 20,
    borderColor: '#cccccc',
    borderWidth: 1
  },
  ownerImage: {
    backgroundColor: '#dddddd',
    height: 30,
    width: 30,
    marginTop: -5,
    position: 'absolute',
    right: 10,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: 1
  },
});

module.exports = MessageTypeRow;
