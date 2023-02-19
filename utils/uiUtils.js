import React from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native'

import constants from '@tradle/constants'
import extend from 'lodash/extend'

var { TYPE } = constants
import { translate, getModel, isMyProduct, ungroup, getMe,
         styleFactory, getDisplayName, makeModelTitle } from '../utils/utils'

import Store from '../Store/Store'
// import GridList from '../Components/GridList'
// import NewResource from '../Components/NewResource'
import PhotoList from '../Components/PhotoList'
import NetworkInfoProvider from '../Components/NetworkInfoProvider'
import PageView from '../Components/PageView'
import chatStyles from '../styles/chatStyles'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import Actions from '../Actions/Actions'

const PHOTO = 'tradle.Photo'
const APPLICATION = 'tradle.Application'
const FORM_REQUEST = 'tradle.FormRequest'

const GRID_LIST = 'GridList'
const APPLICATIONS_GRID = 'ApplicationsGrid'
const NEW_RESOURCE = 'NewResource'
const PRODUCT_LIST = 'tradle.ProductList'

var component

var uiUtils = {
  showBookmarks(params) {
    let { resource, navigator, bankStyle, currency, searchFunction } = params
    let btype = resource.bookmark[TYPE]
    let bm = getModel(btype)

    if (btype === PRODUCT_LIST) {
      Actions.getProductList({resource: getMe().organization, linkToApply: true})
      return
    }

    let route = {
      title: translate('searchSomething', translate(bm)),
      backButtonTitle: 'Back',
      componentName: btype === APPLICATION && resource.grid ? APPLICATIONS_GRID : GRID_LIST,
      passProps: {
        modelName: btype,
        bookmark: resource,
        resource: resource.bookmark,
        bankStyle: bankStyle,
        currency: currency,
        limit: 20,
        search: true,
        exploreData: true
      },
    }
    // if (!uiUtils.hasFilter(resource.bookmark, bm.properties)) {
      extend(route, {
        rightButtonTitle: 'Search',
        onRightButtonPress: {
          title: translate('searchSomething', translate(bm)),
          componentName: NEW_RESOURCE,
          backButtonTitle: 'Back',
          rightButtonTitle: 'Done',
          passProps: {
            model: Store.getAugmentedModel(bm),
            resource: {[TYPE]: bm.id},
            bookmark: resource,
            searchWithFilter: searchFunction  &&  searchFunction.bind(this),
            search: true,
            exploreData: true,
            bankStyle: bankStyle || defaultBankStyle,
          }
        }
      })
    // }
    navigator.push(route)
  },
  hasFilter(bookmark, props) {
    for (let p in bookmark) {
      if (p.charAt(0) !== '_'  &&  props[p])
        return true
    }
  },

  showLoading(params) {
    // let { message } = params
    // Actions.showModal({title: message || translate('inProgress'), showIndicator: true})
    // setTimeout(() => Actions.hideModal(), 1000)
    // return
    if (!params.component)
      return
    let { component, style, message, bankStyle, isConnected, resource } = params
    if (!style)
      style = {}
    let contentSeparator = uiUtils.getContentSeparator(bankStyle)

    let styles = createStyles({bankStyle})

    let network
    if (resource  &&  params.hasOwnProperty('isConnected'))
       network = <NetworkInfoProvider connected={isConnected} resource={resource} />
    return (
      <PageView style={[styles.container, style, styles.centerContent]} separator={contentSeparator} bankStyle={bankStyle} >
        <View style={styles.loadingIndicator}>
          <View style={styles.loadingContent}>
            {network}
            <Text style={styles.loading}>{message || translate('inProgress')}</Text>
            <ActivityIndicator size='large' style={styles.indicator} />
          </View>
        </View>
      </PageView>
    )
  },
  parseMessage(params) {
    let { resource, message, bankStyle, noLink, idx } = params
    let i1 = message.indexOf('**')
    if (i1 === -1)
      return translate(message)
    let formType = message.substring(i1 + 2)
    let i2 = formType.indexOf('**')
    let linkColor = noLink ? '#757575' : bankStyle.linkColor
    let message1, message2
    let formTitle
    if (i2 !== -1) {
      message1 = message.substring(0, i1).trim()
      message2 = i2 + 2 === formType.length ? '' : formType.substring(i2 + 2)
      formType = formType.substring(0, i2)
      if (resource[TYPE] === FORM_REQUEST) {
        let formModel = getModel(resource.form)
        if (isMyProduct(formModel))
          linkColor = '#aaaaaa'
        let title = makeModelTitle(formModel)
        if (formType === title)
          formTitle = translate(formModel)
      }
    }
    if (!formTitle)
      formTitle = translate(formType)
    let key = getDisplayName({ resource }).replace(' ', '_') + (idx || 0)
    idx = idx ? ++idx : 1
    let newParams = extend({}, params)
    newParams.idx = idx
    newParams.message = message2.trim()
    let msg = `${uiUtils.parseMessage(newParams)}`
    let trMsg = translate(message1)
    return <Text key={key} style={[chatStyles.resourceTitle, {color: bankStyle.incomingMessageOpaqueTextColor}]}>{`${translate(message1)} `}
             <Text style={{color: linkColor}}>{formTitle}</Text>
             <Text>{msg}</Text>
           </Text>
  },
  getMarkdownStyles(bankStyle, isItalic, isMyMessage, isChat) {
    const markdownStyles = {
      heading1: {
        fontSize: 24,
        color: 'purple',
      },
      link: {
        color: isMyMessage? 'lightblue' : bankStyle  &&  bankStyle.linkColor || '#555555',
        textDecorationLine: 'none'
      },
      mailTo: {
        color: 'orange',
      },
      text: {
        color: isMyMessage ? '#ffffff' : '#757575',
        fontSize: isChat ? 16 : 14,
        fontStyle: isItalic  &&  'italic' || 'normal'
      },
    }
    return markdownStyles
  },
  getContentSeparator(bankStyle) {
    let separator = {}
    if (bankStyle) {
      if (bankStyle.navBarBorderColor) {
        separator.borderBottomColor = bankStyle.navBarBorderColor
        separator.borderBottomWidth = bankStyle.navBarBorderWidth ||  StyleSheet.hairlineWidth
      }
    }
    return separator
  },
  getGridCols(model) {
    if (typeof model === 'string')
      model = getModel(model)
    let props = model.properties
    let hasGridCols = model.gridCols != null
    let gridCols = hasGridCols  &&  model.gridCols || model.viewCols
    if (!gridCols)
      return
    let vCols = []
    gridCols.forEach((v) => {
      if (!props[v].list             &&
           props[v].range !== 'json' &&
           props[v].range !== 'url'  &&
           (props[v].ref !== PHOTO)) //   &&  !hasGridCols))
        vCols.push(v)
      else if (v.indexOf('_group') !== -1) {
        let group = ungroup({model, viewCols: [v]})
        group.forEach(p => vCols.push(p))
      }
    })
    // if (vCols.length === 7)
    //   vCols.splice(6, 1)
    return vCols
  },
}
var createStyles = styleFactory(component || PhotoList, function ({ dimensions, bankStyle, indent, isView }) {
  return StyleSheet.create({
    loadingIndicator: {
      alignSelf: 'center',
      height: 200
    },
    container: {
      flex: 1
    },
    loading: {
      fontSize: 20,
      alignSelf: 'center',
      color: '#000'
    },
    loadingContent: {
      paddingVertical: 30,
      paddingHorizontal:40,
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: '#eee',
      opacity: 0.9
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    indicator: {
      alignSelf: 'center',
      backgroundColor: 'transparent',
      marginTop: 20
    },
    learnMore: {
      color: bankStyle.linkColor,
      paddingHorizontal: 7
    },
    bigTitle: {
      fontSize: 20,
      // fontFamily: 'Avenir Next',
      color: bankStyle.linkColor,
      marginTop: 3,
      marginBottom: 0,
      marginHorizontal: 7
    },
    col: {
      paddingVertical: 5,
      paddingRight: 10,
      paddingLeft: isView ? 10 * (indent + 1) : 10 * (indent - 1)
    }
  })
})
module.exports = uiUtils
