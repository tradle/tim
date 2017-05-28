'use strict';

var Reflux = require('reflux');
var reactMixin = require('react-mixin');
var utils = require('../utils/utils');
var NewResource = require('./NewResource');
var ResourceView = require('./ResourceView');
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
import Icon from 'react-native-vector-icons/Ionicons';
var constants = require('@tradle/constants');

import {
  StyleSheet,
  Image,
  View,
  Text,
  TouchableHighlight
} from 'react-native'

import React, { Component } from 'react'

class FromToView extends Component {
  componentDidMount() {
    this.listenTo(Store, 'onGetItem');
  }
  onGetItem(params) {
    if (params.action  &&  (params.action === 'getFrom' || params.action === 'getTo')) { //  &&  params.resource[constants.TYPE] === this.props.resource[constants.TYPE])
      var paramsRID = params.resource[constants.TYPE] + '_' + params.resource[constants.ROOT_HASH]
      if (paramsRID === utils.getId(this.props.resource.to)  ||  paramsRID === utils.getId(this.props.resource.from))
        this.showProfile(params.resource);
    }
  }
  render() {
    var resource = this.props.resource;

    var model = this.props.model || utils.getModel(resource[constants.TYPE]).value;
    if (!model.interfaces  ||  model.interfaces.indexOf(constants.TYPES.MESSAGE) == -1 || model.id === 'tradle.Verification')
      return <View />;

    var hasPhoto = true; //resource[photoProp]  &&  resource[photoProp].length;
    var fromTitle = resource.from.title ? resource.from.title :  utils.getDisplayName(resource.from, utils.getModel(resource.from[constants.TYPE]).value.properties);
    var toTitle = resource.to
                ? resource.to.title ? resource.to.title : utils.getDisplayName(resource.to, utils.getModel(resource.to[constants.TYPE]).value.properties)
                : null;
    if (!resource.to  ||  (!resource.to.photos && !resource.from.photos))
      return <View style={styles.container}>
               <Text>{fromTitle}</Text>
               <Text>{toTitle}</Text>
             </View>
    var style = hasPhoto ? {marginTop: -70} : {marginTop: 0};
    var toPhoto = resource.to.photos && resource.to.photos[0].url;
    if (toPhoto)
      toPhoto = <Image style={styles.icon} source={{uri: utils.getImageUri(toPhoto)}} />
    else if (resource.to)
      toPhoto = <Icon style={[styles.icon, {paddingLeft: 5}]} color='#2E3B4E' name='android-person' size={60} />
    else
      toPhoto = <View />

    var fromPhoto = resource.from.photos && resource.from.photos[0].url;
    if (fromPhoto)
      fromPhoto = <Image style={styles.icon} source={{uri: utils.getImageUri(fromPhoto)}} />
    else
      fromPhoto = <Icon style={[styles.icon, {paddingLeft: 5}]} color='#7AAAC3' name='ios-person' size={90} />
      // fromPhoto = utils.getImageUri(fromPhoto);
    return <View style={[styles.container, style]}>
            <TouchableHighlight underlayColor='transparent' onPress={() =>
              {
                if (resource.from.id)
                  Actions.getFrom(utils.getId(resource.from))
                else
                  this.showProfile(resource.from)
              }
            }>
             <View  style={{flexDirection: 'column'}}>
               {fromPhoto}
               <Text>{fromTitle}</Text>
             </View>
             </TouchableHighlight>
            <Icon name='arrow-right-a' size={70} color='#f7f7f7' style={styles.arrow} />
            <TouchableHighlight underlayColor='transparent' onPress={() =>
               {
                 if (resource.to.id)
                   Actions.getTo(utils.getId(resource.to.id))
                 else
                   this.showProfile(resource.to)
               }
             }>
             <View  style={{flexDirection: 'column'}}>
               {toPhoto}
               <Text>{toTitle}</Text>
             </View>
             </TouchableHighlight>
          </View>
  }

  showProfile(resource) {
    var model = utils.getModel(resource[constants.TYPE]).value;
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
    width:  75,
    height: 75,
    shadowColor: '#2E3B4E',
    shadowOffset: {width: 0.5, height: 0.5},
    shadowOpacity: 1,
    shadowRadius: 1,
    marginTop: -5,
    paddingLeft: 5
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 33,
    borderWidth: 2,
    borderColor: '#7AAAC3',
    // color: '#ffffff',
    backgroundColor: '#f7f7f7'
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
