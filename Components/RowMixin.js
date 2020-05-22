import uniqBy from 'lodash/uniqBy'
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
var {
  TYPE,
  ROOT_HASH
} = constants

var {
  MONEY,
  VERIFICATION,
  PROFILE,
} = constants.TYPES

import CustomIcon from '../styles/customicons'
import CameraView from './CameraView'
import utils, { translate, translateEnum } from '../utils/utils'
import Actions from '../Actions/Actions'
import StyleSheet from '../StyleSheet'
import ENV from '../utils/env'
import IProov from '../utils/iproov'
import { Text } from './Text'
import chatStyles from '../styles/chatStyles'
import Image from './Image'

const SHOW_TIME_INTERVAL = 60000
const DEFAULT_CURRENCY_SYMBOL = '$'
const SENT = 'Sent'

const FORM_ERROR = 'tradle.FormError'
var cnt = 0;

var BORDER_WIDTH = StyleSheet.hairlineWidth

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
    let { currency, isAggregation, bankStyle, locale } = this.props
    if (prop.ref) {
      if (prop.ref === MONEY) {
        if (currency && locale) {
          if (!val.currency)
            val = {...val, currency }
          val = utils.formatCurrency({...val, currency })
          // let currencyName = this.getCurrencyName(currency)
          // val = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyName }).format(val.value)
        }
        else {
          let CURRENCY_SYMBOL = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
          let c = utils.normalizeCurrencySymbol(val.currency)
          val = (c || CURRENCY_SYMBOL) + val.value
        }
      }
      else {
        let m = utils.getModel(prop.ref)
        if (utils.isEnum(m))
          val = translateEnum(resource[prop.name])
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
    let isMyProduct = utils.isMyProduct(model)
    let isForm = utils.isForm(model)
    let isMyMessage = this.isMyMessage()
    if (!isAggregation  &&  (isMyMessage || isForm) &&  !isMyProduct)
      style = [style, { paddingVertical: 3}]
    let value = val + (prop.units &&  prop.units.charAt(0) !== '[' ? ' ' + prop.units : '')
    let ratio = value.length / propTitle.length
    let flexVal = (propTitle.length > value.length || ratio < 1.2) ? 1 : ratio < 1.5 ? 2 : 3

    let title
    style = {flexDirection: 'column'}

    if (!prop.displayName  &&  !prop.displayAs)
      title =  <Text style={styles.descriptionG}>{propTitle}</Text>
    return (
      <View style={style} key={this.getNextKey()}>
        <Text>
         {title}
         <Text style={[styles.descriptionB, {color: bankStyle.textColor}]}>{(title &&  '  ' || '') + value}</Text>
       </Text>
     </View>
    )
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
    if (utils.isMyProduct(resource[TYPE])) {
      let org = resource.from.organization
      if (org  &&  utils.getId(resource.from.organization) !== utils.getId(this.props.to))
        return true
    }
    return utils.isMyMessage({resource, to})
  },
  isShared() {
    let { resource, to, application, context } = this.props
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
    if (resource.organization  &&  utils.getId(resource.organization) !== utils.getId(to))
      return true
    if (!resource._sharedWith  ||  !context)
      return false
    return resource._sharedWith.findIndex(r => r.contextId === context.contextId) > 0
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
  getProgress(resource) {
    let { status, forms, submittedFormTypesCount, maxFormTypesCount, requestFor } = resource

    if (status === 'approved' || status === 'completed')
      return 1
    if (submittedFormTypesCount  &&  maxFormTypesCount)
      return submittedFormTypesCount / maxFormTypesCount
    if (!forms)
      return 0
    let formTypes = uniqBy(forms.map(item => utils.getType(item)))
    let m = utils.getModel(requestFor)
    return formTypes.length / m.forms.length
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
  }
}

var styles = StyleSheet.create({
  title: {
    fontSize: 17,
    color: '#757575'
  },
  descriptionG: {
    fontSize: 15,
    justifyContent: 'center',
    color: '#aaaaaa',
    // marginTop: 1
  },
  descriptionB: {
    fontSize: 15,
    color: '#757575',
    fontWeight: '500'
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
