'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var ResourceList = require('./ResourceList');
var MessageList = require('./MessageList');
var Icon = require('react-native-vector-icons/Ionicons');
// var NewResource = require('./NewResource');
var Actions = require('../Actions/Actions');

var buttonStyles = require('../styles/buttonStyles');
var constants = require('@tradle/constants');
var reactMixin = require('react-mixin');
var ResourceViewMixin = require('./ResourceViewMixin');

var {
  View,
  AlertIOS,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;
// <View style={[buttonStyles.container1]}>
//                <TouchableHighlight onPress={this.createNewIdentity.bind(this)} underlayColor='transparent'>
//                  <View>
//                    <Icon name='plus'  size={25}  color='#f7f7f7'  style={buttonStyles.icon}/>
//                    <Text style={[buttonStyles.text, {color: '#f7f7f7'}]}>Add Identity</Text>
//                  </View>
//                </TouchableHighlight>
//              </View>
class ShowMessageRefList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startTop: props.resource[constants.TYPE] == constants.TYPES.IDENTITY && props.resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH] ? 70 : 15
    }
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var props = model.properties;

    var refList = [];
    var isIdentity = model.id === constants.TYPES.IDENTITY;
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH] : true;
    // The profile page for the device owner has 2 more profile specific links: add new identity and switch identity

    // if (this.props.resource[constants.TYPE] !== 'tradle.SimpleMessage' && this.props.resource[constants.TYPE] !== 'tradle.Verification')
    //   refList.push(
    //     <View style={buttonStyles.container}>
    //     <TouchableHighlight underlayColor='transparent' onPress={this.showMoreLikeThis.bind(this)}>
    //        <View style={{alignItems: 'center'}}>
    //          <Icon name='arrow-shrink'  size={35}  color='#ffffff'  style={[buttonStyles.icon, {paddingLeft: 1}]}/>
    //          <Text style={buttonStyles.text}>More like this</Text>
    //        </View>
    //     </TouchableHighlight>
    //     </View>
    //   );

    for (var p in props) {
      if (isIdentity  &&  !isMe  &&  props[p].allowRoles  &&  props[p].allowRoles === 'me')
        continue;
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon)
        icon = 'ios-checkmark-empty';
      if (props[p].items.ref === 'tradle.AdditionalInfo') {
        if (utils.getMe().organization)
          refList.push(
              <View style={buttonStyles.container}>
                 <TouchableHighlight onPress={() => {
                    var buttons = [{
                      text: 'Cancel',
                    },
                    {
                      text: 'OK',
                      onPress: this.props.additionalInfo.bind(this, this.props.resource, props[p])
                    }];
                    var to = this.props.resource;
                    AlertIOS.prompt(
                      'Sending ' + resource.title + ' form to ' + utils.getDisplayName(to, utils.getModel(to[constants.TYPE]).value.properties),
                      buttons
                    );

                   }
                 } underlayColor='transparent'>
                   <View style={{alignItems: 'center'}}>
                     <Icon name={icon}  size={35}  color='#ffffff'  style={[buttonStyles.icon, {paddingLeft: 7}]}/>
                     <Text style={buttonStyles.text}>{props[p].title}</Text>
                   </View>
                 </TouchableHighlight>
               </View>
              );
          // refList.push(
          //     <View style={buttonStyles.container}>
          //        <TouchableHighlight onPress={this.additionalInfo.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
          //          <View style={{alignItems: 'center'}}>
          //            <Icon name={icon}  size={35}  color='#ffffff'  style={[buttonStyles.icon, {paddingLeft: 7}]}/>
          //            <Text style={buttonStyles.text}>{props[p].title}</Text>
          //          </View>
          //        </TouchableHighlight>
          //      </View>
          //     );
      }
      else
        refList.push(
          <View style={buttonStyles.container}>
             <TouchableHighlight onPress={this.showResources.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
               <View style={{alignItems: 'center'}}>
                 <Icon name={icon}  size={35}  color='#ffffff'  style={[buttonStyles.icon, {paddingLeft: 7}]}/>
                 <Text style={buttonStyles.text}>{props[p].title}</Text>
               </View>
             </TouchableHighlight>
           </View>
          );
     }
     return refList.length
             ? (
                <View  style={{flexDirection: 'row'}}>
                  {refList}
                </View>
              )
             : null;
  }
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
  showMoreLikeThis() {
    var self = this;
    var modelName = this.props.resource[constants.TYPE];
    this.props.navigator.push({
      title: utils.getModel(modelName).value.title,
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
reactMixin(ShowMessageRefList.prototype, ResourceViewMixin);

module.exports = ShowMessageRefList;
