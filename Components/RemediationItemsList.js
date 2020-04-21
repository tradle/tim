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
import OnePropFormMixin from './OnePropFormMixin'

const FORM = 'tradle.Form'
const PHOTO = 'tradle.Photo'
const IPROOV_SELFIE = 'tradle.IProovSelfie'

class RemediationItemsList extends Component {
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
        {text: translate('OK'), onPress: this.submitAllForms.bind(this)}
        // {text: translate('OK'), onPress: this.processReviewed.bind(this)}
      ]
    )
  }

  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  componentWillMount() {
    const { isRefresh, resource, to } = this.props
    if (!isRefresh)
      return
    Actions.list({modelName: FORM, to, isRefresh, originalResource: this.props.resource, resource})
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
    let { to, action, list, products, resource, isRefresh, requestForRefresh } = params
    if (!isRefresh  &&  (!resource  ||  !resource._dataBundle))
      return
    if (!to)
      to = resource.to  &&  resource.to.organization
    if (utils.getId(to) !== utils.getId(this.props.to))
      return
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
    let isNewForm = !resource[ROOT_HASH]

    if (!reviewed[rowId]) {
      if (requestForRefresh._forms) {
        let f = requestForRefresh._forms.find(r => r.hash === resource[ROOT_HASH])
        if (f)
          reviewed[rowId] = resource
      }
    }

    let dn
    if (isNewForm) {
      let products = this.state.products.filter(p => {
        if (p[ROOT_HASH]  &&  resource._context)
          return (utils.getId(p) === resource._context.id)
        return true
      })
      if (products.length)
        dn = utils.makeModelTitle(products[0].requestFor)
    }
    else
      dn = utils.getDisplayName({ resource })
    let reviewedOrNew
    if (reviewed[rowId])
      reviewedOrNew = <View style={[styles.checkButton, {backgroundColor: bankStyle.linkColor}]}><Icon name='ios-checkmark' size={30} color='#ffffff' style={{marginHorizontal: 10}} /></View>
    else if (isNewForm)
      reviewedOrNew = <View style={{justifyContent: 'center'}}><Text style={{color:bankStyle.linkColor, fontWeight: '600', fontStyle: 'italic', marginHorizontal: 10}}>New</Text></View>

    return (
      <TouchableOpacity onPress={this.selectResource.bind(this, resource, rowId)}  key={rowId} style={[styles.viewStyle, {backgroundColor: isNewForm ? '#efffff' : '#f5f5f5'}]}>
        <View style={styles.row}>
          <View style={{flexDirection: 'column', flex: 1}}>
            <Text style={styles.modelTitle}>{translate(utils.getModel(resource[TYPE]))}</Text>
            <Text style={[styles.resourceTitle, {color: bankStyle.linkColor}]}>{dn}</Text>
          </View>
          {reviewedOrNew}
        </View>
      </TouchableOpacity>
    )
  }

  submitAllForms() {
    let { reviewed, resource, to } = this.props

    utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.addAll({resource, to, reviewed: reviewed && Object.values(reviewed), message: translate('confirmedMyData')})
    });
    this.props.navigator.pop()
  }
  async selectResource(resource, rowId) {
    const { navigator, bankStyle, currency, reviewed } = this.props
    let model = utils.getModel(resource[TYPE])
    let title = translate(model)
    let onePropHandler = this.getOnePropHandler(resource, rowId)
    if (onePropHandler) {
      return onePropHandler()
      .then(result => {
        if (!result)
          return
        reviewed[rowId] = resource
        this.setState({
          // list: newList,
          dataSource: this.state.dataSource.cloneWithRows(this.state.list)
        })
        // navigator.pop()
        return
      })
    }
    if (model.notEditable  &&  resource[ROOT_HASH]) {
      navigator.push({
        title: title,
        backButtonTitle: 'Back',
        componentName: 'MessageView',
        rightButtonTitle: 'Confirm',
        // parentMeta: model,
        passProps: {
          bankStyle: bankStyle,
          resource: resource,
          currency: currency,
          isReview: true,
          action: () => {
            // let newList = utils.clone(this.state.list)
            Actions.addChatItem({resource: resource, isRefresh: true})
            reviewed[rowId] = resource
            this.setState({
              // list: newList,
              dataSource: this.state.dataSource.cloneWithRows(this.state.list)
            })
            navigator.pop()
          }
        }
      });
    }
    else {
      navigator.push({
        title: title,
        componentName: 'NewResource',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Confirm',
        passProps: {
          model,
          bankStyle,
          resource,
          isRefresh: true,
          currency: currency || this.state.currency,
          action: (value) => {
            reviewed[rowId] = {...resource, ...value}

            let list = this.state.list
            list.splice(rowId, 1, reviewed[rowId])
            this.setState({
              // list: newList,
              dataSource: this.state.dataSource.cloneWithRows(list) //(this.state.list)
            })
            navigator.pop()
          }
        }
      })
    }

  }
  getOnePropHandler(resource) {
    if (resource[ROOT_HASH])
      return
    let props = utils.getEditableProperties(resource)
    if (!props || props.length !== 1)
      return
    let prop = props[0]
    if (prop.scanner === 'payment-card') {
      if (!utils.isWeb())
        return this.scanPaymentCard.bind(this, {prop})
      return
    }
    // if (prop.signature)
      // return this.onSetSignatureProperty.bind(this)
    if (prop.ref === PHOTO  &&  !prop.signature) {
      let useImageInput
      const isScan = prop.scanner //  &&  prop.scanner === 'id-document'
      if (utils.isWeb())
        useImageInput = isScan || !ENV.canUseWebcam || prop.allowPicturesFromLibrary
      else
        useImageInput = utils.isSimulator()  ||  (prop.allowPicturesFromLibrary  &&  !isScan)

      if (useImageInput)
        return this.onSetMediaProperty.bind(this, prop.name, resource)
      else
        return this.showCamera.bind(this, {prop: prop, resource})
    }
    if (resource[TYPE] === IPROOV_SELFIE)
      return this.showIproovScanner.bind(this, prop, prop.name)
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
reactMixin(RemediationItemsList.prototype, Reflux.ListenerMixin);

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
reactMixin(RemediationItemsList.prototype, OnePropFormMixin);

module.exports = RemediationItemsList;


