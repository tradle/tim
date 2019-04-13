
import { makeResponsive } from 'react-native-orient'

import {
  View,
  Text,
  StyleSheet,
} from 'react-native'

import React, { Component } from 'react'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import GridList from './GridList'
import utils, {
  translate
} from '../utils/utils'

import constants from '@tradle/constants'
import buttonStyles from '../styles/buttonStyles'
import appStyle from '../styles/appStyle.json'
import reactMixin from 'react-mixin'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import ShowPropertiesView from './ShowPropertiesView'
import Actions from '../Actions/Actions'
import ENV from '../utils/env'
import BacklinksTabBar from './BacklinksTabBar'
const {
  TYPE,
  ROOT_HASH
} = constants
const {
  VERIFICATION,
  ORGANIZATION,
  PROFILE,
  FORM
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
    var isProfile = model.id === PROFILE;
    var isOrg = model.id === ORGANIZATION;
    var me = utils.getMe()
    var isMe = isProfile ? resource[ROOT_HASH] === me[ROOT_HASH] : true;
    // The profile page for the device owner has 2 more profile specific links: add new PROFILE and switch PROFILE
    let propsToShow = []

    let currentBacklink = backlink
    let hasPropsToShow = hasPropertiesToShow(resource)
    showDetails = !isProfile  &&  !isOrg  &&  !showDocuments  &&  (showDetails || !backlink)  && hasPropsToShow

    let bg = bankStyle ? bankStyle.myMessageBackgroundColor : appStyle.CURRENT_UNDERLINE_COLOR

    let hasItemBacklinks = []
    let itemProps = utils.getPropertiesWithAnnotation(model, 'items')
    if (itemProps) {
      for (var p in itemProps) {
        if (itemProps[p].hidden)
          continue
        if (isProfile) {
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
    this.tabDetail = {}
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
      else {
        docs = []
        getDocs(resource.verifications, rId, docs)
      }
      if (docs  &&  docs.length) {
        this.tabDetail.Documents = {icon: 'ios-paper-outline', action: this.showDocs.bind(this, docs)}
        refList.push(<View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()} tabLabel='Documents'/>)
      }
    }
    if (!propsToShow.length) {
      if (!showDetails)
        return <View/>
    }
    else if (!isOrg  &&  !isProfile  &&  hasPropsToShow) {
      this.tabDetail.Details = {icon: 'ios-paper-outline', action: this.showDetails.bind(this)}
      let detailsTab = <View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()} tabLabel='Details' />
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
      if (!hasBacklinks  &&  (props[p].allowToAdd || cnt))
        hasBacklinks = true
      this.tabDetail[propTitle] = { icon, action: this.exploreBacklink.bind(this, resource, props[p]), count: cnt }
      refList.push(<View style={[buttonStyles.container, {flex: 1}]} key={this.getNextKey()} tabLabel={propTitle}/>)
      if (!currentBacklink  &&  !showDetails)
        currentBacklink = props[p]
    })
    const showQR = ENV.showMyQRCode && utils.getId(me) === utils.getId(resource)  &&  !me.isEmployee
    if (showQR  &&  this.props.showQR) {
      let tabName = translate('showQR')
      this.tabDetail[tabName] = { icon: 'ios-qr-scanner', action: this.props.showQR.bind(this) }
      refList.push(<View style={buttonStyles.container} key={this.getNextKey()} tabLabel={tabName}/>)
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

    let refListTabs
    if (refList) {
      // refListTabs = <View style={[buttonStyles.buttons, {justifyContent: 'center', borderBottomWidth: 0}]} key={'ShowRefList'}>
      //                 {refList}
      //               </View>

      refListTabs = <ScrollableTabView
                      renderTabBar={() =>
                        <BacklinksTabBar
                          tabDetail={this.tabDetail}
                          backgroundColor={appStyle.TAB_COLOR}
                          activeTextColor='#757575'
                          textStyle={buttonStyles.text}
                          inactiveTextColor='#757575'
                          tabsUnderlineColor={bg}/>
                      }>
                      {refList}
                    </ScrollableTabView>
    }
    if ((refList  &&  refList.length)  ||  !propsToShow.length  ||  showDetails)
      return   <View>
                {separator}
                {refListTabs}
                {children}
                {comment}
                <View>
                  {backlinkRL}
                  {details}
                </View>
              </View>

    return children || <View/>
  }
  // getDocs(varr, rId, docs) {
  //   if (!varr)
  //     return
  //   varr.forEach((v) => {
  //     if (v.method) {
  //       if (utils.getId(v.document) !== rId)
  //         docs.push(v.document)
  //     }
  //     else if (v.sources)
  //       this.getDocs(v.sources, rId, docs)
  //   })
  // }
  // hasPropsToShow(resource) {
  //   let m = utils.getModel(resource[TYPE])
  //   let viewCols = m.viewCols
  //   if (!viewCols)
  //     viewCols = utils.getViewCols(m)
  //   viewCols = utils.ungroup(m, viewCols)
  //   let vCols = []
  //   let props = m.properties
  //   viewCols.forEach((pr) => {
  //     if (props[pr].group)
  //       props[pr].group.forEach((gp) => vCols.push(gp))
  //     else
  //       vCols.push(pr)
  //   })

  //   for (let p in resource) {
  //     if (!props[p]  ||  p.charAt(0) === '_'  ||  props[p].type === 'array')
  //       continue
  //     if (vCols  &&  vCols.indexOf(p) !== -1)
  //       return true
  //   }
  // }
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
  viewCols = utils.ungroup(m, viewCols)
  let vCols = []
  let props = m.properties
  viewCols.forEach((pr) => {
    if (props[pr].group)
      props[pr].group.forEach((gp) => vCols.push(gp))
    else
      vCols.push(pr)
  })

  for (let p in resource) {
    if (!props[p]  ||  p.charAt(0) === '_'  ||  props[p].type === 'array')
      continue
    if (vCols  &&  vCols.indexOf(p) !== -1)
      return true
  }
}

reactMixin(ShowRefList.prototype, ResourceMixin);
reactMixin(ShowRefList.prototype, RowMixin);
ShowRefList = makeResponsive(ShowRefList)

var styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 0
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
