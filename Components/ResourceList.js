'use strict';

var NoResources = require('./NoResources');
var ResourceRow = require('./ResourceRow');
var ResourceView = require('./ResourceView');
var VerificationRow = require('./VerificationRow');
var NewResource = require('./NewResource');
var MessageList = require('./MessageList');
var MessageView = require('./MessageView')
import ActionSheet from 'react-native-actionsheet'
var utils = require('../utils/utils');
var translate = utils.translate
var reactMixin = require('react-mixin');
var extend = require('extend')
var Store = require('../Store/Store');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var QRCodeScanner = require('./QRCodeScanner')
var QRCode = require('./QRCode')
var buttonStyles = require('../styles/buttonStyles');
var NetworkInfoProvider = require('./NetworkInfoProvider')
var defaultBankStyle = require('../styles/bankStyle.json')

const WEB_TO_MOBILE = '0'
const TALK_TO_EMPLOYEEE = '1'

// var bankStyles = require('../styles/bankStyles')
const ENUM = 'tradle.Enum'

import React, { Component, PropTypes } from 'react'
import {
  ListView,
  StyleSheet,
  Navigator,
  Alert,
  // AlertIOS,
  // ActionSheetIOS,
  TouchableHighlight,
  Image,
  StatusBar,
  View,
  Text,
  Platform
} from 'react-native';

import platformStyles from '../styles/platform'

const SearchBar = Platform.OS === 'android' ? null : require('react-native-search-bar')

class ResourceList extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    modelName: PropTypes.string.isRequired,
    resource: PropTypes.object.isRequired,
    returnRoute: PropTypes.object,
    callback: PropTypes.func,
    filter: PropTypes.string,
    sortProperty: PropTypes.string,
    prop: PropTypes.object,
    isAggregation: PropTypes.bool,
    isRegistration: PropTypes.bool,
  };
  constructor(props) {
    super(props);

    this.state = {
      // isLoading: utils.getModels() ? false : true,
      isLoading: true,
      dataSource: new ListView.DataSource({
        rowHasChanged: function(row1, row2) {
          return row1 !== row2
        }
      }),
      allowToAdd: this.props.prop  &&  this.props.prop.allowToAdd,
      filter: this.props.filter,
      show: false,
      isConnected: this.props.navigator.isConnected,
      userInput: '',
    };
    var isRegistration = this.props.isRegistration ||  (this.props.resource  &&  this.props.resource[constants.TYPE] === constants.TYPES.PROFILE  &&  !this.props.resource[constants.ROOT_HASH]);
    if (isRegistration)
      this.state.isRegistration = isRegistration;
    if (this.props.chat) {
      this.state.sharedWith = {}
      var routes = this.props.navigator.getCurrentRoutes()
      routes[routes.length - 1].onRightButtonPress = this.done.bind(this)
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
    var params = {
      modelName: this.props.modelName,
      to: this.props.resource
    };
    if (this.props.isAggregation)
      params.isAggregation = true;
    if (this.props.sortProperty)
      params.sortProperty = this.props.sortProperty;
    if (this.props.prop)
      params.prop = utils.getModel(this.props.resource[constants.TYPE]).value.properties[this.props.prop.name];
    if (params.prop) {
      let m = utils.getModel(this.props.resource[constants.TYPE]).value
      // case when for example clicking on 'Verifications' on Form page
      if (m.interfaces) {
        if (utils.getModel(this.props.modelName).value.interfaces)
          params.to = this.props.resource.to
        params.resource = this.props.resource
      }

//       params.resource = this.props.resource
    }
    // this.state.isLoading = true;
    utils.onNextTransitionEnd(this.props.navigator, () => {
      Actions.list(params)
      StatusBar.setHidden(false);
    });
  }

  componentDidMount() {
    this.listenTo(Store, 'onListUpdate');
  }

  onListUpdate(params) {
    if (params.error)
      return;

    var action = params.action;
    if (action === 'newContact') {
      let routes = this.props.navigator.getCurrentRoutes()
      let curRoute = routes[routes.length - 1]
      if (curRoute.id === 11  &&  curRoute.passProps.resource[constants.ROOT_HASH] === params.to[constants.ROOT_HASH])
        return
      let style = this.mergeStyle(params.to.style)
      this.props.navigator[curRoute.id === 3 ? 'replace' : 'push']({
        title: params.to.firstName,
        component: MessageList,
        id: 11,
        backButtonTitle: 'Back',
        passProps: {
          resource: params.to,
          filter: '',
          modelName: constants.TYPES.MESSAGE,
          // currency: params.organization.currency,
          bankStyle: style,
          // dictionary: params.dictionary,
        }
      })

      return
    }
    if (action === 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }

    if (action === 'addItem'  ||  action === 'addMessage') {
      var model = action === 'addMessage'
                ? utils.getModel(this.props.modelName).value
                : utils.getModel(params.resource[constants.TYPE]).value;
      if (action === 'addItem'  &&  model.id !== this.props.modelName)
        return
      if (action === 'addMessage'  &&  this.props.modelName !== constants.TYPES.PROFILE)
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
    if (action === 'getForms') {
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
          bankStyle:  style,
          dictionary: params.dictionary,
        }
      }
      // var me = utils.getMe()
      // var msg = {
      //   message: me.firstName + ' is waiting for the response',
      //   _t: constants.TYPES.SELF_INTRODUCTION,
      //   identity: params.myIdentity,
      //   from: me,
      //   to: params.to
      // }
      // utils.onNextTransitionEnd(this.props.navigator, () => Actions.messageList({modelName: constants.TYPES.MESSAGE, to: params.to}))
      this.props.navigator.replace(route)
      return
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
        message: me.firstName + ' is waiting for the response',
        _t: constants.TYPES.SELF_INTRODUCTION,
        identity: params.myIdentity,
        from: me,
        to: params.to
      }
      // var sendNotification = (resource.name === 'Rabobank'  &&  (!me.organization  ||  me.organization.name !== 'Rabobank'))
      // Actions.addMessage(msg, true, sendNotification)
      utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage(msg)) //, true))
      if (this.props.navigator.getCurrentRoutes().length === 3)
        this.props.navigator.replace(route)
      else
        this.props.navigator.push(route)
      return
    }
    if (action === 'list') {
      // First time connecting to server. No connection no providers yet loaded
      if (!params.list  &&  params.alert) {
        Alert.alert(params.alert)
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

    if (!list.length) {
     if (!this.state.filter  ||  !this.state.filter.length)
       this.setState({
         isLoading: false
       })
      else
       this.setState({
         isLoading: false,
         dataSource: this.state.dataSource.cloneWithRows(list),
         list: list
       })
      return;
    }
    var type = list[0][constants.TYPE];
    if (type  !== this.props.modelName) {
      var m = utils.getModel(type).value;
      if (!m.subClassOf  ||  m.subClassOf != this.props.modelName)
        return;
    }
    let state = {
      dataSource: this.state.dataSource.cloneWithRows(list),
      list: list,
      forceUpdate: params.forceUpdate,
      dictionary: params.dictionary,
      isLoading: false,
    }
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
  mergeStyle(newStyle) {
    let style = {}
    extend(style, defaultBankStyle)
    if (newStyle)
      style = extend(style, newStyle)
    return style
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.forceUpdate)
      return true
    if (this.state.show !== nextState.show)
      return true
    if (nextState.isConnected !== this.state.isConnected)
      return true
    // if (this.state.isConnected !== nextState.isConnected)
    //   if (!this.state.list && !nextState.list)
    //     return true
    if (!this.state.list  ||  !nextState.list  ||  this.state.list.length !== nextState.list.length)
      return true
    let isOrg = this.props.modelName === constants.TYPES.ORGANIZATION
    for (var i=0; i<this.state.list.length; i++) {
      if (this.state.list[i].numberOfForms !== nextState.list[i].numberOfForms)
        return true
      if (this.state.list[i][constants.ROOT_HASH] !== nextState.list[i][constants.ROOT_HASH])
        return true
    }
    return false
  }

  selectResource(resource) {
    var me = utils.getMe();
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(this.props.modelName);
    var isIdentity = this.props.modelName === constants.TYPES.PROFILE;
    var isVerification = model.value.id === constants.TYPES.VERIFICATION
    var isForm = model.value.id === constants.TYPES.FORM
    var isOrganization = this.props.modelName === constants.TYPES.ORGANIZATION;
    if (!isIdentity         &&
        !isOrganization     &&
        !this.props.callback) {
      var m = utils.getModel(resource[constants.TYPE]).value;

      if (isVerification || isForm) {
        this.props.navigator.push({
          title: m.title,
          id: 5,
          component: MessageView,
          backButtonTitle: translate('back'),
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
          backButtonTitle: translate('back'),
          rightButtonTitle: translate('edit'),
          onRightButtonPress: {
            title: title,
            id: 4,
            component: NewResource,
            titleTextColor: '#7AAAC3',
            backButtonTitle: translate('back'),
            rightButtonTitle: translate('done'),
            passProps: {
              model: m,
              resource: resource,
              bankStyle: this.props.bankStyle || defaultBankStyle
            }
          },

          passProps: {resource: resource}
        });
      }
      return;
    }
    if (this.props.prop) {
      if (me  &&  this.props.modelName != constants.TYPES.PROFILE) {
        this._selectResource(resource);
        return;
      }
      if (!me) {
        if (this.state.isRegistration) {
          this._selectResource(resource);
          return;
        }
      }
      else if (me[constants.ROOT_HASH] === resource[constants.ROOT_HASH]  ||
         (this.props.resource  &&  me[constants.ROOT_HASH] === this.props.resource[constants.ROOT_HASH]  && this.props.prop)) {
        this._selectResource(resource);
        return;
      }
    }
    var title = isIdentity ? resource.firstName : resource.name; //utils.getDisplayName(resource, model.value.properties);
    var modelName = constants.TYPES.MESSAGE;
    var self = this;
    let style = this.mergeStyle(resource.style)
    var route = {
      component: MessageList,
      id: 11,
      backButtonTitle: translate('back'),
      passProps: {
        resource: resource,
        filter: '',
        modelName: modelName,
        currency: resource.currency,
        bankStyle: style,
      },
    }
    if (isIdentity) { //  ||  isOrganization) {
      route.title = resource.firstName
      route.rightButtonTitle = translate('profile')

      route.onRightButtonPress = {
        title: title,
        id: 3,
        component: ResourceView,
        titleTextColor: '#7AAAC3',
        backButtonTitle: translate('back'),
        passProps: {
          bankStyle: style,
          resource: resource
        }
      }
      var isMe = isIdentity ? resource[constants.ROOT_HASH] === me[constants.ROOT_HASH] : true;
      if (isMe) {
        route.onRightButtonPress.rightButtonTitle = translate('edit')
        route.onRightButtonPress.onRightButtonPress = {
          title: title,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: translate('back'),
          rightButtonTitle: translate('done'),
          passProps: {
            bankStyle: style,
            model: utils.getModel(resource[constants.TYPE]).value,
            resource: resource,
            currency: this.props.currency,
          }
        }
      }
    }
    if (isOrganization) {
      route.title = resource.name
      if (this.props.officialAccounts) {
        if (!utils.isEmployee(resource)) {
          var msg = {
            message: me.firstName + ' is waiting for the response',
            _t: constants.TYPES.CUSTOMER_WAITING,
            from: me,
            to: resource,
            time: new Date().getTime()
          }

          utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage(msg, true))
        }
      }
    }

    this.props.navigator.push(route);
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
      backButtonTitle: translate('back'),
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
       (resource[constants.ROOT_HASH] === me[constants.ROOT_HASH]  ||  resource[constants.TYPE] !== constants.TYPES.PROFILE)) {
      var self = this ;
      route.rightButtonTitle = translate('edit')
      route.onRightButtonPress = /*() =>*/ {
        title: translate('edit'),
        id: 4,
        component: NewResource,
        rightButtonTitle: translate('done'),
        titleTextColor: '#7AAAC3',
        passProps: {
          model: utils.getModel(resource[constants.TYPE]).value,
          bankStyle: this.props.style,
          resource: me
        }
      };
    }
    this.props.navigator.push(route);
  }
  showRefResources(resource, prop) {
    var props = utils.getModel(resource[constants.TYPE]).value.properties;
    var propJson = props[prop];
    var resourceTitle = utils.getDisplayName(resource, props);
    resourceTitle = utils.makeTitle(resourceTitle);

    var backlinksTitle = propJson.title + ' - ' + resourceTitle;
    backlinksTitle = utils.makeTitle(backlinksTitle);
    var modelName = propJson.items.ref;

    this.props.navigator.push({
      title: backlinksTitle,
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
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
        backButtonTitle: translate('back'),
        rightButtonTitle: translate('edit'),
        onRightButtonPress: {
          title: resourceTitle,
          id: 4,
          component: NewResource,
          titleTextColor: '#7AAAC3',
          backButtonTitle: translate('back'),
          rightButtonTitle: translate('done'),
          passProps: {
            model: utils.getModel(resource[constants.TYPE]).value,
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
    this.state.filter = filter
    Actions.list({
      query: filter,
      modelName: this.props.modelName,
      to: this.props.resource
    });
  }

  renderRow(resource)  {
    var model = utils.getModel(this.props.modelName).value;
 // || (model.id === constants.TYPES.FORM)
    var isVerification = model.id === constants.TYPES.VERIFICATION  ||  model.subClassOf === constants.TYPES.VERIFICATION
    var isForm = model.id === constants.TYPES.FORM || model.subClassOf === constants.TYPES.FORM
    var isMyProduct = model.id === 'tradle.MyProduct'  ||  model.subClassOf === 'tradle.MyProduct'

    // let hasBacklink = this.props.prop && this.props.prop.items  &&  this.props.prop.backlink
    return /*hasBacklink  &&*/  (isVerification  || isForm || isMyProduct)
    ? (<VerificationRow
        onSelect={() => this.selectResource(isVerification ? resource.document : resource)}
        key={resource[constants.ROOT_HASH]}
        navigator={this.props.navigator}
        prop={this.props.prop}
        currency={this.props.currency}
        isChooser={this.props.isChooser}
        resource={resource} />
      )
    : (<ResourceRow
        onSelect={() => this.selectResource(resource)}
        key={resource[constants.ROOT_HASH]}
        navigator={this.props.navigator}
        changeSharedWithList={this.props.chat ? this.changeSharedWithList.bind(this) : null}
        currency={this.props.currency}
        isOfficialAccounts={this.props.officialAccounts}
        showRefResources={this.showRefResources.bind(this)}
        resource={resource} />
    );
  }
  changeSharedWithList(id, value) {
    this.state.sharedWith[id] = value
  }
  renderFooter() {
    var me = utils.getMe();
    // if (!me  ||  (this.props.prop  &&  (this.props.prop.readOnly || (this.props.prop.items  &&  this.props.prop.items.readOnly))))
    //   return <View />;
    var model = utils.getModel(this.props.modelName).value;
    if (!this.props.prop  &&  model.id !== constants.TYPES.ORGANIZATION)
      return <View />
    // if (model.subClassOf === constants.TYPES.FINANCIAL_PRODUCT ||  model.subClassOf === ENUM)
    //   return <View />
    if (this.props.prop  &&  !this.props.prop.allowToAdd)
      return <View />

    // var qrInfo = (model.id === constants.TYPES.PROFILE)
    //            ? <View style={styles.row}>
    //                <TouchableHighlight underlayColor='transparent'
    //                   onPress={this.showQRCode.bind(this, 'Contact Info', me[constants.ROOT_HASH])}>
    //                 <View style={{alignSelf: 'center'}}>
    //                   <View style={{marginTop: -12}}>
    //                     <Icon name='ios-barcode'  size={30}  color='#999999' style={styles.icon} />
    //                   </View>
    //                   <View style={{marginTop: -5}}>
    //                     <Text style={[buttonStyles.text, {color:'#999999'}]}>My QR Code</Text>
    //                   </View>
    //                 </View>
    //               </TouchableHighlight>
    //               <TouchableHighlight underlayColor='transparent' onPress={this.scanQRCode.bind(this)}>
    //                 <View style={styles.row}>
    //                   <View style={{marginTop: -5}}>
    //                     <Text style={styles.resourceTitle}>Scan new contact</Text>
    //                   </View>
    //                   <View style={{marginTop: -12}}>
    //                     <Icon name='qr-scanner'  size={30}  color='#999999' style={styles.icon} />
    //                   </View>
    //                 </View>
    //               </TouchableHighlight>
    //             </View>
    //           : <View />

    // return (
    //   <View style={styles.footer}>
    //     <TouchableHighlight underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
    //       <View style={styles.menuButton1}>
    //         <Icon name='md-menu'  size={30}  color='#ffffff' />
    //       </View>
    //     </TouchableHighlight>
    //   </View>
    // );
    // let style = Platform.OS === 'ios' ? styles.menuButton : styles.menuButtonA
    let icon = Platform.OS === 'ios' ?  'md-more' : 'md-menu'
    let color = Platform.OS === 'ios' ? '#ffffff' : 'red'
    return (
       <View style={styles.footer}>
         <TouchableHighlight underlayColor='transparent' onPress={() => this.ActionSheet.show()}>
           <View style={platformStyles.menuButtonNarrow}>
             <Icon name={icon}  size={33}  color={color} />
           </View>
         </TouchableHighlight>
       </View>
    )
  }
  onSettingsPressed() {
    var model = utils.getModel(constants.TYPES.SETTINGS).value
    this.setState({show: false})
    var route = {
      component: NewResource,
      title: 'Settings',
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('done'),
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
  showBanks() {
    this.props.navigator.push({
      title: translate('officialAccounts'),
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      titleTextColor: '#7AAAC3',
      passProps: {
        officialAccounts: true,
        bankStyle: this.props.style,
        modelName: constants.TYPES.ORGANIZATION
      }
    });
  }
  addNew() {
    var model = utils.getModel(this.props.modelName).value;
    var r;
    this.setState({show: false})
    // resource if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (this.props.resource) {
      var props = model.properties;
      for (var p in props) {
        var isBacklink = props[p].ref  &&  props[p].ref === this.props.resource[constants.TYPE];
        if (props[p].ref  &&  !isBacklink) {
          if (utils.getModel(props[p].ref).value.isInterface  &&  model.interfaces  &&  model.interfaces.indexOf(props[p].ref) !== -1)
            isBacklink = true;
        }
        if (isBacklink) {
          r = {};
          r[constants.TYPE] = this.props.modelName;
          r[p] = { id: this.props.resource[constants.TYPE] + '_' + this.props.resource[constants.ROOT_HASH] };

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
      r[constants.TYPE] = this.props.prop.ref || this.props.prop.items.ref;
      r.from = this.props.resource.from
      r.to = this.props.resource.to
    }
    let self = this
    this.props.navigator.push({
      title: model.title,
      id: 4,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      backButtonTitle: translate('back'),
      rightButtonTitle: translate('done'),
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
    // AlertIOS.alert('Rendering list ' + this.state.isLoading)
    // if (this.state.isLoading)
    //   return <View/>
    var content;
    var model = utils.getModel(this.props.modelName).value;
    if (this.state.dataSource.getRowCount() === 0   &&
        utils.getMe()                               &&
        !utils.getMe().organization                 &&
        model.subClassOf !== ENUM                   &&
        !this.props.isChooser                       &&
        // this.props.modelName !== constants.TYPES.PROFILE       &&
        // this.props.modelName !== constants.TYPES.VERIFICATION  &&
        this.props.modelName !== constants.TYPES.ORGANIZATION  &&
        (!model.subClassOf  ||  model.subClassOf !== ENUM)) {
      content = <NoResources
                  filter={this.state.filter}
                  model={model}
                  isLoading={this.state.isLoading}/>
    }
    else {
      var model = utils.getModel(this.props.modelName).value;
      content = <ListView
          dataSource={this.state.dataSource}
          renderHeader={this.renderHeader.bind(this)}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
          automaticallyAdjustContentInsets={false}
          removeClippedSubviews={false}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps={true}
          initialListSize={10}
          pageSize={20}
          scrollRenderAhead={10}
          showsVerticalScrollIndicator={false} />;
    }
    var model = utils.getModel(this.props.modelName).value;
    var footer = this.renderFooter();

    let buttons = this.state.allowToAdd
                ? [translate('addNew', this.props.prop.title), translate('cancel')]
                : [translate('addServerUrl'), translate('scanQRcode')/*, 'Talk to employee'*/, translate('cancel')]

    var searchBar
    if (SearchBar) {
      searchBar = (
        <SearchBar
          onChangeText={this.onSearchChange.bind(this)}
          placeholder={translate('search')}
          showsCancelButton={false}
          hideBackground={true}
          />
      )
    }

    return (
      <View style={platformStyles.container}>
        <NetworkInfoProvider connected={this.state.isConnected} />
        {searchBar}
        <View style={styles.separator} />
        {content}
        {footer}
        <ActionSheet
          ref={(o) => {
            this.ActionSheet = o
          }}
          options={buttons}
          cancelButtonIndex={buttons.length - 1}
          onPress={(index) => {
            switch (index) {
            case 0:
              if (this.state.allowToAdd)
                this.addNew()
              else
                this.onSettingsPressed()
              break
            case 1:
              this.scanFormsQRCode()
              break;
            // case 2:
            //   this.talkToEmployee()
            //   break
            default:
              return
            }
          }}
        />
      </View>
    );
  }

  renderHeader() {
    return (this.props.modelName === constants.TYPES.PROFILE)
          ? <View style={{padding: 5, backgroundColor: '#CDE4F7'}}>
              <TouchableHighlight underlayColor='transparent' onPress={this.showBanks.bind(this)}>
                <View style={styles.row}>
                  <View>
                    <Image source={require('../img/banking.png')} style={styles.cellImage} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.resourceTitle}>Official Accounts</Text>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          : <View />

  }

  // showQRCode1(purpose, content) {
  //   this.props.navigator.push({
  //     title: 'QR Code: ' + purpose,
  //     id: 17,
  //     component: QRCode,
  //     titleTextColor: '#eeeeee',
  //     backButtonTitle: translate('back'),
  //     passProps: {
  //       fullScreen: true,
  //       content: content
  //     }
  //   })
  // }

  // talkToEmployee(qrcode) {
  //   this.setState({show: false})
  //   if (!qrcode)
  //     // qrcode = 'http://127.0.0.1:444444;71e4b7cd6c11ab7221537275988f113a879029eu;6aefc09f4da125095409770592eb96ac142fb579'
  //     // qrcode = 'http://192.168.0.104:44444/;71e4b7cd6c11ab7221537275988f113a879029eu;3497c6ce074f1bc66c05e204fd3a7fbcd5e0fb08'
  //     qrcode = 'http://192.168.0.136:44444/;71e4b7cd6c11ab7221537275988f113a879029eu;c3adf2d26304133265c3e28b5c9037614880aec5'

  //   Actions.getEmployeeInfo(qrcode)
  //   return
  // }
  scanFormsQRCode() {
    this.setState({show: false})
    this.props.navigator.push({
      title: 'Scan QR Code',
      id: 16,
      component: QRCodeScanner,
      titleTintColor: '#eeeeee',
      backButtonTitle: 'Cancel',
      // rightButtonTitle: 'ion|ios-reverse-camera',
      passProps: {
        onread: this.onread.bind(this)
      }
    })
  }

  onread(result) {
    // Pairing devices QRCode
    if (result.data.charAt(0) === '{') {
      h = JSON.parse(result.data)
      Actions.sendPairingRequest(h)
      this.props.navigator.pop()
      return
    }
    let h = result.data.split(';')


    // post to server request for the forms that were filled on the web
    let me = utils.getMe()
    switch (h[0]) {
    case WEB_TO_MOBILE:
      let r = {
        _t: 'tradle.GuestSessionProof',
        session: h[1],
        from: {
          id: utils.getId(me),
          title: utils.getDisplayName(me)
        },
        to: {
          id: constants.TYPES.PROFILE + '_' + h[2]
        }
      }
      Actions.addItem({resource: r, value: r, meta: utils.getModel('tradle.GuestSessionProof').value})
      break
    case TALK_TO_EMPLOYEEE:
      Actions.getEmployeeInfo(result.data.substring(h[0].length + 1))
      break
    }
  }
}
reactMixin(ResourceList.prototype, Reflux.ListenerMixin);

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
    backgroundColor: '#cccccc',
  },
  icon: {
    marginLeft: -23,
    marginTop: -25,
    // color: '#629BCA',
    color: 'red'
  },
  image: {
    width: 25,
    height: 25,
    marginRight: 5,
    // color: '#cccccc'
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    height: 45,
    // paddingTop: 5,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    // backgroundColor: '#eeeeee',
    borderColor: '#eeeeee',
    borderWidth: 1,
    borderTopColor: '#cccccc',
  },
  row: {
    // backgroundColor: 'white',
    // justifyContent: 'space-around',
    flexDirection: 'row',
    padding: 5,
  },
  textContainer: {
    flex: 1,
  },
  resourceTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 2,
    paddingLeft: 5
  },
  cellImage: {
    // backgroundColor: '#dddddd',
    height: 50,
    marginRight: 10,
    width: 50,
    // borderColor: '#7AAAc3',
    // borderRadius: 30,
    // borderWidth: 1,
  },
  menuButton: {
    marginTop: -23,
    paddingVertical: 5,
    paddingHorizontal: 21,
    borderRadius: 24,
    // shadowOffset:{width: 5, height: 5},
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowColor: '#afafaf',
    backgroundColor: 'red'
  },
  menuButtonA: {
    paddingVertical: 5,
    paddingHorizontal: 5
  },

  menuButton1: {
    marginTop: -30,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 25,
    backgroundColor: 'red',
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowColor: '#afafaf',
  }

});

module.exports = ResourceList;

  // showDeals(modelName) {
  //   var model = utils.getModel(modelName).value;
  //   // var model = utils.getModel(this.props.modelName).value;
  //   this.props.navigator.push({
  //     title: model.title,
  //     id: 10,
  //     component: ResourceList,
  //     titleTextColor: '#7AAAC3',
  //     backButtonTitle: 'Back',
  //     passProps: {
  //       filter: '',
  //       modelName: DEAL_MODEL,
  //     },
  //   })
  // }
  // onSearchChange1(event) {
  //   var filter = event.nativeEvent.text.toLowerCase();
  //   Actions.list({
  //     query: filter,
  //     modelName: this.props.modelName,
  //     to: this.props.resource
  //   });
  // }
  // showMenu() {
  //   var buttons = [translate('addServerUrl'), translate('scanQRcode'), 'Talk to employee', translate('cancel')]
  //   let allowToAdd = this.props.prop  &&  this.props.prop.allowToAdd
  //   var buttons = allowToAdd
  //               ? [translate('addNew', this.props.prop.title), translate('cancel')]
  //               : buttons
  //   var self = this;
  //   ActionSheetIOS.showActionSheetWithOptions({
  //     options: buttons,
  //     cancelButtonIndex: allowToAdd ? 2 : 3
  //   }, function(buttonIndex) {
  //     switch (buttonIndex) {
  //     case 0:
  //       if (allowToAdd)
  //         self.addNew()
  //       else
  //         self.onSettingsPressed()
  //       break
  //     case 1:
  //       self.scanFormsQRCode()
  //       break;
  //     case 2:
  //       self.talkToEmployee()
  //       break
  //     default:
  //       return
  //     }
  //   });
  // }
