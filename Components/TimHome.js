'use strict';

var Q = require('q')
var Keychain = require('react-native-keychain')
var debounce = require('debounce')
var ResourceList = require('./ResourceList');
var VideoPlayer = require('./VideoPlayer')
var NewResource = require('./NewResource');
var ResourceView = require('./ResourceView');
var utils = require('../utils/utils');
var translate = utils.translate
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var constants = require('@tradle/constants');
// var BACKUPS = require('asyncstorage-backup')
var debug = require('debug')('Tradle-Home')
var BG_IMAGE = require('../img/bg.png')
// var PasswordCheck = require('./PasswordCheck')
var FadeInView = require('./FadeInView')
var TouchIDOptIn = require('./TouchIDOptIn')
var defaultBankStyle = require('../styles/bankStyle.json')
var QRCodeScanner = require('./QRCodeScanner')

try {
  var commitHash = require('../version.json').commit.slice(0, 7)
} catch (err) {
  // no version info available
}

// var Progress = require('react-native-progress')
import {
  authenticateUser,
  hasTouchID,
  signIn,
  setPassword
} from '../utils/localAuth'

import AutomaticUpdates from '../utils/automaticUpdates'
import CustomIcon from '../styles/customicons'
import BackgroundImage from './BackgroundImage'

const PASSWORD_ITEM_KEY = 'app-password'

import {
  StyleSheet,
  Text,
  Navigator,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
  NetInfo,
  ScrollView,
  Linking,
  Modal,
  Alert,
  Platform
} from 'react-native'
import ActivityIndicator from './ActivityIndicator'
import StatusBar from './StatusBar'

const isAndroid = utils.isAndroid()
const isLinkingSupported = utils.isIOS() && Linking
import React, { Component } from 'react'

class TimHome extends Component {
  static displayName = 'TimHome';
  static orientation = Platform.OS === 'web' ? 'LANDSCAPE' : 'PORTRAIT';
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

    this._handleConnectivityChange = this._handleConnectivityChange.bind(this)
  }
  componentWillMount() {
    this.listenTo(Store, 'handleEvent');
    this._pressHandler = debounce(this._pressHandler, 500, true)
    if (isLinkingSupported)
      Linking.addEventListener('url', this._handleOpenURL);

    // var url = LinkingIOS.popInitialURL()
    // if (url)
    //   this._handleOpenURL({url});
    if (NetInfo) {
      NetInfo.isConnected.addEventListener(
        'change',
        this._handleConnectivityChange.bind(this)
      );
      NetInfo.isConnected.fetch().then(isConnected => this._handleConnectivityChange(isConnected))
    }

    Actions.start();
  }
  // componentDidMount() {
    // AutomaticUpdates.on()
    // LinkingIOS.addEventListener('url', this._handleOpenURL);
    // var url = LinkingIOS.popInitialURL();
    // if (url)
    //   this._handleOpenURL({url});
  // }
  _handleConnectivityChange(isConnected) {
    this.props.navigator.isConnected = isConnected
  }
  componentWillUnmount() {
    if (isLinkingSupported)
      Linking.removeEventListener('url', this._handleOpenURL);

    if (NetInfo) {
      NetInfo.isConnected.removeEventListener(
        'change',
        this._handleConnectivityChange.bind(this)
      );
    }
  }
  componentDidMount() {
    AutomaticUpdates.on()
    if (!isLinkingSupported) return

    Linking.getInitialURL()
    .then((url) => {
      if (url)
        this._handleOpenURL({url});

      const checkConnected = NetInfo ? NetInfo.isConnected.fetch() : Q(true)
      checkConnected().then(isConnected => {
        let firstRoute = this.props.navigator.getCurrentRoutes()[0]
        firstRoute.isConnected = isConnected
      })
    })
    .catch((e) => {
      debugger
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.isLoading  !== nextState.isLoading   ||
        this.state.message !== nextState.message        ||
        this.state.hasMe !== nextState.hasMe)
      return true
    else
      return false
  }

  _handleOpenURL(event) {
    var url = event.url.trim();
    var idx = url.indexOf('://');
    var url = url.substring(idx + 3)
    idx = url.indexOf('/')

    url = url.replace('/', '://')
    Actions.addItem({
      resource: {_t: constants.TYPES.SETTINGS, url: url},
      value: {_t: constants.TYPES.SETTINGS, url: url},
      meta: utils.getModel(constants.TYPES.SETTINGS).value
    })
  }

  async handleEvent(params) {
    const self = this
    switch(params.action) {
    case 'connectivity':
      this._handleConnectivityChange(params.isConnected)
      break
    case 'reloadDB':
      this.setState({
        isLoading: false,
        message: translate('pleaseRestartTIM'), //Please restart TiM'
      });
      utils.setModels(params.models);
      break
    case 'start':
      // prior to registration
      // force install updates before first interaction
      if (!utils.getMe()) {
        await AutomaticUpdates.sync()
        const hasUpdate = await AutomaticUpdates.hasUpdate()
        if (hasUpdate) return AutomaticUpdates.install()
      }

      if (self.state.message) {
        self.restartTiM()
        return
      }

      // utils.setMe(params.me);
      // utils.setModels(params.models);
      self.setState({isLoading: false});
      if (!utils.getMe()) {
        self.setState({isModalOpen: true})
        // this.register(() => this.showOfficialAccounts())
        return
      }

      /* fall through */

      // if (!utils.getMe()) {
      //   return AutomaticUpdates.sync()
      //     .then(() => AutomaticUpdates.hasUpdate())
      //     .then(hasUpdate => {
      //       if (hasUpdate) AutomaticUpdates.install()
      //       else start()
      //     })
      // } else {
      //   start()
      // }

      // break

      // function start () {
      //   if (self.state.message) {
      //     self.restartTiM()
      //     return
      //   }

      //   // utils.setMe(params.me);
      //   // utils.setModels(params.models);
      //   self.setState({isLoading: false});
      //   if (!utils.getMe()) {
      //     self.setState({isModalOpen: true})
      //     // this.register(() => this.showOfficialAccounts())
      //     return
      //   }
      // }
      /* fall through */
    case 'pairingSuccessful':
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

      if (afterAuthRoute.component.displayName !== TimHome.displayName) {
        return this.props.navigator.popToRoute(afterAuthRoute)
      }

      // if (this.state.newMe)
        //{
      //   let me = utils.getMe()
      //   Actions.addItem({resource: me, value: this.state.newMe, meta: utils.getModel(constants.TYPES.PROFILE).value})
      //   let routes = this.props.navigator.getCurrentRoutes()
      //   if (me.useTouchId  &&  !me.useGesturePassword)
      //     return
      //   this.props.navigator.popToRoute(routes[routes.length - 3])
      // }
      // else
      return this.showOfficialAccounts()
    case 'getMe':
      utils.setMe(params.me)
      this.setState({hasMe: params.me})
      var nav = this.props.navigator
      signIn(this.props.navigator)
        .then(() => this.showOfficialAccounts())
      break
    }
  }

  showContacts() {
    let passProps = {
        filter: '',
        modelName: this.props.modelName,
        sortProperty: 'lastMessageTime',
        bankStyle: defaultBankStyle
      };
    let me = utils.getMe();
    this.props.navigator.push({
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      id: 10,
      title: translate('Accounts'),
      // titleTextColor: '#7AAAC3',
      backButtonTitle: translate('back'),
      component: ResourceList,
      rightButtonTitle: translate('profile'),
      passProps: passProps,
      onRightButtonPress: {
        title: utils.getDisplayName(me, utils.getModel(me[constants.TYPE]).value.properties),
        id: 3,
        component: ResourceView,
        backButtonTitle: translate('back'),
        // titleTextColor: '#7AAAC3',
        rightButtonTitle: translate('edit'),
        onRightButtonPress: {
          title: me.firstName,
          id: 4,
          component: NewResource,
          // titleTextColor: '#7AAAC3',
          backButtonTitle: translate('back'),
          rightButtonTitle: translate('done'),
          passProps: {
            model: utils.getModel(me[constants.TYPE]).value,
            resource: me,
            bankStyle: defaultBankStyle
          }
        },
        passProps: {
          bankStyle: defaultBankStyle,
          resource: me
        }
      }
    });
  }
  showOfficialAccounts(doReplace) {
    var nav = this.props.navigator
    nav.immediatelyResetRouteStack(nav.getCurrentRoutes().slice(0,1));
    let me = utils.getMe()
    if (me.isEmployee) {
      this.showContacts()
      return
    }
    let title = me.firstName;
    let route = {
      title: translate('officialAccounts'),
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      passProps: {
        modelName: constants.TYPES.ORGANIZATION,
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
            model: utils.getModel(me[constants.TYPE]).value,
            resource: me,
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
    route.passProps.callback = () => {
      setPassword(this.props.navigator)
      .then(() => this.optInTouchID())
      .then (() => {
        this.setState({hasMe: true})
        Actions.setAuthenticated(true)
        this.showOfficialAccounts(true)
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

    route.passProps.editCols = ['firstName', 'lastName', 'language']
    route.titleTintColor = '#ffffff'
    this.props.navigator.push(route);
  }

  optInTouchID() {
    return hasTouchID().then(has => {
      if (!has) return

      return new Promise(resolve => {
        this.props.navigator.replace({
          component: TouchIDOptIn,
          id: 21,
          rightButtonTitle: 'Skip',
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
        this.showOfficialAccounts(true)
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

    route.passProps.editCols = ['firstName', 'lastName', 'language']
    route.titleTintColor = '#ffffff'
    this.props.navigator.push(route);
  }

  showVideoTour(cb) {
    let onEnd = (err) => {
      if (err) debug('failed to load video', err)
      cb()
    }

    this.props.navigator.replace({
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      id: 18,
//      title: 'Tradle',
//      titleTintColor: '#eeeeee',
      component: VideoPlayer,
      rightButtonTitle: __DEV__ ? 'Skip' : undefined,
      passProps: {
        uri: 'videotour',
        onEnd: onEnd,
        onError: onEnd,
        navigator: this.props.navigator
      },
      onRightButtonPress: onEnd
    })
  }
  onReloadDBPressed() {
    utils.setMe(null);
    utils.setModels(null);
    Actions.reloadDB();
  }
  onReloadModels() {
    utils.setModels(null)
    Actions.reloadModels()
  }
  async onBackupPressed() {
    let backupNumber = await BACKUPS.backup()
    Alert.alert(
      `Backed up to #${backupNumber}`
    )
  }
  async onLoadFromBackupPressed() {
    try {
      let backupNumber = await BACKUPS.loadFromBackup()
      Alert.alert(
        `Loaded from backup #${backupNumber}. Please refresh`
      )
    } catch (err) {
      Alert.alert(
        `${err.message}`
      )
    }
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

    if (this.state.isLoading)
      return this.getSplashScreen(h)

    var err = this.state.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var me = utils.getMe()
    var settings = <View/>

    var version = !__DEV__ &&
              <View>
                <Text style={styles.version}>git: {commitHash}</Text>
              </View>

    var dev = __DEV__
            ? <View style={styles.dev}>
                <TouchableHighlight
                    underlayColor='transparent' onPress={this.onReloadDBPressed.bind(this)}>
                  <Text style={styles.text}>
                    Reload DB
                  </Text>
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor='transparent' onPress={this.onReloadModels.bind(this)}>
                  <Text style={styles.text}>
                    Reload Models
                  </Text>
                </TouchableHighlight>
                {settings}
              </View>
            : <View style={[styles.dev, { flexDirection: 'column' }]}>
                {settings}
                {version}
              </View>

    let logo = <View style={[styles.container]}>
                  <CustomIcon color='#ffffff' name="tradle" size={getIconSize()} />
                  <Text style={styles.tradle}>Tradle</Text>
              </View>

                          // <Image style={{position: 'absolute', left: 0, opacity: 0.5, width: 100, height: 100}} source={TradleWhite}></Image>
    let regView = <View  style={{alignSelf: 'center'}}>
                    <FadeInView>
                      <TouchableHighlight  onPress={() => {
                        this.register(this.showOfficialAccounts.bind(this))
                        }} underlayColor='transparent'>
                        <View style={styles.signIn}>
                          <Text style={styles.signInText}>{translate('This is my first Tradle device')}</Text>
                        </View>
                      </TouchableHighlight>
                    </FadeInView>
                 </View>

    return (
      <View style={[{height: height}]}>
        <BackgroundImage source={BG_IMAGE} />
        <View style={styles.layout}>
          <View/>
          {logo}
          <View>
            { utils.getMe()
              ? <TouchableHighlight style={[styles.thumbButton, {justifyContent: 'flex-end',  opacity: me ? 1 : 0}]}
                    underlayColor='transparent' onPress={() => this._pressHandler()}>
                  <View style={styles.getStarted}>
                     <Text style={styles.getStartedText}>Get started</Text>
                  </View>
                </TouchableHighlight>
              : regView
            }
            <Text style={errStyle}>{err}</Text>
            {dev}
          </View>
        </View>
      </View>
    );
  }
  getSplashScreen() {
    var {width, height} = utils.dimensions(TimHome)
    return (
      <View style={styles.container}>
        <BackgroundImage source={BG_IMAGE} />
        <View  style={styles.splashLayout}>
          <View>
            <CustomIcon name="tradle" color='#ffffff' size={getIconSize()} />
            <Text style={styles.tradle}>Tradle</Text>
          </View>
          <View style={{paddingTop: 20, alignSelf: 'center'}}>
            <ActivityIndicator hidden='true' size='large' color='#ffffff'/>
          </View>
        </View>
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

  renderSplashscreen({ thumb, width, height }) {
    const splashscreen = (
      <View>
        <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width: width, height: height }} />
        <ScrollView
          scrollEnabled={false}
          style={{height}}>
          <View style={[styles.container]}>
            <Image style={thumb} source={TradleWhite}></Image>
            <Text style={styles.tradle}>Tradle</Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <ActivityIndicator hidden='true' size='large' color='#ffffff'/>
          </View>
        </ScrollView>
      </View>
    )

    return splashscreen
  }

  async onSettingsPressed() {
    try {
      await authenticateUser()
    } catch (err) {
      return
    }

    var model = utils.getModel(constants.TYPES.SETTINGS).value
    var route = {
      component: NewResource,
      title: translate('settings'),
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('done'),
      id: 4,
      titleTextColor: '#7AAAC3',
      passProps: {
        model: model,
        isConnected: this.state.isConnected,
        callback: this.props.navigator.pop,
        bankStyle: defaultBankStyle

        // callback: this.register.bind(this)
      },
    }

    this.props.navigator.push(route)
  }
  restartTiM() {
    Alert.alert(
      'Please restart TiM'
    )
  }

  _pressHandler() {
    if (utils.getMe())
      signIn(this.props.navigator)
        .then(() => this.showOfficialAccounts())
  }
}

reactMixin(TimHome.prototype, Reflux.ListenerMixin);

var styles = (function () {
  var dimensions = utils.dimensions(TimHome)
  var { width, height } = dimensions
  var thumb = width > 1000 ? 250 : Math.floor(width > 400 ? width / 2.5 : 170)
  return StyleSheet.create({
    container: {
      // padding: 30,
      // marginTop: height / 4,
      alignItems: 'center',
    },
    tradle: {
      // color: '#7AAAC3',
      color: '#eeeeee',
      fontSize: height > 450 ? 35 : 25,
      alignSelf: 'center',
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
    signIn: {
      flexDirection: 'row',
      width: 300,
      height: Platform.OS === 'ios' ? 80 : 50,
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
      color: '#ffffff',
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
      height: height
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
  const size = width > 400 ? Math.floor(width / 2.5) : 170
  return Math.min(size, 250)
}

module.exports = TimHome;
  // signIn(cb) {
  //   let self = this
  //   if (this.state.message) {
  //     this.restartTiM()
  //     return
  //   }

  //   let me = utils.getMe()
  //   if (!me) return this.register()

  //   if (isAuthenticated()) {
  //     return cb()
  //   }

  //   let doneWaiting
  //   let authPromise = isAuthenticated() ? Q()
  //     : me.useTouchId ? touchIDWithFallback()
  //     : passwordAuth()

  //   return authPromise
  //     .then(() => {
  //       setAuthenticated(true)
  //       cb()
  //     })
  //     .catch(err => {
  //       if (err.name == 'LAErrorUserCancel' || err.name === 'LAErrorSystemCancel') {
  //         self.props.navigator.popToTop()
  //       } else {
  //         lockUp(err.message || 'Authentication failed')
  //       }
  //     })

  //   function touchIDWithFallback() {
  //     return authenticateUser()
  //     .catch((err) => {
  //       if (err.name === 'LAErrorUserFallback' || err.name.indexOf('TouchID') !== -1) {
  //         return passwordAuth()
  //       }

  //       throw err
  //     })
  //   }

  //   function passwordAuth () {
  //     return Keychain.getGenericPassword(PASSWORD_ITEM_KEY)
  //       .catch(err => {
  //         // registration must have been aborted.
  //         // ask user to set a password
  //         return Q.ninvoke(self, 'setPassword')
  //       })
  //       .then(() => {
  //         return Q.ninvoke(self, 'checkPassword')
  //       })
  //   }

  //   function lockUp (err) {
  //     self.setState({isModalOpen: true})
  //     loopAlert(err)
  //     setTimeout(() => {
  //       doneWaiting = true
  //       // let the user try again
  //       self.signIn(cb)
  //     }, __DEV__ ? 5000 : 5 * 60 * 1000)
  //   }

  //   function loopAlert (err) {
  //     Alert.alert(err, null, [
  //       {
  //         text: 'OK',
  //         onPress: () => !doneWaiting && loopAlert(err)
  //       }
  //     ])
  //   }
  // }
  // async _localAuth() {
    // if (this.state.authenticating) return

    // if (!this.state.authenticated) {
    //   this.setState({ authenticating: true })
    //   try {
    //     await authenticateUser()
    //   } catch (err)  {
    //     this.setState({ authenticating: false })
    //     throw err
    //   }
    // }

    // this.showOfficialAccounts()
    // if (this.state.authenticating) {
    //   this.setState({ authenticating: false })
    // }
  // }
  //////////////////////// LAST CHANGE - 07/12/2016
  // signUp(cb) {
  //   var nav = this.props.navigator
  //   nav.immediatelyResetRouteStack(nav.getCurrentRoutes().slice(0,1));
  //   let self = this
  //   this.setPassword(function(err) {
  //     if (err)
  //       debug('failed to set password', err)
  //     else {
  //       cb()
  //     }
  //   })
  //   // this.showOfficialAccounts(true);
  //   // this.props.navigator.popToTop();
  // }
  // signIn(cb) {
  //   let me = utils.getMe()
  //   if (!me)
  //     return this.register(cb)

  //   if (me.isAuthenticated  &&  !this.state.newMe)
  //     return cb()

  //   let doneWaiting
  //   let authPromise
  //   if (me.useTouchId  &&  me.useGesturePassword) {
  //     if (this.state.newMe) {
  //       if (!newMe.useTouchId)
  //         authPromise = touchIDWithFallback()
  //       else
  //         authPromise = passwordAuth()
  //     }
  //     else
  //       authPromise = touchIDAndPasswordAuth()
  //   }
  //   else if (me.useTouchId)
  //     authPromise = touchIDWithFallback()
  //   else
  //     authPromise = passwordAuth()
  //   let self = this
  //   return authPromise
  //     .then(() => {
  //       Actions.setAuthenticated(true)
  //       cb()
  //     })
  //     .catch(err => {
  //       if (err.name == 'LAErrorUserCancel' || err.name === 'LAErrorSystemCancel') {
  //         self.props.navigator.popToTop()
  //       } else {
  //         lockUp(err.message || 'Authentication failed')
  //       }
  //     })

  //   function touchIDAndPasswordAuth() {
  //     if (isAndroid) return passwordAuth()

  //     return authenticateUser()
  //     .then(() => {
  //       return passwordAuth()
  //     })
  //     .catch((err) => {
  //       debugger
  //       throw err
  //     })
  //   }

  //   function touchIDWithFallback() {
  //     if (isAndroid) return passwordAuth()

  //     return authenticateUser()
  //     .catch((err) => {
  //       if (err.name === 'LAErrorUserFallback' || err.name.indexOf('TouchID') !== -1) {
  //         return passwordAuth()
  //       }

  //       throw err
  //     })
  //   }

  //   function passwordAuth () {
  //     return Keychain.getGenericPassword(PASSWORD_ITEM_KEY)
  //       .then(
  //         () =>  Q.ninvoke(self, 'checkPassword'),
  //         // registration must have been aborted.
  //         // ask user to set a password
  //         (err) => Q.ninvoke(self, 'setPassword')
  //       )
  //   }

  //   function lockUp (err) {
  //     self.setState({isModalOpen: true})
  //     loopAlert(err)
  //     setTimeout(() => {
  //       doneWaiting = true
  //       // let the user try again
  //       signIn(cb, this.props.navigator)
  //     }, __DEV__ ? 5000 : 5 * 60 * 1000)
  //   }

  //   function loopAlert (err) {
  //     Alert.alert(err, null, [
  //       {
  //         text: 'OK',
  //         onPress: () => !doneWaiting && loopAlert(err)
  //       }
  //     ])
  //   }
  // }
  // setPassword(cb) {
  //   let self = this
  //   this.props.navigator.push({
  //     component: PasswordCheck,
  //     id: 20,
  //     passProps: {
  //       mode: PasswordCheck.Modes.set,
  //       validate: (pass) => { return pass.length > 4 },
  //       promptSet: translate('pleaseDrawPassword'),
  //       promptInvalidSet: translate('passwordLimitations'),
  //       onSuccess: (pass) => {
  //         Keychain.setGenericPassword(PASSWORD_ITEM_KEY, utils.hashPassword(pass))
  //         .then(() => {
  //           Actions.updateMe({ isRegistered: true })
  //           return hasTouchID()
  //         })
  //         .then((askTouchID) => {
  //           if (askTouchID) {
  //             return self.props.navigator.replace({
  //               component: TouchIDOptIn,
  //               id: 21,
  //               rightButtonTitle: 'Skip',
  //               passProps: {
  //                 optIn: () => {
  //                   Actions.updateMe({ useTouchId: true })
  //                   cb()
  //                 }
  //               },
  //               onRightButtonPress: cb.bind(this)
  //             })
  //           }

  //           cb()
  //         })
  //         .catch(err => {
  //           debugger
  //         })
  //       },
  //       onFail: () => {
  //         debugger
  //         Alert.alert('Oops!')
  //       }
  //     }
  //   })
  // }
  // checkPassword(cb, doReplace) {
  //   let nav = this.props.navigator
  //   // HACK
  //   let routes = nav.getCurrentRoutes()
  //   if (routes[routes.length - 1].id === 20)
  //     return

  //   let route = {
  //     component: PasswordCheck,
  //     id: 20,
  //     passProps: {
  //       mode: PasswordCheck.Modes.check,
  //       maxAttempts: 3,
  //       promptCheck: translate('drawYourPassword'), //Draw your gesture password',
  //       promptRetryCheck: translate('gestureNotRecognized'), //Gesture not recognized, please try again',
  //       isCorrect: (pass) => {
  //         return Keychain.getGenericPassword(PASSWORD_ITEM_KEY)
  //           .then((stored) => {
  //             return stored === utils.hashPassword(pass)
  //           })
  //           .catch(err => {
  //             return false
  //           })
  //       },
  //       onSuccess: () => {
  //         cb()
  //       },
  //       onFail: (err) => {
  //         cb(err || new Error('For the safety of your data, ' +
  //           'this application has been temporarily locked. ' +
  //           'Please try in 5 minutes.'))
  //         // lock up the app for 10 mins? idk
  //       }
  //     }
  //   }

  //   nav.push(route)
  // }
