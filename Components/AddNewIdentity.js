'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var NewResource = require('./NewResource');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var Icon = require('FAKIconImage');

var {
  StyleSheet,
  ScrollView,
  Image, 
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class AddNewIdentity extends Component {
  componentDidMount() {
    this.listenTo(Store, 'onAddNewIdentity');
  }
  onAddNewIdentity(params) {
    if (params.action !== 'addNewIdentity')
      return;
    this.setState({resource: params.resource});
  }
  render() {
    var resource = this.props.resource;
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;

    var hasPhoto = resource  &&  resource.photos && resource.photos.length;
    var style = hasPhoto 
              ? {alignSelf: 'center', justifyContent: 'center', position: 'absolute', top: 15, right: 10 }
              : {alignSelf: 'center', justifyContent: 'center'}
 
    return this.props.isRegistration || (resource.rootHash === utils.getMe().rootHash)
           ? <View style={style}>
               <TouchableHighlight onPress={this.createNewIdentity.bind(this)}>
                 <Icon name='fontawesome|plus'  size={30}  color='#ffffff'  style={styles.icon}/>
               </TouchableHighlight>
             </View>
           : <View></View>;    
  }
  createNewIdentity() {
    var resource = this.props.resource;
    var model = utils.getModel(resource['_type']).value;
    var title = 'New Identity for ' + resource.firstName;
    this.props.navigator.push({
      title: title,
      id: 4,
      component: NewResource,
      backButtonTitle: resource ? resource.firstName : 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        metadata: model,
        callback: this.addNewIdentity
      }
    });
  }
  addNewIdentity(resource) {
    Actions.addNewIdentity(resource);
  }
}
reactMixin(AddNewIdentity.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#D7E6ED',
    backgroundColor: '#7AAAC3',
    borderRadius: 18,
  },
});

module.exports = AddNewIdentity;