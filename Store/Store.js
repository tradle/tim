'use strict';

var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var extend = require('extend');
var Q = require('q');
var AddressBook = require('NativeModules').AddressBook;
var sampleData = require('../data/data');
var sha = require('stable-sha1');
var utils = require('../utils/utils');
var level = require('react-level');
var promisify = require('q-level');

var IDENTITY_MODEL = 'tradle.Identity';

var models = {};
var resources = {};
var list;
var db;
var me;
var ready;

function getItemByKey(list, itemKey) {
  return list[itemKey];
}

var Store = Reflux.createStore({
  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],
  // this will be called by all listening components as they register their listeners
  init() {
    db = promisify(level('identity.db', { valueEncoding: 'json' }));
    var self = this;
    this.ready = this.loadResources()
    .then(function() { 
      list = self.getResources();
    });
  },
  onStart() {
    var self = this;
    this.ready.then(function() {
      self.trigger('start', models, me);
    });
  },
  onAddMessage(r) { // this will move to messagesStore
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
  getItem(resource) {
    var modelName = resource['_type'];
    var meta = this.getModel(modelName).value;
    var foundRefs = [];
    var refProps = this.getRefs(resource, foundRefs, meta.properties);
    var self = this;
    var newResource = {};
    extend(newResource, resource);
    for (var i=0; i<foundRefs.length; i++) {
     // foundRefs.forEach(function(val) {
       var val = foundRefs[i];
       if (val.state === 'fulfilled') {
         var propValue = val.value['_type'] + '_' + val.value.rootHash;
         var prop = refProps[propValue];
         newResource[prop] = val.value;
         newResource[prop]['id'] = modelName + '_' + newResource.rootHash;
         if (!newResource[prop].title)
            newResource[prop].title = utils.getDisplayName(newResource, meta);
       }
     }
     return newResource;
  },
  getDependencies(resultList) {
    var self = this;
    var newResult = resultList.map(function(resource) {
      return self.getItem(resource);
    }); 
    return newResult;
  },
  getRefs(resource, foundRefs, props) {
    var refProps = [];
    for (var p in resource) {
      if (props[p] &&  props[p].type === 'object') {
        var ref = props[p].ref;
        if (ref  &&  resource[p]) {
          var rValue = resource[p].rootHash ? resource[p]['_type'] + '_' + resource[p].rootHash : resource[p].id;
          refProps[rValue] = p;
          if (list[rValue]) {
            var elm = {value: list[rValue].value, state: 'fulfilled'};
            foundRefs.push(elm);
          }
        }
      }
    }
    return refProps;
  },
  onAddItem(value, resource, meta) {
    // Check if there are references to other resources
    var refProps = {};
    var promises = [];
    var foundRefs = [];
    var props = meta.properties;

    for (var p in resource) {
      if (props[p] &&  props[p].type === 'object') {
        var ref = props[p].ref;
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
      if (props[p]  &&  props[p].type === 'array') 
        json[p] = resource[p];
    }
    var error = this.checkRequired(json, meta);
    if (error) {
      json['_type'] = resource['_type'];
      foundRefs.forEach(function(val) {
        var propValue = val.value['_type'] + '_' + val.value.rootHash;
        var prop = refProps[propValue];
        json[prop] = val.value;
      });

      this.trigger(list, json, error);
      return;
    }
    // if (error) {
    //   this.listenables[0].addItem.failed(error);
    //   return;
    // }
    Q.allSettled(promises)
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
           var interfaces = meta.interfaces;
           if (interfaces  &&  interfaces.indexOf('tradle.Message') != -1)
             json.time = new Date().getTime();  
         }
       });
      var isNew = !resource.rootHash;
      var modelName = meta.id;
      if (!resource  ||  isNew) 
        self._putResourceInDB(modelName, json);
      else {
        var obj = {};
        extend(true, obj, resource);
        for (var p in json)
          if (!obj[p])
            obj[p] = json[p];
          else if (!props[p].readOnly  &&  !props[p].immutable)
            obj[p] = json[p];
        self._putResourceInDB(modelName, obj);
      }
    })
    .catch(function(err) {
      err = err
    })
      
  },
  checkRequired(resource, meta) {
    var type = resource['_type'];
    var rootHash = resource.rootHash;
    var oldResource = (rootHash) ? resources[type + '_' + rootHash] : null; 
    var required = meta.required;
    if (!required)
      return;
    for (var i=0; i<required.length; i++) {
      var prop = required[i];
      if (!resource[prop] && (!oldResource || !oldResource[prop]))
        return 'Please add "' + meta.properties[prop].title + '"';
    }


    // return 'Error'; 
  },
  onReloadDB() {
    var self = this;
    this.reloadDb()
    .then(function() { 
      self.loadResources()
    })
    .then(function() {
      list = self.getResources();
      self.loadAddressBook();
    })
    .then(function() {
      list = self.getResources();
      self.trigger('reloadDB', list);
    });
  }, 
  onList(query, modelName, resource, isAggregation) {
    var result;
    result = this.searchResources(query, modelName, resource);
    if (isAggregation) 
      result = this.getDependencies(result);
    this.trigger(result, null, isAggregation);      
  },

  searchResources(query, modelName, to) {
    var foundResources = {};
    var meta = this.getModel(modelName).value;
    var isAllMessages = meta.isInterface;
    var isMessage = isAllMessages  ||  (meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1);
    var props = meta.properties;

    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;

    var required = meta.required;
    var meRootHash = me.rootHash;
    for (var key in list) {
      var iMeta;
      if (isAllMessages) {
        if (implementors) {
          for (var i=0; i<implementors.length  &&  !iMeta; i++) {
            if (implementors[i].id.indexOf(key.substring(0, key.indexOf('_'))) === 0)
              iMeta = implementors[i];
          }
        }  
      }
      else if (key.indexOf(modelName + '_') == -1)
        continue;
      if (isMessage  &&  !iMeta)
        iMeta = meta;
      var r = list[key].value;
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isMessage  &&  to) {
        var msgProp = utils.getCloneOf('tradle.Message.message', iMeta.properties);
        if (!r[msgProp]  ||  r[msgProp].trim().length === 0)
          continue;
        var fromProp = utils.getCloneOf('tradle.Message.from', iMeta.properties);
        var toProp = utils.getCloneOf('tradle.Message.to', iMeta.properties);

        var fromID = r[fromProp].id.split(/_/)[1];
        var toID = r[toProp].id.split(/_/)[1];
        if (fromID  !== meRootHash  &&  toID !== meRootHash) 
          continue;
        if (fromID !== to.rootHash  &&  
            toID != to.rootHash)
          continue;
      }
      if (!query) {
         foundResources[key] = r;      
         continue;   
       }
       // primitive filtering for this commit
       var combinedValue = '';
       for (var rr in props) {
         if (r[rr] instanceof Array)
          continue;
         combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
       }
       if (!combinedValue  ||  (combinedValue  &&  (!query || combinedValue.toLowerCase().indexOf(query.toLowerCase()) != -1))) {
         foundResources[key] = r; 
       }
    }
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

  _putResourceInDB(modelName, value) {    
    for (var p in value) {
      if (!value[p])
        delete value[p];      
    } 
    if (!value['_type'])
      value['_type'] = modelName;
    var meta = this.getModel(modelName);
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
  },
  loadAddressBook() {
    AddressBook.checkPermission((err, permission) => {
      // AddressBook.PERMISSION_AUTHORIZED || AddressBook.PERMISSION_UNDEFINED || AddressBook.PERMISSION_DENIED 
      if(permission === AddressBook.PERMISSION_UNDEFINED)
        AddressBook.requestPermission((err, permission) => {
          this.storeContacts()
        })
      else if(permission === AddressBook.PERMISSION_AUTHORIZED)
        this.storeContacts()
      else if(permission === AddressBook.PERMISSION_DENIED){
        //handle permission denied 
      }
    })      
  },
  storeContacts() {
    var self = this;
    var batch = [];
    AddressBook.getContacts(function(err, contacts) {
      contacts.forEach(function(contact) {
        var contactInfo = [];
        var newIdentity = {
          '_type': IDENTITY_MODEL,
          firstName: contact.firstName,
          lastName: contact.lastName,
          // formatted: contact.firstName + ' ' + contact.lastName,          
          contact: contactInfo
        };
        if (contact.thumbnailPath  &&  contact.thumbnailPath.length)
          newIdentity.photos = [{type: 'address book', url: contact.thumbnailPath}];
        var phoneNumbers = contact.phoneNumbers;
        if (phoneNumbers) {
          phoneNumbers.forEach(function(phone) {
            contactInfo.push({identifier: phone.number, type: phone.label + ' phone'})
          })
        } 
        var emailAddresses = contact.emailAddresses;
        if (emailAddresses)
          emailAddresses.forEach(function(email) {
            contactInfo.push({identifier: email.email, type: email.label + ' email'})
          });
        newIdentity.rootHash = sha(newIdentity);
        var key = IDENTITY_MODEL + '_' + newIdentity.rootHash;
        if (!list[key])
          batch.push({type: 'put', key: key, value: newIdentity});
      });      
      if (batch.length)
        db.batch(batch, function(err, value) {
          if (!err) {
            self.loadResources()
          }
        });
    })
  },  
  loadResources() {
    var myId = sampleData.getMyId();
    var self = this;
    return db.createReadStream()
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
    db.batch(batch, function(err, value) {
      if (!err)
        self.loadResources();
    });
  },
  reloadDb() {  
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

});
module.exports = Store;