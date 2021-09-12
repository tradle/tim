import React, { Component } from 'react'
import {
  View,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { LazyloadScrollView } from 'react-native-lazyload'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'
import { makeResponsive } from 'react-native-orient'

import constants from '@tradle/constants'
const {
  TYPE,
  ROOT_HASH
} = constants
const {
  MESSAGE,
  VERIFICATION
} = constants.TYPES

import utils, {
  getFontSize as fontSize,
  translate
} from '../utils/utils'
import { getContentSeparator } from '../utils/uiUtils'

import ApplicationTabs from './ApplicationTabs'
import PageView from './PageView'
import Actions from '../Actions/Actions'
import Reflux from 'reflux'
import Store from '../Store/Store'
import ResourceMixin from './ResourceMixin'
import MessageList from './MessageList'
import StyleSheet from '../StyleSheet'
import HomePageMixin from './HomePageMixin'
import NetworkInfoProvider from './NetworkInfoProvider'
import MatchImages from './MatchImages'

import platformStyles from '../styles/platform'
import buttonStyles from '../styles/buttonStyles'
import ConversationsIcon from './ConversationsIcon'

const ASSIGN_RM = 'tradle.AssignRelationshipManager'
const DENIAL = 'tradle.ApplicationDenial'
const APPROVAL = 'tradle.ApplicationApproval'
const APPLICATION = 'tradle.Application'
const PHOTO_ID = 'tradle.PhotoID'
const SELFIE = 'tradle.Selfie'
const MANUAL_VISUAL_COMPARISON_CHECK = 'tradle.ManualVisualComparisonCheck'
const STATUS = 'tradle.Status'
const VISUAL_VERIFICATION_METHOD = 'tradle.VisualPhotosVerificationMethod'
const API = 'tradle.Api'

const VERIFICATION_PROVIDER = 'Manual visual comparison'
const FACIAL_MATCH = 'facial similarity'

const ScrollView = LazyloadScrollView
const LAZY_ID = 'lazyload-list'
let INSTANCE_ID = 0

class ApplicationView extends Component {
  static displayName = 'ApplicationView';
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    search: PropTypes.bool,
    bankStyle: PropTypes.object,
    backlink: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this._lazyId = LAZY_ID + INSTANCE_ID++

    let { resource, action, backlink, tab, checkFilter, navigator, bankStyle } = props
    this.state = {
      resource,
      isLoading: true,
      isConnected: navigator.isConnected,
      bankStyle,
      backlink: tab,
      checkFilter
    }
    let currentRoutes = navigator.getCurrentRoutes()
    let len = currentRoutes.length

    // this.openChat = this.openChat.bind(this)
    this.approve = this.approve.bind(this)
    this.deny = this.deny.bind(this)

    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle  &&  action)
      currentRoutes[len - 1].onRightButtonPress = action.bind(this)
  }
  componentWillMount() {
    let { resource, search, backlink, tab } = this.props

    let rtype = utils.getType(resource)
    let m = utils.getModel(rtype)
    if (utils.isInlined(m))
      return
    Actions.getItem( {resource, search, backlink: backlink || tab} )
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    let {resource, action, backlink, application, style, provider} = params

    const hash = utils.getRootHash(this.props.resource)
    if (resource  &&  utils.getRootHash(resource) !== hash)
      return

    switch (action) {
    case 'getItem':
      this.setState({
        resource,
        isLoading: false,
        bankStyle: style || this.state.bankStyle,
        locale: provider && provider.locale
      })
      break
    case 'exploreBacklink':
      if (backlink !== this.state.backlink || params.backlinkAdded) {
        if (backlink.items.backlink) {
          let r = params.resource || this.state.resource
          this.setState({backlink, showDetails: false, showDocuments: false}) //, resource: r})
          Actions.getItem({resource: r, application: resource, search: true, backlink: backlink})
        }
        else
          this.setState({backlink, showDetails: false})
      }
      break
    case 'showDetails':
      if (this.state.backlink)
        this.setState({showDetails: true, backlink: null, checkFilter: null, checksCategory: null})
      break
    case 'assignRM_Confirmed':
      if (utils.getRootHash(application) === hash) {
        Actions.hideModal()
        this.setState({resource: application, isLoading: false})
      }
      break
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.orientation !== nextProps.orientation    ||
           this.state.resource    !== nextState.resource       ||
           this.state.isLoading   !== nextState.isLoading      ||
           this.state.backlink    !== nextState.backlink       ||
           this.state.checksCategory !== nextState.checksCategory ||
           this.state.checkFilter !== nextState.checkFilter
      return true
  }

  render() {
    let { resource, backlink, isLoading, hasRM, isConnected, showDetails, locale } = this.state
    let { navigator, bankStyle, currency, tab } = this.props

    hasRM = hasRM  ||  resource.analyst

    let isRM = hasRM  &&  utils.isRM(resource)
    let styles = createStyles({ hasRM, isRM, bankStyle })

    let network = <NetworkInfoProvider connected={isConnected} resource={resource} />
    let contentSeparator = getContentSeparator(bankStyle)
    let loading
    if (isLoading) {
      loading = <View style={{position: 'absolute', bottom: 100, alignSelf: 'center' }}>
        {this.showLoading({bankStyle, component: ApplicationView})}
      </View>
      if (!resource[TYPE])
        return loading
      // if (!resource[TYPE])
      //   return <View/>
    }
    let isAndroid = utils.isAndroid()
    let color = isAndroid ? bankStyle.linkColor : '#ffffff'
    let iconName = 'ios-person-add-outline'
    let icolor
    let rmStyle
    if (hasRM) {
      iconName = 'ios-person'
      icolor =  isAndroid && (isRM && bankStyle.linkColor || '#CA9DF2') || '#ffffff'
      rmStyle = styles.hasRM
    }
    else {
      icolor = bankStyle.linkColor
      rmStyle = styles.noRM
    }

    let assignRM
    if (!isRM  &&  !utils.isMe(resource.applicant))
      assignRM = <TouchableOpacity onPress={() => this.assignRM(resource ||  this.props.resource)}>
                    <View style={[buttonStyles.menuButton, rmStyle]}>
                      <Icon name={iconName} color={icolor} size={fontSize(30)}/>
                    </View>
                  </TouchableOpacity>
    let routes = navigator.getCurrentRoutes()
    let home
    if (__DEV__)
       home = <TouchableOpacity onPress={() => {navigator.jumpTo(routes[1])}} style={styles.homeButton}>
                  <View style={[buttonStyles.homeButton]}>
                    <Icon name='ios-home' color={bankStyle.linkColor} size={33}/>
                  </View>
                </TouchableOpacity>

    let photoId, selfie
    if (resource.forms) {
      photoId = resource.forms.find(r => utils.getType(r) === PHOTO_ID)
      selfie = resource.forms.find(r => utils.getType(r)  === SELFIE)
    }
    let compareImages
    if (photoId  &&  selfie) {
      compareImages = <TouchableOpacity onPress={() => this.compareImages(photoId, selfie)} style={styles.openChatPadding}>
                        <View style={buttonStyles.homeButton}>
                          <Icon name='md-git-compare' color={bankStyle.linkColor} size={30}/>
                        </View>
                      </TouchableOpacity>
    }

    let chatButton
    if (resource._context)
      chatButton = <TouchableOpacity onPress={this.openApplicationChat.bind(this, resource)} style={[styles.openChatPadding]}>
                      <View style={[buttonStyles.conversationButton, styles.conversationButton]}>
                        <ConversationsIcon size={30} color={color} style={styles.conversationsIcon} />
                      </View>
                    </TouchableOpacity>

    let tree
    if (resource.tree  &&  resource.tree.top.nodes) {
      tree = <TouchableOpacity onPress={() => this.showTree()} style={styles.tree}>
                 <View style={[styles.treeButton, buttonStyles.treeButton]}>
                   <Icon name='ios-options-outline' size={30} color={bankStyle.linkColor} />
                 </View>
             </TouchableOpacity>
    }
    let copyButton = this.generateCopyLinkButton(resource)
    let footer = <View style={styles.footer}>
                  <View style={styles.row}>
                    {home}
                    {tree}
                    {copyButton}
                    {compareImages}
                    {chatButton}
                    {assignRM}
                  </View>
                </View>
    return (
      <PageView style={platformStyles.container} separator={contentSeparator} bankStyle={bankStyle}>
        <ScrollView  ref='this' style={{width: utils.getContentWidth(ApplicationView), alignSelf: 'center'}} name={this._lazyId}>
        {network}
        {loading}
          <ApplicationTabs  lazy={this._lazyId}
                            resource={resource}
                            navigator={navigator}
                            currency={currency}
                            locale={locale}
                            backlink={!showDetails && backlink}
                            checksCategory={this.state.checksCategory}
                            showCategory={this.showCategory.bind(this)}
                            checkFilter={this.state.checkFilter}
                            filterChecks={this.filterChecks.bind(this)}
                            showDetails={showDetails}
                            approve={this.approve}
                            deny={this.deny}
                            bankStyle={bankStyle}/>
        </ScrollView>
       {footer}
      </PageView>
     );
  }

  compareImages(photoId, selfie) {
    let { navigator, bankStyle } = this.props
    let resource = this.state.resource || this.props.resource
    let route = {
      componentName: 'MatchImages',
      backButtonTitle: 'Back',
      title: translate('checkIfMatch'),
      passProps: {
        photoId,
        selfie,
        bankStyle
      }
    }
    if (utils.isRM(resource)) {
      _.extend(route, {
        rightButtonTitle: 'VerifyOrCorrect',
        onRightButtonPress: () => {
          Alert.alert(
            translate('createManualMatchCheck'), // + utils.getDisplayName({ resource }),
            null,
            [
              {text: 'Cancel', onPress: () => console.log('Canceled!')},
              {text: 'Ok', onPress: () => this.createManualCheckAndVerification(photoId, selfie)},
            ]
          )
        }
      })
    }
    navigator.push(route)
  }
  createManualCheckAndVerification(photoID, selfie) {
    let { navigator } = this.props
    let resource = this.state.resource || this.props.resource
    let me = utils.getMe();
    let statusModel = utils.getModel(STATUS)
    let status = statusModel.enum.find(r => r.id === 'pass')
    let r = {
      [TYPE]: MANUAL_VISUAL_COMPARISON_CHECK,
      form: selfie,
      photoID,
      provider: VERIFICATION_PROVIDER,
      from: me,
      to: resource.to,
      aspects: FACIAL_MATCH,
      dateChecked: new Date().getTime(),
      application: resource,
      status: {
        id: STATUS + '_' + status.id,
        title: status.title
      }
    }
    r.message = utils.getStatusMessageForCheck({check: r})
    let params = {to: resource.to, resource: r, application: resource}
    if (resource._context) {
      params.context = resource._context
      r._context = resource._context
    }
    else
      params.contextId = resource.contextId
// debugger
    Actions.addChatItem(params)
    this.createVerification(photoID)
    navigator.pop();
  }
  createVerification(photoId) {
    let resource = this.state.resource || this.props.resource
    let applicant = resource.applicant
    const method = {
      [TYPE]: VISUAL_VERIFICATION_METHOD,
      api: {
        [TYPE]: API,
        name: VERIFICATION_PROVIDER
      },
      aspect: FACIAL_MATCH,
    }

    let r = {
      [TYPE]: VERIFICATION,
      from: utils.getMe(),
      document: photoId,
      to: applicant,
      method,
    }
    let params = { to: applicant, r, application: resource }
    if (resource._context) {
      r._context = resource._context
      params.context = resource._context
    }
    else
      params.contextId = resource.contextId
    Actions.addVerification(params)
  }
  showCategory(model) {
    if (this.state.checksCategory === model)
      this.setState({checksCategory: null, checkFilter: null})
    else
      this.setState({checksCategory: model, checkFilter: null})
  }
  filterChecks(filter) {
    if (this.state.checkFilter === filter)
      this.setState({checksCategory: null, checkFilter: null})
    else
      this.setState({checksCategory: null, checkFilter: filter})
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
          let title = translate(utils.getModel(resource.product || resource.requestFor))
          let me = utils.getMe()
          let msg = {
            [TYPE]: APPROVAL,
            application: resource,
            message: 'Your application for \'' + title + '\' was approved',
            _context: isApplication ? resource._context : resource,
            from: me,
            to: applicant
          }
          Actions.approveApplication({application: resource, msg: msg})
          // Actions.addMessage({msg: msg})
        }}
      ]
    )
  }
  deny() {
    let resource = this.state.resource || this.props.resource
    let isApplication = resource[TYPE] === APPLICATION
    let applicantTitle = utils.getDisplayName({ resource: resource.applicant || resource.from })
    Alert.alert(
      translate('denyApplication', applicantTitle),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          console.log('Canceled!')
        }},
        {text: translate('Deny'), onPress: () => {
          Actions.hideModal()
          let title = translate(utils.getModel(resource.product ||  resource.requestFor))
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
  showTree() {
    let { bankStyle, navigator, currency, locale } = this.props
    let resource = this.state.resource || this.props.resource
    let me = utils.getMe()
    let title
    let aTitle = resource.applicantName || resource.applicant.title
    if (aTitle)
      title = aTitle  + '  --  ' + me.organization.title  + '  →  ' + utils.getDisplayName({ resource })
    else
      title = me.organization.title  + '  --  ' + utils.getDisplayName({ resource })

    navigator.push({
      title,
      componentName: 'ApplicationTree',
      passProps: {
        resource,
        bankStyle,
        locale,
        currency
      }
    })
  }
}

reactMixin(ApplicationView.prototype, Reflux.ListenerMixin);
reactMixin(ApplicationView.prototype, ResourceMixin);
reactMixin(ApplicationView.prototype, HomePageMixin)
ApplicationView = makeResponsive(ApplicationView)

var createStyles = utils.styleFactory(ApplicationView, function ({ dimensions, hasRM, isRM, bankStyle }) {
  let isAndroid = Platform.OS === 'android'
  let bgcolor = isAndroid && 'transparent' || bankStyle.linkColor
  let paddingRight = Platform.OS === 'android' ? 0 : 10
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
    hasRM: {
      backgroundColor: isAndroid  ?  'transparent' :  (isRM  &&  bankStyle.linkColor || '#CA9DF2'),
      opacity: isAndroid ? 1 : 0.5
    },
    noRM: {
      backgroundColor: isAndroid && 'transparent' || '#ffffff',
      opacity: 0.5,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: bgcolor
    },
    homeButton: {
      alignSelf: 'flex-start',
      paddingRight: paddingRight
    },
    openChatPadding: {
      paddingRight: paddingRight
    },
    conversationButton: {
      backgroundColor: bgcolor,
      borderColor: bgcolor,
      borderWidth: 1,
      opacity: 0.5
    },
    treeButton: {
      borderColor: bgcolor,
      borderWidth: 1,
      opacity: 0.5
    },
    tree: {
      paddingRight,
    },
  })
})

module.exports = ApplicationView;
