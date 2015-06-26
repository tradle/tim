'use strict'

var React = require('react-native');
var utils = require('../utils/utils');

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
    var alignStyle = model.isInterface ? {alignSelf: 'center', marginTop: 10} : {alignSelf: 'stretch'};
    var messageField =
        <View style={[styles.chat, alignStyle]}>
          <TextInput ref='chat'
            autoCapitalize='none'
            autoFocus={true}
            autoCorrect={false}
            bufferDelay={20}
            placeholder='Say something'
            placeholderTextColor='#bbbbbb'
            style={styles.chatInput}
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
      <View>
        <View style={styles.view}>
          <Text style={styles.formRequest}>Send this form to {title}</Text>
        </View>
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
    this.props.onSubmitEditing(msg);
    this.setState({userInput: ''});
  }
}
// reactMixin(ChatMessage.prototype, Reflux.ListenerMixin);
var styles = StyleSheet.create({
  view: {
    backgroundColor: '#efffe5',
    borderWidth: 1, 
    borderTopColor: '#deeeb4', 
    borderLeftColor: '#efffe5', 
    borderRightColor: '#efffe5', 
    borderBottomColor: '#deeeb4', 
    paddingVertical: 7,
  },
  chat: {
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
  chatInput: {
    height: 30,
    fontSize: 18,
    paddingLeft: 10,
    backgroundColor: '#eeeeee',
    fontWeight: 'bold',
    alignSelf: 'stretch',
    borderColor: '#eeeeee',
  },
  formRequest: {
    paddingLeft: 10,
    fontSize: 18,
    color: '#2E3B4E',
  },

});

module.exports = ChatMessage;

