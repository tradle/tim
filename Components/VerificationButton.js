'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var Icon = require('react-native-vector-icons/Ionicons');
var reactMixin = require('react-mixin');
var constants = require('tradle-constants');
var buttonStyles = require('../styles/buttonStyles');

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
     
    if (!resource.from  ||  fromId === meId)
      return <View />

    var verifiedByMe;
    if (resource.verifications){
      resource.verifications.forEach(function(r) {
        var rh = r.from[constants.ROOT_HASH];
        if (!rh) 
          rh = utils.getId(r.from).split('_')[1];

        if (rh === me[constants.ROOT_HASH])
          verifiedByMe = true;
      });
    }
    if (verifiedByMe)
      return <View />; 
    return (
       <View style={[buttonStyles.container1, {top: 80}]}>
         <TouchableHighlight underlayColor='transparent' onPress={this.props.verify.bind(this)}>
           <View>
             <View style={buttonStyles.buttonContent} />
             <View style={buttonStyles.row1}>
               <Icon name='ios-checkmark-outline' size={25}  color='#ffffff' style={buttonStyles.icon1}/>
               <Text style={buttonStyles.text1}>{'Verify'}</Text>
             </View>
           </View>
         </TouchableHighlight>
       </View>
    );
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
});

module.exports = VerificationButton;