console.log('requiring StringChooser.js')
'use strict';

import React, { Component } from 'react'
import _ from 'lodash'
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

class StringChooser extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    strings: PropTypes.array.isRequired,
    bankStyle: PropTypes.object,
    callback: PropTypes.func.isRequired
  };
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
    if (!this.props.isReplace)
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
      <ListView ref='listview' style={platformStyles.container}
        dataSource={this.state.dataSource}
        removeClippedSubviews={false}
        initialListSize={100}
        renderRow={this.renderRow.bind(this)}
        enableEmptySections={true}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false} />;
    var bgStyle
    if (this.props.bankStyle  &&  this.props.bankStyle.backgroundColor)
      bgStyle = {backgroundColor: this.props.bankStyle.backgroundColor}
    else
      bgStyle = {backgroundColor: '#ffffff'}
      // <View style={[styles.container, bgStyle]}>
    return (
      <PageView style={[styles.container, bgStyle, platformStyles.navBarMargin]}>
        {content}
      </PageView>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // listview: {
  //   marginTop: 64,
  //   borderWidth: 0,
  //   marginHorizontal: -1,
  //   borderBottomWidth: StyleSheet.hairlineWidth,
  //   borderColor: '#ffffff',
  // },
});

module.exports = StringChooser;
