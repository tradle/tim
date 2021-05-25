
import React, { Component } from 'react'
import {
  TouchableOpacity,
  Image,
  View,
} from 'react-native'
import PropTypes from 'prop-types'

import Reflux from 'reflux'
import Icon from 'react-native-vector-icons/Ionicons'
import _ from 'lodash'
import reactMixin from 'react-mixin'
import { makeResponsive } from 'react-native-orient'
import {Column as Col, Row} from 'react-native-flexbox-grid'

import { Text } from './Text'
import Actions from '../Actions/Actions'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import {
  translate,
  getEnumValueId,
  isEnum,
  getType,
  makeModelTitle,
  getModel,
  templateIt,
  getDisplayName,
  splitMessage,
  formatCurrency
} from '../utils/utils'

import { circled } from '../styles/utils'
import Store from '../Store/Store'
import StyleSheet from '../StyleSheet'

import constants from '@tradle/constants'
var {
  TYPE,
  ROOT_HASH,
} = constants

var {
  FORM,
  MONEY,
  MESSAGE
} = constants.TYPES

const PHOTO = 'tradle.Photo'
const APPLICATION = 'tradle.Application'
const CHECK = 'tradle.Check'

class ApplicationTreeRow extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    gridCols: PropTypes.array.isRequired,
  };
  constructor(props) {
    super(props)
    const { resource, navigator, chosen, multiChooser, node } = props
    this.state = {
      isConnected: navigator.isConnected,
      resource,
      node
    }
    this.showTreeNode = this.showTreeNode.bind(this)
  }
  render()  {
    let { resource, gridCols, bankStyle, rowId, depth, node } = this.props

    let colSize =  1

    let key = this.getNextKey(resource)
    let justifyContent = 'center'
    let gCols = Object.keys(gridCols)
    let cols = gCols.map((v, i) => {
      let cSize = i === 0  &&  colSize + depth || colSize
      return <Col sm={cSize} md={cSize} lg={cSize} style={[styles.col, {justifyContent}]} key={key + v}>
        {this.formatCol(v, i) || <View />}
      </Col>
    })

    let size = gCols.length + depth
    return <Row size={size} style={styles.gridRow} key={key} nowrap>
             {cols}
           </Row>
  }
  formatCol(pName, colIdx) {
    let { resource, node, bankStyle, gridCols } = this.props

    if (!node[pName])
      return
    let model = getModel(APPLICATION);
    let level = node.node_level
    let r = {
             id: `${node._t}_${node._permalink}`,
             title: node._displayName
           }
    if (colIdx === 0) {
      let approved
      let cellStyle = { paddingLeft: 7 }
      if (node.status === 'approved') {
        approved = <Icon name='ios-done-all' size={30} color='green' style={{marginLeft: 10}}/>
        cellStyle.flexDirection = 'row'
        cellStyle.justifyContent = 'space-between'
      }

      let style = {alignSelf: 'flex-start', fontSize: 14, fontWeight: '600', paddingHorizontal: 10, marginLeft: 30 * level, color: bankStyle.linkColor, marginTop: approved && 7 || 0}
      return <TouchableOpacity onPress={this.showTreeNode.bind(this, {stub: r})}>
               <View style={cellStyle}><Text style={style}>{node[pName] + ''}</Text>{approved}</View>
             </TouchableOpacity>
    }
    // Handle MESSAGE type RL accross providers
    let properties = model.properties;
    let colProp = properties[pName]

    let gProps = gridCols[pName]
    let { backlink, filter, units, valueColor, type, range } = gProps
    let style = [styles.description]
    let value = node[pName] + (units || '')

    let link = typeof gProps === 'object'  &&  gProps.link
    let isTime = range === 'time'
    if (isTime)
      value = this.stringifyTime(value)

    if (link) {
      let style // = {alignSelf: 'flex-start', fontWeight: '600', paddingHorizontal: 10, marginLeft: 30 * level, color: bankStyle.linkColor, marginTop: 0}
      if (colProp  &&  (colProp.type === 'number' || colProp.type === 'date')  ||  gProps.type === 'number')
        style = {alignSelf: 'flex-end', paddingRight: 10, fontWeight: '600', color: bankStyle.linkColor, marginTop: 0 }
      else
        style = {alignSelf: 'flex-start', fontWeight: '600', paddingHorizontal: 10, marginLeft: 30 * level, color: bankStyle.linkColor, marginTop: 0}
      let self = this
      return <TouchableOpacity onPress={() => self[link]({stub: r, openChat: true, applicantName: node.node_displayName})}>
               <View style={styles.cellStyle}><Text style={style} key={this.getNextKey(node)}>{value}</Text></View>
             </TouchableOpacity>
    }
    if (!colProp) {
      let bgColor = typeof gProps === 'object' && gProps[node[pName]+'']
      if (!bgColor) bgColor = valueColor
      if (!units)
        units  =  ''
      if (typeof node[pName] === 'number' || isTime) {
        style.push({alignSelf: 'flex-end', paddingRight: 10})

        if (backlink) {
          return <TouchableOpacity onPress={this.showBacklinks.bind(this, gProps)}>
                   <View style={[styles.cellStyle, {backgroundColor: bgColor || '#fff'}]}>
                     <Text style={style} key={this.getNextKey(node)}>{value}</Text>
                   </View>
                 </TouchableOpacity>
        }
      }
      return <View style={[styles.cellStyle, {backgroundColor: bgColor || '#fff'}]}><Text style={style} key={this.getNextKey(node)}>{value}</Text></View>
    }


    if (colProp.style)
      style.push(colProp.style);
    let ref = colProp.ref;
    let row

    if (ref)
      return this.showRef(node, pName, ref)

    if (colProp.type === 'date')
      return <View style={[styles.cellStyle, {alignSelf: 'center'}]}>{this.addDateProp(pName)}</View>
    if (node[pName]  &&  (typeof node[pName] != 'string')) {
      if (colProp.type === 'number')
        style.push({alignSelf: 'flex-end', paddingRight: 10})

      if (backlink  &&  filter) {
        return <TouchableOpacity onPress={this.showBacklinks.bind(this, gProps)}>
                 <View style={styles.cellStyle}><Text style={style}>{node[pName] + ''}</Text></View>
               </TouchableOpacity>
      }
      return <View style={styles.cellStyle}><Text style={style} key={this.getNextKey(node)}>{node[pName] + ''}</Text></View>
    }
    if (!node[pName]  && (node[pName].indexOf('http://') === 0  ||  node[pName].indexOf('https://') === 0))
      return <View style={styles.cellStyle}><Text style={style} key={this.getNextKey(node)}>{node[pName]}</Text></View>

    let val = colProp.displayAs ? templateIt(colProp, node) : node[pName];
    if (colProp.range === 'model')
      return <View style={styles.cellStyle}><Text style={style}>{makeModelTitle(getModel(val))}</Text></View>

    let msgParts = splitMessage(val);
    if (msgParts.length <= 2)
      val = msgParts[0];
    else {
      val = '';
      for (let i=0; i<msgParts.length - 1; i++)
        val += msgParts[i];
    }
    val = val  &&  val.replace(/\*/g, '')  ||  getDisplayName({ resource: node })
    return <View style={styles.cellStyle}><Text style={style}>{val}</Text></View>
  }
  stringifyTime(value) {
    let hours = value / 60
    let minutes
    if (hours < 1)
      return `${value}m`
    if (hours < 24) {
      hours = Math.floor(hours)
      minutes = Math.round((value / 3600) * 10)/10
      if (minutes >= 0.1)
        hours += minutes
      return `${hours}h`
    }
    let days = Math.floor(hours / 24)
    if (days < 365) {
      hours = Math.round(Math.floor(hours % 24) * 10 / 24)/10
      if (hours >= 0.1)
        days += hours
      return `${days}d`
    }
    let months = Math.floor(days / 30)
    days = Math.floor(days % 30)
    if (months < 12) {
      let daysFraction = Math.round(days * 10 / 30)/10
      if (daysFraction >= 0.1)
        months += daysFraction
      return `${months}m`
    }
    let years = Math.floor(months / 12)
    months = Math.floor(months % 12)
    let monthsFraction = Math.round(months * 10 / 12) /10
    if (monthsFraction > 0.1)
      years += monthsFraction
    return `${years}y`
  }
  paintIcon(model, eVal) {
    let { icon, color } = eVal
    return <View style={[styles.button, {alignItems: 'center', backgroundColor: color}]}>
             <Icon name={icon} color='#ffffff' size={25}/>
           </View>
  }
  showRef(node, pName, ref) {
    if (!node[pName])
      return

    const { locale } = this.props
    let style = [styles.description]
    let refM = getModel(ref)
    let model = getModel(APPLICATION);

    let row
    if (ref === MONEY) {
      style.push({alignSelf: 'flex-end', paddingRight: 10})
      let val
      if (locale)
        val = formatCurrency(node[pName], locale)
      else
        val = node[pName].currency + node[pName].value
      row = <Text style={style} key={this.getNextKey(node)}>{val}</Text>
      // row = <Text style={style} key={this.getNextKey(node)}>{node[pName].currency + node[pName].value}</Text>
    }
    else if (ref === PHOTO)
      row = <Image source={{uri: node[pName].url}} style={styles.thumb} />
    else {
      let title = getDisplayName({ resource: node[pName] })
      row = <Text style={styles.description} key={this.getNextKey(node)}>{title}</Text>

      if (isEnum(refM)) {
        let eVal = refM.enum.find(r => r.id === getEnumValueId({model: refM, value: node[pName]}))
        if (eVal) {
          let { icon, color } = eVal
          if (icon) {
            row = <View key={this.getNextKey(node)} style={styles.row}>
                    {this.paintIcon(model, eVal)}
                    <View style={{paddingLeft: 5, justifyContent: 'center'}}>
                      {row}
                    </View>
                  </View>
          }
        }
      }
      else if (refM.isInterface || refM.id === FORM) {
        let resType = getType(node[pName])
        let resM = getModel(resType)
        row = <View key={this.getNextKey(node)}>
                <Text style={styles.type}>{translate(resM)}</Text>
                {row}
              </View>
      }
    }
    return <View style={styles.cellStyle}>{row}</View>
  }
  showScoreDetails({stub, applicantName}) {
    Actions.showScoreDetails(stub, applicantName)
  }
  showBacklinks(col) {
    let { resource, navigator, bankStyle, node } = this.props
    let { backlink, filter } = col

    let r = {
              id: `${node._t}_${node._permalink}`,
              title: node._displayName
            }

    backlink = getModel(node[TYPE]).properties[backlink]
    let route = {
      title: node._displayName,
      componentName: node[TYPE] === APPLICATION && 'ApplicationView' || 'MessageView',
      backButtonTitle: 'Back',
      passProps: {
        resource: r,
        tab: backlink,
        bankStyle,
        checkFilter: filter  &&  filter.status.id.split('_')[1],
        application: resource
      }
    }
    navigator.push(route)
  }
}
reactMixin(ApplicationTreeRow.prototype, Reflux.ListenerMixin);
reactMixin(ApplicationTreeRow.prototype, RowMixin)
reactMixin(ApplicationTreeRow.prototype, ResourceMixin)
ApplicationTreeRow = makeResponsive(ApplicationTreeRow)

var styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 5,
  },
  col: {
    paddingVertical: 5,
  },
  cellStyle: {
    paddingLeft: 7
  },
  type: {
    fontSize: 18,
    color: '#555555'
  },
  description: {
    fontSize: 14,
    color: '#555555'
  },
  gridRow: {
    borderBottomColor: '#f5f5f5',
    paddingVertical: 5,
    paddingRight: 7,
    borderBottomWidth: 1
  },
  icon: {
    width: 25,
    height: 25,
    marginTop: -3
  },
  thumb: {
    width: 40,
    height: 40
  },
  multiChooser: {
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginRight: 10,
    backgroundColor: 'transparent'
  },
  button: {
    ...circled(25),
    shadowOpacity: 0.7,
    opacity: 0.9,
    shadowRadius: 5,
    shadowColor: '#afafaf',
  },
});

module.exports = ApplicationTreeRow;
