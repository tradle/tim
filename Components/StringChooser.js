console.log('requiring StringChooser.js')
'use strict';

import React, { Component } from 'react'
import equal from 'deep-equal'
import constants from '@tradle/constants'
import StringRow from './StringRow'
import utils, { translate } from '../utils/utils'
import MessageList from './MessageList'

import PageView from './PageView'
import platformStyles from '../styles/platform'
import {
  ListView,
  Text,
  StyleSheet,
  View,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'

import SearchBar from './SearchBar'

const FORM_REQUEST = 'tradle.FormRequest'
const REMEDIATION = 'tradle.Remediation'

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
    var content =
      <ListView ref='listview' style={styles.listview}
        dataSource={this.state.dataSource}
        removeClippedSubviews={false}
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
});

module.exports = StringChooser;
