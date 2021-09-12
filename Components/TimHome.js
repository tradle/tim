
import Q from 'q'
import debounce from 'debounce'
import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import extend from 'extend'
import Reflux from 'reflux'
import TimerMixin from 'react-timer-mixin'
import { SyncStatus } from 'react-native-code-push'
import { parse as parseURL } from 'url'
import reactMixin from 'react-mixin'

const debug = require('debug')('tradle:app:Home')

import { Text, setFontFamily } from './Text'
import HomePageMixin from './HomePageMixin'
import components from './components'
import utils, { translate, isWeb } from '../utils/utils'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import constants from '@tradle/constants'
import PasswordCheck from './PasswordCheck'
import FadeInView from './FadeInView'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import {
  // authenticateUser,
  hasTouchID,
  signIn,
  setPassword
} from '../utils/localAuth'

import Linking from '../utils/linking'
import AutomaticUpdates from '../utils/automaticUpdates'
import BackgroundImage from './BackgroundImage'
import Navs from '../utils/navs'
import ENV from '../utils/env'
import ActivityIndicator from './ActivityIndicator'

try {
  var commitHash = require('../version.json').commit.slice(0, 7)
} catch (err) {
  // no version info available
}
const actions = ['chat', 'profile', 'applyForProduct', 'r']
var {
  TYPE
} = constants
var {
  ORGANIZATION,
  // CUSTOMER_WAITING,
  MESSAGE
} = constants.TYPES
// import Progress from 'react-native-progress'
const BG_IMAGE = ENV.splashBackground
const SUBMIT_LOG_TEXT = {
  submit: translate('submitLog'),
  submitting: translate('submitting') + '...',
  submitted: translate('restartApp')
}

const isLinkingSupported = Linking
const FOOTER_TEXT_COLOR = ENV.splashContrastColor

class TimHome extends Component {
  static displayName = 'TimHome';
  static orientation = Platform.OS === 'web' ? 'LANDSCAPE' : 'PORTRAIT';
  static propTypes = {
    modelName: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      hasMe: utils.getMe(),
    };

    this._handleOpenURL = this._handleOpenURL.bind(this)
    // this._handleConnectivityChange = this._handleConnectivityChange.bind(this)
  }
  componentWillMount() {
    this.uhOhTimeout = this.setTimeout(() => {
      if (!this.state.isLoading && !this.state.downloadingUpdate) return

      this.setState({ submitLogButtonText: SUBMIT_LOG_TEXT.submit })
    }, 120000)

    this.listenTo(Store, 'handleEvent');
    this._pressHandler = debounce(this._pressHandler, 500, true)
    if (isLinkingSupported)
      Linking.addEventListener('url', this._handleOpenURL);

    Actions.start();
  }
  _handleConnectivityChange(isConnected) {
    this.props.navigator.isConnected = isConnected
    this.state.isConnected = isConnected
  }
  componentWillUnmount() {
    if (isLinkingSupported)
      Linking.removeEventListener('url', this._handleOpenURL);
  }
  async componentDidMount() {
    try {
      let url
      if (isLinkingSupported) {
        url = await Linking.getInitialURL()
      }

      if (url) {
        let action = url.match(/.*\/([^?]+)/)
        if (!action  ||  actions.indexOf(action[1]) === -1)
          url = null
        else
          this.setState({isDeepLink: true})
      }
      if (!url)
        url = ENV.initWithDeepLink

      if (url)
        await this._handleOpenURL({url})
      if (ENV.landingPage)
        this.show()
    } catch (err) {
      debug('failed to open deep link', err)
    }
  }

  show() {
    let me = utils.getMe()
    if (!me) {
      if (ENV.autoRegister)
        this.showFirstPage()
      return
    }
    this.signInAndContinue()
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.state.submitLogButtonText !== nextState.submitLogButtonText    ||
        this.state.busyWith !== nextState.busyWith                             ||
        this.state.downloadUpdateProgress !== nextState.downloadUpdateProgress ||
        this.state.isLoading  !== nextState.isLoading     ||
        this.state.message !== nextState.message          ||
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
      if (pathname !== 'conversations') //  &&  pathname !== 'profile')
        return
    }

    let qs = query ? require('@tradle/qr-schema').links.parseQueryString(query) : {}

    let firstPage = qs.schema && qs.schema || pathname
    let state = {firstPage, qs, isDeepLink: true}
    this.setState(state)
    // Actions.setPreferences(state)

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
      let { displayName } = components[currentRoute.componentName]
      if (displayName === TimHome.displayName || displayName === PasswordCheck.displayName) {
        debug('waiting to throw up deep linked alert until we are past the home screens')
        await Q.ninvoke(utils, 'onNextTransitionEnd', navigator)
      } else {
        break
      }
    }

    return new Promise((resolve, reject) => {
      Alert.alert(title, message, [
        {
          text: 'Cancel',
          onPress: resolve
        },
        {
          text: 'OK',
          onPress: () => {
            // goto
            this._unsafeHandleOpenURL({url: 'tradle:/' + ok})
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
    if (AutomaticUpdates.sync && !(me && me.ensuredUpToDateOnFirstRun)) {
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
          timeout: 10000,
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

    if (AutomaticUpdates.on) {
      AutomaticUpdates.on()
    }

    if (this.state.message) {
      this.restartTiM()
      return
    }

    this.setState({isLoading: false});
    clearTimeout(this.uhOhTimeout)

    if (me  &&  me.isEmployee)
      setFontFamily(me.organization.style)
    // Need to laod data for landing page first
    if (!ENV.landingPage  &&  !this.state.inTour)
      this.show()
  }

  async signInAndContinue() {
    const routes = this.props.navigator.getCurrentRoutes()
    // get the top TimHome in the stack
    const homeRoute = routes.filter(r => components[r.componentName].displayName === TimHome.displayName).pop()
    const afterAuthRoute = utils.getTopNonAuthRoute(this.props.navigator)
    try {
      await signIn(this.props.navigator)
    } catch (err) {
      if (components[afterAuthRoute.componentName].displayName === TimHome.displayName) return

      if (homeRoute) {
        return this.props.navigator.popToRoute(homeRoute)
      }

      return this.props.navigator.resetTo({
        componentName: 'TimHome',
        passProps: {}
      })
    }

    if (components[afterAuthRoute.componentName].displayName !== TimHome.displayName  &&  !this.state.isDeepLink) {
      return this.props.navigator.popToRoute(afterAuthRoute)
    }
    return this.showFirstPage()
  }

  async handleEvent(params) {
    let {action, activity, isConnected, models, me,
        isRegistration, provider, termsAccepted, url} = params
    var nav = this.props.navigator
    let { wasDeepLink } = this.state
    switch(action) {
    case 'busy':
      this.setState({
        busyWith: activity
      })

      return
    case 'connectivity':
      this._handleConnectivityChange(isConnected)
      return
    case 'reloadDB':
      this.setState({
        isLoading: false,
        message: translate('pleaseRestartTIM'), //Please restart TiM'
      });
      utils.setModels(models);
      return
    case 'applyForProduct':
      this.showChatPage({resource: provider, action: wasDeepLink ? 'push' : 'replace', showProfile: wasDeepLink})
      break
    case 'openURL':
      this.setState({isDeepLink: true})
      Actions.openURL(url)
      break
    case 'getProvider':
      let formStub
      const { qs } = this.state
      if (qs  &&  qs.stub) {
        formStub = JSON.parse(qs.stub)
        // debugger
      }

      this.showChatPage({resource: provider, formStub, termsAccepted, showProfile: true})
      return
    case 'getItemFromDeepLink':
      this.showResource(params)
      return
    case 'getForms':
      this.showChat(params)
      return
    case 'showProfile':
      this.showProfile(nav, 'replace', params.importingData)
      return
    case 'noAccessToServer':
      Alert.alert(translate('noAccessToServer'))
      return
    case 'start':
      this.onStart(params)
      return
    case 'getMe':
      await utils.setMe({meRes: me})
      this.setState({hasMe: me})
      if (me.isEmployee) {
        debugger
      }
      this.signInAndContinue()
      return
    case 'addItem':
      if (!isRegistration  ||  !ENV.tour)
        return
      // StatusBar.setHidden(true)
      this.showLandingPage(null, ENV.tour)
      break
    case 'offerKillSwitchAfterApplication':
      if (!isWeb()) return

      if (ENV.wipeAfterApplication) {
        Alert.alert(
          translate('autoEraseTitle'),
          translate('autoEraseMessage'),
          []
        )

        setTimeout(() => {
          Actions.requestWipe({ confirmed: true })
        }, 10000)
      } else if (ENV.offerKillSwitchAfterApplication) {
        Alert.alert(
          translate('enterPasswordOrErase'),
          null,
          [
            {text: translate('eraseSession'), onPress: () => Actions.requestWipe()},
            {text: translate('enterAPassword'), onPress: () => {
              signIn(this.props.navigator, null, true)
                .then(() => this.props.navigator.pop())
            }}
          ]
        )
      }

      return
    }
  }

  showContacts(action) {
    let me = utils.getMe();
    let bankStyle = {}
    _.extend(bankStyle, defaultBankStyle)
    if (me.isEmployee  &&  me.organization.style)
      _.extend(bankStyle, me.organization.style)
    let locale, currency
    if (me.isEmployee) {
      locale = utils.getCompanyLocale()
      currency = utils.getCompanyCurrency()
    }
    let passProps = {
        filter: '',
        modelName: this.props.modelName,
        sortProperty: 'lastMessageTime',
        officialAccounts: true,
        bankStyle,
        locale,
        currency
      };
    Actions.getAllSharedContexts()
    Actions.hasPartials()
    Actions.hasBookmarks()
    // return
    let { navigator } = this.props
    let profileTitle
    if (me.organization)
      profileTitle = me.organization.title
    else
      profileTitle = utils.getDisplayName({ resource: me })
    navigator[action]({
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      title: translate('officialAccounts'),
      backButtonTitle: 'Back',
      componentName: 'ResourceList',
      rightButtonTitle: 'Profile',
      passProps,
      onRightButtonPress: () => navigator.push({
        title: profileTitle,
        componentName: 'ResourceView',
        backButtonTitle: 'Back',
        passProps: {
          bankStyle,
          backlink: utils.getModel(me[TYPE]).properties.myForms,
          resource: me,
          locale,
          currency
        },
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: me.firstName,
          componentName: 'NewResource',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel(me[TYPE]),
            resource: me,
            bankStyle,
            locale,
            currency
          }
        },
      })
    });
  }
  showFirstPage(noResetNavStack) {
    let { firstPage, isDeepLink, qs } = this.state
    let state = {}
    if (isDeepLink) {
      state.firstPage = ENV.initWithDeepLink
      state.wasDeepLink = true
    }
    let replace
    if (!noResetNavStack) {
      // After tour
      var nav = this.props.navigator
      if (isWeb()) {
        if (nav.getCurrentRoutes().length > 1)
          replace = true
      }
      else
        nav.immediatelyResetRouteStack(nav.getCurrentRoutes().slice(0,1));
    }

    state.isDeepLink = false
// /chat?url=https://ubs.tradle.io&permalink=72d63e70bd75e65cf94e2d1f7f04c59816ad183801b981428a8a0d1abbf00190
    let action = replace ? 'replace' : 'push'
    let me = utils.getMe()
    if (!firstPage  &&  me  &&  me.isEmployee) {
      this.showContacts(action)
      return
    }
    state.firstPage = null
    state.inTour = false
    this.setState(state)
    let navigator = this.props.navigator
    if (firstPage) {
      switch (firstPage) {
      case 'chat':
        // Actions.getProvider({
        //   permalink: this.state.permalink,
        //   url: this.state.url
        // })
        Actions.getProvider(qs)
        break
      case 'r':
        Actions.getResourceFromLink(qs)
        break
      case 'ImportData':
        this.showChatPage({resource: qs.provider, action: state.wasDeepLink ? 'push' : 'replace', showProfile: state.wasDeepLink})
        Actions.importData(qs)
        break
      case 'applyForProduct':
        Actions.applyForProduct(qs)
        break
      // case 'applyForProduct':
      //   Actions.applyForProduct({host: this.state.host, provider: this.state.provider, product: this.state.product })
      //   break
      case 'officialAccounts':
      case 'conversations':
        this.showOfficialAccounts(action)
        break
      case 'profile':
        this.showProfile(navigator, action)
        break
      case 'scan':
        this.showScanHelp(action)
          // this.scanFormsQRCode()
        break
      default:
        // if (ENV.homePage)
        //   this.showProfile(action)
        // else
          this.showOfficialAccounts(action)
      }
      return
    }

    // if (ENV.homePage) {
    //   this.showProfile(action)
    //   return
    // }

    this.showOfficialAccounts()
  }
  showScanHelp(action) {
    const scanHelp = Platform.OS === 'android'
      ? { uri: 'file:///android_asset/ScanHelp.html' }
      : require('../html/ScanHelp.html')

    this.props.navigator[action]({
      componentName: 'ArticleView',
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
      this.showChatPage({resource: provider, termsAccepted: true})
    else
      Actions.acceptTermsAndChat({
        bot: this.state.permalink,
        url: this.state.url
      })
  }

  showChatPage({resource, formStub, termsAccepted, action, showProfile}) {
    if (ENV.landingPage  &&  !termsAccepted) {
      this.showLandingPage(resource, ENV.landingPage)
      return
    }
    let { navigator, currency } = this.props
    // Check if the current page is the same we need
    let routes = navigator.getCurrentRoutes()
    let currentRoute = routes[routes.length - 1]
    if (currentRoute.componentName === 'MessageList') {
      if (utils.getId(currentRoute.passProps.resource) === utils.getId(resource))
        return
    }
    let style = {}
    extend(style, defaultBankStyle)
    if (resource.style)
      extend(style, resource.style)


    if (this.showTourOrSplash({resource, formStub, showProfile, termsAccepted, action: action || 'push', callback: this.showChatPage.bind(this)}))
      return

    let route
    if (formStub) {
      route = {
        title: resource.name,
        componentName: 'MessageView',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Profile',
        passProps: {
          resource: formStub,
          isDeepLink: true,
          to: resource,
          currency: currency,
          bankStyle:  style
        }
      }
    }
    else {
      route = {
        title: resource.name,
        componentName: 'MessageList',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Profile',
        onRightButtonPress: {
          title: resource.name,
          componentName: 'ResourceView',
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          passProps: {
            bankStyle: style,
            resource: resource,
            currency: currency
          }
        },
        passProps: {
          resource: resource,
          modelName: MESSAGE,
          currency: currency,
          bankStyle:  style
        }
      }
    }
    if (showProfile)
      route.passProps.onLeftButtonPress = () => this.showOfficialAccounts('replace')
    if (action)
      navigator[action](route)
    else if (termsAccepted  &&  routes.length === 3)
      navigator.replace(route)
    else
      navigator.push(route)
  }
  showResource({resource, bankStyle}) {
    let componentName, id
    if (utils.isMessage(resource)) {
      componentName = 'MessageView'
    }
    else {
      componentName = 'ResourceView'
    }

    let style = {}
    extend(style, defaultBankStyle)
    if (bankStyle)
      extend(style, bankStyle)
    let title = utils.getDisplayName({ resource })
    let route = {
      title,
      componentName,
      backButtonTitle: 'Back',
      passProps: {
        bankStyle: style,
        resource,
      }
    }
    this.props.navigator.push(route)

  }
  showLandingPage(provider, landingPage) {
    let style = {}
    extend(style, defaultBankStyle)
    if (provider  &&  provider.style)
      extend(style, provider.style)
    this.state.inTour = ENV.tourPages !== null
    let c = this.props.landingPageMapping[landingPage]
    this.props.navigator.push({
      title: provider  &&  provider.name || '',
      componentName: c.component,
      // backButtonTitle: __DEV__ ? 'Back' : null,
      passProps: {
        bankStyle: style,
        resource: provider,
        url: this.state.url,
        tour: ENV.tourPages,
        callback: this.showFirstPage.bind(this),
        acceptTermsAndChat: this.acceptTermsAndChat.bind(this),
        showChat: this.showChatPage.bind(this),
      }
    })
  }
  showOfficialAccounts(action) {
    const me = utils.getMe()
    Actions.hasPartials()
    const title = me.firstName;
    const { wasDeepLink, isConnected, qs } = this.state
    const profileModel = utils.getModel(me[TYPE])
    let route = {
      title: translate('officialAccounts'),
      componentName: 'ResourceList',
      backButtonTitle: 'Back',
      passProps: {
        modelName: ORGANIZATION,
        isDeepLink: wasDeepLink  &&  !qs.stub,
        isConnected,
        officialAccounts: true,
        bankStyle: defaultBankStyle
      },
      rightButtonTitle: 'Profile',
      onRightButtonPress: {
        title,
        componentName: 'ResourceView',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title,
          componentName: 'NewResource',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: profileModel,
            resource: me,
            backlink: profileModel.properties.myForms,
            bankStyle: defaultBankStyle
          }
        },
        passProps: {
          resource: me,
          bankStyle: defaultBankStyle
        }
      }
    }
    this.props.navigator[action || 'push'](route)
  }

  register(cb) {
    let modelName = this.props.modelName;
    if (!utils.getModel(modelName)) {
      this.setState({err: 'Can find model: ' + modelName});
      return;
    }

    let model = utils.getModel(modelName);
    let route = {
      componentName: 'NewResource',
      titleTextColor: '#BCD3E6',
      passProps: {
        model: model,
        bankStyle: defaultBankStyle,
        isConnected: this.state.isConnected,
      },
    };

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
          componentName: 'TouchIDOptIn',
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

  onReloadDBPressed() {
    utils.setMe({meRes: null});
    utils.setModels(null);
    Actions.reloadDB();
  }
  onReloadModels() {
    utils.setModels(null)
    Actions.reloadModels()
  }
  render() {
    // StatusBar.setHidden(true);
    let { message, err, isLoading } = this.state
    if (message) {
      this.restartTiM()
      return
    }
    // var url = Linking.getInitialURL();
    var { height } = utils.dimensions(TimHome)
    var h = height > 800 ? height - 220 : height - 180

    if (!__DEV__ && ENV.landingPage) {
      return this.getSplashScreen()
    }

    if (isLoading) {
      return this.getSplashScreen(h)
    }

    err = err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var me = utils.getMe()
    var settings = <View/>

    var version = !__DEV__ && this.renderVersion()
    var dev = __DEV__
            ? <View style={styles.dev} testID='welcome'>
                <TouchableOpacity onPress={this.onReloadDBPressed.bind(this)}>
                  <Text style={styles.text}>
                    Reload DB
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.onReloadModels.bind(this)}>
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

    let regView
    if (!ENV.autoRegister) {
      regView = <View  style={styles.center}>
                  <FadeInView>
                    <TouchableOpacity  onPress={() => {
                      this.register(this.showFirstPage.bind(this))
                      }}>
                      <View style={styles.signIn}>
                        <Text style={styles.signInText}>{translate('getStarted')}</Text>
                      </View>
                    </TouchableOpacity>
                  </FadeInView>
               </View>
    }
    else if (utils.getMe()) {
      regView = <TouchableOpacity testID='getStarted' style={[styles.thumbButton, {opacity: me ? 1 : 0}]}
                  onPress={() => this._pressHandler()}>
                  <View style={styles.getStarted}>
                     <Text style={styles.getStartedText}>{translate('getStarted')}</Text>
                  </View>
                </TouchableOpacity>
    }

    return (
      <View style={styles.container}>
        <BackgroundImage testID="homeBG" source={BG_IMAGE} />
        <TouchableOpacity style={styles.splashLayout} onPress={() => this._pressHandler()}>
          <View style={styles.flexGrow} />
          {regView}
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

  getSplashScreen(h) {
    const version = __DEV__ && this.renderVersion()
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
      spinner = (
        <View style={{alignSelf: 'center'}}>
          <ActivityIndicator hidden='true' size='large' color={FOOTER_TEXT_COLOR} />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <BackgroundImage source={BG_IMAGE} />
        <Wrapper { ...wrapperProps }>
          <View style={h ? {height: h} : styles.flexGrow}/>
          <View style={styles.bottom}>
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
  var { width, height } = utils.dimensions(TimHome)
  var thumb = width > 1000 ? 250 : Math.floor(width > 400 ? width / 2.5 : 170)
  return StyleSheet.create({
    container: {
      // padding: 30,
      // marginTop: height / 4,
      alignItems: 'center',
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
      alignSelf: 'center',
      marginTop: -20,
      justifyContent: 'flex-end',
    },
    thumb: {
      width:  thumb,
      height: thumb,
      paddingBottom: 30,
      marginTop: Platform.OS === 'web' ? -50 : 0
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
      fontSize: width > 450 ? 30 : 20,
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
    },
    shadow: {
      shadowColor: '#245c8c',
      backgroundColor: 'lightblue'
    },
    center: {
      alignSelf: 'center'
    },
    flexGrow: {
      flexGrow: 1
    },
    bottom: {
      marginBottom: 20
    },
  });
})()

function getIconSize (dimensions) {
  dimensions = dimensions || utils.dimensions(TimHome)
  const { width } = dimensions
  const size = width > 400 ? Math.floor(width / 2.5) : 170
  return Math.min(size, 250)
}

module.exports = TimHome;

