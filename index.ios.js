var React = require('react-native');
var SearchScreen = require('./Components/SearchScreen');
var SearchPage = require('./Components/SearchPage');
var NewResource = require('./Components/NewResource');
var utils = require('./utils/utils');
var sampleData = require('./data/data');
var AddressBook = require('NativeModules').AddressBook;

var IDENTITY_MODEL = 'tradle.Identity';
var {
  Component,
  NavigatorIOS,
  View,
  StyleSheet,
} = React;

var styles = StyleSheet.create({
  text: {
    color: 'black',
    backgroundColor: 'white',
    fontSize: 30,
    margin: 80
  },
  container: {
    flex: 1
  }
});
var me;
var models = {};

class IdentityApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    }; 
  }
  componentDidMount() {
    var self = this;
    var db = utils.getDb();
    var dbHasResources = false;
    db.createReadStream({limit: 1})
      .on('data', function (data) {
        var m = data.value;
        dbHasResources = true;
        utils.loadModelsAndMe(db, models)
        .then(function(results) {
          self.state.isLoading = false;
        });
      })
      .on('error', function (err) {
        console.log('Oh my!', err.name + ": " + err.message);
      })
      .on('close', function (err) {
        console.log('Stream closed');
      })
      .on('end', function () {
        console.log('Stream end');
        if (!dbHasResources) 
          utils.loadDB(db);
      });
    }

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
  render() {
    return (
      <NavigatorIOS
        style={styles.container}
        barTintColor='#D7E6ED'
        tintColor='#7AAAC3'
        initialRoute={{
          title: 'Trust in Motion',
          backButtonTitle: 'Back',
          titleTextColor: '#3f4c5f',
          component: SearchPage,
          passProps: {modelName: IDENTITY_MODEL},
        }}/>
    );
  }
  render1() {
    if (this.state.isLoading)
      return <View></View>;
    var passProps = {
      filter: '', 
      models: models, 
      modelName: IDENTITY_MODEL,
    };
    if (this.state.me) {
      passProps.me = this.state.me;
      return <NavigatorIOS
        style={styles.container}
        barTintColor='#D7E6ED'
        tintColor='#7AAAC3'
        initialRoute={{
          title: 'All Contacts',
          titleTextColor: '#7AAAC3',
          component: SearchScreen,
          passProps: passProps
        }} />
    }
    else {
      var metadata = models['model_' + IDENTITY_MODEL].value;
      var page = {
        metadata: metadata,
        models: models,
        db: this.state.db,
      };

      return (
        <NavigatorIOS
          style={styles.container}
          barTintColor='#D7E6ED'
          tintColor='#7AAAC3'
          initialRoute={{
            title: 'Sign Up',
            backButtonTitle: 'Back',
            titleTextColor: '#7AAAC3',
            component: NewResource,
            passProps: {page: page},
          }}/>
      );
    }
  }
  
}
React.AppRegistry.registerComponent('Identity', function() { return IdentityApp });

  // renderScene(route, nav) {
  //   if (route.id == 1)
  //     return <SearchPage navigator={nav} db={route.passProps.db} filter={route.passProps.filter} />;
  //   else if (route.id == 3)
  //     return <IdentityView navigator={nav} db={route.passProps.db} identity={route.passProps.identity} />;      
  //   else
  //     return <SearchScreen navigator={nav} db={route.passProps.db} filter={route.passProps.filter} />;
  // }

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
