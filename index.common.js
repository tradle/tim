import './utils/shim'
import './utils/errors'
import './utils/debug'
import './utils/automaticUpdates'
import React, { Component } from 'react'
import {
  Image,
  View,
  TouchableOpacity,
  AppState,
  AppRegistry,
  BackHandler,
  Alert
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
  MESSAGE,
  ORGANIZATION
} = constants.TYPES
console.disableYellowBox = true
import { Text } from './Components/Text'
import HomePageMixin from './Components/HomePageMixin'

import utils, { isWeb } from './utils/utils'
import Actions from './Actions/Actions'
import AutomaticUpdates from './utils/automaticUpdates';
import Store from './Store/Store'
import StyleSheet from './StyleSheet'
import components from './Components/components'

const LOGO_HEIGHT = 27
const VERIFY_OR_CORRECT = 'VerifyOrCorrect'

import platformStyles, { navBarTitleWidth } from './styles/platform'
import SimpleModal from './Components/SimpleModal'

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

const landingPageMapping = {
  // AvivaIntroView: {
  //   componentName: 'AvivaIntroView',
  // },
  TourPage: {
    componentName: 'TourPage',
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
        componentName: 'TimHome',
        passProps: passProps,
        navBarBgColor: 'transparent'
      },
      props: passProps
    };

    ;['_handleAppStateChange', 'onNavigatorBeforeTransition', 'onNavigatorAfterTransition'].forEach((method) => {
      this[method] = this[method].bind(this)
    })
  }

  componentWillMount() {
    this.listenTo(Store, 'onStoreEvent')
  }

  componentDidMount() {
    if (SplashScreen) {
      SplashScreen.hide()
    }

    AppState.addEventListener('change', this._handleAppStateChange);
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
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
            let style = newRoute.passProps.bankStyle
            if (style)
              this.setState({navBarBgColor: newRoute.componentName === 'TourPage' ? 'transparent' : style.navBarBackgroundColor || 'transparent'})
            else
              this.setState({navBarBgColor: 'transparent'})
          }}
          passProps={this.state.props}
          configureScene={(route) => {
            if (route.sceneConfig)
              return route.sceneConfig;

            const config = {...Navigator.SceneConfigs.FloatFromRight, springFriction:26, springTension:200}
            if (route.componentName === 'PasswordCheck') {
              config.gestures = {}
            }

            return config
          }}
        />
      </View>
    );
  }
  renderScene(route, nav) {
    if (!route.componentName || !components[route.componentName]) {
      Alert.alert(`Component not found ${route.componentName}`)
      return
    }

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
    const Component = components[route.componentName]
    return <Component navigator={nav} {...props}/>
  }
}

reactMixin(TiMApp.prototype, Reflux.ListenerMixin)

const goBack = debounce(function (nav) {
  const { route, index } = Navs.getCurrentRouteInfo(nav)
  if (index === 0 || (components[route.componentName]  &&  components[route.componentName].backButtonDisabled))
    return false

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
    if (route.componentName === 'CameraView' ) // Camera view
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
    if (!icon)
      style.push({marginTop: 6})
    let title = icon
              ? <Icon name={icon} size={30} color={color} style={platformStyles.navBarIcon}/>
              : <Text style={style}>
                  {lbTitle}
                </Text>

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
    let rbTitle = route.rightButtonTitle
    let icon
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
      iconColor = bankStyle  &&  bankStyle.buttonColor || '#ffffff'
      if (iconColor === color)
        iconColor = bankStyle.linkColor
      isSubmit = true
      if (route.passProps.isChooser)
        icon = 'md-checkmark'
    case 'Accept':
      if (!icon) {
        icon = 'ios-send'
        iconSize = 28
      }
      viewStyle = isAndroid  &&  {paddingTop: 14}
      style = {marginTop: -2}
      break
    case 'Confirm':
      icon = 'md-checkmark-circle-outline'
      iconSize = 28
      break
    case 'View':
      icon = 'md-eye'
      iconSize = 28
      style = !isAndroid && {marginTop: 2}
      break
    case 'Search':
      icon = 'md-search'
      break
    case 'Profile':
      isProfile = true
      style = isAndroid &&  {marginTop: 10}
      iconSize = 28
      icon = 'md-person'
      break
    case 'Edit':
      iconSize = 28
      style = {marginRight: -4, marginTop: isAndroid ? 12 : -2}
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

      title = <View style={styles.row}>
               {icons}
              </View>
    }
    return (
      <View style={viewStyle}>
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
      org = <Text style={style}> - {resource.organization.title}</Text>
    let photo, uri
    let photoObj
    if (bankStyle)
      photoObj = bankStyle.barLogo  ||  bankStyle.logo

    if (!photoObj)
      photoObj = route.componentName === 'MessageList'  &&
                 resource.photos                        &&
                 resource.photos[0]
    if (photoObj)
      uri = utils.getImageUri(photoObj.url);
    else if (route.componentName === 'RemediationItemsList') {
      photoObj = to.photos  &&  to.photos[0]
      uri =  photoObj && utils.getImageUri(photoObj.url)
    }
    let logoNeedsText = bankStyle  &&  bankStyle.logoNeedsText
    if (!logoNeedsText) {
      switch (route.componentName) {
      case 'ArticleView':
        break
      case 'MessageList':
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
    let t = route.title.split(' -- ')
    let st = t.length > 1 ? {marginTop: 2} : {}
    if (uri) {
      let { width, height } = photoObj
      if (width  &&  height)
        width = width * LOGO_HEIGHT / height
      else
        width = bankStyle.barLogo ? LOGO_HEIGHT * 1.7 : LOGO_HEIGHT

      height = LOGO_HEIGHT
      if (logoNeedsText)
        photo = <Image source={{uri: uri}} style={[styles.msgImage, platformStyles.logo, {width, height}]} />
      else
        photo = <Image source={{uri: uri}} style={[styles.msgImageNoText, platformStyles.logo, {width, height}]} />
      let provider
      if (resource  &&  resource[TYPE] === ORGANIZATION)
        provider = resource
      else if (to)
        provider =  to
      else if (bankStyle  &&  resource && resource.to && resource.to.organization)
        provider = resource.to.organization
      if (provider)
        photo = <TouchableOpacity hitSlop={HIT_SLOP} onPress={() => this.showProvider(route, provider, navigator)}>{photo}</TouchableOpacity>
    }

    let color
    if (route.componentName === 'CameraView')  // Camera view
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

      let width = navBarTitleWidth(components[route.componentName])
      for (let i=1; i<t.length; i++) {
        if (!tArr)
          tArr = []
        tArr.push(<View style={{width}} key={'index.common.js_' + i}>
                    <Text style={[styles.arr, {color: color}]} numberOfLines={1}>{t[i]}</Text>
                  </View>
                  )
      }
      let tstyle = isWeb() ? {paddingHorizontal: 5, maxWidth: width - 160} : {width, marginTop: t.length === 1 && -2 || 0}
      text = <View style={tstyle} key={'index.common.js_0'}>
               <Text numberOfLines={1} style={style}>{t[0]}</Text>
             </View>
    }
    let titleStyle = tArr ? platformStyles.navBarMultiRowTitle : styles.navBarMultiRowTitle
    return (
      <View key={'index.common.js'}>
        <View style={[{flexDirection: 'row'}, platformStyles.navBarMargin]}>
          {photo}
          <View style={titleStyle}>
            {text}
            {tArr}
          </View>
        </View>
        {org}
      </View>
    );
  },
  showProvider: function(route, provider, navigator) {
    let { bankStyle } = route.passProps
    navigator.push({
      title: provider.name,
      componentName: 'ResourceView',
      backButtonTitle: 'Back',
      passProps: {
        bankStyle,
        resource: provider,
      }
    })
  }
};

var styles = StyleSheet.create({
  msgImage: {
    height: LOGO_HEIGHT,
    resizeMode: 'contain',
    marginRight: 5,
    marginTop: 7,
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
    flex: 1
  },
  navBarTitleText: {
    color: '#555555',
    fontWeight: '400',
    fontSize: 20,
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
  }
});
TiMApp = makeResponsive(TiMApp)
AppRegistry.registerComponent('Tradle', function() { return TiMApp });

function isPortraitOnlyRoute (route) {
  if (!route.componentName)
    debugger
  const orientation = components[route.componentName].orientation
  if (orientation && orientation.toLowerCase() === 'portrait') return true

  return !utils.getMe() && route.componentName === 'NewResource'
}
function isLandscapeOnlyRoute (route) {
  const orientation = components[route.componentName].orientation
  if (orientation && orientation.toLowerCase() === 'landscape') return true

  return !utils.getMe() && route.componentName === 'NewResource'
}
