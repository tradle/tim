 'use strict';

var React = require('react');
var ReactDOM = require('react-dom')
var dateformat = require('dateformat')
var ResourceList = require('./ResourceList')
var EnumList = require('./EnumList')
var FloatLabel = require('react-native-floating-labels')
var Icon = require('react-native-vector-icons/Ionicons')
var utils = require('../utils/utils');
var CameraView = require('./CameraView')
var translate = utils.translate
var moment = require('moment')
var StyleSheet = require('../StyleSheet')
// var QRCodeScanner = require('./QRCodeScanner')
// var driverLicenseParser = require('../utils/driverLicenseParser')
const debug = require('debug')('tradle:app:blinkid')
var focusUri = require('../video/Focus1.mp4')

import VideoPlayer from './VideoPlayer'
// import omit from 'object.omit'
// import pick from 'object.pick'
import ENV from '../utils/env'
import DatePicker from 'react-native-datepicker'
import ImageInput from './ImageInput'
import Analytics from '../utils/analytics'

import BlinkID from './BlinkID'
// import INSTRUCTIONS_IMAGE from '../img/scan-passport.jpg'
// import { parse as parseUSDL } from 'parse-usdl'

// import Anyline from './Anyline'

var constants = require('@tradle/constants');
var t = require('tcomb-form-native');
var Actions = require('../Actions/Actions');
var extend = require('extend');
const DEFAULT_CURRENCY_SYMBOL = '£';
var CURRENCY_SYMBOL
const ENUM = 'tradle.Enum'
const SETTINGS = 'tradle.Settings'
const COUNTRY = 'tradle.Country'
const YEAR = 3600 * 1000 * 24 * 365
const DAY  = 3600 * 1000 * 24
const HOUR = 3600 * 1000
const MINUTE = 60 * 1000
const FOCUSED_LABEL_COLOR = '#7AAAC3'// #139459'
const TIMEOUT_ERROR = new Error('timed out')

var cnt = 0;
var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};
import {
  Text,
  View,
  TouchableHighlight,
  Platform,
  Image,
  Alert,
  // StyleSheet,
  Navigator,
  Switch,
  DatePickerAndroid,
} from 'react-native';

var LINK_COLOR, DEFAULT_LINK_COLOR = '#a94442'
// import transform from 'tcomb-json-schema'
var component
var DEFAULT_BLINK_ID_OPTS = {
  mrtd: { showFullDocument: true },
  eudl: { showFullDocument: true },
  usdl: {}
}

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
    CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol ||  this.props.currency : DEFAULT_CURRENCY_SYMBOL
    component = params.component

    if (this.props.bankStyle)
      LINK_COLOR = this.props.bankStyle.LINK_COLOR || DEFAULT_LINK_COLOR
    else
      LINK_COLOR = DEFAULT_LINK_COLOR

    var meta = this.props.model  ||  this.props.metadata;
    var model = params.model;  // For the form
    var isMessage = utils.isMessage(meta)
    var onSubmitEditing = this.onSavePressed // isMessage ? params.onSubmitEditing : this.onSavePressed
    var onEndEditing = this.onEndEditing  ||  params.onEndEditing
    var chooser = this.chooser  ||  this.props.chooser
    var models = utils.getModels();
    var data = params.data;
    var options = {};
    options.fields = {};

    var props, bl;
    if (!meta.items)
      props = meta.properties;
    else {
      bl = meta.items.backlink;
      if (!meta.items.ref)
        props = meta.items.properties;
      else
        props = utils.getModel(meta.items.ref).value.properties;
    }

    var dModel = data  &&  models[data[constants.TYPE]]
    if (!utils.isEmpty(data)) {
      if (!meta.items && data[constants.TYPE] !== meta.id) {
        var interfaces = meta.interfaces;
        if (!interfaces  ||  interfaces.indexOf(data[constants.TYPE]) == -1)
           return;

        data[constants.TYPE] = meta.id;
        for (let p in data) {
          if (p == constants.TYPE)
            continue;
          if (props[p])
            continue;
        }
      }
    }

    var editCols;
    if (this.props.editCols) {
      editCols = {};
      this.props.editCols.forEach(function(r) {
        editCols[r] = props[r];
      })
    }
    else if (meta.editCols) {
      utils.arrayToObject(meta.editCols);
      editCols = {}
      meta.editCols.forEach((p) => {
        let idx = p.indexOf('_group')
        if (idx === -1  ||  !props[p].list || props[p].title.toLowerCase() !== p)
          editCols[p] = props[p]

        if (idx !== -1  &&  props[p].list)
          props[p].list.forEach((p) => editCols[p] = props[p])
      })
    }

    var eCols
    if (editCols)
      eCols = editCols
    else if (!meta.viewCols)
      eCols = props
    else {
      eCols = {}
      meta.viewCols.forEach((p) => {
        let idx = p.indexOf('_group')
        if (idx === -1  ||  !props[p].list || props[p].title.toLowerCase() !== p)
          eCols[p] = props[p]

        if (idx !== -1  &&  props[p].list)
          props[p].list.forEach((p) => eCols[p] = props[p])
        // eCols[p] = props[p]
      })
      for (let p in props) {
        if (!eCols[p]  &&  !props[p].readOnly  &&  !props[p].hidden)
          eCols[p] = props[p]
      }
    }

    var required = utils.arrayToObject(meta.required);
    // var d = data ? data[i] : null;
    let resource = this.state.resource
    for (var p in eCols) {
      if (p === constants.TYPE  ||  p === bl  ||  (props[p].items  &&  props[p].items.backlink))
        continue;

      if (meta  &&  meta.hidden  &&  meta.hidden.indexOf(p) !== -1)
        continue

      var maybe = required  &&  !required.hasOwnProperty(p);

      var type = props[p].type;
      var formType = propTypesMap[type];
      // Don't show readOnly property in edit mode if not set
      let isReadOnly = props[p].readOnly
      if (isReadOnly) //  &&  (type === 'date'  ||  !data  ||  !data[p]))
        continue;
      if (utils.isHidden(p, resource)) {
        if (!resource[p])
          this.setDefaultValue(p, resource, true)
        continue
      }

      var label = translate(props[p], meta) //props[p].title;
      if (!label)
        label = utils.makeLabel(p);
      let errMessage = (this.props.errs  &&  this.props.errs[p])
                     ? this.props.errs[p]
                     : translate('thisFieldIsRequired')
      options.fields[p] = {
        error: errMessage, //'This field is required',
        bufferDelay: 20, // to eliminate missed keystrokes
      }
      var isRange
      if (props[p].units) {
        if (props[p].units.charAt(0) === '[') {
          options.fields[p].placeholder = label  + ' ' + props[p].units
          // isRange = type === 'number'  &&  props[p].units == '[min - max]'
          // if (isRange) {
          //   formType = t.Str
          //   var Range = t.refinement(t.Str, function (n) {
          //     var s = s.split(' - ')
          //     if (s.length < 2  ||  s > 3)
          //       return false

          //     if (!s[0].match(/\d{1,2}[\,.]{1}\d{1,2}/)  ||  !s[1].match(/\d{1,2}[\,.]{1}\d{1,2}/))
          //       return false
          //     return true
          //   });
          //   model[p] = maybe ? t.maybe(Range) : Range;

          // }
        }
        else
          options.fields[p].placeholder = label + ' (' + props[p].units + ')'
      }
      // HACK for registration screen
      // if (this.state.isRegistration  &&  params.editCols.length === 1)
      //   options.fields[p].placeholder = translate('enterYourName')

      if (props[p].description)
        options.fields[p].help = props[p].description;
      if (props[p].readOnly  ||  (props[p].immutable  &&  data  &&  data[p]))
        options.fields[p] = {'editable':  false };
      // if (formType  &&   (formType === t.Num  ||  formType === t.Str))
      //   formType = null

      if (formType) {
        if (props[p].keyboard)
          options.fields[p].keyboardType = props[p].keyboard

        // if (this.onChange)
        //   options.fields[p].onChange = this.onChange.bind(this);
        model[p] = !model[p]  &&  (maybe ? t.maybe(formType) : formType);
        if (data  &&  (type == 'date')) {
          model[p] = t.Str
          options.fields[p].template = this.myDateTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    errors: params.errors,
                    value: data[p] ? new Date(data[p]) : data[p]
                  })
          // if (!this.state.modal || typeof this.state.modal[p] === 'undefined')
          //   this.state.modal[p] = false

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
                    errors: params.errors
                  })

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this);
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          if (props[p].maxLength)
            options.fields[p].maxLength = props[p].maxLength;
          if (type === 'number') {
            if (!props[p].keyboard)
              options.fields[p].keyboardType = 'numeric'
            if (data  &&  data[p]  &&  (typeof data[p] != 'number'))
              data[p] = parseFloat(data[p])
          }

        }
        else if (type === 'string') {
          if (props[p].maxLength > 100)
            options.fields[p].multiline = true;
          options.fields[p].autoCorrect = false;
          if (props[p].oneOf) {
            model[p] = t.enums(props[p].oneOf);
            options.fields[p].auto = 'labels';
          }
        }
        if (type === 'string'  &&  p.length > 7  &&  p.indexOf('_group') === p.length - 6) {
          options.fields[p].template = this.myTextTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                  })
        }
        else if (!options.fields[p].multiline && (type === 'string'  ||  type === 'number')) {
          options.fields[p].template = this.myTextInputTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    model: meta,
                    value: data  &&  data[p] ? data[p] + '' : null,
                    required: !maybe,
                    onSubmitEditing: onSubmitEditing.bind(this),
                    errors: params.errors,
                    keyboard: props[p].keyboard ||  (type === 'number' ? 'numeric' : 'default'),
                  })

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this);
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          if (props[p].maxLength)
            options.fields[p].maxLength = props[p].maxLength;
          if (type === 'number') {
            if (!props[p].keyboard)
              options.fields[p].keyboardType = 'numeric'
            if (data  &&  data[p]  &&  (typeof data[p] != 'number'))
              data[p] = parseFloat(data[p])
          }
        }
      }
      // else if (type === 'enum') {
      //   model[p] = t.Str;
      //   this.myEnumTemplate({
      //         prop:     props[p],
      //         enumProp: props[p],
      //         required: params.required,
      //         value:    data[p],
      //         errors:   params.errors,
      //         // noError:  params.errors && params.errors[params.prop],
      //         noError: true
      //       })
      //   options.fields[p].onSubmitEditing = onSubmitEditing.bind(this)
      //   options.fields[p].onEndEditing = onEndEditing.bind(this, p);
      // }
      else {
        var ref = props[p].ref;
        if (!ref) {
          if (type === 'number'  ||  type === 'string')
            ref = constants.TYPES.MONEY
          else
            continue;
        }
        if (ref === constants.TYPES.MONEY) {
          model[p] = maybe ? t.maybe(t.Num) : t.Num;
          // if (data[p]  &&  (typeof data[p] != 'number'))
          //   data[p] = data[p].value
          var units = props[p].units
          // options.fields[p].onFocus = chooser.bind(this, props[p], p)
          var value = data[p]
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
                    required: !maybe,
                    errors: params.errors,
                  })


          // options.fields[p].template = textTemplate.bind(this, {
          //           label: label,
          //           prop:  props[p],
          //           value: data[p] ? data[p] + '' : null,
          //           keyboard: units  &&  units.charAt(0) === '[' ? 'numbers-and-punctuation' : 'numeric',
          //           required: !maybe,
          //         })

          // options.fields[p].template = moneyTemplate.bind({}, props[p])

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this)
          options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          continue;
        }
        model[p] = maybe ? t.maybe(t.Str) : t.Str;

        var subModel = models[ref];
        if (data  &&  data[p]) {
          options.fields[p].value = data[p][constants.TYPE]
                                  ? utils.getId(data[p])
                                  : data[p].id;
          data[p] = utils.getDisplayName(data[p], subModel.value.properties) || data[p].title;
        }

        options.fields[p].onFocus = chooser.bind(this, props[p], p)
        options.fields[p].template = this.myCustomTemplate.bind(this, {
            label: label,
            prop:  p,
            required: !maybe,
            errors: params.errors,
            chooser: options.fields[p].onFocus,
          })

        options.fields[p].nullOption = {value: '', label: 'Choose your ' + utils.makeLabel(p)};
      }
    }
    /* Setting default server url on registration
    if (this.state.isRegistration) {
      model.url = t.maybe(t.Str)
      var label = 'Server url'
      options.fields.url = {
        error: 'This field is required',
        bufferDelay: 20, // to eliminate missed keystrokes
        autoCorrect: false
      }
      if (onSubmitEditing)
        options.fields.url.onSubmitEditing = onSubmitEditing.bind(this);
      if (onEndEditing)
        options.fields.url.onEndEditing = onEndEditing.bind(this, 'url')
      options.fields.url.template = textTemplate.bind(this, {
                label: label,
                prop:  utils.getModel(SETTINGS).value.properties.url,
                value: this.state.resource.url,
                required: false,
                keyboard: 'url'
              })
    }
    */
    // var order = []
    // for (var p in model)
    //   order.push(p)

    // HACK for video
    if (eCols.video) {
      var maybe = required  &&  !required.hasOwnProperty('video');

      model.video = maybe ? t.maybe(t.Str) : t.Str;

      options.fields.video.template = this.myCustomTemplate.bind(this, {
          label: translate(props.video, meta),
          prop:  'video',
          errors: params.errors,
          required: !maybe
        })
    }

    return options;
  },
  getNextKey() {
    return (this.props.model  ||  this.props.metadata).id + '_' + cnt++
  },
  onChangeText(prop, value) {
    var r = {}
    extend(true, r, this.state.resource)
    // delay coercing string->number until submit
    // otherwise text field acts funny (inserting/preventing 0, mishandling decimal points)
    //
    // if (prop.type === 'number') {
    //   let val = Number(value)
    //   if (value.charAt(value.length - 1) === '.')
    //     value = val + .00
    //   else
    //     value = val
    // }
    if (!this.floatingProps)
      this.floatingProps = {}
    if (prop.ref == constants.TYPES.MONEY) {
      if (!this.floatingProps[prop.name])
        this.floatingProps[prop.name] = {}
      this.floatingProps[prop.name].value = value
      if (!r[prop.name])
        r[prop.name] = {}
      r[prop.name].value = value
    }
    else {
      r[prop.name] = value
      this.floatingProps[prop.name] = value
    }
    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[prop.name]
    this.setState({resource: r})
    if (r[constants.TYPE] !== SETTINGS)
      Actions.saveTemporary(r)
  },
  onChangeTextValue(prop, value, event) {
    console.log(arguments)
    this.state.resource[prop.name] = value
    // this.setState({resource: this.state.resource})
    if (!this.floatingProps)
      this.floatingProps = {}
    this.floatingProps[prop.name] = value;
    // prop.type === 'object' && prop.ref === constants.TYPES.MONEY
    //                                     ? {value: value}
    //                                     : value
    var r = {}
    extend(r, this.state.resource)
    for (var p in this.floatingProps)
      r[p] = this.floatingProps[p]
    Actions.saveTemporary(r)
  },

  async showBlinkIDScanner(prop) {
    const { documentType, country } = this.state.resource
    let blinkIDOpts = {
      quality: 0.2,
      base64: true,
      timeout: ENV.blinkIDScanTimeoutInternal
    }

    const type = getDocumentTypeFromTitle(documentType.title)
    switch (type) {
    case 'passport':
      blinkIDOpts.tooltip = translate('centerPassport')
      // machine readable travel documents (passport)
      blinkIDOpts.mrtd = DEFAULT_BLINK_ID_OPTS.mrtd
      break
    case 'license':
      blinkIDOpts.tooltip = translate('centerLicence')
      if (country.title === 'United States') {
        blinkIDOpts.usdl = DEFAULT_BLINK_ID_OPTS.usdl
      } else {
        blinkIDOpts.eudl = DEFAULT_BLINK_ID_OPTS.eudl
      }

      break
    default:
      blinkIDOpts = {
        ...DEFAULT_BLINK_ID_OPTS,
        ...blinkIDOpts,
        tooltip: translate('centerID')
      }
    }

    const promiseTimeout = new Promise((resolve, reject) => {
      setTimeout(() => reject(TIMEOUT_ERROR), ENV.blinkIDScanTimeoutExternal)
    })

    Analytics.sendEvent({
      category: 'widget',
      action: 'scan_document',
      label: `blinkid:${type}`
    })

    let result
    try {
      result = await Promise.race([
        BlinkID.scan(blinkIDOpts),
        promiseTimeout
      ])
    } catch (err) {
      debug('scan failed:', err.message)
      const canceled = /canceled/i.test(err.message)
      const timedOut = !canceled && /time/i.test(err.message)
      if (!canceled && typeof BlinkID.dismiss === 'function') {
        // cancel programmatically
        await BlinkID.dismiss()
      }

      // give the BlinkID view time to disappear
      // 800ms is a bit long, but if BlinkID view is still up, Alert will just not show
      await utils.promiseDelay(800)
      debug('BlinkID scan failed', err.stack)

      // if (canceled || timedOut) {
      //   return Alert.alert(
      //     translate('documentNotScanning', documentType.title),
      //     translate('retryScanning', documentType.title.toLowerCase())
      //   )
      // }

      if (canceled) return

      return Alert.alert(
        translate('documentNotScanning'),
        translate('retryScanning', documentType.title)
      )
    }

    // const tradleObj = utils.fromMicroBlink(result)
    const r = {}
    extend(true, r, this.state.resource)

    r[prop] = {
      url: result.image.base64,
      width: result.image.width,
      height: result.image.height
    }

    let dateOfExpiry
    ;['mrtd', 'usdl', 'eudl'].some(docType => {
      const scan = result[docType]
      if (!scan) return

      const { personal, document } = scan
      if (personal.dateOfBirth) {
        personal.dateOfBirth = formatDate(personal.dateOfBirth)
      }

      if (document.dateOfExpiry) {
        dateOfExpiry = document.dateOfExpiry
        document.dateOfExpiry = formatDate(document.dateOfExpiry)
      }

      if (document.dateOfIssue) {
        document.dateOfIssue = formatDate(document.dateOfIssue)
      }

      r[prop + 'Json'] = scan
      return
    })

    if (dateOfExpiry && dateOfExpiry < Date.now()) {
      // give the BlinkID view time to disappear
      // 800ms is a bit long, but if BlinkID view is still up, Alert will just not show
      await utils.promiseDelay(800)
      Alert.alert(
        translate('documentExpiredTitle'),
        translate('documentExpiredMessage')
      )

      return
    }

    this.afterScan(r, prop)
  },

  afterScan(resource, prop) {
    if (!this.floatingProps) this.floatingProps = {}
    this.floatingProps[prop] = resource[prop]
    this.floatingProps[prop + 'Json'] = resource[prop + 'Json']
    this.setState({ resource })
  },
  showVideo(params) {
    let onEnd = (err) => {
      Alert.alert(
        'Ready to scan?',
        null,
        [
          {
            text: 'OK',
            onPress: () => {
              this.props.navigator.pop()
              this.showCamera(params)
            }
          }
        ]
      )
    }

    this.props.navigator.push({
      id: 18,
      component: VideoPlayer,
      passProps: {
        source: focusUri,
        onEnd: onEnd,
        onError: onEnd,
        muted: true,
        navigator: this.props.navigator
      },
    })
  },

  showCamera(params) {
    // if (utils.isAndroid()) {
    //   return Alert.alert(
    //     translate('oops') + '!',
    //     translate('noScanningOnAndroid')
    //   )
    // }

    if (params.prop === 'scan')  {
      if (utils.isWeb()) return Alert.alert('Oops!', 'Scanning in the browser is not supported yet')

      if (this.state.resource.documentType  &&  this.state.resource.country) {
        this.showBlinkIDScanner(params.prop)
      }
      else
        Alert.alert('Please choose country and document type first')
      return
    }

    this.props.navigator.push({
      title: 'Take a pic',
      backButtonTitle: 'Back',
      id: 12,
      component: CameraView,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        onTakePic: this.onTakePic.bind(this, params.prop)
      }
    });
  },

  onTakePic(prop, data) {
    if (!data)
      return
    utils.onTakePic(prop, data, this.props.originatingMessage)
    this.props.navigator.pop()
  },

  myTextTemplate(params) {
    var label = translate(params.prop, params.model)

    return (
      <View style={[styles.divider, {borderBottomColor: LINK_COLOR}]}>
        <Text style={[styles.dividerText, {color: LINK_COLOR}]}>{label}</Text>
      </View>
    );
  },

  myTextInputTemplate(params) {
    var label = translate(params.prop, params.model)
    if (params.prop.units) {
      label += (params.prop.units.charAt(0) === '[')
             ? ' ' + params.prop.units
             : ' (' + params.prop.units + ')'
    }
    else
      label += params.required ? '' : ' (' + translate('optional') + ')'
    let lStyle = styles.labelStyle

    if (params.prop.ref  &&  params.prop.ref === constants.TYPES.MONEY  &&  !params.required) {
      let maxChars = (utils.dimensions(component).width - 60)/utils.getFontSize(9)
      // let some space for wrapping
      if (maxChars < label.length  &&  (!this.state.resource[params.prop.name] || !this.state.resource[params.prop.name].length))
        lStyle = [lStyle, {marginTop: 0}]
    }
    let lcolor = this.getLabelAndBorderColor(params.prop.name)
    if (this.state.isRegistration)
      lStyle = [lStyle, {color: lcolor}]

    // avoid <input type="number"> on web
    // it good-naturedly interferes with validation
    const keyboard = utils.isWeb() || !params.keyboard ? 'default': params.keyboard
    let multiline = params.prop.maxLength > 100
    return (
      <View style={{flex: 5, paddingBottom: this.hasError(params.errors, params.prop.name) ? 10 : Platform.OS === 'ios' ? 10 : 7}}>
        <FloatLabel
          labelStyle={[lStyle, {color: lcolor}]}
          autoCorrect={false}
          multiline={multiline}
          autoCapitalize={this.state.isRegistration  ||  (params.prop.name !== 'url' &&  (!params.prop.keyboard || params.prop.keyboard !== 'email-address')) ? 'sentences' : 'none'}
          onFocus={this.inputFocused.bind(this, params.prop.name)}
          inputStyle={this.state.isRegistration ? styles.regInput : styles.textInput}
          style={[styles.formInput, {borderBottomColor: lcolor}]}
          value={params.value}
          onKeyPress={this.onKeyPress.bind(this, params.onSubmitEditing)}
          onChangeText={this.onChangeText.bind(this, params.prop)}
          underlineColorAndroid='transparent'
        >{label}</FloatLabel>
          {this.getErrorView(params)}
      </View>
    );
  },
  onKeyPress(onSubmit, key) {
    if (key.nativeEvent.code === 'Enter')
      onSubmit()
  },

  getErrorView(params) {
    var error
    if (params.noError)
      error = <View />
    else {
      var err = this.state.missedRequiredOrErrorValue
              ? this.state.missedRequiredOrErrorValue[params.prop.name]
              : null
      if (!err  &&  params.errors  &&  params.errors[params.prop.name])
        err = params.errors[params.prop.name]

      error = err
                ? <View style={[styles.err, typeof params.paddingLeft !== 'undefined' ? {paddingLeft: params.paddingLeft} : {paddingLeft: 10}]} key={this.getNextKey()}>
                    <Text style={styles.font14, {color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>{err}</Text>
                  </View>
                : <View key={this.getNextKey()} />
    }
    return error
  },

  myBooleanTemplate(params) {
    var labelStyle = styles.booleanLabel
    var textStyle =  [styles.booleanText, {color: this.state.isRegistration ? '#ffffff' : '#757575'}]

    let prop = params.prop
    let resource = this.state.resource

    let style = (resource && (typeof resource[params.prop.name] !== 'undefined'))
              ? textStyle
              : labelStyle
    // if (Platform.OS === 'ios')
    //   style = [style, {paddingLeft: 10}]

    var label = translate(params.prop, params.model)
    if (params.prop.units) {
      label += (params.prop.units.charAt(0) === '[')
             ? ' ' + params.prop.units
             : ' (' + params.prop.units + ')'
    }
    label += params.required ? '' : ' (' + translate('optional') + ')'

    var value = params.value
    var doWrap = label.length > 30
    if (doWrap  &&  utils.isAndroid()) {
      label = label.substring(0, 27) + '...'
      doWrap = false
    }

// , Platform.OS === 'ios' ? {paddingLeft: 0} : {paddingLeft: 10}
    return (
      <View style={{paddingBottom: 10, flex: 5}} key={this.getNextKey()} ref={prop.name}>
        <TouchableHighlight underlayColor='transparent' onPress={
          this.onChangeText.bind(this, prop, !value)
        }>
          <View style={styles.booleanContainer}>
            <View style={styles.booleanContentStyle}>
              <Text style={[style, { width: (utils.getContentWidth() - 100)}]}>{label}</Text>
              <Switch onValueChange={value => this.onChangeText(prop, value)} value={value} onTintColor={LINK_COLOR} />
            </View>
          </View>
        </TouchableHighlight>
        {this.getErrorView(params)}
      </View>
    )
  },
  myDateTemplate(params) {
    var prop = params.prop
    let resource = this.state.resource
    let label, style, propLabel
    let hasValue = resource && resource[prop.name]

    let lcolor = this.getLabelAndBorderColor(prop.name)
    if (resource && resource[prop.name]) {
      label = resource[prop.name].title
      propLabel = <Text style={[styles.dateLabel, {color: lcolor}]}>{params.label}</Text>
    }
    else {
      label = params.label
      propLabel = <View style={{marginTop: 20, marginHorizontal: -10}}/>
    }

    let valuePadding = 0 //Platform.OS === 'ios' ? 0 : (hasValue ? 10 : 0)
    let format = 'MMMM Do, YYYY'
    // let format = 'YYYY-MM-DD'
    let valueMoment = params.value && moment.utc(new Date(params.value))
    let value = valueMoment && valueMoment.format(format)
    let dateProps = {}
    if (prop.maxDate  ||  prop.minDate) {
      let maxDate = this.getDateRange(prop.maxDate)
      let minDate = this.getDateRange(prop.minDate)
      if (minDate  &&  maxDate)
        dateProps = {maxDate: new Date(maxDate), minDate: new Date(minDate)}
      else
        dateProps = minDate ? {minDate: new Date(minDate)} : {maxDate: new Date(maxDate)}
    }
    if (prop.format)
      dateProps.format = prop.format

    if (!value)
      value = translate(params.prop)

    let st = utils.isWeb() ? { borderWidth: StyleSheet.hairlineWidth, borderColor: 'transparent', borderBottomColor: '#cccccc'} : {}

    // convert from UTC date to local, so DatePicker displays it correctly
    // e.g. 1999-04-13 UTC -> 1999-04-13 EDT
    let localizedDate
    if (valueMoment) {
      localizedDate = new Date(valueMoment.year(), valueMoment.month(), valueMoment.date())
    }

    return (
      <View>
        <View key={this.getNextKey()} ref={prop.name} style={[st, { marginHorizontal: 10, paddingBottom: this.hasError(params.errors, prop.name) || utils.isWeb() ?  0 : 10, height: 60, justifyContent: 'flex-end'}]}>
          {propLabel}
          <DatePicker
            style={[styles.datePicker, {width: utils.dimensions(component).width - 30, paddingBottom: 3}]}
            mode="date"
            placeholder={value}
            format={format}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            date={localizedDate}
            onDateChange={(date) => {
              if (!(date instanceof Date)) {
                date = moment.utc(date, format).toDate()
              }

              this.changeTime(params.prop, date)
            }}
            customStyles={{
              dateInput: styles.dateInput,
              dateText: styles.dateText,
              placeholderText: [styles.font20, {
                color: params.value ? '#555555' : '#aaaaaa',
                paddingLeft: 0
              }],
              dateIconColor: {color: LINK_COLOR},
              dateIcon: styles.dateIcon
            }}
            {...dateProps}
          />
        </View>
        {this.getErrorView(params)}
       </View>
      )
  },
  getLabelAndBorderColor(prop) {
    return this.state.isRegistration ? '#eeeeee' : this.state.inFocus === prop ? FOCUSED_LABEL_COLOR : '#b1b1b1'
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
    let number = parts[0]
    let measure = parts[1]
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
      // var newState = {};
      const {action, year, month, day} = await DatePickerAndroid.open(options);
      if (action !== DatePickerAndroid.dismissedAction) {
      //   newState[stateKey + 'Text'] = 'dismissed';
      // } else {
        var date = new Date(year, month, day);
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
    var r = {}
    extend(true, r, this.state.resource)
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

  // myDateTemplate (prop) {
  //   return (<NewDatePicker prop={prop}/>)
  // },

  inputFocused(refName) {
    if (/*!this.state.isRegistration   &&*/
         this.refs                   &&
         this.refs.scrollView        &&
         this.props.model            &&
         Object.keys(this.props.model.properties).length > 5) {
      utils.scrollComponentIntoView(this, this.refs.form.getComponent(refName))
      this.setState({inFocus: refName})
    }
    else if (this.state.inFocus !== refName)
      this.setState({inFocus: refName})
  },
  // scrollDown (){
  //   if (this.refs  &&  this.refs.scrollView) {
  //      this.refs.scrollView.scrollTo(Dimensions.get('window').height * 2/3);
  //   }
  // },

  myCustomTemplate(params) {
    var labelStyle = styles.labelClean
    var textStyle = styles.labelDirty
    var resource = /*this.props.resource ||*/ this.state.resource
    var label, style
    var propLabel
    var isItem = this.props.metadata != null
    var prop
    if (this.props.model)
      prop = this.props.model.properties[params.prop]
    else if (this.props.metadata.items.properties)
      prop = this.props.metadata.items.properties[params.prop]
    else
      prop = utils.getModel(this.props.metadata.items.ref).value.properties[params.prop]

    // let isRequired = this.props.model && this.props.model.required  &&  this.props.model.required.indexOf(params.prop) !== -1

    let lcolor = this.getLabelAndBorderColor(params.prop)

    let color = {color: lcolor}
    let isVideo = prop.name === 'video'
    let isPhoto = prop.name === 'photos'  ||  prop.ref === 'tradle.Photo'
    let noChooser
    if (this.props.model  &&  this.props.model.required  &&  prop.ref === COUNTRY  &&  this.props.model.required.indexOf(prop.name)) {
      // Don't overwrite default country on provider
      // if (this.props.country)
      //   noChooser = true
      if (resource  &&  !resource[prop.name])
        resource[prop.name] = this.props.country
    }
    else if (this.props.defaultPropertyValues)  {
      let defaults = this.props.defaultPropertyValues
      if (this.props.model) {
        let vals = defaults[this.props.model.id]
        for (let v in vals) {
          if (!resource[v])
            resource[v] = vals[v]
        }
      }
    }
    if (resource && resource[params.prop]) {
      if (isPhoto) {
        label = prop.title
        if (!this.floatingProps)
          this.floatingProps = {}
        this.floatingProps[prop.name] = resource[params.prop]
      }
      else {
        let rModel
        // var m = utils.getId(resource[params.prop]).split('_')[0]
        rModel = utils.getModel(prop.ref).value
        label = utils.getDisplayName(resource[params.prop], rModel.properties)
        if (!label)
          label = resource[params.prop].title
        if (rModel.subClassOf  &&  rModel.subClassOf === ENUM)
          label = utils.createAndTranslate(label, true)
      }
      style = textStyle
      propLabel = <Text style={[styles.labelDirty, color]}>{params.label}</Text>
    }
    else {
      label = params.label
      style = [labelStyle, color]
      propLabel = <View/>
    }
    let photoR = isPhoto && (this.state[prop.name + '_photo'] || this.state.resource[prop.name])
    color = {color: this.state.isRegistration ? '#eeeeee' : resource && resource[params.prop] ? '#555555' :  '#AAAAAA'}
    let propView
    if (photoR) {
      if (utils.isImageDataURL(photoR.url)) {
        propView = <Image source={{uri: photoR.url}} style={styles.thumb} />
      } else {
        propView = <Icon name='ios-paper-outline' size={35} color={LINK_COLOR} />
      }
    } else {
      propView = <Text style={[styles.input, fontSize, color]}>{label}</Text>
    }

    let maxChars = (utils.dimensions(component).width - 20)/10
    if (maxChars < label.length)
      label = label.substring(0, maxChars - 3) + '...'
    if (this.state.isRegistration  &&  prop.ref  &&  prop.ref === 'tradle.Language'  &&  !resource[prop.name])
      label += ' (' + utils.translate(utils.getDefaultLanguage()) + ')'

      // <View key={this.getNextKey()} style={this.hasError(params) ? {paddingBottom: 0} : {paddingBottom: 10}} ref={prop.name}>
    let fontSize = styles.font20 //this.state.isRegistration ? styles.font20 : styles.font18
    // let fontSize = styles.font18 //this.state.isRegistration ? styles.font20 : styles.font18
    let iconColor = this.state.isRegistration ? '#eeeeee' : LINK_COLOR
    let icon
    if (isVideo)
      icon = <Icon name='ios-play-outline' size={35}  color={LINK_COLOR} />
    else if (isPhoto)
      icon = <Icon name={prop.icon || 'ios-camera-outline'} size={35}  color={LINK_COLOR} style={styles.photoIcon}/>
    else if (!noChooser)
      icon = <Icon name='ios-arrow-down'  size={15}  color={iconColor}  style={[styles.icon1, styles.customIcon]} />

    let content = <View  style={[styles.chooserContainer, {flexDirection: 'row', borderBottomColor: lcolor}]}>
                    {propView}
                    {icon}
                  </View>

    let actionItem
    if (isVideo ||  isPhoto) {
      // HACK
      const isScan = params.prop === 'scan'
      let useImageInput
      if (utils.isWeb()) {
        useImageInput = isScan || !ENV.canUseWebcam
      } else {
        useImageInput = !isScan || !BlinkID
      }

      if (useImageInput) {
        var aiStyle = {flex: 7, paddingTop: 15, paddingBottom: 7}
        let m = utils.getModel(prop.ref).value
        actionItem = <ImageInput prop={prop} style={aiStyle} onImage={item => this.onSetMediaProperty(prop.name, item)}>
                       {content}
                     </ImageInput>
      }
      else
        actionItem = <TouchableHighlight underlayColor='transparent' onPress={this.showCamera.bind(this, params)}>
                       {content}
                     </TouchableHighlight>
    }
    else
      actionItem = <TouchableHighlight underlayColor='transparent' onPress={noChooser ? () => {} : this.chooser.bind(this, prop, params.prop)}>
                     {content}
                   </TouchableHighlight>

    return (
      <View key={this.getNextKey()} style={{paddingBottom: this.hasError(params.errors, prop.name) ? 0 : 10, margin: 0}} ref={prop.name}>
        {propLabel}
        {actionItem}
        {this.getErrorView({noError: params.noError, errors: params.errors, prop: prop, paddingBottom: 0})}
      </View>
    );
  },
  onSetMediaProperty(propName, item) {
    if (!item)
      return;
    var resource = this.addFormValues();
    const props = this.props.model.properties
    if (props[propName].ref)
      item[constants.TYPE] = props[propName].ref
    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[propName]
    var r = {}
    extend(true, r, this.state.resource)
    r[propName] = item
    if (!this.floatingProps)
      this.floatingProps = {}
    this.floatingProps[propName] = item

    this.setState({
      resource: r,
      prop: propName,
      inFocus: propName
    });
  },
  setDefaultValue(prop, resource, isHidden) {
    let defaults = this.props.defaultPropertyValues
    if (!defaults)
      return
    let vals = defaults[resource[constants.TYPE]]
    if (!vals  ||  !vals[prop])
      return

    resource[prop] = vals[prop]
    if (isHidden) {
      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[prop] = vals[prop]
    }
  },
  hasError(errors, propName) {
    return (errors && errors[propName]) || this.state.missedRequiredOrErrorValue &&  this.state.missedRequiredOrErrorValue[propName]
  },
  chooser(prop, propName,event) {
    var resource = this.state.resource;
    var model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = model.id;
    }

    var isFinancialProduct = model.subClassOf  &&  model.subClassOf == constants.TYPES.FINANCIAL_PRODUCT
    var value = this.refs.form.input;

    var filter = event.nativeEvent.text;
    var propRef = prop.ref
    var m = utils.getModel(propRef).value;
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: translate(prop), //m.title,
      // titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      sceneConfig: isFinancialProduct ? Navigator.SceneConfigs.FloatFromBottom : Navigator.SceneConfigs.FloatFromRight,
      passProps: {
        filter:         filter,
        isChooser:      true,
        prop:           prop,
        modelName:      propRef,
        resource:       resource,
        isRegistration: this.state.isRegistration,
        bankStyle:      this.props.bankStyle,
        returnRoute:    currentRoutes[currentRoutes.length - 1],
        callback:       this.setChosenValue.bind(this),
      }
    });
  },

  // setting chosen from the list property on the resource like for ex. Organization on Contact
  setChosenValue(propName, value) {
    var resource = {}
    extend(resource, this.state.resource)
    if (typeof propName === 'object')
      propName = propName.name
    let setItemCount
    // clause for the items properies - need to redesign
    if (this.props.metadata  &&  this.props.metadata.type === 'array') {
      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[propName] = value
      resource[propName] = value
    }
    else if (this.props.model.properties[propName].type === 'array') {
      let prop = this.props.model.properties[propName]
      if (!prop.inlined  &&  prop.items  &&  prop.items.ref  &&  !utils.getModel(prop.items.ref).value.inlined) {
        let v = utils.buildRef(value)

        if (value.photos)
          v.photo = value.photos[0].url
        if (!resource[propName]) {
          resource[propName] = []
          resource[propName].push(v)
        }
        else {
          let arr = resource[propName].filter((r) => {
            return r.id === v.id
          })
          if (!arr.length)
            resource[propName].push(v)
        }

        setItemCount = true
      }
      else
        resource[propName] = value
    }
    else {
      var id = utils.getId(value)
      resource[propName] = utils.buildRef(value)

      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[propName] = resource[propName]

      var data = this.refs.form.refs.input.state.value;
      if (data) {
        for (var p in data)
          if (!resource[p])
            resource[p] = data[p];
      }
    }
    let state = {
      resource: resource,
      prop: propName
    }
    if (this.state.missedRequiredOrErrorValue)
      delete this.state.missedRequiredOrErrorValue[propName]
    if (setItemCount)
      state.itemsCount = resource[propName].length

    if (value.photos)
      state[propName + '_photo'] = value.photos[0]
    else if (this.props.model  && this.props.model.properties[propName].ref === 'tradle.Photo')
      state[propName + '_photo'] = value
    state.inFocus = propName
    this.setState(state);

    var r = {}
    extend(r, this.state.resource)
    for (var p in this.floatingProps)
      r[p] = this.floatingProps[p]
    Actions.saveTemporary(r)
  },

  // MONEY value and curency template
  myMoneyInputTemplate(params) {
    var label = params.label
    label += params.required ? '' : ' (optional)'
    label += (params.prop.ref  &&  params.prop.ref === constants.TYPES.MONEY)
           ?  ' (' + CURRENCY_SYMBOL + ')'
           : ''
    return (
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          {
             this.myTextInputTemplate({
                    label: label,
                    prop:  params.prop,
                    value: params.value.value ? params.value.value + '' : '',
                    required: params.required,
                    model: params.model,
                    errors: params.errors,
                    keyboard: 'numeric',
                  })
          }
          {
             this.myEnumTemplate({
                    prop:     params.prop,
                    enumProp: utils.getModel(constants.TYPES.MONEY).value.properties.currency,
                    required: params.required,
                    value:    utils.normalizeCurrencySymbol(params.value.currency),
                    errors:   params.errors,
                    // noError:  params.errors && params.errors[params.prop],
                    noError: true
                  })
        }
      </View>
    );
  },

  myEnumTemplate(params) {
    var label
    var prop = params.prop
    var enumProp = params.enumProp
    var error
    if (!params.noError) {
      var err = this.state.missedRequiredOrErrorValue
              ? this.state.missedRequiredOrErrorValue[prop.name]
              : null
      if (!err  &&  params.errors  &&  params.errors[prop.name])
        err = params.errors[prop.name]
      error = err
                ? <View style={styles.enumErrorLabel} />
                : <View />
    }
    else
      error = <View/>
    var value = prop ? params.value : this.state.resource[enumProp.name]
    return (
      <View style={[styles.chooserContainer, styles.enumElement]} key={this.getNextKey()} ref={enumProp.name}>
        <TouchableHighlight underlayColor='transparent' onPress={this.enumChooser.bind(this, prop, enumProp)}>
          <View>
            <View style={styles.chooserContentStyle}>
              <Text style={styles.enumText}>{value}</Text>
              <Icon name='ios-arrow-down'  size={15}  color={LINK_COLOR}  style={[styles.icon1, styles.enumProp]} />
            </View>
           {error}
          </View>
        </TouchableHighlight>
      </View>
    );
  },
  enumChooser(prop, enumProp, event) {
    var resource = this.state.resource;
    var model = (this.props.model  ||  this.props.metadata)
    if (!resource) {
      resource = {};
      resource[constants.TYPE] = model.id;
    }

    var value = this.refs.form.input;

    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: enumProp.title,
      titleTextColor: '#7AAAC3',
      id: 22,
      component: EnumList,
      backButtonTitle: 'Back',
      passProps: {
        prop:        prop,
        enumProp:    enumProp,
        resource:    resource,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenEnumValue.bind(this),
      }
    });
  },
  setChosenEnumValue(propName, enumPropName, value) {
    var resource = {}
    extend(true, resource, this.state.resource)
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

    // if (this.state.isPrefilled) {
    //   var props = (this.props.model  ||  this.props.metadata).properties
    //   if (props[propName].ref  &&  props[propName].ref === constants.TYPES.MONEY) {
    //     if (this.floatingProps  &&  this.floatingProps[propName]  &&  !this.floatingProps[propName].value  &&  resource[propName]  &&  resource[propName].value)
    //       this.floatingProps[propName].value = resource[propName].value
    //   }
    // }

    // resource[propame] = value
    var data = this.refs.form.refs.input.state.value;
    if (data) {
      for (var p in data)
        if (!resource[p])
          resource[p] = data[p];
    }

    this.setState({
      resource: resource,
      prop: propName
    });
  },
  validateProperties(value) {
    let m = value[constants.TYPE]
                   ? utils.getModel(value[constants.TYPE]).value
                   : this.props.model
    let properties = m.properties
    let err = []
    let deleteProps = []
    for (var p in value) {
      let prop = properties[p]
      if (!prop) // properties like _t, _r, time
        continue
      if (typeof value[p] === 'undefined'  ||  value[p] === null) {
        deleteProps.push(p)
        continue
      }
      if (prop.type === 'number') {
        coerceNumber(value, p)
        checkNumber(value[p], prop, err)
      }
      else if (prop.ref === constants.TYPES.MONEY) {
        coerceNumber(value[p], 'value')
        let error = checkNumber(value[p].value, prop, err)
        if (error  &&  m.required.indexOf(p) === -1)
          deleteProps.push(p)
        else if (!value[p].currency)
          value[p].currency = this.props.currency
      }
      else if (prop.units && prop.units === '[min - max]') {
        let v = value[p].split('-').map(coerceNumber)
        if (v.length === 1)
          checkNumber(v[0], prop, err)
        else if (v.length === 2) {
          checkNumber(v[0], prop, err)
          if (err[p])
            continue
          checkNumber(v[1], prop, err)
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
      // else if (prop.patterns) {
      //   let cprops = []
      //   for (let pr in properties) {
      //     if (properties[pr].ref && properties[pr].ref === 'tradle.Country')
      //       cprops.push(pr)
      //   }
      //   if (!cprops.length)
      //     continue

      //   let patternCountry = cprops.map((p) => {
      //     let val = value[p]  ||  this.props.resource[p]
      //     return val ? val : undefined
      //   })
      //   if (!patternCountry)
      //     continue
      //   let pattern = prop.patterns[patternCountry[0]]
      //   if (pattern  &&  !(new RegExp(pattern).test(value[p])))
      //     err[prop.name] = 'Invalid ' + prop.title
      // }
    }
    if (deleteProps)
      deleteProps.forEach((p) => {
        delete value[p]
        delete err[p]
      })
    return err
  },
}

function checkNumber (v, prop, err) {
  var p = prop.name
  var error
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
}

function coerceNumber (obj, p) {
  const val = obj[p]
  if (typeof val === 'string') {
    obj[p] = Number(val.trim())
  }
}
function coerceNumber (obj, p) {
  const val = obj[p]
  if (typeof val === 'string') {
    obj[p] = Number(val.trim())
  }
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
    paddingLeft: 0,
  },
  icon1: {
    width: 15,
    height: 15,
    marginVertical: 2
  },
  booleanContainer: {
    height: 60,
    borderColor: '#ffffff',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    justifyContent: 'center',
    marginHorizontal: 10,
    // marginBottom: 10,
    flex: 1
  },
  booleanContentStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    // paddingVertical: 5,
    // marginRight: 10,
    borderRadius: 4
  },
  datePicker: {
    // width: dimensions.width - 30,
    // marginLeft: 10,
    paddingLeft: utils.isWeb() ? 0 : 10,
    justifyContent: 'flex-start',
    // borderColor: '#cccccc',
    alignSelf: 'stretch'
  },
  chooserContainer: {
    height: 45,
    marginTop: 20,
    borderColor: '#ffffff',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
    marginHorizontal: 10,
    // justifyContent: 'center',
    position: 'relative',
    // marginBottom: 10,
    // paddingBottom: 10,
    flex: 1
  },
  chooserContentStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    // paddingVertical: 5,
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
  formInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    marginHorizontal: 10,
    paddingLeft: 0,
    borderColor: '#cccccc',
  },
  regInput: {
    borderWidth: 0,
    paddingLeft: 0,
    height: 50,
    fontSize: 20,
    color: '#eeeeee'
  },
  textInput: {
    borderWidth: 0,
    paddingLeft: 0,
    color: '#555555',
    height: 45,
    fontSize: 20,
  },
  thumb: {
    width: 40,
    height: 40,
    marginRight: 2,
    // marginTop: 7,
    borderRadius: 5
  },
  err: {
    paddingLeft: 10,
    // backgroundColor: 'transparent'
  },
  element: {
    position: 'relative'
  },
  input: {
    backgroundColor: 'transparent',
    color: '#aaaaaa',
    fontSize: 20,
    marginTop: 10,
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
    marginLeft: 10,
    color: '#AAA',
    position: 'absolute',
    fontSize: 12,
    top: -17,
  },
  photoIcon: {
    position: 'absolute',
    right: 5,
    marginTop: 5
  },
  customIcon: {
    position: 'absolute',
    right: 0,
    marginTop: 15
  },
  dateInput: {
    flex: 1,
    height: 35,
    paddingBottom: 5,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'transparent',
    borderBottomColor: '#cccccc',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 20,
    color: '#555555',
    backgroundColor: 'transparent',
    // marginLeft: 10
  },
  font18: {
    fontSize: 18,
  },
  font20: {
    fontSize: 20,
  },
  dateIcon: {
    position: 'absolute',
    right: 0,
    top: 5
  },
  divider: {
    // justifyContent: 'center',
    borderColor: 'transparent',
    borderWidth: 1.5,
    marginTop: 20,
    marginHorizontal: 10,
    marginBottom: 5
  },
  dividerText: {
    // marginTop: 15,
    marginBottom: 5,
    fontSize: 26,
    // alignSelf: 'center',
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
    marginTop: 5,
    fontSize: 20
  },
  dateLabel: {
    // marginLeft: 10,
    fontSize: 12,
    marginVertical: 5,
    paddingBottom: 5
    // marginLeft: 10
  },
  noItemsText: {
    fontSize: 20,
    color: '#AAAAAA',
    // alignSelf: 'center',
    // paddingLeft: 10
  }
})

function formatDate (date) {
  return dateformat(date, 'mmm dS, yyyy')
}

function getDocumentTypeFromTitle (title='') {
  title = title.toLowerCase()
  const match = title.match(/(licen[cs]e|passport)/)
  if (!match) return

  return match[1] === 'passport' ? 'passport' : 'license'
}

module.exports = NewResourceMixin
  // nfcModal: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center'
  // },
  // nfcInstructions: {
  //   position: 'absolute',
  //   bottom: 30,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   paddingHorizontal: 50
  // },
  // nfcInstructionsText: {
  //   fontSize: 20
  // }
  // icon: {
  //   width: 20,
  //   height: 20,
  //   marginLeft: -5,
  //   marginRight: 5,
  // },
  // dateContainer: {
  //   // height: 60,
  //   borderColor: '#ffffff',
  //   borderBottomColor: '#cccccc',
  //   borderBottomWidth: 1,
  //   marginHorizontal: 10,
  //   // marginLeft: 10,
  //   // marginBottom: 10,
  //   flex: 1
  // },
  // labelInput: {
  //   color: '#cccccc',
  // },
  // preview: {
  //   flex: 1,
  //   justifyContent: 'flex-end',
  //   alignItems: 'center',
  //   height: Dimensions.get('window').height,
  //   width: Dimensions.get('window').width
  // },
  // capture: {
  //   flex: 0,
  //   backgroundColor: '#fff',
  //   borderRadius: 5,
  //   color: '#000',
  //   padding: 10,
  //   margin: 40
  // },

// function parseAnylineDate (date) {
//   // yymmdd
//   const [year, month, day] = [date.slice(0, 2), date.slice(2, 4), date.slice(4, 6)]
//   return dateFromParts({ day, month, year })
// }

  // myDateTemplate1(params) {
  //   var labelStyle = {color: '#cccccc', fontSize: 17, paddingBottom: 10};
  //   var textStyle = {color: this.state.isRegistration ? '#ffffff' : '#000000', fontSize: 17, paddingBottom: 10};
  //   var prop = params.prop
  //   let resource = this.state.resource
  //   let label, style, propLabel
  //   let hasValue = resource && resource[prop.name]
  //   if (resource && resource[prop.name]) {
  //     label = resource[prop.name].title
  //     style = textStyle

  //     let vStyle = Platform.OS === 'android'
  //                ? {paddingLeft: 10, marginTop: 5}
  //                : {marginLeft: 10, marginTop: 5, marginBottom: 5, backgroundColor: 'transparent'}

  //     propLabel = <View style={vStyle}>
  //                   <Text style={{fontSize: 12, color: this.state.isRegistration ? '#eeeeee' : '#B1B1B1'}}>{params.label}</Text>
  //                 </View>
  //   }
  //   else {
  //     label = params.label
  //     style = labelStyle
  //     propLabel = <View style={{marginTop: 20}}/>
  //   }

  //   var err = this.state.missedRequiredOrErrorValue
  //           ? this.state.missedRequiredOrErrorValue[prop.name]
  //           : null
  //   if (!err  &&  params.errors  &&  params.errors[prop.name])
  //     err = params.errors[prop.name]

  //   let valuePadding = 0 //Platform.OS === 'ios' ? 0 : (hasValue ? 10 : 0)

  //   return (
  //     <View style={{paddingBottom: 10, flex: 5}} key={this.getNextKey()} ref={prop.name}>
  //      {propLabel}
  //      <TouchableHighlight underlayColor="transparent" onPress={this.showModal.bind(this, prop, true)}>
  //        <View style={[styles.dateContainer, {flexDirection: 'row', justifyContent: 'space-between', paddingLeft: valuePadding}]}>
  //          <Text style={style}>{(params.value &&  dateformat(new Date(params.value), 'mmmm dS, yyyy')) || translate(params.prop)}</Text>
  //          <Icon name='ios-calendar-outline'  size={17}  color={LINK_COLOR}  style={styles.icon1} />
  //        </View>
  //      </TouchableHighlight>
  //      { Platform.OS === 'ios'
  //         ? this.state.modal  &&  this.state.modal[prop.name]
  //             ? <Picker closeModal={() => {
  //                this.showModal(prop, false)
  //             }} offSet={this.state.offSet} value={params.value} prop={params.prop} changeTime={this.changeTime.bind(this, params.prop)}  />
  //             : (err ? this.getErrorView(params) : null)
  //         : <View />
  //       }
  //     </View>
  //   );
  // },

  // showCamera(params) {

  //   return (
  //     <View style={styles.container}>
  //       <Camera
  //         ref={(cam) => {
  //           this.camera = cam;
  //         }}
  //         style={styles.preview}
  //         aspect={Camera.constants.Aspect.fill}>
  //         <Text style={styles.capture} onPress={this.takePicture.bind(this)}>[CAPTURE]</Text>
  //       </Camera>
  //     </View>
  //   );
  // },
  // showModal(prop, show) {
  //   this.setState({modal: show})
  // },
  // showModal(prop, show) {
  //   if (Platform.OS === 'ios') {
  //     let m = {}
  //     extend(true, m, this.state.modal)
  //     if (show)
  //       m[prop.name] = show
  //     else {
  //       for (let p in m)
  //         m[p] = false
  //     }

  //     this.setState({modal: m})
  //   }
  //   else
  //     this.showPicker(prop, 'preset', {date: new Date()})
  // },

  // renderPhotoItem(prop, styles) {
  //   let meta = this.props.model
  //   let resource = this.state.resource
  //   let model = meta
  //   let val
  //   let lcolor = this.getLabelAndBorderColor(prop.name)
  //   var value = resource  &&  resource[prop.name]

  //   var title = translate(prop, model) //.title || utils.makeLabel(p)

  //   if (value) {
  //     val = <View style={[styles.photoStrip, count ? {marginTop: -25} : {marginTop: 0}]}>
  //             <Text style={[styles.activePropTitle, {color: lcolor}]}>{title}</Text>
  //             <View style={styles.photoStripItems}>
  //               <Image resizeMode='cover' style={styles.thumb} source={{uri: arr[i].url}}  key={this.getNextKey()} onPress={() => {
  //                 this.openModal(arr[i])
  //               }}/>
  //             </View>
  //           </View>
  //   }
  //   else
  //     val = <Text style={count ? styles.itemsText : styles.noItemsText}>{title}</Text>

  //   let icon = <View style={[styles.itemsCounterEmpty]}>
  //                <Icon name='ios-camera-outline'  size={25} color={LINK_COLOR} />
  //              </View>
  //   var err = this.state.missedRequiredOrErrorValue
  //           ? this.state.missedRequiredOrErrorValue[prop.name]
  //           : null
  //   var errTitle = translate('thisFieldIsRequired')
  //   var error = err
  //             ? <View style={styles.error}>
  //                 <Text style={styles.errorText}>{errTitle}</Text>
  //               </View>
  //             : <View/>
  //   var actionableItem = <ImageInput
  //                          prop={bl}
  //                          style={[{flex: 7}, count ? {paddingTop: 0} : {paddingTop: 15, paddingBottom: 7}]}
  //                          underlayColor='transparent'
  //                          onImage={item => this.onAddItem(name, item)}>
  //                          {photo}
  //                        </ImageInput>

  //   let istyle = [count ? styles.photoButton : styles.itemButton, {marginHorizontal: 10, borderBottomColor: lcolor}]

  //   return (
  //     <View key={this.getNextKey()}>
  //       <View style={istyle} ref={prop.name}>
  //         <View style={styles.items}>
  //           {actionableItem}
  //           <ImageInput
  //               prop={prop}
  //               underlayColor='transparent' style={[{flex: 1, position: 'absolute', right: 0}, count ? {marginTop: 15} : {marginTop: 15, paddingBottom: 7}]}
  //               onImage={item => this.onAddItem(prop.name, item)}>
  //             {counter}
  //           </ImageInput>
  //         </View>
  //       </View>
  //       {error}
  //     </View>
  //   );
  // },
  // scanFormsQRCode(prop) {
  //   this.setState({show: false})
  //   this.props.navigator.push({
  //     title: 'Scan QR Code',
  //     id: 16,
  //     component: QRCodeScanner,
  //     titleTintColor: '#eeeeee',
  //     backButtonTitle: 'Cancel',
  //     // rightButtonTitle: 'ion|ios-reverse-camera',
  //     passProps: {
  //       onread: this.onread.bind(this, prop)
  //     }
  //   })
  // },

  // onread(p, result) {
  //   let json = driverLicenseParser.parse(result.data)
  //   var r = {}
  //   extend(true, r, this.state.resource)
  //   if (result.image)
  //     r[p] = {
  //       [constants.TYPE]: this.props.model.properties[p].ref,
  //       url: result.image
  //     }
  //   else { // Sample license
  //     r[p] = {
  //       [constants.TYPE]: this.props.model.properties[p].ref,
  //       url: "data:image/jpeg;base64,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FXyB6UeQPSrW2jbQBV8gelHkD0q1to20AVfIHpR5A9KtbaNtAFXyB6UeQPSrW2jbQBV8gelHkD0q1to20AVfIHpR5A9KtbaNtAFXyB6UeQPSrW2jbQBV8gelHkD0q1to20AVfIHpR5A9KtbaNtAFXyB6UeQPSrW2jbQBV8gelHkD0q1to20AVfIHpR5A9KtbaNtAFXyB6UeQPSrW2jbQBV8gelHkD0q1to20AVfIHpR5A9KtbaNtAFXyB6UeQPSrW2jbQBV8gelHkD0q1to20AVfIHpR5A9KtbaNtAFXyB6UeQPSrW2jbQBV8gelHkD0q1to20AVfIHpR5A9KtbaNtAFXyB6UeQPSrW2jbQBV8gelL5I9Ks7aNtAEAiA7U4JjtU20UYFADAtOC06igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9k="
  //     }
  //     this.floatingProps[p] = r[p]
  //   }
  //   if (this.props.model.properties[p + 'Json']) {
  //     r[p + 'Json'] = JSON.stringify(json)
  //     this.floatingProps[p + 'Json'] = r[p + 'Json']
  //   }
  //   this.setState({resource: r})
  //   this.props.navigator.pop();
  // },


  // async showAnylineScanner(prop) {
  //   const { documentType, country } = this.state.resource
  //   let type
  //   switch (documentType.title) {
  //     case 'Passport':
  //       type = 'mrz'
  //       break;
  //     case 'Driver licence':
  //     case 'Driver license':
  //       if (country.title === 'United Kingdom') {
  //         return Alert.alert(
  //           translate('oops') + '!',
  //           translate('ukLicenseUnsupported')
  //         )
  //         // type = 'ocr'
  //       } else {
  //         type = 'barcode'
  //       }

  //       break
  //     default:
  //       return Alert.alert(
  //         translate('Error'),
  //         translate('unsupported document type: ' + documentType.title)
  //       )
  //   }

  //   let result
  //   try {
  //     result = await Anyline.setupScanViewWithConfigJson({ type })
  //   } catch (err) {
  //     if (err.type === 'canceled') return
  //     if (err.type === 'invalid') {
  //       return Alert.alert(
  //         translate('error'),
  //         err.message || translate('invalidDocument')
  //       )
  //     }

  //     return Alert.alert(
  //       translate('somethingWentWrong'),
  //       err.message
  //     )
  //   }

  //   const r = {}
  //   extend(true, r, this.state.resource)

  //   r[prop] = {
  //     url: result.cutoutBase64,
  //     width: result.width,
  //     height: result.height
  //   }

  //   let docProps = omit(result, 'cutoutBase64', 'width', 'height', 'imagePath', 'fullImagePath')
  //   let normalized
  //   switch (documentType.title) {
  //     case 'Passport':
  //       // {
  //       //   "nationalityCountryCode":"USA",
  //       //   "documentNumber":"...",
  //       //   "givenNames":"...",
  //       //   "documentType":"P",
  //       //   "issuingCountryCode":"USA",
  //       //   "dayOfBirth":"yymmdd",
  //       //   "sex":"M",
  //       //   "surNames":"...",
  //       //   "expirationDate":"yymmdd",
  //       //   "personalNumber":""
  //       // }
  //       normalized = {
  //         personal: {
  //           // e.g. ANNA<MARIA  to  ANNA MARIA
  //           sex: result.sex,
  //           firstName: result.givenNames.replace(/\</g, ' '),
  //           lastName: result.surNames.replace(/\</g, ' '),
  //           dateOfBirth: parseAnylineDate(result.dayOfBirth),
  //           nationality: result.nationalityCountryCode
  //         },
  //         document: {
  //           documentNumber: result.documentNumber,
  //           personalNumber: result.personalNumber,
  //           dateOfExpiry: parseAnylineDate(result.expirationDate),
  //           issuer: result.issuingCountryCode
  //         }
  //       }

  //       break
  //     case 'Driver licence':
  //     case 'Driver license':
  //       if (country.title === 'United States' && result.barcodeFormat === 'PDF_417') {
  //         let usdl = parseUSDL(result.value)
  //         let personal = pick(usdl, [
  //           'sex',
  //           'firstName',
  //           'middleName',
  //           'lastName',
  //           'dateOfBirth',
  //           'eyeColor',
  //           'height',
  //           'addressStreet',
  //           'addressCity',
  //           'addressState',
  //           'addressPostalCode'
  //         ])

  //         let document = pick(usdl, [
  //           'documentNumber',
  //           'issuer',
  //           'documentDiscriminator',
  //           'jurisdictionVehicleClass',
  //           'jurisdictionRestrictionCodes',
  //           'jurisdictionEndorsementCodes',
  //           'dateOfExpiry',
  //           'dateOfIssue',
  //           'inventoryControlNumber'
  //         ])

  //         let misc = omit(usdl, Object.keys(personal).concat(Object.keys(document)))
  //         normalized = { personal, document, misc }
  //       } else {
  //         normalized = docProps
  //       }

  //       break
  //   }

  //   r[prop + 'Json'] = normalized
  //   this.afterScan(r, prop)
  // },

