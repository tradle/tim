console.log('requiring MessageView.js')
'use strict';

import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons';
import { makeResponsive } from 'react-native-orient'

import utils, { translate } from '../utils/utils'
import constants from '@tradle/constants'
import ArticleView from './ArticleView'
import PhotoList from './PhotoList'
import PhotoView from './PhotoView'

import ShowRefList from './ShowRefList'
import VerificationView from './VerificationView'
import NewResource from './NewResource'
import PageView from './PageView'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import ResourceMixin from './ResourceMixin'
import NetworkInfoProvider from './NetworkInfoProvider'
import defaultBankStyle from '../styles/defaultBankStyle.json'

const HELP_COLOR = 'blue'
const PHOTO = 'tradle.Photo'
const ITEM = 'tradle.Item'
// import Prompt from 'react-native-prompt'
const { TYPE } = constants
const {
  VERIFICATION,
  ENUM,
  MONEY,
  FORM
} = constants.TYPES
const NAV_BAR_CONST = Platform.OS === 'ios' ? 64 : 56

import ActionSheet from './ActionSheet'

import {
  // StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Alert,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
import platformStyles from '../styles/platform'
import buttonStyles from '../styles/buttonStyles'
import StyleSheet from '../StyleSheet'

class MessageView extends Component {
  static displayName = 'MessageView';
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    verification: PropTypes.object,
    // verify: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      resource: props.resource,
      isConnected: props.navigator.isConnected,
      promptVisible: false,
      isLoading: !props.resource[TYPE],
      showDetails: true,
      bankStyle: defaultBankStyle
    };
    let currentRoutes = props.navigator.getCurrentRoutes();
    let len = currentRoutes.length;
    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle) {
      if (this.props.isReview)
        currentRoutes[len - 1].onRightButtonPress = props.action
      else
        currentRoutes[len - 1].onRightButtonPress = this.verifyOrCreateError.bind(this)
    }
    this.doVerify = this.doVerify.bind(this)
    this.showVerification = this.showVerification.bind(this)
    this.onCheck = this.onCheck.bind(this)
    this.onPageLayout = this.onPageLayout.bind(this)
    this.getRefResource = this.getRefResource.bind(this)

  }
  componentWillMount() {
    // if (this.props.resource.id)
    let {resource, isReview, search, application} = this.props
    if (isReview)
      return
    if (resource.id) {
      Actions.getItem({resource, search, application})
      return
    }
    let m = utils.getModel(resource[TYPE])
    let vCols = m.viewCols
    if (!vCols)
      return
    let props = m.properties
    let runGetItem
    vCols.forEach((col) => {
      if (!resource[col])
        return
      let ref = props[col].ref
      if (ref  &&  ref !== MONEY  &&  utils.getModel(ref).subClassOf !== ENUM) {
        if (resource[col].id)
          runGetItem = true
      }
    })
    // if (runGetItem)
      Actions.getItem({resource, search, application})
  }

  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }
  onAction(params) {
    if (params.action == 'connectivity') {
      this.setState({isConnected: params.isConnected})
      return
    }
    if (!params.resource)
      return
    let { bankStyle, application, resource } = this.props
    if (utils.getId(params.resource) !== utils.getId(resource))
      return
    if (params.action === 'getItem') {
      let state = {
        resource: params.resource,
        isLoading: false
      }
      if (params.currency)
        state.currency = params.currency
      if (params.country)
        state.country = params.country
      if (params.style) {
        let style = {}
        if (bankStyle)
          _.extend(style, bankStyle)
        else
          _.extend(style, defaultBankStyle)
        _.extend(style, params.style)
        state.bankStyle = style
      }
      this.setState(state)
    }
    else if (params.action === 'exploreBacklink') {
      if (params.backlink !== this.state.backlink || params.backlinkAdded) {
        let r = params.resource || this.state.resource
        this.setState({backlink: params.backlink, backlinkList: params.list || r[params.backlink], showDetails: false, showDocuments: false, resource: r})
        Actions.getItem({resource: r, application, search: application != null})
      }
    }
    else if (params.action === 'showDetails')
      this.setState({showDetails: true, backlink: null, backlinkList: null, showDocuments: false})
    else if (params.action === 'showDocuments')
      this.setState({showDocuments: true, backlink: null, backlinkList: params.list, showDetails: false})
  }

  renderActionSheet() {
    if (this.props.application)
      return
    let resource = this.state.resource;
    let m = utils.getModel(resource[TYPE])
    let bl = utils.getPropertiesWithAnnotation(m, 'items')
    if (utils.isEmpty(bl))
      return

    let itemBl
    for (let p in bl) {
      let l = bl[p]
      if (!l.items.ref  ||  !l.items.backlink)
        continue
      let pm = utils.getModel(l.items.ref)
      if (utils.isItem(pm)) {
        itemBl = l
        break
      }
    }
    if (!itemBl)
      return
    let buttons = []
    if (itemBl.allowToAdd) {
      buttons = [
        {
          text: translate('addNew', itemBl.title),
          onPress: () => this.addNew(itemBl)
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

  addNew(itemBl) {
    this.setState({hideMode: false})
    // resource if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    let r = {};
    let { resource, defaultPropertyValues, bankStyle, navigator } = this.props
    r[TYPE] = itemBl.items.ref
    r[itemBl.items.backlink] = { id: utils.getId(resource) }

    // if (this.props.resource.relatedTo  &&  props.relatedTo) // HACK for now for main container
    //   r.relatedTo = this.props.resource.relatedTo;
    let me = utils.getMe()
    r.from = me
    r.to = me //resource.to
    r._context = resource._context
    let model = utils.getModel(r[TYPE])

    let self = this
    navigator.push({
      title: model.title,
      id: 4,
      component: NewResource,
      titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        model: model,
        bankStyle: this.state.bankStyle || bankStyle,
        resource: r,
        doNotSend: true,
        defaultPropertyValues: defaultPropertyValues,
        currency: this.props.currency || this.state.currency,
        callback: (resource) => {
          navigator.pop()
        }
      }
    })
  }

  verifyOrCreateError() {
    let { resource, application } = this.props
    let model = utils.getModel(resource[TYPE])
    if (utils.isEmpty(this.state.errorProps)) {
      Alert.alert(
        translate('verifyPrompt'), // + utils.getDisplayName(resource),
        null,
        [
          {text: 'Cancel', onPress: () => console.log('Canceled!')},
          {text: 'Ok', onPress: this.doVerify},
        ]
      )
    }
    else {
      let properties = utils.getModel(this.state.resource[TYPE]).properties
      let msg = ''
      for (let p in this.state.errorProps)
        msg += msg ? ', ' + properties[p].title : properties[p].title
      msg = translate('pleaseCorrectFields', msg)
      let from = (application ? application.applicant : resource.from).title || 'Applicant'
      Alert.alert(
        translate('sendEditRequestPrompt', from),
        null,
        // msg,
        [
          {text: 'Cancel', onPress: () => console.log('Canceled!')},
          {text: 'Ok', onPress: this.createError.bind(this, msg)},
        ]
      )
   }
  }
 createError(text) {
    let errors = []
    for (let p in this.state.errorProps) {
      errors.push({name: p, error: this.state.errorProps[p] || 'Please correct this property'})
    }
    let { resource, application, navigator } = this.props
    let isReadOnlyChat = utils.isReadOnlyChat(resource)
    let context, to
    if (application) {
      to = application.applicant
      context = application._context
    }
    else {
      to = isReadOnlyChat ? resource._context : resource.from
      context = resource._context
    }
    let formError = {
      _t: 'tradle.FormError',
      errors: errors,
      prefill: resource,
      from: utils.getMe(),// resource.to,
      to: to,
      _context: context,
      message: text || translate('pleaseCorrectTheErrors')
    }
    Actions.addMessage({msg: formError, application: application})
    navigator.pop()
  }
  onCheck(prop, message) {
    let errorProps = {}

    if (this.state.errorProps)
      _.extend(errorProps, this.state.errorProps)
    if (this.state.errorProps  &&  this.state.errorProps[prop.name])
      delete errorProps[prop.name]
    else
      errorProps[prop.name] = message
    this.setState({errorProps: errorProps})
  }

  getRefResource(resource, prop) {
    let model = utils.getModel(this.props.resource[TYPE]);

    this.state.prop = prop;
    // this.state.propValue = utils.getId(resource.id);
    this.showRefResource(resource, prop)
    // Actions.getItem(resource.id);
  }

  showVerification(resource, document) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    let model = utils.getModel(document[TYPE]);
    let title = model.title; //utils.getDisplayName(resource, model.properties);
    let newTitle = title;
    let me = utils.getMe()
    // Check if I am a customer or a verifier and if I already verified this resource
    let isVerifier = !resource && utils.isVerifier(document)
    let isEmployee = utils.isEmployee(this.props.resource)
    let route = {
      title: newTitle,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      parentMeta: model,
      passProps: {
        bankStyle: this.state.bankStyle || this.props.bankStyle,
        resource: resource,
        currency: this.props.currency,
        document: document,
        isVerifier: isVerifier
      }
    }
    this.props.navigator.push(route);
  }
  render() {
    if (this.state.isLoading)
      return <View/>
    let { lensId, style, navigator, currency, isVerifier, defaultPropertyValues, verification, application } = this.props
    let resource = this.state.resource;
    let model = utils.getLensedModel(resource, lensId);
    let isVerification = model.id === VERIFICATION
    let isVerificationTree = isVerification &&  (resource.method || resource.sources)
    let isForm = model.subClassOf === FORM
    let t = resource.dateVerified ? resource.dateVerified : resource.time
    let date
    if (isForm  &&  t)
      date = utils.formatDate(new Date(t), true)
    else
      date = t ? utils.formatDate(new Date(t)) : utils.formatDate(new Date())
    let photos = resource.photos
    let mainPhoto
    if (!photos) {
      photos = utils.getResourcePhotos(model, resource)
      let mainPhotoProp = utils.getMainPhotoProperty(model)
      mainPhoto = mainPhotoProp ? resource[mainPhotoProp] : photos && photos[0]
    }
    else if (photos.length === 1)
      mainPhoto = photos[0]
    if (photos  &&  photos.length)
      photos.splice(0, 1)

    let inRow = photos ? photos.length : 0
    if (inRow  &&  inRow > 4)
      inRow = 5;

    let propertySheet
    let bankStyle = this.state.bankStyle || style
    let styles = createStyles({bankStyle})
    if (isVerificationTree)
      propertySheet = <VerificationView navigator={navigator}
                                        resource={resource}
                                        bankStyle={bankStyle}
                                        currency={currency}
                                        showVerification={this.showVerification}/>
    let content = <View>
                    <View style={styles.photoListStyle}>
                      <PhotoList photos={photos} resource={resource} isView={true} navigator={navigator} numberInRow={inRow} />
                    </View>
                    <View style={styles.rowContainer}>
                      {msg}
                      {propertySheet}
                      {separator}
                      {verificationTxID}
                    </View>
                  </View>

    let checkProps = !isVerification && isVerifier /* && !utils.isReadOnlyChat(resource)*/ && this.onCheck
    let actionPanel
    if (/*this.props.isReview  || */ isVerificationTree)
      actionPanel = content
    else {
      actionPanel = <ShowRefList {...this.props}
                                 backlink={this.state.backlink}
                                 resource={this.state.resource}
                                 backlinkList={this.state.backlinkList}
                                 showDetails={this.state.showDetails}
                                 model={model}
                                 application={application}
                                 showDocuments={this.state.showDocuments}
                                 errorProps={this.state.errorProps}
                                 bankStyle={bankStyle}
                                 onPageLayout={this.onPageLayout}
                                 showRefResource={this.getRefResource}
                                 defaultPropertyValues={defaultPropertyValues}
                                 checkProperties={checkProps} >
                      {content}
                    </ShowRefList>
    }
        // <FromToView resource={resource} navigator={this.props.navigator} />
        // <MoreLikeThis resource={resource} navigator={this.props.navigator}/>
    let verificationTxID, separator
    if (verification  &&  verification.txId) {
      verificationTxID =
          <View style={styles.txIdView}>
            <Text style={styles.title}>Verification Transaction Id</Text>
            <Text style={styles.verification} onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + verification.txId)}>{verification.txId}</Text>
          </View>
      separator = <View style={styles.separator}></View>
    }

    let msg
    if (resource.message  &&  resource.message.length)
      msg = <View><Text style={styles.itemTitle}>{resource.message}</Text></View>

    // let isVerification = this.props.resource[TYPE] === constants.TYPES.VERIFICATION
    // borderBottomColor: bankStyle.productRowBgColor
    let dateView
    if (isVerificationTree || isForm) {
      dateView = <View style={styles.band}>
                  <Text style={styles.dateLabel}>{isVerificationTree ? translate(model.properties.dateVerified, model) : translate('Date')}</Text>
                  <Text style={styles.dateValue}>{date}</Text>
                </View>
    }
    let actionSheet = this.renderActionSheet()
    let title = isVerification  ? this.makeViewTitle(model, styles) : null
    let footer = actionSheet && this.renderFooter(styles)
    let width = utils.getContentWidth()
    let contentSeparator = utils.getContentSeparator(bankStyle)
    let bigPhoto
    if (mainPhoto)
      bigPhoto = <View style={styles.photoBG} ref='bigPhoto'>
                  <PhotoView resource={resource} mainPhoto={mainPhoto} navigator={navigator}/>
                 </View>
    let height = utils.dimensions(MessageView).height
    return (
      <PageView style={[platformStyles.container, {height, alignItems: 'center'}]} separator={contentSeparator}>
      <ScrollView
        ref='messageView'
        keyboardShouldPersistTaps="always"
        style={{width: width}}>
        {dateView}
        {bigPhoto}
        {actionPanel}
      </ScrollView>
        {title}
        {footer}
        {actionSheet}
      </PageView>
    );
  }
  onPageLayout(height, scrollDistance) {
    let scrollTo = height + scrollDistance - NAV_BAR_CONST
    if (this.refs.bigPhoto) {
      this.refs.bigPhoto.measure((x,y,w,h,pX,pY) => {
        this.refs.messageView.scrollTo({y: scrollTo - h, animated: true})
      })
    }
    else
      this.refs.messageView.scrollTo({y: scrollTo})
  }
  makeViewTitle(model, styles) {
    let rTitle
    // let bankStyle = this.state.bankStyle || this.props.bankStyle
    if (this.props.bankStyle  &&  !this.props.bankStyle.logoNeedsText)
      rTitle = <View style={styles.viewTitle}>
                 <Text style={styles.viewTitleText}>{translate(model)}</Text>
               </View>
    return rTitle
  }

  renderFooter(styles) {
    let icon = 'md-add' //Platform.OS === 'ios' ?  'md-more' : 'md-menu'
    let color = Platform.OS === 'ios' ? '#ffffff' : 'red'
    return (
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => this.ActionSheet.show()}>
            <View style={[buttonStyles.menuButton, {opacity: 0.4}]}>
              <Icon name={icon}  size={33}  color={color}/>
            </View>
          </TouchableOpacity>
        </View>
     )
  }

  onPress(url) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      passProps: {url: url}
    });
  }

  doVerify() {
    let { navigator, resource } = this.props
    navigator.pop();
    let model = utils.getModel(resource[TYPE]);
    let me = utils.getMe();
    let from = resource.from;
    let document = {
      id: utils.getId(resource),
      title: resource.message ? resource.message : model.title
    }
    let to = [utils.getId(from)]
    if (utils.isReadOnlyChat(resource))
      to.push(utils.getId(resource.to))
    let r = {
      [TYPE]: VERIFICATION,
      document: document,
      from: utils.getMe(),
      to: resource.to,
      _context: resource._context
    }
    let params = {to: to, r: r}
    if (resource._context)
      params.context = resource._context
    Actions.addVerification(params)
  }
}
reactMixin(MessageView.prototype, Reflux.ListenerMixin);
reactMixin(MessageView.prototype, ResourceMixin);
MessageView = makeResponsive(MessageView)

var createStyles = utils.styleFactory(MessageView, function ({ dimensions, bankStyle }) {
  return StyleSheet.create({
    itemTitle: {
      fontSize: 18,
      margin: 5,
      marginBottom: 0,
      color: '#7AAAC3'
    },
    title: {
      fontSize: 18,
      // fontFamily: 'Avenir Next',
      marginHorizontal: 7,
      color: '#9b9b9b'
    },
    verification: {
      fontSize: 18,
      marginVertical: 3,
      marginHorizontal: 7,
      color: '#7AAAC3',
    },
    separator: {
      height: 1,
      backgroundColor: '#eeeeee',
      marginHorizontal: 15
    },
    photoBG: {
      backgroundColor: '#f7f7f7',
      alignItems: 'center',
    },
    photoListStyle: {
      flexDirection: 'row',
      alignSelf: 'center',
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

    band: {
      height: 30,
      backgroundColor: '#fafafa',
      // borderColor:  '#f7f7f7',
      borderBottomWidth: 1,
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      borderBottomColor: '#eee',
      // paddingRight: 10,
      // paddingTop: 3,
      // marginTop: -10,
    },
    // rowContainer: {
    //   paddingBottom: 10,
    //   // paddingHorizontal: 10
    // },
    date: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      alignSelf: 'flex-end',
      color: '#2E3B4E'
      // color: '#b4c3cb'
    },
    dateLabel: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      color: '#999999'
      // color: '#b4c3cb'
    },
    dateValue: {
      fontSize: 14,
      marginTop: 5,
      marginRight: 10,
      color: '#555555'
      // color: '#b4c3cb'
    },
    txIdView: {
      padding :10,
      flex: 1
    },
    viewTitle: {
      alignSelf: 'stretch',
      alignItems: 'center',
      backgroundColor: bankStyle.navBarBackgroundColor,
      borderTopColor: bankStyle.contextBackgroundColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: 45,
      justifyContent: 'center'
    },
    viewTitleText: {
      fontSize: 24,
      color:  bankStyle.contextBackgroundColor
    }
  })
})

module.exports = MessageView;
