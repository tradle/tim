'use strict';

var utils = require('../utils/utils');
var extend = require('extend');
var translate = utils.translate
import Icon from 'react-native-vector-icons/Ionicons';
var equal = require('deep-equal')
var StyleSheet = require('../StyleSheet')
var PhotoList = require('./PhotoList')
var constants = require('@tradle/constants');
var Accordion = require('./Accordion')
var defaultBankStyle = require('../styles/defaultBankStyle.json')

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
  Platform,
  TouchableHighlight,
  // StyleSheet,
  Image,
  Navigator
} from 'react-native'

var markdownStyles = {
  heading1: {
    fontSize: 24,
    color: 'purple',
  },
  link: {
    textDecorationLine: 'none'
  },
  mailTo: {
    color: 'orange',
  },
  text: {
    color: '#757575',
    fontStyle: 'italic'
  },
}

var Markdown = require('./Markdown')
import React, { Component } from 'react'

var ResourceMixin = {
  showRefResource(resource, prop) {
    var id = utils.getId(resource)
    // if (id !== this.state.propValue)
    //   return;
    var type = resource[constants.TYPE] || id.split('_')[0]
    var model = utils.getModel(type).value;
    var title = utils.getDisplayName(resource, model.properties);
    if (utils.isMessage(type)) {
      let {bankStyle, search, currency, country} = this.props
      this.props.navigator.push({
        id: 5,
        component: require('./MessageView'),
        backButtonTitle: translate('back'),
        title: model.title,
        passProps: {
          bankStyle: bankStyle,
          resource: resource,
          search: search,
          currency: currency,
          country: country,
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
      backButtonTitle: 'Back',
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
    let LINK_COLOR = (this.props.bankStyle  &&  this.props.bankStyle.linkColor) || '#7AAAC3'
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
      for (var p in itemsMeta) {
        if (p.charAt(0) !== '_'  &&  !itemsMeta[p].hidden)
          vCols.push(p);
      }
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
                    <Icon name='ios-close-circle-outline' size={25} color={LINK_COLOR} style={{marginTop: Platform.OS === 'web' ? -5 : 0, paddingLeft: 10}}/>
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
                 backButtonTitle: 'Back',
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
  renderSimpleProp(val, pMeta, modelName, component) {
    if (Array.isArray(val)) {
      if (pMeta.items.backlink)
        return <View  key={this.getNextKey()} />

      var vCols = pMeta.viewCols;
      if (!vCols)
        vCols = pMeta.items.ref  &&  utils.getModel(pMeta.items.ref).value.viewCols
      var cnt = val.length;
      val = <View style={{marginHorizontal: 7}}>{this.renderItems(val, pMeta)}</View>
      let title = pMeta.title || utils.makeLabel(pMeta.name)
      const titleEl = <Text style={styles.title}>{title}</Text>
      let header = <View style={{flexDirection: 'row'}}>
                    {titleEl}
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
                  sections={[title]}
                  header={header}
                  content={val}
                  underlayColor='transparent'
                  easing='easeIn' />
             </View>
      else {
        val = <View key={this.getNextKey()}>
               {titleEl}
               {val}
             </View>
      }
    }
    else  {
      if (pMeta.units  &&  pMeta.units.charAt(0) != '[')
        val += ' ' + pMeta.units

      if (val === NOT_SPECIFIED)
        val = <Text style={[styles.description, {color: this.props.bankStyle.linkColor}]}>{val}</Text>
      else if (typeof val === 'number')
        val = <Text style={styles.description}>{val}</Text>;
      else if (typeof val === 'boolean')
        val = <Text style={styles.description}>{val ? 'Yes' : 'No'}</Text>;
      else if (pMeta.type !== 'object'  &&  (typeof val === 'string')  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
        val = <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: '#7AAAC3'}]}>{val}</Text>;
      else if (modelName === TERMS_AND_CONDITIONS)
        val = <Text style={[styles.description, {flexWrap: 'wrap'}]}>{val}</Text>;
      else if (pMeta.markdown) {
        markdownStyles.color = this.props.bankStyle.linkColor,
        val = <View style={styles.container}>
                <Markdown markdownStyles={markdownStyles}>
                  {val}
                </Markdown>
              </View>
      }
      else if (pMeta.signature) {
        let {width, height} = utils.dimensions(component)
        let h = 70
        let w
        if (width > height)
          w = (width * 70)/(height - 100)
        else
          w = (height * 70)/(width - 100)
        w = Math.round(w)
        val = <View style={styles.container}>
                <Image style={{width: w, height: h}} source={{uri: val}}/>
              </View>
      }
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

    let bg = isView ? bankStyle.myMessageBackgroundColor : bankStyle.verifiedHeaderColor
    let color = isView ? '#ffffff' : bankStyle.verifiedHeaderTextColor
    var backlinksBg = {backgroundColor: bg, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginHorizontal: isView ? 0 : -10}
    if (prop) {
      let state
      if (isOnfido) {
        let color = json.result === 'clear' ? 'green' : 'red'
        state = <Text style={[styles.bigTitle, {color: color, alignSelf: 'center'}]}>{json.result}</Text>
      }
      jsonRows.push(<View style={backlinksBg} key={this.getNextKey()}>
                      <Text  style={[styles.bigTitle, {color: color, paddingVertical: 10}]}>{translate(prop)}</Text>
                      {state}
                    </View>)
    }
    if (!indent)
      indent = 0
    let textStyle = indent === 1 ||  !isBreakdown  ? styles.bigTitle : styles.title

    let LINK_COLOR = bankStyle.linkColor
    if (prop  ||  !isBreakdown) {
      for (let p in json) {
        if (typeof json[p] === 'object'  ||  p === 'result')
          continue
        let label
        if (!skipLabels  ||  skipLabels.indexOf(p) === -1)
          label = <Text style={[styles.title, {flex: 1}]}>{utils.makeLabel(p)}</Text>
        jsonRows.push(<View style={{flexDirection: 'row', paddingVertical: 3, paddingRight: 10, paddingLeft: isView ? 10 * (indent + 1) : 10 * (indent - 1)}} key={this.getNextKey()}>
                        {label}
                        <Text style={[styles.title, {flex: 1, color: '#2e3b4e'}]}>{json[p]}</Text>
                      </View>)
      }
    }
    else if (isOnfido  &&  !indent) {
      jsonRows.push(<View style={backlinksBg} key={this.getNextKey()}>
                      <Text  style={[styles.bigTitle, {color: color, paddingVertical: 10}]}>{translate('Breakdown')}</Text>
                    </View>)

    }
    for (let p in json) {
      if (isOnfido) {
        if  (isBreakdown  && p === 'result')
          continue
        if (p === 'properties')
          continue
      }
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
          arrow = <Icon color={bankStyle.linkColor} size={20} name={'ios-arrow-down'} style={{marginRight: 10, marginTop: 7}}/>
        }
        else
          arr = jsonRows
        // HACK for Onfido
        if (p !== 'breakdown') {
          let result
          if (isOnfido && isBreakdown) {
            let color = isBreakdown  &&  json[p].properties ? {color: '#757575'} : {color: json[p].result === 'clear' ?  'green' : 'red'}
            result = <Text style={[textStyle, color]}>{json[p].result}</Text>
          }

          arr.push(<View style={{paddingVertical: 3, paddingRight: 10, paddingLeft: isView ? 10 * (indent + 1) : 10 * (indent - 1)}} key={this.getNextKey()}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={textStyle}>{utils.makeLabel(p)}</Text>
                        {result}
                        {arrow}
                      </View>
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
      // let label
      // if (!skipLabels  ||  skipLabels.indexOf(p) === -1)
      //   label = <Text style={[styles.title, {flex: 1}]}>{utils.makeLabel(p)}</Text>
      // jsonRows.push(<View style={{flexDirection: 'row', paddingRight: 10, paddingLeft: isView ? 10 * (indent + 1) : 10 * (indent - 1)}} key={this.getNextKey()}>
      //                 {label}
      //                 <Text style={[styles.title, {flex: 1, color: '#2e3b4e'}]}>{json[p]}</Text>
      //               </View>)
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
                       sections={[utils.makeLabel(showCollapsed)]}
                       header={header}
                       style={{alignSelf: 'stretch'}}
                       content={<View>{arr}</View>}
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
  container: {
    margin: 10,
    flex: 1
  },
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
