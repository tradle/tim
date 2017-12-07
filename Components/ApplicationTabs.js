'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
import Icon from 'react-native-vector-icons/Ionicons';
var buttonStyles = require('../styles/buttonStyles');
var appStyle = require('../styles/appStyle.json')
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');
var ShowPropertiesView = require('./ShowPropertiesView')
var Actions = require('../Actions/Actions');
var constants = require('@tradle/constants')
const {
  TYPE,
  ROOT_HASH
} = constants

const {
  VERIFICATION,
  FORM
} = constants.TYPES

import { makeResponsive } from 'react-native-orient'

import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform,
} from 'react-native';

import React, { Component } from 'react'

import ENV from '../utils/env'

class ApplicationTabs extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    var { resource, bankStyle, children, navigator, lazy, showDetails, currency, forwardlink } = this.props
    var model = utils.getModel(resource[TYPE]).value;
    var props = model.properties;
    var refList = [];
    var me = utils.getMe()
    let propsToShow = []

    let currentProp = forwardlink
    showDetails = !forwardlink  ||  showDetails

    let bg = bankStyle ? bankStyle.myMessageBackgroundColor : appStyle.CURRENT_UNDERLINE_COLOR

    let currentMarker = <View style={{backgroundColor: bg, height: 4, marginTop: -5}} />

    let itemProps = utils.getPropertiesWithAnnotation(model, 'items')
    if (itemProps)
      propsToShow = Object.keys(itemProps)

    let showCurrent = showDetails ? currentMarker : null
    let detailsTab = <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
                       <TouchableHighlight onPress={this.showDetails.bind(this)} underlayColor='transparent'>
                         <View style={styles.item}>
                           <View style={styles.row}>
                             <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
                           </View>
                           <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{'Details'}</Text>
                         </View>
                       </TouchableHighlight>
                       {showCurrent}
                      </View>

    refList.push(detailsTab)

    let vCols = model.viewCols.filter((p) => !props[p].hidden  &&  props[p].items)
    if (vCols) {
      vCols.forEach((p) => {
        let idx = propsToShow.indexOf(p)
        if (idx !== -1)
          propsToShow.splice(idx, 1)
      })
      propsToShow.forEach((p) => vCols.push(p))
      propsToShow = vCols
    }
    let hasCounts
    propsToShow.forEach((p) => {
      let ref = props[p].items.ref
      if (ENV.hideVerificationsInChat  && ref === VERIFICATION)
        return
      if (ENV.hideProductApplicationInChat  &&  utils.isContext(ref))
        return
      let propTitle = translate(props[p], model)
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon) {
        if (ref === FORM)
          icon = 'ios-body-outline'
        else
          icon = 'ios-checkmark-circle-outline';
      }
      let cnt = resource['_' + p + 'Count'] || (resource[p] &&  resource[p].length)
      let count
      if (cnt) {
        hasCounts = true
        if (!currentProp  &&  !showDetails)
          currentProp = props[p]
        count = <View style={styles.count}>
                  <Text style={styles.countText}>{cnt}</Text>
                </View>
      }

      let showCurrent = forwardlink  &&  forwardlink.name === p ? currentMarker : null

      refList.push(
        <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.exploreForwardlink.bind(this, resource, props[p])} underlayColor='transparent'>
             <View style={styles.item}>
               <View style={styles.row}>
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
    if (!hasCounts) {
      if (showDetails)
        refList = null
    }
    // explore current backlink
    let flinkRL, details, separator
    if (!showDetails  &&  currentProp) {
      let modelName = currentProp.items.ref
      var GridList = require('./GridList')
      flinkRL = <GridList
                    lazy={lazy}
                    modelName={modelName}
                    forwardlink={currentProp}
                    sortProperty={utils.getModel(modelName).value.sortProperty}
                    resource={resource}
                    search={true}
                    isForwardlink={true}
                    application={resource}
                    listView={true}
                    navigator={navigator} />
    }
    else if (resource.photos)
      separator = <View style={{height: 2, backgroundColor: bg}} />

    if (showDetails) {
      details = <ShowPropertiesView resource={resource}
                                    showRefResource={this.getRefResource.bind(this)}
                                    currency={currency}
                                    excludedProperties={['photos']}
                                    navigator={navigator} />
    }
    let comment
    if (ENV.homePageScanQRCodePrompt && !hasCounts  &&  utils.getMe()[ROOT_HASH] === resource[ROOT_HASH]) {
      comment = <View style={styles.commandView}>
                  <Text style={styles.command}>{translate('pleaseTapOnMenu')}</Text>
                  <Text style={styles.command}>{translate('scanQRcode')}</Text>
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
                  {flinkRL}
                  {details}
                </View>
              </View>

    return children || <View/>
  }
  exploreForwardlink(resource, prop) {
    Actions.exploreForwardlink(resource, prop)
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

reactMixin(ApplicationTabs.prototype, RowMixin);
ApplicationTabs = makeResponsive(ApplicationTabs)

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
    // marginLeft: -7,
    fontWeight: '600',
    alignSelf: 'center',
    color: appStyle.COUNTER_COLOR,
  },
  item: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0
  },
  row: {
    flexDirection: 'row'
  },
  commandView: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: 300,
    marginTop: 200
  },
  command: {
    fontSize: 20,
    alignSelf: 'center',
    color: '#555555'
  }
})

module.exports = ApplicationTabs;
