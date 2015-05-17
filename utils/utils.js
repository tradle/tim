'use strict'

var t = require('tcomb-form-native');
var sampleData = require('../data/data');
var sha = require('stable-sha1');
var moment = require('moment');
var level = require('react-level');
var promisify = require('q-level');

var models = sampleData.getModels();
var resources = sampleData.getResources();
var db = promisify(level('identity.db', { valueEncoding: 'json' }))

var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num,
  'integer': t.Num
};

var modelsLoaded = false;
var me;

var utils = {
  isEmpty: function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
  },
  getDb: function() {
    return db;
  },
  getMe() {
    return me;
  },
  loadModels: function() {
    var myId = sampleData.getMyId();
    var self = this;
    models.length = 0;
    this.getDb().createReadStream()
    .on('data', function(data) {
       if (data.key.indexOf('model_') === 0)
         models[data.key] = data;
       if (!me  &&  myId  && data.value.rootHash == myId)
         me = data.value; 
     })
    .on('close', function() {
      console.log('Stream closed');
    })      
    .on('end', function() {
      console.log('Stream ended');
    })      
    .on('error', function(err) {
      console.log('err: ' + err);
    });
  },
  getModels: function() {
    return models;
  },
  getModel: function(modelName) {
    return models['model_' + modelName];
  },
  makeLabel: function(label) {
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
    var models = this.getModels();
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
    var options = {};
    options.fields = {};
 
    var props = meta.items ? meta.items.properties : meta.properties;

    var dModel = data  &&  models['model_' + data['_type']];
    if (data) {
      if (data['_type'] !== meta.id) {
        var interfaces = meta.interfaces;
        if (!interfaces  ||  interfaces.indexOf(data['_type']) == -1) 
           return;

        data['_type'] = meta.id;          
        for (var p in data) {
          if (p == '_type')
            continue;
          if (props[p])
            continue;
          var cloneOf = this.getCloneOf(dModel.value.id + '.' + p, props);
          if (cloneOf) {
            data[cloneOf] = data[p];
            delete data[p];
          }
        }
      }
    }
    var editCols = this.arrayToObject(meta.editCols);
      
    var eCols = editCols ? editCols : props;
    var required = this.arrayToObject(meta.required);
    // var d = data ? data[i] : null;
    for (var p in eCols) {
      if (p === '_type')
        continue;
      var maybe = required  &&  !required.hasOwnProperty(p);

      var type = props[p].type;
      var formType = propTypesMap[type];
      // Don't show readOnly property in edit mode if not set
      if (props[p].readOnly  &&  (type === 'date'  ||  !data  ||  !data[p]))
        continue;

      var label = props[p].title;
      if (!label)
        label = utils.makeLabel(p);
      options.fields[p] = {
        error: 'Insert a valid ' + label
      }
      if (props[p].readOnly  ||  (props[p].immutable  &&  data  &&  data[p]))
        options.fields[p] = {'editable':  false };
      if (formType) {
        model[p] = maybe ? t.maybe(formType) : formType;
        if (data  &&  (type == 'date')) {
          data[p] = new Date(data[p]);
          options.fields[p] = { mode: 'date'};
        }
        else if (type === 'string') {
          if (props[p].multiline)
            options.fields[p].multiline = true;
          options.fields[p].autoCorrect = false;
        }
      }
      else if (type === 'array') {
        props[p].range = p;
        continue;
      }
      else if (type != 'enum') {
        var ref = props[p].ref;
        if (!ref)
         continue;
        model[p] = maybe ? t.maybe(t.Str) : t.Str;

        var subModel = models['model_' + ref];
        if (data  &&  data[p]) {
          options.fields[p].value = data[p]['_type'] + '_' + data[p].rootHash; // || data[p]['_type'] + '_' + sha(data[p]);
          data[p] = utils.getDisplayName(data[p], subModel.value.properties) || data[p].title;
        }

        options.fields[p].onFocus = chooser.bind(event, props[p], p);
        options.fields[p].nullOption = {value: '', label: 'Choose your ' + utils.makeLabel(p)};
      }
      else {
          // var rModel = {};
          // var options = getModel(meta[type], rModel);
          // model[propName] = rModel;
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
      }
      
    }
    return options;
  },
  getCloneOf: function(prop, meta) {
    for (var p in meta) {
      var cloneOf = meta[p].cloneOf;
      if (cloneOf  &&  cloneOf === prop)
        return p;
    }
    var pp = prop.split(/\./g);
    var propName = pp[pp.length - 1];
    if (meta[propName])
      return propName;
    // var iModelName = prop.slice(0, prop.lastIndexOf('.').length());

    // if (cloneOf  &&  cloneOf.type === ) {
    //   return cloneOf;
    // }
  },
  loadDB: function(db) {
    var batch = [];

    models.forEach(function(m) {
      if (!m.rootHash)
        m.rootHash = sha(m);
      batch.push({type: 'put', key: 'model_' + m.id, value: m});
    });
    resources.forEach(function(r) {
      if (!r.rootHash) 
        r.rootHash = sha(r);

      var key = r['_type'] + '_' + r.rootHash;
      batch.push({type: 'put', key: key, value: r});
    });
    db.batch(batch, function(err, value) {
      console.log(err + '; ' + value);
    });
  },
  getItemsMeta(metadata) {
    var props = metadata.properties;
    var required = utils.arrayToObject(metadata.required);
    if (!required)
      return;
    var itemsMeta = [];
    for (var p in props) {
      if (props[p].type == 'array'  &&  required[p]) {
        if (!props[p].title)
          props[p].title = utils.makeLabel(p);
        props[p].range = p; 
        itemsMeta.push(props[p]);
      }
    }
    return itemsMeta;
  },
  getDisplayName(resource, meta) {
    if (!meta)
      return resource.title;
    var displayName = '';
    for (var p in resource) {
      if (meta[p]  &&  meta[p].displayName) {
        if (meta[p].ref)
          displayName += displayName.length ? ' ' + resource[p].title : resource[p].title;
        else
          displayName += displayName.length ? ' ' + resource[p] : resource[p];
      }
    }
    return displayName;
  },
  
  loadModelsAndMe(db, models) {
    var myId = sampleData.getMyId();
    var self = this;
    var me;
    return db.createReadStream()
    .on('data', function(data) {
       if (data.key.indexOf('model_') === 0)
         models[data.key] = data;
       if (myId  && data.value.rootHash == myId)
         me = data.value; 
     })
    .on('close', function() {
      console.log('Stream closed');
      return me;
    })      
    .on('end', function() {
      console.log('Stream ended');
    })      
    .on('error', function(err) {
      console.log('err: ' + err);
    });
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
      val = moment(date).format('ddd, h:mA');
    }
    return val;
  }

}

module.exports = utils;