console.log('requiring GridList.js')
'use strict';

import React, { Component, PropTypes } from 'react'
import {
  ListView,
  RefreshControl,
  Navigator,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
  View,
  Text,
  Platform
} from 'react-native'

import Reflux from 'reflux'
import constants from '@tradle/constants'
import Icon from 'react-native-vector-icons/Ionicons'
import extend from 'extend'
import reactMixin from 'react-mixin'
import InfiniteScrollView from 'react-native-infinite-scroll-view'
import {Column as Col, Row} from 'react-native-flexbox-grid'
import NoResources from './NoResources'
// import ResourceRow from './ResourceRow'
import ResourceRow from './ResourceRow'
import ResourceView from './ResourceView'
import ApplicationView from './ApplicationView'
import VerificationRow from './VerificationRow'
import NewResource from './NewResource'
import MessageList from './MessageList'
import MessageView from './MessageView'
import PageView from './PageView'
import uiUtils from './uiUtils'
import SupervisoryView from './SupervisoryView'
import ActionSheet from './ActionSheet'
import utils, {
  translate
} from '../utils/utils'
import HomePageMixin from './HomePageMixin'
import ArticleView from './ArticleView'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import buttonStyles from '../styles/buttonStyles'
import NetworkInfoProvider from './NetworkInfoProvider'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import debounce from 'debounce'
import appStyle from '../styles/appStyle.json'
import StyleSheet from '../StyleSheet'
import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'
import ENV from '../utils/env'
import ConversationsIcon from './ConversationsIcon'
import SearchBar from './SearchBar'

const PRODUCT_LIST = 'tradle.ProductList'
const PARTIAL = 'tradle.Partial'

var {
  TYPE,
  ROOT_HASH,
} = constants

var {
  PROFILE,
  IDENTITY,
  ORGANIZATION,
  SELF_INTRODUCTION,
  CUSTOMER_WAITING,
  FINANCIAL_PRODUCT,
  VERIFICATION,
  MESSAGE,
  CUSTOMER_WAITING,
  SELF_INTRODUCTION,
  FORM,
  SETTINGS,
  INTRODUCTION
} = constants.TYPES

const CONFIRMATION = 'tradle.Confirmation'
const APPLICATION = 'tradle.Application'
const VERIFIED_ITEM = 'tradle.VerifiedItem'
const MODEL = 'tradle.Model'

const MONEY = 'tradle.Money'
const FORM = 'tradle.Form'
const ENUM = 'tradle.Enum'
const PHOTO = 'tradle.Photo'

const METHOD = 'tradle.Method'
const BOOKMARK = 'tradle.Bookmark'

var excludeFromBrowsing = [
  FORM,
  PRODUCT_LIST,
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

const sandboxDesc = 'In the Sandbox, learn how to use the app with simulated service providers. Try getting a digital passport from the Identity Authority, then opening a company at the Chamber of Commerce, then getting that company a business account at Hipster Bank.'

var cnt = 0

class GridList extends Component {
  props: {
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
        return row1 !== row2 || row1._online !== row2._online || row1.style !== row2.style
      }
    })
    let {resource, officialAccounts, modelName, prop, filter, serverOffline, search} = this.props
    let model = utils.getModel(modelName).value

    let viewCols = this.getGridCols()
    let size = viewCols ? viewCols.length : 1
    this.isSmallScreen = !utils.isWeb() &&  utils.dimensions(GridList).width < 736
    this.limit = 10 //this.isSmallScreen ? 20 : 40
    this.state = {
      // isLoading: utils.getModels() ? false : true,
      isLoading: true,
      dataSource,

      allowToAdd: prop  &&  prop.allowToAdd,
      filter: filter,
      hideMode: false,  // hide provider
      serverOffline: serverOffline,
      isConnected: this.props.navigator.isConnected,
      userInput: '',
      // sharedContextCount: 0,
      refreshing: false,
      // hasPartials: false,
      // bookmarksCount: 0,
      // hasTestProviders: false,
      resource: search  &&  resource,
      isGrid:  !this.isSmallScreen  &&  !officialAccounts  && modelName !== FORM   && modelName !== MESSAGE  &&  !model.isInterface
    };
    // if (props.isBacklink  &&  props.backlinkList) {
    //   this.state.dataSource = dataSource.cloneWithRows(props.backlinkList)
    // }
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
  }
  done() {
    let orgs = []
    for (let orgId in this.state.sharedWith) {
      if (!this.state.sharedWith[orgId])
        continue
      orgs.push(orgId)
//       for (let rep in this.state.sharedWithMapping) {
//         let org = this.state.sharedWithMapping[rep]
//         if (utils.getId(org) === orgId)
//           reps.push(rep)
//       }
    }
    // if (reps.length)
    this.props.callback(orgs)
  }
  componentWillReceiveProps(props) {
    let { resource, isBacklink, isForwardlink, search, forwardlink } = props
    if (isBacklink) {
      // if (!props.resource['_' + props.prop.name + 'Count'])
      //   return

      this.state.dataSource = this.state.dataSource.cloneWithRows([])
      this.state.isLoading = true;

      let params = this.getParamsForBacklinkList(props)
      Actions.list(params)
      // else if (props.backlinkList.length)
      //   this.state.dataSource = this.state.dataSource.cloneWithRows(props.backlinkList)
      // else
      //   this.state.dataSource = this.state.dataSource.cloneWithRows([])
    }
    else if (forwardlink) {
      this.state.dataSource = this.state.dataSource.cloneWithRows([])
      this.state.isLoading = true;
      Actions.getItem({resource, search, action: 'list', forwardlink})
    }
    if (props.provider  &&  (!this.props.provider || utils.getId(this.props.provider) !== (utils.getId(props.provider)))) {
      Actions.list({modelName: ORGANIZATION})
      // this.state.customStyles = props.customStyles
    }
  }
  getParamsForBacklinkList(props) {
    let params = {
      modelName: props.modelName,
      // limit: 10
    };
    if (props._readOnly)
      params._readOnly = true

    if (props.isAggregation)
      params.isAggregation = true;
    if (props.sortProperty)
      params.sortProperty = props.sortProperty;
    if (props.prop)
      params.prop = utils.getModel(props.resource[TYPE]).value.properties[props.prop.name];
    if (params.prop) {
      let m = utils.getModel(props.resource[TYPE]).value
      // case when for example clicking on 'Verifications' on Form page
      if (m.interfaces)
        params.resource = props.resource
      else if (params.prop.items  &&  params.prop.items.backlink)
        params.to = props.resource
    }
    else
      params.to = props.resource
    params.isChat =  !props.isChooser
    params.listView = props.listView
    return params
  }
  componentWillUnmount() {
    if (this.props.navigator.getCurrentRoutes().length === 1)
      StatusBar.setHidden(true)
  }
  onScroll(event) {
    if (this.state.refreshing)
      return

    let currentOffset = event.nativeEvent.contentOffset.y
    this.contentHeight = event.nativeEvent.contentSize.height
    let delta = currentOffset - (this.offset || 0)
    this.direction = delta > 0 || Math.abs(delta) < 3 ? 'down' : 'up'
    this.offset = currentOffset
  }
  componentWillMount() {
    // debounce(this._loadMoreContentAsync.bind(this), 1000)
    let { chat, resource, navigator, officialAccounts, search, modelName, isModel, isBacklink, isForwardlink, forwardlink } = this.props
    if (chat) {
      utils.onNextTransitionEnd(navigator, () => {
        Actions.listSharedWith(resource, chat)
      });
      return
    }
    if (search) {
      if (isModel) {
        let me = utils.getMe()
        if (me.isEmployee)
          Actions.getModels(utils.getId(me.organization))
        else {
          let modelsArr = this.filterModels()
          this.state.dataSource = this.state.dataSource.cloneWithRows(modelsArr)
        }
        return
        // Actions.listModels({modelName})
      }
      else if (!isForwardlink) {
        Actions.list({
          modelName: modelName,
          filterResource: resource,
          search: true,
          first: true,
          limit: this.limit * 2
        })
        return
      }
    }
    let me = utils.getMe()
    if (me  &&  me.isEmployee  &&  officialAccounts) {
      utils.onNextTransitionEnd(navigator, () => {
        Actions.addMessage({msg: utils.requestForModels(), isWelcome: true})
      });
    }
    let params = this.getParamsForBacklinkList(this.props)
    StatusBar.setHidden(false);
    if (isBacklink)
      Actions.list(params)
    else if (isForwardlink)
      Actions.getItem({resource, search, action: 'list', forwardlink})
    else
      utils.onNextTransitionEnd(navigator, () => {
        Actions.list(params)
        if (officialAccounts  &&  modelName === ORGANIZATION)
          Actions.hasTestProviders()
        // StatusBar.setHidden(false);
      });
  }

  componentDidMount() {
    this.listenTo(Store, 'onListUpdate');
  }

  onListUpdate(params) {
    let { action, error } = params
    let { navigator, modelName, isModel, search, prop, forwardlink } = this.props
    if (action === 'addApp') {
      navigator.pop()
      if (error)
        Alert.alert(error)
      // Actions.list(ORGANIZATION)
      return
    }
    if (error)
      return;
    // if (params.action === 'onlineStatus') {
    //   this.setState({serverOffline: !params.online})
    //   return
    // }
    if (action === 'newContact') {
      let routes = navigator.getCurrentRoutes()
      let curRoute = routes[routes.length - 1]
      if (curRoute.id === 11  &&  curRoute.passProps.resource[ROOT_HASH] === params.newContact[ROOT_HASH])
        return
      this.setState({newContact: params.newContact})
      return
    }
    if (action === 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }
    if (action == 'newStyles'  &&  modelName === ORGANIZATION) {
      this.setState({newStyles: params.resource})
      return
    }
    if (action === 'models') {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(params.list),
        list: params.list
      })
      return
    }
    if (action === 'addItem'  ||  action === 'addMessage') {
      let model = action === 'addMessage'
                ? utils.getModel(modelName).value
                : utils.getModel(params.resource[TYPE]).value;
      if (action === 'addItem'  &&  model.id !== modelName) {
        if (model.id === BOOKMARK  &&  !isModel) {
          if (this.state.resource  &&  this.state.resource[TYPE] === params.resource.bookmark[TYPE]) {
            Alert.alert('Bookmark was created')
          }
        }
        return
      }
      if (action === 'addMessage'  &&  modelName !== PROFILE)
        return
      // this.state.isLoading = true;
      Actions.list({
        query: this.state.filter,
        modelName: model.id,
        to: this.props.resource,
        sortProperty: model.sort
      });

      return;
    }
    if (action === 'talkToEmployee') {
      if (!params.to)
        return
      let style = this.mergeStyle(params.to.style)
      let route = {
        title: params.to.name,
        component: MessageList,
        id: 11,
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
      utils.onNextTransitionEnd(navigator, () => Actions.addMessage({msg: msg})) //, true))
      if (navigator.getCurrentRoutes().length === 3)
        navigator.replace(route)
      else
        navigator.push(route)
      return
    }
    let { chat, isBacklink, isForwardlink, multiChooser, isChooser, sharingChat, isTest } = this.props
    if (action === 'list') {
      // First time connecting to server. No connection no providers yet loaded
      if (!params.list) {
        if (params.alert)
          Alert.alert(params.alert)
        else if (search  &&  !isModel) {
          if (params.isSearch  &&   params.resource)
            Alert.alert('No resources were found for this criteria')
          this.setState({refreshing: false, isLoading: false})
        }
        return
      }
      if (params.isTest  !== isTest)
        return
      if (params.list  &&  params.list.length) {
        let m = utils.getModel(params.list[0][TYPE]).value
        if (m.id !== modelName)  {
          let model = utils.getModel(modelName).value
          if (model.isInterface  ||  modelName === MESSAGE) {
            if (!m.interfaces  ||  m.interfaces.indexOf(modelName) === -1)
              return
          }
          else if (m.subClassOf !== modelName) {
            if (!isForwardlink  ||  !params.resource  ||  params.resource[ROOT_HASH] !== this.props.resource[ROOT_HASH])
              return
            // Application forward links
            if (modelName !== VERIFIED_ITEM  ||  m.id !== VERIFICATION)
              return
          }
        }
      }
    }
    if ((action !== 'list' &&  action !== 'listSharedWith')  ||  !params.list || params.isAggregation !== this.props.isAggregation)
      return;
    if (action === 'list'  &&  this.props.chat)
      return
    if (action === 'listSharedWith'  &&  !chat)
      return
    let list = params.list;
    if (list.length) {
      let type = list[0][TYPE];
      if (type  !== modelName  &&  !isBacklink  &&  !isForwardlink) {
        let m = utils.getModel(type).value;
        if (m.subClassOf != modelName)
          return;
      }
      if (multiChooser  &&  !isChooser) {
        let sharingChatId = utils.getId(sharingChat)
        list = list.filter(r => {
          return utils.getId(r) !== sharingChatId
        })
      }

      if (search) {
        if (params.direction === 'up')
          --this.numberOfPages
        else
          ++this.numberOfPages
      }

      if (!params.first) {
        let l = this.state.list
        if (l  &&  !isBacklink  &&  !isForwardlink) { //  &&  l.length === this.limit * 2) {
          let newList = []
          // if (this.direction === 'down') {
            // for (let i=this.limit; i<l.length; i++)
            for (let i=0; i<l.length; i++)
              newList.push(l[i])
            list.forEach((r) => newList.push(r))
            list = newList
          // }
          // else {
          //   for (let i=0; i<l.length; i++)
          //   // for (let i=0; i<this.limit; i++)
          //     list.push(l[i])
          // }
        }
        // if (params.start) {
        //   let l = []
        //   this.state.list.forEach((r) => l.push(r))
        //   list.forEach((r) => l.push(r))
        //   list = l
        // }
      }
    }

    list = this.addTestProvidersRow(list)

    let state = {
      dataSource: this.state.dataSource.cloneWithRows(list),
      list: list,
      isLoading: false,
      refreshing: false
    }

    if (!list.length) {
      if (!this.state.filter  ||  !this.state.filter.length)
        this.setState({isLoading: false})
      else
        this.setState(state)
      return;
    }
    if (search  &&  params.resource)
      state.resource = params.resource

    if ((isBacklink  &&  params.prop !== prop) || (isForwardlink  &&  params.forwardlink !== forwardlink))
      return
    extend(state, {
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
  addTestProvidersRow(l) {
    if (!l  ||  !this.props.officialAccounts || this.props.modelName !== ORGANIZATION)
      return l
    l.push({
      [TYPE]: ORGANIZATION,
      name: 'Sandbox',
      _isTest: true
    })
    return l
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.forceUpdate)
      return true
    if (this.state.resource !== nextState.resource)
      return true
    if (this.props.isBacklink  &&  nextProps.isBacklink) {
      if (this.props.prop !== nextProps.prop)
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
    if (this.state.hideMode !== nextState.hideMode)
      return true
    if (this.props.provider !== nextProps.provider)
      return true
    if (this.state.serverOffline !== nextState.serverOffline)
      return true
    // if (this.state.sharedContextCount !== nextState.sharedContextCount)
    //   return true
    // if (this.state.hasPartials !== nextState.hasPartials)
    //   return true
    // if (this.state.bookmarksCount !== nextState.bookmarksCount)
    //   return true
    // if (this.state.hasTestProviders !== nextState.hasTestProviders)
    //   return true
    if (nextState.isConnected !== this.state.isConnected)
      return true
    if (this.state.newStyles !== nextState.newStyles)
      return true
    if (nextState.newContact  &&  (!this.state.newContact ||  this.state.newContact !== nextState.newContact))
      return true
    //   if (!this.state.list && !nextState.list)
    //     return true
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
    let { modelName, search, callback, bankStyle, navigator, currency } = this.props
    let isContact = modelName === PROFILE;

    let isOrganization = modelName === ORGANIZATION;
    let isApplication = modelName === APPLICATION

    let isResourceFromServer = !isApplication  &&  (search ||  (!isContact  &&  !isOrganization  &&  !callback))
    if (isResourceFromServer) {
      this.selectResourceFromServer(resource)
      return;
    }
    let { prop, officialAccounts } = this.props
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
      if (resource.applicant.title)
        title = resource.applicant.title  + '  →  ' + me.organization.title
      else
        title = me.organization.title
    }
    else if (me.isEmployee)
      title = me.organization.title + '  →  ' + utils.getDisplayName(resource)
    else
      title = resource.name; //utils.getDisplayName(resource, model.value.properties);
    let style = this.mergeStyle(resource.style)

    if (isApplication) {
      let route = {
        title: title,
        id: 34,
        component: ApplicationView,
        // titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        passProps: {
          resource: resource,
          search: search,
          bankStyle: bankStyle
        }
      }
      navigator.push(route)
      return
    }
    let route = {
      component: MessageList,
      id: 11,
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
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            bankStyle: style,
            model: utils.getModel(resource[TYPE]).value,
            resource: resource,
            currency: currency,
          }
        }
      }
    }
    if (officialAccounts) {
      if (isOrganization)
        route.title = resource.name
      let msg = {
        message: translate('customerWaiting', me.firstName),
        _t: CUSTOMER_WAITING,
        from: me,
        to: utils.isEmployee(resource) ? me.organization : resource,
        time: new Date().getTime()
      }

      utils.onNextTransitionEnd(navigator, () => Actions.addMessage({msg: msg, isWelcome: true}))
    }

    navigator.push(route);
  }
  selectResourceFromServer(resource) {
    let { modelName, search, bankStyle, navigator, currency } = this.props
    let model = utils.getModel(modelName);
    let isMessage = utils.isMessage(resource)
    if (isMessage) {
      if (modelName === BOOKMARK) {
        if (!bankStyle)
          bankStyle = this.state.bankStyle
        uiUtils.showBookmarks({resource, searchFunction: this.searchWithFilter.bind(this), navigator, bankStyle, currency})
        return
      }
      let rType = resource[TYPE]
      let m = utils.getModel(rType).value
      let isVerificationR  = rType === VERIFICATION
      let title
      if (isVerificationR) {
        let type = utils.getType(resource.document)
        title = utils.makeModelTitle(utils.getModel(type).value)
      }
      else
        title = utils.makeModelTitle(m)

      navigator.push({
        title: title,
        id: 5,
        component: MessageView,
        backButtonTitle: 'Back',
        passProps: {
          resource: resource,
          search: search,
          bankStyle: bankStyle || defaultBankStyle
        }
      })
      return
    }
    let title = utils.makeTitle(utils.getDisplayName(resource))
    navigator.push({
      title: title,
      id: 3,
      component: ResourceView,
      // titleTextColor: '#7AAAC3',
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
          model: model,
          resource: resource,
          search: search,
          serverOffline: this.props.serverOffline,
          bankStyle: bankStyle || defaultBankStyle
        }
      },

      passProps: {resource: resource}
    });
  }

  _selectResource(resource) {
    let { modelName, style, currency, prop, navigator, returnRoute, callback } = this.props
    let model = utils.getModel(modelName);
    let title = utils.getDisplayName(resource);
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
      id: 3,
      component: ResourceView,
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
    if ((me || this.state.isRegistration) &&  prop) {
      callback(prop, resource); // HACK for now
      if (returnRoute)
        navigator.popToRoute(returnRoute);
      else
        navigator.pop()
      return;
    }
    if (me                       &&
       !model.value.isInterface  &&
       (resource[ROOT_HASH] === me[ROOT_HASH]  ||  resource[TYPE] !== PROFILE)) {
      route.rightButtonTitle = 'Edit'
      route.onRightButtonPress = /*() =>*/ {
        title: 'Edit',
        id: 4,
        component: NewResource,
        rightButtonTitle: 'Done',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: utils.getModel(resource[TYPE]).value,
          bankStyle: style,
          resource: me
        }
      };
    }
    navigator.push(route);
  }
  showRefResources(resource, prop) {
    let props = utils.getModel(resource[TYPE]).value.properties;
    let propJson = props[prop];
    let resourceTitle = utils.getDisplayName(resource);
    resourceTitle = utils.makeTitle(resourceTitle);

    let backlinksTitle = propJson.title + ' - ' + resourceTitle;
    backlinksTitle = utils.makeTitle(backlinksTitle);
    let modelName = propJson.items.ref;
    let { style, currency, navigator } = this.props
    navigator.push({
      title: backlinksTitle,
      id: 10,
      component: GridList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        resource: resource,
        prop: prop,
        bankStyle: style,
        modelName: modelName
      },
      rightButtonTitle: translate('details'),
      onRightButtonPress: {
        title: resourceTitle,
        id: 3,
        component: ResourceView,
        titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: resourceTitle,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel(resource[TYPE]).value,
            bankStyle: style,
            resource: resource
          }
        },

        passProps: {
          bankStyle: style,
          resource: resource,
          currency: currency
        }
      }
    });
  }


  selectModel(model) {
    let { navigator, bankStyle, currency } = this.props
    navigator.push({
      id: 30,
      title: translate('searchSomething', utils.makeModelTitle(model)),
      backButtonTitle: 'Back',
      component: GridList,
      passProps: {
        modelName: model.id,
        resource: {},
        bankStyle: bankStyle,
        currency: currency,
        limit: 20,
        search: true
      },
      rightButtonTitle: 'Search',
      onRightButtonPress: {
        title: translate('searchSomething', utils.makeModelTitle(model)),
        id: 4,
        component: NewResource,
        titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Done',
        passProps: {
          model: model,
          resource: this.state.resource,
          searchWithFilter: this.searchWithFilter.bind(this),
          search: true,
          bankStyle: bankStyle || defaultBankStyle,
        }
      }
    })
  }
  filterModels(filter) {
    let models = this.state.list
    let mArr = []
    let filterLower = filter && filter.toLowerCase()
    models.forEach((mm) => {
      if (excludeFromBrowsing.indexOf(mm.id) === -1  &&
          !mm.isInterface                &&
          !mm.inlined                    &&
           mm.id !== MESSAGE             &&
           mm.subClassOf !== ENUM        &&
           mm.subClassOf !== METHOD      &&
           mm.subClassOf !== FINANCIAL_PRODUCT) { //mm.interfaces  && mm.interfaces.indexOf(this.props.modelName) !== -1) {
        if (filter) {
          if (utils.makeModelTitle(mm).toLowerCase().indexOf(filterLower) !== -1)
            mArr.push(mm)
        }
        else
          mArr.push(mm)
      }
    })
    return mArr
  }
  onSearchChange(filter) {
    let { search, isModel, modelName, listView, prop, resource } = this.props
    this.state.filter = typeof filter === 'string' ? filter : filter.nativeEvent.text
    if (search  &&  isModel) {
      let mArr = this.filterModels(this.state.filter)
      this.setState({dataSource: this.state.dataSource.cloneWithRows(mArr)})
      return
    }
    Actions.list({
      query: this.state.filter,
      modelName: modelName,
      to: resource,
      prop: prop,
      first: true,
      listView: listView
    });
  }

  renderRow(resource, sectionId, rowId)  {
    let { isModel, isBacklink, isForwardlink, modelName, prop, lazy, officialAccounts,
          currency, navigator, search, isChooser, chat, multiChooser } = this.props
    if (!isChooser  &&  this.state.isGrid  &&  modelName !== APPLICATION  &&  modelName !== BOOKMARK) { //!utils.isContext(this.props.modelName)) {
      let viewCols = this.getGridCols()
      if (viewCols)
        return this.renderGridRow(resource, sectionId, rowId)
    }
    let rtype = modelName === VERIFIED_ITEM ? VERIFICATION : modelName
    let model
    if (isModel)
      model = resource
    else if (isBacklink  ||  isForwardlink)
      model = utils.getModel(utils.getType(resource)).value
    else
      model = utils.getModel(rtype).value;
    if (model.isInterface)
      model = utils.getModel(utils.getType(resource)).value
    let isVerification = model.id === VERIFICATION  ||  model.subClassOf === VERIFICATION
    let isForm = model.id === FORM || model.subClassOf === FORM
    let isMyProduct = model.id === 'tradle.MyProduct'  ||  model.subClassOf === 'tradle.MyProduct'
    let isContext = utils.isContext(model)
    let isSharedContext = isContext  &&  utils.isReadOnlyChat(resource)

    let selectedResource = resource

    if (model.id === ORGANIZATION  &&  resource.name === 'Sandbox'  &&  resource._isTest)
      return this.renderTestProviders()
    let isApplication = modelName === APPLICATION
    let isMessage = utils.isMessage(resource)  &&  !isApplication
    if (isMessage  &&  resource !== model  &&  !isContext) //isVerification  || isForm || isMyProduct)
      return (<VerificationRow
                lazy={lazy}
                onSelect={() => this.selectResource({resource: selectedResource})}
                key={resource[ROOT_HASH]}
                modelName={rtype}
                navigator={navigator}
                prop={prop}
                parentResource={this.props.resource}
                currency={currency}
                isChooser={isChooser}
                searchCriteria={isBacklink || isForwardlink ? null : (search ? this.state.resource : null)}
                search={search}
                resource={resource} />
      )
    return (<ResourceRow
      lazy={lazy}
      onSelect={isSharedContext ? this.openSharedContextChat.bind(this) : this.selectResource.bind(this)}
      key={resource[ROOT_HASH]}
      hideResource={this.hideResource.bind(this)}
      hideMode={this.state.hideMode}
      navigator={navigator}
      changeSharedWithList={chat ? this.changeSharedWithList.bind(this) : null}
      newContact={this.state.newContact}
      currency={currency}
      isOfficialAccounts={officialAccounts}
      multiChooser={multiChooser}
      isChooser={isChooser}
      selectModel={this.selectModel.bind(this)}
      showRefResources={this.showRefResources.bind(this)}
      resource={resource}
      chosen={this.state.chosen} />
    );
  }
  sort(prop) {
    let order = this.state.order || {}
    let curOrder = order[prop]

    order[prop] = curOrder ? false : true
    this.setState({order: order, sortProperty: prop, list: []})

    let params = { modelName: this.props.modelName, sortProperty: prop, asc: order[prop]}
    if (this.props.search)
      extend(params, {search: true, filterResource: this.state.resource, limit: this.limit * 2, first: true})
    Actions.list(params)
  }
  searchWithFilter(filterResource) {
    this.setState({resource: filterResource})
    Actions.list({filterResource: filterResource, search: true, modelName: filterResource[TYPE], limit: this.limit * 2, first: true})
  }
  getGridCols() {
    let model = utils.getModel(this.props.modelName).value
    let props = model.properties
    let viewCols = model.gridCols || model.viewCols
    if (!viewCols)
      return
    let vCols = []
    viewCols.forEach((v) => {
      if (/*!props[v].readOnly &&*/ !props[v].list  &&  props[v].range !== 'json')
        vCols.push(v)
    })
    // if (vCols.length === 7)
    //   vCols.splice(6, 1)
    return vCols
  }
  getNextKey(resource) {
    return resource[ROOT_HASH] + '_' + cnt++
  }
  addDateProp(resource, dateProp, style) {
    let properties = utils.getModel(resource[TYPE] || resource.id).value.properties;
    if (properties[dateProp]  &&  properties[dateProp].style)
      style = [style, properties[dateProp].style];
    let val = utils.formatDate(new Date(resource[dateProp]));

    // return !properties[dateProp]  ||  properties[dateProp].skipLabel || style
    //     ? <Text style={style} key={this.getNextKey()}>{val}</Text>
    //     : <View style={{flexDirection: 'row'}} key={this.getNextKey()}><Text style={style}>{properties[dateProp].title}</Text><Text style={style}>{val}</Text></View>
    if (!style)
      style = []
    style.push({alignSelf: 'flex-end', paddingRight: 10})
    if (this.props.search  &&  this.state.resource  &&  this.state.resource[dateProp])
      style = [style, {fontWeight: '600'}]

    return <Text style={style} key={this.getNextKey(resource)}>{val}</Text>
  }

  renderGridRow(resource, sectionId, rowId)  {
    let viewCols = this.getGridCols()
    let size
    if (viewCols) {
      let model = utils.getModel(this.props.modelName).value
      let props = model.properties

      let vCols = viewCols.filter((c) => props[c].type !== 'array')
      viewCols = vCols
      size = Math.min(viewCols.length, 12)
      if (size < viewCols.length)
        viewCols.splice(size, viewCols.length - size)
    }
    // let size = viewCols ? viewCols.length : 1
    let widthCols = utils.dimensions(GridList).width / 100
    size = Math.min(size, Math.floor(widthCols * 100/100))
    let colSize =  this.isSmallScreen ? size / 2 : 1

    let key = this.getNextKey(resource)
    let cols
    if (viewCols  &&  viewCols.length) {
      cols = viewCols.map((v) => (
        <Col sm={colSize} md={1} lg={1} style={[styles.col, {justifyContent: 'center'}]} key={key + v}>
          {this.formatCol(resource, v) || <View />}
        </Col>
      ))
    }
    else {
      let color = this.props.isOfficialAccounts && style ? {color: style.LIST_COLOR} : {}
      let style = [styles.description, color]
      // cols = <Col sm={size} md={1} lg={1} style={styles.col} key={key + rowId}>
      //         {this.formatCol(resource, null) || <View />}
      //       </Col>
      let m = utils.getModel(this.props.modelName).value
      let rModel = utils.getModel(resource[TYPE]).value
      let typeTitle
      if (rModel.id !== m.id  &&  rModel.subClassOf === m.id)
        typeTitle = <Text style={styles.type}>{utils.makeModelTitle(rModel)}</Text>
      let cellStyle = {paddingVertical: 5, paddingLeft: 7}
      cols = <View style={cellStyle}>
               {typeTitle}
               <Col sm={1} md={1} lg={1} style={styles.col} key={key + rowId}>
                 <Text style={style}>{utils.getDisplayName(resource)}</Text>
               </Col>
             </View>
    }
    let row = <Row size={size} style={styles.gridRow, {backgroundColor: rowId % 2 ? '#f9f9f9' : 'transparent'}} key={key} nowrap>
                {cols}
              </Row>
    if (this.props.search)
      return  <TouchableOpacity  onPress={() => this.selectResource({resource})}>
                {row}
              </TouchableOpacity>
    else
      return row
  }
  formatCol(resource, prop) {
    let model = utils.getModel(resource[TYPE] || resource.id).value;
    let properties = model.properties;
    let isContact = resource[TYPE] === PROFILE;
    let v = prop
    let backlink
    if (properties[v].type === 'array') {
      if (properties[v].items.backlink)
        backlink = v;
    }

    if (properties[v].type === 'array')
      return

    if (!resource[v]  &&  !properties[v].displayAs)
      return

    let style = [styles.description]
    if (isContact  &&  v === 'organization') {
      style.push({alignSelf: 'flex-end', marginTop: 20})
      style.push(styles.verySmallLetters);
    }
    if (properties[v].style)
      style.push(properties[v].style);
    let ref = properties[v].ref;
    let row
    let cellStyle = {paddingVertical: 5, paddingLeft: 7}

    let criteria = this.props.search  &&  this.state.resource  &&  this.state.resource[v]

    if (ref) {
      if (!resource[v])
        return
      if (criteria)
        style.push({fontWeight: '600'})

      let refM = utils.getModel(ref).value
      if (ref === MONEY) {
        style.push({alignSelf: 'flex-end', paddingRight: 10})
        row = <Text style={style} key={this.getNextKey(resource)}>{resource[v].currency + resource[v].value}</Text>
      }
      else if (ref === PHOTO)
        row = <Image source={{uri: resource[v].url}} style={styles.thumb} />
      else {
        row = <Text style={styles.description} key={this.getNextKey(resource)}>{utils.getDisplayName(resource[v])}</Text>
        if (refM.isInterface || refM.id === FORM) {
          let resType = utils.getType(resource[v])
          let resM = utils.getModel(resType).value
          row = <View key={this.getNextKey(resource)}>
                  <Text style={styles.type}>{utils.makeModelTitle(resM)}</Text>
                  {row}
                </View>
        }
        if (refM.subClassOf !== ENUM) {
          let isMessage = utils.isMessage(resource)
          row = <TouchableOpacity onPress={() => {
                  this.props.navigator.push({
                    title: utils.getDisplayName(resource),
                    id: isMessage ? 5 : 3,
                    component: isMessage ?  MessageView : ResourceView,
                    // titleTextColor: '#7AAAC3',
                    backButtonTitle: 'Back',
                    passProps: {
                      bankStyle: this.props.bankStyle,
                      search: this.props.search,
                      resource: resource[v]
                    }
                  });
                  }}>
                  {row}
                </TouchableOpacity>
        }
      }
      return <View style={cellStyle}>{row}</View>
    }
    if (properties[v].type === 'date')
      return <View style={cellStyle}>{this.addDateProp(resource, v)}</View>

    if (resource[v]  &&  (typeof resource[v] != 'string')) {
      if (criteria)
        style.push({fontWeight: '600'})
      if (properties[v].type === 'number')
        style.push({alignSelf: 'flex-end', paddingRight: 10})
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{resource[v] + ''}</Text></View>
    }
    if (!backlink  &&  resource[v]  && (resource[v].indexOf('http://') === 0  ||  resource[v].indexOf('https://') === 0))
      return <View style={cellStyle}><Text style={style} onPress={this.onPress.bind(this, resource)} key={this.getNextKey(resource)}>{resource[v]}</Text></View>

    let val = properties[v].displayAs ? utils.templateIt(properties[v], resource) : resource[v];
    let msgParts = utils.splitMessage(val);
    if (msgParts.length <= 2)
      val = msgParts[0];
    else {
      val = '';
      for (let i=0; i<msgParts.length - 1; i++)
        val += msgParts[i];
    }
    val = val.replace(/\*/g, '')
    if (criteria) {
      if (criteria.indexOf('*') === -1) {
        style.push({fontWeight: '600'})
        return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{val}</Text></View>
      }
      else {
        let parts = this.highlightCriteria(resource, val, criteria, style)
        return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{parts}</Text></View>
      }
    }
    else {
      if (this.props.isModel  &&  (v === 'form'  ||  v === 'product')) {
        let m = utils.getModel(v)
        if (m)
          val = utils.makeModelTitle(m.value)
      }
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{val}</Text></View>
    }
  }
  onPress(resource) {
    let title = utils.makeTitle(utils.getDisplayName(resource));
    this.props.navigator.push({
      id: 7,
      title: title,
      component: ArticleView,
      passProps: {url: resource.url}
    });
  }

  highlightCriteria(resource,val, criteria, style) {
    criteria = criteria.replace(/\*/g, '')
    let idx = val.indexOf(criteria)
    let part
    let parts = []

    if (idx > 0) {
      parts.push(<Text style={style} key={this.getNextKey(resource)}>{val.substring(0, idx)}</Text>)
      idx++
    }
    parts.push(<Text style={[style, {fontWeight: '800'}]} key={this.getNextKey(resource)}>{val.substring(idx, idx + criteria.length)}</Text>)
    idx += criteria.length
    if (idx < val.length)
      parts.push(<Text style={style} key={this.getNextKey(resource)}>{val.substring(idx)}</Text>)
    return parts
  }

  renderGridHeader() {
    if (this.state.isLoading)
      return <View/>

    let { modelName } = this.props
    if (modelName === APPLICATION)
      return <View/>
    let model = utils.getModel(modelName).value
    let props = model.properties
    let viewCols = this.getGridCols() // model.gridCols || model.viewCols;
    if (!viewCols)
      return <View />

    let size = viewCols ? viewCols.length : 1
    let widthCols = utils.dimensions(GridList).width / 100
    size = Math.min(size, Math.floor(widthCols * 100/100))

    let smCol = this.isSmallScreen ? size/2 : 1
    let {sortProperty, order} = this.state
    let cols = viewCols.map((p) => {
      let colStyle
      if (sortProperty  &&  sortProperty === p) {
        let asc = order[sortProperty]
        colStyle = [styles.col, asc ? styles.sortAscending : styles.sortDescending]
      }
      else
        colStyle = styles.col
      let prop = props[p]
      let textStyle
      if (prop.type === 'number' || prop.type === 'date' || prop.ref === MONEY)
        textStyle = {alignSelf: 'flex-end', paddingRight: 10}
      else
        textStyle = {}
      return <Col sm={smCol} md={1} lg={1} style={colStyle} key={p + cnt}>
        <TouchableOpacity onPress={() => this.sort(p)}>
          <Text style={[styles.cell, textStyle]}>
            {props[p].title.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </Col>
    })

    return <View style={styles.gridHeader} key='Datagrid_h1'>
            <Row size={size} style={styles.headerRow} key='Datagrid_h2' nowrap>
              {cols}
            </Row>
          </View>

  }
  async _loadMoreContentAsync() {
    // debugger
    if (this.state.refreshing)
      return
    // if (this.direction === 'up' &&  this.numberOfPages < 2)
    //   return
    if (this.direction !== 'down')
      return
    if (this.offset < this.contentHeight / 2)
      return
    // debugger
    let { list=[], order, sortProperty } = this.state
    let { modelName, search, resource } = this.props
    this.state.refreshing = true
    Actions.list({
      modelName: modelName,
      sortProperty: sortProperty,
      asc: this.state.order,
      limit: this.limit,
      direction: this.direction,
      search: search,
      to: modelName === BOOKMARK ? utils.getMe() : null,
      filterResource: (search  &&  this.state.resource) || resource,
      // from: list.length,
      lastId: utils.getId(list[list.length - 1])
    })
  }

  openSharedContextChat(resource) {
    let route = {
      // title: translate(utils.getModel(resource.product).value) + ' -- ' + (resource.from.organization || resource.from.title) + ' ->  ' + resource.to.organization.title,
      title: (resource.from.organization || resource.from.title) + '  →  ' + resource.to.organization.title,
      component: MessageList,
      id: 11,
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

  renderTestProviders() {
    if (!this.state.hasTestProviders  ||  this.props.isTest)
      return <View/>
    return (
      <View>
        <View style={styles.testProvidersRow} key={'testProviders_1'}>
          <TouchableOpacity onPress={this.showTestProviders.bind(this)}>
            <View style={styles.row}>
              <Icon name='ios-pulse-outline' size={utils.getFontSize(45)} color={appStyle.TEST_PROVIDERS_ROW_FG_COLOR} style={[styles.cellImage, {paddingLeft: 5}]} />
              <View style={styles.textContainer}>
                <Text style={[styles.resourceTitle, styles.testProvidersText]}>{translate('testProviders')}</Text>
              </View>
              <View style={styles.testProviders}>
                <Text style={styles.testProvidersCounter}>{this.state.testProviders.length}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.testProvidersContainer}>
          <Text style={styles.testProvidersDescription}>{sandboxDesc}</Text>
        </View>
      </View>
    )
  }
  renderFooter() {
    // let me = utils.getMe();
    // if (!me  ||  (this.props.prop  &&  (this.props.prop.readOnly || (this.props.prop.items  &&  this.props.prop.items.readOnly))))
    //   return <View />;
    let { isModel, modelName, prop, search, bookmark } = this.props
    if (isModel) // || bookmark)
      return
    if (prop  &&  !prop.allowToAdd)
      return
    let me = utils.getMe()
    let model = utils.getModel(modelName).value;
    let noMenuButton
    if (!prop  &&  model.id !== ORGANIZATION) {
      noMenuButton = (!search &&  !isModel  &&  (!this.state.resource || !Object.keys(this.state.resource).length))
    }
    let employee
    if (me.isEmployee)
      employee = <View style={styles.center}>
                   <Text style={styles.employee}>{me.firstName + '@' + me.organization.title}</Text>
                 </View>
    else
      employee = <View/>

    let icon = Platform.OS === 'ios' ?  'md-more' : 'md-menu'
    let color = Platform.OS === 'ios' ? '#ffffff' : 'red'
    let menuBtn
    if (!bookmark  &&  !noMenuButton)
      menuBtn = <TouchableOpacity onPress={() => this.ActionSheet.show()}>
                  <View style={[platformStyles.menuButtonNarrow, {opacity: 0.4}]}>
                    <Icon name={icon}  size={33}  color={color}/>
                  </View>
                </TouchableOpacity>
    else
      menuBtn = <View/>

    return (
        <View style={[styles.footer, {justifyContent: 'space-between'}]}>
          <View/>
          {employee}
          {menuBtn}
        </View>
     )
  }
  onSettingsPressed() {
    let model = utils.getModel(SETTINGS).value
    this.setState({hideMode: false})
    let route = {
      component: NewResource,
      title: 'Settings',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      id: 4,
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
    let model = utils.getModel(this.props.modelName).value;
    let r;
    this.setState({hideMode: false})
    // resource if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (this.props.resource) {
      let props = model.properties;
      for (let p in props) {
        let isBacklink = props[p].ref  &&  props[p].ref === this.props.resource[TYPE];
        if (props[p].ref  &&  !isBacklink) {
          if (utils.getModel(props[p].ref).value.isInterface  &&  model.interfaces  &&  model.interfaces.indexOf(props[p].ref) !== -1)
            isBacklink = true;
        }
        if (isBacklink) {
          r = {};
          r[TYPE] = this.props.modelName;
          r[p] = { id: utils.getId(this.props.resource) };

          if (this.props.resource.relatedTo  &&  props.relatedTo) // HACK for now for main container
            r.relatedTo = this.props.resource.relatedTo;
        }
      }
    }
    // Setting some property like insured person. The value for it will be another form
    //
    if (this.props.prop  &&  model.subClassOf === FORM) {
      if (!r)
        r = {}
      r[TYPE] = this.props.prop.ref || this.props.prop.items.ref;
      r.from = this.props.resource.from
      r.to = this.props.resource.to
      r._context = this.props.resource._context
    }
    let self = this
    this.props.navigator.push({
      title: model.title,
      id: 4,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: model,
        bankStyle: this.props.style,
      resource: r,
        callback: (resource) => {
          self.props.navigator.pop()
          let l = []

          self.state.list.forEach((r) => {
            let rr = {}
            extend(rr, r)
            l.push(rr)
          })
          l.push(resource)

          self.setState({
            list: l,
            dataSource: self.state.dataSource.cloneWithRows(l)
          })
          // this.props.navigator.jumpTo(routes[routes.length - 2])
          // routes[routes.length - 2].passProps.callback(resource)
        }
      }
    })
  }
  render() {
    let content;
    let {isGrid, filter, dataSource, isLoading, refreshing, list, isConnected} = this.state
    let { isChooser, modelName, isModel, isBacklink, isForwardlink, resource, prop, forwardlink } = this.props
    let model = utils.getModel(modelName).value;
    if (dataSource.getRowCount() === 0   &&
        utils.getMe()                               &&
        !utils.getMe().organization                 &&
        model.subClassOf !== ENUM                   &&
        !isChooser                       &&
        modelName !== ORGANIZATION  &&
        (!model.subClassOf  ||  model.subClassOf !== ENUM)) {
      content = <NoResources
                  filter={filter}
                  model={model}
                  isLoading={isLoading}/>
    }
    content = <ListView  onScroll={isModel ? () => {} : this.onScroll.bind(this)}
      dataSource={dataSource}
      renderHeader={this.renderHeader.bind(this)}
      enableEmptySections={true}
      renderRow={this.renderRow.bind(this)}
      automaticallyAdjustContentInsets={false}
      removeClippedSubviews={false}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps="always"
      initialListSize={10}
      pageSize={20}
      canLoadMore={true}
      renderScrollComponent={props => <InfiniteScrollView {...props} />}
      onLoadMoreAsync={this._loadMoreContentAsync.bind(this)}
      scrollRenderAhead={10}
      showsVerticalScrollIndicator={false} />;

    let me = utils.getMe()
    let actionSheet = this.renderActionSheet() // me.isEmployee && me.organization ? this.renderActionSheet() : null
    let footer = actionSheet && this.renderFooter()
    let searchBar
    let { search, _readOnly, officialAccounts } = this.props

    if (SearchBar  &&  !isBacklink  &&  !isForwardlink) {
      let hasSearch = isModel
      if (!hasSearch  && !search) {
        hasSearch = !_readOnly  ||  !utils.isContext(modelName)
        if (hasSearch)
          hasSearch = (dataSource && dataSource.getRowCount() > this.limit) || (filter  &&  filter.length)
      }
      if (hasSearch) {
        searchBar = <SearchBar
                      onChangeText={this.onSearchChange.bind(this)}
                      placeholder={translate('search')}
                      showsCancelButton={false}
                      hideBackground={true}
                      bankStyle={this.props.bankStyle}
                      />
      }
    }
    let network
    if (!isChooser) {
      if (officialAccounts && modelName === ORGANIZATION)
        network = <NetworkInfoProvider connected={this.state.isConnected} serverOffline={this.state.serverOffline} />
      else if (modelName === BOOKMARK  &&  list  &&  list.length) {
        let org = list[0].from.organization
        if (org)
          network = <NetworkInfoProvider connected={isConnected} serverOffline={!org._online} />
      }
    }

    // let hasSearchBar = this.props.isBacklink && this.props.backlinkList && this.props.backlinkList.length > 10
    let contentSeparator = search ? {borderTopColor: '#eee', borderTopWidth: StyleSheet.hairlineWidth} : utils.getContentSeparator(this.props.bankStyle)
    let loading
    if (isLoading  &&  !isModel) {
      let showLoadingIndicator = true
      if (isBacklink  ||  isForwardlink) {
        let pName = (prop && prop.name) || (forwardlink  &&  forwardlink.name)
        if (!resource['_' + pName + 'Count']  &&  (!resource[pName]  || !resource[pName].length))
          showLoadingIndicator = false
      }
      if (showLoadingIndicator)
        loading = <View style={styles.loadingView}>
                    <View style={[platformStyles.container]}>
                      <Text style={styles.loading}>{'Loading...'}</Text>
                      <ActivityIndicator size='large' style={styles.indicator} />
                    </View>
                  </View>
    }
    return (
      <PageView style={isBacklink || isForwardlink  ? {} : platformStyles.container} separator={contentSeparator}>
        {network}
        {searchBar}
        <View style={styles.separator} />
        {loading}
        {content}
        {footer}
        {actionSheet}
      </PageView>
    );
  }
  _onRefresh() {
    this.setState({refreshing: true});
    // fetchData().then(() => {
    //   this.setState({refreshing: false});
    // });
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
    } else {
      if (!ENV.allowAddServer) return

      buttons = [
        {
          text: translate('addServerUrl'),
          onPress: () => this.onSettingsPressed()
        },
        {
          text: translate('hideResource', translate(utils.getModel(modelName).value)),
          onPress: () => this.setState({hideMode: true})
        },
        {
          text: translate('scanQRcode'),
          onPress: () => this.scanFormsQRCode()
        }
      ]
    }

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
  hideResource(resource) {
    Alert.alert(
      translate('areYouSureYouWantToDelete', translate(resource.name)),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          this.setState({hideMode: false})
          console.log('Canceled!')
        }},
        {text: translate('Ok'), onPress: () => {
          let r = utils.clone(resource)
          r._inactive = true
          Actions.addItem({resource: resource, value: r, meta: utils.getModel(resource[TYPE]).value})
          this.setState({hideMode: false})
        }},
      ]
    )
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
    let { search, modelName } = this.props
    if (!search)
      return
    if (modelName !== PROFILE) {
      if (this.state.isGrid  &&  !utils.isContext(modelName))
        return this.renderGridHeader()
    }
  }
}
reactMixin(GridList.prototype, Reflux.ListenerMixin);
reactMixin(GridList.prototype, HomePageMixin)
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
    justifyContent: 'flex-end',
    height: 45,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    // borderColor: '#eeeeee',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#cccccc',
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
  },
  testProviders: {
    position: 'absolute',
    right: 5,
    top: 20,
    width: 20,
    height:20,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: appStyle.TEST_PROVIDERS_ROW_FG_COLOR
  },
  testProvidersCounter: {
    fontSize: 12,
    alignSelf: 'center',
    color: appStyle.TEST_PROVIDERS_ROW_BG_COLOR
  },
  testProvidersText: {
    color: appStyle.TEST_PROVIDERS_ROW_FG_COLOR
  },
  testProvidersRow: {
    padding: 5,
    flex: 1,
    backgroundColor: appStyle.TEST_PROVIDERS_ROW_BG_COLOR
  },
  testProvidersDescription: {
    fontSize: 16,
    color: '#757575'
  },
  testProvidersContainer: {
    padding: 10,
    backgroundColor: 'transparent'
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
    backgroundColor: '#f7f7f7'
  },
  center: {
    justifyContent: 'center'
  },
  employee: {
    fontSize: 18,
    color: '#7AAAC3'
  },
  loading: {
    fontSize: 17,
    alignSelf: 'center',
    marginTop: 80,
    color: '#629BCA'
  },
  loadingView: {
    flex: 1
  },
  indicator: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginTop: 20
  }
});

module.exports = GridList;
  // scanFormsQRCode() {
  //   this.setState({hideMode: false})
  //   this.props.navigator.push({
  //     title: 'Scan QR Code',
  //     id: 16,
  //     component: QRCodeScanner,
  //     titleTintColor: '#eeeeee',
  //     backButtonTitle: 'Cancel',
  //     // rightButtonTitle: 'ion|ios-reverse-camera',
  //     passProps: {
  //       onread: this.onread.bind(this)
  //     }
  //   })
  // }

  // onread(result) {
  //   // Pairing devices QRCode
  //   if (result.data.charAt(0) === '{') {
  //     h = JSON.parse(result.data)
  //     Actions.sendPairingRequest(h)
  //     this.props.navigator.pop()
  //     return
  //   }
  //   let h = result.data.split(';')


  //   // post to server request for the forms that were filled on the web
  //   let me = utils.getMe()
  //   switch (h[0]) {
  //   case WEB_TO_MOBILE:
  //     let r = {
  //       _t: 'tradle.GuestSessionProof',
  //       session: h[1],
  //       from: {
  //         id: utils.getId(me),
  //         title: utils.getDisplayName(me)
  //       },
  //       to: {
  //         id: PROFILE + '_' + h[2]
  //       }
  //     }
  //     Actions.addItem({resource: r, value: r, meta: utils.getModel('tradle.GuestSessionProof').value}) //, disableAutoResponse: true})
  //     break
  //   case TALK_TO_EMPLOYEEE:
  //     Actions.getEmployeeInfo(result.data.substring(h[0].length + 1))
  //     break
  //   case APP_QR_CODE:
  //     Actions.addApp(result.data.substring(h[0].length + 1))
  //     break
  //   default:
  //     // keep scanning
  //     Alert.alert(
  //       translate('error'),
  //       translate('unknownQRCodeFormat')
  //     )

  //     this.props.navigator.pop()
  //     break
  //   }
  // }
  // renderGrid() {
  //   let content = <ListView
  //       dataSource={this.state.dataSource}
  //       renderHeader={this.renderGridHeader.bind(this)}
  //       enableEmptySections={true}
  //       renderRow={this.renderGridRow.bind(this)}
  //       automaticallyAdjustContentInsets={false}
  //       removeClippedSubviews={false}
  //       keyboardDismissMode='on-drag'
  //       keyboardShouldPersistTaps="always"
  //       initialListSize={10}
  //       pageSize={20}
  //       canLoadMore={true}
  //       renderScrollComponent={props => <InfiniteScrollView {...props} />}
  //       onLoadMoreAsync={this._loadMoreContentAsync.bind(this)}
  //       refreshControl={
  //         <RefreshControl
  //           refreshing={this.state.refreshing}
  //           onRefresh={this._loadMoreContentAsync.bind(this)}
  //         />
  //       }
  //       scrollRenderAhead={10}
  //       showsVerticalScrollIndicator={false} />

  //   var searchBar
  //   if (SearchBar) {
  //     if (!this.props._readOnly  ||  !utils.isContext(this.props.modelName)) {
  //       if (this.state.dataSource.getRowCount() > 10 || (this.state.filter  &&  this.state.filter.length)) {
  //         searchBar = (
  //           <SearchBar ref='searchBar'
  //             onChangeText={this.onSearchChange.bind(this)}
  //             placeholder={translate('search')}
  //             showsCancelButton={false}
  //             hideBackground={true}
  //             />
  //         )
  //       }
  //     }
  //   }

  //   return (
  //     <PageView style={this.props.isBacklink ? {} : platformStyles.container}>
  //       <NetworkInfoProvider connected={this.state.isConnected} />
  //       {searchBar}
  //       <View style={styles.separator} />
  //       {content}
  //     </PageView>
  //   );
  // }
  // onSearchChange2(filter) {
  //   if (this.props.search) {
  //     let modelName = filter
  //     if (modelName === FORM || modelName === 'Form')
  //       return
  //     let model = utils.getModel(modelName)
  //     if (!model) {
  //       modelName = 'tradle.' + modelName
  //       model = utils.getModel(modelName)
  //       if (!model)
  //         return
  //     }
  //     model = model.value
  //     this.props.navigator.push({
  //       title: 'Search ' + utils.makeModelTitle(model),
  //       id: 4,
  //       component: NewResource,
  //       titleTextColor: '#7AAAC3',
  //       backButtonTitle: 'Back',
  //       rightButtonTitle: 'Done',
  //       passProps: {
  //         model: model,
  //         resource: resource,
  //         search: true,
  //         bankStyle: this.props.bankStyle || defaultBankStyle,
  //       }
  //     })
  //     return
  //   }

  //   let {to, prop, listView, resource, modelName} = this.props
  //   this.state.filter = typeof filter === 'string' ? filter : filter.nativeEvent.text
  //   Actions.list({
  //     query: this.state.filter,
  //     modelName: modelName,
  //     to: resource,
  //     prop: prop,
  //     listView: listView
  //   });
  // }
  // showSearch() {
  //   this.props.navigator.push({
  //     title: 'Explore data',
  //     id: 30,
  //     component: GridList,
  //     backButtonTitle: 'Back',
  //     titleTextColor: '#7AAAC3',
  //     passProps: {
  //       modelName: MESSAGE,
  //       search: true
  //     },
  //   })
  // }

  // showPartials() {
  //   Actions.getAllPartials()
  //   this.props.navigator.push({
  //     id: 27,
  //     component: SupervisoryView,
  //     backButtonTitle: 'Back',
  //     title: translate('overviewOfApplications'),
  //     passProps: {}
  //   })
  // }
  // showBookmarks() {
  //   Actions.list({modelName: BOOKMARK})
  //   this.props.navigator.push({
  //     title: 'Bookmarks',
  //     id: 30,
  //     component: GridList,
  //     backButtonTitle: 'Back',
  //     titleTextColor: '#7AAAC3',
  //     passProps: {
  //       modelName: BOOKMARK
  //     },
  //   })
  // }
  // showAllPartials() {
  //   Actions.list({modelName: PARTIAL})
  //   this.props.navigator.push({
  //     title: 'Partials',
  //     id: 10,
  //     component: GridList,
  //     backButtonTitle: 'Back',
  //     titleTextColor: '#7AAAC3',
  //     passProps: {
  //       modelName: PARTIAL
  //     },
  //   })
  // }
  // showContexts() {
  //   this.props.navigator.push({
  //     title: translate('sharedContext'),
  //     id: 10,
  //     component: GridList,
  //     backButtonTitle: 'Back',
  //     titleTextColor: '#7AAAC3',
  //     passProps: {
  //       bankStyle: this.props.style,
  //       modelName: 'tradle.Context',
  //       _readOnly: true
  //     }
  //   });
  // }
  // showTestProviders() {
  //   Actions.list({modelName: ORGANIZATION, isTest: true})
  //   this.props.navigator.push({
  //     title: translate('testProviders'),
  //     id: 10,
  //     component: GridList,
  //     backButtonTitle: 'Back',
  //     titleTextColor: '#7AAAC3',
  //     passProps: {
  //       modelName: ORGANIZATION,
  //       isTest: true,
  //       officialAccounts: true
  //     },
  //   })
  // }
  // sharedContext: {
  //   position: 'absolute',
  //   right: 5,
  //   top: 20,
  //   width: 20,
  //   height:20,
  //   justifyContent: 'center',
  //   borderRadius: 10,
  //   backgroundColor: '#246624'
  // },
  // sharedContextText: {
  //   fontSize: 12,
  //   alignSelf: 'center',
  //   color: '#ffffff'
  // },
