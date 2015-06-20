'use strict';
 
var React = require('react-native');
var Reflux = require('reflux');
var reactMixin = require('react-mixin');
var utils = require('../utils/utils');
var NewResource = require('./NewResource');
var ResourceView = require('./ResourceView');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Icon = require('FAKIconImage');

var MESSAGE_INTERFACE = 'tradle.Message';

var {
  StyleSheet,
  Image, 
  View,
  Text,
  Component,
  TouchableHighlight
} = React;

class FromToView extends Component {
  componentDidMount() {
    this.listenTo(Store, 'onGetItem');
  }
  onGetItem(params) {
    if (params.action  &&  params.action === 'getItem')
      this.showProfile(params.resource);
  }
  render() {
    var resource = this.props.resource;    

    var model = this.props.model || utils.getModel(resource['_type']).value;
    if (!model.interfaces  ||  model.interfaces.indexOf(MESSAGE_INTERFACE) == -1) 
      return <View />;

    var photoProp = utils.getCloneOf(MESSAGE_INTERFACE + '.photos', model.properties);

    var hasPhoto = true; //resource[photoProp]  &&  resource[photoProp].length; 
    var fromTitle = resource.from.title ? resource.from.title :  utils.getDisplayName(resource.from, utils.getModel(resource.from['_type']).value.properties);
    var toTitle = resource.to.title ? resource.to.title : utils.getDisplayName(resource.to, utils.getModel(resource.to['_type']).value.properties);
    if (!resource.to.photos && !resource.from.photos)
      return <View style={styles.container}>
               <Text>{fromTitle}</Text>
               <Text>{toTitle}</Text>
             </View>      
    var style = hasPhoto ? {marginTop: -70} : {marginTop: 0};
    var toPhoto = resource.to.photos && resource.to.photos[0].url;
    if (toPhoto)
      toPhoto = utils.getImageUri(toPhoto);
    var fromPhoto = resource.from.photos && resource.from.photos[0].url;
    if (fromPhoto)
      fromPhoto = utils.getImageUri(fromPhoto);
    return <View style={[styles.container, style]}>
            <TouchableHighlight underlayColor='transparent' onPress={() => 
              {
                if (resource.from.id)
                  Actions.getItem(resource.from.id)
                else
                  this.showProfile(resource.from)
              }
            }>
             <View  style={{flexDirection: 'column'}}>
               <Image style={styles.thumb} source={{uri: fromPhoto}} />
               <Text>{fromTitle}</Text>
             </View>
             </TouchableHighlight>
            <Icon name='fontawesome|long-arrow-right'   size={70}  color='#f7f7f7'  style={styles.arrow} />
            <TouchableHighlight underlayColor='transparent' onPress={() => 
               {
                 if (resource.to.id)
                   Actions.getItem(resource.to.id)
                 else
                   this.showProfile(resource.to)
               }
             }>
             <View  style={{flexDirection: 'column'}}>
               <Image style={styles.thumb} source={{uri: toPhoto}} />
               <Text>{toTitle}</Text>
             </View>
             </TouchableHighlight>
          </View>
  }

  showProfile(resource) {
    var model = utils.getModel(resource['_type']).value;
    var title = utils.getDisplayName(resource, model.properties);
    this.props.navigator.push({
      title: title,
      id: 3,
      component: ResourceView,
      titleTextColor: '#7AAAC3',
      rightButtonTitle: 'Edit',
      backButtonTitle: 'Back',
      onRightButtonPress: {
        title: title,
        id: 4,
        component: NewResource,
        backButtonTitle: resource.firstName,
        rightButtonTitle: 'Done',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: model,
          resource: resource
        }
      },

      passProps: {resource: resource}
    });
    
  }
}
reactMixin(FromToView.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20
  },
  arrow: {
    width:  70,
    height: 70,
  },
  thumb: {
    width: 70,
    height: 70,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#D7E6ED'
  },
});

module.exports = FromToView;