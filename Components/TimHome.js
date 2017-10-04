'use strict';

const parseURL = require('url').parse
var Q = require('q')
var Keychain = require('react-native-keychain')
var debounce = require('debounce')
var ResourceList = require('./ResourceList');
// var VideoPlayer = require('./VideoPlayer')
var NewResource = require('./NewResource');
// var HomePage = require('./HomePage')
var HomePageMixin = require('./HomePageMixin')
var ResourceView = require('./ResourceView');
var MessageList = require('./MessageList')
var extend = require('extend')
var utils = require('../utils/utils');
var translate = utils.translate
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var constants = require('../utils/constants');
var debug = require('debug')('tradle:app:Home')
var PasswordCheck = require('./PasswordCheck')
var ArticleView = require('./ArticleView');
var FadeInView = require('./FadeInView')
var TouchIDOptIn = require('./TouchIDOptIn')
var defaultBankStyle = require('../styles/defaultBankStyle.json')

var QRCodeScanner = require('./QRCodeScanner')
var TimerMixin = require('react-timer-mixin')
var isDeepLink

const scanHelp = Platform.OS === 'android'
  ? { uri: 'file:///android_asset/ScanHelp.html' }
  : require('../html/ScanHelp.html')

try {
  var commitHash = require('../version').commit.slice(0, 7)
} catch (err) {
  // no version info available
}
var {
  TYPE
} = constants
var {
  ORGANIZATION,
  CUSTOMER_WAITING,
  MESSAGE
} = constants.TYPES
// var Progress = require('react-native-progress')
import {
  // authenticateUser,
  hasTouchID,
  signIn,
  setPassword
} from '../utils/localAuth'

import { SyncStatus } from 'react-native-code-push'
import Linking from '../utils/linking'
import AutomaticUpdates from '../utils/automaticUpdates'
import CustomIcon from '../styles/customicons'
import BackgroundImage from './BackgroundImage'
import Navs from '../utils/navs'
import ENV from '../utils/env'

const BOOKMARK = 'tradle.Bookmark'

const BG_IMAGE = ENV.splashBackground
const PASSWORD_ITEM_KEY = 'app-password'
const SUBMIT_LOG_TEXT = {
  submit: translate('submitLog'),
  submitting: translate('submitting') + '...',
  submitted: translate('restartApp')
}

import {
  StyleSheet,
  Text,
  Navigator,
  View,
  TouchableOpacity,
  Image,
  NetInfo,
  ScrollView,
  // Linking,
  StatusBar,
  Modal,
  Alert,
  Platform
} from 'react-native'
import ActivityIndicator from './ActivityIndicator'

const isAndroid = Platform.OS === 'android'
const FOOTER_TEXT_COLOR = ENV.splashContrastColor
import React, { Component, PropTypes } from 'react'

class TimHome extends Component {
  static displayName = 'TimHome';
  static orientation = 'PORTRAIT';
  props: {
    modelName: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      hasMe: utils.getMe()
    };

    this._handleOpenURL = this._handleOpenURL.bind(this)
    this._handleConnectivityChange = this._handleConnectivityChange.bind(this)
  }
  componentWillMount() {
    this.uhOhTimeout = this.setTimeout(() => {
      if (!this.state.isLoading && !this.state.downloadingUpdate) return

      this.setState({ submitLogButtonText: SUBMIT_LOG_TEXT.submit })
    }, 120000)

    this.listenTo(Store, 'handleEvent');
    this._pressHandler = debounce(this._pressHandler, 500, true)
    if (!isAndroid)
      Linking.addEventListener('url', this._handleOpenURL);

    // var url = LinkingIOS.popInitialURL()
    // if (url)
    //   this._handleOpenURL({url});
    NetInfo.isConnected.addEventListener(
      'change',
      this._handleConnectivityChange
    );
    NetInfo.isConnected.fetch().then(isConnected => this._handleConnectivityChange(isConnected))
    Actions.start();
  }
  _handleConnectivityChange(isConnected) {
    this.props.navigator.isConnected = isConnected
  }
  componentWillUnmount() {
    if (!isAndroid)
      Linking.removeEventListener('url', this._handleOpenURL);

    NetInfo.isConnected.removeEventListener(
      'change',
      this._handleConnectivityChange
    );
  }
  async _checkConnectivity() {
    try {
      const isConnected = await NetInfo.isConnected.fetch()
      const firstRoute = this.props.navigator.getCurrentRoutes()[0]
      firstRoute.isConnected = isConnected
    } catch (err) {
      debug('failed to check connectivity', err)
    }
  }


  async componentDidMount() {
    this._checkConnectivity()

    try {
      const url = await Linking.getInitialURL() || ENV.initWithDeepLink
      if (url)
        this._handleOpenURL({url})
      if (ENV.landingPage)
        this.show()
    } catch (err) {
      debug('failed to open deep link', err)
    }
  }

  show() {
    if (!utils.getMe()) {
      if (ENV.autoRegister)
        this.showFirstPage()
      else
        this.setState({isModalOpen: true})
      // this.register(() => this.showFirstPage())
      return
    }

    this.signInAndContinue()
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.submitLogButtonText !== nextState.submitLogButtonText    ||
        this.state.busyWith !== nextState.busyWith                             ||
        this.state.downloadUpdateProgress !== nextState.downloadUpdateProgress ||
        this.state.isLoading  !== nextState.isLoading   ||
        this.state.message !== nextState.message        ||
        this.state.hasMe !== nextState.hasMe
  }

  async _handleOpenURL({ url }) {
    try {
      if (ENV.initWithDeepLink !== url)
        this.isDeepLink = true
      await this._unsafeHandleOpenURL({ url })
    } catch (err) {
      Alert.alert(
        translate('oops'),
        translate('invalidDeepLink')
      )
    }
  }

  async _unsafeHandleOpenURL({ url }) {
    debug(`opening URL: ${url}`)

    let URL = parseURL(url)
    let pathname = URL.pathname || URL.hostname
    if (!pathname) throw new Error('failed to parse deep link')

    // strip leading slashes
    pathname = pathname.replace(/^\//, '')

    let query = URL.query
    if (!query) {
      if (pathname === 'scan') {
        this.setState({firstPage: pathname})
        this.show(pathname)
      }
      if (pathname !== 'conversations')
        return
    }

    let qs = query ? require('querystring').parse(query) : {}

    let state = {firstPage: pathname}
    extend(state, qs)
    this.setState(state)
    Actions.setPreferences(state)

    if (!qs.alert) {
      if (utils.getMe())
        this.showFirstPage(true)
      return
    }

    const { title, message, ok } = JSON.parse(qs.alert)
    // TODO: support stuff!
    if (ok !== '/scan'  &&  ok.indexOf('/chat') === -1) throw new Error(`unsupported deep link: ${ok}`)

    const { navigator } = this.props
    while (true) {
      let currentRoute = Navs.getCurrentRoute(navigator)
      let { displayName } = currentRoute.component
      if (displayName === TimHome.displayName || displayName === PasswordCheck.displayName) {
        debug('waiting to throw up deep linked alert until we are past the home screens')
        await Q.ninvoke(utils, 'onNextTransitionEnd', navigator)
      } else {
        break
      }
    }

    return new Promise((resolve, reject) => {
      let self = this
      Alert.alert(title, message, [
        {
          text: 'Cancel',
          onPress: resolve
        },
        {
          text: 'OK',
          onPress: function () {
            // goto
            self._unsafeHandleOpenURL({url: 'tradle:/' + ok})
            resolve()
          }
        }
      ])
    })
  }

  async onStart(params) {
    utils.updateEnv()

    // prior to registration
    // force install updates before first interaction
    const me = utils.getMe()
    if (!(me && me.ensuredUpToDateOnFirstRun)) {
      //   UP_TO_DATE: 0, // The running app is up-to-date
      //   UPDATE_INSTALLED: 1, // The app had an optional/mandatory update that was successfully downloaded and is about to be installed.
      //   UPDATE_IGNORED: 2, // The app had an optional update and the end-user chose to ignore it
      //   UNKNOWN_ERROR: 3,
      //   SYNC_IN_PROGRESS: 4, // There is an ongoing "sync" operation in progress.
      //   CHECKING_FOR_UPDATE: 5,
      //   AWAITING_USER_ACTION: 6,
      //   DOWNLOADING_PACKAGE: 7,
      //   INSTALLING_UPDATE: 8
      try {
        await AutomaticUpdates.sync({
          onSyncStatusChanged: status => {
            if (status === SyncStatus.DOWNLOADING_PACKAGE) {
              this.setState({ downloadingUpdate: true, downloadUpdateProgress: 0 })
            }
          },
          onDownloadProgress: debounce(({ totalBytes, receivedBytes }) => {
            const downloadUpdateProgress = (receivedBytes * 100 / totalBytes) | 0
            // avoid going from 1 percent to 0
            this.setState({ downloadUpdateProgress })
          }, 300, true)
        })
      } catch (err) {
        debug('failed to sync with code push', err)
      } finally {
        this.setState({ downloadingUpdate: false, downloadUpdateProgress: null })
      }

      if (me) {
        Actions.updateMe({ ensuredUpToDateOnFirstRun: true })
      }

      const hasUpdate = await AutomaticUpdates.hasUpdate()
      if (hasUpdate) return AutomaticUpdates.install()
    }

    AutomaticUpdates.on()
    if (this.state.message) {
      this.restartTiM()
      return
    }

    // utils.setMe(params.me);
    // utils.setModels(params.models);
    this.setState({isLoading: false});
    clearTimeout(this.uhOhTimeout)

    // Need to laod data for landing page first
    if (!ENV.landingPage)
      this.show()
  }

  async signInAndContinue() {
    const routes = this.props.navigator.getCurrentRoutes()
    // get the top TimHome in the stack
    const homeRoute = routes.filter(r => r.component.displayName === TimHome.displayName).pop()
    const afterAuthRoute = utils.getTopNonAuthRoute(this.props.navigator)
    try {
      await signIn(this.props.navigator)
    } catch (err) {
      if (afterAuthRoute.component.displayName === TimHome.displayName) return

      if (homeRoute) {
        return this.props.navigator.popToRoute(homeRoute)
      }

      return this.props.navigator.resetTo({
        id: 1,
        component: TimHome,
        passProps: {}
      })
    }

    if (afterAuthRoute.component.displayName !== TimHome.displayName  &&  !this.isDeepLink) {
      return this.props.navigator.popToRoute(afterAuthRoute)
    }
    return this.showFirstPage()
  }

  async handleEvent(params) {
    const self = this
    switch(params.action) {
    case 'busy':
      this.setState({
        busyWith: params.activity
      })

      return
    case 'connectivity':
      this._handleConnectivityChange(params.isConnected)
      return
    case 'reloadDB':
      this.setState({
        isLoading: false,
        message: translate('pleaseRestartTIM'), //Please restart TiM'
      });
      utils.setModels(params.models);
      return
    case 'getProvider':
      this.showChatPage(params.provider, params.termsAccepted)
      // this.setState({
      //   provider: params.provider,
      //   action: 'chat'
      // })
      return
    case 'getForms':
      this.showChat(params)
      return
    case 'noAccessToServer':
      Alert.alert(translate('noAccessToServer'))
      return
    case 'start':
      this.onStart(params)
      return
    case 'pairingSuccessful':
      this.signInAndContinue()
      return
    case 'getMe':
      utils.setMe(params.me)
      this.setState({hasMe: params.me})
      var nav = this.props.navigator
      this.signInAndContinue()
      // await signIn(this.props.navigator)
      // this.showFirstPage()
      return
    case 'offerKillSwitchAfterApplication':
      if (utils.isWeb()) {
        Alert.alert(
          translate('enterPasswordOrWipeOutTheDevice'),
          null,
          [
            {text: translate('wipeTheDevice'), onPress: () => Actions.requestWipe()},
            {text: translate('enterPassword'), onPress: () => {
              signIn(this.props.navigator, null, true)
                .then(() => this.props.navigator.pop())
            }}
          ]
        )
      }
      return
    }
  }

  showContacts() {
    let passProps = {
        filter: '',
        modelName: this.props.modelName,
        sortProperty: 'lastMessageTime',
        officialAccounts: true,
        bankStyle: defaultBankStyle
      };
    let me = utils.getMe();
    // this.props.navigator.push({
    //   id: 30,
    //   component: Tabs,
    //   title: 'Hey',
    //   backButtonTitle: translate('back'),
    //   passProps: {
    //     bankStyle: defaultBankStyle,
    //     rlProps: passProps,
    //     profileProps: {
    //       model: utils.getModel(me[TYPE]).value,
    //       resource: me,
    //       bankStyle: defaultBankStyle
    //     }
    //   }
    // })

    Actions.getAllSharedContexts()
    Actions.hasPartials()
    Actions.hasBookmarks()
    // return
    this.props.navigator.push({
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      id: 10,
      title: translate('officialAccounts'),
      // titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      component: ResourceList,
      rightButtonTitle: 'Profile',
      passProps: passProps,
      onRightButtonPress: {
        title: utils.getDisplayName(me),
        id: 3,
        component: ResourceView,
        backButtonTitle: 'Back',
        // titleTextColor: '#7AAAC3',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: me.firstName,
          id: 4,
          component: NewResource,
          // titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel(me[TYPE]).value,
            resource: me,
            bankStyle: defaultBankStyle
          }
        },
        passProps: {
          bankStyle: defaultBankStyle,
          backlink: utils.getModel(me[TYPE]).value.properties.myForms,
          resource: me
        }
      }
    });
  }
  showHomePage() {
    let me = utils.getMe()
    let title = translate('profile')
    this.props.navigator.push({
      title: title,
      id: 3,
      component: ResourceView,
      backButtonTitle: 'Back',
      rightButtonTitle: 'Edit',
      onRightButtonPress: {
        title: title,
        id: 4,
        component: NewResource,
        backButtonTitle: 'Back',
        rightButtonTitle: 'Done',
        passProps: {
          model: utils.getModel(me[TYPE]).value,
          resource: me,
          bankStyle: defaultBankStyle
        }
      },
      passProps: {
        resource: me,
          backlink: utils.getModel(me[TYPE]).value.properties.myForms,
        bankStyle: defaultBankStyle
      }
    })
    // this.props.navigator.push({
    //   title: translate('homePage'),
    //   id: 30,
    //   component: HomePage,
    //   backButtonTitle: translate('back'),
    //   passProps: {
    //     sponsorName: 'UBS',
    //     modelName: TYPES.ORGANIZATION,
    //     bankStyle: defaultBankStyle,
    //     officialAccounts: true,
    //   }
    // })
  }
  showFirstPage(noResetNavStack) {
    let firstPage = this.state.firstPage
    if (this.isDeepLink)
      this.state.firstPage = ENV.initWithDeepLink
    if (!noResetNavStack) {
      var nav = this.props.navigator
      nav.immediatelyResetRouteStack(nav.getCurrentRoutes().slice(0,1));
    }

    this.isDeepLink = false
// /chat?url=https://ubs.tradle.io&permalink=72d63e70bd75e65cf94e2d1f7f04c59816ad183801b981428a8a0d1abbf00190
    let me = utils.getMe()
    if (me  &&  me.isEmployee) {
      this.showContacts()
      return
    }
    if (firstPage) {
      switch (firstPage) {
      case 'chat':
        Actions.getProvider({
          permalink: this.state.permalink,
          url: this.state.url
        })
        return
      case 'officialAccounts':
      case 'conversations':
        this.showOfficialAccounts()
        return
      case 'profile':
        this.showHomePage()
        return
      case 'scan':
        this.showScanHelp()
          // this.scanFormsQRCode()
        return
      default:
        if (ENV.homePage)
          this.showHomePage()
        else
          this.showOfficialAccounts()
      }

      return
    }

    if (ENV.homePage) {
      this.showHomePage()
      return
    }

    this.showOfficialAccounts()
  }
  showScanHelp() {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      title: translate('importYourData'),
      passProps: {
        bankStyle: this.props.bankStyle,
        action: this.scanFormsQRCode.bind(this),
        url: scanHelp,
        actionBarTitle: translate('continue')
      }
    })
  }
  acceptTermsAndChat(provider) {
    // this.props.navigator.pop()
    let me = utils.getMe()
    if (me  &&  me._termsAccepted)
      this.showChatPage(provider, true)
    else
      Actions.acceptTermsAndChat({
        bot: this.state.permalink,
        url: this.state.url
      })
  }

  showChatPage(provider, termsAccepted) {
    let me = utils.getMe()

    if (ENV.landingPage  &&  !termsAccepted) {
      this.showLandingPage(provider, ENV.landingPage)
      return
    }
    // Check if the current page is the same we need
    let routes = this.props.navigator.getCurrentRoutes()
    let currentRoute = routes[routes.length - 1]
    if (currentRoute.id === 11) {
      if (utils.getId(currentRoute.passProps.resource) === utils.getId(provider))
        return
    }
    var msg = {
      message: translate('customerWaiting', me.firstName),
      _t: CUSTOMER_WAITING,
      from: me,
      to: provider,
      time: new Date().getTime()
    }

    utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg, isWelcome: true}))

    let style = {}
    extend(style, defaultBankStyle)
    if (provider.style)
      extend(style, provider.style)
    let route = {
      title: provider.name,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: provider,
        modelName: MESSAGE,
        currency: this.props.currency,
        bankStyle:  style
      }
    }
    if (termsAccepted  &&  routes.length === 3)
      this.props.navigator.replace(route)
    else
      this.props.navigator.push(route)
  }
  showLandingPage(provider, landingPage) {
    let style = {}
    extend(style, defaultBankStyle)
    if (provider.style)
      extend(style, provider.style)
    let c = this.props.landingPageMapping[landingPage]
    this.props.navigator.push({
      title: provider.name,
      component: c.component,
      id: c.id,
      backButtonTitle: __DEV__ ? 'Back' : null,
      passProps: {
        bankStyle: style,
        resource: provider,
        url: this.state.url,
        acceptTermsAndChat: this.acceptTermsAndChat.bind(this),
        showChat: this.showChatPage.bind(this)
      }
    })
  }
  showOfficialAccounts() {
    const me = utils.getMe()
    let passProps = {
      filter: '',
      modelName: ORGANIZATION,
      sortProperty: 'lastMessageTime',
      officialAccounts: true,
      bankStyle: defaultBankStyle
    };
    Actions.hasPartials()
    let title = me.firstName;
    let route = {
      title: translate('officialAccounts'),
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      passProps: {
        modelName: ORGANIZATION,
        isConnected: this.state.isConnected,
        officialAccounts: true,
        bankStyle: defaultBankStyle
      },
      rightButtonTitle: translate('profile'),
      onRightButtonPress: {
        title: title,
        id: 3,
        component: ResourceView,
        backButtonTitle: translate('back'),
        rightButtonTitle: translate('edit'),
        onRightButtonPress: {
          title: title,
          id: 4,
          component: NewResource,
          backButtonTitle: translate('back'),
          rightButtonTitle: translate('done'),
          passProps: {
            model: utils.getModel(me[TYPE]).value,
            resource: me,
            backlink: utils.getModel(me[TYPE]).value.properties.myForms,
            bankStyle: defaultBankStyle
          }
        },
        passProps: {
          resource: me,
          bankStyle: defaultBankStyle
        }
      }
    }
    // if (doReplace)
    //   nav.replace(route)
    // else
    var nav = this.props.navigator
    nav.push(route)

  }

  register(cb) {
    let modelName = this.props.modelName;
    if (!utils.getModel(modelName)) {
      this.setState({err: 'Can find model: ' + modelName});
      return;
    }

    let model = utils.getModel(modelName).value;
    let route = {
      component: NewResource,
      titleTextColor: '#BCD3E6',
      id: 4,
      passProps: {
        model: model,
        bankStyle: defaultBankStyle,
        isConnected: this.state.isConnected,
        // callback: () => {
        //   cb()
        // }
      },
    };

    let self = this
    route.passProps.callback = async () => {
      if (ENV.requireSoftPIN) {
        await setPassword(this.props.navigator)
      }

      if (ENV.requireDeviceLocalAuth) {
        await this.optInTouchID()
      }

      this.setState({hasMe: true})
      Actions.setAuthenticated(true)
      this.showFirstPage()
    }
    // let nav = self.props.navigator
    // route.passProps.callback = (me) => {
    //   this.showVideoTour(() => {
    //     Actions.getMe()
    //     nav.immediatelyResetRouteStack(nav.getCurrentRoutes().slice(0,1));
    //   })
    // }

    route.passProps.editCols = ['firstName']//, 'lastName', 'language']
    route.titleTintColor = '#ffffff'
    this.props.navigator.push(route);
  }

  optInTouchID() {
    if (ENV.autoOptInTouchId) {
      Actions.updateMe({ useTouchId: true })
      return
    }

    return hasTouchID().then(has => {
      if (!has) return

      return new Promise(resolve => {
        this.props.navigator.replace({
          component: TouchIDOptIn,
          id: 21,
          rightButtonTitle: 'Skip',
          noLeftButton: true,
          passProps: {
            optIn: () => {
              Actions.updateMe({ useTouchId: true })
              resolve()
            }
          },
          onRightButtonPress: resolve
        })
      })
    })
  }

  pairDevices(cb) {
    let modelName = this.props.modelName;
    if (!utils.getModel(modelName)) {
      this.setState({err: 'Can find model: ' + modelName});
      return;
    }

    let model = utils.getModel(modelName).value;
    let route = {
      component: NewResource,
      titleTextColor: '#BCD3E6',
      id: 4,
      passProps: {
        model: model,
        bankStyle: defaultBankStyle,
        isConnected: this.state.isConnected,
        // callback: () => {
        //   cb()
        // }
      },
    };

    let self = this
    route.passProps.callback = () => {
      setPassword(this.props.navigator)
      .then (() => {
        this.setState({hasMe: true})
        Actions.setAuthenticated(true)
        this.showFirstPage()
        // cb()
      })

    }
    // let nav = self.props.navigator
    // route.passProps.callback = (me) => {
    //   this.showVideoTour(() => {
    //     Actions.getMe()
    //     nav.immediatelyResetRouteStack(nav.getCurrentRoutes().slice(0,1));
    //   })
    // }

    route.passProps.editCols = ['firstName', 'lastName'] //, 'language']
    route.titleTintColor = '#ffffff'
    this.props.navigator.push(route);
  }

//   showVideoTour(cb) {
//     let onEnd = (err) => {
//       if (err) debug('failed to load video', err)
//       cb()
//     }

//     this.props.navigator.replace({
//       // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
//       id: 18,
// //      title: 'Tradle',
// //      titleTintColor: '#eeeeee',
//       component: VideoPlayer,
//       rightButtonTitle: __DEV__ ? 'Skip' : undefined,
//       passProps: {
//         uri: 'videotour',
//         onEnd: onEnd,
//         onError: onEnd,
//         navigator: this.props.navigator
//       },
//       onRightButtonPress: onEnd
//     })
//   }
  onReloadDBPressed() {
    utils.setMe(null);
    utils.setModels(null);
    Actions.reloadDB();
  }
  onReloadModels() {
    utils.setModels(null)
    Actions.reloadModels()
  }
  render() {
    StatusBar.setHidden(true);
    if (this.state.message) {
      this.restartTiM()
      return
    }

    // var url = Linking.getInitialURL();
    var {width, height} = utils.dimensions(TimHome)
    var h = height > 800 ? height - 220 : height - 180

    if (!__DEV__ && ENV.landingPage) {
      return this.getSplashScreen()
    }

    if (this.state.isLoading) {
      return this.getSplashScreen(h)
    }

    var err = this.state.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var myId = utils.getMe();
    var me = utils.getMe()
    var settings = <View/>

    var version = !__DEV__ && this.renderVersion()
    var dev = __DEV__
            ? <View style={styles.dev} testID='welcome'>
                <TouchableOpacity
                    underlayColor='transparent' onPress={this.onReloadDBPressed.bind(this)}>
                  <Text style={styles.text}>
                    Reload DB
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    underlayColor='transparent' onPress={this.onReloadModels.bind(this)}>
                  <Text style={styles.text}>
                    Reload Models
                  </Text>
                </TouchableOpacity>
                {settings}
              </View>
            : <View style={[styles.dev, { flexDirection: 'column' }]}>
                {settings}
                {version}
              </View>

    let regView = !ENV.autoRegister &&
                  <View  style={{alignSelf: 'center'}}>
                    <FadeInView>
                      <TouchableOpacity  onPress={() => {
                        this.register(this.showFirstPage.bind(this))
                        }} underlayColor='transparent'>
                        <View style={styles.signIn}>
                          <Text style={styles.signInText}>{translate('This is my first Tradle device')}</Text>
                        </View>
                      </TouchableOpacity>
                    </FadeInView>
                    <FadeInView>
                      <TouchableOpacity  onPress={() => {
                        this.pairDevices(this.showFirstPage.bind(this))
                        }} underlayColor='transparent'>
                        <View style={[styles.signIn, {shadowColor: '#245c8c', backgroundColor: 'lightblue'}]}>
                          <Text style={styles.pairDivicesText}>{translate('I have another Tradle device')}</Text>
                        </View>
                      </TouchableOpacity>
                    </FadeInView>
                 </View>

    return (
      <View style={styles.container}>
        <BackgroundImage source={BG_IMAGE} />
        <TouchableOpacity style={styles.splashLayout} onPress={() => this._pressHandler()}>
          <View style={{flexGrow:1}} />
          { utils.getMe()
            ? <TouchableOpacity style={[styles.thumbButton, {justifyContent: 'flex-end',  opacity: me ? 1 : 0}]}
                  underlayColor='transparent' onPress={() => this._pressHandler()}>
                <View style={styles.getStarted}>
                   <Text style={styles.getStartedText}>Get started</Text>
                </View>
              </TouchableOpacity>
            : regView
          }
          <Text style={errStyle}>{err}</Text>
          {dev}
        </TouchableOpacity>
      </View>
    );
  }

  renderVersion() {
    return (
      <View>
        <Text style={styles.version}>git: {commitHash}</Text>
      </View>
    )
  }

  getUpdateIndicator() {
    if (!this.state.downloadingUpdate) return

    var percentIndicator
    if (this.state.downloadUpdateProgress) {
      percentIndicator = <Text style={styles.updateIndicator}>{this.state.downloadUpdateProgress}%</Text>
    }

    return (
      <View>
        <Text style={styles.updateIndicator}>{translate('downloadingUpdate')}</Text>
        {percentIndicator}
      </View>
    )
  }

  getSubmitLogButton() {
    if (!this.state.isLoading) return

    let instructions
    if (this.state.submitLogButtonText === SUBMIT_LOG_TEXT.submit) {
      instructions = (
        <Text style={styles.submitLogInstructions}>
          {translate('somethingWrongSubmitLog')}
        </Text>
      )
    }

    return this.state.submitLogButtonText && (
      <View style={[styles.container, { maxWidth: getIconSize() }]}>
        <TouchableOpacity
          style={styles.submitLog}
          onPress={() => this.onPressSubmitLog()}>
          <Text style={styles.submitLogText}>{this.state.submitLogButtonText}</Text>
        </TouchableOpacity>
        {instructions}
      </View>
    )
  }

  async onPressSubmitLog () {
    if (this.state.submitLogButtonText === SUBMIT_LOG_TEXT.submitted) {
      return utils.restartApp()
    }

    let submitLogButtonText = SUBMIT_LOG_TEXT.submitting
    this.setState({ submitLogButtonText })
    const submitted = await utils.submitLog()
    submitLogButtonText = submitted ? SUBMIT_LOG_TEXT.submitted : SUBMIT_LOG_TEXT.submit
    this.setState({ submitLogButtonText })
  }

  getBusyReason() {
    return this.state.busyWith && (
      <View>
        <Text style={styles.updateIndicator}>{this.state.busyWith}...</Text>
      </View>
    )
  }

  getSplashScreen() {
    const version = __DEV__ && this.renderVersion()
    const { width, height } = utils.dimensions(TimHome)
    const updateIndicator = this.getUpdateIndicator()
    const submitLogButton = this.getSubmitLogButton()
    const busyReason = updateIndicator ? null : this.getBusyReason()
    const Wrapper = this.state.isLoading ? View : TouchableOpacity
    const wrapperProps = { style: styles.splashLayout }
    if (Wrapper === TouchableOpacity) {
      wrapperProps.onPress = () => this._pressHandler()
    }

    let spinner
    if (this.state.isLoading) {
      spinner = <ActivityIndicator hidden='true' size='large' color={FOOTER_TEXT_COLOR}/>
    }

    return (
      <View style={styles.container}>
        <BackgroundImage source={BG_IMAGE} />
        <Wrapper { ...wrapperProps }>
          <View style={{flexGrow: 1}}/>
          <View style={{marginBottom: 20}}>
            {spinner}
            {busyReason}
            {updateIndicator}
            {submitLogButton}
          </View>
        </Wrapper>
        {version}
      </View>
    )
  }

  pairDevices() {
    this.props.navigator.push({
      title: 'Scan QR Code',
      id: 16,
      component: QRCodeScanner,
      titleTintColor: '#eeeeee',
      backButtonTitle: 'Cancel',
      // rightButtonTitle: 'ion|ios-reverse-camera',
      passProps: {
        onread: (result) => {
          Actions.sendPairingRequest(JSON.parse(result.data))
          this.props.navigator.pop()
        }
      }
    })
  }
  restartTiM() {
    Alert.alert(
      'Please restart TiM'
    )
  }

  _pressHandler() {
    if (utils.getMe())
      signIn(this.props.navigator)
        .then(() => this.showFirstPage())
  }
}

reactMixin(TimHome.prototype, Reflux.ListenerMixin);
reactMixin(TimHome.prototype, TimerMixin)
reactMixin(TimHome.prototype, HomePageMixin)

var styles = (function () {
  var dimensions = utils.dimensions(TimHome)
  var { width, height } = dimensions
  return StyleSheet.create({
    container: {
      // padding: 30,
      // marginTop: height / 4,
      alignItems: 'center',
    },
    tradle: {
      // color: '#7AAAC3',
      color: FOOTER_TEXT_COLOR,
      fontSize: height > 450 ? 35 : 25,
      alignSelf: 'center',
    },
    updateIndicator: {
      color: FOOTER_TEXT_COLOR,
      paddingTop: 10,
      alignSelf: 'center'
    },
    text: {
      color: '#7AAAC3',
      paddingHorizontal: 5,
      fontSize: 14,
    },
    thumbButton: {
      // marginBottom: 10,
      alignSelf: 'center',
      // justifyContent: isLandscape ? 'flex-start' : 'center',
      // padding: 40,
    },
    thumb: {
      color: '#ffffff'
      // width:  width > 400 ? width / 2.5 : 170,
      // height: width > 400 ? width / 2.5 : 170,
    },
    dev: {
      paddingVertical: 10,
      flexDirection: 'row',
      // marginBottom: 500,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center'
    },
    getStartedText: {
      color: '#f0f0f0',
      fontSize: width > 450 ? 35 : 20,
      fontWeight:'400'
    },
    getStarted: {
      backgroundColor: '#568FBE', //'#2892C6',
      paddingVertical: 10,
      paddingHorizontal: 30
    },
    submitLogInstructions: {
      maxWidth: 200,
      color: '#ffffff',
      fontSize: 12
    },
    submitLogText: {
      color: '#f0f0f0',
      fontSize: width > 450 ? 35 : 20,
      fontWeight:'400'
    },
    submitLog: {
      marginTop: 50,
      marginBottom: 20,
      backgroundColor: '#aaaacc', //'#2892C6',
      paddingVertical: 10,
      paddingHorizontal: 30
    },
    signIn: {
      flexDirection: 'row',
      width: 320,
      height: Platform.OS === 'ios' ? 80 : 60,
      marginTop: 10,
      justifyContent: 'center',
      backgroundColor: '#467EAE',
      // shadowOpacity: 0.5,
      shadowColor: 'lightblue',
      shadowRadius: 10,
      shadowOffset: {width: 0.5, height: 0.5},
      shadowOpacity: 0.7
    },
    version: {
      color: FOOTER_TEXT_COLOR,
      fontSize: 10
    },
    pairDivicesText: {
      backgroundColor: 'transparent',
      color: '#467EAE',
      fontSize: 18,
      alignSelf: 'center'
    },
    signInText: {
      backgroundColor: 'transparent',
      color: 'lightblue',
      fontSize: 18,
      alignSelf: 'center'
    },
    splashLayout: {
      alignItems: 'center',
      justifyContent: 'center',
      width,
      height
    },
    layout: {
      justifyContent: 'space-between',
      height: height
    }
  });
})()

function getIconSize (dimensions) {
  dimensions = dimensions || utils.dimensions(TimHome)
  const { width } = dimensions
  return width > 400 ? width / 2.5 : 170
}

module.exports = TimHome;

  // async onSettingsPressed() {
  //   try {
  //     await authenticateUser()
  //   } catch (err) {
  //     return
  //   }

  //   var model = utils.getModel(SETTINGS).value
  //   var route = {
  //     component: NewResource,
  //     title: translate('settings'),
  //     backButtonTitle: translate('back'),
  //     rightButtonTitle: translate('done'),
  //     id: 4,
  //     titleTextColor: '#7AAAC3',
  //     passProps: {
  //       model: model,
  //       isConnected: this.state.isConnected,
  //       callback: this.props.navigator.pop,
  //       bankStyle: defaultBankStyle

  //       // callback: this.register.bind(this)
  //     },
  //   }

  //   this.props.navigator.push(route)
  // }
