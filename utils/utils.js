'use strict'

var {
  AsyncStorage,
  NativeModules,
  findNodeHandle,
  Dimensions
} = require('react-native')
var RCTUIManager = NativeModules.UIManager
var crypto = require('crypto')
var Q = require('q')
var collect = require('stream-collector')
var t = require('tcomb-form-native');
// var moment = require('moment');
var dateformat = require('dateformat')
var Backoff = require('backoff')
var extend = require('xtend')
var levelErrors = require('levelup/lib/errors')
// TODO: add logbase to deps
var rebuf = require('logbase').rebuf
var parseDBValue = function (pair) {
  return pair[1] && rebuf(JSON.parse(pair[1]))
}
var strMap = {
  'Please fill out this form and attach a snapshot of the original document': 'fillTheForm'
}
var translatedStrings = {
  en: require('./strings_en.json'),
  nl: require('./strings_nl.json')
}
var constants = require('@tradle/constants');
var TYPE = constants.TYPE
var VERIFICATION = constants.TYPES.VERIFICATION
var LocalizedStrings = require('react-native-localization')
let defaultLanguage = new LocalizedStrings({ en: {}, nl: {} }).getLanguage()
var dictionaries = require('@tradle/models').dict

var strings = translatedStrings[defaultLanguage]
var dictionary = dictionaries[defaultLanguage]

var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};
var models, me;
var BACKOFF_DEFAULTS = {
  randomisationFactor: 0,
  initialDelay: 1000,
  maxDelay: 60000
}

var DEFAULT_FETCH_TIMEOUT = 5000
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
    if (!me)
      return

    if (me.languageCode) {
      strings = translatedStrings[me.languageCode]
      if (me.dictionary)
        dictionary = me.dictionary
      else if (dictionaries[me.languageCode])
        dictionary = dictionaries[me.languageCode]
    }
    if (!strings)
      strings = translatedStrings[defaultLanguage]
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
  translate(...args) {
    if (typeof args[0] === 'string')
      return utils.translateString(...args)
    if (args.length === 1)
      return utils.translateModel(args[0])
    else
      return utils.translateProperty(args[0], args[1])
  },
  translateProperty(property, model) {
    if (!dictionary)
      return property.title || utils.makeLabel(property.name)
    let translations = dictionary.properties[property.name]
    return (translations) ? translations[model.id] || translations.Default : property.title || utils.makeLabel(property.name)
  },
  translateModel(model) {
    if (!dictionary)
      return model.title
    return dictionary.models[model.id] || model.title

  },
  translateString(...args) {
    if (!strings)
      return args[0]

    let s = strings[args[0]]
    if (!s)
      return args[0]

    // if (args.length === 2  &&  typeof args[1] === 'object') {
    //   let pos = 0
    //   do {
    //     let i1 = s.indexOf('{', pos)
    //     if (i1 === -1)
    //       break
    //     let i2 = s.indexOf('}, i1')
    //     if (i2 === -1)
    //       break
    //     s = s.substring(0, i1) + args[1][s.substring(i1 + 1, i2)] + s.substring(i2 + 1)
    //   } while(true)
    // }
    // else
    if (args.length > 1) {
      for (let i=1; i<args.length; i++) {
        let insert = '{' + i + '}'
        let idx = s.indexOf(insert)
        if (idx === -1)
          continue
        s = s.substring(0, idx) + args[i] + s.substring(idx + insert.length)
      }
    }
    return s ? s : args[0]
  },
  getStringName(str) {
    return strMap[str]
  },
  createAndTranslate(s, isEnumValue) {
    let stringName = s.replace(/\w\S*/g, function(txt) {
      return  isEnumValue
            ? txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            : txt
    })
    stringName = stringName.replace(/[^a-zA-Z0-9]/g, '')
    // stringName = stringName.charAt(0).toLowerCase() + stringName.slice(1)
    let t = utils.translate(stringName)
    // return t !== stringName ? t : (isEnumValue ? s : utils.makeLabel(s))
    return t !== stringName ? t : s
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
    let m = this.getModel(resource[constants.TYPE])
    var displayName = '';
    for (var p in meta) {
      if (p.charAt(0) === '_')
        continue
      if (!meta[p].displayName) {
        if (m  &&  resource[p]  &&  m.value.subClassOf === 'tradle.Enum')
          return resource[p];
        continue
      }
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
    return displayName;
  },

  templateIt(prop, resource) {
    var template = prop.displayAs;
    var val = '';
    let self = this
    if (template instanceof Array) {
      template.forEach(function(t) {
        if (t.match(/[a-z]/i)) {
          if (resource[t]) {
            if (val  &&  val.charAt(val.length - 1).match(/[a-z,]/i))
              val += ' ';

            if ((typeof resource[t] !== 'object'))
              val += resource[t]
            else {
              if (resource[t].title)
                val += resource[t]
              else {
                let m = self.getModel(resource[t][constants.TYPE]).value
                val += self.getDisplayName(resource[t], m.properties)
              }
            }
          }
        }
        else if (val.length  &&  val.indexOf(t) != val.length - 1)
          val += t;
      });
    }
    return val;
  },
  formatDate(date, noTime) {
    // var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
    var date = new Date(date);
    var now = new Date()

    var dayDiff = Math.floor((now.getTime() - date.getTime()) / (3600 * 24 * 1000))

    var val;
    switch (dayDiff) {
    case 0:
      val = dateformat(date, 'h:mm TT')
      // val = moment(date).format('h:mA') //moment(date).fromNow();
      break;
    case 1:
      val = 'yesterday, ' + noTime ? '' : dateformat(date, 'h:mm TT')
      // val = moment(date).format('[yesterday], h:mA');
      break;
    default:
      val = dateformat(date, 'mmmm dS yyyy' + (noTime ? '' : ', h:MM:ss TT'));
      // val = moment(date).format('LL');
    }
    return val;
  },
  keyByValue: function (map, value) {
    for (var k in map) {
      if (map[k] === value) return k
    }
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
    if (opts.msg[TYPE] == 'tradle.SelfIntroduction') {
      opts.public = true
    }

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

  isMyMessage(r) {
    var fromHash = utils.getId(r.from);
    var me = utils.getMe()
    if (fromHash == me[constants.TYPE] + '_' + me[constants.ROOT_HASH])
      return true;
    if (utils.getModel(r[constants.TYPE]).value.subClassOf == 'tradle.MyProduct') {
      let org = r.from.organization
      if (org  &&  utils.getId(r.from.organization) !== utils.getId(this.props.to))
        return true
    }
  },
  isVerifiedByMe(resource) {
    if (!resource.verifications)
      return false
    var lastAdditionalInfoTime, verifiedByMe
    if (resource.additionalInfo) {
      resource.additionalInfo.forEach(function(r) {
        if (lastAdditionalInfoTime  &&  lastAdditionalInfoTime < r.time)
          lastAdditionalInfoTime = r.time;
      });
    }
    resource.verifications.forEach(function(r) {
      var rh = r.from[constants.ROOT_HASH];
      if (!rh)
        rh = utils.getId(r.from).split('_')[1];

      if (rh === me[constants.ROOT_HASH]  &&  (!lastAdditionalInfoTime  ||  lastAdditionalInfoTime < r.time))
        verifiedByMe = true
    });
    return verifiedByMe
  },
  optimizeResource(res) {
    var properties = this.getModel(res[TYPE]).value.properties
    for (var p in res) {
      if (p.charAt(0) === '_'  ||  !properties[p])
        continue
      if (properties[p].type === 'object') {
        if (res[p]  &&  res[p].id  &&  res[p].title)
          continue
        if (properties[p].ref !== constants.TYPES.MONEY) {
          res[p] = {
            id: this.getId(res[p]),
            title: this.getDisplayName(res[p], properties)
          }
        }
      }
      else if (properties[p].type === 'array'  &&  properties[p].items.ref) {
        var arr = []
        res[p].forEach(function(r) {
          if (r.id) {
            if (r.photo)
              delete r.photo
            arr.push(r)
            return
          }
          var rr = {}
          rr.id = utils.getId(r)
          var m = utils.getModel(r[TYPE])
          rr.title = utils.getDisplayName(r, m.properties)
          arr.push(rr)
        })
        res[p] = arr
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

  // measure(component, cb) {
  //   let handle = typeof component === 'number'
  //     ? component
  //     : findNodeHandle(component)

  //   RCTUIManager.measure(handle, cb)
  // },

  scrollComponentIntoView(container, component) {
    const handle = typeof component === 'number'
      ? component
      : findNodeHandle(component)

    const currentScrollOffset = container.getScrollOffset && container.getScrollOffset().y
    const scrollView = container.refs && container.refs.scrollView || container
    const scrollResponder = scrollView.getScrollResponder()
    const additionalOffset = 120
    const doScroll = typeof currentScrollOffset === 'undefined'
      ? autoScroll
      : manualScroll

    setTimeout(doScroll, 50)

    // const measureLayout = typeof component === 'object' && component.measureLayout
    //   ? component.measureLayout.bind(component)
    //   : RCTUIManager.measureLayout.bind(RCTUIManager)

    // measureLayout(

    function manualScroll () {
      RCTUIManager.measureLayout(
        handle,
        findNodeHandle(scrollView.getInnerViewNode()),
        function (err) {
          debugger
        },
        function (left: number, top: number, width: number, height: number) {
          // left,top,width,right describe the offset
          // and size of the component we want to scroll into view
          //
          // currentScrollOffset is how far down we've scrolled already

          let keyboardScreenY = Dimensions.get('window').height;
          if (scrollResponder.keyboardWillOpenTo) {
            keyboardScreenY = scrollResponder.keyboardWillOpenTo.endCoordinates.screenY;
          }

          // how much space we have from the component's bottom to the keyboard's top
          // top + height
          let componentBottomY = top + height
          let keyboardTopY = currentScrollOffset + keyboardScreenY
          let bottomExpansionNeeded = componentBottomY - keyboardTopY + additionalOffset

          let topExpansionNeeded = currentScrollOffset - top
          let scrollOffsetY
          if (bottomExpansionNeeded > 0) {
            scrollOffsetY = currentScrollOffset + bottomExpansionNeeded
          } else if (topExpansionNeeded > 0) {
            scrollOffsetY = currentScrollOffset - topExpansionNeeded
          } else {
            return
          }

          scrollResponder.scrollResponderScrollTo(0, scrollOffsetY);
        }
      );
    }

    function autoScroll () {
      // debugger
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        findNodeHandle(handle),
        additionalOffset,
        true
      )
    }
  },

  onNextTransitionStart(navigator, fn) {
    let remove = normalizeRemoveListener(navigator.navigationContext.addListener('willfocus', () => {
      remove()
      setTimeout(fn, 0)
    }))

    return remove
  },

  onNextTransitionEnd(navigator, fn) {
    let remove = normalizeRemoveListener(navigator.navigationContext.addListener('didfocus', () => {
      remove()
      setTimeout(fn, 0)
    }))

    return remove
  },

  /**
   * optimized multi-get from levelup
   * @param  {Object} opts
   * @param  {levelup} opts.db
   * @param  {Array} opts.keys
   * @param  {Boolean} opts.strict (optional) - if true, fail if any keys is not found
   * @return {[type]}      [description]
   */
  multiGet(opts) {
    let strict = opts.strict
    let loc = opts.db.location
    let keys = opts.keys
    return AsyncStorage.multiGet(keys.map(function (key) {
      return loc + '!' + key
    }))
    .then(function (results) {
      if (strict) {
        if (results.some(function (r) {
          return !r[1]
        })) {
          throw new levelErrors.NotFoundError()
        }

        return results.map(parseDBValue)
      } else {
        return results.map(function (pair) {
          return {
            value: parseDBValue(pair),
            reason: pair[1] ? null : new levelErrors.NotFoundError()
          }
        })
      }
    })
  },

  hashPassword(pass) {
    // TODO: pbkdf2Sync with ~100000 iterations
    return crypto.createHash('sha256').update(pass).digest('base64')
    // return Q.ninvoke(crypto, 'randomBytes', 64)
    //   .then((salt) => {
    //     let key = crypto.pbkdf2Sync(pass, salt, 10000, 256, 'sha256')
    //     return `${key.toString('base64')}:${salt.toString('base64')}`
    //   })
  },

  joinURL(...parts) {
    var first = parts.shift()
    var rest = parts.join('/')
    var addSlash
    if (first[first.length - 1] === '/') first = first.slice(0, -1)
    if (rest[0] === '/') rest = rest.slice(1)

    return first + '/' + rest
  },

  promiseDelay(millis) {
    return Q.Promise((resolve) => {
      setTimeout(resolve, millis)
    })
  },

  tryWithExponentialBackoff(fn, opts) {
    const backoff = Backoff.exponential(extend(BACKOFF_DEFAULTS, opts))
    return loop()

    function loop () {
      const defer = Q.defer()
      backoff.once('ready', defer.resolve)
      backoff.backoff()
      return defer.promise
        .then(fn)
        .catch(loop)
    }
  },

  fetchWithTimeout(url, opts, timeout) {
    return Q.race([
      fetch(url, opts),
      Q.Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('timed out'))
        }, timeout)
      })
    ])
  },

  fetchWithBackoff(url, opts, requestTimeout) {
    return utils.tryWithExponentialBackoff(() => {
      return utils.fetchWithTimeout(url, opts, requestTimeout || DEFAULT_FETCH_TIMEOUT)
    })
  },
  normalizeCurrencySymbol(symbol) {
    // TODO: remove this after fixing encoding bug
    return symbol
    // return symbol ? (symbol === '¬' ? '€' : symbol) : symbol
  }
}

function normalizeRemoveListener (addListenerRetVal) {
  return () => {
    if (addListenerRetVal.remove) {
      addListenerRetVal.remove()
    } else {
      addListenerRetVal()
    }
  }
}


module.exports = utils;
