'use strict';

var React = require('react-native');
var NewResource = require('./NewResource');
var utils = require('../utils/utils');
var reactMixin = require('react-mixin');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('tradle-constants');
var MessageList = require('./MessageList')
var {
  ListView,
  Text,
  Component,
  StyleSheet,
  View,
} = React;


class ProductChooser extends Component {
  constructor(props) {
    super(props);

    var products = []

    var orgProducts = this.props.resource.products
    if (orgProducts) {
      orgProducts.forEach(function(m) {
        products.push(utils.getModel(m.modelName).value)
      })

    }
    else
      products = utils.getAllSubclasses('tradle.FinancialProduct');

    var dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      products: products,
      modelName: 'tradle.FinancialProduct',
      dataSource: dataSource.cloneWithRows(products),
    };
  }
  componentDidMount() {
    this.listenTo(Store, 'onNewProductAdded');
  }
  onNewProductAdded(params) {
    if (params.action !== 'newProductAdded')
      return;
    if (params.err)
      this.setState({err: params.err});
    else {
      var products = this.state.products;
      products.push(params.newModel);
      this.setState({
        products: products,
        dataSource: this.state.dataSource.cloneWithRows(this.state.products),
      });
    }
  }

  selectResource(resource) {
    var route = {
      component: MessageList,
      backButtonTitle: 'Back',
      id: 11,
      title: this.props.resource.name,
      passProps: {
        resource: this.props.resource,
        filter: '',
        modelName: 'tradle.Message',
      },
    }
    var msg = {
      message: '[application for](' + resource.id + ')',
      _t: constants.TYPES.SIMPLE_MESSAGE,
      from: utils.getMe(),
      to: this.props.resource,
      time: new Date().getTime()
    }

    Actions.addMessage(msg, true, true)
    this.props.navigator.pop();

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
        navigator={this.props.navigator}
        to={this.props.resource} />
      );
  }
  render() {
    var content =
    <ListView ref='listview' style={styles.listview}
      dataSource={this.state.dataSource}
      renderRow={this.renderRow.bind(this)}
      automaticallyAdjustContentInsets={false}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps={true}
      showsVerticalScrollIndicator={false} />;

    var err = this.state.err
            ? <View style={styles.errContainer}><Text style={styles.err}>{this.state.err}</Text></View>
            : <View />;
    return (
      <View style={styles.container}>
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
