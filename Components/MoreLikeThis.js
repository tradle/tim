'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var MessagesList = require('./MessagesList');
var Icon = require('FAKIconImage');

var {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Component
} = React;

class MoreLikeThis extends Component {
  showMoreLikeThis() {
    var self = this;
    var modelName = this.props.resource['_type'];
    this.props.navigator.push({
      title: utils.getModel(modelName).value.title,
      component: MessagesList,
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
    if (this.props.resource['_type'] === 'tradle.SimpleMessage')
      return null;
    return (
      <View style={styles.moreLikeThis}>
        <TouchableHighlight underlayColor='transparent' onPress={this.showMoreLikeThis.bind(this)}>
          <Icon name='ion|arrow-shrink' size={30}  color='#ffffff'  style={styles.icon}/>
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
  moreLikeThis: {
    position: 'absolute',
    top: 15,
    right: 10
  },
  moreLikeThisNoPhoto: {
    marginTop: 15,
    marginRight: 10,
    alignSelf: 'flex-end'
  }
});

module.exports = MoreLikeThis;