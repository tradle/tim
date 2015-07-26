'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ShowPropertiesView = require('./ShowPropertiesView');
var PhotoView = require('./PhotoView');
var PhotosList = require('./PhotosList');
var AddNewIdentity = require('./AddNewIdentity');
var SwitchIdentity = require('./SwitchIdentity');
var IdentitiesList = require('./IdentitiesList');
var ResourceList = require('./ResourceList');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var extend = require('extend');
var constants = require('tradle-constants');

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
    else  
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

    return (
      <View style={{flex:1}}>
      <ScrollView  ref='this' style={styles.container}>
        <View style={styles.photoBG}>
          <PhotoView resource={resource} />
        </View>
        <AddNewIdentity resource={resource} navigator={this.props.navigator} />
        <SwitchIdentity resource={resource} navigator={this.props.navigator} />
        <PhotosList photos={photos} navigator={this.props.navigator} numberInRow={photos.length > 4 ? 5 : photos.length} />    
        <ShowPropertiesView resource={resource} callback={this.showResources.bind(this)} excludedProperties={['photos']}/>      
      </ScrollView>
      </View>
    );
  }
  showResources(resource, prop) {
    var meta = utils.getModel(resource[constants.TYPE]).value.properties;
    this.props.navigator.push({
      id: 10,
      title: utils.makeLabel(prop),
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      component: ResourceList,
      passProps: {
        modelName: meta[prop].items.ref,
        filter: '',
        resource: resource,
        prop: prop
      }
    });
  }
}
reactMixin(ResourceView.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    marginTop: 60,
    flex: 1,
  },
  photoBG: {
    backgroundColor: '#2E3B4E',
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