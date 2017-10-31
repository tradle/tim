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
const clone = require('clone')

import ActionSheet from 'react-native-actionsheet'
import { makeResponsive } from 'react-native-orient'
import { makeStylish } from './makeStylish'

// var AddNewMessage = require('./AddNewMessage')
// var SearchBar = require('react-native-search-bar')
// var ResourceTypesScreen = require('./ResourceTypesScreen')

var LINK_COLOR
var LIMIT = 500
const { TYPE, TYPES, ROOT_HASH, CUR_HASH, PREV_HASH } = constants
const { PROFILE, VERIFICATION, ORGANIZATION, SIMPLE_MESSAGE, MESSAGE, FORM, FINANCIAL_PRODUCT } = TYPES
const MY_PRODUCT = 'tradle.MyProduct'
const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'
const CONFIRM_PACKAGE_REQUEST = "tradle.ConfirmPackageRequest"
const REMEDIATION = 'tradle.Remediation'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const CONTEXT = 'tradle.Context'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
var StyleSheet = require('../StyleSheet')

import React, { Component } from 'react'
import {
  // ListView,
  // StyleSheet,
  PropTypes,
  Image,
  Navigator,
  Platform,
  PixelRatio,
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
      isEmployee:  props.resource  &&  utils.isEmployee(props.resource),
      filter: props.filter,
      userInput: '',
      list: [],
      hasProducts: this.hasProducts(props.resource),
      allLoaded: false
    }
  }
  hasChatContext() {
    let { resource, allContexts } = this.props
    let application = this.state.application || this.props.application
    let context = this.state.context || this.props.context  ||  (application && application._context)
    if (!context  ||  context.product === REMEDIATION)
      return false

    // HACK - needs rewrite
    let me = utils.getMe()
    if (me.isEmployee)  {
      if (application  &&  utils.isRM(application))
        return true
      let isChattingWithPerson = resource[TYPE] === PROFILE
      if (isChattingWithPerson  &&  !me.organization._canShareContext)
        return false
    }
    // end HACK
    // No need to show context if provider has only one product and no share context
    if ((!resource.products  ||  resource.products.length === 1)  &&  !resource._canShareContext)
      return false

    let isReadOnlyChat = utils.isReadOnlyChat(context)
    if (isReadOnlyChat  &&  resource._relationshipManager)
      return true
    if (allContexts || isReadOnlyChat)
      return false

    return true
  }
  componentWillMount() {
    let { navigator, modelName, resource, prop, context, search, isAggregation, application } = this.props
    let params = {
      modelName: modelName,
      to: resource,
      prop: prop,
      context: context,
      gatherForms: true,
      limit: LIMIT,
      search: search,
      isAggregation: isAggregation,
      application: application
    }

    StatusBar.setHidden(false);
    utils.onNextTransitionEnd(navigator, () => Actions.list(params));
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
    let {action, error, to, isConnected} = params
    if (error)
      return
    if (action === 'connectivity') {
      this.setState({isConnected: isConnected})
      return
    }
    let chatWith = this.props.resource
    if (to  &&  to[ROOT_HASH] !== chatWith[ROOT_HASH])
      return

    let { resource, online, productToForms, shareableResources } = params
    if (action === 'onlineStatus') {
      if (resource  &&  utils.getId(resource) == utils.getId(chatWith))
      // if (resource  &&  resource[ROOT_HASH] === this.props.resource[ROOT_HASH])
      //   state.resource = chatWith
      if (online !== this.state.onlineStatus)
        this.setState({onlineStatus: online})
      return
    }
    if (action === 'getItem'  &&  utils.getId(resource) === utils.getId(chatWith)) {
      this.setState({hasProducts: this.hasProducts(resource) })
      if (productToForms)
        this.setState({productToForms: productToForms})
      return
    }
    let { application, modelName, bankStyle, navigator, originatingMessage } = this.props

    if (action === 'assignRM_Confirmed') {
      if (application[ROOT_HASH] === params.application[ROOT_HASH]) {
        Actions.list({modelName: MESSAGE, application: params.application, search: true})
        let r = utils.clone(application)
        r.relationshipManager = params.application.relationshipManager
        this.setState({application: r})
      }
      return
    }
    let rtype = resource  &&  resource[TYPE]
    if (action === 'addItem'  ||  action === 'addVerification' ||  action === 'addMessage') {
      let rtype = resource[TYPE]
      if (!utils.isMessage(resource))
        return
      if (params.errorMsg) {
        Alert.alert(params.errorMsg)
        return
      }
      if (rtype === NEXT_FORM_REQUEST) {
        let list = this.state.list
        let r = list[list.length - 1]
        if (r[TYPE] === FORM_REQUEST  &&  r.form === resource.after) {
          // not fulfilled form request for multi-entry form will have it's own ID set
          // as fulfilled document
          if (!r._document || utils.getId(r) === r._document) {
            let l = clone(list)
            l.splice(l.length - 2 , 1)
            this.setState({list: l})
          }
        }
        return
      }

      let rid = utils.getId(chatWith)
      let isContext = utils.isContext(chatWith[TYPE])
      if (isContext) {
        if (!resource._context  ||  utils.getId(resource._context) !== utils.getId(chatWith))
          return
      }
      else if (chatWith[TYPE] !== PROFILE) {
        let fid = resource.from.organization &&  utils.getId(resource.from.organization)
        let tid = resource.to.organization && utils.getId(resource.to.organization)
        if (rid !== fid  &&  rid !== tid  &&  !to)
          return
      }

      let actionParams = {
        query: this.state.filter,
        modelName: modelName,
        to: chatWith,
        context: this.state.allContexts ? null : this.state.context,
        limit: this.state.list ? Math.max(this.state.list.length + 1, LIMIT) : LIMIT
      }
      // if (resource._sendStatus) {
      //   this.state.sendStatus = resource._sendStatus
      //   this.state.sendResource = resource
      // }
      // let addedItem
      let replace
      if (rtype === FORM_REQUEST            ||
          rtype === CONFIRM_PACKAGE_REQUEST ||
          rtype === FORM_ERROR              ||
          resource._denied                  ||
          resource._approved) {
        // addedItem = resource
        if (resource._documentCreated  ||  resource._denied  ||  resource._approved)
          replace = true
      }
      // else
      //   addedItem = null

      let list
      list = this.state.list || []
      if (replace) {
        let resourceId = utils.getId(resource)
        list = list.map((r) => utils.getId(r) === resourceId ? resource : r)
      }
      else {
        list = list.map((r) => r)
        list.push(resource)
      }
      let state = {
        // addedItem: addedItem,
        list: list
      }
      let currentContext
      if (utils.isContext(resource))
        currentContext = resource
      else if(rtype === FORM_REQUEST  ||  rtype === FORM_ERROR)
        currentContext = resource._context
      if (currentContext)
        state.currentContext = currentContext
      if (productToForms)
        state.productToForms = productToForms
      else if (utils.getModel(rtype).value.subClassOf === FORM  &&  resource._context) {
        let product = resource._context.product
        if (this.state.productToForms)
          productToForms = clone(this.state.productToForms)
        else
          productToForms = {}

        let l = productToForms[product]
        if (!l) {
          l = {}
          productToForms[product] = {}
        }
        let forms = l[rtype]

        if (!forms) {
          forms = []
          l[rtype] = forms
        }
        forms.push(utils.getId(resource))

        state.productToForms = productToForms
      }
      if (shareableResources)
        state.shareableResources = shareableResources
      this.setState(state)

      if (action === 'addVerification') {
        if (originatingMessage  &&  originatingMessage.verifiers)  {
          let docType = utils.getId(resource.document).split('_')[0]
          this.state.verifiedByTrustedProvider = originatingMessage.form === docType
                                               ? resource
                                               : null
        }
        else
          this.state.verifiedByTrustedProvider = null
      }
      // Actions.list(actionParams)
      return;
    }
    let { sendStatus, isAggregation, forgetMeFromCustomer, context, list, loadEarlierMessages } = params
    this.state.newItem = false
    if (action === 'updateItem') {
      let resourceId = utils.getId(resource)
      let replaced
      let list = this.state.list.map((r) => {
        if (utils.getId(r) === resourceId) {
          replaced = true
          return resource
        }
        else
          return r
      })
      if (!replaced  &&  to)
        list.push(resource)

      this.setState({
        list: list
      })
      return
    }
    if (isAggregation !== isAggregation)
      return
    if (action !== 'messageList')
      return

    if (forgetMeFromCustomer) {
      Actions.list({modelName: PROFILE})
      let routes = navigator.getCurrentRoutes()
      if (routes[routes.length - 1].component )
      navigator.popToRoute(routes[1])
      return
    }
    if (resource  &&  resource[ROOT_HASH] != chatWith[ROOT_HASH]) {
      let doUpdate
      if (chatWith[TYPE] === ORGANIZATION  &&  resource.organization) {
        if (utils.getId(chatWith) === utils.getId(resource.organization))
          doUpdate = true
      }
      if (!doUpdate)
        return;
    }
    if (loadEarlierMessages  &&  this.state.postLoad) {
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
        this.setState({
          list: list,
          noScroll: true,
          allLoaded: allLoaded,
          context: context,
          productToForms: this.state.productToForms,
          loadEarlierMessages: !allLoaded
        })
      }
      return
    }
    if (!list  &&  !forgetMeFromCustomer)
      return

    if (bankStyle   &&  params.bankStyle)
      extend(bankStyle, params.bankStyle)
    LINK_COLOR = bankStyle  &&  bankStyle.linkColor
    let isEmployee = utils.isEmployee(chatWith)
    if (list.length || (this.state.filter  &&  this.state.filter.length)) {
      let type = list[0][TYPE];
      if (type  !== modelName) {
        let model = utils.getModel(modelName).value;
        if (!model.isInterface)
          return;

        let rModel = utils.getModel(type).value;
        if (!rModel.interfaces  ||  rModel.interfaces.indexOf(modelName) === -1)
          return;
      }
      let me = utils.getMe()
      this.setState({
        // dataSource: this.state.dataSource.cloneWithRows(list),
        isLoading: false,
        list: list,
        shareableResources: shareableResources,
        allLoaded: false,
        // addedItem: this.state.addedItem,
        context: context,
        isEmployee: isEmployee,
        loadEarlierMessages: loadEarlierMessages,
        productToForms: productToForms || this.state.productToForms
      });
    }
    else
      this.setState({isLoading: false, isEmployee: isEmployee})
  }
  hasProducts(resource) {
    return resource.products && resource.products.length
  }
  shouldComponentUpdate(nextProps, nextState) {
    // Eliminating repeated alerts when connection returns after ForgetMe action
    if (!this.state.list  &&  !nextState.list)
      return false
    if (!this.state.list || !nextState.list)
      return true
    if (this.state.list.length !== nextState.list.length)
      return true
    if (utils.resized(this.props, nextProps))
      return true
    if (nextState.isConnected !== this.state.isConnected  &&  this.state.isLoading === nextState.isLoading)
      return true
    // if (!this.state.isConnected && !this.state.list  && !nextState.list && this.state.isLoading === nextState.isLoading)
    //   return false
    // undefined - is not yet checked
    if (typeof this.state.onlineStatus !== 'undefined') {
      if (nextState.onlineStatus !== this.state.onlineStatus)
        return true
    }
    if (this.state.currentContext !== nextState.currentContext)
      return true
    if (this.state.context !== nextState.context) {
      if (!this.state.context  ||  !nextState.context)
        return true
      if (utils.getId(this.state.context)  !==  utils.getId(nextState.context))
        return true
    }
    if (this.state.allContexts !== nextState.allContexts)
      return true
    if (this.state.hasProducts !== nextState.hasProducts)
      return true

    if (nextState.productToForms) {
      if (!this.state.productToForms)
        return true
      let thisKeys = Object.keys(this.state.productToForms)
      let nextKeys = Object.keys(nextState.productToForms)
      if (thisKeys.length !== nextKeys.length)
        return true

      let keys = thisKeys.filter((key) => nextKeys.indexOf(key) === -1)
      if (keys && keys.length)
        return true

    }


    if (this.props.bankStyle !== nextProps.bankStyle)
      return true
    // if (nextState.addedItem  &&  this.state.addedItem !== nextState.addedItem)
    //   return true
    if (utils.resized(this.props, nextProps)           ||
        this.state.allLoaded !== nextState.allLoaded)
      return true
         // this.state.sendStatus !== nextState.sendStatus   ||)
         // this.state.sendResource  &&  this.state.sendResource[ROOT_HASH] === nextState.sendResource[ROOT_HASH]))

    // if (this.state.sendResource  &&  this.state.sendResource[ROOT_HASH] === nextState.sendResource[ROOT_HASH]  &&
    //     this.state.sendStatus !== nextState.sendStatus)
    //   return true
    for (let i=0; i<this.state.list.length; i++) {
      let r = this.state.list[i]
      let nr = nextState.list[i]
      if (r[TYPE] !== nr[TYPE]            ||
          r[ROOT_HASH] !== nr[ROOT_HASH]  ||
          r[CUR_HASH] !== nr[CUR_HASH]    ||
          r._sendStatus !== nr._sendStatus)
        return true
    }
    return false
  }
  share(resource, to, formRequest) {
    Actions.share(resource, to, formRequest) // forRequest - originating message
  }

  selectResource(r, verification) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    if (!r[TYPE])
      return;
    let { application } = this.props
    let me = utils.getMe()
    if (application) {
      if (!application.relationshipManager)
        return
      let relHash = utils.getId(application.relationshipManager).split('_')[1]
      if (relHash !== me[ROOT_HASH])
        return
    }
    let model = utils.getModel(r[TYPE]).value;
    let title //utils.getDisplayName(resource, model.properties);

    if (r[TYPE] === VERIFICATION) {
      let type = utils.getType(r.document)
      if (type)
        title = translate(utils.getModel(type).value)
    }
    if (!title)
      title = translate(model) //translate(utils.makeModelTitle(model))

    let newTitle = title;
    // Check if I am a customer or a verifier and if I already verified this resource
    let isVerifier = application ? utils.isRM(application) : !verification && utils.isVerifier(r)
    let { resource, bankStyle, currency, country } = this.props
    let isEmployee = utils.isEmployee(resource)
    let route = {
      title: newTitle,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      parentMeta: model,
      passProps: {
        bankStyle: bankStyle,
        resource: r,
        application: application,
        currency: resource.currency || currency,
        country: resource.country,
        verification: verification,
        isVerifier: isVerifier
      }
    }
    let showEdit = !isEmployee && !verification  &&  !r[PREV_HASH]  &&  model.subClassOf !== MY_PRODUCT  &&  !model.notEditable
    // if (showEdit  &&  isEmployee) {
    //   let rm
    //   if (!application  ||  !(rm = application.relationshipManager))
    //     showEdit = false
    //   else if (utils.getId(rm) !== utils.getId(utils.getMe()))
    //     showEdit = false
    // }

    // Allow to edit resource that was not previously changed
    if (showEdit) {
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
          resource: r,
          currency: resource.currency || this.props.currency,
          country: resource.country,
          chat: resource,
          bankStyle: bankStyle
        }
      }
    }
    if (isVerifier) {
      route.rightButtonTitle = 'Done' //ribbon-b|ios-close'
      route.help = translate('verifierHelp')  // will show in alert when clicked on help icon in navbar
      route.application = application
    }

    this.props.navigator.push(route);
  }

  onSearchChange(text) {
    let actionParams = {
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
    let model = utils.getModel(resource[TYPE] || resource.id).value;
    let isAggregation = this.props.isAggregation;
    let me = utils.getMe();
    // let MessageRow = require('./MessageRow');
    let previousMessageTime = currentMessageTime;
    let isProductApplication = utils.isContext(model)
    currentMessageTime = resource.time;
    let props = {
      onSelect: this.selectResource.bind(this),
      resource: resource,
      bankStyle: this.props.bankStyle,
      context: this.state.context ||  (isProductApplication && this.props.resource),
      application: this.props.application,
      to: isAggregation ? resource.to : this.props.resource,
      navigator: this.props.navigator,
      switchChat: isProductApplication ? this.switchChat.bind(this, resource) : null
    }
    if (model.subClassOf === 'tradle.MyProduct')
      return  <MyProductMessageRow {...props} />

      // messageNumber: rowId,
    // let sendStatus = this.state.sendStatus &&  this.state.sendResource[ROOT_HASH] === resource[ROOT_HASH]
    //                ? this.state.sendStatus : (resource._sendStatus === 'Sent' ? null : resource._sendStatus)
    let moreProps = {
      share: this.share.bind(this),
      // sendStatus: sendStatus,
      currency: this.props.resource.currency || this.props.currency,
      country: this.props.resource.country,
      defaultPropertyValues: this.props.resource._defaultPropertyValues,
      previousMessageTime: previousMessageTime,
    }

    props = extend(props, moreProps)
    if (model.id === VERIFICATION) {
      if (this.state.verifiedByTrustedProvider  &&  this.state.verifiedByTrustedProvider[ROOT_HASH] === resource[ROOT_HASH]) {
        props.shareWithRequestedParty = this.props.originatingMessage.from
        props.originatingMessage = this.props.originatingMessage
      }
      return  <VerificationMessageRow {...props} />
    }

    if (model.subClassOf === FORM)
      return <FormMessageRow {...props} />

    props.isLast = rowId === this.state.list.length - 1
    props.productToForms = this.state.productToForms
    props.shareableResources = this.state.shareableResources
    props.isAggregation = isAggregation
    // props.addedItem = this.state.addedItem
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
    let { modelName, resource, bankStyle, navigator, originatingMessage, isAggregation } = this.props
    let application = this.state.application ||  this.props.application
    let model = utils.getModel(modelName).value;
    let bgImage = bankStyle &&  bankStyle.backgroundImage && bankStyle.backgroundImage.url
    let bgStyle = {}
    if (!bgImage  &&  bankStyle.backgroundColor)
      bgStyle = {backgroundColor: bankStyle.backgroundColor}
    let alert = <View />
    let hideTextInput
    if (modelName === ORGANIZATION)
      hideTextInput = !utils.hasSupportLine(resource)
    else if (application)
      hideTextInput = !utils.isRM(application)
      // hideTextInput = !application.relationshipManager  ||  utils.getId(application.relationshipManager) !== utils.getId(utils.getMe())
    // HACK for RM
    // hideTextInput = false
    let content
    if (!this.state.list || !this.state.list.length) {
      if (navigator.isConnected  &&  resource[TYPE] === ORGANIZATION || application) {
        if (this.state.isLoading) {
          let menuBtn = !hideTextInput /*this.hasMenuButton() */ && (
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
    }
    let isProductApplication = utils.isContext(resource[TYPE])
    if (!content) {
      let isAllMessages = model.isInterface  &&  model.id === MESSAGE;

      let h = utils.dimensions(MessageList).height
      let maxHeight = h - NAV_BAR_HEIGHT
      // Chooser for trusted party verifier
      let isChooser = originatingMessage && originatingMessage.verifiers
      let notRemediation = (this.state.context  &&  this.state.context.product !== REMEDIATION) ||
                           (isProductApplication && resource.product !== REMEDIATION)
      let me = utils.getMe()
      if (me.isEmployee);
      else if (this.hasChatContext())
        maxHeight -= 45
      else if (notRemediation &&  !isChooser  &&  (!this.state.isConnected  ||  (!isProductApplication  &&  this.state.onlineStatus === false))) //  || (resource[TYPE] === ORGANIZATION  &&  !resource._online)))
        maxHeight -= 35
      // if (notRemediation  &&  !hideTextInput) //  &&  resource.products) //  &&  resource.products.length > 1))
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
        // messageSent={this.state.sendResource}
        // messageSentStatus={this.state.sendStatus}
        // addedItem={this.state.addedItem}
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
        styles={
          {
            textInputContainer: styles.textInputContainer
          }
        }
      />
    }

    let isOrg = !isAggregation  &&  resource  &&  resource[TYPE] === ORGANIZATION
    let chooser
    if (isOrg)
      chooser =  <View style={{flex:1, marginTop: 8}}>
                  <TouchableHighlight underlayColor='transparent' onPress={this.onAddNewPressed.bind(this, true)}>
                    <Icon name={'ios-arrow-round-down'} size={25} style={styles.imageOutline} />
                  </TouchableHighlight>
                </View>
    else
      chooser = <View/>

    // let sepStyle = { height: 1,backgroundColor: LINK_COLOR }
    let sepStyle = { height: 1,backgroundColor: 'transparent' }
    if (!this.state.allLoaded  && !navigator.isConnected  &&  this.state.isForgetting)
      Alert.alert(translate('noConnectionWillProcessLater'))
    let me = utils.getMe()
    let actionSheet = !hideTextInput  && this.renderActionSheet()
    let context = this.state.context
    let network
    if (originatingMessage)
       network = <NetworkInfoProvider connected={this.state.isConnected} resource={resource} online={this.state.onlineStatus} />
    if (!context  &&  isProductApplication)
      context = resource
    let separator = utils.getContentSeparator(bankStyle)
    if (!bgImage)
      return (
        <PageView style={[platformStyles.container, bgStyle]} separator={separator}>
          {network}
          <ProgressInfo recipient={resource[ROOT_HASH]} />
          <ChatContext chat={resource} context={context} contextChooser={this.contextChooser.bind(this)} shareWith={this.shareWith.bind(this)} bankStyle={bankStyle} allContexts={this.state.allContexts} />
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
          <ChatContext chat={resource} context={context} contextChooser={this.contextChooser.bind(this)} shareWith={this.shareWith.bind(this)} bankStyle={bankStyle} allContexts={this.state.allContexts} />
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
      let isOrg = this.props.resource[TYPE] === ORGANIZATION
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
        modelName: ORGANIZATION,
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
        modelName: ORGANIZATION,
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
    let list = this.state.list;
    let id = list.length  &&  utils.getId(list[0])
    Actions.list({
      lastId: id,
      limit: LIMIT,
      loadEarlierMessages: true,
      context: this.state.allContexts ? null : this.state.context,
      modelName: this.props.modelName,
      to: this.props.resource,
    })
    let earlierMessages = []
    this.state.postLoad = callback
  }
  checkStart(evt) {
    evt = evt
  }

  chooseFormForCustomer() {
    if (!this.state.context) {
      Alert.alert(translate('formListError'), translate('formListErrorDescription'))
      return
    }
    let currentRoutes = this.props.navigator.getCurrentRoutes();
    let resource = this.props.resource
    this.setState({show: false})
    this.props.navigator.push({
      title: translate(utils.getModel(FORM).value),
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback: this.props.callback,
        type: FORM,
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
    let modelName = MESSAGE
    let model = utils.getModel(modelName).value;
    let isInterface = model.isInterface;
    if (!isInterface)
      return;

    let resource = this.props.resource
    let currentRoutes = this.props.navigator.getCurrentRoutes();
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
    let resource = this.props.resource
    this.setState({show: false})
    Alert.alert(
      translate('confirmForgetMe', utils.getDisplayName(resource)),
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
    let { modelName, resource, navigator, callback } = this.props
    let model = utils.getModel(modelName).value;
    let isInterface = model.isInterface;
    if (!isInterface)
      return;

    let currentRoutes = navigator.getCurrentRoutes();
    navigator.push({
      title: translate(utils.getModel(FINANCIAL_PRODUCT).value),
      id: 15,
      component: ProductChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback: callback,
        type: PRODUCT_REQUEST
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
          country: resource.country,
          // callback: this.modelAdded.bind(this)
        }
      }
    });
  }
  onSubmitEditing(msg) {
    let me = utils.getMe();
    let { resource, application, modelName } = this.props

    let model = utils.getModel(modelName).value;

    let toName = utils.getDisplayName(resource);
    let meName = utils.getDisplayName(me);
    let value = {
      [TYPE]: SIMPLE_MESSAGE,
      message: msg
              ?  model.isInterface ? msg : '[' + this.state.userInput + '](' + modelName + ')'
              : '',
      from: me,
      to: resource,
      _context: this.state.context || this.state.currentContext
    }
    this.setState({userInput: ''}) //, selectedAssets: {}});
    if (this.state.clearCallback)
      this.state.clearCallback();
    Actions.addMessage({msg: value, application: application});
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
        modelName: MESSAGE,
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
  textInputContainer: {
    backgroundColor: '#ffffff',
    height: 45,
    borderTopWidth: Platform.OS === 'android' ? 1 : 1 / PixelRatio.get(),
    borderColor: '#b2b2b2',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
  }
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
