'use strict';

var utils = require('../utils/utils');
var translate = utils.translate
var constants = require('@tradle/constants');
var Icon = require('react-native-vector-icons/Ionicons');
var reactMixin = require('react-mixin');
var RowMixin = require('./RowMixin');
var Accordion = require('react-native-accordion')
var Swipeout = require('react-native-swipeout')
var StyleSheet = require('../StyleSheet')

var DEFAULT_CURRENCY_SYMBOL = '£'
var CURRENCY_SYMBOL

const ITEM = 'tradle.Item'
const MY_PRODUCT = 'tradle.MyProduct'
const FORM = 'tradle.Form'

import {
  Image,
  // StyleSheet,
  Text,
  TouchableHighlight,
  ArticleView,
  AlertIOS,
  View
} from 'react-native';

import React, { Component, PropTypes } from 'react'

class VerificationRow extends Component {
  props: {
    key: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    prop: PropTypes.object,
    currency: PropTypes.object,
    isChooser: PropTypes.boolean
  };
  constructor(props) {
    super(props);
    CURRENCY_SYMBOL = props.currency ? props.currency.symbol || props.currency : DEFAULT_CURRENCY_SYMBOL
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  render() {
    var resource = this.props.resource;
    var photo;

    // if (resource.from  &&  resource.from.photos)
    //   photo = <Image source={{uri: utils.getImageUri(resource.from.photos[0].url)}} style={styles.cellImage} />
    var model = utils.getModel(resource[constants.TYPE]).value;
    var isMyProduct = model.subClassOf === MY_PRODUCT
    var isForm = model.subClassOf === FORM
    var isVerification = resource.document != null
    var r = isVerification ? resource.document : resource
    if (r  &&  isMyProduct)
      photo = resource.from.photo
    else {
      let docModel = utils.getModel(r[constants.TYPE]).value
      let mainPhotoProp = utils.getMainPhotoProperty(docModel)
      if (mainPhotoProp)
        photo = r[mainPhotoProp]
      if (!photo) {
        let photos = utils.getResourcePhotos(docModel, r)
        photo = photos  &&  photos.length ? photos[0] : null
      }
    }
    let hasPhoto = photo != null
    if (photo)
      photo = <Image source={{uri: utils.getImageUri(photo.url), position: 'absolute', left: 10}}  style={styles.cellImage} />
    else if (isForm || isVerification)
      photo = <View style={{alignItems: 'center', width: 70}}>
                <Icon name={model.icon || 'ios-paper-outline'} size={40} style={{marginTop: 8}} color={model.iconColor ? model.iconColor : '#cccccc'} />
              </View>
    else if (isMyProduct)
      photo = <View style={{alignItems: 'center', width: 70}}>
                <Icon name={model.icon || 'ios-ribbon-outline'} size={40} style={{marginTop: 8}} color={model.iconColor ? model.iconColor : '#cccccc'} />
              </View>
    else
      photo = <View style={{width: 70}} />


    // else if (resource.organization  &&  resource.organization.photos)
    //   photo = <Image source={{uri: utils.getImageUri(resource.organization.photos[0].url)}} style={styles.cellImage} />
    // else if (resource.from  &&  resource.from.photos)
    //   photo = <Image source={{uri: utils.getImageUri(resource.from.photos[0].url)}} style={styles.cellImage} />
    // else
    //   photo = <View style={styles.cellImage} />

    var verificationRequest = resource.document
                            ? utils.getModel(resource.document[constants.TYPE]).value
                            : utils.getModel(resource[constants.TYPE]).value;

    var rows = [];

    // rows.push(this.addDateProp('time', styles.verySmallLetters));

    // var val = utils.formatDate(new Date(resource.time));
    // rows.push(<View><Text style={styles.resourceTitle}>{val}</Text></View>);
    let notAccordion = !isMyProduct  &&  !isVerification && !this.props.prop === null || resource.sources || isForm
    if (r  &&  !notAccordion) {
      this.formatDoc(verificationRequest, r, rows);
      var backlink = this.props.prop &&  this.props.prop.items  &&  this.props.prop.items.backlink;
      if (resource.txId)
        rows.push(
            <View style={{flexDirection: 'row'}} key={this.getNextKey()}>
              <Text style={styles.resourceTitleL}>{translate('verificationTransactionID')}</Text>
              <Text style={[styles.description, {color: '#7AAAc3'}]} onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + resource.txId)}>{resource.txId}</Text>
            </View>
          )
    }

    // if (!isForm  &&  resource.to  &&  backlink !== 'to') {
    //   var row = <View style={{flexDirection: 'row'}} key={this.getNextKey()}>
    //               <Text style={[styles.description, {color: '#7AAAc3'}]}>submitted by </Text>
    //               <Text style={styles.description}>{resource.to.title}</Text>
    //             </View>;
      // var row = resource.to.photos
      //         ? <View style={{flexDirection: 'row'}}>
      //             <Text style={[styles.description, {color: '#7AAAc3'}]}>submitted by </Text>
      //             <Text style={styles.description}>{resource.to.title}</Text>
      //             <Image source={{uri: resource.to.photos[0].url}} style={styles.icon}/>
      //           </View>
      //         : <View style={{flexDirection: 'row'}}>
      //             <Text style={[styles.description, {color: '#7AAAc3'}]}>submitted by </Text>
      //             <Text style={styles.description}>{resource.to.title}</Text>
      //           </View>;
    //   rows.push(row);
    // }
    var verifiedBy
    if (!this.props.isChooser  &&  (isVerification || isMyProduct /* ||  isForm*/) &&  resource.from) {
      var contentRows = [];
      // contentRows.push(<Text style={}>verified by {resource.to.title}></Text>);
      let org = isMyProduct
              ? resource.from.organization
              : isForm
                  ? resource.to.organization
                  : resource._verifiedBy || resource.organization


      let title = org ? org.title : resource.to.title
      let by = (isMyProduct)
             ? translate('issuedBy', title)
             : (isForm)
                ? translate('sentTo', title)
                : translate('verifiedBy', title)
      // verifiedBy = <View style={contentRows.length == 1 ? {flex: 1} : {flexDirection: 'row'}} key={this.getNextKey()}>

      verifiedBy = <Text style={styles.description}>{by}</Text>
    }
    else
      verifiedBy = <View/>

    var date = r
             ? this.addDateProp(resource.dateVerified ? 'dateVerified' : 'time', [styles.verySmallLetters, {position: 'absolute', right: 10}])
             : <View />

    let title
    if (this.props.isChooser  ||  model.interfaces.indexOf(ITEM) !== -1)
      title = utils.getDisplayName(resource, model.properties)
    if (!title || !title.length)
      title = verificationRequest.title || utils.makeModelTitle(verificationRequest)

    var header =  <View style={{backgroundColor: '#ffffff', borderBottomColor: '#f0f0f0', borderBottomWidth: 1}} key={this.getNextKey()}>
                    <View style={{flexDirection: 'row', marginHorizontal: 10,  marginVertical: 3, paddingBottom: 4}}>
                      {photo}
                      {date}
                      <View style={[styles.noImageBlock, {flex: 1}]}>
                        <Text style={styles.rTitle}>{title}</Text>
                         {verifiedBy}
                      </View>
                    </View>
                  </View>
   // if (isForm  &&  !isMyProduct)
   //   header = <Swipeout right={[{text: 'Revoke', backgroundColor: 'red', onPress: this.revokeDocument.bind(this, resource)}]} autoClose={true} scroll={(event) => this._allowScroll(event)}>
   //              {header}
   //            </Swipeout>

    var content = <TouchableHighlight onPress={this.props.onSelect.bind(this)} underlayColor='transparent'>
                      <View style={styles.textContainer}>
                        {rows}
                      </View>
                    </TouchableHighlight>

    var row
    if (this.props.isChooser)
      row = <View>
              <TouchableHighlight onPress={this.props.onSelect.bind(this)} underlayColor='transparent'>
               {header}
              </TouchableHighlight>
            </View>
    else if (notAccordion)
      row = <View style={{backgroundColor: '#fff'}}>
              <Swipeout right={[{text: 'Revoke', backgroundColor: 'red', onPress: this.revokeDocument.bind(this)}]} autoClose={true} scroll={(event) => this._allowScroll(event)}>
              <TouchableHighlight onPress={this.props.onSelect.bind(this)} underlayColor='transparent'>
               {header}
              </TouchableHighlight>
              </Swipeout>
            </View>
    else
      row = <View>
             <Accordion
               header={header}
               style={{alignSelf: 'stretch'}}
               content={content}
               underlayColor='transparent'
               easing='easeOutQuad' />
            </View>
    return row
    // return (
    //   this.props.isChooser
    //    ? <View>
    //       <TouchableHighlight onPress={this.props.onSelect.bind(this)} underlayColor='transparent'>
    //        {header}
    //       </TouchableHighlight>
    //      </View>
    //      : notAccordion
    //         ? <Swipeout right={[{text: 'Revoke', backgroundColor: 'red', onPress: this.revokeDocument.bind(this)}]} autoClose={true} scroll={(event) => this._allowScroll(event)}>
    //             <TouchableHighlight onPress={this.props.onSelect.bind(this)} underlayColor='transparent'>
    //              {header}
    //             </TouchableHighlight>
    //           </Swipeout>
    //         : <View>
    //            <Accordion
    //              header={header}
    //              style={{alignSelf: 'stretch'}}
    //              content={content}
    //              underlayColor='transparent'
    //              easing='easeOutQuad' />
    //           </View>
    // );
  }
  revokeDocument() {
    var resource = this.props.resource
    AlertIOS.alert(
      translate('confirmRevoke', resource.to.organization.title),
      null,
      [
        {text: translate('cancel'), onPress: () => console.log('Cancel')},
        {text: 'OK', onPress: () =>  AlertIOS.alert(translate('willBeAvailable'))},
      ]
    )
  }
  _allowScroll(scrollEnabled) {
    this.setState({scrollEnabled: scrollEnabled})
  }
  formatDoc(model, resource, renderedRow) {
    var viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    var verPhoto;
    var vCols = [];
    var self = this;
    var model = utils.getModel(resource[constants.TYPE] || resource.id).value;

    var properties = model.properties;
    var noMessage = !resource.message  ||  !resource.message.length;
    var onPressCall;

    var isSimpleMessage = model.id === constants.TYPES.SIMPLE_MESSAGE;
    var style = styles.resourceTitle
    var labelStyle = styles.resourceTitleL
    viewCols.forEach(function(v) {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      if (!resource[v]  &&  !properties[v].displayAs)
        return

      var units = properties[v].units && properties[v].units.charAt(0) !== '['
                ? ' (' + properties[v].units + ')'
                : ''

      if (properties[v].ref) {
        if (resource[v]) {
          let val =
          if (properties[v].ref === constants.TYPES.MONEY)
            val = utils.normalizeCurrencySymbol(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
          else if (resource[v].title)
            val = resource[v].title
          else
            return

          vCols.push(
            <View style={styles.refPropertyRow} key={self.getNextKey()}>
              <Text style={labelStyle}>{properties[v].title + units}</Text>
              <Text style={style}>{val}</Text>
            </View>
          );
        }

        return;
      }
      let row
      if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
        row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
      else if (!model.autoCreate) {
        var val = (properties[v].displayAs)
                ? utils.templateIt(properties[v], resource)
                : properties[v].type === 'object' ? null : resource[v];
        if (!val)
          return
        let row = <Text style={style} key={self.getNextKey()}>{val}</Text>
        vCols.push(
          <View style={styles.refPropertyRow} key={self.getNextKey()}>
            <Text style={labelStyle}>{properties[v].title + units}</Text>
            {row}
          </View>
        )
        return
      }
      else {
        if (!resource[v]  ||  !resource[v].length)
          return;
        var msgParts = utils.splitMessage(resource[v]);
        // Case when the needed form was sent along with the message
        if (msgParts.length === 2) {
          var msgModel = utils.getModel(msgParts[1]);
          if (msgModel) {
            vCols.push(<View key={self.getNextKey()} style={styles.msgParts}>
                         <Text style={style}>{msgParts[0]}</Text>
                         <Text style={[style, {color: isMyMessage ? '#efffe5' : '#7AAAC3'}]}>{msgModel.value.title}</Text>
                       </View>);
            return;
          }
        }
        row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
      }
      vCols.push(
        <View style={styles.refPropertyRow} key={self.getNextKey()}>
          <Text style={labelStyle}>{properties[v].title + units}</Text>
          {row}
        </View>
      );
    });
    // if (model.style)
    //   vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);

    if (vCols  &&  vCols.length) {
      vCols.forEach(function(v) {
        renderedRow.push(v);
      });
    }
  }
  onPress(url) {
    this.props.navigator.push({
      id: 7,
      component: ArticleView,
      backButtonTitle: 'Back',
      passProps: {url: url}
    });
  }
}
reactMixin(VerificationRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    // borderColor: 'green'
    marginHorizontal: 10,
    padding: 5,
  },
  // row: {
  //   // backgroundColor: '#FBFFE5',
  //   flexDirection: 'row',
  //   marginHorizontal: 10,
  //   padding: 5,
  // },
  rTitle: {
    flex: 1,
    fontSize: 18,
    marginVertical: 5,
    color: '#757575',
    // fontWeight: '600',
    // marginBottom: 2,
  },
  noImageBlock: {
    flexDirection: 'column',
    paddingVertical: 7
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    // marginBottom: 2,
  },
  resourceTitleL: {
    flex: 0.7,
    fontSize: 16,
    fontWeight: '400',
    paddingRight: 5,
    color: '#999999',
    // marginBottom: 2,
  },
  description: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#999999',
    fontSize: 14,
    paddingLeft: 5
  },
  cellImage: {
    backgroundColor: '#dddddd',
    height: 60,
    marginRight: 10,
    marginVertical: 3,
    width: 60,
    borderColor: '#7AAAc3',
    // borderRadius:10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#7AAAc3',
    borderRadius: 10,
    marginRight: 10,
    alignSelf: 'center',
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  },
  refPropertyRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    borderColor: '#F2FAED',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 3
  },
  msgParts: {
    borderColor: '#F2FAED',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 5,
    borderBottomColor: '#f0f0f0'
  }
  // verySmallLettersCenter: {
  //   fontSize: 12,
  //   color: '#2E3B4E'
  // },
});

module.exports = VerificationRow;
