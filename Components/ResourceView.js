'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var ShowPropertiesView = require('./ShowPropertiesView');
var PhotoView = require('./PhotoView');
var PhotoList = require('./PhotoList');
var TimHome = require('./TimHome')
// var SignIn = require('./SignIn')
// var AddNewIdentity = require('./AddNewIdentity');
// var SwitchIdentity = require('./SwitchIdentity');
var ShowRefList = require('./ShowRefList');
var Icon = require('react-native-vector-icons/Ionicons');
// var IdentitiesList = require('./IdentitiesList');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceMixin = require('./ResourceMixin');
var QRCode = require('./QRCode')
var MessageList = require('./MessageList')
var defaultBankStyle = require('../styles/bankStyle.json')
var buttonStyles = require('../styles/buttonStyles');
import ActionSheet from 'react-native-actionsheet'
import iosStyles from '../styles/iosStyles'
import androidStyles from '../styles/androidStyles'
import { signIn } from '../utils/localAuth'
const TALK_TO_EMPLOYEE = '1'
// const SERVER_URL = 'http://192.168.0.162:44444/'

var extend = require('extend');
var constants = require('@tradle/constants');
const USE_TOUCH_ID = 0
const USE_GESTURE_PASSWORD = 1
const CHANGE_GESTURE_PASSWORD = 2
import {
  StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
  Platform,
  TextInput,
  Dimensions,
  Modal,
  TouchableHighlight,
} from 'react-native'

import React, { Component } from 'react'
let platformStyles = Platform.OS === 'ios' ? iosStyles : androidStyles

class ResourceView extends Component {
  constructor(props) {
    super(props);
    let me = utils.getMe()
    this.state = {
      resource: props.resource,
      embedHeight: {height: 0},
      isLoading: props.resource.id ? true : false,
      isModalOpen: false,
      useTouchId: me.useTouchId,
      useGesturePassword: me.useGesturePassword
    }
  }
  componentWillMount() {
    if (this.props.resource.id)
      Actions.getItem(this.props.resource)
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    if (params.action === 'showIdentityList')
      this.onShowIdentityList(params);
    else if (params.action === 'getItem') {
      this.setState({
        resource: params.resource,
        isLoading: false
      })
    }
    else if (params.action === 'newContact')
      this.closeModal()
    else  if (params.resource)
      this.onResourceUpdate(params);
    else if (params.action === 'employeeOnboarding') {
      let routes = this.props.navigator.getCurrentRoutes()
      // this.props.navigator.jumpTo(routes[1])
      let style = {}
      extend(style, defaultBankStyle)
      if (params.to.style)
        style = extend(style, params.to.style)
      this.props.navigator.replacePreviousAndPop({
        component: MessageList,
        title: utils.getDisplayName(params.to),
        id: 11,
        backButtonTitle: 'Back',
        passProps: {
          resource: params.to,
          filter: '',
          modelName: constants.TYPES.MESSAGE,
          // currency: params.organization.currency,
          bankStyle: style,
          // dictionary: params.dictionary,
        }
      }, 2)
      // this.props.navigator.jumpTo(routes[2])
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.isModalOpen  !== nextState.isModalOpen              ||
            this.state.useGesturePassword !== nextState.useGesturePassword ||
            this.state.useTouchId !== nextState.useTouchId)
           ? true
           : false
  }
  onResourceUpdate(params) {
    var resource = params.resource;
    // if (resource  &&  this.props.resource[constants.ROOT_HASH] === resource[constants.ROOT_HASH]) {
    //   var me = utils.getMe();
    //   if (resource[constants.ROOT_HASH] === me[constants.ROOT_HASH])
    //     utils.setMe(resource);
      this.setState({resource: resource});
    // }
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
    if (this.state.isLoading)
      return <View/>
    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var photos = [];
    if (resource.photos  &&  resource.photos.length > 1) {
      extend(photos, resource.photos);
      photos.splice(0, 1);
    }

    var isIdentity = model.id === constants.TYPES.PROFILE;
    var isOrg = model.id === constants.TYPES.ORGANIZATION;
    var me = utils.getMe()
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === me[constants.ROOT_HASH] : true;
    var actionPanel = ((isIdentity  &&  !isMe) || (isOrg  &&  (!me.organization  ||  utils.getId(me.organization) !== utils.getId(resource))))
    // if (isIdentity  &&  !isMe)
                    ? <View/>
                    : <ShowRefList showQR={this.openModal.bind(this)} resource={resource} currency={this.props.currency} navigator={this.props.navigator} />
    var qrcode
    if (isMe  &&  me.isEmployee  &&  me.organization && me.organization.url) {
      let width = Math.floor((Dimensions.get('window').width / 3) * 2)
      qrcode = <View style={{alignSelf: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding:10}} onPress={()=> this.setState({isModalOpen: true})}>
                 <QRCode inline={true} content={TALK_TO_EMPLOYEE + ';' + me.organization.url + ';' + utils.getId(me.organization).split('_')[1] + ';' + me[constants.ROOT_HASH]} dimension={width} />
               </View>
    }
    else
      qrcode = <View />


    let msg
    if (this.state.useTouchId  &&  this.state.useGesturePassword)
      msg = translate('bothOn')
    else if (this.state.useTouchId)
      msg = translate('touchIdOn')
    else
      msg = translate('passwordOn')
//, this.state.useTouchId ? {opacity: 1} : {opacity: 0.3}
    let switchTouchId = isIdentity
                      ? <View style={styles.footer}>
                          <Text style={styles.touchIdText}>{msg}</Text>
                          <TouchableHighlight underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
                             <View style={[platformStyles.menuButtonRegular]}>
                                <Icon name='md-finger-print' color={Platform.OS === 'ios' ? '#ffffff': 'red'} size={33} />
                              </View>
                            </TouchableHighlight>
                        </View>
                      : <View/>
    // let showSwitch = isIdentity && Platform.OS === 'ios'  && !utils.isSimulator()
    // let switchTouchId = showSwitch
    //                   ? <View style={styles.footer}>
    //                       <Text style={styles.touchIdText}>{msg}</Text>
    //                       <TouchableHighlight underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
    //                          <View style={[platformStyles.menuButtonRegular, this.state.useTouchId ? {opacity: 1} : {opacity: 0.3}]}>
    //                             <Icon name='md-finger-print' color={Platform.OS === 'ios' ? '#ffffff': 'red'} size={33} />
    //                           </View>
    //                         </TouchableHighlight>
    //                     </View>
    //                  : <View />
    // var switchTouchId = <View />
          // <AddNewIdentity resource={resource} navigator={this.props.navigator} />
          // <SwitchIdentity resource={resource} navigator={this.props.navigator} />
              // <Icon  onPress={() => this.closeModal()} name={} size={30} style={{fontSize: 20, color: '#ffffff', paddingHorizontal: 30, paddingVertical: 15}}>Close</Text>
    // let buttons = showSwitch
    //             ? [translate('useTouchId') + (this.state.useTouchId ? '    ✔️' : ''), translate('useGesturePassword') + (this.state.useGesturePassword ? '    ✔️' : '')]
    //             : []

    let buttons = []
    let actions = []
    if (isIdentity) {
      if (Platform.OS === 'ios') {
        if (!utils.isSimulator()) {
          buttons.push(translate('useTouchId') + (this.state.useTouchId ? ' ✓' : ''))
          actions.push(USE_TOUCH_ID)
        }
        buttons.push(translate('useGesturePassword') + (this.state.useGesturePassword ? ' ✓' : ''))
        actions.push(USE_GESTURE_PASSWORD)
      }
      if (this.state.useGesturePassword) {
        buttons.push(translate('changeGesturePassword'))
        actions.push(CHANGE_GESTURE_PASSWORD)
      }
    }
    buttons.push(translate('cancel'))
    return (
      <View style={{flex:1}}>
      <ScrollView  ref='this' style={platformStyles.container}>
        <View style={[styles.photoBG]}>
          <PhotoView resource={resource} navigator={this.props.navigator}/>
        </View>
        {actionPanel}
        <Modal animationType={'fade'} visible={this.state.isModalOpen} transparent={true} onRequestClose={() => this.closeModal()}>
          <TouchableHighlight  onPress={() => this.closeModal()} underlayColor='transparent'>
            <View style={styles.modalBackgroundStyle}>
              {qrcode}
            </View>
          </TouchableHighlight>
        </Modal>
        <PhotoList photos={photos} resource={this.props.resource} navigator={this.props.navigator} isView={true} numberInRow={photos.length > 4 ? 5 : photos.length} />
        <ShowPropertiesView resource={resource}
                            showItems={this.showResources.bind(this)}
                            showRefResource={this.getRefResource.bind(this)}
                            currency={this.props.currency}
                            excludedProperties={['photos']}
                            navigator={this.props.navigator} />
        <ActionSheet
          ref={(o) => {
            this.ActionSheet = o
          }}
          options={buttons}
          cancelButtonIndex={buttons.length - 1}
          onPress={(index) => {
            if (index < buttons.length - 1)
              this.changePreferences(index, actions[index])
          }}
        />
      </ScrollView>
      {switchTouchId}

      </View>
    );
  }
  openModal() {
    this.setState({isModalOpen: true});
  }
  closeModal() {
    this.setState({isModalOpen: false});
  }
  getRefResource(resource, prop) {
    var model = utils.getModel(this.props.resource[constants.TYPE]).value;

    this.state.prop = prop;
    this.state.propValue = utils.getId(resource.id);
    Actions.getItem(resource.id);
  }
  changePreferences(id, action) {
    let me = utils.getMe()
    let r = {
      _r: me[constants.ROOT_HASH],
      _t: constants.TYPES.PROFILE,
    }
    let isChangeGesturePassword
    switch (action) {
    case USE_TOUCH_ID:
      r.useTouchId = me.useTouchId ? (me.useGesturePassword ? false : true) : true
      r.useGesturePassword = me.useGesturePassword
      break
    case USE_GESTURE_PASSWORD:
      r.useGesturePassword = me.useGesturePassword ? (me.useTouchId ? false : true) : true
      r.useTouchId = me.useTouchId
      break
    case CHANGE_GESTURE_PASSWORD:
      isChangeGesturePassword = true
      break
    }
    if (!r.useGesturePassword  &&  !r.useTouchId)
      r.useGesturePassword = true
    if (!isChangeGesturePassword          &&
        me.useTouchId === r.useTouchId    &&
        me.useGesturePassword === r.useGesturePassword)
      return
    let self = this
    signIn(self.props.navigator, r, isChangeGesturePassword)
      .then(() => {
        Actions.addItem({resource: me, value: r, meta: utils.getModel(constants.TYPES.PROFILE).value})
        let popToThePreviousScreen = me.useGesturePassword  &&  (!r.useGesturePassword  ||  r.useTouchId)
        let popTwoScreensBack = isChangeGesturePassword
        let routes = self.props.navigator.getCurrentRoutes()
        if (popToThePreviousScreen)
          self.props.navigator.pop()
        else if (popTwoScreensBack)
          self.props.navigator.popToRoute(routes[routes.length - 3])
        self.setState({useGesturePassword: r.useGesturePassword, useTouchId: r.useTouchId})
      })
    // this.props.navigator.push({
    //   id: 1,
    //   backButtonTitle: null,
    //   component: TimHome,
    //   passProps: {
    //     navigator: this.props.navigator,
    //     modelName: constants.TYPES.PROFILE,
    //     newMe: r
    //   }
    // })

    // this.setState({useGesturePassword: r.useGesturePassword, useTouchId: r.useTouchId})
    // Actions.addItem({resource: me, value: r, meta: utils.getModel(constants.TYPES.PROFILE).value})
  }
}
reactMixin(ResourceView.prototype, Reflux.ListenerMixin);
reactMixin(ResourceView.prototype, ResourceMixin);

var styles = StyleSheet.create({
  // container: {
  //   marginTop: Platform.OS === 'ios' ? 64 : 44,
  //   flex: 1,
  // },
  modalBackgroundStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
    height: Dimensions.get('window').height
  },
  photoBG: {
    backgroundColor: '#245D8C',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    height: 45,
    width: Dimensions.get('window').width,
    backgroundColor: '#eeeeee',
    borderColor: '#eeeeee',
    borderWidth: 1,
    borderTopColor: '#cccccc',
    paddingRight: 10
  },
  touchIdText: {
    color: '#2E3B4E',
    fontSize: 18,
    marginVertical: 10,
    marginLeft: 15,
    alignSelf: 'flex-start'
  }
});

module.exports = ResourceView;
