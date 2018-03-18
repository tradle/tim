console.log('requiring VerificationView.js')
'use strict';

import ArticleView from './ArticleView'
import utils from '../utils/utils'
var translate = utils.translate
import constants from '@tradle/constants'
import RowMixin from './RowMixin'
import MessageView from './MessageView'
import ResourceMixin from './ResourceMixin'
import ResourceView from './ResourceView'
import reactMixin from 'react-mixin'
import dateformat from 'dateformat'
import Icon from 'react-native-vector-icons/Ionicons'
import { makeResponsive } from 'react-native-orient'

var NOT_SPECIFIED = '[not specified]'
var DEFAULT_CURRENCY_SYMBOL = '£'
const ENUM = 'tradle.Enum'
const VERIFICATION = 'tradle.Verification'
const TYPE = constants.TYPE

import StyleSheet from '../StyleSheet'
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types'

import React, { Component } from 'react'
class VerificationView extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    currency: PropTypes.string,
    bankStyle: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      promptVisible: null,
      documentType: props.resource.document[TYPE]
    }
  }
  render() {
    let resource = this.props.resource
    let vTree = []
    let verifier
    if (resource._verifiedBy)
      verifier = resource._verifiedBy.title
    else if (resource.from.organization)
      verifier = resource.from.organization.title
    else
      verifier = resource.from.title
    return (
       <View style={{width: utils.getContentWidth(VerificationView)}}>
        <View style={[styles.textContainer, {padding: 5, alignSelf: 'stretch', alignItems: 'center', backgroundColor: this.props.bankStyle.verifiedHeaderColor}]}>
          <Text style={[styles.description, {color: this.props.bankStyle.verifiedHeaderTextColor, fontSize:20}]}>{translate('verifiedBy', verifier)}</Text>
        </View>
        {this.renderVerification(resource, utils.getModel(constants.TYPES.VERIFICATION), vTree, 0, 0)}
      </View>
    );
  }

  renderVerification(resource, model, vTree, currentLayer) {
    resource = resource || this.props.resource;
    let vModel = utils.getModel(constants.TYPES.VERIFICATION)
    let bankStyle = this.props.bankStyle
    if (resource.method) {
      let displayName = utils.getDisplayName(resource.method)
      // let val = <View>{this.renderResource(resource, m)}</View>
      vTree.push(<TouchableOpacity onPress={() => this.showMethod(resource)} key={this.getNextKey()}>
                  <View style={{backgroundColor: bankStyle.verifiedBg, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center'}}>
                    <Icon name='ios-add-circle-outline' size={25} color={bankStyle.verifiedTextColor} style={{ marginTop: 2, justifyContent:'center', paddingRight: 3, paddingLeft: 10 * (currentLayer + 1)}} />
                    <View style={{justifyContent: 'center', flexDirection: 'column', paddingLeft: 5, width: utils.dimensions(VerificationView).width - 50}}>
                      <Text style={{color: bankStyle.verifiedTextColor, fontSize: 18}}>{displayName}</Text>
                    </View>
                  </View>
                </TouchableOpacity>)
    }
    else if (resource.sources) {
      let arrow = ''
      for (let i=0; i<currentLayer; i++)
        arrow += '→'
      resource.sources.forEach((r) => {
        if (r.method)
          this.renderVerification(r, model, vTree, currentLayer)
        else if (r.from) {
          vTree.push(<View key={this.getNextKey()}>
                       <View style={styles.separator}></View>
                         <View style={[styles.textContainer, {padding: 10, flexDirection: 'row'}]}>
                           <Icon name='ios-play-outline' size={20} color={bankStyle.verifiedHeaderTextColor} style={{justifyContent: 'center', marginTop: 5, paddingLeft: (currentLayer + 1) * 10}} />
                           <Text style={[styles.description, {color: bankStyle.verifiedSourcesColor}]}>{translate('sourcesBy', r.from.organization ? r.from.organization.title : r.from.title)}</Text>
                         </View>
                      </View>)
          this.renderVerification(r, model, vTree, currentLayer + 1)
        }
      })
    }
    return vTree
  }
  showMethod(r) {
    let m = utils.getModel(utils.getType(r.method))
    this.props.navigator.push({
      title: utils.makeModelTitle(m),
      id: 3,
      component: ResourceView,
      // titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      passProps: {resource: r.method}
    })
  }
  onPress(url, event) {
    this.props.navigator.push({
      id: 7,
      backButtonTitle: 'Back',
      title: utils.getDisplayName(this.props.resource),
      component: ArticleView,
      passProps: {url: url ? url : this.props.resource.url}
    });
  }
  renderResource(r, model) {
    let resource = !r ? this.props.resource : r
    let isVerification = resource[TYPE] === VERIFICATION
    if (isVerification)
      resource = r.method
    let modelName = resource[TYPE];
    if (!model)
      model = utils.getModel(modelName)
    // let model = utils.getModel(modelName);
    let vCols = model.viewCols ? utils.clone(model.viewCols) : null
    let props = model.properties

    if (!vCols) {
      vCols = [];
      for (let p in props) {
        if (p != TYPE)
          vCols.push(p)
      }
    }
    let isMessage = utils.isMessage(resource)
    if (!isMessage) {
      let len = vCols.length;
      for (let i=0; i<len; i++) {
        if (props[vCols[i]].displayName) {
          vCols.splice(i, 1);
          len--;
        }
      }
    }
    let first = true;
    let self = this
    let style = [styles.textContainer, {padding: 10}]
    let retCols = []
    if (isVerification) {
      // If document type of the original verification is not the same as in source
      // Then show link for document to be able to review it
      let dType = utils.getId(r.document).split('_')[0]
      if (this.state.documentType !== dType) {
        let mv = utils.getModel(VERIFICATION)
        retCols.push(
          <View key={this.getNextKey()}>
             <View style={styles.separator}></View>
             <View  style={[style, {backgroundColor: this.props.bankStyle.sourcedVerificationBgColor}]}>
               <TouchableOpacity onPress={this.showResource.bind(this, r.document, dType)} >
                 <Text style={[styles.title, {color: this.props.bankStyle.sourcedVerificationTextColor}]}>{translate(mv.properties.document)}</Text>
                 <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate(utils.getModel(dType))}</Text>
               </TouchableOpacity>
             </View>
          </View>
        )
      }
    }
    let viewCols = vCols.map((p) => {
      let val = resource[p];
      let pMeta = model.properties[p];
      let isRef;
      let isItems
      let isDirectionRow;
      // let isEmail
      if (!val) {
        if (pMeta.displayAs)
          val = utils.templateIt(pMeta, resource);
        else if (this.props.checkProperties) {
          if (p.indexOf('_group') === p.length - 6) {
            return (<View style={{padding: 15}} key={this.getNextKey()}>
                      <View key={this.getNextKey()}  style={{borderBottomColor: this.props.bankStyle.linkColor, borderBottomWidth: 1, paddingBottom: 5}}>
                        <Text style={{fontSize: 22, color: this.props.bankStyle.linkColor}}>{translate(pMeta)}</Text>
                      </View>
                    </View>
             );
          }
          else
            val = NOT_SPECIFIED
        }
        else if (typeof val === 'undefined')
          return;
      }
      else if (pMeta.ref) {
        if (pMeta.ref == constants.TYPES.MONEY) {
          let c = utils.normalizeCurrencySymbol(val.currency)
          let CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol || this.props.currency : DEFAULT_CURRENCY_SYMBOL
          val = (c || CURRENCY_SYMBOL) + val.value
        }
        else if (pMeta.inlined ||  utils.getModel(pMeta.ref).inlined)
          return this.renderResource(val, utils.getModel(val[TYPE]))

        // Could be enum like props
        else if (utils.getModel(pMeta.ref).subClassOf === ENUM)
          val = val.title
        else if (this.props.showVerification) {
          let value = val[TYPE] ? utils.getDisplayName(val) : val.title
          val = <Text style={[styles.title, styles.linkTitle]}>{value}</Text>
          isRef = true;
        }
      }
      else if (pMeta.type === 'date')
        val = dateformat(new Date(val), 'fullDate')
      else if (pMeta.range === 'json') {
        // let jsonRows = []
        let isOnfido = isVerification  && resource.api  &&  resource.api.name === 'onfido'
        let params = {prop: pMeta, json: val, jsonRows: [], isOnfido: isOnfido}
        val = this.showJson(params)
      }
      if (typeof val === 'undefined')
        return <View key={this.getNextKey()}></View>;
      if (!isRef) {
        // isItems = Array.isArray(val)
        if (pMeta.range !== 'json')
          val = this.renderSimpleProp(val, pMeta, modelName, VerificationView)
      }
      let title = pMeta.skipLabel  ||  isItems
                ? <View />
                : <Text style={styles.title}>{pMeta.title || utils.makeLabel(p)}</Text>
      let separator = first
                    ? <View />
                    : <View style={styles.separator}></View>;

      first = false;
      style.push(isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'})

      return (<View key={this.getNextKey()}>
               {separator}
               <View style={isDirectionRow ? {flexDirection: 'row'} : {flexDirection: 'column'}}>
                 <View style={[style, {flexDirection: 'column'}]}>
                   {title}
                   {val}
                 </View>
               </View>
             </View>
             );
    })

    // flatten the tree
    viewCols.forEach((v) => {
      if (v) {
        if (Array.isArray(v))
          v.forEach((vv) => retCols.push(vv))
        else
          retCols.push(v)
      }
    })
    if (resource.txId) {
      retCols.push(<View key={this.getNextKey()}>
                     <View style={styles.separator}></View>
                     <View style={[styles.textContainer, {padding: 10}]}>
                       <Text style={styles.title}>{translate('irrefutableProofs')}</Text>
                       <TouchableOpacity onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + resource.txId)}>
                         <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 1'}</Text>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={this.onPress.bind(this, 'https://test-insight.bitpay.com/tx/' + resource.txId)}>
                         <Text style={[styles.description, {color: '#7AAAC3'}]}>{translate('independentBlockchainViewer') + ' 2'}</Text>
                       </TouchableOpacity>
                      </View>
                    </View>)
    }
    return retCols;
  }
  showResource(r, type) {
    let route = {
      title: translate(utils.getModel(type)),
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
      passProps: {
        bankStyle: this.props.bankStyle,
        resource: r,
        currency: this.props.currency
      }
    }
    this.props.navigator.push(route)
  }
}
reactMixin(VerificationView.prototype, RowMixin);
reactMixin(VerificationView.prototype, ResourceMixin);
VerificationView = makeResponsive(VerificationView)

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginHorizontal: 15
  },
  description: {
    fontSize: 18,
    marginVertical: 3,
    marginHorizontal: 7,
    color: '#2E3B4E',
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    marginBottom: 0,
    marginHorizontal: 7,
    color: '#9b9b9b'
  },
  linkTitle: {
    color: '#2892C6',
    fontSize: 16
  },
});

module.exports = VerificationView
