'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var reactMixin = require('react-mixin');
var { Icon } = require('react-native-icons');
var buttonStyles = require('../styles/buttonStyles');
var constants = require('tradle-constants');

var {
  View,
  Text,
  TouchableHighlight,
  Component
} = React;

class SwitchIdentity extends Component { 
  render() {
    var resource = this.props.resource;
    return resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH]
           ? <View style={[buttonStyles.container, {top: 50}]}>
               <TouchableHighlight onPress={this.showIdentities.bind(this)} underlayColor='transparent'>
               <View>
                 <View style={buttonStyles.buttonContent} />
                 <View style={{flexDirection: 'row', paddingHorizontal: 5}}>                 
                   <Icon name='fontawesome|arrows'  size={20}  color='#ffffff'  style={[buttonStyles.icon, {marginTop: -33}]}/>
                   <Text style={[buttonStyles.text, {marginTop: -30}]}>Switch Identity</Text>
                 </View>
               </View>
               </TouchableHighlight>
             </View>
           : <View></View>;    
  }
  showIdentities() {
    Actions.showIdentityList(utils.getMe());
  }
}
reactMixin(SwitchIdentity.prototype, Reflux.ListenerMixin);

module.exports = SwitchIdentity;