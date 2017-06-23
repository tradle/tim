'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var fontSize = utils.getFontSize
var ShowPropertiesView = require('./ShowPropertiesView');
var PhotoView = require('./PhotoView');
var PhotoList = require('./PhotoList');
var ShowRefList = require('./ShowRefList');
var PageView = require('./PageView')
import Icon from 'react-native-vector-icons/Ionicons';
var IdentitiesList = require('./IdentitiesList');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceMixin = require('./ResourceMixin');
var QRCode = require('./QRCode')
var MessageList = require('./MessageList')
var defaultBankStyle = require('../styles/defaultBankStyle.json')
var ENV = require('../utils/env')
var StyleSheet = require('../StyleSheet')
var extend = require('extend');
var constants = require('@tradle/constants');

var HomePageMixin = require('./HomePageMixin')

var ResourceList = require('./ResourceList')

// import ActionSheet from './ActionSheet'
import ActionSheet from 'react-native-actionsheet'

import platformStyles from '../styles/platform'
import { signIn } from '../utils/localAuth'
import { makeResponsive } from 'react-native-orient'
import Log from './Log'
import debug from '../utils/debug'
import ConversationsIcon from './ConversationsIcon'
import pick from 'object.pick'
import Navs from '../utils/navs'

const TALK_TO_EMPLOYEE = '1'
// const SERVER_URL = 'http://192.168.0.162:44444/'

const SCAN_QR_CODE = 0
const USE_TOUCH_ID = 1
const USE_GESTURE_PASSWORD = 2
const CHANGE_GESTURE_PASSWORD = 3
const PAIR_DEVICES = 4
const VIEW_DEBUG_LOG = 5
const MY_PRODUCT = 'tradle.MyProduct'
const PROFILE = constants.TYPES.PROFILE

const TYPE = constants.TYPE
const ROOT_HASH = constants.ROOT_HASH
const FORM = 'tradle.Form'
const VERIFICATION = 'tradle.Verification'
const AUTH_PROPS = ['useTouchId', 'useGesturePassword']

import {
  // StyleSheet,
  // ScrollView,
  Image,
  View,
  Text,
  Platform,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native'

import {
  LazyloadScrollView,
} from 'react-native-lazyload'

const ScrollView = LazyloadScrollView
const LAZY_ID = 'lazyload-list'

import React, { Component } from 'react'

const FINGERPRINT_COLOR = {
  ios: '#ffffff',
  web: '#ffffff',
  android: '#ff0000'
}

let INSTANCE_ID = 0

class ResourceView extends Component {
  static displayName = 'ResourceView';
  constructor(props) {
    super(props);
    this._lazyId = LAZY_ID + INSTANCE_ID++

    let me = utils.getMe()
    let resource = props.resource
    this.state = {
      resource: resource,
      isLoading:  resource[TYPE] && resource[TYPE] !== PROFILE ? false : true, //props.resource.id ? true : false,
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
    let resource = this.props.resource
    // if (resource.id  ||  resource[TYPE] === PROFILE  ||  resource[TYPE] === ORGANIZATION)
    if (resource.id || resource[constants.ROOT_HASH])
      Actions.getItem(resource)
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    let isMe = utils.isMe(this.props.resource)
    if (params.resource  &&  utils.getId(params.resource) !== utils.getId(this.props.resource)) {
      if (isMe) {
        if (params.action === 'addItem') {
          let m = utils.getModel(params.resource[TYPE]).value
          if (m.subClassOf === FORM  ||  m.id === VERIFICATION  ||  m.id === 'tradle.ConfirmPackageRequest'  ||  m.subClassOf === MY_PRODUCT)
            Actions.getItem(utils.getMe())
        }
        else if (params.actions === 'addMessage'  &&  params.resource[TYPE] === 'tradle.ConfirmPackageRequest')
          Actions.getItem(utils.getMe())
      }
      return
    }

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
    case 'getForms':
      this.showChat(params)
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
    case 'exploreBacklink':
      if (params.backlink !== this.state.backlink)
        this.setState({backlink: params.backlink, backlinkList: params.list})
      break
    default:
      if (params.resource)
        Actions.getItem(params.resource)
        // this.onResourceUpdate(params)
      break
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.orientation !== nextProps.orientation               ||
           this.state.isModalOpen  !== nextState.isModalOpen              ||
           this.state.resource     !== nextState.resource                 ||
           this.state.useGesturePassword !== nextState.useGesturePassword ||
           this.state.useTouchId !== nextState.useTouchId                 ||
           this.state.backlink  !== nextState.backlink                    ||
           this.state.pairingData !== nextState.pairingData
  }
  // onResourceUpdate(params) {
    // var resource = params.resource;
    // let me = utils.getMe()
    // if (resource[ROOT_HASH] === me[ROOT_HASH])
    // Actions.getItem(me)
    // else
    // if (resource  &&  this.props.resource[ROOT_HASH] === resource[ROOT_HASH]) {
    //   var me = utils.getMe();
    //   if (resource[ROOT_HASH] === me[ROOT_HASH])
    //     utils.setMe(resource);
      // this.setState({resource: resource});
    // }
  // }
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
    var modelName = resource[TYPE];
    var model = utils.getModel(modelName).value;
    var photos = [];
    if (resource.photos  &&  resource.photos.length > 1) {
      extend(photos, resource.photos);
      photos.splice(0, 1);
    }

    var isIdentity = model.id === PROFILE;
    var isOrg = model.id === constants.TYPES.ORGANIZATION;
    var me = utils.getMe()
    var actionPanel
    var isMe = utils.isMe(resource)
    if (me) {
      let noActionPanel = (isIdentity  &&  !isMe) || (isOrg  &&  (me.organization  &&  utils.getId(me.organization) !== utils.getId(resource)))
      if (!noActionPanel  &&  utils.hasBacklinks(model))
       actionPanel = <ShowRefList lazy={this._lazyId}
                                  resource={resource}
                                  navigator={this.props.navigator}
                                  currency={this.props.currency}
                                  bankStyle={this.props.bankStyle}
                                  backlink={this.state.backlink}
                                  backlinkList={this.state.backlinkList}/>
        // actionPanel = <ShowRefList showQR={this.openModal.bind(this)} {...this.props} backlink={this.state.backlink} backlinkList={this.state.back
    }
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
                 <QRCode inline={true} content={TALK_TO_EMPLOYEE + ';' + me.organization.url + ';' + utils.getId(me.organization).split('_')[1] + ';' + me[ROOT_HASH]} dimension={w} />
               </View>
    }
    else
      qrcode = <View />

    let footer
    let conversations
/*
                  <TouchableOpacity onPress={this.showBanks.bind(this)}>
                    <View style={styles.conversationsRow}>
                      <ConversationsIcon size={35} style={{marginTop: 2, marginRight: 10}} />
                      <View style={{justifyContent: 'center'}}>
                        <Text style={styles.resourceTitle}>{translate('officialAccounts')}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
*/
    let bgcolor = Platform.OS === 'android' ? 'transparent' : '#7AAAC3'
    let color = Platform.OS !== 'android' ? '#ffffff' : '#7AAAC3'
    let paddingRight = Platform.OS === 'android' ? 0 : 10
    if (isIdentity) {
      footer = <View style={styles.footer}>
                <View style={styles.row}>
                  <TouchableOpacity onPress={this.showBanks.bind(this)} style={{paddingRight}}>
                    <View style={[platformStyles.conversationButton, {backgroundColor: bgcolor, borderColor: bgcolor, borderWidth: 1, opacity: 0.5}]}>
                      <ConversationsIcon size={30} color={color} style={{marginLeft: 9, marginRight: 9}} />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.ActionSheet.show()}>
                    <View style={[platformStyles.menuButtonRegular, {opacity: 0.5}]}>
                      <Icon name='md-finger-print' color={Platform.select(FINGERPRINT_COLOR)} size={fontSize(30)} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
    }

    let menu = isIdentity  &&  isMe  && this.renderActionSheet()
    let identityPhotoList, otherPhotoList
    if (isIdentity)
      identityPhotoList = <PhotoList photos={photos} resource={this.props.resource} navigator={this.props.navigator} isView={true} numberInRow={5} />
    else
      otherPhotoList = <PhotoList photos={photos} resource={this.props.resource} navigator={this.props.navigator} isView={true} numberInRow={photos.length > 4 ? 5 : photos.length} />
    let propertySheet
    if (resource[TYPE] !== PROFILE  &&  !isOrg)
      propertySheet = <ShowPropertiesView resource={resource}
                        showRefResource={this.getRefResource.bind(this)}
                        currency={this.props.currency}
                        excludedProperties={['photos']}
                        navigator={this.props.navigator} />
    let photoView
    if (!isOrg)
      photoView = <PhotoView resource={resource} navigator={this.props.navigator}/>
    return (
      <PageView style={platformStyles.container}>
      <ScrollView  ref='this' name={this._lazyId}>
        <View style={styles.photoBG}>
          {photoView}
          {identityPhotoList}
        </View>
        {actionPanel}
        <Modal animationType={'fade'} visible={this.state.isModalOpen} transparent={true} onRequestClose={() => this.closeModal()}>
          <TouchableOpacity  onPress={() => this.closeModal()} underlayColor='transparent'>
            <View style={styles.modalBackgroundStyle}>
              {qrcode}
            </View>
          </TouchableOpacity>
        </Modal>
        {otherPhotoList}
        {propertySheet}
        {menu}
      </ScrollView>
      {footer}

      </PageView>
    );
  }

  // renderActionSheet() {
  //   let buttons = []

  //   if (ENV.requireDeviceLocalAuth) {
  //     if (utils.isIOS()) {
  //       // when both auth methods are available, give the choice to disable one
  //       buttons.push({
  //         text: translate('useTouchId') + (this.state.useTouchId ? ' ✓' : ''),
  //         onPress: this.changePreferences(USE_TOUCH_ID)
  //       })
  //       buttons.push({
  //         text: translate('useGesturePassword') + (this.state.useGesturePassword ? ' ✓' : ''),
  //         onPress: this.changePreferences(USE_GESTURE_PASSWORD)
  //       })
  //     }
  //   }

  //   if (this.state.useGesturePassword || !utils.isIOS()) {
  //     buttons.push({
  //       text: translate('changeGesturePassword'),
  //       onPress: this.changePreferences(CHANGE_GESTURE_PASSWORD)
  //     })
  //   }
  //   buttons.push({
  //     text: translate('pairDevices'),
  //     onPress: this.changePreferences(PAIR_DEVICES)
  //   })
  //   buttons.push({
  //     text: translate('viewDebugLog'),
  //     onPress: this.changePreferences(VIEW_DEBUG_LOG)
  //   })
  //   if (!ENV.homePageScanQRCodePrompt) {
  //     buttons.push({
  //       text: translate('scanQRcode'),
  //       onPress: this.changePreferences(SCAN_QR_CODE)
  //     })
  //   }
  //   buttons.push({ text: translate('cancel') })
  //   return (
  //     <ActionSheet
  //       ref={(o) => {
  //         this.ActionSheet = o
  //       }}
  //       options={buttons}
  //     />
  //   )
  // }
  renderActionSheet() {
    let buttons = []
    let actions = []
    if (utils.isIOS()) {
      // when both auth methods are available, give the choice to disable one
      buttons.push(translate('useTouchId') + (this.state.useTouchId ? ' ✓' : ''))
      actions.push(USE_TOUCH_ID)
    }

    const usePassword = Platform.select({
      ios: 'useGesturePassword',
      android: 'useGesturePassword',
      web: 'enablePassword'
    })

    buttons.push(translate(usePassword) + (this.state.useGesturePassword ? ' ✓' : ''))
    actions.push(USE_GESTURE_PASSWORD)

    if (this.state.useGesturePassword || !utils.isIOS()) {
      const changePassword = Platform.select({
        ios: 'changeGesturePassword',
        android: 'changeGesturePassword',
        web: 'changePassword'
      })

      buttons.push(translate(changePassword))
      actions.push(CHANGE_GESTURE_PASSWORD)
    }

    buttons.push(translate('pairDevices'))
    actions.push(PAIR_DEVICES)

    buttons.push(translate('viewDebugLog'))
    actions.push(VIEW_DEBUG_LOG)
    if (ENV.homePageScanQRCodePrompt) {
      buttons.push(translate('scanQRcode'))
      actions.push(SCAN_QR_CODE)
    }
    buttons.push(translate('cancel'))
    return(
        <ActionSheet
          ref={(o) => {
            this.ActionSheet = o
          }}
          options={buttons}
          cancelButtonIndex={buttons.length - 1}
          onPress={(index) => {
            if (index < buttons.length - 1)
              this.changePreferences(actions[index])
          }}
        />
    )
  }

  openModal() {
    this.setState({isModalOpen: true});
  }
  closeModal() {
    this.setState({isModalOpen: false});
  }
  getRefResource(resource, prop) {
    var model = utils.getModel(this.props.resource[TYPE]).value;

    this.state.prop = prop;
    this.state.propValue = utils.getId(resource.id);
    Actions.getItem(resource.id);
  }

  changePreferences(action) {
    const me = utils.getMe()
    const authSettings = pick(me, AUTH_PROPS)
    const r = {
      _r: me[ROOT_HASH],
      _t: PROFILE,
      ...authSettings
    }

    let isChangeGesturePassword
    switch (action) {
    case USE_TOUCH_ID:
      r.useTouchId = !me.useTouchId
      return this.updateAuthSettings(r)
    case USE_GESTURE_PASSWORD:
      r.useGesturePassword = !me.useGesturePassword
      // setting a gesture password is equivalent to changing it
      return this.updateAuthSettings(r, r.useGesturePassword)
    case CHANGE_GESTURE_PASSWORD:
      return this.updateAuthSettings(r, true)
    case PAIR_DEVICES:
      Actions.genPairingData()
      return
    case SCAN_QR_CODE:
      this.scanFormsQRCode(true)
      return
    case VIEW_DEBUG_LOG:
      this.props.navigator.push({
        id: 28,
        component: Log,
        passProps: {},
        backButtonTitle: 'Back',
        rightButtonTitle: 'Send',
        onRightButtonPress: utils.submitLog
      })

      return
    }
  }

  async updateAuthSettings (settings, isChangeGesturePassword) {
    const me = utils.getMe()
    const { navigator } = this.props
    const currentRoute = Navs.getCurrentRoute(navigator)
    await signIn(navigator, settings, isChangeGesturePassword)
    Actions.addItem({resource: me, value: settings, meta: utils.getModel(PROFILE).value})

    if (Navs.getCurrentRoute(navigator) !== currentRoute) {
      navigator.popToRoute(currentRoute)
    }

    this.setState(pick(settings, AUTH_PROPS))
  }
}

reactMixin(ResourceView.prototype, Reflux.ListenerMixin);
reactMixin(ResourceView.prototype, ResourceMixin);
reactMixin(ResourceView.prototype, HomePageMixin)
ResourceView = makeResponsive(ResourceView)

var createStyles = utils.styleFactory(ResourceView, function ({ dimensions }) {
  return StyleSheet.create({
    modalBackgroundStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
      height: dimensions.height
    },
    photoBG: {
      alignItems: 'center',
    },
    conversationsRow: {
      flexDirection: 'row',
      paddingLeft: 5,
      width: dimensions.width - 100
    },
    row: {
      flex: 1,
      paddingHorizontal: 10,
      marginRight: -10,
      flexDirection: 'row',
      // alignItems: 'flex-end'
      // justifyContent: 'space-between'
    },
    resourceTitle: {
      fontSize: 20,
      fontWeight: '400',
      color: '#757575',
    },
    footer: {
      // flexDirection: 'row',
      // flexWrap: 'nowrap',
      // alignItems: Platform.OS === 'android' ? 'center' : 'flex-start',
      // justifyContent: 'space-between',
      // alignSelf: 'stretch',
      height: 45,
      width: dimensions.width,
      backgroundColor: '#efefef',
      borderColor: '#eeeeee',
      borderWidth: 1,
      // borderTopColor: '#cccccc',
      alignItems: 'flex-end',
      paddingRight: 10,
    }
  })
})

module.exports = ResourceView;
