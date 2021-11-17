
import _ from 'lodash'
import { makeResponsive } from 'react-native-orient'
import ActionSheet from 'react-native-actionsheet'
import { getContentSeparator } from '../utils/uiUtils'

import {
  View,
  Platform,
  Modal,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types'
// import Linking from '../utils/linking'

import {
  LazyloadScrollView,
} from 'react-native-lazyload'
var dataURLtoBlob = require('dataurl-to-blob');

import React, { Component } from 'react'
import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'

import constants from '@tradle/constants'
import QR from '@tradle/qr-schema'

import utils, {
  translate,
  getFontSize as fontSize
} from '../utils/utils'

import Image from './Image'
import ShowPropertiesView from './ShowPropertiesView'
import PhotoView from './PhotoView'
import PhotoList from './PhotoList'
import ShowRefList from './ShowRefList'
import PageView from './PageView'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import ResourceMixin from './ResourceMixin'
import QRCode from './QRCode'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import ENV from '../utils/env'
import StyleSheet from '../StyleSheet'
import HomePageMixin from './HomePageMixin'
// import ActionSheet from './ActionSheet'
import platformStyles from '../styles/platform'
import buttonStyles from '../styles/buttonStyles'
import { signIn } from '../utils/localAuth'
// import debug from '../utils/debug'
// import ConversationsIcon from './ConversationsIcon'
import Navs from '../utils/navs'

const SCAN_QR_CODE = 0
const USE_TOUCH_ID = 1
const USE_GESTURE_PASSWORD = 2
const CHANGE_GESTURE_PASSWORD = 3
const VIEW_DEBUG_LOG = 5
const WIPE_DEVICE = 6
const CONFIRMATION_PRODUCT_REQUEST = 'tradle.ConfirmPackageRequest'
const MY_PRODUCT = 'tradle.MyProduct'

const {
  PROFILE,
  VERIFICATION,
  FORM,
  MESSAGE,
  ORGANIZATION
} = constants.TYPES

const {
  TYPE,
  ROOT_HASH,
  CUR_HASH
} = constants
const AUTH_PROPS = ['useTouchId', 'useGesturePassword']

const ScrollView = LazyloadScrollView
const LAZY_ID = 'lazyload-list'

const FINGERPRINT_COLOR = {
  ios: '#ffffff',
  web: '#ffffff',
  android: '#ff0000'
}

let INSTANCE_ID = 0

class ResourceView extends Component {
  static displayName = 'ResourceView'
  constructor(props) {
    super(props);
    this._lazyId = LAZY_ID + INSTANCE_ID++

    let me = utils.getMe()
    let { resource, backlink, action, navigator } = props
    // const dataSource = new ListView.DataSource({
    //   rowHasChanged: function(row1, row2) {
    //     return row1 !== row2 || row1._online !== row2._online || row1.style !== row2.style
    //   }
    // })
    this.state = {
      resource: resource,
      isLoading:  true, //resource[TYPE] && resource[TYPE] !== PROFILE ? false : true, //props.resource.id ? true : false,
      isModalOpen: false,
      useTouchId: me && me.useTouchId,
      useGesturePassword: me && me.useGesturePassword,
      // dataSource: dataSource.cloneWithRows([resource])
    }
    if (backlink)
      this.state.backlink = backlink
    let currentRoutes = navigator.getCurrentRoutes()
    let len = currentRoutes.length
    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle)
      currentRoutes[len - 1].onRightButtonPress = action.bind(this)
  }
  componentWillMount() {
    let { resource, search, backlink } = this.props

    let rtype = utils.getType(resource)
    let m = utils.getModel(rtype)
    if (utils.isInlined(m)) {
      this.state.isLoading = false
      return
    }
    Actions.getItem( {resource, search, backlink, isMessage: true} )
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    let { resource, action, error, to } = params

    let isMe = utils.isMe(this.props.resource)
    if (resource  &&  utils.getId(resource) !== utils.getId(this.props.resource)) {
      if (isMe) {
        let me = utils.getMe()
        if (action === 'addItem') {
          let m = utils.getModel(resource[TYPE])
          if (utils.isForm(m)  ||  m.id === VERIFICATION  ||  m.id === CONFIRMATION_PRODUCT_REQUEST  ||  utils.isMyProduct(m))
            Actions.getItem({resource: me})
        }
        else if (action === 'addMessage'  &&  resource[TYPE] === CONFIRMATION_PRODUCT_REQUEST)
          Actions.getItem({resource: me})
      }
      if (action !== 'getItem')
        return
      if (resource[ROOT_HASH] !== utils.getRootHash(this.props.resource))
        return
    }

    switch (action) {
    case 'addItem':
      if (resource  &&  isMe)
        this.setState({resource: resource})
      break
    case 'showDetails':
      this.setState({showDetails: true, backlink: null, backlinkList: null, showDocuments: false})
      break
    case 'showIdentityList':
      this.onShowIdentityList(params)
      break
    case 'getItem':
      this.setState({
        resource: resource,
        isLoading: false
      })
      break
    case 'getForms':
      this.showChat(params)
      break
    case 'newContact':
      this.closeModal()
      break
    case 'employeeOnboarding':
      let style = {}
      _.extend(style, defaultBankStyle)
      if (to.style)
        style = _.extend(style, to.style)
      this.props.navigator.replace({
        componentName: 'MessageList',
        title: utils.getDisplayName({ resource: to }),
        backButtonTitle: 'Back',
        passProps: {
          resource: to,
          filter: '',
          modelName: MESSAGE,
          // currency: params.organization.currency,
          bankStyle: style,
          // dictionary: params.dictionary,
        }
      }, 2)
      break
    case 'exploreBacklink':
      if (params.backlink !== this.state.backlink || params.backlinkAdded) {
        this.setState({backlink: params.backlink, backlinkList: params.list, showDetails: false, showDocuments: false})
        Actions.getItem({resource: this.props.resource})
      }
      break
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return utils.resized(this.props, nextProps)                            ||
           this.state.isModalOpen  !== nextState.isModalOpen              ||
           this.state.resource     !== nextState.resource                 ||
           this.state.useGesturePassword !== nextState.useGesturePassword ||
           this.state.useTouchId !== nextState.useTouchId                 ||
           this.state.backlink  !== nextState.backlink
  }
  changePhoto(photo) {
    this.setState({currentPhoto: photo});
  }
  onShowIdentityList(params) {
    this.props.navigator.push({
      title: 'My Identities',
      componentName: 'IdentitiesList',
      backButtonTitle: 'Profile',
      passProps: {
        filter: '',
        list: params.list
      }
    });
  }

  render() {
    let { navigator, bankStyle, currency, application } = this.props
    if (!bankStyle)
      bankStyle = defaultBankStyle
    if (this.state.isLoading)
      return this.showLoading({bankStyle, component: ResourceView})

    let { backlink, backlinkList, isModalOpen } = this.state
    let styles = createStyles({bankStyle})

    let resource = this.state.resource;
    let modelName = resource[TYPE];
    let model = utils.getModel(modelName);
    let photos = [];
    if (resource.photos  &&  resource.photos.length > 1) {
      _.extend(photos, resource.photos);
      // photos.splice(0, 1);
    }

    let isIdentity = model.id === PROFILE;
    let isOrg = model.id === ORGANIZATION;
    let me = utils.getMe()
    let actionPanel
    let isMe = utils.isMe(resource)
    let isMyProduct = utils.isSubclassOf(utils.getType(resource), MY_PRODUCT)
    let attachmentsView
    if (me) {
      if (resource.attachments  &&  resource.attachments.length) {
        let attachments = []
        attachments = resource.attachments.map((r) => {
          return <TouchableOpacity onPress={this.showPdf.bind(this, r)} style={{maxWidth: 100}}>
                   <Icon name='ios-paper-outline' size={30} color={bankStyle.linkColor} style={{paddingRight: 10}}/>
                   <Text style={{fontSize: 10}}>{r.name}</Text>
                 </TouchableOpacity>
        })
        attachmentsView = <View style={{flexDirection: 'row', minHeight: 50, padding: 10, paddingTop: 2}}>{attachments}</View>
      }

      let noActionPanel = (isIdentity  &&  !isMe) || (isOrg  &&  application) // (me.organization  &&  utils.getId(me.organization) !== utils.getId(resource)))
      if (!noActionPanel  &&  utils.hasBacklinks(model) || isMyProduct)
       actionPanel = <ShowRefList lazy={this._lazyId}
                                  resource={resource}
                                  navigator={navigator}
                                  currency={currency}
                                  bankStyle={bankStyle}
                                  backlink={backlink}
                                  showQR={this.openModal.bind(this)}
                                  backlinkList={backlinkList}/>
    }
    let w = Math.floor((utils.getContentWidth(ResourceView) / 3) * 2)
    w = Math.min(w, 300)
    let qr
    if (utils.isSubclassOf(model, MY_PRODUCT)) {
      qr = {
        schema: 'ProductAuthorization',
        data: {
          contextId: resource.contextId,
          product: resource.requestFor,
          firstName: me.firstName
        }
      }
    }
    else if (isMe) {
      if (me.isEmployee  &&  me.organization && me.organization.url) {
        let parts = utils.getId(me.organization).split('_')
        qr = {
          schema: 'OrgProfile',
          data: {
            permalink: me[ROOT_HASH],
            link: me[CUR_HASH],
            orgPermalink: parts[1],
            orgLink: parts[2],
            name: me.organization.title,
          }
        }
      }
      else {
        qr = {
          schema: 'Profile',
          data: {
            permalink: me[ROOT_HASH],
            link: me[CUR_HASH],
            firstName: me.firstName,
            lastName: me.lastName
          }
        }
      }
    }
    let qrcode
    let {width, height} = utils.dimensions()
    if (qr) {
      let photo
      if (isMe) {
        let h = Math.min(w, height - 200 - w)
        if (me.photos  &&  me.photos.length) {
          photo = <View style={{paddingBottom: 10}}>
                   <Image source={{uri: me.photos[0].url}} style={{width: w, height: h}} />
                  </View>
        }
      }
      qrcode = <View style={styles.qrcode} onPress={()=> this.setState({isModalOpen: true})}>
                 {photo}
                 <QRCode inline={true} content={JSON.stringify(qr)} dimension={w} />
               </View>
    }

    let footer
    // let conversations
    if (isIdentity) {
      footer = <View style={styles.footer}>
                <TouchableOpacity onPress={() => this.ActionSheet.show()}>
                  <View style={[buttonStyles.menuButton, {opacity: 0.5}]}>
                    <Icon name='md-finger-print' color={Platform.select(FINGERPRINT_COLOR)} size={fontSize(30)} />
                  </View>
                </TouchableOpacity>
              </View>
    }
    let menu = isIdentity  &&  isMe  && this.renderActionSheet()
    let identityPhotoList, otherPhotoList
    if (isIdentity)
      identityPhotoList = <PhotoList photos={photos} resource={this.props.resource} navigator={navigator} isView={true} numberInRow={5} />
    else
      otherPhotoList = <PhotoList photos={photos} resource={this.props.resource} navigator={navigator} isView={true} numberInRow={photos.length > 4 ? 5 : photos.length} />
    let propertySheet
    if (!actionPanel  &&  resource[TYPE] !== PROFILE  &&  !isOrg)
      propertySheet = <ShowPropertiesView resource={resource}
                        showRefResource={this.getRefResource.bind(this)}
                        currency={currency}
                        excludedProperties={['photos']}
                        bankStyle={bankStyle}
                        navigator={navigator} />
    let photoView
    // if (!isOrg) {
    if (true) {
      let photos = resource.photos
      let mainPhoto
      if (!photos) {
        photos = utils.getResourcePhotos(model, resource)
        let mainPhotoProp = utils.getMainPhotoProperty(model)
        mainPhoto = mainPhotoProp ? resource[mainPhotoProp] : photos && photos[0]
      }
      else if (photos.length === 1)
        mainPhoto = photos[0]
      if (mainPhoto)
        photoView = <PhotoView resource={resource} mainPhoto={mainPhoto} navigator={navigator}/>
    }
    let contentSeparator = getContentSeparator(bankStyle)
    if (isModalOpen)
      width = utils.dimensions(ResourceView).width
    else
      width = utils.getContentWidth(ResourceView)
    let photo
    if (photoView)
      photo = <View style={styles.photoBG}>
                {photoView}
                {identityPhotoList}
              </View>

    return (
      <PageView style={platformStyles.container} bankStyle={bankStyle} separator={contentSeparator}>
        <ScrollView  ref='this' style={{width, alignSelf: 'center', backgroundColor: '#fff'}} name={this._lazyId}>
          {photo}
          {attachmentsView}
          {actionPanel}
          <Modal animationType={'fade'} visible={isModalOpen} transparent={true} onRequestClose={() => this.closeModal()}>
            <TouchableOpacity  onPress={() => this.closeModal()}>
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
  showPdf(r) {
    let blob = dataURLtoBlob(r.url)
    let url = URL.createObjectURL(blob)
    if (Linking.canOpenURL(url))
      Linking.openURL(url)
  }
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

    if (ENV.homePageScanQRCodePrompt) {
      buttons.push(translate('scanQRcode'))
      actions.push(SCAN_QR_CODE)
    }

    if (ENV.allowWipe) {
      buttons.push(translate('wipeTheAppData'))
      actions.push(WIPE_DEVICE)
    }

    buttons.push(translate('viewDebugLog'))
    actions.push(VIEW_DEBUG_LOG)

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

  getRefResource(resource, prop) {
    // this.state.prop = prop;
    // this.state.propValue = utils.getId(resource.id);

    // Actions.getItem({resource, search: utils.getMe().isEmployee});
    const { navigator, bankStyle, currency, locale } = this.props
    const rtype = utils.getType(resource)
    navigator.push({
      title: resource.title || utils.makeModelTitle(utils.getModel(rtype)),
      componentName: 'ResourceView',
      backButtonTitle: 'Back',
      passProps: {
        resource,
        bankStyle,
        currency,
        locale
      }
    })
  }

  changePreferences(action) {
    const me = utils.getMe()
    const authSettings = _.pick(me, AUTH_PROPS)
    const r = {
      _r: me[ROOT_HASH],
      _t: PROFILE,
      ...authSettings
    }

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
    case SCAN_QR_CODE:
      this.scanFormsQRCode({isView: true})
      return
    case VIEW_DEBUG_LOG:
      this.props.navigator.push({
        componentName: 'Log',
        passProps: {},
        backButtonTitle: 'Back',
        rightButtonTitle: 'Send',
        onRightButtonPress: utils.submitLog
      })

      return
    case WIPE_DEVICE:
      Actions.requestWipe()
      return
    }
  }

  async updateAuthSettings (settings, isChangeGesturePassword) {
    const me = utils.getMe()
    const { navigator } = this.props
    const currentRoute = Navs.getCurrentRoute(navigator)
    await signIn(navigator, settings, isChangeGesturePassword)
    Actions.addItem({resource: me, value: settings, meta: utils.getModel(PROFILE)})

    if (Navs.getCurrentRoute(navigator) !== currentRoute) {
      navigator.popToRoute(currentRoute)
    }

    this.setState(_.pick(settings, AUTH_PROPS))
  }
}

reactMixin(ResourceView.prototype, Reflux.ListenerMixin);
reactMixin(ResourceView.prototype, ResourceMixin);
reactMixin(ResourceView.prototype, HomePageMixin)
ResourceView = makeResponsive(ResourceView)

var createStyles = utils.styleFactory(ResourceView, function ({ dimensions, bankStyle }) {
  return StyleSheet.create({
    modalBackgroundStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
      height: dimensions.height
    },
    photoBG: {
      backgroundColor: '#f7f7f7',
      alignItems: 'center',
      borderColor: bankStyle.linkColor,
      borderTopWidth: 1,
      borderBottomWidth: 1
    },
    row: {
      flex: 1,
      paddingHorizontal: 10,
      marginRight: -10,
      flexDirection: 'row',
    },
    resourceTitle: {
      fontSize: 20,
      fontWeight: '400',
      color: '#757575',
    },
    footer: {
      height: 45,
      backgroundColor: '#efefef',
      borderColor: '#eeeeee',
      borderWidth: 1,
      alignItems: 'flex-end',
      paddingRight: 10,
    },
    qrcode: {
      marginTop: -100,
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: 10,
    },
  })
})

module.exports = ResourceView;
