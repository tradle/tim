import React from 'react'
import ReactDOM from 'react-dom'
import {
  // Text,
  View,
  TouchableOpacity,
  Image,
  DatePickerAndroid,
  Switch
} from 'react-native'

import SwitchSelector from 'react-native-switch-selector'
import format from 'string-template'
import t from 'tcomb-form-native'
import _ from 'lodash'
import dateformat from 'dateformat'
import FloatLabel from 'react-native-floating-labels'
import Icon from 'react-native-vector-icons/Ionicons'
import moment from 'moment'
import DatePicker from 'react-native-datepicker'

import constants from '@tradle/constants'

import { Text, getFontMapping } from './Text'
import utils, { translate } from '../utils/utils'
import { getMarkdownStyles } from '../utils/uiUtils'
import StyleSheet from '../StyleSheet'
import RefPropertyEditor from './RefPropertyEditor'
import Markdown from './Markdown'
import Actions from '../Actions/Actions'

const DEFAULT_CURRENCY_SYMBOL = '£';

const {
  MONEY,
  SETTINGS,
  FORM,
  IDENTITY,
  MESSAGE
} = constants.TYPES

const {
  TYPE,
  ROOT_HASH
} = constants

const INTERSECTION = 'tradle.Intersection'
const FILE = 'tradle.File'

const PHOTO = 'tradle.Photo'
const YEAR = 3600 * 1000 * 24 * 365
const DAY  = 3600 * 1000 * 24
const HOUR = 3600 * 1000
const MINUTE = 60 * 1000

var cnt = 0;
var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};

const DEFAULT_LINK_COLOR = '#a94442'

var NewResourceMixin = {
  onScroll(e) {
    // from ListView._onScroll
    const target = ReactDOM.findDOMNode(this.refs.scrollView)
    this._contentOffset = {
      x: target.scrollLeft,
      y: target.scrollTop
    }

    // this._contentOffset = { ...e.nativeEvent.contentOffset }
  },
  getScrollOffset() {
    return { ...this._contentOffset }
  },
  getFormFields(params) {
    let { currency, editCols, originatingMessage, search, exploreData, errs, bookmark } = this.props
    let CURRENCY_SYMBOL = currency && currency.symbol ||  DEFAULT_CURRENCY_SYMBOL
    let { component, formErrors, model, data, validationErrors } = params

    let meta = this.props.model
    if (!meta)
      meta = utils.getModel(this.props.metadata.items.ref)
    let onSubmitEditing = exploreData && this.getSearchResult || this.onSavePressed
    let onEndEditing = this.onEndEditing  ||  params.onEndEditing

    let props, bl
    if (!meta.items)
      props = meta.properties;
    else {
      bl = meta.items.backlink
      if (meta.items.ref)
        props = utils.getModel(meta.items.ref).properties
      else
        props = meta.items.properties
    }

    let dModel = data  &&  utils.getModel(data[TYPE])
    if (!utils.isEmpty(data)    &&
        !meta.items             &&
        data[TYPE] !== meta.id  &&
        !utils.isSubclassOf(dModel, meta.id)) {
      let interfaces = meta.interfaces;
      if (!interfaces  ||  interfaces.indexOf(data[TYPE]) === -1)
        return;
    }

    let eCols = this.getEditCols(props, meta)

    let showReadOnly = true
    eCols.forEach(p => {
      if (!props[p].readOnly)
        showReadOnly = false
    })
    let requestedProperties, excludeProperties
    if (this.state.requestedProperties)
      ({requestedProperties, excludeProperties} = this.state.requestedProperties)

    let softRequired
    if (requestedProperties  &&  !utils.isEmpty(requestedProperties)) {
      showReadOnly = true
      ;({ eCols, softRequired } = this.addRequestedProps({eCols, params, props}))
    }
    else if (data) {
      for (let p in data) {
        if (!eCols.includes(p)  &&  p.charAt(0) !== '_'  &&  props[p]  &&  !props[p].readOnly)
          eCols.push(p)
      }
    }
    // Add props for which request for corrections came, if they are not yet added
    if (formErrors) {
      for (let p in formErrors)
        if (eCols.indexOf(p) === -1)
          eCols.push(p)
    }
    let required = utils.ungroup({model: meta, viewCols: meta.required, edit: true})
    if (!softRequired)
      softRequired = meta.softRequired || []

    if (validationErrors) {
      formErrors = validationErrors
      this.state.validationErrors = null
    }

    const isMessage = meta.id === MESSAGE
    let options = {fields: {}}
    let resource = this.state.resource
    for (let i=0; i<eCols.length; i++) {
      let p = eCols[i]
      if (!isMessage && (p === TYPE || p.charAt(0) === '_'  ||  p === bl  ||  (props[p].items  &&  props[p].items.backlink)))
        continue;

      if (meta.hidden  &&  meta.hidden.indexOf(p) !== -1)
        continue

      let maybe = !required  ||  !required.includes(p)
      if (maybe) {
        if (p.indexOf('_group') === -1  &&  softRequired.includes(p))
          maybe = false
      }
      let type = props[p].type;
      let formType = propTypesMap[type];
      // Don't show readOnly property in edit mode if not set
      let isReadOnly = props[p].readOnly
      if (isReadOnly  &&  !search  &&  !showReadOnly) //  &&  (type === 'date'  ||  !data  ||  !data[p]))
        continue;
      this.setDefaultValue(props[p], data, true)
      if (!this.props.metadata  && utils.isHidden(p, resource)) {
        // if (!resource[p])
        //   this.setDefaultValue(p, resource, true)
        continue
      }

      let label = translate(props[p], meta) //props[p].title;
      if (!label)
        label = utils.makeLabel(p);
      let errMessage
      if (errs  &&  errs[p]) {
        maybe = false
        if (resource[p] === this.props.resource[p])
          errMessage = errs[p]
      }
      if (!validationErrors  &&  formErrors  &&  formErrors[p]) {
        if (resource[p]  &&  this.props.resource[p]  &&  _.isEqual(resource[p], this.props.resource[p]))
        // if (resource[p] === this.props.resource[p])
          errMessage = formErrors[p]
        else if (!resource[p] && !this.props.resource[p])
           errMessage = formErrors[p]
        else
          delete formErrors[p]
      }
      if (!errMessage)
        errMessage = translate('thisFieldIsRequired')
      options.fields[p] = {
        bufferDelay: 20, // to eliminate missed keystrokes
        error: errMessage
      }
      if (props[p].units) {
        if (props[p].units.charAt(0) === '[')
          options.fields[p].placeholder = label  + ' ' + props[p].units
        else
          options.fields[p].placeholder = label + ' (' + props[p].units + ')'
      }
      if (props[p].description)
        options.fields[p].help = props[p].description;
      if (props[p].readOnly  ||  (props[p].immutable  &&  data  &&  data[p]))
        options.fields[p] = {'editable':  false };

      if (formType) {
        if (props[p].keyboard)
          options.fields[p].keyboardType = props[p].keyboard

        model[p] = !model[p]  &&  (maybe ? t.maybe(formType) : formType);
        if (data  &&  (type == 'date')) {
          model[p] = t.Str
          options.fields[p].template = this.myDateTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    required: !maybe,
                    model: meta,
                    errors: formErrors,
                    component,
                    editable: !props[p].readOnly || search,
                    value: data[p] ? new Date(data[p]) : data[p]
                  })

          if (data[p])
            data[p] = new Date(data[p]);
          options.fields[p].mode = 'date';
          options.fields[p].auto = 'labels';
          options.fields[p].label = label
          options.fields[p].onDateChange = this.onDateChange
        }
        else if (type === 'boolean') {
          // HACK for old values
          let v = data && data[p]
          if (v) {
            if (typeof v !== 'boolean')
              v = v.title === 'No' ? false : true
          }

          options.fields[p].template = this.myBooleanTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    value: v,
                    required: !maybe,
                    component,
                    errors: formErrors,
                  })

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this);
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          if (props[p].maxLength)
            options.fields[p].maxLength = props[p].maxLength;
        }
        else if (type === 'string') {
          if (props[p].maxLength > 300)
            options.fields[p].multiline = true;
          options.fields[p].autoCorrect = false;
          if (props[p].oneOf) {
            model[p] = t.enums(props[p].oneOf);
            options.fields[p].auto = 'labels';
          }
        }
        else if (type === 'number') {
          if (!search) {
            if (!props[p].keyboard)
              options.fields[p].keyboardType = 'numeric'
            if (data  &&  data[p]  &&  (typeof data[p] != 'number'))
              data[p] = parseFloat(data[p])
          }
        }

        if (type === 'string'  &&  p.length > 6  &&  p.indexOf('_group') === p.length - 6) {
          options.fields[p].template = this.myTextTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                  })
        }
        else if (type === 'string'  &&  props[p].markdown) {
          options.fields[p].template = this.myMarkdownTextInputTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    value: data  &&  data[p] ? data[p] + '' : null,
                    required: !maybe,
                    errors: formErrors,
                    editable: params.editable,
                  })
        }
        else if (type === 'string'  &&  props[p].signature) {
          options.fields[p].template = this.mySignatureTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    value: data  &&  data[p] || null,
                    required: !maybe,
                    errors: formErrors,
                    component,
                    editable: params.editable,
                  })
        }
        else if (!options.fields[p].multiline && (type === 'string'  ||  type === 'number')) {
          let editable = (params.editable && !props[p].readOnly) || search || false
          options.fields[p].template = this.myTextInputTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    value: data  &&  data[p] ? data[p] + '' : null,
                    required: !maybe,
                    onSubmitEditing: onSubmitEditing.bind(this),
                    errors: formErrors,
                    component,
                    editable,
                    keyboard: props[p].keyboard ||  (!search && type === 'number' ? 'numeric' : 'default'),
                  })

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this);
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          if (props[p].maxLength)
            options.fields[p].maxLength = props[p].maxLength;
        }
      }
      else {
        let ref = props[p].ref;
        if (!ref) {
          if (type === 'number'  ||  type === 'string')
            ref = MONEY
          else if (props[p].range === 'json')
            continue
          ref = props[p].items  &&  props[p].items.ref
          if (!ref  ||  !utils.isEnum(ref))
            continue;
        }
        if (ref === MONEY) {
          model[p] = maybe ? t.maybe(t.Num) : t.Num;
          let value = data[p]
          if (value) {
            if (typeof value !== 'object') {
              value = {
                value: value,
                currency: CURRENCY_SYMBOL
              }
            }
            else if (!value.currency)
              value.currency = CURRENCY_SYMBOL
          }
          else {
            value = {
              currency: CURRENCY_SYMBOL
            }
          }
          options.fields[p].template = this.myMoneyInputTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    value: value,
                    model: meta,
                    keyboard: 'numeric',
                    component,
                    required: !maybe,
                    errors: formErrors,
                  })

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this)
          options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          continue;
        }
        else if (props[p].signature) {
          model[p] = maybe ? t.maybe(t.Str) : t.Str;
          options.fields[p].template = this.mySignatureTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    value: data  &&  data[p] || null,
                    required: !maybe,
                    errors: formErrors,
                    component,
                    editable: params.editable,
                  })
          continue
        }
        else if (search) {
          if (ref === PHOTO  ||  ref === IDENTITY)
            continue
        }

        model[p] = maybe ? t.maybe(t.Str) : t.Str;

        if (data  &&  data[p]) {
          let vType = utils.getType(data[p])
          if (vType) {
            let subModel = utils.getModel(vType)
            options.fields[p].value = utils.getId(data[p])
            if (!search  &&  !bookmark)
              data[p] = utils.getDisplayName(data[p], subModel) || data[p].title;
          }
        }
        // options.fields[p].onFocus = chooser.bind(this, props[p], p)
        options.fields[p].template = this.myCustomTemplate.bind(this, {
            label: label,
            prop:  p,
            required: !maybe,
            errors: formErrors,
            resource: bookmark && search &&  data,
            component,
            chooser: options.fields[p].onFocus,
          })

        options.fields[p].nullOption = {value: '', label: 'Choose your ' + utils.makeLabel(p)};
      }
    }


    // HACK for video
    if (eCols.indexOf('video') !== -1) {
      let maybe = required  &&  !required.hasOwnProperty('video');

      model.video = maybe ? t.maybe(t.Str) : t.Str;

      options.fields.video.template = this.myCustomTemplate.bind(this, {
          label: translate(props.video, meta),
          prop:  'video',
          errors: formErrors,
          component,
          required: !maybe
        })
    }
    return options;
  },
  addRequestedProps({eCols, params, props}) {
    let {requestedProperties, excludeProperties, formErrors, model} = this.state.requestedProperties
    if (!formErrors) {
      _.extend(params, {formErrors: {}})
      formErrors = params.formErrors
    }
    eCols = eCols.filter(p => requestedProperties[p])
    let softRequired = []
    let groupped = []
    for (let p in requestedProperties) {
      // if (eCols.some((prop) => prop.name === p) {
      let idx = p.indexOf('_group')
      let eidx = eCols.indexOf(p)
      if (eidx !== -1) {
        if (groupped.indexOf(p) !== -1)
          continue
        eCols.splice(eidx, 1)
      }
      if (excludeProperties  &&  excludeProperties.indexOf(p) !== -1)
        continue

      if (requestedProperties[p].hide)
        continue

      eCols.push(p)
      let isRequired = requestedProperties[p].required
      if (idx === -1  &&  props[p].readOnly);
        // showReadOnly = true
      else if (props[p].list) {
        props[p].list.forEach((pp) => {
          let rProp = requestedProperties[pp]
          let isHidden = rProp  &&  rProp.hide
          let idx = eCols.indexOf(pp)
          if (idx !== -1)
            eCols.splice(idx, 1)
          if (isHidden)
            return
          if (excludeProperties  &&  excludeProperties.indexOf(pp) !== -1)
            return
          eCols.push(pp)
          if (isRequired) {
            if (!rProp)
              softRequired.push(pp)
          }
          else if (rProp  &&  rProp.required)
            softRequired.push(pp)
          groupped.push(pp)
        })
      }
      else if (isRequired)
        softRequired.push(p)
    }
    return { eCols, softRequired }
  },
  getEditCols(props, model) {
    const { editCols, exploreData, bookmark, search } = this.props
    const isMessage = model.id === MESSAGE
    if (editCols)
      return editCols.slice();
    if (isMessage)
      return model.viewCols

    let isSearch = exploreData  ||  (bookmark && search)
    let eCols = utils.getEditCols(model).map(p => p.name)
    if (!eCols.length) {
      if (model.required)
        return model.required.slice
      else
        return Object.keys(props)
    }
    else if (!isSearch)
      return eCols

    let vColsList = utils.getViewCols(model)
    vColsList.forEach(p => {
      if (eCols.indexOf(p) === -1)
        eCols.push(p)
    })

    let exclude = ['time', 'context', 'lens']
    let prefillProp = utils.getPrefillProperty(model)
    if (prefillProp)
      exclude.push(prefillProp.name)
    for (let p in props) {
      if (!eCols.includes(p)      &&
          !props[p].items         &&
          p.charAt(0) !== '_'     &&
          !exclude.includes(p))
        eCols.push(p)
    }

    return eCols
  },
  addError(p, params) {
    let { errs } = this.props
    let { formErrors } = params
    if (errs)
      errs[p] = ''
    if (!formErrors[p])
      formErrors[p] = translate('thisFieldIsRequired')
  },
  getNextKey() {
    return (this.props.model  ||  this.props.metadata).id + '_' + cnt++
  },
  changeValue(prop, value) {
    let { name: pname, ref: pref, type: ptype } = prop

    if (ptype === 'string'  &&  !value.trim().length)
      value = ''
    const { resource, missedRequiredOrErrorValue } = this.state
    let search = this.props.search
    let r = _.cloneDeep(resource)
    if(ptype === 'number'  &&  !search) {
      let val = Number(value)
      if (value.charAt(value.length - 1) === '.')
        value = val + '.00'
      else
        value = val
    }
    if (!this.floatingProps)
      this.floatingProps = {}

    if (pref == MONEY) {
      if (!this.floatingProps[pname])
        this.floatingProps[pname] = {}
      this.floatingProps[pname].value = value
      if (!r[pname])
        r[pname] = {}
      r[pname].value = value
    }
    else if (ptype === 'boolean')  {
      if (value === 'null') {
        let m = utils.getModel(resource[TYPE])
        if (!search  ||  (m.required  &&  m.required.includes(pname))) {
          delete r[pname]
          delete this.floatingProps[pname]
        }
        else {
          r[pname] = null
          this.floatingProps[pname] = value
        }
      }
      else {
        if (value === 'true')
          value = true
        else if (value === 'false')
          value = false
        r[pname] = value
        this.floatingProps[pname] = value
      }
    }
    else {
      r[pname] = value
      this.floatingProps[pname] = value
    }
    if (missedRequiredOrErrorValue)
      delete missedRequiredOrErrorValue[pname]
    if (!search  &&  r[TYPE] !== SETTINGS  &&  ptype !== 'string') {
      // this.debugChanges(r, 'country')
      // Actions.saveTemporary(r)
// global.a = r
      Actions.getRequestedProperties({resource: r})
    }

    this.setState({
      resource: r,
      inFocus: pname
    })
  },
  // debugChanges(resource, prop) {
  //   Object.defineProperty(resource, prop, {
  //     set: (val) => {
  //       debugger
  //       // return val
  //     }
  //   })
  // },

  myTextTemplate(params) {
    let label = translate(params.prop, params.model)
    let bankStyle = this.props.bankStyle
    let linkColor = (bankStyle && bankStyle.linkColor) || DEFAULT_LINK_COLOR
    return (
      <View style={{paddingVertical: 10}}>
      <View style={[styles.divider, {borderBottomColor: linkColor, paddingVertical: 5}]}>
        <Text style={[styles.dividerText, {color: linkColor, fontFamily: bankStyle.headerFont}]}>{label}</Text>
      </View>
      </View>
    );
  },

  myMarkdownTextInputTemplate(params) {
    let { prop, value } = params
    let { bankStyle } = this.props
    let hasValue = value  &&  value.length
    if (hasValue) {
      value = format(value, this.state.resource).trim()
      hasValue = value  &&  value.length
    }
    let { lcolor, bcolor } = this.getLabelAndBorderColor(prop.name)
    if (hasValue)
      lcolor =  '#555555'

    let lStyle = [styles.labelStyle, { color: lcolor, fontSize: 20}]
    let vStyle = { height: 45, marginTop: 10, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', margin: 10}
    let help = prop.ref !== MONEY  && this.paintHelp(prop)
    let st = {paddingBottom: 10}
    if (!help)
      st.flex = 5
    let markdown, title
    if (hasValue) {
      markdown = <View style={styles.markdown}>
                   <Markdown markdownStyles={getMarkdownStyles(bankStyle, true)}>
                     {value}
                   </Markdown>
                 </View>
      title = utils.translate(prop)
    }
    else
      title = utils.translate('Please click here to view/edit')

    let header
    if (prop.readOnly)
      st.marginTop = -10
    else
      header = <View style={vStyle}>
                 <Text style={lStyle}>{title}</Text>
                 <Icon name='md-create' size={25}  color={bankStyle.linkColor} />
               </View>

    return <View style={st}>
             <TouchableOpacity onPress={this.showMarkdownEditView.bind(this, prop)}>
               {header}
             </TouchableOpacity>
             {markdown}
          </View>
  },

  showMarkdownEditView(prop) {
    this.props.navigator.push({
      title: translate(prop), //m.title,
      // titleTextColor: '#7AAAC3',
      componentName: 'MarkdownPropertyEdit',
      backButtonTitle: 'Back',
      rightButtonTitle: 'Done',
      passProps: {
        prop:           prop,
        resource:       this.state.resource,
        bankStyle:      this.props.bankStyle,
        callback:       this.changeValue.bind(this)
      }
    })
  },

  mySignatureTemplate(params) {
    let {prop, required, model, value} = params
    let label = translate(prop, model)
    if (required)
      label += ' *'

    let { bankStyle, search } = this.props
    let { lcolor, bcolor } = this.getLabelAndBorderColor(prop.name)
    if (value)
      lcolor = '#555555'

    let help = this.paintHelp(prop)
    let st = {paddingBottom: 10}
    if (!help)
      st.flex = 5
    let title, sig
    if (value) {
      let vStyle = { height: 100, justifyContent: 'space-between', margin: 10, borderBottomColor: '#cccccc', borderBottomWidth: 1}
      let lStyle = [styles.labelStyle, { paddingBottom: 10, color: lcolor, fontSize: 12}]
      title = utils.translate('Please click here to change signature')
      let { width, height } = value
      let h = 70
      let w
      if (width > height)
        w = (width * 70)/(height - 100)
      else
        w = (height * 70)/(width - 100)
      sig = <View style={vStyle}>
              <Text style={lStyle}>{label}</Text>
              <Image source={{uri: value.url}} style={{width: w, height: h}} />
            </View>
    }
    else {
      let vStyle = { height: 55, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', margin: 15, borderBottomColor: '#cccccc', borderBottomWidth: 1}
      let lStyle = [styles.labelStyle, { color: lcolor, fontSize: 20}]
      title = utils.translate('Please click here to sign')
      sig = <View style={vStyle}>
              <Text style={lStyle}>{title}</Text>
              <Icon name='md-create' size={25}  color={bankStyle.linkColor} />
            </View>
    }
    if (prop.immutable  &&  value) {
      return <View style={st}>{sig}</View>
    }
    else {
      return <View style={st}>
               <TouchableOpacity onPress={this.showSignatureView.bind(this, prop, this.changeValue.bind(this, prop))}>
                 {sig}
               </TouchableOpacity>
            </View>
    }
  },

  myTextInputTemplate(params) {
    let {prop, required, model, editable, keyboard, value} = params
    let label = translate(prop, model)

    if (prop.units) {
      label += (prop.units.charAt(0) === '[')
             ? ' ' + prop.units
             : ' (' + prop.units + ')'
    }
    if (!this.props.search  &&  required)
      label += ' *'
    let lStyle = styles.labelStyle

    let maxChars = (utils.dimensions(params.component).width - 40)/utils.getFontSize(9)
    if (maxChars < label.length  &&  (!this.state.resource[prop.name] || !this.state.resource[prop.name].length))
      lStyle = [lStyle, {marginTop: 0}]

    let { lcolor, bcolor } = this.getLabelAndBorderColor(prop.name)
    if (this.state.isRegistration)
      lStyle = [lStyle, {color: lcolor}]

    // avoid <input type="number"> on web
    // it good-naturedly interferes with validation
    let multiline = prop.maxLength > 100
    let help = prop.ref !== MONEY  && this.paintHelp(prop)
    let st = { paddingBottom: 10 }
    let icon
    // Especially for money type props
    let { bankStyle } = this.props
    if (!help)
      st = {...st, flex: 5}
    if (!editable)
      icon = <Icon name='ios-lock-outline' size={25} color={bankStyle.textColor} style={styles.readOnly} />

    // let fontF = bankStyle && bankStyle.fontFamily && {fontFamily: getFontMapping(bankStyle.fontFamily)} || {}
    let fontF = bankStyle && bankStyle.textFont && {fontFamily: bankStyle.textFont} || {}
    let autoCapitalize = this.state.isRegistration  ||  (prop.range !== 'url' &&  prop.name !== 'form' &&  prop.name !== 'product' &&  prop.range !== 'email') ? 'sentences' : 'none'
    return (
      <View style={st}>
        <FloatLabel
          labelStyle={[lStyle, fontF, {color: lcolor}]}
          autoCorrect={false}
          password={prop.range === 'password' ? true : false}
          multiline={multiline}
          editable={editable}
          autoCapitalize={autoCapitalize}
          onFocus={this.inputFocused.bind(this, prop)}
          inputStyle={this.state.isRegistration ? styles.regInput : [styles.textInput, fontF]}
          style={[styles.formInput, {borderColor: bcolor}]}
          value={value}
          onKeyPress={this.onKeyPress.bind(this, params.onSubmitEditing)}
          keyboardShouldPersistTaps='always'
          keyboardType={keyboard || 'default'}
          onChangeText={this.changeValue.bind(this, prop)}
          underlineColorAndroid='transparent'
        >{label}
        </FloatLabel>
        {icon}
        {this.paintError(params)}
        {help}
      </View>
    );
  },
  onKeyPress(onSubmit, key) {
    if (key.nativeEvent.key === 'Enter')
      onSubmit()
  },
  paintHelp(prop) {
    if (!prop.description)
      return <View style={styles.help1}/>
    try {
      return (
        <View style={styles.help}>
          <Markdown markdownStyles={getMarkdownStyles(this.props.bankStyle, false)}>
            {translate(prop, this.props.model, true)}
          </Markdown>
        </View>
      )
    } catch (err) {
      debugger
      return <View/>
    }
  },

  paintError(params) {
    if (params.noError)
      return
    let {missedRequiredOrErrorValue, isRegistration} = this.state
    let {prop} = params
    let err = missedRequiredOrErrorValue
            ? missedRequiredOrErrorValue[prop.name]
            : null
    if (!err) {
      if (params.errors  &&  params.errors[prop.name])
        err = params.errors[params.prop.name]
      else
        return
    }
    if (isRegistration)
      return <View style={[styles.err, typeof params.paddingLeft !== 'undefined' ? {paddingLeft: params.paddingLeft} : {paddingLeft: 10}]} key={this.getNextKey()}>
               <Text style={styles.font14, {color: '#eeeeee'}}>{err}</Text>
             </View>

    let { bankStyle } = this.props

    let addStyle = {
      paddingVertical: 3,
      marginTop: prop.type === 'object' ||  prop.type === 'date' ||  prop.items ? 0 : 2,
      backgroundColor: bankStyle.errorBgColor  ||  '#990000',
      paddingHorizontal: 10,
    }
    return <View style={[styles.err]} key={this.getNextKey()}>
             <View style={addStyle}>
               <Text style={styles.font14, {paddingLeft: 5, color: bankStyle.errorColor ||  '#eeeeee'}}>{err}</Text>
             </View>
           </View>
  },

  myBooleanTemplate(params) {
    let {prop, model, value, required, component} = params
    let { search, bankStyle } = this.props
    let labelStyle = styles.booleanLabel
    let textStyle =  [styles.booleanText, {color: this.state.isRegistration ? '#ffffff' : '#757575'}]
    let { lcolor, bcolor } = this.getLabelAndBorderColor(prop.name)

    let resource = this.state.resource

    let style = (resource && (typeof resource[prop.name] !== 'undefined'))
              ? textStyle
              : labelStyle
    let label = translate(prop, model)
    if (prop.units) {
      label += (prop.units.charAt(0) === '[')
             ? ' ' + prop.units
             : ' (' + prop.units + ')'
    }
    if (!search  &&  required)
      label += ' *'

    let help = this.paintHelp(prop)

    let isTroolean = prop.range === 'troolean' || search
    let switchView
    let switchC, booleanContentStyle, icon

    let fontF = bankStyle && bankStyle.textFont && {fontFamily: bankStyle.textFont} || {}
    if (prop.readOnly  &&  !search) {
      switchC = <View style={{paddingVertical: 5}}>
                  <Text style={[styles.dateText, fontF]}>{value + ''}</Text>
                </View>
      style = [style, {fontSize: 14}]
      icon = <Icon name='ios-lock-outline' size={25} color={bankStyle.textColor} style={styles.readOnly} />
    }

    else if (isTroolean) {
      const options = [
          { value: 'true', customIcon: <Icon size={30} color='#000' name='ios-checkmark' />},
          { value: 'null', customIcon: <Icon size={30} color='#000' name='ios-radio-button-off' /> },
          { value: 'false', customIcon: <Icon size={30} color='#000' name='ios-close' /> },
      ];
      let initial
      let v = value + ''
      for (let i=0; i<options.length  &&  !initial; i++) {
        if (options[i].value === v)
          initial = i
      }
      if (typeof initial === 'undefined')
        initial = 1
      let switchWidth = Math.floor(utils.getChatWidth() / 2)
      switchView = { paddingVertical: 15, width: switchWidth, alignSelf: 'flex-end'}
      booleanContentStyle = {}
      switchC = <View style={switchView}>
                 <SwitchSelector initial={initial} hasPadding={true} fontSize={30} options={options} onPress={(v) => this.changeValue(prop, v)} backgroundColor='transparent' buttonColor='#ececec' />
                </View>
    }
    else {
      switchC = <Switch value={value} style={{alignSelf: 'center'}} />
      booleanContentStyle = styles.booleanContentStyle
    }
    return (
      <View style={styles.bottom10} key={this.getNextKey()} ref={prop.name}>
        <View style={[styles.booleanContainer, {borderColor: bcolor}]}>
          <TouchableOpacity onPress={() => this.changeValue(prop, isTroolean && value ||  !value)}>
          <View style={booleanContentStyle}>
            <Text style={[style, {color: lcolor}]}>{label}</Text>
            {switchC}
          </View>
          </TouchableOpacity>
        </View>
        {icon}
        {this.paintError(params)}
        {help}
      </View>
    )
  },
  myDateTemplate(params) {
    let { prop, required, component, editable } = params
    let { search, bankStyle, bookmark } = this.props

    let resource = this.state.resource
    let propLabel
    let { lcolor, bcolor } = this.getLabelAndBorderColor(prop.name)
    if (resource && resource[prop.name])
      propLabel = <Text style={[styles.dateLabel, {color: lcolor}]}>{params.label}</Text>
    else
      propLabel = <View style={styles.floatingLabel}/>

    let valueMoment = params.value && moment.utc(new Date(params.value))
    // let value = valueMoment && valueMoment.format(format)
    let value = params.value  &&  utils.getDateValue(new Date(params.value))
    let dateProps = {}
    if (prop.maxDate  ||  prop.minDate) {
      let maxDate = this.getDateRange(prop.maxDate)
      let minDate = this.getDateRange(prop.minDate)
      if (minDate  &&  maxDate)
        dateProps = {maxDate: new Date(maxDate), minDate: new Date(minDate)}
      else
        dateProps = minDate ? {minDate: new Date(minDate)} : {maxDate: new Date(maxDate)}
    }

    if (!value)
      value = translate(params.prop, utils.getModel(resource[TYPE]))  + (!search  &&  required  ?  ' *' : '')
    // let st = utils.isWeb() ? { borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent', borderBottomColor: '#cccccc'} : {}
    let st = utils.isWeb() ? [styles.formInput, {minHeight: 60, borderColor: bcolor}] : {marginHorizontal: 15}

    // convert from UTC date to local, so DatePicker displays it correctly
    // e.g. 1999-04-13 UTC -> 1999-04-13 EDT
    let localizedDate
    if (valueMoment) {
      localizedDate = new Date(valueMoment.year(), valueMoment.month(), valueMoment.date())
    }
    let linkColor = (bankStyle && bankStyle.linkColor) || DEFAULT_LINK_COLOR

    let fontF = bankStyle && bankStyle.textFont && {fontFamily: bankStyle.textFont} || {}

    let sign
    // if (bookmark) {
    //   let signValue = this.floatingProps[prop.name + '_sign']
    //   sign = this.myTextInputTemplate({
    //                 label: '',
    //                 prop:  prop,
    //                 sign: true,
    //                 value: signValue || '',
    //                 required: required,
    //                 model: model,
    //                 noError: true,
    //                 // errors: errors,
    //                 editable,
    //                 component,
    //                 keyboard: search ? null : 'numeric',
    //               })
    //   sign = <View style={{width: 30}}>{sign}</View>
    // }
    let format = 'LL'
    if (prop.format) {
      dateProps.format = prop.format
      format = prop.format
      if (localizedDate)
        value = dateformat(localizedDate, format)
    }
    let datePicker
    if (prop.readOnly  &&  !search) {
      datePicker = <View style={{paddingVertical: 5, paddingHorizontal: 10}}>
                     <Text style={[styles.dateText, fontF]}>{dateformat(localizedDate, 'mmmm dd, yyyy')}</Text>
                   </View>
    }
    else {
      datePicker = <DatePicker
            style={[styles.datePicker, {width: utils.dimensions(component).width - 20, paddingBottom: 10}, fontF]}
            mode="date"
            placeholder={value}
            format={format}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            locale={utils.getMe().languageCode || 'en'}
            date={localizedDate}
            onDateChange={(date) => {
              if (!(date instanceof Date)) {
                date = moment.utc(date, format).toDate()
              }

              this.changeTime(params.prop, date)
            }}
            customStyles={{
              dateInput: [styles.dateInput, fontF],
              dateText: [styles.dateText, fontF],
              placeholderText: [styles.font20, fontF, {
                color: params.value ? '#555555' : '#777777',
                paddingLeft: 10
              }],
              dateIconColor: {color: linkColor},
              dateIcon: styles.dateIcon,
              btnTextConfirm: {color: linkColor}
            }}
            {...dateProps}
          />
    }
    let icon
    if (!editable)
      icon = <Icon name='ios-lock-outline' size={25} color={bankStyle.textColor} style={styles.readOnly} />

    let help = this.paintHelp(prop)
    return (
      <View key={this.getNextKey()} ref={prop.name} style={{paddingBottom: 10}}>
        <View style={[st, {paddingBottom: this.hasError(params.errors, prop.name) || utils.isWeb() ?  0 : 10}]}>
          {propLabel}
          {sign}
          {datePicker}
          {help}
          {icon}
        </View>
        {this.paintError(params)}
      </View>
     )
  },
  getLabelAndBorderColor(prop) {
    let bankStyle = this.props.bankStyle
    let lcolor, bcolor
    if (this.state.isRegistration)
      lcolor = '#f3f3f3'
    if (this.state.inFocus === prop)
      lcolor = bankStyle  &&  bankStyle.linkColor || '#757575'
    else {
      lcolor = '#888888'
      bcolor = '#dddddd'
    }
    return {lcolor, bcolor: bcolor ||  lcolor}
  },
  getDateRange(dateStr) {
    if (!dateStr)
      return null
    let parts = dateStr.split(' ')
    if (parts.length === 1) {
      switch(dateStr) {
      case 'today':
        return new Date().getTime()
      case 'tomorrow':
        return (new Date().getTime() + DAY)
      }
    }
    let [number, measure] = parts
    let beforeAfter = parts.length === 3 ? parts[2] : 'before'
    let coef
    switch (measure) {
    case 'years':
      coef = YEAR
      break
    case 'days':
      coef = DAY
      break
    case 'hours':
      coef = HOUR
      break
    case 'minutes':
      coef = MINUTE
      break
    default:
      coef = 1000
    }
    switch(beforeAfter) {
    case 'before':
      return new Date().getTime() - number * coef
    case 'after':
      return new Date().getTime() + number * coef
    }
  },
  async showPicker(prop, stateKey, options) {
    try {
      // let newState = {};
      let date
      const {action, year, month, day} = await DatePickerAndroid.open(options);
      if (action !== DatePickerAndroid.dismissedAction) {
      //   newState[stateKey + 'Text'] = 'dismissed';
      // } else {
        date = new Date(year, month, day);
        // newState[stateKey + 'Text'] = date.toLocaleDateString();
        // newState[stateKey + 'Date'] = date;
      }
      // this.setState(newState);
      this.changeTime(prop, date)
    } catch ({code, message}) {
      console.warn(`Error in example '${stateKey}': `, message);
    }
  },

  changeTime: function(prop, date) {
    let r = _.cloneDeep(this.state.resource)
    r[prop.name] = date.getTime()
    if (!this.floatingProps)
      this.floatingProps = {}
    this.floatingProps[prop.name] = date.getTime()
    this.setState({
      resource: r,
      inFocus: prop.name
    });
    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[prop.name]
   },

  inputFocused(prop) {
    if (prop.readOnly)
      return
    if (/*!this.state.isRegistration   &&*/
         this.refs                   &&
         this.refs.scrollView        &&
         this.props.model            &&
         Object.keys(this.props.model.properties).length > 5) {
      utils.scrollComponentIntoView(this, this.refs.form.getComponent(prop.name))
      this.setState({inFocus: prop.name})
    }
    else if (this.state.inFocus !== prop.name)
      this.setState({inFocus: prop.name})
  },

  myCustomTemplate(params) {
    if (!this.floatingProps)
      this.floatingProps = {}
    let { model, metadata, bookmark } = this.props
    let { required, errors, component } = params
    let props
    if (model)
      props = model.properties
    else if (metadata.items.properties)
      props = metadata.items.properties
    else
      props = utils.getModel(metadata.items.ref).properties
    let pName = params.prop
    let prop = props[pName]
    let ref = prop.ref || prop.items.ref
    let isMedia = pName === 'video' ||  pName === 'photos'  ||  ref === PHOTO   ||  ref === FILE ||  utils.isSubclassOf(ref, FILE)
    let onChange
    if (isMedia)
      onChange = this.setState.bind(this)
    else
      onChange = this.setChosenValue.bind(this)
    let error = this.state.missedRequiredOrErrorValue  &&  this.state.missedRequiredOrErrorValue[pName]
    if (!error  &&  errors  &&  errors[pName])
      error = errors[pName]
    return <RefPropertyEditor {...this.props}
                             resource={params.resource ||   this.state.resource}
                             onChange={onChange}
                             prop={prop}
                             bookmark={bookmark}
                             photo={this.state[pName + '_photo']}
                             labelAndBorder={this.getLabelAndBorderColor.bind(this, pName)}
                             component={component}
                             error={error}
                             inFocus={this.state.inFocus}
                             required={required}
                             floatingProps={this.floatingProps}
                             paintHelp={this.paintHelp.bind(this)}
                             paintError={this.paintError.bind(this)}
                             styles={styles}/>
  },
  setDefaultValue(prop, data, isHidden) {
    let p = prop.name
    let resource = this.state.resource
    if (resource[p]  ||  resource[ROOT_HASH])
      return
    if (this.floatingProps  &&  this.floatingProps.hasOwnProperty(p))
      return
    let defaults = this.props.defaultPropertyValues
    let value
    if (defaults) {
      let vals = defaults[resource[TYPE]]
      if (vals  &&  vals[p])
        value = vals[p]
    }
    else
      value = prop.default
    if (!value)
      return
    if (prop.type === 'date') {
      if (typeof value === 'string')
        value = this.getDateRange(value)
    }
    data[p] = value
    resource[p] = value
    if (isHidden) {
      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[p] = value
    }
  },
  hasError(errors, propName) {
    return (errors && errors[propName]) || this.state.missedRequiredOrErrorValue &&  this.state.missedRequiredOrErrorValue[propName]
  },
  setChosenValue(propName, value) {
    let resource = _.cloneDeep(this.state.resource)
    if (typeof propName === 'object')
      propName = propName.name
// debugger
    let setItemCount
    let { metadata, model, search } = this.props
    let isItem = metadata != null
    if (!model  &&  isItem)
      model = utils.getModel(metadata.items.ref)

    let prop = model.properties[propName]
    let isEnum = prop.ref  &&  utils.isEnum(prop.ref)
    let isMultichooser = search  &&  prop.ref  &&  utils.isEnum(prop.ref)
    let isArray = prop.type === 'array'
    let doDelete
    let currentR = _.cloneDeep(resource)
    // clause for the items properies - need to redesign
    if (metadata  &&  metadata.type === 'array') {
      if (isEnum)
        value = utils.buildRef(value)
      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[propName] = value
      resource[propName] = value
    }
    else if (isArray || isMultichooser) {
      ({setItemCount} = this.setArrayOrMultichooser(prop, value, resource))
    }
    else if (value[ROOT_HASH] === '__reset') {
      if (this.floatingProps  &&  this.floatingProps[propName])
        delete this.floatingProps[propName]
      // resource[propName] = null
      delete resource[propName]
      doDelete = true
    }
    else {
      resource[propName] = value[ROOT_HASH] ?  utils.buildRef(value) : value


      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[propName] = resource[propName]

      let data = this.refs.form.refs.input.state.value;
      if (data) {
        for (let p in data)
          if (!resource[p])
            resource[p] = data[p];
      }
    }
    let state = {
      resource: resource,
      prop: propName
    }
    if (!doDelete) {
      if (this.state.missedRequiredOrErrorValue)
        delete this.state.missedRequiredOrErrorValue[propName]
      if (setItemCount)
        state.itemsCount = resource[propName].length

      if (value.photos)
        state[propName + '_photo'] = value.photos[0]
      else if (model  && model.properties[propName].ref === PHOTO)
        state[propName + '_photo'] = value
    }
    state.inFocus = propName

    let r = _.cloneDeep(this.state.resource)
    for (let p in this.floatingProps)
      r[p] = this.floatingProps[p]

    this.setState(state);
    if (!search) {
      if (utils.isForm(model))
        Actions.getRequestedProperties({resource, currentResource: resource})//currentR})
      if (!utils.isImplementing(r, INTERSECTION))
        Actions.saveTemporary(resource)
    }
  },

  setArrayOrMultichooser(prop, value, resource) {
    let propName = prop.name
    let isArray = prop.type === 'array'
    let setItemCount
    let isEnum  = isArray ? utils.isEnum(prop.items.ref) : utils.isEnum(prop.ref)
    if (!prop.inlined  &&  prop.items  &&  prop.items.ref  &&  !isEnum) {
      if (!Array.isArray(value)) {
        if (isArray) {
          if (!resource[propName])
            value = [value]
          else {
            let valueId = utils.getId(value)
            let hasValue = resource[propName].some(r => utils.getId(r) === valueId)
            if (hasValue)
              value = resource[propName]
            else {
              let arr = _.cloneDeep(resource[propName]) || []
              arr.push(value)
              value = arr
            }
          }
        }
        else
          value = [value]
      }

      let v = value.map((vv) => {
        let val = utils.buildRef(vv)
        if (vv.photos)
          val.photo = vv.photos[0].url
        return val
      })
      if (!resource[propName]) {
        resource[propName] = []
        resource[propName] = v
      }
      else {
        let arr = resource[propName].filter((r) => {
          return r.id === v.id
        })
        if (!arr.length)
          resource[propName] = v
      }

      return { setItemCount: true }
    }
    let val
    if (prop.items) {
      if (prop.items.ref  &&  isEnum)
        val = value.map((v) => utils.buildRef(v))
      else
        val = value
    }
    else if (isEnum) {
      if (value.length)
        val = value.map((v) => utils.buildRef(v))
    }
    else
      val = value
    if (value.length) {
      resource[propName] =  val
      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[propName] = resource[propName]
    }
    else if (prop.items.ref) {
      resource[propName] = null
    }
    else {
      delete resource[propName]
      if (this.floatingProps)
        delete this.floatingProps[propName]
    }
    return {}
  },
  // MONEY value and curency template
  myMoneyInputTemplate(params) {
    let { label, required, model, value, prop, editable, errors, component } = params
    let { search } = this.props
    if (!search  &&  required)
      label += ' *'
    let currency = this.props.currency
    let CURRENCY_SYMBOL = currency && currency.symbol ||  DEFAULT_CURRENCY_SYMBOL
    label += (prop.ref  &&  prop.ref === MONEY)
           ?  ' (' + CURRENCY_SYMBOL + ')'
           : ''
    return (
      <View>
      <View style={styles.moneyInput}>
          {
             this.myTextInputTemplate({
                    label: label,
                    prop:  prop,
                    value: value.value ? value.value + '' : '',
                    required: required,
                    model: model,
                    noError: true,
                    // errors: errors,
                    editable,
                    component,
                    keyboard: search ? null : 'numeric',
                  })
          }
          {
             this.myEnumTemplate({
                    prop:     prop,
                    enumProp: utils.getModel(MONEY).properties.currency,
                    required: required,
                    value:    utils.normalizeCurrencySymbol(value.currency),
                    // errors:   errors,
                    component,
                    // noError:  errors && errors[prop],
                    noError: true
                  })
        }
      </View>
      {this.paintError({prop, errors})}
      {this.paintHelp(prop)}
      </View>
    );
  },

  myEnumTemplate(params) {
    let { prop, enumProp, errors } = params
    let error
    if (!params.noError) {
      let err = this.state.missedRequiredOrErrorValue
              ? this.state.missedRequiredOrErrorValue[prop.name]
              : null
      if (!err  &&  errors  &&  errors[prop.name])
        err = errors[prop.name]
      error = err
                ? <View style={styles.enumErrorLabel} />
                : <View />
    }
    else
      error = <View/>
    let value = prop ? params.value : this.state.resource[enumProp.name]
    let bankStyle = this.props.bankStyle
    let linkColor = (bankStyle && bankStyle.linkColor) || DEFAULT_LINK_COLOR
    // let help = this.paintHelp(prop, true)
    return (
      <View style={[styles.chooserContainer, styles.enumElement]} key={this.getNextKey()} ref={enumProp.name}>
        <TouchableOpacity onPress={this.enumChooser.bind(this, prop, enumProp)}>
          <View>
            <View style={styles.chooserContentStyle}>
              <Text style={styles.enumText}>{value}</Text>
              <Icon name='ios-arrow-down'  size={15}  color={linkColor}  style={[styles.arrowIcon, styles.enumProp]} />
            </View>
           {error}
          </View>
        </TouchableOpacity>
      </View>
    );
  },
  enumChooser(prop, enumProp, event) {
    let resource = this.state.resource;
    let model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[TYPE] = model.id;
    }

    let currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: enumProp.title,
      // titleTextColor: '#7AAAC3',
      componentName: 'EnumList',
      backButtonTitle: 'Back',
      passProps: {
        prop:        prop,
        bankStyle:   this.props.bankStyle,
        enumProp:    enumProp,
        resource:    resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenEnumValue.bind(this),
      }
    });
  },
  setChosenEnumValue(propName, enumPropName, value) {
    let resource = _.cloneDeep(this.state.resource)
    // clause for the items properies - need to redesign
    // resource[propName][enumPropName] = value
    if (resource[propName]) {
      if (typeof resource[propName] === 'object')
        resource[propName][enumPropName] = value[Object.keys(value)[0]]
      else {
        resource[propName] = {
          value: resource[propName],
          [enumPropName]: value[Object.keys(value)[0]]
        }
      }
    }
    // if no value set only currency
    else {
      resource[propName] = {}
      resource[propName][enumPropName] = value[Object.keys(value)[0]]
      if (!this.floatingProps)
        this.floatingProps = {}
      if (!this.floatingProps[propName])
        this.floatingProps[propName] = {}
      this.floatingProps[propName][enumPropName] = value[Object.keys(value)[0]]
    }

    let data = this.refs.form.refs.input.state.value;
    if (data) {
      for (let p in data)
        if (!resource[p])
          resource[p] = data[p];
    }

    this.setState({
      resource: resource,
      prop: propName
    });
  },
  validateProperties(value) {
    let m = value[TYPE]
                   ? utils.getModel(value[TYPE])
                   : this.props.model
    let properties = m.properties
    let err = []
    let deleteProps = []
    for (let p in value) {
      let prop = properties[p]
      if (!prop) // properties like _t, _r, time
        continue
      if (typeof value[p] === 'undefined'  ||  value[p] === null) {
        deleteProps.push(p)
        continue
      }
      if (prop.type === 'number') {
        coerceNumber(value, p)
        this.checkNumber(value[p], prop, err)
      }
      else if (prop.ref === MONEY) {
        coerceNumber(value[p], 'value')
        let error = this.checkNumber(value[p].value, prop, err)
        if (error  &&  m.required.indexOf(p) === -1)
          deleteProps.push(p)
        else if (!value[p].currency  &&  this.props.currency)
          value[p].currency = this.props.currency
      }
      else if (prop.units && prop.units === '[min - max]') {
        let v = value[p].split('-').map(coerceNumber)
        if (v.length === 1)
          this.checkNumber(v[0], prop, err)
        else if (v.length === 2) {
          this.checkNumber(v[0], prop, err)
          if (err[p])
            continue
          this.checkNumber(v[1], prop, err)
          if (!err[p])
            continue
          if (v[1] < v[0])
            err[p] = translate('theMinValueBiggerThenMaxValue') //'The min value for the range should be smaller then the max value'
        }
        else
          err[p] = translate('thePropertyWithMinMaxRangeError') // The property with [min-max] range can have only two numbers'
      }
      // 'pattern' can be regex pattern or property where the pattern is defined.
      // It is for country specific patterns like 'phone number'

      else if (prop.pattern) {
        if (!value[p])
          deleteProps.push(p)
        if (!(new RegExp(prop.pattern).test(value[p])))
          err[prop.name] = translate('invalidProperty', prop.title)
      }
    }
    if (deleteProps)
      deleteProps.forEach((p) => {
        delete value[p]
        delete err[p]
      })
    return err
  },
  checkNumber(v, prop, err) {
    let p = prop.name
    let error
    if (typeof v !== 'number') {
      if (prop.ref === MONEY)
        v = v.value
    }
    if (isNaN(v))
      error = 'Please enter a valid number'
    else {
      if (prop.max && v > prop.max)
        error = 'The maximum value for is ' + prop.max
      else if (prop.min && v < prop.min)
        error = 'The minimum value for is ' + prop.min
    }
    if (error)
      err[p] = error
    return error
  },
}
function coerceNumber (obj, p) {
  const val = obj[p]
  if (typeof val === 'string') {
    obj[p] = Number(val.trim())
  }
}
const formField = {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#dddddd',
  borderRadius: 6,
}
var styles= StyleSheet.create({
  enumProp: {
    marginTop: 15,
  },
  enumText: {
    marginTop: 10,
    marginLeft: 20,
    color: '#757575',
    fontSize: 20
  },
  labelStyle: {
    paddingLeft: 10,
  },
  arrowIcon: {
    width: 15,
    height: 15,
    // marginVertical: 2
  },
  formInput: {
    ...formField,
  },
  booleanContainer: {
    ...formField,
    minHeight: 60,
    paddingTop: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    flex: 1
  },
  booleanContentStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  datePicker: {
    justifyContent: 'flex-start',
    alignSelf: 'stretch'
  },
  chooserContainer: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    position: 'relative',
    flex: 1
  },
  chooserContentStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 4
  },
  enumElement: {
    width: 40,
    marginTop: 20,
    height: 45
  },
  enumErrorLabel: {
    paddingLeft: 5,
    height: 14,
    backgroundColor: 'transparent'
  },
  regInput: {
    borderWidth: 0,
    height: 50,
    fontSize: 20,
    color: '#eeeeee'
  },
  textInput: {
    borderWidth: 0,
    color: '#555555',
    fontSize: 20
  },
  thumb: {
    width: 40,
    height: 40,
    marginRight: 2,
    marginTop: 12,
    borderRadius: 5
  },
  err: {
    // paddingLeft: 10,
    // backgroundColor: 'transparent'
  },
  element: {
    position: 'relative'
  },
  labelClean: {
    marginTop: 21,
    color: '#AAA',
    position: 'absolute',
    fontSize: 20,
    top: 7
  },
  labelDirty: {
    marginTop: 21,
    // marginLeft: 10,
    paddingLeft: 10,
    color: '#AAA',
    position: 'absolute',
    fontSize: 12,
    top: -17,
  },
  photoIcon: {
    position: 'absolute',
    right: 10,
    bottom: 10
  },
  photoIconEmpty: {
    position: 'absolute',
    right: 10,
    marginTop: utils.isWeb() ? 20 : 12
  },
  readOnly: {
    position: 'absolute',
    right: 10,
    top: 20
  },
  immutable: {
    marginTop: 15
  },
  input: {
    backgroundColor: 'transparent',
    color: '#aaaaaa',
    fontSize: 20,
  },
  textAfterImage: {
    backgroundColor: 'transparent',
    color: '#aaaaaa',
    fontSize: 20,
    marginTop: 17,
    marginLeft: 7
  },
  customIcon: {
    position: 'absolute',
    right: 10,
    alignSelf: 'center'
  },
  dateInput: {
    flex: 1,
    height: 35,
    paddingBottom: 5,
    borderColor: 'transparent',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 20,
    color: '#555555',
    backgroundColor: 'transparent',
  },
  font20: {
    fontSize: 20,
  },
  dateIcon: {
    // position: 'absolute',
    // right: 0,
    // top: 5
  },
  divider: {
    borderColor: 'transparent',
    borderWidth: 1.5,
    marginTop: 10,
    paddingHorizontal: 10,
    marginBottom: 5
  },
  dividerText: {
    // marginTop: 15,
    marginBottom: 5,
    fontSize: 26,
    color: '#ffffff'
  },
  font14: {
    fontSize: 14
  },
  booleanLabel: {
    color: '#aaaaaa',
    fontSize: 20
  },
  booleanText: {
    fontSize: 20
  },
  dateLabel: {
    marginLeft: 10,
    fontSize: 12,
    marginTop: 5,
    paddingBottom: 5
  },
  noItemsText: {
    fontSize: 20,
    color: '#AAAAAA',
  },
  markdown: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 10,
  },
  container: {
    flex: 1
  },
  help1: {
    backgroundColor: utils.isAndroid() ? '#eeeeee' : '#efefef',
    paddingHorizontal: 10,
  },
  help: {
    backgroundColor: '#f3f3f3',
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 15
  },
  bottom10: {
    paddingBottom: 10
  },
  floatingLabel: {
    marginTop: 20,
    marginHorizontal: -10
  },
  moneyInput: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

module.exports = NewResourceMixin
