import React, { Component } from 'react'
import {
  ImageBackground,
  Platform,
  PixelRatio,
  View,
  // Text,
  StatusBar,
  Modal,
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
import StepIndicator from 'react-native-step-indicator'
import QR from '@tradle/qr-schema'

import constants from '@tradle/constants'

import { Text, setFontFamily } from './Text'
import Navigator from './Navigator'
import MessageRow from './MessageRow'
import MyProductMessageRow from './MyProductMessageRow'
import VerificationMessageRow from './VerificationMessageRow'
import FormMessageRow from './FormMessageRow'
import FormRequestRow from './FormRequestRow'

import NewResource from './NewResource'
import GridList from './GridList'

import FormErrorRow from './FormErrorRow'
import QRCode from './QRCode'
import TourRow from './TourRow'
import ChatContext from './ChatContext'
import NewResourceMixin from './NewResourceMixin'
import HomePageMixin from './HomePageMixin'
import { showLoading, getContentSeparator } from '../utils/uiUtils'
import utils, { translate, isIphone10orMore, isAndroid, isWeb, isRM, isWhitelabeled, getRootHash } from '../utils/utils'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import NetworkInfoProvider from './NetworkInfoProvider'
import ProgressInfo from './ProgressInfo'
import PageView from './PageView'
import { makeStylish } from './makeStylish'
import ActivityIndicator from './ActivityIndicator'
import platformStyles, { MenuIcon } from '../styles/platform'
import buttonStyles from '../styles/buttonStyles'
import ENV from '../utils/env'
import StyleSheet from '../StyleSheet'
import BackgroundImage from './BackgroundImage'
const LIMIT = 50
const { TYPE, TYPES, ROOT_HASH, CUR_HASH } = constants
const { PROFILE, VERIFICATION, ORGANIZATION, SIMPLE_MESSAGE, MESSAGE } = TYPES
const MY_PRODUCT = 'tradle.MyProduct'
const FORM_REQUEST = 'tradle.FormRequest'
const FORM = 'tradle.Form'
const FORM_ERROR = 'tradle.FormError'
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'
const CONFIRM_PACKAGE_REQUEST = "tradle.ConfirmPackageRequest"
const REFRESH = 'tradle.Refresh'
const REFRESH_PRODUCT = 'tradle.RefreshProduct'
const REMEDIATION = 'tradle.Remediation'
const NEXT_FORM_REQUEST = 'tradle.NextFormRequest'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const TOUR = 'tradle.Tour'
const SELFIE = 'tradle.Selfie'
const CHECK_OVERRIDE = 'tradle.CheckOverride'
const APPLICATION = 'tradle.Application'

const NAV_BAR_HEIGHT = ENV.navBarHeight
const MAX_STEPS = isWeb() ? 10 : 5

let currentMessageTime

class MessageList extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string,
    resource: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    currentMessageTime = null;
    let { resource, filter, application, navigator, bankStyle, currentContext } = props
    let me = utils.getMe()
    let noChat
    if (me.counterparty && currentContext && currentContext.notes && (currentContext.notes._ref || currentContext.notes.parentApplication))
      noChat = true
    else if (application && application.draft)
      noChat = true

    this.state = {
      isLoading: true,
      isConnected: navigator.isConnected,
      allContexts: noChat ? false : true,  // true - for the full chat; false - filtered chat for specific context.
      isEmployee:  resource  &&  utils.isEmployee(resource),
      filter: filter,
      userInput: '',
      list: [],
      limit: LIMIT,
      hasProducts: resource  &&  this.hasProducts(resource),
      allLoaded: false,
      isModalOpen: false,
      step: -1,
      bankStyle: bankStyle && _.clone(bankStyle) || {},
      showStepIndicator: me._showStepIndicator,
      currentContext,
      application,
      // menuIsShown: me.isEmployee,
      noChat
    }
    if (application  &&  (isRM(application) ||  application.filledForCustomer || application.draft)) {
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

    if (!context  ||  context.requestFor === REMEDIATION  ||  context.requestFor === REFRESH_PRODUCT)
      return false

    // HACK - needs rewrite
    let me = utils.getMe()
    if (me.isEmployee)  {
      if (application  &&  isRM(application))
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
    if (resource._formsTypes)
      return true
    let isReadOnlyChat = utils.isMessage(resource) && utils.isReadOnlyChat(context)
    // if (isReadOnlyChat  &&  resource._relationshipManager)
    //   return true
    if (allContexts || isReadOnlyChat)
      return false

    return true
  }
  componentWillMount() {
    let { navigator, bankStyle, modelName, resource, prop, context, search,
          isAggregation, application, newCustomer } = this.props

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
    if (!application || utils.getMe().counterparty)
      Actions.getProductList({ resource })
    // if (resource  &&  resource[TYPE] === ORGANIZATION)
    setFontFamily(bankStyle)
    // if (utils.isWeb() &&  !utils.getMe()._masterAuthor)
    //   Actions.genPairingData(resource.url)
  }
  componentDidMount() {
    this.listenTo(Store, 'onAction');
    this._watchSubmit()
    // if (isWhitelabeled())
      Actions.noPairing(this.props.resource)
  }

  _watchSubmit() {
    const self = this
    if (!isWeb() || !this._GiftedMessenger || !this._GiftedMessenger.refs.textInput) return

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
    let { action, error, to, isConnected, pairingData } = params
    if (error)
      return
    if (action === 'connectivity') {
      this.setState({isConnected})
      return
    }
    if (action === 'genPairingData') {
      // debugger
      this.setState({pairingData, isModalOpen: true})
      return
    }
    let { application, modelName, navigator } = this.props
    if (action === 'goBack') {
      navigator.pop()
      return
    }
    if (action === 'getMenu') {
      this.setState({menuIsShown: utils.getMe().isEmployee && true})
      return
    }
    let chatWith = this.props.resource
    if (action === 'syncDevicesIsDone') {
      if (to  &&  getRootHash(to) === getRootHash(chatWith))
        navigator.pop()
      return
    }
    let { doRefreshApplication, isModalOpen, onlineStatus, isLoading } = this.state

    if (action === 'masterIdentity') {
      this.setState({ isModalOpen: false })
      if (utils.getMe().isEmployee || params.isEmployee) {
        let routes = navigator.getCurrentRoutes()
        navigator.jumpTo(routes[0])
      }
      else {
        Actions.getProductList({ resource: chatWith })
        setTimeout(() => Actions.list({ modelName: MESSAGE, to: chatWith }), 3000)
      }
      return
    }
    if (isModalOpen)
      return
    if (to  &&  getRootHash(to) !== getRootHash(chatWith))
      return

    let { resource, online, productToForms, shareableResources, context } = params
    if (action === 'onlineStatus') {
      if (resource  &&  utils.getId(resource) == utils.getId(chatWith))
      // if (resource  &&  resource[ROOT_HASH] === this.props.resource[ROOT_HASH])
      //   state.resource = chatWith
      if (online !== onlineStatus)
        this.setState({onlineStatus: online})
      return
    }
    if (action === 'getApplication' && params.application) {
      if (resource && utils.getId(resource) === utils.getId(chatWith))
        this.setState({ application: params.application })
      return
    }
    if (action === 'getItem'  &&  utils.getId(resource) === utils.getId(chatWith)) {
      this.setState({hasProducts: this.hasProducts(resource) })
      if (productToForms)
        this.setState({productToForms: productToForms})
      return
    }
    if (!modelName)
      modelName = MESSAGE
    if (action === 'productList') {
      this.setState({productList: params.resource})
      return
    }
    if (action === 'assignRM_Confirmed') {
      if (application[ROOT_HASH] === params.application[ROOT_HASH]) {
        Actions.hideModal()
        let additionalForms = this.getAdditionalForms(application)
        let state = {application: params.application}
        if (additionalForms.length)
          state.additionalForms = additionalForms.map(f => ({id: f}))

        this.setState(state)
      }
      return
    }
    if (action === 'addItem'  ||  action === 'insertItem'  ||  action === 'addVerification' ||  action === 'addMessage') {
      this.add(params)
      return
    }

    if (action === 'stepIndicatorPress') {
      if (!context)
        return
      let curContext = this.state.currentContext || this.state.context
      if (!curContext)
        return
      if (utils.getId(context) !== utils.getId(curContext))
        return
      if (utils.getId(chatWith) !== utils.getId(to))
        return
      this.selectResource({resource})
    }
    else if (action === 'showStepIndicator') {
      this.setState({showStepIndicator: params.showStepIndicator})
      return
    }
    this.state.newItem = false
    if (action === 'updateItem') {
      if (resource._dataBundle)
        return
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
        list
      })

      if (!isLoading && application && doRefreshApplication && resource._sendStatus === 'Sent') {
        debugger
        this.setState({
          doRefreshApplication: false
        })
        this.refreshApplication(application)
      }

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
    let { list, loadEarlierMessages, switchToContext, endCursor, allLoaded, canSkip } = params
    let { noChat, application: appl, postLoad, currentContext } = this.state
    let me = utils.getMe()
    if (context  &&  me.counterparty) {
      if (context.notes && context.notes._ref) {
        noChat = true
        currentContext = context
      }
    }

    if (loadEarlierMessages  &&  postLoad) {
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
          noChat,
          currentContext,
          canSkip,
          productToForms: this.state.productToForms,
          loadEarlierMessages: !allLoaded
        })
      }
      return
    }
    if (!list)
      return

    if (this.state.bankStyle   &&  params.bankStyle)
      _.extend(this.state.bankStyle, params.bankStyle)
    let isEmployee = utils.isEmployee(chatWith)
    let state = {isLoading: false, isEmployee, noChat, currentContext}
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
        canSkip,
        shareableResources,
        context: context ||  this.state.context,
        isEmployee,
        loadEarlierMessages,
        switchToContext,
        endCursor,
        isLoading: switchToContext ? true : false,
        allLoaded: false, //list.length < this.state.limit ? true : false,
        allContexts: switchToContext || noChat ? false : this.state.allContexts,
        productToForms: productToForms || this.state.productToForms,
        isModalOpen: pairingData != null,
        pairingData
      })
    }
    this.setState(state)
  }
  add(params) {
    let { action, resource, to, productToForms, shareableResources, timeShared, pairingData, doRefreshApplication } = params
    if (!utils.isMessage(resource))
      return
    let { noChat, currentContext, isLoading } = this.state
    // HACK for Agent to not to receive messages from one customer in the chat for another
    if (utils.isAgent()  &&  currentContext  &&  resource._context) {
      if (currentContext.contextId !== resource._context.contextId)
        return
    }
    let { resource:chatWith, navigator, bankStyle, currency, locale } = this.props
    let requestedApplication
    if (noChat) {
      let application = this.state.application
      if (!application) {
        if (!this.state.requestedApplication) {
          let prop = utils.getModel(APPLICATION).properties.forms
          Actions.getApplication({
            modelName: APPLICATION,
            resource: chatWith,
            search: true,
            prop: utils.getModel(APPLICATION).properties.forms,
            isBacklink: true,
            noChat,
            filterResource: {draft: true, context: resource._context ? resource._context.contextId : resource.context, limit: 1}
          })
          requestedApplication = true
        }
      }
      else if (resource[TYPE] === APPLICATION_SUBMITTED) {
        debugger
        let title = utils.getDisplayName({resource: application})
        let route = {
          title,
          componentName: 'ApplicationView',
          backButtonTitle: 'Back',
          refreshHandler: this.refreshApplication.bind(this, application),
          passProps: {
            resource: application,
            search: true,
            bankStyle,
            currency,
            locale
          }
        }
        let routes = navigator.getCurrentRoutes()
        let idx = routes.findIndex(r => r.componentName === 'ApplicationView')
        if (idx === -1) {
          navigator.replace(route)
          return
        }
debugger
        // let newRoutes = routes.slice(0,idx)
        // newRoutes.push(route)
        // navigator.immediatelyResetRouteStack(newRoutes);

        navigator.popToRoute(routes[idx])
        navigator.replace(route)

        this.refreshApplication(application)
        return
      }
    }

    let { application, originatingMessage } = this.props
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

    let insert = action === 'insertItem'  &&  timeShared
    let list
    list = this.state.list || []
    if (replace) {
      let resourceId = utils.getId(resource)
      list = list.map((r) => utils.getId(r) === resourceId ? resource : r)
    }
    else if (insert) {
      let idx = list.findIndex((r) => r._sentTime > timeShared)
      list.splice(idx, 0, resource)
    }
    else {
      list = list.map((r) => r)
      list.push(resource)
    }
    if (!replace  &&  !application)
      utils.pinFormRequest(list)
    let state = {
      // addedItem: addedItem,
      list,
      requestedApplication,
    }
    if (doRefreshApplication)
      state.doRefreshApplication = doRefreshApplication

    if (this.state.isLoading) {
      state.isLoading = false
      StatusBar.setHidden(false);
    }
    state.step = -1
    if (utils.isContext(resource))
      currentContext = resource

    else if (resource._context  &&  utils.getType(resource._context))
    // else //if (rtype === FORM_REQUEST  ||  rtype === FORM_ERROR)
      currentContext = resource._context
    if (currentContext)
      state.currentContext = currentContext
    if (productToForms)
      state.productToForms = productToForms
    else if (utils.isForm(rtype)  &&  resource._context) {
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
    if (rtype === FORM_REQUEST && params.canSkip)
      state.canSkip = true
    state = {...state, pairingData, isModalOpen: pairingData != null}
    this.showAnotherEmployeeAlert(resource)
    this.setState(state)
    return true
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
    if (!meApplying || me.isEmployee)
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
    this.setState({allContexts: false, limit: LIMIT, step: -1})
    Actions.list({
      modelName: MESSAGE,
      search: this.props.search,
      to: this.props.resource,
      context: context,
      switchToContext: context != null,
      limit: LIMIT
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
    if (this.state.isLoading !== nextState.isLoading)
      return true
    if (this.state.menuIsShown !== nextState.menuIsShown)
      return true
    if (this.state.list.length !== nextState.list.length)
      return true
    if (utils.resized(this.props, nextProps))
      return true
    if (this.state.isModalOpen  !== nextState.isModalOpen)
      return true
    if (this.state.application !== nextState.application)
      return true
    if (this.state.productList !== nextState.productList)
      return true
    if (this.state.step !== nextState.step)
      return true
    if (this.state.showStepIndicator !== nextState.showStepIndicator)
      return true

    // if (!this.state.isConnected && !this.state.list  && !nextState.list && this.state.isLoading === nextState.isLoading)
    //   return false
    if (nextState.isConnected !== this.state.isConnected  &&  this.state.isLoading === nextState.isLoading)
      return true
    // if (!this.state.isConnected && !this.state.list  && !nextState.list && this.state.isLoading === nextState.isLoading)
    //   return false
    // undefined - is not yet checked
    if (typeof this.state.onlineStatus !== 'undefined') {
      if (nextState.onlineStatus !== this.state.onlineStatus)
        return true
    }
    if (this.state.currentContext !== nextState.currentContext && !this.state.noChat)
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
    if (utils.resized(this.props, nextProps)           ||
        this.state.allLoaded !== nextState.allLoaded)
      return true
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
    let title

    if (rtype === VERIFICATION) {
      let type = utils.getType(r.document)
      if (type)
        title = translate(utils.getModel(type))
    }
    if (!title)
      title = translate(model) //translate(utils.makeModelTitle(model))
    let dn = utils.getDisplayName({ resource: r })
    let newTitle = (dn ? dn + ' -- '  : '') + title;
    // Check if I am a customer or a verifier and if I already verified this resource
    let isVerifier
    if (!model.notEditable) {
      if (application) {
        if (isRM(application)  &&  r._latest)
          isVerifier = true
        else
          isVerifier = !verification && utils.isVerifier(r)
      }
    }
    let { resource, currency, navigator } = this.props
    let lensId = utils.getLensId(r, resource)
    if (!verification  &&  utils.getType(resource) === VERIFICATION)
      verification = resource

    let notEditable = model.notEditable  ||  utils.isSubclassOf(model, CHECK_OVERRIDE)
    let bankStyle = this.props.bankStyle || this.state.bankStyle

    let isApplication = rtype === APPLICATION
    let componentName
    if (isApplication)
      componentName = 'ApplicationView'
    else if (utils.isSubclassOf(rtype, MY_PRODUCT))
      componentName = 'ResourceView'
    else
      componentName = 'MessageView'
    let route = {
      title: newTitle,
      backButtonTitle: 'Back',
      componentName,
      // parentMeta: model,
      passProps: {
        bankStyle,
        resource: r,
        isChat: true,
        lensId: lensId,
        application,
        currency: this.calcCurrency(),
        locale: resource.locale,
        country: resource.country,
        verification,
        isReview,
        isVerifier
      }
    }
    if (isApplication)
      route.refreshHandler = this.refreshApplication.bind(this, r)

    let showEdit
    if (verification)  {
      // if (application  &&  isRM(application))
      //   showEdit = true
    }
    else
      showEdit = !notEditable  &&   r._latest  && (!application || application.filledForCustomer || application.draft) &&  !utils.isMyProduct(model)

    // Allow to edit resource that was not previously changed
    if (showEdit) {
      let passProps
      let prefill = utils.getPrefillProperty(model)
      if (prefill) {
        passProps = {
          containerResource: r,
          resource: r[prefill.name],
          prop: prefill,
          model: utils.getLensedModel(r[prefill.name][TYPE]),
          bankStyle,
        }
      }
      else {
        passProps = {
          model: utils.getLensedModel(r, lensId),
          resource: r,
          currency: this.calcCurrency(),
          country: resource.country,
          locale: resource.locale,
          chat: resource,
          application,
          lensId,
          bankStyle,
          isReview
        }
      }
      if (resource._allowedMimeTypes)
        passProps.allowedMimeTypes = resource._allowedMimeTypes

      route.rightButtonTitle =  isReview  &&  'Review' || 'Edit'
      if (!route.onRightButtonPress)
        route.onRightButtonPress = {
          title: newTitle,
          componentName: 'NewResource',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps
        }
    }
    if (isVerifier  &&  !notEditable) {
      route.rightButtonTitle = 'Done' //ribbon-b|ios-close'
      route.help = translate('verifierHelp')  // will show in alert when clicked on help icon in navbar
      route.application = application
    }
    if (isApplication)
      navigator.replace(route)
    else
      navigator.push(route);
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
    let { application, isAggregation, originatingMessage, currency, locale, navigator, isModalOpen, bankStyle } = this.props
    if (!bankStyle)
      bankStyle = this.state.bankStyle
    // if (resource[TYPE] === 'tradle.legal.LegalEntity' && resource.name === 'OCTOPUS')
    //   return
    let model = utils.getModel(utils.getType(resource))
    let previousMessageTime = currentMessageTime;
    let isContext = utils.isContext(this.props.resource)
    currentMessageTime = resource._time
    let context = this.state.context
    if (isContext)
      context = this.props.resource
    let props = {
      onSelect: this.selectResource,
      resource,
      bankStyle,
      context,
      application: this.state.application || application,
      to: isAggregation ? resource.to : this.props.resource,
      navigator,
      switchChat: isContext ? this.switchChat.bind(this, resource) : null
    }
    if (utils.isMyProduct(model))
      return  <MyProductMessageRow {...props} />
    if (model.id === TOUR)
      return <TourRow {...props} />
    let moreProps = {
      share: this.share,
      locale,
      // sendStatus: sendStatus,
      currency: this.calcCurrency(),
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

    if (this.props.resource._allowedMimeTypes)
      props.allowedMimeTypes = this.props.resource._allowedMimeTypes
    if (utils.isForm(model) || utils.isItem(model))
      return <FormMessageRow {...props} />

    props.isLast = rowId === this.state.list.length - 1
    props.productToForms = this.state.productToForms
    props.shareableResources = this.state.shareableResources
    props.isAggregation = isAggregation
    // props.addedItem = this.state.addedItem
    props.chooseTrustedProvider = this.chooseTrustedProvider

    if (model.id === FORM_ERROR)
      return <FormErrorRow {...props} />

    if (model.id === FORM_REQUEST || model.id === CONFIRM_PACKAGE_REQUEST || model.id === REFRESH) {
      _.extend(props, {productChooser: this.productChooser.bind(this)})
      return <FormRequestRow {...props} />
    }
    return <MessageRow {...props} />
  }
  calcCurrency() {
    let { resource, currency } = this.props
    let rcurrency = resource.currency
    if (rcurrency)
      rcurrency = rcurrency.id
    return rcurrency || (currency && currency.id)
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

    this._watchSubmit()
  }

  render() {
    let { modelName, resource, bankStyle, navigator, originatingMessage } = this.props
    if (!modelName)
      modelName = MESSAGE
    let application = this.state.application ||  this.props.application
    let { list, isLoading, context, isConnected, isForgetting, allLoaded, pairingData,
          isModalOpen, onlineStatus, loadEarlierMessages, customStyle, allContexts,
          currentContext, menuIsShown, noChat } = this.state

    let me = utils.getMe()

    menuIsShown = me.isEmployee //noChat ? true : menuIsShown
    if (currentContext)
      context = currentContext
    let styles = createStyles({ bankStyle })

    let { assignRM, draft:isApplicationDraft, filledForCustomer } = application || {}

    let hideTextInput
    if (modelName === ORGANIZATION)
      hideTextInput = !utils.hasSupportLine(resource)
    else if (application)
      hideTextInput = !isRM(application) &&  !filledForCustomer && !isApplicationDraft
    let actionSheet = (!hideTextInput || filledForCustomer || isApplicationDraft) && this.renderActionSheet()
    let rightPanel, menuPanel, content, lastFr

    if (!list || !list.length) {
      if (application  ||  navigator.isConnected  &&  utils.getType(resource) === ORGANIZATION) {
        if (isLoading) {
          // if (noChat)
          //   loading = showLoading({bankStyle, component: MessageList, message: translate('loading'), resource, isConnected })
          // else
            content = showLoading({bankStyle, component: MessageList, message: translate('loading'), resource, isConnected })
        }
      }
    }
    else if (noChat) {
      let params = this.getNoChatParams(list, context)
      lastFr = params.lastFr
      if (lastFr) {
        let formContent = this.showForm(lastFr, params.forms, styles, actionSheet, params.canSkip)
        content = formContent.centerPanel
        rightPanel = formContent.rightPanel
        menuPanel = formContent.menuPanel
      }
      else  //if (forms && forms.length)
        content = showLoading({bankStyle, component: MessageList, message: translate('loading'), resource, isConnected })
    }

    let stepIndicator = this.getStepIndicator(context)
    let isContext = resource  &&  utils.isContext(utils.getType(resource))
    // Move to a separate source: also from ApplicationView
    if (application) {
      if  (!noChat) {
        if (!isRM(application) && !filledForCustomer  &&  !isApplicationDraft) {
          let hasRM = application.analyst != null
          let iconName = 'ios-person-add-outline'
          let icolor
          let rmStyle
          if (hasRM) {
            iconName = 'ios-person'
            icolor =  isAndroid() &&  '#CA9DF2' || '#ffffff'
            rmStyle = styles.hasRM
          }
          else {
            icolor = bankStyle.linkColor
            rmStyle = styles.noRM
          }
          assignRM = <View style={styles.footer}>
                        <TouchableOpacity onPress={() => this.assignRM(application)}>
                          <View style={[buttonStyles.menuButton, rmStyle]}>
                            <Icon name={iconName} color={icolor} size={30}/>
                          </View>
                        </TouchableOpacity>
                      </View>
        }
      }
    }

    if (!content  &&  !noChat) {
      let h = utils.dimensions(MessageList).height
      let maxHeight = h - NAV_BAR_HEIGHT
      // Chooser for trusted party verifier
      let isChooser = originatingMessage && originatingMessage.verifiers
      let notRemediation = (context  &&  context.requestFor !== REMEDIATION) ||
                           (isContext && resource.requestFor !== REMEDIATION)

      if (this.hasChatContext())
        maxHeight -= 45
      else if (notRemediation &&  !isChooser  &&  (!isConnected  ||  (!isContext  &&  onlineStatus === false))) //  || (resource[TYPE] === ORGANIZATION  &&  !resource._online)))
        maxHeight -= 35
      if (hideTextInput)
        maxHeight -= 10
      let marginLeft = 10
      // way ScrollView is implemented with position:absolute disrespects the confines of the screen width
      let marginRight = 10
      let width = utils.getContentWidth(MessageList)
      let alignSelf = menuIsShown ? 'flex-start' : 'center'

      // Hide TextInput for shared context since it is read-only
      if (stepIndicator)
        maxHeight -= 12
      if (assignRM)
        maxHeight -= 30

      let textInputHeight = isIphone10orMore() ? 60 : 45

      content = <GiftedMessenger style={{ marginLeft, marginRight, width, alignSelf }} //, marginTop: Platform.OS === 'android' ?  0 : -5}}
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
        textInputHeight={textInputHeight}
        menu={this.generateMenu}
        navigator={navigator}
        keyboardShouldPersistTaps={isWeb() ? 'never' : 'always'}
        keyboardType={'default'}
        keyboardDismissMode={isWeb() ? 'none' : 'on-drag'}
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

    let sepStyle = { height: 1, backgroundColor: 'transparent' }
    if (!allLoaded  && !navigator.isConnected  &&  isForgetting)
      Alert.alert(translate('noConnectionWillProcessLater'))
    let network
    if (originatingMessage)
       network = <NetworkInfoProvider connected={isConnected} resource={resource} online={onlineStatus} />
    if (!context  &&  isContext)
      context = resource
    StatusBar.setHidden(false);
    let progressInfoR = resource || application
    let hash = getRootHash(progressInfoR)

    let bgImage = bankStyle &&  bankStyle.backgroundImage && bankStyle.backgroundImage.url
    let bgStyle
    if (!bgImage  &&  bankStyle.backgroundColor)
      bgStyle = {backgroundColor: bankStyle.backgroundColor}
    else
      bgStyle = {backgroundColor: '#eeeeee'}

    let backgroundImage
    if (bgImage) {
      let {width, height} = utils.dimensions(MessageList)
      let image = [{ width, height: height - 1 }, platformStyles.navBarMargin]
      backgroundImage = <BackgroundImage source={{uri: bgImage}}  resizeMode='cover' style={image} />
    }
    let qrcode
    if (!isWhitelabeled()  &&  pairingData  &&  !me._masterAuthor) {
      let w = isWeb() ? 500 : 350 //Math.floor((utils.getContentWidth(TimHome) / 3))
      // debugger
      let qr = JSON.stringify({
        schema: 'Pair',
        data: pairingData
      })
      let optionalPairingButton = resource._optionalPairing  &&
           <View style={{alignSelf: 'center', justifyContent: 'center'}}>
            <TouchableOpacity onPress={this.showChoiceAlert.bind(this)}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>{translate('cancelPairing')}</Text>
              </View>
            </TouchableOpacity>
         </View>
      qrcode = <Modal animationType={'fade'} visible={isModalOpen} transparent={true} onRequestClose={() => this.closeModal()}>
                 <View style={styles.modalBackgroundStyle}>
                   <View style={{justifyContent: 'center'}}>
                     <View style={styles.qrcode} onPress={()=> this.setState({isModalOpen: true})}>
                       <QRCode inline={true} content={qr} dimension={w} />
                     </View>
                     <View style={[styles.qrcode, {alignItems: 'center', paddingTop: 30}]}>
                       <Text style={{fontSize: 20}}>{translate('scanToLogInToTradle')}</Text>
                       <Text style={{fontSize: 28, fornWeight: '600'}}>{translate('toPairDevices')}</Text>
                     </View>
                     {optionalPairingButton}
                   </View>
                 </View>
               </Modal>
    }
    let navBarMenu
    let separator = getContentSeparator(bankStyle)
    let progressInfo = !noChat && <ProgressInfo recipient={hash} color={bankStyle.linkColor} />
    if (menuIsShown) {
      navBarMenu = <View style={platformStyles.pageLeftMenu}>
                     {this.showMenu(this.props, navigator)}
                   </View>
    }
    if (noChat) {
      if (content) {
        content = <View style={[platformStyles.pageContentWithMenu, {flex: 3}]}>
                    {network}
                    {progressInfo}
                    <View style={ sepStyle } />
                    {content}
                  </View>
      }

      return (
        <PageView style={[platformStyles.container, bgStyle, {alignItems: 'center', height: '100%'}]} separator={separator} bankStyle={bankStyle}>
          {backgroundImage}
          <ChatContext chat={resource} noChat={noChat} form={lastFr && lastFr.form} application={application} context={context} contextChooser={this.contextChooser} shareWith={this.shareWith} bankStyle={bankStyle} allContexts={allContexts}/>
          <View style={{height: '100%', alignSelf: 'center', width: '100%', flexDirection:'row'}}>
            {navBarMenu}
            {content}
            <View style={{flex: content ? 1 : 3}}>
              {rightPanel}
              {menuPanel}
            </View>
          </View>
            {actionSheet}
        </PageView>
      )
    }
    if (menuIsShown) {
      return (
        <PageView style={[platformStyles.container, bgStyle, {justifyContent: 'flex-start', flexDirection: 'row'}]} separator={separator} bankStyle={bankStyle}>
          {backgroundImage}
          {navBarMenu}
          <View style={[platformStyles.pageContentWithMenu, {flex: 4}]}>
            {network}
            <ProgressInfo recipient={hash} color={bankStyle.linkColor} />
            <ChatContext chat={resource} application={application} context={context} contextChooser={this.contextChooser} shareWith={this.shareWith} bankStyle={bankStyle} allContexts={allContexts}/>
            {stepIndicator}
            <View style={ sepStyle } />
            {content}
            {qrcode}
            {actionSheet}
            {assignRM}
          </View>
        </PageView>
      )
    }
    return (
      <PageView style={[platformStyles.container, bgStyle]} separator={separator} bankStyle={bankStyle}>
        {navBarMenu}
        {backgroundImage}
        {network}
        {progressInfo}
        <ChatContext chat={resource} application={application} context={context} contextChooser={this.contextChooser} shareWith={this.shareWith} bankStyle={bankStyle} allContexts={allContexts}/>
        {stepIndicator}
        <View style={ sepStyle } />
        {content}
        {qrcode}
        {actionSheet}
        {assignRM}
      </PageView>
    )
  }
          // <View style={{position: 'absolute', width: 300, height: '100%', flex: 1, bottom: 23, right: 20}}>
          //   {rightPanel}
          // </View>

  getNoChatParams() {
    let { currentContext:context, application, list } = this.state
    if (!application)
      application = this.props.application

    if (!application &&  (!list || !list.length))
      return {}
    let l, lastFr
    let contextId = context ? context.contextId : application.context
    let isFormError

    if (list) {
      l = list.filter(r => r._context  &&  r._context.contextId === contextId).reverse()
      lastFr = l.find(r => (r[TYPE] === FORM_REQUEST || r[TYPE] === FORM_ERROR) && !r._documentCreated)
      isFormError = lastFr && lastFr[TYPE] === FORM_ERROR
    }
    else {
      list = application.submissions.map(s => s.submission)
      lastFr = l.reverse().find(r => utils.getType(r) === FORM_REQUEST)
      this.state.list = list
    }
      // let lastFr = l.find(r => r[TYPE] === FORM_REQUEST && !r._documentCreated)
    let forms = l.filter(r => utils.getType(r) !== PRODUCT_REQUEST  &&  utils.isSubclassOf(utils.getModel(utils.getType(r)), FORM))
    forms = _.uniqBy(forms, ROOT_HASH)

    let applicationSubmitted = list.find(r => r._context  &&  r._context.contextId === contextId  &&  r[TYPE] === APPLICATION_SUBMITTED)
    let canSkip
    if (applicationSubmitted)
      lastFr = applicationSubmitted

    if (lastFr) {
      if (!applicationSubmitted  &&  !isFormError) {
        let product = utils.getModel(lastFr.product)
        if (product.multiEntryForms && product.multiEntryForms.indexOf(lastFr.form) !== -1)
          canSkip = forms.find(f => f[TYPE] === lastFr.form) != null
      }
      return {lastFr, forms, canSkip }
    }
    return { forms }
    // return { lastFr: forms[0], forms }
  }
  showChoiceAlert() {
    const { navigator, resource } = this.props
    Alert.alert(
      translate('pleaseConfirm'),
      null,
      [
        {text: translate('cancel'), onPress: () => console.log('Cancel')},
        {text: 'OK', onPress: () => {
          // navigator.pop()
          this.setState({isModalOpen: false})
          Actions.noPairing(resource)
          // setTimeout(() => Actions.list({to: resource, modelName: MESSAGE}), 1000)
          // setTimeout(() => Actions.getProductList({ resource }), 1000)
        }}
      ]
    )
  }
  showForm(formRequest, forms, styles, actionSheet, canSkip) {
    const { resource, country, locale, currency, bankStyle, navigator, lazy } = this.props
    const { application } = this.state
    let formPanel
    let prop = utils.getModel(APPLICATION).properties.forms
    let applicationSubmitted
    let isFormError = formRequest[TYPE] === FORM_ERROR
    let m
    if (formRequest[TYPE] !== APPLICATION_SUBMITTED) {
      let form
      if (formRequest[TYPE] !== FORM_REQUEST && !isFormError) {
        form = formRequest
        formRequest = null
        m = utils.getModel(form[TYPE])
      }
      else {
        let ftype = isFormError ? formRequest.prefill[TYPE] : formRequest.form
        form = {
          [TYPE]: ftype,
          from: utils.getMe(),
          to: formRequest.from,
          _context: formRequest._context
        }

        if (formRequest.prefill)
          _.extend(form, formRequest.prefill)
        m = utils.getModel(ftype)
      }
      let styles = createStyles({ bankStyle })
      // debugger
      formPanel = <View style={{flex: 2, height: '100%', paddingLeft: 10}}>
                    <NewResource
                       navigator={navigator}
                       model={utils.getLensedModelForType(m.id)}
                       resource={form}
                       originatingMessage={formRequest}
                       chat={resource}
                       country={country}
                       currency={currency || utils.getCompanyCurrency()}
                       locale={locale || utils.getCompanyLocale()}
                       bankStyle={bankStyle}
                       canSkip={canSkip && this.moveToTheNextForm.bind(this, formRequest)}
                       noChat={true}/>
                  </View>
    }

    let rightPanel
    if (forms.length) {
      let width = utils.dimensions(MessageList).width
      rightPanel = <GridList
                   lazy={lazy}
                   modelName={FORM}
                   list={forms}
                   currency={currency || utils.getCompanyCurrency()}
                   locale={locale || utils.getCompanyLocale()}
                   noChat={true}
                   isMenu={true}
                   listView={true}
                   bankStyle={bankStyle}
                   navigator={navigator} />
    }

    let menu
    if (actionSheet)
      menu = this.generateMenu(true)
    return {
      centerPanel: formPanel,
      rightPanel,
      menuPanel: (
             <View style={{position: 'absolute', bottom: 60, right: 20}}>
               {actionSheet}
               {menu}
             </View>
       )
    }
  }
  moveToTheNextForm(formRequest) {
    let form = utils.getModel(formRequest.form)
    Alert.alert(
      translate('areYouSureAboutNextForm', translate(form)),
      null,
      [
        {text: translate('cancel'), onPress: () => console.log('Canceled!')},
        {text: translate('Ok'), onPress: this.onOK.bind(this, formRequest)},
      ]
    )
  }
  onOK(resource) {
    Actions.addMessage({msg: {
      from: resource.to,
      to: resource.from,
      _context: resource._context,
      // _context: self.props.context  ||  resource._context,
      [TYPE]: NEXT_FORM_REQUEST,
      after: resource.form
    }})
    let params = {
      value: {_documentCreated: true, _document: utils.getId(resource)},
      doneWithMultiEntry: true,
      resource,
      meta: utils.getModel(resource[TYPE])
    }
    Actions.addChatItem(params)
    this.setState({isLoading: true})
  }
  hasMenuButton() {
    return !!this.getActionSheetItems()
  }
  getStepIndicator(context) {
    const { application } = this.props
    if (application)
    return
    if (!utils.getMe()._showStepIndicator ||  !context  ||  !context._formsTypes)
      return
// const customStyles = {
//   stepIndicatorSize: 25,
//   currentStepIndicatorSize:30,
//   separatorStrokeWidth: 2,
//   currentStepStrokeWidth: 3,
//   stepStrokeCurrentColor: '#fe7013',
//   stepStrokeWidth: 3,
//   stepStrokeFinishedColor: '#fe7013',
//   stepStrokeUnFinishedColor: '#aaaaaa',
//   separatorFinishedColor: '#fe7013',
//   separatorUnFinishedColor: '#aaaaaa',
//   stepIndicatorFinishedColor: '#fe7013',
//   stepIndicatorUnFinishedColor: '#ffffff',
//   stepIndicatorCurrentColor: '#ffffff',
//   stepIndicatorLabelFontSize: 13,
//   currentStepIndicatorLabelFontSize: 13,
//   stepIndicatorLabelCurrentColor: '#fe7013',
//   stepIndicatorLabelFinishedColor: '#ffffff',
//   stepIndicatorLabelUnFinishedColor: '#aaaaaa',
//   labelColor: '#999999',
//   labelSize: 13,
//   currentStepLabelColor: '#fe7013'
// }
    const { list, step, bankStyle } = this.state
    let rgb = utils.hexToRgb(bankStyle.linkColor)
    rgb = Object.values(rgb).join(',')
    let unfinishedColor = `rgba(${rgb},0.5)`

    let customStyles = {
      stepStrokeCurrentColor: bankStyle.linkColor,
      stepStrokeFinishedColor: bankStyle.linkColor,
      separatorFinishedColor: bankStyle.linkColor,
      stepIndicatorFinishedColor: bankStyle.linkColor,
      stepIndicatorLabelCurrentColor: bankStyle.linkColor,
      stepStrokeUnFinishedColor: unfinishedColor,
      stepIndicatorUnFinishedColor: unfinishedColor,
      currentStepLabelColor:  bankStyle.linkColor,
      // separatorUnFinishedColor: 'transparent',
      separatorUnFinishedColor: unfinishedColor,
      stepIndicatorLabelUnFinishedColor: '#ffffff',
      currentStepStrokeWidth: 3,
      currentStepIndicatorSize: 25,
      stepIndicatorSize: 23,
      stepIndicatorLabelFontSize: 12,
      currentStepIndicatorLabelFontSize: 12,
    }

    const model = utils.getModel(context.requestFor)
    const forms = model.forms
    let allSteps = forms.length
    let startingPosition = Math.floor(context._formsTypes.length / MAX_STEPS) * MAX_STEPS
    // let labels = []
    // for (let i=startingPosition, j=0; i<allSteps  &&  j<MAX_STEPS; j++, i++) {
    //   if (i === context._formsTypes - 1)
    //     labels.push(utils.getModel(model.forms[i]).title)
    // }
    // let number
    let stepCount
    if (allSteps < MAX_STEPS)
      stepCount = allSteps
    else {
      for (let i=list.length - 1; i>=0; i--) {
        let l = list[i]
        if (l[TYPE] === FORM_REQUEST) {
          let idx = forms.findIndex(f => f === l.form)
          allSteps = context._formsTypes.length + (allSteps - idx)
          break
        }
      }
      stepCount = MAX_STEPS
      if (startingPosition + MAX_STEPS > allSteps)
        startingPosition = allSteps - MAX_STEPS
    }

    let appSubmitted = context._appSubmitted
    let iconLeft, iconRight
    let currentPosition = step > -1 ? step : Math.min(context._formsTypes.length - 1, allSteps)

    if (currentPosition < startingPosition) {
      for (; startingPosition>=0  && startingPosition >= currentPosition; startingPosition -= MAX_STEPS);
      if (startingPosition < 0)
        startingPosition = 0
      stepCount = MAX_STEPS
    }

    if (startingPosition >= MAX_STEPS)
      iconLeft = <TouchableOpacity onPress={() => this.setState({step: Math.max(currentPosition - MAX_STEPS, 0)})}  style={{position: 'absolute', left: 10, zIndex: 1000}}>
                   <Icon name='md-arrow-dropleft' size={25} color={bankStyle.linkColor}/>
                 </TouchableOpacity>

    if (appSubmitted  &&  startingPosition + MAX_STEPS < allSteps) // startingPosition + MAX_STEPS < allSteps)
      iconRight = <Icon name='md-arrow-dropright' size={25} color={bankStyle.linkColor} style={{position: 'absolute', right: 10, zIndex: 1000}}/>

    let addStyle = isWeb() ? {marginTop: -15, alignSelf: 'center', width: utils.getContentWidth(MessageList) + 50, paddingBottom: 3} : {marginTop: -15}

    return <View style={addStyle}>
             {iconLeft}
             <StepIndicator
               customStyles={customStyles}
               startingPosition={startingPosition}
               currentPosition={currentPosition}
               onPress={this.onStepIndicatorPress.bind(this)}
               numberDone={appSubmitted  &&  allSteps ||  context._formsTypes.length - 1}
               noActionOnUnfinished={true}
               stepCount={stepCount} />
               {iconRight}
           </View>
  }
  getActionSheetItems() {
    const { resource } = this.props
    let application = this.state.application || this.props.application
    const { noChat, additionalForms, productList } = this.state
    const buttons = []
    const push = btn => buttons.push({ ...btn, index: buttons.length })
    let isApplicationDraft
    if (application) {
      if ((!isRM(application) && !application.filledForCustomer) ||  !additionalForms) { //this.hasAdditionalForms(application))
        if (application.draft) {
          push({
            title: translate('formChooser'),
            callback: () => this.chooseFormForApplication()
          })
          isApplicationDraft = true
        }
        else
          return
      }
      else {
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
    }

    let me = utils.getMe()
    let isDraft = isApplicationDraft || (me.isEmployee  &&  utils.getId(resource) === utils.getId(me.organization))
    if (productList  &&  !isApplicationDraft && !noChat) {
      let title
      if (isDraft)
        title = 'prefillTheProduct'
      else
        title = 'applyForProduct'
      push({
        title: translate(title),
        callback: () => this.productChooser()
      })
      // if (!isWeb()) {
      //   push({
      //     title: translate('Pair'),
      //     callback: () => this.scanQRAndProcess('Pair')
      //   })
      // }
    }

    if (ENV.allowForgetMe && !application) {
      push({
        title: translate('forgetMe'),
        callback: () => this.forgetMe()
      })
    }

    if (isDraft) {
      let { list, context, currentContext } = this.state
      let ctx = currentContext || context
      if (!ctx && application)
        ctx = application._context
      if (ctx  &&  list  &&  list.length &&  list[list.length - 1][TYPE] !== PRODUCT_REQUEST) {
        push({
          title: translate('submitDraft', translate(utils.getModel(ctx.requestFor))),
          callback: () => {
            Alert.alert(
              translate('pleaseConfirm'),
              null,
              [
                {text: translate('cancel'), onPress: () => console.log('Cancel')},
                {text: 'OK', onPress: () => {
                  Actions.submitDraftApplication({context: ctx})
                  // this.props.navigator.pop()
                }}
              ]
            )
          }
        })
        push({
          title: translate('completeApplicationForClient', translate(utils.getModel(ctx.requestFor))),
          callback: () => {
            Alert.alert(
              translate('pleaseConfirm'),
              null,
              [
                {text: translate('cancel'), onPress: () => console.log('Cancel')},
                {text: 'OK', onPress: () => {
                  Actions.submitCompletedApplication({context: ctx})
                  // this.props.navigator.pop()
                }}
              ]
            )
          }
        })
      }
    }
    push({
      title: translate('cancel'),
      callback: () => {}
    })

    return buttons
  }
  onStepIndicatorPress(step) {
    const { context, currentContext } = this.state
    this.setState({step})

    Actions.stepIndicatorPress({context: currentContext || context, step, to: this.props.resource})
  }
  chooseFormForApplication() {
    let { application, navigator, resource } = this.props
    let { additionalForms, bankStyle } = this.state
    let model = utils.getModel(application.requestFor)
    navigator.push({
      title: translate(model),
      componentName: 'StringChooser',
      backButtonTitle: 'Back',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        strings:  additionalForms, // model.additionalForms,
        bankStyle,
        callback:  val => this.requestForm({val, resource, application, isChat: true}),
        isReplace: application.filledForCustomer
      }
    })
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
      componentName: 'ContextChooser',
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
      componentName: 'ResourceList',
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
    const { bankStyle } = this.state
    const { to, currency, navigator } = this.props
    navigator.push({
      title: translate('trustedProviders'),
      titleTextColor: bankStyle.verifiedBorderColor,
      backButtonTitle: 'Back',
      componentName: 'VerifierChooser',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      // titleTextColor: '#7AAAC3',
      passProps:  {
        modelName: ORGANIZATION,
        provider: to,
        bankStyle,
        originatingMessage: r,
        currency
      }
    });
  }
  generateMenu(show) {
    let { noChat } = this.state
    if (noChat || !show || !this.ActionSheet)
      return <View/>
    let home = utils.getMe().isEmployee  &&  !this.state.noChat && this.addHomeButton()

    return  <View style={{flexDirection: 'row'}}>
              {home}
              <TouchableOpacity underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
                {this.paintMenuButton()}
              </TouchableOpacity>
            </View>
  }

  paintMenuButton() {
    let application = this.state.application || this.props.application

    if (application) {
      if (!application.draft) {
        if ((!isRM(application) && !application.filledForCustomer)  ||  !this.state.additionalForms) // !this.hasAdditionalForms(application))
          return
      }
    }
    return  <View style={[buttonStyles.menuButton, {opacity: 0.4}]}>
              <Icon name={MenuIcon.name}  size={33}  color={MenuIcon.color} />
            </View>
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
      translate('confirmForgetMe', utils.getDisplayName({ resource })),
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
    Actions.addMessage({msg: value, application});
  }
  switchChat(resource) {
    let to = resource.from.organization  ||  resource.from
    this.props.navigator.push({
      title: to.title,
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      passProps: {
        resource: to,
        modelName: MESSAGE,
        currency: this.calcCurrency(),
        bankStyle:  this.state.bankStyle
      }
    })
  }
  productChooser() {
    const { productList, bankStyle } = this.state
    let prModel = utils.getModel(PRODUCT_REQUEST)
    let prop = prModel.properties.requestFor
    let model = utils.getModel(productList.form)
    let resource = {
      [TYPE]: model.id,
      from: utils.getMe(),
      to: productList.from
    }
    if (productList._context)
      resource._context = productList._context
    this.props.navigator.push({
      title: translate('pleaseChoose'),
      componentName: 'StringChooser',
      backButtonTitle: 'Back',
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        strings:   productList.chooser.oneOf,
        bankStyle,
        callback:  (val) => {
          resource[prop.name] = val
          Actions.addChatItem({resource, disableFormRequest: productList})
        },
      }
    });
  }
}
reactMixin(MessageList.prototype, Reflux.ListenerMixin);
reactMixin(MessageList.prototype, TimerMixin)
reactMixin(MessageList.prototype, HomePageMixin)
MessageList = makeResponsive(MessageList)
MessageList = makeStylish(MessageList)

var createStyles = utils.styleFactory(MessageList, function ({ dimensions, bankStyle }) {
  let isAndroid = Platform.OS === 'android'
  let bgcolor = isAndroid && 'transparent' || bankStyle.linkColor
  let buttonBg = bankStyle.buttonBgColor ||  bankStyle.linkColor
  let buttonColor = bankStyle.buttonColor || '#ffffff'
  let { width, height } = utils.dimensions(MessageList)
  return StyleSheet.create({
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
    hasRM: {
      backgroundColor: isAndroid  &&  'transparent' ||  '#CA9DF2',
      opacity: isAndroid && 1 || 0.5
    },
    noRM: {
      backgroundColor: isAndroid && 'transparent' || '#ffffff',
      opacity: 0.7,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: bgcolor
    },
    modalBackgroundStyle: {
      // backgroundColor: 'rgba(0, 0, 0, 0.7)',
      // backgroundColor: 'rgba(27, 87, 136, 0.8)',
      backgroundColor: '#fff',
      justifyContent: 'center',
      padding: 20,
      height,
    },
    qrcode: {
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: 10
    },
    splashLayout: {
      alignItems: 'center',
      justifyContent: 'center',
      width,
      height
    },
    button: {
      backgroundColor: buttonBg,
      flexDirection: 'row',
      justifyContent: 'center',
      width: 350,
      marginTop: 20,
      alignSelf: 'center',
      height: 50,
      borderRadius: 15,
      marginRight: 20
    },
    buttonText: {
      fontSize: 20,
      color: buttonColor,
      alignSelf: 'center'
    },
    accent: {
      width: 12,
      borderLeftColor: bankStyle.accentColor || 'orange',
      borderLeftWidth: 5,
    },
    dividerText: {
      marginBottom: 5,
      fontSize: 26,
      fontWeight: '500',
      color: bankStyle.linkColor,
      fontFamily: bankStyle.headerFont
    },
  })
})
module.exports = MessageList;
