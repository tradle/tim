'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
import LinearGradient from 'react-native-linear-gradient';
// var ArticleView = require('./ArticleView');
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var RowMixin = require('./RowMixin');
var ResourceList = require('./ResourceList')
// var Swipeout = require('react-native-swipeout')

var equal = require('deep-equal')
var extend = require('extend')
// var Store = require('../Store/Store');
// var Actions = require('../Actions/Actions');
// var Reflux = require('reflux');
var reactMixin = require('react-mixin');
// const PRIORITY_HEIGHT = 100
var defaultBankStyle = require('../styles/defaultBankStyle.json')

var StyleSheet = require('../StyleSheet')
var ArticleView = require('./ArticleView')

import {
  Image,
  PixelRatio,
  // StyleSheet,
  Platform,
  Text,
  TouchableHighlight,
  View
} from 'react-native';

import React, { Component } from 'react'
import ActivityIndicator from './ActivityIndicator'
import Geometry from './Geometry'
const PRODUCT_APPLICATION = 'tradle.ProductApplication'
const UNREAD_COLOR = '#FF6D0D'
const ROOT_HASH = constants.ROOT_HASH
const TYPE = constants.TYPE
const FORM = constants.TYPES.FORM
const PROFILE = constants.TYPES.PROFILE
const ORGANIZATION = constants.TYPES.ORGANIZATION
const FINANCIAL_PRODUCT = constants.TYPES.FINANCIAL_PRODUCT
const MONEY = constants.TYPES.MONEY
// const CHAR_WIDTH = 7

var dateProp

class SponsorRow extends Component {
  constructor(props) {
    super(props)
    this.state = {isConnected: this.props.navigator.isConnected}
  }
  // componentDidMount() {
  //   this.listenTo(Store, 'onRowUpdate');
  // }
  // onRowUpdate(params) {
  //   if (params.action === 'connectivity')
  //     this.setState({isConnected: params.isConnected})
  // }
  render() {
    var resource = this.props.resource;
    var photo;
    let rType = resource[TYPE]
    var noImage;
    let isOfficialAccounts = this.props.isOfficialAccounts
    if (resource.photos &&  resource.photos.length) {
      var uri = utils.getImageUri(resource.photos[0].url);
      var params = {
        uri: utils.getImageUri(uri)
      }
      if (uri.indexOf('/var/mobile/') === 0)
        params.isStatic = true
      photo = <Image source={params} style={styles.cellImage}  key={this.getNextKey()} />;
    }

    var rId = utils.getId(this.props.resource)
    let style
    if (isOfficialAccounts) {
      style = {}
      extend(style, defaultBankStyle)
      if (resource.styles) {
        style = extend(style, resource.style)
      }
    }
    let bg = {backgroundColor: style.LIST_BG}
    let color = style ? {color: style.LIST_COLOR} : {}

    var textStyle = /*noImage ? [styles.textContainer, {marginVertical: 7}] :*/ styles.textContainer;

    return  (
      <View style={[styles.content, bg]} key={this.getNextKey()}>
        <TouchableHighlight onPress={this.props.onSelect} underlayColor='transparent'>
          <View style={[styles.row, bg]}>
            <Icon color='#AAAAAA' size={20} name={'ios-arrow-forward'} style={{position: 'absolute', right: 10, top: 25}}/>
            <View style={textStyle}>
              <Text style={{color: '#757575', fontSize: 20}}>{translate('sponsoredBy')}</Text>
            </View>
            {photo}
          </View>
        </TouchableHighlight>
        <View style={{marginTop: 10}}>
          <Image source={require('../img/immo-check.jpg')} style={{backgroundColor: 'transparent', alignSelf: 'center', width: 330, height: 120, borderWidth: StyleSheet.hairlineWidth, borderColor: '#eeeeee'}} />
        </View>
        <View style={{marginTop: 10}}>
          <Image source={require('../img/paymit.jpg')} style={{backgroundColor: 'transparent', alignSelf: 'center', width: 330, height: 120, borderWidth: StyleSheet.hairlineWidth, borderColor: '#eeeeee'}} />
        </View>
      </View>
    )
  }
  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  onPress(event) {
    let resource = this.props.resourceTitle
    var model = utils.getModel(resource[TYPE] || resource.id).value;
    var title = utils.makeTitle(utils.getDisplayName(this.props.resource, model.properties));
    this.props.navigator.push({
      id: 7,
      title: title,
      component: ArticleView,
      passProps: {url: this.props.resource.url}
    });
  }
}
// reactMixin(SponsorRow.prototype, Reflux.ListenerMixin);
reactMixin(SponsorRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    // flex: 1,
    alignSelf: 'center'
  },
  // TODO: remove when you figure out v-centering
  // HACK FOR VERTICAL CENTERING
  resourceTitle: {
    // flex: 1,
    fontSize: 20,
    // fontWeight: '400',
    color: '#555555'
    // paddingTop: 18,
    // marginBottom: 2,
  },
  description: {
    // flex: 1,
    flexWrap: 'nowrap',
    color: '#999999',
    fontSize: 14,
  },
  row: {
    backgroundColor: 'white',
    marginLeft: 70,
    // justifyContent: 'center',
    // justifyContent: 'space-around',
    flexDirection: 'row',
    alignSelf: 'stretch',
    padding: 0,
  },
  content: {
    opacity: 1,
    justifyContent: 'center',
    // backgroundColor: '#ffffff'
  },
  cellText: {
    // marginTop: 12,
    // alignSelf: 'center',
    color: '#ffffff',
    fontSize: 20,
    backgroundColor: 'transparent'
  },
  cellImage: {
    backgroundColor: '#ffffff',
    height: 70,
    marginRight: 10,
    width: 70,
  },
  cellNoImage: {
    backgroundColor: '#dddddd',
    height: 40,
    marginLeft: 10,
  },
  cellBorder: {
    backgroundColor: '#eeeeee',
    height: 1,
    marginLeft: 4,
  },
  highlightedCellBorder: {
    backgroundColor: '#139459',
    height: 1,
    marginLeft: 4,
  },
  icon: {
    // width: 40,
    // height: 40,
    alignSelf: 'center',
    marginLeft: 10,
    marginTop: 7,
    // color: '#7AAAc3'
  },
  online: {
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    // alignSelf: 'flex-end',
    // marginLeft: -25,
    // marginRight: 25,
    // width: 16,
    // height: 16,
    position: 'absolute',
    top: 40,
    left: 43,
    // borderWidth: 1,
    // borderColor: '#ffffff'
  },
  contextOwners: {
    fontSize: 14,
    color: '#b4c3cb'
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  },
  countView: {
    top: 25,
    position: 'absolute',
    right: 10,
    justifyContent: 'center',
    borderRadius: 10,
    width: 20,
    height: 20,
    backgroundColor: UNREAD_COLOR
  },
  countText: {
    fontSize: 14,
    alignSelf: 'center',
    // fontWeight: '600',
    color: '#ffffff'
  },
  multiChooser: {
    position: 'absolute',
    right: 10,
    top: 25,
    backgroundColor: 'transparent'
  }
});

module.exports = SponsorRow;
