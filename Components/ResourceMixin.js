import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react'
import {
  // Text,
  View,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import {Column as Col, Row} from 'react-native-flexbox-grid'
import JSONTree from 'react-native-json-tree'

import constants from '@tradle/constants'

var {
  TYPE,
  // PREV_HASH
} = constants
var { PROFILE, ORGANIZATION, MONEY, MESSAGE } = constants.TYPES

import StyleSheet from '../StyleSheet'
import PhotoList from './PhotoList'
import NetworkInfoProvider from './NetworkInfoProvider'
import Accordion from './Accordion'
import Actions from '../Actions/Actions'
import PageView from './PageView'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import utils, { translate, cleanJson } from '../utils/utils'
import platformStyles from '../styles/platform'
import Image from './Image'
import { Text } from './Text'
import uiUtils from '../utils/uiUtils'
import { VictorySunburst } from './victory-sunburst'
// import { VictoryContainer } from 'victory'

const RESOURCE_VIEW = 'ResourceView'
const MESSAGE_VIEW = 'MessageView'
const CHECK_VIEW = 'CheckView'
const APPLICATION_VIEW = 'ApplicationView'
const RESOURCE_LIST = 'ResourceList'

const debug = utils.logger('ResourceMixin')
const NOT_SPECIFIED = '[not specified]'
const TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const APPLICATION = 'tradle.Application'
const CHECK = 'tradle.Check'
const MODIFICATION = 'tradle.Modification'

const skipLabelsInJSON = {
  'tradle.PhotoID': {
    'address': ['full']
  }
}
const hideGroupInJSON = {
  'tradle.PhotoID': ['address']
}
const showCollapsedMap = {
  'tradle.PhotoID': 'scanJson',
  'tradle.SanctionsCheck': 'rawData',
  'tradle.CentrixCheck': 'rawData',
  'tradle.CorporationExistsCheck': 'rawData',
  'tradle.documentChecker.Check': 'rawData'
}

import Markdown from './Markdown'
var component

var ResourceMixin = {
  showRefResource(resource, prop, isDataLineage) {
    let type = utils.getType(resource)
    let model = utils.getModel(type);
    let title = utils.getDisplayName(resource);
    let modelTitle = translate(model)
    if (title  &&  title.length)
      title = title + ' -- ' + modelTitle
    else
      title = modelTitle
    let isMessageView, isApplicationView
    if (type === APPLICATION)
      isApplicationView = true
    else if (!utils.isStub(resource))
      isMessageView = utils.isMessage(resource)
    else
      isMessageView = (type !== ORGANIZATION  &&  type !== PROFILE)

    const isCheck = model.subClassOf === CHECK
    let {bankStyle, search, currency, country, navigator, application} = this.props
    if (isMessageView) {
      let r = this.props.resource
      let isVerifier = utils.getModel(utils.getType(r)).subClassOf === CHECK  &&  application &&  utils.isRM(application)
      let route = {
        componentName: isCheck &&  CHECK_VIEW || MESSAGE_VIEW,
        backButtonTitle: 'Back',
        title,
        passProps: {
          bankStyle: bankStyle,
          resource: resource,
          search: search,
          currency: currency,
          country: country,
          isThisVersion: isDataLineage
        }
      }
      if (isVerifier) {
        route.rightButtonTitle = 'Done'
        _.extend(route.passProps, {
          isVerifier,
          application
        })
      }
      navigator.push(route)
    }
    else if (isApplicationView) {
      navigator.push({
        title: title,
        componentName: APPLICATION_VIEW,
        backButtonTitle: 'Back',
        passProps: {
          resource,
          search,
          bankStyle,
          application: resource
        }
      })
    }
    else {
      navigator.push({
        title: title,
        componentName: RESOURCE_VIEW,
        backButtonTitle: 'Back',
        passProps: {
          resource: resource,
          prop: prop,
          bankStyle: bankStyle || defaultBankStyle,
          currency: this.props.currency
        }
      })
    }
  },
  showResources(resource, prop) {
    this.props.navigator.push({
      title: translate(prop, utils.getModel(resource[TYPE])),
      backButtonTitle: 'Back',
      componentName: RESOURCE_LIST,
      passProps: {
        modelName: prop.items.ref,
        filter: '',
        resource: resource,
        prop: prop,
        bankStyle: this.props.bankStyle || defaultBankStyle,
        currency: this.props.currency
      }
    });
  },

  renderItems({value, prop, cancelItem, component}) {
    let { bankStyle, navigator, resource } = this.props
    let linkColor = (bankStyle  &&  bankStyle.linkColor) || '#7AAAC3'
    let itemsMeta = prop.items.properties;
    let pModel
    let ref = prop.items.ref;
    if (!itemsMeta) {
      if (ref) {
        pModel = utils.getModel(ref);
        itemsMeta = pModel.properties;
      }
    }
    let counter = 0;
    let vCols = pModel  &&  pModel.viewCols;
    if (!vCols) {
      vCols = [];
      for (let p in itemsMeta) {
        if (p.charAt(0) !== '_'  &&  !itemsMeta[p].hidden)
          vCols.push(p);
      }
    }
    let cnt = value.length;
    let isView = component  &&  component.name === 'ShowPropertiesView'
    let isWeb = utils.isWeb()
    return value.map((v) => {
      let ret = [];
      counter++;
      let displayName
      let hadCancel
      vCols.forEach((p) =>  {
        let itemMeta = itemsMeta[p];
        let { type, displayAs, displayName, range, ref, skipLabel, items } = itemMeta
        let pVal = v[p]
        if (!pVal  &&  !displayAs)
          return
        if (displayName) {
          displayName = type === 'object' && pVal.title ||  pVal
          ret.push(<View style={{flexDirection: isWeb && 'row' || 'column', paddingVertical: 3}}>
                     <View style={{flex: 9, flexDirection: isWeb && 'row' || 'column', justifyContent: 'space-between'}}>
                       <Text style={skipLabel ? {height: 0} : [styles.itemText, {color: '#999999'}]}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
                       <Text style={styles.itemText}>{displayName}</Text>
                     </View>
                     {!isView  &&  <View style={{flex: 1}}/>}
                   </View>)

          return
        }
        let value;
        let isDisplayName = displayAs
        if (isDisplayName)
          value = utils.templateIt(itemMeta, v, pModel)
        else if (type === 'date')
          value = utils.formatDate(pVal);
        else if (type === 'boolean')
          value = pVal ? 'Yes' : 'No'
        else if (type === 'array') {
          let iref = items.ref
          if (iref) {
            if (p == 'photos') {
              ret.push(
                 <PhotoList photos={v.photos} navigator={navigator} numberInRow={4} resource={resource} isView={true}/>
              );
              return
            }
            if (utils.isEnum(iref)) {
              ret.push(
                   <View style={{flexDirection: isWeb && 'row' || 'column', paddingVertical: 3}}>
                     <View style={{flex: 9, flexDirection: isWeb && 'row' || 'column', justifyContent: 'space-between'}}>
                       <Text style={skipLabel ? {height: 0} : [styles.itemText, {color: '#999999'}]}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
                       <View style={{flexDirection: 'column', alignItems: 'flex-end'}} key={this.getNextKey()}>
                         {pVal.map((v, i) => <Text style={styles.itemText}>{v.title}</Text>)}
                       </View>
                     </View>
                     {!isView  &&  <View style={{flex: 1}}/>}
                   </View>
              )
              return
            }
          }
        }
        else if (type !== 'object') {
          // if (p == 'photos') {
          //   ret.push(
          //      <PhotoList photos={v.photos} navigator={navigator} numberInRow={4} resource={resource} isView={true}/>
          //   );
          //   return
          // }
          // else
            value = pVal;
        }
        else if (range === 'json') {
          // let json = {[displayName]: pVal}
          ret.push(this.showJson({ json: pVal, prop: itemMeta, isView: true }))
          return
        }
        else if (ref) {
          if (ref === MONEY) {
            let symbol = pVal.currency
            let c = utils.normalizeCurrencySymbol(pVal.currency)
            value = (c || symbol) + pVal.value
          }
          else
            value = pVal.title  ||  utils.getDisplayName(pVal, utils.getModel(ref));
        }
        else
          value = pVal.title;

        if (!value)
          return
        let item = <View style={{flexDirection: isWeb && 'row' || 'column', paddingVertical: 3}}>
                     <View style={{flex: 9, flexDirection: isWeb && 'row' || 'column', justifyContent: 'space-between'}}>
                       <Text style={skipLabel ? {height: 0} : [styles.itemText, {color: '#999999'}]}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
                       <Text style={styles.itemText}>{value}</Text>
                     </View>
                     {!isView  &&  <View style={{flex: 1}}/>}
                   </View>

        if (cancelItem  &&  !hadCancel) {
          hadCancel = true
          item = <TouchableOpacity underlayColor='transparent' onPress={cancelItem.bind(this, prop, v)}>
                   <View style={[{width: utils.getContentWidth(component) - 40}]}>
                     {item}
                     <View style={{position: 'absolute', top: 0, right: 10}}>
                       <Icon name='ios-close-circle-outline' size={28} color={linkColor} />
                     </View>
                   </View>
                 </TouchableOpacity>
          // item = <TouchableOpacity underlayColor='transparent' onPress={cancelItem.bind(this, prop, v)}>
          //          <View style={[styles.row, {width: utils.getContentWidth(component) - 40}]}>
          //            {item}
          //            <Icon name='ios-close-circle-outline' size={24} color={linkColor} />
          //          </View>
          //        </TouchableOpacity>
        }


        ret.push(
            <View key={this.getNextKey()}>
              {item}
            </View>
        )
      })
      if (!ret.length) {
        let vTitle = displayName || v.title  ||  translate(utils.getModel(utils.getType(v)))

        let image = v.photo  &&  <Image source={{uri: v.photo}} style={styles.thumb} />
        let color = cancelItem ? '#757575' : linkColor
        let item = <View style={{flexDirection: 'row', paddingVertical: 10}}>
                    {image}
                    <Text style={[styles.itemText, {color}]}>{vTitle}</Text>
                  </View>
        if (cancelItem) {
          item = <TouchableOpacity underlayColor='transparent' key={this.getNextKey()} onPress={cancelItem.bind(this, prop, v)}>
                   <View style={styles.row}>
                     {item}
                     <Icon name='md-close' size={20} color={linkColor} style={{marginTop: 12}} />
                   </View>
                 </TouchableOpacity>
          }
        else {
          let isMessageView
          if (resource._message)
            isMessageView = true
          else
            isMessageView = (ref !== ORGANIZATION  &&  ref !== PROFILE)
          let componentName = isMessageView && MESSAGE_VIEW || RESOURCE_VIEW
          item =  <TouchableOpacity underlayColor='transparent' style={styles.rowStyle} key={this.getNextKey()} onPress={() => {
                    navigator.push({
                     title: vTitle,
                     componentName,
                     backButtonTitle: 'Back',
                     bankStyle,
                     passProps: {resource: v}
                    })
                  }}>
                   {item}
                 </TouchableOpacity>
        }
        ret.push(item)
      }

      let sep = counter !== cnt  &&  <View style={styles.itemSeparator}></View>
      return (
        <View key={this.getNextKey()} style={{paddingVertical: 10, paddingLeft:10}} >
           {ret}
           {sep}
        </View>
      )
    });
  },
  renderSimpleProp(val, pMeta, modelName, component) {
    let { bankStyle } = this.props
    if (Array.isArray(val)) {
      if (pMeta.items.backlink)
        return <View  key={this.getNextKey()} />

      let vCols = pMeta.viewCols;
      if (!vCols)
        vCols = pMeta.items.ref  &&  utils.getModel(pMeta.items.ref).viewCols
      val = <View style={{marginHorizontal: 7}}>{this.renderItems({value: val, prop: pMeta, component})}</View>
      let title = pMeta.title || utils.makeLabel(pMeta.name)
      const titleEl = <Text style={styles.title}>{title}</Text>
      let icon
      let cnt = val.length;
      if (cnt > 3  &&  modelName !== TERMS_AND_CONDITIONS)
        icon = <Icon name={'ios-arrow-down'} size={15} color='#7AAAC3' style={{position: 'absolute', right: 10, top: 10}}/>
      let header = <View style={{flexDirection: 'row'}}>
                    {titleEl}
                    {icon}
                  </View>

      let separator = <View style={styles.separator}></View>;
      if (cnt > 3)
        val = <View key={this.getNextKey()}>
                {separator}
                <Accordion
                  sections={[title]}
                  header={header}
                  content={val}
                  underlayColor='transparent'
                  easing='easeIn' />
             </View>
      else {
        val = <View key={this.getNextKey()}>
               {titleEl}
               {val}
             </View>
      }
    }
    else  {
      if (pMeta.units  &&  pMeta.units.charAt(0) != '[')
        val += ' ' + pMeta.units

      if (val === NOT_SPECIFIED)
        val = <Text style={[styles.description, {color: bankStyle.linkColor}]}>{val}</Text>
      else if (typeof val === 'number')
        val = <Text style={styles.description}>{val}</Text>;
      else if (typeof val === 'boolean')
        val = <Text style={styles.description}>{val ? 'Yes' : 'No'}</Text>;
      else if (pMeta.signature) {
        let { width } = utils.dimensions(component)
        let h = 200
        let w = width - 40
        val = <View style={styles.container}>
                <Image style={{maxWidth: w, height: h}} source={{uri: val}} resizeMode='contain'/>
              </View>
      }
      else if (typeof val === 'string'  &&  pMeta.type !== 'object'  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
        val = <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: bankStyle.linkColor}]}>{val}</Text>;
      else if (pMeta.markdown) {
        val = <View style={styles.container}>
                <Markdown markdownStyles={uiUtils.getMarkdownStyles(bankStyle)}>
                  {val}
                </Markdown>
              </View>
      }
      else {
        if (pMeta.range === 'model')
          val = translate(utils.getModel(val))
        else if (pMeta.range === 'password')
          val = '*********'
        val = <Text style={[styles.description]}>{val}</Text>;
      }
    }
    return val
  },
  changeResourceTree(tree, newTree) {
    let isNodes = !tree._displayName
    if (!isNodes) {
      if (!tree.top)
        return
      // if (tree[TYPE] === APPLICATION) {
      let appDn
      let requestFor = tree.requestFor
      if (requestFor)
        appDn = `${utils.makeModelTitle(requestFor)} ${translate('application')}`
      else
        appDn = translate(utils.getModel(APPLICATION))
      // }
      // else
      //   dn = `${tree._displayName} - ${utils.makeModelTitle(tree[TYPE])}`
      // newTree[`${dn};link:${tree[TYPE]}_${tree._permalink}`] = '$$'
      let dnR = `${tree.top._displayName};link:${tree.top[TYPE]}_${tree.top._permalink}`
      let dnA = `${appDn};link:${tree[TYPE]}_${tree._permalink}`

      let dn = `${dnR} - ${dnA}`
      newTree[dn] = '$$'
    }
    let i = 1
    for (let p in tree) {
      if (typeof tree[p] !== 'object')
        continue
      let prop = p
      if (isNodes)
        prop = '' + i++ //tree[p]._displayName
      else if (p === 'top')
        prop = translate('beneficialOwners')
      newTree[prop] = {}
      this.changeResourceTree(tree[p], newTree[prop], false)
      if (p === 'top') {
        let nodes = tree[p].nodes
        if (nodes)
          this.changeResourceTree(nodes, newTree[prop], false)
      }
    }
  },
  showJson(params) {
    let { json, prop, title, isView, pieChart } = params
    let isTree = json[TYPE]
    let origJson = json
    if (isTree) {
      if (!json.top  ||  !json.top.nodes)
        return
      let title = translate('beneficialOwners')
      let newTree = {[title]: {}}
      let starBurst = {[title]: {}}
      this.changeResourceTree(json.top.nodes, newTree[title], true)
      json = newTree
    }
// ARROW_COLOR: theme.base0D,
//   BACKGROUND_COLOR: theme.base00,
//   BOOLEAN_COLOR: theme.base09,
//   DATE_COLOR: theme.base0B,
//   FUNCTION_COLOR: theme.base08,
//   ITEM_STRING_COLOR: theme.base0B,
//   ITEM_STRING_EXPANDED_COLOR: theme.base03,
//   LABEL_COLOR: theme.base0D,
//   NUMBER_COLOR: theme.base09,
//   NULL_COLOR: theme.base08,
//   STRING_COLOR: theme.base0B,
//   SYMBOL_COLOR: theme.base08,
//   TEXT_COLOR: theme.base07,
//   UNDEFINED_COLOR: theme.base08,
    let { resource, bankStyle } = this.props
    const theme = {
      scheme: 'custom',
      base00: '#ffffff', // background
      base01: '#272935',
      base02: '#3a4055',
      base03: '#5a647e',
      base04: '#d4cfc9',
      base05: '#e6e1dc',
      base06: '#f4f1ed',
      base07: '#f9f7f3',
      base08: '#da4939',
      base09: bankStyle.textColor, // number
      base0A: '#ffc66d',
      base0B: bankStyle.textColor, // string
      base0C: '#519f50',
      base0D: '#757575', // label
      base0E: '#b6b3eb',
      base0F: '#bc9458'
    };
    json = this.minimizeJson(_.cloneDeep(json))
    // if (Array.isArray(json)  &&  json.length === 1) {
    //   json = json[0]
    //   if (_.size(json) === 1)
    //     json = json[Object.keys(json)[0]]
    // }

    let backgroundColor = isView ? bankStyle.linkColor : bankStyle.verifiedHeaderColor
    let color = isView ? '#ffffff' : bankStyle.verifiedHeaderTextColor
    let style = {opacity: this.props.resource[TYPE] === MODIFICATION && 0.4 || 0.7, backgroundColor, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginHorizontal: isView ? 0 : -10, marginBottom: 10}

    let icon
    const rType = resource[TYPE]
    const showCollapsed = showCollapsedMap  &&  showCollapsedMap[rType]
    // if (showCollapsed  &&  showCollapsed === prop.name)
    //   icon = <Icon size={20} name='ios-arrow-down' color='#ffffff' style={styles.arrow} />
    let header = <TouchableOpacity onPress={() => {
      this.state.hidden ? this.setState({hidden: false}) : this.setState({hidden: true})
    }} style={style} key={this.getNextKey()}>
                   <Text  style={[styles.hugeTitle, {color, paddingVertical: 10}]}>{title && title || translate(prop)}</Text>
                   {icon}
                </TouchableOpacity>
    let content = (
      <View ref='json' style={{flex: 1}}>
        <JSONTree data={json} invertTheme={false} hideRoot={true} theme={{
            extend: theme,
            nestedNodeItemString: ({ style }, nodeType, expanded) => ({
              style: {
                ...style,
                fontSize: 18
              }
            })
          }}
          shouldExpandNode = {this.shouldExpandNode.bind(this)}
          // shouldExpandNode = {(keyName, data, level) => {
          //   return true
          //   if (!keyName.length)
          //     return this.state.hidden && false || true
          //   else
          //     return false
          // }}
          getItemString={(type, data, itemType, itemString) => {
            if (type === 'Array')
              return <Text style={{fontSize: 16}}>{itemType} {itemString}</Text>
            if (type === 'Object')
              return
            return <Text style={{fontSize: 16, paddingTop: 10}}>{itemType} {itemString}</Text>
          }}
          labelRenderer={(raw, nodeType, expanded, hasItems) => {
            const isArray = nodeType === 'Array'
            // if (isArray  &&  !hasItems) {
            //   return <View style={{height: 0}} />
            const isObject = nodeType === 'Object'
            // let val = isObject && translate(raw[0]) || `${translate(raw[0])}:`
            let val = raw[0]
            // if (isObject)
            if (typeof val === 'string')
              val = translate(val)
            if (typeof val === 'string') {
              let idx = val.indexOf(';link:')
              if (idx !== -1) {
                let parts = val.split(' - ')
                let links = parts.map((part, i) => {
                  let idx = part.indexOf(';link:')
                  let id = part.slice(idx + 6)
                  let title = part.slice(0, idx)
                  return <TouchableOpacity onPress={this.showTreeNode.bind(this, {id, title})}>
                           <Text style={{ paddingLeft: 5, fontSize: i ? 12 : 16, color: bankStyle.linkColor, opacity: i && 0.5 || 1 }}>{part.substring(0, idx)}</Text>
                         </TouchableOpacity>
                })
                return <View>{links}</View>
              }

              val = `${translate(val)}`
            }

            return <Text style={{ paddingLeft: (isObject || isArray) && 7 || 5, fontSize: 16 }}>{val}</Text>
          }}
          valueRenderer={raw => {
            let isBold
            if (typeof raw === 'string') {
              raw = raw.replace(/['"]+/g, '')
              if (raw == '$$')
                return

              if (raw.startsWith('*')  &&  raw.endsWith('*')) {
                isBold = true
                raw = raw.slice(1, raw.length - 1)
              }
            }

            return <Text style={{ padding: 15, fontSize: 16, fontWeight: isBold && '800' || '400' }}>{raw}</Text>
          }}
        />
      </View>
    )
    if (resource.submissions) {
      if (isTree  &&  params.showTree) {
        let tree = this.paintTree(json, resource)
        content = <View style={{flexDirection: 'row'}}>
                   {content}
                   <View style={{flex: 1, alignItems: 'flex-end'}}>
                     {tree}
                   </View>
                  </View>

      }
      else if (pieChart  && prop.name === 'scoreDetails') {
        // content = <View style={{flexDirection: 'row'}}>
        //            <View style={{flex: 1}}>{content}</View>
        //            <View style={{flex: 2, marginLeft: -250}}>
        //              {pieChart}
        //            </View>
        //           </View>
        content = <View>
                   {pieChart}
                   <View style={{flex: 1}}>{content}</View>
                  </View>
      }
    }
    return <View>
              {header}
              {content}
           </View>
  },
  shouldExpandNode(keyName, data, level) {
    if (this.props.resource[TYPE] === MODIFICATION)
      return true

    if (!keyName.length)
      return this.state.hidden && false || true
    else
      return false
  },

/*
{
  "Beneficial Owners": {
    "1": {
      "Christopher Hullatt\nValid Driver Licence, United Kingdom;link:tradle.PhotoID_097a094463e1b5b8bff45f712b75999d7ca9a5ab3cef4f171ffc171f34f1c30c - Application For: Controlling Person Onboarding;link:tradle.Application_5a4cc48852ab688f98015e496b5c68399755a90c4ecea63799a02ed52655ac03": "$$"
    },
    "2": {
      "Octopus Ventures Limited;link:tradle.legal.LegalEntity_5f7a25c84e38d3618da1ea4f04d481d1859fbf8192158b8d27811109e6393166 - Application For: Controlling Entity Onboarding;link:tradle.Application_e266eae6eb36fae6d873c339a89a2a843690e5239c9f08ea5ed90f75fb8042b6": "$$",
      "Beneficial Owners": {
        "1": {
          "Octopus Investments Limited;link:tradle.legal.LegalEntity_a5c43986a452d845fdc0702291562c13fcfc8b1cd2ecd0c0dc254cafce38a394 - Application For: Controlling Entity Onboarding;link:tradle.Application_fb2ccf8f691dbf0febd4350f6abbd11083acd03869482eecb5ac8052e99a5414": "$$"
        }
      }
    }
  }
}"
 */
  makeSunbirstTree(jsonO, data, resource) {
    let size = _.size(data)
    if (!size) {
      data.name = utils.getDisplayName(resource).split(' ').slice(0, 2).join('\n')
      data.children = []
    }
    let bo = translate('beneficialOwners')
    let json = jsonO[bo] || jsonO

    for (let p in json) {
      if (!isNaN(p)) {
        let keys = Object.keys(json[p])
        let name = keys[0]
        let idx = name.indexOf(';link:')
        if (idx) {
          name = name.slice(0, idx)
          let parts = name.replace(/\n/g, ' ').split(' ')
          let n = ''
          let len = Math.min(parts.length, 3)
          for (let i=0; i<len; i++) {
            n += (i && '\n' || '') + parts[i]
          }
          name = n
        }
        if (_.size(json[p]) === 1)
          data.children.push({ name, size: 4 })
        else {
          let obj = {
            name,
            children: []
          }
          data.children.push(obj)
          this.makeSunbirstTree(json[p][bo], obj, resource)
        }
      }
    }
    return data
  },
  getDepth(obj) {
    var depth = 0;
    if (obj.children) {
      obj.children.forEach(d => {
        var tmpDepth = this.getDepth(d)
        if (tmpDepth > depth) {
            depth = tmpDepth
        }
      })
    }
    return 1 + depth
  },
  paintTree(tree, resource) {
    let data = {}
    let treeData = this.makeSunbirstTree(tree, data, resource)
    let depth = this.getDepth(treeData)
    if (depth < 3)
      return
    let size = 500
    return (
      <VictorySunburst
          colorScale={'qualitative'}
          height={size}
          width={size}
          data={treeData}
          events={[{
            target: "labels",
            eventHandlers: {
              onClick: () => {
               return [
                  {
                    target: "labels",
                    mutation: () => {
                      return { active: true };
                    },
                    callback: () => {
                      console.log("I happen after setState");
                    }
                  }
                ];
              }
            }
          }]}
       />
    )
  },

  showTreeNode({stub, prop, openChat}) {
    let {id, title} = stub
    debugger
    const { bankStyle, navigator, resource } = this.props
    let type = utils.getType(id)
    let isApplication = type === APPLICATION
    if (isApplication) {
      if (resource.from)
        title = `${title} -- ${resource.from.title} -> ${title}`
    }
    else
      title = `${title} -- ${utils.makeModelTitle(type)}`
    if (isApplication &&  openChat) {
      Actions.openApplicationChat(stub)
      return
    }
    navigator.push({
      componentName: isApplication ? APPLICATION_VIEW : MESSAGE_VIEW,
      backButtonTitle: 'Back',
      title,
      passProps: {
        bankStyle,
        resource: {
          id
        }
      }
    })
  },
  openApplicationChat(resource, context) {
    let { navigator, bankStyle } = this.props
    // let { bankStyle } = this.state
    // let resource = this.state.resource || this.props.resource
    let me = utils.getMe()
    let title
    let name = resource.applicantName || resource.applicant.title
    if (name)
      title = name  + '  →  ' + me.organization.title
    else
      title = me.organization.title
    let style = resource.style ? this.mergeStyle(resource.style) : bankStyle
    let route = {
      componentName: 'MessageList',
      backButtonTitle: 'Back',
      title: title,
      passProps: {
        resource: resource._context || context,
        filter: '',
        search: true,
        modelName: MESSAGE,
        application: resource,
        currency: resource.currency,
        bankStyle: style,
      }
    }
    navigator.push(route)
  },
  minimizeJson(jsonObj) {
    let json = cleanJson(jsonObj)
    if (Array.isArray(json)  &&  json.length === 1) {
      json = json[0]
      if (_.size(json) === 1)
        json = json[Object.keys(json)[0]]
    }

    for (let p in json) {
      if (typeof json[p] !== 'object')
        continue
      if (!Array.isArray(json[p])) {
        json[p] = this.minimizeJson(json[p])
        continue
      }
      let jsonI = json[p]
      if (jsonI.length === 1) {
        jsonI = jsonI[0]
        jsonI = this.minimizeJson(jsonI)
      }
      else {
        jsonI.forEach((elm, i) => {
          if (_.size(elm) === 1)
            jsonI[i] = elm[Object.keys(elm)[0]]
          else
            jsonI[i] = this.minimizeJson(elm)
        })
      }
      json[p] = jsonI
    }
    return json
  },
  cleanupJson1(json) {
    json = utils.sanitize(json)
    if (!Array.isArray(json)  ||  json.length !== 1)
      return json

    json = json[0]
    if (_.size(json) !== 1)
      return json
    json = Object.values(json)[0]
    for (let p in json) {
      if (!Array.isArray(json[p]))
        continue
      let arr = json[p]
      if (!arr.length) {
        delete json[p]
        continue
      }
      arr.forEach((elm, i) => {
        if (_.size(elm) === 1)
          json[p][i] = elm[Object.keys(elm)[0]]
      })
    }
    return json
  },
  showJson1(params) {
    let { json, indent, isView } = params
    _.extend(params, {rawStyles: createStyles({bankStyle: this.props.bankStyle, indent, isView})})
    if (!Array.isArray(json))
      return this.showJsonPart(params)
    return json.map((r) => {
      let p = _.cloneDeep(params)
      p.json = r
      p.jsonRows = []
      return this.showJsonPart(p)
    })
  },
  showJsonPart(params) {
    let {prop, json, isView, jsonRows, skipLabels, indent,
         isOnfido, isBreakdown, rawStyles} = params
    // let json = JSON.parse(jsonStr)
    // let jsonRows = []
    let { resource, bankStyle } = this.props
    bankStyle = bankStyle || defaultBankStyle

    let rType = resource[TYPE]

    let hideGroup = prop  &&  hideGroupInJSON[rType]
    let showCollapsed = showCollapsedMap  &&  showCollapsedMap[rType]
    skipLabels = !skipLabels  &&  prop  &&  skipLabelsInJSON[rType]  &&  skipLabelsInJSON[rType][prop]

    // let bg = isView ? bankStyle.myMessageBackgroundColor : bankStyle.verifiedHeaderColor
    let backgroundColor = isView ? bankStyle.linkColor : bankStyle.verifiedHeaderColor
    let color = isView ? '#ffffff' : bankStyle.verifiedHeaderTextColor
    let backlinksBg = {backgroundColor, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginHorizontal: isView ? 0 : -10}
    if (prop) {
      let cols = []
      let state
      let icon
      if (showCollapsed  &&  showCollapsed === prop.name)
        icon = <Icon size={20} name='ios-arrow-down' color='#ffffff' style={styles.arrow} />
      if (isOnfido) {
        let color = json.result === 'clear' ? '#f1ffe7' : 'red'
        cols.push(<Col sm={1} md={1} lg={1} style={{paddingVertical: 5, backgroundColor}} key={this.getNextKey()}>
                    <Text style={[styles.bigTitle, {color: color, alignSelf: 'center'}]}>{json.result}</Text>
                    {icon}
                  </Col>)
      }
      let style = {opacity: 0.7, ...backlinksBg}

      let colSize = cols.length && 2 || 3

      cols.push(<Col sm={colSize} md={colSize} lg={colSize} style={style} key={this.getNextKey()}>
                 <Text  style={[styles.hugeTitle, {color, paddingVertical: 10}]}>{translate(prop)}</Text>
                 {!isOnfido  &&  icon}
               </Col>)
      jsonRows.push(<Row size={3} style={styles.gridRow} key={this.getNextKey()} nowrap>
                      {cols}
                    </Row>)

    }
    if (!indent)
      indent = 0
    let textStyle = indent === 1 ||  !isBreakdown  ? styles.bigTitle : styles.title

    if (prop  ||  !isBreakdown) {
      for (let p in json) {
        let jVal = json[p]
        if (typeof jVal === 'object'  ||  p === 'result')
          continue
        let label
        if (!skipLabels  ||  skipLabels.indexOf(p) === -1)
          label = <Text style={[styles.title, {flex: 1, paddingLeft: 10}]}>{utils.makeLabel(p)}</Text>
        let val
        jVal += ''
        if (jVal.indexOf('http://') === 0  ||  jVal.indexOf('https://') === 0)
          val = <Text style={[styles.title, {flex: 1, color: bankStyle.linkColor}]} onPress={() => Linking.openURL(jVal)}>{jVal}</Text>
        else
          val = <Text style={[styles.title, {flex: 1, color: '#2e3b4e'}]}>{jVal}</Text>
        jsonRows.push(<Row size={3} style={styles.gridRow} key={this.getNextKey()} nowrap>
                        <Col sm={1} md={1} lg={1} style={rawStyles.col} key={this.getNextKey()}>
                          {label}
                          </Col>
                        <Col sm={2} md={2} lg={2} style={styles.rowStyle} key={this.getNextKey()}>
                          {val}
                        </Col>
                      </Row>)
      }
    }
    else if (isOnfido  &&  !indent) {
      jsonRows.push(<Row size={3} style={styles.gridRow} key={this.getNextKey()} nowrap>
                      <Col sm={3} md={3} lg={3} style={styles.rowStyle} key={this.getNextKey()}>
                        <Text  style={[styles.bigTitle, {color: color, paddingVertical: 10}]}>{translate('Breakdown')}</Text>
                      </Col>
                    </Row>)

    }
    for (let p in json) {
      if (isOnfido) {
        if  (isBreakdown  && p === 'result')
          continue
        if (p === 'properties')
          continue
      }
      if (prop  &&  hideGroup  &&  hideGroup.indexOf(p) !== -1)
        continue
      let jVal = json[p]
      if (typeof jVal !== 'object')
        continue
      if (utils.isEmpty(jVal)  ||  this.checkIfJsonEmpty(jVal))
        continue
      if (Array.isArray(jVal)) {
        let arrRows = []
        jVal.forEach((js) => {
          if (typeof js === 'object') {
            this.showJson({json: js, isView, jsonRows: arrRows, indent: indent + 1})
            jsonRows.push(<Row size={3} style={styles.rowStyle} key={this.getNextKey()}>
                            <Col sm={3} md={3} lg={3} style={rawStyles.col} key={this.getNextKey()}>
                              <Text style={[styles.bigTitle, {flex: 1, paddingLeft: 10}]}>{utils.makeLabel(p)}</Text>
                            </Col>
                          </Row>)

            jsonRows.push(arrRows)
          }
          else {
            jsonRows.push(<Row size={3} style={styles.rowStyle} key={this.getNextKey()}>
                            <Col sm={1} md={1} lg={1} style={rawStyles.col} key={this.getNextKey()}>
                              <Text style={[styles.title, {flex: 1}]}>{utils.makeLabel(p)}</Text>
                            </Col>
                            <Col sm={2} md={2} lg={2} style={styles.rowStyle} key={this.getNextKey()}>
                              <Text style={[styles.title, {flex: 1, color: '#2e3b4e'}]}>{js + ''}</Text>
                            </Col>
                          </Row>)
          }
        })
        continue
      }
      // HACK for Onfido
      let arrow
      if (showCollapsed  &&  showCollapsed === p)
        arrow = <Icon color={bankStyle.linkColor} size={20} name={'ios-arrow-down'} style={{marginRight: 10, marginTop: 7}}/>

      // HACK for Onfido
      if (p !== 'breakdown') {
        let result
        if (isOnfido && isBreakdown) {
          let color = isBreakdown  &&  jVal.properties ? {color: '#757575'} : {color: jVal.result === 'clear' ?  'green' : 'red'}
          result = <Text style={[textStyle, color]}>{jVal.result}</Text>
        }
        if (result || arrow) {
          jsonRows.push(<Row size={3} style={styles.row} key={this.getNextKey()}>
                          <Col sm={1} md={1} lg={1} style={rawStyles.col} key={this.getNextKey()}>
                            <Text style={textStyle}>{utils.makeLabel(p)}</Text>
                          </Col>
                          <Col sm={2} md={2} lg={2} style={styles.col} key={this.getNextKey()}>
                            {result}
                            {arrow}
                          </Col>
                        </Row>)
        }
        else {
          jsonRows.push(<Row size={3} style={styles.row} key={this.getNextKey()}>
                          <Col sm={3} md={3} lg={3} style={rawStyles.col} key={this.getNextKey()}>
                            <Text style={[textStyle, {paddingLeft: 10}]}>{utils.makeLabel(p)}</Text>
                          </Col>
                        </Row>)
        }
        if (isBreakdown  &&  jVal.properties)
          continue
      }
      else if (isOnfido)
        isBreakdown = true

      let params = {json: jVal, isView, jsonRows, skipLabels, indent: indent + 1, isOnfido, isBreakdown}
      this.showJson(params)
    }
    if (!prop)
      return

    if (showCollapsed  &&  showCollapsed == prop.name) {
      let [header, ...content] = jsonRows
      return <Accordion key={this.getNextKey()}
               sections={[utils.makeLabel(showCollapsed)]}
               header={
                <View>{header}</View>
               }
               content={content}
               underlayColor='transparent'
               easing='easeOutQuad' />
    }
    return jsonRows
  },
  checkIfJsonEmpty(json) {
    for (let p in json) {
      if (!json[p])
        continue
      if (typeof json[p] !== 'object')
        return false
      if (!this.checkIfJsonEmpty(json[p]))
        return false
    }
    return true
  },
  showLoading(params) {
    return uiUtils.showLoading(params)
  },

  addDataSecurity(resource) {
    let { txId, blockchain, networkName } = resource
    let { bankStyle, onPageLayout } = this.props
    let content

    let lstyles = createStyles({bankStyle})

    let header = (<View style={{padding: 10}} key={this.getNextKey()}>
                    <View style={[styles.textContainer, styles.row]}>
                      <Text style={lstyles.bigTitle}>{translate('dataSecurity')}</Text>
                      <Icon color={bankStyle.linkColor} size={20} name={'ios-arrow-down'} style={{marginRight: 10, marginTop: 7}}/>
                    </View>
                    <View style={styles.separator} />
                  </View>)
    if (blockchain === 'corda') {
      let description = 'You\'ll be able to verify this transaction when you launch your Corda node.'
      content = <View style={{paddingHorizontal: 10}}>
                 <View style={{flexDirection: 'row', paddingVertical: 3}}>
                   <Text style={styles.dsTitle}>Blockchain: </Text>
                   <Text style={styles.dsValue}>{blockchain}</Text>
                 </View>
                 <View style={{flexDirection: 'row'}}>
                   <Text style={styles.dsTitle}>Network: </Text>
                   <Text style={styles.dsValue}>{networkName}</Text>
                 </View>
                 <View>
                   <Text style={styles.title}>TxID: </Text>
                   <Text style={styles.dsValue}>{txId}</Text>
                 </View>
                 <Text style={[styles.content, {marginTop: 20}]}>{description}</Text>
                </View>
    }
    else {
      const description = 'This app uses blockchain technology to ensure you can always prove the contents of your data and whom you shared it with.'
      const urls = utils.getBlockchainExplorerUrlsForTx({ blockchain, networkName, txId })
      if (urls.length) {
        const renderRow = (url, i) => {
          url = url.replace('$TXID', txId)
          return this.getBlockchainExplorerRow(url, i, styles)
        }

        const txs = <View>{urls.map(renderRow)}</View>
        content = <View style={{paddingHorizontal: 10}}>
                     <TouchableOpacity onPress={this.onPress.bind(this, 'http://thefinanser.com/2016/03/the-best-blockchain-white-papers-march-2016-part-2.html/')}>
                       <Text style={styles.content}>{description}
                         <Text style={lstyles.learnMore}> Learn more</Text>
                       </Text>
                     </TouchableOpacity>
                     {txs}
                    </View>
      }
    }
    return <Accordion
                sections={['txId']}
                onPress={() => {
                  this.refs.propertySheet.measure((x,y,w,h,pX,pY) => {
                    if (h  &&  y > pY)
                      onPageLayout(pY, h)
                  })
                }}
                header={header}
                content={content}
                underlayColor='transparent'
                easing='easeIn' />
  },
  getBlockchainExplorerRow(url, i, styles) {
    const { bankStyle } = this.props
    let key = `url${i}`
    return (
      <TouchableOpacity onPress={this.onPress.bind(this, url)} key={key}>
        <Text style={[styles.description, {color: bankStyle.linkColor}]}>{translate('independentBlockchainViewer') + ' ' + (i+1)}</Text>
      </TouchableOpacity>
    )
  },
}

var createStyles = utils.styleFactory(component || PhotoList, function ({ dimensions, bankStyle, indent, isView }) {
  indent = indent || 0
  return StyleSheet.create({
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

var styles = StyleSheet.create({
  textContainer: {
    flex: 1
  },
  container: {
    margin: 10,
    flex: 1
  },
  thumb: {
    width:  25,
    height: 25,
    marginRight: 2,
    borderRadius: 5
  },
  itemText: {
    fontSize: 16,
    marginBottom: 0,
    // marginHorizontal: 7,
    color: '#2E3B4E',
    // color: '#757575',
  },
  itemSeparator: {
    height: 1,
    marginTop: 7,
    backgroundColor: '#eeeeee',
    // marginHorizontal: 15
  },
  separator: {
    height: 1,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: -10,
    alignSelf: 'stretch',
    backgroundColor: '#eeeeee'
  },
  item: {
    paddingTop: 7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginRight: 3
  },
  rowStyle: {
    // paddingVertical: 5
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  arrow: {
    position: 'absolute',
    top: 15,
    right: 20
  },
  description: {
    fontSize: 18,
    marginVertical: 3,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  hugeTitle: {
    fontSize: 24,
    // fontFamily: 'Avenir Next',
    // marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7
  },
  bigTitle: {
    fontSize: 20,
    // fontFamily: 'Avenir Next',
    // color: '#7AAAC3',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7
  },
  dsTitle: {
    width: 90,
    fontSize: 16,
    // fontFamily: 'Avenir Next',
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  dsValue: {
    fontSize: 18,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  content: {
    color: '#9b9b9b',
    fontSize: 16,
    marginHorizontal: 7,
    paddingBottom: 10
  },
  gridRow: {
    borderBottomColor: '#f5f5f5',
    paddingVertical: 5,
    // paddingRight: 7,
    borderBottomWidth: 1
  },

})

module.exports = ResourceMixin;
    // let data = {
    //   name: "CE",
    //   children: [
    //     { name: "CE-Oct", size: 5 },
    //     {
    //       name: "CP-Chris\nHulatt",
    //       children: [
    //         { name: "PhotoID" },
    //         {
    //           name: "Info",
    //           children: [
    //             { name: "Selfie", size: 4 },
    //             { name: "Sig", size: 4 }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       name: "CE",
    //       children: [
    //         { name: "CP1", size: 3 },
    //         { name: "CP2", size: 5 }
    //       ]
    //     }
    //   ]
    // }
