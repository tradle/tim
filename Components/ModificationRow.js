import React, { Component } from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import PropTypes from 'prop-types';
// import {
//   View,
// } from 'react-native-lazyload'

import dateformat from 'dateformat'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'

import constants from '@tradle/constants'
const { TYPE } = constants

import { translate, getModel, styleFactory, isEnum } from '../utils/utils'
import RowMixin from './RowMixin'
import StyleSheet from '../StyleSheet'

import { Text } from './Text'

const MODIFICATION = 'tradle.Modification'

class ModificationRow extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    this.state = {
      resource: this.props.resource
    }
  }
  render() {
    let { resource, onSelect, parentResource } = this.props
    let model = getModel(MODIFICATION);

    let { modifications } = resource
    let { dataLineage } = modifications

    let json = dataLineage &&  dataLineage || modifications
    let title = dataLineage && translate('prefill') || translate('clientEdit')
    let styles = createStyles({bankStyle: this.props.bankStyle})
    let date = dateformat(resource.dateModified, 'mmm dS, yyyy h:MM TT')
    let header = (
      <View style={[styles.headerRow, {flexDirection: 'row', justifyContent: 'space-between'}]} key='modificationsHeader'>
        <Text style={{fontSize: 16, color: '#aaa'}}>{translate(title)}</Text>
        <Text style={{color: '#aaa', fontSize: 12}}>{date}</Text>
      </View>
    )
    let rows = []
    this.paintHistory({json, rows, styles, model: getModel(parentResource[TYPE])})
    return <View style={styles.modifications} key='modifications'>
            {header}
            {rows}
          </View>

  }
  paintHistory({json, rows, model, styles}) {
    let props = model.properties
    let icon, color
    let size = 3
    let isProperties
    for (let p in json) {
      let isChanged
      let isRemoved
      let v = json[p]
      let iconName
      if (typeof v == 'object') {
        // continue
        if (p === 'added') {
          iconName = 'ios-add-circle-outline'
          color = 'green'
        }
        else if (p === 'changed') {
          iconName = 'ios-create-outline'
          color = 'darkblue'
          isChanged = true
          // isChanged = true
        }
        else if (p === 'removed') {
          iconName = 'ios-remove-circle-outline'
          isRemoved = true
          color = 'red'
        }
        else if (p !== 'properties') {
          rows.push(<View style={styles.gridRow} key={this.getNextKey()}>
                      <Text  style={styles.pTitle}>{translate(p)}</Text>
                    </View>)
          this.paintHistory({json:v, rows, model, styles})
          continue
        }
      }

      if (!color) color = '#aaa'
      if (icon)
        icon = <Icon name={iconName} size={20} color={color} style={styles.icon} key={this.getNextKey()} />
      else
        icon = <View style={styles.icon} />
      let cols = []
      if (isChanged) {
        this.paintChange({json:v, cols, model, styles, icon})
      }
      else if (typeof v === 'object') {
        for (let part in v) {
          let prop = props[part]
          let val = v[part]
          if (isRemoved)
            val = ''
          else if (prop  &&  prop.type === 'date')
            val = dateformat(val, 'mmm dS, yyyy h:MM TT')
          let label = prop && translate(prop, model) || part
          cols.push(<View style={styles.col} key={this.getNextKey()}>
                     <View style={{flexDirection: 'row', flex: 1}}>
                       {icon}
                       <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
                     </View>
                     <View style={{flex: 1}}>
                       <Text  style={[styles.pTitle, {color: '#555'}]} key={this.getNextKey()}>{val}</Text>
                     </View>
                   </View>)
        }
      }
      else {
        let prop = props[p]
        let label = prop && translate(prop, model) || p
        let val = v
        if (prop  &&  prop.type === 'date')
          val = dateformat(val, 'mmm dS, yyyy h:MM TT')
        cols.push(<View style={styles.col} key={this.getNextKey()}>
                   <View style={{flexDirection: 'row', flex: 1}}>
                     {icon}
                     <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
                   </View>
                   <View style={{flex: 1}}>
                     <Text  style={[styles.pTitle, {color: '#555'}]} key={this.getNextKey()}>{val}</Text>
                   </View>
                 </View>)
        // continue
      }
      rows.push(<View key={p}>
                  {cols}
                </View>)
    }
  }
  paintChange({json, cols, styles, model, icon}) {
    let props = model.properties

    for (let p in json) {
      let prop = props[p]
      let label = prop && translate(prop, model) || p
      let pair = json[p]
      let val
      switch (prop.type) {
      case 'date':
        val = dateformat(pair.new, 'mmm dS, yyyy h:MM TT')
        val = <Text  style={[styles.pTitle, {color: '#555'}]} key={this.getNextKey()}>{val}</Text>
        break
      case 'object':
        if (prop.ref) {
          val = <Text  style={[styles.pTitle, {color: '#555'}]} key={this.getNextKey()}>{pair.new.title}</Text>
          if (!isEnum(prop.ref)) {
            val = <TouchableOpacity onPress={this.showRefResource.bind(this, pair.new, prop)}>
                   {val}
                 </TouchableOpacity>
          }
          break
        }
      default:
        val = <Text  style={[styles.pTitle, {color: '#555'}]} key={this.getNextKey()}>{pair.new}</Text>
      }
      cols.push(
        <View style={styles.col} key={this.getNextKey()}>
          <View style={{flexDirection: 'row', flex: 1}}>
            {icon}
            <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
            <Text  style={[styles.pTitle, {color: '#999', paddingRight: 20, fontStyle: 'italic'}]} key={this.getNextKey()}>{translate('newValue')}</Text>
            {val}
          </View>
        </View>
       )
    }
  }
}

reactMixin(ModificationRow.prototype, RowMixin);

var createStyles = styleFactory(ModificationRow, function ({ dimensions, hasRM, isRM, bankStyle }) {
  return StyleSheet.create({
    headerRow: {
      fontSize: 24,
      backgroundColor: 'aliceblue',
      padding: 10,
    },
    gridRow: {
      backgroundColor: '#f7f7f7',
      paddingHorizontal: 10
    },
    bigTitle: {
      fontSize: 20,
      color: '#777',
    },
    pTitle: {
      fontSize: 16,
      color: bankStyle.linkColor,
      paddingVertical: 10,
    },
    icon: {
      padding: 10
    },
    modifications: {
      paddingVertical: 5,
      backgroundColor: 'transparent',
    },
    col: {
      flexDirection: 'row',
      paddingRight: 10
    }
  })
})
module.exports = ModificationRow;
