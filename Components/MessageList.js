import React, { Component } from 'react'
import {
  ImageBackground,
  Platform,
  PixelRatio,
  View,
  // Text,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native'
import PropTypes from 'prop-types'

import _ from 'lodash'
import TimerMixin from 'react-timer-mixin'
import Reflux from 'reflux'
import GiftedMessenger from 'react-native-gifted-messenger'
import Icon from 'react-native-vector-icons/Ionicons'
import reactMixin from 'react-mixin'
import ActionSheet from 'react-native-actionsheet'
import { makeResponsive } from 'react-native-orient'
import debounce from 'debounce'

import constants from '@tradle/constants'

import { Text, setFontFamily } from './Text'
import Navigator from './Navigator'
import MessageView from './MessageView'
import MessageRow from './MessageRow'
import MyProductMessageRow from './MyProductMessageRow'
import VerificationMessageRow from './VerificationMessageRow'
import FormMessageRow from './FormMessageRow'
import FormRequestRow from './FormRequestRow'
import FormErrorRow from './FormErrorRow'
import TourRow from './TourRow'
import NewResource from './NewResource'
// import ProductChooser from './ProductChooser'
import StringChooser from './StringChooser'
import VerifierChooser from './VerifierChooser'
import ResourceList from './ResourceList'
import ChatContext from './ChatContext'
import ContextChooser from './ContextChooser'
import NewResourceMixin from './NewResourceMixin'
import utils, { translate, isIphone10orMore, isAndroid } from '../utils/utils'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import NetworkInfoProvider from './NetworkInfoProvider'
import ProgressInfo from './ProgressInfo'
import PageView from './PageView'
import { makeStylish } from './makeStylish'
import ActivityIndicator from './ActivityIndicator'
import platformStyles, {MenuIcon} from '../styles/platform'
import buttonStyles from '../styles/buttonStyles'
import ENV from '../utils/env'
import StyleSheet from '../StyleSheet'
import BackgroundImage from './BackgroundImage'
// import AddNewMessage from './AddNewMessage'
// import SearchBar from 'react-native-search-bar'
// import ResourceTypesScreen from './ResourceTypesScreen'

var LIMIT = 20
const { TYPE, TYPES, ROOT_HASH, CUR_HASH } = constants
const { PROFILE, VERIFICATION, ORGANIZATION, SIMPLE_MESSAGE, MESSAGE, FORM } = TYPES
const MY_PRODUCT = 'tradle.MyProduct'
const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'
const CONFIRM_PACKAGE_REQUEST = "tradle.ConfirmPackageRequest"
const REMEDIATION = 'tradle.Remediation'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const TOUR = 'tradle.Tour'
const REFRESH = 'tradle.Refresh'
const SELFIE = 'tradle.Selfie'

const NAV_BAR_HEIGHT = ENV.navBarHeight
var currentMessageTime

class MessageList extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string,
    resource: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    currentMessageTime = null;
    let { resource, filter, application, navigator } = props
    this.state = {
      isLoading: true,
      // selectedAssets: {},
      isConnected: navigator.isConnected,
      // onlineStatus: props.resource._online,
      allContexts: true,  // true - for the full chat; false - filtered chat for specific context.
      isEmployee:  resource  &&  utils.isEmployee(resource),
      filter: filter,
      userInput: '',
      list: [],
      limit: LIMIT,
      hasProducts: resource  &&  this.hasProducts(resource),
      allLoaded: false
    }
    if (application  &&  utils.isRM(application)) {
      let additionalForms = this.getAdditionalForms(application)
      if (additionalForms.length)
        this.state.additionalForms = additionalForms.map(f => ({id: f}))
    }
    this.onLoadEarlierMessages = debounce(this.onLoadEarlierMessages.bind(this), 200)
    this.shareWith = this.shareWith.bind(this)
    this.selectResource = this.selectResource.bind(this)
    this.contextChooser = this.contextChooser.bind(this)
    this.share = this.share.bind(this)
    this.renderRow = this.renderRow.bind(this)
    this.onSubmitEditing = this.onSubmitEditing.bind(this)
    this.generateMenu = this.generateMenu.bind(this)
    this.selectContext = this.selectContext.bind(this)
    this.shareContext = this.shareContext.bind(this)
  }
  hasChatContext() {
    let { resource, allContexts } = this.props
    let application = this.state.application || this.props.application
    let context = this.state.context || this.props.context  ||  (application && application._context) || this.state.currentContext
    if (!context)
      context = utils.isContext(resource)  &&  resource

    if (!context  ||  context.requestFor === REMEDIATION)
      return false

    // HACK - needs rewrite
    let me = utils.getMe()
    if (me.isEmployee)  {
      if (application  &&  utils.isRM(application))
        return true
      let isChattingWithPerson = utils.getType(resource) === PROFILE
      if (isChattingWithPerson  &&  !me.organization._canShareContext)
        return false
      return true
    }
    // end HACK
    // No need to show context if provider has only one product and no share context
    // if ((!resource.products  ||  resource.products.length === 1)  &&  !resource._canShareContext)
    //   return false
    if (resource._formsCount)
      return true
    let isReadOnlyChat = utils.isReadOnlyChat(context)
    if (isReadOnlyChat  &&  resource._relationshipManager)
      return true
    if (allContexts || isReadOnlyChat)
      return false

    return true
  }
  componentWillMount() {
    let { navigator, bankStyle, modelName, resource, prop, context, search, isAggregation, application, newCustomer } = this.props
    let params = {
      modelName: MESSAGE,
      to: resource,
      prop,
      context,
      gatherForms: true,
      limit: LIMIT,
      search,
      isChat: true,
      isAggregation,
      application,
      newCustomer
    }
    StatusBar.setHidden(false);
    utils.onNextTransitionEnd(navigator, () => Actions.list({modelName: MESSAGE, ...params}));
    if (!application)
      Actions.getProductList({ resource })
    // if (resource  &&  resource[TYPE] === ORGANIZATION)
    setFontFamily(bankStyle)
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
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
    let { application, modelName, bankStyle, navigator } = this.props
    if (!modelName)
      modelName = MESSAGE
    if (action === 'productList') {
      this.setState({productList: params.resource})
      return
    }
    if (action === 'assignRM_Confirmed') {
      if (application[ROOT_HASH] === params.application[ROOT_HASH]) {
        let r = _.cloneDeep(application)
        this.setState({application: r})
      }
      return
    }
    if (action === 'addItem'  ||  action === 'addVerification' ||  action === 'addMessage') {
      this.add(params)
      return
    }
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
    if (params.isAggregation !== this.props.isAggregation)
      return
    if (action !== 'messageList')
      return

    if (params.forgetMeFromCustomer) {
      Actions.list({modelName: PROFILE})
      let routes = navigator.getCurrentRoutes()
      if (routes[routes.length - 1].component )
      navigator.popToRoute(routes[1])
      return
    }
    if (resource  &&  resource[ROOT_HASH] != chatWith[ROOT_HASH]) {
      let doUpdate
      if (utils.getType(chatWith) === ORGANIZATION  &&  resource.organization) {
        if (utils.getId(chatWith) === utils.getId(resource.organization))
          doUpdate = true
      }
      if (!doUpdate)
        return;
    }
    let { context, list, loadEarlierMessages, switchToContext, endCursor, allLoaded } = params
    if (loadEarlierMessages  &&  this.state.postLoad) {
      if (!list || !list.length) {
        this.state.postLoad([], true)
        this.setState({allLoaded: true, isLoading: false, noScroll: true, loadEarlierMessages: false})
        // this.state = {
        //   allLoaded: true, isLoading: false, noScroll: true, loadEarlierMessages: false,
        //   ...this.state
        // }
      }
      else {
        this.state.postLoad(list, false)
        // let allLoaded = (resourceCount && resourceCount < LIMIT)  ||  list.length < LIMIT
        this.state.list.forEach((r) => {
          list.push(r)
        })
        this.setState({
          list,
          allLoaded,
          endCursor,
          context: context ||  this.state.context,
          noScroll: true,
          productToForms: this.state.productToForms,
          loadEarlierMessages: !allLoaded
        })
      }
      return
    }
    if (!list)
      return

    if (bankStyle   &&  params.bankStyle)
      _.extend(bankStyle, params.bankStyle)
    let isEmployee = utils.isEmployee(chatWith)
    let state = {isLoading: false, isEmployee}
    if (list.length || (this.state.filter  &&  this.state.filter.length)) {
      let type = utils.getType(list[0]);
      if (type  !== modelName) {
        let model = utils.getModel(modelName);
        if (model.id !== MESSAGE) {
          if (!model.isInterface)
            return;
          else {
            let rModel = utils.getModel(type);
            if (!rModel.interfaces  ||  rModel.interfaces.indexOf(modelName) === -1)
              return;
          }
        }
      }
      _.extend(state, {
        list,
        shareableResources,
        context: context ||  this.state.context,
        isEmployee,
        loadEarlierMessages,
        switchToContext,
        endCursor,
        isLoading: switchToContext ? true : false,
        allLoaded: false, //list.length < this.state.limit ? true : false,
        allContexts: switchToContext ? false : this.state.allContexts,
        productToForms: productToForms || this.state.productToForms,
      })
    }
    this.setState(state)
  }
  add(params) {
    let { action, resource, to, productToForms, shareableResources } = params
    if (!utils.isMessage(resource))
      return
    // HACK for Agent to not to receive messages from one customer in the chat for another
    if (utils.isAgent()  &&  this.state.currentContext  &&  resource._context) {
      if (this.state.currentContext.contextId !== resource._context.contextId)
        return
    }
    let { application, originatingMessage } = this.props
    let chatWith = this.props.resource
    let rtype = resource  &&  utils.getType(resource)
    if (rtype === NEXT_FORM_REQUEST) {
      let list = this.state.list
      let r = list[list.length - 1]
      if (rtype === FORM_REQUEST  &&  r.form === resource.after) {
        // not fulfilled form request for multi-entry form will have it's own ID set
        // as fulfilled document
        if (!r._document || utils.getId(r) === r._document) {
          let l = _.cloneDeep(list)
          l.splice(l.length - 1 , 1)
          this.setState({list: l})
        }
      }
      return
    }

    let rid = utils.getId(chatWith)
    let isContext = utils.isContext(utils.getType(chatWith))
    if (isContext) {
      if (!resource._context  ||  utils.getId(resource._context) !== utils.getId(chatWith))
        return
    }
    else if (utils.getType(chatWith) !== PROFILE) {
      let fid = resource.from.organization &&  utils.getId(resource.from.organization)
      let tid = resource.to.organization && utils.getId(resource.to.organization)
      if (rid !== fid  &&  rid !== tid  &&  !to)
        return
    }

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
    if (!replace  &&  !application)
      utils.pinFormRequest(list)

    let state = {
      // addedItem: addedItem,
      list: list,
    }
    if (this.state.isLoading) {
      state.isLoading = false
      StatusBar.setHidden(false);
    }
    let currentContext
    if (utils.isContext(resource))
      currentContext = resource
    else if (resource._context  &&  utils.getType(resource._context))
    // else //if (rtype === FORM_REQUEST  ||  rtype === FORM_ERROR)
      currentContext = resource._context
    if (currentContext)
      state.currentContext = currentContext
    if (productToForms)
      state.productToForms = productToForms
    else if (utils.getModel(rtype).subClassOf === FORM  &&  resource._context) {
      let product = resource._context.requestFor
      if (this.state.productToForms)
        productToForms = _.cloneDeep(this.state.productToForms)
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
    if (action === 'addVerification') {
      if (originatingMessage  &&  originatingMessage.verifiers)  {
        let docType = utils.getId(resource.document).split('_')[0]
        state.verifiedByTrustedProvider = originatingMessage.form === docType && resource
      }
      else
        state.verifiedByTrustedProvider = null
    }
    this.showAnotherEmployeeAlert(resource)
    this.setState(state)
  }
  // Application was started by another employee
  showAnotherEmployeeAlert(resource) {
    let rtype = utils.getType(resource)
    let me = utils.getMe()
    if (!me.isEmployee  || rtype !== FORM_REQUEST || resource._documentCreated)
      return

    let rcontext = resource._context
    if (!rcontext  ||  !this.state.allContexts)
      return

    if (utils.getId(rcontext.from) === utils.getId(utils.getMe()))
      return
    let meApplying = rcontext.from.organization  &&  rcontext.from.organization.id === me.organization.id
    if (!meApplying)
      return
    let m = utils.getModel(resource.product)
    Alert.alert(
      translate('startedByAnotherEmployee', translate(m)),
      translate('doYouWantToContinue'),
      [
        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
        {text: translate('Ok'),     onPress: () => this.switchToOneContext(rcontext, resource.from)},
      ]
    )
  }
  switchToOneContext(context, to) {
    this.setState({allContexts: false, limit: LIMIT})
    Actions.list({
      modelName: MESSAGE,
      search: this.props.search,
      to: this.props.resource,
      context: context,
      switchToContext: context != null,
      limit: 20
    })
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
    if (this.state.application !== nextState.application)
      return true
    if (this.state.productList !== nextState.productList)
      return true
    // if (!this.state.isConnected && !this.state.list  && !nextState.list && this.state.isLoading === nextState.isLoading)
    //   return false
    if (nextState.isConnected !== this.state.isConnected  &&  this.state.isLoading === nextState.isLoading)
      return true
    // undefined - is not yet checked
    if (typeof this.state.onlineStatus !== 'undefined') {
      if (nextState.onlineStatus !== this.state.onlineStatus)
        return true
    }
    if (this.state.currentContext !== nextState.currentContext)
      return this.isTheSameResource(this.state.currentContext, nextState.currentContext)
    if (this.state.context !== nextState.context)
      return this.isTheSameResource(this.state.context, nextState.context)
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
  isTheSameResource(r1, r2) {
    if (!r1  ||  !r2)
      return (r1  ||  r2) ? false : true
    return utils.getId(r1) !== utils.getId(r2)
  }
  share(resource, to, formRequest) {
    Actions.share(resource, to, formRequest) // forRequest - originating message
  }

  selectResource(params) {
    let { isReview, verification } = params
    let r = params.resource
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    let rtype = utils.getType(r)
    if (!rtype)
      return;
    let application = this.state.application || this.props.application
    let model = utils.getModel(rtype);
    let title //utils.getDisplayName(resource, model.properties);

    if (rtype === VERIFICATION) {
      let type = utils.getType(r.document)
      if (type)
        title = translate(utils.getModel(type))
    }
    if (!title)
      title = translate(model) //translate(utils.makeModelTitle(model))
    let dn = utils.getDisplayName(r)
    // let newTitle = title + (dn ? ' -- ' + dn : '');
    let newTitle = (dn ? dn + ' -- '  : '') + title;
    // Check if I am a customer or a verifier and if I already verified this resource
    let isVerifier
    if (!model.notEditable) {
      isVerifier = application  ? utils.isRM(application) : !verification && utils.isVerifier(r)
    }
    let { resource, bankStyle, currency } = this.props
    let lensId = utils.getLensId(r, resource)
    if (!verification  &&  utils.getType(resource) === VERIFICATION)
      verification = resource
    let route = {
      title: newTitle,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      parentMeta: model,
      passProps: {
        bankStyle,
        resource: r,
        lensId: lensId,
        application,
        currency: resource.currency || currency,
        country: resource.country,
        verification,
        isReview,
        isVerifier
      }
    }
    let showEdit
    if (verification)  {
      // if (application  &&  utils.isRM(application))
      //   showEdit = true
    }
    else
      showEdit = !model.notEditable  &&   r._latest  && !application  &&  model.subClassOf !== MY_PRODUCT

    // Allow to edit resource that was not previously changed
    if (showEdit) {
      let passProps
      let prefill = utils.getPrefillProperty(model)
      if (prefill) {
        passProps = {
          containerResource: r,
          resource: r[prefill.name],
          prop: prefill,
          model: utils.getModel(r[prefill.name][TYPE]),
          bankStyle,
        }
      }
      else {
        // let editProps = utils.getEditableProperties(r)
        // let prop = editProps.length === 1  &&  editProps[0]
        // if (prop  &&  prop.signature) {
        //   route.onRightButtonPress = this.showSignatureView.bind(this, prop, r)
        // }
        // else {
          passProps = {
            model: utils.getLensedModel(r, lensId),
            resource: r,
            currency: resource.currency || this.props.currency,
            country: resource.country,
            chat: resource,
            lensId,
            bankStyle,
            isReview
          }
        // }
      }

      route.rightButtonTitle =  isReview  &&  'Review' || 'Edit'
      if (!route.onRightButtonPress)
        route.onRightButtonPress = {
          title: newTitle, //utils.getDisplayName(resource),
          id: 4,
          component: NewResource,
          // titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps
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
      modelName: this.props.modelName || MESSAGE,
      to: this.props.resource,
      isChat: true,
      context: this.state.allContexts ? null : this.state.context,
      limit: this.state.list ? this.state.list.length + 1 : LIMIT
    }
    this.state.emptySearch = true
    Actions.list(actionParams);
  }

  renderRow(resource, sectionId, rowId)  {
    let { application, isAggregation, bankStyle, originatingMessage, currency, navigator } = this.props
    let model = utils.getModel(utils.getType(resource))
    let previousMessageTime = currentMessageTime;
    let isContext = utils.isContext(this.props.resource)
    currentMessageTime = resource._time
    let context = this.state.context
    if (isContext)
      context = this.props.resource
    let props = {
      onSelect: this.selectResource,
      resource: resource,
      bankStyle: bankStyle,
      context: context,
      application: this.state.application || application,
      to: isAggregation ? resource.to : this.props.resource,
      navigator: navigator,
      switchChat: isContext ? this.switchChat.bind(this, resource) : null
    }
    if (model.subClassOf === 'tradle.MyProduct')
      return  <MyProductMessageRow {...props} />

    let moreProps = {
      share: this.share,
      // sendStatus: sendStatus,
      currency: this.props.resource.currency || currency,
      country: this.props.resource.country,
      defaultPropertyValues: this.props.resource._defaultPropertyValues,
      previousMessageTime: previousMessageTime,
      switchToContext: this.state.switchToContext
    }

    props = _.extend(props, moreProps)
    if (model.id === VERIFICATION) {
      if (this.state.verifiedByTrustedProvider  &&  this.state.verifiedByTrustedProvider[ROOT_HASH] === resource[ROOT_HASH]) {
        props.shareWithRequestedParty = originatingMessage.from
        props.originatingMessage = originatingMessage
      }
      return  <VerificationMessageRow {...props} />
    }

    if (model.subClassOf === FORM || utils.isItem(model))
      return <FormMessageRow {...props} />

    props.isLast = rowId === this.state.list.length - 1
    props.productToForms = this.state.productToForms
    props.shareableResources = this.state.shareableResources
    props.isAggregation = isAggregation
    // props.addedItem = this.state.addedItem
    props.chooseTrustedProvider = this.chooseTrustedProvider

    if (model.id === FORM_ERROR)
      return <FormErrorRow {...props} />
    else if (model.id === FORM_REQUEST || model.id === CONFIRM_PACKAGE_REQUEST || model.id === REFRESH) {
      _.extend(props, {productChooser: this.productChooser.bind(this)})
      return <FormRequestRow {...props} />
    }
    else if (model.id === TOUR)
      return <TourRow {...props} />
    else
      return <MessageRow {...props} />
  }
  addedMessage(text) {
    Actions.list({
      modelName: this.props.modelName || MESSAGE,
      to: this.props.resource,
      isChat: true,
      context: this.state.allContexts ? null : this.state.context,
      limit: this.state.list ? this.state.list.length + 1 : LIMIT
    });
  }

  componentWillUnmount() {
    clearTimeout(this._scrollTimeout)
  }

  componentDidUpdate() {
    clearTimeout(this._scrollTimeout)
    // Android HACK - when first time in CHAT and message goes beyond the visible area
    // the event is emitted that is the same as if the PULLDOWN action was requested
    // that causes the confusion as if we requested the previous resources
    if (isAndroid()  &&  this.state.allLoaded  &&  this.state.list  &&  this.state.list.length < LIMIT)
      this.state.allLoaded = false
    // end HACK
    if (this.state.allLoaded  ||  this.state.noScroll)
      this.state.noScroll = false
    else {
      console.log('MessageList: setting timeout for scrollToBottom')
      this._scrollTimeout = this.setTimeout(() => {
        // inspired by http://stackoverflow.com/a/34838513/1385109
        console.log('MessageList: scrollToBottom started')
        this._GiftedMessenger  &&  this._GiftedMessenger.scrollToBottom()
      }, isAndroid() && 2000 || 1000)
    }
  }

  render() {
    let { modelName, resource, bankStyle, navigator, originatingMessage } = this.props
    if (!modelName)
      modelName = MESSAGE
    let application = this.state.application ||  this.props.application
    let { list, isLoading, context, isConnected, isForgetting, allLoaded,
          onlineStatus, loadEarlierMessages, customStyle, allContexts, currentContext } = this.state
    if (currentContext)
      context = currentContext
    let bgImage = bankStyle &&  bankStyle.backgroundImage && bankStyle.backgroundImage.url
    let bgStyle
    if (!bgImage  &&  bankStyle.backgroundColor)
      bgStyle = {backgroundColor: bankStyle.backgroundColor}
    else
      bgStyle = {backgroundColor: 'transparent'}
    let alert = <View />
    let hideTextInput
    if (modelName === ORGANIZATION)
      hideTextInput = !utils.hasSupportLine(resource)
    else if (application)
      hideTextInput = !utils.isRM(application)
      // hideTextInput = !utils.isRM(application)
    // HACK for RM
    // hideTextInput = false
    let content
    if (!list || !list.length) {
      if (application  ||  navigator.isConnected  &&  utils.getType(resource) === ORGANIZATION) {
        if (isLoading) {
          let menuBtn
          // let menuBtn = !hideTextInput /*this.hasMenuButton() */ && (
          //   <View style={styles.footer}>
          //     {this.paintMenuButton()}
          //   </View>
          // )

          content = <View style={styles.flex1}>
                      <View style={[platformStyles.container, bgStyle]}>
                        <Text style={[styles.loading, {color: bankStyle.linkColor}]}>{translate('loading')}</Text>
                        <ActivityIndicator size='large' style={styles.indicator} />
                      </View>
                      {menuBtn}
                    </View>
        }
      }
    }
    let isContext = resource  &&  utils.isContext(utils.getType(resource))
    if (!content) {
      let h = utils.dimensions(MessageList).height
      let maxHeight = h - NAV_BAR_HEIGHT
      // Chooser for trusted party verifier
      let isChooser = originatingMessage && originatingMessage.verifiers
      let notRemediation = (context  &&  context.requestFor !== REMEDIATION) ||
                           (isContext && resource.requestFor !== REMEDIATION)
      // let me = utils.getMe()
      // if (me.isEmployee  &&  utils.getId(me.organization) !== utils.getId(resource));
      // else
      if (this.hasChatContext())
        maxHeight -= 45
      else if (notRemediation &&  !isChooser  &&  (!isConnected  ||  (!isContext  &&  onlineStatus === false))) //  || (resource[TYPE] === ORGANIZATION  &&  !resource._online)))
        maxHeight -= 35
      // if (notRemediation  &&  !hideTextInput) //  &&  resource.products) //  &&  resource.products.length > 1))
      //   maxHeight -= 45
      // else if (ENV.allowForgetMe)
      //   maxHeight -= 45
      if (hideTextInput)
      //   maxHeight += 35
        maxHeight -= 10
      // content = <GiftedMessenger style={{paddingHorizontal: 10, marginBottom: Platform.OS === 'android' ? 0 : 20}} //, marginTop: Platform.OS === 'android' ?  0 : -5}}
      // Hide TextInput for shared context since it is read-only

      content = <GiftedMessenger style={{paddingHorizontal: 10}} //, marginTop: Platform.OS === 'android' ?  0 : -5}}
        ref={(c) => this._GiftedMessenger = c}
        loadEarlierMessagesButton={loadEarlierMessages}
        onLoadEarlierMessages={this.onLoadEarlierMessages}
        messages={list}
        customStyle={customStyle}
        enableEmptySections={true}
        autoFocus={false}
        placeholder={translate('typeMessage')}
        textRef={'chat'}
        renderCustomMessage={this.renderRow}
        handleSend={this.onSubmitEditing}
        submitOnReturn={true}
        underlineColorAndroid='transparent'
        textInputHeight={isIphone10orMore() ? 60 : 45}
        menu={this.generateMenu}
        keyboardShouldPersistTaps={utils.isWeb() ? 'never' : 'always'}
        keyboardDismissMode={utils.isWeb() ? 'none' : 'on-drag'}
        maxHeight={maxHeight} // 64 for the navBar; 110 - with SearchBar
        hideTextInput={hideTextInput}
        styles={
          {
            textInputContainer: styles.textInputContainer
          }
        }
      />
    }

    let sepStyle = { height: 1,backgroundColor: 'transparent' }
    if (!allLoaded  && !navigator.isConnected  &&  isForgetting)
      Alert.alert(translate('noConnectionWillProcessLater'))
    let actionSheet = !hideTextInput  && this.renderActionSheet()
    let network
    if (originatingMessage)
       network = <NetworkInfoProvider connected={isConnected} resource={resource} online={onlineStatus} />
    if (!context  &&  isContext)
      context = resource
    let separator = utils.getContentSeparator(bankStyle)
    StatusBar.setHidden(false);
    let progressInfoR = resource || application
    let hash = utils.getRootHash(progressInfoR)
    if (!bgImage)
      return (
        <PageView style={[platformStyles.container, bgStyle]} separator={separator} bankStyle={bankStyle}>
          {network}
          <ProgressInfo recipient={hash} color={bankStyle.linkColor} />
          <ChatContext chat={resource} application={application} context={context} contextChooser={this.contextChooser} shareWith={this.shareWith} bankStyle={bankStyle} allContexts={allContexts} />
          <View style={ sepStyle } />
          {content}
          {actionSheet}
          {alert}
        </PageView>
    )
    let {width, height} = utils.dimensions(MessageList)
    let image = [{ width, height: height - 1 }, platformStyles.navBarMargin]

    return (
      <PageView style={[platformStyles.container, bgStyle]} separator={separator} bankStyle={bankStyle}>
        <BackgroundImage source={{uri: bgImage}}  resizeMode='cover' style={image} />
          {network}
          <ProgressInfo recipient={hash} color={bankStyle.linkColor} />
          <ChatContext chat={resource} context={context} contextChooser={this.contextChooser} shareWith={this.shareWith} bankStyle={bankStyle} allContexts={allContexts} />
          <View style={ sepStyle } />
          {content}
          {actionSheet}
          {alert}
      </PageView>
    );
  }

  hasMenuButton() {
    return !!this.getActionSheetItems()
  }

  getActionSheetItems() {
    const { application } = this.props
    const buttons = []
    const push = btn => buttons.push({ ...btn, index: buttons.length })

    if (application) {
      if (!utils.isRM(application)  ||  !this.state.additionalForms)//this.hasAdditionalForms(application))
        return

      push({
        title: translate('formChooser'),
        callback: () => this.chooseFormForApplication()
      })

      push({
        title: translate('cancel'),
        callback: () => {}
      })

      return buttons
    }

    if (this.state.productList) {
      push({
        title: translate('applyForProduct'),
        callback: () => this.productChooser()
      })
    }

    if (ENV.allowForgetMe && !application) {
      push({
        title: translate('forgetMe'),
        callback: () => this.forgetMe()
      })
    }

    push({
      title: translate('cancel'),
      callback: () => {}
    })

    return buttons
  }
  chooseFormForApplication() {
    let application = this.props.application
    let model = utils.getModel(application.requestFor)
    this.props.navigator.push({
      title: translate(model),
      id: 33,
      component: StringChooser,
      backButtonTitle: 'Back',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        strings:   this.state.additionalForms, // model.additionalForms,
        bankStyle: this.props.bankStyle,
        callback:  (val) => {
          let m = utils.getModel(val)
          let msg = {
            [TYPE]: FORM_REQUEST,
            message: m.formRequestMessage
                    ? translate(m.formRequestMessage)
                    : translate('fillTheForm', translate(m)),
                // translate(model.properties.photos ? 'fillTheFormWithAttachments' : 'fillTheForm', translate(model.title)),
            product: model.id,
            form: val,
            from: utils.getMe(),
            to: application.applicant,
            _context: application._context,
            context: application.context
          }
          // msg._t = constants.TYPES.SIMPLE_MESSAGE
          // msg.message = '[' + (model.properties.photos ? translate('fillTheFormWithAttachments') : translate('fillTheForm')) + '](' + model.id + ')'
          utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg}))
          // resource[prop.name] = val
          // Actions.addChatItem({resource: resource, disableFormRequest: oResource})
        },
      }
    });
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
    let { resource } = this.props
    let name = utils.getType(resource) === PROFILE ? resource.formatted : resource.name
    this.props.navigator.push({
      title: translate('contextsFor') + ' ' + name,
      id: 23,
      component: ContextChooser,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      backButtonTitle: 'Back',
      passProps: {
        resource,
        // bankStyle: this.props.bankStyle,
        selectContext: this.selectContext
      },
    })
  }
  // Select context to filter messages for the particular context
  selectContext(context) {
    this.props.navigator.pop()
    this.switchToOneContext(context, this.props.resource)
    // let limit = context ? 300 : LIMIT
    // Actions.list({
    //   modelName: this.props.modelName,
    //   to: this.props.resource,
    //   context: context,
    //   limit: limit
    // })
    this.setState({context: context, allContexts: context == null, limit: this.state.limit})
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
      title: translate(utils.getModel(this.state.context.requestFor)),
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      rightButtonTitle: 'Share',
      passProps: {
        modelName: ORGANIZATION,
        multiChooser: true,
        sharingChat: sharingChat,
        onDone: this.shareContext
      }
    });
  }
  shareContext(orgs) {
    delete orgs[utils.getId(this.props.resource)]
    Alert.alert(
      translate('shareContext', utils.getModel(this.state.context.requestFor).title),
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
    let { application } = this.props
    if (application) {
      if (!utils.isRM(application)  ||  !this.state.additionalForms) // !this.hasAdditionalForms(application))
        return
    }
    return  <View style={[buttonStyles.menuButton, {opacity: 0.4}]}>
              <Icon name={MenuIcon.name}  size={33}  color={MenuIcon.color} />
            </View>
  }
  getAdditionalForms(application) {
    let m = utils.getModel(application.requestFor)
    if (m.additionalForms != null)
      return m.additionalForms
    let additionalForms = m.forms.filter(f => {
      if (f === SELFIE)
        return true
      let m = utils.getModel(f)
      let scanner = utils.getPropertiesWithAnnotation(m, 'scanner')
      if (Object.keys(scanner))
        return true
      let signature = utils.getPropertiesWithAnnotation(m, 'signature')
      if (Object.keys(signature))
        return true
      return false
    })
    return additionalForms.length  &&  additionalForms
  }
  // hasAdditionalForms(application) {
  //   let m = utils.getModel(application.requestFor)
  //   return m.additionalForms != null
  // }
  onLoadEarlierMessages(oldestMessage = {}, callback = () => {}) {
    if (this.state.allLoaded)
      return
    let list = this.state.list;
    let id = list.length  &&  utils.getId(list[0])
    Actions.list({
      lastId: id,
      limit: LIMIT,
      direction: 'up',
      search: this.props.search,
      loadEarlierMessages: true,
      context: this.state.allContexts ? null : this.state.context,
      modelName: this.props.modelName || MESSAGE,
      to: this.props.resource,
      application: this.props.application,
      endCursor: this.state.endCursor,
    })
    this.setState({postLoad: callback, loadEarlierMessages: true})
  }
  checkStart(evt) {
    evt = evt
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

  onSubmitEditing(msg) {
    if (!msg  ||  !msg.trim())
      return
    let me = utils.getMe();
    let { resource, application, modelName } = this.props
    if (!modelName)
      modelName = MESSAGE
    let model = utils.getModel(modelName);

    let message
    if (modelName === MESSAGE  ||  model.isInterface)
      message = msg
    else
      message = '[' + this.state.userInput + '](' + modelName + ')'

    let value = {
      [TYPE]: SIMPLE_MESSAGE,
      message,
      from: me,
      to: resource,
      _context: this.state.currentContext || this.state.context
      // _context: this.state.context || this.state.currentContext
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
  productChooser() {
    let prModel = utils.getModel(PRODUCT_REQUEST)
    let prop = prModel.properties.requestFor
    let oResource = this.state.productList
    let model = utils.getModel(oResource.form)
    let resource = {
      [TYPE]: model.id,
      from: utils.getMe(),
      to: oResource.from
    }
    if (oResource._context)
      resource._context = oResource._context
    this.props.navigator.push({
      title: translate(prop, prModel),
      id: 33,
      component: StringChooser,
      backButtonTitle: 'Back',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        strings:   oResource.chooser.oneOf,
        bankStyle: this.props.bankStyle,
        callback:  (val) => {
          resource[prop.name] = val
          Actions.addChatItem({resource: resource, disableFormRequest: oResource})
        },
      }
    });
  }
}
reactMixin(MessageList.prototype, Reflux.ListenerMixin);
reactMixin(MessageList.prototype, TimerMixin)
reactMixin(MessageList.prototype, NewResourceMixin);
MessageList = makeResponsive(MessageList)
MessageList = makeStylish(MessageList)

var styles = StyleSheet.create({
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
  },
  container: {
    alignItems: 'center'
  },
  mainWrap: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  flex1: {
    flex: 1,
  },
  bottom: {
    position: 'absolute',
    bottom: 30
  },
  loading: {
    fontSize: 17,
    alignSelf: 'center',
    marginTop: 80,
    color: '#629BCA'
  },
  indicator: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginTop: 20
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
          model: utils.getModel('tradle.NewMessageModel'),
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
      // 'Are you sure you want \'' + utils.getDisplayName(resource, utils.getModel(resource[TYPE]).properties) + '\' to forget you',
  onAddNewPressed(sendForm) {
    let { modelName, resource, navigator, callback } = this.props
    if (modelName === MESSAGE)
      return
    let model = utils.getModel(modelName);
    if (!model.isInterface)
      return;

    let currentRoutes = navigator.getCurrentRoutes();
    navigator.push({
      title: translate(utils.getModel(FINANCIAL_PRODUCT)),
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
          model: utils.getModel('tradle.NewMessageModel'),
          currency: resource.currency,
          country: resource.country,
          // callback: this.modelAdded.bind(this)
        }
      }
    });
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
      title: translate(utils.getModel(FORM)),
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
      //     model: utils.getModel('tradle.NewMessageModel'),
      //     currency: resource.currency,
      //     // callback: this.modelAdded.bind(this)
      //   }
      // }
    });
  }
  onChooseProduct() {
    if (this.props.isAggregation)
      return
    // let modelName = MESSAGE
    // let model = utils.getModel(modelName);
    // let isInterface = model.isInterface;
    // if (!isInterface)
    //   return;

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
*/
