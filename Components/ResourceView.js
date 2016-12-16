'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var fontSize = utils.getFontSize
var ShowPropertiesView = require('./ShowPropertiesView');
var PhotoView = require('./PhotoView');
import PhotoList from './PhotoList';
// import {MIN_WIDTH} from './PhotoList';
// var AddNewIdentity = require('./AddNewIdentity');
// var SwitchIdentity = require('./SwitchIdentity');
var ShowRefList = require('./ShowRefList');
var PageView = require('./PageView')
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
var ENV = require('../utils/env')
var StyleSheet = require('../StyleSheet')

// var ResourceList = require('./ResourceList')

import ActionSheet from 'react-native-actionsheet'

import platformStyles from '../styles/platform'
import { signIn } from '../utils/localAuth'
import { makeResponsive } from 'react-native-orient'

const TALK_TO_EMPLOYEE = '1'
// const SERVER_URL = 'http://192.168.0.162:44444/'

var extend = require('extend');
var constants = require('@tradle/constants');
const USE_TOUCH_ID = 0
const USE_GESTURE_PASSWORD = 1
const CHANGE_GESTURE_PASSWORD = 2
const PAIR_DEVICES = 3
const WIPE_DEVICE = 4
import {
  // StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
  Platform,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  TouchableHighlight,
} from 'react-native'

import React, { Component } from 'react'

class ResourceView extends Component {
  static displayName = 'ResourceView';
  constructor(props) {
    super(props);
    let me = utils.getMe()
    this.state = {
      resource: props.resource,
      isLoading: props.resource.id ? true : false,
      isModalOpen: false,
      useTouchId: me && me.useTouchId,
      useGesturePassword: me && me.useGesturePassword,
    }
    let currentRoutes = this.props.navigator.getCurrentRoutes()
    let len = currentRoutes.length
    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle)
      currentRoutes[len - 1].onRightButtonPress = this.props.action.bind(this)
  }
  componentWillMount() {
    if (this.props.resource.id  ||  this.props.resource[constants.TYPE] === constants.TYPES.PROFILE)
      Actions.getItem(this.props.resource)
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    if (params.resource  &&  params.resource[constants.ROOT_HASH] !== this.props.resource[constants.ROOT_HASH])
      return

    switch (params.action) {
    case 'showIdentityList':
      this.onShowIdentityList(params)
      break
    case 'getItem':
      this.setState({
        resource: params.resource,
        isLoading: false
      })
      break
    case 'genPairingData':
      if (params.error)
        Alert.alert(params.error)
      else
        this.setState({pairingData: params.pairingData, isModalOpen: true})
      break
    case 'invalidPairingRequest':
      this.props.navigator.pop()
      Alert.alert(translate(params.error))
      break
    case 'acceptingPairingRequest':
      this.closeModal()
      // check signature
      signIn(this.props.navigator, utils.getMe())
        .then(() => {
          Actions.pairingRequestAccepted(params.resource)
        })
      break
    case 'pairingRequestAccepted':
      this.props.navigator.pop()
      break
    case 'newContact':
      this.closeModal()
      break
    case 'employeeOnboarding':
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
      break
    default:
      if (params.resource)
        this.onResourceUpdate(params)
      break
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return utils.resized(this.props, nextProps)                            ||
            this.state.isModalOpen  !== nextState.isModalOpen             ||
            this.state.useGesturePassword !== nextState.useGesturePassword ||
            this.state.useTouchId !== nextState.useTouchId                 ||
            this.state.pairingData !== nextState.pairingData
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

    var dimensions = this.props.dimensions
    var styles = createStyles()

    var resource = this.state.resource;
    var modelName = resource[constants.TYPE];
    var model = utils.getModel(modelName).value;
    var photos = []
    if (resource.photos) { //  &&  resource.photos.length > 1) {
      extend(photos, resource.photos);
      // photos.splice(0, 1);
    }

    var isIdentity = model.id === constants.TYPES.PROFILE;
    var isOrg = model.id === constants.TYPES.ORGANIZATION;
    var me = utils.getMe()
    var actionPanel
    var isMe = isIdentity ? resource[constants.ROOT_HASH] === me[constants.ROOT_HASH] : false
    if (me) {
      actionPanel = ((isIdentity  &&  !isMe) || (isOrg  &&  (!me.organization  ||  utils.getId(me.organization) !== utils.getId(resource))))
                  ? <View/>
                  : <ShowRefList showQR={this.openModal.bind(this)} resource={resource} currency={this.props.currency} navigator={this.props.navigator} />
    }
    else
      actionPanel = <View/>
    var qrcode, w
    var {width, height} = utils.dimensions(ResourceView)
    if (this.state.pairingData) {
      w = Math.floor((width / 3) * 2)
      qrcode = <View style={{alignSelf: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding:10}} onPress={()=> this.setState({isModalOpen: true})}>
                 <QRCode inline={true} content={this.state.pairingData} dimension={w} />
               </View>
    }
    else if (isMe  &&  me.isEmployee  &&  me.organization && me.organization.url) {
      w = Math.floor((width / 3) * 2)
      qrcode = <View style={{alignSelf: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding:10}} onPress={()=> this.setState({isModalOpen: true})}>
                 <QRCode inline={true} content={TALK_TO_EMPLOYEE + ';' + me.organization.url + ';' + utils.getId(me.organization).split('_')[1] + ';' + me[constants.ROOT_HASH]} dimension={w} />
               </View>
    }
    else
      qrcode = <View />

    // let recentActivity = <View/>
    // if (isMe) {
    //   let type = 'tradle.ProductApplication'
    //   let listView = true
    //   recentActivity = <ResourceList modelName={type} listView={listView} resource={me} navigator={this.props.navigator} />
    // }
    let msg = ''
    // if (this.state.useTouchId  &&  this.state.useGesturePassword)
    //   msg = translate('bothOn')
    // else if (this.state.useTouchId)
    //   msg = translate('touchIdOn')
    // else
    //   msg = translate('passwordOn')
////, this.state.useTouchId ? {opacity: 1} : {opacity: 0.3}
    let switchTouchId = isIdentity
                      ? <View style={styles.footer}>
                          <Text style={platformStyles.touchIdText}>{msg}</Text>
                          <TouchableHighlight underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
                             <View style={[platformStyles.menuButtonRegular]}>
                                <Icon name='md-finger-print' color={Platform.OS === 'android' ? 'red' : '#ffffff'} size={fontSize(33)} />
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
    if (isIdentity  &&  isMe) {
      if (utils.isIOS()) {
        // when both auth methods are available, give the choice to disable one
        buttons.push(translate('useTouchId') + (this.state.useTouchId ? ' ✓' : ''))
        actions.push(USE_TOUCH_ID)
        buttons.push(translate('useGesturePassword') + (this.state.useGesturePassword ? ' ✓' : ''))
        actions.push(USE_GESTURE_PASSWORD)
      }

      if (this.state.useGesturePassword || !utils.isIOS()) {
        buttons.push(utils.isWeb() ? translate('changePassword') : translate('changeGesturePassword'))
        actions.push(CHANGE_GESTURE_PASSWORD)
      }
      buttons.push(translate('pairDevices'))
      actions.push(PAIR_DEVICES)
    }

    if (utils.isWeb()) {
      buttons.push(translate('wipeDevice'))
      actions.push(WIPE_DEVICE)
    }

    buttons.push(translate('cancel'))

    // let numberInRow = Math.min(width / MIN_WIDTH, photos.length)
        // <PhotoList photos={photos} resource={this.props.resource} navigator={this.props.navigator} isView={true} numberInRow={numberInRow} />
    return (
      <PageView style={platformStyles.container}>
      <ScrollView  ref='this'>
        {photos.length === 1
          ? <View style={styles.photoBG}>
              <PhotoView resource={resource} navigator={this.props.navigator}/>
            </View>
          : <View/>
        }
        {actionPanel}
        <Modal animationType={'fade'} visible={this.state.isModalOpen} transparent={true} onRequestClose={() => this.closeModal()}>
          <TouchableHighlight  onPress={() => this.closeModal()} underlayColor='transparent'>
            <View style={styles.modalBackgroundStyle}>
              {qrcode}
            </View>
          </TouchableHighlight>
        </Modal>
        <PhotoList photos={photos} resource={this.props.resource} navigator={this.props.navigator} isView={true} />
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

      </PageView>
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
    case PAIR_DEVICES:
      Actions.genPairingData()
      return
    case WIPE_DEVICE:
      Actions.requestWipe()
      return
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
        if (isChangeGesturePassword) {
          let routes = self.props.navigator.getCurrentRoutes()
          self.props.navigator.popToRoute(routes[routes.length - 3])
        } else {
          self.props.navigator.pop()
        }

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
ResourceView = makeResponsive(ResourceView)

var createStyles = utils.styleFactory(ResourceView, function ({ dimensions }) {
  return StyleSheet.create({
    // container: {
    //   marginTop: Platform.OS === 'ios' ? 64 : 44,
    //   flex: 1,
    // },
    modalBackgroundStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
      height: dimensions.height
    },
    photoBG: {
      // backgroundColor: '#245D8C',
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      height: 45,
      width: dimensions.width,
      backgroundColor: '#eeeeee',
      borderColor: '#eeeeee',
      borderWidth: 1,
      borderTopColor: '#cccccc',
      paddingRight: 10,
    }
  })
})

module.exports = ResourceView;
