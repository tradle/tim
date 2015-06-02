'use strict';
 
var React = require('react-native');
var SearchScreen = require('./SearchScreen');
var NewResource = require('./NewResource');
var utils = require('../utils/utils');
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var sampleData = require('../data/data');

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

class SearchPage extends Component {
	constructor(props) {
	  super(props);
	  this.state = {
	    isLoading: false,
	  };
	}
  componentWillMount() {
    Actions.start();
  }
  componentDidMount() {
    this.listenTo(Store, 'onReloadDB');
    this.listenTo(Store, 'onStart');
  }
  onReloadDB(action) {
    if (action === 'reloadDB')
      this.setState({isLoading: false});
  }
  onStart(params) {
    if (params.action === 'start') {
      utils.setMe(params.me);
      utils.setModels(params.models);
    }

  }
  showContactsOrRegister() {
    if (utils.getMe())
      this.showContacts();
    else
      this.onEditProfilePressed();
  }
	showContacts() {
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
  
  onEditProfilePressed() {
    var modelName = this.props.modelName;
    if (!utils.getModel(modelName)) {
      this.setState({err: 'Can find model: ' + modelName});
      return;
    }
    var metadata = utils.getModel(modelName).value;
    var page = {
      metadata: metadata,
    };
    var route = {
      component: NewResource,
      backButtonTitle: 'Back',
      id: 4,
      titleTextColor: '#7AAAC3',
      passProps: page
    };
    var me = utils.getMe();
    if (me) {
      page.resource = me;
      route.title = 'Edit Identity';
    }
    else
      route.title = 'Register';
    this.props.navigator.push(route);
  }
  onReloadDBPressed() {
    Actions.reloadDB();
  } 
  render() {
  	var spinner = this.state.isLoading 
                ? <ActivityIndicatorIOS hidden='true' size='large'/>  
                :  <View/>;
    var err = this.state.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var myId = sampleData.getMyId() || utils.getMe();
    var editProfile = 'Edit Profile';
    return (
      <View style={styles.scroll}>
        <View style={styles.container} ref='search'>
          <TouchableHighlight style={[styles.thumbButton]}
              underlayColor='#2E3B4E' onPress={this.showContactsOrRegister.bind(this)}>
            <Image style={styles.thumb} source={require('image!Logo')}>
            </Image>
          </TouchableHighlight>
          <Text style={errStyle}>{err}</Text>
          <View style={{marginTop: 170, flexDirection: 'row'}}>
            <TouchableHighlight 
                underlayColor='#2E3B4E' onPress={this.onEditProfilePressed.bind(this)}>
              <Text style={styles.text}>
                {editProfile}
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

reactMixin(SearchPage.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
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
  text: {
    color: '#D7E6ED',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 18,
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
