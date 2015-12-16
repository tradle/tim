'use strict';

var React = require('react-native');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var t = require('tcomb-form-native');
var MONEY_TYPE = 'tradle.Money';
var cnt = 0;
var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};
var {
  Text,
  View
} = React;

var NewResourceMixin = {
  getFormFields(params) {
    var meta = this.props.model  ||  this.props.metadata;
    var model = params.model;  // For the form
    var isMessage = model.interfaces
    var onSubmitEditing = isMessage ? this.onSubmitEditing  ||  params.onSubmitEditing : this.onSavePressed
    var onEndEditing = this.onEndEditing  ||  params.onEndEditing
    var chooser = this.chooser  ||  this.props.chooser
    var myCustomTemplate = this.myCustomTemplate  || this.props.template

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
        props = this.getModel(meta.items.ref).value.properties;
    }

    var dModel = data  &&  models[data[constants.TYPE]];
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
    else
      editCols = utils.arrayToObject(meta.editCols);

    var eCols = editCols ? editCols : props;
    var required = utils.arrayToObject(meta.required);
    // var d = data ? data[i] : null;
    for (let p in eCols) {
      if (p === constants.TYPE  ||  p === bl  ||  (props[p].items  &&  props[p].items.backlink))
        continue;

      var maybe = required  &&  !required.hasOwnProperty(p);

      var type = props[p].type;
      var formType = propTypesMap[type];
      // Don't show readOnly property in edit mode if not set
      if (props[p].readOnly) //  &&  (type === 'date'  ||  !data  ||  !data[p]))
        continue;

      var label = props[p].title;
      if (!label)
        label = utils.makeLabel(p);
      options.fields[p] = {
        error: 'Insert a valid ' + label,
        bufferDelay: 20, // to eliminate missed keystrokes
      }
      var isRange
      if (props[p].units) {
        if (props[p].units.charAt(0) === '[') {
          options.fields[p].placeholder = label + ' ' + props[p].units
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
      if (params.isRegistration)
        options.fields[p].placeholder = 'Enter your name'

      if (props[p].description)
        options.fields[p].help = props[p].description;
      if (props[p].readOnly  ||  (props[p].immutable  &&  data  &&  data[p]))
        options.fields[p] = {'editable':  false };
      // if (formType  &&   (formType === t.Num  ||  formType === t.Str))
      //   formType = null

      if (formType) {
        // if (this.onChange)
        //   options.fields[p].onChange = this.onChange.bind(this);
        model[p] = !model[p]  &&  (maybe ? t.maybe(formType) : formType);
        if (data  &&  (type == 'date')) {
          data[p] = new Date(data[p]);
          // options.fields[p] = { mode: 'date'};
          options.fields[p].mode = 'date';
          options.fields[p].auto = 'labels';
          options.fields[p].label = label
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
        if (!options.fields[p].multiline && (type === 'string'  ||  type === 'number')) {
          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this);
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          if (props[p].maxLength)
            options.fields[p].maxLength = props[p].maxLength;
          if (type === 'number') {
            if (data[p]  &&  (typeof data[p] != 'number'))
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
            ref = MONEY_TYPE
          else
          continue;
        }
        if (ref === MONEY_TYPE) {
          model[p] = maybe ? t.maybe(t.Num) : t.Num;
          if (data[p]  &&  (typeof data[p] != 'number'))
            data[p] = data[p].value

          // options.fields[p].template = moneyTemplate.bind({}, props[p])

          options.fields[p].onSubmitEditing = onSubmitEditing.bind(this)
          options.fields[p].onEndEditing = onEndEditing.bind(this, p);
          continue;
        }
        model[p] = maybe ? t.maybe(t.Str) : t.Str;

        var subModel = models[ref];
        if (data  &&  data[p]) {
          options.fields[p].value = data[p][constants.TYPE]
                                  ? data[p][constants.TYPE] + '_' + data[p][constants.ROOT_HASH]
                                  : data[p].id;
          data[p] = utils.getDisplayName(data[p], subModel.value.properties) || data[p].title;
        }

        options.fields[p].onFocus = chooser.bind(this, props[p], p)
        options.fields[p].template = myCustomTemplate.bind(this, {
            label: label,
            prop:  p,
            chooser: options.fields[p].onFocus
          })

        options.fields[p].nullOption = {value: '', label: 'Choose your ' + utils.makeLabel(p)};
      }
    }
    return options;
  },
  getNextKey() {
    return this.props.model.id + '_' + cnt++
  }
}
module.exports = NewResourceMixin;
