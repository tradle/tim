'use strict';

var MessageView = require('./MessageView')
var MessageRow = require('./MessageRow')
var MyProductMessageRow = require('./MyProductMessageRow')
var VerificationMessageRow = require('./VerificationMessageRow')
var FormMessageRow = require('./FormMessageRow')
var FormRequestRow = require('./FormRequestRow')
var FormErrorRow = require('./FormErrorRow')
var NoResources = require('./NoResources')
var NewResource = require('./NewResource')
var ProductChooser = require('./ProductChooser')
var VerifierChooser = require('./VerifierChooser')
var ResourceList = require('./ResourceList')
var ChatContext = require('./ChatContext')
var ContextChooser = require('./ContextChooser')
import Icon from 'react-native-vector-icons/Ionicons'
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
var ProgressInfo = require('./ProgressInfo')
var PageView = require('./PageView')
var extend = require('extend');
var TimerMixin = require('react-timer-mixin')

import ActionSheet from 'react-native-actionsheet'
import { makeResponsive } from 'react-native-orient'
import { makeStylish } from './makeStylish'

// var AddNewMessage = require('./AddNewMessage')
// var SearchBar = require('react-native-search-bar')
// var ResourceTypesScreen = require('./ResourceTypesScreen')

var LINK_COLOR
var LIMIT = 500
var NEXT_HASH = '_n'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'
const MY_PRODUCT = 'tradle.MyProduct'
const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'
const CONFIRM_PACKAGE_REQUEST = "tradle.ConfirmPackageRequest"
const REMEDIATION = 'tradle.Remediation'
const ROOT_HASH = constants.ROOT_HASH
const CUR_HASH = constants.ROOT_CUR
const TYPE = constants.TYPE
const TYPES = constants.TYPES
const PROFILE = TYPES.PROFILE

var StyleSheet = require('../StyleSheet')

import React, { Component } from 'react'
import {
  // ListView,
  // StyleSheet,
  PropTypes,
  Image,
  Navigator,
  Platform,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  TouchableHighlight
} from 'react-native'

import ActivityIndicator from './ActivityIndicator'
import platformStyles, {MenuIcon} from '../styles/platform'
import ENV from '../utils/env'

const NAV_BAR_HEIGHT = ENV.navBarHeight
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
      // selectedAssets: {},
      isConnected: props.navigator.isConnected,
      // onlineStatus: props.resource._online,
      allContexts: true,  // true - for the full chat; false - filtered chat for specific context.
      isEmployee:  utils.isEmployee(props.resource),
      filter: props.filter,
      userInput: '',
      hasProducts: this.hasProducts(props.resource),
      allLoaded: false
    }
  }
  hasChatContext() {
    let context = this.state.context || this.props.context
    if (!context  ||  context.product === REMEDIATION)
      return false
    let me = utils.getMe()
    let chat = this.props.resource
    let isChattingWithPerson = chat[constants.TYPE] === PROFILE
    if (me.isEmployee) {
      if (isChattingWithPerson  &&  !me.organization._canShareContext)
        return false
    }
    // No need to show context if provider has only one product and no share context
    else if ((!chat.products  ||  chat.products.length === 1)  &&  !chat._canShareContext)
      return false

    let isReadOnlyChat = utils.isReadOnlyChat(context)
    if (isReadOnlyChat  &&  chat._relationshipManager)
      return true
    if (this.props.allContexts || isReadOnlyChat) //  ||  (!chat._canShareContext  &&  !isChattingWithPerson))
      return false

    return true
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

    StatusBar.setHidden(false);
    utils.onNextTransitionEnd(this.props.navigator, () => Actions.list(params));
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
    this._watchSubmit()
  }

  _watchSubmit() {
    const self = this
    if (!utils.isWeb() || !this._GiftedMessenger || !this._GiftedMessenger.refs.textInput) return

    const input = this._GiftedMessenger.refs.textInput.refs.input
    if (this._watchedInput === input) return

    this._watchedInput = input
    input.addEventListener('keydown', e => {
      if (!input.value) return

      const code = e.keyCode ? e.keyCode : e.which
      if (code == 13) { //Enter keycode
        this.onSubmitEditing(input.value)
        // yuckity yuck
        this._GiftedMessenger.setState({text:''})
      }
    })
  }
  onAction(params) {
    if (params.error)
      return

    let resource = this.props.resource
    if (params.action === 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }
    if (params.action === 'onlineStatus') {
      if (params.resource  &&  utils.getId(params.resource) == utils.getId(this.props.resource))
      // if (params.resource  &&  params.resource[constants.ROOT_HASH] === this.props.resource[ROOT_HASH])
      //   state.resource = resource
        this.setState({onlineStatus: params.online})
      return
    }
    if (params.to  &&  params.to[ROOT_HASH] !== resource[ROOT_HASH])
      return
    if (params.action === 'getItem'  &&  utils.getId(params.resource) === utils.getId(this.props.resource)) {
      this.setState({hasProducts: this.hasProducts(params.resource) })
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
      let rtype = params.resource[TYPE]
      if (params.resource._sendStatus) {
        this.state.sendStatus = params.resource._sendStatus
        this.state.sendResource = params.resource
      }
      else if (rtype === FORM_REQUEST  || rtype === FORM_REQUEST ||  rtype === CONFIRM_PACKAGE_REQUEST || rtype === FORM_ERROR)
        this.setState({addedItem: params.resource})
        // this.state.addedItem = params.resource
      else if (params.resource._denied || params.resource._approved)
        this.setState({addedItem: params.resource})
        // this.state.addedItem = params.resource
      else
        this.state.addedItem = null
      if (params.action === 'addVerification') {
        if (this.props.originatingMessage  &&  this.props.originatingMessage.verifiers)  {
          let docType = utils.getId(params.resource.document).split('_')[0]
          this.state.verifiedByTrustedProvider = this.props.originatingMessage.form === docType
                                               ? params.resource
                                               : null
        }
        else
          this.state.verifiedByTrustedProvider = null
      }

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
      Actions.list({modelName: PROFILE})
      let routes = this.props.navigator.getCurrentRoutes()
      if (routes[routes.length - 1].component )
      this.props.navigator.popToRoute(routes[1])
      return
    }
    if (params.resource  &&  params.resource[ROOT_HASH] != resource[ROOT_HASH]) {
      var doUpdate
      if (resource[TYPE] === TYPES.ORGANIZATION  &&  params.resource.organization) {
        if (resource[TYPE] + '_' + resource[ROOT_HASH] === utils.getId(params.resource.organization))
          doUpdate = true
      }
      if (!doUpdate)
        return;
    }
    var list = params.list;
    if (params.loadEarlierMessages  &&  this.state.postLoad) {
      if (!list || !list.length) {
        this.state.postLoad([], true)
        this.state = {
          allLoaded: true, isLoading: false, noScroll: true, loadEarlierMessages: false,
          ...this.state
        }
      }
      else {
        this.state.postLoad(list, false)
        let allLoaded = list.length < LIMIT
        this.state.list.forEach((r) => {
          list.push(r)
        })
        let productToForms = this.gatherForms(list)
        this.setState({
          list: list,
          noScroll: true,
          allLoaded: allLoaded,
          context: params.context,
          productToForms: productToForms,
          loadEarlierMessages: !allLoaded
        })
      }
      return
    }
    LINK_COLOR = this.props.bankStyle  &&  this.props.bankStyle.linkColor
    let isEmployee = utils.isEmployee(resource)
    if (list.length || (this.state.filter  &&  this.state.filter.length)) {
      let productToForms = this.gatherForms(list)

      var type = list[0][TYPE];
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
  hasProducts(resource) {
    return resource.products && resource.products.length
  }
  gatherForms(list) {
    let productToForms = {}
    list.forEach((r) => {
      if (r[TYPE] === FORM_REQUEST  &&  r.documentCreated  &&  r.document) {
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
    if (utils.resized(this.props, nextProps))
      return true
    if (nextState.isConnected !== this.state.isConnected)
      return true
    // undefined - is not yet checked
    if (typeof this.state.onlineStatus !== 'undefined') {
      if (nextState.onlineStatus !== this.state.onlineStatus)
        return true
    }
    if (this.state.context !== nextState.context || this.state.allContexts !== nextState.allContexts)
      return true
    if (this.state.hasProducts !== nextState.hasProducts)
      return true
    if (this.props.bankStyle !== nextProps.bankStyle)
      return true
    if (this.state.addedItem !== nextState.addedItem)
      return true
    // if (this.state.show !== nextState.show)
    //   return true
    if (!this.state.list                                  ||
        !nextState.list                                   ||
         this.props.orientation !== nextProps.orientation ||
         this.state.allLoaded !== nextState.allLoaded     ||
         // this.state.sendStatus !== nextState.sendStatus   ||
         this.state.list.length !== nextState.list.length)
         // this.state.sendResource  &&  this.state.sendResource[ROOT_HASH] === nextState.sendResource[ROOT_HASH]))
      return true

    if (this.state.sendResource  &&  this.state.sendResource[ROOT_HASH] === nextState.sendResource[ROOT_HASH]  &&
        this.state.sendStatus !== nextState.sendStatus)
      return true
    for (var i=0; i<this.state.list.length; i++) {
      let r = this.state.list[i]
      let nr = nextState.list[i]
      if (r[TYPE] !== nr[TYPE]            ||
          r[ROOT_HASH] !== nr[ROOT_HASH]  ||
          r[CUR_HASH] !== nr[CUR_HASH])
        return true
    }
    return false
  }
  share(resource, to, formRequest) {
    Actions.share(resource, to, formRequest) // forRequest - originating message
  }

  selectResource(resource, verification) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    if (!resource[TYPE])
      return;
    var model = utils.getModel(resource[TYPE]).value;
    var title //utils.getDisplayName(resource, model.properties);

    if (resource[TYPE] === constants.TYPES.VERIFICATION) {
      let type = utils.getType(resource.document)
      if (type)
        title = translate(utils.getModel(type).value)
    }
    if (!title)
      title = translate(model) //translate(utils.makeModelTitle(model))

    var newTitle = title;
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
        currency: this.props.resource.currency || this.props.currency,
        country: this.props.resource.country,
        verification: verification,
        // createFormError: isVerifier && !utils.isMyMessage(resource),
        isVerifier: isVerifier
      }
    }
    // Allow to edit resource that was not previously changed
    if (!verification  &&  !isEmployee  &&  !resource[NEXT_HASH]  &&  model.subClassOf !== MY_PRODUCT  &&  !model.notEditable) {
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
          currency: this.props.resource.currency || this.props.currency,
          country: this.props.resource.country,
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
    var model = utils.getModel(resource[TYPE] || resource.id).value;
    var isAggregation = this.props.isAggregation;
    var me = utils.getMe();
    // var MessageRow = require('./MessageRow');
    var previousMessageTime = currentMessageTime;
    var isProductApplication = this.props.resource[TYPE] === PRODUCT_APPLICATION
    currentMessageTime = resource.time;
    var props = {
      onSelect: this.selectResource.bind(this),
      resource: resource,
      bankStyle: this.props.bankStyle,
      context: this.state.context ||  (isProductApplication && this.props.resource),
      to: isAggregation ? resource.to : this.props.resource,
      navigator: this.props.navigator,
      switchChat: isProductApplication ? this.switchChat.bind(this, resource) : null
    }
    if (model.subClassOf === 'tradle.MyProduct')
      return  <MyProductMessageRow {...props} />

      // messageNumber: rowId,
    let sendStatus = this.state.sendStatus &&  this.state.sendResource[ROOT_HASH] === resource[ROOT_HASH]
                   ? this.state.sendStatus : (resource._sendStatus === 'Sent' ? null : resource._sendStatus)
    var moreProps = {
      share: this.share.bind(this),
      sendStatus: sendStatus,
      currency: this.props.resource.currency || this.props.currency,
      country: this.props.resource.country,
      defaultPropertyValues: this.props.resource._defaultPropertyValues,
      previousMessageTime: previousMessageTime,
    }

    props = extend(props, moreProps)
    if (model.id === TYPES.VERIFICATION) {
      if (this.state.verifiedByTrustedProvider  &&  this.state.verifiedByTrustedProvider[ROOT_HASH] === resource[ROOT_HASH]) {
        props.shareWithRequestedParty = this.props.originatingMessage.from
        props.originatingMessage = this.props.originatingMessage
      }
      return  <VerificationMessageRow {...props} />
    }

    if (model.subClassOf === TYPES.FORM)
      return <FormMessageRow {...props} />

    props.isLast = rowId === this.state.list.length - 1
    props.productToForms = this.state.productToForms
    props.shareableResources = this.state.shareableResources
    props.isAggregation = isAggregation
    props.addedItem = this.state.addedItem
    props.chooseTrustedProvider = this.chooseTrustedProvider

    if (model.id === FORM_ERROR)
       return <FormErrorRow {...props} />
    return model.id === FORM_REQUEST || model.id === CONFIRM_PACKAGE_REQUEST
           ? <FormRequestRow {...props} />
           : <MessageRow {...props} />
  }
  addedMessage(text) {
    Actions.list({
      modelName: this.props.modelName,
      to: this.props.resource,
      context: this.state.allContexts ? null : this.state.context,
      limit: this.state.list ? this.state.list.length + 1 : LIMIT
    });
  }

  componentWillUnmount() {
    clearTimeout(this._scrollTimeout)
  }

  componentDidUpdate() {
    clearTimeout(this._scrollTimeout)
    if (this.state.allLoaded  ||  this.state.noScroll)
      this.state.noScroll = false
    else {
      this._scrollTimeout = this.setTimeout(() => {
        // inspired by http://stackoverflow.com/a/34838513/1385109
        this._GiftedMessenger  &&  this._GiftedMessenger.scrollToBottom()
      }, 200)
    }

    this._watchSubmit()
  }

  render() {
    var content;

    var model = utils.getModel(this.props.modelName).value;
    var resource = this.props.resource
    let bankStyle = this.props.bankStyle
    var bgImage = bankStyle &&  bankStyle.backgroundImage && bankStyle.backgroundImage.url
    var bgStyle = {}
    if (!bgImage  &&  bankStyle.backgroundColor)
      bgStyle = {backgroundColor: this.props.bankStyle.backgroundColor}
    var alert = <View />
    let hideTextInput = !utils.hasSupportLine(resource)  // &&  !ENV.allowForgetMe

    if (!this.state.list || !this.state.list.length) {
      if (this.props.navigator.isConnected  &&  resource[TYPE] === TYPES.ORGANIZATION) {
        if (this.state.isLoading) {
          var menuBtn = !hideTextInput /*this.hasMenuButton() */ && (
            <View style={styles.footer}>
              {this.paintMenuButton()}
            </View>
          )

          content = <View style={{flex: 1}}>
                      <View style={[platformStyles.container, bgStyle]}>
                        <Text style={{fontSize: 17, alignSelf: 'center', marginTop: 80, color: '#629BCA'}}>{'Loading...'}</Text>
                        <ActivityIndicator size='large' style={{alignSelf: 'center', backgroundColor: 'transparent', marginTop: 20}} />
                      </View>
                      {menuBtn}
                    </View>
        }
      }
      else {
        // if (!this.state.isLoading  &&  !this.props.navigator.isConnected) {
        //   alert = (resource[TYPE] === TYPES.ORGANIZATION)
        //         ? Alert.alert(translate('noConnectionForPL', resource.name))
        //         : Alert.alert(translate('noConnection'))
        // }
        // content =  <NoResources
        //             filter={this.state.filter}
        //             model={model}
        //             isLoading={this.state.isLoading}/>
      }
    }

    let isProductApplication = resource[TYPE] === PRODUCT_APPLICATION
    if (!content) {
      var isAllMessages = model.isInterface  &&  model.id === TYPES.MESSAGE;

      let h = utils.dimensions(MessageList).height
      var maxHeight = h - NAV_BAR_HEIGHT
      // Chooser for trusted party verifier
      let isChooser = this.props.originatingMessage && this.props.originatingMessage.verifiers
      let notRemediation = (this.state.context   &&  this.state.context.product !== REMEDIATION) ||
                           (isProductApplication && resource.product !== REMEDIATION)

      if (this.hasChatContext())
        maxHeight -= 45
      else if (notRemediation &&  !isChooser  &&  (!this.state.isConnected  ||  (!isProductApplication  &&  this.state.onlineStatus === false))) //  || (resource[TYPE] === TYPES.ORGANIZATION  &&  !resource._online)))
        maxHeight -= 35
      // if (notRemediation  &&  !hideTextInput) //  &&  this.props.resource.products) //  &&  this.props.resource.products.length > 1))
      //   maxHeight -= 45
      // else if (ENV.allowForgetMe)
      //   maxHeight -= 45
      if (hideTextInput)
      //   maxHeight += 35
        maxHeight -= 10
      // content = <GiftedMessenger style={{paddingHorizontal: 10, marginBottom: Platform.OS === 'android' ? 0 : 20}} //, marginTop: Platform.OS === 'android' ?  0 : -5}}
      var marginLeft = 10
      // way ScrollView is implemented with position:absolute disrespects the confines of the screen width
      var marginRight = 10
      let width = utils.dimensions().width
      width = utils.getContentWidth(MessageList)
      let alignSelf = 'center'

      content = <GiftedMessenger style={{ marginLeft, marginRight, width, alignSelf }} //, marginTop: Platform.OS === 'android' ?  0 : -5}}
        ref={(c) => this._GiftedMessenger = c}
        loadEarlierMessagesButton={this.state.loadEarlierMessages}
        onLoadEarlierMessages={this.onLoadEarlierMessages.bind(this)}
        messages={this.state.list}
        messageSent={this.state.sendResource}
        messageSentStatus={this.state.sendStatus}
        addedItem={this.state.addedItem}
        customStyle={this.state.customStyle}
        enableEmptySections={true}
        autoFocus={false}
        textRef={'chat'}
        renderCustomMessage={this.renderRow.bind(this)}
        handleSend={this.onSubmitEditing.bind(this)}
        submitOnReturn={true}
        underlineColorAndroid='transparent'
        menu={this.generateMenu.bind(this)}
        keyboardShouldPersistTaps={utils.isWeb() ? 'never' : 'always'}
        keyboardDismissMode={utils.isWeb() ? 'none' : 'on-drag'}
        initialListSize={LIMIT}
        hideTextInput={hideTextInput}
        maxHeight={maxHeight} // 64 for the navBar; 110 - with SearchBar
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
    var isOrg = !this.props.isAggregation  &&  resource  &&  resource[TYPE] === TYPES.ORGANIZATION
    var chooser
    if (isOrg)
      chooser =  <View style={{flex:1, marginTop: 8}}>
                  <TouchableHighlight underlayColor='transparent' onPress={this.onAddNewPressed.bind(this, true)}>
                    <Icon name={'ios-arrow-round-down'} size={25} style={styles.imageOutline} />
                  </TouchableHighlight>
                </View>
    else
      chooser = <View/>

    // var sepStyle = { height: 1,backgroundColor: LINK_COLOR }
    var sepStyle = { height: 1,backgroundColor: 'transparent' }
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
    let actionSheet = !hideTextInput  && this.renderActionSheet()
    let context = this.state.context
    let network
    if (this.props.originatingMessage)
       network = <NetworkInfoProvider connected={this.state.isConnected} resource={resource} online={this.state.onlineStatus} />
    if (!context  &&  isProductApplication)
      context = this.props.resource
    let separator = utils.getContentSeparator(bankStyle)
    if (!bgImage)
      return (
        <PageView style={[platformStyles.container, bgStyle]} separator={separator}>
          {network}
          <ProgressInfo recipient={resource[ROOT_HASH]} />
          <ChatContext chat={resource} context={context} contextChooser={this.contextChooser.bind(this)} shareWith={this.shareWith.bind(this)} bankStyle={this.props.bankStyle} allContexts={this.state.allContexts} />
          <View style={ sepStyle } />
          {content}
          {actionSheet}
          {alert}
        </PageView>
    )
    let {width, height} = utils.dimensions(MessageList)
    let image = { width, height }

    return (
      <PageView style={[platformStyles.container, bgStyle]} separator={separator}>
        <Image source={{uri: bgImage}}  resizeMode='cover' style={image}>
          {network}
          <ProgressInfo recipient={resource[ROOT_HASH]} />
          <ChatContext chat={resource} context={context} contextChooser={this.contextChooser.bind(this)} shareWith={this.shareWith.bind(this)} bankStyle={this.props.bankStyle} allContexts={this.state.allContexts} />
          <View style={ sepStyle } />
          {content}
          {actionSheet}
          {alert}
        </Image>
      </PageView>
    );
  }

  hasMenuButton() {
    return !!this.getActionSheetItems()
  }

  getActionSheetItems() {
    let resource = this.props.resource
    let me = utils.getMe()
    let hasSupportLine = utils.hasSupportLine(resource)
    let buttons = []
    let cancelIndex = 1

    if (hasSupportLine) {
      let isOrg = this.props.resource[TYPE] === TYPES.ORGANIZATION
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
          if (this.state.hasProducts) {
            buttons.push({
              index: cancelIndex,
              title: translate('applyForProduct'),
              callback: () => this.onChooseProduct()
            })
            cancelIndex++
          }
        }
        if (ENV.allowForgetMe) {
          buttons.push({
            index: cancelIndex,
            title: translate('forgetMe'),
            callback: () => this.forgetMe()
          })
          cancelIndex++
        }
      }
    }
    else if (ENV.allowForgetMe) {
      buttons.push({
        index: cancelIndex,
        title: translate('forgetMe'),
        callback: () => this.forgetMe()
      })
      cancelIndex++

      if (this.state.hasProducts) {
        buttons.push({
          index: cancelIndex,
          title: translate('applyForProduct'),
          callback: () => this.onChooseProduct()
        })
        cancelIndex++
      }
    }
    else
      return


    buttons.push({
      index: cancelIndex,
      title: translate('cancel'),
      callback: () => {}
    })
    return buttons
  }

  renderActionSheet() {
    const buttons = this.getActionSheetItems()
    if (!buttons || !buttons.length) return
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
    let name = this.props.resource[TYPE] === PROFILE ? this.props.resource.formatted : this.props.resource.name
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
    let sharingChat
    let me = utils.getMe()
    if (me.organization) {
      if (utils.isEmployee(me))
        sharingChat = me.organization
    }
    else
      sharingChat = this.props.resource
    this.props.navigator.push({
      title: translate(utils.getModel(this.state.context.product).value),
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      rightButtonTitle: 'Share',
      passProps: {
        modelName: TYPES.ORGANIZATION,
        multiChooser: true,
        sharingChat: sharingChat,
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
  // Form request states taht the provider will be accepting verifications from one of the
  // listed providers
  chooseTrustedProvider(r, model, isMyMessage) {
    this.props.navigator.push({
      id: 25,
      title: translate('trustedProviders'),
      titleTextColor: this.props.bankStyle.verifiedBorderColor,
      backButtonTitle: 'Back',
      component: VerifierChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      // titleTextColor: '#7AAAC3',
      passProps:  {
        modelName: TYPES.ORGANIZATION,
        provider: this.props.to,
        bankStyle: this.props.bankStyle,
        originatingMessage: r,
        currency: this.props.bankStyle
      }
    });
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
    return  <TouchableOpacity underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
              {this.paintMenuButton()}
            </TouchableOpacity>
  }

  paintMenuButton() {
    return  <View style={[platformStyles.menuButtonNarrow, {width: 47, borderRadius: 24, alignItems: 'center', opacity: 0.4}]}>
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
      title: translate(utils.getModel(TYPES.FORM).value),
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback: this.props.callback,
        type: TYPES.FORM,
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
    var modelName = TYPES.MESSAGE
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
      translate('confirmForgetMe', utils.getDisplayName(resource, utils.getModel(resource[TYPE]).value.properties)), //Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[TYPE]).value.properties) + '\' to forget you',
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
      title: translate(utils.getModel(TYPES.FINANCIAL_PRODUCT).value),
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
          currency: this.props.resource.currency,
          country: this.props.resource.country,
          // callback: this.modelAdded.bind(this)
        }
      }
    });
  }
  onSubmitEditing(msg) {
    var me = utils.getMe();
    var resource = {from: utils.getMe(), to: this.props.resource};
    var model = utils.getModel(this.props.modelName).value;

    var toName = utils.getDisplayName(resource.to, utils.getModel(resource.to[TYPE]).value.properties);
    var meta = utils.getModel(me[TYPE]).value.properties;
    var meName = utils.getDisplayName(me, meta);
    var modelName = TYPES.SIMPLE_MESSAGE;
    var value = {
      message: msg
              ?  model.isInterface ? msg : '[' + this.state.userInput + '](' + this.props.modelName + ')'
              : '',
      from: me,
      to: resource.to,
      _context: this.state.context
    }
    value[TYPE] = modelName;
    this.setState({userInput: ''}) //, selectedAssets: {}});
    if (this.state.clearCallback)
      this.state.clearCallback();
    Actions.addMessage({msg: value});
  }
  switchChat(resource) {
    let to = resource.from.organization  ||  resource.from
    this.props.navigator.push({
      title: to.title,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: to,
        modelName: TYPES.MESSAGE,
        currency: this.props.currency,
        bankStyle:  this.props.bankStyle
      }
    })
  }
}
reactMixin(MessageList.prototype, Reflux.ListenerMixin);
reactMixin(MessageList.prototype, TimerMixin)
MessageList = makeResponsive(MessageList)
MessageList = makeStylish(MessageList)

var styles = StyleSheet.create({
  imageOutline: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderColor: '#aaaaaa',
    paddingLeft: 6,
    borderWidth: StyleSheet.hairlineWidth,
    color: '#79AAF2'
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    height: 45,
    // width: Dimensions.get('window').width,
    backgroundColor: '#eeeeee',
    // borderColor: '#eeeeee',
    borderTopWidth: StyleSheet.hairlineWidth,
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
      // 'Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[TYPE]).value.properties) + '\' to forget you',
*/
