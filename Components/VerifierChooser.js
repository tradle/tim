'use strict';

var ResourceRow = require('./ResourceRow');
var MessageList = require('./MessageList');
var PageView = require('./PageView')
var utils = require('../utils/utils');
var translate = utils.translate
var reactMixin = require('react-mixin');
var extend = require('extend')
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
var buttonStyles = require('../styles/buttonStyles');
var NetworkInfoProvider = require('./NetworkInfoProvider')
var defaultBankStyle = require('../styles/bankStyle.json')
var StyleSheet = require('../StyleSheet')

const PRODUCT_APPLICATION = 'tradle.ProductApplication'

import React, { Component, PropTypes } from 'react'
import {
  ListView,
  // StyleSheet,
  Navigator,
  Alert,
  // AlertIOS,
  // ActionSheetIOS,
  TouchableOpacity,
  StatusBar,
  View,
  Text,
  Platform
} from 'react-native';

import platformStyles from '../styles/platform'
import ENV from '../utils/env'

const SearchBar = Platform.OS === 'android' ? null : require('react-native-search-bar')

class VerifierChooser extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
  };
  constructor(props) {
    super(props);

    let v = props.originatingMessage.verifiers.map((rr) => {
      let p = rr.provider.id.split('_')
      return {
        [constants.TYPE]: p[0],
        [constants.ROOT_HASH]: p[1],
        name: rr.provider.title,
        photos: rr.provider.photo ? [rr.provider.photo] : null
      }
    })

    let dataSource = new ListView.DataSource({
        rowHasChanged: function(row1, row2) {
          return row1 !== row2 || row1._online !== row2._online
        }
      })

    this.state = {
      isLoading: true,
      dataSource: dataSource.cloneWithRows(v),
      isConnected: this.props.navigator.isConnected,
    };
  }
  componentWillUnmount() {
    if (this.props.navigator.getCurrentRoutes().length === 1)
      StatusBar.setHidden(true)
  }
  componentWillMount() {
    // let v = this.props.originatingMessage.verifiers.map((rr) => rr.provider.id)

    // utils.onNextTransitionEnd(this.props.navigator, () => {
    //   Actions.list({modelName: this.props.modelName, list: v})
    //   StatusBar.setHidden(false);
    // });
  }

  componentDidMount() {
    this.listenTo(Store, 'onListUpdate');
  }

  onListUpdate(params) {
    var action = params.action;
    if (action !== 'filteredList')
      return

    var list = params.list;
    if (!list.length) {
      this.setState({isLoading: false})
      return;
    }
    let state = {
      dataSource: this.state.dataSource.cloneWithRows(list),
      list: list,
      isLoading: false,
    }

    this.setState(state)
  }

  renderRow(resource)  {
    return <ResourceRow
              onSelect={() => this.showVerifier(resource)}
              isChooser={true}
              navigator={this.props.navigator}
              resource={resource} />
  }
  render() {
    var model = utils.getModel(this.props.modelName).value;
    var content = <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}
          initialListSize={10}
          pageSize={20}
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />;

    return (
      <PageView style={platformStyles.container}>
        <NetworkInfoProvider connected={this.state.isConnected} />
        <View style={styles.separator} />
        {content}
      </PageView>
    );
  }
  showVerifier(resource) {
    let provider = this.props.provider
    let rId = utils.getId(resource)
    let formRequest = this.props.originatingMessage
    let product
    formRequest.verifiers.forEach((r) => {
      if (utils.getId(r.provider) === rId)
        product = r.product
    })
    let msg = {
      [constants.TYPE]: PRODUCT_APPLICATION,
      product: product,
      from: utils.getMe(),
      to:   resource
    }
    let form = formRequest.formResource

    form.from = utils.getMe()
    form.to = resource

    utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.addMessage(msg, true, true, (r) => {
        form._context = r
        setTimeout(() => Actions.addItem({
          resource: form,
          value: form
        }), 500)
      })
    })
    this.props.navigator.replace({
      title: resource.name,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        modelName: constants.TYPES.MESSAGE,
        currency: this.props.currency,
        bankStyle:  this.props.bankStyle,
        // returnChat: provider,
        originatingMessage: formRequest
      }
    })
  }
}
reactMixin(VerifierChooser.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  }
});

module.exports = VerifierChooser;
