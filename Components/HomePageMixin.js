
import React from 'react'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  Alert,
  StatusBar,
  TouchableOpacity,
  View,
  Platform
} from 'react-native'

import constants from '@tradle/constants'

import utils, { translate } from '../utils/utils'
import { getGridCols } from '../utils/uiUtils'
import Actions from '../Actions/Actions'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import GridHeader from './GridHeader'
import buttonStyles from '../styles/buttonStyles'

const {
  TYPE
} = constants
const {
  ORGANIZATION,
  MESSAGE,
} = constants.TYPES

const APPLICATION = 'tradle.Application'
const PHOTO = 'tradle.Photo'
const ASSIGN_RM = 'tradle.AssignRelationshipManager'

var HomePageMixin = {
  scanFormsQRCode(opts) {
    return new Promise((resolve, reject) => {
      this.setState({hideMode: false})
      let title = translate('scanQRcode')
      if (opts)
        title = `${title} -- ${translate(opts)}`
      this.props.navigator.push({
        title,
        componentName: 'QRCodeScanner',
        backButtonTitle: 'Cancel',
        // rightButtonTitle: 'ion|ios-reverse-camera',
        passProps: {
          onread: async (result) => {
            try {
              resolve(JSON.parse(result.data))
            } catch (err) {
              reject(err)
            } finally {
              this.props.navigator.pop()
            }
          }
        }
      })
    })
  },

  onUnknownQRCode() {
    Alert.alert(
      translate('error'),
      translate('unknownQRCodeFormat')
    )
    this.props.navigator.pop()
  },

  mergeStyle(newStyle) {
    let style = {}
    _.extend(style, defaultBankStyle)
    return newStyle ? _.extend(style, newStyle) : style
  },
  showChat(params) {
    if (!params.to)
      return
    let style = this.mergeStyle(params.to.style)

    var route = {
      title: params.to.name,
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      passProps: {
        resource: params.to,
        filter: '',
        modelName: MESSAGE,
        noLoadingIndicator: true,
        currency: params.to.currency,
        bankStyle:  style,
        dictionary: params.dictionary,
      }
    }
    // this.props.navigator.push(route)
    this.props.navigator.replace(route)
  },
  showBanks() {
    this.props.navigator.push({
      title: translate('officialAccounts'),
      componentName: 'ResourceList',
      backButtonTitle: 'Back',
      passProps: {
        officialAccounts: true,
        serverOffline: this.state.serverOffline,
        bankStyle: this.state.bankStyle  ||  this.props.bankStyle,
        modelName: ORGANIZATION
      }
    })
  },
  showTourOrSplash({resource, showProfile, termsAccepted, action, callback, style}) {
    let { navigator, bankStyle } = this.props
    if (resource._tour  &&  !resource._noTour) {
      StatusBar.setHidden(true)
      navigator.push({
        title: "",
        componentName: 'TourPage',
        backButtonTitle: null,
        // backButtonTitle: __DEV__ ? 'Back' : null,
        passProps: {
          bankStyle: style || bankStyle,
          noTransitions: true,
          customStyles: {
            nextButtonText: {
              fontSize: 23,
              fontWeight: 'bold',
              fontFamily: 'Arial',
            },

          },
          tour: resource._tour,
          callback: () => {
            resource._noTour = true
            resource._noSplash = true
            Actions.addItem({resource: resource})
            // resource._noSplash = true
            callback({resource, termsAccepted, action: 'replace', showProfile})
          }
        }
      })
      return true
    }
    if (resource._noSplash)
      return
    StatusBar.setHidden(true)
    let splashscreen = resource.style  &&  resource.style.splashscreen
    if (!splashscreen)
      return
    let resolvePromise
    let promise = new Promise(resolve => {
      navigator.push({
        title: "",
        componentName: 'SplashPage',
        backButtonTitle: null,
        passProps: {
          splashscreen: splashscreen
        }
      })
      resolvePromise = resolve
    })
    // return
    setTimeout(() => {
      resolvePromise()
      resource._noSplash = true
      Actions.addItem({resource: resource})
      callback({resource, termsAccepted, action: 'replace', showProfile})
    }, 2000)
    return true
  },
  showProfile(navigator, action, importingData) {
    if (importingData) {
      // this.props.navigator.pop()
      // this.props.navigator.pop()
      let len = navigator.getCurrentRoutes().length
      navigator.popN(len - 2)
      return
    }
    let me = utils.getMe()
    let title = translate('profile')
    let m = utils.getModel(me[TYPE])

    navigator[action || 'push']({
      title: title,
      componentName: 'ResourceView',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Edit',
      onRightButtonPress: {
        title: title,
        componentName: 'NewResource',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Done',
        passProps: {
          model: m,
          resource: me,
          bankStyle: defaultBankStyle
        }
      },
      passProps: {
        resource: me,
        backlink: m.properties.myForms,
        bankStyle: defaultBankStyle
      }
    })
  },

  renderGridHeader() {
    let { modelName, navigator, multiChooser, bookmark, isBacklink } = this.props
    if ((modelName === APPLICATION  &&  bookmark && !bookmark.grid) || isBacklink)
      return
    let gridCols = getGridCols(modelName)
    if (!gridCols)
      return
    let notSortable
    if (modelName === MESSAGE) {
      let idx = gridCols.indexOf('_time')
      if (idx !== -1)
        notSortable = gridCols.slice(0, idx)
      if (idx !== gridCols.length - 1)
        notSortable = notSortable.concat(gridCols.slice(idx + 1))
    }
    let { order, sortProperty } = this.state
    return (
      <GridHeader sortProperty={sortProperty} order={order} gridCols={gridCols} multiChooser={multiChooser} checkAll={multiChooser  &&  this.checkAll.bind(this)} modelName={modelName} navigator={navigator} sort={this.sort.bind(this)} notSortable={notSortable}/>
    )
  },
  checkAll() {
    let chosen = {}
    let check = utils.isEmpty(this.state.chosen)
    if (check  &&  this.props.list)
      this.props.list.forEach((r) => {
        chosen[utils.getId(r)] = r
      })
    this.setState({chosen: chosen})
  },
  sort(prop) {
    let order = this.state.order || {}
    let curOrder = order[prop]
    let { resource } = this.state

    const { modelName, bookmark, search } = this.props

    order[prop] = curOrder ? false : true
    this.setState({order, sortProperty: prop, list: []})

    let params = { modelName, sortProperty: prop, asc: order[prop], bookmark}
    if (search) {
console.log('HomePageMixin: filterResource', resource)
      _.extend(params, {search: true, filterResource: resource, limit: this.limit, first: true})
    }
    Actions.list(params)
  },
  showRefResources({resource, prop, component}) {
    let rType = utils.getType(resource)
    let props = utils.getModel(rType).properties
    let propJson = props[prop]
    let resourceTitle = utils.getDisplayName({ resource })
    resourceTitle = utils.makeTitle(resourceTitle)

    let backlinksTitle = propJson.title + ' - ' + resourceTitle
    backlinksTitle = utils.makeTitle(backlinksTitle)
    let modelName = propJson.items.ref
    let { style, currency, navigator, allowedMimeTypes } = this.props
    navigator.push({
      title: backlinksTitle,
      component,
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        prop: prop,
        bankStyle: style,
        modelName: modelName
      },
      rightButtonTitle: translate('details'),
      onRightButtonPress: {
        title: resourceTitle,
        componentName: 'ResourceView',
        backButtonTitle: 'Back',
        rightButtonTitle: 'Edit',
        onRightButtonPress: {
          title: resourceTitle,
          componentName: 'NewResource',
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: utils.getModel(rType),
            bankStyle: style,
            resource,
            allowedMimeTypes
          }
        },
        passProps: {
          bankStyle: style,
          resource,
          currency,
        }
      }
    })
  },
  assignRM(resource) {
    // let resource = this.state.resource || this.props.resource
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
              id: utils.makeId('tradle.Identity', utils.getRootHash(me))
            },
            application: resource,
            _context: resource._context,
            from: me,
            to: resource.to
          }
          Actions.addChatItem({resource: msg})
          this.setState({hasRM: true})
          Actions.showModal({title: translate('inProgress'), showIndicator: true})
        }}
      ]
    )
  },
  openModal() {
    this.setState({isModalOpen: true});
  },
  closeModal() {
    this.setState({isModalOpen: false});
  },
  addHomeButton() {
    let { bankStyle, navigator } = this.props
    if (!__DEV__ || !bankStyle) return
    let routes = navigator.getCurrentRoutes()
    let style = {alignSelf: 'flex-start', paddingRight: Platform.OS === 'android' ? 0 : 10, paddingBottom: 15, paddingLeft: 10}
    return <TouchableOpacity onPress={() => {navigator.jumpTo(routes[1])}} style={style}>
             <View style={buttonStyles.homeButton}>
               <Icon name='ios-home' color={bankStyle.linkColor} size={33}/>
             </View>
           </TouchableOpacity>
  }
}

module.exports = HomePageMixin
/*
  async onread(params, result) {
    let {isView, callback, prop} = params
    // HACK
    // if (result.data.indexOf('10;') === 0) {
    //   let parts = result.data.split(';')
    //   Actions.getIdentity({ hash: parts[1], name: parts[2] })
    //   this.props.navigator.pop()
    //   callback(prop, {
    //      id: utils.makeId(IDENTITY, parts[1]),
    //      title: parts[2]
    //   })
    //   return
    // }
    try {
      result = qrCodeDecoder.fromHex(result.data)
    } catch (err) {
      debug('failed to parse qrcode', result.data)
      this.onUnknownQRCode()
      return
    }

    const { schema, data } = result
    // post to server request for the forms that were filled on the web
    let me = utils.getMe()
    switch (schema) {
    case 'Profile':
      Actions.getIdentity(data)
      this.props.navigator.pop()
      callback(null, {
         id: utils.makeId(IDENTITY, data.permalink),
         title: data.firstName
      })
      break
    case 'ImportData':
      let r = {
        _t: 'tradle.DataClaim',
        claimId: data.dataHash,
        from: {
          id: utils.getId(me),
          title: utils.getDisplayName(me)
        },
        to: {
          id: utils.makeId(PROFILE, data.provider)
        }
      }
      Actions.addChatItem({
        resource: r,
        value: r,
        provider: {
          url: data.host,
          hash: data.provider
        },
        meta: utils.getModel(DATA_CLAIM),
        disableAutoResponse: true})
      break
    // case TALK_TO_EMPLOYEEE:
    //   Actions.getEmployeeInfo(data.substring(code.length + 1))
    //   break
    case 'AddProvider':
      Actions.addApp({ url: data.host, permalink: data.provider })
      break
    case 'ApplyForProduct':
      Actions.applyForProduct(data)
      break
    default:
      // keep scanning
      this.onUnknownQRCode()
      break
    }
  },
*/
