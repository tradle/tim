'use strict';

var React = require('react');
var dateformat = require('dateformat')
var ResourceList = require('./ResourceList')
var EnumList = require('./EnumList')
var FloatLabel = require('react-native-floating-labels')
var Icon = require('react-native-vector-icons/Ionicons');
var utils = require('../utils/utils');
var CameraView = require('./CameraView')
var translate = utils.translate
var moment = require('moment')

import DatePicker from 'react-native-datepicker'

var constants = require('@tradle/constants');
var t = require('tcomb-form-native');
var Actions = require('../Actions/Actions');
var extend = require('extend');
const DEFAULT_CURRENCY_SYMBOL = '£';
var CURRENCY_SYMBOL
const ENUM = 'tradle.Enum'
const SETTINGS = 'tradle.Settings'
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
import {
  Text,
  View,
  TouchableHighlight,
  Platform,
  Image,
  StyleSheet,
  Navigator,
  Switch,
  DatePickerAndroid,
  Dimensions
} from 'react-native';

var LINK_COLOR, DEFAULT_LINK_COLOR = '#a94442'
// import transform from 'tcomb-json-schema'

var NewResourceMixin = {
  onScroll(e) {
    this._contentOffset = { ...e.nativeEvent.contentOffset }
  },
  getScrollOffset() {
    return { ...this._contentOffset }
  },
  getFormFields(params) {
    CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol ||  this.props.currency : DEFAULT_CURRENCY_SYMBOL

    if (this.props.bankStyle)
      LINK_COLOR = this.props.bankStyle.LINK_COLOR || DEFAULT_LINK_COLOR
    else
      LINK_COLOR = DEFAULT_LINK_COLOR

    var meta = this.props.model  ||  this.props.metadata;
    var model = params.model;  // For the form
    var isMessage = meta.interfaces
    var onSubmitEditing = isMessage ? this.onSubmitEditing  ||  params.onSubmitEditing : this.onSavePressed
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
        eCols[p] = props[p]
      })
      for (let p in props) {
        if (!eCols[p]  &&  !props[p].readOnly  &&  !props[p].hidden)
          eCols[p] = props[p]
      }
    }

    var required = utils.arrayToObject(meta.required);

// var TcombType = transform({
//   "type": "string",
//   "enum": ["Street", "Avenue", "Boulevard"]
// });

// model['test'] = TcombType
// options.fields['test'] = {
//   placeholder: 'Test'
// }
    // var d = data ? data[i] : null;
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
      else if (props[p].oneOf) {
        model[p] = t.enums(props[p].oneOf);
        options.fields[p].auto = 'labels';
      }
      else if (type == 'enum') {
        var facet = props[p].facet;
        var values = models.filter(mod => {
           return mod.type === facet ? mod.values : null;
        });
        if (values && values.length) {
          var enumValues = {};
          values[0].values.forEach(function(val) {
            enumValues[val.label] = val.displayName;
          });
          // options.fields[p].factory = t.form.radio;
          model[p] = t.enums(enumValues);
        }
        options.fields[p].auto = 'labels';
      }
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
            chooser: options.fields[p].onFocus
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
          required: !maybe,
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
    if(prop.type === 'number') {
      let val = Number(value)
      if (value.charAt(value.length - 1) === '.')
        value = val + .00
      else
        value = val
    }
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
  showCamera(params) {
    var self = this;
    this.props.navigator.push({
      title: 'Take a pic',
      backButtonTitle: 'Cancel',
      id: 12,
      component: CameraView,
      sceneConfig: Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        onTakePic: this.onTakePic.bind(this, params)
      }
    });
  },

  onTakePic(params, data) {
    if (!data)
      return
    this.props.resource.video = data
    if (!this.floatingProps)
      this.floatingProps = {}

    this.floatingProps.video = data
    this.props.navigator.pop();
  },

  myTextTemplate(params) {
    var label = translate(params.prop, params.model)

    return (
      <View style={[styles.divider, {backgroundColor: LINK_COLOR}]}>
        <Text style={styles.dividerText}>{label}</Text>
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
    // label += (params.prop.ref  &&  params.prop.ref === constants.TYPES.MONEY)
    //        ?  ' (' + CURRENCY_SYMBOL + ')'
    //        : ''
    // let paddingBottom = 20
    let lStyle = styles.labelStyle
    if (params.prop.ref  &&  params.prop.ref === constants.TYPES.MONEY  &&  !params.required) {
      let maxChars = (Dimensions.get('window').width - 60)/10
      // let some space for wrapping
      if (maxChars < label.length)
        lStyle = [styles.labelStyle, {marginTop: 0}]
    }
    if (this.state.isRegistration)
      lStyle = [lStyle, {color: '#eeeeee'}]
    return (
      <View style={{flex: 5, paddingBottom: this.hasError(params.errors, params.prop.name) ? 10 : Platform.OS === 'ios' ? 10 : 7}}>
        <FloatLabel
          labelStyle={lStyle}
          autoCorrect={false}
          autoCapitalize={this.state.isRegistration  ||  (params.prop.name !== 'url' &&  (!params.prop.keyboard || params.prop.keyboard !== 'email-address')) ? 'sentences' : 'none'}
          onFocus={this.inputFocused.bind(this, params.prop.name)}
          inputStyle={this.state.isRegistration ? styles.regInput : styles.textInput}
          style={styles.formInput}
          value={params.value}
          keyboardShouldPersistTaps={true}
          keyboardType={params.keyboard || 'default'}
          onChangeText={this.onChangeText.bind(this, params.prop)}
        >{label}</FloatLabel>
          {this.getErrorView(params)}
      </View>
    );
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
                    <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>{err}</Text>
                  </View>
                : <View key={this.getNextKey()} />
    }
    return error
  },
  myBooleanTemplate(params) {
    var labelStyle = {color: '#cccccc', fontSize: 18};
    var textStyle =  {marginTop: 5, color: this.state.isRegistration ? '#ffffff' : '#000000', fontSize: 18};

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
    if (doWrap  && Platform.OS === 'android') {
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
              <Text style={[style, doWrap ? {flexWrap: 'wrap', width: Dimensions.get('window').width - 100} : {}]}>{label}</Text>
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
    if (resource && resource[prop.name]) {
      label = resource[prop.name].title
      propLabel = <Text style={{fontSize: 12, marginTop: 5, marginLeft: 10, color: this.state.isRegistration ? '#eeeeee' : '#B1B1B1'}}>{params.label}</Text>
    }
    else {
      label = params.label
      propLabel = <View style={{marginTop: 20}}/>
    }

    let valuePadding = 0 //Platform.OS === 'ios' ? 0 : (hasValue ? 10 : 0)
    let format = 'MMMM Do, YYYY'
    let value = params.value &&  moment(new Date(params.value)).format(format)
    let dateProps = {}
    let date
    if (prop.maxDate  ||  prop.minDate) {
      let maxDate = this.getDateRange(prop.maxDate)
      let minDate = this.getDateRange(prop.minDate)
      if (minDate  &&  maxDate)
        dateProps = {maxDate: new Date(maxDate), minDate: new Date(minDate)}
      else
        dataProps = minDate ? {minDate: new Date(minDate)} : {maxDate: new Date(maxDate)}
    }
    if (prop.format)
      dateProps.format = prop.format

    if (!value)
      value = translate(params.prop)
    return <View style={{paddingBottom: this.hasError(params.errors, prop.name) ?  0 : 10}} key={this.getNextKey()} ref={prop.name}>
          {propLabel}
          <DatePicker
            style={styles.datePicker}
            mode="date"
            placeholder={value}
            format={format}
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            date={params.value ? new Date(params.value) : date ? date : null}
            onDateChange={(date) => {
              this.changeTime(params.prop, new Date(moment(date, format)))
            }}
            customStyles={{
              dateInput: styles.dateInput,
              dateText: styles.dateText,
              placeholderText: [styles.placeholderText, {
                color: params.value ? '#000000' : '#aaaaaa',
                  paddingLeft: params.value ? 10 : 0
              }],
              dateIconColor: {color: LINK_COLOR},
              dateIcon: styles.dateIcon
            }}
            {...dateProps}
          />
          {this.getErrorView(params)}
         </View>
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
    this.floatingProps[prop.name] = date
    this.setState({
      resource: r,
    });

   },

  // myDateTemplate (prop) {
  //   return (<NewDatePicker prop={prop}/>)
  // },

  inputFocused(refName) {
    if (!this.state.isRegistration   &&
         this.refs                   &&
         this.refs.scrollView        &&
         this.props.model            &&
         Object.keys(this.props.model.properties).length > 5) {
      utils.scrollComponentIntoView(this, this.refs.form.getComponent(refName))
    }
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
    var propLabel, propName
    var isItem = this.props.metadata != null
    var prop = this.props.model
             ? this.props.model.properties[params.prop]
             : this.props.metadata.items.properties[params.prop]

    let isRequired = this.props.model && this.props.model.required  &&  this.props.model.required.indexOf(params.prop) !== -1
    if (resource && resource[params.prop]) {
      let rModel
      var m = utils.getId(resource[params.prop]).split('_')[0]
      rModel = utils.getModel(m).value
      label = utils.getDisplayName(resource[params.prop], rModel.properties)
      if (!label)
        label = resource[params.prop].title
      if (rModel.subClassOf  &&  rModel.subClassOf === ENUM)
        label = utils.createAndTranslate(label, true)
      style = textStyle
      propLabel = <Text style={[styles.labelDirty, {color: this.state.isRegistration ? '#eeeeee' : '#B1B1B1'}]}>{params.label}</Text>
    }
    else {
      let color = {color: this.state.isRegistration ? '#eeeeee' : '#B1B1B1'}
      label = params.label
      style = [labelStyle, color]
      propLabel = <View/>
    }
    let maxChars = (Dimensions.get('window').width - 20)/10
    if (maxChars < label.length)
      label = label.substring(0, maxChars - 3) + '...'
    if (this.state.isRegistration  &&  prop.ref  &&  prop.ref === 'tradle.Language'  &&  !resource[prop.name])
      label += ' (' + utils.translate(utils.getDefaultLanguage()) + ')'
    let isVideo = prop.name === 'video'
    let isPhoto = prop.name === 'photos'
      // <View key={this.getNextKey()} style={this.hasError(params) ? {paddingBottom: 0} : {paddingBottom: 10}} ref={prop.name}>
    let color = {color: resource && resource[params.prop] ? '#000000' : this.state.isRegistration ? '#eeeeee' : '#AAAAAA'}
    let iconColor = this.state.isRegistration ? '#eeeeee' : LINK_COLOR
    return (
      <View key={this.getNextKey()} style={{paddingBottom: this.hasError(params.errors, prop.name) ? 0 : 10, margin: 0}} ref={prop.name}>
        {propLabel}
        <TouchableHighlight underlayColor='transparent' onPress={
          isVideo ? this.showCamera.bind(this, params) : this.chooser.bind(this, prop, params.prop)
        }>
          <View  style={[styles.chooserContainer, {flexDirection: 'row'}]}>
            {this.state[prop.name + '_photo']
             ? <View style={{flexDirection: 'row'}}>
                 <Image source={{uri: this.state[prop.name + '_photo'].url}} style={styles.thumb} />
                 <Text style={[styles.input, color]}>{label}</Text>
               </View>
             : <Text style={[styles.input, color]}>{label}</Text>
            }
              {isVideo
                ? <Icon name='ios-play-outline'  size={25}  color={LINK_COLOR} />
                : <Icon name='ios-arrow-down'  size={15}  color={iconColor}  style={[styles.icon1, styles.customIcon]} />
              }
          </View>
        </TouchableHighlight>
         {this.getErrorView({noError: params.noError, errors: params.errors, prop: prop, paddingBottom: 0})}
      </View>
    );
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
      title: m.id === translate(m), //m.title,
      titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      backButtonTitle: translate('back'),
      sceneConfig: isFinancialProduct ? Navigator.SceneConfigs.FloatFromBottom : Navigator.SceneConfigs.FloatFromRight,
      passProps: {
        filter:         filter,
        isChooser:      true,
        prop:           prop,
        modelName:      propRef,
        resource:       resource,
        isRegistration: this.state.isRegistration,
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
      if (this.props.model.properties[propName].items  &&  this.props.model.properties[propName].items.ref) {
        let v = {
          id: utils.getId(value),
          title: utils.getDisplayName(value, utils.getModel(value[constants.TYPE]).properties)
        }
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
      resource[propName] = {
        id: id,
        title: utils.getDisplayName(value, utils.getModel(value[constants.TYPE]).value.properties)
      }

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
    var value = prop ? params.value : resource[enumProp.name]
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
      if (prop.type === 'number')
        this.checkNumber(value[p], prop, err)
      else if (prop.ref === constants.TYPES.MONEY) {
        let error = this.checkNumber(value[p], prop, err)
        if (error  &&  m.required.indexOf(p) === -1)
          deleteProps.push(p)
        else if (!value[p].currency)
          value[p].currency = this.props.currency
      }
      else if (prop.units && prop.units === '[min - max]') {
        let v = value[p].split('-').forEach((n) => trim(n))
        if (v.length === 1)
          checkNumber(v, prop, err)
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
  checkNumber(v, prop, err) {
    var p = prop.name
    var error
    if (prop.ref === constants.TYPES.MONEY)
      v = v.value
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


var styles = StyleSheet.create({
  enumProp: {
    marginTop: 15,
  },
  enumText: {
    marginTop: 10,
    marginLeft: 20,
    color: '#757575',
    fontSize: 18
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
    width: Dimensions.get('window').width - 30,
    paddingLeft: 10,
    justifyContent: 'flex-start',
    borderColor: '#f7f7f7',
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
    marginHorizontal: 10,
    borderColor: '#cccccc',
  },
  regInput: {
    borderWidth: 0,
    color: '#eeeeee'
  },
  textInput: {
    borderWidth: 0,
  },
  thumb: {
    width: 25,
    height: 25,
    marginRight: 2,
    marginTop: 7,
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
    fontSize: 18,
    marginTop: 10,
  },
  labelClean: {
    marginTop: 21,
    color: '#AAA',
    position: 'absolute',
    fontSize: 18,
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
    borderColor: '#f7f7f7',
    borderBottomColor: '#cccccc',
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  dateText: {
    fontSize: 18,
    color: '#000000',
  },
  placeholderText: {
    fontSize: 18,
  },
  dateIcon: {
    position: 'absolute',
    right: 0,
    top: 5
  },
  divider: {
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 5
  },
  dividerText: {
    marginVertical: 10,
    fontSize: 18,
    alignSelf: 'center',
    color: '#ffffff'
  },
})
module.exports = NewResourceMixin;
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
