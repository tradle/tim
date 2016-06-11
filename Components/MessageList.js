'use strict';

var MessageView = require('./MessageView');
var MessageRow = require('./MessageRow');
var NoResources = require('./NoResources');
var NewResource = require('./NewResource');
var ProductChooser = require('./ProductChooser');
var Icon = require('react-native-vector-icons/Ionicons');
var extend = require('extend')
var utils = require('../utils/utils');
var translate = utils.translate
var reactMixin = require('react-mixin');
var equal = require('deep-equal')
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
var GiftedMessenger = require('react-native-gifted-messenger');

// var AddNewMessage = require('./AddNewMessage');
// var SearchBar = require('react-native-search-bar');
// var ResourceTypesScreen = require('./ResourceTypesScreen');

var LINK_COLOR
const PRODUCT_APPLICATION = 'tradle.ProductApplication'

import React, { Component } from 'react'
import {
  ListView,
  StyleSheet,
  Dimensions,
  PropTypes,
  Navigator,
  View,
  Text,
  TouchableOpacity,
  AlertIOS,
  ActionSheetIOS,
  ActivityIndicatorIOS,
  TouchableHighlight
} from 'react-native'

var currentMessageTime;

class MessageList extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
    filter: PropTypes.string,
    isAggregation: PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      selectedAssets: {},
      // dataSource: new ListView.DataSource({
      //   rowHasChanged: (row1, row2) => {
      //     if (row1 !== row2) {
      //       return true
      //     }
      //   }
      // }),
      filter: this.props.filter,
      userInput: '',
      progress: 0,
      indeterminate: true,
      allLoaded: false
    };
  }
  componentWillMount() {
    var params = {
      modelName: this.props.modelName,
      to: this.props.resource,
      prop: this.props.prop,
    }
    if (this.props.isAggregation)
      params.isAggregation = true;

    utils.onNextTransitionEnd(this.props.navigator, () => Actions.messageList(params));
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }

  onAction(params) {
    if (params.error)
      return
    if (params.action === 'connectivity'  &&  params.isConnected  &&  !this.state.isForgetting) {
      let me = utils.getMe()
      let msg = {
        message: me.firstName + ' is waiting for the response',
        _t: constants.TYPES.CUSTOMER_WAITING,
        from: me,
        to: this.props.resource,
        time: new Date().getTime()
      }
      Actions.addMessage(msg, true)
      return
    }
    if (params.action === 'addItem'  ||  params.action === 'addVerification') {
      var actionParams = {
        query: this.state.filter,
        modelName: this.props.modelName,
        to: this.props.resource,
      }

      if (params.sendStatus) {
        this.state.sendStatus = params.sendStatus
        this.state.sendResource = params.resource
      }
      Actions.messageList(actionParams);
      return;
    }
    this.state.newItem = false
    if (params.action === 'updateItem') {
      this.setState({
        sendStatus: params.sendStatus,
        sendResource: params.resource
      })
      return
    }
    if (params.action === 'addMessage') {
      Actions.messageList({modelName: this.props.modelName, to: this.props.resource});
      return
    }
    if ( params.action !== 'messageList'                   ||
        (!params.list  &&  !params.forgetMeFromCustomer)   ||
        params.isAggregation !== this.props.isAggregation)
      return;
    if (params.forgetMeFromCustomer) {
      Actions.list({modelName: constants.TYPES.PROFILE})
      let routes = this.props.navigator.getCurrentRoutes()
      if (routes[routes.length - 1].component )
      this.props.navigator.popToRoute(routes[1])
      // ComponentUtils.showContacts(this.props.navigator, constants.TYPES.PROFILE)
      return
    }
    if (params.resource  &&  params.resource[constants.ROOT_HASH] != this.props.resource[constants.ROOT_HASH]) {
      var doUpdate
      if (this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  params.resource.organization) {
        if (this.props.resource[constants.TYPE] + '_' + this.props.resource[constants.ROOT_HASH] === utils.getId(params.resource.organization))
          doUpdate = true
      }
      if (!doUpdate)
        return;
    }
    var list = params.list;

    if (params.loadingEarlierMessages) {
      if (!list || !list.length) {
        this.state.postLoad([], true)
        this.setState({allLoaded: true, isLoading: false, noScroll: true})
      }
      else {
        this.state.postLoad(list, false)
        this.state.list.forEach((r) => {
          list.push(r)
        })
      }
      return
    }
    LINK_COLOR = this.props.bankStyle.LINK_COLOR

    if (list.length || (this.state.filter  &&  this.state.filter.length)) {
      var type = list[0][constants.TYPE];
      if (type  !== this.props.modelName) {
        var model = utils.getModel(this.props.modelName).value;
        if (!model.isInterface)
          return;

        var rModel = utils.getModel(type).value;
        if (!rModel.interfaces  ||  rModel.interfaces.indexOf(this.props.modelName) === -1)
          return;
      }

      this.setState({
        // dataSource: this.state.dataSource.cloneWithRows(list),
        isLoading: false,
        list: list,
        shareableResources: params.shareableResources,
        allLoaded: false,
        isEmployee: params.isEmployee
      });
    }
    else
      this.setState({isLoading: false, isEmployee: params.isEmployee})
  }
  shouldComponentUpdate(nextProps, nextState) {
    // Eliminating repeated alerts when connection returns after ForgetMe action
    if (!this.props.navigator.isConnected && !this.state.list  && !nextState.list && this.state.isLoading === nextState.isLoading)
      return false
    if (!this.state.list                                 ||
        !nextState.list                                  ||
         this.state.allLoaded !== nextState.allLoaded    ||
         this.state.sendStatus !== nextState.sendStatus  ||
         this.state.list.length !== nextState.list.length)
      return true
    for (var i=0; i<this.state.list.length; i++) {
      let r = this.state.list[i]
      let nr = nextState.list[i]
      if (r[constants.TYPE] !== nr[constants.TYPE]            ||
          r[constants.ROOT_HASH] !== nr[constants.ROOT_HASH]  ||
          r[constants.CUR_HASH] !== nr[constants.CUR_HASH])
        return true
    }
    return false
  }
  share(resource, to, formResource) {
    console.log('Share')
    Actions.share(resource, to, formResource)
  }

  selectResource(resource, verification) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    if (!resource[constants.TYPE])
      return;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var title = model.title; //utils.getDisplayName(resource, model.properties);
    var newTitle = title;
    if (title.length > 20) {
      var t = title.split(' ');
      newTitle = '';
      t.forEach(function(word) {
        if (newTitle.length + word.length > 20)
          return;
        newTitle += newTitle.length ? ' ' + word : word;
      })
    }
    let me = utils.getMe()
    // Check if I am a customer or a verifier and if I already verified this resource
    let isVerifier = !verification && utils.isVerifier(resource)
    var route = {
      title: newTitle,
      id: 5,
      backButtonTitle: translate('back'),
      component: MessageView,
      parentMeta: model,
      passProps: {
        bankStyle: this.props.bankStyle,
        resource: resource,
        currency: this.props.currency,
        verification: verification,
        // createFormError: isVerifier && !utils.isMyMessage(resource),
        isVerifier: isVerifier
      }
    }
    if (isVerifier) {
      route.rightButtonTitle = 'Done' //ribbon-b|ios-close'
      route.help = translate('verifierHelp')  // will show in alert when clicked on help icon in navbar
    }

    this.props.navigator.push(route);
  }

  onSearchChange(text) {
    var actionParams = {
      query: text,
      modelName: this.props.modelName,
      to: this.props.resource,
    }
    this.state.emptySearch = true
    Actions.messageList(actionParams);
  }

  renderRow(resource, sectionId, rowId)  {
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf(constants.TYPES.MESSAGE) != -1;
    var isAggregation = this.props.isAggregation;
    var me = utils.getMe();
    // var MessageRow = require('./MessageRow');
    var previousMessageTime = currentMessageTime;
    currentMessageTime = resource.time;
    return  (
      <MessageRow
        onSelect={this.selectResource.bind(this)}
        share={this.share.bind(this)}
        resource={resource}
        messageNumber={rowId}
        sendStatus={this.state.sendStatus &&  this.state.sendResource[constants.ROOT_HASH] === resource[constants.ROOT_HASH] ? this.state.sendStatus : null}
        isAggregation={isAggregation}
        currency={this.props.currency}
        navigator={this.props.navigator}
        bankStyle={this.props.bankStyle}
        shareableResources={this.state.shareableResources}
        previousMessageTime={previousMessageTime}
        isLast={rowId === this.state.list.length - 1}
        to={isAggregation ? resource.to : this.props.resource} />
      );
  }
  addedMessage(text) {
    Actions.messageList({modelName: this.props.modelName, to: this.props.resource});
  }

  componentDidUpdate() {
    clearTimeout(this._scrollTimeout)
    if (this.state.allLoaded  &&  this.state.noScroll)
      this.state.noScroll = false
    else
      this._scrollTimeout = setTimeout(() => {
        // inspired by http://stackoverflow.com/a/34838513/1385109
        this._GiftedMessenger  &&  this._GiftedMessenger.scrollToBottom()
      }, 200)
  }

  render() {
    currentMessageTime = null;
    var content;

    var model = utils.getModel(this.props.modelName).value;
                    // <Text style={{fontSize: 16, alignSelf: 'center', color: '#ffffff'}}>{'Sending...'}</Text>
    // var isVisible = this.state.sendStatus  &&  this.state.sendStatus !== null
    // var spinner = isVisible
    //             ? <Text style={{alignSelf: 'flex-end', fontSize: 14, color: '#757575', marginHorizontal: 15}}>{thus.state.sendStatus}</Text>
    //             : <View/>
    // var spinner = <LoadingOverlay isVisible={isVisible} onDismiss={() => {this.setState({isVisible:false})}} position="bottom">
    //                 <TouchableOpacity onPress={() => { AlertIOS.alert('Pressed on text!') }}>
    //                   <Text style={styles.bannerText}>{this.state.sendStatus}</Text>
    //                 </TouchableOpacity>
    //               </LoadingOverlay>

    // var spinner = isVisible
    //             ? <Progress.Bar
    //                 style={styles.progress}
    //                 progress={this.state.progress}
    //                 indeterminate={this.state.indeterminate}
    //               />
    //             : <View/>
    var bgStyle = this.props.bankStyle.BACKGROUND_COLOR ? {backgroundColor: this.props.bankStyle.BACKGROUND_COLOR} : {backgroundColor: '#f7f7f7'}
    var alert = <View />
    if (!this.state.list || !this.state.list.length) {
      if (this.props.navigator.isConnected  &&  this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION) {
        if (this.state.isLoading) {
          content = <View style={[styles.container, bgStyle]}>
            <Text style={{fontSize: 16, alignSelf: 'center', marginTop: 80, color: '#629BCA'}}>{'Loading...'}</Text>
            <ActivityIndicatorIOS size='large' style={{alignSelf: 'center', marginTop: 20}} />
          </View>
        }
      }
      else {
        if (!this.state.isLoading  &&  !this.props.navigator.isConnected) {
          alert = (this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION)
                ? AlertIOS.alert(translate('noConnectionForPL', this.props.resource.name))
                : AlertIOS.alert(translate('noConnection'))
        }
        // content =  <NoResources
        //             filter={this.state.filter}
        //             model={model}
        //             isLoading={this.state.isLoading}/>
      }
    }

    if (!content) {
      var isAllMessages = model.isInterface  &&  model.id === constants.TYPES.MESSAGE;

      content = <GiftedMessenger style={{paddingHorizontal: 10, marginTop: 5}}
        ref={(c) => this._GiftedMessenger = c}
        loadEarlierMessagesButton={this.state.list ? this.state.list.length > 100 : false}
        onLoadEarlierMessages={this.onLoadEarlierMessages.bind(this)}
        messages={this.state.list}
        autoFocus={false}
        textRef={'chat'}
        renderCustomMessage={this.renderRow.bind(this)}
        handleSend={this.onSubmitEditing.bind(this)}
        submitOnReturn={true}
        menu={this.generateMenu.bind(this)}
        keyboardShouldPersistTaps={false}
        maxHeight={Dimensions.get('window').height - 64} // 64 for the navBar; 110 - with SearchBar
      />
        // returnKeyType={false}
        // keyboardShouldPersistTaps={false}
        // keyboardDismissMode='none'
    }

    // var addNew = (model.isInterface)
    //        ? <AddNewMessage navigator={this.props.navigator}
    //                         resource={this.props.resource}
    //                         modelName={this.props.modelName}
    //                         onAddNewPressed={this.onAddNewPressed.bind(this)}
    //                         onMenu={this.showMenu.bind(this)}
    //                         onPhotoSelect={this.onPhotoSelect.bind(this)}
    //                         callback={this.addedMessage.bind(this)} />
    //        : <View/>;
                            // onTakePicPressed={this.onTakePicPressed.bind(this)}
    var isOrg = !this.props.isAggregation  &&  this.props.resource  &&  this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION
    var chooser
    if (isOrg)
      chooser =  <View style={{flex:1, marginTop: 8}}>
                  <TouchableHighlight underlayColor='transparent' onPress={this.onAddNewPressed.bind(this, true)}>
                    <Icon name={'ios-arrow-round-down'} size={25} style={styles.imageOutline} />
                  </TouchableHighlight>
                </View>
    else
      chooser = <View/>

    var sepStyle = { height: 1,backgroundColor: LINK_COLOR }
    if (this.state.allLoaded)
      AlertIOS.alert('There is no earlier messages!')
    else if (!this.props.navigator.isConnected  &&  this.state.isForgetting)
      AlertIOS.alert(translate('noConnectionWillProcessLater'))
          // <View style={{flex: 10}}>
          //   <SearchBar
          //     onChangeText={this.onSearchChange.bind(this)}
          //     placeholder='Search'
          //     showsCancelButton={false}
          //     hideBackground={true} />
          // </View>

    return (
      <View style={[styles.container, bgStyle]}>
        <View style={{flexDirection:'row'}} />
        <View style={ sepStyle } />
        {content}
        {alert}
      </View>
    );
        // {addNew}
  }
  generateMenu() {
    if (this.state.isEmployee)
      return <View style={{paddingLeft: 10}}/>

    if (this.props.resource[constants.TYPE] === constants.TYPES.PROFILE &&
        utils.getMe().organization) {
      return <TouchableHighlight underlayColor='transparent'
                onPress={this.chooseFormForCustomer.bind(this)}>
               <View style={{marginLeft: 5, paddingRight: 0, marginTop: 5, marginRight: 10, marginBottom: 0}}>
                 <Icon name='md-more' size={30} color='#999999' />
               </View>
             </TouchableHighlight>
    }
    return  <TouchableHighlight underlayColor='transparent'
                onPress={this.showMenu.bind(this)}>
               <View style={{marginLeft: 5, paddingRight: 0, marginTop: 5, marginRight: 10, marginBottom: 0}}>
                 <Icon name='md-more' size={30} color='#999999' />
               </View>
             </TouchableHighlight>
  }


  onLoadEarlierMessages(oldestMessage = {}, callback = () => {}) {
    this.state.loadingEarlierMessages = true
    // Your logic here
    // Eg: Retrieve old messages from your server

    // newest messages have to be at the begining of the array
    var list = this.state.list;
    var id = utils.getId(list[0])
    Actions.messageList({
      lastId: id,
      limit: 10,
      loadingEarlierMessages: true,
      modelName: this.props.modelName,
      to: this.props.resource,
    })
    // var list = this.state.list
    var earlierMessages = []
    //   list[list.length - 1],
    //   list[list.length - 2],
    //   list[list.length - 3]
    // ];
    this.state.postLoad = callback
    // setTimeout(() => {
    //   callback(earlierMessages, false); // when second parameter is true, the "Load earlier messages" button will be hidden
    // }, 1000);
  }
  checkStart(evt) {
    evt = evt
  }

  chooseFormForCustomer() {
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var resource = this.props.resource
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate(utils.getModel(constants.TYPES.FINANCIAL_PRODUCT).value),
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: translate('cancel'),
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback: this.props.callback,
        type: constants.TYPES.FORM
      },
      // rightButtonTitle: 'ion|plus',
      // onRightButtonPress: {
      //   id: 4,
      //   title: translate('newProduct'),
      //   component: NewResource,
      //   backButtonTitle: translate('back'),
      //   // titleTextColor: '#999999',
      //   rightButtonTitle: translate('done'),
      //   passProps: {
      //     model: utils.getModel('tradle.NewMessageModel').value,
      //     currency: resource.currency,
      //     // callback: this.modelAdded.bind(this)
      //   }
      // }
    });
  }

  showMenu() {
    // var buttons = ['Talk to representative', 'Forget me', 'Cancel']
    var buttons = [translate('forgetMe'), translate('cancel')] // ['Forget me', 'Cancel']
    var self = this;
    ActionSheetIOS.showActionSheetWithOptions({
      options: buttons,
      cancelButtonIndex: 1
    }, function(buttonIndex) {
      switch (buttonIndex) {
      // case 0:
      //   Actions.talkToRepresentative(self.props.resource)
      //   break
      case 0:
        self.forgetMe()
        break;
      default:
        return
      }
    });
  }
      // 'Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties) + '\' to forget you',
  forgetMe() {
    var resource = this.props.resource
    AlertIOS.alert(
      translate('confirmForgetMe', utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties)), //Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties) + '\' to forget you',
      translate('testForgetMe'), //'This is a test mechanism to reset all communications with this provider',
      [
        {text: 'OK', onPress: () => {
          this.state.isForgetting = true
          Actions.forgetMe(resource)
        }},
        {text: translate('cancel'), onPress: () => console.log('Cancel')}
      ]
    )
  }

  onPhotoSelect(asset) {
    var selectedAssets = this.state.selectedAssets;
    // unselect if was selected before
    if (selectedAssets[asset.node.image.uri])
      delete selectedAssets[asset.node.image.uri];
    else
      selectedAssets[asset.node.image.uri] = asset;
  }
  onAddNewPressed(sendForm) {
    var modelName = this.props.modelName;
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface)
      return;

    var self = this;
    var currentRoutes = self.props.navigator.getCurrentRoutes();
    var resource = this.props.resource
    var currentRoutes = self.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate(utils.getModel(constants.TYPES.FINANCIAL_PRODUCT).value),
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: translate('cancel'),
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback: this.props.callback,
        type: PRODUCT_APPLICATION
      },
      rightButtonTitle: 'ion|plus',
      onRightButtonPress: {
        id: 4,
        title: translate('newProduct'),
        component: NewResource,
        backButtonTitle: translate('back'),
        // titleTextColor: '#999999',
        rightButtonTitle: translate('done'),
        passProps: {
          model: utils.getModel('tradle.NewMessageModel').value,
          currency: resource.currency,
          // callback: this.modelAdded.bind(this)
        }
      }
    });
  }
  onTakePicPressed() {
    var self = this;
    this.props.navigator.push({
      title: 'Take a pic',
      backButtonTitle: 'Cancel',
      id: 12,
      component: CameraView,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        onTakePic: self.onTakePic.bind(this),
      }
    });
  }
  onTakePic(data) {
    var msg = {
      from: utils.getMe(),
      to: this.props.resource,
      time: new Date().getTime(),
      photos: [{
        url: data
      }]
    }
    msg[constants.TYPE] = constants.TYPES.SIMPLE_MESSAGE;
    this.props.navigator.pop();
    Actions.addMessage(msg);
  }
  onSubmitEditing(msg) {
    var me = utils.getMe();
    var resource = {from: utils.getMe(), to: this.props.resource};
    var model = utils.getModel(this.props.modelName).value;

    var toName = utils.getDisplayName(resource.to, utils.getModel(resource.to[constants.TYPE]).value.properties);
    var meta = utils.getModel(me[constants.TYPE]).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = constants.TYPES.SIMPLE_MESSAGE;
    var value = {
      message: msg
              ?  model.isInterface ? msg : '[' + this.state.userInput + '](' + this.props.modelName + ')'
              : '',
      from: me,
      to: resource.to,
      time: new Date().getTime()
    }
    value[constants.TYPE] = modelName;
    this.setState({userInput: '', selectedAssets: {}});
    if (this.state.clearCallback)
      this.state.clearCallback();
    Actions.addMessage(value); //, this.state.resource, utils.getModel(modelName).value);
  }

}
reactMixin(MessageList.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 64,
    backgroundColor: '#f7f7f7',
  },
  imageOutline: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderColor: '#aaaaaa',
    paddingLeft: 6,
    // paddingLeft: 8,
    borderWidth: 1,
    color: '#79AAF2'
  },
});
module.exports = MessageList;

/* Adding new model from URL
    this.props.navigator.push({
      title: utils.makeLabel(model.title) + ' type',
      id: 2,
      component: ResourceTypesScreen,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Chat',
      passProps: {
        resource: self.props.resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        modelName: modelName,
        sendForm: sendForm,
        callback: this.props.callback
      },
      rightButtonTitle: 'ion|plus',
      onRightButtonPress: {
        id: 4,
        title: 'New model url',
        component: NewResource,
        backButtonTitle: 'Back',
        titleTextColor: '#7AAAC3',
        rightButtonTitle: 'Done',
        passProps: {
          model: utils.getModel('tradle.NewMessageModel').value,
          callback: this.modelAdded.bind(this)
        }
      }
    });

  modelAdded(resource) {
    if (resource.url)
      Actions.addModelFromUrl(resource.url);
  }
*/
