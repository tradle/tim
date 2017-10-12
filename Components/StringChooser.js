'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var equal = require('deep-equal')
var MessageList = require('./MessageList')

var constants = require('@tradle/constants');
var PageView = require('./PageView')
import platformStyles from '../styles/platform'

const FORM_REQUEST = 'tradle.FormRequest'
const REMEDIATION = 'tradle.Remediation'
import {
  ListView,
  Text,
  StyleSheet,
  View,
  Platform
} from 'react-native'

const SearchBar = Platform.OS === 'android' ? null : require('react-native-search-bar')
import React, { Component } from 'react'

class StringChooser extends Component {
  constructor(props) {
    super(props);
    var dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      strings: props.strings,
      dataSource: dataSource.cloneWithRows(props.strings),
    };
  }

  selectResource(modelId) {
    this.props.navigator.pop();
    this.props.callback(modelId)
  }
  renderRow(modelId)  {
    let model = utils.getModel(modelId)
    if (!model)
      return null
    model = model.value;
    var StringRow = require('./StringRow');

    return (
      <StringRow
        onSelect={() => this.selectResource(modelId)}
        title={utils.makeModelTitle(model)}
        bankStyle={this.props.bankStyle}
        navigator={this.props.navigator}
        callback={() => this.selectResource(modelId)}
        />
      );
  }
  render() {
    var style = [styles.listview]
    var content =
      <ListView ref='listview' style={style}
        dataSource={this.state.dataSource}
        removeClippedSubviews={true}
        initialListSize={100}
        renderRow={this.renderRow.bind(this)}
        enableEmptySections={true}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false} />;
    var bgStyle = this.props.bankStyle  &&  this.props.bankStyle.backgroundColor ? {backgroundColor: this.props.bankStyle.backgroundColor} : {backgroundColor: '#ffffff'}
      // <View style={[styles.container, bgStyle]}>
    return (
      <PageView style={[styles.container, bgStyle]}>
        {content}
      </PageView>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
  },
  listview: {
    marginTop: 64,
    borderWidth: 0,
    marginHorizontal: -1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ffffff',
  },
  centerText: {
    alignItems: 'center',
  },
  err: {
    color: '#D7E6ED'
  },
  errContainer: {
    height: 45,
    paddingTop: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eeeeee',
  }
});

module.exports = StringChooser;
