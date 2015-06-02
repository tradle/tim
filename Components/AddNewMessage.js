'use strict'

var React = require('react-native');
var utils = require('../utils/utils');
var sha = require('stable-sha1');
var ResourceTypesScreen = require('./ResourceTypesScreen');
var ChatMessage = require('./ChatMessage');

var {
  View,
  TextInput,
  TouchableHighlight,
  Navigator,
  Image,
  StyleSheet,
  Component
} = React;
var interfaceToTypeMapping = {
  'tradle.Message': 'tradle.SimpleMessage'
};

class AddNewMessage extends Component {
  constructor(props) {
    this.state = {
      userInput: ''
    }
  }
  render() {
    var resource = {from: utils.getMe(), to: this.props.resource};
    var model = utils.getModel(this.props.modelName).value;
    return (
      <View style={styles.addNew}>
        <TouchableHighlight style={{paddingLeft: 5}} underlayColor='#eeeeee'
          onPress={this.onAddNewPressed.bind(this)}>
         <Image source={require('image!clipadd')} style={styles.image} />
        </TouchableHighlight>
        <View style={styles.searchBar}>
          <ChatMessage resource={resource} model={model} callback={this.props.callback} />
        </View>
      </View> 
    );
  }
  onAddNewPressed() {
    var modelName = this.props.modelName;
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface) 
      return;

    var self = this;
    var currentRoutes = self.props.navigator.getCurrentRoutes();
    self.props.navigator.push({
      title: utils.makeLabel(model.title) + ' type',
      id: 2,
      component: ResourceTypesScreen,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        resource: self.props.resource, 
        returnRoute: currentRoutes[currentRoutes.length - 1],
        modelName: modelName,
        callback: this.props.callback
      }
    });
  }
}

var styles = StyleSheet.create({
  searchBar: {
    flex: 4,
    padding: 10,
    paddingTop: 3,
    height: 45,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee', 
  },
  image: {
    width: 40,
    height: 40
  },
  addNew: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#eeeeee',
    borderBottomColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 1,
    borderTopColor: '#cccccc',
  }
});

module.exports = AddNewMessage;