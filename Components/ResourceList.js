
import React, { Component } from 'react'
import {
  ListView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
  View,
  // Text,
} from 'react-native'
import PropTypes from 'prop-types';
import Reflux from 'reflux'
import Icon from 'react-native-vector-icons/Ionicons';
import { makeResponsive } from 'react-native-orient'
import reactMixin from 'react-mixin'
import _ from 'lodash'

import { Text, resetFontFamily } from './Text'
import NoResources from './NoResources'
import ResourceRow from './ResourceRow'
import VerificationRow from './VerificationRow'
import PageView from './PageView'
import ActionSheet from './ActionSheet'
import utils, { translate } from '../utils/utils'
import HomePageMixin from './HomePageMixin'
import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import constants from '@tradle/constants'
import buttonStyles from '../styles/buttonStyles'
import NetworkInfoProvider from './NetworkInfoProvider'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import { getContentSeparator } from '../utils/uiUtils'

import appStyle from '../styles/appStyle.json'
import StyleSheet from '../StyleSheet'

import { makeStylish } from './makeStylish'
import platformStyles from '../styles/platform'
import ENV from '../utils/env'
import SearchBar from './SearchBar'
import ConversationsIcon from './ConversationsIcon'

const PRODUCT_REQUEST = 'tradle.ProductRequest'
const PARTIAL = 'tradle.Partial'
const BOOKMARK = 'tradle.Bookmark'
const MY_PRODUCT =  'tradle.MyProduct'

const LIMIT = 10
const {
  MESSAGE,
  ORGANIZATION,
  PROFILE,
  CUSTOMER_WAITING,
  SELF_INTRODUCTION,
  FORM,
  VERIFICATION,
  SETTINGS
} = constants.TYPES

const {
  TYPE,
  ROOT_HASH
} = constants

class ResourceList extends Component {
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
    backlinkList: PropTypes.array
  };
  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: function(row1, row2) {
        return row1 !== row2 || row1._online !== row2._online || row1.style !== row2.style
      }
    })

    this.state = {
      isLoading: true,
      dataSource,
      allowToAdd: this.props.prop  &&  this.props.prop.allowToAdd,
      filter: this.props.filter,
      hideMode: false,  // hide provider
      serverOffline: this.props.serverOffline,
      isConnected: this.props.navigator.isConnected,
      userInput: '',
      sharedContextCount: 0,
      refreshing: false,
      hasPartials: false,
      hasBookmarks: false,
      hasTestProviders: false,
      bankStyle: props.bankStyle
    };
    // if (props.isBacklink  &&  props.backlinkList) {
    //   this.state.dataSource = dataSource.cloneWithRows(props.backlinkList)
    // }
    if (props.multiChooser) {
      this.state.chosen = {}
      let resource = this.props.resource
      let prop = this.props.prop
      if (prop  &&  resource[prop.name])
        resource[prop.name].forEach(r => this.state.chosen[utils.getId(r)] = r)
    }
    let isRegistration = this.props.isRegistration ||  (this.props.resource  &&  this.props.resource[TYPE] === PROFILE  &&  !this.props.resource[ROOT_HASH]);
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
    this.selectResource = this.selectResource.bind(this)
    this.onSettingsPressed = this.onSettingsPressed.bind(this)
    this.openSharedContextChat = this.openSharedContextChat.bind(this)
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
    if (props.isBacklink) {
      if (!props.backlinkList)
        return
      else if (props.backlinkList.length)
        this.state.dataSource = this.state.dataSource.cloneWithRows(props.backlinkList)
      else
        this.state.dataSource = this.state.dataSource.cloneWithRows([])
    }
    if (props.provider  &&  (!this.props.provider || utils.getId(this.props.provider) !== (utils.getId(props.provider)))) {
      Actions.list({modelName: ORGANIZATION})
      // this.state.customStyles = props.customStyles
    }
  }
  componentWillUnmount() {
    if (this.props.navigator.getCurrentRoutes().length === 1)
      StatusBar.setHidden(true)
  }
  componentWillMount() {
    let { officialAccounts, modelName, chat, navigator, resource } = this.props
    if (officialAccounts  &&  modelName === PROFILE)
      return
    if (officialAccounts)
      resetFontFamily()
    if (chat) {
      utils.onNextTransitionEnd(navigator, () => {
        Actions.listSharedWith(resource, chat)
      });
      return
    }
    // let me = utils.getMe()
    // if (me  &&  me.isEmployee && officialAccounts) {
    //   utils.onNextTransitionEnd(navigator, () => {
    //     Actions.addMessage({msg: utils.requestForModels(), isWelcome: true})
    //   });
    // }
    let params = {
      modelName: modelName,
      // limit: 10
    };
    let { _readOnly, isAggregation, sortProperty, prop, listView, isBacklink } = this.props
    if (_readOnly)
      params._readOnly = true

    if (isAggregation)
      params.isAggregation = true;
    if (sortProperty)
      params.sortProperty = sortProperty;
    if (prop)
      params.prop = utils.getModel(resource[TYPE]).properties[prop.name];
    if (params.prop) {
      let m = utils.getModel(resource[TYPE])
      // case when for example clicking on 'Verifications' on Form page
      if (m.interfaces)
        // if (utils.getModel(modelName).interfaces)
        //   params.to = resource.to
        params.resource = resource
      else if (params.prop.items  &&  params.prop.items.backlink)
        params.to = resource

//       params.resource = resource
    }
    else
      params.to = resource
    params.listView = listView
    if (!officialAccounts)
      params.limit = LIMIT
    // this.state.isLoading = true;

    // if (tabLabel) {
    //   Actions.list(params)
    StatusBar.setHidden(false);
    // }
    // else
    if (isBacklink)
      Actions.list(params)
    else {
      let self = this
      utils.onNextTransitionEnd(navigator, () => {
        Actions.list(params)
        if (officialAccounts  &&  modelName === ORGANIZATION  && !self.props.isDeepLink)
          Actions.hasTestProviders()
        // StatusBar.setHidden(false);
      });
    }
  }

  componentDidMount() {
    this.listenTo(Store, 'onListUpdate');
    // this.onread(true, {
    //   data: '000A2031D0BCDBE54037C938D95C878D5048038276BE8A16C24EEDA5C4E73C4EB02583123095AC1F393C1AC277F3E8C1B3214EB294FCF9CCCCE633DFA2FD0CA7B573306BB9586C61BD5332A6E6EB37F140796BB1A91A1A687474703A2F2F3137322E33312E39382E3230333A3231303132'
    // })
  }

  onListUpdate(params) {
    let { navigator } = this.props
    let action = params.action;
    if (action === 'addApp') {
      let routes = navigator.getCurrentRoutes()
      if (routes[routes.length - 1].componentName === 'QRCodeScanner')
        navigator.pop()
      if (params.error)
        Alert.alert(params.error)
      // Actions.list(ORGANIZATION)
      return
    }
    if (params.error)
      return;
    // if (params.action === 'onlineStatus') {
    //   this.setState({serverOffline: !params.online})
    //   return
    // }
    if (action === 'newContact') {
      let routes = navigator.getCurrentRoutes()
      let curRoute = routes[routes.length - 1]
      if (curRoute.componentName === 'MessageList'  &&  curRoute.passProps.resource[ROOT_HASH] === params.newContact[ROOT_HASH])
        return
      this.setState({newContact: params.newContact})
      return
    }
    if (action === 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }
    let { modelName, officialAccounts, isDeepLink } = this.props
    if (action === 'newStyles'  &&  modelName === ORGANIZATION) {
      this.setState({newStyles: params.resource})
      return
    }
    if (action === 'addItem'  ||  action === 'addMessage') {
      let model = action === 'addMessage'
                ? utils.getModel(modelName)
                : utils.getModel(params.resource[TYPE]);
      if (action === 'addItem'  &&  model.id !== modelName)
        return
      if (action === 'addMessage'  &&  modelName !== PROFILE)
        return
      let resource = params.resource
      if (resource._inactive  &&  modelName === ORGANIZATION) {
        let r
        if (resource._isTest)
          r = this.state.testProviders.find(rr => rr[ROOT_HASH] === resource[ROOT_HASH])
        else
          r = this.state.list.find(rr => rr[ROOT_HASH] === resource[ROOT_HASH])

        if (r) {
          let l = this.state.list.filter(rr => rr[ROOT_HASH] !== resource[ROOT_HASH])
          this.setState({list: l, dataSource: this.state.dataSource.cloneWithRows(l)})
          return
        }
      }
      if (params.addProvider) {
        if (this.props.isTest) {
          if (resource._isTest)
            navigator.pop()
        }
        else {
          if (!resource._isTest)
            navigator.pop()
        }
      }
      // this.state.isLoading = true;
      Actions.list({
        query: this.state.filter,
        isTest: this.props.isTest,
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
      utils.onNextTransitionEnd(navigator, () => Actions.addMessage({msg: msg})) //, true))
      if (navigator.getCurrentRoutes().length === 3)
        navigator.replace(route)
      else
        navigator.push(route)
      return
    }
    if (action === 'allSharedContexts') {
      let state = {
        sharedContextCount: params.count,
      }
      if (officialAccounts)
        this.setState(state)
      else if (this.props._readOnly  &&  utils.isContext(modelName)) {
        let list = params.list
        if (list &&  list.length) {
          state.list = list
          state.dataSource = this.state.dataSource.cloneWithRows(list)
        }
        this.setState(state)
      }
      return
    }
    if (action === 'hasPartials') { //  &&  officialAccounts  &&  (modelName === PROFILE || modelName === ORGANIZATION)) {
      this.setState({hasPartials: true})
      return
    }
    if (action === 'hasBookmarks') { //  &&  officialAccounts  &&  (modelName === PROFILE || modelName === ORGANIZATION)) {
      let state = {bookmarksCount: params.count}
      if (params.bankStyle)
        state.bankStyle = this.mergeStyle(params.bankStyle)

      this.setState(state)
      return
    }
    if (action === 'hasTestProviders'  &&  officialAccounts  &&  !isDeepLink) {
      if (!params.list  ||  !params.list.length)
        return

      let l = this.addTestProvidersRow(this.state.list  ||  [])
      this.setState({
        hasTestProviders: true,
        testProviders: params.list,
        list: l,
        dataSource: this.state.dataSource.cloneWithRows(l),
      })
      return
    }
    // if (action === 'exploreBacklink'  &&  this.props.isBacklink  &&  this.props.resource[ROOT_HASH] === params.resource[ROOT_HASH]) {
    //   this.setState({
    //     prop: params.backlink,
    //     resource: params.resource,
    //     dataSource: this.state.dataSource.cloneWithRows(params.list),
    //   })
    //   return
    // }
    if (action === 'list') {
      // First time connecting to server. No connection no providers yet loaded
      if (!params.list  &&  params.alert) {
        Alert.alert(params.alert)
        return
      }
      if (params.modelName !== modelName)
        return

      if (officialAccounts  &&  modelName === PROFILE)
        return
      if (params.isTest  !== this.props.isTest)
        return
      if (params.list  &&  params.list.length) {
        let m = utils.getModel(params.list[0][TYPE])
        if (m.id !== modelName  &&  !utils.isSubclassOf(m, modelName))
          return
      }
    }
    if ((action !== 'list' &&  action !== 'listSharedWith')  ||  !params.list || params.isAggregation !== this.props.isAggregation)
      return;
    if (action === 'list'  &&  this.props.chat)
      return
    if (action === 'listSharedWith'  &&  !this.props.chat)
      return
    let list = params.list;
    if (list.length) {
      let type = list[0][TYPE];
      if (type  !== modelName) {
        let m = utils.getModel(type);
        if (!m.subClassOf  ||  !utils.isSubclassOf(m, modelName))
          return;
      }
      if (this.props.multiChooser  &&  !this.props.isChooser) {
        let sharingChatId = utils.getId(this.props.sharingChat)
        list = list.filter(r => {
          return utils.getId(r) !== sharingChatId
        })
      }
    }
    if (!isDeepLink)
      list = this.addTestProvidersRow(list)

    let state = {
      dataSource: this.state.dataSource.cloneWithRows(list),
      list: list,
      isLoading: false,
    }

    if (!list.length) {
      if (!this.state.filter  ||  !this.state.filter.length)
        this.setState({isLoading: false})
      else
        this.setState(state)
      return;
    }
    // else if (officialAccounts  &&  modelName === ORGANIZATION) {
    //   let connected = list.some((r) => r._online)
    //   if (connected) {
    //     navigator.isConnected = true
    //     state.isConnected = true
    //   }
    // }
    if (this.props.isBacklink  &&  params.prop !== this.props.prop)
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
  addTestProvidersRow(l) {
    if (!l  ||  !this.props.officialAccounts || this.props.modelName !== ORGANIZATION)
      return l
    if (l  &&  l.some(r => r.name === 'Sandbox'))
      return utils.clone(l)
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
    if (this.props.isBacklink  &&  nextProps.isBacklink) {
      if (this.props.prop !== nextProps.prop)
        return true
      if (this.props.backlinkList  &&  this.props.backlinkList.length !== nextProps.backlinkList.length)
        return true
    }
    if (this.state.hideMode !== nextState.hideMode)
      return true
    if (this.props.provider !== nextProps.provider)
      return true
    if (this.state.serverOffline !== nextState.serverOffline)
      return true
    if (this.state.sharedContextCount !== nextState.sharedContextCount)
      return true
    if (this.state.hasPartials !== nextState.hasPartials)
      return true
    if (this.state.bookmarksCount !== nextState.bookmarksCount)
      return true
    if (this.state.hasTestProviders !== nextState.hasTestProviders)
      return true
    else if (this.state.testProviders  ||  nextState.testProviders) {
      if (!this.state.testProviders  ||  !nextState.testProviders)
        return true
      if (this.state.testProviders.length  !==  nextState.testProviders.length)
        return true
    }
    if (nextState.isConnected !== this.state.isConnected)
      return true
    if (this.state.newStyles !== nextState.newStyles)
      return true
    if (nextState.newContact  &&  (!this.state.newContact ||  this.state.newContact !== nextState.newContact))
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

  selectResource({resource, action}) {
    let me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    let { modelName, callback, navigator, bankStyle, serverOffline, prop, currency, officialAccounts } = this.props
    let isContact = modelName === PROFILE;
    let rType = resource[TYPE]
    let isVerificationR  = rType === VERIFICATION
    let isMessage = utils.isMessage(resource)

    let isOrganization = modelName === ORGANIZATION;
    let m = utils.getModel(resource[TYPE]);
    if (!isContact          &&
        !isOrganization     &&
        !callback) {
      if (isMessage) {
        let title
        if (isVerificationR) {
          let type = utils.getType(resource.document)
          title = translate(utils.getModel(type))
        }
        else
          title = translate(m)

        navigator.push({
          title: title,
          componentName: 'MessageView',
          backButtonTitle: 'Back',
          passProps: {
            resource: resource,
            bankStyle: bankStyle || defaultBankStyle
          }
        });
      }
      else {
        let title = utils.makeTitle(utils.getDisplayName(resource))
        navigator.push({
          title: title,
          componentName: 'ResourceView',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Edit',
          onRightButtonPress: {
            title: title,
            componentName: 'NewResource',
            backButtonTitle: 'Back',
            rightButtonTitle: 'Done',
            passProps: {
              model: m,
              resource: resource,
              serverOffline: serverOffline,
              bankStyle: bankStyle || defaultBankStyle
            }
          },

          passProps: {resource: resource}
        });
      }
      return;
    }
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
    else if (me.isEmployee) {
      let dn = utils.getDisplayName(resource)
      let meOrgName = me.organization.title
      if (dn === meOrgName)
        title = meOrgName
      else
        title = meOrgName + '  →  ' + dn
    }
    else
      title = resource.name //utils.getDisplayName(resource, model.properties);
    let style = this.mergeStyle(resource.style)

    if (officialAccounts) {
      if (!action) {
        // if (isOrganization)
        //   route.title = resource.name
        let msg = {
          // message: translate('customerWaiting', me.firstName),
          _t: CUSTOMER_WAITING,
          from: me,
          to: utils.isEmployee(resource) ? me.organization : resource,
          time: new Date().getTime()
        }

        utils.onNextTransitionEnd(navigator, () => Actions.addMessage({msg: msg, isWelcome: true}))
      }
      if (isOrganization) {
        if (this.showTourOrSplash({resource, action: action || 'push', callback: this.selectResource}))
          return
      }
    }
    StatusBar.setHidden(false);

    let route = {
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      title: title,
      passProps: {
        resource: resource,
        limit: LIMIT,
        filter: '',
        modelName: MESSAGE,
        currency: resource.currency,
        bankStyle: style,
        hadTour: action !== null
      }
    }
    if (isContact) { //  ||  isOrganization) {
      // route.title = resource.firstName
      let isMe = isContact ? resource[ROOT_HASH] === me[ROOT_HASH] : true;
      if (isMe) {
        route.onRightButtonPress.rightButtonTitle = 'Edit'
        route.onRightButtonPress.onRightButtonPress = {
          title: title,
          componentName: 'NewResource',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            bankStyle: style,
            model: utils.getModel(utils.getType(resource)),
            resource: resource,
            currency: currency,
          }
        }
      }
    }
    else if (isOrganization) { //  &&  !utils.getMe().isEmployee) {
      route.rightButtonTitle = 'View'
      route.onRightButtonPress = {
        title: title,
        componentName: 'ResourceView',
        backButtonTitle: 'Back',
        passProps: {
          bankStyle: style,
          resource: resource,
          currency: currency
        }
      }
    }

    navigator[action || 'push'](route);
  }

  _selectResource(resource) {
    let model = utils.getModel(this.props.modelName);
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
      componentName: 'ResourceView',
      parentMeta: model,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        bankStyle: this.props.style,
        currency: this.props.currency
      },
    }
    // Edit resource
    let me = utils.getMe();
    if ((me || this.state.isRegistration) &&  this.props.prop) {
      this.props.callback(this.props.prop, resource); // HACK for now
      if (this.props.returnRoute)
        this.props.navigator.popToRoute(this.props.returnRoute);
      else
        this.props.navigator.pop()
      return;
    }
    if (me                       &&
       !model.isInterface  &&
       (resource[ROOT_HASH] === me[ROOT_HASH]  ||  resource[TYPE] !== PROFILE)) {
      route.rightButtonTitle = 'Edit'
      route.onRightButtonPress = /*() =>*/ {
        title: 'Edit',
        componentName: 'NewResource',
        rightButtonTitle: 'Done',
        passProps: {
          model: utils.getModel(resource[TYPE]),
          bankStyle: this.props.style,
          resource: me
        }
      };
    }
    this.props.navigator.push(route);
  }

  onSearchChange(filter) {
    if (this.props.search) {
      let modelName = filter
      let model = utils.getModel(modelName)
      if (!model)
        return
      this.props.navigator.push({
        title: translate('searchSomething', translate(model)),
        componentName: 'NewResource',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Done',
        passProps: {
          model: model,
          resource: resource,
          search: true,
          bankStyle: this.state.bankStyle,
        }
      })
      // filter = filter.substring(idx + 1).trim()
      // Actions.list({
      //   query: filter,
      //   modelName: modelName,
      //   listView: listView,
      //   search: true
      // });
      return
    }

    let { prop, listView, resource, modelName } = this.props
    this.state.filter = typeof filter === 'string' ? filter : filter.nativeEvent.text
    Actions.list({
      query: this.state.filter,
      modelName: modelName,
      to: resource,
      prop: prop,
      listView: listView
    });
  }

  renderRow(resource)  {
    let model = this.props.isBacklink
              ? utils.getModel(utils.getType(resource))
              : utils.getModel(this.props.modelName);
    if (model.isInterface)
      model = utils.getModel(utils.getType(resource))
 // || (model.id === FORM)
    let isVerification = model.id === VERIFICATION  ||  utils.isVerification(model)
    let isForm = model.id === FORM || utils.isForm(model)
    let isMyProduct = model.id === MY_PRODUCT  ||  utils.isMyProduct(model)
    let isSharedContext = utils.isContext(model)  &&  utils.isReadOnlyChat(resource)

    // let hasBacklink = this.props.prop && this.props.prop.items  &&  this.props.prop.backlink

    // let selectedResource = resource
    // if (!isVerification)
      // selectedResource = resource
    // else if (resource.sources || resource.method)
    //   selectedResource = resource
    // else
    //   selectedResource = resource.document
    if (model.id === ORGANIZATION  &&  resource.name === 'Sandbox'  &&  resource._isTest)
      return this.renderTestProviders()
    if (isVerification  || isForm || isMyProduct)
      return (<VerificationRow
                lazy={this.props.lazy}
                onSelect={this.selectResource}
                navigator={this.props.navigator}
                prop={this.props.prop}
                modelName={this.props.modelName}
                parentResource={this.props.resource}
                currency={this.props.currency}
                isChooser={this.props.isChooser}
                resource={resource} />
      )
    return (<ResourceRow
      onSelect={isSharedContext ? this.openSharedContextChat : this.selectResource}
      hideResource={this.hideResource.bind(this)}
      hideMode={this.state.hideMode}
      navigator={this.props.navigator}
      changeSharedWithList={this.props.chat ? this.changeSharedWithList.bind(this) : null}
      newContact={this.state.newContact}
      currency={this.props.currency}
      isOfficialAccounts={this.props.officialAccounts}
      multiChooser={this.props.multiChooser}
      isChooser={this.props.isChooser}
      parentComponent={ResourceList}
      showRefResources={this.showRefResources.bind(this)}
      resource={resource}
      chosen={this.state.chosen} />
    );
  }
  openSharedContextChat({resource}) {
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
        bankStyle: this.state.bankStyle
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
          <TouchableOpacity  testID='Sandbox' onPress={this.showTestProviders.bind(this)}>
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
        <View style={{padding: 10, backgroundColor: 'transparent'}}>
          <Text style={styles.testProvidersDescription}>{translate('sandboxDescription')}</Text>
        </View>
      </View>
    )
  }
  renderFooter() {
    let me = utils.getMe();
    // if (!me  ||  (this.props.prop  &&  (this.props.prop.readOnly || (this.props.prop.items  &&  this.props.prop.items.readOnly))))
    //   return <View />;
    let { modelName, bankStyle } = this.props
    let model = utils.getModel(modelName);
    if (!this.props.prop  &&  model.id !== ORGANIZATION) {
      if (!this.props.search ||  !this.state.resource || !Object.keys(this.state.resource).length)
        return <View />
    }

    if (this.props.prop  &&  !this.props.prop.allowToAdd)
      return <View />
    let icon, color, backgroundColor
    let isAndroid = utils.isAndroid()
    if (this.state.hideMode) {
      icon = 'md-checkmark'
      color = isAndroid ? 'green' : '#ffffff'
      backgroundColor = isAndroid ? '#ffffff' : 'green'
    }
    else {
      icon = isAndroid ?  'md-menu' : 'md-more'
      color = isAndroid ? bankStyle.menuBgColor : bankStyle.menuColor
      backgroundColor = isAndroid ? '#ffffff' : bankStyle.menuBgColor
    }

    let employee
    if (me.isEmployee)
      employee = <View style={{justifyContent: 'center'}}>
                   <Text style={{fontSize: 18, paddingLeft: 20, color: this.state.bankStyle.linkColor}}>{me.firstName + '@' + me.organization.title}</Text>
                 </View>
    return (
        <View style={styles.footer}>
          {employee}
          <TouchableOpacity onPress={() => this.state.hideMode ? this.setState({hideMode: false}) : this.ActionSheet.show()}>
            <View style={[buttonStyles.menuButton, {opacity: 0.4, backgroundColor}]}>
              <Icon name={icon}  size={33}  color={color}/>
            </View>
          </TouchableOpacity>
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
  showContexts() {
    this.props.navigator.push({
      title: translate('sharedContext'),
      componentName: 'ResourceList',
      backButtonTitle: 'Back',
      passProps: {
        bankStyle: this.props.style,
        modelName: PRODUCT_REQUEST,
        _readOnly: true
      }
    });
  }

  addNew() {
    let model = utils.getModel(this.props.modelName);
    let r;
    this.setState({hideMode: false})
    // resource if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (this.props.resource) {
      let props = model.properties;
      for (let p in props) {
        let isBacklink = props[p].ref  &&  props[p].ref === this.props.resource[TYPE];
        if (props[p].ref  &&  !isBacklink) {
          if (utils.getModel(props[p].ref).isInterface  &&  model.interfaces  &&  model.interfaces.indexOf(props[p].ref) !== -1)
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
    if (this.props.prop  &&  utils.isForm(model)) {
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
      componentName: 'NewResource',
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
            _.extend(rr, r)
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
    let { modelName, isChooser, isBacklink, officialAccounts, _readOnly } = this.props
    let model = utils.getModel(modelName);
    if (this.state.dataSource.getRowCount() === 0   &&
        utils.getMe()                               &&
        !utils.getMe().organization                 &&
        !utils.isEnum(model)                        &&
        !isChooser                       &&
        modelName !== ORGANIZATION) {
      content = <NoResources
                  filter={this.state.filter}
                  model={model}
                  isLoading={this.state.isLoading}/>
    }
    else {
      content = <ListView
          dataSource={this.state.dataSource}
          renderHeader={this.renderHeader.bind(this)}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps="always"
          initialListSize={10}
          pageSize={20}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
            />
          }
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />;
    }
    let actionSheet = this.renderActionSheet() // me.isEmployee && me.organization ? this.renderActionSheet() : null
    let footer = (actionSheet || this.state.hideMode) && this.renderFooter()
    let searchBar
    if (SearchBar) {
      if (!_readOnly  ||  !utils.isContext(modelName)) {
        if ((this.state.list && this.state.list.length > 10) || (this.state.filter  &&  this.state.filter.length)) {
          searchBar = (
            <SearchBar
              onChangeText={this.onSearchChange.bind(this)}
              placeholder={translate('search')}
              showsCancelButton={false}
              hideBackground={true}
              />
          )
        }
      }
    }
    let network
    if (!isChooser && officialAccounts && modelName === ORGANIZATION)
       network = <NetworkInfoProvider connected={this.state.isConnected} serverOffline={this.state.serverOffline} />
    let contentSeparator = getContentSeparator(this.state.bankStyle)
    let style = {backgroundColor: '#fff'}
    // let isProfile = modelName === PROFILE
    // let useStyle = isProfile  &&  officialAccounts &&  defaultBankStyle || this.state.bankStyle
    return (
      <PageView style={isBacklink ? {style} : [platformStyles.container, style]} separator={contentSeparator} bankStyle={this.state.bankStyle}>
        {network}
        {searchBar}
        <View style={styles.separator} />
        {content}
        {footer}
        {actionSheet}
      </PageView>
    );
  }
  _onRefresh() {
    if (this.state.list  &&  this.state.list.length > LIMIT)
      this.setState({refreshing: true});
    // fetchData().then(() => {
    //   this.setState({refreshing: false});
    // });
  }
  renderActionSheet() {
    if (this.state.hideMode)
      return
    let buttons
    if (this.state.allowToAdd) {
      if (this.props.isBacklink)
        return
      buttons = [
        {
          text: translate('addNew', this.props.prop.title),
          onPress: () => this.addNew()
        }
      ]
    } else {
      if (!ENV.allowAddServer) return
      let hideText = this.state.hideMode ? 'cancelHideResource' : 'hideResource'
      buttons = [
        {
          text: translate('addServerUrl'),
          onPress: this.onSettingsPressed
        },
        {
          text: translate(hideText, translate(utils.getModel(this.props.modelName), true)),
          onPress: () => this.setState({hideMode: !this.state.hideMode, dataSource: this.state.dataSource.cloneWithRows(utils.clone(this.state.list))})
        },
        {
          text: translate('scanQRcode'),
          onPress: () => this.scanQRAndProcess()
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
  async scanQRAndProcess(prop) {
    const result = await this.scanFormsQRCode()
    const { schema, data } = result
    if (schema === 'ImportData') {
      Actions.importData(data)
      return
    }

    if (schema === 'AddProvider') {
      const { host, provider } = data
      // Actions.addApp({ url: host, permalink: provider })
      Actions.addApp({ url: host, permalink: provider, addSettings: true })
      return
    }

    Alert.alert(translate('invalidQR'), translate('supportedQrCodes'))
  }

  areYouSure() {
    Alert.alert(
      translate('areYouSureYouAreDone'),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          console.log('Canceled!')
        }},
        {text: translate('Ok'), onPress: () => {
          this.props.navigator.pop()
        }},
      ]
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
          Actions.addItem({resource: resource, value: r, meta: utils.getModel(resource[TYPE])})
          // this.setState({hideMode: false})
        }},
      ]
    )
  }

  renderHeader() {
    if (!this.props.officialAccounts)
      return
    let sharedContext
    let partial
    let bookmarks
    let conversations
    let testProviders
    let newCustomer
    let isOrg = this.props.modelName === ORGANIZATION
    let isProfile = this.props.modelName === PROFILE
    if (!isOrg  &&  !isProfile)
      return
    if (isOrg) {
      if (!this.state.hasTestProviders  ||  this.props.isTest)
        return <View/>
      // testProviders = (
      //   <View style={styles.testProvidersRow}>
      //     <TouchableOpacity onPress={this.showTestProviders.bind(this)}>
      //       <View style={styles.row}>
      //         <Icon name='ios-pulse-outline' size={utils.getFontSize(45)} color={appStyle.TEST_PROVIDERS_ROW_FG_COLOR} style={[styles.cellImage, {paddingLeft: 5}]} />
      //         <View style={styles.textContainer}>
      //           <Text style={[styles.resourceTitle, styles.testProvidersText]}>{translate('testProviders')}</Text>
      //         </View>
      //         <View style={styles.testProviders}>
      //           <Text style={styles.testProvidersCounter}>{this.state.testProviders.length}</Text>
      //         </View>
      //       </View>
      //     </TouchableOpacity>
      //   </View>
      // )
    }
    let search
    let me = utils.getMe()
    if (isProfile) {
      if (utils.isAgent()) {
        let color = '#1F59A3'
        newCustomer = <View style={styles.newCustomerRow}>
          <TouchableOpacity onPress={this.newCustomer.bind(this)}>
            <View style={styles.row}>
              <Icon name='ios-people-outline' size={45} color={color} style={[styles.cellImage, {paddingLeft: 5}]} />
              <View style={styles.textContainer}>
                <Text style={styles.resourceTitle}>{translate('newCustomer')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      }
      else {
        search = <View style={styles.searchRow}>
            <TouchableOpacity onPress={this.showSearch.bind(this)}>
              <View style={styles.row}>
                <Icon name='ios-search' size={45} color='#246624' style={[styles.cellImage, {paddingLeft: 5, marginRight: 0}]} />
                <View style={styles.textContainer}>
                  <Text style={styles.resourceTitle}>{translate('exploreData')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        // if (!this.props.hasPartials  &&  !this.state.sharedContextCount)


        if (this.state.hasPartials)
          partial = (
            <View>
              <View style={styles.statisticsRow}>
                <TouchableOpacity onPress={this.showPartials.bind(this)}>
                  <View style={styles.row}>
                    <Icon name='ios-stats-outline' size={45} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
                    <View style={styles.textContainer}>
                      <Text style={styles.resourceTitle}>{translate('Statistics')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.partialsRow}>
                <TouchableOpacity onPress={this.showAllPartials.bind(this)}>
                  <View style={styles.row}>
                    <Icon name='ios-apps-outline' size={45} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
                    <View style={styles.textContainer}>
                      <Text style={styles.resourceTitle}>{translate('Partials')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
        )
      }
      conversations = <View style={styles.conversationsRow}>
          <TouchableOpacity onPress={this.showBanks.bind(this)}>
            <View style={styles.row}>
              <ConversationsIcon />
              <View style={styles.textContainer}>
                <Text style={styles.resourceTitle}>{translate('officialAccounts')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      if (this.state.bookmarksCount) {
        let color = '#6C4EA3'
        bookmarks = (
            <View style={styles.bookmarksRow}>
              <TouchableOpacity onPress={this.showBookmarks.bind(this)}>
                <View style={styles.row}>
                  <Icon name='ios-apps-outline' size={45} color={color} style={[styles.cellImage, {paddingLeft: 5}]} />
                  <View style={styles.textContainer}>
                    <Text style={styles.resourceTitle}>{translate('bookmarks')}</Text>
                  </View>
                  <View style={[styles.sharedContext, {backgroundColor: color}]}>
                    <Text style={styles.sharedContextText}>{this.state.bookmarksCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )
      }

      if (this.state.sharedContextCount)
        sharedContext = (
          <View style={styles.sharedContextRow}>
            <TouchableOpacity onPress={this.showContexts.bind(this)}>
              <View style={styles.row}>
                <Icon name='md-share' size={45} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
                <View style={styles.textContainer}>
                  <Text style={styles.resourceTitle}>{translate('sharedContext')}</Text>
                </View>
                <View style={styles.sharedContext}>
                  <Text style={styles.sharedContextText}>{this.state.sharedContextCount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )
    }
    return  (
      <View style={{paddingHorizontal: 20}}>
        {search}
        {newCustomer}
        {conversations}
        {bookmarks}
        {sharedContext}
        {partial}
        {testProviders}
      </View>
    )
  }
  newCustomer() {
    const { navigator, bankStyle } = this.props
    let me = utils.getMe()
    let route = {
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      title: me.organization.title,
      passProps: {
        onLeftButtonPress: this.areYouSure.bind(this),
        resource: me.organization,
        bankStyle,
        newCustomer: true
      }
    }
    this.props.navigator.push(route)
  }
  showSearch() {
    this.props.navigator.push({
      title: 'Explore data',
      componentName: 'GridList',
      backButtonTitle: 'Back',
      passProps: {
        modelName: MESSAGE,
        bankStyle: this.state.bankStyle,
        isModel: true,
        search: true,
        exploreData: true
      },
    })
  }
  showPartials() {
    Actions.getAllPartials()
    this.props.navigator.push({
      componentName: 'SupervisoryView',
      backButtonTitle: 'Back',
      title: translate('overviewOfApplications'),
      passProps: {}
    })
  }
  showBookmarks() {
    this.props.navigator.push({
      title: translate('bookmarks'),
      componentName: 'GridList',
      backButtonTitle: 'Back',
      passProps: {
        modelName: BOOKMARK,
        bankStyle: this.props.bankStyle || this.state.bankStyle
      },
    })
  }
  showAllPartials() {
    Actions.list({modelName: PARTIAL})
    this.props.navigator.push({
      title: 'Partials',
      componentName: 'ResourceList',
      backButtonTitle: 'Back',
      passProps: {
        bankStyle: this.state.bankStyle,
        modelName: PARTIAL
      },
    })
  }
  showTestProviders() {
    Actions.list({modelName: ORGANIZATION, isTest: true})
    this.props.navigator.push({
      title: translate('testProviders'),
      componentName: 'ResourceList',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Profile',
      passProps: {
        modelName: ORGANIZATION,
        bankStyle: this.state.bankStyle,
        isTest: true,
        officialAccounts: true
      },
    })
  }
}
reactMixin(ResourceList.prototype, Reflux.ListenerMixin);
reactMixin(ResourceList.prototype, HomePageMixin)
ResourceList = makeStylish(ResourceList)
ResourceList = makeResponsive(ResourceList)

// TODO: use utils.normalizeBoxShadow
var PRETTY_ROW_SHADOW = utils.isWeb()
? {
    boxShadow: '0 0px 10px 0 rgba(0,0,0,0.12)'
  }
: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5
  }

var PRETTY_ROW_STYLE = {
  ...PRETTY_ROW_SHADOW,
  marginTop: 10,
  padding: 15
}

var prettifyRow = style => {
  return {
    ...PRETTY_ROW_STYLE,
    ...style
  }
}

var styles = StyleSheet.create({
  header: {
    padding: 20
  },
  prettyRow: PRETTY_ROW_STYLE,
  searchRow: prettifyRow({
    backgroundColor: '#f7f7f7'
  }),
  bookmarksRow: prettifyRow({
    backgroundColor: '#F0E8FF'
  }),
  sharedContextRow: prettifyRow({
    backgroundColor: '#f1ffe7'
  }),
  conversationsRow: prettifyRow({
    backgroundColor: '#CDE4F7'
  }),
  newCustomerRow: prettifyRow({
    backgroundColor: '#FBFFE5'
  }),
  statisticsRow: prettifyRow({
    backgroundColor: '#BADFCD'
  }),
  partialsRow: prettifyRow({
    backgroundColor: '#FBFFE5'
  }),
  // container: {
  //   flex: 1,
  //   backgroundColor: '#f7f7f7',
  //   // backgroundColor: 'white',
  //   marginTop: Platform.OS === 'ios' ? 64 : 44,
  // },
  centerText: {
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  // icon: {
  //   marginLeft: -23,
  //   marginTop: -25,
  //   color: 'red'
  // },
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
  sharedContext: {
    position: 'absolute',
    right: 5,
    top: 20,
    width: 20,
    height:20,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#246624'
  },
  sharedContextText: {
    fontSize: 12,
    alignSelf: 'center',
    color: '#ffffff'
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
  }
});

module.exports = ResourceList;
