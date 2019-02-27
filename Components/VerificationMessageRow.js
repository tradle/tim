
import utils from '../utils/utils'
var translate = utils.translate
import MessageView from './MessageView'
import NewResource from './NewResource'
import CustomIcon from '../styles/customicons'
import Icon from 'react-native-vector-icons/Ionicons';
import constants from '@tradle/constants'
import RowMixin from './RowMixin'
import equal from 'lodash/isEqual'
// import BG_IMAGE from '../img/verificationBg.jpg'

import { makeResponsive } from 'react-native-orient'
import Actions from '../Actions/Actions'
import StyleSheet from '../StyleSheet'
import chatStyles from '../styles/chatStyles'
import reactMixin from 'react-mixin'

import {
  Text,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

var {
  TYPE,
  ROOT_HASH
} = constants

var {
  VERIFICATION,
  PROFILE,
  ORGANIZATION
} = constants.TYPES

import React, { Component } from 'react'
const MY_PRODUCT = 'tradle.MyProduct'
const FORM = 'tradle.Form'

class VerificationMessageRow extends Component {
  constructor(props) {
    super(props);
    this.verify = this.verify.bind(this)
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (utils.resized(this.props, nextProps)  &&  this.props.orientation !== 'UNKNOWN'  &&  nextProps.orientation !== 'UNKNOWN')
      return true
    return !equal(this.props.resource, nextProps.resource) ||
           !equal(this.props.to, nextProps.to)             ||
           this.props.sendStatus !== nextProps.sendStatus
  }
  render() {
    let { resource, application, bankStyle } = this.props
    let renderedRow = [];

    var isMyMessage = this.isMyMessage();

    var dType = utils.getType(resource.document)
    var msgModel = utils.getModel(dType)
    var orgName = resource._verifiedBy
                ? resource._verifiedBy.title
                : resource.organization  ? resource.organization.title : ''

    let isThirdPartyVerification
    let isReadOnlyChat
    if (resource._context) {
      let context = this.props.context || this.props.resource._context
      let me = utils.getMe()
      if (me.isEmployee) {
        isReadOnlyChat = utils.isReadOnlyChat(this.props.to)
        if  (isReadOnlyChat) {
          // could be shared by customer in this case 'from' will be referring to customer
          let org = resource.organization || resource.to.organization
          isThirdPartyVerification = utils.getId(org) !== utils.getId(context.to.organization)
        }
        else if (this.props.to[TYPE] === PROFILE)
          isThirdPartyVerification = utils.getId(me) !== utils.getId(context.to) || (resource._verifiedBy  &&  utils.getId(me.organization) !== utils.getId(resource._verifiedBy))
      }
      else
        isThirdPartyVerification = resource._verifiedBy != null && utils.getId(resource._verifiedBy)  !== utils.getId(resource.organization)// &&  utils.getId(this.props.context.to.organization) !== utils.getId(resource._verifiedBy)
    }
    let isShared = this.isShared()
    // isMyMessage = isShared
    let color
    let vHeaderTextColor
    if (isThirdPartyVerification) {
      color = '#93BEBA'
      vHeaderTextColor = color
    }
    else {
      // color = bankStyle.VERIFIED_LINK_COLOR
      vHeaderTextColor = bankStyle.verifiedHeaderTextColor || bankStyle.verifiedLinkColor
    }

    let verifiedBy = isShared ? translate('youShared', orgName) : translate('verifiedBy', orgName)

    let msgWidth = utils.getMessageWidth(VerificationMessageRow)
    // if (isReadOnlyChat || application)
    //   msgWidth -= 50 // provider icon and padding
    // let numberOfCharacters = msgWidth / 12
    // if (verifiedBy.length > numberOfCharacters)
    //   verifiedBy = verifiedBy.substring(0, numberOfCharacters) + '..'

    let headerStyle = [
      styles.header,
      isMyMessage  ||  isShared ? styles.headerRight : styles.headerLeft,
      {backgroundColor: bankStyle.verifiedHeaderColor}
    ]
    headerStyle = StyleSheet.flatten(headerStyle)
    // let bulletStyle = {color: color, marginHorizontal: 7, alignSelf: 'center'}
    let row = this.formatDocument({
                model: msgModel,
                verification: resource,
                onPress: this.verify,
                // isAccordion: isThirdPartyVerification,
                isMyMessage: isMyMessage || isShared
              })

    let state, confidence
    if (resource.sources) {
      resource.sources.forEach((r) => {
        if (r.method) {
          if  (r.method.rawData)
            state = <Text style={{color: r.method.rawData.result === 'clear' ? 'green' : 'red', fontSize: 20}}>{r.method.rawData.result}</Text>
          else if (r.method.confidence)
            confidence = <Text style={{color: r.method.confidence > 0.67 ? 'green' : 'red', fontSize: 20, paddingLeft: 5}}>{translate('Confidence') + ': ' + r.method.confidence}</Text>
        }
      })
      if (state || confidence)
        state = <View style={{alignItems: 'flex-end', paddingHorizontal: 10}}>
                  {state}
                  {confidence}
                </View>
    }
    // renderedRow = <View>
    //                 <View style={headerStyle}>
    //                   <Icon style={[chatStyles.verificationIcon, {color: color}]} size={20} name={'md-checkmark'} />
    //                   <Text style={[chatStyles.verificationHeaderText, styles.verificationHeaderText]}>{verifiedBy}</Text>
    //                 </View>
    //                 <View style={styles.separator}>
    //                   <View style={[styles.separatorPart, {width: msgWidth * 0.2}]} />
    //                   <Text style={bulletStyle}>🔸</Text>
    //                   <View style={[styles.separatorPart, {width: msgWidth * 0.2}]} />
    //                 </View>
    //                 <View>{row}</View>
    //               </View>
    renderedRow = <View>
                    <View style={headerStyle}>
                      <Icon style={[chatStyles.verificationIcon, {color: vHeaderTextColor}]} size={20} name={'md-checkmark'} />
                      <Text style={[chatStyles.verificationHeaderText, styles.verificationHeaderText, {color: vHeaderTextColor}]}>{verifiedBy}</Text>
                    </View>
                    <View style={{marginVertical: 10}}>
                      {row}
                      {state}
                    </View>
                  </View>

    var viewStyle = {
      width: isMyMessage ||  !application ? msgWidth : msgWidth - 43,
      // flexDirection: 'row',
      alignSelf: isMyMessage || isShared ? 'flex-end' : 'flex-start',
      backgroundColor: 'transparent',
      marginBottom: 3,
    }

    let addStyle = [
      { borderWidth: 0, backgroundColor: 'transparent'}, /*, backgroundColor: isShared ? '#ffffff' : bankStyle.VERIFIED_BG,*/
      isMyMessage || isShared ? styles.headerRight : styles.headerLeft
    ];

    let shareWith
    if (this.props.shareWithRequestedParty) {
      let title = this.props.shareWithRequestedParty.organization && this.props.shareWithRequestedParty.organization.title
      shareWith = <View style={styles.shareWithInquirer}>
                    <TouchableOpacity onPress={this.shareWithRequestedParty.bind(this)}>
                       <View style={[chatStyles.shareButton, {marginLeft: 15, justifyContent: 'flex-start'}]}>
                        <CustomIcon name='tradle' style={{color: '#4982B1' }} size={32} />
                        <Text style={chatStyles.shareText}>{translate('Share')}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.center}>
                      <Text style={styles.shareWithText}>{'with ' + title}</Text>
                    </View>
                  </View>
    }
    else
      shareWith = <View/>
    let messageBody =
          <TouchableOpacity onPress={this.verify.bind(this, resource)} style={{marginTop: 10}}>
            <View style={styles.messageBody}>
              <View style={viewStyle}>
                <View style={[chatStyles.textContainer, addStyle]}>
                  <View style={[styles.imageFrame, {backgroundColor: '#ffffff', borderWidth: 1, borderColor: bankStyle.verifiedBorderColor}, isMyMessage || isShared ? styles.headerRight : styles.headerLeft]}>
                    <View style={[styles.image, addStyle]}>
                      {renderedRow}
                    </View>
                    {shareWith}
                  </View>
                </View>
              </View>
            </View>
              {this.getSendStatus()}
          </TouchableOpacity>

    // let messageBody =
    //       <TouchableOpacity onPress={this.verify.bind(this, resource)}>
    //         <View style={styles.messageBody}>
    //           <View style={[chatStyles.row, viewStyle]}>
    //             {this.getOwnerPhoto(isMyMessage)}
    //             <View style={[chatStyles.textContainer, addStyle]}>
    //               <View style={[{width: msgWidth}, styles.imageFrame, isMyMessage ? styles.headerRight : styles.headerLeft]}>
    //                 <Image source={BG_IMAGE} style={[{width: msgWidth-2}, styles.image, addStyle]} >
    //                   {renderedRow}
    //                 </Image>
    //                 {shareWith}
    //              </View>
    //           </View>
    //         </View>
    //         {this.getSendStatus()}
    //         </View>
    //       </TouchableOpacity>

    // let bg
    // if (this.props.bankStyle.BACKGROUND_IMAGE)
    //   bg = 'transparent'
    // else
    //   bg = bankStyle.BACKGROUND_COLOR
    // var viewStyle = { margin: 1} //, backgroundColor: bg }
    let contextId = this.getContextId(resource)
    if (!isMyMessage  &&  !isShared) {
      messageBody = <View style={[chatStyles.row, viewStyle]}>
                      {this.getOwnerPhoto(isMyMessage)}
                      {messageBody}
                    </View>
    }

    return (
      <View key={this.getNextKey()}>
        {this.getChatDate(resource)}
        {messageBody}
        {contextId}
      </View>
    );
  }
  shareWithRequestedParty() {
    this.props.navigator.pop()
    Actions.share(this.props.resource, this.props.shareWithRequestedParty.organization, this.props.originatingMessage) // forRequest - originating message
  }
  verify(event) {
    var resource = this.props.resource;
    var isVerification = resource[TYPE] === VERIFICATION;
    var r = resource // isVerification &&  !resource.sources  &&  !resource.method  ? resource.document : resource

    var passProps = {
      resource: r,
      bankStyle: this.props.bankStyle,
      currency: this.props.currency
    }
    if (!isVerification)
      passProps.verify = true
    else
      passProps.verification = resource

    var model = utils.getModel(r[TYPE]);
    let title
    if (r[TYPE] === VERIFICATION) {
      let type = utils.getType(r.document)
      if (type)
        title = translate(utils.getModel(type))
    }
    if (!title)
      title = translate(model)
    var route = {
      id: 5,
      component: MessageView,
      backButtonTitle: 'Back',
      passProps: passProps,
      title: title
    }
    if (this.isMyMessage()) {
      route.rightButtonTitle = 'Edit'
      route.onRightButtonPress = {
        title: 'Edit',
        component: NewResource,
        // titleTextColor: '#7AAAC3',
        id: 4,
        passProps: {
          resource: r,
          metadata: model,
          bankStyle: this.props.bankStyle,
          currency: this.props.currency,
          callback: this.props.onSelect.bind(this, {resource: r})
        }
      };
    }
    this.props.navigator.push(route);
  }
  formatDocument(params) {
    const me = utils.getMe()
    let model = params.model
    let verification = params.verification
    let onPress = params.onPress
    let providers = params.providers  // providers the document was shared with

    var document = verification.document

    let isThirdParty = !document[TYPE]  &&  !document.title
    let type = document[TYPE] || utils.getType(document)
    var docModel = utils.getModel(type);
    var isMyProduct = utils.isMyProduct(docModel)
    var docModelTitle = docModel.title || utils.makeLabel(docModel.id)
    var idx = docModelTitle.indexOf('Verification');
    var docTitle = idx === -1 ? docModelTitle : docModelTitle.substring(0, idx);

    var msg;
    if (document.message  &&  !utils.isForm(docModel))
      msg = <View><Text style={chatStyles.description}>{document.message}</Text></View>
    // else if (!onPress) {
    //   msg = <View><Text style={styles.description}>{translate('seeTheForm')}</Text></View>
    //   // var rows = [];
    //   // this.formatDocument1(model, document, rows);
    //   // msg = <View>{rows}</View>
    // }
    else
      msg = <View/>

    // var hasPhotos = document  &&  document.photos  &&  document.photos.length
    // var photo = hasPhotos
    //           ? <Image source={{uri: utils.getImageUri(document.photos[0].url)}}  style={styles.cellImage} />
    //           : <View />;
    var headerStyle = {flex: 1, paddingTop: verification.dateVerified ? 0 : 5, marginLeft: 10}
    // var isShared = this.isShared(verification)

                    // {verification.dateVerified
                    //   ? <View style={{flexDirection: 'row'}}>
                    //       <Text style={{fontSize: 12, color: this.props.bankStyle.VERIFIED_HEADER_COLOR, fontStyle: 'italic'}}>{utils.formatDate(verification.dateVerified)}</Text>
                    //     </View>
                    //   : <View/>
                    // }
                          // <Text style={{fontSize: 12, color: 'darkblue', fontStyle: 'italic'}}>{'Date '}</Text>
    let addStyle = onPress ? {} : {backgroundColor: this.props.bankStyle.verifiedBg, borderWidth: StyleSheet.hairlineWidth, borderColor: this.props.bankStyle.verifiedBg, borderBottomColor: this.props.bankStyle.verifiedHeaderColor}

    let hs = /*isShared ? chatStyles.description :*/ styles.vheader
    // let arrow = <Icon color={this.props.bankStyle.VERIFIED_HEADER_COLOR} size={20} name={'ios-arrow-forward'} style={{top: 10, position: 'absolute', right: 30}}/>
    let arrow = <Icon color={this.props.bankStyle.verifiedLinkColor} size={20} name={'ios-arrow-forward'} style={{marginRight: 10, marginTop: 3}}/>

    let docName
    if (!isThirdParty || me.isEmployee)
      docName = <Text style={[hs, {color: '#555555', fontSize: 18}]}>{utils.getDisplayName(document)}</Text>

    var headerContent = <View style={headerStyle}>
                          <Text style={[hs, {fontSize: isThirdParty || onPress ? 16 : 12}]}>{translate(model)}</Text>
                          {docName}
                        </View>



    let header = <TouchableOpacity onPress={this.props.onSelect.bind(this, {resource: me.isEmployee && verification || document, verification})}>
                   <View style={[addStyle, {flexDirection: 'row', justifyContent: 'space-between'}]}>
                     {headerContent}
                     {arrow}
                   </View>
                 </TouchableOpacity>
      // header = <TouchableOpacity underlayColor='transparent' onPress={this.props.onSelect.bind(this, this.props.shareWithRequestedParty ? document : verification, verification)}>


    var orgRow = <View/>
    if (verification  && verification.organization) {
      var shareView = <View style={[chatStyles.shareButton, {backgroundColor: this.props.bankStyle.shareButtonBackgroundColor, opacity: this.props.resource._documentCreated ? 0.3 : 1}]}>
                        <CustomIcon name='tradle' style={{color: '#ffffff' }} size={32} />
                        <Text style={chatStyles.shareText}>{translate('Share')}</Text>
                      </View>
      var orgTitle = this.props.to[TYPE] === ORGANIZATION
                   ? this.props.to.name
                   : (this.props.to.organization ? this.props.to.organization.title : null);
      // let o = verification.organization.title.length < 25 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'
      let verifiedBy
      if (isMyProduct)
        verifiedBy = translate('issuedBy', verification.organization.title)
      // Not verified Form - still shareable
      else if (verification[ROOT_HASH]) {
        let orgs
        if (providers) {
          providers.forEach((p) => {
            if (!orgs)
              orgs = p.title
            else
              orgs += ', ' + p.title
          })
        }
        else
          orgs = verification.organization.title
        verifiedBy = translate('verifiedBy', orgs)
      }
      else if (utils.isSavedItem(verification.document))
        verifiedBy = translate('fromMyData')
      else
        verifiedBy = translate('sentTo', verification.organization.title)
      var orgView = <View style={styles.orgView}>
                      <Text style={chatStyles.description}>
                        {verifiedBy}
                      </Text>
                        {verification.dateVerified
                          ? <View style={{flexDirection: 'row'}}>
                              <Text style={{fontSize: 12, color: '#757575', fontStyle: 'italic'}}>{utils.formatDate(verification.dateVerified)}</Text>
                            </View>
                          : <View/>
                        }
                      </View>

                         // <Text style={[styles.title, {color: '#2E3B4E'}]}>{verification.organization.title.length < 30 ? verification.organization.title : verification.organization.title.substring(0, 27) + '..'}</Text>
      if (onPress) {
        // if (!this.props.resource._documentCreated)
        //      <TouchableOpacity underlayColor='transparent' onPress={onPress ? onPress : () =>
        //                     Alert.alert(
        //                       'Sharing ' + docTitle + ' ' + verifiedBy,
        //                       'with ' + orgTitle,
        //                       [
        //                         {text: translate('cancel'), onPress: () => console.log('Canceled!')},
        //                         {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
        //                       ]
        //                   )}>
        //             {shareView}
        //           </TouchableOpacity>

      }
      else if (this.props.resource._documentCreated) {
        orgRow = <View style={chatStyles.shareView}>
                   {shareView}
                  <TouchableOpacity onPress={this.props.onSelect.bind(this, {resource: verification})}>
                    {orgView}
                  </TouchableOpacity>
                </View>
      }
      else {
        orgRow = <View style={chatStyles.shareView}>
                   <TouchableOpacity onPress={onPress ? onPress : () =>
                            Alert.alert(
                              'Sharing ' + docTitle + ' ' + verifiedBy,
                              'with ' + orgTitle,
                              [
                                {text: translate('cancel'), onPress: () => console.log('Canceled!')},
                                {text: translate('Share'), onPress: this.props.share.bind(this, verification, this.props.to, this.props.resource)},
                              ]
                          )}>
                    {shareView}
                   </TouchableOpacity>
                   <TouchableOpacity onPress={this.props.onSelect.bind(this, {resource: verification})}>
                     {orgView}
                   </TouchableOpacity>
                </View>
      }
    }
    let content = <View style={{flex:1}}>
                     <TouchableOpacity onPress={this.props.onSelect.bind(this, {resource: verification})}>
                       {msg}
                     </TouchableOpacity>
                     {orgRow}
                   </View>

    // var verifiedBy = verification && verification.organization ? verification.organization.title : ''
    return  <View style={{flex: 1}} key={this.getNextKey()}>
               {header}
               {content}
             </View>
  }

}
var styles = StyleSheet.create({
  shareWithInquirer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderColor: '#dddddd',
    // marginHorizontal: -7,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopColor: '#dddddd',
    borderWidth: 0.5
  },
  separator: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: -5
  },
  separatorPart: {
    height: 1,
    backgroundColor: '#cccccc',
    alignSelf: 'center'
  },
  verificationHeaderText: {
    color: '#555555',
    fontStyle: 'italic',
  },
  header: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    padding: 10, //, alignSelf: 'center', paddingLeft: 10}
    justifyContent: 'center'
  },
  headerRight: {
    borderTopRightRadius: 0,
    borderTopLeftRadius: 10
  },
  headerLeft: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 10
  },
  messageBody: {
    flexDirection: 'column',
    flex: 1,
    margin: 2,
    paddingVertical: 3
  },
  image: {
    borderRadius: 10,
    // minHeight: 110,
    // resizeMode: 'cover',
    overflow: 'hidden'
  },
  imageFrame: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 1,
    // borderColor: '#D4D4B8'
  },
  center: {
    justifyContent: 'center'
  },
  vheader: {
    fontSize: 16,
    marginTop: 2,
    color: '#757575'
    // paddingRight: 10
  },
  orgView: {
    maxWidth: 0.8 * utils.dimensions().width - 150,
    paddingLeft: 3,
    marginRight: 10,
    flex: 1,
    justifyContent: 'center'
  },
  shareWithText: {
    fontSize: 16,
    color: '#757575'
  }

})
reactMixin(VerificationMessageRow.prototype, RowMixin);
VerificationMessageRow = makeResponsive(VerificationMessageRow)

module.exports = VerificationMessageRow;

