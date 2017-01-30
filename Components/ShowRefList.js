'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var Icon = require('react-native-vector-icons/Ionicons');
var buttonStyles = require('../styles/buttonStyles');
var constants = require('@tradle/constants');
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin');
import { makeResponsive } from 'react-native-orient'

import * as Animatable from 'react-native-animatable'

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Platform,
} from 'react-native';

import React, { Component } from 'react'

import ENV from '../utils/env'

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
        // if (p == 'myVerifications' && me.organization)
        //   continue;
      }
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
        // icon = 'ios-checkmark-outline';
      propsToShow.push(p)
    }
    propsToShow.forEach((p) => {
      let propTitle = translate(props[p], model)
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon)
        icon = 'ios-checkmark';
      let count = resource[p]  &&  resource[p].length
      refList.push(
        <View style={[buttonStyles.container, {flex: 1, alignSelf: 'stretch'}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.showResources.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
             <View style={styles.item}>
               <View style={{flexDirection: 'row'}}>
                 <Icon name={icon}  size={utils.getFontSize(30)}  color='#757575' />
                {count
                    ? <View style={styles.count}>
                        <Text style={styles.countText}>{count}</Text>
                      </View>
                    : <View/>
                 }
               </View>
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{propTitle}</Text>
             </View>
           </TouchableHighlight>
         </View>
        );
    })

    const showQR = ENV.showMyQRCode && utils.getId(me) === utils.getId(resource)  &&  !me.isEmployee
    if (showQR) {
      refList.push(
        <View style={[buttonStyles.container, {flex:1, alignSelf: 'stretch'}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.props.showQR.bind(this)} underlayColor='transparent'>
             <View style={styles.item}>
               <Icon name={'ios-qr-scanner'}  size={utils.getFontSize(30)}  color='#757575' />
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{translate('showQR')}</Text>
             </View>
           </TouchableHighlight>
         </View>
        )

     }
     return refList.length
             ?  <View style={buttonStyles.buttons} key={'ShowRefList'}>
                  {refList}
                </View>
             : <View/>;
  }
}
reactMixin(ShowRefList.prototype, ResourceMixin);
reactMixin(ShowRefList.prototype, RowMixin);
ShowRefList = makeResponsive(ShowRefList)

var styles = StyleSheet.create({
  count: {
    alignSelf: 'flex-start',
    minWidth: 18,
    marginLeft: -7,
    marginTop: 0,
    borderRadius: 8,
    backgroundColor: '#7AAAC3',
    paddingHorizontal: 3,
    paddingVertical: 1
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
    color: '#ffffff'
  },
  item: {
    alignItems: 'center'
  },
})

module.exports = ShowRefList;
