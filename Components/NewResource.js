import _ from 'lodash'
import { CardIOUtilities } from 'react-native-awesome-card-io';
import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'
import t from 'tcomb-form-native'
import { makeResponsive } from 'react-native-orient'
import React, { Component } from 'react'

import {
  View,
  // Text,
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
  IDENTITY,
  ORGANIZATION,
  MONEY
} = constants.TYPES

const SUCCESSFUL = 1
const FAILED = 2
const SUCCESSFUL_WITH_ALERT = 3

import components from './components'
import utils, { translate } from '../utils/utils'
import { getContentSeparator, getMarkdownStyles } from '../utils/uiUtils'
import Markdown from './Markdown'
import { Text } from './Text'
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
import CustomIcon from '../styles/customicons'
import stylesheet from '../styles/styles'

var Keyboard
if (Platform.OS !== 'web') {
  Keyboard = require('Keyboard')
}

import ActivityIndicator from './ActivityIndicator'
import platformStyles from '../styles/platform'
import BackgroundImage from './BackgroundImage'
import ENV from '../utils/env'
import DropPage from './DropPage'
import chatStyles from '../styles/chatStyles'
import Image from './Image'

const BG_IMAGE = ENV.brandBackground
const FORM_ERROR = 'tradle.FormError'
const PHOTO = 'tradle.Photo'
const FILE = 'tradle.File'
const HAND_SIGNATURE = 'tradle.HandSignature'
const DURATION = 'tradle.Duration'

var Form = t.form.Form;
const excludeTemporaryFor = [
  'tradle.CheckOverride'
]

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
    let { resource, originatingMessage, model, isPrefilled } = props
    if (resource)
      r = utils.clone(resource) //extend(true, r, props.resource)
    else
      r[TYPE] = model.id

    let isRegistration = !utils.getMe()  &&  model.id === PROFILE  &&  (!this.props.resource || !this.props.resource[ROOT_HASH]);
    let isUploading = !isRegistration  &&  (!r[ROOT_HASH] || Object.keys(r).length === 2)
    this.state = {
      resource: r,
      isUploading,
      isRegistration,
      isLoadingVideo: false,
      isPrefilled,
      modal: {},
      termsAccepted: isRegistration ? false : true,
      fixedProps: {}
    }
    if (originatingMessage  &&  originatingMessage[TYPE] === FORM_ERROR) {
      if (originatingMessage.message)
        this.state.message = originatingMessage.message
    }

    this.onSavePressed = this.onSavePressed.bind(this)
    this.showTermsAndConditions = this.showTermsAndConditions.bind(this)
    this.acceptTsAndCs = this.acceptTsAndCs.bind(this)
    this.setChosenValue = this.setChosenValue.bind(this)
    this.onAddItem = this.onAddItem.bind(this)
    this.onEndEditing = this.onEndEditing.bind(this)
    this.onChange = this.onChange.bind(this)
    this.cancelItem = this.cancelItem.bind(this)
    this.editItem = this.editItem.bind(this)

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
    let value = this.onSavePressed()
    if (this.state.missedRequiredOrErrorValue  &&  !utils.isEmpty(this.state.missedRequiredOrErrorValue))
      this.state.submitted = false
    else
      this.props.action(value)
  }
  shouldComponentUpdate(nextProps, nextState) {
    let isUpdate = nextState.err                             ||
           utils.resized(this.props, nextProps)              ||
           nextState.missedRequiredOrErrorValue              ||
           this.state.modal !== nextState.modal              ||
           this.state.prop !== nextState.prop                ||
           this.state.enumProp !== nextState.enumProp        ||
           this.state.isUploading !== nextState.isUploading  ||
           this.state.recalculateMode !== nextState.recalculateMode ||
           this.state.isLoadingVideo !== nextState.isLoadingVideo   ||
           this.state.keyboardSpace !== nextState.keyboardSpace     ||
           this.state.inFocus !== nextState.inFocus                 ||
           this.state.disableEditing !== nextState.disableEditing   ||
           !_.isEqual(this.state.fixedProps, nextState.fixedProps)  ||
           this.state.requestedProperties !== nextState.requestedProperties ||
           this.state.validationErrors !== nextState.validationErrors       ||
           this.state.itemsChangesCounter !== nextState.itemsChangesCounter ||
           // this.state.termsAccepted !== nextState.termsAccepted    ||
          !_.isEqual(this.state.resource, nextState.resource)

    if (!isUpdate)
      isUpdate = !utils.compare(this.props.resource, nextProps.resource)
    return isUpdate
  }
  componentWillMount() {
    let { resource, isUploading, prop } = this.state
    let { isPrefilled, exploreData, originatingMessage: originatingResource, containerResource } = this.props    // Profile gets changed every time there is a new photo added through for ex. Selfie
    if (utils.getId(utils.getMe()) === utils.getId(resource))
      Actions.getItem({resource})

    let model = utils.getModel(utils.getType(resource))
    if (resource[ROOT_HASH]) {
      if (Object.keys(resource).length === 2)
        Actions.getItem({resource})
      else
        Actions.getRequestedProperties({resource, originatingResource})
    }
    else if (resource.id) {
      if (!model.inlined)
        Actions.getItem({resource})
    }
    else if (isUploading) {
      if (containerResource)
        this.state.isUploading = false
      else {
        let type = resource[TYPE]
        let m = utils.getModel(type)
        let exclude
        while (!exclude  &&  type) {
          exclude = excludeTemporaryFor.includes(type)
          if (!exclude)
            type = utils.getModel(type).subClassOf
        }
        if (!exclude  &&  prop  &&  m.properties[prop].inlined)
          exclude = true
        Actions.getTemporary(resource[TYPE], exclude)
        if (!exploreData)
          Actions.getRequestedProperties({resource, originatingResource})
      }
    }
    if (!exploreData  &&  Platform.OS === 'ios') {
      if (utils.hasPaymentCardScannerProperty(utils.getType(resource)))
        CardIOUtilities.preload();
    }
  }

  componentDidMount() {
    this.listenTo(Store, 'onAction');
    if (!Keyboard) return

    Keyboard.addListener('keyboardWillShow', (e) => {
      this.updateKeyboardSpace(e)
    });

    Keyboard.addListener('keyboardWillHide', (e) => {
      this.resetKeyboardSpace(e)
    })
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

    let ref = this.refs.form && this.refs.form.getComponent(first)
    if (!ref) {
      ref = this.refs[first]
      if (!ref) return
    }

    if (!utils.isEmpty(missedRequiredOrErrorValue)  &&  !noScroll) {
      utils.scrollComponentIntoView(this, ref)
      this.state.noScroll = true
    }
  }

  onAction(params) {
    let { resource, action, error, requestedProperties, deleteProperties,
          message, validationErrors, recalculate } = params
    let { navigator, prop, containerResource, callback,
          originatingMessage, bankStyle, model, currency, chat, isRefresh } = this.props
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
    if (action === 'hierarchyUploaded') {
      if (model.id === params.model.id  &&  resource === params.resource)
        navigator.pop()
    }
    if (action === 'formEdit') {
      if (!resource  ||  (utils.getType(this.state.resource) === utils.getType(resource) && utils.getId(this.state.resource) === utils.getId(resource))) {
        let { fixedProps } = this.state
        let { doTable } = params
        let status = this.doRecalculate(validationErrors)
        if (recalculate) {
          if (status === FAILED) {
            if (message)
              Alert.alert(message)
            else
              Alert.alert(translate('goalNotFound'))
          }
          let state = {recalculateMode: true, validationErrors, doTable: false, status }
          if (resource)
            state.resource = resource
          this.setState(state)
        }
        else if (requestedProperties) {
          let r = resource ||  this.state.resource
          if (originatingMessage  &&  originatingMessage.prefill)
            _.defaults(r, originatingMessage.prefill)
          if (deleteProperties  &&  this.floatingProps)
            deleteProperties.forEach(p => {
              delete this.floatingProps[p]
              delete r[p]
            })
          this.setState({requestedProperties, resource: r, message: message || this.state.message, recalculateMode: false, validationErrors, doTable, status })
        }
        else if (params.prop  &&  params.value) {
          // set scanned qrCode prop
          let r = utils.clone(this.state.resource)
          let pName = params.prop.name
          r[pName] = params.value
          if (!this.floatingProps)
            this.floatingProps = {}
          this.floatingProps[pName] = params.value
          this.setState({ resource: r, recalculateMode: false, validationErrors, doTable })
        }
        else if (fixedProps)
          this.setState({ resource, recalculateMode: false, validationErrors, fixedProps: {}, doTable, status })
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

      if (!originatingMessage  ||  !originatingMessage.prefill)
        _.extend(r, resource)

      _.extend(r, this.state.resource)

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
    if (action === 'moveBookmark') {
      navigator.pop()
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
    let title = utils.getDisplayName({ resource })
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
  doRecalculate(validationErrors) {
    if (!validationErrors  ||  !validationErrors._info)
      return SUCCESSFUL
    const { hasSuccessful, hasFailed } = validationErrors._info
    if (!hasSuccessful)
      return FAILED
    if (!hasFailed)
      return SUCCESSFUL
    return SUCCESSFUL_WITH_ALERT
  }
  shareWith(newResource, list) {
    if (list.length)
      Actions.share(newResource, list)
    this.props.navigator.pop()
  }
  onSavePressed() {
    const { submitted, fixedProps, recalculateMode, status } = this.state
    if (submitted)
      return
    if (recalculateMode) {
      Alert.alert(translate('pleaseRecalculate'))
      return
    }
    if (status === SUCCESSFUL_WITH_ALERT) {
      this.alertNotFullSuccess(this.onSavePressed, status)
      // this.setState({status: SUCCESSFUL})
      return
    }
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
    let { model, originatingMessage, lensId, chat, editFormRequestPrefill, currentFolder,
          doNotSend, prop, containerResource, isRefresh, application, errs,
          navigator } = this.props
    let required = utils.ungroup({model, viewCols: model.required, edit: true})
    if (!required)
      required = []

    let props = model.properties
    if (model.softRequired  &&  this.refs.form) {
      // HACK a bit
      let formProps = this.refs.form.props  &&  this.refs.form.props.options.fields
      for (let p in formProps)
        if (props[p]  &&  model.softRequired.includes(p))
          required.push(p)
    }

    let reqProperties = this.state.requestedProperties || this.props.requestedProperties
    if (reqProperties) {
      let { requestedProperties } = reqProperties
      if (requestedProperties) {
        let eCols = []
        let { softRequired } = this.addRequestedProps({eCols, props})
        softRequired && softRequired.forEach(p => {
          if (required.indexOf(p) === -1)
            required.push(p)
        })
      }
    }
    if (originatingMessage  &&  originatingMessage[TYPE] === FORM_ERROR  &&  errs) {
      Object.keys(errs).forEach(prop => {
        if (!required.includes(prop))
          required.push(prop)
      })
    }
    if (!required.length  &&  !reqProperties) {
      const props = model.properties
      for (let p in props) {
        if (p.charAt(0) !== '_'  &&  !props[p].readOnly)
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
      return json
    }
    if (required)
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
      return
    }
    if (!value)
      debugger

    // HACK: adding new server url action should disable keyboard on submission
    if (resource[TYPE] === SETTINGS)
      this.setState({submitted: false, disableEditing: true})

    let r = {}
    _.extend(r, resource)
    let context = r._context ||  (originatingMessage  &&  originatingMessage._context)
    if (context)
      json._context = context
    if (originatingMessage) {
      if (originatingMessage.lens)
        json._lens = originatingMessage.lens
      if (originatingMessage.prefill)
        json._sourceOfData = originatingMessage
    }
if (r.url)
  debugger
    // delete r.url
    let params = {
      value: json,
      resource: r,
      meta: model,
      lens: lensId,
      isRegistration: this.state.isRegistration,
      isRefresh,
      doNotSend: isRefresh,
      chat,
      currentFolder
    }

    if (!lensId  &&  this.floatingProps  &&  this.floatingProps._lens)
      params.lens = this.floatingProps._lens

    // HACK
    //???? Actions.saveTemporary(r)
    if (!resource.from  ||  !resource.to)
      Actions.addItem(params)
    else if (editFormRequestPrefill) {
      let toId = application.applicant.id.replace(IDENTITY, PROFILE)
      if (!json[TYPE])
      json[TYPE] = originatingMessage.form
      let msg = {
        [TYPE]: 'tradle.FormRequest',
        prefill: json,
        product: application.requestFor,
        form: originatingMessage.form,
        from: utils.getMe(),
        to: {id: toId},
        // _context: application._context,
        // context: application.context
      }
      Actions.addMessage({msg, editFormRequestPrefill, originatingMessage, application})
      navigator.pop()
    }
    else {
      if (originatingMessage)
        params.disableFormRequest = originatingMessage
      Actions.addChatItem(params)
    }
    return json
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

    if (ref === MONEY || ref === DURATION) {
      this.checkInlinedRef(prop, v)
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
  checkInlinedRef(prop, v) {
    const rModel = utils.getModel(prop.ref)
    let p = prop.name
    const { missedRequiredOrErrorValue, resource } = this.state
    let oneOfProp = rModel.inlined  &&  utils.getPropertiesWithAnnotation(rModel, 'oneOf')
    if (!oneOfProp)
      return
    if (!v.value || (typeof v.value === 'string'  &&  !v.value.length)) {
      missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
      return
    }
    let oname = Object.keys(oneOfProp)[0]
    if (v[oname])
      return
    if (resource[p][oname])
      v[oname] = resource[p][oname]
    else
      missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
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
    if (this.props.model.properties[propName].items.ref) {
      item[TYPE] = this.props.model.properties[propName].items.ref
      if (item.file)  {
        if (item.file.name)
          item.name = item.file.name
        if (item[TYPE] !== PHOTO) {
          if (item.file.mimeType)
            item.mimeType = item.file.mimeType
          item.size = item.file.size
        }
        delete item.file
      }
    }
    let items = resource[propName];
    if (!items) {
      items = [];
      resource[propName] = items;
    }
    let itemsChangesCounter
    let { _editItem } = resource
    if (_editItem) {
      let idx = items.findIndex(item => _.isEqual(item, _editItem))
      if (idx !== -1) {
        itemsChangesCounter = this.state.itemsChangesCounter ? this.state.itemsChangesCounter  + 1 : 1
        _.extend(items[idx], item)
      }
      item = { ..._editItem, ...item }
      delete resource._editItem
    }
    else {
      items.push(item)
      itemsChangesCounter = this.state.itemsChangesCounter ? this.state.itemsChangesCounter  + 1 : 1
    }

    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[propName]

    if (item[TYPE]) {
      let iprops = utils.getModel(item[TYPE]).properties
      let prefix = `${propName}_`
      for (let p in item) {
        if (p.charAt(0) !== '_'  &&  iprops[p])
          delete resource[`${prefix}${p}`]
      }
    }

    this.setState({
      resource,
      itemsChangesCounter,
      prop: propName,
      inFocus: propName
    });
  }

  onNewPressed(bl) {
    let resource = this.addFormValues();
    this.setState({resource, err: '', inFocus: bl.name});
    let { bankStyle, currency, model, navigator } = this.props
    let blmodel = bl.items.ref ? utils.getModel(bl.items.ref) : model
    if (bl.items.ref  &&  !bl.inlined) { //  &&  bl.allowToAdd) {
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
  editItem(pMeta, item) {
    let resource = this.state.resource
    let prefix = `${pMeta.name}_`

    for (let p in item) {
      if (p.charAt(0) !== '_')
        resource[`${prefix}${p}`] = item[p]
    }
    resource._editItem = item
    this.onNewPressed(pMeta)
  }

  getSearchResult() {
    // let value = this.refs.form.getValue();
    // if (!value) {
    //   value = this.refs.form.refs.input.state.value;
    //   if (!value)
    //     value = {}
    // }
    let value = this.refs.form.refs.input.state.value;
    if (!value) {
      value = this.refs.form.getValue();
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
    let { message, isUploading, resource, disableEditing, isRegistration, validationErrors, doTable,
          termsAccepted, isLoadingVideo, err, missedRequiredOrErrorValue, fixedProps, recalculateMode } = this.state
    if (isUploading)
      return <View/>

    let bankStyle = this.props.bankStyle || defaultBankStyle
    let editProps = utils.getEditableProperties(resource)
    if (editProps.length) {
      let eProp = editProps[0]
      if (eProp.signature) {
        return  <View style={{flex: 1}}>
                   <SignatureView ref={ref => {this.sigView = ref}} bankStyle={bankStyle} prop={eProp} sigViewStyle={bankStyle} onSignature={() => {
                      // this.props.navigator.pop()
                      this.onSetSignatureProperty(eProp, this.sigView.getSignature())
                    }} />
                 </View>
      }
    }

    let meta =  this.props.model
    let { originatingMessage, setProperty, editCols, search, exploreData, isRefresh, bookmark, noChat, canSkip } = this.props

    let styles = createStyles({bankStyle, isRegistration})
    if (setProperty)
      resource[setProperty.name] = setProperty.value;
    let data = {};
    let model = {};
    let arrays = [];
    _.extend(data, resource);
    const { properties } = meta
    if (bookmark  &&  bookmark.bookmark) {
      for (let p in bookmark.bookmark) {
        if (!properties[p])
          continue
        let bPropVal = bookmark.bookmark[p]
        if (properties[p].ref  &&  utils.isEnum(properties[p].ref)  &&  !Array.isArray(bPropVal))
          data[p] = [bPropVal]
        else
          data[p] = bPropVal
        resource[p] = bPropVal
      }
    }
    let editable
    if (disableEditing)
      editable = false
    else
      editable = true
    let params = {
        meta,
        data,
        model,
        items: arrays,
        onEndEditing: this.onEndEditing,
        component: NewResource,
        editable
      };
    if (editCols)
      params.editCols = editCols;
    if (isRegistration)
      params.isRegistration = true
    if (originatingMessage  &&  originatingMessage[TYPE] === FORM_ERROR) {
      params.formErrors = {}
      originatingMessage.errors.forEach((r) => {
        let err = translate(r.error)
        if (r.oldValue) {
          err = `${translate('oldValueWas', r.oldValue)}\n${err}`
        }
        params.formErrors[r.name] = err
      })
    }
    else if (validationErrors)
      params.validationErrors = validationErrors

    let options = this.getFormFields(params);
    let contentSeparator = getContentSeparator(bankStyle)
    let submitTitle = this.getSubmitTitle(meta)
    if (!options) {
      let height = utils.dimensions(NewResource).height - 80

      return <PageView style={[platformStyles.container, {height}]} separator={contentSeparator} bankStyle={bankStyle}>
                <ShowPropertiesView resource={data}
                                    bankStyle={bankStyle}
                                    showRefResource={this.showRefResource.bind(this)}
                                    navigator={navigator} />
                <TouchableOpacity onPress={this.onSavePressed} style={{paddingBottom: 30}}>
                  <View style={styles.submitButton}>
                    <Icon name='ios-send' color='#fff' size={30} style={styles.sendIcon}/>
                    <Text style={styles.submitText}>{submitTitle}</Text>
                  </View>
                </TouchableOpacity>
             </PageView>
    }

    let Model = t.struct(model);
    let itemsMeta
    if (editCols) {
      itemsMeta = []
      editCols.forEach((p) => {
        if (properties[p].type === 'array')
          itemsMeta.push(properties[p])
      })
    }
    else
      itemsMeta = utils.getItemsMeta(meta);

    let me = utils.getMe()
    let arrayItems
    for (let p in itemsMeta) {
      let bl = itemsMeta[p]
      if (bl.internalUse &&  (!me.isEmployee || me.counterparty))
        continue
      // if (search && !bl.inlined || (bl.items.ref && !utils.getModel(bl.items.ref).inlined))
      //   continue
      if (!this.checkRequestedProperties(p))
        continue

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
    if (isRegistration)
      Form.stylesheet = rStyles
    else
      Form.stylesheet = stylesheet

    if (!options)
      options = {}
    options.auto = 'placeholders';
    options.tintColor = 'red'
    let button
    if (isRegistration)
      button = <View>
                 <TouchableOpacity style={styles.thumbButton}
                    onPress={termsAccepted ? this.onSavePressed : this.showTermsAndConditions}>
                    <View style={styles.getStarted}>
                       <Text style={styles.getStartedText}>ENTER</Text>
                    </View>
                 </TouchableOpacity>
               </View>
    let width = isRegistration ? utils.dimensions(NewResource).width : utils.getContentWidth(NewResource)
    let height = utils.dimensions(NewResource).height
    let formStyle = isRegistration
                  ? {justifyContent: 'center', flex: 1, height: height - (height > 1000 ? 0 : isRegistration ? 50 : 100)}
                  : {justifyContent: 'flex-start', width}
    // let jsonProps = utils.getPropertiesWithRange('json', meta)
    let jsons
    // if (jsonProps  &&  jsonProps.length) {
    //   let hidden = meta.hidden
    //   jsonProps.forEach((prop) => {
    //     if (prop.hidden  ||  (hidden  &&  hidden.includes(prop.name)))
    //       return
    //     let val = this.state.resource[prop.name]
    //     if (val) {
    //       let params = {prop: prop, json: val, jsonRows: [], isView: true}
    //       if (!jsons)
    //         jsons = []
    //       jsons.push(this.showJson(params))
    //     }
    //   })
    // }
    // HACK
    let guidanceMsg
    if (meta.id === 'tradle.PhotoID') {
      let src = 'https://tradle-public-images.s3.amazonaws.com/landscape.png'
      guidanceMsg = <View style={{paddingBottom: 10}}>
                      <View style={{padding: 20, marginHorizontal: -10, backgroundColor: bankStyle.GUIDANCE_MESSAGE_BG}}>
                        <Text style={styles.guidanceMsgTitle}>Uploading a picture of your document to your computer:</Text>
                        <Text style={{fontSize: 18}}>1.
                          <Text style={styles.guidanceMsgText}>Take a photo of your document using your smartphone, tablet, camera or scanner</Text>
                        </Text>
                        <Text style={{fontSize: 18, paddingLeft: 20}}>
                          Please use the landscape mode <Image source={{uri: src}} style={{width: 50, height: 25}} />
                        </Text>
                        <Text style={{fontSize: 18}}>2.
                          <Text style={styles.guidanceMsgText}>Transfer the image from your device to your computer: connect to the device with a USB cable, or email the image to yourself. Save the image to your computer (e.g. on the Desktop, Photos, Documents or Downloads folder).</Text>
                        </Text>
                        <Text style={{fontSize: 18}}>3.
                        <Text style={styles.guidanceMsgText}>Use the Upload option below to choose the image from your computer.</Text>
                        </Text>
                      </View>
                    </View>

    }
    if (!guidanceMsg  &&  meta.description) {
      // guidanceMsg = <View style={{paddingBottom: 10}}>
      //                 <View style={{padding: 20, marginHorizontal: -10, backgroundColor: bankStyle.GUIDANCE_MESSAGE_BG}}>
      //                   <Text style={{fontSize: 18}}>{translate(meta.description)}</Text>
      //                 </View>
      //               </View>
      guidanceMsg = <View style={{paddingBottom: 10}}>
                      <Markdown markdownStyles={getMarkdownStyles(bankStyle, false, false, true)} passThroughProps={{navigator, bankStyle}}>
                        {translate(meta.description)}
                      </Markdown>
                    </View>
    }

    // add server url sometimes takes a while
    let wait
    if (disableEditing)
      wait = <View style={styles.indicator}>
               <ActivityIndicator animating={true} size='large' color='#7AAAC3'/>
             </View>
    let photoView
    if (!utils.isWeb())
      photoView = <View style={styles.photoBG}>
                    <PhotoView resource={resource} navigator={this.props.navigator}/>
                  </View>
    let loadingVideo
    if (isLoadingVideo)
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
      if (err) {
        Alert.alert(err)
        this.state.err = null
      }
      let status = this.doRecalculate(validationErrors)

      if (recalculateMode ||  status === FAILED) {
        submit = <View style={{paddingBottom: 30}}>
                   <View style={[styles.submitButton, {backgroundColor: '#ccc'}]}>
                     <Icon name='ios-send' color='#fff' size={30} style={styles.sendIcon}/>
                     <Text style={styles.submitText}>{submitTitle}</Text>
                   </View>
                 </View>
      }
      else if (bankStyle  &&  bankStyle.submitBarInFooter)
        submit = <TouchableOpacity onPress={onPress}>
                   <View style={styles.submitBarInFooter}>
                     <View style={styles.bar}>
                       <Text style={styles.submitBarInFooterText}>{translate('next')}</Text>
                     </View>
                   </View>
                 </TouchableOpacity>
      else {
        submit = <TouchableOpacity onPress={this.alertNotFullSuccess.bind(this, onPress, status)} style={{paddingBottom: 30}}>
                   <View style={styles.submitButton}>
                     <Icon name='ios-send' color='#fff' size={30} style={styles.sendIcon}/>
                     <Text style={styles.submitText}>{submitTitle}</Text>
                   </View>
                 </TouchableOpacity>
      }

    }
    let contentStyle = {backgroundColor: 'transparent', width, alignSelf: 'center', paddingTop: 10}
    if (noChat)
      contentStyle.height = '100%'
    if (arrayItems) {
      arrayItems = <View style={styles.arrayItems}>
                     {arrayItems}
                   </View>
    }
    let form = <Form ref='form' type={Model} options={options} value={data} onChange={this.onChange}/>
    let table
    if (doTable) {
      let componentName = doTable // Object.keys(doTable)[0]
      let component = components[`${componentName.charAt(0).toUpperCase()}${componentName.slice(1)}`]
      if (component) {
        let { tableParams } = this.state
        table = React.createElement(component, {resource, tableParams, bankStyle, callback: (params) => {
          this.setState(params)
          if (params.resource)
            Actions.getRequestedProperties({resource: params.resource, originatingResource: originatingMessage, additionalInfo: params.additionalInfo})
        }})
      }
      // this.state.doTable = null
    }
    let skipButton
    if (canSkip) {
      skipButton = <TouchableOpacity onPress={canSkip}>
                     <View style={styles.submitButton}>
                       <View style={styles.bar}>
                         <Text style={styles.submitText}>{translate('next')}</Text>
                       </View>
                     </View>
                   </TouchableOpacity>

    }
    let content =
      <ScrollView style={contentStyle}
                  ref='scrollView' {...this.scrollviewProps}>
        <View style={formStyle}>
          {photoView}
          <View style={isRegistration ? {marginHorizontal: height > 1000 ? 50 : 30} : {marginHorizontal: 10}}>
            {guidanceMsg}
            {form}
            {formsToSign}
            {button}
            {table}
            {arrayItems}
            {jsons}
            {loadingVideo}
          </View>
        </View>
        <View style={[styles.submit, {width}]}>
          {submit}
          {skipButton}
        </View>
        {wait}
      </ScrollView>


    let errors
    if (!isRegistration) {
      if (missedRequiredOrErrorValue  &&  !utils.isEmpty(missedRequiredOrErrorValue)) {
        errors = <View style={styles.errors}>
                   <Text style={styles.errorsText}>{translate('fillRequiredFields')}</Text>
                 </View>
      }
      else if (message) {
        let idx = message.indexOf(' **')
        message = idx === -1 && message || message.slice(0, idx)

        errors = <View style={styles.errors}>
                   <Text style={styles.errorsText}>{translate(message)}</Text>
                 </View>
      }
      else if (validationErrors && _.size(validationErrors)) {
        let info
        if (validationErrors._info)
          info = <Text style={styles.warningText}>{validationErrors._info.message}</Text>
        if (_.size(validationErrors) === 1 && info)
          errors = <View style={styles.warnings}>
                     <Text style={styles.warningText}>{translate('validationInfo')}</Text>
                     {info}
                   </View>
        else
          errors = <View style={styles.errors}>
                     <Text style={styles.errorsText}>{translate('validationErrors')}</Text>
                     {info}
                   </View>
      }
      else
        errors = !noChat && <View style={[styles.errors, {backgroundColor: 'transparent'}]} />
    }
    const droppable = Object.keys(properties).find(key => {
      const prop = properties[key]
      const propMeta = prop.items || prop
      const isPhoto = propMeta.ref === PHOTO
      if (!isPhoto) return false
      if (!ENV.canUseWebcam) return true

      // if image processing is required
      // let them upload, because there is none in web
      return prop.component != null
    })
    if (droppable) {
      const prop = properties[droppable]
      // contentSeparator.width = utils.getContentWidth(NewResource)
      // return (
      return (
        <PageView style={[platformStyles.container, styles.message]} separator={contentSeparator}>
          <DropPage
            accept="image/*"
            multiple={prop.type === 'array'}
            style={platformStyles.container}
            onDrop={(accepted, rejected) => this.onDropFiles({ prop, rejected, files: accepted })}
          >
            {errors}
            {content}
          </DropPage>
        </PageView>
      )
    }
    if (!isRegistration) {
      contentSeparator.width = utils.getContentWidth(NewResource)
      let { enumProp } = this.state
      let actionSheet = this.renderActionSheet(resource[TYPE])
      if (noChat) {
        return <View style={[styles.message, {height: '100%', paddingBottom: 50}]}>
                 {errors}
                 {content}
                 {actionSheet}
                 <View onLayout={
                   enumProp  &&  this.ActionSheet && this.ActionSheet.show()
                 }/>
               </View>
      }

      return <PageView style={[platformStyles.container, styles.message]} separator={contentSeparator} bankStyle={bankStyle}>
               {errors}
               {content}
               {actionSheet}
               <View onLayout={
                 enumProp  &&  this.ActionSheet && this.ActionSheet.show()
               }/>
             </PageView>
    }

    let title = <View style={styles.logo}>
                  <CustomIcon name='tradle' size={40} color='#ffffff' style={{padding: 10}}/>
                </View>


    return (
      <View style={{height: noChat ? '100%' : height, width, backgroundColor: bankStyle.BACKGROUND_COLOR}}>
        <BackgroundImage source={BG_IMAGE} style={styles.bgImage} />
        <View style={{justifyContent: 'center', alignItems: 'center', height}}>
          {title}
          {content}
        </View>
      </View>
    )
  }
  alertNotFullSuccess(onPress, status) {
    if (status === SUCCESSFUL)
      onPress()
    else
      Alert.alert(
        translate('youCanSubmitButNotEverythingWorked'),
        [
          {text: 'Ok', onPress: () => {
            // HACK
            this.state.status = SUCCESSFUL
            onPress()
          }},
          {text: 'Cancel',  onPress: () => {}},
        ]
      )
  }
  // If this is a confirmation resource i.e. not props to enter only to review
  // then use OK instead of Submit
  getSubmitTitle(meta) {
    let hasNotReadOnly = false
    const { properties } = meta
    for (let p in properties) {
      if (p.charAt(0) !== '_' && !properties[p].readOnly) {
        hasNotReadOnly = true
        break
      }
    }
    return hasNotReadOnly ? translate('Submit') : translate('ok')
  }
  checkRequestedProperties(prop) {
    let { requestedProperties } = this.state
    if (!requestedProperties)
      return true
    let excludeProperties
    ({requestedProperties, excludeProperties} = requestedProperties)
    if (!requestedProperties  ||  requestedProperties[prop])
      return true
    if (excludeProperties  &&  excludeProperties.indexOf(prop) !== -1)
      return false
    let props = this.props.model.properties
    for (let p in requestedProperties) {
      if (p.endsWith('_group')  &&  props[p].list.includes(prop))
        return true
    }
    return false
  }
  onDropFiles({ prop, files, rejected }) {
    if (!files.length && rejected.length) {
      return Alert.alert(
        translate('unsupportedFormat'),
        translate('pleaseUploadImage')
      )
    }

    // 1. figure out which prop
    // 2. run utils.readImage
    let propName = prop.name
    let resource = this.state.resource
    utils.readImage(files[0], (err, img) => {
      // if (err) {
      //   if (/invalid format/.test(err.message)) {
      //     Alert.alert('')
      //   }
      // }

      resource[propName] = img

      // if (!this.floatingProps)
      //   this.floatingProps = {}
      // this.floatingProps[propName] = resource[propName]
      let r = {}
      _.extend(r, resource)
      this.setState({resource: r})
    })
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
    this.props.navigator.pop()
    this.setState({termsAccepted: true})
    if (this.state.resource.firstName)
      this.onSavePressed()
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
          itemsChangesCounter: list.length
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
    let { resource } = this.state
    if (utils.isHidden(bl.name, resource))
      return
    let meta = this.props.model
    let blmodel = meta
    let { lcolor, bcolor } = this.getLabelAndBorderColor(bl.name)

    let actionableItem
    let count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
    let label = translate(bl, blmodel)
    if (!this.props.search  &&  meta.required  &&  meta.required.indexOf(bl.name) !== -1)
      label += ' *'
    let width = utils.getContentWidth(NewResource) - 40
    if (count) {
      let cstyle = styles.activePropTitle
      actionableItem = <View style={{width, alignSelf: 'center'}}>
                         <TouchableOpacity onPress={this.onNewPressed.bind(this, bl, meta)}>
                           <View style={styles.iitems}>
                             <Text style={[cstyle, {marginTop: 3}]}>{label}</Text>
                             <View style={[styles.addButton, {marginTop: 3}]}>
                               <Icon name={bl.icon || 'md-add'} size={bl.icon ? 25 : 20}  color='#ffffff'/>
                             </View>
                           </View>
                         </TouchableOpacity>
                         {this.renderItems({value: resource[bl.name], prop: bl, cancelItem: this.cancelItem, editItem: bl.items.ref &&  this.editItem})}
                       </View>
    }
    else {
      actionableItem = <View style={{width: width + 10}}>
                       <TouchableOpacity onPress={this.onNewPressed.bind(this, bl, meta)}>
                         <View style={[styles.iitems, {paddingBottom: 10}]}>
                           <Text style={styles.noItemsText}>{label}</Text>
                           <View style={styles.addButton}>
                              <Icon name={bl.icon || 'md-add'}   size={bl.icon ? 25 : 20} color='#ffffff' />
                           </View>
                         </View>
                       </TouchableOpacity>
                       </View>
    }
    let err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[bl.name]
            : null

    let istyle = [styles.itemButton]
    if (err)
      istyle.push({marginBottom: 10})
    else if (!count)
      istyle.push({paddingBottom: 0, minHeight: 70})
    else {
      let height = 55
      istyle.push({paddingBottom: 0, minHeight: count * height + 35})
    }
    istyle = StyleSheet.flatten(istyle)
    return (
      <View key={this.getNextKey()} style={{paddingBottom: 10}}>
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
    let { lcolor, bcolor } = this.getLabelAndBorderColor(bl.name)
    let count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0

    let bankStyle = this.props.bankStyle || defaultBankStyle
    let isPhoto = bl.items.ref === PHOTO

    let linkColor = bankStyle.linkColor
    let label = translate(bl, blmodel)
    if (!this.props.search  &&  meta.required  &&  meta.required.indexOf(bl.name) !== -1)
      label += ' *'
    if (count) {
      let items = []
      let arr = resource[bl.name]
      let n = Math.min(arr.length, utils.isWeb() ? utils.dimensions().width - 100 / 40 :  7)

      for (let i=0; i<n; i++)
        items.push(<Image resizeMode='cover' style={styles.thumb} source={{uri: arr[i].url}}  key={this.getNextKey()}/>)

      itemsArray =
        <View style={[styles.photoStrip, {paddingBottom: 5}]}>
          <Text style={[styles.activePropTitle, {color: lcolor}]}>{label}</Text>
          <View style={styles.row}>{items}</View>
        </View>
    }
    else {
      itemsArray = <View><Text style={styles.noItemsText}>{label}</Text></View>
    }
    counter = <Icon name='ios-camera-outline'  size={25} color={linkColor} style={styles.camera} />
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
                         allowPicturesFromLibrary={bl.allowPicturesFromLibrary}
                         underlayColor='transparent'
                         style={{paddingBottom: 5}}
                         nonImageAllowed={bl.range === 'document'}
                         onImage={item => this.onAddItem(bl.name, item)}>
                         {itemsArray}
                       </ImageInput>

    let istyle = [count ? styles.photoButton : styles.itemButton]

    return (
      <View key={this.getNextKey()}>
        <View style={istyle} ref={bl.name}>
          <View style={styles.items}>
            {actionableItem}
            <ImageInput
                prop={bl}
                underlayColor='transparent'
                style={styles.actionIcon}
                nonImageAllowed={bl.range === 'document'}
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

  onEndEditing(prop, value) {
    // if (this.state.resource[prop]  ||  text.length)
    //   this.state.resource[prop] = text;
    const { fixedProps, resource } = this.state
    const { originatingMessage: originatingResource, search, model } = this.props
    const { name, type, readOnly } = prop
    let isGoalProp = readOnly && model.goalSeek && model.goalSeek.indexOf(name) !== -1
    if (isGoalProp)
      this.setState({recalculateMode: true})

    else if (!search  &&  resource[TYPE] !== SETTINGS) {
      // if 'string' no need to check if requested properties changed on entering every letter
      if (type !== 'string' || value.length <= 1)
        Actions.getRequestedProperties({resource, originatingResource, fixedProps})
    }
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
  const formField =  {
    borderColor: '#dddddd',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  }
  return StyleSheet.create({
    container: {
      flex: 1
    },
    noItemsText: {
      fontSize: 20,
      color: '#777777',
      // alignSelf: 'center',
      paddingLeft: 10
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
      // justifyContent: 'center',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      paddingBottom: 2
      // paddingRight: 5
    },
    itemButton: {
      ...formField,
      minHeight: 60,
      justifyContent: 'flex-end',
    },
    photoButton: {
      ...formField,
      // marginTop: 10
    },

    photoBG: {
      alignItems: 'center',
      paddingBottom: 10,
    },
    err: {
      flexWrap: 'wrap',
      paddingHorizontal: 25,
      fontSize: 16,
      color: 'darkred',
    },
    getStartedText: {
      color: '#eeeeee',
      fontSize: 20,
      fontWeight:'300',
      alignSelf: 'center'
    },
    getStarted: {
      backgroundColor: '#467EAE',
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
    items: {},
    iitems: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    activePropTitle: {
      fontSize: 12,
      paddingBottom: 5,
      color: '#bbbbbb'
    },
    photoStrip: {
      paddingBottom: 5,
      marginHorizontal: 10,
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
    bar: {
      backgroundColor: 'transparent',
      paddingHorizontal: 10,
      justifyContent: 'center'
    },
    pics: {
      paddingTop: 5,
      // width: '90%'
    },
    camera: {
      position: 'absolute',
      right: 10,
      bottom: 10
    },
    submit: {
      // width: 340,
      alignSelf: 'center',
      justifyContent: 'space-around',
      flexDirection: 'row'
    },
    submitButton: {
      backgroundColor: bankStyle.buttonBgColor || bankStyle.linkColor,
      flexDirection: 'row',
      justifyContent: 'center',
      width: 340,
      marginTop: 20,
      alignSelf: 'center',
      height: 40,
      borderRadius: 5,
    },
    submitText: {
      fontSize: 20,
      paddingLeft: 7,
      color: bankStyle.buttonColor || '#ffffff',
      alignSelf: 'center'
    },
    errors: {
      height: 55,
      justifyContent: 'center',
      backgroundColor: bankStyle.errorBgColor || '#990000',
      width: utils.getContentWidth(NewResource),
      alignItems: 'center',
      paddingHorizontal: 7
    },
    errorsText: {
      color: bankStyle.errorColor ||  '#eeeeee',
      alignSelf: 'center',
      fontSize: 16
    },
    warnings: {
      height: 55,
      justifyContent: 'center',
      backgroundColor: 'lightyellow',
      width: utils.getContentWidth(NewResource),
      alignItems: 'center',
      paddingHorizontal: 7
    },
    warningText: {
      color: bankStyle.linkColor,
      paddingVertical: 3,
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
      paddingBottom: 20
    },
    addButton: {
      ...circled(25),
      backgroundColor: bankStyle.linkColor,
      shadowColor: '#afafaf',
    },
    message: {
      alignItems: 'center',
      // alignSelf: 'center',
      backgroundColor: '#f3f3f3',
      // backgroundColor: 'transparent'
    },
    guidanceMsgTitle: {
      fontSize: 22,
      paddingBottom: 10,
      fontFamily: bankStyle.headerFont
    },
    guidanceMsgText: {
      fontSize: 18,
      paddingBottom: 10,
      fontFamily: bankStyle.headerFont
    }
  })
})
module.exports = NewResource;
