console.log('requiring StringChooser.js')
'use strict';

import React, { Component } from 'react'
import StringRow from './StringRow'
import utils, { translate } from '../utils/utils'

import PageView from './PageView'
import platformStyles from '../styles/platform'
import {
  ListView,
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
        title={translate(model)}
        bankStyle={this.props.bankStyle}
        navigator={this.props.navigator}
        callback={() => this.selectResource(modelId)}
        />
      );
  }
  render() {
    let content =
      <ListView ref='listview'
        dataSource={this.state.dataSource}
        removeClippedSubviews={false}
        initialListSize={100}
        renderRow={this.renderRow.bind(this)}
        enableEmptySections={true}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false} />;
    let bgStyle
    let { bankStyle } = this.props
    if (bankStyle  &&  bankStyle.backgroundColor)
      bgStyle = {backgroundColor: bankStyle.backgroundColor}
    else
      bgStyle = {backgroundColor: '#ffffff'}
    let contentSeparator = utils.getContentSeparator(bankStyle)
    return (
      <PageView style={[platformStyles.container, bgStyle]} separator={contentSeparator} bankStyle={bankStyle}>
        {content}
      </PageView>
    );
  }
}

module.exports = StringChooser;
