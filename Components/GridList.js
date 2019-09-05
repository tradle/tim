
import React, { Component } from 'react'
import {
  ListView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  View,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'
import debounce from 'p-debounce'
import Reflux from 'reflux'
import constants from '@tradle/constants'
import Icon from 'react-native-vector-icons/Ionicons'
import _ from 'lodash'
import reactMixin from 'react-mixin'
import { makeResponsive } from 'react-native-orient'
import InfiniteScrollView from 'react-native-infinite-scroll-view'

import { Text } from './Text'
import NoResources from './NoResources'
import ResourceRow from './ResourceRow'
import GridRow from './GridRow'
import VerificationRow from './VerificationRow'
import CheckRow from './CheckRow'
import PageView from './PageView'
import { showBookmarks, showLoading, getContentSeparator } from '../utils/uiUtils'
import ActionSheet from './ActionSheet'
import NotFoundRow from './NotFoundRow'
import utils, {
  translate
} from '../utils/utils'
import HomePageMixin from './HomePageMixin'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import buttonStyles from '../styles/buttonStyles'
import NetworkInfoProvider from './NetworkInfoProvider'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import appStyle from '../styles/appStyle.json'
import StyleSheet from '../StyleSheet'
import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'
import ENV from '../utils/env'
import SearchBar from './SearchBar'
import formDefaults from '../data/formDefaults'

const FORM_ERROR = 'tradle.FormError'
const APPLICATION_SUBMISSION = 'tradle.ApplicationSubmission'

const SEARCH_LIMIT = 10

var {
  TYPE,
  ROOT_HASH,
} = constants

var {
  PROFILE,
  ORGANIZATION,
  FINANCIAL_PRODUCT,
  VERIFICATION,
  MESSAGE,
  CUSTOMER_WAITING,
  SELF_INTRODUCTION,
  FORM,
  ENUM,
  SETTINGS,
} = constants.TYPES

const APPLICATION = 'tradle.Application'
const VERIFIED_ITEM = 'tradle.VerifiedItem'
const CHECK = 'tradle.Check'

const METHOD = 'tradle.Method'
const BOOKMARK = 'tradle.Bookmark'

var excludeFromBrowsing = [
  FORM,
  ENUM,
  BOOKMARK,
  // INTRODUCTION,
  SELF_INTRODUCTION,
  CUSTOMER_WAITING,
  FINANCIAL_PRODUCT,
  'tradle.ForgetMe',
  'tradle.ForgotYou',
  'tradle.GuestSessionProof',
  'tradle.MerkleNode',
  'tradle.MerkleLeaf',
  'tradle.StylesPack',
  'tradle.ModelsPack',
  'tradle.ShareContext',
  'tradle.File',
  'tradle.Ack',
  'tradle.AppState',
  'tradle.Aspect',
  'tradle.ConfirmPackageRequest',
  'tradle.IdentityPublishRequest',
  'tradle.IdentityPublished',
  'tradle.SecurityCode',
  'tradle.TermsAndConditions',
  PROFILE
]

var cnt = 0

class GridList extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    resource: PropTypes.object,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
    filter: PropTypes.string,
    sortProperty: PropTypes.string,
    prop: PropTypes.object,
    isAggregation: PropTypes.bool,
    isRegistration: PropTypes.bool,
    isBacklink: PropTypes.bool,
    isForwardlink: PropTypes.bool,
    // backlinkList: PropTypes.array
  };
  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: function(row1, row2) {
        if (row1 !== row2)
          return true
        if (row1  &&  row2)
          return row1 !== row2 || row1._online !== row2._online || row1.style !== row2.style
        return true
      }
    })
    let {resource, modelName, prop, filter, serverOffline, search} = this.props
    let model = utils.getModel(modelName)

    this.isSmallScreen = !utils.isWeb() &&  utils.dimensions(GridList).width < 736
    this.limit = 20 //this.isSmallScreen ? 20 : 40
    this.state = {
      isLoading: true,
      dataSource,
      allLoaded: false,
      allowToAdd: prop  &&  prop.allowToAdd,
      filter: filter,
      hideMode: false,  // hide provider
      serverOffline: serverOffline,
      isConnected: this.props.navigator.isConnected,
      userInput: '',
      refreshing: false,
      notFoundMap: {},
      resource: search  &&  resource,
      isGrid:  !this.isSmallScreen  &&  !model.abstract  &&  !model.isInterface  &&  modelName !== APPLICATION_SUBMISSION
    };
    if (props.multiChooser) {
      this.state.chosen = {}
      if (prop  &&  resource[prop.name])
        resource[prop.name].forEach((r) => this.state.chosen[utils.getId(r)] = r)
    }
    let isRegistration = this.props.isRegistration ||  (resource  &&  resource[TYPE] === PROFILE  &&  !resource[ROOT_HASH]);
    if (isRegistration)
      this.state.isRegistration = isRegistration;
    let routes = this.props.navigator.getCurrentRoutes()
    if (this.props.chat) {
      this.state.sharedWith = {}
      routes[routes.length - 1].onRightButtonPress = this.done.bind(this)
    }
    else if (this.props.onDone) {
      this.state.sharedWith = {}
      routes[routes.length - 1].onRightButtonPress = this.props.onDone.bind(this, this.state.chosen)
    }
    this.numberOfPages = 0
    this.offset = 0
    this.contentHeight = 0
    this._loadMoreContentAsync = debounce(this._loadMoreContentAsync.bind(this), 500)
  }
  done() {
    let orgs = []
    for (let orgId in this.state.sharedWith) {
      if (!this.state.sharedWith[orgId])
        continue
      orgs.push(orgId)
    }
    this.props.callback(orgs)
  }
  componentWillReceiveProps(props) {
    let { resource, isBacklink, search, forwardlink, provider } = props
    if (isBacklink)
      this._handleBacklink(props)
    else if (forwardlink) {
      this.state.dataSource = this.state.dataSource.cloneWithRows([])
      this.state.isLoading = true;
      Actions.getItem({resource, search, action: 'list', forwardlink})
    }
    if (provider  &&  (!this.props.provider || utils.getId(this.props.provider) !== (utils.getId(provider))))
      Actions.list({modelName: ORGANIZATION})
  }
  _handleBacklink(props) {
    let { resource, prop, application } = props
    if (resource[prop.name]) {
      this.state.dataSource = this.state.dataSource.cloneWithRows(resource[prop.name])
      return
    }
    else
      this.state.dataSource = this.state.dataSource.cloneWithRows([])
    if (!_.isEqual(this.props.prop, props.prop))
      this.state.isLoading = true;

    if (application) {
      if (prop.name === this.props.prop.name) {
        if (!application[prop.name]  &&  !this.props.application[prop.name])
          return
        let rows = (!application[prop.name]  &&  [])  ||  application[prop.name]
        this.state.dataSource = this.state.dataSource.cloneWithRows(rows)
        return
      }

      if (!application[prop.name])
        this.state.dataSource = this.state.dataSource.cloneWithRows([])
      else
        this.state.dataSource = this.state.dataSource.cloneWithRows(application[prop.name])
    }
    else {
      let params = this.getParamsForBacklinkList(props)
      Actions.list(params)
    }
  }
  getParamsForBacklinkList(props) {
    let { modelName, _readOnly, sortProperty,
          resource, prop, application, isAggregation, isChooser, listView } = props
    let params = {
      modelName: modelName,
      // limit: 10
    };
    if (_readOnly)
      params._readOnly = true

    if (isAggregation)
      params.isAggregation = true;
    if (sortProperty)
      params.sortProperty = sortProperty;
    if (prop) {
      let m = utils.getModel(resource[TYPE])
      params.prop = prop // m.properties[prop.name];
      // case when for example clicking on 'Verifications' on Form page
      if (m.interfaces)
        params.resource = resource
      else if (params.prop.items  &&  params.prop.items.backlink)
        params.to = resource
      if (application) {
        params.search = true
        params.application = application
      }
    }
    else
      params.to = resource
    params.isChat =  !isChooser
    params.listView = listView
    return params
  }
  getParamsForApplicationBacklinks(props) {
    let { sortProperty, isBacklink, resource, prop, application } = props
    let params = {
      resource
    }

    if (sortProperty)
      params.sortProperty = sortProperty;
    if (!prop)
      return params

    // case when for example clicking on 'Verifications' on Form page
    if (isBacklink) {
      params.backlink = prop
      params.to = resource
    }
    if (application) {
      params.search = true
      params.application = application
    }
    return params
  }
  componentWillUnmount() {
    if (this.props.navigator.getCurrentRoutes().length === 1)
      StatusBar.setHidden(true)
  }
  onScroll(event) {
    if (this.state.refreshing || this.props.isModel)
      return

    let currentOffset = event.nativeEvent.contentOffset.y
    this.contentHeight = event.nativeEvent.contentSize.height
    let delta = currentOffset - (this.offset || 0)
    this.direction = delta > 0 || Math.abs(delta) < 3 ? 'down' : 'up'
    this.offset = currentOffset
  }
  componentWillMount() {
    // debounce(this._loadMoreContentAsync.bind(this), 1000)
    let { chat, resource, navigator, search, application, prop, bookmark,
          modelName, isModel, isBacklink, isForwardlink, forwardlink, isChooser, multiChooser } = this.props
    if (chat) {
      utils.onNextTransitionEnd(navigator, () => {
        Actions.listSharedWith(resource, chat)
      });
      return
    }
    if (search  ||  application) {
      if (isModel) {
        this._prepareModels()
        return
        // Actions.listModels({modelName})
      }
      else if (isBacklink) { //  &&  application) {
        if (resource[prop.name]) {
          this.state.isLoading = false
          this.state.dataSource = this.state.dataSource.cloneWithRows(resource[prop.name])
          return
        }
      }
      else if (!isForwardlink) {
console.log('GridList.componentWillMount: filterResource', resource)
        Actions.list({
          modelName,
          filterResource: resource,
          bookmark,
          search: true,
          first: true,
          limit: this.limit
        })
        return
      }
    }
    let params = this.getParamsForBacklinkList(this.props)
    StatusBar.setHidden(false);
    if (isBacklink)
      Actions.exploreBacklink(this.props.resource, prop, true)
      // Actions.list(params)
    else if (isForwardlink)
      Actions.getItem({resource, search, action: 'list', forwardlink})
    else if (isChooser) {
      if (multiChooser)
        params.pin = resource[prop.name]
      params.resource = resource
      params.isChooser = true
      Actions.list(params)
    }
    else
      utils.onNextTransitionEnd(navigator, () => {
        Actions.list(params)
      });
  }

  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  _prepareModels() {
    const { modelName } = this.props
    let me = utils.getMe()
    if (me.isEmployee) {
      const m = utils.getModel(modelName)
      // Show models that are present and call for all
      let list
      if (m.abstract)
        list = utils.getAllSubclasses(m)
      else {
        list = Object.values(utils.getModels())
        list = this.filterModels(list)
      }
      this.state.dataSource = this.state.dataSource.cloneWithRows(list)
      Actions.getModels(utils.getId(me.organization))
    }
    else {
      let modelsArr = this.filterModels(this.state.list)
      this.state.dataSource = this.state.dataSource.cloneWithRows(modelsArr)
    }
  }
  onAction(params) {
    let { action, error, list, resource, endCursor } = params
    if (error)
      return;
    let { navigator, modelName, isModel, search, prop, forwardlink, isBacklink } = this.props
    if (action === 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }
    if (action == 'newStyles'  &&  modelName === ORGANIZATION) {
      this.setState({newStyles: resource})
      return
    }
    if (action === 'models') {
      if (!isModel)
        return
      list = this.filterModels(list)
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(list),
        list: list
      })
      return
    }
    if (action === 'addItem'  ||  action === 'addMessage') {
      this._addItemOrMessage(params)
      return
    }
    if (action === 'talkToEmployee') {
      this._talkToEmployee(params)
      return
    }
    let { chat, isForwardlink, multiChooser, isChooser, sharingChat, isTest } = this.props
    if (action === 'list') {
      // First time connecting to server. No connection no providers yet loaded
      if (!list  ||  !list.length) {
        if (params.alert)
          Alert.alert(params.alert)
        else if (search  &&  !isModel) {
          if (params.isSearch  &&   resource) {
            // Make sure that is there was modal that it'll be closed before the message appears
            // otherwise it stays and blocks all taps
            // setTimeout(() => {
              if (params.errorMessage)
                this.errorAlert(params.errorMessage, params.query)
              else if (!this.state.refreshing)
                this.errorAlert('noResourcesForCriteria')
            // }, 1)
          }
          this.setState({refreshing: false, isLoading: false})
        }
        else if (prop  &&  prop.allowToAdd)
          this.setState({isLoading: false, list: null})
        return
      }
      if (params.isTest  !== isTest)
        return
      if (list  &&  list.length) {
        let m = utils.getModel(list[0][TYPE])
        if (m.id !== modelName)  {
          let model = utils.getModel(modelName)
          if (model.isInterface  ||  modelName === MESSAGE) {
            if (!m.interfaces  ||  m.interfaces.indexOf(modelName) === -1)
              return
          }
          else if (!utils.isSubclassOf(m, modelName)) {
            if (!isForwardlink  ||  !resource  ||  resource[ROOT_HASH] !== this.props.resource[ROOT_HASH])
              return
            // Application forward links
            if (modelName !== VERIFIED_ITEM  ||  m.id !== VERIFICATION)
              return
          }
        }
      }
    }
    if ((action !== 'list' &&  action !== 'listSharedWith')  ||  !list || params.isAggregation !== this.props.isAggregation)
      return;
    if (action === 'list'  &&  chat)
      return
    if (action === 'listSharedWith'  &&  !chat)
      return
    let allLoaded
    if (list.length) {
      let type = list[0][TYPE];
      if (type  !== modelName  &&  !isBacklink  &&  !isForwardlink) {
        let m = utils.getModel(type);
        if (!utils.isSubclassOf(m, modelName))
          return;
      }
      if (multiChooser  &&  !isChooser) {
        let sharingChatId = utils.getId(sharingChat)
        list = list.filter(r => {
          return utils.getId(r) !== sharingChatId
        })
      }
      if (isChooser)
        list = utils.applyLens({prop, list})
      if (search) {
        if (params.direction === 'up')
          --this.numberOfPages
        else
          ++this.numberOfPages
      }

      if (list) {
        if (list.length < this.limit)
          allLoaded = true
      }
      if (!params.first) {
        let l = this.state.list
        if (l  &&  !isBacklink  &&  !isForwardlink) { //  &&  l.length === this.limit ) {
          let newList = []
          for (let i=0; i<l.length; i++)
            newList.push(l[i])
          list.forEach((r) => newList.push(r))
          list = newList
        }
      }
    }

    let state = {
      dataSource: this.state.dataSource.cloneWithRows(list),
      list: list,
      isLoading: false,
      refreshing: false,
      allLoaded: allLoaded,
      endCursor: endCursor
    }
    if (this.state.endCursor)
      state.prevEndCursor = this.state.endCursor
    if (!list.length) {
      if (!this.state.filter  ||  !this.state.filter.length)
        this.setState({isLoading: false})
      else
        this.setState(state)
      return;
    }

    if (search  &&  resource)
      state.resource = resource

    if (isBacklink) {
      if (!params.prop)
        return
      if (!_.isEqual(params.prop, prop))
        return
    }

    if (isForwardlink  &&  params.forwardlink !== forwardlink)
      return

    _.extend(state, {
      forceUpdate: params.forceUpdate,
      dictionary: params.dictionary,
    })

    if (params.sharedWith) {
      state.sharedWithMapping = params.sharedWith
      let sharedWith = {}
      list.forEach((r) => {
        sharedWith[utils.getId(r)] = true
      })
      state.sharedWith = sharedWith
    }

    this.setState(state)
  }
  _talkToEmployee(params) {
    if (!params.to)
      return
    let style = this.mergeStyle(params.to.style)
    let route = {
      title: params.to.name,
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      passProps: {
        resource: params.to,
        filter: '',
        modelName: MESSAGE,
        currency: params.to.currency,
        bankStyle: style,
        dictionary: params.dictionary
      },
    }
    let me = utils.getMe()

    let msg = {
      message: translate('customerWaiting', me.firstName),
      _t: SELF_INTRODUCTION,
      identity: params.myIdentity,
      from: me,
      to: params.to
    }
    // let sendNotification = (resource.name === 'Rabobank'  &&  (!me.organization  ||  me.organization.name !== 'Rabobank'))
    // Actions.addMessage(msg, true, sendNotification)
    const { navigator } = this.props
    utils.onNextTransitionEnd(navigator, () => Actions.addMessage({msg: msg})) //, true))
    if (navigator.getCurrentRoutes().length === 3)
      navigator.replace(route)
    else
      navigator.push(route)
  }
  _addItemOrMessage(params) {
    const { action, resource } = params
    const { modelName, isModel, isBacklink, prop } = this.props
    let model = action === 'addMessage'
              ? utils.getModel(modelName)
              : utils.getModel(resource[TYPE]);
    if (action === 'addItem'  &&  model.id !== modelName) {
      if (model.id === BOOKMARK  &&  !isModel) {
        if (this.state.resource  &&  this.state.resource[TYPE] === resource.bookmark[TYPE]) {
          Alert.alert('Bookmark was created')
        }
      }
      return
    }
    if (action === 'addMessage'  &&  modelName !== PROFILE)
      return
    // this.state.isLoading = true;
    if (isBacklink)
      Actions.exploreBacklink(this.props.resource, prop, true)
    else
      Actions.list({
        query: this.state.filter,
        modelName: model.id,
        to: this.props.resource,
        sortProperty: model.sort
      });
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.forceUpdate)
      return true
    if (!_.isEqual(this.state.resource, nextState.resource)) {
      return true
    }
    if (this.props.orientation !== nextProps.orientation)
      return true
    if (this.state.chosen !== nextState.chosen)
      return true
    if (this.props.isBacklink  &&  nextProps.isBacklink) {
      if (this.props.prop.name !== nextProps.prop.name)
        return true
      if (this.props.backlinkList  &&  this.props.backlinkList.length !== nextProps.backlinkList.length)
        return true
    }
    if (this.props.isForwardlink  &&  nextProps.isForwardlink) {
      if (this.props.forwardlink !== nextProps.forwardlink)
        return true
    }
    if (this.state.dataSource.getRowCount() !== nextState.dataSource.getRowCount())
      return true
    // if (this.state.hideMode !== nextState.hideMode)
    //   return true
    if (this.props.provider !== nextProps.provider)
      return true
    if (this.state.serverOffline !== nextState.serverOffline)
      return true
    if (nextState.isConnected !== this.state.isConnected)
      return true
    if (this.state.newStyles !== nextState.newStyles)
      return true
    if (!this.state.list  ||  !nextState.list  ||  this.state.list.length !== nextState.list.length)
      return true
    for (let i=0; i<this.state.list.length; i++) {
      if (this.state.list[i].numberOfForms !== nextState.list[i].numberOfForms)
        return true
      if (this.state.list[i][ROOT_HASH] !== nextState.list[i][ROOT_HASH])
        return true
      if (this.state.list[i]._online !== nextState.list[i]._online)
        return true
    }
    return false
  }

  selectResource({resource}) {
    let me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    let { modelName, search, bankStyle, navigator, currency } = this.props
    let isContact = modelName === PROFILE;

    let isOrganization = modelName === ORGANIZATION
    let isApplication = modelName === APPLICATION
    if (!isApplication  &&   utils.isMessage(resource)  ||  utils.isStub(resource)) {
      this.selectMessage(resource)
      return;
    }
    let { prop } = this.props
    if (prop) {
      if (me) {
        if  (modelName != PROFILE) {
          this._selectResource(resource);
          return
        }
        if (utils.isMe(resource)  ||
           (prop  &&  this.props.resource  &&  utils.isMe(this.props.resource))) {
          this._selectResource(resource);
          return;
        }
      }
      else {
        if (this.state.isRegistration) {
          this._selectResource(resource);
          return;
        }
      }
    }
    let title
    if (isContact)
      title = resource.firstName
    else if (isApplication) {
      let aTitle = resource.applicantName || resource.applicant.title
      if (aTitle)
        title = aTitle  + '  --  ' + me.organization.title  + '  →  ' + utils.getDisplayName(resource)
      else {
        title = me.organization.title  + '  --  ' + utils.getDisplayName(resource)
      }
    }
    else if (me.isEmployee)
      title = me.organization.title + '  →  ' + utils.getDisplayName(resource)
    else
      title = resource.name; //utils.getDisplayName(resource, model.properties);
    let style
    if (resource.style || !bankStyle)
      style = this.mergeStyle(resource.style)
    else
      style = bankStyle
    if (isApplication) {
      let route = {
        title: title,
        componentName: 'ApplicationView',
        // titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        passProps: {
          resource: resource,
          search: search,
          bankStyle: style,
          application: resource
        }
      }
      // if (utils.isRM(resource)) {
        route.rightButtonTitle = 'Edit'
        route.onRightButtonPress = {
          title: title,
          componentName: 'NewResource',
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            bankStyle: style,
            model: utils.getModel(resource[TYPE]),
            resource: resource,
            currency: currency,
          }
        }
      // }
      navigator.push(route)
      return
    }
    let route = {
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      title: title,
      passProps: {
        resource: search ? resource._context : resource,
        filter: '',
        search: search,
        modelName: MESSAGE,
        application: search  ? resource : null,
        currency: resource.currency,
        bankStyle: style,
      }
    }

    if (isContact) { //  ||  isOrganization) {
      route.title = resource.firstName
      let isMe = isContact ? resource[ROOT_HASH] === me[ROOT_HASH] : true;
      if (isMe) {
        route.onRightButtonPress.rightButtonTitle = 'Edit'
        route.onRightButtonPress.onRightButtonPress = {
          title: title,
          componentName: 'NewResource',
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            bankStyle: style,
            model: utils.getModel(resource[TYPE]),
            resource: resource,
            currency: currency,
          }
        }
      }
    }
    navigator.push(route);
  }
  selectMessage(resource) {
    let { modelName, search, bankStyle, navigator, currency, prop, returnRoute, callback, application, isBacklink } = this.props
    if (callback) {
      callback(prop, resource); // HACK for now
      if (returnRoute)
        navigator.popToRoute(returnRoute);
      else
        navigator.pop()
      return;
    }

    if (modelName === BOOKMARK) {
      if (!bankStyle)
        bankStyle = this.state.bankStyle
      showBookmarks({resource, searchFunction: this.searchWithFilter.bind(this), navigator, bankStyle, currency})
      return
    }
    let rType = utils.getType(resource)
    if (rType === MESSAGE)
      rType = resource._payloadType
    const rModel = utils.getModel(rType)
    const isStub = utils.isStub(resource)
    const isFormError = rType === FORM_ERROR
    const isForm = utils.isForm(rModel)

    const isVerification = utils.isVerification(rModel)
    let title
    if (isVerification) {
      if (isStub)
        title = translate(rModel)
      else {
        let type = utils.getType(resource.document)
        title = 'Verification - ' + translate(utils.getModel(type))
      }
    }
    else {
      title = translate(rModel)

      let dn
      if (isFormError) {
        if (!isStub) {
          let pModel = utils.getModel(utils.getType(resource.prefill))
          dn = translate(pModel)
        }
      }
      else
        dn = utils.getDisplayName(resource)
      title = (dn ? dn + ' -- '  : '') + title;
    }
    const isCheck = utils.isSubclassOf(rModel, CHECK)
    let route = {
      title: title,
      componentName: isCheck  &&  'CheckView'  ||  'MessageView',
      backButtonTitle: 'Back',
      passProps: {
        resource,
        search,
        application: application,
        bankStyle: bankStyle || defaultBankStyle
      }
    }
    let isRM = utils.isRM(application)
    if (isBacklink) {
      route.passProps.backlink = prop

      if (application  &&  isRM) {
        let editView
        _.extend(route.passProps, {
          ref: ref => {
            editView = ref
          }
        })
        if (isForm) {
          _.extend(route, {
            rightButtonTitle: 'VerifyOrCorrect',
            onRightButtonPress: () => {
              if (editView.state.isVerifier)
                Actions.verifyOrCorrect({ resource: editView.props.resource })
              else
                editView.setState({isVerifier: true})
            }
          })
          navigator.push(route)
          return
        }
      }
    }
    // Edit verifications
    let canEdit = isRM  &&  isVerification //= isFormError  &&   isRM
    if (!canEdit  &&  !isVerification  &&  !rModel.notEditable)
      canEdit = utils.isMyMessage({resource})
    // if ((!isStub  &&  !isVerification)  ||  canEdit  ||  utils.isMyMessage({resource})) {
    // if (canEdit) {
    if (!isStub  &&  canEdit) { //||  utils.isMyMessage({resource})) {
      _.extend(route, {
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: title,
          componentName: 'NewResource',
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: rModel,
            resource: resource,
            search: !isBacklink  &&  search,
            serverOffline: this.props.serverOffline,
            bankStyle: bankStyle || defaultBankStyle
          }
        },
      })
    }
    navigator.push(route)
  }

  _selectResource(resource) {
    let { modelName, style, currency, prop, navigator, returnRoute, callback, bankStyle } = this.props
    let model = utils.getModel(modelName);
    let title
    let prefill = utils.getPrefillProperty(model)
    if (prefill) {
      let pm = utils.getModel(resource[prefill.name][TYPE])
      if (pm)
        title = translate(pm)
    }
    if (!title)
      title = utils.getDisplayName(resource);

    let newTitle = title;
    if (title.length > 20) {
      let t = title.split(' ');
      newTitle = '';
      t.forEach((word) => {
        if (newTitle.length + word.length > 20)
          return;
        newTitle += newTitle.length ? ' ' + word : word;
      })
    }

    let route = {
      title: utils.makeTitle(newTitle),
      componentName: 'ResourceView',
      parentMeta: model,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        bankStyle: style,
        currency: currency
      },
    }
    // Edit resource
    let me = utils.getMe();
    if (callback  &&  (me || this.state.isRegistration) &&  prop) {
      callback(prop, resource); // HACK for now
      if (returnRoute)
        navigator.popToRoute(returnRoute);
      else
        navigator.pop()
      return;
    }
    let rType = utils.getType(resource)
    if (me                       &&
       !model.isInterface        &&
       (resource[ROOT_HASH] === me[ROOT_HASH]  ||  rType !== PROFILE)) {
      let passProps
      if (prefill) {
        passProps = {
          containerResource: resource,
          resource: resource.prefill,
          prop: prefill,
          model: utils.getModel(resource[prefill.name][TYPE]),
          bankStyle: bankStyle || defaultBankStyle
        }
      }
      else {
        passProps = {
          model: utils.getModel(rType),
          bankStyle: style || defaultBankStyle,
          resource: me
        }
      }
      route.rightButtonTitle = 'Edit'
      route.onRightButtonPress = /*() =>*/ {
        title: 'Edit',
        backButtonTitle: 'Back',
        componentName: 'NewResource',
        rightButtonTitle: 'Done',
        titleTextColor: '#7AAAC3',
        passProps
      }
    }
    navigator.push(route);
  }

  selectModel(model) {
    let { navigator, bankStyle, currency, exploreData } = this.props
    navigator.push({
      title: translate('searchSomething', translate(model)),
      backButtonTitle: 'Back',
      componentName: 'GridList',
      passProps: {
        modelName: model.id,
        resource: {},
        bankStyle: bankStyle,
        currency: currency,
        limit: 20,
        exploreData,
        search: true
      },
      rightButtonTitle: 'Search',
      onRightButtonPress: {
        title: translate('searchSomething', translate(model)),
        componentName: 'NewResource',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Done',
        passProps: {
          model: Store.getAugmentedModel(model),
          resource: {[TYPE]: model.id},
          searchWithFilter: this.searchWithFilter.bind(this),
          search: true,
          exploreData,
          bankStyle: bankStyle || defaultBankStyle,
        }
      }
    })
  }
  filterModels(models, filter) {
    let mArr = []
    let filterLower = filter && filter.toLowerCase()
    models.forEach((mm) => {
      if (excludeFromBrowsing.indexOf(mm.id) === -1  &&
          !mm.isInterface                   &&
          !mm.inlined                       &&
          !mm.abstract                      &&
           mm.id !== MESSAGE                &&
           mm.id !== APPLICATION_SUBMISSION &&
          !utils.isEnum(mm)                 &&
          !utils.isSubclassOf(mm, METHOD)   &&
          !utils.isSubclassOf(mm, FINANCIAL_PRODUCT)) { //mm.interfaces  && mm.interfaces.indexOf(this.props.modelName) !== -1) {
        if (filter) {
          if (translate(mm).toLowerCase().indexOf(filterLower) !== -1)
            mArr.push(mm)
        }
        else
          mArr.push(mm)
      }
    })
    return mArr
  }
  onSearchChange(filter) {
    let { search, isModel, modelName, listView, prop, resource, isChooser } = this.props
    this.state.filter = typeof filter === 'string' ? filter : filter.nativeEvent.text
    if (search  &&  isModel) {
      let mArr = this.filterModels(this.state.list, this.state.filter)
      this.setState({dataSource: this.state.dataSource.cloneWithRows(mArr)})
      return
    }
    Actions.list({
      query: this.state.filter,
      modelName,
      [isChooser? 'resource' : 'to']: resource,
      prop,
      isChooser,
      first: true,
      limit: this.limit,
      listView
    });
  }

  renderRow(resource, sectionId, rowId) {
    // Case when the model was not found but the stub existed,
    // and now when it is re-rendering with actual data graphQL didn't return resource for this stub
    if (!resource) {
      let text = this.state.notFoundMap[rowId]
      if (text)
        return <NotFoundRow text={text} id={rowId}/>
      else
        return <View/>
    }
    let { isModel, isBacklink, isForwardlink, modelName, prop, lazy, application,
          currency, navigator, search, isChooser, chat, multiChooser, bankStyle } = this.props

    let rtype = modelName === VERIFIED_ITEM ? VERIFICATION : modelName
    let resType = utils.getType(resource)

    let model
    if (isModel)
      model = resource
    else if (isBacklink  ||  isForwardlink)
      model = utils.getModel(resType)
    else
      model = utils.getModel(rtype);
    if (!model) {
      let text = `model ${resType} not found`
      this.state.notFoundMap[rowId] = text
      return <NotFoundRow text={text} id={rowId}/>
    }

    if (model.isInterface)
      model = utils.getModel(utils.getType(resource))
    let isContext = utils.isContext(model)
    let isSharedContext = isContext  &&  utils.isReadOnlyChat(resource)

    this.isSmallScreen = !utils.isWeb() &&  utils.dimensions(GridList).width < 736
    let isGrid = !this.isSmallScreen  &&  !model.abstract  &&  !model.isInterface  &&  modelName !== APPLICATION_SUBMISSION

    if (!isModel  &&  !isChooser  &&  isGrid  &&  modelName !== APPLICATION  &&  modelName !== BOOKMARK) { //!utils.isContext(this.props.modelName)) {
      let viewCols = this.getGridCols()
      // Overwrite viewCols for MESSAGE after renderHeader call
      if (model.id === MESSAGE)
        viewCols = ['_provider', '_payloadType', '_context', '_time']
      if (viewCols)
        return (
          <GridRow lazy={lazy}
            onSelect={isSharedContext ? this.openSharedContextChat.bind(this) : this.selectResource.bind(this)}
            key={resource[ROOT_HASH]}
            isSmallScreen={this.isSmallScreen}
            modelName={modelName}
            navigator={navigator}
            currency={currency}
            rowId={rowId}
            gridCols={viewCols}
            multiChooser={multiChooser}
            isChooser={isChooser}
            resource={resource}
            bankStyle={bankStyle  ||  defaultBankStyle}
            chosen={this.state.chosen} />
          );
    }
    let selectedResource = resource

    let isApplication = modelName === APPLICATION
    let isMessage = utils.isMessage(resource)  &&  !isApplication  ||  utils.isStub(resource)
    if (isMessage  &&  resource !== model  &&  !isContext) { //isVerification  || isForm || isMyProduct)
      if (modelName === CHECK  ||  utils.isSubclassOf(modelName, CHECK))
        return (<CheckRow
                lazy={lazy}
                onSelect={() => this.selectResource({resource: selectedResource})}
                modelName={rtype}
                application={application}
                bankStyle={bankStyle}
                navigator={navigator}
                searchCriteria={isBacklink || isForwardlink ? null : (search ? this.state.resource : null)}
                resource={resource} />
               )
      return (<VerificationRow
                lazy={lazy}
                onSelect={() => this.selectResource({resource: selectedResource})}
                key={resource[ROOT_HASH]}
                modelName={rtype}
                bankStyle={bankStyle}
                navigator={navigator}
                prop={prop}
                parentResource={this.props.resource}
                multiChooser={multiChooser}
                currency={currency}
                isChooser={isChooser}
                searchCriteria={isBacklink || isForwardlink ? null : (search ? this.state.resource : null)}
                search={search}
                resource={resource}
                chosen={this.state.chosen} />
      )
    }
    return (<ResourceRow
      lazy={lazy}
      onSelect={isSharedContext ? this.openSharedContextChat.bind(this) : this.selectResource.bind(this)}
      key={resource[ROOT_HASH]}
      navigator={navigator}
      changeSharedWithList={chat ? this.changeSharedWithList.bind(this) : null}
      currency={currency}
      multiChooser={multiChooser}
      isChooser={isChooser}
      parentComponent={GridList}
      selectModel={this.selectModel.bind(this)}
      showRefResources={this.showRefResources.bind(this)}
      resource={resource}
      bankStyle={bankStyle}
      chosen={this.state.chosen} />
    );
  }
  searchWithFilter(filterResource, bookmark) {
    this.setState({resource: filterResource})
    Actions.list({filterResource, bookmark, search: true, modelName: filterResource[TYPE], limit: this.limit, first: true, exploreData: true})
  }
  getNextKey(resource) {
    return resource[ROOT_HASH] + '_' + cnt++
  }
  addDateProp(resource, dateProp, style) {
    let properties = utils.getModel(resource[TYPE] || resource.id).properties;
    if (properties[dateProp]  &&  properties[dateProp].style)
      style = [style, properties[dateProp].style];
    let val = utils.formatDate(new Date(resource[dateProp]));

    // return !properties[dateProp]  ||  properties[dateProp].skipLabel || style
    //     ? <Text style={style} key={this.getNextKey()}>{val}</Text>
    //     : <View style={{flexDirection: 'row'}} key={this.getNextKey()}><Text style={style}>{properties[dateProp].title}</Text><Text style={style}>{val}</Text></View>
    let addStyle = {alignSelf: 'flex-end', paddingRight: 10}
    if (this.props.search  &&  this.state.resource  &&  this.state.resource[dateProp])
      _.extend(addStyle, {fontWeight: '600'})
    if (style)
      style.push(addStyle)
    else
      style = addStyle

    return <Text style={style} key={this.getNextKey(resource)}>{val}</Text>
  }
  async _loadMoreContentAsync() {
    if (this.state.refreshing)
      return
    if (this.state.allLoaded)
      return
    // if (this.direction === 'up' &&  this.numberOfPages < 2)
    //   return
    if (this.direction !== 'down')
      return
    // if (this.offset < this.contentHeight / 2)
    //   return
    // debugger
    let { list=[], sortProperty, endCursor, prevEndCursor } = this.state
    let { modelName, search, resource, bookmark } = this.props
    if (endCursor === prevEndCursor  &&  !utils.isEnum(modelName))
      return
    this.state.refreshing = true
console.log('GridList._loadMoreContentAsync: filterResource', resource)

    Actions.list({
      modelName,
      sortProperty,
      asc: this.state.order  &&  this.state.order[sortProperty],
      limit: this.limit,
      direction: this.direction,
      search,
      endCursor,
      to: modelName === BOOKMARK ? utils.getMe() : null,
      filterResource: (search  &&  this.state.resource) || resource,
      bookmark,
      // from: list.length,
      lastId: utils.getId(list[list.length - 1])
    })
  }

  openSharedContextChat(resource) {
    let route = {
      // title: translate(utils.getModel(resource.product)) + ' -- ' + (resource.from.organization || resource.from.title) + ' ->  ' + resource.to.organization.title,
      title: (resource.from.organization || resource.from.title) + '  →  ' + resource.to.organization.title,
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        context: resource,
        filter: '',
        modelName: MESSAGE,
        // currency: params.to.currency,
        bankStyle: this.props.bankStyle || defaultBankStyle
      }
    }
    Actions.addMessage({msg: utils.requestForModels(), isWelcome: true})
    this.props.navigator.push(route)
  }
  changeSharedWithList(id, value) {
    this.state.sharedWith[id] = value
  }

  renderFooter() {
    // let me = utils.getMe();
    // if (!me  ||  (this.props.prop  &&  (this.props.prop.readOnly || (this.props.prop.items  &&  this.props.prop.items.readOnly))))
    //   return <View />;
    let { isModel, modelName, prop, search, bookmark, isBacklink, bankStyle } = this.props
    if (isModel) // || bookmark)
      return
    if (prop  &&  !prop.allowToAdd)
      return
    let me = utils.getMe()
    let model = utils.getModel(modelName);
    let noMenuButton
    if (!prop  &&  model.id !== ORGANIZATION) {
      noMenuButton = (!search &&  !isModel  &&  (!this.state.resource || !Object.keys(this.state.resource).length))
    }
    let employee
    if (me.isEmployee) {
      employee = <View style={styles.center}>
                   <Text numberOfLines={1} style={[styles.employee, {color: bankStyle.linkColor}]}>{me.firstName + '@' + me.organization.title}</Text>
                 </View>
    }
    else
      employee = <View/>
    let isAdd = this.state.allowToAdd  &&  !search
    let icon
    if (isAdd)
      icon = 'md-add'
    else if (isBacklink)
      return
    else
      icon = Platform.OS !== 'android' ?  'md-more' : 'md-menu'

    let color = Platform.OS !== 'android' ? '#ffffff' : 'red'
    let menuBtn
    if (!bookmark  &&  !noMenuButton)
      menuBtn = <TouchableOpacity onPress={() => isAdd ? this.addNew() : this.ActionSheet.show()}>
                  <View style={[buttonStyles.menuButton, {opacity: 0.4}]}>
                    <Icon name={icon}  size={33}  color={color}/>
                  </View>
                </TouchableOpacity>
    else
      menuBtn = <View/>

    return (
        <View style={styles.footer}>
          <View/>
          {employee}
          {menuBtn}
        </View>
     )
  }
  onSettingsPressed() {
    let model = utils.getModel(SETTINGS)
    this.setState({hideMode: false})
    let route = {
      componentName: 'NewResource',
      title: 'Settings',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      titleTextColor: '#7AAAC3',
      passProps: {
        model: model,
        bankStyle: this.props.style,
        callback: () => {
          this.props.navigator.pop()
          Actions.list({modelName: this.props.modelName})
        }
        // callback: this.register.bind(this)
      },
    }

    this.props.navigator.push(route)
  }
  addNew() {
    let { modelName, prop, resource, bankStyle, navigator, isChooser } = this.props
    let model = utils.getModel(modelName);
    let r;
    this.setState({hideMode: false})
    // resource if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (resource) {
      let props = model.properties;
      for (let p in props) {
        let isBacklink = props[p].ref  &&  props[p].ref === resource[TYPE];
        if (props[p].ref  &&  !isBacklink) {
          if (utils.getModel(props[p].ref).isInterface  &&  model.interfaces  &&  model.interfaces.indexOf(props[p].ref) !== -1)
            isBacklink = true;
        }
        if (isBacklink) {
          r = {};
          r[TYPE] = modelName;
          r[p] = { id: utils.getId(resource) };

          if (resource.relatedTo  &&  props.relatedTo) // HACK for now for main container
            r.relatedTo = resource.relatedTo;
        }
      }
    }
    // Setting some property like insured person. The value for it will be another form
    //
    if (prop  &&  utils.isForm(model)) {
      if (!r)
        r = {}
      let pRef = prop.ref || prop.items.ref;
      if (isChooser  &&  utils.getModel(pRef).abstract)
        r[TYPE] = modelName
      else
        r[TYPE] = pRef
      r.from = resource.from
      r.to = resource.to
      r._context = resource._context
    }
    // if (utils.isSimulator()) {
    let isPrefilled = ENV.prefillForms && model.id in formDefaults
    if (isPrefilled)
      _.extend(r, formDefaults[model.id])
    // }
    let self = this
    navigator.push({
      title: model.title,
      componentName: 'NewResource',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: model,
        bankStyle,
        resource: r,
        callback: (resource) => {
          if (self.props.callback)
            self.props.callback(prop.name, resource)
          if (self.props.returnRoute) {
            self.props.navigator.popToRoute(self.props.returnRoute)
            return
          }
          self.props.navigator.pop()
          let l = []

          self.state.list.forEach((r) => {
            let rr = {}
            _.extend(rr, r)
            l.push(rr)
          })
          l.push(resource)

          self.setState({
            list: l,
            dataSource: self.state.dataSource.cloneWithRows(l)
          })
        }
      }
    })
  }
  render() {
    let content;
    let { filter, dataSource, isLoading, list, isConnected, allLoaded} = this.state
    let { isChooser, modelName, isModel, application,
          isBacklink, isForwardlink, resource, prop, forwardlink, bankStyle } = this.props
    let model = utils.getModel(modelName);
    let me = utils.getMe()

    let isEmptyItemsTab
    if (/*!isChooser  &&*/ !this.state.list  &&  prop &&  prop.allowToAdd  &&  (!resource[prop.name] ||  !resource[prop.name].length)) {
      if (me  &&  (!me.isEmployee  ||  utils.isMyMessage({resource})))
        isEmptyItemsTab = true
    }

    if (isEmptyItemsTab) {
      let height = utils.dimensions(GridList).height - 105
      content = <View style={{justifyContent: 'flex-end', height}}>
                  <NoResources
                    message={translate('pleaseClickOnAddButton', prop && prop.title || translate(model))}
                    iconColor={'#ffffff'}
                    iconStyle= {StyleSheet.flatten([buttonStyles.menuButton, styles.noResourcesIcon])}
                    model={model}
                    isLoading={isLoading}>
                  </NoResources>
                </View>
    }
    else {
      content = <ListView  onScroll={this.onScroll.bind(this)}
        dataSource={dataSource}
        renderHeader={this.renderHeader.bind(this)}
        enableEmptySections={true}
        renderRow={this.renderRow.bind(this)}
        automaticallyAdjustContentInsets={false}
        removeClippedSubviews={false}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps="always"
        initialListSize={isModel ? 300 : 20}
        pageSize={20}
        canLoadMore={true}
        renderScrollComponent={props => <InfiniteScrollView {...props} allLoaded={allLoaded}/>}
        onLoadMoreAsync={this._loadMoreContentAsync.bind(this)}
        scrollRenderAhead={10}
        showsVerticalScrollIndicator={false} />;
    }

    let actionSheet = this.renderActionSheet() // me.isEmployee && me.organization ? this.renderActionSheet() : null
    let footer = actionSheet && this.renderFooter()
    let searchBar
    let { search, _readOnly } = this.props

    if (SearchBar  &&  !isBacklink  &&  !isForwardlink) {
      let hasSearch = isModel  ||  utils.isEnum(model)
      // Check if the starting - no filter list - is small
      if (hasSearch  &&  (!filter  &&  list  &&  list.length < SEARCH_LIMIT))
        hasSearch = false
      if (!hasSearch  && !search) {
        hasSearch = !_readOnly  ||  !utils.isContext(modelName)
        if (hasSearch)
          hasSearch = (dataSource && dataSource.getRowCount() > SEARCH_LIMIT) || (filter  &&  filter.length)
      }
      if (hasSearch) {
        searchBar = <SearchBar
                      onChangeText={this.onSearchChange.bind(this)}
                      placeholder={translate('search')}
                      showsCancelButtonWhileEditing={false}
                      showsCancelButton={false}
                      hideBackground={true}
                      bankStyle={bankStyle}
                      />
      }
    }
    let network
    if (!isChooser  &&  !prop) {
      if (modelName === BOOKMARK  &&  list  &&  list.length) {
        let org = list[0].from.organization
        if (org)
          network = <NetworkInfoProvider connected={isConnected} serverOffline={!org._online} />
      }
      else
        network = <NetworkInfoProvider connected={this.state.isConnected} serverOffline={this.state.serverOffline} />
    }

    // let hasSearchBar = this.props.isBacklink && this.props.backlinkList && this.props.backlinkList.length > 10
    let style
    if (this.props.isBacklink)
      style = {}
    else {
      style = [platformStyles.container]
      if (isModel)
        style.push({width: utils.getContentWidth(GridList), alignSelf: 'center'})
    }
    let loading
    if (isLoading  &&  !isModel) {
      let showLoadingIndicator = true
      if (isBacklink  &&  application)
        showLoadingIndicator = false
      else if (isBacklink  ||  isForwardlink) {
        let pName = (prop && prop.name) || (forwardlink  &&  forwardlink.name)
        let cnt = resource['_' + pName + 'Count']
        if (!cnt) {
          if (!resource[pName]  || !resource[pName].length)
            showLoadingIndicator = false
        }
        else if (dataSource.getRowCount() === cnt  ||  !this.state.refreshing) {
          showLoadingIndicator = false
        }
      }
      if (showLoadingIndicator)
        loading = showLoading({bankStyle, component: GridList, message: translate('loading')})
      // if (showLoadingIndicator)
      //   loading = <View style={styles.loadingView}>
      //               <View style={platformStyles.container}>
      //                 <Text style={[styles.loading, {color: bankStyle.linkColor}]}>{translate('loading')}</Text>
      //                 <ActivityIndicator size='large' style={styles.indicator} />
      //               </View>
      //             </View>
    }

    // let contentSeparator = search ? {borderTopColor: '#eee', borderTopWidth: StyleSheet.hairlineWidth} : uiUtils.getContentSeparator(bankStyle)
    let contentSeparator = getContentSeparator(bankStyle)
    return (
      <PageView style={isBacklink || isForwardlink ? {flex: 1} : platformStyles.container} separator={!isBacklink && !isForwardlink && !isEmptyItemsTab && contentSeparator} bankStyle={bankStyle}>
        {network}
        {searchBar}
        <View style={styles.separator} />
        {content}
        {loading}
        {footer}
        {actionSheet}
      </PageView>
    );
  }
  renderActionSheet() {
    let { search, modelName, prop, isBacklink, isForwardlink, bookmark } = this.props
    if (isForwardlink)
      return
    if (bookmark)
      return
    let buttons
    if (search) {
      buttons = [
        {
          text: translate('Bookmark'),
          onPress: () => this.bookmark()
        }
      ]
    }
    else if (this.state.allowToAdd) {
      if (isBacklink)
        return
      buttons = [
        {
          text: translate('addNew', prop.title),
          onPress: () => this.addNew()
        }
      ]
    }
    else
      return

    buttons.push({ text: translate('cancel') })
    return (
      <ActionSheet
        ref={(o) => {
          this.ActionSheet = o
        }}
        options={buttons}
      />
    )
  }
  async errorAlert(message, query) {
    // if (this.props.exploreData)
    //   await utils.promiseDelay(1)
    if (query)
      Alert.alert(
        translate(message),
        null,
        [
          {text: translate('cancel'), onPress: () => {
            this.setState({hideMode: false})
            console.log('Canceled!')
          }},
          {text: translate('Retry'), onPress: () => {
            this.setState({isLoading: true})
            Actions.list(query)
          }},
        ]
      )
    else
      Alert.alert(translate(message))
  }

  bookmark() {
    let resource = {
      [TYPE]: BOOKMARK,
      bookmark: Object.keys(this.state.resource).length ? this.state.resource : {[TYPE]: this.props.modelName},
      from: utils.getMe()
    }
    Actions.addChatItem({resource: resource})
  }
  renderHeader() {
    let { search, modelName, isChooser, isModel } = this.props
    if (!search || isModel || isChooser)
      return
    if (modelName !== PROFILE) {
      if (this.state.isGrid  &&  !utils.isContext(modelName))
        return this.renderGridHeader()
    }
  }
}
reactMixin(GridList.prototype, Reflux.ListenerMixin);
reactMixin(GridList.prototype, HomePageMixin)
GridList = makeResponsive(GridList)
GridList = makeStylish(GridList)

var styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  icon: {
    marginLeft: -23,
    marginTop: -25,
    color: 'red'
  },
  image: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    // justifyContent: 'flex-end',
    height: 45,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    // borderColor: '#eeeeee',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#cccccc',
    justifyContent: 'space-between'
  },
  row: {
    flexDirection: 'row',
    padding: 5,
  },
  textContainer: {
    alignSelf: 'center',
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#757575',
    marginBottom: 2,
    paddingLeft: 5
  },
  cellImage: {
    height: 50,
    marginRight: 10,
    width: 50,
    paddingLeft: 5
  },
  col: {
    paddingVertical: 5,
    // paddingLeft: 7
    // borderRightColor: '#aaaaaa',
    // borderRightWidth: 0,
  },
  cell: {
    paddingVertical: 5,
    fontSize: 14,
    paddingLeft: 7
    // paddingHorizontal: 3
    // alignSelf: 'center'
  },
  headerRow: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    // borderTopColor: '#cccccc',
    // borderTopWidth: 1
  },
  type: {
    fontSize: 18,
    color: '#555555'
  },
  description: {
    fontSize: 16,
    color: '#555555'
  },
  gridRow: {
    borderBottomColor: '#f5f5f5',
    paddingVertical: 5,
    paddingRight: 7,
    borderBottomWidth: 1
  },
  sortAscending:  {
    borderTopWidth: 4,
    borderTopColor: '#7AAAC3'
  },
  sortDescending: {
    borderBottomWidth: 4,
    borderBottomColor: '#7AAAC3'
  },
  thumb: {
    width: 40,
    height: 40
  },
  gridHeader: {
    backgroundColor: '#eeeeee'
  },
  center: {
    justifyContent: 'center'
  },
  employee: {
    fontSize: 18,
  },
  loading: {
    fontSize: 17,
    alignSelf: 'center',
    // marginTop: 0,
    color: '#629BCA'
  },
  loadingView: {
    flex: 1
  },
  indicator: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginTop: 20
  },
  noResourcesIcon: {
    opacity: 0.4,
    marginTop: 0,
    width: 30,
    height: 30
  }
});

module.exports = GridList;
