'use strict';

var utils = require('../utils/utils');
var extend = require('extend');
var translate = utils.translate
var Icon = require('react-native-vector-icons/Ionicons');
var equal = require('deep-equal')
var StyleSheet = require('../StyleSheet')
// var ResourceView = require('./ResourceView');
// var ResourceList = require('./ResourceList');
var PhotoList = require('./PhotoList')
var constants = require('@tradle/constants');
var Accordion = require('react-native-accordion')
var defaultBankStyle = require('../styles/bankStyle.json')

import ENV from '../utils/env'

var NOT_SPECIFIED = '[not specified]'
var TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const ENUM = 'tradle.Enum'
var tada = []
var skip
const skipLabelsInJSON = {
  'tradle.PhotoID': {
    'address': ['full']
  }
}
const hideGroupInJSON = {
  'tradle.PhotoID': ['address']
}
import {
  Text,
  View,
  TouchableHighlight,
  // StyleSheet,
  Image,
  Navigator
} from 'react-native'

import React, { Component } from 'react'

var ResourceMixin = {
  showRefResource(resource, prop) {
    var id = utils.getId(resource)
    // if (id !== this.state.propValue)
    //   return;
    var type = resource[constants.TYPE] || id.split('_')[0]
    var model = utils.getModel(type).value;
    var title = utils.getDisplayName(resource, model.properties);
    if (utils.isMessage(resource)) {
      this.props.navigator.push({
        id: 5,
        component: require('./MessageView'),
        backButtonTitle: translate('back'),
        title: model.title,
        passProps: {
          bankStyle: this.props.bankStyle,
          resource: resource,
          currency: this.props.currency,
          country: this.props.country,
        }
      })
    }
    else {
      this.props.navigator.push({
        title: title,
        id: 3,
        component: require('./ResourceView'),
        titleTextColor: '#7AAAC3',
        // rightButtonTitle: 'Edit',
        backButtonTitle: translate('back'),
        passProps: {
          resource: resource,
          prop: prop,
          currency: this.props.currency
        }
      })
    }
  },
  showResources(resource, prop) {
    this.props.navigator.push({
      id: 10,
      title: translate(prop, utils.getModel(resource[constants.TYPE]).value),
      titleTextColor: '#7AAAC3',
      backButtonTitle: translate('back'),
      component: require('./ResourceList'),
      passProps: {
        modelName: prop.items.ref,
        filter: '',
        resource: resource,
        prop: prop,
        currency: this.props.currency
      }
    });
  },

  renderItems(val, pMeta, cancelItem) {
    let LINK_COLOR = (this.props.bankStyle  &&  this.props.bankStyle.LINK_COLOR) || '#7AAAC3'
    var itemsMeta = pMeta.items.properties;
    var prop = pMeta
    if (!itemsMeta) {
      var ref = pMeta.items.ref;
      if (ref) {
        pMeta = utils.getModel(ref).value;
        itemsMeta = pMeta.properties;
      }
    }
    var counter = 0;
    var vCols = pMeta.viewCols;
    if (!vCols) {
      vCols = [];
      for (var p in itemsMeta)
        vCols.push(p);
    }
    var cnt = val.length;
    var self = this;
    return val.map(function(v) {
      var ret = [];
      counter++;
      vCols.forEach((p) =>  {
        var itemMeta = itemsMeta[p];
        if (!v[p]  &&  !itemMeta.displayAs)
          return
        if (itemMeta.displayName)
          return
        var value;
        if (itemMeta.displayAs)
          value = utils.templateIt(itemMeta, v, pMeta)
        else if (itemMeta.type === 'date')
          value = utils.formatDate(v[p]);
        else if (itemMeta.type === 'boolean')
          value = v[p] ? 'Yes' : 'No'
        else if (itemMeta.type !== 'object') {
          if (p == 'photos') {
            var photos = [];
            ret.push(
               <PhotoList photos={v.photos} navigator={self.props.navigator} numberInRow={4} resource={this.props.resource}/>
            );
            return
          }
          else
            value = v[p];
        }
        else if (itemMeta.ref)
          value = v[p].title  ||  utils.getDisplayName(v[p], utils.getModel(itemMeta.ref).value.properties);
        else
          value = v[p].title;

        if (!value)
          return
        let item = <View>
                     <Text style={itemMeta.skipLabel ? {height: 0} : [styles.itemText, {color: '#878787', fontSize: 16}]}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
                     <Text style={styles.itemText}>{value}</Text>
                   </View>

        ret.push(
            <View style={styles.item} key={self.getNextKey()}>
            {cancelItem
              ? <View style={styles.row}>
                  {item}
                  <TouchableHighlight underlayColor='transparent' onPress={cancelItem.bind(self, prop, v)}>
                    <Icon name='ios-close-circle-outline' size={25} color={LINK_COLOR} />
                  </TouchableHighlight>
                </View>
              : item
            }
            </View>
        );
      })
      if (!ret.length  && v.title) {
        let item = <View style={{flexDirection: 'row'}}>
                    {v.photo
                      ? <Image source={{uri: v.photo}} style={styles.thumb} />
                      : <View />
                    }
                    <Text style={[styles.itemText, {color: cancelItem ? '#000000' : LINK_COLOR}]}>{v.title}</Text>
                  </View>

        ret.push(
          <View style={{paddingBottom: 5}} key={self.getNextKey()}>
           {cancelItem
            ? <View style={styles.row}>
               {item}
               <TouchableHighlight underlayColor='transparent' onPress={cancelItem.bind(self, prop, v)}>
                 <Icon name='ios-close' size={25} color={LINK_COLOR} />
               </TouchableHighlight>
              </View>
            : <TouchableHighlight underlayColor='transparent' onPress={() => {
                self.props.navigator.push({
                 title: v.title,
                 id: 3,
                 component: require('./ResourceView'),
                 backButtonTitle: translate('back'),
                 passProps: {resource: v}
                })
              }}>
             {item}
             </TouchableHighlight>
            }
         </View>
        );
      }

      return (
        <View key={self.getNextKey()}>
           {ret}
           {counter == cnt ? <View></View> : <View style={styles.itemSeparator}></View>}
        </View>
      )
    });
  },
  renderSimpleProp(val, pMeta, modelName) {
    if (val instanceof Array) {
      if (pMeta.items.backlink)
        return <View  key={this.getNextKey()} />

      var vCols = pMeta.viewCols;
      if (!vCols)
        vCols = pMeta.items.ref  &&  utils.getModel(pMeta.items.ref).value.viewCols
      var cnt = val.length;
      val = <View style={{marginHorizontal: 7}}>{this.renderItems(val, pMeta)}</View>

      let title = <View style={{flexDirection: 'row'}}>
                    <Text style={styles.title}>{pMeta.title || utils.makeLabel(pMeta.name)}</Text>
                    {cnt > 3  &&  modelName !== TERMS_AND_CONDITIONS
                      ? <Icon name={'ios-arrow-down'} size={15} color='#7AAAC3' style={{position: 'absolute', right: 10, top: 10}}/>
                      : <View />
                    }
                  </View>

      var separator = <View style={styles.separator}></View>;
      if (cnt > 3)
        val = <View key={this.getNextKey()}>
                {separator}
                <Accordion
                  header={title}
                  content={val}
                  underlayColor='transparent'
                  easing='easeInCirc' />
             </View>
      else {
        val = <View key={this.getNextKey()}>
               {title}
               {val}
             </View>
      }
    }
    else  {
      if (pMeta.units  &&  pMeta.units.charAt(0) != '[')
        val += ' ' + pMeta.units

      if (val === NOT_SPECIFIED)
        val = <Text style={[styles.description, {color: this.props.bankStyle.LINK}]}>{val}</Text>
      else if (typeof val === 'number')
        val = <Text style={styles.description}>{val}</Text>;
      else if (typeof val === 'boolean')
        val = <Text style={styles.description}>{val ? 'Yes' : 'No'}</Text>;
      else if (pMeta.type !== 'object'  &&  (typeof val === 'string')  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
        val = <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: '#7AAAC3'}]}>{val}</Text>;
      else if (modelName === TERMS_AND_CONDITIONS)
        val = <Text style={[styles.description, {flexWrap: 'wrap'}]}>{val}</Text>;
      else
        val = <Text style={[styles.description]}>{val}</Text>;
    }
    return val
  },
  showJson(params) {
    // let (prop, json, isView, jsonRows, skipLabels, indent, isOnfido} = params
    let prop = params.prop
    let json = params.json
    let isView = params.isView
    let jsonRows = params.jsonRows
    let skipLabels = params.skipLabels
    let indent = params.indent
    let isOnfido = params.isOnfido
    let isBreakdown = params.isBreakdown
    // let json = JSON.parse(jsonStr)
    // let jsonRows = []
    let rType = this.props.resource[constants.TYPE]
    let hideGroup = prop  &&  hideGroupInJSON[rType]
    let showCollapsed = ENV.showCollapsed  &&  ENV.showCollapsed[rType]
    skipLabels = !skipLabels  &&  prop  &&  skipLabelsInJSON[rType]  &&  skipLabelsInJSON[rType][prop]
    let bankStyle = this.state.bankStyle ||  this.props.bankStyle || defaultBankStyle
    if (prop) {
      let bg = isView ? bankStyle.MY_MESSAGE_BACKGROUND_COLOR : bankStyle.VERIFIED_HEADER_COLOR
      let color = isView ? '#ffffff' : bankStyle.VERIFIED_HEADER_TEXT_COLOR
      let state
      if (isOnfido) {
        let color = json.result === 'clear' ? 'green' : 'red'
        state = <Text style={[styles.bigTitle, {color: color, alignSelf: 'center'}]}>{json.result}</Text>
      }
      var backlinksBg = {backgroundColor: bg, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginHorizontal: isView ? 0 : -10}
      jsonRows.push(<View style={backlinksBg} key={this.getNextKey()}>
                      <Text  style={[styles.bigTitle, {color: color, paddingVertical: 10}]}>{translate(prop)}</Text>
                      {state}
                    </View>)
    }
    if (!indent)
      indent = 0
    let LINK_COLOR = bankStyle.LINK_COLOR
    for (let p in json) {
      if (isOnfido  &&  isBreakdown  && p === 'result')
        continue
      // if (p === 'document_numbers' || p === 'breakdown' || p === 'properties')
      //   continue
      if (prop  &&  hideGroup  &&  hideGroup.indexOf(p) !== -1)
        continue
      if (typeof json[p] === 'object') {
        if (utils.isEmpty(json[p])  ||  this.checkIfJsonEmpty(json[p]))
          continue
        if (Array.isArray(json[p])) {
          json[p].forEach((js) => this.showJson({json: js, isView: isView, jsonRows: []}))
          continue
        }
        // if (isBreakdown  &&  json[p].properties) {
        //   jsonRows.push(<View style={{paddingVertical: 10, paddingRight: 10, paddingLeft: isView ? 10 * (indent + 1) : 10 * (indent - 1)}} key={this.getNextKey()}>
        //               <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        //                 <Text style={styles.bigTitle}>{utils.makeLabel(p)}</Text>
        //                 <Text style={styles.bigTitle}>{json[p].result}</Text>
        //               </View>
        //               <View style={{height: 1, marginTop: 5, marginBottom: 10, marginHorizontal: -10, alignSelf: 'stretch', backgroundColor: '#eeeeee'}} />
        //             </View>)
        //   continue
        // }
        let arr, arrow
        if (showCollapsed  &&  showCollapsed === p) {
          arr = []
          jsonRows.push(arr)
          arrow = <Icon color={bankStyle.LINK_COLOR} size={20} name={'ios-arrow-down'} style={{marginRight: 10, marginTop: 7}}/>
        }
        else
          arr = jsonRows
        // HACK for Onfido
        if (p !== 'breakdown') {
          let result
          if (isOnfido && isBreakdown) {
            let color = isBreakdown  &&  json[p].properties ? {} : {color: json[p].result === 'clear' ?  'green' : 'red'}
            result = <Text style={[styles.bigTitle, color]}>{json[p].result}</Text>
          }

          arr.push(<View style={{paddingVertical: 10, paddingRight: 10, paddingLeft: isView ? 10 * (indent + 1) : 10 * (indent - 1)}} key={this.getNextKey()}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.bigTitle}>{utils.makeLabel(p)}</Text>
                        {result}
                        {arrow}
                      </View>
                      <View style={{height: 1, marginTop: 5, marginBottom: 10, marginHorizontal: -10, alignSelf: 'stretch', backgroundColor: '#eeeeee'}} />
                    </View>)
          if (isBreakdown  &&  json[p].properties)
            continue
        }
        else if (isOnfido)
          isBreakdown = true

// tada.push("<View style={{paddingVertical: 10, paddingHorizontal: isView ? 10 : 0}} key={this.getNextKey()}><Text style={styles.bigTitle}>{" + utils.makeLabel(p) + "}</Text></View>")
        let params = {json: json[p], isView, jsonRows: arr, skipLabels, indent: indent + 1, isOnfido, isBreakdown: isBreakdown}
        this.showJson(params)
        continue
      }
      let label
      if (!skipLabels  ||  skipLabels.indexOf(p) === -1)
        label = <Text style={[styles.title, {flex: 1}]}>{utils.makeLabel(p)}</Text>
      jsonRows.push(<View style={{flexDirection: 'row', paddingRight: 10, paddingLeft: isView ? 10 * (indent + 1) : 10 * (indent - 1)}} key={this.getNextKey()}>
                      {label}
                      <Text style={[styles.title, {flex: 1, color: '#2e3b4e'}]}>{json[p]}</Text>
                    </View>)
// tada.push("<View style={{flexDirection: 'row', paddingHorizontal: isView ? 10 : 0}} key={this.getNextKey()}><Text style={[styles.title, {flex: 1}]}>{" + utils.makeLabel(p) + "}</Text><Text style={[styles.title, {flex: 1, color: '#2e3b4e'}]}>{" + json[p] + "}</Text></View>")
    }
    if (!prop)
      return

    if (showCollapsed) {
      for (let i=0; i<jsonRows.length; i++) {
        if (Array.isArray(jsonRows[i])) {
          let arr = jsonRows[i]
          let header = arr[0]
          arr.splice(0, 1)
          let content = <View>{arr}</View>
          let row =  <Accordion
                       header={header}
                       style={{alignSelf: 'stretch'}}
                       content={content}
                       underlayColor='transparent'
                       easing='easeOutQuad' />
          jsonRows.splice(i, 1, row)
        }
      }
    }
    return jsonRows

    // if (!jsonRows.length)
    //   return <View/>
    // var backlinksBg = {backgroundColor: '#96B9FA'}
    // let title = <View style={backlinksBg} key={this.getNextKey()}>
    //               <Text  style={[styles.bigTitle, {color: '#ffffff', paddingVertical: 10}]}>{translate(prop)}</Text>
    //             </View>
    // return <View key={this.getNextKey()} >
    //           {title}
    //           <View style={{height: 1, marginBottom: 10, alignSelf: 'stretch', backgroundColor: this.props.bankStyle.LINK_COLOR}} />
    //           {jsonRows}
    //         </View>
  },
  checkIfJsonEmpty(json) {
    for (let p in json) {
      if (!json[p])
        continue
      if (typeof json[p] !== 'object')
        return false
      if (!this.checkIfJsonEmpty(json[p]))
        return false
    }
    return true
  },
}

var styles = StyleSheet.create({
  thumb: {
    width:  25,
    height: 25,
    marginRight: 2,
    borderRadius: 5
  },
  itemText: {
    fontSize: 18,
    marginBottom: 0,
    // marginHorizontal: 7,
    color: '#000000',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#eeeeee',
    // marginHorizontal: 15
  },
  item: {
    paddingVertical: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 3
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  description: {
    fontSize: 18,
    marginVertical: 3,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  bigTitle: {
    fontSize: 20,
    // fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7
  },

})

module.exports = ResourceMixin;
/*
  renderResource(resource, model) {
    var resource = resource ? resource : this.props.resource;
    var modelName = resource[constants.TYPE];
    if (!model)
      model = utils.getModel(modelName)
    // var model = utils.getModel(modelName).value;
    var vCols = vCols = model.viewCols
    let props = model.properties

    if (!vCols) {
      vCols = [];
      for (var p in props) {
        if (p != constants.TYPE)
          vCols.push(p)
      }
    }
    var isMessage = model.interfaces;
    if (!isMessage) {
      var len = vCols.length;
      for (var i=0; i<len; i++) {
        if (props[vCols[i]].displayName) {
          vCols.splice(i, 1);
          len--;
        }
      }
    }
    var first = true;
    let self = this
    var viewCols = vCols.map((p) => {
      var val = resource[p];
      var pMeta = model.properties[p];
      var isRef;
      var isItems
      var isDirectionRow;
      // var isEmail
      if (!val) {
        if (pMeta.displayAs)
          val = utils.templateIt(pMeta, resource);
        else if (this.props.checkProperties) {
          if (p.indexOf('_group') === p.length - 6) {
            return (<View style={{padding: 15}} key={this.getNextKey()}>
                      <View key={this.getNextKey()}  style={{borderBottomColor: this.props.bankStyle.LINK_COLOR, borderBottomWidth: 1, paddingBottom: 5}}>
                        <Text style={{fontSize: 22, color: this.props.bankStyle.LINK_COLOR}}>{translate(pMeta)}</Text>
                      </View>
                    </View>
             );
          }
          else
            val = NOT_SPECIFIED
        }
        else
          return;
      }
      else if (pMeta.ref) {
        if (pMeta.ref == constants.TYPES.MONEY) {
          let c = utils.normalizeCurrencySymbol(val.currency)
          val = (c || CURRENCY_SYMBOL) + val.value
        }
        else if (pMeta.inlined)
          return this.renderResource(val, utils.getModel(val[constants.TYPE]).value)

        // Could be enum like props
        else if (utils.getModel(pMeta.ref).value.subClassOf === ENUM)
          val = val.title
        else if (this.props.showVerification) {
          // ex. property that is referencing to the Organization for the contact
          var value = val[constants.TYPE] ? utils.getDisplayName(val, utils.getModel(val[constants.TYPE]).value.properties) : val.title;

          // val = <TouchableOpacity onPress={this.props.showVerification.bind(this, val, pMeta)}>
          val=  <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
               // </TouchableOpacity>

          isRef = true;
        }
      }
      else if (pMeta.type === 'date')
        val = dateformat(new Date(val), 'fullDate')
        // val = utils.formatDate(val);
      // else if (pMeta[constants.SUB_TYPE] === 'email') {
      //   isEmail = true
      //   val = <TouchableOpacity onPress={() => Communications.email([val], null, null, 'My Subject','My body text')}>
      //       <Text  style={[styles.title, styles.linkTitle]}>{val}</Text>
      //   </TouchableOpacity>

      // }

      if (!val)
        return <View key={this.getNextKey()}></View>;
      if (!isRef) {
        if (val instanceof Array) {
          if (pMeta.items.backlink)
            return <View  key={this.getNextKey()} />

          var vCols = pMeta.viewCols;
          if (!vCols)
            vCols = pMeta.items.ref  &&  utils.getModel(pMeta.items.ref).value.viewCols
          var cnt = val.length;
          val = <View style={{marginHorizontal: 7}}>{this.renderItems(val, pMeta)}</View>

          isItems = true
          first = false;
          title = <View style={{flexDirection: 'row'}}>
                    <Text style={styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
                    {cnt > 3  &&  modelName !== TERMS_AND_CONDITIONS
                      ? <Icon name={'ios-arrow-down'} size={15} color='#7AAAC3' style={{position: 'absolute', right: 10, top: 10}}/>
                      : <View />
                    }
                  </View>

          var separator = first
                    ? <View />
                    : <View style={styles.separator}></View>;
          if (cnt > 3)
            val = <View key={this.getNextKey()}>
                    {separator}
                    <Accordion
                      header={title}
                      content={val}
                      underlayColor='transparent'
                      easing='easeInCirc' />
                 </View>
          else {
            val = <View key={this.getNextKey()}>
                   {title}
                   {val}
                 </View>
          }
        }
        else  {
          if (props[p].units  &&  props[p].units.charAt(0) != '[')
            val += ' ' + props[p].units

          if (val === NOT_SPECIFIED)
            val = <Text style={[styles.description, {color: this.props.bankStyle.LINK}]}>{val}</Text>
          else if (typeof val === 'number')
            val = <Text style={styles.description}>{val}</Text>;
          else if (typeof val === 'boolean')
            val = <Text style={styles.description}>{val ? 'Yes' : 'No'}</Text>;
          else if (pMeta.type === 'boolean')
            val = <Text style={styles.description}>{val.title}</Text>;
          else if (pMeta.type !== 'object'  &&  (typeof val === 'string')  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
            val = <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: '#7AAAC3'}]}>{val}</Text>;
          else if (modelName === TERMS_AND_CONDITIONS)
            val = <Text style={[styles.description, {flexWrap: 'wrap'}]}>{val}</Text>;
          else
            val = <Text style={[styles.description]} numberOfLines={2}>{val}</Text>;

        }
      }
      var title = pMeta.skipLabel  ||  isItems
                ? <View />
                : <Text style={modelName === TERMS_AND_CONDITIONS ? styles.bigTitle : styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
      var separator = first
                    ? <View />
                    : <View style={styles.separator}></View>;

      first = false;
      let style = [styles.textContainer, {padding: 10}]
      if (isDirectionRow)
        style.push({flexDirection: 'row'})
      else
        style.push({flexDirection: 'column'})

      return (<View key={this.getNextKey()}>
               {separator}
               <View style={isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}}>
                 <View style={[style, {flexDirection: 'column'}]}>
                   {title}
                   {val}
                 </View>
               </View>
             </View>
             );
    });

    let retCols = []
    viewCols.forEach((v) => {
      if (!v)
        return
      if (Array.isArray(v)) {
        v.forEach((vv) => {
          retCols.push(vv)
        })
      }
      else
        retCols.push(v)
    })
    if (resource.txId) {
      retCols.push(<View key={this.getNextKey()}>
                     <View style={styles.separator}></View>
                     <View style={[styles.textContainer, {padding: 10}]}>
                       <Text style={styles.title}>{translate('irrefutableProofs')}</Text>
                       <TouchableOpacity onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + resource.txId)}>
                         <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 1'}</Text>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={this.onPress.bind(this, 'https://test-insight.bitpay.com/tx/' + resource.txId)}>
                         <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 2'}</Text>
                       </TouchableOpacity>
                      </View>
                    </View>)
    }
    return retCols;
  }

*/
