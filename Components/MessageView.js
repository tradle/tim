'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var ArticleView = require('./ArticleView');
// var FromToView = require('./FromToView');
var PhotoList = require('./PhotoList');
var PhotoView = require('./PhotoView');
// var ShowPropertiesView = require('./ShowPropertiesView');
var ShowMessageRefList = require('./ShowMessageRefList');
var ShowRefList = require('./ShowRefList');
var VerificationView = require('./VerificationView')
// var MoreLikeThis = require('./MoreLikeThis');
var NewResource = require('./NewResource');

// var VerificationButton = require('./VerificationButton');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var extend = require('extend');
var ResourceMixin = require('./ResourceMixin');
var HELP_COLOR = 'blue'
var NetworkInfoProvider = require('./NetworkInfoProvider')
const PHOTO = 'tradle.Photo'
const TYPE = constants.TYPE
// import Prompt from 'react-native-prompt'
const VERIFICATION = constants.TYPES.VERIFICATION

import {
  // StyleSheet,
  ScrollView,
  View,
  Text,
  PropTypes,
  Alert,
  Platform
} from 'react-native'

import React, { Component } from 'react'
import platformStyles from '../styles/platform'
import StyleSheet from '../StyleSheet'

class MessageView extends Component {
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
      isConnected: this.props.navigator.isConnected,
      promptVisible: false,
      isLoading: !props.resource[TYPE]
    };
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    var len = currentRoutes.length;
    if (!currentRoutes[len - 1].onRightButtonPress  &&  currentRoutes[len - 1].rightButtonTitle) {
      if (this.props.isReview)
        currentRoutes[len - 1].onRightButtonPress = this.props.action
      else
        currentRoutes[len - 1].onRightButtonPress = this.verifyOrCreateError.bind(this)
    }
  }
  componentWillMount() {
    // if (this.props.resource.id)
    if (!this.props.isReview)
      Actions.getItem(this.props.resource)
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
    if (utils.getId(params.resource) !== utils.getId(this.props.resource))
      return
    // if (params.action === 'addVerification') {
    //   // var currentRoutes = this.props.navigator.getCurrentRoutes();
    //   // var len = currentRoutes.length;
    //   // if (currentRoutes[len - 1].id === 5)
    //   //   this.props.navigator.pop();
    //   Actions.list({
    //     modelName: constants.TYPES.MESSAGE,
    //     to: params.resource
    //   });
    //   return
    // }
    if (params.action === 'getItem') {
      this.setState({
        resource: params.resource,
        isLoading: false
      })
    }
    else if (params.action === 'exploreBacklink') {
      if (params.backlink !== this.state.backlink)
        this.setState({backlink: params.backlink, backlinkList: params.list, showDetails: false})
    }
    else if (params.action === 'showDetails')
      this.setState({showDetails: true, backlink: null, backlinkList: null})
  }
  verifyOrCreateError() {
    let resource = this.props.resource
    let model = utils.getModel(resource[TYPE]).value
    if (utils.isEmpty(this.state.errorProps)) {
      Alert.alert(
        translate('verifyPrompt'), // + utils.getDisplayName(resource),
        null,
        [
          {text: 'Cancel', onPress: () => console.log('Canceled!')},
          {text: 'Ok', onPress: this.verify.bind(this)},
        ]
      )
    }
    else {
      let properties = utils.getModel(this.state.resource[TYPE]).value.properties
      let msg = ''
      for (var p in this.state.errorProps)
        msg += msg ? ', ' + properties[p].title : properties[p].title
      msg = translate('pleaseCorrectFields', msg)

      Alert.alert(
        translate('sendEditRequestPrompt', resource.from.title),
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
    let resource = this.props.resource
    let isReadOnlyChat = utils.isReadOnlyChat(resource)
    let formError = {
      _t: 'tradle.FormError',
      errors: errors,
      prefill: resource,
      from: utils.getMe(),// resource.to,
      to: isReadOnlyChat ? resource._context : resource.from,
      _context: resource._context,
      message: text || translate('pleaseCorrectTheErrors')
    }
    Actions.addMessage({msg: formError})
    this.props.navigator.pop()
  }
  onCheck(prop, message) {
    let errorProps = {}

    if (this.state.errorProps)
      extend(errorProps, this.state.errorProps)
    if (this.state.errorProps  &&  this.state.errorProps[prop.name])
      delete errorProps[prop.name]
    else
      errorProps[prop.name] = message
    this.setState({errorProps: errorProps})
  }

  getRefResource(resource, prop) {
    var model = utils.getModel(this.props.resource[TYPE]).value;

    this.state.prop = prop;
    // this.state.propValue = utils.getId(resource.id);
    this.showRefResource(resource, prop)
    // Actions.getItem(resource.id);
  }

  showVerification(resource, document) {
    // Case when resource is a model. In this case the form for creating a new resource of this type will be displayed
    var model = utils.getModel(document[TYPE]).value;
    var title = model.title; //utils.getDisplayName(resource, model.properties);
    var newTitle = title;
    let me = utils.getMe()
    // Check if I am a customer or a verifier and if I already verified this resource
    let isVerifier = !resource && utils.isVerifier(document)
    let isEmployee = utils.isEmployee(this.props.resource)
    var route = {
      title: newTitle,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      parentMeta: model,
      passProps: {
        bankStyle: this.props.bankStyle,
        resource: resource,
        currency: this.props.currency,
        document: document,
        // createFormError: isVerifier && !utils.isMyMessage(resource),
        isVerifier: isVerifier
      }
    }
    this.props.navigator.push(route);
  }

  render() {
    if (this.state.isLoading)
      return <View/>
    var resource = this.state.resource;
    var model = utils.getModel(resource[TYPE]).value;
    let isVerification = model.id === VERIFICATION
    let t = resource.dateVerified ? resource.dateVerified : resource.time
    var date = t ? utils.formatDate(new Date(t)) : utils.formatDate(new Date())

    var photos = resource.photos
    var mainPhoto
    if (!photos) {
      photos = utils.getResourcePhotos(model, resource)
      let mainPhotoProp = utils.getMainPhotoProperty(model)
      mainPhoto = mainPhotoProp ? resource[mainPhotoProp] : photos && photos[0]
    }
    var inRow = photos ? photos.length : 0
    if (inRow  &&  inRow > 4)
      inRow = 5;


    let propertySheet
    if (isVerification)
      propertySheet = <VerificationView navigator={this.props.navigator}
                                        resource={resource}
                                        bankStyle={this.props.bankStyle}
                                        currency={this.props.currency}
                                        showVerification={this.showVerification.bind(this)}/>
    // else
    //   propertySheet = <ShowPropertiesView navigator={this.props.navigator}
    //                                       resource={resource}
    //                                       bankStyle={this.props.bankStyle}
    //                                       errorProps={this.state.errorProps}
    //                                       currency={this.props.currency}
    //                                       checkProperties={this.props.isVerifier /* && !utils.isReadOnlyChat(resource)*/ ? this.onCheck.bind(this) : null}
    //                                       excludedProperties={['tradle.Message.message', 'time', 'photos']}
    //                                       showRefResource={this.getRefResource.bind(this)}/>

    let content = <View>
                    <View style={styles.photoListStyle}>
                      <PhotoList photos={photos} resource={resource} isView={true} navigator={this.props.navigator} numberInRow={inRow} />
                    </View>
                    <View style={styles.rowContainer}>
                      {msg}
                      {propertySheet}
                      {separator}
                      {verificationTxID}
                    </View>
                  </View>

    var checkProps = this.props.isVerifier /* && !utils.isReadOnlyChat(resource)*/ ? this.onCheck.bind(this) : null
    var actionPanel
    if (this.props.isReview)
      actionPanel = content
    else {
      actionPanel = <ShowRefList {...this.props}
                                 backlink={this.state.backlink}
                                 backlinkList={this.state.backlinkList}
                                 showDetails={this.state.showDetails}
                                 errorProps={this.state.errorProps}
                                 checkProperties={checkProps} >
                      {content}
                    </ShowRefList>
    }
        // <FromToView resource={resource} navigator={this.props.navigator} />
        // <MoreLikeThis resource={resource} navigator={this.props.navigator}/>
    var verificationTxID, separator
    if (this.props.verification  &&  this.props.verification.txId) {
      verificationTxID =
          <View style={{padding :10, flex: 1}}>
            <Text style={styles.title}>Verification Transaction Id</Text>
            <Text style={styles.verification} onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + this.props.verification.txId)}>{this.props.verification.txId}</Text>
          </View>
      separator = <View style={styles.separator}></View>
    }
    else {
      verificationTxID = <View />
      separator = <View />
    }

    // let verificationButton = this.props.isVerifier
    //                        ? <VerificationButton resource={resource} verify={this.verify.bind(this)} verificationList={this.showResources.bind(this)} edit={this.edit.bind(this)} />
    //                        : <View />
    // let editButton = this.props.isVerifier
    //                ? <VerificationButton resource={resource} edit={this.edit.bind(this)} />
    //                : <View />
    // let message = <View style={{padding: 10}}>
    //                 <Text style={styles.itemTitle}>click done for verifying or check the properties that should be corrected and click Done button</Text>
    //               </View>
    let msg
    if (resource.message  &&  resource.message.length)
      msg = <View><Text style={styles.itemTitle}>{resource.message}</Text></View>

    // var isVerification = this.props.resource[TYPE] === constants.TYPES.VERIFICATION
    let dateView
    if (isVerification) {
      dateView = <View style={[styles.band, {flexDirection: 'row', justifyContent: 'flex-end', borderBottomColor: this.props.bankStyle.PRODUCT_ROW_BG_COLOR}]}>
                  <Text style={styles.dateLabel}>{translate(model.properties.dateVerified, model)}</Text>
                  <Text style={styles.dateValue}>{date}</Text>
                </View>
    }
    // else {
    //   dateView = <View style={[styles.band, {borderBottomColor: this.props.bankStyle.PRODUCT_ROW_BG_COLOR}]}>
    //               <Text style={styles.date}>{date}</Text>
    //             </View>
    // }

    return (
      <ScrollView  ref='this' style={platformStyles.container} keyboardShouldPersistTaps={true}>
        {dateView}
        <View style={styles.photoBG}>
          <PhotoView resource={resource} mainPhoto={mainPhoto} navigator={this.props.navigator}/>
        </View>
        {actionPanel}
      </ScrollView>
    );
  }
  onPress(url) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      passProps: {url: url}
    });
  }

  verify() {
    this.props.navigator.pop();
    var resource = this.props.resource;
    var model = utils.getModel(resource[TYPE]).value;
    var me = utils.getMe();
    var from = this.props.resource.from;
    // var verificationModel = model.properties.verifications.items.ref;
    let document = {
      id: utils.getId(resource),
      title: resource.message ? resource.message : model.title
    }
    // var verification = {
    //   [constants.TYPE]: constants.TYPES.VERIFICATION,
    //   document: document
    //   time: new Date().getTime()
    // }
    var to = [utils.getId(from)]
    if (utils.isReadOnlyChat(resource)) {
      // var to = this.props.resource.to
      // verification = {
      //   [constants.TYPE]: constants.TYPES.VERIFICATION,
      //   document: {
      //     id: utils.getId(resource),
      //     title: resource.message ? resource.message : model.title
      //   }
      // }
      to.push(utils.getId(this.props.resource.to))
    }
    let params = {to: to, document: document}
    if (this.props.resource._context)
      params.context = this.props.resource._context
    Actions.addVerification(params)
    // verification[constants.TYPE] = verificationModel;
    // if (verificationModel === constants.TYPES.VERIFICATION)
    // else {
    //   this.props.navigator.replace({
    //     title: resource.message,
    //     id: 4,
    //     component: NewResource,
    //     backButtonTitle: resource.firstName,
    //     rightButtonTitle: 'Done',
    //     titleTextColor: '#7AAAC3',
    //     passProps: {
    //       model: utils.getModel(verificationModel).value,
    //       resource: verification,
    //       // callback: this.createVerification.bind(self)
    //     }
    //   });
    // }
  }
}
reactMixin(MessageView.prototype, Reflux.ListenerMixin);
reactMixin(MessageView.prototype, ResourceMixin);

var styles = StyleSheet.create({
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
    // alignSelf: 'center',
  },
  bandV: {
    height: 30,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
  },

  band: {
    height: 30,
    backgroundColor: '#f7f7f7',
    // borderColor:  '#f7f7f7',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    // paddingRight: 10,
    // paddingTop: 3,
    // marginTop: -10,
  },
  rowContainer: {
    paddingBottom: 10,
    // paddingHorizontal: 10
  },
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
});

module.exports = MessageView;
  // edit() {
  //   let rmodel = utils.getModel('tradle.FormError').value
  //   let title = translate(rmodel)
  //   // let form = this.props.resource

  //   this.props.navigator.push({
  //     title: title,
  //     id: 4,
  //     component: MessageView,
  //     // titleTextColor: '#999999',
  //     backButtonTitle: translate('back'),
  //     rightButtonTitle: translate('done'),
  //     passProps: {
  //       model: rmodel,
  //       createFormError: true,
  //       resource: this.props.resource,
  //       // resource: {
  //       //   to: form.from,
  //       //   from: form.to,
  //       //   _t: 'tradle.FormError',
  //       //   prefill: form,
  //       //   message: translate('pleaseCorrectTheErrors', translate(rmodel), form.from.formatted)
  //       // },
  //     }
  //   })
  // }
  // additionalInfo(resource, prop, msg) {
  //   var rmodel = utils.getModel(resource[constants.TYPE]).value;
  //   msg = msg.length ? msg : 'Please submit more info';
  //   var r = {
  //     _t: prop.items.ref,
  //     from: utils.getMe(),
  //     // to: resource.from,
  //     // time: new Date().getTime(),
  //     message: msg
  //   };
  //   r[prop.items.backlink] = {
  //     id: utils.getId(resource),
  //     title: utils.getDisplayName(resource, rmodel.properties)
  //   }
  //   Actions.addVerification({r: r, to: [utils.getId(resource.from)]});
  // }

  // createVerification(resource) {
  //   Actions.addVerification(resource, true);
  // }
