
import ResourceRow from './ResourceRow'
import MessageList from './MessageList'
import PageView from './PageView'
import utils from '../utils/utils'
import reactMixin from 'react-mixin'
import extend from 'extend'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import Reflux from 'reflux'
import constants from '@tradle/constants'
var {
  TYPE
} = constants
var {
  ORGANIZATION,
  MESSAGE,
  PROFILE
} = constants.TYPES
import NetworkInfoProvider from './NetworkInfoProvider'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import StyleSheet from '../StyleSheet'
import TimerMixin from 'react-timer-mixin'

const PRODUCT_REQUEST = 'tradle.ProductRequest'

import React, { Component } from 'react'
import {
  ListView,
  StatusBar,
  View,
} from 'react-native'
import PropTypes from 'prop-types';

import platformStyles from '../styles/platform'

const SETTINGS = 'tradle.Settings'

class VerifierChooser extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
  };
  constructor(props) {
    super(props);

    let v = props.originatingMessage.verifiers.map((rr) => {
      let p = rr.provider ? rr.provider.split('_') : [ORGANIZATION]
      return {
        [TYPE]: p[0],
        // [ROOT_HASH]: p[1],
        name: rr.name,
        url: rr.url,
        photos: [{url: rr.photo}],
        botId: utils.makeId(PROFILE, rr.permalink)
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
    var content = <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps="always"
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
    const formRequest = this.props.originatingMessage
    const verifier = formRequest.verifiers.find(r => {
      return r.name === resource.name  &&  utils.urlsEqual(r.url, resource.url)
    })

    Actions.addItem({
      meta: utils.getModel(SETTINGS),
      resource: {
        [TYPE]: SETTINGS,
        url: resource.url,
        id: verifier.id,
        botId: utils.makeId(PROFILE, verifier.permalink)
      },
      cb: (r) => this.verifyByTrustedProvider(r, verifier.product)
    })
  }
  verifyByTrustedProvider(resource, product) {
    // let provider = this.props.provider
    let msg = {
      [TYPE]: PRODUCT_REQUEST,
      product: product,
      from: utils.getMe(),
      to:   resource
    }
    let form = this.props.originatingMessage.formResource

    form.from = utils.getMe()
    form.to = resource

    utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.addMessage({msg: msg, isWelcome: true, disableAutoResponse: true, requestForForm: true, cb: (r) => {
        form._context = r
        this.setTimeout(() => Actions.addChatItem({
          resource: form,
          value: form,
          // disableFormRequest: this.props.originatingMessage
        }), 500)
      }})
    })
    let bankStyle
    if (resource.bankStyle) {
      bankStyle = {}
      extend(bankStyle, defaultBankStyle)
      extend(bankStyle, resource.bankStyle)
    }
    else
      bankStyle = defaultBankStyle

    this.props.navigator.replace({
      title: resource.name,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        modelName: MESSAGE,
        currency: this.props.currency,
        bankStyle:  bankStyle,
        // returnChat: provider,
        originatingMessage: this.props.originatingMessage
      }
    })
  }
}
reactMixin(VerifierChooser.prototype, Reflux.ListenerMixin)
reactMixin(VerifierChooser.prototype, TimerMixin)

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  }
});

module.exports = VerifierChooser;
