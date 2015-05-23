'use strict'

var sampleData = require('../data/data');
var sha = require('stable-sha1');
var utils = require('../utils/utils');
var level = require('react-level');
var promisify = require('q-level');

var models = {};
var resources = {};
var db;
var me;

var storeHelper = {
   getDb() {
    if (!db)
      db = promisify(level('identity.db', { valueEncoding: 'json' }));
    return db;
  },
 
  loadResources() {
    var myId = sampleData.getMyId();
    var self = this;
    return this.getDb().createReadStream()
    .on('data', function(data) {
       if (data.key.indexOf('model_') === 0)
         models[data.key] = data;
       else {
         if (!me  &&  myId  && data.value.rootHash == myId)
           me = data.value; 
         resources[data.key] = data;
       } 
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
  
  getMe() {
    return me;
  },
  getResources() {
    if (!this.isEmpty(resources))
      return resources;
    this.loadResources()
    .then(function() {
      return resources;
    });
  },
  isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  },

  getModels() {
    return models;
  },
  getModel(modelName) {
    return models['model_' + modelName];
  },
  loadDB(db) {
    var batch = [];

    sampleData.getModels().forEach(function(m) {
      if (!m.rootHash)
        m.rootHash = sha(m);
      batch.push({type: 'put', key: 'model_' + m.id, value: m});
    });
    sampleData.getResources().forEach(function(r) {
      if (!r.rootHash) 
        r.rootHash = sha(r);

      var key = r['_type'] + '_' + r.rootHash;
      batch.push({type: 'put', key: key, value: r});
    });
    var self = this;
    this.getDb().batch(batch, function(err, value) {
      if (!err)
        self.loadResources();
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
  addOrUpdateResource(key, resource) {
    resources[key] = {key: key, value: resource};
  },
  reloadDb() {  
    db = this.getDb();
    var self = this;
    return db.createReadStream()
    .on('data', function(data) {
       db.del(data.key, function(err) {
         err = err;
       })
    })
    .on('error', function (err) {
      console.log('Oh my!', err.name + ': ' + err.message)
    })
    .on('close', function (err) {
      console.log('Stream closed');
    })
    .on('end', function () {
      self.loadDB(db)
      console.log('Stream end');
    })
  }
}

module.exports = storeHelper;