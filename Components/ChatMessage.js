'use strict'

var React = require('react-native');
// var Actions = require('../Actions/Actions');
// var Store = require('../Store/Store');

var utils = require('../utils/utils');
// var reactMixin = require('react-mixin');
// var Reflux = require('reflux');

var {
  Component,
  View,
  TextInput,
  Text,
  StyleSheet
} = React;
// Component is used in 2 other components
// 1. NewResource for sending the correct verification form to your friend/customer to help them with finding the right one
// 2. AddNewMessage for submitting regular chat message. AddNewResource is used in ResourceList component when it shows chat messages
class ChatMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {userInput: ''};
  }
  // componentDidMount() {
  //   this.listenTo(Store, 'onAddMessage');
  // }
  // onAddMessage(params) {
  //   if (params.action !== 'addMessage')
  //     return;
  //   var resource = params.resource;
  //   if (!resource)
  //     return;
  //   if (params.error) {
  //     if (resource['_type'] == this.props.resource['_type']) 
  //       this.setState({err: params.error});
  //     return;    
  //   }
  //   var model = utils.getModel(resource['_type']).value;
  //   var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
  //   if (isMessage) {
  //     if (this.props.callback) {
  //       this.props.callback('');
  //       this.setState({userInput: ''});
  //       setTimeout(function() {
  //         this.setState({textValue: this.state.userInput});
  //         this.refs.chat.focus();
  //       }.bind(this), 0);
  //     }
  //   }
  // }
  render() {
    var model = this.props.model;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1;
    if (!isMessage  &&  !model.isInterface)
      return <View></View>;
    var resource = this.props.resource;
    var title = resource.to['_type'] 
              ? utils.getDisplayName(resource.to, utils.getModel(resource.to['_type']).value.properties)
              : resource.to.title;
    if (resource.message  &&  utils.splitMessage(resource.message).length === 1)
      return <View></View>;
    var alignStyle = model.isInterface ? {alignSelf: 'center'} : {alignSelf: 'stretch'};
    var messageField =
        <View style={[styles.searchBarBG, alignStyle]}>
          <TextInput ref='chat'
            autoCapitalize='none'
            autoFocus={true}
            autoCorrect={false}
            bufferDelay={20}
            placeholder='Say something'
            placeholderTextColor='#bbbbbb'
            style={styles.searchBarInput}
            value={this.state.userInput}
            onChange={this.handleChange.bind(this)}
            onSubmitEditing={this.onSubmitEditing.bind(this)}
            onEndEditing={this.props.onEndEditing.bind(this, this.state.userInput)}
          />
        </View>

    // This is the case of when you want to send your friend/customer 
    // a verification form that corresponds to his/her needs
    if (model.isInterface)
      return messageField;
    return  (
      <View style={{flex: 1}}>
        <Text style={styles.formRequest}>Send this form to {title}</Text>
        {messageField}
      </View>
      );
  }
  handleChange(event) {
    this.setState({userInput: event.nativeEvent.text});
  }
  onSubmitEditing() {
    var msg = this.state.userInput;
    if (!msg)
      return;
    this.setState({userInput: ''});
    this.props.onSubmitEditing(msg);

    // var me = utils.getMe();
    // var resource = this.props.resource;
    // var toName = utils.getDisplayName(resource.to, utils.getModel(this.props.resource.to['_type']).value.properties);
    // var meta = utils.getModel(me['_type']).value.properties;
    // var meName = utils.getDisplayName(me, meta);
    // var modelName = 'tradle.SimpleMessage';
    // var value = {
    //   '_type': modelName,  
    //   message: this.props.model.isInterface ? msg : '[' + this.state.userInput + '](' + this.props.model.id + ')',

    //   'from': {
    //     id: me['_type'] + '_' + me.rootHash, 
    //     title: meName
    //   }, 
    //   'to': {
    //     id: resource.to['_type'] + '_' + resource.to.rootHash,
    //     title: toName
    //   },

    //   time: new Date().getTime()
    // }
    // this.setState({userInput: ''});
    // setTimeout(function() {
    //   this.setState({textValue: this.state.userInput});
    //   this.refs.chat.focus();
    // }.bind(this), 0);
    // Actions.addMessage(value); //, this.state.resource, utils.getModel(modelName).value);
  }
}
// reactMixin(ChatMessage.prototype, Reflux.ListenerMixin);
var styles = StyleSheet.create({
  searchBarBG: {
    marginTop: 10,
    marginBottom: 5,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#eeeeee', 
    borderTopColor: '#eeeeee', 
    borderRightColor: '#eeeeee', 
    borderLeftColor: '#eeeeee', 
    borderWidth: 2,
    borderBottomColor: '#cccccc',
  },
  searchBarInput: {
    height: 30,
    fontSize: 18,
    paddingLeft: 10,
    backgroundColor: '#eeeeee',
    fontWeight: 'bold',
    alignSelf: 'stretch',
    borderColor: '#eeeeee',
  },
  formRequest: {
    paddingTop: 30,
    paddingLeft: 20,
    fontSize: 18,
    color: '#2E3B4E',
  },

});

module.exports = ChatMessage;

