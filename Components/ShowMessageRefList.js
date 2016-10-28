'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ResourceList = require('./ResourceList');
var MessageList = require('./MessageList');
var Icon = require('react-native-vector-icons/Ionicons');
var buttonStyles = require('../styles/buttonStyles');
var constants = require('@tradle/constants');
var reactMixin = require('react-mixin');
var ResourceMixin = require('./ResourceMixin');
var RowMixin = require('./RowMixin');

import {
  View,
  AlertIOS,
  Text,
  TextInput,
  TouchableHighlight,
} from 'react-native'

import React, { Component } from 'react'

class ShowMessageRefList extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var props = model.properties;

    var refList = [];
    var isIdentity = model.id === constants.TYPES.PROFILE;
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH] : true;
    let backlinks = []
    for (var p in props) {
      if (isIdentity  &&  !isMe  &&  props[p].allowRoles  &&  props[p].allowRoles === 'me')
        continue;
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      backlinks.push(props[p])
    }
    backlinks.forEach((prop) => {
      // if (isIdentity  &&  !isMe  &&  props[p].allowRoles  &&  props[p].allowRoles === 'me')
      //   continue;
      // if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
      //   continue;
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon)
        icon = 'ios-checkmark';
      let style = [buttonStyles.container, {flex: 1, alignSelf: 'stretch'}]
      refList.push(
        <View style={style} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.showResources.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
             <View style={{alignItems: 'center'}}>
               <Icon name={icon}  size={35}  color='#ffffff' />
               <Text style={buttonStyles.text}>{translate(props[p], model)}</Text>
             </View>
           </TouchableHighlight>
         </View>
        );
      // }
     })

     var backlinksBg = this.props.bankStyle && this.props.bankStyle.PRODUCT_ROW_BG_COLOR ? {backgroundColor: this.props.bankStyle.PRODUCT_ROW_BG_COLOR} : {backgroundColor: '#a0a0a0'}
     return refList.length
             ? (
               <View style={[buttonStyles.buttons, backlinksBg, {flexDirection: 'row'}]}>
                  {refList}
                </View>
              )
             : <View/>;
  }
  showMoreLikeThis() {
    var self = this;
    var modelName = this.props.resource[constants.TYPE];
    this.props.navigator.push({
      title: translate(utils.getModel(modelName).value),
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: utils.getMe(),
        filter: '',
        isAggregation: true,
        modelName: modelName,
      }
    });
  }
}
reactMixin(ShowMessageRefList.prototype, ResourceMixin);
reactMixin(ShowMessageRefList.prototype, RowMixin);

module.exports = ShowMessageRefList;

  // additionalInfo(resource, prop) {
  //   var rmodel = utils.getModel(resource[constants.TYPE]).value;
  //   var r = {
  //     _t: prop.items.ref,
  //     from: utils.getMe(),
  //     to: resource.from
  //   };
  //   r[prop.items.backlink] = {
  //     id: resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH],
  //     title: utils.getDisplayName(resource, rmodel.properties)
  //   }
  //   var model = utils.getModel(prop.items.ref).value;
  //   this.props.navigator.push({
  //     title: model.title,
  //     id: 4,
  //     component: NewResource,
  //     titleTextColor: '#7AAAC3',
  //     backButtonTitle: 'Back',
  //     rightButtonTitle: 'Done',
  //     passProps: {
  //       model: model,
  //       resource: r,
  //       callback: () => Actions.list({
  //         modelName: prop.items.ref,
  //         to: this.props.resource,
  //         resource: r
  //       }),
  //     }
  //   })

  // }


      // if (props[p].items.ref === constants.TYPES.ADDITIONAL_INFO) {
      //   if (utils.getMe().organization)
      //     refList.push(
      //       <View style={buttonStyles.container} key={this.getNextKey()}>
      //          <TouchableHighlight onPress={() => {
      //             var buttons = [{
      //               text: 'Cancel',
      //             },
      //             {
      //               text: 'OK',
      //               onPress: this.props.additionalInfo.bind(this, this.props.resource, props[p])
      //             }];
      //             var to = this.props.resource;
      //             AlertIOS.prompt(
      //               'Sending ' + resource.title + ' form to ' + utils.getDisplayName(to, utils.getModel(to[constants.TYPE]).value.properties),
      //               buttons
      //             );

      //            }
      //          } underlayColor='transparent'>
      //            <View style={{alignItems: 'center'}}>
      //              <Icon name={icon}  size={35}  color='#ffffff' />
      //              <Text style={buttonStyles.text}>{translate(props[p], model)}</Text>
      //            </View>
      //          </TouchableHighlight>
      //        </View>
      //     );
      // }
      // else {
