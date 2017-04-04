'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var PageView = require('./PageView')
var Icon = require('react-native-vector-icons/Ionicons');
var Actions = require('../Actions/Actions');
var Reflux = require('reflux');
var Store = require('../Store/Store');
var reactMixin = require('react-mixin');
var ResourceMixin = require('./ResourceMixin');
var QRCode = require('./QRCode')
var MessageList = require('./MessageList')
var ResourceView = require('./ResourceView')
var defaultBankStyle = require('../styles/bankStyle.json')
var ENV = require('../utils/env')
var StyleSheet = require('../StyleSheet')
var extend = require('extend');
var ArticleView = require('./ArticleView');
var termsAndConditions = require('../termsAndConditions.json')
import CustomIcon from '../styles/customicons'
import platformStyles from '../styles/platform'
import { makeResponsive } from 'react-native-orient'
import ConversationsIcon from './ConversationsIcon'

const CUSTOMER_WAITING = 'tradle.CustomerWaiting'
const MESSAGE = 'tradle.Message'
const LEARN_MORE_URL = 'https://www.fca.org.uk/news/press-releases/financial-conduct-authority-unveils-successful-sandbox-firms-second-anniversary'// 'https://www.aviva.com/tradle/learnmore'
const CONTACT_US_URL = 'https://www.aviva.co.uk/contact-us/'

// const LEARN_MORE_URL = 'https://www.aviva.com/tradle/learnmore'
// const CONTACT_US_ADDRESS = 'tradlesupport@aviva.com'

import {
  // StyleSheet,
  ScrollView,
  Image,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform
} from 'react-native'

import React, { Component } from 'react'

const avivaTC = Platform.OS === 'android'
  ? { uri: 'file:///android_asset/Aviva_TC.html' }
  : require('../html/Aviva_TC.html')

class AvivaIntroView extends Component {
  static displayName = 'AvivaIntroView';
  static orientation = 'portrait';
  static backButtonDisabled = !__DEV__;
  render() {
    const screen = utils.dimensions(AvivaIntroView)
    var bankStyle = this.props.bankStyle
    let content = <ScrollView style={{paddingTop: 20, paddingBottom: 40, backgroundColor: '#ffffff'}}>
        <TouchableOpacity onPress={()=>{this.showChat(this.props.resource)}}>
           <View style={{paddingHorizontal: 15, backgroundColor: '#ffffff'}}>
             <Text style={styles.resourceTitle}>Welcome to Aviva ID, our online verification service.</Text>
             <Text style={[styles.subTitle, styles.importantText]}>Keeping your money and identity safe is our number 1 priority!</Text>
             <Text style={styles.subTitle}>To use this service you’ll undertake 4 easy steps:</Text>
             <View style={styles.row}>
               <Icon name='ios-mail-outline' size={40} color={bankStyle.CONTEXT_BACKGROUND_COLOR} style={styles.icon}/>
               <View style={{justifyContent: 'center'}}>
                 <Text style={styles.text}>Provide your email address.</Text>
               </View>
             </View>
             <View style={styles.separator} />
             <View style={{flexDirection: 'row', paddingVertical: 7}}>
               <Icon name='ios-camera-outline' size={40} color={bankStyle.CONTEXT_BACKGROUND_COLOR} style={styles.icon}/>
               <View style={{justifyContent: 'center'}}>
                 <Text style={[styles.text, {width: 280}]}>Use your phone to scan either your UK Passport or UK Driving Licence.</Text>
                </View>
             </View>
             <View style={styles.separator} />
             <View style={styles.row}>
               <Icon name='ios-contact-outline' size={36} color={bankStyle.CONTEXT_BACKGROUND_COLOR} style={styles.icon}/>
               <View style={{justifyContent: 'center'}}>
                 <Text style={[styles.text, {justifyContent: 'center'}]}>Take a ‘selfie’ picture of your face.</Text>
               </View>
             </View>
             <View style={styles.separator} />
             <View style={styles.row}>
               <Icon name='ios-pin-outline' size={40} color={bankStyle.CONTEXT_BACKGROUND_COLOR} style={[styles.icon, {paddingRight: 15}]}/>
               <View style={{justifyContent: 'center'}}>
                 <Text style={[styles.text, {paddingLeft: 3, width: 280}]}>Provide your address.</Text>
               </View>
             </View>
             <View style={styles.separator} />
             <View style={styles.row}>
               <Text style={[styles.text, {paddingLeft: 3, width: screen.width - 40 }]}>By using this service you agree that Aviva can run an identity check using the details you provide and you agree to our Terms of use and privacy policy.</Text>
             </View>
           </View>
           <View style={styles.centeredRow}>
             <TouchableOpacity style={{paddingRight:10}} onPress={() => this.goto(LEARN_MORE_URL)}>
               <Text style={[styles.text, {paddingLeft: 5, paddingTop: 10, color: bankStyle.LINK_COLOR}]}>Learn more  &bull;</Text>
             </TouchableOpacity>
             <TouchableOpacity style={{paddingRight:10}} onPress={() => this.showTerms(avivaTC)}>
               <Text style={[styles.text, {paddingTop: 10, color: bankStyle.LINK_COLOR}]}>Terms of use  &bull;</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={() => this.goto(CONTACT_US_URL)}>
               <Text style={[styles.text, {paddingTop: 10, color: bankStyle.LINK_COLOR, paddingRight: 20}]}>Contact us</Text>
             </TouchableOpacity>
           </View>
           <View style={[styles.centeredRow, { marginBottom: 10 }]}>
             <CustomIcon name="tradle" size={16} style={[styles.icon]} color={bankStyle.CONTEXT_BACKGROUND_COLOR} />
             <Text style={[styles.text]}>Powered by Tradle</Text>
           </View>
         </TouchableOpacity>
       </ScrollView>

    let footer = <TouchableOpacity onPress={()=>{this.showChat(this.props.resource)}}>
                   <View style={styles.start}>
                     <View style={{backgroundColor: 'transparent', justifyContent: 'center'}}>
                       <Text style={{fontSize: 24, color: '#ffffff'}}>Tap to get started</Text>
                     </View>
                   </View>
                 </TouchableOpacity>

    // var bgImage = bankStyle &&  bankStyle.BACKGROUND_IMAGE
    // if (bgImage) {
    //   let {width, height} = utils.dimensions(AvivaIntroView)
    //   let image = { width, height }
    //   return (
    //     <PageView style={platformStyles.container}>
    //       <Image source={{uri: bgImage}}  resizeMode='cover' style={image}>
    //         {content}
    //       </Image>
    //         {footer}
    //     </PageView>
    //   );
    // }
    // else {
      return (
        <PageView style={platformStyles.container}>
          {content}
          {footer}
        </PageView>
      );
    // }
  }
  showChat(provider) {
    let me = utils.getMe()
    var msg = {
      message: translate('customerWaiting', me.firstName),
      _t: CUSTOMER_WAITING,
      from: me,
      to: provider,
      time: new Date().getTime()
    }

    utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg, isWelcome: true}))

    this.props.navigator.push({
      title: provider.name,
      component: MessageList,
      id: 11,
      backButtonTitle: 'Back',
      passProps: {
        resource: provider,
        modelName: MESSAGE,
        currency: this.props.currency,
        bankStyle:  this.props.bankStyle
      }
    })
  }
  showTerms(url) {
    // this.goto('../html/Aviva_TC.html')
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      title: translate('termsAndConditions'),
      passProps: {
        url
      }
    })
    // this.props.navigator.push({
    //   title: translate('Terms of use'),
    //   id: 3,
    //   component: ResourceView,
    //   // titleTextColor: '#7AAAC3',
    //   backButtonTitle: 'Back',
    //   passProps: {resource: termsAndConditions}
    // });
  }
  goto(url) {
    if (Linking) return Linking.openURL(url)

    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      passProps: { url }
    })
  }
}

// AvivaIntroView = makeResponsive(AvivaIntroView)

var styles =  StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 7,
  },
  centeredRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 7
  },
  separator: {
    height: 1,
    alignSelf: 'center',
    backgroundColor: '#eeeeee',
    width: utils.dimensions().width * 0.7
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555555',
    paddingTop: 5,
    paddingVertical: 10
  },
  text: {
    fontSize: 14,
    color: '#757575',
  },
  importantText: {
    fontWeight: '800'
  },
  icon: {
    paddingRight: 10,
    opacity: 0.7
  },
  resourceTitle: {
    fontSize: 18,
    paddingBottom: 15,
    fontWeight: '400',
    color: '#555555',
  },
  start: {
    marginHorizontal: -3,
    marginBottom: -2,
    backgroundColor: '#004db5',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center'
  },
})

module.exports = AvivaIntroView;
