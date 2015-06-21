'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var Icon = require('FAKIconImage');

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
    var me = utils.getMe();
    var meId = me['_type'] + '_' + me.rootHash;
    var s = resource.from.id.split('_');
    var fromId = s[0] + '_' + s[1];

    return resource.from  &&  fromId != meId
           ? <View style={styles.verification}>
               <TouchableHighlight underlayColor='transparent' onPress={this.verify.bind(this)}>
                 <Icon name='ion|checkmark' size={30}  color='#ffffff'  style={styles.icon}/>
               </TouchableHighlight>
             </View>
           : <View></View>  
  }
  verify() {
    this.props.navigator.pop();
    // var resource = this.props.resource;
    // var me = utils.getMe();
    // var owner = this.props.resource[toClone];
    // var verification = {
    //   message: {
    //     value: resource['_type'] + '_' + resource.rootHash;
    //     title: utils.getModel(this.props.modelName).value.title;
    //   }
    //   owner: {
    //     value: owner['_type'] + '_' + owner.rootHash;
    //     title: owner.formatted
    //   }
    //   verifier: { 
    //     value: me['_type'] + '_' : me.rootHash,
    //     title: me.formatted
    //   }
    // }
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