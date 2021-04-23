import React, { Component } from 'react'
import {
  TouchableOpacity,
  View,
  Linking
} from 'react-native'
import PropTypes from 'prop-types';
import _ from 'lodash'

import dateformat from 'dateformat'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'

import constants from '@tradle/constants'
const { TYPE } = constants

import { translate, translateEnum, getModel, styleFactory, isEnum, getRootHash } from '../utils/utils'
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
  shouldComponentUpdate(nextProps, nextState) {
    return false
  }
  render() {
    let { resource, onSelect, parentResource, bankStyle } = this.props
    let model = getModel(MODIFICATION);

    let { modifications } = resource
    let { dataLineage, initialSubmission } = modifications

    let json = dataLineage &&  dataLineage || modifications
    let title
    if (!dataLineage) {
      title = translate('clientEdit')
      if (initialSubmission) {
        title = `${title} - ${translate('initialSubmission')}`
        json = initialSubmission
      }
    }
    else {
      title = translate('prefill')
      if (_.size(dataLineage) === 1) {
        let p = Object.keys(dataLineage)[0]
        let [etype, id] = p.split('_')

        let m = getModel(etype)
        if (m  && isEnum(m)) {
          let val = m.enum.find(e => e.id === id)
          if (val) {
            if (val.details)
              title = `${title} - ${translate(val.details)}`
            else
              title = `${title} - ${translateEnum({id: p})}`
          }
          json = dataLineage[p]
        }
      }
    }
    let idx = parentResource.modificationHistory.length - parentResource.modificationHistory.findIndex(r => getRootHash(r) === getRootHash(resource))
    let styles = createStyles({bankStyle})
    let date = dateformat(resource.dateModified, 'mmm dS, yyyy h:MM TT')
    let header = (
      <View style={{flexDirection: 'row', backgroundColor:'aliceblue'}}>
        <View style={[styles.numberButton, {marginLeft: 10, marginTop: 10, backgroundColor: bankStyle.linkColor}]}>
          <Text style={{fontSize: 14, color: '#ffffff'}}>{idx}</Text>
        </View>
        <View style={styles.headerRow} key='modificationsHeader'>
          <Text style={styles.headerTitle}>{translate(title)}</Text>
          <Text style={styles.headerDate}>{date}</Text>
        </View>
      </View>
    )
    let rows = []
    this.paintHistory({json, rows, styles, model: getModel(parentResource[TYPE]), dataLineage})
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
      let doContinue
      if (typeof v == 'object') {
        ({iconName, color, isChanged, isRemoved, doContinue} = this.parseObject({p, v, icon, rows, model, styles}))
        if (doContinue)
          continue
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
          let pVal
          if (Array.isArray(val)) {
            pVal = <View key={this.getNextKey()}>
                   {val.map(v => <Text  style={styles.sourceTitle} key={this.getNextKey()}>{v.title}</Text>)}
                </View>
          }
          else {
            let valToShow = val
            if (typeof val === 'object')   {
              // if (pprop.range === 'json')
              //   continue
              // else
                valToShow = JSON.stringify(val, null, 2)
            }
            pVal = <View key={this.getNextKey()}>
                     <Text  style={styles.sourceTitle} key={this.getNextKey()}>{valToShow}</Text>
                   </View>
          }
          let label = pprop && translate(pprop, model) || part
          cols.push(<View style={styles.row} key={this.getNextKey()}>
                     <View style={styles.label}>
                       {icon}
                       <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
                     </View>
                     <View style={styles.value}>
                       {pVal}
                     </View>
                   </View>)
        }
      }
      else {
        let label = prop && translate(prop, model) || translate(p)
        let val = v
        if (prop)
          val = this.getVal(prop, val)
        let isUrl = prop  &&  prop.range === 'url'
        if (isUrl && val.length > 55)
          val = `${val.slice(0, 55)}...`

        let value = <View style={styles.value}>
                      <Text  style={isUrl && styles.pTitle || styles.sourceTitle} key={this.getNextKey()}>{val}</Text>
                    </View>

        if (isUrl) {
          value = <TouchableOpacity onPress={() => Linking.openURL(val)}  style={styles.value}>
                    {value}
                  </TouchableOpacity>
        }
        cols.push(<View style={styles.row} key={this.getNextKey()}>
                   <View style={styles.label}>
                     {icon}
                     <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
                   </View>
                   {value}
                 </View>)
        // continue
      }
      rows.push(<View key={p}>
                  {cols}
                </View>)
    }
  }
  parseObject({p, v, rows, model, styles, icon}) {
    // continue
    if (p === 'added')
      return {iconName: 'ios-add-circle-outline', color: 'green'}
    if (p === 'changed')
      return {iconName: 'ios-create-outline', color: 'darkblue', isChanged: true}
    if (p === 'removed')
      return {iconName: 'ios-remove-circle-outline', color: 'red', isRemoved: true}

    let prop = model.properties[p]
    if (prop) {
      this.paintProp({prop, model, value:v, rows, styles, icon})
      return {doContinue: true}
    }
    if (v._permalink) {
      let label = translate(p)
      let val = translate(v._displayName)
      rows.push(<View style={styles.gridRow} key={this.getNextKey()}>
                  <View style={styles.label}>
                    <View style={styles.value}>
                      <Text  style={[styles.pTitle, {color: '#999999', paddingLeft: 10}]}>{label}</Text>
                    </View>
                    <View style={styles.value}>
                      <TouchableOpacity onPress={() => this.showRefResource({
                        id: `${v[TYPE]}_${v._permalink}_${v._link}`,
                        title: label
                      })}>
                       <Text  style={styles.pTitle}>{val}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>)
      return {doContinue: true}
    }
    if (p !== 'properties') {
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
      let addPart
      if (title.startsWith('Pitchbook')) {
        title = 'Pitchbook'
        addPart = <Text  style={[styles.sourceTitle, {paddingLeft: 10, color:'red'}]}>{translate('nonAuthoritative')}</Text>
      }
      rows.push(<View style={[styles.gridRow, {flexDirection: 'row'}]} key={this.getNextKey()}>
                  <Text  style={styles.sourceTitle}>{title}</Text>
                  {addPart}
                </View>)
      this.paintHistory({json:v, rows, model, styles})
      return {doContinue: true}
    }
    return {}
  }
  paintProp({prop, model, value, rows, styles, icon}) {
    let label = translate(prop, model)
    let pName = prop.name
    if (pName === 'checks'  &&  prop.type === 'array') {
      this.addChecks(value, pName, rows, styles)
      return
    }

    if (!prop.ref  ||  !isEnum(prop.ref))
      return
    let val = value.title
    if (!value.title) {
      if (value.id) {
        let id = value.id.split('_')[1]
        val = getModel(prop.ref).enum.find(e => e.id === id)
        if (!val)
          return
        val = val.title
      }
    }
    rows.push(<View style={styles.row} key={this.getNextKey()}>
               <View style={styles.label}>
                 {icon}
                 <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
               </View>
               <View style={styles.value}>
                 <Text  style={styles.sourceTitle} key={this.getNextKey()}>{val}</Text>
               </View>
             </View>)
  }
  getVal(prop, val) {
    if (prop.type === 'date')
      val = dateformat(val, 'mmm dS, yyyy h:MM TT')
    else if (prop.type === 'boolean')
      val = val  &&  translate('Yes') || translate('No')
    else if (prop.ref  &&  (typeof val === 'object')) {
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
        icon = <View style={[styles.checkButton, {alignItems: 'center', marginTop: 5, backgroundColor: color}]}>
                 <Icon name={icon} size={17} color='#fff' style={{marginTop: 2}} />
               </View>
      }
      let hash = v.hash || v._permalink
      rows.push(<View style={styles.row}  key={this.getNextKey()}>
                  <View style={{flex: 1}}/>
                  <View style={styles.label}>
                    {icon}
                    <TouchableOpacity onPress={() => this.showRefResource({
                      id: `${v.type}_${hash}_${hash}`,
                      title: label
                    })}>
                     <Text  style={[styles.pTitle, {paddingLeft: 5}]}>{val}</Text>
                    </TouchableOpacity>
                  </View>
                </View>)
    })

  }
  paintChange({json, cols, styles, model, icon}) {
    let props = model.properties

    for (let p in json) {
      let prop = props[p]
      if (prop  &&  prop.readOnly)
        continue
      let label = prop && translate(prop, model) || p
      let pair = json[p]
      let val
      let value = this.getVal(prop, pair.new)
      // debugger
      switch (prop.type) {
      case 'date':
        val = dateformat(pair.new, 'mmm dS, yyyy h:MM TT')
        val = <Text  style={styles.sourceTitle} key={this.getNextKey()}>{val}</Text>
        break
      case 'array':
        val = <View>
                 {val.map(v => <Text  style={styles.sourceTitle} key={this.getNextKey()}>{v.title}</Text>)}
              </View>
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
        <View style={styles.row} key={this.getNextKey()}>
          <View style={styles.label}>
            {icon}
            <Text  style={[styles.pTitle, {color: '#999'}]} key={this.getNextKey()}>{label}</Text>
          </View>
          <View style={styles.label}>
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
      backgroundColor: 'aliceblue',
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      flex: 1
    },
    headerTitle: {
      fontSize: 20,
      color: '#757575'
    },
    headerDate: {
      color: '#757575',
      fontSize: 12
    },
    label: {
      flexDirection: 'row',
      flex: 1
    },
    value: {
      flex: 1
    },
    gridRow: {
      backgroundColor: '#f7f7f7',
      paddingHorizontal: 10,
    },
    pTitle: {
      fontSize: 16,
      color: bankStyle.linkColor,
      paddingVertical: 5,
    },
    sourceTitle: {
      fontSize: 16,
      color: '#757575',
      paddingVertical: 5,
    },
    icon: {
      paddingLeft: 5,
      paddingTop: 3,
      paddingRight: 1
    },
    modifications: {
      // paddingVertical: 5,
      backgroundColor: 'transparent',
    },
    row: {
      flexDirection: 'row',
      paddingRight: 10
    },
    numberButton: {
      ...circled(25),
      shadowOpacity: 0.7,
      opacity: 0.9,
      shadowRadius: 5,
      shadowColor: '#afafaf',
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
