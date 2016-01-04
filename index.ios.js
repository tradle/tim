'use strict'

// require('react-native-level')

var debug = require('debug')
if (__DEV__) {
  console.ignoredYellowBox = ['jsSchedulingOverhead']
  debug.enable('*')
} else {
  debug.disable()
}

debug = debug('tim:main')

require('regenerator/runtime') // support es7.asyncFunctions
require('./utils/shim')
require('./utils/crypto')
require('stream')
// require('./timmy')
var React = require('react-native');
var CodePush = !__DEV__ && require('react-native-code-push')
var ResourceList = require('./Components/ResourceList');
// var GridList = require('./Components/GridList');
var TimHome = require('./Components/TimHome');
var ResourceTypesScreen = require('./Components/ResourceTypesScreen');
var NewResource = require('./Components/NewResource');
var NewItem = require('./Components/NewItem');
var ResourceView = require('./Components/ResourceView');
var MessageView = require('./Components/MessageView');
var MessageList = require('./Components/MessageList');
var ArticleView = require('./Components/ArticleView');
var IdentitiesList = require('./Components/IdentitiesList');
var SelectPhotoList = require('./Components/SelectPhotoList');
var ProductChooser = require('./Components/ProductChooser')
// var CameraView = require('./Components/CameraView');
var PhotoCarousel = require('./Components/PhotoCarousel');
var QRCode = require('./Components/QRCode')
var QRCodeScanner = require('./Components/QRCodeScanner')
var utils = require('./utils/utils');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var Actions = require('./Actions/Actions');
// var Device = require('react-native-device');

var reactMixin = require('react-mixin');
import { Text } from 'react-native';

let originalGetDefaultProps = Text.getDefaultProps;
Text.defaultProps = function() {
  return {
    ...originalGetDefaultProps(),
    allowFontScaling: false,
  };
};

var {
  Component,
  // NavigatorIOS,
  Navigator,
  Image,
  View,
  // Text,
  TouchableOpacity,
  StyleSheet,
  LinkingIOS
} = React;

var ReactPerf = __DEV__ && require('react-addons-perf')

class TiMApp extends Component {
  constructor(props) {
    super(props)
    var props = {
      modelName: constants.TYPES.IDENTITY
    }
    this.state = {
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
  }

  componentDidMount() {
    if (CodePush) {
      CodePush.sync({ updateDialog: true, installMode: CodePush.InstallMode.ON_NEXT_RESUME });
    }

    LinkingIOS.addEventListener('url', this._handleOpenURL.bind(this));
    var url = LinkingIOS.popInitialURL();
    if (url)
      this._handleOpenURL({url});
  }
  componentWillUnmount() {
    LinkingIOS.removeEventListener('url', this._handleOpenURL.bind(this));
    this._navListeners.forEach((listener) => listener.remove())
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
        console.log(ReactPerf.printWasted())
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
      return <TimHome navigator={nav} modelName={constants.TYPES.IDENTITY} filter={props.filter} />;
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
      return <NewResource navigator={nav}
                  resource={props.resource}
                  model={props.model}
                  editCols={props.editCols}
                  additionalInfo={props.additionalInfo}
                  returnRoute={props.rπeturnRoute}
                  originatingMessage={props.originatingMessage}
                  callback={props.callback} />;
    case 5:
      return <MessageView navigator={nav}
                  resource={props.resource}
                  verify={props.verify} />;
    case 6:
      return <NewItem navigator={nav}
                  resource={props.resource}
                  metadata={props.metadata}
                  onAddItem={props.onAddItem}
                  model={props.model}
                  chooser={props.chooser}
                  template={props.template}
                  parentMeta={props.parentMeta}    />;
    case 7:
      return <ArticleView navigator={nav} url={props.url} />;
    case 8:
      return <IdentitiesList navigator={nav}
                  filter={props.filter}
                  list={props.list}
                  callback={props.callback}
                  modelName={props.modelName} />;
    case 11:
      return <MessageList navigator={nav}
                  filter={props.filter}
                  resource={props.resource}
                  prop={props.prop}
                  returnRoute={props.returnRoute}
                  callback={props.callback}
                  isAggregation={props.isAggregation}
                  modelName={props.modelName} />;
    // case 12:
    //   return <CameraView />
      // <CameraView navigator={nav}
      //             onTakePic={props.onTakePic}
      //             resource={props.resource}
      //             prop={props.prop}/>
    case 13:
      return <SelectPhotoList
                metadata={props.metadata}
                style={styles.style}
                navigator={props.navigator}
                onSelect={props.onSelect}
                onSelectingEnd={props.onSelectingEnd} />

    case 14:
      return <PhotoCarousel photos={props.photos} currentPhoto={props.currentPhoto} resource={props.resource} />
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
      return <ProductChooser navigator={nav}
                  resource={props.resource}
                  returnRoute={props.returnRoute}
                  products={props.products}
                  callback={props.callback} />;
    case 16:
      return <QRCodeScanner navigator={nav}
                onread={props.onread} />
    case 17:
      return <QRCode navigator={nav}
                content={props.content}
                fullScreen={props.fullScreen}
                dimension={props.dimension} />
    case 10:
    default: // 10
      return <ResourceList navigator={nav}
                  filter={props.filter}
                  resource={props.resource}
                  prop={props.prop}
                  returnRoute={props.returnRoute}
                  callback={props.callback}
                  isAggregation={props.isAggregation}
                  isRegistration={props.isRegistration}
                  sortProperty={props.sortProperty}
                  modelName={props.modelName} />;
    }
  }
}
var NavigationBarRouteMapper = {
  LeftButton: function(route, navigator, index, navState) {
    if (index === 0  ||  route.noLeftButton) {
      return null;
    }
    var previousRoute = navState.routeStack[index - 1];
    var lbTitle = route.backButtonTitle  ||  previousRoute.title;
    if (!lbTitle)
      return null;
    var style = [styles.navBarText];
    if (route.tintColor)
      style.push(route.tintColor);
    else
      style.push(styles.navBarButtonText);

    var title = lbTitle.indexOf('|') == -1
              ?  <Text style={style}>
                    {lbTitle}
                 </Text>
              : <Icon name={lbTitle.substring(4)} size={20} color='#7AAAC3' style={styles.icon}/>;
    return (
      <TouchableOpacity
        onPress={() => navigator.pop()}>
        <View style={styles.navBarLeftButton}>
          {title}
        </View>
      </TouchableOpacity>
    );
  },

  RightButton: function(route, navigator, index, navState) {
    if (!route.rightButtonTitle)
      return <View/>
    var style = [styles.navBarText, styles.navBarButtonText];
    if (route.tintColor)
      style.push({color: route.tintColor});
    var title = route.rightButtonTitle.indexOf('|') == -1
              ?  <Text style={style}>
                    {route.rightButtonTitle}
                 </Text>
              : <Icon name={route.rightButtonTitle.substring(4)} size={20} color='#7AAAC3' style={styles.icon}/>;

    return (
      <TouchableOpacity
        onPress={() => {
                  // 'Done' button case for creating new resources
                  if (route.onRightButtonPress.stateChange) {
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
        <View style={styles.navBarRightButton}>
          {title}
        </View>
      </TouchableOpacity>
    );
  },

  Title: function(route, navigator, index, navState) {
    var org;
    var style = [styles.navBarText, styles.navBarTitleText];
    if (route.passProps.modelName) {
      if (route.passProps.modelName === 'tradle.Message') {
        if (route.passProps.resource  &&  route.passProps.resource[constants.TYPE] === constants.TYPES.IDENTITY) {
          // if (route.passProps.resource.organization  &&  route.passProps.resource.organization.photo)
          //   org = <Image source={{uri: route.passProps.resource.organization.photo}} style={styles.orgImage} />
          if (route.passProps.resource.organization)
            org = <Text style={style}> - {route.passProps.resource.organization.title}</Text>
        }
      }
    }
    if (!org)
      org = <View />;
    if (route.titleTintColor)
      style.push({color: route.titleTintColor});
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
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
  orgImage: {
    width: 20,
    height: 20,
    marginTop: 15,
    marginRight: 3,
    borderRadius: 10
  },
  container: {
    flex: 1
  },
  navBar: {
    marginTop: 10,
    padding: 3
  },
  navBarText: {
    fontSize: 16,
    marginBottom: 7
  },
  navBarTitleText: {
    color: '#2E3B4E',
    fontWeight: '400',
    fontSize: 16,
  },
  navBarLeftButton: {
    paddingLeft: 15,
    paddingRight: 25,
    paddingBottom: 10
  },
  navBarRightButton: {
    paddingLeft: 25,
    paddingRight: 15,
    paddingBottom: 10
  },
  navBarButtonText: {
    color: '#7AAAC3',
  },
});

React.AppRegistry.registerComponent('Tradle', function() { return TiMApp });

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


