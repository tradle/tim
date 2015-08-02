'use strict'

var t = require('tcomb-form-native');
var moment = require('moment');
var constants = require('tradle-constants');

var MONEY_TYPE = 'tradle.Money';
var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num,
  'integer': t.Num
};
var models, me;

var utils = {
  isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  },
  setMe(meR) {
    me = meR;
  },
  getMe() {
    return me;
  },
  setModels(modelsRL) {
    models = modelsRL;
  },
  getModels() {
    return models;
  },
  getModel(modelName) {
    return models ? models['model_' + modelName] : null;
  },
  makeLabel(label) {
    return label
          // insert a space before all caps
          .replace(/([A-Z])/g, ' $1')
          // uppercase the first character
          .replace(/^./, function(str){ return str.toUpperCase(); })
  },  
  arrayToObject(arr) {
    if (!arr)
      return;

    var obj = arr.reduce(function(o, v, i) {
      o[v.trim()] = i;
      return o;
    }, {});
    return obj;
  },
  objectToArray(obj) {
    if (!obj)
      return;

    return Object.keys(obj).map(function (key) {return obj[key]});
  },
  getImplementors(iModel) {
    var implementors = [];
    for (var p in models) {
      var m = models[p].value;
      if (m.interfaces  &&  m.interfaces.indexOf(iModel) != -1) 
        implementors.push(m);
    }
    return implementors;
  },
  getFormFields(params) {
    var meta = params.meta;
    var model = params.model;
    var models = this.getModels();
    var data = params.data;
    var chooser = params.chooser;
    var onSubmitEditing = params.onSubmitEditing;
    var onEndEditing = params.onEndEditing;
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
    // var currency = t.enums({
    //   USD: '$',
    //   GBR: '£',
    //   CNY: '¥'
    // });

    // var moneyModel = t.struct({
    //    value: t.Num,
    //    currency: currency
    // });

    var dModel = data  &&  models['model_' + data[constants.TYPE]];
    if (!this.isEmpty(data)) {
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
          // var cloneOf = this.getCloneOf(dModel.value.id + '.' + p, props);
          // if (cloneOf) {
          //   data[cloneOf] = data[p];
          //   delete data[p];
          // }
        }
      }
    }
    var editCols = this.arrayToObject(meta.editCols);
      
    var eCols = editCols ? editCols : props;
    var required = this.arrayToObject(meta.required);
    // var d = data ? data[i] : null;
    for (let p in eCols) {
      if (p === constants.TYPE  ||  p === bl)
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
        bufferDelay: 20 // to eliminate missed keystrokes
      }
      if (props[p].description) 
        options.fields[p].help = props[p].description;
      if (props[p].readOnly  ||  (props[p].immutable  &&  data  &&  data[p]))
        options.fields[p] = {'editable':  false };
      if (formType) {
        model[p] = maybe ? t.maybe(formType) : formType;
        if (data  &&  (type == 'date')) {
          data[p] = new Date(data[p]);
          options.fields[p] = { mode: 'date'};
          options.fields[p].auto = 'labels';
        }
        else if (type === 'string') {
          if (props[p].maxLength > 100)
            options.fields[p].multiline = true;
          options.fields[p].autoCorrect = false;
        }
        if (!options.fields[p].multiline && (type === 'string'  ||  type === 'integer')) {
          if (onSubmitEditing) 
            options.fields[p].onSubmitEditing = onSubmitEditing;
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind({}, p);
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
        if (!ref)
          continue;
        if (ref === MONEY_TYPE) {
          model[p] = maybe ? t.maybe(t.Num) : t.Num;
          if (data[p]  &&  (typeof data[p] != 'number'))
            data[p] = data[p].value
          // model[p] = maybe ? t.maybe(moneyModel) : moneyModel;
          // options.fields[p].auto = 'labels';
          // options.fields[p].options = {
          //   fields: {
          //     value: {
          //       auto: 'placeholders'
          //     }
          //   }
          // }
          if (onSubmitEditing) 
            options.fields[p].onSubmitEditing = onSubmitEditing;
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind({}, p);   
          continue;       
        }
        model[p] = maybe ? t.maybe(t.Str) : t.Str;

        var subModel = models['model_' + ref];
        if (data  &&  data[p]) {
          options.fields[p].value = data[p][constants.TYPE] 
                                  ? data[p][constants.TYPE] + '_' + data[p][constants.ROOT_HASH]
                                  : data[p].id; 
          data[p] = utils.getDisplayName(data[p], subModel.value.properties) || data[p].title;
        }

        options.fields[p].onFocus = chooser.bind({}, props[p], p);
        options.fields[p].nullOption = {value: '', label: 'Choose your ' + utils.makeLabel(p)};
      }
      
    }
    return options;
  },
  getId(r) {
    if (typeof r === 'string') {
      var idArr = r.split('_');
      return idArr.length === 2 ? r : idArr[0] + '_' + idArr[1];      
    }
    if (r.id) {
      var idArr = r.id.split('_');
      return idArr.length === 2 ? r.id : idArr[0] + '_' + idArr[1];
    }
    else 
      return r[constants.TYPE] + '_' + r[constants.ROOT_HASH];    
  },
  getFormattedDate(dateTime) {
    var date = new Date(dateTime);
    var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
    var val;
    switch (dayDiff) {
    case 0:
      val = moment(date).format('[today], h:mA');
      break;
    case 1:
      val = moment(date).format('[yesterday], h:m');
      break;
    default:      
      val = moment(date).format('ddd, h:m');
    }
    return val;
  },
  getItemsMeta(metadata) {
    var props = metadata.properties;
    var required = utils.arrayToObject(metadata.required);
    // if (!required)
    //   return;
    var itemsMeta = [];
    for (var p in props) {
      if (props[p].type == 'array')  //  &&  required[p]) {
        itemsMeta.push(props[p]);      
    }
    return itemsMeta;
  },
  getDisplayName(resource, meta) {
    if (!meta)
      return resource.title;
    var displayName = '';
    for (var p in meta) {
      if (meta[p].displayName) {
        if (resource[p]) {
          if (meta[p].type == 'object') 
            displayName += displayName.length ? ' ' + resource[p].title : resource[p].title;
          else
            displayName += displayName.length ? ' ' + resource[p] : resource[p];
        }
        else if (meta[p].displayAs) {
          var dn = this.templateIt(meta[p], resource);
          if (dn)
            displayName += displayName.length ? ' ' + dn : dn;
        }

      }  
    }
    return displayName;
  },
  
  templateIt(prop, resource) {
    var template = prop.displayAs;
    var val = '';
    if (template instanceof Array) {
      template.forEach(function(t) {
        if (t.match(/[a-z]/i)) {
          if (resource[t]) {
            if (val  &&  val.charAt(val.length - 1).match(/[a-z,]/i))
              val += ' ';
            val += resource[t];
          }
        }
        else if (val.length  &&  val.indexOf(t) != val.length - 1)
          val += t;
      });
    } 
    return val;
  },
  formatDate(date) {
    var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
    var val;
    switch (dayDiff) {
    case 0:
      val = moment(date).fromNow();
      break;
    case 1:
      val = moment(date).format('[yesterday], h:mA');
      break;
    default:      
      val = moment(date).format('LL');
    }
    return val;
  },
  splitMessage(message) {
    var lBr = message.indexOf('[');          
    var msg;
    if (lBr == -1) 
      return [message];
    var rBr = message.indexOf(']', lBr);
    if (rBr == -1) 
      return [message];
    if (message.charAt(rBr + 1) != '(') 
      return [message];
    var rRoundBr = message.indexOf(')', rBr);
    if (rRoundBr == -1) 
      return [message];
    else {
      if (lBr)
        return [message.substring(0, lBr), message.substring(lBr + 1, rBr), message.substring(rBr + 2, rRoundBr)];
      else        
        return [message.substring(lBr + 1, rBr), message.substring(rBr + 2, rRoundBr)];
    }
  },
  getImageUri(url) {
    if (!url)
      return null;
    if (url.indexOf('data') === 0 || url.indexOf('assets-') === 0 || url.indexOf('http') === 0)
      return url;
    else if (url.indexOf('/var/mobile/') == 0)
      return url;
    else
      return 'http://' + url;
  }
  
}

module.exports = utils;
