import React, { Component } from 'react'

import {
  ListView,
  Text,
  StyleSheet,
  View,
  AlertIOS
} from 'react-native'
import PropTypes from 'prop-types'
import reactMixin from 'react-mixin'
import Reflux from 'reflux'
import constants from '@tradle/constants'

import MessageTypeRow from './MessageTypeRow'
import utils from '../utils/utils'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'

class ResourceTypesScreen extends Component {
  constructor(props) {
    super(props);
    var implementors = utils.getImplementors(this.props.modelName, [constants.TYPES.FINANCIAL_PRODUCT, constants.TYPES.FORM, constants.TYPES.ADDITIONAL_INFO]);

    // delete implementors[constants.TYPES.ADDITIONAL_INFO]

    var dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      implementors: implementors,
      dataSource: dataSource.cloneWithRows(implementors),
      newModelAdded: false
    };
  }
  componentDidMount() {
    this.listenTo(Store, 'onNewModelAdded');
  }
  onNewModelAdded(params) {
    if (params.action !== 'newModelAdded')
      return;
    if (params.err)
      this.setState({err: params.err});
    else {
      var implementors = this.state.implementors;
      implementors.push(params.newModel);
      this.setState({
        implementors: implementors,
        dataSource: this.state.dataSource.cloneWithRows(this.state.implementors),
      });
    }
  }
  selectResource(resource) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    if (resource[constants.TYPE])
      return;
    if (this.props.sendForm) {
      var buttons = [{
        text: 'Cancel',
      },
      {
        text: 'OK',
        onPress: this.sendFormTo.bind(this, resource)
      }];
      var to = this.props.resource;
      AlertIOS.prompt(
        'Sending ' + resource.title + ' form to ' + utils.getDisplayName(to),
        buttons
      );
      return;
    }
    var page = {
      model: utils.getModel(resource.id),
      resource: {
        'from': utils.getMe(),
        'to': this.props.resource
      }
    };
    page.resource[constants.TYPE] = this.props.modelName;

    if (this.props.returnRoute)
      page.returnRoute = this.props.returnRoute;
    if (this.props.callback)
      page.callback = this.props.callback;
    this.props.navigator.replace({
      title: resource.title,
      rightButtonTitle: 'Done',
      backButtonTitle: 'Back',
      componentName: 'NewResource',
      titleTextColor: '#7AAAC3',
      passProps: page
    });
  }

  sendFormTo(model, msg) {
    var me = utils.getMe();
    var resource = {from: utils.getMe(), to: this.props.resource};
    // var model = utils.getModel(this.props.modelName);

    var toName = utils.getDisplayName(resource.to);
    var meName = utils.getDisplayName(me);
    var modelName = constants.TYPES.SIMPLE_MESSAGE;
    var value = {
      message: '[' + msg + '](' + model.id + ')',
      from: me,
      to: resource.to,
      time: new Date().getTime()
    }
    value[constants.TYPE] = modelName;
    Actions.addMessage({msg: value});
    this.props.navigator.pop();
  }

  renderRow(resource)  {
    var model = utils.getModel(resource[constants.TYPE] || resource.id);

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
      removeClippedSubviews={false}
      renderRow={this.renderRow.bind(this)}
      automaticallyAdjustContentInsets={false}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps="always"
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
reactMixin(ResourceTypesScreen.prototype, Reflux.ListenerMixin);

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

module.exports = ResourceTypesScreen;
