'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var Icon = require('react-native-vector-icons/Ionicons');
var buttonStyles = require('../styles/buttonStyles');
var appStyle = require('../styles/appStyle.json')
var constants = require('@tradle/constants');
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin');
var ShowPropertiesView = require('./ShowPropertiesView')
var Actions = require('../Actions/Actions');

import { makeResponsive } from 'react-native-orient'
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

    let bg
    let currentBacklink = this.props.backlink
    let showDetails = !isIdentity  &&  (this.props.showDetails || !this.props.backlink)
    if (showDetails)
      bg = {backgroundColor: appStyle.CURRENT_TAB_COLOR}
    else
      bg = {}

    if (!isIdentity)
      refList.push(
        <View style={[buttonStyles.container, bg, {flex: 1, alignSelf: 'stretch'}]} key={this.getNextKey()}>
         <TouchableHighlight onPress={this.showDetails.bind(this)} underlayColor='transparent'>
           <View style={styles.item}>
             <View style={{flexDirection: 'row'}}>
               <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
             </View>
             <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{'Details'}</Text>
           </View>
         </TouchableHighlight>
        </View>
      )
    for (var p in props) {
      if (props[p].hidden)
        continue
      if (isIdentity) {
        if (!isMe  &&  props[p].allowRoles  &&  props[p].allowRoles === 'me')
          continue;
        if (p === 'verifiedByMe'  &&  !me.organization)
          continue;
      }
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      propsToShow.push(p)
    }
    if (model.viewCols) {
      let vCols = model.viewCols.filter((p) => !props[p].hidden  &&  props[p].items  &&  props[p].items.backlink)
      if (vCols) {
        vCols.forEach((p) => {
          let idx = propsToShow.indexOf(p)
          if (idx !== -1)
            propsToShow.splice(idx, 1)
        })
        propsToShow.forEach((p) => vCols.push(p))
        propsToShow = vCols
      }
    }
    let hasBacklinks
    propsToShow.forEach((p) => {
      let propTitle = translate(props[p], model)
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon)
        icon = 'ios-checkmark';
      let count = resource[p]  &&  resource[p].length
      if (count) {
        hasBacklinks = true
        if (!currentBacklink && !showDetails)
          currentBacklink = props[p]
        count = <View style={styles.count}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
      }
      let bg = currentBacklink  &&  currentBacklink.name === p
             ? {backgroundColor: appStyle.CURRENT_TAB_COLOR}
             : {}
      refList.push(
        <View style={[buttonStyles.container, bg, {flex: 1, alignSelf: 'stretch'}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.exploreBacklink.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
             <View style={styles.item}>
               <View style={{flexDirection: 'row'}}>
                 <Icon name={icon}  size={utils.getFontSize(30)}  color='#757575' />
                 {count}
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
    // explore current backlink
    let backlinkRL, details
    if (!showDetails  && currentBacklink) {
      var ResourceList = require('./ResourceList')
      backlinkRL = <ResourceList
                      modelName={currentBacklink.items.ref}
                      prop={currentBacklink}
                      resource={resource}
                      isBacklink={true}
                      backlinkList={this.props.backlinkList || []}
                      navigator={this.props.navigator} />
    }
    if (showDetails) {
      details = <ShowPropertiesView resource={resource}
                            showRefResource={this.getRefResource.bind(this)}
                            currency={this.props.currency}
                            excludedProperties={['photos']}
                            navigator={this.props.navigator} />

    }
    let comment
    if (ENV.homePageScanQRCodePrompt && !hasBacklinks  &&  utils.getMe()[constants.ROOT_HASH] === this.props.resource[constants.ROOT_HASH]) {
      comment = <View style={{justifyContent: 'center', alignSelf: 'center', width: 300, marginTop: 200}}>
                  <Text style={{fontSize: 20, alignSelf: 'center', color: '#555555'}}>{translate('pleaseTapOnMenu')}</Text>
                  <Text style={{fontSize: 20, alignSelf: 'center', color: '#555555'}}>{translate('scanQRcode')}</Text>
                </View>
    }

    if (refList.length)
      return <View>
                <View style={[buttonStyles.buttons, {justifyContent: 'center', borderBottomWidth: 0}]} key={'ShowRefList'}>
                  {refList}
                </View>
                {this.props.children}
                {comment}
                <View style={{margin: 1, flex: 1}}>
                  {backlinkRL}
                  {details}
                </View>
              </View>
    return this.props.children || <View/>
  }

  exploreBacklink(resource, prop) {
    Actions.exploreBacklink(resource, prop)
  }
  showDetails() {
    Actions.getDetails(this.props.resource)
  }
  getRefResource(resource, prop) {
    var model = utils.getModel(this.props.resource[TYPE]).value;

    this.state.prop = prop;
    // this.state.propValue = utils.getId(resource.id);
    this.showRefResource(resource, prop)
    // Actions.getItem(resource.id);
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
    backgroundColor: appStyle.COUNTER_BG_COLOR,
    paddingHorizontal: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 9,
    borderColor: appStyle.COUNTER_COLOR,
    paddingVertical: 1
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
    color: appStyle.COUNTER_COLOR,
  },
  item: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0
  },
})

module.exports = ShowRefList;
