'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var Icon = require('FAKIconImage');
var reactMixin = require('react-mixin');
var constants = require('tradle-constants');

var {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Component
} = React;

class VerificationButton extends Component {
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;

    if (!model.properties.verifications)
      return null;

    var me = utils.getMe();
    var meId = me[constants.TYPE] + '_' + me[constants.ROOT_HASH];
    var s = resource.from.id.split('_');
    var fromId = s[0] + '_' + s[1];

    return resource.from  &&  fromId != meId
           ? <View style={styles.verification}>
               <TouchableHighlight underlayColor='transparent' onPress={this.props.verify.bind(this)}>
                 <Icon name='ion|checkmark' size={30}  color='#ffffff'  style={styles.icon}/>
               </TouchableHighlight>
             </View>
           : <View></View>  
  }
}

var styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#D7E6ED',
    backgroundColor: '#7AAAC3',
    borderRadius: 20,
  },
  verification: {
    position: 'absolute',
    top: 60,
    right: 10
  },

});

module.exports = VerificationButton;