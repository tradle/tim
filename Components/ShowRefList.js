'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var translate = utils.translate
var ResourceList = require('./ResourceList');
var Icon = require('react-native-vector-icons/Ionicons');
// var { Icon } = require('react-native-icons');

var buttonStyles = require('../styles/buttonStyles');
var constants = require('@tradle/constants');
var reactMixin = require('react-mixin');
var ResourceViewMixin = require('./ResourceViewMixin');

var {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Component
} = React;
// <View style={[buttonStyles.container1]}>
//                <TouchableHighlight onPress={this.createNewIdentity.bind(this)} underlayColor='transparent'>
//                  <View>
//                    <Icon name='plus'  size={25}  color='#f7f7f7'  style={buttonStyles.icon}/>
//                    <Text style={[buttonStyles.text, {color: '#f7f7f7'}]}>Add PROFILE</Text>
//                  </View>
//                </TouchableHighlight>
//              </View>
class ShowRefList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startTop: props.resource[constants.TYPE] == constants.TYPES.PROFILE && props.resource[constants.ROOT_HASH] === utils.getMe()[constants.ROOT_HASH] ? 70 : 15
    }
  }
  render() {
    var resource = this.props.resource;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var props = model.properties;

    var refList = [];
    var isIdentity = model.id === constants.TYPES.PROFILE;
    var me = utils.getMe()
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === me[constants.ROOT_HASH] : true;
    // The profile page for the device owner has 2 more profile specific links: add new PROFILE and switch PROFILE
    for (var p in props) {
      if (isIdentity) {
        if (!isMe  &&  props[p].allowRoles  &&  props[p].allowRoles === 'me')
          continue;
        if (p === 'verifiedByMe'  &&  !me.organization)
          continue;
        if (p == 'myVerifications' && me.organization)
          continue;
      }
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).value.icon;
      if (!icon)
        icon = 'ios-checkmark-empty';
        // icon = 'ios-checkmark-outline';
      var key = p
      var cnt = 1
      refList.push(
        <View style={buttonStyles.container} key={getNextKey(key)}>
           <TouchableHighlight onPress={this.showResources.bind(this, this.props.resource, props[p])} underlayColor='transparent'>
             <View style={{alignItems: 'center'}} key={getNextKey(key)}>
               <Icon name={icon}  size={30}  color='#ffffff' />
               <Text style={buttonStyles.text}>{translate(props[p], model)}</Text>
             </View>
           </TouchableHighlight>
         </View>
        );
     }
     return refList.length
             ?  <View style={buttonStyles.buttons} key={'ShowRefList'}>
                  <View  style={{flexDirection: 'row'}}>
                    {refList}
                  </View>
                </View>
             : <View/>;
    function getNextKey(key) {
      return key + '_' + cnt++
    }
  }
}
reactMixin(ShowRefList.prototype, ResourceViewMixin);

module.exports = ShowRefList;
