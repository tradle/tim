
import React, { Component } from 'react'
import {
  TouchableOpacity,
  Image,
  View,
  Text,
} from 'react-native'
import PropTypes from 'prop-types'

import Reflux from 'reflux'
import Icon from 'react-native-vector-icons/Ionicons'
import _ from 'lodash'
import reactMixin from 'react-mixin'
import { makeResponsive } from 'react-native-orient'
import {Column as Col, Row} from 'react-native-flexbox-grid'

import Actions from '../Actions/Actions'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import utils, { translate, getEnumValueId } from '../utils/utils'
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
    let model = utils.getModel(APPLICATION);
    let level = node.node_level
    let cellStyle = {/*paddingVertical: 5,*/ paddingLeft: 7}
    if (colIdx === 0) {
      let approved
      if (node.status === 'approved') {
        approved = <Icon name='ios-done-all' size={30} color='green' style={{marginLeft: 10}}/>
        cellStyle.flexDirection = 'row'
      }
      let r = {
                 id: `${node._t}_${node._permalink}`,
                 title: node._displayName
               }
      let style = {alignSelf: 'flex-start', fontWeight: '600', paddingHorizontal: 10, marginLeft: 30 * level, color: bankStyle.linkColor, marginTop: approved && 7 || 0}
      return <TouchableOpacity onPress={this.showTreeNode.bind(this, r)}>
               <View style={cellStyle}><Text style={style} key={this.getNextKey(node)}>{node[pName] + ''}</Text>{approved}</View>
             </TouchableOpacity>
    }
    // Handle MESSAGE type RL accross providers
    let properties = model.properties;
    let colProp = properties[pName]

    let { backlink, filter, units, valueColor } = gridCols[pName]
    let style = [styles.description]
    if (!colProp) {
      let bgColor, units = ''
      if (typeof node[pName] === 'number') {
        bgColor = typeof gridCols[pName] === 'object' && gridCols[pName][node[pName]+'']
        if (!bgColor) bgColor = valueColor
        if (!units)
          units  =  ''
        style.push({alignSelf: 'flex-end', paddingRight: 10})
        if (backlink  &&  filter) {
          return <TouchableOpacity onPress={this.showBacklinks.bind(this, gridCols[pName])}>
                   <View style={[cellStyle, {backgroundColor: bgColor || '#fff'}]}>
                     <Text style={style} key={this.getNextKey(node)}>{node[pName] + units}</Text>
                   </View>
                 </TouchableOpacity>
        }
      }
      return <View style={[cellStyle, {backgroundColor: bgColor || '#fff'}]}><Text style={style} key={this.getNextKey(node)}>{node[pName] + units}</Text></View>
    }

    if (colProp.style)
      style.push(colProp.style);
    let ref = colProp.ref;
    let row

    if (ref) {
      if (!node[pName])
        return

      let refM = utils.getModel(ref)
      if (ref === MONEY) {
        style.push({alignSelf: 'flex-end', paddingRight: 10})
        row = <Text style={style} key={this.getNextKey(node)}>{node[pName].currency + node[pName].value}</Text>
      }
      else if (ref === PHOTO)
        row = <Image source={{uri: node[pName].url}} style={styles.thumb} />
      else {
        let title = utils.getDisplayName(node[pName])
        row = <Text style={styles.description} key={this.getNextKey(node)}>{title}</Text>

        if (utils.isEnum(refM)) {
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
          let resType = utils.getType(node[pName])
          let resM = utils.getModel(resType)
          row = <View key={this.getNextKey(node)}>
                  <Text style={styles.type}>{translate(resM)}</Text>
                  {row}
                </View>
        }
      }
      return <View style={cellStyle}>{row}</View>
    }
    if (colProp.type === 'date')
      return <View style={cellStyle}>{this.addDateProp(pName)}</View>

    if (node[pName]  &&  (typeof node[pName] != 'string')) {
      if (colProp.type === 'number')
        style.push({alignSelf: 'flex-end', paddingRight: 10})

      if (backlink  &&  filter) {
        return <TouchableOpacity onPress={this.showBacklinks.bind(this, gridCols[pName])}>
                 <View style={cellStyle}><Text style={style} key={this.getNextKey(node)}>{node[pName] + ''}</Text></View>
               </TouchableOpacity>
      }
      else
        return <View style={cellStyle}><Text style={style} key={this.getNextKey(node)}>{node[pName] + ''}</Text></View>
    }
    if (!node[pName]  && (node[pName].indexOf('http://') === 0  ||  node[pName].indexOf('https://') === 0))
      // return <View style={cellStyle}><Text style={style} onPress={this.onPress.bind(this, node)} key={this.getNextKey(node)}>{node[pName]}</Text></View>
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(node)}>{node[pName]}</Text></View>

    let val = colProp.displayAs ? utils.templateIt(colProp, node) : node[pName];
    let msgParts = utils.splitMessage(val);
    if (msgParts.length <= 2)
      val = msgParts[0];
    else {
      val = '';
      for (let i=0; i<msgParts.length - 1; i++)
        val += msgParts[i];
    }
    val = val  &&  val.replace(/\*/g, '')  ||  utils.getDisplayName(node)
    return <View style={cellStyle}><Text style={style} key={this.getNextKey(node)}>{val}</Text></View>
  }
  paintIcon(model, eVal) {
    let { icon, color } = eVal
    return <View style={[styles.button, {alignItems: 'center', backgroundColor: color}]}>
             <Icon name={icon} color='#ffffff' size={25}/>
           </View>
  }
  showBacklinks(col) {
    let { resource, navigator, bankStyle, node } = this.props
    let { backlink, filter } = col

    let r = {
              id: `${node._t}_${node._permalink}`,
              title: node._displayName
            }

    backlink = utils.getModel(node[TYPE]).properties[backlink]
    let route = {
      title: node._displayName,
      componentName: node[TYPE] === APPLICATION && 'ApplicationView' || 'MessageView',
      backButtonTitle: 'Back',
      passProps: {
        resource: r,
        backlink,
        bankStyle,
        checkFilter: filter.status.id.split('_')[1],
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
  type: {
    fontSize: 18,
    color: '#555555'
  },
  description: {
    fontSize: 16,
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
