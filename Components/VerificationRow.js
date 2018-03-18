console.log('requiring VerificationRow.js')
'use strict';

import utils from '../utils/utils'
var translate = utils.translate
import constants from '@tradle/constants'
import Icon from 'react-native-vector-icons/Ionicons';
import reactMixin from 'react-mixin'
import RowMixin from './RowMixin'
// import Accordion from 'react-native-accordion'
import Swipeout from 'react-native-swipeout'
import StyleSheet from '../StyleSheet'
import dateformat from 'dateformat'
import appStyle from '../styles/appStyle.json'

var DEFAULT_CURRENCY_SYMBOL = '£'

const ITEM = 'tradle.Item'
const MY_PRODUCT = 'tradle.MyProduct'
const FORM = 'tradle.Form'
const FORM_REQUEST = 'tradle.FormRequest'
const ORGANIZATION = 'tradle.Organization'
const BOOKMARK = 'tradle.Bookmark'
const ENUM = 'tradle.Enum'
const PROFILE = constants.TYPES.PROFILE

const TYPE = constants.TYPE
const VERIFICATION = constants.TYPES.VERIFICATION
const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'
const CONFIRMATION = 'tradle.Confirmation'
const CHECK  = 'tradle.Check'
const STATUS = 'tradle.Status'
const IMAGE_PLACEHOLDER = utils.whitePixel

import {
  // Image,
  // StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Alert,
  // View
} from 'react-native'
import PropTypes from 'prop-types';

import {
  LazyloadView as View,
  LazyloadImage as Image
} from 'react-native-lazyload'

import React, { Component } from 'react'

class VerificationRow extends Component {
  props: {
    key: PropTypes.string.isRequired,
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    prop: PropTypes.object,
    currency: PropTypes.object,
    isChooser: PropTypes.boolean,
    multiChooser: PropTypes.boolean,
  };
  constructor(props) {
    super(props);
    let isChosen = false
    if (props.multiChooser) {
      // multivalue ENUM property
      if (props.chosen  &&  props.chosen[utils.getId(props.resource)])
        this.state.isChosen = true
    }

    this.state = {
      isChosen: isChosen
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.searchCriteria !== nextProps.searchCriteria)
      return true
    if (this.state.isChosen !== nextState.isChosen)
      return true
    return false
  }

  render() {
    let {resource, isChooser, lazy, parentResource, onSelect, prop, modelName, multiChooser, bankStyle } = this.props
    let model = utils.getModel(resource[TYPE]);
    let isMyProduct = model.subClassOf === MY_PRODUCT
    let isForm = model.subClassOf === FORM
    let isBookmark = model.id === BOOKMARK
    let isVerification = resource.document != null
    let r = isVerification ? resource.document : resource

    let listModel = utils.getModel(this.props.modelName)
    let ph = utils.getMainPhotoProperty(listModel)

    let photo
    if (r  &&  isMyProduct)
      photo = resource.from.photo
    else {
      let docModel = utils.getModel(utils.getType(r))
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
      photo = <Image host={lazy} resizeMode='cover' placeholder={IMAGE_PLACEHOLDER} source={{uri: utils.getImageUri(photo.url), position: 'absolute', left: 10}}  style={styles.cellImage} />
    else if (isForm || isVerification)
      photo = <View style={styles.photo}>
                <Icon name={model.icon || 'ios-paper-outline'} size={40} style={{marginTop: 8}} color={model.iconColor ? model.iconColor : '#cccccc'} />
              </View>
    else if (isMyProduct)
      photo = <View style={styles.photo}>
                <Icon name={model.icon || 'ios-ribbon-outline'} size={40} style={{marginTop: 8}} color={model.iconColor ? model.iconColor : '#cccccc'} />
              </View>
    else if (ph)
      photo = <View style={{width: 70}} />

    let verificationRequest = resource.document
                            ? utils.getModel(utils.getType(resource.document))
                            : utils.getModel(resource[TYPE]);

    let rows = [];

    let notAccordion = true //!isMyProduct  &&  !isVerification && !prop === null || resource.sources || resource.method || isForm
    // if (r  &&  !notAccordion) {
    //   this.formatDoc(verificationRequest, r, rows);
    //   let backlink = prop &&  prop.items  &&  prop.items.backlink;
    //   if (resource.txId)
    //     rows.push(
    //         <View style={{flexDirection: 'row'}} key={this.getNextKey()}>
    //           <Text style={styles.resourceTitleL}>{translate('verificationTransactionID')}</Text>
    //           <Text style={[styles.description, {color: '#7AAAc3'}]} onPress={this.onPress.bind(this, 'https://tbtc.blockr.io/tx/info/' + resource.txId)}>{resource.txId}</Text>
    //         </View>
    //       )
    // }

    let verifiedBy, org
    if (!isChooser  && !this.props.search  &&  (isVerification || isMyProduct /* ||  isForm*/) &&  resource.from) {
      let contentRows = [];

      if (isMyProduct)
        org = resource.from.organization
      else if (isForm)
        org = resource.to.organization
      else
        org = resource._verifiedBy || resource.organization

      let title = org ? org.title : resource.to.title
      let by = (isMyProduct)
             ? translate('issuedByOn', title)
             : (isForm)
                ? translate('sentToOn', title)
                : translate('verifiedByOn', title)
      verifiedBy = <View style={{alignItems: 'flex-end', paddingRight: 5}}><Text style={styles.verifiedBy}>{by}</Text></View>
    }
    else if (this.props.search  &&  listModel.id === FORM_REQUEST) {
      let by =  'Sent from ' + resource.from.organization.title
      verifiedBy = <View style={{alignItems: 'flex-end', paddingRight: 5}}><Text style={styles.verifiedBy}>{by}</Text></View>
    }

    let dateP = resource.dateVerified ? 'dateVerified' : resource.date ? 'date' : 'time'
    let date = !isBookmark &&  r  &&  <View style={{alignItems: 'flex-end'}}>
                        <Text style={styles.verySmallLetters} key={this.getNextKey()}>{dateformat(resource[dateP], 'mmm dS, yyyy h:MM')}</Text>
                      </View>
    let dn = isVerification ?  utils.getDisplayName(resource.document) : utils.getDisplayName(resource)
    let title
    if (isChooser  ||  utils.isItem(model))
      title = dn //utils.getDisplayName(resource, model.properties)
    if (!title || !title.length) {
      if (listModel.id === FORM_REQUEST)
        title = utils.makeModelTitle(resource.form)
      else if (isBookmark)
        title = resource.message  ||  utils.makeModelTitle(resource.bookmark[TYPE])
      else if (this.props.search) {
        if (isVerification)
          title = verificationRequest.title
        else if (model.id === APPLICATION_SUBMITTED)
          title = resource.application.title
        else if (model.id === CONFIRMATION)
          title = resource.confirmationFor.title
        else if (modelName === FORM)
          title = verificationRequest.title || utils.makeModelTitle(verificationRequest)
        else
          title = 'Submited by ' + resource.from.title
      }
      else
        title = verificationRequest.title || utils.makeModelTitle(verificationRequest)
    }

    let isCheck = model.subClassOf === CHECK
    let description
    let titleComponent
    if (title !== dn)  {
      if (isCheck  &&  resource.status) {
        let color, icon
        switch (resource.status.title) {
          case 'Pass':
          color = 'green'
          icon = 'md-checkmark'
          break
        case 'Fail':
          color = 'red'
          icon = 'md-close'
          break
        default:
          color = 'blue'
          icon = 'ios-information-circle-outline'
          break
        }
        titleComponent = <View style={{flexDirection: 'row'}}>
                           <Icon color={color} size={25} name={icon} style={{marginTop: -4}}/>
                           <Text style={[styles.rTitle, {paddingLeft: 10}]}>{dn}</Text>
                         </View>
      }
      else
        titleComponent = <Text style={styles.description}>{dn}</Text>
    }

    if (isVerification)
      titleComponent = <Text style={[styles.rTitle, {fontWeight: '600'}]}>{'Verification: '}
                          <Text style={[styles.rTitle, {fontWeight: '400'}]}>{title}</Text>
                        </Text>
    else if (isBookmark  &&  resource.message)
      titleComponent =  <Text style={[styles.rTitle, {paddingVertical: 10}]}>{title}</Text>
    else if (!titleComponent)
      titleComponent =  <Text style={styles.rTitle}>{title}</Text>
    else
      description = <Text style={[styles.description, {paddingLeft: 30}]}>{title}</Text>

    let supportingDocuments
    if (isForm  &&  resource._supportingDocuments  &&  resource._supportingDocuments.length)
      supportingDocuments = <View style={{flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'center', paddingTop: 10, paddingRight:5}}>
                              <Icon name='ios-paper' color={appStyle.ROW_ICON_COLOR} size={30} style={{marginTop: Platform.OS === 'ios' ? 0 : 0}}/>
                              <View style={styles.count}>
                                <Text style={styles.countText}>{resource._supportingDocuments.length}</Text>
                              </View>
                            </View>

    let sharedFrom
    if (isForm  &&  prop  &&  parentResource[TYPE] === ORGANIZATION) {
      if (utils.getId(resource.to.organization) !== utils.getId(parentResource)) {
        let img
        if (resource.to.photo)
          sharedFrom = <View style={{flexDirection: 'row', height: 25}}>
                        <Image source={{uri: utils.getImageUri(resource.to.photo)}}  style={[{height: 20, width: 20, alignSelf: 'center', opacity: 0.7}]} />
                        <Text style={[styles.verifiedBy, {paddingLeft: 5, alignSelf: 'center'}]}>Shared from {resource.to.organization.title}</Text>
                      </View>
        else
          sharedFrom = <Text style={styles.verifiedBy}>Shared from {resource.to.organization.title}</Text>
      }
    }
    let renderedRows = []
    if (this.props.search  &&  this.props.searchCriteria)
      this.formatFilteredResource(model, resource, renderedRows)
    else if (isBookmark  &&  !resource.message)
      this.formatBookmark(utils.getModel(resource.bookmark[TYPE]), resource.bookmark, renderedRows)
    let multiChooserIcon
    if (multiChooser) {
      multiChooserIcon = <View style={styles.multiChooser}>
                           <TouchableOpacity underlayColor='transparent' onPress={this.chooseToShare.bind(this)}>
                             <Icon name={this.state.isChosen ? 'ios-checkmark-circle-outline' : 'ios-radio-button-off'}  size={30}  color={bankStyle && bankStyle.linkColor  ||  '#7AAAC3'} />
                           </TouchableOpacity>
                         </View>

    }
    let header =  <View style={styles.header} key={this.getNextKey()}>
                    <View style={styles.row}>
                      {photo}
                      <View style={styles.noImageBlock}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', minHeight: 40}}>
                          <View style={styles.title}>
                            {titleComponent}
                            {description}
                            {renderedRows}
                          </View>
                          {supportingDocuments}
                          {multiChooserIcon}
                        </View>
                          {sharedFrom}
                        <View style={{marginTop: sharedFrom ? -3 : 3, flexDirection: 'row', justifyContent: 'flex-end'}}>
                          {verifiedBy}
                          {date}
                        </View>
                      </View>
                    </View>
                  </View>

    let row
    if (isChooser)
      row = <View>
              <TouchableOpacity onPress={onSelect.bind(this)} underlayColor='transparent'>
               {header}
              </TouchableOpacity>
            </View>
    else if (notAccordion) {
      let renderedRows = []
      if (this.props.search  &&  this.props.searchCriteria)
        this.formatFilteredResource(model, resource, renderedRows)
      let content = <TouchableOpacity onPress={onSelect.bind(this)}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        {header}
                      </View>
                    </TouchableOpacity>
      if (!isVerification)
        content = <Swipeout right={[{text: 'Revoke', backgroundColor: 'red', onPress: this.revokeDocument.bind(this)}]} autoClose={true} scroll={(event) => this._allowScroll(event)}>
                    {content}
                  </Swipeout>
      row = <View style={{backgroundColor: '#fff'}} host={lazy}>
             {content}
            </View>
    }
    // else {
    //   let content = <TouchableOpacity onPress={onSelect.bind(this)} underlayColor='transparent'>
    //                     <View style={styles.textContainer}>
    //                       {rows}
    //                     </View>
    //                   </TouchableOpacity>
    //   row = <View host={lazy}>
    //          <Accordion
    //            header={header}
    //            style={{alignSelf: 'stretch'}}
    //            content={content}
    //            underlayColor='transparent'
    //            easing='easeOutQuad' />
    //         </View>
    // }
    return row
  }
  revokeDocument() {
    let resource = this.props.resource
    let title
    if (resource.to.organization)
      title = resource.to.organization.title
    else
      title = resource.to.title
    Alert.alert(
      translate('confirmRevoke', resource.to.organization.title),
      null,
      [
        {text: translate('cancel'), onPress: () => console.log('Cancel')},
        {text: 'OK', onPress: () =>  Alert.alert(translate('willBeAvailable'))},
      ]
    )
  }
  _allowScroll(scrollEnabled) {
    this.setState({scrollEnabled: scrollEnabled})
  }

  formatFilteredResource(model, resource, renderedRows) {
    let props = (utils.getModel(resource[TYPE] || resource.id)).properties
    let searchCriteria = this.props.searchCriteria
    let viewCols = []
    for (let p in searchCriteria) {
      if (!props[p] || p.charAt(0) === '_')
        continue
      viewCols.push(p)
    }

    // let viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    let verPhoto;
    let vCols = [];

    let properties = model.properties;
    let noMessage = !resource.message  ||  !resource.message.length;
    let onPressCall;

    let isSimpleMessage = model.id === constants.TYPES.SIMPLE_MESSAGE;
    let style = styles.resourceTitle
    let labelStyle = styles.resourceTitleL
    viewCols.forEach((v) => {
      if (properties[v].type === 'array'  ||  properties[v].type === 'date')
        return;
      if (!resource[v]  &&  !properties[v].displayAs)
        return

      let units = properties[v].units && properties[v].units.charAt(0) !== '['
                ? ' (' + properties[v].units + ')'
                : ''

      if (properties[v].ref) {
        if (resource[v]) {
          let val
          if (properties[v].ref === constants.TYPES.MONEY) {
            let CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol || this.props.currency : DEFAULT_CURRENCY_SYMBOL
            val = utils.normalizeCurrencySymbol(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
          }
          else if (resource[v].title)
            val = resource[v].title
          else
            return

          vCols.push(
            <View style={styles.refPropertyRow} key={this.getNextKey()}>
              <Text style={labelStyle}>{properties[v].title + units}</Text>
              <Text style={[style, {fontWeight: '600'}]}>{val}</Text>
            </View>
          );
        }

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
        let criteria = searchCriteria[v]

        let row
        if (criteria === val || properties[v].type !== 'string')
          row = <Text style={[style, {fontWeight: '600'}]} key={this.getNextKey()}>{val}</Text>
        else if (criteria  &&  criteria.length) {
          criteria = criteria.replace(/\*/g, '')
          let idx = val.indexOf(criteria)
          let part
          let parts = []
          if (idx > 0) {
            parts.push(<Text style={style} key={this.getNextKey()}>{val.substring(0, idx)}</Text>)
            // idx++
          }
          parts.push(<Text style={[style, {fontWeight: '800'}]} key={this.getNextKey()}>{val.substring(idx, idx + criteria.length)}</Text>)
          idx += criteria.length
          if (idx < val.length)
            parts.push(<Text style={style} key={this.getNextKey()}>{val.substring(idx)}</Text>)
          row = <Text key={this.getNextKey()}>
                  {parts}
                </Text>
        }
        vCols.push(
          <View style={styles.refPropertyRow} key={this.getNextKey()}>
            <Text style={labelStyle}>{properties[v].title + units}</Text>
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
          <Text style={labelStyle}>{properties[v].title + units}</Text>
          {row}
        </View>
      );
    });
    // if (model.style)
    //   vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);

    if (vCols  &&  vCols.length) {
      vCols.forEach((v) => {
        renderedRows.push(v);
      });
    }
  }
  formatBookmark(model, resource, renderedRow) {
    let properties = model.properties;
    let viewCols = [];
    for (let p in resource) {
      if (properties[p]  &&  p.charAt(0) !== '_')
        viewCols.push(p)
    }

    let onPressCall;
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
        if (resource[v]) {
          let val
          if (ref === constants.TYPES.MONEY) {
            let CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol || this.props.currency : DEFAULT_CURRENCY_SYMBOL
            val = utils.normalizeCurrencySymbol(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
          }
          else if (resource[v].title)
            val = resource[v].title
          else if (utils.getModel(ref).subClassOf === ENUM) {
            val = ''
            resource[v].forEach((r, i) => {
              if (i)
                val += ', '
              val += r.title
            })
          }
          else
            return

          vCols.push(
            <View style={styles.refPropertyRow} key={this.getNextKey()}>
              <Text style={labelStyle}>{properties[v].title + units}</Text>
              <Text style={style}>{val}</Text>
            </View>
          );
        }

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
            <Text style={labelStyle}>{properties[v].title + units}</Text>
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
          <Text style={labelStyle}>{properties[v].title + units}</Text>
          {row}
        </View>
      );
    });
    // if (model.style)
    //   vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);

    if (vCols  &&  vCols.length) {
      vCols.forEach((v) => {
        renderedRow.push(v);
      });
    }
  }

}

reactMixin(VerificationRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginHorizontal: 10,
    padding: 5,
  },
  title: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center'
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 10
  },
  header: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1
  },
  rTitle: {
    // flex: 1,
    fontSize: 18,
    // marginBottom: 3,
    color: '#555555',
    // fontWeight: '600',
    // marginBottom: 2,
  },
  noImageBlock: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignSelf: 'stretch',
    paddingVertical: 3
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    // marginBottom: 2,
  },
  resourceTitleL: {
    // flex: 0.7,
    fontSize: 16,
    fontWeight: '400',
    paddingRight: 5,
    color: '#999999',
    // marginBottom: 2,
  },
  description: {
    color: '#999999',
    fontSize: 16,
  },
  verifiedBy: {
    flex: 1,
    flexWrap: 'wrap',
    color: '#cccccc',
    fontSize: 12,
  },
  cellImage: {
    height: 60,
    marginRight: 10,
    marginVertical: 3,
    width: 60,
  },
  verySmallLetters: {
    fontSize: 12,
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
  },
  count: {
    alignSelf: 'flex-start',
    minWidth: 18,
    marginLeft: -7,
    marginTop: 0,
    backgroundColor: appStyle.COUNTER_BG_COLOR,
    paddingHorizontal: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 9,
    borderColor: appStyle.COUNTER_COLOR,
    paddingVertical: 1
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
    color: appStyle.COUNTER_COLOR,
  },
  multiChooser: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'transparent'
  },
  photo: {
    alignItems: 'center',
    width: 70
  }
});

module.exports = VerificationRow;
  // icon: {
  //   width: 20,
  //   height: 20,
  //   borderWidth: 1,
  //   borderColor: '#7AAAc3',
  //   borderRadius: 10,
  //   marginRight: 10,
  //   alignSelf: 'center',
  // },

  // formatDoc(model, resource, renderedRow) {
  //   var viewCols = model.gridCols || model.viewCols;
  //   if (!viewCols)
  //     return
  //   var verPhoto;
  //   var vCols = [];
  //   var self = this;
  //   var model = utils.getModel(resource[TYPE] || resource.id);

  //   var properties = model.properties;
  //   var noMessage = !resource.message  ||  !resource.message.length;
  //   var onPressCall;

  //   var isSimpleMessage = model.id === constants.TYPES.SIMPLE_MESSAGE;
  //   var style = styles.resourceTitle
  //   var labelStyle = styles.resourceTitleL
  //   viewCols.forEach(function(v) {
  //     if (properties[v].type === 'array'  ||  properties[v].type === 'date')
  //       return;
  //     if (!resource[v]  &&  !properties[v].displayAs)
  //       return

  //     var units = properties[v].units && properties[v].units.charAt(0) !== '['
  //               ? ' (' + properties[v].units + ')'
  //               : ''

  //     if (properties[v].ref) {
  //       if (resource[v]) {
  //         let val
  //         if (properties[v].ref === constants.TYPES.MONEY)
  //           val = utils.normalizeCurrencySymbol(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
  //         else if (resource[v].title)
  //           val = resource[v].title
  //         else
  //           return

  //         vCols.push(
  //           <View style={styles.refPropertyRow} key={self.getNextKey()}>
  //             <Text style={labelStyle}>{properties[v].title + units}</Text>
  //             <Text style={style}>{val}</Text>
  //           </View>
  //         );
  //       }

  //       return;
  //     }
  //     let row
  //     if (resource[v]  &&  properties[v].type === 'string'  &&  (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
  //       row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
  //     else if (!model.autoCreate) {
  //       var val = (properties[v].displayAs)
  //               ? utils.templateIt(properties[v], resource)
  //               : properties[v].type === 'object' ? null : resource[v];
  //       if (!val)
  //         return
  //       let row = <Text style={style} key={self.getNextKey()}>{val}</Text>
  //       vCols.push(
  //         <View style={styles.refPropertyRow} key={self.getNextKey()}>
  //           <Text style={labelStyle}>{properties[v].title + units}</Text>
  //           {row}
  //         </View>
  //       )
  //       return
  //     }
  //     else {
  //       if (!resource[v]  ||  !resource[v].length)
  //         return;
  //       var msgParts = utils.splitMessage(resource[v]);
  //       // Case when the needed form was sent along with the message
  //       if (msgParts.length === 2) {
  //         var msgModel = utils.getModel(msgParts[1]);
  //         if (msgModel) {
  //           vCols.push(<View key={self.getNextKey()} style={styles.msgParts}>
  //                        <Text style={style}>{msgParts[0]}</Text>
  //                        <Text style={[style, {color: '#7AAAC3'}]}>{msgModel.title}</Text>
  //                      </View>);
  //           return;
  //         }
  //       }
  //       row = <Text style={style} key={self.getNextKey()}>{resource[v]}</Text>;
  //     }
  //     vCols.push(
  //       <View style={styles.refPropertyRow} key={self.getNextKey()}>
  //         <Text style={labelStyle}>{properties[v].title + units}</Text>
  //         {row}
  //       </View>
  //     );
  //   });
  //   // if (model.style)
  //   //   vCols.push(<Text style={styles.verySmallLetters}>{model.title}</Text>);

  //   if (vCols  &&  vCols.length) {
  //     vCols.forEach(function(v) {
  //       renderedRow.push(v);
  //     });
  //   }
  // }
