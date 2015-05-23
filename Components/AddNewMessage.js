'use strict'

var React = require('react-native');
var utils = require('../utils/utils');
var sha = require('stable-sha1');
var ResourceTypesScreen = require('./ResourceTypesScreen');

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
    return (
      <View style={styles.addNew}>
        <TouchableHighlight style={{paddingLeft: 5}} underlayColor='#eeeeee'
          onPress={this.onAddNewPressed.bind(this)}>
         <Image source={require('image!clipadd')} style={styles.image} />
        </TouchableHighlight>
        <View style={styles.searchBar}>
          <View style={styles.searchBarBG}>
            <TextInput 
              autoCapitalize='none'
              autoFocus={true}
              autoCorrect={false}
              placeholder='Say something'
              placeholderTextColor='#bbbbbb'
              style={styles.searchBarInput}
              value={this.state.userInput}
              onChange={this.handleChange.bind(this)}
              onEndEditing={this.onEndEditing.bind(this)}
            />
          </View>
        </View>
      </View> 
    );
  }
  handleChange(event) {
    this.setState({userInput: event.nativeEvent.text});
  }

  onEndEditing() {
    if (this.state.userInput.trim().length == 0)
      return;
    var type = interfaceToTypeMapping[this.props.modelName];
    var me = utils.getMe();
    var resource = this.props.resource;
    var title = utils.getDisplayName(resource, utils.getModel(this.props.resource['_type']).value.properties);
    var meTitle = utils.getDisplayName(me, utils.getModel(me['_type']).value.properties);
    var r = {
      '_type': type,
      'message': this.state.userInput,
      'from': {
        id: me['_type'] + '_' + me.rootHash, 
        title: meTitle
      }, 
      'to': {
        id: resource['_type'] + '_' + resource.rootHash,
        title: title
      },
      time: new Date().getTime()
    }
    var rootHash = sha(r);
    r.rootHash = rootHash;
    var self = this;
    var key = type + '_' + rootHash;
    utils.getDb().put(key, r)
    .then(function() {
      utils.addOrUpdateResource(key, r);
      var userInput = self.state.userInput;

      self.setState({userInput: ''});
      if (self.props.callback)
        self.props.callback(userInput);
    })
    .catch(function(err) {
      err = err;
    });
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
  onMessageCreated() {
    this.setState({isLoading: false});
  }
}
var styles = StyleSheet.create({
  searchBar: {
    flex: 4,
    padding: 10,
    // paddingLeft: 10,
    paddingTop: 3,

    height: 45,
    paddingBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee', 
  },
  searchBarBG: {
    marginTop: 10,
    marginBottom: 5,
    // padding: 5,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#eeeeee', 
    borderTopColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 2,
    borderBottomColor: '#cccccc',
  },
  searchBarInput: {
    height: 30,
    fontSize: 18,
    paddingLeft: 10,
    backgroundColor: '#eeeeee',
    fontWeight: 'bold',
    // color: '#2E3B4E',
    borderRadius: 5,
    // borderWidth: 1,
    alignSelf: 'stretch',
    borderColor: '#eeeeee',
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