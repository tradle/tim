'use strict'

var {AsyncStorage} = require('react-native')
var collect = require('stream-collector')
var t = require('tcomb-form-native');
var moment = require('moment');
var constants = require('@tradle/constants');
var TYPE = constants.TYPE
var VERIFICATION = constants.TYPES.VERIFICATION
var MONEY_TYPE = 'tradle.Money';
var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
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
    return models ? models[modelName] : null;
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
  getImplementors(iModel, excludeModels) {
    var implementors = [];
    for (var p in models) {
      var m = models[p].value;
      if (excludeModels) {
        var found = false
        for (var i=0; i<excludeModels.length && !found; i++) {
          if (p === excludeModels[i])
            found = true
          else {
            var em = this.getModel(p).value
            if (em.subClassOf  &&  em.subClassOf === excludeModels[i])
              found = true;
          }
        }
        if (found)
          continue
      }
      if (m.interfaces  &&  m.interfaces.indexOf(iModel) != -1)
        implementors.push(m);
    }
    return implementors;
  },
  getAllSubclasses(iModel) {
    var subclasses = [];
    for (var p in models) {
      var m = models[p].value;
      if (m.subClassOf  &&  m.subClassOf === iModel)
        subclasses.push(m);
    }
    return subclasses;
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
      val = moment(date).format('MMMM Do YYYY, h:mm:ss a');
    }
    return val;
  },
  getItemsMeta(metadata) {
    var props = metadata.properties;
    var required = utils.arrayToObject(metadata.required);
    // if (!required)
    //   return;
    var itemsMeta = {};
    for (var p in props) {
      if (props[p].type == 'array')  //  &&  required[p]) {
        itemsMeta[p] = props[p];
    }
    return itemsMeta;
  },
  makeTitle(resourceTitle, prop) {
    return (resourceTitle.length > 28) ? resourceTitle.substring(0, 28) + '...' : resourceTitle;
  },
  getDisplayName(resource, meta) {
    if (!meta) {
      if (resource.title)
        return resource.title
      else
        meta = this.getModel(resource[constants.TYPE]).value.properties
    }
    var displayName = '';
    for (var p in meta) {
      if (meta[p].displayName) {
        if (resource[p]) {
          if (meta[p].type == 'object') {
            var title = resource[p].title || this.getDisplayName(resource[p], utils.getModel(resource[p][constants.TYPE]).value.properties);
            displayName += displayName.length ? ' ' + title : title;
          }
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
            val += (typeof resource[t] === 'object') ? resource[t].title : resource[t];
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
    if (!message)
      return []
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
    else if (url.indexOf('file:///') === 0)
      return url.replace('file://', '')
    else if (url.indexOf('../') === 0)
      return url
    // else if (url.indexOf('/var/mobile/') == 0)
    //   return url;
    else
      return 'http://' + url;
  },
  sendSigned(driver, opts) {
    return driver.sign(opts.msg)
      .then((signed) => {
        opts.msg = signed
        return driver.send(opts)
      })
  },
  dedupeVerifications(list) {
    var vFound = {}
    var i = list.length
    while (i--) {
      var r = list[i]
      if (r[TYPE] !== VERIFICATION) continue

      var docType = r.document && r.document[TYPE]
      if (!docType) continue

      var org = r.organization && r.organization.id
      if (!org) continue

      var vid = docType + org
      if (vFound[vid]) {
        list.splice(i, 1)
      } else {
        vFound[vid] = true
      }
    }
  },

  readDB(db) {
    // return new Promise((resolve, reject) => {
    //   collect(db.createReadStream(), (err, data) => {
    //     if (err) reject(err)
    //     else resolve(data)
    //   })
    // })

    var prefix = db.location + '!'
    return new Promise((resolve, reject) => {
        collect(db.createKeyStream(), (err, keys) => {
          if (err) reject(err)
          else resolve(keys)
        })
      })
      .then((keys) => {
        if (keys.length) {
          return AsyncStorage.multiGet(keys.map((key) => prefix + key))
        } else {
          return []
        }
      })
      .then((pairs) => {
        return pairs
          .filter((pair) => typeof pair[1] !== 'undefined')
          .map((pair) => {
            try {
              pair[1] = pair[1] && JSON.parse(pair[1])
            } catch (err) {
            }

            return {
              key: pair[0].slice(prefix.length),
              value: pair[1]
            }
          })
      })
  },

  onNextTransitionEnd(navigator, fn) {
    var removeListener = navigator.navigationContext.addListener('didfocus', () => {
      if (removeListener.remove) {
        removeListener.remove()
      } else {
        removeListener()
      }

      setTimeout(fn, 0)
    })
  }
}

module.exports = utils;
/*
  getFormFields(params) {
    var meta = params.meta;
    var model = params.model;
    var models = this.getModels();
    var data = params.data;
    var chooser = params.chooser;
    var content = params.content
    var onSubmitEditing = params.onSubmitEditing;
    var onEndEditing = params.onEndEditing;
    var onChange = params.onChange;
    var myCustomTemplate = params.template
    var moneyTemplate = params.moneyTemplate
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

    var dModel = data  &&  models[data[constants.TYPE]];
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

    var editCols;
    if (params.editCols) {
      editCols = {};
      params.editCols.forEach(function(r) {
        editCols[r] = props[r];
      })
    }
    else
      editCols = this.arrayToObject(meta.editCols);

    var eCols = editCols ? editCols : props;
    var required = this.arrayToObject(meta.required);
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
      if (props[p].description)
        options.fields[p].help = props[p].description;
      if (props[p].readOnly  ||  (props[p].immutable  &&  data  &&  data[p]))
        options.fields[p] = {'editable':  false };
      if (formType) {
        // if (onChange)
        //   options.fields[p].onChange = onChange;
        model[p] = maybe ? t.maybe(formType) : formType;
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
          if (onSubmitEditing)
            options.fields[p].onSubmitEditing = onSubmitEditing;
          if (onEndEditing)
            options.fields[p].onEndEditing = onEndEditing.bind({}, p);
          if (props[p].maxLength)
            options.fields[p].maxLength = props[p].maxLength;
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
          model[p] = maybe ? t.maybe(t.Str) : t.Str;
          // model[p] = maybe ? t.maybe(t.Num) : t.Num;
          if (data[p]  &&  (typeof data[p] != 'number'))
            data[p] = data[p].value

          // options.fields[p].template = moneyTemplate.bind({}, props[p])

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

        var subModel = models[ref];
        if (data  &&  data[p]) {
          options.fields[p].value = data[p][constants.TYPE]
                                  ? data[p][constants.TYPE] + '_' + data[p][constants.ROOT_HASH]
                                  : data[p].id;
          data[p] = utils.getDisplayName(data[p], subModel.value.properties) || data[p].title;
        }

        options.fields[p].onFocus = chooser.bind({}, props[p], p)
        options.fields[p].template = myCustomTemplate.bind({}, {
            label: label,
            prop:  p,
            chooser: options.fields[p].onFocus
          })

        options.fields[p].nullOption = {value: '', label: 'Choose your ' + utils.makeLabel(p)};
      }
    }
    return options;
  },


*/
