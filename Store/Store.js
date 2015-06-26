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
// var Sublevel = require('level-sublevel')

var IDENTITY_MODEL = 'tradle.Identity';
var MY_IDENTITY_MODEL = 'tradle.MyIdentity';
var RESOURCE_TYPE = '_type'; 

var models = {};
var list = {};
var idenities = {};
var db; //, identityDb, messagesDb;
var isLoaded;
var me;
var ready;

var Store = Reflux.createStore({
  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],
  // this will be called by all listening components as they register their listeners
  init() {
    var ldb = level('TiM.db', { valueEncoding: 'json' });
    db = promisify(ldb);

    // var sdb = promisify(Sublevel(ldb));
    // identityDb = sdb.sublevel(IDENTITY_MODEL);

    this.ready = this.loadResources()
    .then(function(){
      isLoaded = true;
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
    var props = this.getModel(r['_type']).value.properties;
    var rr = {};
    for (var p in r) {
      if (props[p].ref  &&  !props[p].id) {
        var type = r[p]['_type'];
        rr[p] = {
          id: type + '_' + r[p].rootHash + '_' + r[p].currentHash,
          title: utils.getDisplayName(r[p], this.getModel(type).value.properties)
        }
      }
      else
        rr[p] = r[p];
    }
    var rootHash = sha(rr);
    rr.rootHash = rootHash;
    rr.currentHash = rootHash;
    var self = this;
    var key = rr[RESOURCE_TYPE] + '_' + rootHash;
    r = rr;
    db.put(key, r)
    .then(function() {
      list[key] = {key: key, value: r};
      var to = list[utils.getId(r.to)].value;
      var from = list[utils.getId(r.from)].value;
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
      // var rr = {};
      // extend(rr, r);
      self.trigger({
        action: 'addMessage',
        resource: rr
      });
    })
    .catch(function(err) {
      err = err;
    });

  },
  onAddVerification(r) {
    if (!r.rootHash) {
      var rootHash = sha(r);
      r.rootHash = rootHash;
      r.currentHash = rootHash;
      var self = this;
      var key = r[RESOURCE_TYPE] + '_' + rootHash;
      var batch = [];

      var toId = utils.getId(r.verifier);
      var fromId = utils.getId(r.from);
      var verificationRequestId = utils.getId(r.document);
      var to = list[toId].value;
      var from = list[fromId].value;
      
      var newVerification = {id: key + '_' + r.currentHash, title: r.document.title ? r.document.title : ''};

      var verificationRequest = list[verificationRequestId].value;
      if (!verificationRequest.verifiedBy)
        verificationRequest.verifiedBy = [];
      verificationRequest.verifiedBy.push({ verification: newVerification} );

      if (!from.myVerifications)
        from.myVerifications = [];

      from.myVerifications.push({ verification: newVerification});
      if (!to.verifiedByMe)
        to.verifiedByMe = [];
      to.verifiedByMe.push({ verification: newVerification} );
      
      batch.push({type: 'put', key: key, value: r});
    }
    batch.push({type: 'put', key: toId, value: to});
    batch.push({type: 'put', key: fromId, value: from});
    return db.batch(batch)
    .then(function() {
      var rr = {};
      extend(rr, to);
      rr.verifiedByMe = r;
      self.trigger({action: 'addVerification', resource: rr});
    });
  },
  onGetItem(key) {
    var resource = {};
    extend(resource, list[utils.getId(key)].value);
    this.trigger({ resource: resource, action: 'getItem'});
  },
  onShowIdentityList() {
    if (sampleData.getMyId()) {
      this.trigger({action: 'showIdentityList', list: []});    
      return; 
    }
    var allIdentities = list[MY_IDENTITY_MODEL + '_1'].value.allIdentities;
    var meId = me['_type'] + '_' + me.rootHash;
    var result = [];
    if (allIdentities) {
      for (var id of allIdentities)
        if (id.id != meId) {
          var resource = {};
          if (list[id.id].value.canceled)
            continue;
          extend(resource, list[id.id].value);
          result.push(resource);
        }
    }
    this.trigger({action: 'showIdentityList', list: result});    
  },
  
  onChangeIdentity(newMe) {
    var myIdentities = list[MY_IDENTITY_MODEL + '_1'].value;
    myIdentities.currentIdentity = newMe['_type'] + '_' + newMe.rootHash;
      var self = this;
    db.put(MY_IDENTITY_MODEL + '_1', myIdentities)
    .then(function() {
      return self.loadResources()
    })
    .then(function() {
      me = newMe;
      list = {};
      return self.loadResources()
            .then(function() {
              var result = self.searchResources('', IDENTITY_MODEL, me);
              self.trigger({action: 'changeIdentity', list: result, me: me});
            });
    })
    .catch(function(err) {
      err = err;
    });
  },

  onAddNewIdentity(resource) {
    var newIdentity = {
      id: resource['_type'] + '_' + resource.rootHash, 
      title: utils.getDisplayName(resource, this.getModel(resource['_type']).value.properties)
    };
    var myIdentity = list[MY_IDENTITY_MODEL + '_1'].value;
    myIdentity.allIdentities.push(newIdentity);
    var self = this;
    db.put(MY_IDENTITY_MODEL + '_1', myIdentity)
    .then(function() {
      list[MY_IDENTITY_MODEL + '_1'].value = myIdentity;
      self.trigger({action: 'addNewIdentity', resource: me});
    })
    .catch (function(err) {
      err = err;
    })
  },
  onRemoveIdentity(resource) {
    var myIdentity = list[MY_IDENTITY_MODEL + '_1'].value;
    var iKey = resource['_type'] + '_' + resource.rootHash;
    var allIdentities = myIdentity.allIdentities;
    for (var i=0; i<allIdentities.length; i++)
      if (allIdentities[i].id === iKey) {
        allIdentities.splice(i, 1);
        break;
      }
    
    var batch = [];
    resource.canceled = true;
    batch.push({type: 'put', key: iKey, value: resource});
    batch.push({type: 'put', key: MY_IDENTITY_MODEL + '_1', value: myIdentity});

    var self = this;
    db.batch(batch)
    .then(function() {
      delete list[resource['_type'] + '_' + resource.rootHash];
      self.trigger({action: 'removeIdentity', resource: resource});
    })
    .catch (function(err) {
      err = err;
    })

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
          var rValue;
          // reference property could be set as a full resource (for char to have all info at hand when displaying the message) 
          // or resource id
          if (resource[p].rootHash)
            rValue = resource[p][RESOURCE_TYPE] + '_' + resource[p].rootHash;
          else 
            rValue = utils.getId(resource[p]);
          
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
  onAddModelFromUrl(url) {
    var self = this;
    var model, props;
    return fetch(url)
    .then((response) => response.json())
    .then(function(responseData) {
      model = responseData;
      props = model.properties;
      
      var err = ''; 
      var id = model.id;

      if (!id) 
        err += '"id" is required. Could be something like "myGithubId.nameOfTheModel"';
      var key = 'model_' + id;
      // if (models[key])
      //   err += '"id" is not unique';
      var message = model.message;
      if (!message  &&  props.message)
        props.message.cloneOf = 'tradle.Message.message';
      var from = props.from;
      if (!from)
        err += '"from" is required. Should have {ref: "tradle.Identity"}';
      else 
        props.from.cloneOf = 'tradle.Message.from';

      var to = props.to;
      if (!to)
        err += '"to" is required. Should have {ref: "tradle.Identity"}';
      else
        props.to.cloneOf = 'tradle.Message.to';
      var time = props.time;
      if (!time)
        err += '"time" is required';
      else
        props.time.cloneOf = 'tradle.Message.time';

      if (err.length) {
        self.trigger({action: 'newModelAdded', err: err});
        return;
      }
      model.interfaces = [];
      model.interfaces.push('tradle.Message');
      var rootHash = sha(model);
      model.rootHash = rootHash;
      model.owner = {
        key: IDENTITY_MODEL + '_' + me.rootHash,
        title: utils.getDisplayName(me, self.getModel(IDENTITY_MODEL).value.properties),
        photos: me.photos
      }
      return db.put(key, model);
    })
    .then(function() {
      if (!me.myModels)
        me.myModels = [];
      var key = 'model_' + model.id;
      me.myModels.push({key: key, title: model.title});
      
      self.setPropertyNames(props);

      models[key] = {
        key: key,
        value: model
      };
      self.trigger({action: 'newModelAdded', newModel: model});
    })     
    .catch(function(err) {
      err = err;
    })
    .done();
  },
  setPropertyNames(props) {
    for (var p in props) {
      if (!props[p].name)
        props[p].name = p;
      if (!props[p].title)
        props[p].title = utils.makeLabel(p);
    } 
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
    var error = this.checkRequired(json, props);
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
          var value = val.value;
          var propValue = value[RESOURCE_TYPE] + '_' + value.rootHash;
          var prop = refProps[propValue];
         
          var title = utils.getDisplayName(value, self.getModel(value[RESOURCE_TYPE]).value.properties);
          json[prop] = {
            title: title,
            id: propValue  + '_' + value.currentHash
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
    var oldResource = (rootHash) ? list[type + '_' + rootHash] : null; 
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
    isLoaded = false;
    // this.clearDb()
    // .then(function() {
    //   list = {};
    //   return self.loadDB();
    // })
    // .then(function() {
    //   self.trigger({action: 'reloadDB', list: list});
    // })
    this.clearDb()
    .then(function() {
      list = {};
      models = {};
      me = null;
      return self.loadModels();
    })
    .then(function() {
      self.trigger({action: 'reloadDB', models: models});
    })
    .catch(function(err) {
      err = err;
    });
  }, 
  onMessageList(query, modelName, resource, isAggregation) {
    this.onList(query, modelName, resource, isAggregation);
  },
  onList(query, modelName, resource, isAggregation) {
    if (isLoaded) 
      this.getList(query, modelName, resource, isAggregation);
    else {
      var self = this;
      this.loadDB()
      .then(function() {
        isLoaded = true;
        if (modelName) 
        self.getList(query, modelName, resource, isAggregation);
      });
    }
  },
  getList(query, modelName, resource, isAggregation) {
    var result = this.searchResources(query, modelName, resource);
    if (isAggregation) 
      result = this.getDependencies(result);
    var resultList = [];
    for (var r of result) {
      var rr = {};
      extend(rr, r);
      resultList.push(rr);
    }
    var model = this.getModel(modelName).value;

    this.trigger({action: model.isInterface  ||  model.interfaces ? 'messageList' : 'list', list: resultList, isAggregation: isAggregation});              
  },
  searchResources(query, modelName, to) {
    var meta = this.getModel(modelName).value;
    var isMessage = meta.isInterface  ||  (meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1);    
    if (isMessage)
      return this.searchMessages(query, modelName, to);
    else
      return this.searchNotMessages(query, modelName, to);
  },  
  searchNotMessages(query, modelName, to) {
    var foundResources = {};
    var meta = this.getModel(modelName).value;
    var props = meta.properties;

    var required = meta.required;
    var meRootHash = me  &&  me.rootHash;
    var meId = IDENTITY_MODEL + '_' + meRootHash;
    for (var key in list) {
      if (key.indexOf(modelName + '_') == -1)
        continue;
      var r = list[key].value;
      if (r.canceled)
        continue;
      if (r.creator_) {
        var id = utils.getId(r.creator_);
        if (id != me['_type'] + '_' + me.rootHash)
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
    if (me  &&  modelName === IDENTITY_MODEL  &&  !sampleData.getMyId()) {
      var myIdentities = list[MY_IDENTITY_MODEL + '_1'].value.allIdentities;
      for (var meId of myIdentities) {
        if (foundResources[meId.id])
           delete foundResources[meId.id];
      }
    }

    var result = utils.objectToArray(foundResources);
    return result;
  },
  searchMessages(query, modelName, to) {
    var foundResources = {};
    var meta = this.getModel(modelName).value;
    var isAllMessages = meta.isInterface;
    var props = meta.properties;

    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;

    var required = meta.required;
    var meRootHash = me  &&  me.rootHash;
    var meId = IDENTITY_MODEL + '_' + meRootHash;
    for (var key in list) {
      var iMeta = null;
      if (isAllMessages) {
        if (implementors) {
          for (var impl of implementors) {
            if (impl.id.indexOf(key.substring(0, key.indexOf('_'))) === 0) {
              iMeta = impl;
              break;
            }
          }
          if (!iMeta)
            continue;
        }  
      }
      else if (key.indexOf(modelName + '_') == -1)
        continue;
      if (!iMeta)
        iMeta = meta;
      var r = list[key].value;
      if (r.canceled)
        continue;
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (to) {
        if ((!r.message  ||  r.message.trim().length === 0) && !r.photos)
          continue;
        var fromID = utils.getId(r.from); 
        var toID = utils.getId(r.to);
        if (fromID !== meId  &&  toID !== meId) 
          continue;
        var id = IDENTITY_MODEL + '_' + to.rootHash;
        if (fromID !== id  &&  toID != id)
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
    result.sort(function(a,b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(a.time) - new Date(b.time);
    });
    for (let r of result) {
      r.from.photos = list[utils.getId(r.from)].value.photos; 
      r.to.photos = list[utils.getId(r.to)].value.photos; 
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

    value.currentHash = sha(value);
    if (!value.rootHash) {
      value.rootHash = value.currentHash;
      var creator = me  
                  ?  me 
                  :  isRegistration ? value : null;
      if (creator) {
        value.creator_ = {
          id: IDENTITY_MODEL + '_' + creator.rootHash + '_' + creator.currentHash,
          title: utils.getDisplayName(me, this.getModel(IDENTITY_MODEL))
        };
      }
    }
    
    var iKey = modelName + '_' + value.rootHash;
    var batch = [];
    // if (value[RESOURCE_TYPE] == IDENTITY_MODEL)
    //   batch.push({type: 'put', key: iKey, value: value, prefix: identityDb});
    // else
    batch.push({type: 'put', key: iKey, value: value});

    var mid;
    
    if (isRegistration) {
      mid = {
        _type: MY_IDENTITY_MODEL, 
        currentIdentity: iKey, 
        allIdentities: [{
          id: iKey, 
          title: utils.getDisplayName(value, models['model_' + modelName].value.properties)
        }]};
      batch.push({type: 'put', key: MY_IDENTITY_MODEL + '_1', value: mid});///
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
        list[MY_IDENTITY_MODEL + '_1'] = {key: MY_IDENTITY_MODEL + '_1', value: mid};
    //   return self.loadDB(db);
    // })    
    // .then(function() {
      var  params = {action: 'addItem', resource: value};
      // registration or profile editing
      if (isRegistration  ||  value.rootHash === me.rootHash)
        params.me = value;
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
    var props = models['model_' + IDENTITY_MODEL].value.properties;
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
        var me = list[MY_IDENTITY_MODEL + '_1'];
        if (me) 
          newIdentity.owner = {id: IDENTITY_MODEL + '_' + me.rootHash, title: utils.getDisplayName(me, props)};
        
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
        newIdentity.currentHash = newIdentity.rootHash;
        var key = IDENTITY_MODEL + '_' + newIdentity.rootHash;
        if (!list[key])
          batch.push({type: 'put', key: key, value: newIdentity});
      });      
      if (batch.length)
        // identityDb.batch(batch, function(err, value) {
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
       if (data.key.indexOf('model_') === 0) {
         models[data.key] = data;
         self.setPropertyNames(data.value.properties);
       }
       else {
         if (!myId  &&  data.key === MY_IDENTITY_MODEL + '_1') {
           myId = data.value.currentIdentity;
           if (list[myId])
             me = list[myId].value;
         }
         if (!me  &&  myId  && data.key == myId)
           me = data.value; 
         list[data.key] = data;
       } 
     })
    .on('close', function() {
      console.log('Stream closed');
    })      
    .on('end', function() {
      console.log('Stream ended');
      if (self.isEmpty(models))
        if (me)
          return self.loadDB();
        else {
          isLoaded = false;
          return self.loadModels();
        }
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
  loadDB() {
    var batch = [];

    sampleData.getModels().forEach(function(m) {
      if (!m.rootHash)
        m.rootHash = sha(m);
      batch.push({type: 'put', key: 'model_' + m.id, value: m});
    });
    sampleData.getResources().forEach(function(r) {
      if (!r.rootHash) 
        r.rootHash = sha(r);
      r.currentHash = r.rootHash;
      var key = r[RESOURCE_TYPE] + '_' + r.rootHash;
      // if (r[RESOURCE_TYPE] === IDENTITY_MODEL)
      //   batch.push({type: 'put', key: key, value: r, prefix: identityDb});
      // else
        batch.push({type: 'put', key: key, value: r});

    });
    var self = this;
    return db.batch(batch)
          .then(self.loadResources)
          .then(self.loadAddressBook)
          .catch(function(err) {
            err = err;
            });
  },
  loadModels() {
    var batch = [];

    sampleData.getModels().forEach(function(m) {
      if (!m.rootHash)
        m.rootHash = sha(m);
      batch.push({type: 'put', key: 'model_' + m.id, value: m});
    });
    var self = this;
    return db.batch(batch)
          .then(function() {
            return self.loadResources();
          })
          .catch(function(err) {
            err = err;
            });
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
