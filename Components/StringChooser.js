import React, { Component } from 'react'
import {
  ListView,
  Alert,
} from 'react-native'
import PropTypes from 'prop-types'

import Actions from '../Actions/Actions'
import StringRow from './StringRow'
import utils, { translate } from '../utils/utils'

import PageView from './PageView'
import platformStyles from '../styles/platform'
import { getContentSeparator } from '../utils/uiUtils'

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
    const { isReplace, notModel, showLink, callback, navigator } = this.props
    if (!isReplace  &&  !notModel)
      navigator.pop();
    if (showLink)
      Actions.getApplyForProductLink(modelId)
    else
      callback(modelId)
  }
  renderRow(product)  {
    if (typeof product === 'string')
      product = { product }
    let { id, title, description } = product
    let { notModel, forScan, bankStyle, navigator } = this.props
    let icon
    if (!notModel) {
      let model = utils.getModel(id)
      if (!model)
        return null
      if (!title)
        title = translate(model)
      icon = model.icon
    }
    return (
      <StringRow
        title={title}
        forScan={forScan}
        icon={icon}
        description={description}
        bankStyle={bankStyle}
        navigator={navigator}
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
    let contentSeparator = getContentSeparator(bankStyle)
    return (
      <PageView style={[platformStyles.container, bgStyle]} separator={contentSeparator} bankStyle={bankStyle}>
        {content}
      </PageView>
    );
  }
}

module.exports = StringChooser;
