'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var SearchScreen = require('./SearchScreen');

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
      component: SearchScreen,
      id: 10,
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
    var modelName = this.props.resource['_type'];
    var model = utils.getModel(modelName).value;

    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    var moreLikeThis;
    return (isMessage) 
          ? <View style={{flex: 2, paddingHorizontal: 10}}>
              <TouchableHighlight underlayColor='#ffffff' onPress={this.showMoreLikeThis.bind(this)}>
                <View style={[styles.button, {alignSelf: 'stretch'}]}><Text style={styles.buttonText}>{'More ' + model.title}</Text></View>           
              </TouchableHighlight>
            </View>
          : <View />
  }
}

var styles = StyleSheet.create({
  buttonText: {
    fontSize: 18,
    color: '#2E3B4E',
    alignSelf: 'center',
  },
  button: {
    marginTop: 10,
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: '#eeeeee',
    borderColor: '#cccccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10
  },
});

module.exports = MoreLikeThis;