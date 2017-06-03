'use strict';

var NewResource = require('./NewResource');
var utils = require('../utils/utils');
var translate = utils.translate
var equal = require('deep-equal')
var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
var MessageList = require('./MessageList')
var PageView = require('./PageView')
import platformStyles from '../styles/platform'

const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const FORM_REQUEST = 'tradle.FormRequest'
const REMEDIATION = 'tradle.Remediation'
import {
  ListView,
  Text,
  StyleSheet,
  View,
  Platform
} from 'react-native'

const SearchBar = Platform.OS === 'android' ? null : require('react-native-search-bar')
import React, { Component } from 'react'

class ProductChooser extends Component {
  constructor(props) {
    super(props);

    var products = []
    var orgProducts = this.props.resource.products
    if (orgProducts) {
      orgProducts.forEach(function(m) {
        products.push(getModel(m))
      })
    }
    else if (this.props.products) {
      this.props.products.forEach((p) => {
        if (p.subClassOf === constants.TYPES.FINANCIAL_PRODUCT)
          products.push(p)
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
    let r = this.props.resource
    let id = r[constants.TYPE] === constants.TYPES.PROFILE  ||  r[constants.TYPE] === PRODUCT_APPLICATION
           ? utils.getId(utils.getMe().organization)
           : utils.getId(r)
    Actions.getItem(id)
  }
  componentDidMount() {
    this.listenTo(Store, 'onNewProductAdded');
  }
  onNewProductAdded(params) {
    let products = []
    if (params.action === 'getItem') {
      if (this.props.resource[constants.ROOT_HASH] === params.resource[constants.ROOT_HASH]) {
        if (params.resource.products) {
          if (equal(params.resource.products, this.props.resource.products))
            return

          products = params.resource.products.map(getModel)
        }
      }
      else if (this.props.resource[constants.TYPE] === constants.TYPES.PROFILE   ||
               this.props.resource[constants.TYPE] === PRODUCT_APPLICATION) {
        if (this.props.context  &&  this.props.context.product !== REMEDIATION) {
          const productModel = utils.getModel(this.props.context.product).value
          products = getForms(productModel)
        }
        else if (params.resource.products  &&  params.resource.products.length) {
          products = params.resource.products
            .map(getModel)
            .map(getForms)
            .reduce((all, batch) => all.concat(batch))

          products = uniqueModels(products)
        }
        else
          products = utils.getAllSubclasses(constants.TYPES.FORM)
      }
      else
        return
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
    products = params.productList;

    this.setState({
      products: products,
      dataSource: this.state.dataSource.cloneWithRows(products),
    });
  }
  onSearchChange(filter) {
    let vals = this.state.products
    let list = vals.filter((s) => {
      return s.title.indexOf(filter) === -1 ? false : true
    })
    this.setState({filter: filter, dataSource: this.state.dataSource.cloneWithRows(list)})
  }

  selectResource(model) {
    var route = {
      component: MessageList,
      backButtonTitle: 'Back',
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
    if (this.props.context)
      msg._context = this.props.context
    if (model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT) {
      msg[constants.TYPE] = PRODUCT_APPLICATION
      msg.product = model.id // '[application for](' + model.id + ')',
      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg, requestForForm: true}))
    }
    else {
      msg[constants.TYPE] =  FORM_REQUEST,
      msg.message = model.formRequestMessage
                  ? translate(model.formRequestMessage)
                  : translate('fillTheForm', translate(utils.makeModelTitle(model)))
          // translate(model.properties.photos ? 'fillTheFormWithAttachments' : 'fillTheForm', translate(model.title)),
      // product: productModel.id,
      msg.form = model.id
      // msg._t = constants.TYPES.SIMPLE_MESSAGE
      // msg.message = '[' + (model.properties.photos ? translate('fillTheFormWithAttachments') : translate('fillTheForm')) + '](' + model.id + ')'
      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg}))
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
      rightButtonTitle: 'Done',
      backButtonTitle: 'Back',
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
    var searchBar
    if (SearchBar  &&  this.props.type === constants.TYPES.FORM) {
      searchBar = (
        <SearchBar
          onChangeText={this.onSearchChange.bind(this)}
          placeholder={translate('search')}
          showsCancelButton={false}
          hideBackground={true}
          />
      )
    }
    var style = [styles.listview]
    if (searchBar)
      style.push({marginTop: 0, borderTopColor: '#cccccc', borderTopWidth: StyleSheet.hairlineWidth})
    var content =
      <ListView ref='listview' style={style}
        dataSource={this.state.dataSource}
        removeClippedSubviews={true}
        initialListSize={100}
        renderRow={this.renderRow.bind(this)}
        enableEmptySections={true}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false} />;

  var err = this.state.err
            ? <View style={styles.errContainer}><Text style={styles.err}>{this.state.err}</Text></View>
            : <View />;
    var bgStyle = this.props.bankStyle  &&  this.props.bankStyle.backgroundColor ? {backgroundColor: this.props.bankStyle.backgroundColor} : {backgroundColor: '#ffffff'}
      // <View style={[styles.container, bgStyle]}>
    return (
      <PageView style={[styles.container, bgStyle, searchBar ? {marginTop: 64} : {marginTop: 0}]}>
        {err}
        {searchBar}
        {content}
      </PageView>
    );
  }
}

function getModel (id) {
  return utils.getModel(id).value
}

function getForms (model) {
  const allForms = model.forms.concat(model.additionalForms || [])
  return allForms.map(getModel)
}

reactMixin(ProductChooser.prototype, Reflux.ListenerMixin);

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

function uniqueModels (models) {
  const byId = {}
  models.forEach(model => byId[model.id] = model)
  return Object.keys(byId).map(id => byId[id])
}

module.exports = ProductChooser;
