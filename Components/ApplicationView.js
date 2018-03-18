console.log('requiring ApplicationView.js')
'use strict';

import utils, {
  getFontSize as fontSize,
  translate
} from '../utils/utils'
import ApplicationTabs from './ApplicationTabs'
import PageView from './PageView'
import Icon from 'react-native-vector-icons/Ionicons'
import Actions from '../Actions/Actions'
import Reflux from 'reflux'
import Store from '../Store/Store'
import reactMixin from 'react-mixin'
import ResourceMixin from './ResourceMixin'
import MessageList from './MessageList'
import ENV from '../utils/env'
import StyleSheet from '../StyleSheet'
import extend from 'extend'
import constants from '@tradle/constants'
import HomePageMixin from './HomePageMixin'
import NetworkInfoProvider from './NetworkInfoProvider'

import platformStyles from '../styles/platform'
import { makeResponsive } from 'react-native-orient'
import debug from '../utils/debug'
import ConversationsIcon from './ConversationsIcon'

const ASSIGN_RM = 'tradle.AssignRelationshipManager'
const DENIAL = 'tradle.ApplicationDenial'
const APPROVAL = 'tradle.ApplicationApproval'

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
  ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types'

import {
  LazyloadScrollView,
} from 'react-native-lazyload'

const ScrollView = LazyloadScrollView
const LAZY_ID = 'lazyload-list'
const APPLICATION = 'tradle.Application'
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
      isConnected: props.navigator.isConnected,
    }
    let currentRoutes = navigator.getCurrentRoutes()
    let len = currentRoutes.length

    this.openChat = this.openChat.bind(this)
    this.approve = this.approve.bind(this)
    this.deny = this.deny.bind(this)

    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle)
      currentRoutes[len - 1].onRightButtonPress = action.bind(this)
  }
  componentWillMount() {
    let { resource, search, forwardlink } = this.props

    // if (resource.id  ||  resource[TYPE] === PROFILE  ||  resource[TYPE] === ORGANIZATION)
    // if (resource.id || !resource[constants.ROOT_HASH])
    let rtype = utils.getType(resource)
    let m = utils.getModel(rtype)
    if (m.inlined)
      return
    if (m.subClassOf  &&  utils.getModel(m.subClassOf).inlined)
      return
    Actions.getItem( {resource, search, forwardlink} )
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    let {resource, action, error, to, forwardlink, application} = params

    let isMe = utils.isMe(this.props.resource)
    if (resource  &&  resource[ROOT_HASH] !== this.props.resource[ROOT_HASH])
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
        Actions.hideModal()
        // let r = utils.clone(this.props.resource)
        // r.relationshipManager = application.relationshipManager
        this.setState({resource: application, isLoading: false})
      }
      break
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.orientation !== nextProps.orientation    ||
           this.state.resource    !== nextState.resource       ||
           this.state.isLoading   !== nextState.isLoading      ||
           this.state.forwardlink !== nextState.forwardlink
  }

  render() {
    let styles = createStyles()
    let { forwardlink, isLoading, hasRM, isConnected } = this.state
    let network = <NetworkInfoProvider connected={isConnected} resource={resource} />
    if (isLoading)
      return (
              <View style={[platformStyles.container]}>
                {network}
                <Text style={styles.loading}>{'In progress...'}</Text>
                <ActivityIndicator size='large' style={styles.indicator} />
              </View>
             )

    let { navigator, bankStyle, currency, dimensions } = this.props

    let resource = this.state.resource;
    let modelName = resource[TYPE];
    let model = utils.getModel(modelName)

    let me = utils.getMe()

    let { width } = utils.dimensions(ApplicationView)

    let bgcolor = Platform.OS === 'android' ? 'transparent' : '#7AAAC3'
    let color = Platform.OS !== 'android' ? '#ffffff' : '#7AAAC3'
    let paddingRight = Platform.OS === 'android' ? 0 : 10
    let iconName = 'ios-person-add-outline'
    let rmBg, icolor
    hasRM = resource.relationshipManager ||  resource.relationshipManagers
    let rmStyle, isRM
    if (hasRM) {
      isRM = utils.isRM(resource)
      iconName = 'ios-person'
      if (isRM)
        rmBg = '#7AAAc3'
      else
        rmBg = '#CA9DF2'
      icolor = '#ffffff'
      rmStyle = {backgroundColor: rmBg, opacity: 0.5}
    }
    else {
      rmBg = '#fff'
      icolor = '#7AAAc3'
      rmStyle = {backgroundColor: rmBg, opacity: 0.5, borderWidth: StyleSheet.hairlineWidth, borderColor: '#7AAAc3'}
    }
    let homeStyle = {backgroundColor: '#fff', opacity: 0.9, borderColor: '#7AAAc3', borderWidth: 1}
    let assignRM
    if (!isRM)
      assignRM = <TouchableOpacity onPress={() => this.assignRM()}>
                    <View style={[platformStyles.menuButtonRegular, rmStyle]}>
                      <Icon name={iconName} color={icolor} size={fontSize(30)}/>
                    </View>
                  </TouchableOpacity>
    let routes = navigator.getCurrentRoutes()
    let home
    if (__DEV__)
       home = <TouchableOpacity onPress={() => {navigator.jumpTo(routes[1])}} style={{alignSelf: 'flex-start', paddingRight}}>
                  <View style={[platformStyles.menuButtonRegular, homeStyle]}>
                    <Icon name='ios-home' color='#7AAAc3' size={33}/>
                  </View>
                </TouchableOpacity>
    let footer = <View style={styles.footer}>
                  <View style={styles.row}>
                    {home}
                    <TouchableOpacity onPress={this.openChat} style={{paddingRight}}>
                      <View style={[platformStyles.conversationButton, {backgroundColor: bgcolor, borderColor: bgcolor, borderWidth: 1, opacity: 0.5}]}>
                        <ConversationsIcon size={30} color={color} style={styles.conversationsIcon} />
                      </View>
                    </TouchableOpacity>
                    {assignRM}
                  </View>
                </View>
    return (
      <PageView style={platformStyles.container}>
        <ScrollView  ref='this' style={{width: utils.getContentWidth(ApplicationView), alignSelf: 'center'}} name={this._lazyId}>
        {network}
          <ApplicationTabs  lazy={this._lazyId}
                            resource={resource}
                            navigator={navigator}
                            currency={currency}
                            forwardlink={forwardlink}
                            showDetails={this.state.showDetails}
                            approve={this.approve}
                            deny={this.deny}
                            bankStyle={bankStyle}/>
        </ScrollView>
       {footer}
      </PageView>
     );
  }

  assignRM() {
    let resource = this.state.resource || this.props.resource
    let me = utils.getMe()
    if (utils.isRM(resource)) {
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
          Actions.showModal({title: 'In progress...', showIndicator: true})
        }}
      ]
    )
  }
  openChat() {
    let { navigator, bankStyle } = this.props
    let resource = this.state.resource || this.props.resource
    let me = utils.getMe()
    let title
    if (resource.applicant.title)
      title = resource.applicant.title  + '  →  ' + me.organization.title
    else
      title = me.organization.title
    let style = resource.style ? this.mergeStyle(resource.style) : bankStyle
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

    // if (resource.relationshipManager) {
    //   if (utils.getId(resource.relationshipManager).replace(IDENTITY, PROFILE) === utils.getId(me)  &&  !resource._approved  &&  !resource._denied) { //  &&  resource._appSubmitted  ) {
    //     route.rightButtonTitle = 'Approve/Deny'
    //     route.onRightButtonPress = () => this.approveDeny(resource)
    //   }
    // }
    navigator.push(route)
  }
  approve() {
    let resource = this.state.resource || this.props.resource
    console.log('Approve was chosen!')
    // if (resource.status === 'approved') {
    //   Alert.alert('Application was approved')
    //   return
    // }
    let isApplication = resource[TYPE] === APPLICATION
    let applicant = isApplication ? resource.applicant : resource.from
    let approvalPhrase = applicant.title ? 'approveApplicationFor' : 'approveApplication'
    Alert.alert(
      translate(approvalPhrase, applicant.title || ''),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          console.log('Canceled!')
        }},
        {text: translate('Approve'), onPress: () => {
          Actions.hideModal()
          let title = utils.makeModelTitle(utils.getModel(resource.product || resource.requestFor))
          let me = utils.getMe()
          let msg = {
            [TYPE]: APPROVAL,
            application: resource,
            message: 'Your application for \'' + title + '\' was approved',
            _context: isApplication ? resource._context : resource,
            from: me,
            to: applicant
          }
          Actions.addMessage({msg: msg})
        }}
      ]
    )
  }
  deny() {
    let resource = this.state.resource || this.props.resource
    let isApplication = resource[TYPE] === APPLICATION
    let applicantTitle = utils.getDisplayName(resource.applicant || resource.from)
    Alert.alert(
      translate('denyApplication', applicantTitle),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          console.log('Canceled!')
        }},
        {text: translate('Deny'), onPress: () => {
          Actions.hideModal()
          let title = utils.makeModelTitle(utils.getModel(resource.product ||  resource.requestFor))
          let me = utils.getMe()
          let msg = {
            [TYPE]: DENIAL,
            application: resource,
            message: 'Your application for \'' + title + '\' was denied',
            _context: isApplication ? resource._context : resource,
            from: me,
            to: resource.applicant || resource.from
          }
          Actions.addMessage({msg: msg})
        }}
      ]
    )

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
    }
  })
})

module.exports = ApplicationView;
  // chosenApprove() {
  //   let resource = this.props.resource
  //   console.log('Approve was chosen!')
  //   if (!resource._appSubmitted)
  //     Alert.alert('Application is not yet submitted')
  //   else if (resource.status === 'approved') {
  //     Alert.alert('Application was approved')
  //     return
  //   }
  //   let applicant = resource[TYPE] === APPLICATION ? utils.getDisplayName(resource.applicant) : resource.from.title
  //   Actions.showModal({
  //     title: translate('approveApplication', translate(applicant)),
  //     buttons: [
  //       {
  //         text: translate('cancel'),
  //         onPress: () => {  Actions.hideModal(); console.log('Canceled!')}
  //       },
  //       {
  //         text: translate('Approve'),
  //         onPress: () => {
  //           console.log('Approve was chosen!')
  //           if (!resource._appSubmitted)
  //             Alert.alert('Application is not yet submitted')
  //           else
  //             this.approve(resource)
  //         }
  //       },
  //     ]
  //   })
  // }
  // chosenDeny() {
  //   let resource = this.props.resource
  //   if (resource.status === 'denied') {
  //     Alert.alert('Application was denied')
  //     return
  //   }
  //   let applicant = resource[TYPE] === APPLICATION ? utils.getDisplayName(resource.applicant) : resource.from.title
  //   Actions.showModal({
  //     title: translate('denyApplication', translate(applicant)),
  //     buttons: [
  //       {
  //         text: translate('cancel'),
  //         onPress: () => {  Actions.hideModal(); console.log('Canceled!')}
  //       },
  //       {
  //         text: translate('Deny'),
  //         onPress: () => {
  //           console.log('Deny was chosen!')
  //           this.deny(resource)
  //         }
  //       },
  //     ]
  //   })
  // }
