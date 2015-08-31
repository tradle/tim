'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var NewResource = require('./NewResource');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var reactMixin = require('react-mixin');
var Icon = require('react-native-vector-icons/Ionicons');
var buttonStyles = require('../styles/buttonStyles');
var constants = require('tradle-constants');

var {
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

    return this.props.isRegistration || (resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH])
           ? <View style={[buttonStyles.container]}>
               <TouchableHighlight onPress={this.createNewIdentity.bind(this)} underlayColor='transparent'>
                 <View style={{alignItems: 'center'}}>
                   <Icon name='plus'  size={25}  color='#f7f7f7'  style={buttonStyles.icon}/>
                   <Text style={[buttonStyles.text, {color: '#f7f7f7'}]}>Add Identity</Text>
                 </View>
               </TouchableHighlight>
             </View>
           : null;    
  }
  createNewIdentity() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
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

module.exports = AddNewIdentity;