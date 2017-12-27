console.log('requiring utils.js')
'use strict'

import React from 'react'
import {
  NativeModules,
  Text,
  findNodeHandle,
  Dimensions,
  Alert,
  Linking,
  PixelRatio,
  Platform,
  PermissionsAndroid,
  StyleSheet
} from 'react-native'

import Camera from 'react-native-camera'
import querystring from 'querystring'
import traverse from 'traverse'
import AsyncStorage from '../Store/Storage'
import DeviceInfo from 'react-native-device-info'
import PushNotifications from 'react-native-push-notification'
import Keychain from 'react-native-keychain'
import ENV from './env'
import { getDimensions, getOrientation } from 'react-native-orient'
import platformUtils from './platformUtils'
import { post as submitLog } from './debug'
import chatStyles from '../styles/chatStyles'
import locker from './locker'
import clone from 'clone'
import Strings from './strings'
import { id } from '@tradle/build-resource'
// import Orientation from 'react-native-orientation'

// var orientation = Orientation.getInitialOrientation()
// Orientation.addOrientationListener(o => orientation = o)

import crypto from 'crypto'
import Q from 'q'
import collect from 'stream-collector'
import typeforce from 'typeforce'
import t from 'tcomb-form-native'
import equal from 'deep-equal'
import moment from 'moment'
import dateformat from 'dateformat'
import Backoff from 'backoff'
import extend from 'xtend'
import levelErrors from 'levelup/lib/errors'
import Cache from 'lru-cache'
import mutexify from 'mutexify'
import tradle, {
  protocol,
  utils as tradleUtils
} from '@tradle/engine'

import constants from '@tradle/constants'

const Promise = require('bluebird')
const debug = require('debug')('tradle:app:utils')

const IS_MESSAGE = '_message'
var strMap = {
  'Please fill out this form and attach a snapshot of the original document': 'fillTheFormWithAttachments',
  'Please fill out this form': 'fillTheForm',
  'Please take a **selfie** picture of your face': 'takeAPicture'
}

var {
  TYPE,
  TYPES,
  CUR_HASH,
  NONCE,
  ROOT_HASH,
  PREV_HASH,
  SIG
} = constants

var {
  VERIFICATION,
  MONEY,
  FORM,
  ORGANIZATION,
  SIMPLE_MESSAGE,
  PROFILE,
  IDENTITY,
  CUSTOMER_WAITING
} = constants.TYPES

const PRODUCT_APPLICATION = 'tradle.ProductApplication'

const MY_PRODUCT = 'tradle.MyProduct'
const MESSAGE = 'tradle.Message'
const ITEM = 'tradle.Item'
const DOCUMENT = 'tradle.Document'

const FORM_ERROR = 'tradle.FormError'
const FORM_REQUEST = 'tradle.FormRequest'
const PHOTO = 'tradle.Photo'
const PASSWORD_ENC = 'hex'
const ENUM = 'tradle.Enum'
const STYLES_PACK = 'tradle.StylesPack'
const CONTEXT = 'tradle.Context'
const MSG_LINK = '_msg'
const APPLICATION = 'tradle.Application'
const BOOKMARK = 'tradle.Bookmark'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
// import dictionaries from '@tradle/models'.dict
var dictionary //= dictionaries[Strings.language]

var propTypesMap = {
  'string': t.Str,
  'boolean': t.Bool,
  'date': t.Dat,
  'number': t.Num
};
var models, me, modelsForStub;
var BACKOFF_DEFAULTS = {
  randomisationFactor: 0,
  initialDelay: 1000,
  maxDelay: 60000
}

var DEFAULT_FETCH_TIMEOUT = 5000
var stylesCache = {}

var defaultPropertyValues = {}
var hidePropertyInEdit = {}

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

    Strings.setLanguage(me.languageCode)
    if (me.languageCode) {
      if (me.dictionary)
        dictionary = me.dictionary
      // else if (dictionaries[me.languageCode])
      //   dictionary = dictionaries[me.languageCode]
    }
  },
  getMe() {
    return me;
  },
  isMe(resource) {
    let me = this.getMe()
    return me  &&  me[ROOT_HASH] === resource[ROOT_HASH]
  },
  setModels(modelsRL) {
    models = modelsRL;
    modelsForStub = {}
    for (let m in models)
      modelsForStub[m] = models[m].value
  },
  getModels() {
    return models;
  },
  getModelsForStub() {
    return modelsForStub
  },
  normalizeGetInfoResponse(json) {
    if (!json.providers) {
      json = {
        providers: [json]
      }
    }

    json.providers.forEach(provider => {
      if (provider.style) {
        provider.style = utils.toStylesPack(provider.style)
      }
    })

    return json
  },
  toStylesPack(oldStylesFormat) {
    if (oldStylesFormat[TYPE] === STYLES_PACK) return oldStylesFormat

    const { properties } = utils.getModel(STYLES_PACK).value
    const pack = {
      [TYPE]: STYLES_PACK
    }

    for (let bad in oldStylesFormat) {
      let good = utils.joinCamelCase(bad.split('_'))
      if (good in properties) {
        pack[good] = oldStylesFormat[bad]
      }
    }

    return pack
  },
  joinCamelCase(parts) {
    return parts.map((part, i) => {
      if (part.toUpperCase() === part) {
        // avoid breaking already camelcased strings
        part = part.toLowerCase()
      }

      if (i !== 0) {
        part = part[0].toUpperCase() + part.slice(1)
      }

      return part
    })
    .join('')
  },
  splitCamelCase(str) {
    return str.split(/(?=[A-Z])/g)
  },
  getModel(modelName) {
    return models ? models[modelName] : null;
  },
  getDefaultLanguage: Strings.getDefaultLanguage,
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
      return property.title || this.makeLabel(property.name)
    let translations = dictionary.properties[property.name]
    let val
    if (translations)
      val = translations[model.id] || translations.Default

    return val || property.title || utils.makeLabel(property.name)
  },
  translateModel(model, isPlural) {
    if (dictionary  &&  dictionary.models[model.id])
      return dictionary.models[model.id]  ||  this.makeModelTitle(model, isPlural)
    return model.title ? model.title : this.makeModelTitle(model, isPlural)
  },
  translateString(...args) {
    const { strings } = Strings
    if (!strings)
      return this.makeLabel(args[0])

    let s = strings[args[0]]
    if (!s)
      return this.makeLabel(args[0])

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
  clone(resource) {
    return clone(resource)
  },
  compare(r1, r2, isInlined) {
    if (!r1 || !r2)
      return (r1 || r2) ? false : true

    if (isInlined) return equal(r1, r2)

    let properties = this.getModel(r1[TYPE]).value.properties
    let exclude = ['time', ROOT_HASH, CUR_HASH, PREV_HASH, NONCE, 'verifications', '_sharedWith']
    for (var p in properties) {
      let prop = properties[p]
      if (!prop  ||  exclude.indexOf(p) !== -1)
        continue
      if (r1[p] === r2[p])
        continue
      if (Array.isArray(r1[p])) {
        if (!r2[p])
          return false
        if (r1[p].length !== r2[p].length)
          return false
        if (!r1[p].some((r) => r2[p].some((rr2) => equal(r, rr2))))
          return false
      }
      else if (typeof r1[p] === 'object') {
        if (!r2[p])
          return false
        if (prop.ref === MONEY) {
          if (r1[p].currency !== r2[p].currency  ||  r1[p].value !== r2[p].value)
            return false
        }
        else if (prop.inlined  ||  (prop.ref  &&  this.getModel(prop.ref).value.inlined))
          return this.compare(r1[p], r2[p], true)
        else if (utils.getId(r1[p]) !== utils.getId(r2[p]))
          return false
      }
      else {
        if (r1[p]  ||  r2[p])
          return false
        if (prop.type === 'boolean') {
          if (typeof r1[p]  !==  typeof r2[p])
            return false
        }
      }
    }
    return true
  },

  getStringName(str) {
    return strMap[str]
  },
  createAndTranslate(s, isEnumValue) {
    if (!s.length)
      return null
    let stringName = s.replace(/\w\S*/g, function(txt) {
      return  isEnumValue
            ? txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            : txt
    })
    stringName = stringName.replace(/[^a-zA-Z0-9]/g, '')
    // stringName = stringName.charAt(0).toLowerCase() + stringName.slice(1)
    let t = utils.translate(stringName)
    let tt =  t.replace(/\s/g, '')
    // return t !== stringName ? t : (isEnumValue ? s : utils.makeLabel(s))
    return tt !== stringName ? t : s
  },
  makeModelTitle(model, isPlural) {
    if (typeof model === 'string')
      return this.makeModelTitle(this.getModel(model).value, isPlural)
    if (isPlural  &&  model.plural)
      return model.plural
    if (model.title)
      return isPlural ? model.title + 's' : model.title
    let label = model.id.split('.')[1]
    if (isPlural)
      label += 's'
    let len = label.length
    let newLabel = ''

    for (let i=0; i<len; i++)  {
      let ch = label.charAt(i)
      if (ch === ch.toLowerCase())
        newLabel += ch
      else {
        let ch1 = i ? label.charAt(i - 1) : ''
        if (ch1  &&  ch1 === ch1.toLowerCase())
          newLabel += ' '
        newLabel += ch
      }
    }
    return newLabel
    // return label
    //       // insert a space before all caps
    //       .replace(/([A-Z])/g, ' $1')
    //       // uppercase the first character
    //       .replace(/^./, function(str){ return str.toUpperCase(); }).trim()
  },
  makeLabel(label) {
    return label
          .replace(/_/g, ' ')
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
  isSubclassOf(type, subType) {
    if (typeof type === 'string')
      return this.getModel(type).value.subClassOf === subType
    if (type.type)  {
      if (type.type === 'tradle.Model')
      return type.subClassOf === subType
    }
    return this.getModel(type[TYPE]).value.subClassOf === subType
  },
  isMyProduct(type) {
    return this.isSubclassOf(type, MY_PRODUCT)
  },
  isForm(type) {
    return this.isSubclassOf(type, FORM)
  },
  isVerification(type) {
    return this.isSubclassOf(type, VERIFICATION)
  },
  getFontSize(fontSize) {
    // return fontSize
    let fontScale = PixelRatio.getFontScale()
    if (fontScale <= 3)
      return fontSize
    return Math.floor(fontSize * (fontScale < 3.5 ? 0.95 : 0.9))
  },
  getId(r) {
    if (typeof r === 'string') {
      return r
      // var idArr = r.split('_');
      // return idArr.length === 2 ? r : idArr[0] + '_' + idArr[1];
    }
    if (!r) debugger
    if (r.id) {
      return r.id
      // var idArr = r.id.split('_');
      // return idArr.length === 2 ? r.id : idArr[0] + '_' + idArr[1];
    }
    else if (r[ROOT_HASH]) {
      let id = r[TYPE] + '_' + r[ROOT_HASH] // +  '_' + (r[CUR_HASH] || r[ROOT_HASH])
      let m = this.getModel(r[TYPE])
      if (m  &&  m.value.subClassOf !== ENUM)
        id +=  '_' + (r[CUR_HASH] || r[ROOT_HASH])
      // return  m  &&  (m.value.subClassOf === FORM  ||  m.value.id === VERIFICATION  ||  m.value.id === MY_PRODUCT)
      //       ? id + '_' + (r[CUR_HASH] || r[ROOT_HASH])
      //       : id
      return id
    }
  },
  makeId(type, permalink, link) {
    let model = this.getModel(type).value
    link = link || permalink
    return id({model, permalink, link})
  },
  getType(r) {
    if (typeof r === 'string')
      return r.split('_')[0]
    return r[TYPE] || this.getId(r).split('_')[0]
  },
  getProduct(r) {
    return r[TYPE] === PRODUCT_APPLICATION
           ? r.product
           : r.requestFor
  },
  getItemsMeta(metadata) {
    var props = metadata.properties;
    var required = utils.arrayToObject(metadata.required);
    // if (!required)
    //   return;
    var itemsMeta = {};
    for (var p in props) {
      if (props[p].type !== 'array')  //  &&  required[p]) {
        continue
      let ref = props[p].items.ref
      if (!ref  ||  this.getModel(ref).value.subClassOf !== ENUM)
        itemsMeta[p] = props[p];
    }
    return itemsMeta;
  },
  makeTitle(resourceTitle, prop) {
    return (resourceTitle.length > 28) ? resourceTitle.substring(0, 28) + '...' : resourceTitle;
  },
  getPropertiesWithAnnotation(model, annotation) {
    let props = {}
    let meta = model.properties
    for (let p in meta)
      if (meta[p][annotation])
        props[p] = meta[p]

    return props
  },

  getDisplayName(resource, model) {
    if (Array.isArray(resource))
      return
    if (!model) {
      if (!resource[TYPE]) {
        if (resource.id   &&   resource.title)
          return resource.title
        if (resource.id)
          return ""
      }
      model = this.getModel(resource[TYPE]).value
    }
    let props = model.properties
    let resourceModel = resource[TYPE] ? this.getModel(resource[TYPE]).value : null
    var displayName = '';
    for (var p in props) {
      if (p.charAt(0) === '_')
        continue
      if (!props[p].displayName) {
        if (!displayName  &&  resourceModel  &&  resource[p]  &&  resourceModel.subClassOf === ENUM)
          return resource[p];
        continue
      }
      let dn = this.getStringValueForProperty(resource, p, props)
      if (dn)
        displayName += displayName.length ? ' ' + dn : dn;
    }
    if (!displayName.length  &&  resourceModel) {
      let vCols = resourceModel.viewCols
      if (!vCols)
        return displayName
      let excludeProps = []
      if (this.isMessage(resourceModel))
        excludeProps = ['from', 'to']
      for (let i=0; i<vCols.length  &&  !displayName.length; i++) {
        let prop =  vCols[i]
        if (props[prop].type === 'array')
          continue
        if ((!resource[prop]  &&  !props[prop].displayAs)  ||  excludeProps.indexOf[prop])
          continue
        displayName = this.getStringValueForProperty(resource, prop, resourceModel.properties)
      }
    }
    return displayName;
  },

  getStringValueForProperty(resource, p, meta) {
    let displayName = ''
    if (resource[p]) {
      if (meta[p].type === 'date')
        return this.getDateValue(resource[p])
      if (meta[p].type !== 'object')
        return resource[p];
      if (resource[p].title)
        return resource[p].title;
      if (meta[p].ref) {
        if (meta[p].ref == MONEY)  {
          let c = this.normalizeCurrencySymbol(resource[p].currency)
          return (c || '') + resource[p].value
        }
        else {
          let rm = this.getModel(resource[p][TYPE])
          if (rm)
            return this.getDisplayName(resource[p], rm.value);
        }
      }
    }
    else if (meta[p].displayAs) {
      var dn = this.templateIt(meta[p], resource);
      if (dn)
        return dn
    }
    return displayName
  },
  getPropByTitle(props, propTitle) {
    let propTitleLC = propTitle.toLowerCase()
    for (let p in props) {
      let prop = props[p]
      let pTitle = prop.title || this.makeLabel(p)
      if (pTitle.toLowerCase() === propTitleLC)
        return p
    }
  },
  getDateValue(value) {
    let valueMoment = moment.utc(value)
    let format = 'MMMM Do, YYYY'
    return valueMoment && valueMoment.format(format)
  },
  getPropStringValue(prop, resource) {
    let p = prop.name
    if (!resource[p]  &&  prop.displayAs)
      return this.templateIt(prop, resource);
    if (prop.type == 'object')
      return resource[p].title || this.getDisplayName(resource[p], this.getModel(resource[p][TYPE]).value.properties);
    else
      return resource[p] + '';
  },
  getEditCols(model) {
    let { editCols, viewCols, properties } = model
    let eCols = {}
    if (editCols) {
      editCols.forEach((p) => {
        let idx = p.indexOf('_group')
        if (idx === -1  ||  !properties[p].list || properties[p].title.toLowerCase() !== p)
          eCols[p] = properties[p]

        if (idx !== -1  &&  properties[p].list)
          properties[p].list.forEach((p) => eCols[p] = properties[p])
      })
      return eCols
    }
    if (viewCols) {
      viewCols.forEach((p) => {
        let idx = p.indexOf('_group')
        if (idx === -1  ||  !properties[p].list || properties[p].title.toLowerCase() !== p)
          eCols[p] = properties[p]

        if (idx !== -1  &&  properties[p].list)
          properties[p].list.forEach((p) => eCols[p] = properties[p])
        // eCols[p] = props[p]
      })
    }
    // ViewCols on top
    for (let p in properties) {
      if (!eCols[p]  &&  !properties[p].readOnly  &&  !properties[p].hidden  &&  p.indexOf('_group') !== p.length - 6)
        eCols[p] = properties[p]
    }
    return eCols
  },
  template (t, o) {
    return t.replace(/{([^{}]*)}/g,
        function (a, b) {
          var r = o[b - 1];
          return typeof r === 'string' ||
                 typeof r === 'number' ?
                 r : a;
        }
     )
  },
  templateIt1(prop, resource, m) {
    if (!resource[TYPE])
      return resource.title
    // if (resource.id  &&  resource.title)
    //   return resource.title
    let pgroup = prop.group
    if (!pgroup.length)
      return prop.displayAs
    let group = []
    let hasSetProps
    let props = this.getModel(resource[TYPE]).value.properties
    for (let i=0; i<pgroup.length; i++) {
      let p = pgroup[i]
      let v =  resource[p] ? resource[p] : ''
      if (v)
        hasSetProps = true
      if (typeof v === 'object')
        v = v.title ? v.title : utils.getDisplayName(v, this.getModel(props[p].ref).value.properties)
      else if (props  &&  props[p].range  &&  props[p].range  === 'check')
        v = ''
      group.push(v)
    }

    if (hasSetProps) {
      let s = this.template(prop.displayAs, group).trim()
      s = s.replace(/[,\s+,]+[,,]/g, ',')
      if (s.charAt(0) === ',')
        s = s.replace(/,/, '')

      if (s.charAt(s.length - 1) !== ',')
        return s
      let i = s.length - 2
      while(s.charAt(i) === ' ')
        i--
      i = (i < s.length - 2) ? i : s.length - 1
      return s.substring(0, i)
    }
  },
  // templateIt1(prop, resource) {
  //   let pgroup = prop.group
  //   let group = []
  //   let hasSetProps
  //   pgroup.forEach((p) => {
  //     let v =  resource[p] ? resource[p] : ''
  //     if (v)
  //       hasSetProps = true
  //     group.push(v)
  //   })
  //   if (!hasSetProps)
  //     return
  //   else
  //     return this.template(prop.displayAs, group).trim()
  // },

  // parentModel for array type props
  templateIt(prop, resource, parentModel) {
    var template = prop.displayAs;
    if (typeof template === 'string')
      return this.templateIt1(prop, resource, parentModel)
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
                val += resource[t].title
              else {
                let m = self.getModel(resource[t][TYPE]).value
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
    var noTime = true
    var val;
    switch (dayDiff) {
    case 0:
      noTime = false
      val = dateformat(date, 'h:MM TT')
      // val = moment(date).format('h:mA') //moment(date).fromNow();
      break;
    case 1:
      noTime = false
      val = 'yesterday, ' + (noTime ? '' : dateformat(date, 'h:MM TT'))
      // val = moment(date).format('[yesterday], h:mA');
      break;
    default:
      val = dateformat(date, 'mmm d, yyyy' + (noTime ? '' : ', h:MM TT'));
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
    if (typeof url === 'object')
      url = url.url
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
    /*
    resource.verifications.forEach(function(r) {
      var rh = r.from[ROOT_HASH];
      if (!rh)
        rh = utils.getId(r.from).split('_')[1];

      if (rh === me[ROOT_HASH]  &&  (!lastAdditionalInfoTime  ||  lastAdditionalInfoTime < r.time))
        verifiedByMe = true
    });
    */
    return verifiedByMe
  },
  isReadOnlyChat(resource, context) {
    let me = this.getMe()
    if (!me)
      return false
    if (resource[TYPE] === APPLICATION)
      return this.isRM(resource)
    let {to, from} = resource
    if (!to || !from)
      return false
    let meId = this.getId(me)
    let fromId = this.getId(from)
    let toId = this.getId(to)
    let isReadOnly
    if (toId !== meId  &&  fromId !== meId) {
      if (!me.isEmployee  ||  !to.organization  ||  utils.getId(me.organization) !== utils.getId(to.organization))
        isReadOnly = true
    }

    if (isReadOnly || !context  || (resource[TYPE] !== FORM_ERROR  &&   resource[TYPE] !== FORM_REQUEST))
      return isReadOnly
    // Form error can be used only by context originating contact
    // return !isReadOnly  &&  context
    //        ? meId  !== this.getId(context.from)
    //        : isReadOnly
    if (isReadOnly  ||  !context)
      return isReadOnly
    if (meId  === this.getId(context.from))
      return isReadOnly
    if (me.isEmployee  &&  to.organization  &&  to.organization.id  &&  to.organization.id === me.organization.id)
      return isReadOnly
    return true
  },
  buildRef(resource) {
    if (!resource[TYPE] && resource.id)
      return resource
    let m = this.getModel(resource[TYPE]).value
    let isForm = m.subClassOf === FORM
    // let id = utils.getId(resource)
    // if (isForm)
    //   id += '_' + resource[CUR_HASH]
    let ref = {
      id: utils.getId(resource),
      title: resource.id ? resource.title : utils.getDisplayName(resource)
    }
    if (resource.time)
      ref.time = resource.time
    return ref
  },
  hasSupportLine(resource) {
    let me = this.getMe()
    if (resource._hasSupportLine)
      return true
    if (!me.isEmployee)
      return

    if (me.organization._hasSupportLine) {
      if (resource[TYPE] === PROFILE)
        return true
      if (this.isContext(resource[TYPE])) {
        if (resource._relationshipManager)
          return true
      }
    }
    else if (resource[TYPE] === ORGANIZATION  && utils.getId(me.organization) === utils.getId(resource))
      return true
  },
  optimizeResource(resource, doNotChangeOriginal) {
    let res = doNotChangeOriginal ? utils.clone(resource) : resource
    let m = this.getModel(res[TYPE]).value
    // if (!m.interfaces)
    //   res = this.optimizeResource1(resource, doNotChangeOriginal)
    // else {
      var properties = m.properties
      var exclude = ['from', 'to', 'time']
      let isVerification = m.id === VERIFICATION
      let isProductApplication = m.id === PRODUCT_APPLICATION
      let isContext = this.isContext(m)
      let isFormRequest = m.id === FORM_REQUEST
      let isFormError = m.id === FORM_ERROR
      let isBookmark = m.id === BOOKMARK
      Object.keys(res).forEach(p => {
        if (p === 'txId')
          return
        if (p === '_context'  &&  res._context) {
          res._context = this.buildRef(res._context)
          return
        }
        if (p.charAt(0) === '_'  ||  exclude.indexOf(p) !== -1)
          return
        if (isProductApplication  &&  p === 'product')
          return
        if (isContext  &&  (p === 'requestFor' || p === 'contextId'))
          return
        if (isFormRequest  &&  (p === 'product'  ||  p === 'form'))
          return
        if (isVerification  &&  p === 'document')
          res[p] = this.buildRef(res[p])
        else if (isFormError  &&  p === 'prefill') {
          if (res[ROOT_HASH])
            res[p] = this.buildRef(res[p])
        }
        else if (isBookmark  &&  p === 'bookmark')
          return
        else
          delete res[p]
      })
    // }
    delete res._cached
    if (!this.isMessage(res))
      return res

    if (res._sharedWith) {
      res._sharedWith.forEach((r) => {
        if (r.shareBatchId  &&  (typeof r.shareBatchId === 'object'))
          r.shareBatchId = utils.buildRef(r.shareBatchId)
      })
    }

    delete res.to.organization
    delete res.to.photo
    delete res.from.organization
    delete res.from.photo

    return res
  },
  isContext(typeOrModel) {
    let m = typeOrModel
    if (typeof typeOrModel === 'string') {
      m = this.getModel(typeOrModel).value
      if (!m)
        return
    }
    return m.interfaces  &&  m.interfaces.indexOf(CONTEXT) !== -1
  },
  isEnum(typeOrModel) {
    let m = typeOrModel
    if (typeof typeOrModel === 'string') {
      m = this.getModel(typeOrModel).value
      if (!m)
        return
    }
    return m.subClassOf === ENUM
  },

  /**
   * fast but dangerous way to read a levelup
   * it's dangerous because it relies on the underlying implementation
   * of levelup and asyncstorage-down, and their respective key/value encoding sechemes
   */
  async dangerousReadDB(db) {
    // return new Promise((resolve, reject) => {
    //   collect(db.createReadStream(), (err, data) => {
    //     if (err) reject(err)
    //     else resolve(data)
    //   })
    // })

    // var down = db.db._down
    // if (!down.container) {
    //   // memdown
    //   return new Promise((resolve, reject) => {
    //     collect(db.createReadStream(), function (err, results) {
    //       if (err) return reject(err)

    //       resolve(results)
    //     })
    //   })
    // }

    await Q.ninvoke(db, 'open')

    const prefix = db.location + '!'
    // dangerous!
    const keys = db.db._down.container._keys.slice()
    if (!keys.length) return []

    const pairs = await AsyncStorage.multiGet(keys.map((key) => prefix + key))
    return pairs
      .filter((pair) => pair[1] != null)
      .map((pair) => {
        pair[1] = pair[1].slice(2)
        try {
          pair[1] = pair[1] && JSON.parse(pair[1])
        } catch (err) {
        }

        return {
          key: pair[0].slice(prefix.length + 2),
          value: pair[1]
        }
      })
  },
  isEmployee(resource) {
    if (!me.isEmployee)
      return false
    let myId = this.getId(me.organization)
    if (resource[TYPE] === ORGANIZATION)
      return this.getId(resource) === myId ? true : false
    if (!resource.organization)
      return true
    if (utils.getId(resource.organization) === utils.getId(me.organization))
      return true
  },
  isVerifier(resource) {
    // return true
    if (!this.isEmployee(resource))
      return false
    let me = this.getMe()
    if (!me.isEmployee)
      return false
    // let model = this.getModel(resource[TYPE]).value
    // if (model.subClassOf === FORM) {
    //   return  (utils.getId(me) === utils.getId(resource.to)  ||  this.isReadOnlyChat(resource)) &&
    //          !utils.isVerifiedByMe(resource)               // !verification  &&  utils.getId(resource.to) === utils.getId(me)  &&
    // }
    // if (model.id === VERIFICATION)
    //   return  utils.getId(me) === utils.getId(resource.from)
  },
  isRM(application) {
    if (!application || !application.relationshipManager)
      return
    let rmId = utils.getId(application.relationshipManager)
    return rmId === this.getId(this.getMe()).replace(PROFILE, IDENTITY)
  },
  // isVerifier(resource, application) {
  //   if (!this.isEmployee(resource))
  //     return false
  //   let me = this.getMe()
  //   if (!me.isEmployee)
  //     return false
  //   let model = this.getModel(resource[TYPE]).value
  //   if (model.subClassOf === FORM) {
  //     return  (utils.getId(me) === utils.getId(resource.to)  ||  this.isReadOnlyChat(resource)) &&
  //            !utils.isVerifiedByMe(resource)               // !verification  &&  utils.getId(resource.to) === utils.getId(me)  &&
  //   }
  //   if (model.id === VERIFICATION)
  //     return  utils.getId(me) === utils.getId(resource.from)
  // },
  // measure(component, cb) {
  //   let handle = typeof component === 'number'
  //     ? component
  //     : findNodeHandle(component)

  //   RCTUIManager.measure(handle, cb)
  // },

  scrollComponentIntoView (container, component) {
    const handle = platformUtils.getNode(component)
    let currentScrollOffset = container.getScrollOffset && container.getScrollOffset().y
    const scrollView = container.refs && container.refs.scrollView || container
    const scrollResponder = scrollView.getScrollResponder()
    const additionalOffset = 120
    let autoScroll
    if (typeof currentScrollOffset === 'undefined') {
      if (utils.isWeb()) currentScrollOffset = 0
      else autoScroll = true
    }

    setTimeout(function () {
      if (autoScroll) {
        platformUtils.autoScroll(scrollView, handle, additionalOffset)
      } else {
        manualScroll(scrollView, handle)
      }
    }, 50)

    function manualScroll (scrollView, handle) {
      platformUtils.measure(scrollView, handle, function (err, rect) {
        if (err) {
          debugger
          return
        }

        // left,top,width,right describe the offset
        // and size of the component we want to scroll into view
        //
        // currentScrollOffset is how far down we've scrolled already

        const { left, top, width, height } = rect
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

        platformUtils.scrollTo(scrollView, 0, scrollOffsetY)
      });
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

  rebuf,

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

  // TODO: add maxTries
  tryWithExponentialBackoff(fn, opts) {
    opts = opts || {}
    const backoff = Backoff.exponential(extend(BACKOFF_DEFAULTS, opts))
    return fn().catch(backOffAndLoop)

    function backOffAndLoop () {
      const defer = Q.defer()
      backoff.once('ready', defer.resolve)
      backoff.backoff()
      return defer.promise
        .then(fn)
        .catch(backOffAndLoop)
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
    if (!symbol  ||  typeof symbol === 'string')
      return symbol
    else
      return symbol.symbol
    // return symbol ? (symbol === '¬' ? '€' : symbol) : symbol
  },
  isSimulator() {
    let timezone = DeviceInfo.getTimezone()
    return DeviceInfo.getModel() === 'Simulator' || DeviceInfo.isEmulator()
  },
  toOldStyleWrapper: function (wrapper) {
    if (!wrapper.permalink) return wrapper

    if (wrapper.object) {
      const payload = wrapper.object[TYPE] === 'tradle.Message' ? wrapper.object.object : wrapper.object
      const link = protocol.linkString(payload)
      wrapper[CUR_HASH] = link
      wrapper[ROOT_HASH] = payload[ROOT_HASH] || link
      wrapper.from = { [ROOT_HASH]: wrapper.author }
      // wrapper.to = wrapper.author
      wrapper.parsed = {
        data: payload
      }

      wrapper[TYPE] = payload[TYPE]
    }
    else if (wrapper.objectinfo) {
      wrapper[CUR_HASH] = wrapper.objectinfo.link
      wrapper[ROOT_HASH] = wrapper.objectinfo.permalink
      wrapper[TYPE] = wrapper.objectinfo.type
    }
    else {
      wrapper[CUR_HASH] = wrapper.link
      wrapper[ROOT_HASH] = wrapper.permalink
      wrapper[TYPE] = wrapper.type
    }
    wrapper[MSG_LINK] = wrapper.link
    return wrapper
  },
  setupSHACaching: function setupSHACaching (protocol) {
    const merkle = protocol.DEFAULT_MERKLE_OPTS
    if (merkle._caching) return

    const cache = new Cache({ max: 500 })
    protocol.DEFAULT_MERKLE_OPTS = {
      _caching: true,
      leaf: function leaf (a) {
        const key = 'l:' + a.data.toString('hex')
        const cached = cache.get(key)
        if (cached) return cached

        const val = merkle.leaf(a)
        cache.set(key, val)
        return val
      },
      parent: function parent (a, b) {
        const key = 'p:' + a.hash.toString('hex') + b.hash.toString('hex')
        const cached = cache.get(key)
        if (cached) return cached

        const val = merkle.parent(a, b)
        cache.set(key, val)
        return val
      }
    }
  },

  generateSalt: function (opts) {
    opts = opts || {}
    const salt = crypto.randomBytes(opts.length || 32)
    return opts.enc ? salt.toString(opts.enc) : salt
  },

  hashPassword: function (opts) {
    if (typeof opts === 'string') opts = { password: opts }

    const salt = opts.salt || utils.generateSalt()
    const saltStr = salt.toString(PASSWORD_ENC)
    const hash = crypto.createHash('sha256')
      .update(opts.password + saltStr)
      .digest()

    return { hash, salt }

    // TODO: pbkdf2Sync with ~100000 iterations
    // but currently kdf takes ~7 seconds for 10000!
    // const result = utils.kdf(opts)
    // return { hash: result.key, salt: result.salt }
  },

  kdf: function (opts) {
    if (typeof opts === 'string') opts = { password: opts }

    const password = opts.password
    const salt = opts.salt || utils.generateSalt({ length: opts.saltBytes || 32 })
    const iterations = opts.iterations || 10000
    const keyBytes = opts.keyBytes || 32
    const digest = opts.digest || 'sha256'
    const key = crypto.pbkdf2Sync(password, salt, iterations, keyBytes, digest)
    return { key, salt }
  },

  setPassword: function (username, password) {
    debug(`saving password for username "${username}", service ${ENV.serviceID}`)
    return Keychain.setGenericPassword(username, password, ENV.serviceID)
  },

  getPassword: function (username) {
    return Keychain.getGenericPassword(username, ENV.serviceID)
  },

  /**
   * store hashed and salted password
   * @param {[type]} username [description]
   * @param {[type]} password [description]
   */
  setHashedPassword: function (username, password) {
    const result = utils.hashPassword({ password })
    return utils.setPassword(username, result.hash.toString(PASSWORD_ENC) + result.salt.toString(PASSWORD_ENC))
  },

  getHashedPassword: function (username) {
    return utils.getPassword(username)
      .then(encoded => {
        const salt = encoded.slice(-64) // 32 bytes in hex
        const hash = encoded.slice(0, encoded.length - 64)
        return {
          hash: new Buffer(hash, PASSWORD_ENC),
          salt: new Buffer(salt, PASSWORD_ENC)
        }
      })
  },

  checkHashedPassword: function (username, password) {
    return utils.getHashedPassword(username)
      .then(stored => {
        const hash = utils.hashPassword({
          password,
          salt: stored.salt
        }).hash

        return stored.hash.equals(hash)
      })
      .catch(err => {
        return false
      })
  },

  resetPasswords: function () {
    return Promise.all([
      Keychain.resetGenericPasswords(),
      Keychain.resetGenericPasswords(ENV.serviceID)
    ])
  },
  isAndroid: ENV.isAndroid,
  isIOS: ENV.isIOS,
  isWeb: ENV.isWeb,
  promiseThunky: function (fn) {
    let promise
    return function () {
      return promise ? promise : promise = fn.apply(this, arguments)
    }
  },

  getTopNonAuthRoute: function (navigator) {
    const routes = navigator.getCurrentRoutes()
    let top
    while (top = routes.pop()) {
      if (!top || top.component.displayName !== 'PasswordCheck') break
    }

    return top
  },
  // orientation() {
  //   // disallow PORTRAITUPSIDEDOWN
  //   return orientation === 'PORTRAITUPSIDEDOWN' ? 'LANDSCAPE' : orientation.replace(/-LEFT|-RIGHT/, '')
  // },
  dimensions(Component) {
    return getDimensions(Component)
  },
  styleFactory(Component, create) {
    if (!Component.displayName) throw new Error('component must have "displayName"')

    return () => {
      var key = Component.displayName
      if (!stylesCache[key]) {
        stylesCache[key] = {}
      }

      var orientation = getOrientation(Component)
      var subCache = stylesCache[key]
      if (!subCache[orientation]) {
        var dimensions = getDimensions(Component)
        var { width, height } = dimensions
        var switchWidthHeight = (
          (orientation === 'PORTRAIT' && width > height) ||
          (orientation === 'LANDSCAPE' && width < height)
        )

        if (switchWidthHeight) {
          dimensions = { width: height, height: width }
        }

        subCache[orientation] = create({ dimensions })
      }

      return subCache[orientation]
    }
  },
  resized: function (props, nextProps) {
    return props.orientation !== nextProps.orientation
  },
  imageQuality: 0.2,
  restartApp: function () {
    return NativeModules.CodePush.restartApp(false)
  },
  printStack: tradleUtils.printStack.bind(tradleUtils),
  addCatchLogger: function (name, fn) {
    return function () {
      return fn.apply(this, arguments)
        .catch(err => {
          console.warn(`${name} failed:`, err.stack || err.message || err)
          throw err
        })
    }
  },
  getPhotoProperty(resource) {
    let props = this.getModel(resource[TYPE]).value.properties
    let photoProp
    for (let p in resource) {
      if (props[p].ref === PHOTO  &&  props[p].mainPhoto)
        return props[p]
    }
    return props.photos
  },

  locker,
  getMainPhotoProperty(model) {
    let mainPhoto
    let props = model.properties
    for (let p in props) {
      if (props[p].mainPhoto)
        mainPhoto = p
    }
    return mainPhoto
  },
  getResourcePhotos(model, resource) {
    var mainPhoto, photos
    let props = model.properties
    for (let p in resource) {
      if (!props[p] ||  (props[p].ref !== PHOTO && (!props[p].items || props[p].items.ref !== PHOTO)))
        continue
      if (props[p].mainPhoto) {
        mainPhoto = resource[p]
        continue
      }
      if (!photos)
        photos = []
      if (props[p].items)
        resource[p].forEach((r) => photos.push(r))
      else
        photos.push(resource[p])
    }
    if (!photos) {
      if (mainPhoto)
        return [mainPhoto]
    }
    else {
      if (!mainPhoto)
        return photos
      photos.splice(0, 0, mainPhoto)
      return photos
    }
  },
  getPropertiesWithRange(range, model) {
    let props = model.properties
    let rProps = []
    for (let p in props)
      if (props[p].range === range)
        rProps.push(props[p])
    return rProps
  },
  fromMicroBlink: function (result) {
    const { mrtd, usdl, eudl, image } = result
    if (mrtd) {
      return {
        [TYPE]: 'tradle.Passport',
        givenName: mrtd.secondaryId,
        surname: mrtd.primaryId,
        nationality: {
          id: 'tradle.Country_abc',
          title: mrtd.nationality.slice(0, 2)
        },
        issuingCountry: {
          id: 'tradle.Country_abc',
          title: mrtd.issuer.slice(0, 2)
        },
        passportNumber: mrtd.documentNumber,
        sex: {
          id: 'tradle.Sex_abc',
          title: mrtd.sex === 'M' ? 'Male' : 'Female'
        },
        dateOfExpiry: mrtd.dateOfExpiry,
        dateOfBirth: mrtd.dateOfBirth,
        photos: [
          {
            url: image.base64,
            // width: image.width,
            // height: image.height,
            // isVertical: image.width < image.height
          }
        ]
      }
    }
  },
  fromAnyline: function (result) {
    const { scanMode, cutoutBase64, barcode, reading, data } = result
    // as produced by newtondev-mrz-parser
    // {
    //       documentCode: documentCode,
    //       documentType: 'PASSPORT',
    //       documentTypeCode: documentType,
    //       issuer: issuerOrg,
    //       names: names,
    //       documentNumber: documentNumber,
    //       nationality: nationality,
    //       dob: dob,
    //       sex: sex,
    //       checkDigit: {
    //         documentNumber: {value: checkDigit1, valid: checkDigitVerify1},
    //         dob: {value: checkDigit2, valid: checkDigitVerify2},
    //         expiry: {value: checkDigit3, valid: checkDigitVerify3},
    //         personalNumber: {value: checkDigit4, valid: checkDigitVerify4},
    //         finalCheck: {value: checkDigit5, valid: checkDigitVerify5},
    //         valid: (checkDigitVerify1 && checkDigitVerify2 && checkDigitVerify3 && checkDigitVerify4 && checkDigitVerify5)
    //       },
    //       expiry: expiry,
    //       personalNumber: personalNumber
    //     }

    // if (scanMode === 'MRZ') {
    //   const { names, nationality, issuer, dob, expiry, sex, documentNumber, personalNumber } = data
    //   return {
    //     [TYPE]: 'tradle.Passport',
    //     givenName: names[0],
    //     surname: names.lastName,
    //     passportNumber: documentNumber || personalNumber,
    //     nationality: {
    //       id: 'tradle.Country_abc',
    //       title: nationality.abbr.slice(0, 2)
    //     },
    //     issuingCountry: {
    //       id: 'tradle.Country_abc',
    //       title: issuer.abbr.slice(0, 2)
    //     },
    //     sex: {
    //       id: 'tradle.Sex_abc',
    //       title: sex.full
    //     },
    //     // todo: set offset by country
    //     dateOfExpiry: dateFromParts(expiry),
    //     dateOfBirth: dateFromParts(dob),
    //     photos: [
    //       {
    //         url: cutoutBase64
    //       }
    //     ]
    //   }
    // }

    if (scanMode === 'MRZ') {
      // as returned by the `mrz` package
      // {
      //   "isValid": true,
      //   "format": "TD3",
      //   "documentType": {
      //     "code": "P",
      //     "label": "Passport",
      //     "type": "",
      //     "isValid": true
      //   },
      //   "issuingCountry": {
      //     "code": "UTO",
      //     "isValid": false,
      //     "error": "The country code \"UTO\" is unknown"
      //   },
      //   "lastname": "ERIKSSON",
      //   "firstname": "ANNA MARIA",
      //   "nationality": {
      //     "code": "UTO",
      //     "isValid": false,
      //     "error": "The country code \"UTO\" is unknown"
      //   },
      //   "birthDate": {
      //     "year": "69",
      //     "month": "08",
      //     "day": "06",
      //     "isValid": true
      //   },
      //   "sex": {
      //     "code": "F",
      //     "label": "Féminin",
      //     "isValid": true
      //   },
      //   "expirationDate": {
      //     "year": "94",
      //     "month": "06",
      //     "day": "23",
      //     "isValid": true
      //   },
      //   "personalNumber": {
      //     "value": "ZE184226B",
      //     "isValid": true
      //   }
      // }

      const {
        issuingCountry,
        nationality,
        lastname,
        firstname,
        birthDate,
        sex,
        expirationDate,
        documentNumber,
        personalNumber
      } = data

      return {
        [TYPE]: 'tradle.Passport',
        givenName: firstname.split(' ')[0],
        surname: lastname,
        passportNumber: documentNumber || personalNumber,
        nationality: {
          id: 'tradle.Country_abc',
          title: nationality.code.slice(0, 2)
        },
        issuingCountry: {
          id: 'tradle.Country_abc',
          title: issuingCountry.code.slice(0, 2)
        },
        sex: {
          id: 'tradle.Sex_abc',
          title: sex.code === 'M' ? 'Male' : 'Female'
        },
        // todo: set offset by country
        dateOfExpiry: dateFromParts(expirationDate),
        dateOfBirth: dateFromParts(birthDate),
        photos: [
          {
            url: cutoutBase64
          }
        ]
      }
    }
  },
  submitLog: async function () {
    const me = utils.getMe() || { firstName: '[unknown]', lastName: '[unknown]' }
    try {
      const res = await submitLog(ENV.serverToSendLog + '?' + querystring.stringify({
        firstName: me.firstName,
        lastName: me.lastName
      }))

      if (res.status > 300) {
        const why = await res.text()
        throw new Error(why)
      } else {
        Alert.alert('Success!', 'The log was sent to the Tradle developer team!')
      }

      return true
    } catch (err) {
      Alert.alert('Failed to send log', err.message)
      return false
    }
  },
  getPermalink(object) {
    return object[ROOT_HASH] || protocol.linkString(object)
  },
  addContactIdentity: async function (node, { identity, permalink }) {
    if (!permalink) permalink = utils.getPermalink(identity)

    // defensive copy
    identity = utils.clone(identity)

    let match
    try {
      match = await node.addressBook.byPermalink(permalink)
      if (equal(match.object, identity)) return
    } catch (err) {
      // oh well, I guess we have to do things the long way
    }

    return node.addContactIdentity(identity)
  },

  urlsEqual: function urlsEqual (a, b) {
    return trimTrailingSlashes(a) === trimTrailingSlashes(b)
  },
  isMessage(m) {
    return m[IS_MESSAGE]
    // if (typeof m === 'string')
    //   m = this.getModel(m).value
    // else if (m[TYPE])  // resource was passed
    //   m = this.getModel(m[TYPE]).value

    // if (m.isInterface  &&  (m.id === MESSAGE || m.id === DOCUMENT || m.id === ITEM))
    //   return true
    // if (m.interfaces && m.interfaces.indexOf(MESSAGE) !== -1)
    //   return true
  },
  isItem(model) {
    return model.interfaces  &&  model.interfaces.indexOf(ITEM) !== -1
  },
  isDocument(model) {
    return model.interfaces  &&  model.interfaces.indexOf(DOCUMENT) !== -1
  },
  getEnumProperty(model) {
    let props = model.properties
    for (let p in props)
      if (p !== TYPE)
        return p
  },
  requestCameraAccess: async function (opts={}) {
    if (utils.isAndroid()) {
      const check = PermissionsAndroid.check || PermissionsAndroid.checkPermission
      const request = PermissionsAndroid.request || PermissionsAndroid.requestPermission
      // const alreadyGranted = check.call(PermissionsAndroid, PermissionsAndroid.PERMISSIONS.CAMERA)
      // if (alreadyGranted) return true

      return await request.call(
        PermissionsAndroid,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          'title': utils.translate('cameraAccess'),
          'message': utils.translate('enableCameraAccess')
        }
      )
    }

    const { video=true, audio=false } = opts

    if (!(video || audio)) throw new Error('expected "video" and/or "audio"')

    let request
    if (video && audio) {
      request = Camera.checkDeviceAuthorizationStatus()
    } else if (video) {
      request = Camera.checkVideoAuthorizationStatus()
    } else {
      request = Camera.checkAudioAuthorizationStatus()
    }

    const granted = await request
    if (granted) return true

    Alert.alert(
      utils.translate('cameraAccess'),
      utils.translate('enableCameraAccess'),
      [
        { text: 'Cancel' },
        {
          text: 'Settings',
          onPress: () => {
            Linking.openURL('app-settings:')
          }
        }
      ]
    )
  },
  requestForModels() {
    let me = utils.getMe()
    var msg = {
      message: this.translate('customerWaiting', me.firstName),
      _t: CUSTOMER_WAITING,
      from: me,
      to: me.organization,
      time: new Date().getTime()
    }
    return msg
  },

  isSealableModel: function (model) {
    return model.subClassOf === 'tradle.Form' || model.subClassOf === 'tradle.MyProduct' || model.id === 'tradle.Verification'
  },
  isSavedItem(r) {
    let type = this.getType(r)
    let m = this.getModel(type).value
    if (!m.interfaces || m.interfaces.indexOf(ITEM) === -1)
      return
    let toId = utils.getId(r.to)
    let fromId = utils.getId(r.from)
    return toId === fromId  &&  toId === utils.getId(this.getMe())
  },
  getContentSeparator(bankStyle) {
    let separator = {}
    if (bankStyle) {
      if (bankStyle.navBarBorderColor) {
        separator.borderTopColor = bankStyle.navBarBorderColor
        separator.borderTopWidth = bankStyle.navBarBorderWidth ||  StyleSheet.hairlineWidth
      }
    }
    return separator
  },
  parseMessage(params) {
    let { resource, message, bankStyle, noLink, idx } = params
    let i1 = message.indexOf('**')
    let formType, message1, message2
    let messagePart
    if (i1 === -1)
      return message
    formType = message.substring(i1 + 2)
    let i2 = formType.indexOf('**')
    let linkColor = noLink ? '#757575' : bankStyle.linkColor
    if (i2 !== -1) {
      message1 = message.substring(0, i1)
      message2 = i2 + 2 === formType.length ? '' : formType.substring(i2 + 2)
      formType = formType.substring(0, i2)
      if (resource[TYPE] === FORM_REQUEST) {
        let form = this.getModel(resource.form).value
        if (form.subClassOf === MY_PRODUCT)
          linkColor = '#aaaaaa'
      }
    }
    let key = this.getDisplayName(resource).replace(' ', '_') + (idx || 0)
    idx = idx ? ++idx : 1
    let newParams = extend({}, params)
    newParams.idx = idx
    newParams.message = message2
    return <Text key={key} style={[chatStyles.resourceTitle, noLink ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{message1}
             <Text style={{color: linkColor}}>{formType}</Text>
             <Text>{utils.parseMessage(newParams)}</Text>
           </Text>
  },
  addDefaultPropertyValuesFor(provider) {
    defaultPropertyValues[this.getId(provider)] = provider._defaultPropertyValues
  },
  addHidePropertyInEditFor(provider) {
    hidePropertyInEdit[this.getId(provider)] = provider._hidePropertyInEdit
  },
  isHidden(p, resource) {
    let modelName = resource[TYPE]
    if (!this.isMessage(this.getModel(modelName).value))
      return
    // Check if the resource is one of the remedition resources
    // and in a reviewing after scan process - there are no from or to in it
    let isReview = !resource.from
    if (isReview)
      return
    let meId = this.getId(me)
    let provider = (utils.getId(resource.from) === meId) ? resource.to.organization : resource.from.organization
    if (!provider)
      return

    let hiddenProps = hidePropertyInEdit[utils.getId(provider)]
    if (hiddenProps) {
      hiddenProps = hiddenProps[modelName]
      return hiddenProps  &&  hiddenProps.indexOf(p) !== -1
    }
  },

  parseMessageFromDB(message) {
    let object = message
    while (object[TYPE] === MESSAGE) {
      let key = object.recipientPubKey
      if (!Buffer.isBuffer(key.pub)) {
        key.pub = new Buffer(key.pub.data)
      }

      object = object.object
      if (!object) break
    }

    return message
  },
  hasBacklinks(model) {
    let hasBacklinks
    let props = model.properties
    for (var p in props) {
      if (props[p].hidden)
        continue
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      hasBacklinks = true
    }
    return hasBacklinks
  },
  ungroup(model, arr, includeGroupProp) {
    if (!arr)
      return
    let props = model.properties
    let newArr = []
    arr.forEach((p) => {
      if (p.indexOf('_group') !== -1  && props[p].list) {
        if (includeGroupProp)
          newArr.push(p)
        props[p].list.forEach((pr) => newArr.push(pr))
      }
      else if (props[p].group)
        props[p].group.forEach((pr) => newArr.push(pr))
      else
        newArr.push(p)
    })
    return newArr
  },
  getRouteName(route) {
    const { displayName } = route.component
    if (displayName) return displayName

    if (typeof route.component === 'function') {
      return route.component.name || route.component.toString().match(/function (.*?)\s*\(/)[1]
    }

    return 'unknown'
  },

  whitePixel: {
    uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
  },

  async updateEnv() {
    let env
    try {
      env = await this.fetchEnv()
    } catch (err) {
      debug('failed to update environment from tradle server', err.message)
      return
    }

    if (env) {
      require('../Actions/Actions').updateEnvironment(env)
    }
  },

  async fetchEnv() {
    if (!ENV.tradleAPIKey) return

    const url = this.joinURL(ENV.tradleAPIEndpoint, 'fs', DeviceInfo.getBundleId(), 'environment.json')
    const res = await fetch(url, {
      headers: {
        'x-api-key': ENV.tradleAPIKey
      }
    })

    if (res.status > 300) {
      const text = await res.text()
      throw new Error(text)
    }

    return await res.json()
  },

  async isLatestVersion() {
    // no way to detect
    if (!utils.isIOS()) return true

    const bundleId = DeviceInfo.getBundleId()
    const qs = querystring.stringify({ bundleId })
    const res = await utils.fetchWithBackoff(`http://itunes.apple.com/lookup?${qs}`)
    const json = await res.json()
    if (json.resultCount < 0) throw new Error('app not found')

    const appVersion = json.results[0].version
    return appVersion !== DeviceInfo.getVersion()
  },

  waitsFor: function (prerequisite, fn) {
    return async function runAfterPrerequisite (...args) {
      await prerequisite
      return fn(...args)
    }
  },

  deepRemoveProperties(obj, test) {
    traverse(obj).forEach(function (value) {
      if (test(({ key: this.key, value }))) {
        this.remove()
      }
    })
  },
  pinFormRequest(result) {
    let len = result  &&  result.length
    if (len < 3)
      return
    let startI, insertI

    for (let i=len - 1; i>=0  &&  !startI; i--) {
      let r = result[i]
      let rtype = r[TYPE]
      if (!insertI  &&  (rtype === SIMPLE_MESSAGE  ||  rtype === PRODUCT_REQUEST))
        insertI = i
      if (r._context) {
        if (rtype === FORM_REQUEST  ||  rtype === FORM_ERROR)
          return

        startI = i
        insertI = insertI || startI
      }
    }
    if (!startI)
      return
    let lr = result[startI]
    let rtype = lr[TYPE]
    let pinFR = rtype === VERIFICATION // || utils.getModel(rtype).value.subClassOf === FORM
    if (!pinFR)
      return
    let contextId = utils.getId(lr._context)
    for (let i=startI; i>=0; i--) {
      let r = result[i]
      if (r[TYPE] !== FORM_REQUEST  ||  r.form === PRODUCT_REQUEST)
        continue
      if (r._documentCreated)
        return
      if (utils.getId(r._context) === contextId) {
        result.splice(i, 1)
        result.splice(insertI, 0, r)
        return true
      }
    }
  },

  series: async (data, fn) => {
    const results = []
    for (const item of data) {
      const result = await fn(item)
      results.push(result)
    }

    return results
  },

  batchify: function batchify (arr, batchSize) {
    const batches = []
    while (arr.length) {
      batches.push(arr.slice(0, batchSize))
      arr = arr.slice(batchSize)
    }

    return batches
  },

  batchProcess: async ({ data, batchSize=1, worker }) => {
    const results = await utils.series(utils.batchify(data, batchSize), worker)
    // flatten
    return results.reduce((all, some) => all.concat(some), [])
  },

  // normalizeBoxShadow({ shadowOffset={}, shadowRadius=0, shadowOpacity=0, shadowColor }) {
  //   if (utils.isWeb()) {
  //     const { width=0, height=0 } = shadowOffset
  //     const spreadRadius = 0
  //     const color = shadowColor.startsWith('rgb') ? shadowColor : require('./hex-to-rgb')(shadowColor)
  //     return `${width}px ${height}px ${shadowRadius}px ${spreadRadius}px rgba(0,0,0,0.12)`,
  //   }
  // }

  // isResourceInMyData(r) {
  //   let toId = utils.getId(r.to)
  //   let fromId = utils.getId(r.from)
  //   return toId === fromId  &&  toId === utils.getId(utils.getMe())
  // },
}

if (__DEV__) {
  ;['setPassword', 'getPassword'].forEach(method => {
    utils[method] = utils.addCatchLogger(method, utils[method])
  })
}

function trimTrailingSlashes (str) {
  return str.replace(/\/+$/, '')
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

/**
 * recover Buffer objects
 * @param  {Object} json
 * @return {Object} json with recovered Buffer-valued properties
 */
function rebuf (json) {
  if (Object.prototype.toString.call(json) !== '[object Object]') return json

  if (json &&
    json.type === 'Buffer' &&
    json.data &&
    !Buffer.isBuffer(json) &&
    Object.keys(json).length === 2) {
    return new Buffer(json.data)
  } else {
    for (var p in json) {
      json[p] = rebuf(json[p])
    }

    return json
  }
}

function parseDBValue (pair) {
  return pair[1] && rebuf(JSON.parse(pair[1]))
}

function dateFromParts (parts) {
  const date = new Date()
  date.setUTCHours(0)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)
  date.setUTCMilliseconds(0)
  date.setUTCFullYear(Number(parts.year))
  date.setUTCMonth(Number(parts.month) - 1)
  date.setUTCDate(Number(parts.day))
  return date
}

module.exports = utils;
/*
  getDisplayName1(resource, meta) {
    if (!meta) {
      if (resource.title)
        return resource.title
      if (resource.id)
        return ""
      meta = this.getModel(resource[TYPE]).value.properties
    }
    let dProps = this.getPropertiesWithAnnotation(meta, 'displayName')

    let m = this.getModel(resource[TYPE])
    let vCols = m  &&  m.value.viewCols
    var displayName = '';
    if (vCols) {
      vCols.forEach((p) => {
        if (dProps[p]) {
          let dn = this.getPropStringValue(meta[p], resource)
          displayName += displayName.length ? ' ' + dn : dn;
        }
      })
      // if (displayName.length)
      //   return displayName
    }
    // if models does not have viewCols or not all displayName props are listed in viewCols
    for (var p in meta) {
      if (p.charAt(0) === '_')
        continue
      if (vCols  &&  vCols.indexOf(p) !== -1)
        continue
      if (dProps)  {
        if (!dProps[p]) {
          if (!displayName  &&  m  &&  resource[p]  &&  m.value.subClassOf === 'tradle.Enum')
            return resource[p];
          continue
        }
        else {
          let dn = this.getPropStringValue(meta[p], resource)
          displayName += displayName.length ? ' ' + dn : dn;
        }
      }
      // let dn = this.getPropStringValue(meta[p], resource)
      // displayName += displayName.length ? ' ' + dn : dn;
    }
    return displayName;
  },
  // getDisplayName(resource, meta) {
  //   if (Array.isArray(resource))
  //     return
  //   if (!meta) {
  //     if (!resource[TYPE]) {
  //       if (resource.id   &&   resource.title)
  //         return resource.title
  //       if (resource.id)
  //         return ""
  //     }
  //     meta = this.getModel(resource[TYPE]).value.properties
  //   }
  //   let m = resource[TYPE] ? this.getModel(resource[TYPE]) : null
  //   var displayName = '';
  //   for (var p in meta) {
  //     if (p.charAt(0) === '_')
  //       continue
  //     if (!meta[p].displayName) {
  //       if (!displayName  &&  m  &&  resource[p]  &&  m.value.subClassOf === ENUM)
  //         return resource[p];
  //       continue
  //     }
  //     let dn = this.getStringValueForProperty(resource, p, meta)
  //     if (dn)
  //       displayName += displayName.length ? ' ' + dn : dn;
  //   }
  //   if (!displayName.length  &&  m) {
  //     let vCols = m.value.viewCols
  //     if (!vCols)
  //       return displayName
  //     let excludeProps = []
  //     if (this.isMessage(m))
  //       excludeProps = ['from', 'to']
  //     for (let i=0; i<vCols.length  &&  !displayName.length; i++) {
  //       let prop =  vCols[i]
  //       if (meta[prop].type === 'array')
  //         continue
  //       if (!resource[prop]  ||  excludeProps.indexOf[prop])
  //         continue
  //       displayName = this.getStringValueForProperty(resource, prop, m.value.properties)
  //     }
  //   }
  //   return displayName;
  // },
  // // temporary, let's hope
  // interpretStylesPack(stylesPack) {
  //   let interpreted = {}
  //   Object.keys(stylesPack).forEach(prop => {
  //     // booHoo => BOO_HOO
  //     if (prop.charAt(0) === '_')
  //       return
  //     const localName = utils.splitCamelCase(prop).join('_').toUpperCase()
  //     interpreted[localName] = stylesPack[prop]
  //   })

  //   return interpreted
  // },
*/
