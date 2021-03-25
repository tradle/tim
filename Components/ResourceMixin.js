import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react'
import {
  Text,
  View,
  ActivityIndicator,
  Linking,
  TouchableOpacity
} from 'react-native'
import {Column as Col, Row} from 'react-native-flexbox-grid'
// import JSONTree from 'react-native-json-tree'

import constants from '@tradle/constants'

var { TYPE } = constants
var { PROFILE, ORGANIZATION, MONEY, MESSAGE } = constants.TYPES

import StyleSheet from '../StyleSheet'
import PhotoList from './PhotoList'
import NetworkInfoProvider from './NetworkInfoProvider'
import Accordion from './Accordion'
import Actions from '../Actions/Actions'
import PageView from './PageView'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import utils, { translate, formatNumber } from '../utils/utils'
import platformStyles from '../styles/platform'
import Image from './Image'
import uiUtils from '../utils/uiUtils'
import GridHeader from './GridHeader'
import GridRow from './GridRow'

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

import Markdown from './Markdown'
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
    let { bankStyle, navigator, resource, currency, locale } = this.props
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
          displayName = type === 'object' && pVal.title ||  pVal
          if (typeof displayName === 'object')
            displayName = JSON.stringify(displayName, null, 2)
          ret.push(<View style={{flexDirection: isWeb && 'row' || 'column', paddingVertical: 3}}>
                     <View style={styles.itemContent}>
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
            // value = (c || pCurrency) + pVal.value
            value = (c || pCurrency) + formatNumber(itemMeta, pVal.value, locale)
          }
          else
            value = pVal.title  ||  utils.getDisplayName({ resource: pVal, model: utils.getModel(ref) })        }
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
          let { width } = utils.dimensions(component)
          item = <View style={{width: width - 40}}>
                   <TouchableOpacity underlayColor='transparent' onPress={editItem.bind(this, prop, v)}>
                      {item}
                   </TouchableOpacity>
                   {cancel}
                 </View>
        }
        else if (cancelItem  &&  !hadCancel) {
          hadCancel = true
          item = <TouchableOpacity underlayColor='transparent' onPress={cancelItem.bind(this, prop, v)}>
                   <View style={styles.row}>
                     {item}
                     <View style={{position: 'absolute', top: 0, right: 7}}>
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
        let item = <View style={{flexDirection: 'row', paddingVertical: 7}}>
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
        <View key={this.getNextKey()} style={styles.item} >
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
      val = <Text style={styles.description}>{val ? 'Yes' : 'No'}</Text>;
    if (pMeta.signature) {
      let { width } = utils.dimensions(component)
      let h = 200
      let w = width - 40
      return <View style={styles.container}>
              <Image style={{maxWidth: w, height: h}} source={{uri: val}} resizeMode='contain'/>
            </View>
    }
    if (typeof val === 'string'  &&  pMeta.type !== 'object'  &&  (val.indexOf('http://') == 0  ||  val.indexOf('https://') === 0))
      return <Text onPress={this.onPress.bind(this, val)} style={[styles.description, {color: bankStyle.textColor}]}>{val}</Text>;
    // else if (modelName === TERMS_AND_CONDITIONS) {
    //   val = <Text style={[styles.description, {flexWrap: 'wrap'}]}>{val}</Text>;
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

  showJson(params) {
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
    let { resource, bankStyle } = this.props
    bankStyle = bankStyle || defaultBankStyle

    let rType = resource[TYPE]

    let hideGroup = prop  &&  hideGroupInJSON[rType]
    let showCollapsed = showCollapsedMap  &&  showCollapsedMap[rType]
    skipLabels = !skipLabels  &&  prop  &&  skipLabelsInJSON[rType]  &&  skipLabelsInJSON[rType][prop]

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
          val = <Text style={[styles.title, {flex: 1, color: '#555555'}]}>{jVal}</Text>
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
                              <Text style={[styles.title, {flex: 1, color: '#555555'}]}>{js + ''}</Text>
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
               header={header}
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
    color: '#757575',
  },
  itemSeparator: {
    height: 1,
    marginTop: 5,
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
  // showJson(params) {
  //   let { json, prop, isView } = params
  //   let { resource, bankStyle } = this.props
  //   const theme = {
  //     scheme: 'custom',
  //     base00: '#ffffff', // background
  //     base01: '#272935',
  //     base02: '#3a4055',
  //     base03: '#5a647e',
  //     base04: '#d4cfc9',
  //     base05: '#e6e1dc',
  //     base06: '#f4f1ed',
  //     base07: '#f9f7f3',
  //     base08: '#da4939',
  //     base09: bankStyle.confirmationColor, // number
  //     base0A: '#ffc66d',
  //     base0B: bankStyle.linkColor, // string
  //     base0C: '#519f50',
  //     base0D: '#757575', // label
  //     base0E: '#b6b3eb',
  //     base0F: '#bc9458'
  //   };
  //   json = utils.sanitize(json)
  //   let backgroundColor = isView ? bankStyle.linkColor : bankStyle.verifiedHeaderColor
  //   let color = isView ? '#ffffff' : bankStyle.verifiedHeaderTextColor
  //   let style = {opacity: 0.7, backgroundColor, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginHorizontal: isView ? 0 : -10, marginBottom: 10}

  //   let icon
  //   const rType = resource[TYPE]
  //   const showCollapsed = showCollapsedMap  &&  showCollapsedMap[rType]
  //   // if (showCollapsed  &&  showCollapsed === prop.name)
  //   //   icon = <Icon size={20} name='ios-arrow-down' color='#ffffff' style={styles.arrow} />
  //   let header = <TouchableOpacity onPress={() => {
  //     this.state.hidden ? this.setState({hidden: false}) : this.setState({hidden: true})
  //   }} style={style} key={this.getNextKey()}>
  //                  <Text  style={[styles.hugeTitle, {color, paddingVertical: 10}]}>{translate(prop)}</Text>
  //                  {icon}
  //               </TouchableOpacity>
  //   let content = (
  //     <View ref='json'>
  //       <JSONTree data={json} invertTheme={false} hideRoot={true} theme={{
  //           extend: theme,
  //           nestedNodeItemString: ({ style }, nodeType, expanded) => ({
  //             style: {
  //               ...style,
  //               fontSize: 18
  //             }
  //           })
  //         }}
  //         shouldExpandNode = {(keyName, data, level) => {
  //           if (!keyName.length)
  //             return this.state.hidden && false || true
  //           else
  //             return false
  //         }}
  //         getItemString={(type, data, itemType, itemString) => {
  //           if (type === 'Array')
  //             return <Text style={{fontSize: 16}}>{itemType} {itemString}</Text>
  //           if (type === 'Object')
  //             return
  //           return <Text style={{fontSize: 16}}>{itemType} {itemString}</Text>
  //         }}
  //         labelRenderer={(raw, nodeType, expanded, hasItems) => {
  //           const isArray = nodeType === 'Array'
  //           // if (isArray  &&  !hasItems) {
  //           //   return <View style={{height: 0}} />
  //           const isObject = nodeType === 'Object'
  //           let val = isObject && raw[0] || `${raw[0]}:`
  //           return <Text style={{ padding: 15, paddingLeft: (isObject || isArray) && 7 || 15, fontSize: 16 }}>{val}</Text>
  //         }}
  //         valueRenderer={raw => {
  //           if (typeof raw === 'string')
  //             raw = raw.replace(/['"]+/g, '')
  //           return <Text style={{ padding: 15, fontSize: 16 }}>{raw}</Text>
  //         }}
  //       />
  //     </View>
  //   )
  //   return <View>
  //             {header}
  //             {content}
  //          </View>
  // },
