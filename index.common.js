'use strict'

import './utils/errors'
import './utils/shim'

import React, { Component } from 'react'
import Reflux from 'reflux'
import Icon from 'react-native-vector-icons/Ionicons'
import reactMixin from 'react-mixin'
import Orientation from 'react-native-orientation'
import SplashScreen from 'react-native-splash-screen'
import 'stream'
import debounce from 'debounce'
import Navigator from './Components/Navigator'
import {
  Image,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  AppState,
  AppRegistry,
  Text,
  BackHandler
} from 'react-native';

var constants = require('@tradle/constants');
const {
  TYPE
} = constants
const {
  PROFILE
} = constants.TYPES

// import './utils/logAll'
// import './utils/perf'

// see issue: https://github.com/facebook/react-native/issues/6227
try {
  var NativeAppEventEmitter = require('RCTNativeAppEventEmitter')
} catch (err) {}

// require('babel-polyfill')

// require('react-native-level')
import Debug from './utils/debug'
var debug = Debug('tradle:app')
var perfDebug = Debug('perf')

// require('regenerator/runtime') // support es7.asyncFunctions
// import './utils/crypto'
// require('./timmy')
var ResourceList = require('./Components/ResourceList');
var VerifierChooser = require('./Components/VerifierChooser')
var ShareResourceList = require('./Components/ShareResourceList')
// var VideoPlayer = require('./Components/VideoPlayer')
var EnumList = require('./Components/EnumList')
var GridList = require('./Components/GridList');
var TimHome = require('./Components/TimHome');
var MarkdownPropertyEdit = require('./Components/MarkdownPropertyEdit')
var SignatureView = require('./Components/SignatureView')
var AvivaIntroView = require('./Components/AvivaIntroView')
var TourPage = require('./Components/TourPage')
var SplashPage = require('./Components/SplashPage')

var PasswordCheck = require('./Components/PasswordCheck');
var LockScreen = require('./Components/LockScreen')
var TouchIDOptIn = require('./Components/TouchIDOptIn');
var NewResource = require('./Components/NewResource');
var NewItem = require('./Components/NewItem');
var RemediationItemsList = require('./Components/RemediationItemsList')
var GridItemsList = require('./Components/GridItemsList')
var ResourceView = require('./Components/ResourceView');
var ApplicationView = require('./Components/ApplicationView')
var MessageView = require('./Components/MessageView');
var MessageList = require('./Components/MessageList');
var ArticleView = require('./Components/ArticleView');
var IdentitiesList = require('./Components/IdentitiesList');
var SupervisoryViewPerProvider = require('./Components/SupervisoryViewPerProvider')
var SupervisoryView = require('./Components/SupervisoryView')
var ProductChooser = require('./Components/ProductChooser')
var StringChooser = require('./Components/StringChooser')
var ContextChooser = require('./Components/ContextChooser')
var CameraView = require('./Components/CameraView');
var PhotoCarousel = require('./Components/PhotoCarousel');
var QRCode = require('./Components/QRCode')
var QRCodeScanner = require('./Components/QRCodeScanner')
import Log from './Components/Log'
import HomePageMixin from './Components/HomePageMixin'

var utils = require('./utils/utils');
var translate = utils.translate
var ReactPerf //= __DEV__ && !utils.isWeb() && require('react-addons-perf')

var Actions = require('./Actions/Actions');
import * as AutomaticUpdates from './utils/automaticUpdates';
import { signIn } from './utils/localAuth'
import Store from './Store/Store'
var StyleSheet = require('./StyleSheet')

const TIM_HOME = 1
const NEW_RESOURCE = 4
const MESSAGE_LIST = 11
const MESSAGE_VIEW = 5
const PASSWORD_CHECK = 20
const REMEDIATION = 29
const LOGO_HEIGHT = 27
const TOUR_PAGE = 35
const AVIVA_INTRO_VIEW = 50

import platformStyles from './styles/platform'
import SimpleModal from './Components/SimpleModal'
import Transitions from './utils/transitions'

let originalGetDefaultProps = Text.getDefaultProps;
Text.defaultProps = function() {
  return {
    ...originalGetDefaultProps(),
    allowFontScaling: !utils.isWeb()
  };
};

import Push from './utils/push'
import Navs from './utils/navs'
import Analytics from './utils/analytics'

// if (ReactPerf) ReactPerf.toggle()

var UNAUTHENTICATE_AFTER_BG_MILLIS = require('./utils/localAuth').TIMEOUT

utils.setGlobal('SUBMIT_DEBUG_LOG', utils.submitLog)

const landingPageMapping = {
  AvivaIntroView: {
    component: AvivaIntroView,
    id: AVIVA_INTRO_VIEW
  },
  TourPage: {
    component: TourPage,
    id: TOUR_PAGE
  }
}

class TiMApp extends Component {
  constructor(props) {
    super(props)
    let passProps = {
      modelName: PROFILE,
      landingPageMapping: landingPageMapping
    }

    this.state = {
      currentAppState: 'active',
      dateAppStateChanged: Date.now(),
      initialRoute: {
        id: 1,
        component: TimHome,
        passProps: passProps,
        navBarBgColor: 'transparent'
      },
      props: passProps
    };

    ;['_handleOpenURL', '_handleAppStateChange', 'onNavigatorBeforeTransition', 'onNavigatorAfterTransition'].forEach((method) => {
      this[method] = this[method].bind(this)
    })
  }

  componentWillMount() {
    this.listenTo(Store, 'onStoreEvent')
  }

  componentDidMount() {
    if (SplashScreen && SplashScreen.hide) {
      SplashScreen.hide()
    }

    if (AppState) AppState.addEventListener('change', this._handleAppStateChange);
    // Linking.addEventListener('url', this._handleOpenURL);
    // var url = Linking.popInitialURL();
    // if (url)
    //   this._handleOpenURL({url});
  }
  componentWillUnmount() {
    if (AppState) AppState.removeEventListener('change', this._handleAppStateChange);
    // Linking.removeEventListener('url', this._handleOpenURL);
    this._navListeners.forEach((listener) => listener.remove())
  }

  onStoreEvent(params) {
    let { action, modal, provider } = params
    switch (action) {
      case 'showModal':
        this.setState({ modal })
        break
      case 'hideModal':
        this.setState({ modal: null })
        break
      case 'customStyles':
        let routes = this.state.navigator.getCurrentRoutes()
        let curRoute = routes[routes.length - 1]
        let resource = curRoute.passProps.resource
        if (resource  &&  utils.getId(resource) === utils.getId(provider)) {
          curRoute.passProps.bankStyle = provider.style || curRoute.passProps.bankStyle
          curRoute.passProps.resource = provider
          let bg = provider.style  &&  provider.style.navBarBackgroundColor
          if (bg)
            this.setState({navBarBgColor: bg})
        }
        break
    }
  }
  _handleAppStateChange(currentAppState) {
    // TODO:
    // Actions.appState(currentAppState)
    // and check if authentication expired in store

    // uncomment after figuring out what to do when the user
    // uses the browser back button here to leave the auth screen
    if (utils.isWeb()) return

    let dateAppStateChanged = Date.now()
    let lastDateAppStateChanged = this.state.dateAppStateChanged
    let newState = { currentAppState, dateAppStateChanged }
    let me = utils.getMe()

    switch (currentAppState) {
      case 'inactive':
        return
      case 'active':
        utils.updateEnv()
        AutomaticUpdates.hasUpdate().then(has => {
          if (has) return AutomaticUpdates.install()

          Push.resetBadgeNumber()
          if (this.state.currentAppState === 'active') return

          clearTimeout(this.state.unauthTimeout)
          // ok to pop from defensive copy

          AutomaticUpdates.sync()
          this.setState(newState)
        })

        return
      case 'background':
        // const nonAuthRoute = utils.getTopNonAuthRoute(this.state.navigator)
        // this.state.navigator.popToRoute(nonAuthRoute)
        newState.unauthTimeout = setTimeout(() => {
          if (!me || !me.isRegistered) return

          Actions.setAuthenticated(false)
          Actions.start()
          // TODO: auth flow should not be here OR in TimHome
          // it should be more like Actions.auth()
          // and then handled in one place
        }, UNAUTHENTICATE_AFTER_BG_MILLIS)

        break
    }

    this.setState(newState)
  }
  _handleOpenURL(event) {
    let url = event.url.trim();
    let idx = url.indexOf('://');
    let q = (idx + 3 === url.length) ? null : url.substring(idx + 3);

    let r;
    if (!q) {
      r = {
        _t: 'tradle.Organization',
        _r: '0191ef415aa2ec76fb8ec8760b55112cadf573bc',
        name: 'HSBC',
        me: 'me'
      }
    }
    else {
      let params = q.split('=');
      if (params.length === 1) {
        switch (parseInt(params[0])) {
        case 1:
          r = {
            _t: 'tradle.Organization',
            _r: '96e460ca282d62e41d4b59c85b212d102d7a5a6e',
            name: 'Lloyds',
            me: 'me'
          }
          break;
        case 2:
          r = {
            _t: 'tradle.Organization',
            _r: '0191ef415aa2ec76fb8ec8760b55112cadf573bc',
            name: 'HSBC',
            me: '31eb0b894cad3601adc76713d55a11c88e48b4a2'
          }
          break;
        case 3:
          r = {
            _t: 'tradle.Organization',
            _r: '96e460ca282d62e41d4b59c85b212d102d7a5a6e',
            name: 'Lloyds',
            me: 'b25da36eaf4b01b37fc2154cb1103eb5324a12345'
          }
          break;
        }
      }
      else {
        r = JSON.parse(decodeURIComponent(params[1]));
        if (!r[TYPE])
          r[TYPE] = 'tradle.Organization';
      }
    }
    let props = {modelName: 'tradle.Message'};

    if (this.state.navigator) {
      let currentRoutes = this.state.navigator.getCurrentRoutes();
      let route = {
        title: r.name ||  'Chat',
        backButtonTitle: 'Back',
        component: MessageList,
        id: 11,
        passProps: {
          resource: r, //{'_t': type, '_r': rId},
          modelName: 'tradle.Message',
          // prop: prop
        }
      }
      if (currentRoutes.length === 1)
        this.state.navigator.push(route);
      else
        this.state.navigator.replace(route);
    }
    else {
      this.setState({
        initialRoute: {
          title: r.name ||  'Chat',
          // backButtonTitle: 'Back',
          component: MessageList,
          id: 11,
          passProps: {
            resource: r, //{'_t': type, '_r': rId},
            modelName: 'tradle.Message',
            // prop: prop
          }
        },
        props: props
      });
    }
  }

  onNavigatorBeforeTransition(e) {
    if (ReactPerf) ReactPerf.start()
    Actions.startTransition()
  }

  onNavigatorAfterTransition(e) {
    if (ReactPerf) {
      setTimeout(function () {
        ReactPerf.stop()
        ReactPerf.printWasted()
      }, 500)
    }

    Analytics.sendNavigationEvent({ route: e.data.route })
    Actions.endTransition()
  }

  _lockToPortrait() {
    if (!this._lockedOrientation) {
      this._lockedOrientation = true
      Orientation.lockToPortrait()
    }
  }
  _lockToLandscape() {
    if (!this._lockedOrientation) {
      this._lockedOrientation = true
      Orientation.lockToLandscape()
    }
  }

  _unlockOrientation() {
    if (this._lockedOrientation) {
      this._lockedOrientation = false
      Orientation.unlockAllOrientations()
    }
  }

  renderModal() {
    const { modal } = this.state
    if (!modal) return

    if (modal.contents) {
      return modal.contents
    }

    return (
      <SimpleModal
        animationType="slide"
        transparent={true}
        {...modal}
      />
    )
  }

  render() {
    const modal = this.renderModal()
    return (
      <View style={styles.container}>
        {modal}
        <Navigator
          style={styles.container}
          initialRoute={this.state.initialRoute}
          renderScene={this.renderScene.bind(this)}
          navigationBar={
            <Navigator.NavigationBar
              style={{backgroundColor: this.state.navBarBgColor}}
              routeMapper={NavigationBarRouteMapper}
            />
          }
          onWillFocus={(newRoute) => {
            if (!newRoute)
              return
            let style = /*(newRoute.id === MESSAGE_LIST && newRoute.passProps.resource && newRoute.passProps.resource.style) ||*/ newRoute.passProps.bankStyle
            if (style)
              this.setState({navBarBgColor: newRoute.id === TOUR_PAGE ? 'transparent' : style.navBarBackgroundColor || 'transparent'})
            else
              this.setState({navBarBgColor: 'transparent'})
          }}
          passProps={this.state.props}
          configureScene={(route) => {
            if (!utils.isWeb() && route.sceneConfig)
              return route.sceneConfig;

            const config = utils.isWeb()
              ? Transitions.NONE
              : {...Navigator.SceneConfigs.FloatFromRight, springFriction:26, springTension:200}

            if (route.component === PasswordCheck) {
              config.gestures = {}
            }

            return config
          }}
        />
      </View>
    );
  }
          // return {...Navigator.SceneConfigs.FloatFromRight, springFriction:26, springTension:300};

  renderScene(route, nav) {
    if (isPortraitOnlyRoute(route)) {
      this._lockToPortrait()
    }
    else if (isLandscapeOnlyRoute(route))
      this._lockToLandscape()
    else {
      this._unlockOrientation()
    }

    let props = route.passProps;
    if (!this.state.navigator) {
      this._navListeners = [
        nav.navigationContext.addListener('willfocus', this.onNavigatorBeforeTransition),
        nav.navigationContext.addListener('didfocus', this.onNavigatorAfterTransition)
      ]

      this.state.navigator = nav;
      Navs.watch(nav)
      if (BackHandler) {
        BackHandler.addEventListener('hardwareBackPress', () => goBack(this.state.navigator))
      }
    }

    // can simplify the below switch statement to:
    // const RouteComponent = route.component
    // return <RouteComponent navigator={nav} {...props} />

    switch (route.id) {
    case TIM_HOME: //1
      return <TimHome navigator={nav} {...props}/>;
    // case 2:  // Adding new model online
    //   return <ResourceTypesScreen navigator={nav}
    //               modelName={props.modelName}
    //               resource={props.resource}
    //               returnRoute={props.returnRoute}
    //               sendForm={props.sendForm}
    //               callback={props.callback} />;
    case 3:
      return <ResourceView navigator={nav} {...props } />
    case NEW_RESOURCE: // 4
      return <NewResource navigator={nav} {...props } />
    case 5:
      return <MessageView navigator={nav} {...props} />
    case 6:
      return <NewItem navigator={nav} {...props} />
    case 7:
      return <ArticleView navigator={nav} {...props} />;
    case 8:
      return <IdentitiesList navigator={nav}
                  filter={props.filter}
                  list={props.list}
                  callback={props.callback}
                  modelName={props.modelName} />;
    // case 9:
    //   return <ItemsList navigator={nav} {...props} />
    case MESSAGE_LIST: //11
      return <MessageList navigator={nav} {...props} />
    case 12:
      return <CameraView navigator={nav} {...props}/>
      // <CameraView navigator={nav}
      //             onTakePic={props.onTakePic}
      //             resource={props.resource}
      //             prop={props.prop}/>
    // case 13:
    //   return <SelectPhotoList
    //             metadata={props.metadata}
    //             style={styles.style}
    //             navigator={props.navigator}
    //             onSelect={props.onSelect}
    //             onSelectingEnd={props.onSelectingEnd} />

    case 14:
      return <PhotoCarousel {...props} />
    case 15:
      return <ProductChooser navigator={nav} {...props} />
    case 16:
      return <QRCodeScanner navigator={nav}
                onread={props.onread} />
    case 17:
      return <QRCode navigator={nav}
                content={props.content}
                fullScreen={props.fullScreen}
                dimension={props.dimension} />
    // case 18:
    //   return <VideoPlayer {...props} />
    case 19:
      return <GridItemsList navigator={nav} {...props} />
    case PASSWORD_CHECK:
      return <PasswordCheck navigator={nav} {...props} />
    case 21:
      return <TouchIDOptIn navigator={nav} { ...props } />
    case 22:
      return <EnumList navigator={nav} { ...props } />
    case 23:
      return <ContextChooser navigator={nav} {...props} />
    case 24:
      return <LockScreen navigator={nav} {...props} />
    case 25:
      return <VerifierChooser navigator={nav} {...props} />
    case 26:
      return <SupervisoryViewPerProvider navigator={nav} {...props} />
    case 27:
      return <SupervisoryView navigator={nav} {...props} />
    case 28:
      return <Log navigator={nav} {...props} />
    case REMEDIATION:
      return <RemediationItemsList navigator={nav} {...props} />
    // case 30:
    //   return <HomePage navigator={nav} {...props} />
    case AVIVA_INTRO_VIEW:
      return <AvivaIntroView navigator={nav} {...props} />
    case 30:
      return <GridList navigator={nav} {...props} />
    case 31:
      return <MarkdownPropertyEdit navigator={nav} {...props} />
    case 32:
      return <SignatureView navigator={nav} {...props} />
    case 33:
      return <StringChooser navigator={nav} {...props} />
    case 34:
      return <ApplicationView navigator={nav} {...props } />
    case TOUR_PAGE:
      return <TourPage navigator={nav} {...props } />
    case 36:
      return <SplashPage navigator={nav} {...props } />
    case 37:
      return <ShareResourceList navigator={nav} {...props } />
    case 10:
    default: // 10
      return <ResourceList navigator={nav} {...props} />
    }
  }
}

reactMixin(TiMApp.prototype, Reflux.ListenerMixin)

const goBack = debounce(function (nav) {
  const { routes, route, index } = Navs.getCurrentRouteInfo(nav)
  if (index === 0 || route.component.backButtonDisabled) return false

  nav.pop()
  return true
}, 500, true)

var HIT_SLOP = {top:10,right:10,bottom:10,left:10}
var NavigationBarRouteMapper = {
  LeftButton: function(route, navigator, index, navState) {
    if (index === 0  ||  route.noLeftButton)
      return <View/>

    let bankStyle = route.passProps.bankStyle
    let color = '#7AAAC3'
    if (bankStyle  &&  bankStyle.linkColor)
      color = bankStyle.linkColor

    let previousRoute = navState.routeStack[index - 1];
    let lbTitle = 'backButtonTitle' in route ? route.backButtonTitle : previousRoute.title;
    if (!lbTitle)
      return null;
    let style = [platformStyles.navBarText];
    if (route.tintColor)
      style.push({color: route.tintColor});
    else {
      style.push(styles.navBarButtonText);
      style.push({color: color});
    }
    let iconIdx = lbTitle.indexOf('|')
    let icon
    if (iconIdx !== -1)
      icon = lbTitle.substring(iconIdx + 1)
    else if (lbTitle === 'Back')
      icon = 'ios-arrow-back'
    else if (lbTitle === 'Profile')
      icon = 'md-person'

    style.push({fontSize: utils.getFontSize(20)})
    let title = icon
              ? <Icon name={icon} size={utils.getFontSize(30)} color={color} style={styles.icon}/>
              : <Text style={style}>
                  {lbTitle}
                </Text>
    // if (route.component === ResourceList  &&  index === 1 &&  navigator.getCurrentRoutes().length === 2)
    //   Actions.cleanup()

    let status = <View/>
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={route.passProps.onLeftButtonPress || goBack.bind(null, navigator)}>
        <View style={styles.navBarLeftButton}>
          {status}
          {title}
        </View>
      </TouchableOpacity>
      )
  },
  RightButton: function(route, navigator, index, navState) {
    if (!route.rightButtonTitle)
      return <View/>
    // let style = [platformStyles.navBarText, styles.navBarButtonText];
    // if (route.tintColor)
    //   style.push({color: route.tintColor});
    // else if (route.passProps.bankStyle)
    //   style.push({color: route.passProps.bankStyle.linkColor || '#7AAAC3'})
    let rbTitle = route.rightButtonTitle
    let iconIdx = rbTitle.indexOf('|')
    let icon
    let symbol
    let iconSize = 25
    let bankStyle = route.passProps.bankStyle
    let iconColor = bankStyle ? bankStyle.linkColor : '#7AAAC3'
    let style = {}
    let isSubmit
    let isProfile
    let isAndroid = utils.isAndroid()
    let viewStyle = {}
    switch (rbTitle) {
    case 'Done':
      iconColor = '#fff'
      isSubmit = true
      if (route.passProps.isChooser) {
        icon = 'md-checkmark'
        iconSize = 30
      }
      // if (route.passProps.bankStyle  &&  route.passProps.bankStyle.submitBarInFooter)
      //   return
    case 'Accept':
      if (!icon) {
        icon = 'ios-send'
        iconSize = 32
        viewStyle = isAndroid ? {paddingTop: 10} : {}
      }
      style = {marginTop: isAndroid ? 2 : 0}
      // style = {marginTop: 5, transform: [
      //     {rotate: '45deg'}
      //   ]}
      break
    case 'Download':
      icon = 'md-download'
      break
    case 'View':
      icon = 'md-eye'
      iconSize = 28
      break
    case 'Search':
      icon = 'md-search'
      break
    case 'Profile':
      isProfile = true
      iconSize = 28
      icon = 'md-person'
      break
    case 'Edit':
      iconSize = 28
      style = {marginRight: -4}
      icon = 'ios-create-outline'
      break
    case 'Share':
      icon = 'md-share'
      break
    }
    let title
    if (icon)  {
      title = <Icon name={icon} size={utils.getFontSize(iconSize)} color={iconColor} style={[styles.icon, style]} />
      if (isSubmit)
        title = <View style={[styles.submit, {backgroundColor: bankStyle ? bankStyle.linkColor : '#7AAAC3'}]}>
                  {title}
                </View>
    }
    else if (symbol)
      title = <Text style={{fontSize: 25}}>{symbol}</Text>

    else if (rbTitle.indexOf('|') === -1)
      title =  <Text style={style}>
                  {rbTitle}
               </Text>
    else {
      let iconsList = rbTitle.split('|')
      let icons = []
      iconsList.forEach((i) => {
        icons.push(<Icon name={i} key={i} size={20} color={iconColor} style={styles.iconSpace} />)
      })

      title = <View>
               {icons}
              </View>
    }
      // {route.help
      //   ? <TouchableOpacity
      //       hitSlop={HIT_SLOP}
      //       onPress={() =>  Alert.alert(translate(route.help))}>
      //       <Icon name={'ios-information-circle'} key={'ios-help'} size={18} color='#29ABE2' style={[styles.iconSpace, {marginTop: 13}]}/>
      //     </TouchableOpacity>
      //   : <View />
      // }
    return (
      <View style={{position: 'absolute', right: 0, flexDirection: 'row'}}>
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={() => {
                  // 'Done' button case for creating new resources
                  if (typeof route.onRightButtonPress === 'function') {
                    route.onRightButtonPress()
                  }
                  else if (isProfile)
                    HomePageMixin.showProfile(navigator)
                  else if (route.onRightButtonPress.stateChange) {
                    if (route.onRightButtonPress.before)
                      route.onRightButtonPress.before();
                    route.onRightButtonPress.stateChange();
                    if (route.onRightButtonPress.after)
                      route.onRightButtonPress.after();
                  }
                  else
                    navigator.push(route.onRightButtonPress)
               }
        }>
        <View style={[styles.navBarRightButton, route.help ? {paddingLeft: 5} : {paddingLeft: 25}]}>
          {title}
        </View>
      </TouchableOpacity>
      </View>
    );
  },

  Title: function(route, navigator, index, navState) {
    if (!route.title)
      return <View/>
    let org;
    if (route.passProps.modelName                       &&
        route.passProps.modelName === 'tradle.Message'  &&
        route.passProps.resource                        &&
        route.passProps.resource.organization           &&
        route.passProps.resource[TYPE] === PROFILE)
          // if (route.passProps.resource.organization  &&  route.passProps.resource.organization.photo)
          //   org = <Image source={{uri: route.passProps.resource.organization.photo}} style={styles.orgImage} />
          // if (route.passProps.resource.organization)
      org = <Text style={style}> - {route.passProps.resource.organization.title}</Text>
    else
      org = <View />;
    let photo, uri
    let photoObj
    if (route.passProps.bankStyle)
      photoObj = route.passProps.bankStyle.logo

    if (!photoObj)
      photoObj = route.id === MESSAGE_LIST        &&
                 route.passProps.resource.photos  &&
                 route.passProps.resource.photos[0]
    if (photoObj)
      uri = utils.getImageUri(photoObj.url);
    else if (route.id === REMEDIATION) {
      photoObj = route.passProps.to.photos  &&  route.passProps.to.photos[0]
      uri =  photoObj && utils.getImageUri(photoObj.url)
    }
    let logoNeedsText = (!route.passProps.resource  &&  route.id !== 7) ||
                        // route.passProps.resource[TYPE] !== ORGANIZATION ||
                        !route.passProps.bankStyle ||
                        route.passProps.bankStyle.logoNeedsText
    if (uri) {
      if (logoNeedsText)
        photo = <Image source={{uri: uri}} style={[styles.msgImage, utils.isAndroid() ? {marginTop: 18} : {}]} />
      else {
        let width
        if (photoObj.width  &&  photoObj.height)
          width = photoObj.width > photoObj.height ? LOGO_HEIGHT * (photoObj.width/photoObj.height) : LOGO_HEIGHT
        photo = <Image source={{uri: uri}} style={[styles.msgImageNoText, {resizeMode: 'contain', width: width}, utils.isAndroid() ? {marginTop: 23} : {}]} />
      }
    }
    let t = route.title.split(' -- ')
    let st = t.length > 1 ? {marginTop: 2} : {}
    let bankStyle = route.passProps.bankStyle
    if (bankStyle)
      st.color = bankStyle.linkColor

    let style = [platformStyles.navBarText, styles.navBarTitleText, st]
    if (route.titleTextColor)
      style.push({color: route.titleTextColor});

    let tArr = t.length > 1 ? [] : <View />

    for (let i=1; i<t.length; i++)
      tArr.push(<Text style={styles.arr} key={'index.common.js_' + i}>{this.makeTitle(t[i])}</Text>)
    let text
    if (logoNeedsText  ||  !uri) {
      text = <Text style={style}>
               {this.makeTitle(t[0])}
             </Text>
    }

    return (
      <View key={'index.common.js'}>
        <View style={{flexDirection: 'row'}}>
          {photo}
          {text}
        </View>
        {tArr}
        {org}
      </View>
    );
    // return (
    //   <View key={'index.common.js'}>
    //     <Text style={style}>
    //       {t[0]}
    //     </Text>
    //     {tArr}
    //     {org}
    //   </View>
    // );

  },
  makeTitle(title, component) {
    if (Platform.OS === 'web')
      return title
    let { width } = utils.dimensions(component)

    let tWidth = width * 0.8
    let numberOfCharsInWidth = tWidth / utils.getFontSize(12)
    if (title.length < numberOfCharsInWidth)
      return title
    title = title.substring(0, numberOfCharsInWidth)
    let i = title.length - 1
    for (; i>=0; i--) {
      let ch  = title.charAt(i)
      if (ch === ' '  ||  ch !== ','  ||  ch === ':'  ||  ch === ';')
        break
    }
    return (i === 0 ? title : title.substring(0, i))  + '...'
  }

};

var styles = StyleSheet.create({
  msgImage: {
    // backgroundColor: '#dddddd',
    height: LOGO_HEIGHT,
    marginRight: 3,
    resizeMode: 'contain',
    marginTop: 2,
    marginLeft: 0,
    // width: LOGO_HEIGHT,
    // borderRadius: 13,
    // borderColor: '#cccccc',
    // borderWidth: StyleSheet.hairlineWidth
  },
  msgImageNoText: {
    // backgroundColor: '#dddddd',
    height: 27,
    resizeMode: 'contain',
    marginRight: 3,
    marginTop: 7,
    marginLeft: 0,
  },
  icon: {
    width: 25,
    height: 30,
    marginTop: Platform.OS === 'web' ? 0 : Platform.OS === 'android' ? 15 : 0
  },
  row: {
    flexDirection: 'row'
  },
  iconSpace:  {
    paddingLeft: 3
  },
  container: {
    flex: 1,
  },
  navBarTitleText: {
    color: '#555555',
    fontWeight: '400',
    fontSize: utils.getFontSize(20),
  },
  navBarLeftButton: {
    paddingLeft: 20,
    paddingRight: 25,
    marginTop: 0
  },
  navBarRightButton: {
    paddingLeft: 25,
    paddingRight: 10,
    marginTop: 5
  },
  navBarButtonText: {
    color: '#7AAAC3',
    fontSize: 18
  },
  arr: {
    marginTop: -3,
    color: '#2892C6',
    fontSize: 12,
    alignSelf: 'center'
  },
  submit: {
    backgroundColor: '#7AAAC3',
    borderColor: '#cccccc',
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    paddingRight: 10,
    paddingLeft:15,
    paddingBottom: 5
  }
});

AppRegistry.registerComponent('Tradle', () => TiMApp)

function isPortraitOnlyRoute (route) {
  const orientation = route.component.orientation
  if (orientation && orientation.toLowerCase() === 'portrait') return true

  return !utils.getMe() && route.id === NEW_RESOURCE
}
function isLandscapeOnlyRoute (route) {
  const orientation = route.component.orientation
  if (orientation && orientation.toLowerCase() === 'landscape') return true

  return !utils.getMe() && route.id === NEW_RESOURCE
}


  // render() {
  //   var props = {db: this.state.db};
  //   return (
  //     <Navigator
  //       style={styles.container}
  //       initialRoute={{
  //         id: 1,
  //         title: 'Identity Finder',
  //         backButtonTitle: 'Back',
  //         titleTextColor: '#2E3B4E',
  //         component: SearchPage,
  //         passProps: {db: this.state.db},
  //       }}
  //       renderScene={this.renderScene}
  //       passProps={props}
  //       configureScene={(route) => {
  //         if (route.sceneConfig) {
  //           return route.sceneConfig;
  //         }
  //         return Navigator.SceneConfigs.FloatFromBottom;
  //       }}
  //     />
  //   );
  // }
  // componentDidMount() {
  //   var self = this;
  //   var db = this.state.db;
  // dbHasResources = false;
    // db.createReadStream({limit: 1})
    //   .on('data', function (data) {
    //     var m = data.value;
    //     dbHasResources = true;
    //     utils.loadModelsAndMe(db, models)
    //     .then(function(results) {
    //       self.state.isLoading = false;
    //     });
    //   })
    //   .on('error', function (err) {
    //     console.log('Oh my!', err.name + ": " + err.message);
    //   })
    //   .on('close', function (err) {
    //     console.log('Stream closed');
    //   })
    //   .on('end', function () {
    //     console.log('Stream end');
    //     if (!dbHasResources)
    //       utils.loadDB(db);
    //   });
    // }


  // componentDidMount() {
  //   var self = this;
  //   var db = utils.getDb();
  //   var dbHasResources = false;
  //   db.createReadStream({limit: 1})
  //     .on('data', function (data) {
  //       var m = data.value;
  //       dbHasResources = true;
  //       utils.loadModelsAndMe(db, models)
  //       .then(function(results) {
  //         self.state.isLoading = false;
  //       });
  //     })
  //     .on('error', function (err) {
  //       console.log('Oh my!', err.name + ": " + err.message);
  //     })
  //     .on('close', function (err) {
  //       console.log('Stream closed');
  //     })
  //     .on('end', function () {
  //       console.log('Stream end');
  //       if (!dbHasResources)
  //         utils.loadDB(db);
  //     });
  //   }

  // componentDidMount1() {
  //   var self = this;
  //   var db = this.state.db;
  //   this.loadModels(db, models)
  //   .then(function() {
  //     AddressBook.checkPermission((err, permission) => {
  //       // AddressBook.PERMISSION_AUTHORIZED || AddressBook.PERMISSION_UNDEFINED || AddressBook.PERMISSION_DENIED
  //       if(permission === AddressBook.PERMISSION_UNDEFINED){
  //         AddressBook.requestPermission((err, permission) => {
  //           self.storeContacts()
  //         })
  //       }
  //       else if(permission === AddressBook.PERMISSION_AUTHORIZED){
  //         self.storeContacts()
  //       }
  //       else if(permission === AddressBook.PERMISSION_DENIED){
  //         //handle permission denied
  //       }
  //     })
  //   });
  // }
  // storeContacts() {
  //   var self = this;
  //   AddressBook.getContacts(function(err, contacts) {
  //     self.props.db.createReadStream()
  //     .on('data', function(data) {
  //       if (data.key.indexOf(IDENTITY_MODEL + '_') == -1)
  //         return;
  //     })
  //     .on('close', function() {
  //       console.log('Stream closed');
  //       return me;
  //     })
  //     .on('end', function() {
  //       console.log('Stream ended');
  //     })
  //     .on('error', function(err) {
  //       console.log('err: ' + err);
  //     });
  //     console.log(contacts)
  //   })
  // }
// The LATEST

  // render() {
  //   return (
  //     <NavigatorIOS
  //       style={styles.container}
  //       barTintColor='#D7E6ED'
  //       tintColor='#7AAAC3'
  //       initialRoute={{
  //         title: 'Trust in Motion',
  //         backButtonTitle: 'Back',
  //         titleTextColor: '#3f4c5f',
  //         component: SearchPage,
  //         passProps: {modelName: IDENTITY_MODEL},
  //       }}/>
  //   );
  // }
  // render1() {
  //   if (this.state.isLoading)
  //     return <View></View>;
  //   var passProps = {
  //     filter: '',
  //     models: models,
  //     modelName: IDENTITY_MODEL,
  //   };
  //   if (this.state.me) {
  //     passProps.me = this.state.me;
  //     return <NavigatorIOS
  //       style={styles.container}
  //       barTintColor='#D7E6ED'
  //       tintColor='#7AAAC3'
  //       initialRoute={{
  //         title: 'All Contacts',
  //         titleTextColor: '#7AAAC3',
  //         component: ResourceList,
  //         passProps: passProps
  //       }} />
  //   }
  //   else {
  //     var metadata = models[IDENTITY_MODEL].value;
  //     var page = {
  //       metadata: metadata,
  //       models: models,
  //       db: this.state.db,
  //     };

  //     return (
  //       <NavigatorIOS
  //         style={styles.container}
  //         barTintColor='#D7E6ED'
  //         tintColor='#7AAAC3'
  //         initialRoute={{
  //           title: 'Sign Up',
  //           backButtonTitle: 'Back',
  //           titleTextColor: '#7AAAC3',
  //           component: NewResource,
  //           passProps: {page: page},
  //         }}/>
  //     );
  //   }
  // }
