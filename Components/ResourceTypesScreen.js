'use strict';

var React = require('react-native');
var MessageRow = require('./MessageRow');
var NewResource = require('./NewResource');
var utils = require('../utils/utils');

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
    var implementors = utils.getImplementors(this.props.modelName);

    var dataSource =  new ListView.DataSource({
      rowHasChanged: (row1, row2) => row1 !== row2,
    });
    this.state = {
      dataSource: dataSource.cloneWithRows(implementors),
      userInput: ''
    };
  }
  selectResource(resource) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);

    if (resource['_type'])
      return;
    var page = {
      metadata: utils.getModel(resource.id).value,
      resource: {
        '_type': this.props.modelName, 
        'from': utils.getMe(),
        'to': this.props.resource
      }
    };
    if (this.props.returnRoute)
      page.returnRoute = this.props.returnRoute;
    if (this.props.callback)
      page.callback = this.props.callback;
    this.props.navigator.replace({
      id: 4,
      title: resource.title,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      passProps: page
    });
  }

  renderRow(resource)  {
    var model = utils.getModel(resource['_type'] || resource.id).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;

    return (
      <MessageRow
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
      keyboardDismissMode='onDrag'
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
