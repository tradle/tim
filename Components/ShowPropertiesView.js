'use strict';

var PhotoList = require('./PhotoList');
var ArticleView = require('./ArticleView');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var RowMixin = require('./RowMixin')
var ResourceMixin = require('./ResourceMixin')
var reactMixin = require('react-mixin')
var Accordion = require('react-native-accordion')
var Icon = require('react-native-vector-icons/Ionicons')
var extend = require('extend');
var NOT_SPECIFIED = 'Not specified'
var DEFAULT_CURRENCY_SYMBOL = '£'
var CURRENCY_SYMBOL
import Prompt from 'react-native-prompt'

import {
  StyleSheet,
  Image,
  View,
  ListView,
  LayoutAnimation,
  Text,
  TextInput,
  TouchableHighlight,
  AlertIOS,
} from 'react-native'

import React, { Component } from 'react'
class ShowPropertiesView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    checkProperties: PropTypes.func,
    currency: PropTypes.string,
    showRefResources: PropTypes.func,
    showItems: PropTypes.func,
    bankStyle: PropTypes.object,
    errorProps: PropTypes.object,
    excludedProperties: PropTypes.array
  };
  constructor(props) {
    super(props);
    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      resource: this.props.resource,
      viewStyle: {margin: 3},
      dataSource: dataSource,
      promptVisible: null
    }
    CURRENCY_SYMBOL = props.currency ? props.currency.symbol || props.currency : DEFAULT_CURRENCY_SYMBOL
  }

  render() {
    var viewCols = this.getViewCols();
    return (
      <View key={this.getNextKey()}>
        {viewCols}
      </View>
    );
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.promptVisible !== nextState.promptVisible)
      return true
    if (!this.props.errorProps  &&  !nextProps.errorProps)
      return false
    if (!this.props.errorProps  ||  !nextProps.errorProps)
      return true
    return (this.props.errorProps != nextProps.errorProps) ? true : false
  }
  getViewCols(resource, model) {
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var vCols = []
    if (this.props.checkProperties) {
      let props = model.properties
      for (let p in props) {
        if (p.charAt(0) === '_'  ||  props[p].hidden  ||  props[p].readOnly)
          continue
        vCols.push(p)
      }
    }
    else
      vCols = model.viewCols

    var excludedProperties = this.props.excludedProperties;
    var props = model.properties;
    if (excludedProperties) {
      var mapped = [];
      excludedProperties.forEach((p) =>  {
        if (props[p]) {
          mapped.push(p);
        }
      })
      excludedProperties = mapped;
    }

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
      if (excludedProperties  &&  excludedProperties.indexOf(p) !== -1)
        return;

      var val = resource[p];
      var pMeta = model.properties[p];
      var isRef;
      var isItems
      var isDirectionRow;
      if (!val) {
        if (pMeta.displayAs)
          val = utils.templateIt(pMeta, resource);
        else if (this.props.checkProperties)
          val = NOT_SPECIFIED
        else
          return;
      }
      else if (pMeta.ref) {
        if (pMeta.ref == constants.TYPES.MONEY) {
          let c = utils.normalizeCurrencySymbol(val.currency)
          val = (c || CURRENCY_SYMBOL) + val.value
        }
        // Could be enum like props
        else if (Object.keys(utils.getModel(pMeta.ref).value.properties).length === 2)
          val = val.title
        else if (this.props.showRefResource) {
          // ex. property that is referencing to the Organization for the contact
          var value = val[constants.TYPE] ? utils.getDisplayName(val, utils.getModel(val[constants.TYPE]).value.properties) : val.title;

          val = <TouchableHighlight onPress={this.props.showRefResource.bind(this, val, pMeta)} underlayColor='transparent'>
                 <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
               </TouchableHighlight>

          isRef = true;
        }
      }
      else if (pMeta.type === 'date')
        val = utils.formatDate(val);

      if (!val)
        return <View key={this.getNextKey()}></View>;
      if (!isRef) {
        if (val instanceof Array) {
          if (pMeta.items.backlink)
            return <View  key={this.getNextKey()} />
          var vCols = pMeta.viewCols;
          var cnt = val.length;
          val = <View>{this.renderItems(val, pMeta)}</View>

          isItems = true
          first = false;
          title = <View style={{flexDirection: 'row'}}>
                    <Text style={styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
                    {cnt > 3
                      ? <Icon name={'ios-arrow-down'} size={15} color='#7AAAC3' style={{position: 'absolute', right: 10, top: 10}}/>
                      : <View />
                    }
                  </View>

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
            val = <Text style={[styles.description, {color: this.props.bankStyle.FORM_ERROR_COLOR}]}>{val}</Text>
          else if (typeof val === 'number'  ||  typeof val === 'boolean')
            val = <Text style={styles.description}>{val}</Text>;
          else if (pMeta.type === 'boolean')
            val = <Text style={styles.description}>{val.title}</Text>;
          else if (pMeta.type !== 'object'  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
            val = <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: '#7AAAC3'}]}>{val}</Text>;
          else
            val = <Text style={[styles.description]} numberOfLines={2}>{val}</Text>;
        }
      }
      var title = pMeta.skipLabel  ||  isItems
                ? <View />
                : <Text style={styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
      var separator = first
                    ? <View />
                    : <View style={styles.separator}></View>;

      first = false;
      let isPromptVisible = this.state.promptVisible !== null
      if (isPromptVisible)
        console.log(this.state.promptVisible)
      let canReject = this.props.checkProperties
                    ? <View style={{flex: 1, justifyContent: 'flex-end', alignSelf: 'center'}}>
                        <Icon key={p} name={this.props.errorProps && this.props.errorProps[p] ? 'ios-close-circle' : 'ios-radio-button-off'} size={25} color={this.props.errorProps && this.props.errorProps[p] ? 'red' : this.props.bankStyle.LINK_COLOR} style={{paddingRight: 10, marginTop: 10}}
                        onPress={() => {
                          this.setState({promptVisible: pMeta})
                        }}/>
                        <Prompt
                          title='Please write a message to the customer'
                          placeholder="Start typing"
                          visible={isPromptVisible}
                          onCancel={() => this.setState({ promptVisible: null })}
                          onSubmit={(value) => {
                            this.setState({ promptVisible: null})
                            this.props.checkProperties(this.state.promptVisible, value)
                          }}/>
                      </View>
                      // <View style={{flex: 1, justifyContent: 'flex-end', alignSelf: 'center'}}>
                      // <TouchableHighlight underlayColor='transparent' onPress={() => {
                      //   AlertIOS.prompt(
                      //     'Please write a message to the customer',
                      //     null,
                      //     [
                      //       {text: 'Ok', onPress: this.props.checkProperties.bind(this, pMeta)},
                      //       {text: 'Cancel', null}
                      //     ]
                      //   )
                      // }}>
                      //   <Icon name={this.props.errorProps && this.props.errorProps[p] ? 'ios-close-circle' : 'ios-radio-button-off'} size={25} color={this.props.errorProps && this.props.errorProps[p] ? 'red' : this.props.bankStyle.LINK_COLOR} style={{paddingRight: 10, marginTop: 10}}/>
                      // </TouchableHighlight>
                      // </View>
                    : <View />
      if (this.props.checkProperties)
        isDirectionRow = true
               // <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

      let style = [styles.textContainer, {padding: 10}]
      if (isDirectionRow) {
        style.push({flexDirection: 'row'})
        if (canReject)
          style.push({justifyContent: 'space-between', flex: 10})
      }
      else
        style.push({flexDirection: 'column'})

      return (<View key={this.getNextKey()}>
               {separator}
               <View style={isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}}>
                 <View style={[style, {flexDirection: 'column'}]}>
                   {title}
                   {val}
                 </View>
                 {canReject}
               </View>
             </View>
             );
    });
    if (resource.txId) {
      viewCols.push(<View key={this.getNextKey()}>
                     <View style={styles.separator}></View>
                     <View style={[styles.textContainer, {padding: 10}]}>
                       <Text style={styles.title}>{'Transaction uri'}</Text>
                       <Text onPress={this.onPress.bind(this, 'http://tbtc.blockr.io/tx/info/' + resource.txId)} style={[styles.description, {color: '#7AAAC3'}]}>{resource.txId}</Text>
                      </View>
                    </View>)
    }
    return viewCols;
  }

  onPress(url, event) {
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;
    this.props.navigator.push({
      id: 7,
      backButtonTitle: 'Back',
      title: utils.getDisplayName(this.props.resource, model.properties),
      component: ArticleView,
      passProps: {url: url ? url : this.props.resource.url}
    });
  }
}
reactMixin(ShowPropertiesView.prototype, RowMixin);
reactMixin(ShowPropertiesView.prototype, ResourceMixin);
var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginHorizontal: 15
  },
  title: {
    fontSize: 16,
    fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  linkTitle: {
    color: '#2892C6'
  },
  description: {
    fontSize: 16,
    marginVertical: 3,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  photo: {
    width: 86,
    height: 86,
    marginLeft: 1,
  },
  icon: {
    width: 40,
    height: 40
  },
});

module.exports = ShowPropertiesView;
