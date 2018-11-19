
const debug = require('debug')('tradle:app:RowMixin')
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import {
  // Text,
  View,
  Alert,
  Platform,
} from 'react-native'
import { coroutine as co } from 'bluebird'

import constants from '@tradle/constants'

import utils, { translate, translateEnum } from '../utils/utils'
import Actions from '../Actions/Actions'
import StyleSheet from '../StyleSheet'
import ENV from '../utils/env'
import IProov from '../utils/iproov'
import { Text } from './Text'
import chatStyles from '../styles/chatStyles'
import Image from './Image'

const SHOW_TIME_INTERVAL = 60000
const DEFAULT_CURRENCY_SYMBOL = '£'
const SENT = 'Sent'

const MY_PRODUCT = 'tradle.MyProduct'
const FORM_ERROR = 'tradle.FormError'

var BORDER_WIDTH = StyleSheet.hairlineWidth
var {
  TYPE,
  ROOT_HASH
} = constants

var {
  MONEY,
  VERIFICATION,
  PROFILE,
  ENUM,
  FORM
} = constants.TYPES

var cnt = 0;

var RowMixin = {
  addDateProp(dateProp, style) {
    let resource = this.state.resource;
    let properties = utils.getModel(resource[TYPE] || resource.id).properties;
    if (properties[dateProp]  &&  properties[dateProp].style)
      style = [style, properties[dateProp].style];
    let val = utils.formatDate(new Date(resource[dateProp]));
    return <Text style={style} key={this.getNextKey()}>{val}</Text>;
  },
  getNextKey() {
    return this.props.resource[ROOT_HASH] + '_' + cnt++
  },
  getPropRow(prop, resource, val, isVerification) {
    let {currency, isAggregation, bankStyle} = this.props
    if (prop.ref) {
      if (prop.ref === MONEY) {
        let CURRENCY_SYMBOL = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
        let c = utils.normalizeCurrencySymbol(val.currency)
        val = (c || CURRENCY_SYMBOL) + val.value
        // val = (val.currency || CURRENCY_SYMBOL) + val.value
      }
      else {
        let m = utils.getModel(prop.ref)
        if (m.subClassOf === ENUM) {
          // let tVal = (typeof val === 'string') && val || val.title
          val = translateEnum(resource[prop.name])
        }
      }
    }
    let model = utils.getModel(resource[TYPE])

    let style = {flexDirection: 'row', justifyContent: 'center'}
    let propTitle = translate(prop, model)
    if (isVerification) {
      if (!isAggregation)
        style = [style, {borderWidth: BORDER_WIDTH, paddingVertical: 3, borderColor: bankStyle.verifiedBg, borderTopColor: '#eeeeee'}]
      let title
      if (!prop.displayName  &&  !prop.displayAs)
        title =  <View style={styles.column}>
                  <Text style={[styles.title, {color: '#333333'}]}>{propTitle}</Text>
                </View>

      return (
        <View style={style} key={this.getNextKey()}>
          {title}
          <View style={styles.column}>
            <Text style={styles.title}>{val + (prop.units &&  prop.units.charAt(0) !== '[' ? ' ' + prop.units : '')}</Text>
          </View>
        </View>
      )
    }
    else {
      let isMyProduct = model.subClassOf === MY_PRODUCT
      let isForm = model.subClassOf === FORM
      let isMyMessage = this.isMyMessage()
      if (!isAggregation  &&  (isMyMessage || isForm) &&  !isMyProduct)
        style = [style, { paddingVertical: 3}]
      let value = val + (prop.units &&  prop.units.charAt(0) !== '[' ? ' ' + prop.units : '')
      let ratio = value.length / propTitle.length
      let flexVal = (propTitle.length > value.length || ratio < 1.2) ? 1 : ratio < 1.5 ? 2 : 3

      // let color =  isMyMessage && !isMyProduct ? {color: '#FFFFEE'} : {color: '#757575'}
      let title
      if (!prop.displayName  &&  !prop.displayAs)
        title =  <View style={[styles.column, {flex: 1}]}>
                  <Text style={[styles.descriptionG]}>{propTitle}</Text>
                </View>
      return (
        <View style={style} key={this.getNextKey()}>
          {title}
          <View style={[styles.column, {paddingLeft: 3, flex: flexVal}]}>
            <Text style={styles.descriptionB}>{value}</Text>
          </View>
       </View>
      )
    }

  },
  getOwnerPhoto(isMyMessage) {
    let { to, resource, application, bankStyle } = this.props
    let toType = utils.getType(to)
    let isContext = utils.isContext(toType)
    let isSharedContext = isContext  &&  utils.isReadOnlyChat(to)
    if (/*Platform.OS !== 'android'  &&*/  !isSharedContext  &&  !application)
      return <View/>

    if (!isContext && (isMyMessage  || !to /* ||  !to.photos*/))
      return <View style={{marginVertical: 0}}/>

    let isVerification  = resource[TYPE] === VERIFICATION
    if (!isMyMessage) {
      let photo = isVerification && resource._verifiedBy  &&  resource._verifiedBy.photo
                ? resource._verifiedBy.photo
                : resource.from.photo
      if  (photo) {
        let uri = utils.getImageUri(photo.url)
        photo = <View style={{paddingRight: 3}}>
                  <Image source={{uri: uri}} resizeMode='contain' style={styles.cellRoundImage} />
                </View>
        return photo
      }
      // return isContext
      //      ? <TouchableHighlight underlayColor='transparent' onPress={this.props.switchChat.bind(this)}>
      //          {photo}
      //        </TouchableHighlight>
      //      : photo
    }
    if (to.photos) {
      let uri = utils.getImageUri(to.photos[0].url);
      return <Image source={{uri: uri}} style={styles.msgImage} />
    }
    if (!isMyMessage) {
      let title = resource.from.title  && resource.from.title.split(' ').map((s) => s.charAt(0) === '[' ? '' : s.charAt(0)).join('')
      if (!title)
        title = 'U'  // for UNKNOWN
      return <View style={{paddingRight: 3}}>
               <View style={[{backgroundColor: bankStyle.linkColor}, styles.cellRoundImage]}>
                 <Text style={styles.cellText}>{title}</Text>
               </View>
             </View>
    }
  },
  getTime(resource) {
    if (!resource._time)
      return
    let { isAggregation, previousMessageTime } = this.props
    let showTime = !previousMessageTime  ||  isAggregation;

    if (!showTime)  {
      let prevDate = new Date(previousMessageTime);
      let curDate = new Date(resource._time);
      showTime = resource._time - previousMessageTime > SHOW_TIME_INTERVAL ||
                 prevDate.getDate()  !== curDate.getDate()    ||
                 prevDate.getMonth() !== curDate.getMonth()   ||
                 prevDate.getYear()  !== curDate.getYear()
    }

    if (showTime)
      return utils.formatDate(resource._time);
  },
  getChatDate(resource) {
    let val = this.getTime(resource);
    return val  && <Text style={chatStyles.date}>{val}</Text>
  },
  isMyMessage(to) {
    let { resource, isAggregation, application } = this.props
    if (isAggregation)
      return
    if (application)
      return false
    if (utils.getModel(resource[TYPE]).subClassOf == MY_PRODUCT) {
      let org = resource.from.organization
      if (org  &&  utils.getId(resource.from.organization) !== utils.getId(this.props.to))
        return true
    }
    return utils.isMyMessage({resource, to})
    // if (r._inbound)
    //   return false
    // if (r._outbound)
    //   return true
    // let fromId = utils.getId(r.from);
    // let toId = utils.getId(r.to);
    // let me = utils.getMe()
    // let meId = utils.getId(me)
    // if (fromId === meId)
    //   return true;
    // if (toId === meId)
    //   return false

    // if (me.isEmployee) {
    //   if (r.from.organization  &&  me.organization.id !== r.from.organization.id)
    //     return false
    //   if (r._context) {
    //     // check if the employee is the applicant
    //     let cFrom = r._context.from
    //     if (utils.getId(cFrom) === meId)
    //       return true
    //     if (cFrom.organization) {
    //       if (cFrom.organization.id === me.organization.id)
    //         return utils.getId(r._context.to) !== meId
    //     }
    //   }
    //   let myOrgId = utils.getId(me.organization)
    //   // bot -> bot
    //   if (r.from.organization  &&
    //       r.to.organization    &&
    //       r.from.organization.id === r.to.organization.id  &&
    //       r.from.organization.id === myOrgId) {
    //     return false
    //   }

    //   if (r.from.organization) {
    //     if (myOrgId === utils.getId(r.from.organization)) {
    //       if (to  &&  utils.getId(to) === myOrgId)
    //         return false
    //       else
    //         return true
    //     }
    //   }
    //   if (r._context) {
    //     if (r._context.from) {
    //       let fOrg = r._context.from.organization
    //       let applier = fOrg  &&  utils.getId(fOrg) === utils.getId(me.organization)
    //       if (applier  &&  fOrg === utils.getId(r.from.organization))
    //         return true
    //     }
    //   }
    // }
  },
  isShared() {
    let { resource, to, application } = this.props
    if (application)
      return false
    // Is resource was originally created in this chat or shared from a different chat
    // if (!resource.organization  ||  (this.props.context  &&  this.props.context._readOnly))
    if (/*!resource.organization  || */ utils.isReadOnlyChat(resource))
      return false
    let toType = utils.getType(to)
    if (toType === PROFILE)
      return false
    let me = utils.getMe()
    if (utils.isContext(toType)  &&  utils.isReadOnlyChat(to)) {
      if (utils.getId(resource.from) === utils.getId(me))
        return false
    }
    return resource.organization  &&  utils.getId(resource.organization) !== utils.getId(to)
  },
  getSendStatus() {
    let { resource } = this.props
    let sendStatus = resource._sendStatus
    if (!sendStatus)
      return <View />
    let icon, msg
    if (sendStatus === SENT) {
      icon = <Icon name={'md-done-all'} size={15} color={this.props.bankStyle.messageSentStatus || '#009900'} />
      if (resource._sentTime)
        msg = <Text style={styles.sentStatus}>{utils.formatDate(resource._sentTime)}</Text>
    }
    else
      msg = <Text style={styles.sentStatus}>{translate(sendStatus)}</Text>

    let routes = this.props.navigator.getCurrentRoutes()
    let msgWidth = utils.getMessageWidth(routes[routes.length - 1].component)

    let isMyMessage = this.isMyMessage();
    let isShared = !isMyMessage  &&  this.isShared()

    let view = <View style={styles.sendStatus}>
                 {msg}
                 {icon}
               </View>
    if (isMyMessage  ||  isShared)
      return view
    return <View style={{width: msgWidth}}>
             {view}
           </View>
  },

  onSetMediaProperty(propName, item) {
    if (!item)
      return;

    let r = this.props.resource
    let isFormError = r[TYPE] === FORM_ERROR
    Actions.addChatItem({
      disableFormRequest: r,
      resource: {
        [TYPE]: isFormError ? r.prefill[TYPE] : r.form,
        [propName]: item,
        _context: r._context,
        from: utils.getMe(),
        to: r.from
      }
    })
  },

  showIproovScanner: co(function* () {
    const apiKey = ENV.iProov && Platform.select(ENV.iProov.apiKey)
    if (!apiKey) {
      return Alert.alert('IProov is not set up')
    }

    const me = utils.getMe()
    const opts = {
      username: me[ROOT_HASH],
      serviceProvider: apiKey,
      animated: true
    }

    const enroll = !me.iproovEnrolled
    let result
    try {
      if (enroll) {
        result = yield IProov.enroll(opts)
      } else {
        result = yield IProov.verify(opts)
      }
    } catch (err) {
      debug('experienced iProov error', err.code, err.name)
      Alert.alert(translate('iproovErrorTitle'), translate('iproovErrorMessage'))
      return
    }

    const { success, token, reason } = result
    if (!success) {
      debug('iProov failed', reason)
      Alert.alert(translate('iproovFailedTitle'), translate('iproovFailedMessage'))
      return
    }

    debug('iProov succeeded!')
    if (enroll) {
      Actions.updateMe({ iproovEnrolled: true })
    }

    const r = this.props.resource
    r.token = token

    let isFormError = r[TYPE] === FORM_ERROR
    Actions.addChatItem({
      disableFormRequest: r,
      resource: {
        [TYPE]: isFormError ? r.prefill[TYPE] : r.form,
        token: token,
        enroll: enroll,
        from: r.to,
        to: r.from,
        _context: r._context
      }
    })
  }),
  getContextId(resource) {
    if (ENV.paintContextIds) {
      if (resource._context  &&  resource._context.contextId)
        return <Text style={{fontSize: 16, color:'red'}}>{resource._context.contextId}</Text>
    }
  },
  chooseToShare() {
    let resource = this.props.resource
    let id = utils.getId(resource)
    if (this.state.isChosen) {
      this.setState({isChosen: false})
      delete this.props.chosen[id]
    }
    else {
      this.setState({isChosen: true})
      this.props.chosen[id] = resource
    }
  },
  getEnumID(id) {
    return id.split('_')[1]
  }
}

var styles = StyleSheet.create({
  title: {
    fontSize: 17,
    color: '#757575'
  },
  descriptionG: {
    fontSize: 17,
    justifyContent: 'center',
    color: '#aaaaaa',
    marginTop: 1
  },
  descriptionB: {
    fontSize: 17,
    color: '#757575'
  },
  msgImage: {
    // backgroundColor: '#dddddd',
    height: 40,
    marginRight: 3,
    marginLeft: 0,
    width: 40,
    borderRadius: 15,
    borderColor: '#cccccc',
    borderWidth: BORDER_WIDTH
  },
  cellText: {
    marginTop: 8,
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 18,
    backgroundColor: 'transparent'
  },
  cellRoundImage: {
    paddingVertical: 1,
    borderRadius: 20,
    height: 40,
    width: 40,
    alignSelf: 'center'
  },
  column: {
    flex: 1,
    flexDirection: 'column'
  },
  sentStatus: {
    fontSize: 12,
    color: '#757575',
    marginRight: 3
  },
  sendStatus: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginHorizontal: 5,
    marginTop: -2
  },
});

module.exports = RowMixin;

  // onSetSignatureProperty(prop, item) {
  //   if (!item)
  //     return;

  //   let resource = this.props.resource

  //   let formRequest
  //   if (resource[TYPE] === FORM_REQUEST) {
  //     formRequest = resource
  //     resource = formRequest.prefill  ||  {}
  //   }
  //   // Form request for new resource
  //   if (formRequest)
  //     _.extend(resource, {
  //         [TYPE]: formRequest.form,
  //         _context: formRequest._context,
  //         from: utils.getMe(),
  //         to: formRequest.from
  //       }
  //     )
  //   resource[prop.name] = item
  //   let params = {resource}
  //   if (formRequest)
  //     params.disableFormRequest = formRequest
  //   Actions.addChatItem(params)
  // },
