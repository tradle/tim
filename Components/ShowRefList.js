'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ResourceList = require('./ResourceList');
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

    var pos = 0;
    var marginTopStep = 30;
    for (var p in resource) {
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      refList.push(
        <View style={{top: pos}}>
           <TouchableHighlight onPress={this.showAll.bind(this, p)} underlayColor='transparent'>
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
  showAll(prop) {
    var resource = this.props.resource;
    var propJson = utils.getModel(resource[constants.TYPE]).value.properties[prop];
    var modelName = propJson.items.ref;
    this.props.navigator.push({
      title: propJson.title,
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        resource: resource,
        prop: prop,
        modelName: modelName
      }
    });
  }
}

module.exports = ShowRefList;