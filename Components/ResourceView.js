'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var ShowPropertiesView = require('./ShowPropertiesView');
var PhotoView = require('./PhotoView');
var PhotoList = require('./PhotoList');
var AddNewIdentity = require('./AddNewIdentity');
var SwitchIdentity = require('./SwitchIdentity');
var ShowRefList = require('./ShowRefList');
var IdentitiesList = require('./IdentitiesList');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceViewMixin = require('./ResourceViewMixin');
var QRCode = require('./QRCode')
var buttonStyles = require('../styles/buttonStyles');

var extend = require('extend');
var constants = require('@tradle/constants');

var {
  StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;

class ResourceView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
      embedHeight: {height: 0}
    };
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    if (params.action === 'showIdentityList')
      this.onShowIdentityList(params);
    else if (params.action == 'getItem')
      this.showRefResource(params.resource)
    else  if (params.resource)
      this.onResourceUpdate(params);

  }
  onResourceUpdate(params) {
    var resource = params.resource;
    if (resource  &&  this.props.resource[constants.ROOT_HASH] === resource[constants.ROOT_HASH]) {
      var me = utils.getMe();
      if (resource[constants.ROOT_HASH] === me[constants.ROOT_HASH])
        utils.setMe(resource);
      this.setState({resource: resource});
    }
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
  }
  onShowIdentityList(params) {
    var me = utils.getMe();
    this.props.navigator.push({
      id: 8,
      title: 'My Identities',
      component: IdentitiesList,
      backButtonTitle: 'Profile',
      passProps: {
        filter: '',
        list: params.list
      }
    });
  }

  render() {
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var photos = [];
    if (resource.photos  &&  resource.photos.length > 1) {
      extend(photos, resource.photos);
      photos.splice(0, 1);
    }
    var actionPanel;
    var isIdentity = model.id === constants.TYPES.IDENTITY;
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH] : true;
    if (isIdentity  &&  !isMe)
      actionPanel = <View/>
    else
      actionPanel = <ShowRefList resource={resource} navigator={this.props.navigator} />

          // <AddNewIdentity resource={resource} navigator={this.props.navigator} />
          // <SwitchIdentity resource={resource} navigator={this.props.navigator} />
    return (
      <ScrollView  ref='this' style={styles.container}>
        <View style={[styles.photoBG]}>
          <PhotoView resource={resource} navigator={this.props.navigator}/>
        </View>
        {actionPanel}
        <View>
          <QRCode inline={true} content={resource[constants.ROOT_HASH]} dimension={370} />
        </View>
        <PhotoList photos={photos} resource={this.props.resource} navigator={this.props.navigator} isView={true} numberInRow={photos.length > 4 ? 5 : photos.length} />
        <ShowPropertiesView resource={resource}
                            showItems={this.showResources.bind(this)}
                            showRefResource={this.getRefResource.bind(this)}
                            excludedProperties={['photos']}
                            navigator={this.props.navigator} />
      </ScrollView>
    );
  }

  getRefResource(resource, prop) {
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;

    this.state.prop = prop;
    this.state.propValue = utils.getId(resource.id);
    Actions.getItem(resource.id);
  }

}
reactMixin(ResourceView.prototype, Reflux.ListenerMixin);
reactMixin(ResourceView.prototype, ResourceViewMixin);

var styles = StyleSheet.create({
  container: {
    marginTop: 60,
    flex: 1,
  },
  photoBG: {
    backgroundColor: '#245D8C',
    alignItems: 'center',
  },
  // footer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: '#eeeeee',
  //   borderBottomColor: '#eeeeee',
  //   borderRightColor: '#eeeeee',
  //   borderLeftColor: '#eeeeee',
  //   borderWidth: 1,
  //   borderTopColor: '#cccccc',
  //   height: 35,
  //   paddingVertical: 5,
  //   paddingHorizontal: 10,
  //   alignSelf: 'stretch'
  // }

});

module.exports = ResourceView;
