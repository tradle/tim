
import constants from '@tradle/constants'
import { makeResponsive } from 'react-native-orient'
import {
  View,
  // Text,
  StyleSheet,
  TouchableHighlight,
  Platform
} from 'react-native'

import React, { Component } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

import GridList from './GridList'
import utils, {
  translate
} from '../utils/utils'

import buttonStyles from '../styles/buttonStyles'
import appStyle from '../styles/appStyle.json'
import reactMixin from 'react-mixin'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import ShowPropertiesView from './ShowPropertiesView'
import { Text } from './Text'
import Actions from '../Actions/Actions'
import ENV from '../utils/env'

const {
  TYPE,
  ROOT_HASH
} = constants
const {
  VERIFICATION,
  ORGANIZATION,
  PROFILE,
  FORM,
  ENUM
} = constants.TYPES

class ShowRefList extends Component {
  constructor(props) {
    super(props);
    this.state = {docs: null}
  }
  render() {
    var { resource, model, backlink, backlinkList, showDocuments, showDetails, bankStyle,
          children, navigator, lazy, currency, application, search } = this.props
    model = model || utils.getModel(resource[TYPE]);
    var props = model.properties;
    var refList = [];
    var isIdentity = model.id === PROFILE;
    var isOrg = model.id === ORGANIZATION;
    var me = utils.getMe()
    var isMe = isIdentity ? resource[ROOT_HASH] === me[ROOT_HASH] : true;
    // The profile page for the device owner has 2 more profile specific links: add new PROFILE and switch PROFILE
    let propsToShow = []

    let currentBacklink = backlink
    let hasPropsToShow = hasPropertiesToShow(resource)
    showDetails = !isIdentity  &&  !isOrg  &&  !showDocuments  &&  (showDetails || !backlink)  && hasPropsToShow

    let bg = bankStyle ? bankStyle.myMessageBackgroundColor : appStyle.CURRENT_UNDERLINE_COLOR

    let currentMarker = <View style={{backgroundColor: bg, height: 4, marginTop: -5}} />

    let hasItemBacklinks = []
    let itemProps = utils.getPropertiesWithAnnotation(model, 'items')
    if (itemProps) {
      for (var p in itemProps) {
        if (itemProps[p].hidden)
          continue
        if (isIdentity) {
          if (!isMe  &&  itemProps[p].allowRoles  &&  itemProps[p].allowRoles === 'me')
            continue;
          if (p === 'verifiedByMe'  &&  !me.organization)
            continue
        }
        if (itemProps[p].items.backlink) {
          if (itemProps[p].items.ref) {
            let m = utils.getModel(itemProps[p].items.ref)
            if (utils.isItem(m))
              hasItemBacklinks.push(p)
          }
          propsToShow.push(p)
        }
      }
    }
    let isMessage = utils.isMessage(resource)
    // Show supporting docs
    if (isMessage) {
      let rId = utils.getId(resource)
      let docs
      if (showDocuments) {
        docs = backlinkList
        this.state.docs = docs
      }
      else if (this.state.docs)
        docs = this.state.docs
      // else {
      //   docs = []
      //   getDocs(resource.verifications, rId, docs)
      // }
      if (docs  &&  docs.length) {
        let count = <View style={styles.count}>
                      <Text style={styles.countText}>{docs.length}</Text>
                    </View>
        let showCurrent = showDocuments ? currentMarker : null
        refList.push(
          <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={() => this.showDocs(docs)} underlayColor='transparent'>
             <View style={styles.item}>
               <View style={styles.row}>
                 <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
                 {count}
               </View>
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{'Documents'}</Text>
             </View>
           </TouchableHighlight>
           {showCurrent}
          </View>)
      }
    }
    if (!propsToShow.length) {
      if (!showDetails)
        return <View/>
    }
    else if (!isOrg  &&  !isIdentity  &&  hasPropsToShow) {
      let showCurrent = showDetails  ? currentMarker : null
      let detailsTab = <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
                         <TouchableHighlight onPress={this.showDetails.bind(this)} underlayColor='transparent'>
                           <View style={styles.item}>
                             <View style={styles.row}>
                               <Icon name='ios-paper-outline'  size={utils.getFontSize(30)}  color='#757575' />
                             </View>
                             <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{'Details'}</Text>
                           </View>
                         </TouchableHighlight>
                         {showCurrent}
                        </View>
      if (refList.length)
        refList.splice(0, 0, detailsTab)
      else
        refList.push(detailsTab)
    }
    if (hasPropsToShow  &&  model.viewCols) {
      let vCols = model.viewCols.filter((p) => !props[p].hidden  &&  props[p].items  &&  props[p].items.backlink)
      if (vCols) {
        vCols.forEach((p) => {
          let idx = propsToShow.indexOf(p)
          if (idx !== -1)
            propsToShow.splice(idx, 1)
        })
        propsToShow.forEach((p) => vCols.push(p))
        propsToShow = vCols
      }
    }
    let hasBacklinks
    propsToShow.forEach((p) => {
      let ref = props[p].items.ref
      if (ENV.hideVerificationsInChat  && ref === VERIFICATION)
        return
      if (ENV.hideProductApplicationInChat  &&  utils.isContext(ref))
        return
      let propTitle = translate(props[p], model)
      var icon = props[p].icon  ||  utils.getModel(props[p].items.ref).icon;
      if (!icon)
        icon = 'ios-checkmark';
      let cnt = resource['_' + p + 'Count'] // &&  resource[p].length
      let count
      if (cnt ) {
        hasBacklinks = true
        if (!currentBacklink  &&  !showDetails &&  !showDocuments)
          currentBacklink = props[p]
        count = <View style={styles.count}>
                  <Text style={styles.countText}>{cnt}</Text>
                </View>
      }
      if (!hasBacklinks  &&  props[p].allowToAdd)
        hasBacklinks = true
      let showCurrent = !showDetails  &&  currentBacklink  &&  currentBacklink.name === p ? currentMarker : null

      refList.push(
        <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.exploreBacklink.bind(this, resource, props[p])} underlayColor='transparent'>
             <View style={styles.item}>
               <View style={styles.row}>
                 <Icon name={icon}  size={utils.getFontSize(30)}  color='#757575' />
                 {count}
               </View>
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{propTitle}</Text>
             </View>
           </TouchableHighlight>
           {showCurrent}
         </View>
        );
    })
    const showQR = ENV.showMyQRCode && utils.getId(me) === utils.getId(resource)  &&  !me.isEmployee
    if (showQR) {
      refList.push(
        <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()}>
           <TouchableHighlight onPress={this.props.showQR.bind(this)} underlayColor='transparent'>
             <View style={styles.item}>
               <Icon name={'ios-qr-scanner'}  size={utils.getFontSize(30)}  color='#757575' />
               <Text style={[buttonStyles.text, Platform.OS === 'android' ? {marginTop: 3} : {marginTop: 0}]}>{translate('showQR')}</Text>
             </View>
           </TouchableHighlight>
         </View>
        )
    }
    if (!hasBacklinks  &&  !showDocuments) {
      if (showDetails)
        refList = null
    }
    // explore current backlink
    let backlinkRL, details, separator
    if (!showDetails  && (currentBacklink  ||  (backlinkList  &&  showDocuments))) {
      let modelName = showDocuments ? FORM : currentBacklink.items.ref
      backlinkRL = <GridList
                    lazy={lazy}
                    modelName={modelName}
                    application={application}
                    search={search}
                    bankStyle={bankStyle}
                    prop={currentBacklink}
                    sortProperty={utils.getModel(modelName).sortProperty}
                    resource={resource}
                    isBacklink={true}
                    listView={true}
                    navigator={navigator} />
    }
    else if (resource.photos)
      separator = <View style={{height: 2, backgroundColor: bg}} />

    if (showDetails) {
      if (isMessage)
        details = <ShowPropertiesView { ...this.props }/>
      else
        details = <ShowPropertiesView resource={resource}
                                      showRefResource={this.getRefResource.bind(this)}
                                      currency={currency}
                                      excludedProperties={['photos']}
                                      navigator={navigator} />
    }
    let comment
    if (ENV.homePageScanQRCodePrompt && !hasBacklinks  &&  utils.getMe()[ROOT_HASH] === resource[ROOT_HASH]) {
      comment = <View style={styles.commandView}>
                  <Text style={styles.command}>{translate('pleaseTapOnMenu')}</Text>
                  <Text style={styles.command}>{translate('scanQRcode')}</Text>
                </View>
    }

    if ((refList  &&  refList.length)  ||  !propsToShow.length  ||  showDetails) {
      // let style = {width: utils.getContentWidth(ShowRefList), utils.dimensions(ShowRefList).height}
      let style = {width: utils.getContentWidth(ShowRefList)}
      // Height is not working for long raw data like Centix check
      if (!showDetails  &&  utils.isWeb())
        style.height = utils.dimensions(ShowRefList).height
      return <View style={style}>
                {separator}
                <View style={[buttonStyles.buttons, {justifyContent: 'center', borderBottomWidth: 0, minHeight: refList &&  refList.length ? 70 : 0}]} key={'ShowRefList'}>
                  {refList}
                </View>
                {children}
                {comment}
                <View style={{margin: 1, flex: 1}}>
                  {backlinkRL}
                  {details}
                </View>
              </View>
    }

    return children || <View/>
  }
  exploreBacklink(resource, prop) {
    Actions.exploreBacklink(resource, prop)
  }
  showDocs(docs) {
    Actions.getDocuments(this.props.resource, docs)
  }
  showDetails() {
    Actions.getDetails(this.props.resource)
  }
  getRefResource(resource, prop) {
    this.showRefResource(resource, prop)
  }
}
function getDocs(varr, rId, docs) {
  if (!varr)
    return
  varr.forEach((v) => {
    if (v.method) {
      if (utils.getId(v.document) !== rId)
        docs.push(v.document)
    }
    else if (v.sources)
      getDocs(v.sources, rId, docs)
  })
}
function hasPropertiesToShow(resource) {
  let m = utils.getModel(resource[TYPE])
  let viewCols = m.viewCols
  if (!viewCols)
    viewCols = utils.getViewCols(m)
  viewCols = utils.ungroup({model: m, viewCols})
  let vCols = []
  let props = m.properties
  viewCols.forEach((pr) => {
    if (props[pr].group)
      props[pr].group.forEach((gp) => vCols.push(gp))
    else
      vCols.push(pr)
  })

  for (let p in resource) {
    if (!props[p]  ||   p.charAt(0) === '_')//  ||  props[p].type === 'array')
       continue
    if (props[p].type === 'array') {
      const pref = props[p].items.ref
      if (!pref  ||  utils.getModel(pref).subClassOf !== ENUM)
        continue
    }
    if (vCols  &&  vCols.includes(p))
      return true
  }
}

reactMixin(ShowRefList.prototype, ResourceMixin);
reactMixin(ShowRefList.prototype, RowMixin);
ShowRefList = makeResponsive(ShowRefList)

var styles = StyleSheet.create({
  count: {
    alignSelf: 'flex-start',
    minWidth: 18,
    marginLeft: -7,
    marginTop: 0,
    backgroundColor: appStyle.COUNTER_BG_COLOR,
    paddingHorizontal: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 9,
    borderColor: appStyle.COUNTER_COLOR,
    paddingVertical: 1
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
    color: appStyle.COUNTER_COLOR,
  },
  item: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0
  },
  row: {
    flexDirection: 'row'
  },
  commandView: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: 300,
    marginTop: 200
  },
  command: {
    fontSize: 20,
    alignSelf: 'center',
    color: '#555555'
  }
})

module.exports = ShowRefList;
