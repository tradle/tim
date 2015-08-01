'use strict'

require('react-native-level')
var React = require('react-native');
var ResourceList = require('./Components/ResourceList');
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
var CameraView = require('./Components/CameraView');
var PhotoCarousel = require('./Components/PhotoCarousel');
var utils = require('./utils/utils');
var Icon = require('react-native-icons');
// var Device = require('react-native-device');

var reactMixin = require('react-mixin');

var IDENTITY_MODEL = 'tradle.Identity';
var {
  Component,
  // NavigatorIOS,
  Navigator,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} = React;

var styles = StyleSheet.create({
  icon: {
    width: 20,
    height: 20,
    marginTop: 15,
  },
  container: {
    flex: 1
  },
  // navBar: {
  //   backgroundColor: 'transparent',
  // },
  navBarText: {
    fontSize: 16,
    marginVertical: 15,
  },
  navBarTitleText: {
    color: '#2E3B4E',
    fontWeight: '500',
    marginVertical: 14,
  },
  navBarLeftButton: {
    paddingLeft: 15,
  },
  navBarRightButton: {
    paddingRight: 15,
  },
  navBarButtonText: {
    color: '#7AAAC3',
  },
});

class TiMApp extends Component {
  constructor(props) {
    super(props);
    // var isIphone = Device.isIphone();
    // if (!isIphone)
    //   isIphone = isIphone;
  }
  render() {
    var props = {modelName: IDENTITY_MODEL};
    return (
      <Navigator
        style={styles.container}
        initialRoute={{
          id: 1,
          // title: 'Trust in Motion',
          // titleTextColor: '#7AAAC3',
          component: TimHome,
          passProps: props,
        }}
        renderScene={this.renderScene}
        navigationBar={
          <Navigator.NavigationBar
            routeMapper={NavigationBarRouteMapper}
            style={styles.navBar}
          />
        }
        passProps={props}
        configureScene={(route) => {
          if (route.sceneConfig) 
            return route.sceneConfig;
          return Navigator.SceneConfigs.FloatFromRight;
        }} 
        />
    );
  }

  renderScene(route, nav) {
    var props = route.passProps;
    switch (route.id) {
    case 1:
      return <TimHome navigator={nav} modelName={IDENTITY_MODEL} filter={props.filter} />;
    case 2:
      return <ResourceTypesScreen navigator={nav} 
                  modelName={props.modelName} 
                  resource={props.resource} 
                  returnRoute={props.returnRoute}
                  callback={props.callback} />;
    case 3:
      return <ResourceView navigator={nav} 
                  resource={props.resource}
                  verify={props.verify} />;      
    case 4:
      return <NewResource navigator={nav} 
                  resource={props.resource} 
                  model={props.model}
                  returnRoute={props.returnRoute}
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
    case 12:
      return <CameraView />
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
      return <PhotoCarousel photos={props.photos} currentPhoto={props.currentPhoto} />
    case 10:  
    default: // 10
      return <ResourceList navigator={nav} 
                  filter={props.filter} 
                  resource={props.resource}
                  prop={props.prop}
                  returnRoute={props.returnRoute}
                  callback={props.callback}
                  isAggregation={props.isAggregation}
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
              : <Icon name={lbTitle} size={20} color='#7AAAC3' style={styles.icon}/>;
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
              : <Icon name={route.rightButtonTitle} size={20} color='#7AAAC3' style={styles.icon}/>;
    
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
    var style = [styles.navBarText, styles.navBarTitleText];
    if (route.titleTintColor)
      style.push({color: route.titleTintColor});
    return (
      <Text style={style}>
        {route.title}
      </Text>
    );
  },

};

React.AppRegistry.registerComponent('TiM', function() { return TiMApp });

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
  //     var metadata = models['model_' + IDENTITY_MODEL].value;
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
  

