'use strict';

var Q = require('q')
var Keychain = require('react-native-keychain')
var ResourceList = require('./ResourceList');
var VideoPlayer = require('./VideoPlayer')
var AddNewIdentity = require('./AddNewIdentity');
var NewResource = require('./NewResource');
var ResourceView = require('./ResourceView');
var utils = require('../utils/utils');
var translate = utils.translate
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var constants = require('@tradle/constants');
var BACKUPS = require('asyncstorage-backup')
var debug = require('debug')('Tradle-Home')
var TradleWhite = require('../img/TradleW.png')
var BG_IMAGE = require('../img/bg.png')
var PasswordCheck = require('./PasswordCheck')
var TouchIDOptIn = require('./TouchIDOptIn')
try {
  var commitHash = require('../version').commit.slice(0, 7)
} catch (err) {
  // no version info available
}

// var Progress = require('react-native-progress')
import {
  authenticateUser,
  hasTouchID
} from '../utils/localAuth'
const PASSWORD_ITEM_KEY = 'app-password'

import {
  StyleSheet,
  Text,
  Navigator,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActivityIndicatorIOS,
  Image,
  NetInfo,
  ScrollView,
  LinkingIOS,
  StatusBar,
  Dimensions,
  Alert,
  AppState,
  Platform
} from 'react-native'

const isAndroid = Platform.OS === 'android'
import React, { Component } from 'react'

class TimHome extends Component {
  props: {
    modelName: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isModalOpen: false
    };
  }
  componentWillMount() {
    LinkingIOS.addEventListener('url', this._handleOpenURL);

    // var url = LinkingIOS.popInitialURL()
    // if (url)
    //   this._handleOpenURL({url});
    NetInfo.isConnected.addEventListener(
      'change',
      this._handleConnectivityChange.bind(this)
    );
    NetInfo.isConnected.fetch().done(
      (isConnected) => {
        this._handleConnectivityChange(isConnected)
      }
    );
    Actions.start();
  }

  componentDidMount() {
    AutomaticUpdates.on()
    AppState.addEventListener('change', this._handleAppStateChange);
    // LinkingIOS.addEventListener('url', this._handleOpenURL);
    // var url = LinkingIOS.popInitialURL();
    // if (url)
    //   this._handleOpenURL({url});
  }
  _handleConnectivityChange(isConnected) {
    this.props.navigator.isConnected = isConnected
  }
  componentWillUnmount() {
    LinkingIOS.removeEventListener('url', this._handleOpenURL);
    NetInfo.isConnected.removeEventListener(
      'change',
      this._handleConnectivityChange.bind(this)
    );
  }
  componentDidMount() {
    var url = LinkingIOS.popInitialURL()
    if (url)
      this._handleOpenURL({url});
    NetInfo.isConnected.fetch().done(
      (isConnected) => {
        let firstRoute = this.props.navigator.getCurrentRoutes()[0]
        firstRoute.isConnected = isConnected
      }
    );
    this.listenTo(Store, 'handleEvent');
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.isLoading  !== nextState.isLoading  ||
        this.state.message !== nextState.message)
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

  handleEvent(params) {
    if (params.action === 'connectivity') {
      this._handleConnectivityChange(params.isConnected)
      return
    }
    if (params.action === 'reloadDB') {
      this.setState({
        isLoading: false,
        message: translate('pleaseRestartTIM'), //Please restart TiM'
      });
      utils.setModels(params.models);
    }
    else if (params.action === 'start') {
      if (this.state.message) {
        this.restartTiM()
        return
      }

      utils.setMe(params.me);
      utils.setModels(params.models);
      this.setState({isLoading: false});
      this.signIn(() => this.showOfficialAccounts())
    }
    else if (params.action === 'getMe') {
      utils.setMe(params.me)
      var nav = this.props.navigator
      this.signIn(() => this.showOfficialAccounts())
    }
  }

  signIn(cb) {
    let self = this

    let me = utils.getMe()
    if (!me)
      return this.register(cb)

    if (me.isAuthenticated)
      return cb()

    let doneWaiting
    let authPromise = me.useTouchId
      ? touchIDWithFallback()
      : passwordAuth()

    return authPromise
      .then(() => {
        Actions.setAuthenticated(true)
        cb()
      })
      .catch(err => {
        if (err.name == 'LAErrorUserCancel' || err.name === 'LAErrorSystemCancel') {
          self.props.navigator.popToTop()
        } else {
          lockUp(err.message || 'Authentication failed')
        }
      })

    function touchIDWithFallback() {
      if (isAndroid) return passwordAuth()

      return authenticateUser()
      .catch((err) => {
        if (err.name === 'LAErrorUserFallback' || err.name.indexOf('TouchID') !== -1) {
          return passwordAuth()
        }

        throw err
      })
    }

    function passwordAuth () {
      // TODO: auth on android
      if (isAndroid) return Q()

      return Keychain.getGenericPassword(PASSWORD_ITEM_KEY)
        .then(
          () =>  Q.ninvoke(self, 'checkPassword'),
          // registration must have been aborted.
          // ask user to set a password
          (err) => Q.ninvoke(self, 'setPassword')
        )
    }

    function lockUp (err) {
      self.setState({isModalOpen: true})
      loopAlert(err)
      setTimeout(() => {
        doneWaiting = true
        // let the user try again
        self.signIn(cb)
      }, __DEV__ ? 5000 : 5 * 60 * 1000)
    }

    function loopAlert (err) {
      Alert.alert(err, null, [
        {
          text: 'OK',
          onPress: () => !doneWaiting && loopAlert(err)
        }
      ])
    }
  }
  setPassword(cb) {
    let self = this
    this.props.navigator.push({
      component: PasswordCheck,
      id: 20,
      passProps: {
        mode: PasswordCheck.Modes.set,
        validate: (pass) => { return pass.length > 4 },
        promptSet: translate('pleaseDrawPassword'),
        promptInvalidSet: translate('passwordLimitations'),
        onSuccess: (pass) => {
          Keychain.setGenericPassword(PASSWORD_ITEM_KEY, utils.hashPassword(pass))
          .then(() => {
            Actions.updateMe({ isRegistered: true })
            return hasTouchID()
              .then(() => {
                return true
              })
              .catch((err) => {
                return false
              })
          })
          .then((askTouchID) => {
            if (askTouchID) {
              return self.props.navigator.push({
                component: TouchIDOptIn,
                id: 21,
                rightButtonTitle: 'Skip',
                passProps: {
                  optIn: () => {
                    Actions.updateMe({ useTouchId: true })
                    cb()
                  }
                },
                onRightButtonPress: cb.bind(this)
              })
            }

            cb()
          })
          .catch(err => {
            debugger
          })
        },
        onFail: () => {
          debugger
          Alert.alert('Oops!')
        }
      }
    })
  }
  checkPassword(cb, doReplace) {
    let nav = this.props.navigator

    let route = {
      component: PasswordCheck,
      id: 20,
      passProps: {
        mode: PasswordCheck.Modes.check,
        maxAttempts: 3,
        promptCheck: translate('drawYourPassword'), //Draw your gesture password',
        promptRetryCheck: translate('gestureNotRecognized'), //Gesture not recognized, please try again',
        isCorrect: (pass) => {
          return Keychain.getGenericPassword(PASSWORD_ITEM_KEY)
            .then((stored) => {
              return stored === utils.hashPassword(pass)
            })
            .catch(err => {
              return false
            })
        },
        onSuccess: () => {
          cb()
        },
        onFail: (err) => {
          cb(err || new Error('For the safety of your data, ' +
            'this application has been temporarily locked. ' +
            'Please try in 5 minutes.'))
          // lock up the app for 10 mins? idk
        }
      }
    }

    nav.push(route)
  }
  showContacts() {
    let passProps = {
        filter: '',
        modelName: this.props.modelName,
        sortProperty: 'lastMessageTime'
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
          }
        },
        passProps: {resource: me}
      }
    });
  }
  showOfficialAccounts() {
    var nav = this.props.navigator
    nav.immediatelyResetRouteStack(nav.getCurrentRoutes().slice(0,1));
    let me = utils.getMe()
    if (me.organization) {
      this.showContacts()
      return
    }
    let title = me.firstName;

    nav.push({
      title: translate('officialAccounts'),
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      passProps: {
        modelName: constants.TYPES.ORGANIZATION,
        isConnected: this.state.isConnected,
        officialAccounts: true
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
            resource: me
          }
        },
        passProps: {resource: me}
      }
    })
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
        isConnected: this.state.isConnected,
        callback: () => {
          cb()
        }
      },
    };

    let self = this
    route.passProps.callback = this.setPassword.bind(this, function(err) {
      Actions.setAuthenticated(true)
      self.showOfficialAccounts(true)
    })
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
    var url = LinkingIOS.popInitialURL();
    var { width, height } = Dimensions.get('window')
    var h = height > 800 ? height - 220 : height - 180
    // var cTop = h / 4

    var thumb = width > 400
              ? { width: width / 2.2, height: width / 2.2 }
              : styles.thumb
              // <Progress.CircleSnail color={'white'} size={70} thickness={5}/>
  	var spinner = (
      <View>
          <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width: width, height: height }} />
          <ScrollView
            scrollEnabled={false}
            style={{height:h}}>
            <View style={[styles.container]}>
              <Image style={thumb} source={TradleWhite}></Image>
              <Text style={styles.tradle}>Tradle</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <ActivityIndicatorIOS hidden='true' size='large' color='#ffffff'/>
            </View>
          </ScrollView>
      </View>
    )

    if (this.state.isLoading)
      return spinner
    var err = this.state.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var myId = utils.getMe();
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
                <TouchableHighlight
                    underlayColor='transparent' onPress={this.onBackupPressed.bind(this)}>
                  <Text style={styles.text}>
                    Backup
                  </Text>
                </TouchableHighlight>
                <TouchableHighlight
                    underlayColor='transparent' onPress={this.onLoadFromBackupPressed.bind(this)}>
                  <Text style={styles.text}>
                    Load
                  </Text>
                </TouchableHighlight>
                {settings}
              </View>
            : <View style={[styles.dev, { flexDirection: 'column' }]}>
                {settings}
                {version}
              </View>

    return (
      <View style={styles.scroll}>
        <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width, height}} />
        <ScrollView
          scrollEnabled={false}
          style={{height:h}}
        >
          <TouchableHighlight style={[styles.thumbButton]}
            underlayColor='transparent' onPress={() => this._pressHandler()}>
            <View style={[styles.container]}>
              <View>
                <Image style={thumb} source={TradleWhite}></Image>
                <Text style={styles.tradle}>Tradle</Text>
              </View>
            </View>
          </TouchableHighlight>
        </ScrollView>
        <View style={{height: 90}}></View>
          <TouchableHighlight style={[styles.thumbButton]}
                underlayColor='transparent' onPress={() => this._pressHandler()}>
            <View style={styles.getStarted}>
               <Text style={styles.getStartedText}>Get started</Text>
            </View>
          </TouchableHighlight>
          <Text style={errStyle}>{err}</Text>
          {dev}
        <View style={{height: 200}}></View>
      </View>
    );
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
        callback: this.props.navigator.pop
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
    this.signIn(() => this.showOfficialAccounts())
  }
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
}

reactMixin(TimHome.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    padding: 30,
    marginTop: Dimensions.get('window').height > 800 ? Dimensions.get('window').height/7 : Dimensions.get('window').height / 5,
    alignItems: 'center',
  },
  tradle: {
    // color: '#7AAAC3',
    color: '#eeeeee',
    fontSize: Dimensions.get('window').height > 450 ? 35 : 25,
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
    justifyContent: 'center',
    // padding: 40,
  },
  thumb: {
    width: 170,
    height: 170,
  },
  communitiesText: {
    color: '#f8920d',
    fontSize: 20,
  },
  communities: {
    paddingBottom: 40,
    alignSelf: 'center',
  },
  title: {
    marginTop: 30,
    alignSelf: 'center',
    fontSize: 20,
    color: '#7AAAC3'
  },
  dev: {
    marginTop: 10,
    flexDirection: 'row',
    marginBottom: 500,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  getStartedText: {
    color: '#f0f0f0',
    fontSize: Dimensions.get('window').width > 450 ? 35 : 20,
    fontWeight:'400'
  },
  getStarted: {
    backgroundColor: '#568FBE', //'#2892C6',
    paddingVertical: 10,
    paddingHorizontal: 30
  },
  version: {
    color: '#ffffff',
    fontSize: 10
  }
});


module.exports = TimHome;
  // easeInQuad(t) {
  //   return t * t;
  // }
  // f() {
  //   var infiniteDuration = 1000;
  //   var easeDuration = 300;
  //     AnimationExperimental.startAnimation({
  //       node: this.refs['search'],
  //       duration: infiniteDuration,
  //       // easing: 'easeInQuad',
  //       easing: (t) => this.easeInQuad(Math.min(1, t*infiniteDuration/easeDuration)),
  //       property: 'scaleXY',
  //       toValue: [1,1]
  //       // property: 'position',
  //       // toValue: {x:200, y:-30},
  //       // delay: 30000
  //     })
  // }
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
