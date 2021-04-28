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

const { TYPE } = constants
const { PROFILE, ORGANIZATION, MONEY, MESSAGE } = constants.TYPES

import ShowPropertiesView from './ShowPropertiesView'
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
import GridHeader from './GridHeader'
import GridRow from './GridRow'
import Markdown from './Markdown'

// import { VictoryContainer } from 'victory'

const RESOURCE_VIEW = 'ResourceView'
const MESSAGE_VIEW = 'MessageView'
const APPLICATION_VIEW = 'ApplicationView'
const RESOURCE_LIST = 'ResourceList'
const CHECK_VIEW = 'CheckView'

const debug = utils.logger('ResourceMixin')
const NOT_SPECIFIED = '[not specified]'
const TERMS_AND_CONDITIONS = 'tradle.TermsAndConditions'
const APPLICATION = 'tradle.Application'
const CHECK = 'tradle.Check'
const MODIFICATION = 'tradle.Modification'
const DEFAULT_CURRENCY_SYMBOL = '$'

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

var component

var ResourceMixin = {
  showRefResource(resource, prop, isDataLineage) {
    let type = utils.getType(resource)
    let model = utils.getModel(type);
    let title = utils.getDisplayName({ resource })
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

  renderItems({value, prop, cancelItem, editItem, component}) {
    let { bankStyle, navigator, resource, currency } = this.props
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
      let hasEdit
      vCols.forEach((p) =>  {
        let itemMeta = itemsMeta[p];
        let { type, displayAs, displayName, range, ref, skipLabel, items } = itemMeta
        let pVal = v[p]
        if (!pVal  &&  !displayAs)
          return
        if (displayName &&  !editItem) {
          let displayingPart = type === 'object' && pVal.title ||  pVal
          if (typeof displayingPart === 'object') {
            if (itemMeta.ref  &&  displayingPart[TYPE]) {
              // displayingPart = JSON.stringify(utils.getDisplayName({resource: displayingPart}), null, 2)
              ret.push(
                <View style={{paddingVertical: 3}}>
                  <View style={{paddingVertical: 3, alignItems: 'center', backgroundColor: 'aliceblue'}}>
                    <Text style={[{fontWeight: 600}, styles.itemText]}>{translate(utils.getModel(displayingPart[TYPE]))}</Text>
                  </View>
                  <ShowPropertiesView resource={displayingPart}
                                      currency={currency}
                                      bankStyle={bankStyle}
                                      navigator={navigator} />
                </View>
                )
              return
            }
            else
              displayingPart = JSON.stringify(displayingPart, null, 2)
            ret.push(<View style={{flexDirection: isWeb && 'row' || 'column', paddingVertical: 3}}>
                       <View style={styles.itemContent}>
                         <Text style={skipLabel ? {height: 0} : [styles.itemText, {color: '#999999'}]}>{itemMeta.skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
                         <Text style={styles.itemText}>{displayingPart}</Text>
                       </View>
                       {!isView  &&  <View style={{flex: 1}}/>}
                     </View>)
          }
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
                     <View style={styles.itemContent}>
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
            let pCurrency = pVal.currency
            if (!pCurrency) {
              pCurrency = currency  &&  currency.symbol
              if (!pCurrency)
                pCurrency = DEFAULT_CURRENCY_SYMBOL
            }

            let c = utils.normalizeCurrencySymbol(pCurrency)
            value = (c || pCurrency) + pVal.value
          }
          else
            value = pVal.title  ||  utils.getDisplayName({ resource: pVal, model: utils.getModel(ref) });
        }
        else
          value = pVal.title;

        if (!value)
          return
        let item = <View style={{flexDirection: isWeb && 'row' || 'column', paddingVertical: 3}}>
                     <View style={styles.itemContent}>
                       <Text style={skipLabel ? {height: 0} : [styles.itemText, {color: '#999999'}]}>{skipLabel ? '' : itemMeta.title || utils.makeLabel(p)}</Text>
                       <Text style={styles.itemText}>{value}</Text>
                     </View>
                     {!isView  &&  <View style={{flex: 1}}/>}
                   </View>
        if (editItem  &&  !hasEdit) {
          hasEdit = true
          let cancel
          if (cancelItem  &&  !hadCancel)  {
            hadCancel = true
            cancel = <View style={{position: 'absolute', top: 0, right: 10}}>
                       <TouchableOpacity underlayColor='transparent' onPress={cancelItem.bind(this, prop, v)}>
                        <Icon name='ios-close-circle-outline' size={28} color={linkColor} />
                       </TouchableOpacity>
                     </View>
          }
          let width = utils.getContentWidth(component)
          item = <View style={[{width: width - 40}]}>
                   <TouchableOpacity underlayColor='transparent' onPress={editItem.bind(this, prop, v)}>
                     {item}
                   </TouchableOpacity>
                   {cancel}
                 </View>
        }
        else if (cancelItem  &&  !hadCancel) {
          hadCancel = true
          item = <TouchableOpacity underlayColor='transparent' onPress={cancelItem.bind(this, prop, v)}>
                   <View style={[{width: utils.getContentWidth(component) - 40}]}>
                     {item}
                     <View style={{position: 'absolute', top: 0, right: 10}}>
                       <Icon name='ios-close-circle-outline' size={28} color={linkColor} />
                     </View>
                   </View>
                 </TouchableOpacity>
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
    if (Array.isArray(val))
      return this.renderSimpleArrayProp(val, pMeta, modelName, component)

    let { units } = pMeta
    if (units === '%')
      val += units
    else if (units  &&  units.charAt(0) != '[')
      val += ' ' + units

    if (val === NOT_SPECIFIED)
      return <Text style={[styles.description, {color: bankStyle.linkColor}]}>{val}</Text>
    if (typeof val === 'number')
      return <Text style={styles.description}>{val}</Text>;
    if (typeof val === 'boolean')
      return <Text style={styles.description}>{val ? 'Yes' : 'No'}</Text>;
    if (pMeta.signature) {
      let { width } = utils.dimensions(component)
      let h = 200
      let w = width - 40
      return <View style={styles.container}>
              <Image style={{maxWidth: w, height: h}} source={{uri: val}} resizeMode='contain'/>
            </View>
    }
    if (typeof val === 'string'  &&  pMeta.type !== 'object'  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
      return <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: bankStyle.linkColor}]}>{val}</Text>;
    if (pMeta.markdown) {
      return <View style={styles.container}>
              <Markdown markdownStyles={uiUtils.getMarkdownStyles(bankStyle)}>
                {val}
              </Markdown>
            </View>
    }
    if (pMeta.range === 'model')
      val = translate(utils.getModel(val))
    else if (pMeta.range === 'password')
      val = '*********'
    return <Text style={[styles.description]}>{val}</Text>;
  },
  renderSimpleArrayProp(val, pMeta, modelName, component) {
    if (pMeta.items.backlink)
      return <View  key={this.getNextKey()} />
    if (pMeta.grid)
      return this.renderSimpleGrid(val, pMeta, component)

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
      return <View key={this.getNextKey()}>
                {separator}
                <Accordion
                  sections={[title]}
                  header={header}
                  content={val}
                  underlayColor='transparent'
                  easing='easeIn' />
             </View>
    else
      return <View key={this.getNextKey()}>
               {titleEl}
               {val}
             </View>
  },

  renderSimpleGrid(value, prop, component) {
    if (prop.items.backlink)
      return <View  key={this.getNextKey()} />

    let { navigator, locale, currency, bankStyle } = this.props
    const modelName = prop.items.ref

    let gridCols = uiUtils.getGridCols(modelName)
    if (!gridCols)
      return
    let header = <GridHeader gridCols={gridCols} modelName={modelName} navigator={navigator}/>

    let rows = []
    for (let i=0; i<value.length; i++) {
      rows.push(
          <GridRow
            key={'_' + prop.name}
            isSmallScreen={false}
            modelName={modelName}
            navigator={navigator}
            currency={currency}
            locale={locale}
            gridCols={gridCols}
            resource={value[i]}
            bankStyle={bankStyle} />
          );
    }
    return <View>
       {header}
       {rows}
     </View>
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
      data.name = utils.getDisplayName({ resource }).split(' ').slice(0, 2).join('\n')
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
    let r
    if (resource &&  id === utils.getId(resource))
      r = resource
    else
      r = { id }
    navigator.push({
      componentName: isApplication ? APPLICATION_VIEW : MESSAGE_VIEW,
      backButtonTitle: 'Back',
      title,
      passProps: {
        bankStyle,
        resource: r
      }
    })
  },
  openApplicationChat(resource) {
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
        resource: resource._context,
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
    color: '#555555',
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
    color: '#555555',
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
    color: '#555555',
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
  itemContent: {
    flex: 9,
    flexDirection: utils.isWeb() && 'row' || 'column',
    justifyContent: 'space-between'
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
