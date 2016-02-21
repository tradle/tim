'use strict';

var React = require('react-native');
var ResourceList = require('./ResourceList')
var EnumList = require('./EnumList')
var FloatLabel = require('react-native-floating-labels')
var Icon = require('react-native-vector-icons/Ionicons');
var utils = require('../utils/utils');
var constants = require('@tradle/constants');
var t = require('tcomb-form-native');
var Actions = require('../Actions/Actions');
var Device = require('react-native-device')
var extend = require('extend');
var DEFAULT_CURRENCY_SYMBOL = '£';
var CURRENCY_SYMBOL

var SETTINGS = 'tradle.Settings'

var cnt = 0;
var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};
var {
  Text,
  View,
  TouchableHighlight,
  StyleSheet,
  Navigator
} = React;

var NewResourceMixin = {
  getFormFields(params) {
    CURRENCY_SYMBOL = this.props.currency ? this.props.currency.symbol : DEFAULT_CURRENCY_SYMBOL
    var meta = this.props.model  ||  this.props.metadata;
    var model = params.model;  // For the form
    var isMessage = meta.interfaces
    var onSubmitEditing = isMessage ? this.onSubmitEditing  ||  params.onSubmitEditing : this.onSavePressed
    var onEndEditing = this.onEndEditing  ||  params.onEndEditing
    var chooser = this.chooser  ||  this.props.chooser
    var myCustomTemplate = this.myCustomTemplate //  || this.props.template
    var textTemplate = this.myTextInputTemplate
    // var myDateTemplate = this.myDateTemplate
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
        error: 'This field is required',
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
      if (this.state.isRegistration  &&  params.editCols.length === 1)
        options.fields[p].placeholder = 'Enter your name'

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
          // model[p] = t.Str
          // options.fields[p].template = this.myDateTemplate.bind(this, props[p])
          if (data[p])
            data[p] = new Date(data[p]);
          options.fields[p].mode = 'date';
          options.fields[p].auto = 'labels';
          options.fields[p].label = label
          options.fields[p].onDateChange = this.onDateChange
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
          options.fields[p].template = textTemplate.bind(this, {
                    label: label,
                    prop:  props[p],
                    value: data  &&  data[p] ? data[p] + '' : null,
                    required: !maybe,
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
                    keyboard: 'numeric',
                    required: !maybe,
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
                                  ? data[p][constants.TYPE] + '_' + data[p][constants.ROOT_HASH]
                                  : data[p].id;
          data[p] = utils.getDisplayName(data[p], subModel.value.properties) || data[p].title;
        }

        options.fields[p].onFocus = chooser.bind(this, props[p], p)
        options.fields[p].template = myCustomTemplate.bind(this, {
            label: label,
            prop:  p,
            required: !maybe,
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
    return options;
  },
  getNextKey() {
    return (this.props.model  ||  this.props.metadata).id + '_' + cnt++
  },
  onChangeText(prop, value) {
    var r = {}
    extend(true, r, this.state.resource)
    if(prop.type === 'number')
      value = Number(value)
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
    this.setState({resource: r})
    if (this.state.resource[constants.TYPE] !== SETTINGS)
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
  myTextInputTemplate(params) {
    var error
    if (params.noError)
      error = <View />
    else {
      var err = this.state.missedRequiredOrErrorValue
              ? this.state.missedRequiredOrErrorValue[params.prop.name]
              : null

      error = err
                ? <View style={{paddingLeft: 15, backgroundColor: 'transparent'}} key={this.getNextKey()}>
                    <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>{err}</Text>
                  </View>
                : <View key={this.getNextKey()} />
    }
    var label = params.label
    if (params.prop.units) {
      label += (params.prop.units.charAt(0) === '[')
             ? ' ' + params.prop.units
             : ' (' + params.prop.units + ')'
    }
    label += params.required ? '' : ' (optional)'
    // label += (params.prop.ref  &&  params.prop.ref === constants.TYPES.MONEY)
    //        ?  ' (' + CURRENCY_SYMBOL + ')'
    //        : ''
    return (
      <View style={{paddingBottom: 10, flex: 5}}>
        <FloatLabel
          labelStyle={styles.labelInput}
          autoCorrect={false}
          autoCapitalize={this.state.isRegistration &&  params.prop.name !== 'url' ? 'sentences' : 'none'}
          onFocus={this.inputFocused.bind(this, params.prop.name)}
          inputStyle={this.state.isRegistration ? styles.regInput : styles.input}
          style={styles.formInput}
          value={params.value}
          keyboardType={params.keyboard || 'default'}
          onChangeText={this.onChangeText.bind(this, params.prop)}
        >{label}</FloatLabel>
        {error}
      </View>
    );
  },
  inputFocused(refName) {
    if (!this.state.isRegistration   &&
         this.refs                   &&
         this.refs.scrollView        &&
         this.props.model            &&
         Object.keys(this.props.model.properties).length > 5) {
      utils.scrollComponentIntoView(this.refs.scrollView, this.refs.form.getComponent(refName))
    }
  },
  // scrollDown (){
  //   if (this.refs  &&  this.refs.scrollView) {
  //      this.refs.scrollView.scrollTo(Device.height * 2/3);
  //   }
  // },
  myCustomTemplate(params) {
    var labelStyle = {color: '#cccccc', fontSize: 18, paddingLeft: 10, paddingBottom: 10};
    var textStyle = {color: '#000000', fontSize: 18, paddingLeft: 10, paddingBottom: 10};
    var resource = /*this.props.resource ||*/ this.state.resource
    var label, style
    var propLabel, propName
    var isItem = this.props.metadata != null
    var prop = this.props.model
             ? this.props.model.properties[params.prop]
             : this.props.metadata.items.properties[params.prop]
    if (resource && resource[params.prop]) {
      var m = utils.getId(resource[params.prop]).split('_')[0]
      var rModel = utils.getModel(m).value
      label = utils.getDisplayName(resource[params.prop], rModel.properties)

      if (!label)
        label = resource[params.prop].title
      style = textStyle
      propLabel = <View style={{marginLeft: 10, marginTop: 5, marginBottom: 5, backgroundColor: '#ffffff'}}>
                    <Text style={{fontSize: 12, height: 12, color: '#B1B1B1'}}>{params.label}</Text>
                  </View>
    }
    else {
      label = params.label
      style = labelStyle
      propLabel = <View style={{marginTop: 20}}/>
    }
    var err = this.state.missedRequiredOrErrorValue
            ? this.state.missedRequiredOrErrorValue[prop.name]
            : null
    var error = err
              ? <View style={{paddingLeft: 5, backgroundColor: 'transparent'}}>
                  <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>This field is required</Text>
                </View>
              : <View />
    return (
      <View style={styles.chooserContainer} key={this.getNextKey()} ref={prop.name}>
        <TouchableHighlight underlayColor='white' onPress={this.chooser.bind(this, prop, params.prop)}>
          <View style={{ position: 'relative'}}>
            {propLabel}
            <View style={styles.chooserContentStyle}>
              <Text style={style}>{label}</Text>
              <Icon name='ios-arrow-down'  size={15}  color='#96415A'  style={styles.icon1} />
            </View>
           {error}
          </View>
        </TouchableHighlight>
      </View>
    );
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
    var m = utils.getModel(prop.ref).value;
    var currentRoutes = this.props.navigator.getCurrentRoutes();
    this.props.navigator.push({
      title: m.title,
      titleTextColor: '#7AAAC3',
      id: 10,
      component: ResourceList,
      backButtonTitle: 'Back',
      sceneConfig: isFinancialProduct ? Navigator.SceneConfigs.FloatFromBottom : Navigator.SceneConfigs.FloatFromRight,
      passProps: {
        filter:      filter,
        prop:        prop.name,
        modelName:   prop.ref,
        resource:    resource,
        isRegistration: this.state.isRegistration,
        returnRoute: currentRoutes[currentRoutes.length - 1],
        callback:    this.setChosenValue.bind(this),
      }
    });
  },

  // setting chosen from the list property on the resource like for ex. Organization on Contact
  setChosenValue(propName, value) {
    var resource = {}
    extend(resource, this.state.resource)
    // clause for the items properies - need to redesign
    if (this.props.metadata  &&  this.props.metadata.type === 'array') {
      if (!this.floatingProps)
        this.floatingProps = {}
      this.floatingProps[propName] = value
      resource[propName] = value
    }
    else if (this.props.model.properties[propName].type === 'array')
      resource[propName] = value
    else {
      var id = value[constants.TYPE] + '_' + value[constants.ROOT_HASH]
      resource[propName] = {
        id: id,
        title: utils.getDisplayName(value, utils.getModel(value[constants.TYPE]).value.properties)
      }
      // resource[propame] = value;
      var data = this.refs.form.refs.input.state.value;
      if (data) {
        for (var p in data)
          if (!resource[p])
            resource[p] = data[p];
      }
    }
    this.setState({
      resource: resource,
      prop: propName
    });

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
                    value: params.value.value + '',
                    required: params.required,
                    keyboard: 'numeric',
                  })
          }
          {
             this.myEnumTemplate({
                    prop:     params.prop,
                    enumProp: utils.getModel(constants.TYPES.MONEY).value.properties.currency,
                    required: params.required,
                    value:    params.value.currency,
                    noError: true
                  })
        }
      </View>
    );
  },

  myEnumTemplate(params) {
    var labelStyle = {color: '#cccccc', fontSize: 18, paddingLeft: 10, paddingBottom: 10};
    var textStyle = {color: '#000000', fontSize: 18, paddingLeft: 10, paddingBottom: 10};
    var label
    var prop = params.prop
    var enumProp = params.enumProp
    var error
    if (!params.noError) {
      var err = this.state.missedRequiredOrErrorValue
              ? this.state.missedRequiredOrErrorValue[prop.name]
              : null
      error = err
                ? <View style={{paddingLeft: 5, backgroundColor: 'transparent'}}>
                    <Text style={{fontSize: 14, color: this.state.isRegistration ? '#eeeeee' : '#a94442'}}>Enter a valid {prop.title}</Text>
                  </View>
                : <View />
    }
    else
      error = <View/>
    var style = {marginTop: 30}
    var value = prop ? params.value : resource[enumProp.name]
    return (
      <View style={[styles.chooserContainer, {width: 40}]} key={this.getNextKey()} ref={enumProp.name}>
        <TouchableHighlight underlayColor='white' onPress={this.enumChooser.bind(this, prop, enumProp)}>
          <View style={{ position: 'relative'}}>
            <View style={styles.chooserContentStyle}>
              <Text style={styles.enumText}>{value}</Text>
              <Icon name='ios-arrow-down'  size={15}  color='#96415A'  style={[styles.icon1, styles.enumProp]} />
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
    if (!this.floatingProps)
      this.floatingProps = {}
    if (!this.floatingProps[propName])
      this.floatingProps[propName] = {}
    this.floatingProps[propName][enumPropName] = value[Object.keys(value)[0]]

    if (this.state.isPrefilled) {
      var props = (this.props.model  ||  this.props.metadata).properties
      if (props[propName].ref  &&  props[propName].ref === constants.TYPES.MONEY) {
        if (!this.floatingProps[propName].value  &&  resource[propName]  &&  resource[propName].value)
          this.floatingProps[propName].value = resource[propName].value
      }
    }

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
    let properties = this.props.model.properties
    let err = []
    for (var p in value) {
      let prop = properties[p]
      if (!prop  ||  p.charAt(0) === '_')
        continue
      if (prop.type === 'number' || prop.ref === constants.TYPES.MONEY)
        this.checkNumber(value[p], prop, err)
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
            err[p] = 'The min value for the range should be smaller then the max value'
        }
        else
          err[p] = 'The property with [min-max] range can have only two numbers'
      }
      // 'pattern' can be regex pattern or property where the pattern is defined.
      // It is for country specific patterns like 'phone number'
      else if (prop.pattern) {
        if (!(new RegExp(prop.pattern).test(value[p])))
          err[prop.name] = 'Invalid ' + prop.title
      }
      else if (prop.patterns) {
        let cprops = []
        for (let pr in properties) {
          if (pr.ref && p.ref === 'tradle.Country')
            cprops.push(pr)
        }
        if (!cprops.length)
          continue

        let patternCountry = cprops.find((p) => {
          let val = value[p.name]  ||  resource[p.name]
          return val ? val : undefined
        })
        if (!patternCountry)
          continue
        let pattern = prop.patterns[patternCountry[0]]
        if (pattern  &&  !(new RegExp(pattern).test(value[p])))
          err[prop.name] = 'Invalid ' + prop.title
      }
    }
    return err
  },
  checkNumber(v, prop, err) {
    var p = prop.name
    if (prop.ref === constants.TYPES.MONEY)
      v = v.value
    if (isNaN(v))
      err[p] = 'Please enter a valid number'
    else {
      if (prop.max && v > prop.max)
        err[p] = 'The maximum value for is ' + prop.max
      else if (prop.min && v < prop.min)
        err[p] = 'The minimum value for is ' + prop.min
    }
  },
}


var styles = StyleSheet.create({
  enumProp: {
    marginTop: 30,
  },
  enumText: {
    marginTop: 25,
    marginLeft: 20,
    color: '#757575',
    fontSize: 18
  },
  icon1: {
    width: 15,
    height: 15,
    marginVertical: 2
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: -5,
    marginRight: 5,
  },
  chooserContainer: {
    height: 60,
    borderColor: '#ffffff',
    borderBottomColor: '#cccccc',
    borderBottomWidth: 0.5,
    marginLeft: 10,
    marginBottom: 10,
    flex: 1
  },
  chooserContentStyle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 5,
    borderRadius: 4
  },
  labelInput: {
    color: '#cccccc',
  },
  formInput: {
    borderBottomWidth: 0.5,
    marginLeft: 10,
    borderColor: '#cccccc',
  },
  regInput: {
    borderWidth: 0,
    color: '#eeeeee'
  },
  input: {
    borderWidth: 0,
  }
});
module.exports = NewResourceMixin;

