'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var MessageList = require('./MessageList');
var Icon = require('react-native-vector-icons/Ionicons');
var constants = require('tradle-constants');
var buttonStyles = require('../styles/buttonStyles');

var {
  View,
  Text,
  TouchableHighlight,
  Component
} = React;

class MoreLikeThis extends Component {
  showMoreLikeThis() {
    var self = this;
    var modelName = this.props.resource[constants.TYPE];
    this.props.navigator.push({
      title: utils.getModel(modelName).value.title,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: utils.getMe(), 
        filter: '',
        isAggregation: true,
        modelName: modelName,
      }
    });
  }
  render() {
    if (this.props.resource[constants.TYPE] === 'tradle.SimpleMessage')
      return null;
    return (
      <View style={[buttonStyles.container, {top: 15}]}>
      <TouchableHighlight underlayColor='transparent' onPress={this.showMoreLikeThis.bind(this)}>
       <View>
         <View style={buttonStyles.buttonContent} />
         <View style={{flexDirection: 'row', paddingHorizontal: 5}}>
           <Icon name='arrow-shrink'  size={20}  color='#ffffff'  style={[buttonStyles.icon, {marginTop: -33}]}/>
           <Text style={[buttonStyles.text, {marginTop: -30}]}>More like this</Text>
         </View>
       </View>
      </TouchableHighlight>
      </View>
    );
  }
}

module.exports = MoreLikeThis;