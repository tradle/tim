
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

import RowMixin from './RowMixin'
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
  PROFILE,
  FORM,
  MONEY,
  MESSAGE
} = constants.TYPES

const PHOTO = 'tradle.Photo'
const OBJECT = 'tradle.Object'
const CHECK = 'tradle.Check'

class GridRow extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    gridCols: PropTypes.array.isRequired,
    multiChooser: PropTypes.bool,
    isSmallScreen: PropTypes.bool,
    chosen: PropTypes.bool,
  };
  constructor(props) {
    super(props)
    const { resource, navigator, chosen, multiChooser } = props
    this.state = {
      isConnected: navigator.isConnected,
      resource,
    }
    if (multiChooser) {
      // multivalue ENUM property
      if (chosen  &&  chosen[utils.getId(resource)])
        this.state.isChosen = true
      else
        this.state.isChosen = false
    }
    if (resource[TYPE] === PROFILE)
      this.state.unread = resource._unread
  }
  componentDidMount() {
    this.listenTo(Store, 'onRowUpdate');
  }
  componentWillReceiveProps(props) {
    let { chosen, multiChooser, resource } = props
    if (multiChooser)  {
      if (chosen  &&  chosen[utils.getId(resource)])
        this.state.isChosen = true
      else
        this.state.isChosen = false
    }
  }
  onRowUpdate(params) {
    let { action, application, online, resource } = params
    switch (action) {
    case 'onlineStatus':
      if (resource  &&  resource[ROOT_HASH] === this.props.resource[ROOT_HASH])
        this.setState({serverOffline: !online})
      break
    case 'connectivity':
      this.setState({isConnected: params.isConnected})
      break
    case 'assignRM_Confirmed':
      if (application[ROOT_HASH] === this.props.resource[ROOT_HASH])
        this.setState({application, resource: application})
      break
    case 'updateRow':
      let hash = utils.getRootHash(params.resource)
      if (hash === utils.getRootHash(this.props.resource)) {
        if (params.forceUpdate)
          this.setState({forceUpdate: this.state.forceUpdate ? false : true, resource: resource})
        else
          this.setState({unread: params.resource._unread})
      }

      break
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (utils.resized(this.props, nextProps))
      return true
    if (Object.keys(this.props).length  !== Object.keys(nextProps).length)
      return true
    if (this.props.chosen !== nextProps.chosen)
      return true
    if (this.state.forceUpdate !== nextState.forceUpdate)
      return true
    if (this.state.application !== nextState.application)
      return true
    if (this.props.resource.lastMessage !== nextProps.resource.lastMessage)
      return true
    if (this.state.unread !== nextState.unread)
      return true
    if (this.state.serverOffline !== nextState.serverOffline)
      return true
    if (this.props.hideMode !== nextProps.hideMode)
      return true
    if (nextState.sharedWith  &&  nextState.sharedWith === this.state.sharedWith)
      return true
    if (Object.keys(this.state).length  !== Object.keys(nextState).length)
      return true

    let opts = {strict: true}
    for (let p in this.props) {
      if (typeof this.props[p] === 'function') {
        if ('' + this.props[p] !== '' + nextProps[p])
          return true
      }
      else if (this.props[p] !== nextProps[p]) {
        if (!_.isEqual(this.props[p], nextProps[p]))
          return true
      }
    }
    for (let p in this.state) {
      if (this.state[p] !== nextState[p]) {
        if (typeof this.state[p] !== 'object')
          return true
        if (!_.isEqual(this.state[p], nextState[p], opts))
          return true
      }
    }
    return false
  }
  render()  {
    let { multiChooser, resource, modelName, rowId, gridCols, bankStyle, isSmallScreen } = this.props
    let size
    let isMessage = modelName === MESSAGE
    if (isMessage)
      size = gridCols.length
    else if (gridCols) {
      let model = utils.getModel(modelName)
      let props = model.properties

      let vCols = gridCols.filter((c) => props[c].type !== 'array')
      gridCols = vCols
      size = Math.min(gridCols.length, 12)
      if (size < gridCols.length)
        gridCols.splice(size, gridCols.length - size)
    }
    let colSize =  isSmallScreen ? size / 2 : 1
    if (multiChooser)
      size++

    let key = this.getNextKey(resource)
    let cols
    let justifyContent = isMessage ? 'flex-start' : 'center'
    if (gridCols  &&  gridCols.length) {
      cols = gridCols.map((v) => (
        <Col sm={colSize} md={1} lg={1} style={[styles.col, {justifyContent}]} key={key + v}>
          {this.formatCol(v) || <View />}
        </Col>
      ))
    }
    else {
      let m = utils.getModel(modelName)
      let rModel = utils.getModel(resource[TYPE])
      let typeTitle
      if (rModel.id !== m.id  &&  utils.isSubclassOf(rModel, m.id))
        typeTitle = <Text style={styles.type}>{translate(rModel)}</Text>
      let cellStyle = {paddingVertical: 5, paddingLeft: 7}
      cols = [<View style={cellStyle}>
               {typeTitle}
               <Col sm={1} md={1} lg={1} style={[styles.col, {justifyContent}]} key={key + rowId}>
                 <Text style={styles.description}>{utils.getDisplayName(resource)}</Text>
               </Col>
             </View>]
    }
    if (multiChooser) {
      cols.push(<Col sm={colSize} md={1} lg={1} style={[styles.col, {justifyContent}]} key={key + '_check'}>
                  <View style={styles.multiChooser}>
                   <TouchableOpacity underlayColor='transparent' onPress={this.chooseToShare.bind(this)}>
                     <Icon name={this.state.isChosen ? 'ios-checkmark-circle' : 'ios-radio-button-off'}  size={30}  color={bankStyle && bankStyle.linkColor  ||  '#7AAAC3'} />
                   </TouchableOpacity>
                 </View>
               </Col>)
    }
    let row = <Row size={size} style={styles.gridRow, {backgroundColor: rowId % 2 ? '#f9f9f9' : 'transparent'}} key={key} nowrap>
                {cols}
              </Row>
    // if (search || multiChooser)
    return  <TouchableOpacity  onPress={() => this.props.onSelect({resource})}>
              {row}
            </TouchableOpacity>
    // else
    //   return row
  }
  formatCol(pName) {
    let { resource, isModel, search } = this.props
    let rtype = utils.getType(resource)
    let model = utils.getModel(rtype || resource.id);
    let properties = model.properties;
    let isContact = rtype === PROFILE;
    let colProp = properties[pName]

    // Handle MESSAGE type RL accross providers
    if (!colProp  &&  rtype === MESSAGE)
      return this.formatMessageProperty(pName)

    let backlink
    if (colProp.type === 'array') {
      if (colProp.items.backlink)
        backlink = pName;
    }

    if (colProp.type === 'array')
      return

    if (!resource[pName]  &&  !colProp.displayAs)
      return

    let style = [styles.description]
    if (isContact  &&  pName === 'organization') {
      style.push({alignSelf: 'flex-end', marginTop: 20})
      style.push(styles.verySmallLetters);
    }
    if (colProp.style)
      style.push(colProp.style);
    let ref = colProp.ref;
    let row
    let cellStyle = {paddingVertical: 5, paddingLeft: 7}

    let criteria = search  &&  this.state.resource  &&  this.state.resource[pName]

    if (ref) {
      if (!resource[pName])
        return
      if (criteria)
        style.push({fontWeight: '600'})

      let refM = utils.getModel(ref)
      if (ref === MONEY) {
        style.push({alignSelf: 'flex-end', paddingRight: 10})
        row = <Text style={style} key={this.getNextKey(resource)}>{resource[pName].currency + resource[pName].value}</Text>
      }
      else if (ref === PHOTO)
        row = <Image source={{uri: resource[pName].url}} style={styles.thumb} />
      else {
        let title = utils.getDisplayName(resource[pName])
        row = <Text style={styles.description} key={this.getNextKey(resource)}>{title}</Text>

        if (utils.isEnum(refM)) {
          let eVal = refM.enum.find(r => r.id === getEnumValueId({model: refM, value: resource[pName]}))
          if (eVal) {
            let { icon, color } = eVal
            if (icon) {
              row = <View key={this.getNextKey(resource)} style={styles.row}>
                      {this.paintIcon(model, eVal)}
                      <View style={{paddingLeft: 5, justifyContent: 'center'}}>
                        {row}
                      </View>
                    </View>
            }
          }
        }
        else if (refM.isInterface || refM.id === FORM  || refM.id === OBJECT) {
          let resType = utils.getType(resource[pName])
          let resM = utils.getModel(resType)
          row = <View key={this.getNextKey(resource)}>
                  <Text style={styles.type}>{translate(resM)}</Text>
                  {row}
                </View>
        }
      }
      return <View style={cellStyle}>{row}</View>
    }
    if (colProp.type === 'date')
      return <View style={cellStyle}>{this.addDateProp(pName)}</View>

    if (resource[pName]  &&  (typeof resource[pName] != 'string')) {
      if (criteria)
        style.push({fontWeight: '600'})

      if (colProp.type === 'number')
        style.push({alignSelf: 'flex-end', paddingRight: 10})
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{resource[pName] + ''}</Text></View>
    }
    if (!backlink  &&  resource[pName]  && (resource[pName].indexOf('http://') === 0  ||  resource[pName].indexOf('https://') === 0))
      // return <View style={cellStyle}><Text style={style} onPress={this.onPress.bind(this, resource)} key={this.getNextKey(resource)}>{resource[pName]}</Text></View>
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{resource[pName]}</Text></View>

    let val = colProp.displayAs ? utils.templateIt(colProp, resource) : resource[pName];
    let msgParts = utils.splitMessage(val);
    if (msgParts.length <= 2)
      val = msgParts[0];
    else {
      val = '';
      for (let i=0; i<msgParts.length - 1; i++)
        val += msgParts[i];
    }
    val = val  &&  val.replace(/\*/g, '')  ||  utils.getDisplayName(resource)
    if (criteria) {
      if (criteria.indexOf('*') === -1) {
        style.push({fontWeight: '600'})
        return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{val}</Text></View>
      }
      else {
        let parts = this.highlightCriteria(resource, val, criteria, style)
        return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{parts}</Text></View>
      }
    }
    else {
      if (isModel  &&  (pName === 'form'  ||  pName === 'product')) {
        let m = utils.getModel(pName)
        if (m)
          val = translate(m)
      }
      else if (colProp.range === 'model') {
        let m = utils.getModel(resource[pName])
        if (m)
          val = translate(m)
      }
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{val}</Text></View>
    }
  }
  formatMessageProperty(pName) {
    let { resource } = this.props
    let pval = resource[pName]

    if (!pval)
      return
    if (typeof pval !== 'object')
      return
    let style = [styles.description, {paddingLeft: 5}]
    // HACK to show provider icon
    if (utils.isStub(pval)  &&  pName === '_provider') {
      if (resource._icon) {
        return <View key={this.getNextKey(resource)} style={[styles.row, {paddingLeft: 10}]}>
                 <Image style={styles.icon} source={{uri: resource._icon.url}} />
                 <Text style={style}>{pval.title}</Text>
               </View>
      }
      return <View key={this.getNextKey(resource)}>
               <Text style={style}>{pval.title}</Text>
             </View>
    }
    return <View key={this.getNextKey(resource)}>
             <Text style={style}>{utils.getDisplayName(pval)}</Text>
           </View>
  }

  formatMessageProperty(pName) {
    let { resource } = this.props
    let pval = resource[pName]

    if (!pval)
      return
    if (typeof pval === 'object') {
      let style = [styles.description, {paddingLeft: 5}]
      // HACK to show provider icon
      if (utils.isStub(pval)  &&  pName === '_provider') {
        if (resource._icon) {
          return <View key={this.getNextKey(resource)} style={[styles.row, {paddingLeft: 10}]}>
                   <Image style={styles.icon} source={{uri: resource._icon.url}} />
                   <Text style={style}>{pval.title}</Text>
                 </View>
        }
        return <View key={this.getNextKey(resource)}>
                 <Text style={style}>{pval.title}</Text>
               </View>
      }
      return <View key={this.getNextKey(resource)}>
               <Text style={style}>{utils.getDisplayName(pval)}</Text>
             </View>
    }
  }

  paintIcon(model, eVal) {
    let isCheck = utils.isSubclassOf(model, CHECK)
    let icolor = '#ffffff'
    let size = 25
    let style = {}
    let buttonStyles
    let { icon, color } = eVal
    if (isCheck  &&  (eVal.id === 'error' ||  eVal.id === 'warning')) {
      icolor = color
      color = 'transparent'
      buttonStyles = {}
      size = 30
    }
    else
      buttonStyles = styles.button
    return <View style={[buttonStyles, {alignItems: 'center', backgroundColor: color}]}>
             <Icon name={icon} color={icolor} size={size}/>
           </View>
  }
  onPress(resource) {
    let title = utils.makeTitle(utils.getDisplayName(resource));
    this.props.navigator.push({
      title: title,
      componentName: 'ArticleView',
      passProps: {url: resource.url}
    });
  }

  highlightCriteria(resource,val, criteria, style) {
    criteria = criteria.replace(/\*/g, '')
    let idx = val.indexOf(criteria)
    let parts = []

    if (idx > 0) {
      parts.push(<Text style={style} key={this.getNextKey(resource)}>{val.substring(0, idx)}</Text>)
      idx++
    }
    parts.push(<Text style={[style, {fontWeight: '800'}]} key={this.getNextKey(resource)}>{val.substring(idx, idx + criteria.length)}</Text>)
    idx += criteria.length
    if (idx < val.length)
      parts.push(<Text style={style} key={this.getNextKey(resource)}>{val.substring(idx)}</Text>)
    return parts
  }
}
reactMixin(GridRow.prototype, Reflux.ListenerMixin);
reactMixin(GridRow.prototype, RowMixin)
GridRow = makeResponsive(GridRow)

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

module.exports = GridRow;
