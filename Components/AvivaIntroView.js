import utils from '../utils/utils'
var translate = utils.translate
import PageView from './PageView'
import Icon from 'react-native-vector-icons/Ionicons';
// import ResourceMixin from './ResourceMixin'
// import MessageList from './MessageList'
// import ResourceView from './ResourceView'
import StyleSheet from '../StyleSheet'
import ArticleView from './ArticleView'
// import termsAndConditions from '../termsAndConditions.json'
import CustomIcon from '../styles/customicons'
import platformStyles from '../styles/platform'
// import { makeResponsive } from 'react-native-orient'

// const CUSTOMER_WAITING = 'tradle.CustomerWaiting'
// const MESSAGE = 'tradle.Message'
const LEARN_MORE_URL = 'https://www.fca.org.uk/news/press-releases/financial-conduct-authority-unveils-successful-sandbox-firms-second-anniversary'// 'https://www.aviva.com/tradle/learnmore'

// const LEARN_MORE_URL = 'https://www.aviva.com/tradle/learnmore'
// const CONTACT_US_ADDRESS = 'tradlesupport@aviva.com'

import {
  // StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform
} from 'react-native'
// import PropTypes from 'prop-types'

import React, { Component } from 'react'

const avivaTC = Platform.OS === 'android'
  ? { uri: 'file:///android_asset/Aviva_TC.html' }
  : require('../html/Aviva_TC.html')

const avivaContact = Platform.OS === 'android'
  ? { uri: 'file:///android_asset/Aviva_Contact.html' }
  : require('../html/Aviva_Contact.html')

class AvivaIntroView extends Component {
  static displayName = 'AvivaIntroView';
  static orientation = 'portrait';
  static backButtonDisabled = !__DEV__;
  render() {
    const screen = utils.dimensions(AvivaIntroView)
    var bankStyle = this.props.bankStyle
    const me = utils.getMe()
    const onPressTerms = me && me._termsAccepted
      ? this.showHtml.bind(this, avivaTC, 'termsAndConditions')
      : this.showChat.bind(this, this.props.provider)

    let content = <ScrollView style={{paddingTop: 20, paddingBottom: 40, backgroundColor: '#ffffff'}}>
        <TouchableOpacity onPress={()=>{this.showChat(this.props.resource)}}>
           <View style={{paddingHorizontal: 15, backgroundColor: '#ffffff'}}>
             <Text style={styles.resourceTitle}>Welcome to Aviva ID, our online verification service.</Text>
             <Text style={[styles.subTitle, styles.importantText]}>Keeping your money and identity safe is our number 1 priority!</Text>
             <Text style={styles.subTitle}>To use this service you’ll undertake 4 easy steps:</Text>
             <View style={styles.row}>
               <Icon name='ios-mail-outline' size={40} color={bankStyle.contextBackgroundColor} style={styles.icon}/>
               <View style={{justifyContent: 'center'}}>
                 <Text style={styles.text}>Provide your email address.</Text>
               </View>
             </View>
             <View style={styles.separator} />
             <View style={{flexDirection: 'row', paddingVertical: 7}}>
               <Icon name='ios-camera-outline' size={40} color={bankStyle.contextBackgroundColor} style={styles.icon}/>
               <View style={{justifyContent: 'center'}}>
                 <Text style={[styles.text, {width: 280}]}>Use your phone to scan either your UK Passport or UK Driving Licence.</Text>
                </View>
             </View>
             <View style={styles.separator} />
             <View style={styles.row}>
               <Icon name='ios-contact-outline' size={36} color={bankStyle.contextBackgroundColor} style={styles.icon}/>
               <View style={{justifyContent: 'center'}}>
                 <Text style={[styles.text, {justifyContent: 'center'}]}>Take a ‘selfie’ picture of your face.</Text>
               </View>
             </View>
             <View style={styles.separator} />
             <View style={styles.row}>
               <Icon name='ios-pin-outline' size={40} color={bankStyle.contextBackgroundColor} style={[styles.icon, {paddingRight: 15}]}/>
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
               <Text style={[styles.text, {paddingLeft: 5, paddingTop: 10, color: bankStyle.linkColor}]}>Learn more  &bull;</Text>
             </TouchableOpacity>
             <TouchableOpacity style={{paddingRight:10}} onPress={onPressTerms}>
               <Text style={[styles.text, {paddingTop: 10, color: bankStyle.linkColor}]}>Terms of use  &bull;</Text>
             </TouchableOpacity>
             <TouchableOpacity style={{paddingRight:10}} onPress={() => this.showHtml(avivaContact, 'contactUs')}>
               <Text style={[styles.text, {paddingTop: 10, color: bankStyle.linkColor, paddingRight: 20}]}>Contact us</Text>
             </TouchableOpacity>
           </View>
           <View style={[styles.centeredRow, { marginBottom: 10 }]}>
             <CustomIcon name="tradle" size={16} style={[styles.icon]} color={bankStyle.contextBackgroundColor} />
             <Text style={[styles.text]}>Powered by Tradle</Text>
           </View>
         </TouchableOpacity>
       </ScrollView>

    let footer = <TouchableOpacity onPress={()=>{this.showChat(this.props.resource)}}>
                   <View style={styles.start}>
                     <View style={{backgroundColor: 'transparent', justifyContent: 'center'}}>
                       <Text style={{fontSize: 20, color: '#ffffff'}}>Tap to get started</Text>
                     </View>
                   </View>
                 </TouchableOpacity>

    return (
      <PageView style={platformStyles.container}>
        {content}
        {footer}
      </PageView>
    );
  }
  showChat(provider) {
    let me = utils.getMe()
    if (me  &&  !me._termsAccepted) {
      this.showTerms()
      return
    }
    this.props.showChat(provider, true)
    // return
    // var msg = {
    //   message: translate('customerWaiting', me.firstName),
    //   _t: CUSTOMER_WAITING,
    //   from: me,
    //   to: provider,
    //   time: new Date().getTime()
    // }

    // utils.onNextTransitionEnd(this.props.navigator, () => Actions.addMessage({msg: msg, isWelcome: true}))
    // this.props.navigator.push({
    //   title: provider.name,
    //   component: MessageList,
    //   id: 11,
    //   backButtonTitle: 'Back',
    //   passProps: {
    //     resource: provider,
    //     modelName: MESSAGE,
    //     currency: this.props.currency,
    //     bankStyle:  this.props.bankStyle
    //   }
    // })
  }
  showTerms() {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      title: translate('termsAndConditions'),
      passProps: {
        bankStyle: this.props.bankStyle,
        action: this.props.acceptTermsAndChat.bind(this, this.props.resource, this.props.url),
        url: avivaTC,
        actionBarTitle: 'Accept and continue'
      }
    })
  }
  showHtml(url, title) {
    // this.goto('../html/Aviva_TC.html')
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      title: translate(title),
      passProps: {
        url,
        bankStyle: this.props.bankStyle
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
