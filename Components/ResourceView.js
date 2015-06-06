'use strict';
 
var React = require('react-native');
var utils = require('../utils/utils');
var ViewCols = require('./ViewCols');
var PhotoView = require('./PhotoView');
var AddNewIdentity = require('./AddNewIdentity');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');

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
    this.state = {
      resource: props.resource,
      embedHeight: {height: 0}
    };
  }
  componentDidMount() {
    this.listenTo(Store, 'onResourceUpdate');
  }
  onResourceUpdate(params) {
    if (params.resource  &&  this.props.resource.rootHash === params.resource.rootHash)
      this.setState({resource: params.resource});
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
  }
  render() {
    var resource = this.state.resource;
    var modelName = resource['_type'];
    var model = utils.getModel(modelName).value;
 
    return (
      <ScrollView  ref='this' style={styles.container}>
        <View style={styles.photoBG}>
          <PhotoView resource={resource} />
        </View>
        <AddNewIdentity resource={resource} navigator={this.props.navigator} />
        <ViewCols resource={resource} />          
      </ScrollView>
    );
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
});

module.exports = ResourceView;