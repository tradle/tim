'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var reactMixin = require('react-mixin');
var Icon = require('FAKIconImage');

var {
  StyleSheet,
  Image, 
  View,
  TouchableHighlight,
  Component
} = React;

class SwitchIdentity extends Component {
  render() {
    var resource = this.props.resource;
    return resource.rootHash === utils.getMe().rootHash
           ? <View style={styles.switchButton}>
               <TouchableHighlight onPress={this.showIdentities.bind(this)} underlayColor='transparent'>
                 <Icon name='fontawesome|arrows'  size={30}  color='#ffffff'  style={styles.icon}/>
               </TouchableHighlight>
             </View>
           : <View></View>;    
  }
  showIdentities() {
    Actions.showIdentityList(utils.getMe());
  }
}
reactMixin(SwitchIdentity.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#D7E6ED',
    backgroundColor: '#9287ED',
    borderRadius: 20,
  },
  switchButton: {
    position: 'absolute', 
    top: 60, 
    right: 10 
  }
});

module.exports = SwitchIdentity;