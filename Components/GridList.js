'use strict';

var NoResources = require('./NoResources');
var ResourceRow = require('./ResourceRow');
var ResourceView = require('./ResourceView');
var VerificationRow = require('./VerificationRow');
var NewResource = require('./NewResource');
var MessageList = require('./MessageList');
var MessageView = require('./MessageView')
var PageView = require('./PageView')
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

import InfiniteScrollView from 'react-native-infinite-scroll-view';
import {Column as Col, Row} from 'react-native-flexbox-grid'
import { makeStylish } from './makeStylish'

const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const PARTIAL = 'tradle.Partial'
const TYPE = constants.TYPE
const ROOT_HASH = constants.ROOT_HASH
const PROFILE = constants.TYPES.PROFILE
const ORGANIZATION = constants.TYPES.ORGANIZATION
const CONFIRMATION = 'tradle.Confirmation'
const DENIAL = 'tradle.ApplicationDenial'

const MONEY = 'tradle.Money'
const FORM = 'tradle.Form'
const ENUM = 'tradle.Enum'
const sandboxDesc = 'In the Sandbox, learn how to use the app with simulated service providers. Try getting a digital passport from the Identity Authority, then opening a company at the Chamber of Commerce, then getting that company a business account at Hipster Bank.'

var CURRENCY_SYMBOL
var cnt = 0
import React, { Component, PropTypes } from 'react'
import {
  ListView,
  RefreshControl,
  Navigator,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
  View,
  Text,
  Platform
} from 'react-native';

import platformStyles from '../styles/platform'
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
    // backlinkList: PropTypes.array
  };
  constructor(props) {
    super(props);

    const dataSource = new ListView.DataSource({
      rowHasChanged: function(row1, row2) {
        return row1 !== row2 || row1._online !== row2._online || row1.style !== row2.style
      }
    })
    let {modelName} = this.props
    let model = utils.getModel(modelName).value
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
      hasTestProviders: false,
      isGrid:  modelName !== FORM  &&  !model.isInterface//this.props.modelName === constants.TYPES.VERIFICATION
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
    if (props.provider  &&  (!this.props.provider || utils.getId(this.props.provider) !== (utils.getId(props.provider)))) {
      Actions.list({modelName: ORGANIZATION})
      // this.state.customStyles = props.customStyles
    }
  }
  getParamsForBacklinkList(props) {
    var params = {
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
        // if (utils.getModel(props.modelName).value.interfaces)
        //   params.to = props.resource.to
        params.resource = props.resource
      else if (params.prop.items  &&  params.prop.items.backlink)
        params.to = props.resource

//       params.resource = props.resource
    }
    else
      params.to = props.resource
    params.listView = props.listView
    return params
  }
  componentWillUnmount() {
    if (this.props.navigator.getCurrentRoutes().length === 1)
      StatusBar.setHidden(true)
  }
  componentWillMount() {
    if (this.props.chat) {
      utils.onNextTransitionEnd(this.props.navigator, () => {
        Actions.listSharedWith(this.props.resource, this.props.chat)
      });
      return
    }
    let me = utils.getMe()
    if (me  &&  me.isEmployee && this.props.officialAccounts) {
      utils.onNextTransitionEnd(this.props.navigator, () => {
        Actions.addMessage({msg: utils.requestForModels(), isWelcome: true})
      });
    }
    let params = this.getParamsForBacklinkList(this.props)
//     var params = {
//       modelName: this.props.modelName,
//       // limit: 10
//     };
//     if (this.props._readOnly)
//       params._readOnly = true

//     if (this.props.isAggregation)
//       params.isAggregation = true;
//     if (this.props.sortProperty)
//       params.sortProperty = this.props.sortProperty;
//     if (this.props.prop)
//       params.prop = utils.getModel(this.props.resource[TYPE]).value.properties[this.props.prop.name];
//     if (params.prop) {
//       let m = utils.getModel(this.props.resource[TYPE]).value
//       // case when for example clicking on 'Verifications' on Form page
//       if (m.interfaces)
//         // if (utils.getModel(this.props.modelName).value.interfaces)
//         //   params.to = this.props.resource.to
//         params.resource = this.props.resource
//       else if (params.prop.items  &&  params.prop.items.backlink)
//         params.to = this.props.resource

// //       params.resource = this.props.resource
//     }
//     else
//       params.to = this.props.resource
//     params.listView = this.props.listView
    // this.state.isLoading = true;

    // if (this.props.tabLabel) {
    //   Actions.list(params)
    StatusBar.setHidden(false);
    // }
    // else
    if (this.props.isBacklink) {
      // params.limit = 10
      Actions.list(params)
    }
    else
      utils.onNextTransitionEnd(this.props.navigator, () => {
        Actions.list(params)
        if (this.props.officialAccounts  &&  this.props.modelName === ORGANIZATION)
          Actions.hasTestProviders()
        // StatusBar.setHidden(false);
      });
  }

  componentDidMount() {
    this.listenTo(Store, 'onListUpdate');
  }

  onListUpdate(params) {
    var {action, error} = params
    if (action === 'addApp') {
      this.props.navigator.pop()
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
      let routes = this.props.navigator.getCurrentRoutes()
      let curRoute = routes[routes.length - 1]
      if (curRoute.id === 11  &&  curRoute.passProps.resource[ROOT_HASH] === params.newContact[ROOT_HASH])
        return
      this.setState({newContact: params.newContact})
      // let style = this.mergeStyle(params.newContact.style)
      // this.props.navigator[curRoute.id === 3 ? 'replace' : 'push']({
      //   title: params.newContact.firstName,
      //   component: MessageList,
      //   id: 11,
      //   backButtonTitle: 'Back',
      //   passProps: {
      //     resource: params.newContact,
      //     filter: '',
      //     modelName: constants.TYPES.MESSAGE,
      //     // currency: params.organization.currency,
      //     bankStyle: style,
      //     // dictionary: params.dictionary,
      //   }
      // })

      return
    }
    if (action === 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }
    if (action == 'newStyles'  &&  this.props.modelName === ORGANIZATION) {
      this.setState({newStyles: params.resource})
      return
    }
    if (action === 'addItem'  ||  action === 'addMessage') {
      var model = action === 'addMessage'
                ? utils.getModel(this.props.modelName).value
                : utils.getModel(params.resource[TYPE]).value;
      if (action === 'addItem'  &&  model.id !== this.props.modelName)
        return
      if (action === 'addMessage'  &&  this.props.modelName !== PROFILE)
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
      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg})) //, true))
      if (this.props.navigator.getCurrentRoutes().length === 3)
        this.props.navigator.replace(route)
      else
        this.props.navigator.push(route)
      return
    }
    if (action === 'allSharedContexts') {
      let state = {
        sharedContextCount: params.count,
      }
      if (this.props.officialAccounts)
        this.setState(state)
      else if (this.props._readOnly  &&  this.props.modelName === PRODUCT_APPLICATION) {
        let list = params.list
        if (list &&  list.length) {
          state.list = list
          state.dataSource = this.state.dataSource.cloneWithRows(list)
        }
        this.setState(state)
      }
      return
    }
    if (action === 'hasPartials') { //  &&  this.props.officialAccounts  &&  (this.props.modelName === PROFILE || this.props.modelName === ORGANIZATION)) {
      this.setState({hasPartials: true})
      return
    }
    if (action === 'hasTestProviders'  &&  this.props.officialAccounts) {
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
      if (params.isTest  !== this.props.isTest)
        return
      if (params.list  &&  params.list.length) {
        let m = utils.getModel(params.list[0][TYPE]).value
        if (m.id !== this.props.modelName)  {
          let model = utils.getModel(this.props.modelName).value
          if (model.isInterface) {
            if (m.interfaces  &&  m.interfaces.indexOf(this.props.modelName) === -1)
              return
          }
          else if (m.subClassOf !== this.props.modelName)
            return
        }
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
      if (type  !== this.props.modelName  &&  !this.props.isBacklink) {
        var m = utils.getModel(type).value;
        if (m.subClassOf != this.props.modelName)
          return;
      }
      if (this.props.multiChooser  &&  !this.props.isChooser) {
        let sharingChatId = utils.getId(this.props.sharingChat)
        list = list.filter(r => {
          return utils.getId(r) !== sharingChatId
        })
      }
      if (params.start) {
        let l = []
        this.state.list.forEach((r) => l.push(r))
        list.forEach((r) => l.push(r))
        list = l
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
    var type = list[0][TYPE];
    if (type  !== this.props.modelName  &&  this.props.modelName !== params.requestedModelName) {
      var m = utils.getModel(type).value;
      if (!m.subClassOf  ||  m.subClassOf != this.props.modelName)
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
    if (this.props.isBacklink  &&  nextProps.isBacklink) {
      if (this.props.prop !== nextProps.prop)
        return true
      if (this.props.backlinkList  &&  this.props.backlinkList.length !== nextProps.backlinkList.length)
        return true
      // let prop = this.props.prop.name
      // if (this.props.resource[prop].length !== nextProps.resource[prop].length)
      //   return true
      // else if (this.state.prop !== nextState.prop)
      //   return true
    }
    if (this.state.dataSource.getRowCount() !== nextState.dataSource.getRowCount())
      return true
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
    if (this.state.hasTestProviders !== nextState.hasTestProviders)
      return true
    if (nextState.isConnected !== this.state.isConnected)
      return true
    if (this.state.newStyles !== nextState.newStyles)
      return true
    if (nextState.newContact  &&  (!this.state.newContact ||  this.state.newContact !== nextState.newContact))
      return true
        // if (this.state.isConnected !== nextState.isConnected)
    //   if (!this.state.list && !nextState.list)
    //     return true
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
    var isVerification = model.value.id === constants.TYPES.VERIFICATION
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
        var title = utils.makeTitle(utils.getDisplayName(resource, m.properties))
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
    var title = isContact ? resource.firstName : resource.name; //utils.getDisplayName(resource, model.value.properties);
    var modelName = constants.TYPES.MESSAGE;
    var self = this;
    let style = this.mergeStyle(resource.style)

    var route = {
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        filter: '',
        modelName: modelName,
        currency: resource.currency,
        bankStyle: style,
      }
    }
    if (isContact) { //  ||  isOrganization) {
      route.title = resource.firstName
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
      if (isOrganization)
        route.title = resource.name
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
    var title = utils.getDisplayName(resource, model.value.properties);
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
    var resourceTitle = utils.getDisplayName(resource, props);
    resourceTitle = utils.makeTitle(resourceTitle);

    var backlinksTitle = propJson.title + ' - ' + resourceTitle;
    backlinksTitle = utils.makeTitle(backlinksTitle);
    var modelName = propJson.items.ref;

    this.props.navigator.push({
      title: backlinksTitle,
      id: 10,
      component: GridList,
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
    this.state.filter = typeof filter === 'string' ? filter : filter.nativeEvent.text
    Actions.list({
      query: this.state.filter,
      modelName: this.props.modelName,
      to: this.props.resource,
      prop: this.props.prop,
      listView: this.props.listView
    });
  }

  renderRow(resource, sectionId, rowId)  {
    if (this.state.isGrid  ||  this.props.modelName === constants.TYPES.VERIFICATION)
      return this.renderGridRow(resource, sectionId, rowId)

    var model = this.props.isBacklink
              ? utils.getModel(utils.getType(resource)).value
              : utils.getModel(this.props.modelName).value;
    if (model.isInterface)
      model = utils.getModel(utils.getType(resource)).value
 // || (model.id === constants.TYPES.FORM)
    var isVerification = model.id === constants.TYPES.VERIFICATION  ||  model.subClassOf === constants.TYPES.VERIFICATION
    var isForm = model.id === constants.TYPES.FORM || model.subClassOf === constants.TYPES.FORM
    var isMyProduct = model.id === 'tradle.MyProduct'  ||  model.subClassOf === 'tradle.MyProduct'
    var isSharedContext = model.id === PRODUCT_APPLICATION && utils.isReadOnlyChat(resource)

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
  }
  sort(prop) {
    let order = this.state.order
    let curOrder = this.state.order[prop]

    order[prop] = curOrder ? false : true

    this.setState({order: order, sortProperty: prop})
    Actions.list({modelName: this.props.modelName, sortProperty: prop, asc: order[prop], gridView: true})
  }
  getGridCols() {
    let model = utils.getModel(this.props.modelName).value
    let props = model.properties
    let viewCols = model.gridCols || model.viewCols
    if (!viewCols)
      return
    let vCols = []
    viewCols.forEach((v) => {
      if (/*!props[v].readOnly &&*/ !props[v].list)
        vCols.push(v)
    })
    // if (vCols.length === 7)
    //   vCols.splice(6, 1)
    return vCols
  }
  getNextKey(resource) {
    return resource[constants.ROOT_HASH] + '_' + cnt++
  }
  addDateProp(resource, dateProp, style) {
    var properties = utils.getModel(resource[constants.TYPE] || resource.id).value.properties;
    if (properties[dateProp]  &&  properties[dateProp].style)
      style = [style, properties[dateProp].style];
    var val = utils.formatDate(new Date(resource[dateProp]));

    // return !properties[dateProp]  ||  properties[dateProp].skipLabel || style
    //     ? <Text style={style} key={this.getNextKey()}>{val}</Text>
    //     : <View style={{flexDirection: 'row'}} key={this.getNextKey()}><Text style={style}>{properties[dateProp].title}</Text><Text style={style}>{val}</Text></View>

    return <Text style={style} key={this.getNextKey(resource)}>{val}</Text>;
  }

  renderGridRow(resource, sectionId, rowId)  {
    let viewCols = this.getGridCols()

    let key = this.getNextKey(resource)
    let size = viewCols ? viewCols.length : 1
    let colSize =  utils.dimensions(GridList).width < 736 ? size / 2 : 1

    let cols
    if (viewCols) {
      cols = viewCols.map((v) => (
        <Col sm={colSize} md={1} lg={1} style={styles.col} key={key + v}>
          {this.formatCol(resource, v) || <View />}
        </Col>
      ))
    }
    else {
      var color = this.props.isOfficialAccounts && style ? {color: style.LIST_COLOR} : {}
      var style = [styles.description, color]
      // cols = <Col sm={size} md={1} lg={1} style={styles.col} key={key + rowId}>
      //         {this.formatCol(resource, null) || <View />}
      //       </Col>
      let m = utils.getModel(this.props.modelName).value
      let rModel = utils.getModel(resource[TYPE]).value
      let typeTitle
      if (rModel.id !== m.id  &&  rModel.subClassOf === m.id)
        typeTitle = <Text style={styles.type}>{utils.makeModelTitle(rModel)}</Text>
      let cellStyle = {paddingVertical: 3, paddingLeft: 7}
      cols = <View style={cellStyle}>
               {typeTitle}
               <Col sm={1} md={1} lg={1} style={styles.col} key={key + rowId}>
                 <Text style={style}>{utils.getDisplayName(resource)}</Text>
               </Col>
             </View>
    }
    return  <Row size={size} style={{borderBottomColor: '#f5f5f5', borderBottomWidth: 1, backgroundColor: rowId % 2 ? '#f9f9f9' : 'transparent'}} key={key} nowrap>
              {cols}
            </Row>
  }
  formatCol(resource, prop, style) {
    var self = this;
    var model = utils.getModel(resource[TYPE] || resource.id).value;

    // if (!prop) {
    //   let m = utils.getModel(this.props.modelName).value
    //   let row = <Text style={styles.description} key={this.getNextKey(resource)}>{utils.getDisplayName(resource)}</Text>
    //   if (m.isInterface || m.id === FORM) {
    //     row = <View key={this.getNextKey(resource)}>
    //             <Text style={styles.type}>{utils.makeModelTitle(model)}</Text>
    //             {row}
    //           </View>
    //   }
    //   return <View style={cellStyle}>{row}</View>

    // }
    var properties = model.properties;

    var isOfficialAccounts = this.props.isOfficialAccounts
    var color = isOfficialAccounts && style ? {color: style.LIST_COLOR} : {}
    var isContact = resource[TYPE] === PROFILE;
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

    var style = [styles.description, color]
    if (isContact  &&  v === 'organization') {
      style.push({alignSelf: 'flex-end', marginTop: 20})
      style.push(styles.verySmallLetters);
    }
    if (properties[v].style)
      style.push(properties[v].style);
    let ref = properties[v].ref;
    let row
    let cellStyle = {paddingVertical: 3, paddingLeft: 7}
    if (ref) {
      if (!resource[v])
        return
      let refM = utils.getModel(ref).value
      if (ref == MONEY)
        row = <Text style={style} key={this.getNextKey(resource)}>{(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value}</Text>
      else {
        row = <Text style={styles.description} key={this.getNextKey(resource)}>{utils.getDisplayName(resource[v])}</Text>
        if (refM.isInterface || refM.id === FORM) {
          let resType = utils.getType(resource[v])
          let resM = utils.getModel(resType).value
          // row = <View key={this.getNextKey(resource)}>
          //         <Text style={[style, {color: this.props.bankStyle.LINK_COLOR}]}>{utils.makeModelTitle(resM)}</Text>
          //         {row}
          //       </View>
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
                    bankStyle: this.props.bankStyle,
                    // titleTextColor: '#7AAAC3',
                    backButtonTitle: 'Back',
                    passProps: {resource: resource}
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

    if (resource[v]  &&  (typeof resource[v] != 'string'))
      return <View style={cellStyle}><Text style={style} numberOfLines={1} key={this.getNextKey(resource)}>{resource[v]}</Text></View>
    if (!backlink  &&  resource[v]  && (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
      return <View style={cellStyle}><Text style={style} onPress={this.onPress.bind(self)} numberOfLines={1} key={this.getNextKey(resource)}>{resource[v]}</Text></View>

    var val = properties[v].displayAs ? utils.templateIt(properties[v], resource) : resource[v];
    let msgParts = utils.splitMessage(val);
    if (msgParts.length <= 2)
      val = msgParts[0];
    else {
      val = '';
      for (let i=0; i<msgParts.length - 1; i++)
        val += msgParts[i];
    }
    val = val.replace(/\*/g, '')
    return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{val}</Text></View>
  }

  renderGridHeader() {
    // if (this.state.isLoading)
    //   return <View/>
    var model = utils.getModel(this.props.modelName).value
    var viewCols = this.getGridCols() // model.gridCols || model.viewCols;
    if (!viewCols)
      return <View />
    var props = model.properties
    let size = viewCols.length
    let smCol = size/2
    let cols = viewCols.map((p) => (
              <Col sm={smCol} md={1} lg={1} style={styles.col} key={p + cnt}>
                <TouchableOpacity onPress={() => this.sort(p)}>
                  <Text style={styles.cell}>
                    {props[p].title.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </Col>
            ))
    return <View style={{backgroundColor: '#FBFFE5'}} key='Datagrid_h1'>
            <Row size={size} style={styles.headerRow} key='Datagrid_h2' nowrap>
              {cols}
            </Row>
          </View>

  }
  async _loadMoreContentAsync() {
    if (this.state.refreshing) {
      // debugger
      return
    }
    this.state.refreshing = true
    let list = this.state.list
    Actions.list({
      modelName: this.props.modelName,
      sortProperty: this.props.sortProp,
      asc: this.props.order,
      // limit: this.props.limit || 10,
      start: list.length,
      gridView: this.state.isGrid,
      startRec: list[this.state.list.length - 1]
    })

    // In this example, we're assuming cursor-based pagination, where any
    // additional data can be accessed at this.props.listData.nextUrl.
    //
    // If nextUrl is set, that means there is more data. If nextUrl is unset,
    // then there is no existing data, and you should fetch from scratch.
    // this.props.dispatch(fetchMoreContent(this.props.listData.nextUrl));
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
    var isSharedContext = resource[TYPE] === PRODUCT_APPLICATION && utils.isReadOnlyChat(resource)
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
    var model = utils.getModel(this.props.modelName).value;
    if (!this.props.prop  &&  model.id !== ORGANIZATION)
      return <View />

    // if (model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT ||  model.subClassOf === ENUM)
    //   return <View />
    if (this.props.prop  &&  !this.props.prop.allowToAdd)
      return <View />
    let icon = Platform.OS === 'ios' ?  'md-more' : 'md-menu'
    let color = Platform.OS === 'ios' ? '#ffffff' : 'red'
    return (
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => this.ActionSheet.show()}>
            <View style={[platformStyles.menuButtonNarrow, {opacity: 0.4}]}>
              <Icon name={icon}  size={33}  color={color}/>
            </View>
          </TouchableOpacity>
        </View>
     )
    // if (Platform.OS === 'ios')
    //   return (
    //     <View style={[platformStyles.menuButtonNarrow, {width: 47, position: 'absolute', right: 10, bottom: 20, borderRadius: 24, justifyContent: 'center', alignItems: 'center'}]}>
    //        <TouchableOpacity onPress={() => this.ActionSheet.show()}>
    //           <Icon name='md-more'  size={33}  color='#ffffff'/>
    //        </TouchableOpacity>
    //     </View>
    //   )
    // else
    //   return (
    //      <View style={styles.footer}>
    //        <TouchableOpacity onPress={() => this.ActionSheet.show()}>
    //          <View style={platformStyles.menuButtonNarrow}>
    //            <Icon name='md-menu'  size={33}  color='red' />
    //          </View>
    //        </TouchableOpacity>
    //      </View>
    //   )
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
      component: GridList,
      backButtonTitle: 'Back',
      titleTextColor: '#7AAAC3',
      passProps: {
        bankStyle: this.props.style,
        modelName: PRODUCT_APPLICATION,
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
    var {isGrid, filter, dataSource, isLoading, refreshing, list} = this.state
    var model = utils.getModel(this.props.modelName).value;
    if (dataSource.getRowCount() === 0   &&
        utils.getMe()                               &&
        !utils.getMe().organization                 &&
        model.subClassOf !== ENUM                   &&
        !this.props.isChooser                       &&
        this.props.modelName !== ORGANIZATION  &&
        (!model.subClassOf  ||  model.subClassOf !== ENUM)) {
      content = <NoResources
                  filter={filter}
                  model={model}
                  isLoading={isLoading}/>
    }
    content = <ListView
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
      refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._loadMoreContentAsync.bind(this)}
        />
      }
      scrollRenderAhead={10}
      showsVerticalScrollIndicator={false} />;

    let me = utils.getMe()
    var actionSheet = this.renderActionSheet() // me.isEmployee && me.organization ? this.renderActionSheet() : null
    let footer = actionSheet && this.renderFooter()
    var searchBar
    if (SearchBar) {
      if (!this.props._readOnly  ||  this.props.modelName !== PRODUCT_APPLICATION) {
        if ((list && list.length > 10) || (filter  &&  filter.length)) {
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
      <PageView style={this.props.isBacklink ? {} : platformStyles.container} separator={contentSeparator}>
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
    if (this.state.isGrid  ||  this.props.modelName === constants.TYPES.VERIFICATION)
      return this.renderGridHeader()
    if (!this.props.officialAccounts)
      return
    let sharedContext
    let partial
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
    if (isProfile) {
      // if (!this.props.hasPartials  &&  !this.state.sharedContextCount)
      conversations = <View style={{padding: 5, backgroundColor: '#CDE4F7'}}>
          <TouchableOpacity onPress={this.showBanks.bind(this)}>
            <View style={styles.row}>
              <ConversationsIcon />
              <View style={styles.textContainer}>
                <Text style={styles.resourceTitle}>{translate('officialAccounts')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      if (this.state.hasPartials)
        partial = (
          <View>
            <View style={{padding: 5, backgroundColor: '#BADFCD'}}>
              <TouchableOpacity onPress={this.showPartials.bind(this)}>
                <View style={styles.row}>
                  <Icon name='ios-stats-outline' size={utils.getFontSize(45)} color='#246624' style={[styles.cellImage, {paddingLeft: 5}]} />
                  <View style={styles.textContainer}>
                    <Text style={styles.resourceTitle}>{translate('Statistics')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{padding: 5, backgroundColor: '#FBFFE5'}}>
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
      if (this.state.sharedContextCount)
        sharedContext = (
          <View style={{padding: 5, backgroundColor: '#f1ffe7'}}>
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
    return  (
      <View>
        {conversations}
        {sharedContext}
        {partial}
        {testProviders}
      </View>
    )
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
  showAllPartials() {
    Actions.list({modelName: PARTIAL})
    this.props.navigator.push({
      title: 'Partials',
      id: 10,
      component: GridList,
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
      component: GridList,
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
reactMixin(GridList.prototype, Reflux.ListenerMixin);
reactMixin(GridList.prototype, HomePageMixin)
GridList = makeStylish(GridList)

var styles = StyleSheet.create({
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
  },
  col: {
    paddingVertical: 5,
    paddingLeft: 7
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
    color: '#999999'
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
  //     if (!this.props._readOnly  ||  this.props.modelName !== PRODUCT_APPLICATION) {
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
