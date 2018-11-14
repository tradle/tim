
import {
  Image,
  Alert,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  // Text,
  View
} from 'react-native'
import PropTypes from 'prop-types';

import React, { Component } from 'react'
import _ from 'lodash'
import extend from 'extend'
import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons';

import constants from '@tradle/constants'

import { Text } from './Text'
import utils, { translate } from '../utils/utils'
import LinearGradient from 'react-native-linear-gradient';
import ArticleView from './ArticleView'
import RowMixin from './RowMixin'
import ResourceView from './ResourceView'

import Store from '../Store/Store'
import Actions from '../Actions/Actions'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import appStyle from '../styles/appStyle.json'
import StyleSheet from '../StyleSheet'

import Geometry from './Geometry'

const ASSIGN_RM = 'tradle.AssignRelationshipManager'
const MODEL = 'tradle.Model'
const UNREAD_COLOR = '#FF6D0D'
const APPLICATION = 'tradle.Application'
const PARTIAL = 'tradle.Partial'

var {
  ROOT_HASH,
  TYPE,
} = constants

var {
  FORM,
  PROFILE,
  ORGANIZATION,
  FINANCIAL_PRODUCT,
  MONEY,
  ENUM
} = constants.TYPES

const DEFAULT_CURRENCY_SYMBOL = '£'
const MAX_LENGTH = 70

class ResourceRow extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    showRefResources: PropTypes.func,
    hideMode: PropTypes.bool,
    hideResource: PropTypes.func,
    isOfficialAccounts: PropTypes.bool,
    isChooser: PropTypes.bool,
    selectModel: PropTypes.func,
    onCancel: PropTypes.func,
    changeSharedWithList: PropTypes.func,
    newContact: PropTypes.object,
    multiChooser: PropTypes.bool,
    chosen: PropTypes.object,
    parentComponent: PropTypes.func,
  };

  constructor(props) {
    super(props)
    this.state = {
      isConnected: this.props.navigator.isConnected,
      resource: props.resource,
    }
    if (props.changeSharedWithList)
      this.state.sharedWith = true
    // Multichooser for sharing context; isChooser for choosing delegated trusted party for requested verification
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
  onRowUpdate(params) {
    let { action, application, online, resource } = params
    switch (action) {
    case 'onlineStatus':
      if (resource  &&  resource[ROOT_HASH] === this.props.resource[ROOT_HASH])
        this.setState({serverOffline: !online, resource})
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
  componentWillReceiveProps(props) {
    if (props.isOfficialAccounts)
      this.state.resource = props.resource
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (utils.resized(this.props, nextProps))
      return true
    if (Object.keys(this.props).length  !== Object.keys(nextProps).length)
      return true
    if (this.state.forceUpdate !== nextState.forceUpdate)
      return true
    if (this.state.application !== nextState.application)
      return true
    if (this.props.resource.type === MODEL  &&  this.props.resource.id !== nextProps.resource.id)
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
        if (!_.isEqual(this.props[p], nextProps[p], opts))
          return true
      }
    }
    for (let p in this.state) {
      if (this.state[p] !== nextState[p]) {
        if (!_.isEqual(this.state[p], nextState[p], opts))
          return true
      }
    }
    return false
  }

  render() {
    let isModel = this.props.resource.type === MODEL
    let resource = (isModel && this.props.resource) || this.state.resource
    let rType = utils.getType(resource)
    if (rType !== APPLICATION  &&  this.state.application)
      resource = this.state.application
    let photo;
    let isContact = rType === PROFILE;
    let noImage;
    let isOfficialAccounts = this.props.isOfficialAccounts
    let style
    if (isOfficialAccounts  &&  resource.style) {
      style = {}
      extend(style, defaultBankStyle)
      style = extend(style, resource.style)
    }
    if (!style)
      style = defaultBankStyle
    if (isModel) {
      let title = translate(utils.getModel(rType))
      let parts = resource.id.split('.')
      if (parts.length > 2)
        title = <Text style={styles.resourceTitle}>{title + '  →  '}
                            <Text style={{color: style.linkColor}}>{parts[1] + '.' + parts[0]}</Text>
                         </Text>

      else
        title = <Text style={styles.resourceTitle}>{title}</Text>
      return  <View style={styles.content} key={this.getNextKey()}>
                <TouchableOpacity onPress={() => this.props.selectModel(resource)} underlayColor='transparent'>
                  <View style={[styles.row, { width: utils.dimensions(ResourceRow).width - 10}]}>
                    <View style={[styles.textContainer, {margin: 7}]}>
                      {title}
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.cellBorder}  key={this.getNextKey()} />
              </View>
    }
    if (resource.photos &&  resource.photos.length  &&  resource.photos[0].url) {
      let uri = utils.getImageUri(resource.photos[0].url);
      let params = {
        uri: utils.getImageUri(uri)
      }
      if (uri.indexOf('/var/mobile/') === 0)
        params.isStatic = true
      photo = <Image source={params} style={styles.cellImage} resizeMode="contain" key={this.getNextKey()} />;
    }
    else {
      if (isContact) {
        if (!resource.firstName  &&  !resource.lastName)
          return <View/>
        let name = (resource.firstName ? resource.firstName.charAt(0) : '');
        name += (resource.lastName ? resource.lastName.charAt(0) : '');
        photo = <LinearGradient colors={['#A4CCE0', '#7AAAc3', '#5E92AD']} style={styles.cellRoundImage}>
                   <Text style={styles.cellText}>{name}</Text>
                </LinearGradient>
      }
      else  {
        let model = utils.getModel(rType)
        let icon = model.icon;
        if (icon)
          photo = <View style={styles.cell}><Icon name={icon} size={35} color='#7AAAc3' style={styles.icon} /></View>
        else if (model.properties.photos)
          photo = <View style={styles.cell} />
        else {
          photo = <View style={styles.cellNoImage} />
          noImage = true
        }
      }
    }
    if (!this.props.isChooser  &&  photo  &&  rType === ORGANIZATION) {
      let onlineStatus = (
        <Geometry.Circle size={20} style={styles.online}>
          <Geometry.Circle size={18} style={{ backgroundColor: !resource._online /*|| !this.props.navigator.isConnected*/ ? '#FAD70C' : '#62C457'}} />
        </Geometry.Circle>
      )

      photo = <View style={styles.providerLogo}>
                <View>
                  {photo}
                  {onlineStatus}
                </View>
              </View>
    }

    // let rId = utils.getId(this.props.resource)
    // let cancelResource = (this.props.onCancel ||  this.state)
    //                    ? <TouchableHighlight onPress={this.action.bind(this)} underlayColor='transparent' style={{position: 'absolute', right: 0, top: 20}}>
    //                        <View>
    //                          <Icon name={this.state.sharedWith[rId] ? 'ios-checkmark-circle-outline' : 'ios-radio-button-off'}  size={30}  color={this.state.sharedWith[rId] ? '#B1010E' : '#dddddd'}  style={styles.cancelIcon} />
    //                        </View>
    //                      </TouchableOpacity>
    //                    : <View />;
    let bg = style ? {backgroundColor: style.listBg} : {}
    let color = style ? {color: style.listColor} : {}

    let cancelResource
    if (this.props.onCancel  ||  (this.state && this.state.sharedWith))
      cancelResource = <View style={styles.chooser}>
                         <Icon name={this.state.sharedWith ? 'ios-checkmark-circle-outline' : 'ios-radio-button-off'}  size={30}  color={this.state.sharedWith ? '#B1010E' : style ? color.color : '#dddddd'} />
                       </View>
    let hideMode
    if (this.props.hideMode)
      hideMode = <View style={styles.chooser}>
                  <TouchableHighlight underlayColor='transparent' onPress={() => this.props.hideResource(resource)}>
                    <Icon name='ios-remove-circle'  size={25}  color='#F63D37' />
                  </TouchableHighlight>
                 </View>

    let multiChooser
    if (this.props.multiChooser)
      multiChooser = <View style={styles.multiChooser}>
                       <TouchableHighlight underlayColor='transparent' onPress={this.chooseToShare.bind(this)}>
                         <Icon name={this.state.isChosen ? 'ios-checkmark-circle-outline' : 'ios-radio-button-off'}  size={30}  color='#7AAAc3' />
                       </TouchableHighlight>
                     </View>
    let textStyle = noImage ? [styles.textContainer, {marginVertical: 7}] : styles.textContainer;

    this.dateProp = utils.isContext(rType) ? '_time' : this.dateProp

    let dateRow
    if (!this.isOfficialAccounts  &&  !this.props.isChooser  &&  this.dateProp  &&  resource[this.dateProp]) {
      let val = utils.formatDate(new Date(resource[this.dateProp]), true)
      // let dateBlock = this.addDateProp(resource, dateProp, true);
      dateRow = <View style={styles.dateRow}>
                  <Text style={styles.verySmallLetters}>{val}</Text>
                </View>
    }

    let isNewContact = this.props.newContact  &&  this.props.newContact[ROOT_HASH] === resource[ROOT_HASH]
    let count
    if (isContact)
      count = resource._unread

    let counter
    if (count)
      counter = <View style={styles.countView}>
                  <Text style={styles.countText}>{count}</Text>
                </View>

    // Grey out if not loaded provider info yet
            // <ActivityIndicator hidden='true' color='#629BCA'/>

    let isOpaque = rType === ORGANIZATION && !resource.contacts  &&  !this.props.isChooser
    if (isOpaque)
      return (
        <View key={this.getNextKey()} style={[{opacity: 0.5}, styles.rowWrapper]}>
          <View style={styles.row} key={this.getNextKey()}>
            {photo}
            <View style={[textStyle, {flexDirection: 'row', justifyContent: 'center'}]}>
              {this.formatRow(resource, style)}
            </View>
            {dateRow}
            {multiChooser}
            {cancelResource}
            {hideMode}
          </View>
          <View style={styles.cellBorder}  key={this.getNextKey()} />
        </View>
      )

    let onPress = this.action.bind(this)
    let action
    if (isOfficialAccounts  &&  !this.props.hideMode  &&  resource._formsCount) {
      action = <View style={styles.actionView}>
                <TouchableHighlight underlayColor='transparent' onPress={this.showProviderView.bind(this)}>
                <View style={textStyle}>
                  <View style={{flexDirection: 'row'}}>
                    <Icon name='ios-paper-outline' color={appStyle.ROW_ICON_COLOR} size={30} style={{marginTop: Platform.OS === 'ios' ? 0 : 0}}/>
                    <View style={styles.count}>
                      <Text style={styles.countText}>{resource._formsCount}</Text>
                    </View>
                  </View>
                </View>
               </TouchableHighlight>
              </View>
    }
    let content =  <View style={[styles.content, bg, {paddingHorizontal: 10}]} key={this.getNextKey()}>
                    <TouchableHighlight onPress={onPress} underlayColor='transparent'>
                      <View style={[styles.row, bg, { minHeight: 71, justifyContent: 'center'}]}>
                        {photo}
                        <View style={textStyle}>
                          {this.formatRow(resource, style)}
                        </View>
                      </View>
                    </TouchableHighlight>
                    {counter}
                    {action}
                    {dateRow}
                    {multiChooser}
                    {hideMode}
                    {cancelResource}
                    <View style={isNewContact ? styles.highlightedCellBorder : styles.cellBorder}  key={this.getNextKey()} />
                  </View>
    return content
  }
  showProviderView() {
    let resource = this.props.resource
    let title = utils.getDisplayName(resource)
    let route = {
      title: title,
      id: 3,
      component: ResourceView,
      // titleTextColor: '#7AAAC3',
      backButtonTitle: 'Back',
      passProps: {
        resource: resource,
        bankStyle: resource.style  || defaultBankStyle,
      }
    }
    this.props.navigator.push(route)
  }
  action() {
    if (this.props.multiChooser)
      this.chooseToShare()
    else if (this.props.onCancel)
      this.props.onCancel()
    else if (this.props.changeSharedWithList  &&  (typeof this.props.changeSharedWithList != 'undefined')) {
      let id = utils.getId(this.props.resource)
      this.setState({sharedWith: this.state.sharedWith ? false : true})
      this.props.changeSharedWithList(id, this.state.sharedWith ? false : true)
    }
    else
      this.props.onSelect({resource: this.state.resource})
  }
  formatRow(resource, style) {
    if (!resource[TYPE])
      return <View style={{minHeight: 60, justifyContent: 'center'}}><Text style={styles.resourceTitle}>{resource.title}</Text></View>

    let rtype = utils.getType(resource)
    let model = utils.getModel(rtype);
    let viewCols = model.gridCols || model.viewCols;

    if (!viewCols  &&  model.id !== APPLICATION) {
      if (model.id === PARTIAL) {
        let p = resource.leaves.find((l) => l.key === TYPE && l.value).value
        let productTitle = translate(utils.getModel(p))
        return <View style={{flexDirection: 'row'}}>
                <Text style={[styles.resourceTitle, {fontSize: 18}]}>{resource.providerInfo.title}</Text>
                <Text style={[styles.resourceTitle, {fontSize: 18, paddingLeft: 7, color: '#FF6D0D'}]}>{' ' + productTitle}</Text>
              </View>
      }
      let dn
      if (model.subClassOf  &&  model.subClassOf === ENUM)
        dn = utils.translateEnum(resource)
      else
        dn = utils.getDisplayName(resource);

      if (dn && dn.length)
        return <Text style={styles.resourceTitle}>{dn}</Text>;
      else
        return <Text style={styles.resourceTitle}>{model.title}</Text>;
    }
    // HACK
    else if (model.id === APPLICATION)
      return this.applicationRow(resource, style)
    else if (this.props.isChooser)
      return <Text style={styles.resourceTitle}>{utils.getDisplayName(resource)}</Text>

    let vCols = [];
    let properties = model.properties;
    let first = true
    let datePropsCounter = 0;
    let backlink;
    for (let i=0; i<viewCols.length; i++) {
      let v = viewCols[i];
      if (properties[v].type === 'array') {
        if (properties[v].items.backlink)
          backlink = v;
        continue;
      }
      if (properties[v].type !== 'date'  ||  !resource[v])
        continue;
      if (resource[v]) {
        if (v === 'dateSubmitted') { // || v === 'lastMessageTime') {
          this.dateProp = v;
          datePropsCounter++;
        }
      }
    }
    if (datePropsCounter > 1)
      this.dateProp = null;

    let isOfficialAccounts = this.props.isOfficialAccounts
    let color = isOfficialAccounts && style ? {color: style.listColor} : {}
    let isContact = rtype === PROFILE;
    viewCols.forEach((v) => {
      if (v === this.dateProp)
        return;
      if (properties[v].type === 'array')
        return;

      if (!resource[v]  &&  !properties[v].displayAs)
        return;
      let style = first ? [styles.resourceTitle, color] : [styles.description, color]
      if (isContact  &&  v === 'organization') {
        style.push({alignSelf: 'flex-end', marginTop: 20})
        style.push(styles.verySmallLetters);
      }
      if (properties[v].style)
        style.push(properties[v].style);
      let ref = properties[v].ref;
      if (ref) {
        if (resource[v]) {
          let row;
          if (ref == MONEY) {
            let { currency } = this.props
            let currencySymbol = currency ? currency.symbol || currency : DEFAULT_CURRENCY_SYMBOL
            row = <Text style={style} key={this.getNextKey()}>{(resource[v].currency || currencySymbol) + resource[v].value}</Text>
          }
          else
            row = <Text style={style} key={this.getNextKey()}>{resource[v].title}</Text>

          vCols.push(row);
        }
        first = false;
      }
      else if (properties[v].type === 'date') {
        if (!this.dateProp)
          vCols.push(this.addDateProp(v));
        else
          return;
      }
      else  {
        let row;
        if (resource[v]  &&  (typeof resource[v] != 'string'))
          row = <Text style={style} key={this.getNextKey()}>{resource[v]}</Text>;
        else if (!backlink  &&  resource[v]  && (resource[v].indexOf('http://') == 0  ||  resource[v].indexOf('https://') == 0))
          row = <Text style={style} onPress={this.onPress.bind(this)} key={this.getNextKey()}>{resource[v]}</Text>;
        else {
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
          if (isOfficialAccounts  &&  v === 'lastMessage') {
            let isMyLastMessage = val.indexOf('You: ') !== -1
            let lastMessageTypeIcon = <View/>
            if (val.length > MAX_LENGTH) {
              val = val.substring(0, MAX_LENGTH)
              let i = MAX_LENGTH - 1
              for (; i>=MAX_LENGTH - 10; i--) {
                let ch = val.charAt(i)
                if (ch === ' ' || ch === '.' || ch === ',') {
                  val = val.substring(0, i)
                  break
                }
              }
              val += '...'
            }
            if (isMyLastMessage) {
              val = val.substring(5)
              let lastMessageType = resource.lastMessageType
              if (lastMessageType) {
                let msgModel = utils.getModel(lastMessageType)
                let icon
                if (msgModel.subClassOf === FINANCIAL_PRODUCT)
                  icon = 'ios-usd'
                else if (msgModel.subClassOf === FORM)
                  icon = 'ios-paper-outline'
                // else if (model.id === VERIFICATION)
                //   icon =
                if (icon)
                  lastMessageTypeIcon = <Icon name={icon} size={14} color='#7AAAc3' style={{paddingLeft: 1, marginTop: 1}}/>
              }
            }
            let w = utils.dimensions(ResourceRow).width - 145
            row = <View style={{flexDirection: 'row'}} key={this.getNextKey()}>
                    <Icon name='md-done-all' size={16} color={isMyLastMessage ? '#cccccc' : '#7AAAc3'} />
                    {lastMessageTypeIcon}
                    <Text style={[style, {width: w, paddingLeft: 2, color: '#aaaaaa'}]}>{val}</Text>
                  </View>
          }
          else {
            if (resource._unread  &&  v === 'lastMessage')
              style = [style, {color: UNREAD_COLOR}]
            row = <Text style={style} key={this.getNextKey()}>{val}</Text>;
          }
        }
        vCols.push(row);
        first = false;
      }
    });
    let renderedViewCols
    if (vCols  &&  vCols.length)
      renderedViewCols = vCols;
    else {
      let dn = utils.getDisplayName(resource, model);
      return <Text style={styles.resourceTitle}>{dn}</Text>;
    }
    if (!backlink)
      return renderedViewCols
    const { showRefResources, parentComponent } = this.props
    return [
      <TouchableOpacity key={this.getNextKey()} onPress={showRefResources.bind(this, {resource, prop: backlink, component: parentComponent})} underlayColor='transparent'>
        <View key={this.getNextKey()}>
          {renderedViewCols}
        </View>
      </TouchableOpacity>
    ];
  }
  applicationRow(resource, style) {
    let model = utils.getModel(resource[TYPE] || resource.id);
    let m = utils.getModel(resource.requestFor)
    // if (!m)
    //   return <View/>

    let props = model.properties
    // if (utils.isReadOnlyChat(resource)  &&  resource.to.organization) {
    let dateCompleted, dateEvaluated, dateStarted
    if (resource.dateStarted) {
      dateStarted = <View style={{flexDirection: 'row', paddingTop:5, justifyContent: 'flex-end'}}>
                      <Text style={{fontSize: 12, color: '#aaaaaa'}}>{translate(props.dateStarted)}</Text>
                      <Text style={{fontSize: 12, color: '#757575', paddingLeft: 8}}>{utils.formatDate(resource.dateStarted)}</Text>
                    </View>
    }
    // if (resource.certificate)
    //   status = 'Approved'
    // else
    if (resource.dateEvaluated) {
      // status = 'Denied'
      dateEvaluated = <View style={{flexDirection: 'row', paddingTop:5, justifyContent: 'flex-end'}}>
                        <Text style={{fontSize: 12, color: '#aaaaaa'}}>{translate(props.dateEvaluated)}</Text>
                        <Text style={{fontSize: 12, color: '#757575', paddingLeft: 8}}>{utils.formatDate(resource.dateEvaluated)}</Text>
                      </View>
    }
    else if (resource.dateCompleted) {
      // status = 'Submitted'
      dateCompleted = <View style={{flexDirection: 'row', paddingTop:5, justifyContent: 'flex-end'}}>
                        <Text style={{fontSize: 12, color: '#aaaaaa'}}>{translate(props.dateCompleted)}</Text>
                        <Text style={{fontSize: 12, color: '#757575', paddingLeft: 8}}>{utils.formatDate(resource.dateCompleted)}</Text>
                      </View>
    }
    // if (status) {
    //   status = <View style={{justifyContent: 'center', alignItems: 'flex-end'}}>
    //               <Text style={{fontSize: 12, color: '#7AAAc3'}}>{translate(status)}</Text>
    //             </View>
    // }
    // if (status !== 'Approved'  &&  status !== 'Denied') {
    let aTitle = resource.applicantName || resource.applicant.title
    let applicant = aTitle  &&  <Text style={styles.applicant}>{aTitle}</Text>
    let icolor
    let iname
    let hasRM = resource.relationshipManagers
    if (utils.isRM(resource)) {
      // iname = 'md-log-out'
      iname = 'ios-person-add'
      icolor = '#7AAAc3'
    }
    else if (this.state.hasRM) {
      // iname = 'md-log-out'
      iname = 'ios-person-add'
      icolor = '#7AAAc3'
    }
    else {
      // iname = 'md-log-in'
      iname = hasRM ? 'ios-person-add' : 'ios-person-add-outline'
      icolor = hasRM ? '#CA9DF2' : '#7AAAc3'
    }
    let icon = <Icon name={iname} size={30} color={icolor} style={{alignSelf: 'flex-end'}}/>

    let rmIcon = <View style={{flexDirection: 'column', justifyContent: 'center', marginTop: aTitle && -15 || 0}}>
                   {icon}
                 </View>
    let formsCount, progressBar
    // let formTypes = []
    // let progress = 0
    // if (m  &&  resource.forms) {
    //   resource.forms.forEach((item) => {
    //     let itype = utils.getType(item.id)
    //     if (formTypes.indexOf(itype) === -1)
    //       formTypes.push(itype)
    //   })
    //   progress = formTypes.length / m.forms.length
    // }

    // let progressColor = '#7AAAC3'
    // if (resource.status) {
    //   switch (resource.status) {
    //     case 'approved':
    //       progressColor = '#A6D785'
    //       break
    //     case 'denied':
    //       progressColor = '#EE3333'
    //       break
    //   }
    // }
    // progressBar = <View style={styles.progress}>
    //                 <ProgressBar progress={progress} width={utils.dimensions().width - 40} color={progressColor} borderWidth={1} borderRadius={0} height={20} />
    //               </View>
    // let draft
    // if (resource.draft) {
    //   draft = <View style={{position: 'absolute', top: 0, width: '100%'}}>
    //              <Text style={{fontSize: 70, color: '#f5f5f5', fontWeight: '600', alignSelf: 'center'}}>{translate('DRAFT')}</Text>
    //           </View>
    // }

    if (!m)
      m = utils.getModel(resource.requestFor)
    let mTitle = m && translate(m) || utils.makeModelTitle(resource.requestFor)

    return  <View>
              <View style={{padding: 5}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={[styles.resourceTitle, {paddingRight: 10}]}>{mTitle}</Text>
                  {formsCount}
                </View>
                {applicant}
              </View>
              <View style={{marginTop: -30, alignItems: 'flex-end'}}>
                {rmIcon}
                {dateStarted}
                {dateEvaluated}
                {dateCompleted}
              </View>
              {progressBar}
            </View>
  }
  assignRM() {
    Alert.alert(
      translate('areYouSureYouWantToServeThisCustomer', this.props.resource.from.title),
      null,
      [
        {text: translate('cancel'), onPress: () => {}},
        {text: translate('Yes'), onPress: () => {
          let me = utils.getMe()
          let msg = {
            [TYPE]: ASSIGN_RM,
            employee: {
              id: utils.makeId('tradle.Identity', me[ROOT_HASH])
            },
            application: this.props.resource,
            _context: this.props.resource._context,
            from: me,
            to: this.props.resource.to
          }
          Actions.addChatItem({resource: msg})
          this.setState({hasRM: true})
        }}
      ]
    )


  }
  onPress(event) {
    let { resource, navigator } = this.props
    let model = utils.getModel(resource[TYPE] || resource.id);
    let title = utils.makeTitle(utils.getDisplayName(resource, model));
    navigator.push({
      id: 7,
      title: title,
      component: ArticleView,
      passProps: {url: resource.url}
    });
  }
}
reactMixin(ResourceRow.prototype, Reflux.ListenerMixin);
reactMixin(ResourceRow.prototype, RowMixin);

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    alignSelf: 'center'
  },
  rowWrapper: {
    borderColor: '#f7f7f7',
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  dateRow: {
    position: 'absolute',
    top: 2,
    backgroundColor:
    'transparent',
    right: 10
  },
  // TODO: remove when you figure out v-centering
  // HACK FOR VERTICAL CENTERING
  resourceTitle: {
    fontSize: 20,
    color: '#555555'
  },
  description: {
    // flex: 1,
    flexWrap: 'nowrap',
    color: '#999999',
    fontSize: 14,
  },
  applicant: {
    color: '#999999',
    fontSize: 16,
    paddingTop: 3
  },
  row: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 5,
  },
  content: {
    opacity: 1,
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  cellRoundImage: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 1,
    borderRadius: 30,
    height: 60,
    marginRight: 10,
    width: 60,
    alignSelf: 'center'
  },
  cellText: {
    color: '#ffffff',
    fontSize: 20,
    backgroundColor: 'transparent'
  },
  cell: {
    backgroundColor: '#ffffff',
    height: 60,
    marginRight: 10,
    width: 60,
  },
  cellImage: {
    backgroundColor: '#ffffff',
    height: 60,
    marginRight: 10,
    width: 60,
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
    alignSelf: 'center',
    marginLeft: 10,
    marginTop: 7,
  },
  online: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 43,
  },
  verySmallLetters: {
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#b4c3cb'
  },
  actionView: {
    top: 25,
    position: 'absolute',
    right: 10,
    justifyContent: 'center',
  },
  countView: {
    top: 25,
    position: 'absolute',
    right: 15,
    justifyContent: 'center',
    borderRadius: 10,
    width: 20,
    height: 20,
    backgroundColor: appStyle.COUNTER_BG_COLOR,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appStyle.COUNTER_COLOR,
  },
  multiChooser: {
    position: 'absolute',
    right: 10,
    // top: 10,
    backgroundColor: 'transparent'
  },
  chooser: {
    position: 'absolute',
    right: 10,
    top: 25,
    backgroundColor: 'transparent'
  },
  count: {
    alignSelf: 'flex-start',
    minWidth: 18,
    marginLeft: -12,
    marginTop: 0,
    backgroundColor: appStyle.COUNTER_BG_COLOR,
    paddingHorizontal: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 9,
    borderColor: appStyle.COUNTER_COLOR,
    paddingVertical: 1
  },
  countText: {
    fontSize: 12,
    // marginLeft: -7,
    fontWeight: '600',
    alignSelf: 'center',
    color: appStyle.COUNTER_COLOR,
  },
  // progress: {
  //   marginTop: 10,
  //   justifyContent: 'center',
  //   alignSelf: 'center'
  // },
  providerLogo: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

module.exports = ResourceRow;
