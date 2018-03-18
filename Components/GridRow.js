console.log('requiring GridRow.js')
'use strict';

import React, { Component } from 'react'
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  Platform
} from 'react-native'
import PropTypes from 'prop-types'

import Reflux from 'reflux'
import Icon from 'react-native-vector-icons/Ionicons'
// import extend from 'extend'
import _ from 'lodash'
import reactMixin from 'react-mixin'
import { makeResponsive } from 'react-native-orient'

import {Column as Col, Row} from 'react-native-flexbox-grid'
import ResourceView from './ResourceView'
import MessageView from './MessageView'
import RowMixin from './RowMixin'
import PageView from './PageView'
import ArticleView from './ArticleView'
import utils, {
  translate
} from '../utils/utils'
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
  ENUM,
  MONEY
} = constants.TYPES

const PHOTO = 'tradle.Photo'
const OBJECT = 'tradle.Object'

class GridRow extends Component {
  props: {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    gridCols: PropTypes.array.isRequired,
    multiChooser: PropTypes.boolean,
    isSmallScreen: PropTypes.boolean,
    chosen: PropTypes.boolean,
  };
  constructor(props) {
    super(props)
    this.state = {
      isConnected: this.props.navigator.isConnected,
      resource: props.resource,
    }
    if (props.multiChooser) {
      // multivalue ENUM property
      if (props.chosen  &&  props.chosen[utils.getId(props.resource)])
        this.state.isChosen = true
      else
        this.state.isChosen = false
    }
    if (props.resource[TYPE] === PROFILE)
      this.state.unread = props.resource._unread
  }
  componentDidMount() {
    this.listenTo(Store, 'onRowUpdate');
  }
  componentWillReceiveProps(props) {
    let { chosen } = props
    if (props.multiChooser)  {
      if (props.chosen  &&  props.chosen[utils.getId(props.resource)])
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
        this.setState({application: application, resource: application})
      break
    case 'updateRow':
      let hash = params.resource[ROOT_HASH] || params.resource.id.split('_')[1]
      if (hash === this.props.resource[ROOT_HASH]) {
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
    let { multiChooser, search, resource, modelName, rowId, gridCols, bankStyle, isSmallScreen } = this.props
    let size
    if (gridCols) {
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
    if (gridCols  &&  gridCols.length) {
      cols = gridCols.map((v) => (
        <Col sm={colSize} md={1} lg={1} style={[styles.col, {justifyContent: 'center'}]} key={key + v}>
          {this.formatCol(v) || <View />}
        </Col>
      ))
    }
    else {
      let m = utils.getModel(modelName)
      let rModel = utils.getModel(resource[TYPE])
      let typeTitle
      if (rModel.id !== m.id  &&  rModel.subClassOf === m.id)
        typeTitle = <Text style={styles.type}>{utils.makeModelTitle(rModel)}</Text>
      let cellStyle = {paddingVertical: 5, paddingLeft: 7}
      cols = [<View style={cellStyle}>
               {typeTitle}
               <Col sm={1} md={1} lg={1} style={styles.col} key={key + rowId}>
                 <Text style={styles.description}>{utils.getDisplayName(resource)}</Text>
               </Col>
             </View>]
    }
    if (multiChooser) {
      cols.push(<Col sm={colSize} md={1} lg={1} style={[styles.col, {justifyContent: 'center'}]} key={key + '_check'}>
                  <View style={styles.multiChooser}>
                   <TouchableOpacity underlayColor='transparent' onPress={this.chooseToShare.bind(this)}>
                     <Icon name={this.state.isChosen ? 'ios-checkmark-circle-outline' : 'ios-radio-button-off'}  size={30}  color={bankStyle && bankStyle.linkColor  ||  '#7AAAC3'} />
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
  formatCol(prop) {
    let resource = this.props.resource
    let model = utils.getModel(resource[TYPE] || resource.id);
    let properties = model.properties;
    let isContact = resource[TYPE] === PROFILE;
    let v = prop
    let backlink
    if (properties[v].type === 'array') {
      if (properties[v].items.backlink)
        backlink = v;
    }

    if (properties[v].type === 'array')
      return

    if (!resource[v]  &&  !properties[v].displayAs)
      return

    let style = [styles.description]
    if (isContact  &&  v === 'organization') {
      style.push({alignSelf: 'flex-end', marginTop: 20})
      style.push(styles.verySmallLetters);
    }
    if (properties[v].style)
      style.push(properties[v].style);
    let ref = properties[v].ref;
    let row
    let cellStyle = {paddingVertical: 5, paddingLeft: 7}

    let criteria = this.props.search  &&  this.state.resource  &&  this.state.resource[v]

    if (ref) {
      if (!resource[v])
        return
      if (criteria)
        style.push({fontWeight: '600'})

      let refM = utils.getModel(ref)
      if (ref === MONEY) {
        style.push({alignSelf: 'flex-end', paddingRight: 10})
        row = <Text style={style} key={this.getNextKey(resource)}>{resource[v].currency + resource[v]}</Text>
      }
      else if (ref === PHOTO)
        row = <Image source={{uri: resource[v].url}} style={styles.thumb} />
      else {
        let title = utils.getDisplayName(resource[v])
        row = <Text style={styles.description} key={this.getNextKey(resource)}>{title}</Text>
        if (refM.isInterface || refM.id === FORM  || refM.id === OBJECT) {
          let resType = utils.getType(resource[v])
          let resM = utils.getModel(resType)
          row = <View key={this.getNextKey(resource)}>
                  <Text style={styles.type}>{utils.makeModelTitle(resM)}</Text>
                  {row}
                </View>
        }
      //   if (refM.subClassOf !== ENUM) {
      //     let isMessage = utils.isMessage(resource)
      //     row = <TouchableOpacity onPress={() => {
      //             this.props.navigator.push({
      //               title: utils.getDisplayName(resource),
      //               id: isMessage ? 5 : 3,
      //               component: isMessage ?  MessageView : ResourceView,
      //               // titleTextColor: '#7AAAC3',
      //               backButtonTitle: 'Back',
      //               passProps: {
      //                 bankStyle: this.props.bankStyle,
      //                 search: this.props.search,
      //                 resource: resource[v]
      //               }
      //             });
      //             }}>
      //             {row}
      //           </TouchableOpacity>
      //   }
      }
      return <View style={cellStyle}>{row}</View>
    }
    if (properties[v].type === 'date')
      return <View style={cellStyle}>{this.addDateProp(v)}</View>

    if (resource[v]  &&  (typeof resource[v] != 'string')) {
      if (criteria)
        style.push({fontWeight: '600'})
      if (properties[v].type === 'number')
        style.push({alignSelf: 'flex-end', paddingRight: 10})
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{resource[v] + ''}</Text></View>
    }
    if (!backlink  &&  resource[v]  && (resource[v].indexOf('http://') === 0  ||  resource[v].indexOf('https://') === 0))
      return <View style={cellStyle}><Text style={style} onPress={this.onPress.bind(this, resource)} key={this.getNextKey(resource)}>{resource[v]}</Text></View>

    let val = properties[v].displayAs ? utils.templateIt(properties[v], resource) : resource[v];
    let msgParts = utils.splitMessage(val);
    if (msgParts.length <= 2)
      val = msgParts[0];
    else {
      val = '';
      for (let i=0; i<msgParts.length - 1; i++)
        val += msgParts[i];
    }
    val = val.replace(/\*/g, '')
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
      if (this.props.isModel  &&  (v === 'form'  ||  v === 'product')) {
        let m = utils.getModel(v)
        if (m)
          val = utils.makeModelTitle(m)
      }
      return <View style={cellStyle}><Text style={style} key={this.getNextKey(resource)}>{val}</Text></View>
    }
  }
  onPress(resource) {
    let title = utils.makeTitle(utils.getDisplayName(resource));
    this.props.navigator.push({
      id: 7,
      title: title,
      component: ArticleView,
      passProps: {url: resource.url}
    });
  }

  highlightCriteria(resource,val, criteria, style) {
    criteria = criteria.replace(/\*/g, '')
    let idx = val.indexOf(criteria)
    let part
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
});

module.exports = GridRow;
