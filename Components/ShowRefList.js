'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
import Icon from 'react-native-vector-icons/Ionicons';
var buttonStyles = require('../styles/buttonStyles');
var appStyle = require('../styles/appStyle.json')
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');
var ResourceMixin = require('./ResourceMixin');
var ShowPropertiesView = require('./ShowPropertiesView')
var Actions = require('../Actions/Actions');
var constants = require('@tradle/constants')
const {
  TYPE,
  ROOT_HASH
} = constants
const {
  VERIFICATION,
  ORGANIZATION,
  PROFILE,
  FORM
} = constants.TYPES

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
    this.state = {docs: null}
  }
  render() {
    var { resource, backlink, backlinkList, showDocuments, showDetails, bankStyle, children, navigator, lazy, currency } = this.props
    var model = utils.getModel(resource[TYPE]).value;
    var props = model.properties;
    let self = this
    var refList = [];
    var isIdentity = model.id === PROFILE;
    var isOrg = model.id === ORGANIZATION;
    var me = utils.getMe()
    var isMe = isIdentity ? resource[ROOT_HASH] === me[ROOT_HASH] : true;
    // The profile page for the device owner has 2 more profile specific links: add new PROFILE and switch PROFILE
    let propsToShow = []

    let currentBacklink = backlink
    let hasPropsToShow = this.hasPropsToShow(resource)
    showDetails = !isIdentity  &&  !isOrg  &&  !showDocuments  &&  (showDetails || !backlink)  && hasPropsToShow
    // showDetails = !isIdentity  &&  !showDocuments  &&  (showDetails || !backlink)
    // if (showDetails  &&  isOrg)
    //   showDetails = false

    let bg = bankStyle ? bankStyle.myMessageBackgroundColor : appStyle.CURRENT_UNDERLINE_COLOR

    let currentMarker = <View style={{backgroundColor: bg, height: 4, marginTop: -5}} />

    let itemProps = utils.getPropertiesWithAnnotation(model, 'items')
    if (itemProps) {
      for (var p in itemProps) {
        if (isIdentity) {
          if (!isMe  &&  props[p].allowRoles  &&  props[p].allowRoles === 'me')
            continue;
          if (p === 'verifiedByMe'  &&  !me.organization)
            continue
        }
        if (props[p].items.backlink)
          propsToShow.push(p)
      }
    }
    let isMessage = utils.isMessage(resource)

    // Show supporting docs
    if (isMessage) {
      let rId = utils.getId(resource)
      let docs
      if (showDocuments) {
        docs = backlinkList
        this.state.docs = docs
      }
      else if (this.state.docs)
        docs = this.state.docs
      else {
        docs = []
        this.getDocs(resource.verifications, rId, docs)
      }
      if (docs  &&  docs.length) {
        let count = <View style={styles.count}>
                      <Text style={styles.countText}>{docs.length}</Text>
                    </View>
        let showCurrent = showDocuments ? currentMarker : null
        refList.push(
          <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={() => this.showDocs(docs)} underlayColor='transparent'>
             <View style={styles.item}>
               <View style={{flexDirection: 'row'}}>
                 <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
                 {count}
               </View>
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{'Documents'}</Text>
             </View>
           </TouchableHighlight>
           {showCurrent}
          </View>)
      }
    }
    if (!propsToShow.length) {
      if (!showDetails)
        return <View/>
    }
    else if (!isOrg  &&  !isIdentity  &&  hasPropsToShow) {
      let showCurrent = showDetails ? currentMarker : null
      let detailsTab = <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
                         <TouchableHighlight onPress={this.showDetails.bind(this)} underlayColor='transparent'>
                           <View style={styles.item}>
                             <View style={{flexDirection: 'row'}}>
                               <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
                             </View>
                             <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{'Details'}</Text>
                           </View>
                         </TouchableHighlight>
                         {showCurrent}
                        </View>

      if (refList.length)
        refList.splice(0, 0, detailsTab)
      else
        refList.push(detailsTab)
    }
    if (hasPropsToShow  &&  model.viewCols) {
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
      let ref = props[p].items.ref
      if (ENV.hideVerificationsInChat  && ref === VERIFICATION)
        return
      if (ENV.hideProductApplicationInChat  &&  utils.isContext(ref))
        return
      let propTitle = translate(props[p], model)
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon)
        icon = 'ios-checkmark';
      let cnt = resource['_' + p + 'Count'] // &&  resource[p].length
      let count
      if (cnt) {
        hasBacklinks = true
        if (!currentBacklink  &&  !showDetails &&  !showDocuments)
          currentBacklink = props[p]
        count = <View style={styles.count}>
                  <Text style={styles.countText}>{cnt}</Text>
                </View>
      }

      let showCurrent = currentBacklink  &&  currentBacklink.name === p ? currentMarker : null

      refList.push(
        <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.exploreBacklink.bind(this, resource, props[p])} underlayColor='transparent'>
             <View style={styles.item}>
               <View style={{flexDirection: 'row'}}>
                 <Icon name={icon}  size={utils.getFontSize(30)}  color='#757575' />
                 {count}
               </View>
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{propTitle}</Text>
             </View>
           </TouchableHighlight>
           {showCurrent}
         </View>
        );
    })
    const showQR = ENV.showMyQRCode && utils.getId(me) === utils.getId(resource)  &&  !me.isEmployee
    if (showQR) {
      refList.push(
        <View style={[buttonStyles.container, {flex:1}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.props.showQR.bind(this)} underlayColor='transparent'>
             <View style={styles.item}>
               <Icon name={'ios-qr-scanner'}  size={utils.getFontSize(30)}  color='#757575' />
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{translate('showQR')}</Text>
             </View>
           </TouchableHighlight>
         </View>
        )

    }
    if (!hasBacklinks  &&  !showDocuments) {
      if (showDetails)
        refList = null
    }
    // explore current backlink
    let backlinkRL, details, separator
    if (!showDetails  && (currentBacklink  ||  (backlinkList  &&  showDocuments))) {
      let modelName = showDocuments ? FORM : currentBacklink.items.ref
        var GridList = require('./GridList')
        backlinkRL = <GridList
                      lazy={lazy}
                      modelName={modelName}
                      prop={currentBacklink}
                      sortProperty={utils.getModel(modelName).value.sortProperty}
                      resource={resource}
                      isBacklink={true}
                      listView={true}
                      navigator={navigator} />
      // }
    }
    else if (resource.photos)
      separator = <View style={{height: 2, backgroundColor: bg}} />

    if (showDetails) {
      if (isMessage)
        details = <ShowPropertiesView { ...this.props }/>
      else
        details = <ShowPropertiesView resource={resource}
                                      showRefResource={this.getRefResource.bind(this)}
                                      currency={currency}
                                      excludedProperties={['photos']}
                                      navigator={navigator} />

    }
    let comment
    if (ENV.homePageScanQRCodePrompt && !hasBacklinks  &&  utils.getMe()[ROOT_HASH] === resource[ROOT_HASH]) {
      comment = <View style={{justifyContent: 'center', alignSelf: 'center', width: 300, marginTop: 200}}>
                  <Text style={{fontSize: 20, alignSelf: 'center', color: '#555555'}}>{translate('pleaseTapOnMenu')}</Text>
                  <Text style={{fontSize: 20, alignSelf: 'center', color: '#555555'}}>{translate('scanQRcode')}</Text>
                </View>
    }

    if ((refList  &&  refList.length)  ||  !propsToShow.length  ||  showDetails)
      return   <View>
                {separator}
                <View style={[buttonStyles.buttons, {justifyContent: 'center', borderBottomWidth: 0}]} key={'ShowRefList'}>
                  {refList}
                </View>
                {children}
                {comment}
                <View>
                  {backlinkRL}
                  {details}
                </View>
              </View>

    return children || <View/>
  }
  getDocs(varr, rId, docs) {
    if (!varr)
      return
    varr.forEach((v) => {
      if (v.method) {
        if (utils.getId(v.document) !== rId)
          docs.push(v.document)
      }
      else if (v.sources)
        this.getDocs(v.sources, rId, docs)
    })
  }
  hasPropsToShow(resource) {
    let m = utils.getModel(resource[TYPE]).value
    let props = m.properties
    let viewCols = m.viewCols
    for (let p in resource) {
      if (!props[p]  ||  p.charAt(0) === '_'  ||  props[p].type === 'array')
        continue
      if (viewCols  &&  viewCols.indexOf(p) !== -1)
        return true
    }
  }
  exploreBacklink(resource, prop) {
    Actions.exploreBacklink(resource, prop)
  }
  showDocs(docs) {
    Actions.getDocuments(this.props.resource, docs)
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
    marginLeft: -7,
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
