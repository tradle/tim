'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ResourceList = require('./ResourceList');
var Icon = require('react-native-vector-icons/Ionicons');
var buttonStyles = require('../styles/buttonStyles');
var constants = require('@tradle/constants');
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin');
import { makeResponsive } from 'react-native-orient'

import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Platform,
} from 'react-native';

import React, { Component } from 'react'

class ShowRefList extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var props = model.properties;
    let self = this
    var refList = [];
    var isIdentity = model.id === constants.TYPES.PROFILE;
    var me = utils.getMe()
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === me[constants.ROOT_HASH] : true;
    // The profile page for the device owner has 2 more profile specific links: add new PROFILE and switch PROFILE
    let propsToShow = []

    for (var p in props) {
      if (isIdentity) {
        if (!isMe  &&  props[p].allowRoles  &&  props[p].allowRoles === 'me')
          continue;
        if (p === 'verifiedByMe'  &&  !me.organization)
          continue;
        if (p == 'myVerifications' && me.organization)
          continue;
      }
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
        // icon = 'ios-checkmark-outline';
      propsToShow.push(p)
    }
    let showQR = utils.getId(me) === utils.getId(resource)  &&  me.isEmployee
    let width = utils.dimensions(ShowRefList).width  / (propsToShow.length + (showQR ? 1 : 0))
    let maxLetters = 2 + (width/10)
    propsToShow.forEach((p) => {
      let propTitle = translate(props[p], model)
      if (propTitle.length > maxLetters)
        propTitle = propTitle.substring(0, maxLetters)
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon)
        icon = 'ios-checkmark';
      refList.push(
        <View style={[buttonStyles.container, {width: width}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.showResources.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
             <View style={{alignItems: 'center'}}>
               <Icon name={icon}  size={30}  color='#ffffff' />
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{propTitle}</Text>
             </View>
           </TouchableHighlight>
         </View>
        );
    })

    if (utils.getId(me) === utils.getId(resource)  &&  me.isEmployee) {
      refList.push(
        <View style={buttonStyles.container} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.props.showQR.bind(this)} underlayColor='transparent'>
             <View style={{alignItems: 'center'}}>
               <Icon name={'ios-qr-scanner'}  size={30}  color='#ffffff' />
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{translate('showQR')}</Text>
             </View>
           </TouchableHighlight>
         </View>
        )

     }
     return refList.length
             ?  <View style={buttonStyles.buttons} key={'ShowRefList'}>
                  <View  style={{flexDirection: 'row'}}>
                    {refList}
                  </View>
                </View>
             : <View/>;
  }
}
reactMixin(ShowRefList.prototype, ResourceMixin);
reactMixin(ShowRefList.prototype, RowMixin);
ShowRefList = makeResponsive(ShowRefList)

module.exports = ShowRefList;
