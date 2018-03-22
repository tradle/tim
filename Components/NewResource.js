console.log('requiring NewResource.js')
'use strict'

import utils, { translate } from '../utils/utils'
import NewItem from './NewItem'
import ResourceList from './ResourceList'
import GridList from './GridList'
import GridItemsList from './GridItemsList'
import PhotoView from './PhotoView'
import ResourceView from './ResourceView'
import MessageView from './MessageView'
import ResourceMixin from './ResourceMixin'
import ShowPropertiesView from './ShowPropertiesView'
import PageView from './PageView'
import t from 'tcomb-form-native'
import extend from 'extend'
import Actions from '../Actions/Actions'
import Store from '../Store/Store'
import Reflux from 'reflux'
import reactMixin from 'react-mixin'
import Icon from 'react-native-vector-icons/Ionicons'
import rStyles from '../styles/registrationStyles'
import NewResourceMixin from './NewResourceMixin'
import equal from 'deep-equal'
import constants from '@tradle/constants'
import termsAndConditions from '../termsAndConditions.json'
import StyleSheet from '../StyleSheet'
import ImageInput from './ImageInput'
import chatStyles from '../styles/chatStyles'
import CustomIcon from '../styles/customicons'
import stylesheet from '../styles/styles'
import Native, {
  // StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Platform,
  // StatusBar,
  Alert,
  TouchableOpacity,
  Animated
} from 'react-native'
import PropTypes from 'prop-types';

var Keyboard
if (Platform.OS !== 'web') {
  Keyboard = require('Keyboard')
}

import React, { Component } from 'react'
import ActivityIndicator from './ActivityIndicator'
import platformStyles from '../styles/platform'
import { makeResponsive } from 'react-native-orient'
import BackgroundImage from './BackgroundImage'
import ENV from '../utils/env'
import DropPage from './DropPage'

const debug = require('debug')('NewResource')
const BG_IMAGE = ENV.brandBackground
const ENUM = 'tradle.Enum'
const FORM_ERROR = 'tradle.FormError'
const PHOTO = 'tradle.Photo'
const SETTINGS = 'tradle.Settings'
const HAND_SIGNATURE = 'tradle.HandSignature'
const DEFAULT_LINK_COLOR = '#a94442'
var Form = t.form.Form;

class NewResource extends Component {
  static displayName = 'NewResource';
  props: {
    navigator: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
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
      r[constants.TYPE] = props.model.id
    let isRegistration = !utils.getMe()  && this.props.model.id === constants.TYPES.PROFILE  &&  (!this.props.resource || !this.props.resource[constants.ROOT_HASH]);

    this.state = {
      resource: r,
      isUploading: !isRegistration  &&  (!r[constants.ROOT_HASH] || Object.keys(r).length === 2),
      isRegistration: isRegistration,
      isLoadingVideo: false,
      isPrefilled: this.props.isPrefilled,
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

    let currentRoutes = this.props.navigator.getCurrentRoutes()
    let currentRoutesLength = currentRoutes.length
    currentRoutes[currentRoutesLength - 1].onRightButtonPress = this.props.search
            ? this.getSearchResult.bind(this)
            : this.onSavePressed

    this.scrollviewProps = {
      automaticallyAdjustContentInsets:true,
      scrollEventThrottle: 50,
      onScroll: this.onScroll.bind(this)
    };
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
           // this.state.termsAccepted !== nextState.termsAccepted    ||
          !equal(this.state.resource, nextState.resource)

    if (!isUpdate)
      isUpdate = !utils.compare(this.props.resource, nextProps.resource)
    return isUpdate
           // nextState.isModalOpen !== this.state.isModalOpen  ||
           // this.state.modalVisible != nextState.modalVisible ||
  }
  componentWillMount() {
    let { resource } = this.state
    // Profile gets changed every time there is a new photo added through for ex. Selfie
    if (utils.getId(utils.getMe()) === utils.getId(resource))
      Actions.getItem({resource: resource})
    if (resource[constants.ROOT_HASH]) {
      if (Object.keys(resource).length === 2)
        Actions.getItem({resource: resource})
    }
    else {
     if (resource.id) {
        let type = utils.getType(resource.id)
        if (!utils.getModel(type).inlined)
          Actions.getItem({resource: resource})
      }
      else if (this.state.isUploading)
        Actions.getTemporary(resource[constants.TYPE])
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
    if (!this.state.missedRequiredOrErrorValue  ||  utils.isEmpty(this.state.missedRequiredOrErrorValue)) return

    let viewCols = this.props.model.viewCols
    let first
    for (let p in this.state.missedRequiredOrErrorValue) {
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

    if (!utils.isEmpty(this.state.missedRequiredOrErrorValue)  &&  !this.state.noScroll) {
      utils.scrollComponentIntoView(this, ref)
      this.state.noScroll = true
    }
  }

  onAction(params) {
    let { resource, action, error, requestedProperties, message } = params
    if (action === 'languageChange') {
      this.props.navigator.popToTop()
      return
    }
    if (action === 'noChanges') {
      this.setState({err: translate('nothingChanged'), submitted: false})
      return
    }
    if (action === 'getItem'  &&  utils.getId(this.state.resource) === utils.getId(resource)) {
      this.setState({
        resource: resource,
        isUploading: false
      })
      return
    }
    if (action === 'formEdit') {
      this.setState({requestedProperties: requestedProperties, resource: resource ||  this.state.resource, message: message })
      return
    }
    if (action === 'noAccessToServer') {
      this.setState({submitted: true, disableEditing: false})
      this.props.navigator.pop()
      return
    }
    if (action === 'getTemporary') {
      let r = {}
      extend(r, this.state.resource)
      extend(r, resource)

      this.setState({
        resource: r,
        isUploading: false,
        requestedProperties: requestedProperties
      })
      return
    }

    if (action === 'runVideo'  && this.state.isRegistration) {
      if (this.props.callback)
        this.setState({isLoadingVideo: true})
      return;
    }
    if (!resource  &&  error &&  action === 'addItem') {
      this.state.submitted = false
      console.log('addItem: submitted = false')
      Alert.alert(
        error,
      )
      let actionParams = {
        query: this.state.filter,
        modelName: this.props.modelName,
        to: this.props.resource,
      }
      return
    }
    if (!resource  ||  (action !== 'addItem'  &&  action !== 'addMessage')) {
      return;
    }
    if (this.state.resource[constants.TYPE] !== resource[constants.TYPE])
      return
    if (error) {
      if (resource[constants.TYPE] == this.state.resource[constants.TYPE])
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
    if (this.props.callback) {
      utils.onNextTransitionEnd(this.props.navigator, () => this.state.submitted = false)
      this.props.callback(resource);
      return;
    }

    let self = this;
    let title = utils.getDisplayName(resource);
    let isMessage = utils.isMessage(resource)
    // When message created the return page is the chat window,
    // When profile or some contact info changed/added the return page is Profile view page
    if (isMessage) {
      if (this.props.originatingMessage  &&  resource[constants.ROOT_HASH] !== this.props.originatingMessage[constants.ROOT_HASH]) {
        let params = {
          value: {_documentCreated: true, _document: utils.getId(resource)},
          resource: this.props.originatingMessage,
          meta: utils.getModel(this.props.originatingMessage[constants.TYPE])
        }
        Actions.addChatItem(params)
        this.props.navigator.pop();
        return;
      }
    }
    let currentRoutes = self.props.navigator.getCurrentRoutes();
    let currentRoutesLength = currentRoutes.length;
    let navigateTo = (currentRoutesLength == 2)
             ? this.props.navigator.replace
             : this.props.navigator.replacePrevious
    // Editing form originated from chat
    if (this.props.chat) {
      let routes = this.props.navigator.getCurrentRoutes()
      this.props.navigator.popToRoute(routes[routes.length - 3])
      return
    }
    navigateTo({
      id: 3,
      title: title,
      component: ResourceView,
      titleTextColor: '#7AAAC3',
      rightButtonTitle: translate('edit'),
      backButtonTitle: 'Back',
      onRightButtonPress: {
        title: title,
        id: 4,
        component: NewResource,
        rightButtonTitle: 'Done',
        backButtonTitle: 'Back',
        titleTextColor: '#7AAAC3',
        passProps: {
          model: self.props.model,
          resource: resource,
          currency: this.props.currency,
          bankStyle: this.props.bankStyle
        }
      },
      passProps: {
        resource: resource,
        currency: this.props.currency,
        bankStyle: this.props.bankStyle
      }
    });
    if (currentRoutesLength != 2)
      this.props.navigator.pop();
//     console.log('onAction: submitted = false')
//     this.state.submitted = false
  }
  // Show providers this resource was shared with and allow customer to choose
  // which providers to share the changes with
  showSharedWithList(newResource) {
    if (!this.props.resource  ||  !this.props.resource._sharedWith)
      return
    this.props.navigator.replace({
      id: 10,
      title: translate('shareChangesWith'),
      backButtonTitle: 'Back',
      component: ResourceList,
      rightButtonTitle: 'Done',
      passProps: {
        message: translate('chooseCompaniesToShareChangesWith'),
        modelName: constants.TYPES.ORGANIZATION,
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
    let resource = this.state.resource;

    let value = this.refs.form  &&  this.refs.form.getValue() ||  resource
    if (!value) {
      value = this.refs.form.refs.input.state.value;
      if (!value)
        value = {}
    }

    // value is a tcomb Struct
    let json = utils.clone(value);
    let isNew = !resource[constants.ROOT_HASH]
    this.checkEnums(json, resource)
    if (this.floatingProps) {
      for (let p in this.floatingProps) {
        if (isNew  ||  resource[p] !== this.floatingProps[p])
          json[p] = this.floatingProps[p]
      }
    }
    let model = this.props.model
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
    required.forEach((p) =>  {
      let v = (typeof json[p] !== 'undefined') || json[p] ? json[p] : (this.props.resource ? this.props.resource[p] : null); //resource[p];
      if (v) {
        if (typeof v === 'string'  &&  !v.length) {
          v = null
          delete json[p]
        }
        else if (typeof v === 'object')  {
          let ref = props[p].ref
          if (ref) {
            let rModel = utils.getModel(ref)
            if (ref === constants.TYPES.MONEY) {
              if (!v.value || (typeof v.value === 'string'  &&  !v.value.length)) {
                missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
                return
              }
              if (!v.currency) {
                if (resource[p].currency)
                  v.currency = resource[p].currency
                else {
                  missedRequiredOrErrorValue[p] = translate('thisFieldIsRequired')
                  return
                }
              }
            }
            else if (ref === 'tradle.Photo')
              return
            else if (!rModel.subClassOf  ||  rModel.subClassOf !== ENUM) {
              let units = props[p].units
              if (units)
                v = v.value
              else {
                if (v.value === '')
                  v = null
                delete json[p]
              }
              return
            }
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

    let err = this.validateProperties(json)
    for (let p in err)
      missedRequiredOrErrorValue[p] = err[p]

    // if ('scanJson' in missedRequiredOrErrorValue) {
    //   if (utils.isAndroid() || utils.isWeb()) {
    //     delete missedRequiredOrErrorValue.scanJson
    //     json.scanJson = { ocrNotSupported: true }
    //   }
    // }

    if (!utils.isEmpty(missedRequiredOrErrorValue)) {
      console.log('onSavePressed not all required: submitted = false')

      this.state.submitted = false
      let state = {
        missedRequiredOrErrorValue: missedRequiredOrErrorValue
      }
      this.setState(state)
      return;
    }
    if (!value)
      debugger

    // HACK: adding new server url action should disable keyboard on submission
    if (resource[constants.TYPE] === SETTINGS)
      this.setState({submitted: false, disableEditing: true})
    let r = {}
    extend(true, r, resource)
    json._context = r._context ||  (this.props.originatingMessage  &&  this.props.originatingMessage._context)

    delete r.url
    let lensId = this.props.lensId
    let params = {
      value: json,
      resource: r,
      meta: model,
      lens: lensId,
      isRegistration: this.state.isRegistration
    };
    if (this.props.chat)
      params.chat = this.props.chat
    if (!lensId  &&  this.floatingProps  &&  this.floatingProps._lens)
      params.lens = this.floatingProps._lens

    params.doNotSend = this.props.doNotSend
    // HACK
    if (!resource.from  ||  !resource.to)
      Actions.addItem(params)
    else
      Actions.addChatItem(params)
  }
  // HACK: the value for property of the type that is subClassOf Enum is set on resource
  // and it is different from what tcomb sets in the text field
  checkEnums(json, resource) {
    let props = this.props.model.properties
    for (let p in json) {
      if (!props[p]  ||  !props[p].ref)
        continue
      let m = utils.getModel(props[p].ref)
      if (m.subClassOf  &&  m.subClassOf === ENUM)
        json[p] = resource[p]
    }
  }
  addFormValues() {
    let value = this.refs.form.getValue();
    let json = value ? value : this.refs.form.refs.input.state.value;
    let resource = this.state.resource;
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = this.props.model.id;
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
      item[constants.TYPE] = this.props.model.properties[propName].items.ref
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
    // if (bl.name === 'photos') {
    //   this.showChoice(bl);
    //   return;
    // }
    let blmodel = bl.items.ref ? utils.getModel(bl.items.ref) : this.props.model
    if (bl.items.ref  &&  bl.allowToAdd) {
      this.props.navigator.push({
        id: 30,
        title: translate(bl, blmodel), // Add new ' + bl.title,
        backButtonTitle: 'Back',
        component: GridList,
        passProps: {
          modelName: bl.items.ref,
          to: this.state.resource.to,
          resource: this.state.resource,
          isChooser: true,
          prop: bl,
          callback: this.setChosenValue,
          bankStyle: this.props.bankStyle,
          currency: this.props.currency
        }
      });
      return
    }
    this.props.navigator.push({
      id: 6,
      title: translate('addNew', translate(bl, blmodel)), // Add new ' + bl.title,
      backButtonTitle: 'Back',
      component: NewItem,
      rightButtonTitle: translate('done'),
      passProps: {
        metadata: bl,
        resource: this.state.resource,
        parentMeta: this.props.model,
        onAddItem: this.onAddItem,
        currency: this.props.currency
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
    let currentRoutes = this.props.navigator.getCurrentRoutes()
    let currentRoutesLength = currentRoutes.length

    // HACK: set filtering resource for right button on RL so that next
    // time filter shows in the form
    currentRoutes[currentRoutesLength - 2].onRightButtonPress.passProps.resource = value
    this.props.navigator.pop()
    this.props.searchWithFilter(value)
  }

  render() {
    if (this.state.isUploading)
      return <View/>

    let parentBG = {backgroundColor: '#7AAAC3'};
    let resource = this.state.resource;

    let meta =  this.props.model;
    let { originatingMessage, setProperty, editCols, bankStyle, search } = this.props
    let styles = createStyles({bankStyle, isRegistration})
    if (setProperty)
      this.state.resource[setProperty.name] = setProperty.value;
    let data = {};
    let model = {};
    let arrays = [];
    extend(true, data, resource);
    let isMessage = utils.isMessage(resource)
    let isFinancialProduct = isMessage  &&  meta.subClassOf && meta.subClassOf === constants.TYPES.FINANCIAL_PRODUCT
    let showSendVerificationForm = false;
    let formToDisplay;
    if (isMessage) {
      let len = resource.message  &&  utils.splitMessage(resource.message).length;
      if (len < 2)
        showSendVerificationForm = true;
    }
    let params = {
        meta: meta,
        data: data,
        model: model,
        items: arrays,
        onEndEditing: this.onEndEditing,
        component: NewResource,
        editable: this.state.disableEditing ? !this.state.disableEditing : true
      };
    if (editCols)
      params.editCols = editCols;
    let isRegistration = this.state.isRegistration
    if (isRegistration)
      params.isRegistration = true
    if (originatingMessage  &&  originatingMessage[constants.TYPE] === FORM_ERROR) {
      params.formErrors = {}
      originatingMessage.errors.forEach((r) => {
        params.formErrors[r.name] = r.error
      })
    }

    let options = this.getFormFields(params);
    if (!options) {
      let contentSeparator = utils.getContentSeparator(bankStyle)
      return <PageView style={platformStyles.container} separator={contentSeparator}>
                <ShowPropertiesView resource={data}
                                    bankStyle={bankStyle}
                                    navigator={navigator} />
                <TouchableOpacity onPress={this.onSavePressed}>
                  <View style={styles.submit}>
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

    let self = this;
    let arrayItems = [];
    let itemsArray
    if (!search) {
      for (let p in itemsMeta) {
        let bl = itemsMeta[p]
        if (bl.icon === 'ios-telephone-outline') {
          bl.icon = 'ios-call-outline'
        }

        if (bl.readOnly  ||  bl.items.backlink) {
          arrayItems.push(<View key={this.getNextKey()} ref={bl.name} />)
          continue
        }
        let blmodel = meta
        itemsArray = null
        let count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
        if (count  &&  (bl.name === 'photos' || bl.items.ref === PHOTO))
          arrayItems.push(this.getPhotoItem(bl, styles))
        else
          arrayItems.push(this.getItem(bl, styles))
      }
    }
    if (isRegistration)
      Form.stylesheet = rStyles
    else
      Form.stylesheet = stylesheet

    let style = {backgroundColor: 'transparent'}
    if (!options)
      options = {}
    options.auto = 'placeholders';
    options.tintColor = 'red'
    let photoStyle = /*isMessage && !isFinancialProduct ? {marginTop: -35} :*/ styles.photoBG;
    let button = isRegistration
               ? <View>
                   <TouchableOpacity style={styles.thumbButton}
                      onPress={this.state.termsAccepted ? this.onSavePressed : this.showTermsAndConditions}>
                      <View style={styles.getStarted}>
                         <Text style={styles.getStartedText}>ENTER</Text>
                      </View>
                   </TouchableOpacity>
                 </View>
               : <View style={styles.noRegistrationButton} />
    let width = isRegistration ? utils.dimensions(NewResource).width : utils.getContentWidth(NewResource)
    let height = utils.dimensions(NewResource).height
    let formStyle = isRegistration
                  ? {justifyContent: 'center', flex: 1, height: height - (height > 1000 ? 0 : isRegistration ? 50 : 100)}
                  : {justifyContent: 'flex-start', width: width}
    let jsonProps = utils.getPropertiesWithRange('json', meta)
    let jsons = []
    if (jsonProps  &&  jsonProps.length) {
      let hidden = meta.properties.hidden
      jsonProps.forEach((prop) => {
        if (hidden  &&  hidden.indexOf(prop.name) !== -1)
          return
        let val = this.state.resource[prop.name]
        if (val) {
          let params = {prop: prop, json: val, jsonRows: [], isView: true}
          jsons.push(this.showJson(params))
        }
      })
    }
    if (!jsons.length)
      jsons = <View/>

    // HACK
    let guidanceMsg
    if (meta.id === 'tradle.PhotoID') {
      guidanceMsg = <View style={{paddingBottom: 10}}>
                      <View style={{padding: 20, marginHorizontal: -10, backgroundColor: bankStyle.GUIDANCE_MESSAGE_BG}}>
                        <Text style={{fontSize: 18, paddingBottom: 10}}>Uploading a picture of your document to your computer:</Text>
                        <Text style={{fontSize: 18}}>1.
                          <Text style={{fontSize: 18, paddingLeft: 10}}>Take a photo of your document using your smartphone, tablet, camera or scanner.</Text>
                        </Text>
                        <Text style={{fontSize: 18}}>2.
                          <Text style={{fontSize: 18, paddingLeft: 10}}>Transfer the image from your device to your computer: connect to the device with a USB cable, or email the image to yourself. Save the image to your computer (e.g. on the Desktop, Photos, Documents or Downloads folder).</Text>
                        </Text>
                        <Text style={{fontSize: 18}}>3.
                        <Text style={{fontSize: 18, paddingLeft: 10}}>Use the Upload option below to choose the image from your computer.</Text>
                        </Text>
                      </View>
                    </View>

    }
    // add server url sometimes takes a while
    let wait
    if (this.state.disableEditing)
      wait = <View style={styles.indicator}>
               <ActivityIndicator animating={true} size='large' color='#7AAAC3'/>
             </View>
    let photoView
    if (!utils.isWeb())
      photoView = <View style={photoStyle}>
                    <PhotoView resource={resource} navigator={this.props.navigator}/>
                  </View>
    let loadingVideo
    if (this.state.isLoadingVideo)
      loadingVideo = <View style={styles.indicator}>
                       <ActivityIndicator animating={true} size='large' color='#ffffff'/>
                    </View>

    let formsToSign
    if (resource[constants.TYPE] === HAND_SIGNATURE) {
      let formList = resource.signatureFor.map((r) => (
          <TouchableOpacity onPress={() => this.showResource(r)} style={styles.formListItem} key={this.getNextKey()}>
          <View>
            <Text style={styles.forms}>{utils.makeModelTitle(r.id.split('_')[0])}</Text>
          </View>
          </TouchableOpacity>))

      formsToSign = <View>
                      <Text style={styles.formsToSign}>Forms you are signing</Text>
                      {formList}
                    </View>
    }

    // let submit
    // if (!isRegistration)
    //   submit = <View style={styles.submitButton}>
    //              <TouchableOpacity onPress={this.onSavePressed.bind(this)}>
    //                 <View style={[chatStyles.shareButton, {width: 100, backgroundColor: '#fdfdfd', paddingHorizontal: 10, justifyContent: 'center'}]}>
    //                   <Text style={chatStyles.shareText}>{translate('Submit')}</Text>
    //                   <Icon name='ios-send' size={25} style={{color: '#7AAAC3', paddingLeft: 5, transform: [{rotate: '45deg'}] }} />
    //                 </View>
    //               </TouchableOpacity>
    //             </View>
    // StatusBar.setHidden(true);
    let submit
    if (!isRegistration) {
      if (this.state.err) {
        Alert.alert(this.state.err)
        this.state.err = null
      }
      if (!isRegistration  &&  bankStyle  &&  bankStyle.submitBarInFooter)
        submit = <TouchableOpacity onPress={this.onSavePressed}>
                   <View style={styles.submitBarInFooter}>
                     <View style={styles.bar}>
                       <Text style={styles.submitBarInFooterText}>{translate('next')}</Text>
                     </View>
                   </View>
                 </TouchableOpacity>
      else
        submit  = <TouchableOpacity onPress={this.onSavePressed}>
                    <View style={styles.submit}>
                      <Icon name='ios-send' color='#fff' size={30} style={styles.sendIcon}/>
                      <Text style={styles.submitText}>{translate('Submit')}</Text>
                    </View>
                  </TouchableOpacity>

    }
    let contentStyle = {backgroundColor: 'transparent', width: width, alignSelf: 'center', paddingTop:10}
    let content =
      <ScrollView style={contentStyle}
                  ref='scrollView' {...this.scrollviewProps}>
        <View style={formStyle}>
          {photoView}
          <View style={this.state.isRegistration ? {marginHorizontal: height > 1000 ? 50 : 30} : {marginHorizontal: 10}}>
            {guidanceMsg}
            <Form ref='form' type={Model} options={options} value={data} onChange={this.onChange}/>
            {formsToSign}
            {button}
            <View style={styles.arrayItems}>
              {arrayItems}
            </View>
            {jsons}
            {loadingVideo}
          </View>
        </View>
        {wait}
        {submit}
      </ScrollView>


    const { properties } = meta
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
      let contentSeparator = utils.getContentSeparator(bankStyle)
      // return (
      return (
        <PageView style={[platformStyles.container, {alignItems: 'center', backgroundColor: 'transparent'}]} separator={contentSeparator}>
          <DropPage
            accept="image/*"
            multiple={prop.type === 'array'}
            style={platformStyles.container}
            onDrop={(accepted, rejected) => this.onDropFiles({ prop, rejected, files: accepted })}
          >
            {content}
          </DropPage>
        </PageView>
      )
    }
    if (!isRegistration) {
      let errors
      if (this.state.missedRequiredOrErrorValue  &&  !utils.isEmpty(this.state.missedRequiredOrErrorValue)) {
        errors = <View style={styles.errors}>
                   <Text style={styles.errorsText}>{translate('fillRequiredFields')}</Text>
                 </View>
        // errors = <View style={{height: 35, justifyContent: 'center', alignItems: 'flex-end'}}>
        //            <Text style={{color: '#990000', fontSize: 14, paddingRight: 10}}>{'Please fill out all required properties'}</Text>
        //          </View>

      }
      else if (this.state.message) {
        errors = <View style={styles.errors}>
                   <Text style={styles.errorsText}>{translate(this.state.message)}</Text>
                 </View>
      }
      let contentSeparator = utils.getContentSeparator(bankStyle)
      return <PageView style={[platformStyles.container, {alignItems: 'center', backgroundColor: 'transparent'}]} separator={contentSeparator}>
               {content}
              </PageView>
    }
    let title
    if (!isRegistration  &&  !bankStyle.logoNeedsText)
      title = <View style={styles.logoNeedsText}>
                {translate(meta)}
              </View>

    if (isRegistration)
      title = <View style={styles.logo}>
                <CustomIcon name='tradle' size={40} color='#ffffff' style={{padding: 10}}/>
              </View>


    return (
      <View style={{height: height, width: width, backgroundColor: bankStyle.BACKGROUND_COLOR}}>
        <BackgroundImage source={BG_IMAGE} style={styles.bgImage} />
        <View style={{justifyContent: 'center', alignItems: 'center', height: height}}>
          {title}
          {content}
        </View>
      </View>
    )
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
      var r = {}
      extend(r, resource)
      this.setState({resource: r})
    })
  }
  showResource(r) {
    this.props.navigator.push({
      title: r.title,
      id: 5,
      backButtonTitle: 'Back',
      component: MessageView,
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
      id: 3,
      component: ResourceView,
      title: translate('termsAndConditions'),
      backButtonTitle: translate('back'),
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
    let list = this.state.resource[pMeta.name];
    for (let i=0; i<list.length; i++) {
      if (equal(list[i], item)) {
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
      resource[constants.TYPE] = model.id;
    }

    let currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate('tapToRemovePhotos'), //Tap to remove photos',
      titleTintColor: 'red',
      id: 19,
      component: GridItemsList,
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
    let isPhoto = bl.name === 'photos' || bl.items.ref === PHOTO
    let { bankStyle } = this.props
    let linkColor = bankStyle && bankStyle.linkColor || DEFAULT_LINK_COLOR

    let counter, itemsArray
    let count = resource  &&  resource[bl.name] ? resource[bl.name].length : 0
    if (count) {
      let val = <View>{this.renderItems(resource[bl.name], bl, this.cancelItem)}</View>

      let separator = <View style={styles.separator}></View>
      let cstyle = count ? styles.activePropTitle : styles.noItemsText
      itemsArray = <View>
                     <Text style={[cstyle, {color: lcolor}]}>{translate(bl, blmodel)}</Text>
                     {val}
                   </View>

      counter = <View style={[styles.itemsCounterEmpty, {paddingBottom: 10, marginTop: 15}]}>
                  <Icon name={bl.icon || 'md-add'} size={bl.icon ? 25 : 20}  color={linkColor} />
                </View>
    }
    else {
      itemsArray = <Text style={count ? styles.itemsText : styles.noItemsText}>{translate(bl, blmodel)}</Text>
      counter = <View style={styles.itemsCounterEmpty}>{
                  isPhoto
                    ? <Icon name='ios-camera-outline'  size={25} color={linkColor} />
                    : <Icon name={bl.icon || 'md-add'}   size={bl.icon ? 25 : 20} color={linkColor} />
                  }
                </View>
    }
    let err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[bl.name]
            : null

    let aiStyle = [{flex: 7}, count ? {paddingTop: 0} : {paddingTop: 15, paddingBottom: 7}]
    let actionableItem
    if (isPhoto)
      actionableItem = <ImageInput prop={bl} style={aiStyle} onImage={item => this.onAddItem(bl.name, item)}>
                        {itemsArray}
                      </ImageInput>
    else
      actionableItem = <TouchableOpacity style={aiStyle} onPress={this.onNewPressed.bind(this, bl, meta)}>
                        {itemsArray}
                      </TouchableOpacity>

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
    let acStyle = [{flex: 1, position: 'absolute', right: 0},
                   count || utils.isWeb() ? {paddingTop: 0} : {marginTop: 15, paddingBottom: 7}
                 ]
    let actionableCounter
    if (isPhoto)
      actionableCounter = <ImageInput prop={bl} style={acStyle} onImage={item => this.onAddItem(bl.name, item)}>
                            {counter}
                          </ImageInput>
    else
      actionableCounter = <TouchableOpacity style={acStyle}
                              onPress={this.onNewPressed.bind(this, bl, meta)}>
                            {counter}
                          </TouchableOpacity>

    let error = this.getErrorView({prop: bl})
    return (
      <View key={this.getNextKey()}>
        <View style={istyle} ref={bl.name}>
          <View style={styles.items}>
            {actionableItem}
            {actionableCounter}
          </View>
        </View>
        {error}
        {this.getHelp(bl)}
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

    let { bankStyle } = this.props

    let linkColor = bankStyle && bankStyle.linkColor || DEFAULT_LINK_COLOR
    if (count) {
      let items = []
      let arr = resource[bl.name]
      let n = Math.min(arr.length, utils.isWeb() ? utils.dimensions().width - 100 / 40 :  7)
      for (let i=0; i<n; i++) {
        items.push(<Image resizeMode='cover' style={styles.thumb} source={{uri: arr[i].url}}  key={this.getNextKey()} onPress={() => {
          this.openModal(arr[i])
        }}/>)
      }
      itemsArray =
        <View style={[styles.photoStrip, count ? {marginTop: -25} : {marginTop: 0}]}>
          <Text style={[styles.activePropTitle, {color: lcolor}]}>{translate(bl, blmodel)}</Text>
          <View style={styles.photoStripItems}>{items}</View>
        </View>
      counter =
        <View>
          <View style={styles.itemsCounter}>
            <Icon name='ios-camera-outline'  size={35} color={linkColor} />
          </View>
        </View>;
    }
    else {
      itemsArray = <Text style={count ? styles.itemsText : styles.noItemsText}>{translate(bl, blmodel)}</Text>
      counter = <View style={[styles.itemsCounterEmpty]}>
                  <Icon name='ios-camera-outline'  size={35} color={linkColor} />
                </View>
    }
    let title = translate(bl, blmodel) //.title || utils.makeLabel(p)
    let error = this.getErrorView({prop: bl})
    let actionableItem
    if (count)
      actionableItem = <TouchableOpacity style={styles.itemsWithCount} onPress={this.showItems.bind(this, bl, meta)}>
                         {itemsArray}
                       </TouchableOpacity>
    else
      actionableItem = <ImageInput
                         prop={bl}
                         style={styles.itemsWithoutCount}
                         underlayColor='transparent'
                         onImage={item => this.onAddItem(bl.name, item)}>
                         {itemsArray}
                       </ImageInput>

    let istyle = [count ? styles.photoButton : styles.itemButton, {marginHorizontal: 10, borderBottomColor: lcolor}]

    return (
      <View key={this.getNextKey()}>
        <View style={istyle} ref={bl.name}>
          <View style={styles.items}>
            {actionableItem}
            <ImageInput
                prop={bl}
                underlayColor='transparent' style={[{flex: 1, position: 'absolute', right: 0}, count ? {marginTop: 15} : {marginTop: 15, paddingBottom: 7}]}
                onImage={item => this.onAddItem(bl.name, item)}>
              {counter}
            </ImageInput>
          </View>
        </View>
        {error}
        {this.getHelp(bl)}
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

  onSubmitEditing(msg) {
    msg = msg ? msg : this.state.userInput;
    let assets = this.state.selectedAssets;
    let isNoAssets = utils.isEmpty(assets);
    if (!msg  &&  isNoAssets)
      return;
    let me = utils.getMe();
    let resource = {from: utils.getMe(), to: this.props.resource.to};
    let model = this.props.model;

    let toName = utils.getDisplayName(resource.to);
    let meName = utils.getDisplayName(me);
    let modelName = constants.TYPES.SIMPLE_MESSAGE;
    let value = {
      message: msg
              ?  model.isInterface ? msg : '[' + msg + '](' + model.id + ')'
              : '',

      from: {
        id: utils.getId(me),
        title: meName
      },
      to: {
        id: utils.getId(resource),
        title: toName
      },

      time: new Date().getTime()
    }
    value[constants.TYPE] = modelName;
    if (this.props.context)
      value._context = this.props.context

    if (!isNoAssets) {
      let photos = [];
      for (let assetUri in assets)
        photos.push({url: assetUri, title: 'photo'});

      value.photos = photos;
    }
    this.setState({userInput: '', selectedAssets: {}});
    Actions.addMessage({msg: value}); //, this.state.resource, utils.getModel(modelName));
  }
}
reactMixin(NewResource.prototype, Reflux.ListenerMixin);
reactMixin(NewResource.prototype, NewResourceMixin);
reactMixin(NewResource.prototype, ResourceMixin);
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
    itemsCounterEmpty: {
      paddingHorizontal: 5
    },
    itemsCounter: {
      marginTop: 25,
      paddingHorizontal: 5
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
    },
    activePropTitle: {
      fontSize: 12,
      marginTop: 20,
      paddingBottom: 5,
      // marginBottom: 5,
      color: '#bbbbbb'
    },
    photoStrip: {
      paddingBottom: 5
    },
    photoStripItems: {
      flexDirection: 'row'
    },
    logo: {
      opacity: 0.7,
      alignSelf: 'flex-end',
    },
    // submitButton: {
    //   paddingBottom: 30,
    //   justifyContent: 'center',
    //   alignSelf: 'center'
    // },
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
    itemsWithCount: {
      flex: 7,
      paddingTop: 15
    },
    itemsWithoutCount: {
      flex: 7,
      paddingTop: 15,
      paddingBottom: 7
    },
    submit: {
      backgroundColor: bankStyle && bankStyle.linkColor  ||  '#7AAAC3',
      flexDirection: 'row',
      justifyContent: 'center',
      width: 340,
      marginTop: 20,
      marginBottom: 50,
      alignSelf: 'center',
      height: 40,
      borderRadius: 5,
      marginHorizontal: 20
    },
    submitText: {
      fontSize: 20,
      paddingLeft: 7,
      color: '#ffffff',
      alignSelf: 'center'
    },
    errors: {
      height: 45,
      justifyContent: 'center',
      backgroundColor: '#990000',
      alignItems: 'center'
    },
    errorsText: {
      color: '#eeeeee',
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
    logoNeedsText: {
      backgroundColor: bankStyle.contextBackgroundColor,
      borderTopColor: bankStyle.contextBackgroundColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: 25,
      justifyContent: 'center',
      alignItems: 'center'
    },
    arrayItems: {
      marginTop: isRegistration ? 0 : -10,
      paddingBottom: 20
    }
  })
})
module.exports = NewResource;

// var styles = StyleSheet.create({
//   container: {
//     flex: 1
//   },
//   noItemsText: {
//     fontSize: 20,
//     color: '#AAAAAA',
//     // alignSelf: 'center',
//     // paddingLeft: 10
//   },
//   forms: {
//     fontSize: 18,
//     color: '#757575',
//     padding: 10
//   },
//   itemsText: {
//     fontSize: 20,
//     color: '#000000',
//     // alignSelf: 'center',
//     paddingLeft: 10
//   },
//   itemsCounterEmpty: {
//     paddingHorizontal: 5
//   },
//   itemsCounter: {
//     marginTop: 25,
//     paddingHorizontal: 5
//   },
//   itemButton: {
//     height: 60,
//     marginLeft: 10,
//     // marginLeft: 10,
//     borderColor: '#ffffff',
//     // borderBottomColor: '#b1b1b1',
//     // borderBottomWidth: 1,
//     paddingBottom: 10,
//     justifyContent: 'flex-end',
//   },
//   photoButton: {
//     marginLeft: 10,
//     borderColor: '#ffffff',
//     // borderBottomColor: '#b1b1b1',
//     // borderBottomWidth: 1,
//     // paddingBottom: 5,
//   },

//   photoBG: {
//     // marginTop: -15,
//     alignItems: 'center',
//     paddingBottom: 10,
//     // backgroundColor: '#245D8C'
//   },
//   err: {
//     // paddingVertical: 10,
//     flexWrap: 'wrap',
//     paddingHorizontal: 25,
//     fontSize: 16,
//     color: 'darkred',
//   },
//   getStartedText: {
//     // color: '#f0f0f0',
//     color: '#eeeeee',
//     fontSize: 20,
//     fontWeight:'300',
//     alignSelf: 'center'
//   },
//   getStarted: {
//     backgroundColor: '#467EAE', //'#2892C6',
//     paddingVertical: 10,
//     marginHorizontal: 10,
//     // paddingHorizontal: 50,
//     alignSelf: 'stretch',
//   },
//   thumbButton: {
//     marginTop: 20,
//     alignSelf: 'stretch',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   thumb: {
//     width:  40,
//     height: 40,
//     marginRight: 2,
//     borderRadius: 5
//   },
//   items: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   activePropTitle: {
//     fontSize: 12,
//     marginTop: 20,
//     paddingBottom: 5,
//     // marginBottom: 5,
//     color: '#bbbbbb'
//   },
//   photoStrip: {
//     paddingBottom: 5
//   },
//   photoStripItems: {
//     flexDirection: 'row'
//   },
//   logo: {
//     opacity: 0.7,
//     alignSelf: 'flex-end',
//   },
//   // submitButton: {
//   //   paddingBottom: 30,
//   //   justifyContent: 'center',
//   //   alignSelf: 'center'
//   // },
//   noRegistration: {
//     justifyContent: 'flex-start'
//   },
//   noRegistrationButton: {
//     height: 0
//   },
//   indicator: {
//     alignItems: 'center',
//     marginTop: 50
//   },
//   formListItem: {
//     padding: 10,
//     borderBottomColor: '#eeeeee',
//     borderBottomWidth: 1
//   },
//   bar: {
//     backgroundColor: 'transparent',
//     paddingHorizontal: 10,
//     justifyContent: 'center'
//   },
//   itemsWithCount: {
//     flex: 7,
//     paddingTop: 15
//   },
//   itemsWithoutCount: {
//     flex: 7,
//     paddingTop: 15,
//     paddingBottom: 7
//   },
//   submit: {
//     backgroundColor: '#7AAAC3',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     width: 340,
//     marginTop: 20,
//     marginBottom: 50,
//     alignSelf: 'center',
//     height: 40,
//     borderRadius: 5,
//     marginHorizontal: 20
//   },
//   submitText: {
//     fontSize: 20,
//     paddingLeft: 5,
//     color: '#ffffff',
//     alignSelf: 'center'
//   },
//   errors: {
//     height: 35,
//     justifyContent: 'center',
//     backgroundColor: '#990000',
//     alignItems: 'center'
//   },
//   errorsText: {
//     color: '#eeeeee',
//     fontSize: 16
//   }
  // showChoice(prop) {
  //   var self = this;
  //   ImagePicker.showImagePicker({
  //     returnIsVertical: true,
  //     chooseFromLibraryButtonTitle: utils.isSimulator() || prop._allowPicturesFromLibrary ? 'Choose from Library' : null,
  //     takePhotoButtonTitle: utils.isSimulator() ? null : 'Take Photo…',
  //     quality: utils.imageQuality
  //   }, (response) => {
  //     if (response.didCancel)
  //       return;
  //     if (response.error) {
  //       console.log('ImagePickerManager Error: ', response.error);
  //       return
  //     }
  //     var item = {
  //       // title: 'photo',
  //       url: 'data:image/jpeg;base64,' + response.data,
  //       isVertical: response.isVertical,
  //       width: response.width,
  //       height: response.height,
  //       chooseFromLibraryButtonTitle: ''
  //     };
  //     self.onAddItem('photos', item);
  //   });
  // }
