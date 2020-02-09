
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
  translate
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
  render() {
    let { gridCols, depth } = this.props
    if (!gridCols)
      return <View />

    let props = utils.getModel(APPLICATION).properties
    let gCols = Object.keys(gridCols)
    let cols = gCols.map((p, i) => {
      let prop = props[p]
      let textStyle
      let isNumber, label, icon, color
      let val = gridCols[p]
      if (prop)
        isNumber = prop.type === 'number'  ||  prop.ref === MONEY

      if (typeof val === 'object') {
        isNumber = isNumber || val.type === 'number'
        label = val.label
        if (val.icon) {
          let type = utils.getType(val.icon)
          if (type) {
            let id = val.icon.split('_')[1]
            let elm = utils.getModel(type).enum.find(e => e.id === id)
            icon = elm.icon
            color = elm.color
          }
        }
      }
      else
        label = val
      if (isNumber)
        textStyle = {alignSelf: 'flex-end', paddingRight: 10}
      else
        textStyle = {}

      let title
      if (icon)
        title = <View style={[textStyle, {marginTop: 3}]}>{this.paintIcon({icon, color: color || '#757575'})}</View>
      else
        title = <Text style={[styles.cell, textStyle]}>
                    {translate(label).toUpperCase()}
                  </Text>

      let size = i === 0 && depth + 1 || 1
      return <Col sm={size} md={size} lg={size} style={styles.col} key={p}>
               {title}
             </Col>
    })
    let size = depth + gCols.length
    return <View style={styles.gridHeader} key='Datagrid_h1'>
            <Row size={size} style={styles.headerRow} key='Datagrid_h2' nowrap>
              {cols}
            </Row>
          </View>

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
  cell: {
    paddingVertical: 5,
    fontSize: 14,
    paddingLeft: 7
  },
  headerRow: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
  },
  gridHeader: {
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
