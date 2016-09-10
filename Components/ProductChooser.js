'use strict';

var NewResource = require('./NewResource');
var utils = require('../utils/utils');
var translate = utils.translate
var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
var MessageList = require('./MessageList')
// var SearchBar = require('react-native-search-bar');

const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const FORM_REQUEST = 'tradle.FormRequest'
import {
  ListView,
  Text,
  StyleSheet,
  View,
} from 'react-native'

import React, { Component } from 'react'

class ProductChooser extends Component {
  constructor(props) {
    super(props);

    var products = []
    var orgProducts = this.props.resource.products
    if (orgProducts) {
      orgProducts.forEach(function(m) {
        products.push(utils.getModel(m).value)
      })

    }
    else {
      var productList = utils.getAllSubclasses(constants.TYPES.FINANCIAL_PRODUCT);
      productList.slice(0, 2)
      productList.forEach(function(m) {
        if (m.forms)
          products.push(m)
      })
    }

    var dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      products: products,
      modelName: constants.TYPES.FINANCIAL_PRODUCT,
      dataSource: dataSource.cloneWithRows(products),
    };
  }
  componentWillMount() {
    Actions.getItem(utils.getId(this.props.resource))
  }
  componentDidMount() {
    this.listenTo(Store, 'onNewProductAdded');
  }
  onNewProductAdded(params) {
    if (params.action === 'getItem'  &&  this.props.resource[constants.ROOT_HASH] === params.resource[constants.ROOT_HASH]) {
      let products
      if (params.resource.products) {
        products = []
        params.resource.products.forEach(function(m) {
          products.push(utils.getModel(m).value)
        })
      }
      else
        products = utils.getAllSubclasses(constants.TYPES.FORM)

      this.setState({
        products: products,
        dataSource: this.state.dataSource.cloneWithRows(products),
      })
      return
    }
    if (params.action !== 'productList' || params.resource[constants.ROOT_HASH] !== this.props.resource[constants.ROOT_HASH])
      return;
    if (params.err) {
      this.setState({err: params.err});
      return
    }
    var products = params.productList;

    this.setState({
      products: products,
      dataSource: this.state.dataSource.cloneWithRows(products),
    });
  }

  selectResource(model) {
    var route = {
      component: MessageList,
      backButtonTitle: translate('cancel'),
      id: 11,
      title: this.props.resource.name,
      passProps: {
        resource: this.props.resource,
        filter: '',
        modelName: constants.TYPES.MESSAGE,
      },
    }
    var msg = {
      from: utils.getMe(),
      to:   this.props.resource,
      time: new Date().getTime()
    }
    if (model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT) {
      msg[constants.TYPE] = PRODUCT_APPLICATION
      msg.product = model.id // '[application for](' + model.id + ')',
      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage(msg, true, true))
    }
    else {
      // msg[constants.TYPE] =  FORM_REQUEST,
      // msg.message = translate(model.properties.photos ? 'fillTheFormWithAttachments' : 'fillTheForm', translate(model.title)),
      // // product: productModel.id,
      // msg.form = model.id


      msg._t = constants.TYPES.SIMPLE_MESSAGE
      msg.message = '[' + (model.properties.photos ? translate('fillTheFormWithAttachments') : translate('fillTheForm')) + '](' + model.id + ')'
      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage(msg))
    }

    // var msg = {
    //   product: model.id, // '[application for](' + model.id + ')',
    //   _t:      PRODUCT_APPLICATION, // constants.TYPES.SIMPLE_MESSAGE,
    //   from:    utils.getMe(),
    //   to:      this.props.resource,
    //   time:    new Date().getTime()
    // }

    this.props.navigator.pop();
  }

  buildSimpleMsg(msg, type) {
    var sMsg = {}
    sMsg[constants.TYPE] = constants.TYPES.SIMPLE_MESSAGE
    sMsg.message = type
      ? '[' + msg + ']' + '(' + type + ')'
      : msg

    return sMsg
  }

  selectResource1(resource) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.state.modelName);

    if (resource[constants.TYPE])
      return;
    var page = {
      model: utils.getModel(resource.id).value,
    }
    if (this.props.returnRoute)
      page.returnRoute = this.props.returnRoute;
    if (this.props.callback)
      page.callback = this.props.callback;
    var me = utils.getMe()
    page.resource = {
      _t: resource.id,
      from: me,
      accountWith: this.props.resource,
      productType: model.value.title
    }
    this.props.navigator.replace({
      id: 4,
      title: resource.title,
      rightButtonTitle: translate('done'),
      backButtonTitle: translate('back'),
      component: NewResource,
      titleTextColor: '#7AAAC3',
      resource: resource,
      passProps: page
    });
  }
  renderRow(resource)  {
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var MessageTypeRow = require('./MessageTypeRow');

    return (
      <MessageTypeRow
        onSelect={() => this.selectResource(resource)}
        resource={resource}
        bankStyle={this.props.bankStyle}
        navigator={this.props.navigator}
        to={this.props.resource} />
      );
  }

  render() {
    // var sb = this.props.type === constants.TYPES.FORM
    //        ?  <SearchBar
    //             onChangeText={this.onSearchChange.bind(this)}
    //             placeholder={translate('search')}
    //             showsCancelButton={false}
    //             hideBackground={true}
    //           />
    //       : <View />

    var content =
    <ListView ref='listview' style={styles.listview}
      dataSource={this.state.dataSource}
      renderRow={this.renderRow.bind(this)}
      enableEmptySections={true}
      automaticallyAdjustContentInsets={false}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps={true}
      showsVerticalScrollIndicator={false} />;

    var err = this.state.err
            ? <View style={styles.errContainer}><Text style={styles.err}>{this.state.err}</Text></View>
            : <View />;
    var bgStyle = this.props.bankStyle  &&  this.props.bankStyle.BACKGROUND_COLOR ? {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR} : {backgroundColor: '#ffffff'}
    return (
      <View style={[styles.container, bgStyle]}>
        {err}
        {content}
      </View>
    );
  }
}
reactMixin(ProductChooser.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listview: {
    marginTop: 64,
  },
  centerText: {
    alignItems: 'center',
  },
  err: {
    color: '#D7E6ED'
  },
  errContainer: {
    height: 45,
    paddingTop: 5,
    paddingHorizontal: 10,
    backgroundColor: '#eeeeee',
  }
});

module.exports = ProductChooser;
