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

import { translate, translateEnum, getModel, styleFactory, isEnum } from '../utils/utils'
import RowMixin from './RowMixin'
import ResourceMixin from './ResourceMixin'
import { circled } from '../styles/utils'

import StyleSheet from '../StyleSheet'

import { Text } from './Text'

const MODIFICATION = 'tradle.Modification'
const STATUS = 'tradle.Status'

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
        <Text style={{fontSize: 18, color: '#757575'}}>{translate(title)}</Text>
        <Text style={{color: '#757575', fontSize: 12}}>{date}</Text>
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
    let bankStyle = this.props.bankStyle
    for (let p in json) {
      let isChanged
      let isRemoved
      let prop = props[p]
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
        else if (prop) {
          let label = translate(prop, model)

          if (prop.ref  &&  isEnum(prop.ref)) {
            let val = v.title
            if (!v.title) {
              if (v.id) {
                let id = v.id.split('_')[1]
                val = getModel(prop.ref).enum.find(e => e.id === id)
                if (val)
                  val = val.title
                else
                  continue
              }
            }
            rows.push(<View style={styles.col} key={this.getNextKey()}>
                       <View style={{flexDirection: 'row', flex: 1}}>
                         {icon}
                         <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
                       </View>
                       <View style={{flex: 1}}>
                         <Text  style={styles.sourceTitle} key={this.getNextKey()}>{val}</Text>
                       </View>
                     </View>)
          }
          else if (p === 'checks')
            this.addChecks(v, p, rows, styles)
          continue
        }
        else if (p === 'check') {
          let label = translate(p)
          let val = translate(v.displayName || v._displayName)
          let { status } = v
          if (!status)
            status = {id: `${STATUS}_fail`}
          let id = status.id.split('_')[1]

          let m = getModel(STATUS)
          let elm = m.enum.find(e => e.id === id)
          if (elm) {
            ({ icon, color} = elm)

            icon = <View style={[styles.checkButton, {alignItems: 'center', marginTop: 10, backgroundColor: color}]}>
                     <Icon name={icon} size={17} color='#fff' />
                   </View>
          }
          let hash = v.hash || v._permalink
          rows.push(<View style={styles.checkRow} key={this.getNextKey()}>
                      <View style={{flexDirection: 'row', flex: 1}}>
                        <View style={{flex: 1}}>
                          <Text  style={[styles.pTitle, {color: '#999999', paddingHorizontal: 10}]}>{label}</Text>
                        </View>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                          <TouchableOpacity onPress={() => this.showRefResource({
                            id: `${v.type}_${hash}_${hash}`,
                            title: label
                          })}>
                           <Text  style={[styles.pTitle, {paddingRight: 5}]}>{val}</Text>
                          </TouchableOpacity>
                          {icon}
                        </View>
                      </View>
                    </View>)
          continue
        }
        else if (v._permalink) {
          let label = translate(p)
          let val = translate(v._displayName)
          rows.push(<View style={styles.gridRow} key={this.getNextKey()}>
                      <View style={{flexDirection: 'row', flex: 1}}>
                        <View style={{flex: 1}}>
                          <Text  style={[styles.pTitle, {color: '#999999', paddingLeft: 10}]}>{label}</Text>
                        </View>
                        <View style={{flex: 1}}>
                          <TouchableOpacity onPress={() => this.showRefResource({
                            id: `${v[TYPE]}_${v._permalink}_${v._link}`,
                            title: label
                          })}>
                           <Text  style={styles.pTitle}>{val}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>)
          continue
        }
        else if (p !== 'properties') {
          let title
          let [etype, id] = p.split('_')
          if (id) {
            let m = getModel(etype)
            if (m  && isEnum(m)) {
              let val = m.enum.find(e => e.id === id)
              if (val) {
                if (val.details)
                  title = translate(val.details)
                else
                  title = translateEnum({id: p})
              }
            }
          }
          if (!title)
             title = translate(p)
          rows.push(<View style={styles.gridRow} key={this.getNextKey()}>
                      <Text  style={styles.sourceTitle}>{title}</Text>
                    </View>)
          this.paintHistory({json:v, rows, model, styles})
          continue
        }
      }

      if (!color) color = '#757575'
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
          let pprop = props[part]
          let val = v[part]
          let isLink
          if (isRemoved)
            val = ''
          else if (pprop)
            val = this.getVal(pprop, val)

          let label = pprop && translate(pprop, model) || part
          cols.push(<View style={styles.col} key={this.getNextKey()}>
                     <View style={{flexDirection: 'row', flex: 1}}>
                       {icon}
                       <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
                     </View>
                     <View style={{flex: 1}}>
                       <Text  style={styles.sourceTitle} key={this.getNextKey()}>{val}</Text>
                     </View>
                   </View>)
        }
      }
      else {
        let label = prop && translate(prop, model) || p
        let val = v
        if (prop)
          val = this.getVal(prop, val)
        cols.push(<View style={styles.col} key={this.getNextKey()}>
                   <View style={{flexDirection: 'row', flex: 1}}>
                     {icon}
                     <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
                   </View>
                   <View style={{flex: 1}}>
                     <Text  style={styles.sourceTitle} key={this.getNextKey()}>{val}</Text>
                   </View>
                 </View>)
        // continue
      }
      rows.push(<View key={p}>
                  {cols}
                </View>)
    }
  }
  getVal(prop, val) {
    if (prop.type === 'date')
      val = dateformat(val, 'mmm dS, yyyy h:MM TT')
    else if (prop.type === 'boolean')
      val = val  &&  translate('Yes') || translate('No')
    else if (prop.ref) {
      if (isEnum(prop.ref))
        val = translateEnum(val)
      else
        val = val.title ||  val._displayName
    }
    return val
  }
  addChecks(checks, p, rows, styles) {
    let label = translate(p)
    let bankStyle = this.props.bankStyle
    let icon, color
    checks.forEach(v => {
      let val = translate(v.displayName || v._displayName)
      let { status } = v
      if (!status)
        status = {id: `${STATUS}_fail`}
      let id = status.id.split('_')[1]

      let m = getModel(STATUS)
      let elm = m.enum.find(e => e.id === id)
      if (elm) {
        ({ icon, color} = elm)
        icon = <View style={[styles.checkButton, {alignItems: 'center', marginTop: 10, backgroundColor: color}]}>
                 <Icon name={icon} size={17} color='#fff' />
               </View>
      }
      let hash = v.hash || v._permalink
      rows.push(<View style={styles.checkRow} key={this.getNextKey()}>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <View style={{flex: 1}}/>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                      {icon}
                      <TouchableOpacity onPress={() => this.showRefResource({
                        id: `${v.type}_${hash}_${hash}`,
                        title: label
                      })}>
                       <Text  style={[styles.pTitle, {paddingLeft: 5}]}>{val}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>)
    })

  }
  paintChange({json, cols, styles, model, icon}) {
    let props = model.properties

    for (let p in json) {
      let prop = props[p]
      let label = prop && translate(prop, model) || p
      let pair = json[p]
      let val
      let value = this.getVal(prop, pair.new)
      debugger
      switch (prop.type) {
      case 'date':
        val = dateformat(pair.new, 'mmm dS, yyyy h:MM TT')
        val = <Text  style={styles.sourceTitle} key={this.getNextKey()}>{val}</Text>
        break
      case 'object':
        if (prop.ref) {
          // HACK

          let refR = pair.new
          let title = refR.title
          if (!title  &&  refR._displayName) {
            title = refR._displayName
            refR = {
              id: `${refR[TYPE]}_${refR._permalink}_${refR._link}`,
              title
            }
          }

          if (!title)
            continue
          let isEnumProp = isEnum(prop.ref)
          val = <Text  style={isEnumProp && styles.sourceTitle || styles.pTitle}>{title}</Text>
          if (!isEnumProp) {
            val = <TouchableOpacity onPress={this.showRefResource.bind(this, refR, prop)}>
                   {val}
                 </TouchableOpacity>
          }
          break
        }
      default:
        val = <Text  style={styles.sourceTitle} key={this.getNextKey()}>{pair.new}</Text>
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

reactMixin(ModificationRow.prototype, RowMixin)
reactMixin(ModificationRow.prototype, ResourceMixin)

var createStyles = styleFactory(ModificationRow, function ({ dimensions, hasRM, isRM, bankStyle }) {
  return StyleSheet.create({
    headerRow: {
      // fontSize: 24,
      backgroundColor: 'aliceblue',
      padding: 10,
    },
    gridRow: {
      backgroundColor: '#f7f7f7',
      paddingHorizontal: 10
    },
    checkRow: {
      paddingHorizontal: 10
    },
    pTitle: {
      fontSize: 16,
      color: bankStyle.linkColor,
      paddingVertical: 10,
    },
    sourceTitle: {
      fontSize: 16,
      color: '#757575',
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
    },
    checkButton: {
      ...circled(17),
      shadowOpacity: 0.7,
      opacity: 0.9,
      shadowRadius: 5,
      shadowColor: '#afafaf',
    },
  })
})
module.exports = ModificationRow;
