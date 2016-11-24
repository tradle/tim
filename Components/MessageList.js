'use strict';

var MessageView = require('./MessageView')
var MessageRow = require('./MessageRow')
var MyProductMessageRow = require('./MyProductMessageRow')
var VerificationMessageRow = require('./VerificationMessageRow')
var FormMessageRow = require('./FormMessageRow')
var NoResources = require('./NoResources')
var NewResource = require('./NewResource')
var ProductChooser = require('./ProductChooser')
var ResourceList = require('./ResourceList')
var ChatContext = require('./ChatContext')
var ContextChooser = require('./ContextChooser')
var Icon = require('react-native-vector-icons/Ionicons')
var utils = require('../utils/utils')
var translate = utils.translate
var reactMixin = require('react-mixin')
var equal = require('deep-equal')
var Store = require('../Store/Store')
var Actions = require('../Actions/Actions')
var Reflux = require('reflux')
var constants = require('@tradle/constants')
var GiftedMessenger = require('react-native-gifted-messenger')
var NetworkInfoProvider = require('./NetworkInfoProvider')
var PageView = require('./PageView')
var extend = require('extend');

import ActionSheet from 'react-native-actionsheet'
import { makeResponsive } from 'react-native-orient'

// var AddNewMessage = require('./AddNewMessage')
// var SearchBar = require('react-native-search-bar')
// var ResourceTypesScreen = require('./ResourceTypesScreen')

var LINK_COLOR
var LIMIT = 20
var NEXT_HASH = '_n'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const MY_PRODUCT = 'tradle.MyProduct'
const FORM_REQUEST = 'tradle.FormRequest'
var StyleSheet = require('../StyleSheet')

import React, { Component } from 'react'
import {
  ListView,
  // StyleSheet,
  PropTypes,
  Navigator,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TouchableHighlight
} from 'react-native'

import ActivityIndicator from './ActivityIndicator'
import platformStyles, {MenuIcon} from '../styles/platform'
import ENV from '../utils/env'

var currentMessageTime

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
    currentMessageTime = null;
    this.state = {
      isLoading: true,
      selectedAssets: {},
      isConnected: this.props.navigator.isConnected,
      onlineStatus: this.props.resource._online,
      allContexts: true,  // true - for the full chat; false - filtered chat for specific context.
      isEmployee:  utils.isEmployee(props.resource),
      filter: this.props.filter,
      userInput: '',
      allLoaded: false
      // show: false,
      // progress: 0,
      // indeterminate: true,
    };
      // dataSource: new ListView.DataSource({
      //   rowHasChanged: (row1, row2) => {
      //     if (row1 !== row2) {
      //       return true
      //     }
      //   }
      // }),
  }
  componentWillMount() {
    var params = {
      modelName: this.props.modelName,
      to: this.props.resource,
      prop: this.props.prop,
      context: this.props.context,
      limit: LIMIT
    }
    if (this.props.isAggregation)
      params.isAggregation = true;

    utils.onNextTransitionEnd(this.props.navigator, () => Actions.list(params));
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }

  onAction(params) {
    if (params.error)
      return
    let resource = this.props.resource
    if (params.action === 'connectivity') {
      // if (params.isConnected  &&  !this.state.isForgetting) {
      //   this.state.isConnected = params.isConnected
      //   let me = utils.getMe()
      //   let msg = {
      //     message: me.firstName + ' is waiting for the response',
      //     _t: constants.TYPES.CUSTOMER_WAITING,
      //     from: me,
      //     to: resource,
      //     time: new Date().getTime()
      //   }
      //   Actions.addMessage(msg, true)
      // }
      // else
      this.setState({isConnected: params.isConnected})

      return
    }
    if (params.action === 'onlineStatus') {
      // if (params.isConnected  &&  !this.state.isForgetting) {
      //   this.state.isConnected = params.isConnected
      //   let me = utils.getMe()
      //   let msg = {
      //     message: me.firstName + ' is waiting for the response',
      //     _t: constants.TYPES.CUSTOMER_WAITING,
      //     from: me,
      //     to: resource,
      //     time: new Date().getTime()
      //   }
      //   Actions.addMessage(msg, true)
      // }
      // else
      this.setState({onlineStatus: params.online})

      return
    }
    if (params.action === 'addItem'  ||  params.action === 'addVerification') {
      var actionParams = {
        query: this.state.filter,
        modelName: this.props.modelName,
        to: resource,
        context: this.state.allContexts ? null : this.state.context,
        limit: this.state.list ? Math.max(this.state.list.length + 1, LIMIT) : LIMIT
      }

      if (params.resource._sendStatus) {
        this.state.sendStatus = params.resource._sendStatus
        this.state.sendResource = params.resource
      }
      else if (params.resource[constants.TYPE] === FORM_REQUEST)
        this.state.addedItem = params.resource
      else
        this.state.addedItem = null
      Actions.list(actionParams);
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
      this.state.sendStatus = params.resource._sendStatus
      this.state.sendResource = params.resource
      Actions.list({
        modelName: this.props.modelName,
        to: resource,
        limit: this.state.list ? this.state.list.length + 1 : LIMIT,
        context: this.state.allContexts ? null : this.state.context
      });
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
    if (params.resource  &&  params.resource[constants.ROOT_HASH] != resource[constants.ROOT_HASH]) {
      var doUpdate
      if (resource[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  params.resource.organization) {
        if (resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH] === utils.getId(params.resource.organization))
          doUpdate = true
      }
      if (!doUpdate)
        return;
    }
    var list = params.list;
    // if (this.state.sendStatus) {
    //   list.forEach((r) => {
    //     if (r[constants.ROOT_HASH] === this.state.sendResource[constants.ROOT_HASH])
    //       r.status = this.state.sendStatus
    //   })
    // }
    if (params.loadEarlierMessages  &&  this.state.postLoad) {
      if (!list || !list.length) {
        this.state.postLoad([], true)
        this.state = {
          allLoaded: true, isLoading: false, noScroll: true, loadEarlierMessages: false,
          ...this.state
        }
//         this.setState({allLoaded: true, isLoading: false, noScroll: true, loadEarlierMessages: false})
      }
      else {
        this.state.postLoad(list, false)
//         this.state.list = list
        let allLoaded = list.length < LIMIT
        this.state.list.forEach((r) => {
          list.push(r)
        })
        let productToForms = this.gatherForms(list)
        this.setState({
          list: list,
          noScroll: true,
          allLoaded: allLoaded,
          productToForms: productToForms,
          loadEarlierMessages: !allLoaded
        })
        // this.setState({list: list, noScroll: true, allLoaded: allLoaded, loadEarlierMessages: !allLoaded})
      }
      return
    }
    LINK_COLOR = this.props.bankStyle  &&  this.props.bankStyle.LINK_COLOR
    let isEmployee = utils.isEmployee(resource)
    if (list.length || (this.state.filter  &&  this.state.filter.length)) {
      let productToForms = this.gatherForms(list)

      var type = list[0][constants.TYPE];
      if (type  !== this.props.modelName) {
        var model = utils.getModel(this.props.modelName).value;
        if (!model.isInterface)
          return;

        var rModel = utils.getModel(type).value;
        if (!rModel.interfaces  ||  rModel.interfaces.indexOf(this.props.modelName) === -1)
          return;
      }
      let me = utils.getMe()
      this.setState({
        // dataSource: this.state.dataSource.cloneWithRows(list),
        isLoading: false,
        list: list,
        shareableResources: params.shareableResources,
        allLoaded: false,
        addedItem: this.state.addedItem,
        context: params.context,
        isEmployee: isEmployee,
        loadEarlierMessages: params.loadEarlierMessages,
        productToForms: productToForms
      });
    }
    else
      this.setState({isLoading: false, isEmployee: isEmployee})
  }
  gatherForms(list) {
    let productToForms = {}
    list.forEach((r) => {
      if (r[constants.TYPE] === FORM_REQUEST  &&  r.documentCreated  &&  r.document) {
        var l = productToForms[r.product]
        if (!l) {
          l = {}
          productToForms[r.product] = l
        }
        let forms = l[r.form]
        if (!forms) {
          forms = []
          l[r.form] = forms
        }
        forms.push(r.document)
      }
    })
    return productToForms
  }
  shouldComponentUpdate(nextProps, nextState) {
    // Eliminating repeated alerts when connection returns after ForgetMe action
    if (!this.state.isConnected && !this.state.list  && !nextState.list && this.state.isLoading === nextState.isLoading)
      return false
    if (nextState.isConnected !== this.state.isConnected || nextState.onlineStatus !== this.state.onlineStatus)
      return true
    if (this.state.context !== nextState.context || this.state.allContexts !== nextState.allContexts)
      return true
    // if (this.state.show !== nextState.show)
    //   return true
    if (!this.state.list                                  ||
        !nextState.list                                   ||
         this.props.orientation !== nextProps.orientation ||
         this.state.allLoaded !== nextState.allLoaded     ||
         this.state.list.length !== nextState.list.length ||
         this.state.sendStatus !== nextState.sendStatus)
         // this.state.sendResource  &&  this.state.sendResource[constants.ROOT_HASH] === nextState.sendResource[constants.ROOT_HASH]))
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
  share(resource, to, formRequest) {
    console.log('Share')
    Actions.share(resource, to, formRequest) // forRequest - originating message
  }

  selectResource(resource, verification) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    if (!resource[constants.TYPE])
      return;
    var model = utils.getModel(resource[constants.TYPE]).value;
    var title = model.title; //utils.getDisplayName(resource, model.properties);
    var newTitle = title;
    // if (title.length > 20) {
    //   var t = title.split(' ');
    //   newTitle = '';
    //   t.forEach(function(word) {
    //     if (newTitle.length + word.length > 20)
    //       return;
    //     newTitle += newTitle.length ? ' ' + word : word;
    //   })
    // }
    let me = utils.getMe()
    // Check if I am a customer or a verifier and if I already verified this resource
    let isVerifier = !verification && utils.isVerifier(resource)
    let isEmployee = utils.isEmployee(this.props.resource)
    var route = {
      title: newTitle,
      id: 5,
      backButtonTitle: 'Back',
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
    // Allow to edit resource that was not previously changed
    if (!verification  &&  !isEmployee  &&  !resource[NEXT_HASH]  &&  model.subClassOf !== MY_PRODUCT) {
      route.rightButtonTitle = 'Edit'
      route.onRightButtonPress = {
        title: newTitle, //utils.getDisplayName(resource),
        id: 4,
        component: NewResource,
        // titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Done',
        passProps: {
          model: model,
          resource: resource,
          chat: this.props.resource,
          bankStyle: this.props.bankStyle
        }
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
      context: this.state.allContexts ? null : this.state.context,
      limit: this.state.list ? this.state.list.length + 1 : LIMIT
    }
    this.state.emptySearch = true
    Actions.list(actionParams);
  }

  renderRow(resource, sectionId, rowId)  {
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;
    var isMessage = model.interfaces  &&  model.interfaces.indexOf(constants.TYPES.MESSAGE) != -1;
    var isAggregation = this.props.isAggregation;
    var me = utils.getMe();
    // var MessageRow = require('./MessageRow');
    var previousMessageTime = currentMessageTime;
    currentMessageTime = resource.time;
    var props = {
      onSelect: this.selectResource.bind(this),
      resource: resource,
      bankStyle: this.props.bankStyle,
      context: this.props.resource[constants.TYPE] === PRODUCT_APPLICATION ? this.props.resource : resource._context || this.state.context,
      to: isAggregation ? resource.to : this.props.resource,
      navigator: this.props.navigator,
    }
    if (model.subClassOf === 'tradle.MyProduct')
      return  <MyProductMessageRow {...props} />

      // messageNumber: rowId,
    let sendStatus = this.state.sendStatus &&  this.state.sendResource[constants.ROOT_HASH] === resource[constants.ROOT_HASH]
                   ? this.state.sendStatus : (resource._sendStatus === 'Sent' ? null : resource._sendStatus)
    var moreProps = {
      share: this.share.bind(this),
      sendStatus: sendStatus,
      currency: this.props.currency,
      previousMessageTime: previousMessageTime,
    }

    props = extend(props, moreProps)
    if (model.id === constants.TYPES.VERIFICATION)
      return  <VerificationMessageRow {...props} />

    if (model.subClassOf === constants.TYPES.FORM)
      return <FormMessageRow {...props} />

    props.isLast = rowId === this.state.list.length - 1,
    props.productToForms = this.state.productToForms
    props.shareableResources = this.state.shareableResources,
    props.isAggregation = isAggregation
    props.addedItem = this.state.addedItem

    return   <MessageRow {...props} />
  }
  addedMessage(text) {
    Actions.list({
      modelName: this.props.modelName,
      to: this.props.resource,
      context: this.state.allContexts ? null : this.state.context,
      limit: this.state.list ? this.state.list.length + 1 : LIMIT
    });
  }

  componentDidUpdate() {
    clearTimeout(this._scrollTimeout)
    if (this.state.allLoaded  ||  this.state.noScroll)
      this.state.noScroll = false
    else
      this._scrollTimeout = setTimeout(() => {
        // inspired by http://stackoverflow.com/a/34838513/1385109
        this._GiftedMessenger  &&  this._GiftedMessenger.scrollToBottom()
      }, 200)
  }

  render() {
    // currentMessageTime = null;
    var content;

    var model = utils.getModel(this.props.modelName).value;
    var resource = this.props.resource
                    // <Text style={{fontSize: 17, alignSelf: 'center', color: '#ffffff'}}>{'Sending...'}</Text>
    // var isVisible = this.state.sendStatus  &&  this.state.sendStatus !== null
    // var spinner = isVisible
    //             ? <Text style={{alignSelf: 'flex-end', fontSize: 14, color: '#757575', marginHorizontal: 15}}>{thus.state.sendStatus}</Text>
    //             : <View/>
    // var spinner = <LoadingOverlay isVisible={isVisible} onDismiss={() => {this.setState({isVisible:false})}} position="bottom">
    //                 <TouchableOpacity onPress={() => { Alert.alert('Pressed on text!') }}>
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
      if (this.props.navigator.isConnected  &&  resource[constants.TYPE] === constants.TYPES.ORGANIZATION) {
        if (this.state.isLoading) {
          var menuBtn = this.hasMenuButton() && (
            <View style={styles.footer}>
              {this.paintMenuButton()}
            </View>
          )

          content = <View style={{flex: 1}}>
                      <View style={[platformStyles.container, bgStyle]}>
                        <Text style={{fontSize: 17, alignSelf: 'center', marginTop: 80, color: '#629BCA'}}>{'Loading...'}</Text>
                        <ActivityIndicator size='large' style={{alignSelf: 'center', marginTop: 20}} />
                      </View>
                      {menuBtn}
                    </View>
        }
      }
      else {
        // if (!this.state.isLoading  &&  !this.props.navigator.isConnected) {
        //   alert = (resource[constants.TYPE] === constants.TYPES.ORGANIZATION)
        //         ? Alert.alert(translate('noConnectionForPL', resource.name))
        //         : Alert.alert(translate('noConnection'))
        // }
        // content =  <NoResources
        //             filter={this.state.filter}
        //             model={model}
        //             isLoading={this.state.isLoading}/>
      }
    }

    if (!content) {
      var isAllMessages = model.isInterface  &&  model.id === constants.TYPES.MESSAGE;

      let hideTextInput = resource[constants.TYPE] === PRODUCT_APPLICATION  && utils.isReadOnlyChat(resource)
      let h = utils.dimensions(MessageList).height
      var maxHeight = h - (Platform.OS === 'android' ? 77 : 64)
      if (!this.state.isConnected || (resource[constants.TYPE] === constants.TYPES.ORGANIZATION  &&  !resource._online))
        maxHeight -=  35
      if (this.state.context)
        maxHeight -= 45
      if (hideTextInput)
        maxHeight -= 10
      // content = <GiftedMessenger style={{paddingHorizontal: 10, marginBottom: Platform.OS === 'android' ? 0 : 20}} //, marginTop: Platform.OS === 'android' ?  0 : -5}}
      // Hide TextInput for shared context since it is read-only
      content = <GiftedMessenger style={{paddingHorizontal: 10}} //, marginTop: Platform.OS === 'android' ?  0 : -5}}
        ref={(c) => this._GiftedMessenger = c}
        loadEarlierMessagesButton={this.state.loadEarlierMessages}
        onLoadEarlierMessages={this.onLoadEarlierMessages.bind(this)}
        messages={this.state.list}
        messageSent={this.state.sendResource}
        messageSentStatus={this.state.sendStatus}
        addedItem={this.state.addedItem}
        enableEmptySections={true}
        autoFocus={false}
        textRef={'chat'}
        renderCustomMessage={this.renderRow.bind(this)}
        handleSend={this.onSubmitEditing.bind(this)}
        submitOnReturn={true}
        underlineColorAndroid='transparent'
        menu={this.generateMenu.bind(this)}
        keyboardShouldPersistTaps={utils.isWeb() ? false : true}
        keyboardDismissMode={utils.isWeb() ? 'none' : 'on-drag'}
        maxHeight={maxHeight} // 64 for the navBar; 110 - with SearchBar
        hideTextInput={hideTextInput}
      />
        // returnKeyType={false}
        // keyboardShouldPersistTaps={false}
        // keyboardDismissMode='none'
    }

    // var addNew = (model.isInterface)
    //        ? <AddNewMessage navigator={this.props.navigator}
    //                         resource={resource}
    //                         modelName={this.props.modelName}
    //                         onAddNewPressed={this.onAddNewPressed.bind(this)}
    //                         onMenu={this.showMenu.bind(this)}
    //                         onPhotoSelect={this.onPhotoSelect.bind(this)}
    //                         callback={this.addedMessage.bind(this)} />
    //        : <View/>;
                            // onTakePicPressed={this.onTakePicPressed.bind(this)}
    var isOrg = !this.props.isAggregation  &&  resource  &&  resource[constants.TYPE] === constants.TYPES.ORGANIZATION
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
    if (!this.state.allLoaded  && !this.props.navigator.isConnected  &&  this.state.isForgetting)
      Alert.alert(translate('noConnectionWillProcessLater'))
          // <View style={{flex: 10}}>
          //   <SearchBar
          //     onChangeText={this.onSearchChange.bind(this)}
          //     placeholder='Search'
          //     showsCancelButton={false}
          //     hideBackground={true} />
          // </View>
    // if (this.state.isEmployee) {
      // let buttons = {[
      //   {
      //     onPress: this.chooseFormForCustomer.bind(this)
      //     title: translate('formChooser')
      //   }
      // ]}
    let me = utils.getMe()
    let actionSheet = this.renderActionSheet()
    return (
      <PageView style={[platformStyles.container, bgStyle]}>
        <NetworkInfoProvider connected={this.state.isConnected} resource={resource} online={this.state.onlineStatus} />
        <ChatContext chat={resource} context={this.state.context} contextChooser={this.contextChooser.bind(this)} shareWith={this.shareWith.bind(this)} bankStyle={this.props.bankStyle} allContexts={this.state.allContexts} />
        <View style={ sepStyle } />
        {content}
        {actionSheet}
        {alert}
      </PageView>
    );
        // {addNew}
  }

  hasMenuButton() {
    return !!this.getActionSheetItems()
  }

  getActionSheetItems() {
    let buttons = []
    let isOrg = this.props.resource[constants.TYPE] === constants.TYPES.ORGANIZATION
    let cancelIndex = 1
    if (this.state.isEmployee  &&  !isOrg) {
      cancelIndex++
      buttons.push({
        index: 0,
        title: translate('formChooser'),
        callback: () => this.chooseFormForCustomer()
      })
    }
    else {
      if (!this.state.isEmployee) {
        cancelIndex++
        buttons.push({
          index: 0,
          title: translate('applyForProduct'),
          callback: () => this.onChooseProduct()
        })
      }
      if (ENV.allowForgetMe) {
        cancelIndex++
        buttons.push({
          index: 1,
          title: translate('forgetMe'),
          callback: () => this.forgetMe()
        })
      }
    }

    buttons.push({
      index: cancelIndex,
      title: translate('cancel'),
      callback: () => {}
    })
    return buttons
  }

  renderActionSheet() {
    const buttons = this.getActionSheetItems()
    if (!buttons) return
    let titles = buttons.map((b) => b.title)
    return (
      <ActionSheet
        ref={(o) => {
          this.ActionSheet = o
        }}
        options={titles}
        cancelButtonIndex={buttons.length - 1}
        onPress={(index) => {
          buttons[index].callback()
        }}
      />
    )
  }

  // Context chooser shows all the context of the particular chat.
  // When choosing the context chat will show only the messages in linked to this context.
  contextChooser(context) {
    let name = this.props.resource[constants.TYPE] === constants.TYPES.PROFILE ? this.props.resource.formatted : this.props.resource.name
    this.props.navigator.push({
      title: translate('contextsFor') + ' ' + name,
      id: 23,
      component: ContextChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource: this.props.resource,
        // bankStyle: this.props.bankStyle,
        selectContext: this.selectContext.bind(this)
      },
    })
  }
  // Select context to filter messages for the particular context
  selectContext(context) {
    this.props.navigator.pop()
    Actions.list({
      modelName: this.props.modelName,
      to: this.props.resource,
      context: context,
      limit: context ? 300 : LIMIT
    })
    this.setState({context: context, allContexts: context == null})
  }
  // Show chooser of the organizations to share context with
  shareWith() {
    this.props.navigator.push({
      title: translate(utils.getModel(this.state.context.product).value),
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      rightButtonTitle: 'Share',
      passProps: {
        modelName: constants.TYPES.ORGANIZATION,
        multiChooser: true,
        sharingChat: this.props.resource,
        onDone: this.shareContext.bind(this)
      }
    });
  }
  shareContext(orgs) {
    delete orgs[utils.getId(this.props.resource)]
    Alert.alert(
      translate('shareContext', utils.getModel(this.state.context.product).value.title),
      translate('shareAllPastAndFutureMessages'),
      [
        {text: translate('cancel'), onPress: () => console.log('Cancel')},
        {text: 'OK', onPress: () => {
          Actions.share(this.state.context, Object.keys(orgs), this.props.resource)
          this.props.navigator.pop()
        }}
      ]
    )
  }
  generateMenu(show) {
    if (!show || !this.ActionSheet)
      return <View/>
    // {
    //   return <TouchableHighlight underlayColor='transparent' onPress={this.onSubmitEditing.bind(this)}>
    //            <View style={[platformStyles.menuButton, {backgroundColor: LINK_COLOR,}]}>
    //              <Icon name='ios-send'  size={33}  color='#ffffff' />
    //            </View>
    //         </TouchableHighlight>
    // }
    return  <TouchableHighlight underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
              {this.paintMenuButton()}
            </TouchableHighlight>
  }

  paintMenuButton() {
    return  <View style={[platformStyles.menuButtonNarrow, {opacity: 0.5}]}>
              <Icon name={MenuIcon.name}  size={33}  color={MenuIcon.color} />
            </View>
  }

  onLoadEarlierMessages(oldestMessage = {}, callback = () => {}) {
    this.state.loadEarlierMessages = true
    // Your logic here
    // Eg: Retrieve old messages from your server

    // newest messages have to be at the begining of the array
    var list = this.state.list;
    var id = utils.getId(list[0])
    Actions.list({
      lastId: id,
      limit: LIMIT,
      loadEarlierMessages: true,
      context: this.state.allContexts ? null : this.state.context,
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
    if (!this.state.context) {
      Alert.alert(translate('formListError'), translate('formListErrorDescription'))
      return
    }
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var resource = this.props.resource
    this.setState({show: false})
    this.props.navigator.push({
      title: translate(utils.getModel(constants.TYPES.FORM).value),
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback: this.props.callback,
        type: constants.TYPES.FORM,
        context: this.state.context
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
  onChooseProduct() {
    if (this.props.isAggregation)
      return
    var modelName = constants.TYPES.MESSAGE
    var model = utils.getModel(modelName).value;
    var isInterface = model.isInterface;
    if (!isInterface)
      return;

    var resource = this.props.resource
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate('iNeed'), //I need...',
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        products: this.props.resource.list,
        callback: this.props.callback,
        bankStyle: this.props.bankStyle
      },
    });
  }

  forgetMe() {
    var resource = this.props.resource
    this.setState({show: false})
    Alert.alert(
      translate('confirmForgetMe', utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties)), //Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties) + '\' to forget you',
      translate('testForgetMe'), //'This is a test mechanism to reset all communications with this provider',
      [
        {text: translate('cancel'), onPress: () => console.log('Cancel')},
        {text: 'OK', onPress: () => {
          this.state.isForgetting = true
          Actions.forgetMe(resource)
        }},
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
      backButtonTitle: 'Back',
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
        backButtonTitle: 'Back',
        // titleTextColor: '#999999',
        rightButtonTitle: 'Done',
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
      backButtonTitle: 'Back',
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
      }],
      _context: this.state.context
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
      _context: this.state.context
    }
    value[constants.TYPE] = modelName;
    this.setState({userInput: '', selectedAssets: {}});
    if (this.state.clearCallback)
      this.state.clearCallback();
    Actions.addMessage(value);
  }

}
reactMixin(MessageList.prototype, Reflux.ListenerMixin);
MessageList = makeResponsive(MessageList)

var styles = StyleSheet.create({
  imageOutline: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderColor: '#aaaaaa',
    paddingLeft: 6,
    borderWidth: 1,
    color: '#79AAF2'
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    height: 45,
    // width: Dimensions.get('window').width,
    backgroundColor: '#eeeeee',
    borderColor: '#eeeeee',
    borderWidth: 1,
    borderTopColor: '#cccccc',
    paddingRight: 10
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
  // showEmployeeMenu() {
  //   // var buttons = ['Talk to representative', 'Forget me', 'Cancel']
  //   var buttons = [translate('formChooser'), translate('cancel')] // ['Forget me', 'Cancel']
  //   var self = this;

  //   ActionSheetIOS.showActionSheetWithOptions({
  //     options: buttons,
  //     cancelButtonIndex: 1
  //   }, function(buttonIndex) {
  //     switch (buttonIndex) {
  //     // case 0:
  //     //   Actions.talkToRepresentative(self.props.resource)
  //     //   break
  //     case 0:
  //       self.chooseFormForCustomer()
  //       break;
  //     default:
  //       return
  //     }
  //   });
  // }
  // showMenu() {
  //   // var buttons = ['Talk to representative', 'Forget me', 'Cancel']
  //   var self = this;
  //   ActionSheetIOS.showActionSheetWithOptions({
  //     options: buttons,
  //     cancelButtonIndex: 1
  //   }, function(buttonIndex) {
  //     switch (buttonIndex) {
  //     // case 0:
  //     //   Actions.talkToRepresentative(self.props.resource)
  //     //   break
  //     case 0:
  //       self.forgetMe()
  //       break;
  //     default:
  //       return
  //     }
  //   });
  // }
      // 'Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[constants.TYPE]).value.properties) + '\' to forget you',
*/
