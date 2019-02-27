
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
  static propTypes = {
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
    if (!this.props.isReplace  &&  !this.props.notModel)
      this.props.navigator.pop();
    this.props.callback(modelId)
  }
  renderRow(product)  {
    if (typeof product === 'string')
      product = { product }
    let { id, title, description } = product
    if (!this.props.notModel) {
      let model = utils.getModel(id)
      if (!model)
        return null
      if (!title)
        title = translate(model)
    }
    return (
      <StringRow
        onSelect={() => this.selectResource(id)}
        title={title}
        description={description}
        bankStyle={this.props.bankStyle}
        navigator={this.props.navigator}
        callback={() => this.selectResource(id)}
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
