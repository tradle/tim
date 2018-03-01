console.log('requiring StringChooser.js')
'use strict';

import React, { Component } from 'react'
import equal from 'deep-equal'
import constants from '@tradle/constants'
var { TYPE, ROOT_HASH } = constants
import utils, { translate } from '../utils/utils'
import ResourceRow from './ResourceRow'
import ResourceView from './ResourceView'
import VerificationRow from './VerificationRow'
import MessageView from './MessageView'

import PageView from './PageView'
import platformStyles from '../styles/platform'
import {
  ListView,
  Text,
  StyleSheet,
  View,
  Platform
} from 'react-native'


class SimpleResourceList extends Component {
  constructor(props) {
    super(props);
    var dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      strings: props.strings,
      dataSource: dataSource.cloneWithRows(props.list),
    };
  }

  selectResource(resource) {
    let title = utils.makeModelTitle(resource[TYPE])
    let { navigator, bankStyle } = this.props

    if (utils.isMessage(resource)) {
      navigator.push({
        title: title,
        id: 5,
        component: MessageView,
        backButtonTitle: 'Back',
        passProps: {
          resource: resource,
          bankStyle: bankStyle
        }
      })
    }
    else {
      navigator.push({
        title: title,
        id: 3,
        component: ResourceView,
        // titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        passProps: {
          resource: resource
        }
      });
    }
  }
  renderRow(resource)  {
    let { navigator, bankStyle } = this.props
    if (utils.isMessage(resource))
      return (<VerificationRow
                onSelect={() => this.selectResource(resource)}
                key={resource[ROOT_HASH]}
                modelName={resource[TYPE]}
                navigator={navigator}
                resource={resource} />
              )
    else
      return (
        <ResourceRow
          onSelect={() => this.selectResource(resource)}
          title={utils.makeModelTitle(resource[TYPE])}
          bankStyle={bankStyle}
          navigator={navigator}
          resource={resource}
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

module.exports = SimpleResourceList;
