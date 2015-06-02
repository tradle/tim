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
var MY_IDENTITY_MODEL = 'tradle.MyIdentity';
var RESOURCE_TYPE = '_type'; 

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
    this.ready = this.loadResources()
    .then(function() { 
      list = resources;
    })
    .catch(function(err) {
      err = err;
    });
  },
  onStart() {
    var self = this;
    this.ready.then(function() {
      self.trigger({
        action: 'start',
        models: models,
        me: me});
    });
  },
  onAddMessage(r) { // this will move to messagesStore
    var rootHash = sha(r);
    r.rootHash = rootHash;
    var self = this;
    var key = r[RESOURCE_TYPE] + '_' + rootHash;

    db.put(key, r)
    .then(function() {
      list[key] = {key: key, value: r};
      var to = list[r.to.id].value;
      var from = list[r.from.id].value;
      to.lastMessage = (from.rootHash === me.rootHash) ? 'You: ' + r.message : r.message;
      to.lastMessageTime = r.time;
      from.lastMessage = r.message;
      from.lastMessageTime = r.time;
      var batch = [];
      batch.push({type: 'put', key: to[RESOURCE_TYPE] + '_' + to.rootHash, value: to});
      batch.push({type: 'put', key: from[RESOURCE_TYPE] + '_' + from.rootHash, value: from});

      return db.batch(batch);
    })
    .then(function() {
      // from.lastMessage = r;
      self.trigger({
        action: 'addMessage',
        resource: r
      });
    })
    .catch(function(err) {
      err = err;
    });

  },
  getItem(resource) {
    var modelName = resource[RESOURCE_TYPE];
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
         var propValue = val.value[RESOURCE_TYPE] + '_' + val.value.rootHash;
         var prop = refProps[propValue];
         newResource[prop] = val.value;
         newResource[prop].id = modelName + '_' + newResource.rootHash;
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
          var rValue = resource[p].rootHash ? resource[p][RESOURCE_TYPE] + '_' + resource[p].rootHash : resource[p].id;
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
  onAddItem(value, resource, meta, isRegistration) {
    // Check if there are references to other resources
    var refProps = {};
    var promises = [];
    var foundRefs = [];
    var props = meta.properties;

    for (var p in resource) {
      if (props[p] &&  props[p].type === 'object') {
        var ref = props[p].ref;
        if (ref  &&  resource[p])  {
          var rValue = resource[p].rootHash ? resource[p][RESOURCE_TYPE] + '_' + resource[p].rootHash : resource[p].id;
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
    if (!json[RESOURCE_TYPE])
      json[RESOURCE_TYPE] = meta.id;
    var error = this.checkRequired(json, meta);
    if (error) {
      foundRefs.forEach(function(val) {
        var propValue = val.value[RESOURCE_TYPE] + '_' + val.value.rootHash;
        var prop = refProps[propValue];
        json[prop] = val.value;
      });

      this.trigger({
        action: 'addItem',
        list: list,
        resource: json,
        error: error
      });
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
           var propValue = val.value[RESOURCE_TYPE] + '_' + val.value.rootHash;
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
         self._putResourceInDB(modelName, json, isRegistration);
       else {
         var obj = {};
         extend(true, obj, resource);
         for (var p in json)
           if (!obj[p])
             obj[p] = json[p];
           else if (!props[p].readOnly  &&  !props[p].immutable)
            obj[p] = json[p];
         self._putResourceInDB(modelName, obj, isRegistration);
       }
    })
    .catch(function(err) {
      err = err
    })
      
  },
  checkRequired(resource, meta) {
    var type = resource[RESOURCE_TYPE];
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
  },
  onReloadDB() {
    var self = this;
    this.clearDb()
    .then(function() {
      return self.loadDB(db);
    })
    // .then(function() {
    //   list = resources;
    //   return self.loadAddressBook();
    // })
    .then(function() {
      self.trigger({action: 'reloadDB', list: list});
    })
    .catch(function(err) {
      err = err;
    });
  }, 
  onList(query, modelName, resource, isAggregation) {
    var result;
    result = this.searchResources(query, modelName, resource);
    if (isAggregation) 
      result = this.getDependencies(result);
    this.trigger({action: 'list', list: result, isAggregation: isAggregation});      
  },

  searchResources(query, modelName, to) {
    var foundResources = {};
    var meta = this.getModel(modelName).value;
    var isAllMessages = meta.isInterface;
    var isMessage = isAllMessages  ||  (meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1);
    var props = meta.properties;

    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;

    var required = meta.required;
    var meRootHash = me  &&  me.rootHash;
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

  _putResourceInDB(modelName, value, isRegistration) {    
    // Cleanup null form values
    for (var p in value) {
      if (!value[p])
        delete value[p];      
    } 
    if (!value[RESOURCE_TYPE])
      value[RESOURCE_TYPE] = modelName;
    if (!value.rootHash)
      value.rootHash = sha(value);
    var iKey = modelName + '_' + value.rootHash;
    var batch = [];
    batch.push({type: 'put', key: iKey, value: value});
    var mid;
    if (isRegistration) {
      mid = {_type: MY_IDENTITY_MODEL, id: iKey};
      batch.push({type: 'put', key: MY_IDENTITY_MODEL + '_' + sha(mid), value: mid});
    }

    var self = this;
    db.batch(batch)
    .then(function(results) {
      if (isRegistration)
        me = value;
      return db.get(iKey)
    })
    .then(function(value) {
      list[iKey] = {key: iKey, value: value};
      if (mid)
        list[MY_IDENTITY_MODEL + '_' + mid.rootHash] = mid;
      var  params = {action: 'addItem', list: list, resource: value};
      // registration or profile editing
      if (isRegistration  ||  value.rootHash === me.rootHash)
        params.me = me;
      self.trigger(params);
    })
    .catch(function(err) {
      err = err;
    });
  },
  loadAddressBook() {
    var self = this;
    return Q.ninvoke(AddressBook, 'checkPermission')
    .then(function(permission) {
      // AddressBook.PERMISSION_AUTHORIZED || AddressBook.PERMISSION_UNDEFINED || AddressBook.PERMISSION_DENIED 
      if(permission === AddressBook.PERMISSION_UNDEFINED)
        return Q.ninvoke(AddressBook, 'requestPermission')
               .then(function(permission) {
                 if (permission === AddressBook.PERMISSION_AUTHORIZED)      
                   return self.storeContacts.bind(self);
               });
      else if (permission === AddressBook.PERMISSION_AUTHORIZED)
        return self.storeContacts()
      else if (permission === AddressBook.PERMISSION_DENIED) {
        //handle permission denied 
        return Q();
      }
    })
  },
  storeContacts() {
    var dfd = Q.defer();
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
          if (err) 
            dfd.reject();
          else {
            self.loadResources()
            .then(function() {
              dfd.resolve();
            })
          }
        });
      else
        dfd.resolve();
    })
    return dfd.promise;
  },  
  loadResources() {
    var myId = sampleData.getMyId();
    if (myId)
      myId = IDENTITY_MODEL + '_' + myId;
    var self = this;
    return db.createReadStream()
    .on('data', function(data) {
       if (data.key.indexOf('model_') === 0)
         models[data.key] = data;
       else {
         if (!myId  &&  data.key.indexOf('tradle.MyIdentity_') == 0) {
           myId = data.value.id;
           if (resources[myId])
             me = resources[myId].value;
         }
         if (!me  &&  myId  && data.key == myId)
           me = data.value; 
         resources[data.key] = data;
       } 
     })
    .on('close', function() {
      console.log('Stream closed');
    })      
    .on('end', function() {
      console.log('Stream ended');
      if (self.isEmpty(models))
        return self.loadDb();
    })      
    .on('error', function(err) {
      console.log('err: ' + err);
    });
  },
  
  isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
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

      var key = r[RESOURCE_TYPE] + '_' + r.rootHash;
      batch.push({type: 'put', key: key, value: r});
    });
    var self = this;
    return db.batch(batch)
          .then(self.loadResources)
          .then(self.loadAddressBook);
  },
  clearDb() {  
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
      console.log('Stream end');
    })
  }

});
module.exports = Store;