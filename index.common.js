'use strict'

// see issue: https://github.com/facebook/react-native/issues/6227
var NativeAppEventEmitter = require('RCTNativeAppEventEmitter')

// require('react-native-level')
import Debug from './utils/debug'
var debug = Debug('tradle:app')

// require('regenerator/runtime') // support es7.asyncFunctions
import './utils/shim'
import './utils/crypto'
import 'stream'
// require('./timmy')

// require('ErrorUtils').setGlobalHandler(function (e, isFatal) {
//   Alert.alert(e.stack)
//   console.error('Failed to handle error:')
//   console.error(e)
//   if (__DEV__) throw e
// })

var ResourceList = require('./Components/ResourceList');
var VideoPlayer = require('./Components/VideoPlayer')
var EnumList = require('./Components/EnumList')
// var GridList = require('./Components/GridList');
var TimHome = require('./Components/TimHome');
var PasswordCheck = require('./Components/PasswordCheck');
var TouchIDOptIn = require('./Components/TouchIDOptIn');
var ResourceTypesScreen = require('./Components/ResourceTypesScreen');
var NewResource = require('./Components/NewResource');
var NewItem = require('./Components/NewItem');
var ItemsList = require('./Components/ItemsList')
var GridItemsList = require('./Components/GridItemsList')
var ResourceView = require('./Components/ResourceView');
var MessageView = require('./Components/MessageView');
var MessageList = require('./Components/MessageList');
var ArticleView = require('./Components/ArticleView');
var IdentitiesList = require('./Components/IdentitiesList');
// var SelectPhotoList = require('./Components/SelectPhotoList');
var ProductChooser = require('./Components/ProductChooser')
var CameraView = require('./Components/CameraView');
var PhotoCarousel = require('./Components/PhotoCarousel');
var QRCode = require('./Components/QRCode')
var QRCodeScanner = require('./Components/QRCodeScanner')
var utils = require('./utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var Actions = require('./Actions/Actions');
import * as AutomaticUpdates from './utils/automaticUpdates';
import { signIn } from './utils/localAuth'

var reactMixin = require('react-mixin');
import {
  Navigator,
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  // Linking,
  AppState,
  AppRegistry,
  Text
} from 'react-native';

import platformStyles from './styles/platform'

let originalGetDefaultProps = Text.getDefaultProps;
Text.defaultProps = function() {
  return {
    ...originalGetDefaultProps(),
    allowFontScaling: false,
  };
};

import React, { Component } from 'react'
import Push from './utils/push'

var ReactPerf = __DEV__ && require('react-addons-perf')
var UNAUTHENTICATE_AFTER_BG_MILLIS = require('./utils/localAuth').TIMEOUT

class TiMApp extends Component {
  constructor(props) {
    super(props)
    var props = {
      modelName: constants.TYPES.PROFILE
    }
    this.state = {
      currentAppState: 'active',
      dateAppStateChanged: Date.now(),
      initialRoute: {
        id: 1,
        // title: 'Trust in Motion',
        // titleTextColor: '#7AAAC3',
        component: TimHome,
        passProps: props,
      },
      props: props
    };
    // var url = 'tradlekyc://71e4b7cd6c11ab7221537275988f113a879029ea';
    // this._handleOpenURL({url});
    // var isIphone = Device.isIphone();
    // if (!isIphone)
    //   isIphone = isIphone;

    ;['_handleOpenURL', '_handleAppStateChange'].forEach((method) => {
      this[method] = this[method].bind(this)
    })
  }

  componentDidMount() {
    AutomaticUpdates.on()
    AppState.addEventListener('change', this._handleAppStateChange);
    // Linking.addEventListener('url', this._handleOpenURL);
    // var url = Linking.popInitialURL();
    // if (url)
    //   this._handleOpenURL({url});
  }
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    // Linking.removeEventListener('url', this._handleOpenURL);
    this._navListeners.forEach((listener) => listener.remove())
  }
  _handleAppStateChange(currentAppState) {
    // TODO:
    // Actions.appState(currentAppState)
    // and check if authentication expired in store

    let dateAppStateChanged = Date.now()
    let lastDateAppStateChanged = this.state.dateAppStateChanged
    let newState = { currentAppState, dateAppStateChanged }
    let me = utils.getMe()

    switch (currentAppState) {
      case 'inactive':
        return
      case 'active':
        AutomaticUpdates.hasUpdate().then(has => {
          if (has) {
            Alert.alert('installing update...')
            return setTimeout(() => AutomaticUpdates.install(), 2000)
          }

          Push.resetBadgeNumber()
          if (this.state.currentAppState === 'active') return

          clearTimeout(this.state.unauthTimeout)
          // ok to pop from defensive copy

          AutomaticUpdates.sync()
          this.setState(newState)
        })

        return
      case 'background':
        newState.unauthTimeout = setTimeout(() => {
          if (!me || !me.isRegistered) return

          Actions.setAuthenticated(false)
          let currentRoute = this.state.navigator.getCurrentRoutes().pop()
          // TODO: auth flow should not be here OR in TimHome
          // it should be more like Actions.auth()
          // and then handled in one place
          signIn(this.state.navigator)
            // .then(() => {
              // me = utils.getMe()
              // if (me.useGesturePassword)
              //   this.state.navigator.pop()
            // })

          Actions.start()
        }, UNAUTHENTICATE_AFTER_BG_MILLIS)

        break
    }

    this.setState(newState)
  }
  _handleOpenURL(event) {
    var url = event.url.trim();
    var idx = url.indexOf('://');
    var q = (idx + 3 === url.length) ? null : url.substring(idx + 3);

    var r;
    if (!q) {
      r = {
        _t: 'tradle.Organization',
        _r: '0191ef415aa2ec76fb8ec8760b55112cadf573bc',
        name: 'HSBC',
        me: 'me'
      }
    }
    else {
      var params = q.split('=');
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
        if (!r[constants.TYPE])
          r[constants.TYPE] = 'tradle.Organization';
      }
    }
    var props = {modelName: 'tradle.Message'};

    if (this.state.navigator) {
      var currentRoutes = this.state.navigator.getCurrentRoutes();
      var route = {
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

  onNavigatorBeforeTransition() {
    if (ReactPerf) ReactPerf.start()

    Actions.startTransition()
  }

  onNavigatorAfterTransition() {
    if (ReactPerf) {
      setTimeout(function () {
        ReactPerf.stop()
        // console.log(ReactPerf.printWasted())
      }, 500)
    }

    Actions.endTransition()
  }

  render() {
    var nav = (
      <Navigator
        style={styles.container}
        initialRoute={this.state.initialRoute}
        renderScene={this.renderScene.bind(this)}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper}
            style={styles.navBar}
          />
        }
        passProps={this.state.props}
        configureScene={(route) => {
          if (route.sceneConfig)
            return route.sceneConfig;
          return {...Navigator.SceneConfigs.FloatFromRight, springFriction:26, springTension:200};
        }}
        />
    );

    return nav
  }
          // return {...Navigator.SceneConfigs.FloatFromRight, springFriction:26, springTension:300};

  renderScene(route, nav) {
    if (__DEV__) {
      let displayName = route.component.displayName
      if (!displayName) {
        if (typeof route.component === 'function') {
          displayName = route.component.name || route.component.toString().match(/function (.*?)\s*\(/)[1]
        }
      }

      // if (!displayName || displayName === 'exports') debugger

      debug('navigating to ' + displayName)
    }

    var props = route.passProps;
    if (!this.state.navigator) {
      this._navListeners = [
        nav.navigationContext.addListener('willfocus', this.onNavigatorBeforeTransition),
        nav.navigationContext.addListener('didfocus', this.onNavigatorAfterTransition)
      ]

      this.state.navigator = nav;
    }

    switch (route.id) {
    case 1:
      return <TimHome navigator={nav} {...props}/>;
    case 2:
      return <ResourceTypesScreen navigator={nav}
                  modelName={props.modelName}
                  resource={props.resource}
                  returnRoute={props.returnRoute}
                  sendForm={props.sendForm}
                  callback={props.callback} />;
    case 3:
      return <ResourceView navigator={nav}
                  resource={props.resource}
                  prop={props.prop}
                  verify={props.verify} />;
    case 4:
      return <NewResource navigator={nav} {...props } />
    case 5:
      return <MessageView navigator={nav} {...props} />
    case 6:
      return <NewItem navigator={nav} {...props} />
    case 7:
      return <ArticleView navigator={nav} url={props.url} />;
    case 8:
      return <IdentitiesList navigator={nav}
                  filter={props.filter}
                  list={props.list}
                  callback={props.callback}
                  modelName={props.modelName} />;
    case 9:
      return <ItemsList navigator={nav} {...props} />
    case 11:
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
    //   return <GridList navigator={nav}
    //               filter={props.filter}
    //               resource={props.resource}
    //               prop={props.prop}
    //               returnRoute={props.returnRoute}
    //               callback={props.callback}
    //               isAggregation={props.isAggregation}
    //               sortProperty={props.sortProperty}
    //               modelName={props.modelName} />;
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
      // return <VideoPlayer {...props} />
    case 19:
      return <GridItemsList navigator={nav} {...props} />
    case 20:
      return <PasswordCheck navigator={nav} {...props} />
    case 21:
      return <TouchIDOptIn navigator={nav} { ...props } />
    case 22:
      return <EnumList navigator={nav} { ...props } />

    case 10:
    default: // 10
      return <ResourceList navigator={nav} {...props} />
    }
  }
}

var HIT_SLOP = {top:10,right:10,bottom:10,left:10}
var NavigationBarRouteMapper = {
  LeftButton: function(route, navigator, index, navState) {
    if (index === 0  ||  route.noLeftButton) {
      return null;
    }
    var color = '#7AAAC3'
    if (route.passProps.bankStyle  &&  route.passProps.bankStyle.LINK_COLOR)
      color = route.passProps.bankStyle.LINK_COLOR

    var previousRoute = navState.routeStack[index - 1];
    var lbTitle = 'backButtonTitle' in route ? route.backButtonTitle : previousRoute.title;
    if (!lbTitle)
      return null;
    var style = [platformStyles.navBarText];
    if (route.tintColor)
      style.push(route.tintColor);
    else {
      style.push(styles.navBarButtonText);
      var st = {color: color}
      style.push(st);
    }
    var title = lbTitle.indexOf('|') == -1
              ? <Text style={style}>
                  {lbTitle}
                </Text>
              : <Icon name={lbTitle.substring(4)} size={20} color='#7AAAC3' style={styles.icon}/>;
    if (route.component === ResourceList  &&  index === 1 &&  navigator.getCurrentRoutes().length === 2)
      Actions.cleanup()

    let status = <View/>
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={() => navigator.pop()}>
        <View style={[styles.navBarLeftButton, styles.row]}>
          {status}
          {title}
        </View>
      </TouchableOpacity>
      )
  },
  RightButton: function(route, navigator, index, navState) {
    if (!route.rightButtonTitle)
      return <View/>
    var style = [platformStyles.navBarText, styles.navBarButtonText];
    if (route.tintColor)
      style.push({color: route.tintColor});
    else if (route.passProps.bankStyle)
      style.push({color: route.passProps.bankStyle.LINK_COLOR || '#7AAAC3'})
    var title
    if (route.rightButtonTitle.indexOf('|') == -1)
      title =  <Text style={style}>
                  {route.rightButtonTitle}
               </Text>
    else {
      let iconsList = route.rightButtonTitle.split('|')
      let icons = []
      iconsList.forEach((i) => {
        icons.push(<Icon name={i} key={i} size={20} color='#7AAAC3' style={{paddingLeft: 3}} />)
      })

      title = <View style={styles.row}>
               {icons}
              </View>
    }
    return (
      <View style={styles.row}>
      {route.help
        ? <TouchableOpacity
            hitSlop={HIT_SLOP}
            onPress={() =>  Alert.alert(translate(route.help))}>
            <Icon name={'ios-information-circle'} key={'ios-help'} size={20} color='#29ABE2' style={{paddingLeft: 3, marginTop: 10}}/>
          </TouchableOpacity>
        : <View />
      }
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={() => {
                  // 'Done' button case for creating new resources
                  if (typeof route.onRightButtonPress === 'function') {
                    route.onRightButtonPress()
                  }
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
    var org;
    var style = [platformStyles.navBarText, styles.navBarTitleText];
    if (route.passProps.modelName) {
      if (route.passProps.modelName === 'tradle.Message') {
        if (route.passProps.resource  &&  route.passProps.resource[constants.TYPE] === constants.TYPES.PROFILE) {
          // if (route.passProps.resource.organization  &&  route.passProps.resource.organization.photo)
          //   org = <Image source={{uri: route.passProps.resource.organization.photo}} style={styles.orgImage} />
          if (route.passProps.resource.organization)
            org = <Text style={style}> - {route.passProps.resource.organization.title}</Text>
        }
      }
    }
    if (!org)
      org = <View />;
    if (route.titleTextColor)
      style.push({color: route.titleTextColor});
    return (
      <View style={styles.row}>
        <Text style={style}>
          {route.title}
        </Text>
        {org}
      </View>
    );
  },

};

var styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
    // marginTop: 15,
  },
  row: {
    flexDirection: 'row'
  },
  // orgImage: {
  //   width: 20,
  //   height: 20,
  //   marginTop: 15,
  //   marginRight: 3,
  //   borderRadius: 10
  // },
  container: {
    flex: 1
  },

  // navBar: {
  //   marginTop: 10,
  //   padding: 3
  // },
  // navBarText: {
  //   fontSize: 17,
  //   // marginBottom: 7
  // },

  navBarTitleText: {
    color: '#2E3B4E',
    fontWeight: '400',
    fontSize: 17,
  },
  navBarLeftButton: {
    paddingLeft: 10,
    paddingRight: 25,
    // paddingBottom: 10
  },
  navBarRightButton: {
    paddingLeft: 25,
    paddingRight: 10,
    // paddingBottom: 10
  },
  navBarButtonText: {
    color: '#7AAAC3',
  },
});

AppRegistry.registerComponent('Tradle', function() { return TiMApp });

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
