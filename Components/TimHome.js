'use strict';

var React = require('react-native');
var ResourceList = require('./ResourceList');
var VideoPlayer = require('./VideoPlayer')
var AddNewIdentity = require('./AddNewIdentity');
var NewResource = require('./NewResource');
var ResourceView = require('./ResourceView');
var utils = require('../utils/utils');
var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var sampleData = require('../data/data');
var constants = require('@tradle/constants');
var BACKUPS = require('asyncstorage-backup')
var Device = require('react-native-device');
var debug = require('debug')('Tradle-Home')
var TradleLogo = require('../img/Tradle.png')
var TradleWhite = require('../img/TradleW.png')
var BG_IMAGE = require('../img/bg.png')
// var Progress = require('react-native-progress')
import { authenticateUser } from '../utils/localAuth'
var {
  StyleSheet,
  Text,
  Navigator,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ActivityIndicatorIOS,
  Image,
  Component,
  ScrollView,
  LinkingIOS,
  StatusBarIOS,
  AlertIOS
} = React;


class TimHome extends Component {
	constructor(props) {
	  super(props);
	  this.state = {
	    isLoading: true,
	  };
	}
  componentWillMount() {
    var url = LinkingIOS.popInitialURL();
    Actions.start();
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.isLoading  !== nextState.isLoading  ||
        this.state.message !== nextState.message)
      return true
    else
      return false
  }
  handleEvent(params) {
    if (params.action === 'reloadDB') {
      this.setState({
        isLoading: false,
        message: 'Please restart TiM'
      });
      utils.setModels(params.models);
    }
    else if (params.action === 'start') {
      utils.setMe(params.me);
      utils.setModels(params.models);
      this.setState({isLoading: false});
    }
  }
  showContactsOrRegister() {
    if (this.state.message) {
      this.restartTiM()
      return
    }
    this.state.authenticated = true
    if (utils.getMe())
      this.showOfficialAccounts();
      // this.showContacts();
    else
      this.onEditProfilePressed();
  }
	showContacts() {
    var passProps = {
        filter: '',
        modelName: this.props.modelName,
        sortProperty: 'lastMessageTime'
      };
    var me = utils.getMe();
    this.props.navigator.push({
      // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      id: 10,
      title: 'Contacts',
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      component: ResourceList,
      rightButtonTitle: 'Profile',
      passProps: passProps,
      onRightButtonPress: {
        title: utils.getDisplayName(me, utils.getModel(me[constants.TYPE]).value.properties),
        id: 3,
        component: ResourceView,
        titleTextColor: '#7AAAC3',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: me.firstName,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel(me[constants.TYPE]).value,
            resource: me,
          }
        },
        passProps: {resource: me}
      }
    });
	}
  showOfficialAccounts(isReplace) {
    var resource = utils.getMe()
    var title = resource.firstName;
    var route = {
      title: 'Official Accounts',
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        modelName: constants.TYPES.ORGANIZATION
      },
      rightButtonTitle: 'Profile',
      onRightButtonPress: {
        title: title,
        id: 3,
        component: ResourceView,
        titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: title,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel(resource[constants.TYPE]).value,
            resource: resource
          }
        },
        passProps: {resource: resource}
      }
    }
    if (isReplace)
      this.props.navigator.replace(route)
    else
      this.props.navigator.push(route)
  }

  // showCommunities() {
  //   var passProps = {
  //       filter: '',
  //       modelName: 'tradle.Community',
  //     };
  //   var me = utils.getMe();
  //   this.props.navigator.push({
  //     // sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
  //     id: 10,
  //     title: 'Communities',
  //     titleTextColor: '#7AAAC3',
  //     backButtonTitle: 'Back',
  //     component: ResourceList,
  //     passProps: passProps,
  //   });
  // }
  onEditProfilePressed() {
    if (this.state.message) {
      this.restartTiM()
      return
    }

    var modelName = this.props.modelName;
    if (!utils.getModel(modelName)) {
      this.setState({err: 'Can find model: ' + modelName});
      return;
    }
    var model = utils.getModel(modelName).value;
    var route = {
      component: NewResource,
      // backButtonTitle: 'Back',
      // rightButtonTitle: 'Done',
      id: 4,
      titleTextColor: '#7AAAC3',
      passProps: {
        model: model
      },
    };

    var me = utils.getMe();
    if (me) {
      route.passProps.resource = me;
      route.title = 'Edit Profile';
    }
    else {
      // route.title = 'Introduce yourself';
      route.passProps.callback = (me) => {
        this.showVideoTour(() => this.popToTop(me))
      }

      route.passProps.editCols = ['firstName', 'lastName']
      route.titleTintColor = '#ffffff'
    }
    this.props.navigator.push(route);
  }
  showVideoTour(cb) {
    let onEnd = (err) => {
      if (err) debug('failed to load video', err)
      cb()
    }

    this.props.navigator.replace({
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
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
  popToTop(resource) {
    utils.setMe(resource);
    this.showOfficialAccounts(true);
    // this.props.navigator.popToTop();
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
    AlertIOS.alert(
      `Backed up to #${backupNumber}`
    )
  }
  async onLoadFromBackupPressed() {
    try {
      let backupNumber = await BACKUPS.loadFromBackup()
      AlertIOS.alert(
        `Loaded from backup #${backupNumber}. Please refresh`
      )
    } catch (err) {
      AlertIOS.alert(
        `${err.message}`
      )
    }
  }
  render() {
    StatusBarIOS.setHidden(true);
    if (this.state.message) {
      this.restartTiM()
      return
    }
    var url = LinkingIOS.popInitialURL();
    var d = Device
    var h = d.height - 180
    // var cTop = h / 4

    var thumb = {
      width: d.width / 2.2,
      height: d.width / 2.2
    }
              // <Progress.CircleSnail color={'white'} size={70} thickness={5}/>
  	var spinner =  <View>
          <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width: d.width, height: d.height}} />
          <ScrollView
            scrollEnabled={false}
            style={{height:h}}>
            <View style={[styles.container]}>
              <Image style={thumb} source={require('../img/TradleW.png')}></Image>
              <Text style={styles.tradle}>Tradle</Text>
            </View>
            <View style={{alignItems: 'center'}}>
              <ActivityIndicatorIOS hidden='true' size='large' color='#ffffff'/>
            </View>
          </ScrollView>
          </View>
    if (this.state.isLoading)
      return spinner
    var err = this.state.err || '';
    var errStyle = err ? styles.err : {'padding': 0, 'height': 0};
    var myId = sampleData.getMyId() || utils.getMe();
    var editProfile, communities;

    if (utils.getMe()) {
      editProfile = <TouchableHighlight
                        underlayColor='#2E3B4E' onPress={this.onEditProfilePressed.bind(this)}>
                      <Text style={styles.text}>
                        {'Edit Profile'}
                      </Text>
                    </TouchableHighlight>
      // communities = <TouchableWithoutFeedback style={styles.communities} onPress={this.showCommunities.bind(this)}>
      //                 <Text style={styles.communitiesText}>Communities</Text>
      //               </TouchableWithoutFeedback>
    }
    else {
      editProfile = <View />;
      // communities = <View style={{marginTop: 20}}/>;
    }
    // else  {
    //   var r = {_t: this.props.modelName};
    //   editProfile = <AddNewIdentity resource={r} isRegistration={true} navigator={this.props.navigator} />;
    // }
        // <Text style={styles.title}>Trust in Motion (TiM)</Text>
    var me = utils.getMe()
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
            </View>
          : <View />


    return (
      <View style={styles.scroll}>
      <Image source={BG_IMAGE} style={{position:'absolute', left: 0, top: 0, width: d.width, height: d.height}} />
        <ScrollView
          scrollEnabled={false}
          style={{height:h}}
        >
          <TouchableHighlight style={[styles.thumbButton]}
                underlayColor='transparent' onPress={this._pressHandler.bind(this)}>
            <View style={[styles.container]}>
              <View>
                <Image style={thumb} source={require('../img/TradleW.png')}></Image>
                <Text style={styles.tradle}>Tradle</Text>
              </View>
            </View>
          </TouchableHighlight>
        </ScrollView>
        <View style={{height: 100}}></View>
        <TouchableHighlight style={[styles.thumbButton]}
              underlayColor='transparent' onPress={this._pressHandler.bind(this)}>
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
  restartTiM() {
    AlertIOS.alert(
      'Please restart TiM'
    )
  }
  async _pressHandler() {
    if (!this.state.authenticated) {
      if (!await authenticateUser()) return
    }

    this.showContactsOrRegister()
  }
}
          // {spinner}
          // <View style={{height: 400}}></View>
          // <View style={styles.dev}>
          //   {editProfile}
          //   <TouchableHighlight
          //       underlayColor='#2E3B4E' onPress={this.onReloadDBPressed.bind(this)}>
          //     <Text style={styles.text}>
          //       Reload DB
          //     </Text>
          //   </TouchableHighlight>
          // </View>

reactMixin(TimHome.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    padding: 30,
    marginTop: 120,
    alignItems: 'center',
  },
  tradle: {
    // color: '#7AAAC3',
    color: '#eeeeee',
    fontSize: 35,
    alignSelf: 'center',
  },
  text: {
    color: '#7AAAC3',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 12,
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
    alignSelf: 'center'
  },
  getStartedText: {
    color: '#f0f0f0',
    fontSize: 17,
    fontWeight:'400'
  },
  getStarted: {
    backgroundColor: '#568FBE', //'#2892C6',
    paddingVertical: 10,
    paddingHorizontal: 30
  },
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
