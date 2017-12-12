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
// import ProgressBar from 'react-native-progress/Bar';

const ProgressBar = (() => {
  switch (Platform.OS) {
    case 'web':
      return require('./ProgressBar')
    default:
      return require('react-native-progress/Bar')
  }
})()

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
  TouchableOpacity,
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
    let detailsTab = <View style={buttonStyles.container} key={this.getNextKey()}>
                       <TouchableOpacity onPress={this.showDetails.bind(this)} underlayColor='transparent'>
                         <View style={styles.item}>
                           <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
                           <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{'Details'}</Text>
                         </View>
                       </TouchableOpacity>
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
           <TouchableOpacity onPress={this.exploreForwardlink.bind(this, resource, props[p])} underlayColor='transparent'>
             <View style={[styles.item, {justifyContent: 'flex-start'}]}>
               <View style={styles.row}>
                 <Icon name={icon}  size={utils.getFontSize(30)}  color='#757575' />
                 {count}
               </View>
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{propTitle}</Text>
             </View>
           </TouchableOpacity>
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
      if (utils.isRM(resource)  &&  (resource.status !== 'approved' && resource.status !== 'denied')) {
        details = <View>
                   {details}
                   <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 100}}>
                    <TouchableOpacity onPress={this.props.approve.bind(this)}>
                    <View style={styles.approve}>
                      <Icon name='ios-thumbs-up-outline' color='#fff' size={25} style={{marginTop: 10}}/>
                      <Text style={styles.approveText}>{translate('Approve')}</Text>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.deny.bind(this)}>
                    <View style={styles.deny}>
                      <Icon name='ios-thumbs-down-outline' color='#7AAAC3' size={25} style={{marginTop: 10}}/>
                      <Text style={styles.denyText}>{translate('Deny')}</Text>
                    </View>
                    </TouchableOpacity>
                  </View>
                  </View>
      }
    }

    if ((refList  &&  refList.length)  ||  !propsToShow.length  ||  showDetails) {
      let style = {width: utils.getContentWidth(ApplicationTabs), height: utils.dimensions(ApplicationTabs).height}
      return  <View style={style}>
                {separator}
                <View style={[buttonStyles.buttons, {justifyContent: 'center', borderBottomWidth: 0, minHeight: refList &&  refList.length ? 70 : 0}]} key={'ApplicationTabs'}>
                  {refList}
                </View>
                {showDetails  &&  this.getAppStatus()}
                {children}
                <View style={{margin: 1, flex: 1}}>
                  {flinkRL}
                  {details}
                </View>
              </View>
    }

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
  getAppStatus() {
    let resource = this.props.resource
    let formTypes = []
    let progress = 0
    if (resource.forms) {
      resource.forms.forEach((item) => {
        let itype = utils.getType(item.id)
        if (formTypes.indexOf(itype) === -1)
          formTypes.push(itype)
      })
      let m = utils.getModel(resource.requestFor)

      progress = formTypes.length / m.value.forms.length
    }
    let progressColor = '#7AAAC3'
    if (resource.status) {
      switch (resource.status) {
        case 'approved':
          progressColor = '#A6D785'
          break
        case 'denied':
          progressColor = '#EE3333'
          break
      }
    }

    return <View style={styles.progress}>
             <ProgressBar progress={progress} width={utils.dimensions(ApplicationTabs).width - 40} color={progressColor} borderWidth={1} borderRadius={0} height={20} />
           </View>
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
  command: {
    fontSize: 20,
    alignSelf: 'center',
    color: '#555555'
  },
  progress: {
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignSelf: 'center'
  },
  approve: {
    backgroundColor: '#7AAAC3',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 250,
    alignSelf: 'center',
    height: 50,
    borderRadius: 15,
    marginRight: 20
  },
  approveText: {
    fontSize: 20,
    color: '#ffffff',
    alignSelf: 'center'
  },
  deny: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 250,
    alignSelf: 'center',
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#7AAAC3'
  },
  denyText: {
    fontSize: 20,
    color: '#7AAAC3',
    alignSelf: 'center'
  }
})

module.exports = ApplicationTabs;
