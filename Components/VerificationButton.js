'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ArticleView = require('./ArticleView');
var SearchScreen = require('./SearchScreen');
var MoreLikeThis = require('./MoreLikeThis');

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
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;

    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    return isMessage
           ? <View style={{flex: 1, paddingRight: 10}}>
               <TouchableHighlight onPress={this.verify.bind(this)} underlayColor='#ffffff'>
                 <View style={[styles.button, {backgroundColor: '#7AAAC3', alignSelf: 'stretch'}]}>
                   <Text style={[styles.buttonText, {color: '#ffffff'}]}>Verify</Text>
                 </View>
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

module.exports = VerificationButton;