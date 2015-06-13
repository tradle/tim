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
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;

    var hasPhoto = resource  &&  resource.photos && resource.photos.length;
    var style = hasPhoto 
              ? {position: 'absolute', top: 65, right: 10 }
              : {alignSelf: 'flex-end', marginTop: 5, marginRight: 10 }
 
    return resource.rootHash === utils.getMe().rootHash
           ? <View style={style}>
               <TouchableHighlight onPress={this.showIdentities.bind(this)} underlayColor='#ffffff'>
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
    borderRadius: 18,
  },
});

module.exports = SwitchIdentity;