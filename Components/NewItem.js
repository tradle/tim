console.log('requiring NewItem.js')
'use strict';

import t from 'tcomb-form-native'
import utils from '../utils/utils'
var translate = utils.translate
import extend from 'extend'
import myStyles from '../styles/styles'
import constants from '@tradle/constants'
import NewResourceMixin from './NewResourceMixin'
import PageView from './PageView'
import reactMixin from 'react-mixin'
import platformStyles from '../styles/platform'
import { makeResponsive } from 'react-native-orient'

var Form = t.form.Form;
Form.stylesheet = myStyles;

import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableHighlight,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'

class NewItem extends Component {
  static displayName = 'NewItem'
  props: {
    navigator: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    onAddItem: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedAssets: {},
      resource: this.props.resource
    }

    // if (this.props.resource[this.props.metadata.name])
    //   this.state.data = this.props.resource[this.props.metadata.name]

    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    // currentRoutes[currentRoutesLength - 1].onRightButtonPress = {
    //   stateChange: this.onSavePressed.bind(this)
    // };
    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.onSavePressed.bind(this)
  }
  onSavePressed() {
    if (this.state.submitted)
      return
    this.state.submitted = true
    var value = this.refs.form.getValue();
    if (!value)
      value = this.refs.form.refs.input.state.value;
    if (!value) {
      value = this.state.data
      if (!value)
        value = {}
    }

    if (this.floatingProps) {
      for (var p in this.floatingProps)
        value[p] = this.floatingProps[p]
    }
    var propName = this.props.metadata.name;
    var resource = this.props.resource
    // value is a tcomb Struct
    var item = utils.clone(value);
    var missedRequiredOrErrorValue = this.checkRequired(this.props.metadata, item, resource)
    if (!utils.isEmpty(missedRequiredOrErrorValue)) {
      this.state.submitted = false
      var state = {
        missedRequiredOrErrorValue: missedRequiredOrErrorValue
      }
      this.setState(state)
      return;
    }

    if (this.props.metadata.items) {
      // HACK ref props of array type props reside on resource for now
      var props = this.props.metadata.items.properties
      if (props) {
        var rProps = utils.getModel(resource[constants.TYPE]).properties
        for (var p in props) {
          if (p === propName)
            continue
          if (props[p].ref  &&  resource[p]  &&  !rProps[p]) {
            item[p] = resource[p]
            delete resource[p]
          }
        }
      }
    }

    if (!this.validateValues(this.props.metadata, item)) {
      this.state.submitted = false
      return;
    }

    // if (this.props.metadata.items.backlink)
    //   item[this.props.metadata.items.backlink] = this.props.resource[constants.TYPE] + '_' + this.props.resource[constants.ROOT_HASH];

    if (utils.isEmpty(this.state.selectedAssets))
      this.props.onAddItem(propName, item);
    else {
      for (var assetUri in this.state.selectedAssets) {
        var newItem = {};
        extend(newItem, item);
        newItem = {url: assetUri, title: 'photo'};
        this.props.onAddItem(propName, newItem);
      }
    }
    this.props.navigator.pop();
  }

  checkRequired(metadata, json, resource) {
    var required = metadata.required;
    if (!required) {
      required = []
      for (var p in metadata.items.properties) {
        if (p.charAt(0) !== '_')
          required.push(p)
      }
    }
    var missedRequiredOrErrorValue = {}
    required.forEach((p) =>  {
      var v = json[p] ? json[p] : (this.props.resource ? this.props.resource[p] : null); //resource[p];
      if (v) {
        if (typeof v === 'string'  &&  !v.length) {
          v = null
          delete json[p]
        }
        else if (typeof v === 'object'  &&  metadata.items.properties[p].ref == constants.TYPES.MONEY) {
          var units = metadata.items.properties[p].units
          if (units)
            v = v.value
          else {
            if (v.value === '')
              v = null
            delete json[p]
          }
        }
      }
      var isDate = Object.prototype.toString.call(v) === '[object Date]'
      if (!v  ||  (isDate  &&  isNaN(v.getTime())))  {
        var prop = metadata
        if (prop.items  &&  prop.items.backlink)
          return
        if ((prop.ref) ||  isDate  ||  prop.items) {
          if (resource && resource[p])
            return;
          missedRequiredOrErrorValue[p] = missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired') //'This field is required'
        }
        else if (!prop.displayAs)
          missedRequiredOrErrorValue[p] = missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired') //'This field is required'
      }
    })
    return missedRequiredOrErrorValue
  }
  validateValues(prop, item) {
    var required = prop.required;
    var hasError;
    this.state.options = {
      fields: {}
    };
    if (required) {
      required.forEach((p) => {
        if (!item[p]  &&  prop.name == 'photos') {
          if (!utils.isEmpty(this.state.selectedAssets))
            return;
          hasError = true;
          this.setState({err: 'Select the photo please'});
        }
      })
    }
    if (!hasError)
      this.state.options = null;
    return !hasError;
  }
  render() {
    var props = this.props;
    var err = props.err || this.state.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var error = err
              ? <Text style={errStyle}>{err}</Text>
              : <View />


    var meta =  props.metadata;
    var model = {};
    var params = {
        meta: meta,
        model: model,
        onSubmitEditing: this.onSavePressed.bind(this),
        component: NewItem
    };
    if (this.state.data)
      params.data = this.state.data[0]

    var options = this.getFormFields(params);
    options.auto = 'placeholders';
    var Model = t.struct(model);
    if (this.state.options) {
      for (var fieldName in this.state.options.fields) {
        var fields = this.state.options.fields[fieldName]
        for (var f in fields) {
          options.fields[fieldName][f] = fields[f];
        }
      }
    }
    var width = utils.getContentWidth(NewItem)
    return (
      <PageView style={[platformStyles.container]}>
        <ScrollView style={{backgroundColor: 'transparent', width: width, alignSelf: 'center'}}
                    ref='scrollView' {...this.scrollviewProps}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode={'on-drag'}>
          <View style={{marginLeft: 10, marginRight: 20, marginBottom: 15 }}>
            <Form ref='form' type={Model} options={options} />
          </View>
        </ScrollView>
        {error}
      </PageView>
    );
  }
  onSelect(asset) {
    var selectedAssets = this.state.selectedAssets;
    // unselect if was selected before
    if (selectedAssets[asset.node.image.uri])
      delete selectedAssets[asset.node.image.uri];
    else
      selectedAssets[asset.node.image.uri] = asset;
  }
}
reactMixin(NewItem.prototype, NewResourceMixin);
NewItem = makeResponsive(NewItem)

var styles = StyleSheet.create({
  err: {
    paddingVertical: 10,
    fontSize: 20,
    color: 'darkred',
  }

});
module.exports = NewItem;
