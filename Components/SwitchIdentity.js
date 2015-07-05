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
  Text,
  TouchableHighlight,
  Component
} = React;

class SwitchIdentity extends Component {
  render() {
    var resource = this.props.resource;
    return resource.rootHash === utils.getMe().rootHash
           ? <View style={styles.switchButton}>
               <TouchableHighlight onPress={this.showIdentities.bind(this)} underlayColor='transparent'>
               <View>
                 <View style={styles.switchIdentity} />
                 <View style={{flexDirection: 'row', paddingHorizontal: 5}}>                 
                   <Icon name='fontawesome|arrows'  size={20}  color='#ffffff'  style={styles.icon}/>
                   <Text style={styles.text}>Switch Identity</Text>
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

var styles = StyleSheet.create({
  icon: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: '#D7E6ED',
    borderRadius: 12,
    marginTop: -33,
  },
  switchButton: {
    position: 'absolute', 
    top: 60, 
    right: 10 
  },
  switchIdentity: {
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

module.exports = SwitchIdentity;