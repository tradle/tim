'use strict';

var NoResources = require('./NoResources');
var ResourceRow = require('./ResourceRow');
var ResourceView = require('./ResourceView');
var VerificationRow = require('./VerificationRow');
var NewResource = require('./NewResource');
var MessageList = require('./MessageList');
var PageView = require('./PageView')
var MessageView = require('./MessageView')
var GridList = require('./GridList')
var SupervisoryView = require('./SupervisoryView')
import ActionSheet from './ActionSheet'
var utils = require('../utils/utils');
var translate = utils.translate
var reactMixin = require('react-mixin');
var HomePageMixin = require('./HomePageMixin')
var extend = require('extend')
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
import Icon from 'react-native-vector-icons/Ionicons';
var buttonStyles = require('../styles/buttonStyles');
var NetworkInfoProvider = require('./NetworkInfoProvider')
var defaultBankStyle = require('../styles/defaultBankStyle.json')

var appStyle = require('../styles/appStyle.json')
var StyleSheet = require('../StyleSheet')

import { makeStylish } from './makeStylish'
import { makeResponsive } from 'react-native-orient'
var Debug = require('debug')
var debug = Debug('tradle:app:messageList')

const PRODUCT_REQUEST = 'tradle.ProductRequest'
const PARTIAL = 'tradle.Partial'
const TYPE = constants.TYPE
const ROOT_HASH = constants.ROOT_HASH
const PROFILE = constants.TYPES.PROFILE
const ORGANIZATION = constants.TYPES.ORGANIZATION
const CONFIRMATION = 'tradle.Confirmation'
const DENIAL = 'tradle.ApplicationDenial'
const BOOKMARK = 'tradle.Bookmark'

const LIMIT = 10

const sandboxDesc = 'In the Sandbox, learn how to use the app with simulated service providers. Try getting a digital passport from the Identity Authority, then opening a company at the Chamber of Commerce, then getting that company a business account at Hipster Bank.'

import React, { Component, PropTypes } from 'react'
import {
  ListView,
  RefreshControl,
  Navigator,
  Alert,
  TouchableOpacity,
  Image,
  View,
  Text,
  Platform
} from 'react-native';

import platformStyles from '../styles/platform'
import StatusBar from './StatusBar'
import ENV from '../utils/env'

const SearchBar = (function () {
  switch (Platform.OS) {
    case 'android':
    case 'web':
      return require('./SearchBar')
    case 'ios':
      return require('react-native-search-bar')
  }
})()

import ConversationsIcon from './ConversationsIcon'

class ResourceList extends Component {
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
      // isLoading: utils.getModels() ? false : true,
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
      hasTestProviders: false
    };
    // if (props.isBacklink  &&  props.backlinkList) {
    //   this.state.dataSource = dataSource.cloneWithRows(props.backlinkList)
    // }
    if (props.multiChooser) {
      this.state.chosen = {}
      let resource = this.props.resource
      let prop = this.props.prop
      if (prop  &&  resource[prop.name])
        resource[prop.name].forEach((r) => this.state.chosen[utils.getId(r)] = r)
    }
    var isRegistration = this.props.isRegistration ||  (this.props.resource  &&  this.props.resource[TYPE] === PROFILE  &&  !this.props.resource[ROOT_HASH]);
    if (isRegistration)
      this.state.isRegistration = isRegistration;
    var routes = this.props.navigator.getCurrentRoutes()
    if (this.props.chat) {
      this.state.sharedWith = {}
      routes[routes.length - 1].onRightButtonPress = this.done.bind(this)
    }
    else if (this.props.onDone) {
      this.state.sharedWith = {}
      routes[routes.length - 1].onRightButtonPress = this.props.onDone.bind(this, this.state.chosen)
    }
    else if (this.props.onDownload) {
      routes[routes.length - 1].onRightButtonPress = this.props.onDownload.bind(this)
    }
  }
  done() {
    let orgs = []
    for (let orgId in this.state.sharedWith) {
      if (!this.state.sharedWith[orgId])
        continue
      orgs.push(orgId)
//       for (var rep in this.state.sharedWithMapping) {
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
    if (chat) {
      utils.onNextTransitionEnd(navigator, () => {
        Actions.listSharedWith(resource, chat)
      });
      return
    }
    let me = utils.getMe()
    // if (me  &&  me.isEmployee && officialAccounts) {
    //   utils.onNextTransitionEnd(navigator, () => {
    //     Actions.addMessage({msg: utils.requestForModels(), isWelcome: true})
    //   });
    // }
    var params = {
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
      params.prop = utils.getModel(resource[TYPE]).value.properties[prop.name];
    if (params.prop) {
      let m = utils.getModel(resource[TYPE]).value
      // case when for example clicking on 'Verifications' on Form page
      if (m.interfaces)
        // if (utils.getModel(modelName).value.interfaces)
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
      params.limit = 10
    // this.state.isLoading = true;

    // if (tabLabel) {
    //   Actions.list(params)
    StatusBar.setHidden(false);
    // }
    // else
    if (isBacklink)
      Actions.list(params)
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
    let { navigator } = this.props
    var action = params.action;
    if (action === 'addApp') {
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
      if (curRoute.id === 11  &&  curRoute.passProps.resource[ROOT_HASH] === params.newContact[ROOT_HASH])
        return
      this.setState({newContact: params.newContact})
      return
    }
    if (action === 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }
    let { modelName, officialAccounts } = this.props
    if (action == 'newStyles'  &&  modelName === ORGANIZATION) {
      this.setState({newStyles: params.resource})
      return
    }
    if (action === 'addItem'  ||  action === 'addMessage') {
      var model = action === 'addMessage'
                ? utils.getModel(modelName).value
                : utils.getModel(params.resource[TYPE]).value;
      if (action === 'addItem'  &&  model.id !== modelName)
        return
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
      var route = {
        title: params.to.name,
        component: MessageList,
        id: 11,
        backButtonTitle: 'Back',
        passProps: {
          resource: params.to,
          filter: '',
          modelName: constants.TYPES.MESSAGE,
          currency: params.to.currency,
          bankStyle: style,
          dictionary: params.dictionary
        },
      }
      var me = utils.getMe()

      var msg = {
        message: translate('customerWaiting', me.firstName),
        _t: constants.TYPES.SELF_INTRODUCTION,
        identity: params.myIdentity,
        from: me,
        to: params.to
      }
      // var sendNotification = (resource.name === 'Rabobank'  &&  (!me.organization  ||  me.organization.name !== 'Rabobank'))
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
      this.setState({bookmarksCount: params.count})
      return
    }
    if (action === 'hasTestProviders'  &&  officialAccounts) {
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
        let m = utils.getModel(params.list[0][TYPE]).value
        if (m.id !== modelName  &&  m.subClassOf !== modelName)
          return
      }
    }
    if ((action !== 'list' &&  action !== 'listSharedWith')  ||  !params.list || params.isAggregation !== this.props.isAggregation)
      return;
    if (action === 'list'  &&  this.props.chat)
      return
    if (action === 'listSharedWith'  &&  !this.props.chat)
      return
    var list = params.list;
    if (list.length) {
      var type = list[0][constants.TYPE];
      if (type  !== modelName) {
        var m = utils.getModel(type).value;
        if (!m.subClassOf  ||  m.subClassOf != modelName)
          return;
      }
      if (this.props.multiChooser  &&  !this.props.isChooser) {
        let sharingChatId = utils.getId(this.props.sharingChat)
        list = list.filter(r => {
          return utils.getId(r) !== sharingChatId
        })
      }
    }
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
    var type = list[0][TYPE];
    if (type  !== modelName  &&  modelName !== params.requestedModelName) {
      var m = utils.getModel(type).value;
      if (!m.subClassOf  ||  m.subClassOf != modelName)
        return;
    }
    if (this.props.isBacklink  &&  params.prop !== this.props.prop)
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
    if (utils.resized(this.props, nextProps))
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
    if (nextState.isConnected !== this.state.isConnected)
      return true
    if (this.state.newStyles !== nextState.newStyles)
      return true
    if (nextState.newContact  &&  (!this.state.newContact ||  this.state.newContact !== nextState.newContact))
      return true
    if (!this.state.list  ||  !nextState.list  ||  this.state.list.length !== nextState.list.length)
      return true
    for (var i=0; i<this.state.list.length; i++) {
      if (this.state.list[i].numberOfForms !== nextState.list[i].numberOfForms)
        return true
      if (this.state.list[i][ROOT_HASH] !== nextState.list[i][ROOT_HASH])
        return true
      if (this.state.list[i]._online !== nextState.list[i]._online)
        return true
    }
    return false
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);
    var isContact = this.props.modelName === PROFILE;
    let rType = resource[TYPE]
    var isVerificationR  = rType === constants.TYPES.VERIFICATION
    var isMessage = utils.isMessage(resource)

    var isOrganization = this.props.modelName === ORGANIZATION;
    var m = utils.getModel(resource[TYPE]).value;
    if (!isContact          &&
        !isOrganization     &&
        !this.props.callback) {
      if (isMessage) {
        let title
        if (isVerificationR) {
          let type = utils.getType(resource.document)
          title = utils.makeModelTitle(utils.getModel(type).value)
        }
        else
          title = utils.makeModelTitle(m)

        this.props.navigator.push({
          title: title,
          id: 5,
          component: MessageView,
          backButtonTitle: 'Back',
          passProps: {
            resource: resource,
            bankStyle: this.props.bankStyle || defaultBankStyle
          }
        });
      }
      else {
        let title = utils.makeTitle(utils.getDisplayName(resource))
        this.props.navigator.push({
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
              model: m,
              resource: resource,
              serverOffline: this.props.serverOffline,
              bankStyle: this.props.bankStyle || defaultBankStyle
            }
          },

          passProps: {resource: resource}
        });
      }
      return;
    }
    if (this.props.prop) {
      if (me) {
        if  (this.props.modelName != PROFILE) {
          this._selectResource(resource);
          return
        }
        if (utils.isMe(resource)  ||
           (this.props.prop  &&  this.props.resource  &&  utils.isMe(this.props.resource))) {
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
      title = resource.name //utils.getDisplayName(resource, model.value.properties);
    var modelName = constants.TYPES.MESSAGE;
    var self = this;
    let style = this.mergeStyle(resource.style)

    var route = {
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      title: title,
      passProps: {
        resource: resource,
        limit: LIMIT,
        filter: '',
        modelName: modelName,
        currency: resource.currency,
        bankStyle: style,
      }
    }
    if (isContact) { //  ||  isOrganization) {
      // route.title = resource.firstName
      var isMe = isContact ? resource[ROOT_HASH] === me[ROOT_HASH] : true;
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
            currency: this.props.currency,
          }
        }
      }
    }
    if (this.props.officialAccounts) {
      // if (isOrganization)
      //   route.title = resource.name
      var msg = {
        message: translate('customerWaiting', me.firstName),
        _t: constants.TYPES.CUSTOMER_WAITING,
        from: me,
        to: utils.isEmployee(resource) ? me.organization : resource,
        time: new Date().getTime()
      }

      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg, isWelcome: true}))
    }

    this.props.navigator.push(route);
  }
  approveDeny(resource) {
    if (resource._denied) {
      Alert.alert('Application was denied')
      return
    }
    if (resource._approved) {
      Alert.alert('Application was approved')
      return
    }
    Actions.showModal({
      title: translate('approveThisApplicationFor', translate(resource.from.title)),
      buttons: [
        {
          text: translate('cancel'),
          onPress: () => {  Actions.hideModal(); console.log('Canceled!')}
        },
        {
          text: translate('Approve'),
          onPress: () => {
            if (!resource._appSubmitted)
              Alert.alert('Application is not yet submitted')
            else
              this.approve(resource)
          }
        },
        {
          text: translate('Deny'),
          onPress: () => {
            this.deny(resource)
          }
        },
      ]
    })
  }
  approve(resource) {
    Actions.hideModal()
    Alert.alert(
      translate('approveApplication', resource.from.title),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          console.log('Canceled!')
        }},
        {text: translate('Approve'), onPress: () => {
          let title = utils.makeModelTitle(utils.getModel(resource.product).value)
          let me = utils.getMe()
          let msg = {
            [TYPE]: CONFIRMATION,
            confirmationFor: resource,
            message: 'Your application for \'' + title + '\' was approved',
            _context: resource,
            from: me,
            to: resource.from
          }
          Actions.addMessage({msg: msg})
        }}
      ]
    )
  }
  deny(resource) {
    Actions.hideModal()
    Alert.alert(
      translate('denyApplication', resource.from.title),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          console.log('Canceled!')
        }},
        {text: translate('Deny'), onPress: () => {
          let title = utils.makeModelTitle(utils.getModel(resource.product).value)
          let me = utils.getMe()
          let msg = {
            [TYPE]: DENIAL,
            application: resource,
            message: 'Your application for \'' + title + '\' was denied',
            _context: resource,
            from: me,
            to: resource.from
          }
          Actions.addMessage({msg: msg})
        }}
      ]
    )

  }
  _selectResource(resource) {
    var model = utils.getModel(this.props.modelName);
    let title = utils.getDisplayName(resource);
    var newTitle = title;
    if (title.length > 20) {
      var t = title.split(' ');
      newTitle = '';
      t.forEach((word) => {
        if (newTitle.length + word.length > 20)
          return;
        newTitle += newTitle.length ? ' ' + word : word;
      })
    }

    var route = {
      title: utils.makeTitle(newTitle),
      id: 3,
      component: ResourceView,
      parentMeta: model,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        bankStyle: this.props.style,
        currency: this.props.currency
      },
    }
    // Edit resource
    var me = utils.getMe();
    if ((me || this.state.isRegistration) &&  this.props.prop) {
      this.props.callback(this.props.prop, resource); // HACK for now
      if (this.props.returnRoute)
        this.props.navigator.popToRoute(this.props.returnRoute);
      else
        this.props.navigator.pop()
      return;
    }
    if (me                       &&
       !model.value.isInterface  &&
       (resource[ROOT_HASH] === me[ROOT_HASH]  ||  resource[TYPE] !== PROFILE)) {
      var self = this ;
      route.rightButtonTitle = 'Edit'
      route.onRightButtonPress = /*() =>*/ {
        title: 'Edit',
        id: 4,
        component: NewResource,
        rightButtonTitle: 'Done',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: utils.getModel(resource[TYPE]).value,
          bankStyle: this.props.style,
          resource: me
        }
      };
    }
    this.props.navigator.push(route);
  }
  showRefResources(resource, prop) {
    var props = utils.getModel(resource[TYPE]).value.properties;
    var propJson = props[prop];
    var resourceTitle = utils.getDisplayName(resource);
    resourceTitle = utils.makeTitle(resourceTitle);

    var backlinksTitle = propJson.title + ' - ' + resourceTitle;
    backlinksTitle = utils.makeTitle(backlinksTitle);
    var modelName = propJson.items.ref;

    this.props.navigator.push({
      title: backlinksTitle,
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        resource: resource,
        prop: prop,
        bankStyle: this.props.style,
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
            bankStyle: this.props.style,
            resource: resource
          }
        },

        passProps: {
          bankStyle: this.props.style,
          resource: resource,
          currency: this.props.currency
        }
      }
    });
  }

  onSearchChange(filter) {
    if (this.props.search) {
      let modelName = filter
      let model = utils.getModel(modelName)
      if (!model)
        return
      model = model.value
      this.props.navigator.push({
        title: 'Search ' + utils.makeModelTitle(model),
        id: 4,
        component: NewResource,
        titleTextColor: '#7AAAC3',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Done',
        passProps: {
          model: model,
          resource: resource,
          search: true,
          bankStyle: this.props.bankStyle || defaultBankStyle,
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

    let {to, prop, listView, resource, modelName} = this.props
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
    var model = this.props.isBacklink
              ? utils.getModel(utils.getType(resource)).value
              : utils.getModel(this.props.modelName).value;
    if (model.isInterface)
      model = utils.getModel(utils.getType(resource)).value
 // || (model.id === constants.TYPES.FORM)
    var isVerification = model.id === constants.TYPES.VERIFICATION  ||  model.subClassOf === constants.TYPES.VERIFICATION
    var isForm = model.id === constants.TYPES.FORM || model.subClassOf === constants.TYPES.FORM
    var isMyProduct = model.id === 'tradle.MyProduct'  ||  model.subClassOf === 'tradle.MyProduct'
    var isSharedContext = utils.isContext(model)  &&  utils.isReadOnlyChat(resource)

    // let hasBacklink = this.props.prop && this.props.prop.items  &&  this.props.prop.backlink

    let selectedResource = resource
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
                onSelect={() => this.selectResource(selectedResource)}
                key={resource[ROOT_HASH]}
                navigator={this.props.navigator}
                prop={this.props.prop}
                modelName={this.props.modelName}
                parentResource={this.props.resource}
                currency={this.props.currency}
                isChooser={this.props.isChooser}
                resource={resource} />
      )
    return (<ResourceRow
      lazy={this.props.lazy}
      onSelect={() => isSharedContext ? this.openSharedContextChat(resource) : this.selectResource(resource)}
      key={resource[ROOT_HASH]}
      hideResource={this.hideResource.bind(this)}
      hideMode={this.state.hideMode}
      navigator={this.props.navigator}
      changeSharedWithList={this.props.chat ? this.changeSharedWithList.bind(this) : null}
      newContact={this.state.newContact}
      currency={this.props.currency}
      isOfficialAccounts={this.props.officialAccounts}
      multiChooser={this.props.multiChooser}
      isChooser={this.props.isChooser}
      showRefResources={this.showRefResources.bind(this)}
      resource={resource}
      chosen={this.state.chosen} />
    );
        // newContact={this.state.newContact}
  }
  openSharedContextChat(resource) {
    var route = {
      // title: translate(utils.getModel(resource.product).value) + ' -- ' + (resource.from.organization || resource.from.title) + ' ->  ' + resource.to.organization.title,
      title: (resource.from.organization || resource.from.title) + '  →  ' + resource.to.organization.title,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        context: resource,
        filter: '',
        modelName: constants.TYPES.MESSAGE,
        // currency: params.to.currency,
        bankStyle: this.props.bankStyle || defaultBankStyle
      }
    }
    Actions.addMessage({msg: utils.requestForModels(), isWelcome: true})
    var isSharedContext = utils.isContext(resource[TYPE])  &&  utils.isReadOnlyChat(resource)
    if (isSharedContext  &&  resource._relationshipManager  &&  !resource._approved  &&  !resource._denied) { //  &&  resource._appSubmitted  ) {
      route.rightButtonTitle = 'Approve/Deny'
      route.onRightButtonPress = () => this.approveDeny(resource)
    }
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
        <View style={{padding: 10, backgroundColor: 'transparent'}}>
          <Text style={styles.testProvidersDescription}>{sandboxDesc}</Text>
        </View>
      </View>
    )
  }
  renderFooter() {
    var me = utils.getMe();
    // if (!me  ||  (this.props.prop  &&  (this.props.prop.readOnly || (this.props.prop.items  &&  this.props.prop.items.readOnly))))
    //   return <View />;
    let { modelName, bankStyle } = this.props
    var model = utils.getModel(modelName).value;
    if (!this.props.prop  &&  model.id !== ORGANIZATION) {
      if (!this.props.search ||  !this.state.resource || !Object.keys(this.state.resource).length)
        return <View />
    }

    if (this.props.prop  &&  !this.props.prop.allowToAdd)
      return <View />

    let icon = Platform.OS === 'android' ? 'md-menu' : 'md-more'
    let color = Platform.OS === 'android' ? 'red' : '#ffffff'
    let employee
    if (me.isEmployee)
      employee = <View style={{justifyContent: 'center'}}>
                   <Text style={{fontSize: 18, paddingLeft: 20, color: '#7AAAC3'}}>{me.firstName + '@' + me.organization.title}</Text>
                 </View>
    else
      employee = <View/>
    return (
        <View style={[styles.footer, {justifyContent: 'space-between'}]}>
          <View/>
          {employee}
          <TouchableOpacity onPress={() => this.ActionSheet.show()}>
            <View style={[platformStyles.menuButtonNarrow, {opacity: 0.4}]}>
              <Icon name={icon}  size={33}  color={color}/>
            </View>
          </TouchableOpacity>
        </View>
     )
  }
  onSettingsPressed() {
    var model = utils.getModel(constants.TYPES.SETTINGS).value
    this.setState({hideMode: false})
    var route = {
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
  showContexts() {
    this.props.navigator.push({
      title: translate('sharedContext'),
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      rightButtonTitle: 'Download',
      passProps: {
        bankStyle: this.props.style,
        modelName: PRODUCT_REQUEST,
        _readOnly: true
      }
    });
  }

  addNew() {
    var model = utils.getModel(this.props.modelName).value;
    var r;
    this.setState({hideMode: false})
    // resource if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (this.props.resource) {
      var props = model.properties;
      for (var p in props) {
        var isBacklink = props[p].ref  &&  props[p].ref === this.props.resource[TYPE];
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
    if (this.props.prop  &&  model.subClassOf === constants.TYPES.FORM) {
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
    var content;
    var model = utils.getModel(this.props.modelName).value;
    if (this.state.dataSource.getRowCount() === 0   &&
        utils.getMe()                               &&
        !utils.getMe().organization                 &&
        !utils.isEnum(model)                        &&
        !this.props.isChooser                       &&
        this.props.modelName !== ORGANIZATION) {
      content = <NoResources
                  filter={this.state.filter}
                  model={model}
                  isLoading={this.state.isLoading}/>
    }
    else {
      content = <ListView style={{width: utils.getContentWidth(ResourceList), marginHorizontal: 10, alignSelf: 'center'}}
          dataSource={this.state.dataSource}
          renderHeader={this.renderHeader.bind(this)}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          keyboardDismissMode={utils.isWeb() ? 'none' : 'on-drag'}
          keyboardShouldPersistTaps={utils.isWeb() ? 'never' : 'always'}
          initialListSize={1000}
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
    let me = utils.getMe()
    var actionSheet = this.renderActionSheet() // me.isEmployee && me.organization ? this.renderActionSheet() : null
    let footer = actionSheet && this.renderFooter()
    var searchBar
    if (SearchBar) {
      if (!this.props._readOnly  ||  !utils.isContext(this.props.modelName)) {
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
    if (!this.props.isChooser && this.props.officialAccounts && this.props.modelName === ORGANIZATION)
       network = <NetworkInfoProvider connected={this.state.isConnected} serverOffline={this.state.serverOffline} />
    let hasSearchBar = this.props.isBacklink && this.props.backlinkList && this.props.backlinkList.length > 10
    let contentSeparator = utils.getContentSeparator(this.props.bankStyle)
    return (
      <PageView style={this.props.isBacklink ? {height: utils.dimensions().height} : platformStyles.container} separator={contentSeparator}>
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
    this.setState({refreshing: true});
    // fetchData().then(() => {
    //   this.setState({refreshing: false});
    // });
  }
  renderActionSheet() {
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

      buttons = [
        {
          text: translate('addServerUrl'),
          onPress: () => this.onSettingsPressed()
        },
        {
          text: translate('hideResource', translate(utils.getModel(this.props.modelName).value)),
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

  renderHeader() {
    if (!this.props.officialAccounts)
      return
    let sharedContext
    let partial
    let bookmarks
    let conversations
    let testProviders
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
    if (isProfile) {
      search = <View style={styles.searchRow}>
          <TouchableOpacity onPress={this.showSearch.bind(this)}>
            <View style={styles.row}>
              <Icon name='ios-search' size={utils.getFontSize(45)} color='#246624' style={[styles.cellImage, {paddingHorizontal: 5, marginRight: 5}]} />
              <View style={styles.textContainer}>
                <Text style={styles.resourceTitle}>{translate('Explore data')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      // if (!this.props.hasPartials  &&  !this.state.sharedContextCount)
      conversations = <View style={styles.conversationsRow}>
          <TouchableOpacity onPress={this.showBanks.bind(this)}>
            <View style={styles.row}>
              <ConversationsIcon style={{paddingHorizontal: 5}}/>
              <View style={styles.textContainer}>
                <Text style={styles.resourceTitle}>{translate('officialAccounts')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>


      if (this.state.hasPartials)
        partial = (
          <View>
            <View style={styles.statisticsRow}>
              <TouchableOpacity onPress={this.showPartials.bind(this)}>
                <View style={styles.row}>
                  <Icon name='ios-stats-outline' size={utils.getFontSize(45)} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
                  <View style={styles.textContainer}>
                    <Text style={styles.resourceTitle}>{translate('Statistics')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.partialsRow}>
              <TouchableOpacity onPress={this.showAllPartials.bind(this)}>
                <View style={styles.row}>
                  <Icon name='ios-apps-outline' size={utils.getFontSize(45)} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
                  <View style={styles.textContainer}>
                    <Text style={styles.resourceTitle}>{translate('Partials')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
      )
      if (this.state.bookmarksCount) {
        let color = '#6C4EA3'
        bookmarks = (
            <View style={styles.bookmarksRow}>
              <TouchableOpacity onPress={this.showBookmarks.bind(this)}>
                <View style={styles.row}>
                  <Icon name='ios-apps-outline' size={utils.getFontSize(45)} color={color} style={[styles.cellImage, {paddingLeft: 5}]} />
                  <View style={styles.textContainer}>
                    <Text style={styles.resourceTitle}>{translate('Bookmarks')}</Text>
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
                <Icon name='md-share' size={utils.getFontSize(45)} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
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

    let width = utils.getContentWidth()
    return  (
      <View style={[styles.header, { width }]}>
        {search}
        {conversations}
        {bookmarks}
        {sharedContext}
        {partial}
        {testProviders}
      </View>
    )
  }
  showSearch() {
    this.props.navigator.push({
      title: 'Explore data',
      id: 30,
      component: GridList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        modelName: constants.TYPES.MESSAGE,
        isModel: true,
        search: true
      },
    })
  }
  showPartials() {
    Actions.getAllPartials()
    this.props.navigator.push({
      id: 27,
      component: SupervisoryView,
      backButtonTitle: 'Back',
      title: translate('overviewOfApplications'),
      passProps: {}
    })
  }
  showBookmarks() {
    this.props.navigator.push({
      title: 'Bookmarks',
      id: 30,
      component: GridList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        modelName: BOOKMARK
      },
    })
  }
  showAllPartials() {
    Actions.list({modelName: PARTIAL})
    this.props.navigator.push({
      title: 'Partials',
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        modelName: PARTIAL
      },
    })
  }
  showTestProviders() {
    Actions.list({modelName: ORGANIZATION, isTest: true})
    this.props.navigator.push({
      title: translate('testProviders'),
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        modelName: ORGANIZATION,
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
  // listViewStyle: {
  //   alignSelf: 'flex-end',
  //   borderWidth: 1,
  //   borderColor: '#f7f7f7',
  //   borderLeftColor: '#cccccc'
  // },
  centerText: {
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#cccccc',
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
  menuButton: {
    marginTop: -23,
    paddingVertical: 5,
    paddingHorizontal: 21,
    borderRadius: 24,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowColor: '#afafaf',
    backgroundColor: 'red'
  },
  sharedContext: {
    position: 'absolute',
    right: 10,
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
