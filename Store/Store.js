'use strict';

var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var storeHelper = require('./storeHelper');
var extend = require('extend');
var Q = require('q');
var utils = require('../utils/utils');
var sha = require('stable-sha1');

// var level = require('react-level');
// var promisify = require('q-level');

var contactPrefix = 'tradle.Identity_';
var db = storeHelper.getDb();
var list;

function getItemByKey(list, itemKey) {
  return list[itemKey];
}

var Store = Reflux.createStore({
  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],
  // this will be called by all listening components as they register their listeners
  init: function() {
    storeHelper.loadResources()
    .then(function() { 
      list = storeHelper.getResources();
    });

  },
  onAddMessage: function(r) { // this will move to messagesStore
    var rootHash = sha(r);
    r.rootHash = rootHash;
    var self = this;
    var key = r['_type'] + '_' + rootHash;

    db.put(key, r)
    .then(function() {
      list[key] = {key: key, value: r};
      self.trigger(list, r);
    })
    .catch(function(err) {
      err = err;
    });

  },
  onAddItem: function(value, resource, model) {
    // Check if there are references to other resources
    var refProps = {};
    var promises = [];
    var foundRefs = [];
    var meta = model.properties;

    for (var p in resource) {
      if (meta[p] &&  meta[p].type === 'object') {
        var ref = meta[p].ref;
        if (ref  &&  resource[p]  &&  resource[p].rootHash)  {
          var rValue = resource[p]['_type'] + '_' + resource[p].rootHash;
          refProps[rValue] = p;
          if (list[rValue]) {
            var elm = {value: list[rValue].value, state: 'fulfilled'};
            foundRefs.push(elm);
          }
          else
            promises.push(Q.ninvoke(db, 'get', rValue));
        }
      }
    }
    // Add items properties if they were created
    var self = this;  
    var json = JSON.parse(JSON.stringify(value));
    for (p in resource) {
      if (meta[p]  &&  meta[p].type === 'array') 
        json[p] = resource[p];
    }
    return Q.allSettled(promises)
    .then(function(results) {
       extend(foundRefs, results);
       foundRefs.forEach(function(val) {
         if (val.state === 'fulfilled') {
           var propValue = val.value['_type'] + '_' + val.value.rootHash;
           var prop = refProps[propValue];
           var title = json[prop];
           json[prop] = {
             title: title,
             id : propValue
           }
           var interfaces = model.interfaces;
           if (interfaces  &&  interfaces.indexOf('tradle.Message') != -1)
             json.time = new Date().getTime();  
         }
       });
      var isNew = !resource.rootHash;
      var modelName = model.id;
      if (!resource  ||  isNew) 
        self._putResourceInDB(modelName, json);
      else {
        var obj = {};
        extend(true, obj, resource);
        for (var p in json)
          if (!obj[p])
            obj[p] = json[p];
          else if (!meta[p].readOnly  &&  !meta[p].immutable)
            obj[p] = json[p];
        self._putResourceInDB(modelName, obj);
      }
    })
    .catch(function(err) {
      err = err
    })
      
  },
  onReloadDB: function() {
    var self = this;
    storeHelper.reloadDb()
    .then(function() {
      list = storeHelper.getResources();
      self.trigger('reloadDB', list);
    });
  }, 
  onList: function(query, modelName, resource) {
    var result;
    result = this.searchResources(query, modelName, resource, list);
    this.trigger(result);      
  },
  searchResources: function(query, modelName, resource, resources) {
    var foundResources = {};
    var model = storeHelper.getModel(modelName).value;
    var isMessage = model.isInterface;
    var meta = model.properties;

    var implementors = isMessage ? utils.getImplementors(modelName) : null;

    var required = model.required;
    var meRootHash = storeHelper.getMe().rootHash;
    for (var key in resources) {
      var iModel;
      if (isMessage  &&  implementors) {
        for (var i=0; i<implementors.length  &&  !iModel; i++) {
          if (implementors[i].id.indexOf(key.substring(0, key.indexOf('_'))) === 0)
            iModel = implementors[i];
        }
        if (!iModel)
          continue;
      }
      else if (key.indexOf(modelName + '_') == -1)
        continue;
      var r = resources[key].value;
      if (isMessage  &&  resource) {
        var msgProp = utils.getCloneOf('tradle.Message.message', iModel.properties);
        if (!r[msgProp]  ||  r[msgProp].trim().length === 0)
          continue;
        var fromProp = utils.getCloneOf('tradle.Message.from', iModel.properties);
        var toProp = utils.getCloneOf('tradle.Message.to', iModel.properties);

        var fromID = r[fromProp].id.split(/_/)[1];
        var toID = r[toProp].id.split(/_/)[1];
        if (fromID  !== meRootHash  &&  toID !== meRootHash) 
          continue;
        if (fromID !== resource.rootHash  &&  
            toID != resource.rootHash)
          continue;
      }
      if (!query) {
         foundResources[key] = r;      
         continue;   
       }
       // primitive filtering for this commit
       var combinedValue = '';
       for (var rr in meta) {
         if (r[rr] instanceof Array)
          continue;
         combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
       }
       if (!combinedValue  ||  (combinedValue  &&  (!query || combinedValue.toLowerCase().indexOf(query.toLowerCase()) != -1))) {
         foundResources[key] = r; 
       }
    }

    // if (this.state.filter !== query) {
    //   // do not update state if the query is stale
    //   return;
    // }
    var result = utils.objectToArray(foundResources);
    if (isMessage) {
      result.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.time) - new Date(b.time);
      });
    }
    return result;
  },

  _putResourceInDB: function (modelName, value) {    
    for (var p in value) {
      if (!value[p])
        delete value[p];      
    } 
    if (!value['_type'])
      value['_type'] = modelName;
    var meta = storeHelper.getModel(modelName);
    if (!value.rootHash)
      value.rootHash = sha(value);
    var iKey = modelName + '_' + value.rootHash;
    var self = this;
    db.put(iKey, value)
    .then(function() {
      return db.get(iKey)
    })
    .then(function(value) {
      list[iKey] = {key: iKey, value: value};
      self.trigger(list, value);
    })
    .catch(function(err) {
      err = err;
    });
  }
});
module.exports = Store;