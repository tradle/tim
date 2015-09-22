'use strict';

var Reflux = require('reflux');
var Actions = require('../Actions/Actions');
var extend = require('extend');
var Q = require('q');
var AddressBook = require('NativeModules').AddressBook;
var sampleData = require('../data/data');
var voc = require('../data/models');
var sha = require('stable-sha1');
var utils = require('../utils/utils');
var level = require('react-native-level');
var promisify = require('q-level');
var constants = require('tradle-constants');
var isTest, originalMe;
// var Identity = require('midentity');
// var Tim = require('tim');

var tim;
// var levelQuery = require('level-queryengine');
// var jsonqueryEngine = require('jsonquery-engine');
// var Device = require('react-native-device');
// var Sublevel = require('level-sublevel')

var IDENTITY_MODEL = constants.TYPES.IDENTITY;
var MODEL_TYPE_VALUE = 'tradle.Model';
var MY_IDENTITIES_MODEL = 'tradle.MyIdentities';

var models = {};
var list = {};
var idenities = {};
var db; //, identityDb, messagesDb;
var ldb;
var isLoaded;
var me;
var ready;

var Store = Reflux.createStore({
  // this will set up listeners to all publishers in TodoActions, using onKeyname (or keyname) as callbacks
  listenables: [Actions],
  // this will be called by all listening components as they register their listeners
  init() {
    var ldb = level('TiM.db', { valueEncoding: 'json' });
    // ldb = levelQuery(level('TiM.db', { valueEncoding: 'json' }));
    // ldb.query.use(jsonqueryEngine());
    db = promisify(ldb);

    // var sdb = promisify(Sublevel(ldb));
    // identityDb = sdb.sublevel(IDENTITY_MODEL);

    this.ready = this.loadResources()
    .then(function() {
      if (!utils.isEmpty(list))
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
  onAddMessage(r) { 
    var props = this.getModel(r[constants.TYPE]).value.properties;
    var rr = {};
    for (var p in r) {
      if (props[p].ref  &&  !props[p].id) {
        var type = r[p][constants.TYPE];
        var id = type ? type + '_' + r[p][constants.ROOT_HASH] + '_' + r[p][constants.CUR_HASH] : r[p].id;
        var title = type ? utils.getDisplayName(r[p], this.getModel(type).value.properties) : r[p].title
        rr[p] = {
          id: id,
          title: title
        }
      }
      else
        rr[p] = r[p];
    }
    var rootHash = sha(rr);
    rr[constants.ROOT_HASH] = rootHash;
    rr[constants.CUR_HASH] = rootHash;
    var self = this;
    var key = rr[constants.TYPE] + '_' + rootHash;
    var batch = [];
    batch.push({type: 'put', key: key, value: rr})
    // db.put(key, r)
    // .then(function() {
    list[key] = {key: key, value: r};
    var to = list[utils.getId(r.to)].value;
    var from = list[utils.getId(r.from)].value;
    var dn = r.message; // || utils.getDisplayName(r, props);
    if (!dn)
      dn = 'sent photo';

    to.lastMessage = (from[constants.ROOT_HASH] === me[constants.ROOT_HASH]) ? 'You: ' + dn : dn;
    to.lastMessageTime = r.time;
    from.lastMessage = r.message;
    from.lastMessageTime = r.time;
    batch.push({type: 'put', key: to[constants.TYPE] + '_' + to[constants.ROOT_HASH], value: to});
    batch.push({type: 'put', key: from[constants.TYPE] + '_' + from[constants.ROOT_HASH], value: from});

    db.batch(batch)    
    .then(function() {
      self.trigger({
        action: 'addMessage',
        resource: rr
      });
    })
    .catch(function(err) {
      err = err;
    });

  },
  onAddVerification(r, notOneClickVerification) {
    var batch = [];
    var key;
    var fromId = utils.getId(r.from);
    var from = list[fromId].value;
    if (r[constants.ROOT_HASH]) 
      key = r[constants.TYPE] + '_' + r[constants.ROOT_HASH];
    else {
      var rootHash = sha(r);
      r[constants.ROOT_HASH] = rootHash;
      r[constants.CUR_HASH] = rootHash;

      key = r[constants.TYPE] + '_' + rootHash;
      if (from.organization)
        r.organization = from.organization;

      batch.push({type: 'put', key: key, value: r});
    }
    var toId = utils.getId(r.to);
    var verificationRequestId = utils.getId(r.document);
    var to = list[toId].value;
    
    var newVerification = {
      id: key + '_' + r[constants.CUR_HASH], 
      title: r.document.title ? r.document.title : ''
    };
    var verificationRequest = list[verificationRequestId].value;
    if (!verificationRequest.verifiedBy)
      verificationRequest.verifications = [];
    verificationRequest.verifications.push(newVerification);

    if (!from.myVerifications)
      from.myVerifications = [];

    from.myVerifications.push(newVerification);
    if (!to.verifiedByMe)
      to.verifiedByMe = [];
    to.verifiedByMe.push(newVerification);
      
    batch.push({type: 'put', key: verificationRequestId, value: verificationRequest});
    batch.push({type: 'put', key: toId, value: to});
    batch.push({type: 'put', key: fromId, value: from});
    var self = this;
    return db.batch(batch)
    .then(function() {
      var rr = {};
      extend(rr, to);
      rr.verifiedByMe = r;
      list[key] = {key: key, value: r};

      if (notOneClickVerification) 
        self.trigger({action: 'addItem', resource: rr});
      else
        self.trigger({action: 'addVerification', resource: rr});
    })
    .catch(function(err) {
      err = err;
    });
  },
  onGetTo(key) {
    this.onGetItem(key, 'getTo');
  },
  onGetFrom(key) {
    this.onGetItem(key, 'getFrom');
  },
  onGetItem(key, action) {
    var resource = {};
    extend(resource, list[utils.getId(key)].value);
    var props = this.getModel(resource[constants.TYPE]).value.properties;
    for (var p in props) {
      if (p.charAt(0) === '_')
        continue;
      var items = props[p].items;
      if (!items  ||  !items.backlink)
        continue;
      var backlink = items.backlink;
      var itemsModel = this.getModel(items.ref).value;
      var params = {
        modelName: items.ref,
        to: resource,
        meta: itemsModel,
        props: itemsModel.properties
      }
      var result = this.searchNotMessages(params);
      if (result.length)
        resource[p] = result;
    }
    this.trigger({ resource: resource, action: action || 'getItem'});
  },
  onShowIdentityList() {
    if (sampleData.getMyId()) {
      this.trigger({action: 'showIdentityList', list: []});    
      return; 
    }
    var allIdentities = list[MY_IDENTITIES_MODEL + '_1'].value.allIdentities;
    var meId = me[constants.TYPE] + '_' + me[constants.ROOT_HASH];
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
    var myIdentities = list[MY_IDENTITIES_MODEL + '_1'].value;
    myIdentities.currentIdentity = newMe[constants.TYPE] + '_' + newMe[constants.ROOT_HASH];
      var self = this;
    db.put(MY_IDENTITIES_MODEL + '_1', myIdentities)
    .then(function() {
      return self.loadResources()
    })
    .then(function() {
      me = newMe;
      if (me.organization) {
        var photos = list[utils.getId(me.organization.id)].value.photos;
        if (photos)
          me.organization.photo = photos[0].url;
      }
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
      id: resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH], 
      title: utils.getDisplayName(resource, this.getModel(resource[constants.TYPE]).value.properties)
    };
    var myIdentity = list[MY_IDENTITIES_MODEL + '_1'].value;
    myIdentity.allIdentities.push(newIdentity);
    var self = this;
    db.put(MY_IDENTITIES_MODEL + '_1', myIdentity)
    .then(function() {
      list[MY_IDENTITIES_MODEL + '_1'].value = myIdentity;
      self.trigger({action: 'addNewIdentity', resource: me});
    })
    .catch (function(err) {
      err = err;
    })
  },
  onRemoveIdentity(resource) {
    var myIdentity = list[MY_IDENTITIES_MODEL + '_1'].value;
    var iKey = resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH];
    var allIdentities = myIdentity.allIdentities;
    for (var i=0; i<allIdentities.length; i++)
      if (allIdentities[i].id === iKey) {
        allIdentities.splice(i, 1);
        break;
      }
    
    var batch = [];
    resource.canceled = true;
    batch.push({type: 'put', key: iKey, value: resource});
    batch.push({type: 'put', key: MY_IDENTITIES_MODEL + '_1', value: myIdentity});

    var self = this;
    db.batch(batch)
    .then(function() {
      delete list[resource[constants.TYPE] + '_' + resource[constants.ROOT_HASH]];
      self.trigger({action: 'removeIdentity', resource: resource});
    })
    .catch (function(err) {
      err = err;
    })

  },

  getItem(resource) {
    var modelName = resource[constants.TYPE];
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
         var propValue = val.value[constants.TYPE] + '_' + val.value[constants.ROOT_HASH];
         var prop = refProps[propValue];
         newResource[prop] = val.value;
         newResource[prop].id = val.value[constants.TYPE] + '_' + val.value[constants.ROOT_HASH];
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
          if (resource[p][constants.ROOT_HASH])
            rValue = resource[p][constants.TYPE] + '_' + resource[p][constants.ROOT_HASH];
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
      var from = props.from;
      if (!from)
        err += '"from" is required. Should have {ref: "tradle.Identity"}';

      var to = props.to;
      if (!to)
        err += '"to" is required. Should have {ref: "tradle.Identity"}';
      var time = props.time;
      if (!time)
        err += '"time" is required';

      if (err.length) {
        self.trigger({action: 'newModelAdded', err: err});
        return;
      }
      model.interfaces = [];
      model.interfaces.push('tradle.Message');
      var rootHash = sha(model);
      model[constants.ROOT_HASH] = rootHash;
      model[constants.OWNER] = {
        key: IDENTITY_MODEL + '_' + me[constants.ROOT_HASH],
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
    if (meta[constants.TYPE] == 'tradle.Verification'  ||  (meta.subClassOf  &&  meta.subClassOf == 'tradle.Verification'))
      return this.onAddVerification(resource, true);

    for (var p in resource) {
      if (props[p] &&  props[p].type === 'object') {
        var ref = props[p].ref;
        if (ref  &&  resource[p])  {
          if (props[p].ref  &&  this.getModel(props[p].ref).value.inlined) 
            continue;
          var rValue = resource[p][constants.ROOT_HASH] ? resource[p][constants.TYPE] + '_' + resource[p][constants.ROOT_HASH] : utils.getId(resource[p].id);
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
    if (!json[constants.TYPE])
      json[constants.TYPE] = meta.id;
    var error = this.checkRequired(json, props);
    if (error) {
      foundRefs.forEach(function(val) {
        var propValue = val.value[constants.TYPE] + '_' + val.value[constants.ROOT_HASH];
        var prop = refProps[propValue];
        json[prop] = val.value;
      });

      this.trigger({
        action: 'addItem',
        // list: list,
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
          var propValue = value[constants.TYPE] + '_' + value[constants.ROOT_HASH];
          var prop = refProps[propValue];
         
          var title = utils.getDisplayName(value, self.getModel(value[constants.TYPE]).value.properties);
          json[prop] = {
            title: title,
            id: propValue  + '_' + value[constants.CUR_HASH]
          }
          var interfaces = meta.interfaces;
          if (interfaces  &&  interfaces.indexOf('tradle.Message') != -1)
            json.time = new Date().getTime();  
        }
      });
      var isNew = !resource[constants.ROOT_HASH];
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
    var type = resource[constants.TYPE];
    var rootHash = resource[constants.ROOT_HASH];
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
  onMessageList(params) {
    this.onList(params);
  },
  onList(params) {
    if (isLoaded) 
      this.getList(params);
    else {
      var self = this;
      this.loadDB()
      .then(function() {
        isLoaded = true;
        if (params.modelName) 
          self.getList(params);
      });
    }
  },
  getList(params) { //query, modelName, resource, isAggregation, prop) {
    var result = this.searchResources(params);
    if (params.isAggregation) 
      result = this.getDependencies(result);
    var resultList = [];
    for (var r of result) {
      var rr = {};
      extend(rr, r);
      resultList.push(rr);
    }
    var model = this.getModel(params.modelName).value;
    var isMessage = model.isInterface  ||  (model.interfaces  &&  model.interfaces.indexOf('tradle.Message') != -1);   
    var verificationsToShare; 
    if (isMessage  &&  !params.isAggregation) 
      verificationsToShare = this.getVerificationsToShare(result, params.to);
    var retParams = {
      action: isMessage  &&  !params.prop ? 'messageList' : 'list',
      list: resultList, 
      isAggregation: params.isAggregation      
    }
    if (verificationsToShare)
      retParams.verificationsToShare = verificationsToShare;
    if (params.prop)
      retParams.prop = params.prop;

    this.trigger(retParams);              
  },
  searchResources(params) {
    var meta = this.getModel(params.modelName).value;
    var isMessage = meta.isInterface  ||  (meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1);    
    if (isMessage)
      return this.searchMessages(params);
    else
      return this.searchNotMessages(params);
  },  
  searchNotMessages(params) {
    var foundResources = {};
    var modelName = params.modelName;
    var to = params.to;
    var meta = this.getModel(modelName).value;
    var props = meta.properties;
    var containerProp, resourceId;
    // to variable if present is a container resource as for example subreddit for posts or post for comments
    // if to is passed then resources only of this container need to be returned
    if (to) {
      for (var p in props) {
        if (props[p].ref  &&  props[p].ref === to[constants.TYPE]) {
          containerProp = p;
          resourceId = to[constants.TYPE] + '_' + to[constants.ROOT_HASH];
        }
      }
    }
    var query = params.query;

    var required = meta.required;
    var meRootHash = me  &&  me[constants.ROOT_HASH];
    var meId = IDENTITY_MODEL + '_' + meRootHash;
    for (var key in list) {
      if (key.indexOf(modelName + '_') == -1)
        continue;
      var r = list[key].value;
      if (r.canceled)
        continue;
      // if (r[constants.OWNER]) {
      //   var id = utils.getId(r[constants.OWNER]);
      //   if (id != me[constants.TYPE] + '_' + me[constants.ROOT_HASH])
      //     continue;
      // }
      if (containerProp  &&  (!r[containerProp]  ||  utils.getId(r[containerProp]) !== resourceId))
        continue;
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
    // Don't show current 'me' contact in contact list or my identities list
    var isIdentity = modelName === IDENTITY_MODEL;
    if (!containerProp  &&  me  &&  isIdentity) {
      if (sampleData.getMyId()) 
        delete foundResources[IDENTITY_MODEL + '_' + me[constants.ROOT_HASH]];
      else if (!isTest) {
        var myIdentities = list[MY_IDENTITIES_MODEL + '_1'].value.allIdentities;
        for (var meId of myIdentities) {
          if (foundResources[meId.id])
             delete foundResources[meId.id];
        }
      }
    }

    var result = utils.objectToArray(foundResources);
    if (isIdentity) {
      result.forEach(function(r) {
        if (r.organization) {
          var photos = list[utils.getId(r.organization.id)].value.photos;
          if (photos)
            r.organization.photo = photos[0].url;
        }      
      });
    }

    var sortProp = params.sortProperty;
    if (sortProp) {
      var asc = (typeof params.asc != 'undefined') ? params.asc : false;
      if (props[sortProp].type == 'date') {
        result.sort(function(a,b) {
          var aVal = a[sortProp] ? a[sortProp] : 0;
          var bVal = b[sortProp] ? b[sortProp] : 0;
          if (asc)
            return new Date(aVal) - new Date(bVal);
          else
            return new Date(bVal) - new Date(aVal);
        });      
      }
      else if (props[sortProp].type == 'string')  {
        result.sort();
        if (asc)
          result.reverse();
      }
      else if (props[sortProp].type == 'number') {
        result.sort(function(a, b) {
          return asc ? a - b : b - a
        }); 
      }        
    }
    return result;
  },
  searchMessages(params) {
    var query = params.query;
    var modelName = params.modelName;
    var meta = this.getModel(modelName).value;
    var isVerification = modelName === 'tradle.Verification'  ||  (meta.subClassOf  &&  meta.subClassOf === 'tradle.Verification');
    var chatTo = params.to;
    var prop = params.prop;
    if (typeof prop === 'string')
      prop = meta[prop];
    var backlink = prop ? prop.items.backlink : prop;
    var foundResources = {};
    var isAllMessages = meta.isInterface;
    var props = meta.properties;

    var implementors = isAllMessages ? utils.getImplementors(modelName) : null;

    var required = meta.required;
    var meRootHash = me  &&  me[constants.ROOT_HASH];
    var meId = IDENTITY_MODEL + '_' + meRootHash;
    var meOrgId = me.organization ? utils.getId(me.organization) : null;

    var chatId = chatTo ? chatTo[constants.TYPE] + '_' + chatTo[constants.ROOT_HASH] : null;
    var isChatWithOrg = chatTo  &&  chatTo[constants.TYPE] === 'tradle.Organization';
    if (isChatWithOrg  &&  !chatTo.name) {
      chatTo = list[chatId].value;
    }
    var testMe = chatTo ? chatTo.me : null;
    if (testMe) {
      if (testMe === 'me') {
        if (!originalMe) 
          originalMe = me;
        testMe = originalMe[constants.ROOT_HASH];
      }

      isTest = true;
      var meId = constants.TYPES.IDENTITY + '_' + testMe;
      me = list[meId].value;
      utils.setMe(me);
      var myIdentities = list[MY_IDENTITIES_MODEL + '_1'].value;
      if (myIdentities)
        myIdentities.currentIdentity = meId;
    }
    var toModelName = chatTo ? chatId.split('_')[0] : null;
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
      else if (key.indexOf(modelName + '_') === -1) {
        var rModel = this.getModel(key.split('_')[0]).value;
        if (!rModel.subClassOf  ||  rModel.subClassOf !== modelName)
          continue;
      }
      if (!iMeta)
        iMeta = meta;
      var r = list[key].value;
      if (r.canceled)
        continue;
      // Make sure that the messages that are showing in chat belong to the conversation between these participants
      if (isVerification) {
        if (r.organization) {
          if (!r.organization.photos) {
            var orgPhotos = list[utils.getId(r.organization.id)].value.photos;
            if (orgPhotos)
              r.organization.photos = [orgPhotos[0]];
          }
        }
        if (r.document  &&  r.document.id) 
          r.document = list[utils.getId(r.document.id)].value;
      }
      if (chatTo) {
        if (backlink  &&  r[backlink]) {
          if (chatId === utils.getId(r[backlink])) 
            foundResources[key] = r;
          
          continue;
        }
        var isVerificationR = r[constants.TYPE] === 'tradle.Verification'  ||  r[constants.TYPE].subClassOf === 'tradle.Verification';
        if ((!r.message  ||  r.message.trim().length === 0) && !r.photos &&  !isVerificationR) 
          // check if this is verification resource
          continue;
        var fromID = utils.getId(r.from); 
        var toID = utils.getId(r.to);
       
        if (fromID !== meId  &&  toID !== meId  &&  toID != meOrgId) 
          continue;
        var id = toModelName + '_' + chatTo[constants.ROOT_HASH];
        if (isChatWithOrg) { 
          var toOrgId = null, fromOrgId = null;

          if (list[fromID].value.organization) 
            fromOrgId = utils.getId(list[fromID].value.organization);
          else if (fromID.split('_')[0] === 'tradle.Organization')
            fromOrgId = utils.getId(list[fromID].value);
          if (list[toID].value.organization) 
            toOrgId = utils.getId(list[toID].value.organization);
          else if (toID.split('_')[0] === 'tradle.Organization')
            toOrgId = utils.getId(list[toID].value);

          if (chatId !== toOrgId  &&  chatId !== fromOrgId)
            continue;
          if (fromID != meId  &&  toID != meId)
            continue
        }
        else if (fromID !== id  &&  toID != id  &&  toID != meOrgId)
          continue;
      }
      if (isVerificationR) {
        r.document = list[utils.getId(r.document)].value;

      }
      if (!query) {
        // foundResources[key] = r;
        var msg = this.fillMessage(r);
        if (msg)
          foundResources[key] = msg;
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
        foundResources[key] = this.fillMessage(r); 
      }
    }

    var result = utils.objectToArray(foundResources);

    // find possible verifications for the requests that were not yet fulfilled from other verification providers

    result.sort(function(a,b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(a.time) - new Date(b.time);
    });
    // not for subreddit
    for (let r of result) {
      r.from.photos = list[utils.getId(r.from)].value.photos; 
      r.to.photos = list[utils.getId(r.to)].value.photos; 
    }
    return result;
  },
  fillMessage(r) {
    var resource = {};
    extend(resource, r);      
    if (!r.verifications  ||  !r.verifications.length) 
      return resource;
    for (var i=0; i<resource.verifications.length; i++) {
      var v = resource.verifications[i];
      var vId = v.id ? utils.getId(v.id) : v[constants.TYPE] + '_' + v[constants.ROOT_HASH];
      var ver = {};
      extend(ver, list[vId].value);
      resource.verifications[i] = ver;
      if (ver.organization  &&  !ver.organization.photos) {
        var orgPhotos = list[utils.getId(ver.organization.id)].value.photos;
        if (orgPhotos)
          ver.organization.photo = orgPhotos[0].url;
      }
      // resource.time = ver.time;
    }
    return resource;
  },
  getVerificationsToShare(foundResources, to) {
    var verTypes = [];
    var meId = me[constants.TYPE] + '_' + me[constants.ROOT_HASH];
    for (var i=0; i<foundResources.length; i++) {
      var r = foundResources[i];
      if (me  &&  utils.getId(r.to) !== meId)
        continue;
      if (r[constants.TYPE] !== 'tradle.SimpleMessage'  ||  r.verifications) 
        continue;
      var msgParts = utils.splitMessage(r.message);
      // Case when the needed form was sent along with the message
      if (msgParts.length !== 2) 
        continue;
      var msgModel = utils.getModel(msgParts[1]);
      if (msgModel) 
        verTypes.push(msgModel.value.id);      
    }
    var verificationsToShare = {};
    if (!verTypes.length) 
      return;

    for (var key in list) {
      var type = key.split('_')[0];
      var model = utils.getModel(type).value;
      if (model.id !== 'tradle.Verification' && (!model.subClassOf  ||  model.subClassOf !== 'tradle.Verification'))
        continue;
      
      var doc = list[key].value.document;
      var docType = (doc.id && doc.id.split('_')[0]) || doc[constants.TYPE];
      if (verTypes.indexOf(docType) === -1)
        continue;
      var val = list[key].value;
      var id = utils.getId(val.to.id);
      if (id === meId) {
        var document = doc.id ? list[utils.getId(doc.id)].value : doc;
        if (to  &&  to.organization  &&  document.verifications) {
          var thisCompanyVerification;
          for (var i=0; i<document.verifications.length; i++) {
            var v = document.verifications[i];
            if (v.organization  &&  utils.getId(to.organization) === utils.getId(v.organization)) {
              thisCompanyVerification = true;
              break;
            }
          }
          if (thisCompanyVerification)
            continue;
        }
        var value = {};
        extend(value, list[key].value);
        value.document = document;
        var v = verificationsToShare[docType];
        if (!v)
          verificationsToShare[docType] = [];
        verificationsToShare[docType].push(value);
      }
    } 
    return verificationsToShare;
  },
  _putResourceInDB(modelName, value, isRegistration) {    
    // Cleanup null form values
    for (var p in value) {
      if (!value[p])
        delete value[p];      
    } 
    if (!value[constants.TYPE])
      value[constants.TYPE] = modelName;
    
    value[constants.CUR_HASH] = sha(value);
    var meta = this.getModel(modelName).value;
    var props = meta.properties;
    if (!value[constants.ROOT_HASH]) {
      value[constants.ROOT_HASH] = value[constants.CUR_HASH];
      var creator = me  
                  ?  me 
                  :  isRegistration ? value : null;
      if (creator) {
        value[constants.OWNER] = {
          id: IDENTITY_MODEL + '_' + creator[constants.ROOT_HASH] + '_' + creator[constants.CUR_HASH],
          title: utils.getDisplayName(me, this.getModel(IDENTITY_MODEL))
        };
      }
      if (props.dateSubmitted) 
        value.dateSubmitted = new Date().getTime();
    }
    
    var iKey = modelName + '_' + value[constants.ROOT_HASH];
    var batch = [];

    if (meta.isInterface  ||  (meta.interfaces  &&  meta.interfaces.indexOf('tradle.Message') != -1)) {
      if (props['to']  &&  props['from']) {
        var to = list[utils.getId(value.to)].value;
        var from = list[utils.getId(value.from)].value;
        var dn = value.message || utils.getDisplayName(value, props);
        to.lastMessage = (from[constants.ROOT_HASH] === me[constants.ROOT_HASH]) ? 'You: ' + dn : dn;
        to.lastMessageTime = value.time;
        from.lastMessage = value.message;
        from.lastMessageTime = value.time;
        batch.push({type: 'put', key: to[constants.TYPE] + '_' + to[constants.ROOT_HASH], value: to});
        batch.push({type: 'put', key: from[constants.TYPE] + '_' + from[constants.ROOT_HASH], value: from});
      }
    }
    // if (value[constants.TYPE] == IDENTITY_MODEL)
    //   batch.push({type: 'put', key: iKey, value: value, prefix: identityDb});
    // else
    batch.push({type: 'put', key: iKey, value: value});

    var mid;
    
    if (isRegistration) {
      mid = {
        _type: MY_IDENTITIES_MODEL, 
        currentIdentity: iKey, 
        allIdentities: [{
          id: iKey, 
          title: utils.getDisplayName(value, models['model_' + modelName].value.properties)
        }]};
      batch.push({type: 'put', key: MY_IDENTITIES_MODEL + '_1', value: mid});///
    }

    var self = this;

    db.batch(batch)
    .then(function(results) {
      if (isRegistration) {
        me = value;
        if (me.organization) {
          var photos = list[utils.getId(me.organization.id)].value.photos;
          if (photos)
            me.organization.photo = photos[0].url;
        }
      }
      return db.get(iKey)
    })
    .then(function(value) {
      list[iKey] = {key: iKey, value: value};
      if (mid) 
        list[MY_IDENTITIES_MODEL + '_1'] = {key: MY_IDENTITIES_MODEL + '_1', value: mid};
    //   return self.loadDB(db);
    // })    
    // .then(function() {
      var  params = {action: 'addItem', resource: value};
      // registration or profile editing
      if (isRegistration  ||  value[constants.ROOT_HASH] === me[constants.ROOT_HASH])
        params.me = value;
      self.trigger(params);
    })
    .catch(function(err) {
      err = err;
    });
  },
  loadAddressBook() {
    return;
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
          firstName: contact.firstName,
          lastName: contact.lastName,
          // formatted: contact.firstName + ' ' + contact.lastName,          
          contactInfo: contactInfo
        };
        newIdentity[constants.TYPE] = IDENTITY_MODEL;
        var me = list[MY_IDENTITIES_MODEL + '_1'];
        if (me)  {
          var currentIdentity = me.value.currentIdentity;
          newIdentity[constants.OWNER] = {id: currentIdentity, title: utils.getDisplayName(me, props)};
          if (me.organization) {
            var photos = list[utils.getId(me.organization.id)].value.photos;
            if (photos)
              me.organization.photo = photos[0].url;
          }
        }
        
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
        newIdentity[constants.ROOT_HASH] = sha(newIdentity);
        newIdentity[constants.CUR_HASH] = newIdentity[constants.ROOT_HASH];
        var key = IDENTITY_MODEL + '_' + newIdentity[constants.ROOT_HASH];
        if (!list[key])
          batch.push({type: 'put', key: key, value: newIdentity});
      });      
      if (batch.length)
        // identityDb.batch(batch, function(err, value) {
        db.batch(batch, function(err, value) {
          if (err) 
            dfd.reject(err);
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
    // var qq = { $and: [{ type: MODEL_TYPE_VALUE }]};    
    
    // db.query(qq)
    // // return db.createReadStream()
    // .on('data', function(data) {
    //    models['model_' + data.id] = data;
    //  })
    // .on('close', function() {
    //   console.log('Stream closed');
    // })      
    // .on('end', function() {
    //   console.log('Stream ended');
    //   if (self.isEmpty(models) || Object.keys(list).length == 2)
    //     if (me)
    //       return self.loadDB();
    //     else {
    //       isLoaded = false;
    //       return self.loadModels();
    //     }
    //   // else
    //   //   return self.loadAddressBook();
    // })      
    // .on('error', function(err) {
    //   console.log('err: ' + err);
    // });
    var loadingModels = false;
    return db.createReadStream()
    .on('data', function(data) {
       if (data.key.indexOf('model_') === 0) {
         models[data.key] = data;
         self.setPropertyNames(data.value.properties);
       }
       else {
         if (!myId  &&  data.key === MY_IDENTITIES_MODEL + '_1') {
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
      if (me  &&  me.organization) {
        var photos = list[utils.getId(me.organization.id)].value.photos;
        if (photos)
          me.organization.photo = photos[0].url;
      }
      console.log('Stream closed');
      utils.setModels(models);
    })      
    .on('end', function() {
      console.log('Stream ended');
      if (me)
        utils.setMe(me);
      var noModels = self.isEmpty(models);
      if (noModels || Object.keys(list).length == 2)
        if (me)
          return self.loadDB();
        else {
          isLoaded = false;
          if (noModels)
            return self.loadModels();
        }
      // else
      //   return self.loadAddressBook();
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
  loadDB(loadTest) {
    loadTest = true;
    // var lt = !Device.isIphone();
    var batch = [];

    if (loadTest) {
      voc.getModels().forEach(function(m) {
        if (!m[constants.ROOT_HASH])
          m[constants.ROOT_HASH] = sha(m);
        batch.push({type: 'put', key: 'model_' + m.id, value: m});
      });
      sampleData.getResources().forEach(function(r) {
        if (!r[constants.ROOT_HASH]) 
          r[constants.ROOT_HASH] = sha(r);
        r[constants.CUR_HASH] = r[constants.ROOT_HASH];
        var key = r[constants.TYPE] + '_' + r[constants.ROOT_HASH];
        // if (r[constants.TYPE] === IDENTITY_MODEL)
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
    }
    else {
      return this.loadAddressBook()
            .catch(function(err) {
              err = err;
              });
    }
  },
  loadModels() {
    var batch = [];

    voc.getModels().forEach(function(m) {
      if (!m[constants.ROOT_HASH])
        m[constants.ROOT_HASH] = sha(m);
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
