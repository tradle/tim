'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var fontSize = utils.getFontSize
var ApplicationTabs = require('./ApplicationTabs')
var PageView = require('./PageView')
import Icon from 'react-native-vector-icons/Ionicons';
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceMixin = require('./ResourceMixin');
var MessageList = require('./MessageList')
var ENV = require('../utils/env')
var StyleSheet = require('../StyleSheet')
var extend = require('extend');
var constants = require('@tradle/constants');
var HomePageMixin = require('./HomePageMixin')

import platformStyles from '../styles/platform'
import { makeResponsive } from 'react-native-orient'
import debug from '../utils/debug'
import ConversationsIcon from './ConversationsIcon'

const ASSIGN_RM = 'tradle.AssignRelationshipManager'

const {
  TYPE,
  ROOT_HASH
} = constants
const {
  PROFILE,
  IDENTITY,
  MESSAGE
} = constants.TYPES
import {
  View,
  Text,
  Platform,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native'

import {
  LazyloadScrollView,
} from 'react-native-lazyload'

const ScrollView = LazyloadScrollView
const LAZY_ID = 'lazyload-list'
let INSTANCE_ID = 0

import React, { Component } from 'react'

class ApplicationView extends Component {
  static displayName = 'ApplicationView';
  constructor(props) {
    super(props);
    this._lazyId = LAZY_ID + INSTANCE_ID++

    let me = utils.getMe()
    let { resource, action, navigator } = props
    this.state = {
      resource: resource,
      isLoading: true,
    }
    let currentRoutes = navigator.getCurrentRoutes()
    let len = currentRoutes.length
    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle)
      currentRoutes[len - 1].onRightButtonPress = action.bind(this)
  }
  componentWillMount() {
    let { resource, search, forwardlink } = this.props

    // if (resource.id  ||  resource[TYPE] === PROFILE  ||  resource[TYPE] === ORGANIZATION)
    // if (resource.id || !resource[constants.ROOT_HASH])
    let rtype = utils.getType(resource)
    let m = utils.getModel(rtype).value
    if (m.inlined)
      return
    if (m.subClassOf  &&  utils.getModel(m.subClassOf).value.inlined)
      return
    Actions.getItem( {resource, search, forwardlink} )
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    let {resource, action, error, to, forwardlink, application} = params

    let isMe = utils.isMe(this.props.resource)
    if (resource  &&  utils.getId(resource) !== utils.getId(this.props.resource))
      return

    switch (action) {
    case 'getItem':
      this.setState({
        resource: resource,
        isLoading: false
      })
      break
    case 'exploreForwardlink':
      if (forwardlink !== this.state.forwardlink)
        this.setState({forwardlink: forwardlink, showDetails: false})
      break
    case 'showDetails':
      if (this.state.forwardlink)
        this.setState({showDetails: true, forwardlink: null})
      break
    case 'assignRM_Confirmed':
      if (application[ROOT_HASH] === this.props.resource[ROOT_HASH]) {
        let r = utils.clone(this.props.resource)
        r.relationshipManager = application.relationshipManager
        this.setState({resource: r})
      }
      break
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.orientation !== nextProps.orientation               ||
           this.state.resource     !== nextState.resource                 ||
           this.state.forwardlink  !== nextState.forwardlink
  }

  render() {
    if (this.state.isLoading)
      return <View/>

    let { navigator, bankStyle, currency, dimensions } = this.props
    let { forwardlink } = this.state
    let styles = createStyles()

    let resource = this.state.resource;
    let modelName = resource[TYPE];
    let model = utils.getModel(modelName).value;

    let me = utils.getMe()

    let { width } = utils.dimensions(ApplicationView)

    let bgcolor = Platform.OS === 'android' ? 'transparent' : '#7AAAC3'
    let color = Platform.OS !== 'android' ? '#ffffff' : '#7AAAC3'
    let paddingRight = Platform.OS === 'android' ? 0 : 10
    let iconName = 'ios-person-add-outline'
    let rmBg = '#7AAAc3'
    if (resource.relationshipManager) {
      let rId = utils.getId(resource.relationshipManager).replace(IDENTITY, PROFILE)
      iconName = 'ios-person'
      if (rId !== utils.getId(me))
        rmBg = '#CA9DF2'
    }
    let footer = <View style={styles.footer}>
                  <View style={styles.row}>
                    <TouchableOpacity onPress={this.openChat.bind(this)} style={{paddingRight}}>
                      <View style={[platformStyles.conversationButton, {backgroundColor: bgcolor, borderColor: bgcolor, borderWidth: 1, opacity: 0.5}]}>
                        <ConversationsIcon size={30} color={color} style={styles.conversationsIcon} />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.assignRM()}>
                      <View style={[platformStyles.menuButtonRegular, {backgroundColor: rmBg, opacity: 0.5}]}>
                        <Icon name={iconName} color='#ffffff' size={fontSize(30)} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
    return (
      <PageView style={platformStyles.container}>
        <ScrollView  ref='this' name={this._lazyId}>
          <ApplicationTabs  lazy={this._lazyId}
                            resource={resource}
                            navigator={navigator}
                            currency={currency}
                            forwardlink={forwardlink}
                            showDetails={this.state.showDetails}
                            bankStyle={bankStyle}/>
        </ScrollView>
       {footer}
      </PageView>
     );
  }

  getRefResource(resource, prop) {
    this.state.prop = prop;
    this.state.propValue = utils.getId(resource.id);
    Actions.getItem({resource: resource});
  }

  assignRM() {
    let resource = this.props.resource
    let me = utils.getMe()
    if (resource.relationshipManager  &&  utils.getId(resource.relationshipManager).replace(IDENTITY, PROFILE) === utils.getId(me)) {
      Alert.alert(translate('youAreTheRM'))
      return
    }
    Alert.alert(
      translate('areYouSureYouWantToServeThisCustomer', resource.from.title),
      null,
      [
        {text: translate('cancel'), onPress: () => {}},
        {text: translate('Yes'), onPress: () => {
          let me = utils.getMe()
          let msg = {
            [TYPE]: ASSIGN_RM,
            employee: {
              id: utils.makeId('tradle.Identity', me[ROOT_HASH])
            },
            application: resource,
            _context: resource._context,
            from: me,
            to: resource.to
          }
          Actions.addChatItem({resource: msg})
          this.setState({hasRM: true})
        }}
      ]
    )
  }
  openChat() {
    let { resource, navigator } = this.props
    let me = utils.getMe()
    let title
    if (resource.applicant.title)
      title = resource.applicant.title  + '  →  ' + me.organization.title
    else
      title = me.organization.title
    let style = this.mergeStyle(resource.style)
    let route = {
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      title: title,
      passProps: {
        resource: resource._context,
        filter: '',
        search: true,
        modelName: MESSAGE,
        application: resource,
        currency: resource.currency,
        bankStyle: style,
      }
    }

    if (resource.relationshipManager) {
      if (utils.getId(resource.relationshipManager).replace(IDENTITY, PROFILE) === utils.getId(me)  &&  !resource._approved  &&  !resource._denied) { //  &&  resource._appSubmitted  ) {
        route.rightButtonTitle = 'Approve/Deny'
        route.onRightButtonPress = () => this.approveDeny(resource)
      }
    }
    navigator.push(route)
  }
}

reactMixin(ApplicationView.prototype, Reflux.ListenerMixin);
reactMixin(ApplicationView.prototype, ResourceMixin);
reactMixin(ApplicationView.prototype, HomePageMixin)
ApplicationView = makeResponsive(ApplicationView)

var createStyles = utils.styleFactory(ApplicationView, function ({ dimensions }) {
  return StyleSheet.create({
    row: {
      flex: 1,
      paddingHorizontal: 10,
      marginRight: -10,
      flexDirection: 'row',
      // alignItems: 'flex-end'
      // justifyContent: 'space-between'
    },
    footer: {
      height: 45,
      backgroundColor: '#efefef',
      borderColor: '#eeeeee',
      borderWidth: 1,
      alignItems: 'flex-end',
      paddingRight: 10,
    },
    conversationsIcon: {
      marginLeft: 9,
      marginRight: 9
    }
  })
})

module.exports = ApplicationView;
