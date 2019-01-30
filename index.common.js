
import './utils/errors'
import './utils/shim'
import './utils/debug'
import './utils/automaticUpdates'
import React, { Component } from 'react'
import {
  Image,
  View,
  TouchableOpacity,
  AppState,
  AppRegistry,
  // Text,
  BackHandler
} from 'react-native';
import Orientation from 'react-native-orientation'
import { makeResponsive } from 'react-native-orient'
import Reflux from 'reflux'
import Icon from 'react-native-vector-icons/Ionicons'
import reactMixin from 'react-mixin'
import SplashScreen from 'react-native-splash-screen'
import 'stream'
import debounce from 'debounce'
var ReactPerf //= __DEV__ && require('ReactPerf')
import Navigator from './Components/Navigator'

var constants = require('@tradle/constants');
const {
  TYPE
} = constants
const {
  PROFILE,
  MESSAGE
} = constants.TYPES
// console.disableYellowBox = true
// import './utils/logAll'
// import './utils/perf'

// see issue: https://github.com/facebook/react-native/issues/6227
// try {
//   var NativeAppEventEmitter = require('RCTNativeAppEventEmitter')
// } catch (err) {}

// require('babel-polyfill')

// require('react-native-level')

// require('regenerator/runtime') // support es7.asyncFunctions
// import './utils/crypto'
// require('./timmy')
import { Text } from './Components/Text'
import ResourceList from './Components/ResourceList'
import VerifierChooser from './Components/VerifierChooser'
import ShareResourceList from './Components/ShareResourceList'
// var VideoPlayer = require('./Components/VideoPlayer')
import EnumList from './Components/EnumList'
import GridList from './Components/GridList'
import TimHome from './Components/TimHome'
import MarkdownPropertyEdit from './Components/MarkdownPropertyEdit'
import SignatureView from './Components/SignatureView'
// import AvivaIntroView from './Components/AvivaIntroView'
import TourPage from './Components/TourPage'
import SplashPage from './Components/SplashPage'

import PasswordCheck from './Components/PasswordCheck'
import LockScreen from './Components/LockScreen'
import TouchIDOptIn from './Components/TouchIDOptIn'
import NewResource from './Components/NewResource'
import NewItem from './Components/NewItem'
import RemediationItemsList from './Components/RemediationItemsList'
import GridItemsList from './Components/GridItemsList'
import ResourceView from './Components/ResourceView'
import ApplicationView from './Components/ApplicationView'
import MessageView from './Components/MessageView'
import MessageList from './Components/MessageList'
import ArticleView from './Components/ArticleView'
import IdentitiesList from './Components/IdentitiesList'
import SupervisoryViewPerProvider from './Components/SupervisoryViewPerProvider'
import SupervisoryView from './Components/SupervisoryView'
// import ProductChooser from './Components/ProductChooser'
import StringChooser from './Components/StringChooser'
import ContextChooser from './Components/ContextChooser'
import CameraView from './Components/CameraView'
import PhotoCarousel from './Components/PhotoCarousel'
import QRCode from './Components/QRCode'
import QRCodeScanner from './Components/QRCodeScanner'
import Log from './Components/Log'
import HomePageMixin from './Components/HomePageMixin'
import MatchImages from './Components/MatchImages'

import utils, { isWeb } from './utils/utils'
import Actions from './Actions/Actions'
import AutomaticUpdates from './utils/automaticUpdates';
import Store from './Store/Store'
import StyleSheet from './StyleSheet'

const TIM_HOME = 1
const RESOURCE_VIEW = 3
const NEW_RESOURCE = 4
const MESSAGE_VIEW = 5
const ARTICLE_VIEW = 7
const MESSAGE_LIST = 11
const CAMERA_VIEW = 12
const PASSWORD_CHECK = 20
const REMEDIATION = 29
const TOUR_PAGE = 35
const MATCH_VIEW = 40
// const AVIVA_INTRO_VIEW = 50

const LOGO_HEIGHT = 27
const VERIFY_OR_CORRECT = 'VerifyOrCorrect'

import platformStyles, { navBarTitleWidth } from './styles/platform'
import SimpleModal from './Components/SimpleModal'
import Transitions from './utils/transitions'

let originalGetDefaultProps = Text.getDefaultProps;
Text.defaultProps = function() {
  return {
    ...originalGetDefaultProps(),
    allowFontScaling: !isWeb()
  };
};

import Push from './utils/push'
import Navs from './utils/navs'
import Analytics from './utils/analytics'

// if (ReactPerf) ReactPerf.toggle()

var UNAUTHENTICATE_AFTER_BG_MILLIS = require('./utils/localAuth').TIMEOUT

utils.setGlobal('SUBMIT_DEBUG_LOG', utils.submitLog)

const landingPageMapping = {
  // AvivaIntroView: {
  //   component: AvivaIntroView,
  //   id: AVIVA_INTRO_VIEW
  // },
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
    if (isWeb()) return

    let dateAppStateChanged = Date.now()
    // let lastDateAppStateChanged = this.state.dateAppStateChanged
    let newState = { currentAppState, dateAppStateChanged }
    let me = utils.getMe()

    switch (currentAppState) {
      case 'inactive':
        return
      case 'active':
        utils.updateEnv()
        // fire off async, don't wait
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
    let props = {modelName: MESSAGE};

    if (this.state.navigator) {
      let currentRoutes = this.state.navigator.getCurrentRoutes();
      let route = {
        title: r.name ||  'Chat',
        backButtonTitle: 'Back',
        component: MessageList,
        id: 11,
        passProps: {
          resource: r, //{'_t': type, '_r': rId},
          modelName: MESSAGE,
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
            modelName: MESSAGE,
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
            if (!isWeb() && route.sceneConfig)
              return route.sceneConfig;

            const config = isWeb()
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
    case RESOURCE_VIEW:
      return <ResourceView navigator={nav} {...props } />
    case NEW_RESOURCE: // 4
      return <NewResource navigator={nav} {...props } />
    case MESSAGE_VIEW:
      return <MessageView navigator={nav} {...props} />
    case 6:
      return <NewItem navigator={nav} {...props} />
    case ARTICLE_VIEW:
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
    // case 15:
    //   return <ProductChooser navigator={nav} {...props} />
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
    // case AVIVA_INTRO_VIEW:
    //   return <AvivaIntroView navigator={nav} {...props} />
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
    case 40:
      return <MatchImages navigator={nav} {...props } />
    case 10:
    default: // 10
      return <ResourceList navigator={nav} {...props} />
    }
  }
}

reactMixin(TiMApp.prototype, Reflux.ListenerMixin)

const goBack = debounce(function (nav) {
  const { route, index } = Navs.getCurrentRouteInfo(nav)
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
    if (!isWeb()  &&  route.id === CAMERA_VIEW) // Camera view
      color = '#ffffff'
    else if (bankStyle)
      color = bankStyle.navBarColor ||  bankStyle.linkColor
    let previousRoute = navState.routeStack[index - 1];
    let lbTitle = 'backButtonTitle' in route ? route.backButtonTitle : previousRoute.title;
    if (!lbTitle)
      return null;
    let iconIdx = lbTitle.indexOf('|')
    let icon
    if (iconIdx !== -1)
      icon = lbTitle.substring(iconIdx + 1)
    else if (lbTitle === 'Profile')
      icon = 'md-person'
    else //if (lbTitle === 'Back')
      icon = 'ios-arrow-back'

    let style = [platformStyles.navBarText];
    if (route.tintColor)
      style.push({color: route.tintColor});
    else {
      style.push(styles.navBarButtonText);
      style.push({color: color});
    }
    style.push({fontSize: utils.getFontSize(20)})

    let title = icon
              ? <Icon name={icon} size={30} color={color} style={platformStyles.navBarIcon}/>
              : <Text style={style}>
                  {lbTitle}
                </Text>
    // if (route.component === ResourceList  &&  index === 1 &&  navigator.getCurrentRoutes().length === 2)
    //   Actions.cleanup()

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={route.passProps.onLeftButtonPress || goBack.bind(null, navigator)}>
        <View style={platformStyles.navBarLeftButton}>
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
    let icon
    let symbol
    let iconSize = 25
    let bankStyle = route.passProps.bankStyle
    let iconColor
    if (bankStyle) {
      iconColor = bankStyle.navBarColor
      if (!iconColor)
        iconColor = bankStyle.linkColor
    }
    else
      iconColor = '#7AAAC3'
    let color = iconColor

    let style = {}
    let isSubmit
    let isProfile
    let isAndroid = utils.isAndroid()
    let viewStyle = {}
    switch (rbTitle) {
    case 'Done':
    case VERIFY_OR_CORRECT:
      color = bankStyle  &&  bankStyle.buttonBgColor || iconColor
      iconColor = bankStyle  &&  bankStyle.buttonColor || '#fff'
      isSubmit = true
      if (route.passProps.isChooser)
        icon = 'md-checkmark'
      // if (route.passProps.bankStyle  &&  route.passProps.bankStyle.submitBarInFooter)
      //   return
    case 'Accept':
      if (!icon) {
        icon = 'ios-send'
        iconSize = 28
      }
      if (isAndroid)
        viewStyle = {paddingTop: 14}
      style = {marginTop: -2} //isAndroid ? 0 : -2}
      // style = {marginTop: 5, transform: [
      //     {rotate: '45deg'}
      //   ]}
      break
    case 'Download':
      icon = 'md-download'
      break
    case 'Confirm':
      icon = 'md-checkmark-circle-outline'
      iconSize = 28
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
      style = {marginTop: isAndroid ? 10 : 0}
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
    default:
      let iconIdx = rbTitle.indexOf('|')
      if (iconIdx !== -1) {
        icon = rbTitle.substring(iconIdx + 1)
        if (icon === 'md-person')
          iconSize = 28
      }
    }
    let title
    if (icon)  {
      title = <Icon name={icon} size={utils.getFontSize(iconSize)} color={iconColor} style={[platformStyles.navBarIcon, style]} />
      if (isSubmit)
        title = <View style={[styles.submit, {backgroundColor: color, justifyContent: 'center'}, platformStyles.navBarRightIcon]}>
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
    let helpStyle = route.help ? {paddingLeft: 5} : {paddingLeft: 25}
    let submitStyle = isSubmit ? { paddingTop: 3 }  : {}
    return (
      <View style={{position: 'absolute', right: 0, flexDirection: 'row'}}>
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={() => this.rightButtonHandler({route, navigator})}>
        <View style={platformStyles.navBarRightButton}>
          {title}
        </View>
      </TouchableOpacity>
      </View>
    );
  },

  rightButtonHandler: function({navigator, route}) {
    // 'Done' button case for creating new resources
    let isProfile = route.rightButtonTitle.toLowerCase() === 'profile'
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
  },

  Title: function(route, navigator, index, navState) {
    if (!route.title)
      return <View/>
    let org;
    let { modelName, resource, bankStyle, to } = route.passProps
    if (modelName                       &&
        modelName === 'tradle.Message'  &&
        resource                        &&
        resource.organization           &&
        resource[TYPE] === PROFILE)
          // if (route.passProps.resource.organization  &&  route.passProps.resource.organization.photo)
          //   org = <Image source={{uri: route.passProps.resource.organization.photo}} style={styles.orgImage} />
          // if (route.passProps.resource.organization)
      org = <Text style={style}> - {resource.organization.title}</Text>
    let photo, uri
    let photoObj
    // let noLogo = route.id === RESOURCE_VIEW  &&  route.passProps.resource[TYPE] === PROFILE
    // if (!noLogo) {
    if (bankStyle)
      photoObj = bankStyle.barLogo  ||  bankStyle.logo

    if (!photoObj)
      photoObj = route.id === MESSAGE_LIST  &&
                 resource.photos            &&
                 resource.photos[0]
    if (photoObj)
      uri = utils.getImageUri(photoObj.url);
    else if (route.id === REMEDIATION) {
      photoObj = to.photos  &&  to.photos[0]
      uri =  photoObj && utils.getImageUri(photoObj.url)
    }
    let logoNeedsText = bankStyle  &&  bankStyle.logoNeedsText
    if (!logoNeedsText) {
      switch (route.id) {
      case ARTICLE_VIEW:
        break
      case MESSAGE_LIST:
        if (resource) {
           let me = utils.getMe()
           if (me.isEmployee  &&  utils.getId(resource) !== utils.getId(me.organization))
             logoNeedsText = true
         }
        break
      default:
        logoNeedsText = true
      }
    }
    // if (!logoNeedsText  &&  resource) {
    //   if (route.id !== ARTICLE_VIEW)  { // ArticleView
    //     if (route.id !== MESSAGE_LIST)
    //       logoNeedsText = true
    //     else {
    //       let me = utils.getMe()
    //       if (me.isEmployee  &&  utils.getId(resource) !== utils.getId(me.organization))
    //         logoNeedsText = true
    //     }
    //   }
    // }
    let t = route.title.split(' -- ')
    let st = {} //t.length > 1 ? {marginTop: 2} : {}
    let color
    if (uri) {
      let { width, height } = photoObj
      if (width  &&  height)
        width = width * LOGO_HEIGHT / height
      else
        width = bankStyle.barLogo ? LOGO_HEIGHT * 1.7 : LOGO_HEIGHT
        // width = LOGO_HEIGHT * 2

      height = LOGO_HEIGHT
      if (logoNeedsText)
        photo = <Image source={{uri: uri}} style={[styles.msgImage, platformStyles.logo, {width, height}]} />
      else
        photo = <Image source={{uri: uri}} style={[styles.msgImageNoText, platformStyles.logo, {width, height}]} />
    }

    if (!isWeb()  &&  route.id === CAMERA_VIEW) // Camera view
      st.color = color = '#ffffff'
    else if (bankStyle)
      st.color = color = bankStyle.navBarColor || bankStyle.linkColor
    else
      st.color = '#7AAAC3'

    let style = [platformStyles.navBarText, t.length === 1 && styles.navBarTitleText || styles.navBarTitleText1, st]
    let text, tArr
    if (logoNeedsText  ||  !uri) {
      if (route.titleTextColor)
        style.push({color: route.titleTextColor});

      let width = navBarTitleWidth(route.component)
      let st = {width, alignItems: 'center'}
      if (isWeb())
        st.paddingLeft = 5
      for (let i=1; i<t.length; i++) {
        if (!tArr)
          tArr = []
        tArr.push(<View style={st} key={'index.common.js_' + i}>
                    <Text style={[styles.arr, {color: color}]} numberOfLines={1}>{t[i]}</Text>
                  </View>
                  )
      }
      let tstyle = isWeb() ? {paddingLeft: 5} : {width}
      text = <View style={tstyle} key={'index.common.js_0'}>
               <Text numberOfLines={1} style={style}>{t[0]}</Text>
             </View>
    }
    let titleStyle = tArr ? platformStyles.navBarMultiRowTitle : styles.navBarMultiRowTitle
    return (
      <View key={'index.common.js'}>
        <View style={{flexDirection: 'row'}}>
          <View style={[titleStyle, {alignItems: 'center', marginTop: tArr ? -10 : 0}]}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {photo}
              {text}
            </View>
            {tArr}
          </View>
        </View>
        {org}
      </View>
    );
  },
};

var styles = StyleSheet.create({
  msgImage: {
    height: LOGO_HEIGHT,
    resizeMode: 'contain',
    // marginTop: 2,
    marginLeft: 0,
    width: LOGO_HEIGHT * 2,
  },
  msgImageNoText: {
    height: LOGO_HEIGHT,
    width: LOGO_HEIGHT * 2,
    resizeMode: 'contain',
    marginTop: 7,
    marginLeft: 0,
  },
  navBarMultiRowTitle: {
    flexDirection: 'column',
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
  navBarTitleText1: {
    color: '#555555',
    fontWeight: '400',
    fontSize: 18,
  },
  navBarButtonText: {
    color: '#7AAAC3',
    fontSize: 18
  },
  arr: {
    color: '#2892C6',
    fontSize: 12,
  },
  submit: {
    backgroundColor: '#7AAAC3',
    borderColor: '#cccccc',
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    paddingRight: 10,
    paddingLeft: 15,
    paddingBottom: isWeb() ? 3 : 0
  }
});
TiMApp = makeResponsive(TiMApp)
AppRegistry.registerComponent('Tradle', function() { return TiMApp });

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
