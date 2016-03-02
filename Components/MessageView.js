'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var ArticleView = require('./ArticleView');
// var FromToView = require('./FromToView');
var PhotoList = require('./PhotoList');
var PhotoView = require('./PhotoView');
var ShowPropertiesView = require('./ShowPropertiesView');
var ShowMessageRefList = require('./ShowMessageRefList');
// var MoreLikeThis = require('./MoreLikeThis');
var NewResource = require('./NewResource');
var VerificationButton = require('./VerificationButton');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceViewMixin = require('./ResourceViewMixin');
var buttonStyles = require('../styles/buttonStyles');

var {
  StyleSheet,
  ScrollView,
  View,
  Text,
  PropTypes,
  ArticleView,
  Component
} = React;

class MessageView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    verification: PropTypes.object,
    // verify: PropTypes.func
  };
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
    if (params.action === 'addVerification' ||  params.action === 'addAdditionalInfo') {
      this.props.navigator.pop();
      Actions.messageList({
        modelName: constants.TYPES.MESSAGE,
        to: params.resource
      });
    }
  }
  getRefResource(resource, prop) {
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;

    this.state.prop = prop;
    this.state.propValue = utils.getId(resource.id);
    this.showRefResource(resource, prop)
    // Actions.getItem(resource.id);
  }
  render() {
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var date = utils.getFormattedDate(new Date(resource.time))
    var inRow = resource.photos ? resource.photos.length : 0
    if (inRow  &&  inRow > 4)
      inRow = 5;
    var actionPanel =
          <ShowMessageRefList resource={resource}
                              navigator={this.props.navigator}
                              additionalInfo={this.additionalInfo.bind(this)}
                              currency={this.props.currency}
                              bankStyle={this.props.bankStyle} />
        // <FromToView resource={resource} navigator={this.props.navigator} />
        // <MoreLikeThis resource={resource} navigator={this.props.navigator}/>
    var verificationTxID, separator
    if (this.props.verification  &&  this.props.verification.txId) {
      verificationTxID =
          <View style={{padding :10, flex: 1}}>
            <Text style={styles.title}>Verification Transaction Id</Text>
            <Text style={styles.verification} onPress={this.onPress.bind(this, 'http://tbtc.blockr.io/tx/info/' + this.props.verification.txId)}>{this.props.verification.txId}</Text>
          </View>
      separator = <View style={styles.separator}></View>
    }
    else {
      verificationTxID = <View />
      separator = <View />
    }
        // <VerificationButton  resource={resource} verify={this.verify.bind(this)} verificationList={this.showResources.bind(this)}/>
    return (
      <ScrollView  ref='this' style={styles.container}>
        <View style={styles.band}><Text style={styles.date}>{date}</Text></View>
        <View style={styles.photoBG}>
          <PhotoView resource={resource} navigator={this.props.navigator}/>
        </View>
        {actionPanel}
        <View style={{marginTop: -3}}>
          <PhotoList photos={resource.photos} resource={resource} isView={true} navigator={this.props.navigator} numberInRow={inRow}/>
          <View style={styles.rowContainer}>
            <View><Text style={styles.itemTitle}>{resource.message}</Text></View>
            <ShowPropertiesView navigator={this.props.navigator}
                                resource={resource}
                                currency={this.props.currency}
                                excludedProperties={['tradle.Message.message', 'time', 'photos']}
                                showRefResource={this.getRefResource.bind(this)}/>
            {separator}
            {verificationTxID}
          </View>
        </View>
      </ScrollView>
    );
  }


  onPress(url) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: translate('back'),
      passProps: {url: url}
    });
  }

  additionalInfo(resource, prop, msg) {
    var rmodel = utils.getModel(resource[constants.TYPE]).value;
    msg = msg.length ? msg : 'Please submit more info';
    var r = {
      _t: prop.items.ref,
      from: utils.getMe(),
      to: resource.from,
      time: new Date().getTime(),
      message: msg
    };
    r[prop.items.backlink] = {
      id: resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH],
      title: utils.getDisplayName(resource, rmodel.properties)
    }
    Actions.addVerification(r);
  }
}
reactMixin(MessageView.prototype, Reflux.ListenerMixin);
reactMixin(MessageView.prototype, ResourceViewMixin);

var styles = StyleSheet.create({
  container: {
    marginTop: 64,
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    margin: 5,
    marginBottom: 0,
    color: '#7AAAC3'
  },
  title: {
    fontSize: 16,
    fontFamily: 'Avenir Next',
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  verification: {
    fontSize: 16,
    marginVertical: 3,
    marginHorizontal: 7,
    color: '#7AAAC3',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginHorizontal: 15
  },
  photoBG: {
    backgroundColor: '#CEE7F5',
    alignItems: 'center',
  },
  band: {
    height: 30,
    backgroundColor: '#f7f7f7',
    alignSelf: 'stretch',
    // paddingRight: 10,
    // paddingTop: 3,
    // marginTop: -10,
  },
  rowContainer: {
    paddingBottom: 10,
    // paddingHorizontal: 10
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
  // verify() {
  //   var resource = this.props.resource;
  //   var model = utils.getModel(resource[constants.TYPE]).value;
  //   // this.props.navigator.pop();
  //   var me = utils.getMe();
  //   var from = this.props.resource.from;
  //   var verificationModel = model.properties.verifications.items.ref;
  //   var verification = {
  //     document: {
  //       id: resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH] + '_' + resource[constants.CUR_HASH],
  //       title: resource.message ? resource.message : model.title
  //     },
  //     to: {
  //       id: from.id,
  //       title: from.title
  //     },
  //     from: {
  //       id: me[constants.TYPE] + '_' + me[constants.ROOT_HASH] + '_' + me[constants.CUR_HASH],
  //       title: utils.getDisplayName(me, utils.getModel(me[constants.TYPE]).value.properties)
  //     },
  //     time: new Date().getTime()
  //   }
  //   verification[constants.TYPE] = verificationModel;

  //   if (verificationModel === constants.TYPES.VERIFICATION)
  //     Actions.addVerification(verification);
  //   else {
  //     this.props.navigator.replace({
  //       title: resource.message,
  //       id: 4,
  //       component: NewResource,
  //       backButtonTitle: resource.firstName,
  //       rightButtonTitle: 'Done',
  //       titleTextColor: '#7AAAC3',
  //       passProps: {
  //         model: utils.getModel(verificationModel).value,
  //         resource: verification,
  //         // callback: this.createVerification.bind(self)
  //       }
  //     });
  //   }
  // }
  // createVerification(resource) {
  //   Actions.addVerification(resource, true);
  // }
