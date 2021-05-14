import {
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types';
import {
  LazyloadView as View,
  // LazyloadImage as Image
} from 'react-native-lazyload'
import Reflux from 'reflux'

import React, { Component } from 'react'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons';
import reactMixin from 'react-mixin'

import constants from '@tradle/constants'
const { TYPE } = constants
const { MONEY } = constants.TYPES

import Store from '../Store/Store'

import utils, { translate } from '../utils/utils'
import { circled } from '../styles/utils'
import RowMixin from './RowMixin'
import StyleSheet from '../StyleSheet'
import { Text } from './Text'

const DEFAULT_CURRENCY_SYMBOL = '$'
const BOOKMARKS_FOLDER = 'tradle.BookmarksFolder'
const BOOKMARK = 'tradle.Bookmark'

class BookmarkRow extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    onMove: PropTypes.func,
    prop: PropTypes.object
    // currency: PropTypes.object,
  };
  constructor(props) {
    super(props)
    this.state = {
      // cancelled: props.resource.cancelled
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    // if (this.state.cancelled != nextProps.resource.cancelled)
    //   return true
    // if (this.state.forceUpdate !== nextState.forceUpdate)
    //   return true
    if (!_.isEqual(this.props.resource, nextProps.resource))
      return true
    return false
  }
  componentDidMount() {
    this.listenTo(Store, 'onRowUpdate');
  }
  onRowUpdate(params) {
    let { action, resource } = params
    let hash = resource  &&  utils.getRootHash(resource)
    let thisHash = utils.getRootHash(this.props.resource)
    switch (action) {
    case 'updateRow':
      let hash = utils.getRootHash(resource)
      if (hash === utils.getRootHash(this.props.resource)) {
        if (params.forceUpdate)
          this.setState({forceUpdate: this.state.forceUpdate ? false : true, resource})
      }
    }
  }

  render() {
    let {resource, lazy, onSelect, prop, bankStyle, isChooser, noMove } = this.props
    if (resource[TYPE] === BOOKMARKS_FOLDER) {
      let count
      if (!isChooser  &&  resource.list  &&  resource.list.length) {
        count = <View style={[styles.count, {backgroundColor: bankStyle.linkColor}]}>
                 <Text style={styles.countText}>{resource.list.length}</Text>
               </View>

      }
      return <View style={styles.header}>
               <View style={styles.rowContent}>
                 <TouchableOpacity onPress={isChooser ? this.props.onSelect.bind(this) : this.showBookmarks.bind(this)}>
                   <View style={{flex: 1}}>
                     <Text style={[styles.rTitle, {paddingVertical: 10}]}>{resource.message}</Text>
                   </View>
                 </TouchableOpacity>
                 {count}
               </View>
             </View>
    }
    let model = utils.getModel(resource.bookmark[TYPE])

    let dn = utils.getDisplayName({ resource })
    let title = translate(resource.message  ||  model)

    let titleComponent
    if (title !== dn  &&  !title  &&  !dn)
      title = dn

    let renderedRows = []
    let action
    if (!noMove)
      action = <TouchableOpacity onPress={this.props.onMove.bind(this)} style={{justifyContent: 'center'}}>
                 <Icon name='ios-exit-outline'  size={30}  color={bankStyle.linkColor}  style={{marginTop: 5}}/>
               </TouchableOpacity>

    // let shared = resource.shared && this._isMine(resource) && <Icon name={'md-share'}  size={20}  color='#cccccc' style={{marginRight: 5, marginTop: 10}}/>
    if (resource.message) {
      titleComponent = <View style={{flex: 1}}>
                         <TouchableOpacity onPress={onSelect.bind(this)}>
                           <Text style={[styles.rTitle, {paddingVertical: 10}]}>{title}</Text>
                         </TouchableOpacity>
                       </View>
    }
    else
      this.formatBookmark(model, resource.bookmark, renderedRows)
    return <View style={styles.header} key={this.getNextKey()}>
            <View style={styles.rowContent}>
              <View style={styles.title}>
                {titleComponent}
                {renderedRows}
              </View>
              <View style={styles.count}>
                {action}
              </View>
            </View>
          </View>

  }
  showBookmarks() {
    const { navigator, resource, bankStyle, locale, currency } = this.props
    navigator.push({
      title: resource.message,
      backButtonTitle: 'Back',
      componentName: 'GridList',
      passProps: {
        modelName: BOOKMARK,
        // to: resource.to,
        resource,
        bankStyle,
        currency,
        locale
      }
    })
  }
  formatBookmark(model, resource, renderedRow) {
    let properties = model.properties;
    let viewCols = [];
    for (let p in resource) {
      if (properties[p]  &&  p.charAt(0) !== '_')
        viewCols.push(p)
    }

    const { locale, currency } = this.props
    let style = styles.resourceTitle
    let labelStyle = styles.resourceTitleL
    let vCols = []
    viewCols.forEach((v) => {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      if (!resource[v]  &&  !properties[v].displayAs)
        return

      let units = properties[v].units && properties[v].units.charAt(0) !== '['
                ? ' (' + properties[v].units + ')'
                : ''
      let ref = properties[v].ref
      if (ref) {
        if (resource[v])
          this.formatRef(resource[v], properties[v], vCols, units)
        return;
      }
      let row
      if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
        row = <Text style={style} key={this.getNextKey()}>{resource[v]}</Text>;
      else if (!model.autoCreate) {
        let val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : properties[v].type === 'object' ? null : resource[v];
        if (!val)
          return
        let row = <Text style={style} key={this.getNextKey()}>{val}</Text>
        vCols.push(
          <View style={styles.refPropertyRow} key={this.getNextKey()}>
            <Text style={labelStyle}>{translate(properties[v], model) + units}</Text>
            {row}
          </View>
        )
        return
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        let msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          let msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            vCols.push(<View key={this.getNextKey()} style={styles.msgParts}>
                         <Text style={style}>{msgParts[0]}</Text>
                         <Text style={[style, {color: '#7AAAC3'}]}>{msgModel.title}</Text>
                       </View>);
            return;
          }
        }
        row = <Text style={style} key={this.getNextKey()}>{resource[v]}</Text>;
      }
      vCols.push(
        <View style={styles.refPropertyRow} key={this.getNextKey()}>
          <Text style={labelStyle}>{translate(properties[v], model) + units}</Text>
          {row}
        </View>
      );
    });

    if (vCols  &&  vCols.length) {
      vCols.forEach((v) => {
        renderedRow.push(v);
      });
    }
    else
      renderedRow.push(<Text style={[styles.rTitle, {paddingVertical: 10}]}>{translate(model)}</Text>)
  }
  formatRef(pValue, prop, vCols, units) {
    if (!pValue)
      return
    const { resource, locale, currency  } = this.props
    let model = utils.getModel(resource.bookmark[TYPE])
    let properties = model.properties
    let v = prop.name

    let val
    let ref = prop.ref
    if (ref === MONEY) {
      if (locale)
        val = utils.formatCurrency(pValue, locale)
      else {
        let CURRENCY_SYMBOL = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
        val = utils.normalizeCurrencySymbol(pValue.currency || CURRENCY_SYMBOL) + pValue.value
      }
    }
    else if (pValue.title)
      val = pValue.title
    else if (utils.isEnum(ref)) {
      val = ''
      pValue.forEach((r, i) => {
        if (i)
          val += ', '
        val += r.title
      })
    }
    else
      return
    let labelStyle = styles.resourceTitleL
    let style = styles.resourceTitle
    vCols.push(
      <View style={styles.refPropertyRow} key={this.getNextKey()}>
        <Text style={labelStyle}>{translate(properties[v], model) + units}</Text>
        <Text style={style}>{val}</Text>
      </View>
    );
  }
  _isMine(resource) {
    return utils.getRootHash(utils.getMe()) === resource._author
  }

}

reactMixin(BookmarkRow.prototype, RowMixin);
reactMixin(BookmarkRow.prototype, Reflux.ListenerMixin);

var styles = StyleSheet.create({
  title: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    paddingBottom: 5
  },
  rTitle: {
    fontSize: 18,
    color: '#555555',
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  resourceTitleS: {
    fontSize: 14,
    paddingTop: 3
  },
  resourceTitleL: {
    fontSize: 16,
    fontWeight: '400',
    paddingRight: 5,
    color: '#999999',
  },
  rowContent: {
    flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingTop: 5,
    marginHorizontal: 10,
    minHeight: 40
  },
  count: {
    position: 'absolute',
    top: 15,
    justifyContent: 'center',
    right: 0,
    width: 20,
    height:20,
    borderRadius: 10
  },
  countText: {
    fontSize: 12,
    alignSelf: 'center',
    color: '#ffffff'
  },
});

module.exports = BookmarkRow;
