'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var Icon = require('FAKIconImage');
var reactMixin = require('react-mixin');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');

var {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Component
} = React;

class VerificationButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verifiedStyle: {backgroundColor: '#7AAAC3'}
    }
  }
  componentDidMount() {
    this.listenTo(Store, 'onAddVerification');
  }
  onAddVerification(params) {
    if (params.action === 'addVerification') {
      this.setState({verifiedStyle: {backgroundColor: '#E829F2'}});
      this.props.navigator.pop();
      Actions.messageList('', 'tradle.Message', params.resource);    
    }
  }
  render() {
    var resource = this.props.resource;
    var me = utils.getMe();
    var meId = me['_type'] + '_' + me.rootHash;
    var s = resource.from.id.split('_');
    var fromId = s[0] + '_' + s[1];

    return resource.from  &&  fromId != meId
           ? <View style={styles.verification}>
               <TouchableHighlight underlayColor='transparent' onPress={this.verify.bind(this)}>
                 <Icon name='ion|checkmark' size={30}  color='#ffffff'  style={[styles.icon, this.state.verifiedStyle]}/>
               </TouchableHighlight>
             </View>
           : <View></View>  
  }
  verify() {
    // this.props.navigator.pop();
    var resource = this.props.resource;
    var me = utils.getMe();
    var from = this.props.resource.from;
    var model = utils.getModel(resource['_type']).value;
    var verification = {
      '_type': 'tradle.Verification',
      document: {
        id: resource['_type'] + '_' + resource.rootHash + '_' + resource.currentHash,
        title: resource.message ? resource.message : model.title
      },
      from: {
        id: from.id,
        title: from.title
      },
      verifier: { 
        id: me['_type'] + '_' + me.rootHash + '_' + me.currentHash,
        title: me.formatted
      }
    }
    Actions.addVerification(verification);
  }
}
reactMixin(VerificationButton.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#D7E6ED',
    // backgroundColor: '#7AAAC3',
    borderRadius: 20,
  },
  verification: {
    position: 'absolute',
    top: 60,
    right: 10
  },

});

module.exports = VerificationButton;