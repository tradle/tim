import React, { Component } from 'react'
import {
  View,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { WebView } from 'react-native-webview'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { LazyloadScrollView } from 'react-native-lazyload'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'
import { makeResponsive } from 'react-native-orient'
import ActionSheet from 'react-native-actionsheet'

import { Text } from './Text'

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
  translate,
  getRootHash,
  getMe,
  getType,
  isInlined,
  isAndroid,
  isMe,
  getContentWidth,
  getStatusMessageForCheck,
  getLensedModelForType,
  getDisplayName,
  getModel,
  styleFactory,
  onNextTransitionEnd
} from '../utils/utils'
import { getContentSeparator } from '../utils/uiUtils'

import Navigator from './Navigator'
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
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'
const FORM_REQUEST = 'tradle.FormRequest'

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

    let { resource, action, backlink, tab, checkFilter, navigator, bankStyle, application, callback } = props
    this.state = {
      resource,
      isLoading: true,
      isConnected: navigator.isConnected,
      bankStyle,
      backlink: tab,
      checkFilter,
      menuIsShown: getMe().isEmployee
    }
    if (application && callback)
      this.state.callback = callback
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

    let rtype = getType(resource)
    let m = getModel(rtype)
    if (isInlined(m))
      return
    Actions.getItem( {resource, search, backlink: backlink || tab} )
  }
  componentDidMount() {
    this.listenTo(Store, 'handleEvent');
  }
  handleEvent(params) {
    let {resource, action, backlink, application, style, provider, tour, nextStep, templates, letClient, finishDraft} = params

    const hash = getRootHash(this.props.resource)
    if (resource  &&  getRootHash(resource) !== hash)
      return

    switch (action) {
    case 'getItem':
      this.setState({
        resource,
        isLoading: false,
        bankStyle: style || this.state.bankStyle,
        locale: provider && provider.locale,
        letClient,
        finishDraft,
        nextStep,
        templates,
        tour
      })
      break
    // case 'getMenu':
    //   const { menuIsShown=false } = this.state
    //   this.setState({menuIsShown: !menuIsShown})
    //   break
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
    case 'updateItem':
      if (getRootHash(resource) === hash) {
        Actions.hideModal()
        this.setState({resource, isLoading: false})
      }
      break
    case 'assignRM_Confirmed':
      if (getRootHash(application) === hash) {
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
           this.state.checkFilter !== nextState.checkFilter    ||
           this.state.menuIsShown !== nextState.menuIsShown    ||
           this.state.checksCategory !== nextState.checksCategory

      return true
  }

  render() {
    let { resource, backlink, isLoading, hasRM, isConnected, menuIsShown, tour,
          showDetails, locale, nextStep, templates, letClient, finishDraft } = this.state
    let { navigator, bankStyle, currency, tab } = this.props

    hasRM = hasRM  ||  resource.analyst

    let isRM = hasRM  &&  utils.isRM(resource)
    let styles = createStyles({ hasRM, isRM, bankStyle })

    let network = <NetworkInfoProvider connected={isConnected} resource={resource} />
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
    let color = isAndroid() ? bankStyle.linkColor : '#ffffff'
    let iconName = 'ios-person-add-outline'
    let icolor
    let rmStyle
    if (hasRM) {
      iconName = 'ios-person'
      icolor =  isAndroid() && (isRM && bankStyle.linkColor || '#CA9DF2') || '#ffffff'
      rmStyle = styles.hasRM
    }
    else {
      icolor = bankStyle.linkColor
      rmStyle = styles.noRM
    }

    let assignRM
    if (!isRM  &&  !isMe(resource.applicant) && !resource.filledForCustomer  &&  !resource.draft)
      assignRM = <TouchableOpacity onPress={() => this.assignRM(resource ||  this.props.resource)}>
                    <View style={[buttonStyles.menuButton, rmStyle]}>
                      <Icon name={iconName} color={icolor} size={fontSize(30)}/>
                    </View>
                  </TouchableOpacity>
    let home, print, reqForm
    if (getMe().isEmployee)
      home = this.addHomeButton()


    let actionSheet = templates  && this.renderActionSheet()
    if (actionSheet) {
      print = <TouchableOpacity onPress={() => this.ActionSheet.show()} style={styles.homeButton}>
               <View style={[buttonStyles.homeButton]}>
                 <Icon name='ios-print-outline' color={bankStyle.linkColor} size={33}/>
               </View>
               <Text style={styles.buttonText}>{translate('print')}</Text>
             </TouchableOpacity>
    }
    let additionalForms
    if (resource.status !== 'started') {
      additionalForms = this.getAdditionalForms(resource)
      if (additionalForms.length)
        additionalForms = additionalForms.map(f => ({id: f}))
      else
        additionalForms = null
    }
    let actionSheetForAdditionalForms = additionalForms && this.renderActionSheet(additionalForms) //ForAdditionalForms()
    if (actionSheetForAdditionalForms) {
      reqForm = <TouchableOpacity onPress={() => this.ActionSheet1.show()} style={styles.homeButton}>
                 <View style={[buttonStyles.homeButton]}>
                   <Icon name='ios-add' color={bankStyle.linkColor} size={35}/>
                 </View>
                 <Text style={styles.buttonText}>{translate('home')}</Text>
               </TouchableOpacity>
    }
    let photoId, selfie
    if (resource.forms) {
      photoId = resource.forms.find(r => getType(r) === PHOTO_ID)
      selfie = resource.forms.find(r => getType(r)  === SELFIE)
    }
    let compareImages
    if (photoId  &&  selfie) {
      compareImages = <TouchableOpacity onPress={() => this.compareImages(photoId, selfie)} style={styles.openChatPadding}>
                        <View style={buttonStyles.homeButton}>
                          <Icon name='md-git-compare' color={bankStyle.linkColor} size={30}/>
                        </View>
                       <Text style={styles.buttonText}>{translate('compare')}</Text>
                      </TouchableOpacity>
    }

    let chatButton
    if (resource._context) {
      // if (!resource.submissions || !resource.submissions.find(r => getType(r.submission) === APPLICATION_SUBMITTED))
        chatButton = <TouchableOpacity onPress={this.openApplicationChat.bind(this, resource)} style={[styles.openChatPadding]}>
                        <View style={[buttonStyles.conversationButton, styles.conversationButton]}>
                          <ConversationsIcon size={30} color={color} style={styles.conversationsIcon} />
                        </View>
                        <Text style={styles.buttonText}>{translate('chat')}</Text>
                      </TouchableOpacity>
    }
    let takeTour
    if (tour) {
      takeTour = <TouchableOpacity onPress={this.takeTour.bind(this)} style={styles.tree}>
                  <View style={[styles.treeButton, buttonStyles.treeButton]}>
                    <Icon name='ios-train-outline' size={30} color={bankStyle.linkColor} />
                  </View>
                  <Text style={styles.buttonText}>{translate('tour')}</Text>
                 </TouchableOpacity>

    }

    let tree
    if (resource.tree  &&  resource.tree.top.nodes) {
      tree = <TouchableOpacity onPress={() => this.showTree()} style={styles.tree}>
               <View style={[styles.treeButton, buttonStyles.treeButton]}>
                 <Icon name='ios-options-outline' size={30} color={bankStyle.linkColor} />
               </View>
                <Text style={styles.buttonText}>{translate('tree')}</Text>
             </TouchableOpacity>
    }
    let nextApp
    if (/*isRM  &&  */nextStep) {
      nextApp = <TouchableOpacity onPress={() => this.applyForNext(nextStep)} style={styles.tree}>
                  <View style={[styles.treeButton, buttonStyles.treeButton]}>
                    <Icon name='ios-sunny-outline' size={30} color={bankStyle.linkColor} />
                  </View>
                  <Text style={styles.buttonText}>{translate('application')}</Text>
               </TouchableOpacity>
    }
    let requestForm
    let copyButton = this.generateCopyLinkButton(resource)
    let footer = <View style={styles.footer}>
                  <View style={styles.row}>
                    {home}
                    {print}
                    {actionSheet}
                    {actionSheetForAdditionalForms}
                    {tree}
                    {copyButton}
                    {compareImages}
                    {chatButton}
                    {reqForm}
                    {takeTour}
                    {assignRM}
                    {nextApp}
                  </View>
                </View>
    let navBarMenu
    if (menuIsShown)
      navBarMenu = this.showMenu(this.props, navigator)
    let width = getContentWidth(ApplicationView)
    let content = <ScrollView  ref='this' style={{width, alignSelf: 'center'}} name={this._lazyId}>
                   {network}
                   {loading}
                   <ApplicationTabs  lazy={this._lazyId}
                                     resource={resource}
                                     navigator={navigator}
                                     currency={currency}
                                     locale={locale}
                                     letClient={letClient}
                                     finishDraft={finishDraft}
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

    let contentSeparator = getContentSeparator(bankStyle)
    if (menuIsShown)
      return (
        <PageView style={[platformStyles.container, {flexDirection: 'row'}]} separator={contentSeparator} bankStyle={bankStyle}>
          <View style={[platformStyles.pageMenu, {backgroundColor: '#f7f7f7'}]}>
            {navBarMenu}
          </View>
          <View style={platformStyles.pageContentWithMenu}>
            <ScrollView  ref='this' style={{width: getContentWidth(ApplicationView), alignSelf: menuIsShown ? 'flex-start': 'center'}} name={this._lazyId}>
              {network}
              {loading}
              {content}
            </ScrollView>
            {footer}
          </View>
        </PageView>
       );

    return (
      <PageView style={platformStyles.container} separator={contentSeparator} bankStyle={bankStyle}>
        <ScrollView  ref='this' style={{width: getContentWidth(ApplicationView), alignSelf: 'center'}} name={this._lazyId}>
          {network}
          {loading}
          {content}
        </ScrollView>
       {footer}
      </PageView>
     );
  }
  renderActionSheet(additionalForms) {
    const buttons = additionalForms ? this.getActionSheetItemsForAdditionalForms(additionalForms) : this.getActionSheetItems()
    if (!buttons || !buttons.length) return
    let titles = buttons.map((b) => b.title)
    return (
      <ActionSheet
        ref={(o) => {
          if (additionalForms)
            this.ActionSheet1 = o
          else
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
  getActionSheetItems() {
    const { templates } = this.state
    const buttons = []
    const push = btn => buttons.push({ ...btn, index: buttons.length })

    if (!templates)
      return buttons
    let application = this.state.resource || this.props.resource
    templates.forEach(template =>
      push({
        title: template.title,
        callback: () => this.printReport(template, application)
      })
    )
    push({
      title: translate('cancel'),
      callback: () => {}
    })

    return buttons
  }

  getActionSheetItemsForAdditionalForms(additionalForms) {
    let application = this.state.resource || this.props.resource
    const { navigator } = this.props

    const buttons = []
    const push = btn => buttons.push({ ...btn, index: buttons.length })

    if (!additionalForms)
      return buttons
    additionalForms.forEach(f => {
      let fm = utils.getModel(f.id)
      push({
        title: translate(fm),
        callback: () => this.requestForm({
          val: f.id,
          resource: application._context || application.request,
          application,
          callback: () => {
            Actions.showModal({title: translate('refreshInProgress'), showIndicator: true})
            navigator.pop()
          }
        })
      })
    })
    push({
      title: translate('cancel'),
      callback: () => {}
    })

    return buttons
  }
  applyForNext(params) {
    const { type } = params
    const { navigator } = this.props
    Alert.alert(
      translate('applyForNextProduct', translate(getModel(type))), // + getDisplayName({ resource }),
      null,
      [
        {text: 'Cancel', onPress: () => console.log('Canceled!')},
        {text: 'Ok', onPress: () => {
          Actions.applyForProduct(params)
          // const routes = this.props.navigator.getCurrentRoutes()
          // // get the top TimHome in the stack
          // const homeRoute = routes.filter(r => r.componentName === 'ResourceList')
          // navigator.popToRoute(homeRoute[0])
        }}
      ]
    )
  }
  takeTour() {
    const { navigator, bankStyle } = this.props
    const { tour } = this.state

    navigator.push({
      title: "",
      componentName: 'TourPage',
      backButtonTitle: null,
      // backButtonTitle: __DEV__ ? 'Back' : null,
      passProps: {
        bankStyle,
        noTransitions: true,
        customStyles: {
          nextButtonText: {
            fontSize: 23,
            fontWeight: 'bold',
            fontFamily: 'Arial',
          },
        },
        tour,
        // callback: () => {
        //   navigator.pop()
        // }
      }
    })
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
            translate('createManualMatchCheck'), // + getDisplayName({ resource }),
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
    let me = getMe();
    let statusModel = getModel(STATUS)
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
      menuIsShown: true,
      status: {
        id: STATUS + '_' + status.id,
        title: status.title
      }
    }
    r.message = getStatusMessageForCheck({check: r})
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
      from: getMe(),
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
          let title = translate(getModel(resource.product || resource.requestFor))
          let me = getMe()
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
    let applicantTitle = getDisplayName({ resource: resource.applicant || resource.from })
    Alert.alert(
      translate('denyApplication', applicantTitle),
      null,
      [
        {text: translate('cancel'), onPress: () => {
          console.log('Canceled!')
        }},
        {text: translate('Deny'), onPress: () => {
          Actions.hideModal()
          let title = translate(getModel(resource.product ||  resource.requestFor))
          let me = getMe()
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
    let me = getMe()
    let title
    let aTitle = resource.applicantName || resource.applicant.title
    if (aTitle)
      title = aTitle  + '  --  ' + me.organization.title  + '  →  ' + getDisplayName({ resource })
    else
      title = me.organization.title  + '  --  ' + getDisplayName({ resource })

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

var createStyles = styleFactory(ApplicationView, function ({ dimensions, hasRM, isRM, bankStyle }) {
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
      // backgroundColor: '#efefef',
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
    buttonText: {
      fontSize: 10,
      color: bankStyle.linkColor,
      alignSelf: 'center'
    },
    openChatPadding: {
      paddingRight
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
  // requestForm(val) {
  //   const { navigator, country, locale, currency, bankStyle } = this.props
  //   const application = this.state.resource
  //   let m = getModel(val)

  //   if (utils.isRM(application)) {
  //     let msg = {
  //       [TYPE]: FORM_REQUEST,
  //       message: m.formRequestMessage
  //               ? translate(m.formRequestMessage)
  //               : translate('fillTheForm', translate(m)),
  //           // translate(model.properties.photos ? 'fillTheFormWithAttachments' : 'fillTheForm', translate(model.title)),
  //       product: m.id,
  //       form: val,
  //       from: getMe(),
  //       to: application.applicant,
  //       _context: application._context,
  //       context: application.context
  //     }
  //     onNextTransitionEnd(navigator, () => Actions.addMessage({msg: msg}))
  //     return
  //   }
  //   if (application.filledForCustomer || application.draft) {
  //     navigator.push({
  //       title: translate(m),
  //       componentName: 'NewResource',
  //       backButtonTitle: 'Back',
  //       rightButtonTitle: 'Done',
  //       passProps: {
  //         model: getLensedModelForType(val),
  //         application,
  //         resource: {
  //           [TYPE]: val,
  //           from: getMe(),
  //           to: application.from,
  //           _context: application._context,
  //         },
  //         callback: () => {
  //           navigator.pop()
  //           // setTimeout(this.refreshApplication(application), 300)
  //         },
  //         currency,
  //         country,
  //         locale,
  //         bankStyle
  //       }
  //     })
  //   }
  // }
