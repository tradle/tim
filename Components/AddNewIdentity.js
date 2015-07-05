'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var NewResource = require('./NewResource');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
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

    return this.props.isRegistration || (resource.rootHash === utils.getMe().rootHash)
           ? <View style={styles.addNew}>
               <TouchableHighlight onPress={this.createNewIdentity.bind(this)} underlayColor='transparent'>
               <View>
                 <View style={styles.addIdentity} />
                 <View style={{flexDirection: 'row', paddingHorizontal: 5}}>
                   <Icon name='fontawesome|plus'  size={20}  color='#ffffff'  style={styles.icon}/>
                   <Text style={styles.text}>Add Identity</Text>
                 </View>
               </View>
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
        model: model,
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
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: '#D7E6ED',
    borderRadius: 12,
    marginTop: -33,
  },
  addNew: {
    flex: 1,
    position: 'absolute', 
    top: 15, 
    right: 10 
  },
  addIdentity: {
    padding: 10, 
    width: 150, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: '#7AAAC3', 
    opacity: 0.5, 
    borderWidth: 2, 
    borderColor: '#7AAAC3'
  },
  text: {
    color: '#ffffff', 
    marginTop: -30, 
    marginLeft: 5,
    fontWeight: '800'
  }
});

module.exports = AddNewIdentity;