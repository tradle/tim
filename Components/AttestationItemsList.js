import React, { Component } from 'react'
import {
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native'
import _ from 'lodash'
import PropTypes from 'prop-types'
import Reflux from 'reflux'
import reactMixin from 'react-mixin'

import Icon from 'react-native-vector-icons/Ionicons';

import utils, { translate } from '../utils/utils'
import ENV from '../utils/env'

import { TYPE, ROOT_HASH } from '@tradle/constants'

import { circled } from '../styles/utils'
import platformStyles from '../styles/platform'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'

const ATTESTATION_ITEM = 'tradle.AttestationItems'

class AttestationItemsList extends Component {
  constructor(props) {
    super(props);

    var dataSource = new ListView.DataSource({
      rowHasChanged: (row1, row2) => {
        if (row1 !== row2)
          return true
        if (utils.isEmpty(this.props.reviewed))
          return false
        let row1reviewed = false
        let row2reviewed = false
        for (var rId in this.props.reviewed) {
          if (this.props.reviewed[rId] === row1)
            row1reviewed = true
          else (this.props.reviewed[rId] === row2)
            row2reviewed = true
        }
        return row2reviewed || row1reviewed
      }
    });

    this.state = {
      list: props.list || [],
      products: [],
      resource: this.props.resource,
      dataSource: props.list &&  dataSource.cloneWithRows(props.list) || dataSource,
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var currentRoutesLength = currentRoutes.length;
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.done.bind(this)
  }
  done() {
    let { resource, reviewed, navigator } = this.props
    const numReviewed = Object.keys(reviewed).length
    const numItems = this.state.list.length
    let isAll = numReviewed === numItems
    let msg1 = isAll
             ? translate('youReviewedAll', numReviewed)
             : translate('youReviewed', numReviewed, numItems)
    // if (!isAll) {
    //   Alert.alert(msg1)
    //   return
    // }
    let msg2 = isAll
             ? translate('confirmAllItems', numItems)
             : translate('areYouSureYouWantToConfirmAllItems', numItems)


    Alert.alert(
      msg1,
      msg2,
      [
        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
        {text: translate('OK'), onPress: this.writeNotes.bind(this)}
        // {text: translate('OK'), onPress: this.processReviewed.bind(this)}
      ]
    )
  }

  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  processReviewed() {
    let { reviewed, resource, navigator } = this.props
    Actions.addChatItem({
      value: {_documentCreated: true},
      resource,
      meta: utils.getModel(resource[TYPE]),
      reviewed
    })
    navigator.pop();
  }
  onAction(params) {
    let { to, action, list, products, resource, requestForRefresh } = params
    if (!resource || resource[TYPE] !== ATTESTATION_ITEM)
      return
    // if (!to)
    //   to = resource.to  &&  resource.to.organization
    // if (utils.getId(to) !== utils.getId(this.props.to))
    //   return
    if (!list)
      list = this.state.list
    if (!products)
      products = this.state.products
    let { reviewed } = this.props
    if (action === 'refresh');
    else if (action === 'updateItem') {
      let idx = _.findIndex(list, (r) => r[ROOT_HASH] === resource[ROOT_HASH])
      list.splice(idx, 1, resource)
    }
    else if (action === 'addItem') {
      let idx = _.findIndex(list, (r) => (r[TYPE] === resource[TYPE]  &&  (!r[ROOT_HASH] || r[ROOT_HASH] === r[ROOT_HASH])))
      reviewed[idx] = resource
      list.splice(idx, 1, resource)
    }
    else
      return
    this.setState({
      list,
      resource: requestForRefresh || this.state.resource,
      products,
      dataSource: this.state.dataSource.cloneWithRows(list)
    })
  }
  renderRow(resource, sectionId, rowId)  {
    const { bankStyle, reviewed } = this.props
    let requestForRefresh = this.state.resource

    if (!reviewed[rowId]) {
      if (requestForRefresh._forms) {
        let f = requestForRefresh._forms.find(r => r.hash === resource[ROOT_HASH])
        if (f)
          reviewed[rowId] = resource
      }
    }

    let dn = utils.getDisplayName({ resource: resource.item })
    let reviewedOrNew
    if (reviewed[rowId]) {
      let backgroundColor = resource.confirmation && bankStyle.linkColor || '#d95067'
      reviewedOrNew = <View style={[styles.checkButton, {backgroundColor}]}><Icon name='ios-checkmark' size={30} color='#ffffff' style={{marginHorizontal: 10}} /></View>
    }

    return (
      <TouchableOpacity onPress={this.selectResource.bind(this, resource, rowId)}  key={rowId} style={[styles.viewStyle, {backgroundColor: '#f5f5f5'}]}>
        <View style={styles.row}>
          <View style={{flexDirection: 'column', flex: 1}}>
            <Text style={styles.modelTitle}>{translate(utils.getModel(utils.getType(resource.item)))}</Text>
            <Text style={[styles.resourceTitle, {color: bankStyle.linkColor}]}>{dn}</Text>
          </View>
          {reviewedOrNew}
        </View>
      </TouchableOpacity>
    )
  }

  writeNotes() {
    let { bankStyle, resource, navigator } = this.props
    let item = resource.prefill
    item.to = resource.from
    item.from = utils.getMe()
    let model = utils.getModel(item[TYPE])
    navigator.push({
      title: translate(model),
      componentName: 'NewResource',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Confirm',
      passProps: {
        model,
        bankStyle,
        resource: item,
        action: (value) => {
          debugger
          // reviewed[rowId] = {...resource, ...value}

          // let list = this.state.list
          // list.splice(rowId, 1, reviewed[rowId])
          // this.setState({
          //   // list: newList,
          //   dataSource: this.state.dataSource.cloneWithRows(list) //(this.state.list)
          // })
          navigator.pop()
        }
      }
    })
  }
  submitAllForms() {
    let { reviewed, resource, to } = this.props

    utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.addAll({resource, to, reviewed: reviewed && Object.values(reviewed), message: translate('confirmedMyData')})
    });
    this.props.navigator.pop()
  }
  async selectResource(resource, rowId) {
    const { navigator, bankStyle, currency } = this.props
    let model = utils.getModel(resource[TYPE])
    let title = translate(model)
    navigator.push({
      title,
      backButtonTitle: 'Back',
      componentName: 'MessageView',
      rightButtonTitle: 'Confirm',
      // parentMeta: model,
      passProps: {
        bankStyle,
        resource: resource.item,
        currency,
        isReview: true,
        action: () => {
          Alert.alert(
            'Please confirm or deny the correctness of the information',
            null,
            [
              {text: translate('reject'), onPress: () => this.rejectAccept({resource, rowId, deny: true})},
              {text: translate('accept'), onPress: () => this.rejectAccept({resource, rowId, confirm: true})}
            ]
          )
        }
      }
    });
  }
  rejectAccept({resource, rowId, confirm, deny}) {
    // debugger
    let { reviewed, navigator } = this.props
    reviewed[rowId] = resource
    resource.confirmation = confirm && true || false
    this.setState({
      // list: newList,
      dataSource: this.state.dataSource.cloneWithRows(this.state.list)
    })
    navigator.pop()
  }
  render() {
    return (
      <View style={[platformStyles.container, {borderTopColor: this.props.bankStyle.linkColor, borderTopWidth: StyleSheet.hairlineWidth}]}>
        <ListView ref='listview'
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          enableEmptySections={true}
          removeClippedSubviews={false}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false} />
      </View>
    );
  }

}
reactMixin(AttestationItemsList.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  modelTitle: {
    flexWrap: 'wrap',
    fontSize: 20,
    fontWeight: '400',
    color: '#757575',
    marginHorizontal: 10
  },
  resourceTitle: {
    fontSize: 16,
    color: '#aaaaaa',
    flexWrap: 'wrap',
    marginHorizontal: 10
  },
  viewStyle: {
    marginVertical: StyleSheet.hairlineWidth,
    backgroundColor: '#f5f5f5'
  },
  row: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row'
  },
  checkButton: {
    ...circled(30),
    shadowOpacity: 0.7,
    opacity: 0.9,
    shadowRadius: 5,
    shadowColor: '#afafaf',
    // backgroundColor: '#62C457',
    alignItems: 'center'
  },
})

module.exports = AttestationItemsList;


