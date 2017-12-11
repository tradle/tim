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
import ProgressBar from 'react-native-progress/Bar';
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
    let detailsTab = <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
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
                   <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <TouchableOpacity onPress={this.props.approve.bind(this)}>
                    <View style={styles.approve}>
                      <Icon name='ios-thumbs-up-outline' color='#fff' size={25} style={{marginTop: 5}}/>
                      <Text style={{fontSize: 20, color: '#ffffff', alignSelf: 'center'}}>{translate('Approve')}</Text>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.deny.bind(this)}>
                    <View style={styles.deny}>
                      <Icon name='ios-thumbs-down-outline' color='#7AAAC3' size={25} style={{marginTop: 5}}/>
                      <Text style={{fontSize: 20, color: '#7AAAC3', alignSelf: 'center'}}>{translate('Deny')}</Text>
                    </View>
                    </TouchableOpacity>
                  </View>
                  </View>
      }
    }

    if ((refList  &&  refList.length)  ||  !propsToShow.length  ||  showDetails)
      return   <View>
                {separator}
                <View style={[buttonStyles.buttons, { borderBottomWidth: 0}]} key={'ShowRefList'}>
                  {refList}
                </View>
                {showDetails  &&  this.getAppStatus()}
                {children}
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
  getAppStatus() {
    let resource = this.props.resource
    if (!resource.forms)
      return
    // formsCount = <View style={styles.formsCount}>
    //                <Text style={styles.formsCountText}>{resource.forms.length}</Text>
    //              </View>
    let formTypes = []
    resource.forms.forEach((item) => {
      let itype = utils.getType(item.id)
      if (formTypes.indexOf(itype) === -1)
        formTypes.push(itype)
    })
    let m = utils.getModel(resource.requestFor)

    let progress = formTypes.length / m.value.forms.length
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
    // return <View style={{marginVertical: 5}}>
    //        <View style={{borderWidth: StyleSheet.hairlineWidth, borderColor: progressColor, flexDirection: 'row'}}>
    //          <View style={{flex: formTypes.length, backgroundColor: progressColor, height: 20}} />
    //          <View style={{flex: m.value.forms.length, backgroundColor: '#ffffff', height: 20}} />
    //        </View>
    //        <View style={{marginTop: -4, width: utils.dimensions(ApplicationTabs).width - 40}}>
    //          <Text style={{color: 'red', fontSize: 16, marginTop: -17, alignSelf: 'center'}}>{resource.status}</Text>
    //        </View>
    //        </View>

    return <View style={styles.progress}>
             <ProgressBar progress={progress} width={utils.dimensions(ApplicationTabs).width - 40} color={progressColor} borderWidth={1} borderRadius={0} height={20} />
           </View>

    // formsCount = <Progress.Bar progress={progress} width={100} color='#7AAAC3' borderWidth={1} height={3} />
    // formsCount = <Pie progress={progress} size={50} />
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
    width: 150,
    marginTop: 20,
    alignSelf: 'center',
    height: 40,
    borderRadius: 15,
    marginRight: 20
  },
  deny: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    width: 150,
    marginTop: 20,
    alignSelf: 'center',
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#7AAAC3'
  }
})

module.exports = ApplicationTabs;
