'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var NewResource = require('./NewResource');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var reactMixin = require('react-mixin');
var Icon = require('react-native-icons');
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
           ? <View style={[buttonStyles.container, {top: 15}]}>
               <TouchableHighlight onPress={this.createNewIdentity.bind(this)} underlayColor='transparent'>
               <View>
                 <View style={buttonStyles.buttonContent} />
                 <View style={{flexDirection: 'row', paddingHorizontal: 5}}>
                   <Icon name='fontawesome|plus'  size={20}  color='#ffffff'  style={[buttonStyles.icon, {marginTop: -33}]}/>
                   <Text style={[buttonStyles.text, {marginTop: -30}]}>Add Identity</Text>
                 </View>
               </View>
               </TouchableHighlight>
             </View>
           : <View></View>;    
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