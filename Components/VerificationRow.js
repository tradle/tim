import {
  // Text,
  TouchableOpacity,
  Alert,
  // View
} from 'react-native'
import PropTypes from 'prop-types';
import {
  LazyloadView as View,
  // LazyloadImage as Image
} from 'react-native-lazyload'

// import ImageComponent from './Image'
import Image from './Image'

import React, { Component } from 'react'
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons';
import dateformat from 'dateformat'
import Swipeout from 'react-native-swipeout'
import reactMixin from 'react-mixin'
// import Accordion from 'react-native-accordion'

import constants from '@tradle/constants'

import utils, { translate } from '../utils/utils'
import { circled } from '../styles/utils'
import RowMixin from './RowMixin'
import StyleSheet from '../StyleSheet'
import appStyle from '../styles/appStyle.json'
import { Text } from './Text'

var DEFAULT_CURRENCY_SYMBOL = '$'

const MY_PRODUCT = 'tradle.MyProduct'
const FORM_REQUEST = 'tradle.FormRequest'
const FORM_PREFILL = 'tradle.FormPrefill'
const BOOKMARK = 'tradle.Bookmark'

const { TYPE } = constants
const {
  ORGANIZATION,
  MONEY,
  MESSAGE,
  VERIFICATION,
  PROFILE
} = constants.TYPES

const APPLICATION_SUBMITTED = 'tradle.ApplicationSubmitted'
const APPLICATION_SUBMISSION = 'tradle.ApplicationSubmission'
const CONFIRMATION = 'tradle.Confirmation'
const STATUS = 'tradle.Status'
const INTERSECTION = 'tradle.Intersection'
const IMAGE_PLACEHOLDER = utils.whitePixel

class VerificationRow extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    prop: PropTypes.object,
    isChooser: PropTypes.bool,
    multiChooser: PropTypes.bool,
    // currency: PropTypes.object,
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
      isChosen
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.searchCriteria !== nextProps.searchCriteria)
      return true
    if (this.state.isChosen !== nextState.isChosen)
      return true
    if (!_.isEqual(this.props.resource, nextProps.resource))
      return true
    return false
  }

  render() {
    let {resource, isChooser, lazy, parentResource, onSelect, search, searchCriteria,
         prop, modelName, multiChooser, bankStyle, locale } = this.props
    let rType = utils.getType(resource)
    let model = utils.getModel(rType);
    let isMyProduct = utils.isMyProduct(model)
    let isForm = utils.isForm(model)
    let isBookmark = model.id === BOOKMARK
    let isAbstract
    if (isChooser) {
      let ref = prop.ref ||  prop.items.ref
      isAbstract = utils.getModel(ref).abstract
    }
    let isApplicationSubmission = model.id === APPLICATION_SUBMISSION
    let isVerification = model.id === VERIFICATION  &&  resource.document != null
    let r = isVerification ? resource.document : resource

    let listModel = utils.getModel(modelName)
    let ph = utils.getMainPhotoProperty(listModel)

    let photo
    if (r  &&  isMyProduct  &&  !utils.isStub(r))
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
    if (photo) {
      // photo = <Image imageComponent={ImageComponent} host={lazy} resizeMode='cover' placeholder={IMAGE_PLACEHOLDER} source={{uri: utils.getImageUri(photo.url), position: 'absolute', left: 10}}  style={styles.cellImage} />
      photo = <Image resizeMode='cover' placeholder={IMAGE_PLACEHOLDER} source={{uri: utils.getImageUri(photo.url), position: 'absolute', left: 10}}  style={styles.cellImage} />
    }
    else if (model.icon  ||  isForm) {
      let icon = model.icon
      if (!icon)
        icon = isForm ? 'ios-paper-outline' : 'ios-checkmark-circle-outline'
      photo = <View style={styles.photo}>
                <Icon name={icon} size={40} style={styles.photoIconPlacement} color={model.iconColor ? model.iconColor : '#cccccc'} />
              </View>
    }
    else if (isMyProduct)
      photo = <View style={styles.photo}>
                <Icon name={model.icon || 'ios-ribbon-outline'} size={40} style={styles.photoIconPlacement} color={model.iconColor ? model.iconColor : '#cccccc'} />
              </View>
    else if (ph)
      photo = <View style={styles.photoPlaceholder} />

    let verificationRequest = resource.document
                            ? utils.getModel(utils.getType(resource.document))
                            : model

    let notAccordion = true //!isMyProduct  &&  !isVerification && !prop === null || resource.sources || resource.method || isForm

    let verifiedBy, org
    if (!isChooser  && !search  &&  (isVerification || isMyProduct /* ||  isForm*/) &&  resource.from) {
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
      verifiedBy = <View style={styles.verifiedByView}><Text style={styles.verifiedBy}>{by}</Text></View>
    }
    else if (search  &&  listModel.id === FORM_REQUEST) {
      let by =  'Sent from ' + resource.from.organization.title
      verifiedBy = <View style={styles.verifiedByView}><Text style={styles.verifiedBy}>{by}</Text></View>
    }

    let date
    let isStub = utils.isStub(resource)
    if (!isStub  &&  !isBookmark  &&  r) {
      let dateP
      if (resource.dateVerified)
        dateP = 'dateVerified'
      if (!dateP)
        dateP = resource.date && 'date' || '_time'
      let dateVal = resource[dateP]
      if (dateVal) {
        let dateFormatted = dateformat(dateVal, 'mmm dS, yyyy h:MM TT')
        date = <Text style={styles.verySmallLetters} key={this.getNextKey()}>{dateFormatted}</Text>
      }
    }
    let dn
    if (isVerification) {
      dn = utils.getDisplayName({ resource: resource.document })
      if (!dn)
        dn = translate(utils.getModel(utils.getType(resource.document)))
    }
    else if (isMyProduct  &&  modelName === MY_PRODUCT)
      dn = translate(model)
    else
      dn = utils.getDisplayName({ resource, locale })
    let title
    if (isChooser)
      title = dn
    else if (utils.isItem(model))  {
      if (model.id === FORM_PREFILL)
        title = translate(utils.getModel(resource.prefill[TYPE]))
      else
        title = dn
    }
    if (!title || !title.length) {
      if (listModel.id === FORM_REQUEST)
        title = translate(utils.getModel(resource.form))
      else if (isBookmark)
        title = resource.message  ||  translate(utils.getModel(resource.bookmark[TYPE]))
      else if (isApplicationSubmission)
        title = translate(utils.getModel(utils.getType(resource.submission)))
      else if (isVerification) {
        if (resource.method  &&  resource.method)
          title = translate(resource.method.aspect) //translate(resource.method.api.name) + ' (' + translate(resource.method.aspect) + ')')
        else {
          let dmodel = utils.getModel(utils.getType(r))
          title = translate(model) + ' ' + translate(dmodel)
        }
      }
      // Case for forms on Application. forms has a type og ApplicationSubmittion but the component
      // received the submission itself
      else if (rType !== modelName  &&  !utils.isSubclassOf(model, modelName))
        title = translate(model)
      else if (search) {
        if (isVerification)
          title = translate(verificationRequest)
        else if (model.id === APPLICATION_SUBMITTED)
          title = resource.application.title
        else if (model.id === CONFIRMATION)
          title = resource.confirmationFor.title
        else if (utils.getModel(modelName).abstract)
          title = translate(verificationRequest)
        // else
        //   title = 'Submitted by ' + resource.from.title
      }
      else {
        let needModelType = true
        if (dn) {
          if (parentResource  &&  prop  &&  prop.items  &&  prop.items.ref) {
            let pModel = utils.getModel(prop.items.ref)
            if (!pModel.abstract)
              needModelType = false
          }
        }
        title = needModelType  &&  translate(verificationRequest)
      }
    }

    let description
    let titleComponent
    if (title !== dn  &&  !title  &&  !dn)
      title = dn
    if (isVerification) {
      let vtitle = title  &&  <Text style={{paddingTop: 3, color: '#aaaaaa'}}>{title}</Text>
      titleComponent = <View>
                         <Text style={styles.rTitle}>{dn}</Text>
                         {vtitle}
                       </View>
    }
    else if (isAbstract) {
      titleComponent = <View>
                         <Text style={styles.rTitle}>{title}</Text>
                         <Text style={{paddingTop: 3, color: '#aaaaaa'}}>{translate(model)}</Text>
                       </View>
    }
    else if (title != dn)  {
      if (utils.isImplementing(modelName, INTERSECTION)  ||  !dn) {
        if (title) {
          let style
          if (dn)
            style = styles.description
          else
            style = styles.rTitle
          if (title !== dn)
            description = <Text style={style}>{title}</Text>
        }
      }
      if (dn) {
        let isProfile = parentResource  &&  parentResource[TYPE] === PROFILE
        if (isForm  &&  isProfile) {
          titleComponent = <View style={{justifyContent: 'center'}}>
                             <Text style={styles.rTitle}>{dn}</Text>
                             <Text style={{paddingTop: 3, color: '#aaaaaa'}}>{translate(model)}</Text>
                           </View>
        }
        else
          titleComponent = <Text style={styles.rTitle}>{dn}</Text>
      }
    }
    else if (isBookmark  &&  resource.message)
      titleComponent =  <Text style={[styles.rTitle, {paddingVertical: 10}]}>{title}</Text>
    else if (rType === MESSAGE) {
      let context = ''
      if (resource._context)
        context = translate(utils.getModel(resource._context.requestFor))
      titleComponent = <View style={{flexDirection: 'row'}}>
                         <Image style={styles.icon} source={{uri: resource._icon.url}} />
                         <View style={{flexDirection: 'column'}}>
                         <Text style={styles.rTitle}>{context}</Text>
                         <Text style={{paddingTop: 3, color: '#aaaaaa'}}>{translate(utils.getModel(resource._payloadType))}</Text>
                         </View>
                       </View>
    }
    else if (!titleComponent)
      titleComponent =  <Text style={styles.rTitle}>{title}</Text>
    else if (title)
      description = <Text style={styles.description}>{title}</Text>

    let supportingDocuments
    if (isForm  &&  resource._supportingDocuments  &&  resource._supportingDocuments.length)
      supportingDocuments = <View style={styles.supportingDocsView}>
                              <Icon name='ios-paper' color={appStyle.ROW_ICON_COLOR} size={30} style={{marginTop: 0}}/>
                              <View style={styles.count}>
                                <Text style={styles.countText}>{resource._supportingDocuments.length}</Text>
                              </View>
                            </View>

    let sharedFrom
    if (isForm  &&  prop  &&  parentResource[TYPE] === ORGANIZATION) {
      if (utils.getId(resource.to.organization) !== utils.getId(parentResource)) {
        if (resource.to.photo)
          sharedFrom = <View style={styles.sharedView}>
                        <Image source={{uri: utils.getImageUri(resource.to.photo)}}  style={styles.recipientPhoto} />
                        <Text style={[styles.verifiedBy, styles.sharedFrom]}>Shared from {resource.to.organization.title}</Text>
                      </View>
        else
          sharedFrom = <Text style={styles.verifiedBy}>Shared from {resource.to.organization.title}</Text>
      }
    }
    let renderedRows = []
    if (search  &&  searchCriteria)
      this.formatFilteredResource(model, resource, renderedRows)
    else if (isBookmark  &&  !resource.message)
      this.formatBookmark(utils.getModel(resource.bookmark[TYPE]), resource.bookmark, renderedRows)
    let multiChooserIcon
    if (multiChooser) {
      multiChooserIcon = <View style={styles.multiChooser}>
                           <TouchableOpacity underlayColor='transparent' onPress={this.chooseToShare.bind(this)}>
                             <Icon name={this.state.isChosen ? 'ios-checkmark-circle' : 'ios-radio-button-off'}  size={30}  color={bankStyle && bankStyle.linkColor  ||  '#7AAAC3'} />
                           </TouchableOpacity>
                         </View>

    }
    let header =  <View style={[styles.header, styles.contentBg]} key={this.getNextKey()}>
                    <View style={styles.row}>
                      {photo}
                      <View style={styles.noImageBlock}>
                        <View style={styles.rowContent}>
                          <View style={styles.title}>
                            {titleComponent}
                            {description}
                            {renderedRows}
                          </View>
                          {supportingDocuments}
                          {multiChooserIcon}
                        </View>
                        {sharedFrom}
                        <View style={styles.verifiedByAndDateStyle}>
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
      if (search  &&  searchCriteria)
        this.formatFilteredResource(model, resource, renderedRows)

      // let content
      // if (isInactive)
      //   content = header
      // else
      let content = <TouchableOpacity onPress={onSelect.bind(this)}>
                   {header}
                 </TouchableOpacity>
      if (!isVerification)
        content = <Swipeout right={[{text: 'Revoke', backgroundColor: '#EE504F', onPress: this.revokeDocument.bind(this)}]} autoClose={true} scroll={(event) => this._allowScroll(event)}>
                    {content}
                  </Swipeout>
      row = <View host={lazy} style={{marginTop: 8}}>
              {content}
            </View>
    }
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
      translate('confirmRevoke', title),
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
    let rType = utils.getType(resource)
    let props = utils.getModel(rType).properties
    let { searchCriteria, locale } = this.props
    let viewCols = []
    for (let p in searchCriteria) {
      if (!props[p] || p.charAt(0) === '_')
        continue
      viewCols.push(p)
    }

    // let viewCols = model.gridCols || model.viewCols;
    if (!viewCols)
      return
    let vCols = [];

    let properties = model.properties;

    let style = styles.resourceTitleS
    let labelStyle = styles.resourceLabelS
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
          if (properties[v].ref === MONEY) {
            if (locale)
              val = utils.formatCurrency(resource[v], locale)
            else {
              let CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol || this.props.currency : DEFAULT_CURRENCY_SYMBOL
              val = utils.normalizeCurrencySymbol(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
            }
          }
          else if (resource[v].title)
            val = resource[v].title
          else
            return

          vCols.push(
            <View style={styles.refPropertyRow} key={this.getNextKey()}>
              <Text style={labelStyle}>{translate(properties[v], model) + units}</Text>
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
          let parts = []
          if (idx > 0) {
            parts.push(<Text style={style} key={this.getNextKey()}>{val.substring(0, idx)}</Text>)
            // idx++
          }
          parts.push(<Text style={[style, {fontWeight: '800'}]} key={this.getNextKey()}>{val.substring(idx, idx + criteria.length)}</Text>)
          idx += criteria.length
          if (idx < val.length)
            parts.push(<Text style={style} key={this.getNextKey()}>{val.substring(idx)}</Text>)
          row = <Text key={this.getNextKey()} style={{width: '70%'}}>
                  {parts}
                </Text>
        }
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
        if (resource[v]) {
          let val
          if (ref === MONEY) {
            if (locale)
              val = utils.formatCurrency(resource[v], locale)
            else {
              let CURRENCY_SYMBOL = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
              val = utils.normalizeCurrencySymbol(resource[v].currency || CURRENCY_SYMBOL) + resource[v].value
            }
          }
          else if (resource[v].title)
            val = resource[v].title
          else if (utils.isEnum(ref)) {
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
              <Text style={labelStyle}>{translate(properties[v], model) + units}</Text>
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
    borderBottomWidth: 1,
    paddingBottom: 5
  },
  rTitle: {
    fontSize: 18,
    color: '#555555',
  },
  noImageBlock: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    alignSelf: 'stretch',
    paddingVertical: 3
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  resourceTitleS: {
    fontSize: 14,
    paddingTop: 3
  },
  resourceLabelS: {
    fontSize: 14,
    paddingRight: 5,
    color: '#999999',
    paddingTop: 3
  },
  resourceTitleL: {
    fontSize: 16,
    fontWeight: '400',
    paddingRight: 5,
    color: '#999999',
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
  },
  verifiedByView: {
    // alignItems: 'flex-end',
    paddingRight: 5
  },
  photoIconPlacement: {
    // marginTop: 8
  },
  photoPlaceholder: {
    width: 70
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40
  },
  supportingDocsView: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingTop: 10,
    paddingRight:5
  },
  sharedView: {
    flexDirection: 'row',
    height: 25
  },
  recipientPhoto: {
    height: 20,
    width: 20,
    alignSelf: 'center',
    opacity: 0.7
  },
  sharedFrom: {
    paddingLeft: 5,
    alignSelf: 'center'
  },
  contentBg: {
    backgroundColor: '#fff'
  },
  titleView: {
    flexDirection: 'row'
  },
  verifiedByAndDateStyle: {
    marginTop: -3,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  icon: {
    width: 25,
    height: 25,
  },
});

module.exports = VerificationRow;
