'use strict';

var React = require('react-native');
var Q = require('q');
var MessageRow = require('./MessageRow');
var NewResource = require('./NewResource');
var utils = require('../utils/utils');

var interfaceToTypeMapping = {
  'tradle.Message': 'tradle.SimpleMessage'
};
var {
  ListView,
  Component,
  StyleSheet,
  Text,
  TextInput,
  Image,
  TouchableHighlight,
  View,
} = React;


class ResourceTypesScreen extends Component {
  constructor(props) {
    super(props);
    this.timeoutID = null;
    var implementors = utils.getImplementors(this.props.modelName, this.props.models);

    var dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource.cloneWithRows(implementors),
      userInput: ''
    };
  }
  selectResource(resource) {
    var me = this.props.me;
    var models = this.props.models;
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = models['model_' + this.props.modelName];

    if (resource['_type'])
      return;
    var page = {
      metadata: models['model_' + resource.id].value,
      models: models,
      me: me,
      data: {
        '_type': this.props.modelName, 
        'from': me,
        'to': this.props.identity
      }
    };
    if (this.props.returnRoute)
      page.returnRoute = this.props.returnRoute;

    this.props.navigator.replace({
      title: resource.title,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      passProps: {page: page}
    });
  }

  renderRow(resource)  {
    var model = this.props.models['model_' + (resource['_type'] || resource.id)].value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;

    return (
      <MessageRow
        onSelect={() => this.selectResource(resource)}
        resource={resource}
        me={this.props.me}
        navigator={this.props.navigator}
        models={this.props.models}
        to={this.props.identity} />
      );
  }

  render() {
    var content = 
    <ListView ref='listview' style={styles.listview}
      dataSource={this.state.dataSource}
      renderRow={this.renderRow.bind(this)}
      automaticallyAdjustContentInsets={false}
      keyboardDismissMode="onDrag"
      keyboardShouldPersistTaps={true}
      showsVerticalScrollIndicator={false} />;

    return (
      <View style={styles.container}>
        {content}
      </View>
    );
  }

}

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
});

module.exports = ResourceTypesScreen;
