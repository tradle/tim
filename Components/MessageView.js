'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var constants = require('tradle-constants');
var ArticleView = require('./ArticleView');
var FromToView = require('./FromToView');
var PhotoList = require('./PhotoList');
var PhotoView = require('./PhotoView');
var ShowPropertiesView = require('./ShowPropertiesView');
var MoreLikeThis = require('./MoreLikeThis');
var NewResource = require('./NewResource');
var VerificationButton = require('./VerificationButton');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceViewMixin = require('./ResourceViewMixin');

var {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Component
} = React;

class MessageView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
    };
  }
  componentDidMount() {
    this.listenTo(Store, 'onAddVerification');
  }
  onAddVerification(params) {
    if (params.action === 'addVerification') {
      this.props.navigator.pop();
      Actions.messageList({
        modelName: 'tradle.Message', 
        resource: params.resource
      });    
    }
  }
  render() {
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var embed = /*modelName === 'tradle.AssetVerification' 
              ? <View style={{marginLeft: 15}}>
                  <Text style={{fontSize: 20, paddingTop: 15, paddingBottom: 15, color: '#2E3B4E'}}>Verified By</Text>
                  <Image style={styles.imageVerifiedBy} source={{uri: 'http://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Barclays_logo.svg/391px-Barclays_logo.svg.png'}}/>
                  <Text style={styles.buttonText} onPress={self.showEmbed.bind(self)}>Embed</Text>
                  <View style={styles.separator}></View>
                  <Text style={self.state.embedHeight}>{"<iframe width='420' height='315' src='https://tradle.io/embed/aifSjuyeE5M' frameborder='0' allowfullscreen></iframe>"}</Text>
                  <View style={{height: 50}} />
                </View>
              :*/ <View></View>  
    var date = utils.getFormattedDate(new Date(resource.time));
    var inRow = resource.photos ? resource.photos.length : 0;
    if (inRow  &&  inRow > 4)
      inRow = 5;
    return (
      <ScrollView  ref='this' style={styles.container}>
        <View style={styles.photoBG}>
          <PhotoView resource={resource} />
        </View>
        <MoreLikeThis resource={resource} navigator={this.props.navigator}/>
        <VerificationButton  resource={resource} verify={this.verify.bind(this)} verificationList={this.showResources.bind(this)}/>
        <FromToView resource={resource} navigator={this.props.navigator} excluded />
        <View style={styles.band}><Text style={styles.date}>{date}</Text></View>
        <PhotoList photos={resource.photos} isView={true} navigator={this.props.navigator} numberInRow={inRow}/>
        <View style={styles.rowContainer}>    
          <View><Text style={styles.itemTitle}>{resource.message}</Text></View>
          <ShowPropertiesView resource={resource} excludedProperties={['tradle.Message.message', 'time', 'photos']} />
          {embed}
        </View>
      </ScrollView>
    );
  }
          // <ShowPropertiesView resource={resource} callback={this.showResources.bind(this)} excludedProperties={['tradle.Message.message', 'tradle.Message.time', 'tradle.message.photos']} />
  // showRefResources(resource, prop) {
  //   var meta = utils.getModel(resource[constants.TYPE]).value.properties;
  //   this.props.navigator.push({
  //     id: 10,
  //     title: utils.makeLabel(prop),
  //     titleTextColor: '#7AAAC3',
  //     backButtonTitle: 'Back',
  //     component: MessageList,
  //     passProps: {
  //       modelName: meta[prop].items.ref,
  //       filter: '',
  //       resource: resource,
  //       prop: prop
  //     }
  //   });
  // }
  showEmbed() {
    this.setState({embedHeight: {height: 60, padding: 5, marginRight: 10, borderColor: '#2E3B4E', backgroundColor: '#eeeeee'}});
  }
  verify() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    // this.props.navigator.pop();
    var me = utils.getMe();
    var from = this.props.resource.from;
    var verificationModel = model.properties.verifications.items.ref;
    var verification = {
      document: {
        id: resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH] + '_' + resource[constants.CUR_HASH],
        title: resource.message ? resource.message : model.title
      },
      to: {
        id: from.id,
        title: from.title
      },
      from: { 
        id: me[constants.TYPE] + '_' + me[constants.ROOT_HASH] + '_' + me[constants.CUR_HASH],
        title: utils.getDisplayName(me, utils.getModel(me[constants.TYPE]).value.properties)
      },
      time: new Date().getTime()
    }
    verification[constants.TYPE] = verificationModel;

    if (verificationModel === 'tradle.Verification') 
      Actions.addVerification(verification);
    else {
      this.props.navigator.replace({
        title: resource.message,
        id: 4,
        component: NewResource,
        backButtonTitle: resource.firstName,
        rightButtonTitle: 'Done',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: utils.getModel(verificationModel).value,
          resource: verification,
          // callback: this.createVerification.bind(self)
        }
      });
    }
  }
  // createVerification(resource) {
  //   Actions.addVerification(resource, true);
  // }
  
  onPress(url) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: {url: url}
    });
  } 

}
reactMixin(MessageView.prototype, Reflux.ListenerMixin);
reactMixin(MessageView.prototype, ResourceViewMixin);

var styles = StyleSheet.create({
  container: {
    marginTop: 60,
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    margin: 5,
    marginBottom: 0,
    color: '#7AAAC3'
  },
  photoBG: {
    backgroundColor: '#CEE7F5',
    alignItems: 'center',
  },
  band: {
    height: 30,
    backgroundColor: '#f7f7f7',
    alignSelf: 'stretch'
  },
  rowContainer: {
    paddingBottom: 10,
    paddingHorizontal: 10
  },
  date: {
    fontSize: 14,
    marginTop: 5,
    marginRight: 10,
    alignSelf: 'flex-end',
    color: '#2E3B4E'
    // color: '#b4c3cb'
  },
});

module.exports = MessageView;