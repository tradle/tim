
import React, { Component } from 'react'
import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/Ionicons';

import constants from '@tradle/constants'
import { makeResponsive } from 'react-native-orient'

import {Column as Col, Row} from 'react-native-flexbox-grid'
import utils, {
  translate, translateForGrid
} from '../utils/utils'
import StyleSheet from '../StyleSheet'
import { circled } from '../styles/utils'

const { MONEY } = constants.TYPES
const PHOTO = 'tradle.Photo'
const APPLICATION = 'tradle.Application'

class ApplicationTreeHeader extends Component {
  static propTypes = {
    gridCols: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props)
    this.getIcon = this.getIcon.bind(this)
  }
  render() {
    let { gridCols, depth, sizes, offset } = this.props
    if (!gridCols)
      return <View />
    const model = utils.getModel(APPLICATION)
    const props = model.properties
    let gCols = Object.keys(gridCols)
    let self = this
    let descriptionHeader = []
    let hasDescription
    let cols = gCols.map((p, i) => {
      let prop = props[p]
      let textStyle
      let isNumber, label, icon, color, isDate
      let val = gridCols[p]
      if (prop) {
        isDate = prop.type === 'date'
        isNumber = prop.type === 'number'  ||  prop.ref === MONEY
      }

      let description
      if (typeof val === 'object') {
        isNumber = isNumber || val.type === 'number'
        label = val.label
        if (val.label)
          label = translate(label).toUpperCase()
        else if (prop)
          label = translateForGrid({property: prop, model}).toUpperCase()
        if (val.icon)
          ({icon, color} = self.getIcon(val))
        description = val.description
      }
      else
        label = translate(val).toUpperCase()

      if (isNumber || isDate)
        textStyle = {alignSelf: 'flex-end', paddingRight: 10}
      // else if (isDate)
      //   textStyle = {alignSelf: 'center'}
      else
        textStyle = {}

      let title
      if (icon)
        title = <View style={[textStyle, {marginTop: 3}]}>{this.paintIcon({icon, color: color || '#757575'})}</View>
      else if (label)
        title = <Text style={[styles.cell, textStyle]}>
                  {label}
                </Text>

      if (description) {
        description = <Text style={[styles.cellD, textStyle]}>
                        {translate(description)}
                      </Text>
        hasDescription = true
      }
      else
        description = <View/>
      let size
      if (sizes)
        size = sizes[i]
      else
        size = i === 0 && depth + 1 || 1
      descriptionHeader.push(
             <Col sm={size} md={size} lg={size} style={styles.colD} key={p}>
               {description}
             </Col>
            )
      return <Col sm={size} md={size} lg={size} style={styles.col} key={p}>
               {title}
             </Col>
    })
    if (offset) {
      descriptionHeader.splice(0, 0,
             <Col sm={offset} md={offset} lg={offset} style={styles.colD} key='_offsetHeader'>
               <View/>
             </Col>
            )
      cols.splice(0, 0,
        <Col sm={offset} md={offset} lg={offset} style={styles.col} key='_offsetHeader'>
          <View/>
        </Col>
      )
    }

    let size
    if (sizes) {
      size = depth
      sizes.forEach(s => size += s)
    }
    else
      size = depth + gCols.length
    if (offset)
      size += offset
    let description
    if (hasDescription)
      description = <Row size={size} style={styles.dHeaderRow} key='Datagrid_h3' nowrap>
                      {descriptionHeader}
                    </Row>

    return (
      <View key='Datagrid_h1'>
        {description}
        <Row size={size} style={styles.headerRow} key='Datagrid_h2' nowrap>
          {cols}
        </Row>
      </View>
    )

  }
  getIcon(val) {
    let { icon, color } = val
    let type = utils.getType(icon)
    if (!type)
      return {icon, color}
    let id = icon.split('_')[1]
    let m = utils.getModel(type)
    if (m) {
      let elm = utils.getModel(type).enum.find(e => e.id === id)
      if (elm) {
        icon = elm.icon
        color = elm.color
      }
    }
    if (!icon)
      icon = val.icon
    if (!color)
      color = '#757575'
    return {icon, color}
  }
  paintIcon(eVal) {
    let { icon, color } = eVal
    return <View style={[styles.button, {alignItems: 'center', backgroundColor: color}]}>
             <Icon name={icon} color='#ffffff' size={20}/>
           </View>
  }
}
ApplicationTreeHeader = makeResponsive(ApplicationTreeHeader)

var styles = StyleSheet.create({
  col: {
    paddingVertical: 5,
  },
  colD: {
    paddingVertical: 5,
    justifyContent: 'flex-end'
  },
  cell: {
    paddingVertical: 5,
    fontSize: 14,
    paddingLeft: 7
  },
  cellD: {
    paddingVertical: 5,
    fontSize: 12,
    color: '#777777',
    paddingLeft: 7,
    justifyContent: 'flex-end'
  },
  dHeaderRow: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    backgroundColor: '#e7e7e7'
  },
  button: {
    ...circled(20),
    shadowOpacity: 0.7,
    opacity: 0.9,
    shadowRadius: 5,
    shadowColor: '#afafaf',
  },
});

module.exports = ApplicationTreeHeader;
