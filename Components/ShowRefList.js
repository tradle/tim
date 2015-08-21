'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ResourceList = require('./ResourceList');
// var Icon = require('react-native-vector-icons/Ionicons');
var { Icon } = require('react-native-icons');

var buttonStyles = require('../styles/buttonStyles');
var constants = require('tradle-constants');
var reactMixin = require('react-mixin');
var ResourceViewMixin = require('./ResourceViewMixin');

var {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class ShowRefList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startTop: props.resource[constants.TYPE] == constants.TYPES.IDENTITY && props.resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH] ? 70 : 15
    }
  }
  render() {
    var resource = this.props.resource;
    var props = utils.getModel(resource[constants.TYPE]).value.properties;

    var refList = [];

    // The profile page for the device owner has 2 more profile specific links: add new identity and switch identity
    var pos = (utils.getMe()[constants.ROOT_HASH] === resource[constants.ROOT_HASH]) ? 80 : 0;
    var marginTopStep = 5; //30;
    for (var p in props) {
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      refList.push(
        <View style={{top: pos}}>
           <TouchableHighlight onPress={this.showResources.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
           <View>
             <View style={buttonStyles.buttonContent} />
             <View style={{flexDirection: 'row', paddingHorizontal: 5}}>
               <Icon name='ion|ios-paper-outline'  size={20}  color='#ffffff'  style={[buttonStyles.icon, {marginTop: -33}]}/>
               <Text style={[buttonStyles.text, {marginTop: -30}]}>{props[p].title}</Text>
             </View>
           </View>
           </TouchableHighlight>
         </View>
        );
      pos += marginTopStep;
     }
     return (
        <View  style={[buttonStyles.container, {top: 15}]}>
          {refList}
        </View> 
      );
  }
}
reactMixin(ShowRefList.prototype, ResourceViewMixin);

module.exports = ShowRefList;