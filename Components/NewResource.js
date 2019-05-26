import _ from 'lodash'
import { CardIOUtilities } from 'react-native-awesome-card-io';
import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'
import t from 'tcomb-form-native'
import dismissKeyboard from 'react-native/Libraries/Utilities/dismissKeyboard'
import { makeResponsive } from 'react-native-orient'
import React, { Component } from 'react'

import {
  View,
  Text,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types'

import constants from '@tradle/constants'
const {
  TYPE,
  ROOT_HASH
} = constants

const {
  SETTINGS,
  ENUM,
  PROFILE,
  ORGANIZATION,
  MONEY
} = constants.TYPES

import utils, { translate } from '../utils/utils'
import { getContentSeparator } from '../utils/uiUtils'
import ResourceMixin from './ResourceMixin'
import HomePageMixin from './HomePageMixin'
import ShowPropertiesView from './ShowPropertiesView'
import PageView from './PageView'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import rStyles from '../styles/registrationStyles'
import NewResourceMixin from './NewResourceMixin'
import OnePropFormMixin from './OnePropFormMixin'
import defaultBankStyle from '../styles/defaultBankStyle.json'
import { circled } from '../styles/utils'
import SignatureView from './SignatureView'
import termsAndConditions from '../termsAndConditions.json'
import StyleSheet from '../StyleSheet'
import ImageInput from './ImageInput'
import TextInputState from 'TextInputState'
import CustomIcon from '../styles/customicons'
import stylesheet from '../styles/styles'

import ActivityIndicator from './ActivityIndicator'
import platformStyles from '../styles/platform'
import BackgroundImage from './BackgroundImage'
import ENV from '../utils/env'
import chatStyles from '../styles/chatStyles'
import Image from './Image'

const BG_IMAGE = ENV.brandBackground
const FORM_ERROR = 'tradle.FormError'
const PHOTO = 'tradle.Photo'
const FILE = 'tradle.File'
const HAND_SIGNATURE = 'tradle.HandSignature'
var Form = t.form.Form;


class NewResource extends Component {
  static displayName = 'NewResource';
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    resource: PropTypes.object,
    originatingMessage: PropTypes.object,
    editCols: PropTypes.string,
    callback: PropTypes.func,
    returnRoute: PropTypes.object,
    additionalInfo: PropTypes.bool,
    doNotSend: PropTypes.bool
  };

  constructor(props) {
    super(props);
    let r = {};
    if (props.resource)
      r = utils.clone(props.resource) //extend(true, r, props.resource)
    else
      r[TYPE] = props.model.id
    let isRegistration = !utils.getMe()  && this.props.model.id === PROFILE  &&  (!this.props.resource || !this.props.resource[ROOT_HASH]);
    let isUploading = !isRegistration  &&  (!r[ROOT_HASH] || Object.keys(r).length === 2)
    this.state = {
      resource: r,
      isUploading,
      isRegistration,
      isLoadingVideo: false,
      isPrefilled: props.isPrefilled,
      modal: {},
      termsAccepted: isRegistration ? false : true
    }
    this.onSavePressed = this.onSavePressed.bind(this)
    this.showTermsAndConditions = this.showTermsAndConditions.bind(this)
    this.acceptTsAndCs = this.acceptTsAndCs.bind(this)
    this.setChosenValue = this.setChosenValue.bind(this)
    this.onAddItem = this.onAddItem.bind(this)
    this.onEndEditing = this.onEndEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.cancelItem = this.cancelItem.bind(this)

    let currentRoutes = props.navigator.getCurrentRoutes()
    let currentRoutesLength = currentRoutes.length

    if (props.isRefresh)
      currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.refresh.bind(this)
    else if (props.search)
      currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.getSearchResult.bind(this)
    else
      currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.onSavePressed


    // HACK
    let editProps = !props.exploreData  &&  utils.getEditableProperties(r)
    if (editProps.length  &&  editProps.length === 1) {
      let eProp = editProps[0]
      if (eProp.signature) {
        currentRoutes[currentRoutesLength - 1].onRightButtonPress = () => {
          this.onSetSignatureProperty(eProp, this.refs.sigView.getSignature())
        }
      }
    }
    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
  }
  refresh() {
    this.onSavePressed()
    if (this.state.missedRequiredOrErrorValue  &&  !utils.isEmpty(this.state.missedRequiredOrErrorValue))
      this.state.submitted = false
    else
      this.props.action()
  }
  shouldComponentUpdate(nextProps, nextState) {
    let isUpdate = nextState.err                             ||
           utils.resized(this.props, nextProps)              ||
           this.state.requestedProperties !== nextState.requestedProperties ||
           nextState.missedRequiredOrErrorValue              ||
           this.state.modal !== nextState.modal              ||
           this.state.prop !== nextState.prop                ||
           this.state.isUploading !== nextState.isUploading  ||
           this.state.itemsCount !== nextState.itemsCount    ||
           this.state.isLoadingVideo !== nextState.isLoadingVideo  ||
           this.state.keyboardSpace !== nextState.keyboardSpace    ||
           this.state.inFocus !== nextState.inFocus                ||
           this.state.disableEditing !== nextState.disableEditing  ||
           this.state.validationErrors !== nextState.validationErrors ||
           // this.state.termsAccepted !== nextState.termsAccepted    ||
          !_.isEqual(this.state.resource, nextState.resource)

    if (!isUpdate)
      isUpdate = !utils.compare(this.props.resource, nextProps.resource)
    return isUpdate
  }
  componentWillMount() {
    let { resource } = this.state
    // Profile gets changed every time there is a new photo added through for ex. Selfie
    if (utils.getId(utils.getMe()) === utils.getId(resource))
      Actions.getItem({resource: resource})
    if (resource[ROOT_HASH]) {
      if (Object.keys(resource).length === 2)
        Actions.getItem({resource})
      else
        Actions.getRequestedProperties({resource})
    }
    else {
     if (resource.id) {
        let type = utils.getType(resource.id)
        if (!utils.getModel(type).inlined)
          Actions.getItem({resource: resource})
      }
      else if (this.state.isUploading) {
        if (this.props.containerResource)
          this.state.isUploading = false
        else {
          Actions.getTemporary(resource[TYPE])
          Actions.getRequestedProperties({resource})
        }
      }
    }
    if (!this.props.exploreData  &&  Platform.OS === 'ios') {
      if (utils.hasPaymentCardScannerProperty(utils.getType(resource)))
        CardIOUtilities.preload();
    }
  }

  componentDidMount() {
    this.listenTo(Store, 'onAction');
  }


  componentDidUpdate() {
    let { missedRequiredOrErrorValue, noScroll } = this.state
    if (!missedRequiredOrErrorValue  ||  utils.isEmpty(missedRequiredOrErrorValue)) return

    let viewCols = this.props.model.viewCols
    let first
    for (let p in missedRequiredOrErrorValue) {
      if (!viewCols) {
        first = p
        break
      }

      if (!first || viewCols.indexOf(p) < viewCols.indexOf(first)) {
        first = p
      }
    }
    let ref = this.refs.form.getComponent(first) || this.refs[first]
    if (!ref) return

    if (!utils.isEmpty(missedRequiredOrErrorValue)  &&  !noScroll) {
      utils.scrollComponentIntoView(this, ref)
      this.state.noScroll = true
    }
  }

  onAction(params) {
    let { resource, action, error, requestedProperties, deleteProperties, message, validationErrors } = params
    let { navigator, prop, containerResource, callback, originatingMessage, bankStyle, model, currency, chat, isRefresh } = this.props
    if (action === 'languageChange') {
      navigator.popToTop()
      return
    }
    if (action === 'noChanges') {
      if (!isRefresh)
        this.setState({err: translate('nothingChanged'), submitted: false})
      return
    }
    if (action === 'getItem'  &&  utils.getId(this.state.resource) === utils.getId(resource)) {
      this.setState({
        resource: resource,
        isUploading: false
      })
      Actions.getRequestedProperties({resource})
      return
    }
    if (action === 'formEdit') {
      if (!resource  ||  utils.getId(this.state.resource) === utils.getId(resource)) {
        if (requestedProperties) {
          let r = resource ||  this.state.resource
          if (deleteProperties  &&  this.floatingProps)
            deleteProperties.forEach(p => {
              delete this.floatingProps[p]
              delete r[p]
            })
          this.setState({requestedProperties: requestedProperties, resource: r, message: message })
        }
        else if (params.prop  &&  params.value) {
          // set scanned qrCode prop
          let r = utils.clone(this.state.resource)
          let pName = params.prop.name
          r[pName] = params.value
          if (!this.floatingProps)
            this.floatingProps = {}
          this.floatingProps[pName] = params.value
          this.setState({resource: r})
        }
      }
      return
    }
    if (action === 'noAccessToServer') {
      this.setState({submitted: true, disableEditing: false})
      navigator.pop()
      return
    }
    if (action === 'getTemporary') {
      let r = {}
      _.extend(r, this.state.resource)
      _.extend(r, resource)

      this.setState({
        resource: r,
        isUploading: false,
        requestedProperties
      })
      return
    }

    if (action === 'runVideo'  && this.state.isRegistration) {
      if (callback)
        this.setState({isLoadingVideo: true})
        return;
    }
    if (action === 'validationError') {
      this.setState({validationErrors, submitted: false})
      return
    }
    if (!resource  &&  error &&  action === 'addItem') {
      this.state.submitted = false
      console.log('addItem: submitted = false')
      Alert.alert(
        error,
      )
      return
    }
    if (!resource  ||  (action !== 'addItem'  &&  action !== 'addMessage')) {
      return;
    }
    if (isRefresh)
      return
    if (this.state.resource[TYPE] !== resource[TYPE]) {
      if (!prop  ||  !containerResource)
        return
      // FormPrefill case
      if (containerResource[TYPE] === resource[TYPE])
        navigator.pop()
      return
    }
    if (error) {
      if (resource[TYPE] == this.state.resource[TYPE])
        this.setState({err: error, resource: resource, isRegistration: this.state.isRegistration});
      console.log('addItem error: submitted = false')
      this.state.submitted = false
      return;
    }
    if (action === 'addItem') {
      // If the resource was being modified, show the list of parties with whom the resource has been
      // previously shared and allow customer to choose who he wants to sharae the modifications with
      // if (resource._sharedWith  &&  resource._sharedWith.length > 1) {
      //   this.showSharedWithList(params.resource)
      //   return
      // }
    }
    if (callback) {
      utils.onNextTransitionEnd(navigator, () => this.state.submitted = false)
      callback(resource);
      return;
    }

    let self = this;
    let title = utils.getDisplayName(resource);
    let isMessage = utils.isMessage(resource)
    // When message created the return page is the chat window,
    // When profile or some contact info changed/added the return page is Profile view page
    if (isMessage  &&  !isRefresh) {
      if (originatingMessage  &&  resource[ROOT_HASH] !== originatingMessage[ROOT_HASH]) {
        let params = {
          value: {_documentCreated: true, _document: utils.getId(resource)},
          resource: originatingMessage,
          meta: utils.getModel(originatingMessage[TYPE])
        }
        Actions.addChatItem(params)
        navigator.pop();
        return;
      }
    }
    let currentRoutes = self.props.navigator.getCurrentRoutes();
    let currentRoutesLength = currentRoutes.length;
    let navigateTo = (currentRoutesLength == 2)
                   ? navigator.replace
                   : navigator.replacePrevious
    // Editing form originated from chat
    if (chat) {
      let routes = navigator.getCurrentRoutes()
      navigator.popToRoute(routes[routes.length - 3])
      return
    }
    navigateTo({
      title: title,
      componentName: isMessage ? 'MessageView' : 'ResourceView',
      titleTextColor: '#7AAAC3',
      rightButtonTitle: 'Edit',
      backButtonTitle: 'Back',
      onRightButtonPress: {
        title: title,
        componentName: 'NewResource',
        rightButtonTitle: 'Done',
        backButtonTitle: 'Back',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: model,
          resource: resource,
          bankStyle: bankStyle,
          currency: currency,
        }
      },
      passProps: {
        resource: resource,
        currency: currency,
        bankStyle: bankStyle
      }
    });
    if (currentRoutesLength != 2)
      navigator.pop();
  }
  // Show providers this resource was shared with and allow customer to choose
  // which providers to share the changes with
  showSharedWithList(newResource) {
    if (!this.props.resource  ||  !this.props.resource._sharedWith)
      return
    this.props.navigator.replace({
      title: translate('shareChangesWith'),
      backButtonTitle: 'Back',
      componentName: 'ResourceList',
      rightButtonTitle: 'Done',
      passProps: {
        message: translate('chooseCompaniesToShareChangesWith'),
        modelName: ORGANIZATION,
        to: this.state.resource.to,
        resource: this.props.resource,
        callback:  this.shareWith.bind(this, newResource),
        chat: this.props.chat,
        bankStyle: this.props.bankStyle,
        currency: this.props.currency
      }
    });
  }
  // The form/verification was shared with other providers and now it is edited.
  // Offer to share the form with the same providers it was originally share
  shareWith(newResource, list) {
    if (list.length)
      Actions.share(newResource, list)
    this.props.navigator.pop()
  }
  onSavePressed() {
    if (this.state.submitted)
      return

    this.state.submitted = true
    this.state.noScroll = false
    this.state.validationErrors = null
    let resource = this.state.resource;

    let value = this.refs.form  &&  this.refs.form.getValue() ||  resource
    if (!value) {
      value = this.refs.form.refs.input.state.value;
      if (!value)
        value = {}
    }

    // value is a tcomb Struct
    let json = utils.clone(value);
    let isNew = !resource[ROOT_HASH]
    this.checkEnums(json, resource)
    if (this.floatingProps) {
      for (let p in this.floatingProps) {
        if (isNew  ||  resource[p] !== this.floatingProps[p])
          json[p] = this.floatingProps[p]
      }
    }
    let { model, originatingMessage, lensId, chat, doNotSend, prop, containerResource, isRefresh } = this.props
    let props = model.properties
    let required = utils.ungroup(model, model.required)
    if (!required) {
      required = []
      for (let p in props) {
        if (p.charAt(0) !== '_'  &&  !props[p].readOnly)
          required.push(p)
      }
    }
    let requestedProperties = this.state.requestedProperties || this.props.requestedProperties
    if (requestedProperties) {
      for (let p in requestedProperties) {
        if (p.indexOf('_group') === -1  &&  required.indexOf(p) === -1)
          required.push(p)
      }
    }
    let missedRequiredOrErrorValue = {}
    let noRequiredValidation = containerResource && prop  && prop.partial
    if (noRequiredValidation) {
      containerResource[prop.name] = json
      if (!json[TYPE])
        json[TYPE] = resource[TYPE]
      let params = {resource: containerResource}
      if (!containerResource.from  ||  !containerResource.to)
        Actions.addItem(params)
      else
        Actions.addChatItem(params)
      return
    }

    this.checkRequired(json, required, missedRequiredOrErrorValue)

    let err = this.validateProperties(json)
    for (let p in err)
      missedRequiredOrErrorValue[p] = err[p]

    if (!utils.isEmpty(missedRequiredOrErrorValue)) {
      console.log('onSavePressed not all required: submitted = false')

      this.state.submitted = false
      let state = {
        missedRequiredOrErrorValue: missedRequiredOrErrorValue
      }
      this.setState(state)
      // HACK for REFRESH
      this.state.missedRequiredOrErrorValue = missedRequiredOrErrorValue
      return;
    }
    if (!value)
      debugger

    // HACK: adding new server url action should disable keyboard on submission
    if (resource[TYPE] === SETTINGS)
      this.setState({submitted: false, disableEditing: true})

    let r = {}
    _.extend(r, resource)
    json._context = r._context ||  (originatingMessage  &&  originatingMessage._context)
    if (originatingMessage  &&  originatingMessage.lens)
      json._lens = originatingMessage.lens

    delete r.url
    let params = {
      value: json,
      resource: r,
      meta: model,
      lens: lensId,
      isRegistration: this.state.isRegistration,
      isRefresh,
      doNotSend,
      chat
    };

    if (!lensId  &&  this.floatingProps  &&  this.floatingProps._lens)
      params.lens = this.floatingProps._lens

    // HACK
    if (!resource.from  ||  !resource.to)
      Actions.addItem(params)
    else {
      if (originatingMessage)
        params.disableFormRequest = originatingMessage
      Actions.addChatItem(params)
    }
  }
  // HACK: the value for property of the type that is subClassOf Enum is set on resource
  // and it is different from what tcomb sets in the text field
  checkEnums(json, resource) {
    let props = this.props.model.properties
    for (let p in json) {
      if (!props[p]  ||  !props[p].ref)
        continue
      let m = utils.getModel(props[p].ref)
      if (utils.isEnum(m))
        json[p] = resource[p]
    }
  }
  checkRequired(json, required, missedRequiredOrErrorValue) {
    let props = this.props.model.properties
    let resource = this.state.resource
    required.forEach((p) =>  {
      let v
      if (typeof json[p] !== 'undefined' || json[p])
        v = json[p]
      else if (resource)
        v = resource[p]
      if (v) {
        if (typeof v === 'string'  &&  !v.length) {
          v = null
          delete json[p]
        }
        else if (typeof v === 'object')  {
          let ref = props[p].ref
          if (ref) {
            this.checkRef(v, props[p], json, missedRequiredOrErrorValue)
          }
          else if (props[p].type === 'array'  &&  !v.length) {
            missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
            return
          }
        }
      }
      if (props[p].readOnly)
        return
      if (props[p].type  === 'boolean') {//  &&  typeof v !== 'undefined')
        if (typeof v === 'undefined')
          json[p] = false
        return
      }
      let isDate = Object.prototype.toString.call(v) === '[object Date]'
      if (!v  ||  (isDate  &&  isNaN(v.getTime())))  {
        let prop = props[p]
        if (prop.items  &&  prop.items.backlink)
          return
        if ((prop.ref) ||  isDate  ||  prop.items) {
          if (resource && resource[p])
            return;
          missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired') //'This field is required'
        }
        else if (!prop.displayAs)
          missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
      }
    })

  }
  checkRef(v, prop, json, missedRequiredOrErrorValue) {
    let ref = prop.ref
    let p = prop.name
    if (ref === PHOTO)
      return
    let rModel = utils.getModel(ref)
    if (utils.isEnum(rModel))
      return
    let resource = this.state.resource
    if (ref === MONEY) {
      if (!v.value || (typeof v.value === 'string'  &&  !v.value.length)) {
        missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
        return
      }
      if (v.currency)
        return
      if (resource[p].currency)
        v.currency = resource[p].currency
      else
        missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
      return
    }
    let units = prop.units
    if (units)
      v = v.value
    else {
      if (v.value === '')
        v = null
      delete json[p]
    }
  }
  addFormValues() {
    let value = this.refs.form.getValue();
    let json = value ? value : this.refs.form.refs.input.state.value;
    let resource = this.state.resource;
    if (!resource) {
      resource = {};
      resource[TYPE] = this.props.model.id;
    }
    for (let p in json)
      if (!resource[p] && json[p])
        resource[p] = json[p];
    return resource;
  }
  onAddItem(propName, item) {
    if (!item)
      return;
    let resource = this.addFormValues();
    if (this.props.model.properties[propName].items.ref)
      item[TYPE] = this.props.model.properties[propName].items.ref
    let items = resource[propName];
    if (!items) {
      items = [];
      resource[propName] = items;
    }
    items.push(item);
    let itemsCount = this.state.itemsCount ? this.state.itemsCount  + 1 : 1
    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[propName]
    this.setState({
      resource: resource,
      itemsCount: itemsCount,
      prop: propName,
      inFocus: propName
    });
  }

  onNewPressed(bl) {
    let resource = this.addFormValues();
    this.setState({resource: resource, err: '', inFocus: bl.name});
    let { bankStyle, currency, model, navigator } = this.props
    let blmodel = bl.items.ref ? utils.getModel(bl.items.ref) : model
    if (bl.items.ref  &&  bl.allowToAdd) {
      navigator.push({
        title: translate(bl, blmodel), // Add new ' + bl.title,
        backButtonTitle: 'Back',
        componentName: 'GridList',
        passProps: {
          modelName: bl.items.ref,
          to: this.state.resource.to,
          resource: this.state.resource,
          isChooser: true,
          prop: bl,
          callback: this.setChosenValue,
          bankStyle,
          currency
        }
      });
      return
    }
    navigator.push({
      title: translate('addNew', translate(bl, blmodel)), // Add new ' + bl.title,
      backButtonTitle: 'Back',
      componentName: 'NewItem',
      rightButtonTitle: 'Done',
      passProps: {
        metadata: bl,
        bankStyle,
        resource: this.state.resource,
        parentMeta: model,
        onAddItem: this.onAddItem,
        currency
      }
    });
  }
  getSearchResult() {
    let value = this.refs.form.getValue();
    if (!value) {
      value = this.refs.form.refs.input.state.value;
      if (!value)
        value = {}
    }
    this.checkEnums(value, this.state.resource)

    const { navigator, searchWithFilter, model, bookmark } = this.props
    let currentRoutes = navigator.getCurrentRoutes()
    let currentRoutesLength = currentRoutes.length

    // HACK: set filtering resource for right button on RL so that next
    // time filter shows in the form

    let val = utils.sanitize(value)
    if (!val[TYPE])
      val[TYPE] = model.id
    searchWithFilter(val, bookmark)
    currentRoutes[currentRoutesLength - 2].onRightButtonPress.passProps.resource = val
    navigator.pop()
  }

  render() {
    if (this.state.isUploading)
      return <View/>

    let resource = this.state.resource;

    let bankStyle = this.props.bankStyle || defaultBankStyle
    let editProps = utils.getEditableProperties(resource)
    if (editProps.length) {
      let eProp = editProps[0]
      if (eProp.signature) {
        return  <View style={{flex: 1}}>
                   <SignatureView ref={ref => {this.sigView = ref}} bankStyle={bankStyle}  sigViewStyle={bankStyle} onSignature={() => {
                      // this.props.navigator.pop()
                      this.onSetSignatureProperty(eProp, this.sigView.getSignature())
                    }} />
                 </View>
      }
    }

    let meta =  this.props.model;
    let { originatingMessage, setProperty, editCols, search, exploreData, isRefresh } = this.props

    let styles = createStyles({bankStyle, isRegistration})
    if (setProperty)
      this.state.resource[setProperty.name] = setProperty.value;
    let data = {};
    let model = {};
    let arrays = [];
    _.extend(data, resource);
    let params = {
        meta: meta,
        data: data,
        model: model,
        items: arrays,
        onEndEditing: this.onEndEditing,
        componentName: 'NewResource',
        editable: this.state.disableEditing ? !this.state.disableEditing : true
      };
    if (editCols)
      params.editCols = editCols;
    let isRegistration = this.state.isRegistration
    if (isRegistration)
      params.isRegistration = true
    if (originatingMessage  &&  originatingMessage[TYPE] === FORM_ERROR) {
      params.formErrors = {}
      originatingMessage.errors.forEach((r) => {
        params.formErrors[r.name] = r.error
      })
    }
    else if (this.state.validationErrors)
      params.validationErrors = this.state.validationErrors

    let options = this.getFormFields(params);
    if (!options) {
      let contentSeparator = getContentSeparator(bankStyle)
      let height = utils.dimensions(NewResource).height - 80

      return <PageView style={[platformStyles.container, {height}]} separator={contentSeparator} bankStyle={bankStyle}>
                <ShowPropertiesView resource={data}
                                    bankStyle={bankStyle}
                                    showRefResource={this.showRefResource.bind(this)}
                                    navigator={navigator} />
                <TouchableOpacity onPress={this.onSavePressed} style={{paddingBottom: 30}}>
                  <View style={styles.submitButton}>
                    <Icon name='ios-send' color='#fff' size={30} style={styles.sendIcon}/>
                    <Text style={styles.submitText}>{translate('Submit')}</Text>
                  </View>
                </TouchableOpacity>
             </PageView>
    }

    let Model = t.struct(model);
    let itemsMeta
    if (editCols) {
      itemsMeta = []
      editCols.forEach((p) => {
        if (meta.properties[p].type === 'array')
          itemsMeta.push(meta.properties[p])
      })
    }
    else
      itemsMeta = utils.getItemsMeta(meta);

    let arrayItems
    if (!search) {
      for (let p in itemsMeta) {
        let bl = itemsMeta[p]
        if (bl.icon === 'ios-telephone-outline') {
          bl.icon = 'ios-call-outline'
        }
        if (!arrayItems)
          arrayItems = []
        if (bl.readOnly  ||  bl.items.backlink) {
          arrayItems.push(<View key={this.getNextKey()} ref={bl.name} />)
          continue
        }
        // let count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
        if (/*count  && */ (bl.name === 'photos' || bl.items.ref === PHOTO ||  bl.items.ref === FILE))
          arrayItems.push(this.getPhotoItem(bl, styles))
        else
          arrayItems.push(this.getItem(bl, styles))
      }
    }
    if (isRegistration)
      Form.stylesheet = rStyles
    else
      Form.stylesheet = stylesheet

    let { height } = utils.dimensions(NewResource)
    if (!options)
      options = {}
    options.auto = 'placeholders';
    options.tintColor = 'red'
    let button
    if (isRegistration)
      button = <View>
                 <TouchableOpacity style={styles.thumbButton}
                    onPress={this.state.termsAccepted ? this.onSavePressed : this.showTermsAndConditions}>
                    <View style={styles.getStarted}>
                       <Text style={styles.getStartedText}>ENTER</Text>
                    </View>
                 </TouchableOpacity>
               </View>
    let formStyle = isRegistration
                  ? {justifyContent: 'center', flex: 1, height: height - (height > 1000 ? 0 : isRegistration ? 50 : 100)}
                  : styles.noRegistration
    let jsonProps = utils.getPropertiesWithRange('json', meta)
    let jsons
    if (jsonProps  &&  jsonProps.length) {
      let hidden = meta.hidden
      jsonProps.forEach((prop) => {
        if (prop.hidden  ||  (hidden  &&  hidden.includes(prop.name)))
          return
        let val = this.state.resource[prop.name]
        if (val) {
          let params = {prop: prop, json: val, jsonRows: [], isView: true}
          if (!jsons)
            jsons = []
          jsons.push(this.showJson(params))
        }
      })
    }
    // add server url sometimes takes a while
    let wait
    if (this.state.disableEditing)
      wait = <View style={styles.indicator}>
               <ActivityIndicator animating={true} size='large' color='#7AAAC3'/>
             </View>


    let loadingVideo
    if (this.state.isLoadingVideo)
      loadingVideo = <View style={styles.indicator}>
                       <ActivityIndicator animating={true} size='large' color='#ffffff'/>
                    </View>

    let formsToSign
    if (resource[TYPE] === HAND_SIGNATURE  &&  resource.signatureFor) {
      let formList = resource.signatureFor.map((r) => (
          <TouchableOpacity onPress={() => this.showResource(r)} style={styles.formListItem} key={this.getNextKey()}>
          <View>
            <Text style={styles.forms}>{translate(utils.getModel(r[TYPE]))}</Text>
          </View>
          </TouchableOpacity>))

      formsToSign = <View>
                      <Text style={styles.formsToSign}>Forms you are signing</Text>
                      {formList}
                    </View>
    }

    let submit
    if (!isRegistration  &&  !isRefresh) {
      let onPress = exploreData ? this.getSearchResult.bind(this) : this.onSavePressed
      if (this.state.err) {
        Alert.alert(this.state.err)
        this.state.err = null
      }
      if (bankStyle  &&  bankStyle.submitBarInFooter)
        submit = <TouchableOpacity onPress={onPress}>
                   <View style={styles.submitBarInFooter}>
                     <View style={styles.bar}>
                       <Text style={styles.submitBarInFooterText}>{translate('next')}</Text>
                     </View>
                   </View>
                 </TouchableOpacity>
      else
        submit = <TouchableOpacity onPress={onPress} style={{paddingBottom: 30}}>
                   <View style={styles.submitButton}>
                     <Icon name='ios-send' color='#fff' size={30} style={styles.sendIcon}/>
                     <Text style={styles.submitText}>{translate('Submit')}</Text>
                   </View>
                 </TouchableOpacity>

    }
    if (arrayItems) {
      arrayItems = <View style={styles.arrayItems}>
                     {arrayItems}
                   </View>
    }
    let content =
      <ScrollView style={styles.scroll}
                  ref='scrollView' {...this.scrollviewProps}
                  keyboardShouldPersistTaps="always"
                  keyboardDismissMode={isRegistration || Platform.OS === 'ios' ? 'on-drag' : 'interactive'}>
        <View style={formStyle}
          onStartShouldSetResponderCapture={(e) => {
            if (Platform.OS === 'android') {
              const focusField = TextInputState.currentlyFocusedField();
              if (focusField != null && e.nativeEvent.target != focusField)
                dismissKeyboard();
            }
          }}>
          <View style={isRegistration ? {marginHorizontal: height > 1000 ? 50 : 30} : {marginHorizontal: 0}}>
            <Form ref='form' type={Model} options={options} value={data} onChange={this.onChange}/>
            {formsToSign}
            {button}
            {arrayItems}
            {jsons}
            {loadingVideo}
          </View>
        </View>
        <View style={styles.submit}>
          {submit}
        </View>
        {wait}
      </ScrollView>

    if (!isRegistration) {
      let errors
      if (this.state.missedRequiredOrErrorValue  &&  !utils.isEmpty(this.state.missedRequiredOrErrorValue)) {
        errors = <View style={styles.errors}>
                   <Text style={styles.errorsText}>{translate('fillRequiredFields')}</Text>
                 </View>
      }
      else if (this.state.message) {
        errors = <View style={styles.errors}>
                   <Text style={styles.errorsText}>{translate(this.state.message)}</Text>
                 </View>
      }
      else if (params.validationErrors) {
        errors = <View style={styles.errors}>
                   <Text style={styles.errorsText}>{translate('validationErrors')}</Text>
                 </View>
      }

      let contentSeparator = getContentSeparator(bankStyle)
      return <PageView style={platformStyles.container} separator={contentSeparator} bankStyle={bankStyle}>
               {errors}
               {content}
              </PageView>

    }

    let title = <View style={styles.logo}>
                  <CustomIcon name='tradle' size={40} color='#ffffff' style={{padding: 10}}/>
                </View>


    return (
      <View style={{height: height}}>
        <BackgroundImage source={BG_IMAGE} />
        <View style={{justifyContent: 'center', height: height}}>
          {title}
          {content}
        </View>

      </View>
    )
  }
  showResource(r) {
    this.props.navigator.push({
      title: r.title,
      backButtonTitle: 'Back',
      componentName: 'MessageView',
      passProps: {
        bankStyle: this.props.bankStyle,
        resource: r,
        currency: this.props.resource.currency || this.props.currency,
        country: this.props.resource.country,
      }
    })

  }
  showTermsAndConditions() {
    this.props.navigator.push({
      componentName: 'ResourceView',
      title: translate('termsAndConditions'),
      backButtonTitle: 'Back',
      rightButtonTitle: 'Accept',
      passProps: {
        resource: termsAndConditions,
        action: this.acceptTsAndCs
      }
   })
  }
  acceptTsAndCs() {
    this.setState({termsAccepted: true})
    if (this.state.resource.firstName)
      this.onSavePressed()
    else
      this.props.navigator.pop()
  }

  cancelItem(pMeta, item) {
    let dn = ''
    let ref = pMeta.items.ref
    if (ref)
      dn = translate(utils.getModel(ref))
    Alert.alert(
      translate('cancelItem', dn),
      null,
      [
        {text: 'Cancel', onPress: () => console.log('Canceled!')},
        {text: 'Ok', onPress: () => this.doCancel(pMeta, item)},
      ]
    )
  }
  doCancel(pMeta, item) {
    let list = this.state.resource[pMeta.name];
    for (let i=0; i<list.length; i++) {
      if (_.isEqual(list[i], item)) {
        list.splice(i, 1);
        this.setState({
          resource: this.state.resource,
          itemsCount: list.length
        })
        return
      }
    }
  }

  showItems(prop) {
    let resource = this.state.resource;
    let model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[TYPE] = model.id;
    }

    let currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate('tapToRemovePhotos'), //Tap to remove photos',
      titleTintColor: 'red',
      componentName: 'GridItemsList',
      noLeftButton: true,
      rightButtonTitle: 'Done',
      passProps: {
        prop:        prop.name,
        resource:    resource,
        onAddItem:   this.onAddItem,
        list:        resource[prop.name],
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenValue,
      }
    });
  }
  getItem(bl, styles) {
    let resource = this.state.resource
    if (utils.isHidden(bl.name, resource))
      return
    let meta = this.props.model
    let blmodel = meta
    let lcolor = this.getLabelAndBorderColor(bl.name)

    let actionableItem
    let count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
    let label = translate(bl, blmodel)
    if (!this.props.search  &&  meta.required  &&  meta.required.indexOf(bl.name) !== -1)
      label += ' *'
    let width = utils.dimensions(NewResource).width - 40
    if (count) {
      let cstyle = styles.activePropTitle
      actionableItem = <View style={{width}}>
                         <TouchableOpacity onPress={this.onNewPressed.bind(this, bl, meta)}>
                           <View style={styles.items}>
                             <Text style={[cstyle, {color: lcolor}]}>{label}</Text>
                             <View style={styles.addButton}>
                               <Icon name={bl.icon || 'md-add'} size={bl.icon ? 25 : 20}  color='#ffffff' style={{marginTop: 2}}/>
                             </View>
                           </View>
                         </TouchableOpacity>
                         {this.renderItems({value: resource[bl.name], prop: bl, cancelItem: this.cancelItem})}
                       </View>

    }
    else {
      actionableItem = <View style={{width}}>
                       <TouchableOpacity onPress={this.onNewPressed.bind(this, bl, meta)}>
                         <View style={[styles.items, {paddingBottom: 5}]}>
                           <Text style={styles.noItemsText}>{label}</Text>
                           <View style={styles.addButton}>
                              <Icon name={bl.icon || 'md-add'}   size={bl.icon ? 25 : 20} color='#ffffff' style={{marginTop: 2}}/>
                           </View>
                         </View>
                       </TouchableOpacity>
                       </View>
    }
    let err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[bl.name]
            : null

    let istyle = [styles.itemButton, {marginHorizontal: 10, borderBottomColor: lcolor}]
    if (err)
      istyle.push({marginBottom: 10})
    else if (!count)
      istyle.push({paddingBottom: 0, height: 70})
    else {
      let height = resource[bl.name].photo ? 55 : 45
      istyle.push({paddingBottom: 0, height: count * height + 35})
    }
    istyle = StyleSheet.flatten(istyle)
    return (
      <View key={this.getNextKey()}>
        <View style={istyle} ref={bl.name}>
          {actionableItem}
        </View>
        {this.paintError({prop: bl})}
        {this.paintHelp(bl)}
      </View>
    );
  }
  getPhotoItem(bl, styles) {
    let meta = this.props.model
    let resource = this.state.resource
    let blmodel = meta
    let counter
    let itemsArray = null
    let lcolor = this.getLabelAndBorderColor(bl.name)
    let count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0

    let bankStyle = this.props.bankStyle || defaultBankStyle

    let linkColor = bankStyle.linkColor
    let label = translate(bl, blmodel)
    if (!this.props.search  &&  meta.required  &&  meta.required.indexOf(bl.name) !== -1)
      label += ' *'
    if (count) {
      let items = []
      let arr = resource[bl.name]
      let n = Math.min(arr.length, 7)

      for (let i=0; i<n; i++)
        items.push(<Image resizeMode='cover' style={styles.thumb} source={{uri: arr[i].url}}  key={this.getNextKey()}/>)
      itemsArray =
        <View style={styles.photoStrip}>
          <Text style={[styles.activePropTitle, {paddingBottom: 10, color: lcolor}]}>{label}</Text>
          <View style={styles.row}>{items}</View>
        </View>
    }
    else {
      itemsArray = <Text style={styles.noItemsText}>{label}</Text>
    }
    counter = <Icon name='ios-camera-outline'  size={25} color={linkColor} />
    let actionableItem
    if (count)
      actionableItem = <TouchableOpacity
                          style={styles.pics}
                          onPress={this.showItems.bind(this, bl, meta)}>
                         {itemsArray}
                       </TouchableOpacity>
    else
      actionableItem = <ImageInput
                         cameraType={bl.cameraType}
                         style={{paddingHorizontal: 5}}
                         allowPicturesFromLibrary={bl.allowPicturesFromLibrary}
                         underlayColor='transparent'
                         onImage={item => this.onAddItem(bl.name, item)}>
                         {itemsArray}
                       </ImageInput>

    let istyle = [count && styles.photoButton || styles.itemButton, {marginHorizontal: 10, borderBottomColor: lcolor}]
    if (!count)
      istyle.push({height: 70})

    return (
      <View key={this.getNextKey()}>
        <View style={istyle} ref={bl.name}>
          <View style={styles.items}>
            {actionableItem}
            <ImageInput
                prop={bl}
                underlayColor='transparent'
                style={styles.actionIcon}
                allowPicturesFromLibrary={bl.allowPicturesFromLibrary}
                onImage={item => this.onAddItem(bl.name, item)}>
              {counter}
            </ImageInput>
          </View>
        </View>
        {this.paintError({prop: bl})}
        {this.paintHelp(bl)}
      </View>
    );
  }
  onEndEditing(prop, event) {
    if (this.state.resource[prop]  ||  event.nativeEvent.text.length)
      this.state.resource[prop] = event.nativeEvent.text;
  }
  onChange(value, properties) {
    if (!properties)
      return
    properties.forEach((p) => {
      this.state.resource[p] = value[p];
    })
  }
}
reactMixin(NewResource.prototype, Reflux.ListenerMixin);
reactMixin(NewResource.prototype, NewResourceMixin);
reactMixin(NewResource.prototype, ResourceMixin);
reactMixin(NewResource.prototype, HomePageMixin);
reactMixin(NewResource.prototype, OnePropFormMixin);
NewResource = makeResponsive(NewResource)

var createStyles = utils.styleFactory(NewResource, function ({ dimensions, bankStyle, isRegistration }) {
  return StyleSheet.create({
    container: {
      flex: 1
    },
    noItemsText: {
      fontSize: 20,
      color: '#AAAAAA',
      // alignSelf: 'center',
      // paddingLeft: 10
    },
    forms: {
      fontSize: 18,
      color: '#757575',
      padding: 10
    },
    itemsText: {
      fontSize: 20,
      color: '#000000',
      // alignSelf: 'center',
      paddingLeft: 10
    },
    actionIcon: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      paddingBottom: 2
      // paddingRight: 5
    },
    itemButton: {
      height: 60,
      marginLeft: 10,
      // marginLeft: 10,
      borderColor: '#ffffff',
      // borderBottomColor: '#b1b1b1',
      // borderBottomWidth: 1,
      paddingBottom: 10,
      justifyContent: 'flex-end',
    },
    photoButton: {
      marginLeft: 10,
      borderColor: '#ffffff',
      // borderBottomColor: '#b1b1b1',
      // borderBottomWidth: 1,
      // paddingBottom: 5,
    },

    photoBG: {
      // marginTop: -15,
      alignItems: 'center',
      paddingBottom: 10,
      // backgroundColor: '#245D8C'
    },
    err: {
      // paddingVertical: 10,
      flexWrap: 'wrap',
      paddingHorizontal: 25,
      fontSize: 16,
      color: 'darkred',
    },
    getStartedText: {
      // color: '#f0f0f0',
      color: '#eeeeee',
      fontSize: 20,
      fontWeight:'300',
      alignSelf: 'center'
    },
    getStarted: {
      backgroundColor: '#467EAE', //'#2892C6',
      paddingVertical: 10,
      marginLeft: 10,
      alignSelf: 'stretch',
    },
    thumbButton: {
      marginTop: 20,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
    },
    thumb: {
      width:  40,
      height: 40,
      marginRight: 2,
      borderRadius: 5
    },
    items: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      // minHeight: 30
    },
    activePropTitle: {
      fontSize: 12,
      // paddingTop: 20,
      paddingBottom: 5,
      // marginBottom: 5,
      color: '#bbbbbb'
    },
    photoStrip: {
      paddingBottom: 5,
      marginHorizontal: 5,
      marginTop: 0
    },
    row: {
      flexDirection: 'row'
    },
    logo: {
      opacity: 0.7,
      alignSelf: 'flex-end',
    },
    noRegistration: {
      flex: 1,
      justifyContent: 'flex-start'
    },
    noRegistrationButton: {
      height: 0
    },
    indicator: {
      alignItems: 'center',
      marginTop: 50
    },
    formListItem: {
      padding: 10,
      borderBottomColor: '#eeeeee',
      borderBottomWidth: 1
    },
    scroll: {
      backgroundColor: 'transparent',
      paddingTop:10
    },
    bar: {
      backgroundColor: 'transparent',
      paddingHorizontal: 10,
      justifyContent: 'center'
    },
    pics: {
      paddingTop: 10
    },
    submit: {
      width: 340,
      alignSelf: 'center'
    },
    submitButton: {
      backgroundColor: bankStyle.buttonBgColor || bankStyle.linkColor,
      flexDirection: 'row',
      justifyContent: 'center',
      width: 340,
      marginTop: 20,
      // marginBottom: 50,
      alignSelf: 'center',
      height: 40,
      borderRadius: 5,
      // marginHorizontal: 20
    },
    submitText: {
      fontSize: 20,
      paddingLeft: 7,
      color: bankStyle.buttonColor || '#ffffff',
      alignSelf: 'center'
    },
    errors: {
      height: 45,
      justifyContent: 'center',
      backgroundColor: bankStyle.errorBgColor || '#990000',
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingHorizontal: 7
    },
    errorsText: {
      color: bankStyle.errorColor ||  '#eeeeee',
      fontSize: 16
    },
    sendIcon: {
      marginTop: 5
    },
    formsToSign: {
      fontSize: 22,
      alignSelf: 'center',
      color: bankStyle.linkColor
    },
    submitBarInFooter: {
      marginHorizontal: -3,
      marginBottom: -2,
      backgroundColor: bankStyle.contextBackgroundColor,
      borderTopColor: bankStyle.contextBackgroundColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: 45,
      justifyContent: 'center',
      alignItems: 'center'
    },
    submitBarInFooterText: {
      fontSize: 24,
      color: bankStyle.contextTextColor
    },
    arrayItems: {
      marginTop: isRegistration ? 0 : -10,
      paddingBottom: 20
    },
    addButton: {
      ...circled(25),
      backgroundColor: bankStyle.linkColor,
      // shadowOpacity: 0.7,
      // shadowRadius: 5,
      shadowColor: '#afafaf',
    },
  })
})
module.exports = NewResource;
