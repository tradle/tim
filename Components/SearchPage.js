'use strict';
 
var React = require('react-native');
// var Q = require('q');
var SearchScreen = require('./SearchScreen');
var SearchBar = require('./SearchBar');
var ShowItems = require('./ShowItems');
var NewResource = require('./NewResource');
var utils = require('../utils/utils');
var sha = require('stable-sha1');
// var si = require('search-index')();
// var SearchResults = require('./SearchResults');
// var AnimationExperimental = require('AnimationExperimental');

var {
  StyleSheet,
  Text,
  Navigator,
  View,
  TouchableHighlight,
  ActivityIndicatorIOS,
  Image,
  Component,
  ScrollView
} = React;

var styles = StyleSheet.create({
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#7AAAC3',
    marginBottom: -50,
    marginTop: 50,
  },
  scroll: {
    marginTop: 60,
    backgroundColor: '#2E3B4E',
  },
  container: {
    padding: 30,
    // paddingTop: 10,
    marginTop: 70,
    alignItems: 'center',
    backgroundColor: '#2E3B4E',

  },
	flowRight: {
	  flexDirection: 'row',
	  alignItems: 'center',
	  alignSelf: 'stretch'
	},
	buttonText: {
	  fontSize: 18,
	  color: '#2E3B4E',
	  alignSelf: 'center'
	},
	button: {
	  height: 36,
	  flex: 2,
	  flexDirection: 'row',
	  backgroundColor: '#D7E6ED',
	  borderColor: '#7AAAC3',
	  borderWidth: 1,
	  borderRadius: 8,
	  marginBottom: 10,
	  alignSelf: 'stretch',
	  justifyContent: 'center',
	},
  text: {
    color: '#D7E6ED',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 18,
  },
  img: {
    marginTop: 80,
    opacity: 0.3,
    backgroundColor: '#2E3B4E',
    paddingBottom: 20
  },
	image: {
	  width: 150,
	  height: 150,
	},
  thumbButton: {
    marginBottom: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    padding:40, 
  },
  thumb: {
    width: 200,
    height: 200,
  },
});

class SearchPage extends Component {
	constructor(props) {
	  super(props);
	  this.state = {
	    searchString: '',
	    isLoading: false,
	    message: ''
	  };
	}
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
	showContacts(event) {
    var passProps = {
        filter: '', 
        modelName: this.props.modelName,
      };
    this.props.navigator.push({
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      id: 10,
      title: 'Contacts',
      titleTextColor: '#7AAAC3',
      component: SearchScreen,
      passProps: passProps
    });
	}
  _rerenderWithError(err) {
    var props = this.props;
    if (err) 
      props.err = err;    
    else if (props.err) 
      delete pprops.err;      

    this.props.navigator.push({
      component: SearchPage,
      passProps: props
    });
  }
  
  onEditProfilePressed(me) {
    var modelName = this.props.modelName;
    if (!utils.getModel(modelName)) 
      this._rerenderWithError('Can find model: ' + modelName);
    else if (me) {
      if (!me.rootHash) // HACK for sample data
        me.rootHash = sha(me);
      this._createEditIdentity(modelName, me);
    }
    else
      this._createEditIdentity(modelName);
  }
  _createEditIdentity(modelName, me) {
    var metadata = utils.getModel(modelName).value;
    var page = {
      metadata: metadata,
    };
    var route = {
      component: NewResource,
      id: 4,
      titleTextColor: '#7AAAC3',
      passProps: page
    };
    var me = utils.getMe();
    if (me) {
      page.data = me;
      route.title = 'Edit Identity';
      route.rightButtonTitle = 'Add Items';
      var self = this;
      var itemsMeta = utils.getItemsMeta(metadata);
      var identityKey = me['_type'] + '_' +  me.rootHash;
      route.onRightButtonPress = () => {
        self.props.navigator.push({
          component: ShowItems,
          id: 5,
          passProps: {
            resourceKey: resourceKey,  
            resource: me,
            parentMeta: metadata, 
            itemsMeta: itemsMeta
          }
        });
      };
    }
    else
      route.title = 'Create new identity';
    this.props.navigator.push(route);

  }
  onReloadDBPressed() {
    var self = this;
    var db = utils.getDb();
    db.createReadStream()
    .on('data', function(data) {
       db.del(data.key, function(err) {
         err = err;
       })
    })
    .on('error', function (err) {
      console.log('Oh my!', err.name + ': ' + err.message)
    })
    .on('close', function (err) {
      console.log('Stream closed');
    })
    .on('end', function () {
      utils.loadDB(self.props.db)
      console.log('Stream end');
    })
  } 
  render() {
  	var spinner = this.state.isLoading 
                ? <ActivityIndicatorIOS hidden='true' size='large'/>  
                :  <View/>;
    var err = this.props.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var signUp = this.state.me ? 'Edit Profile' : 'Sign up';
    return (
      <View style={styles.scroll}>
        <View style={styles.container} ref='search'>
          <TouchableHighlight style={[styles.thumbButton]}
              underlayColor='#2E3B4E' onPress={this.showContacts.bind(this)}>
            <Image style={styles.thumb} source={require('image!Logo')}>
            </Image>
          </TouchableHighlight>
          <Text style={errStyle}>{err}</Text>
          <View style={{marginTop: 170, flexDirection: 'row'}}>
            <TouchableHighlight 
                underlayColor='#2E3B4E' onPress={this.onEditProfilePressed.bind(this, this.state.me)}>
              <Text style={styles.text}>
                {signUp}
              </Text>
            </TouchableHighlight>      		
            <TouchableHighlight 
                underlayColor='#2E3B4E' onPress={this.onReloadDBPressed.bind(this)}>
              <Text style={styles.text}>
                Reload DB
              </Text>
            </TouchableHighlight>
          </View>
        </View>
          {spinner}   
          <View style={{height: 400}}></View>
      </View>  
    );
  }
}
module.exports = SearchPage;
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
