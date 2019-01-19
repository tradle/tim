import React from 'react'
import {
  NativeModules,
  Text,
  // findNodeHandle,
  Dimensions,
  Linking,
  PixelRatio,
  Platform,
  StyleSheet
} from 'react-native'

import querystring from 'querystring'
import traverse from 'traverse'
import DeviceInfo from 'react-native-device-info'
import Keychain from 'react-native-keychain'
import { getDimensions, getOrientation } from 'react-native-orient'
import compareVersions from 'compare-versions'
import crypto from 'crypto'
import Q from 'q'
import _collect from 'stream-collector'
import moment from 'moment'
import dateformat from 'dateformat'
import Backoff from 'backoff'
import _ from 'lodash'
import levelErrors from 'levelup/lib/errors'
import Cache from 'lru-cache'
// import mutexify from 'mutexify'
import Promise from 'bluebird'
import Debug from 'debug'
const debug = Debug('tradle:app:utils')
import safeStringify from 'json-stringify-safe'
import validateResource from '@tradle/validate-resource'
import Embed from '@tradle/embed'
const { sanitize } = validateResource.utils
import Lens from '@tradle/lens'
import {
  protocol,
  utils as tradleUtils
} from '@tradle/engine'
import constants from '@tradle/constants'
import { calcLinks, omitVirtual } from '@tradle/build-resource'
import * as promiseUtils from '@tradle/promise-utils'
import { Errors as ValidateResourceErrors } from '@tradle/validate-resource'

import AsyncStorage from '../Store/Storage'
// import Store from '../Store/Store'
import ENV from './env'

import platformUtils from './platformUtils'
import { post as submitLog } from './debug'
// import Actions from '../Actions/Actions'
import chatStyles from '../styles/chatStyles'
import Strings from './strings'
import { BLOCKCHAIN_EXPLORERS } from './blockchain-explorers'
// FIXME: circular dep
import Alert from '../Components/Alert'
import dictionaries from './dictionaries'
import { tryWithExponentialBackoff } from './backoff'

import { getDictionary } from '../Store/utils/storeUtils'

const collect = Promise.promisify(_collect)
const getStore = () => require('../Store/Store')

// import Orientation from 'react-native-orientation'

// var orientation = Orientation.getInitialOrientation()
// Orientation.addOrientationListener(o => orientation = o)

const IS_MESSAGE = '_message'
var strMap = {
  'Please fill out this form and attach a snapshot of the original document': 'fillTheFormWithAttachments',
  'Please fill out this form': 'fillTheForm',
  'Please take a **selfie** picture of your face': 'takeAPicture'
}

var {
  TYPE,
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
  CUSTOMER_WAITING,
  MESSAGE,
  ENUM
} = constants.TYPES

const PRODUCT_APPLICATION = 'tradle.ProductApplication'

const MY_PRODUCT = 'tradle.MyProduct'
const ITEM = 'tradle.Item'
const DOCUMENT = 'tradle.Document'

const FORM_ERROR = 'tradle.FormError'
const FORM_REQUEST = 'tradle.FormRequest'
const PHOTO = 'tradle.Photo'
const PASSWORD_ENC = 'hex'
const STYLES_PACK = 'tradle.StylesPack'
const CONTEXT = 'tradle.Context'
const MSG_LINK = '_msg'
const APPLICATION = 'tradle.Application'
const BOOKMARK = 'tradle.Bookmark'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const IPROOV_SELFIE = 'tradle.IProovSelfie'
const STATUS = 'tradle.Status'

var dictionary, language //= dictionaries[Strings.language]

var models, me
var DEFAULT_FETCH_TIMEOUT = 5000
// var stylesCache = {}

var defaultPropertyValues = {}
var hidePropertyInEdit = {}

const getVersionInAppStore = Platform.select({
  ios: async () => {
    const bundleId = DeviceInfo.getBundleId()
    const qs = querystring.stringify({ bundleId })
    const res = await utils.fetchWithBackoff(`https://itunes.apple.com/lookup?${qs}`)
    const json = await res.json()
    if (json.resultCount < 0) throw new Error('app not found')

    return json.results[0].version
  },

  // android: async() => {
  //   const res = await fetch(ENV.APP_URL)
  //   const html = await res.text()
  //   return html.match(/Current Version.*?([\d.]+)/)[1]
  // }

  default: async () => {
    throw new Error('not supported')
  }
})


var utils = {
  ...promiseUtils,
  promisify: Promise.promisify,
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
    if (!me.language)
      return

    let lang = me.languageCode
    if (!lang)
      lang = me.language.id.split('_')[1]
    if (!lang)
      return
    if (language === lang)
      return
    language = lang
    Strings.setLanguage(lang)
    let d = dictionaries(lang)
    if (d) {
      const enD = getDictionary()
      dictionary = _.extend({}, enD, d)
      // dictionary = _.extend({}, dictionaries('en'), d)
    }
  },
  getMe() {
    return me;
  },
  isMe(resource) {
    let me = utils.getMe()
    return me  &&  me[ROOT_HASH] === resource[ROOT_HASH]
  },
  setModels(modelsRL) {
    models = modelsRL;
    // modelsForStub = {}
    // for (let m in models)
    //   modelsForStub[m] = models[m]
  },

  getModels() {
    return models;
  },
  getModelByTitle(title) {
    let mm = Object.values(models)
    let idx = _.findIndex(mm, (m) => m.title === title)
    return idx && mm[idx]
  },
  // getModelsForStub() {
  //   return modelsForStub
  // },
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

    const { properties } = utils.getModel(STYLES_PACK)
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
  sanitize(resource) {
    let r =  sanitize(resource).sanitized
    for (let p in r) {
      if (!r[p])
        delete r[p]
    }
    return r
  },
  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  },
  getRequestedFormType(resource) {
    if (resource[TYPE] === FORM_REQUEST) {
      return resource.form
    }

    if (resource[TYPE] === FORM_ERROR) {
      const type = resource.prefill && resource.prefill[TYPE]
      if (type) return type

      return utils._parseStub(resource.prefill).type
    }

    return resource[TYPE]

    // throw new Error('expected tradle.FormRequest or tradle.FormError')
  },
  _parseStub (stub) {
    const { id, title, type, link, permalink, _t, _link, _permalink } = stub
    if (type && link && permalink) {
      return _.pick(stub, ['type', 'link', 'permalink', 'title'])
    }

    if (_t && _link && _permalink) {
      return { type: _t, link: _link, permalink: _permalink }
    }

    const parsedId = utils._parseId(id)
    parsedId.title = title
    return parsedId
  },
  _parseId (id) {
    const [type, permalink, link] = id.split('_')
    return { type, permalink, link }
  },
  getLensedModel(fr, lensId) {
    const Store = getStore()
    const form = utils.getRequestedFormType(fr)
    let model = Store.getOriginalModel(form)
    lensId = lensId  ||  fr.lens

    if (!lensId)
      return Store.getAugmentedModel(model)

    let lens = Store.getLens(lensId)
    if (!lens)
      return Store.getAugmentedModel(model)

    let merged = Lens.merge({ models: utils.getModels(), model, lens })
    // let m = _.cloneDeep(merged)
    // let props = m.properties
    // for (let p in props)
    //   props[p].name = p
    return Store.getAugmentedModel(merged)
  },
  applyLens({prop, values, list }) {
    let pin = prop.pin  ||  values
    let limit = prop.limit
    if (!pin  &&  !limit)
      return list
    let isEnum = utils.isEnum(prop.ref  ||  prop.items.ref)
    if (isEnum) {
      if (limit  &&  limit.length) {
        let limitMap = {}
        let newlist = list.filter((l) => {
          let id = l[ROOT_HASH]
          if (limit.indexOf(id) === -1)
            return true
          else
            limitMap[id] = l
          return false
        })
        // pin.filter((id) => pinMap[id])
        list = []
        limit.forEach(p => {
          if (limitMap[p])
            list.push(limitMap[p])
        })
      }
    }
    if (pin  &&  pin.length) {
      if (isEnum) {
        let pinMap = {}
        let newlist = list.filter((l) => {
          let id = l[ROOT_HASH]
          if (pin.indexOf(id) === -1)
            return true
          else
            pinMap[id] = l
          return false
        })
        if (utils.isEmpty(pinMap))
          return list
        let newpin = [] //= pin.filter((id) => pinMap[id])
        pin.forEach(p => {
          if (pinMap[p])
            newpin.push(pinMap[p])
        })

        list = newpin.concat(newlist)
      }
    }
    return list
  },
  getLensId(resource, provider) {
    if (!resource._sharedWith)
      return
    if (provider[TYPE] !== ORGANIZATION)
      return resource._lens
    let lens
    provider.contacts.forEach(c => {
      resource._sharedWith.forEach(s => {
        if (s.bankRepresentative === c.id)
          lens = s.lens
      })
    })
    return lens || resource._lens
  },
  getModel(modelName) {
    return getStore().getModel(modelName)
    // const model = models ? models[modelName] : null
    // // if (!model) debug(`missing model: ${modelName}`)
    // return model
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
      return property.title || utils.makeLabel(property.name)
    let translations = dictionary.properties[property.name]
    let val
    if (translations)
      val = translations[model.id] || translations.Default

    return val || property.title || utils.makeLabel(property.name)
  },
  translateModel(model, isPlural) {
    if (dictionary  &&  dictionary.models[model.id])
      return dictionary.models[model.id]  ||  utils.makeModelTitle(model, isPlural)
    return model.title ? model.title : utils.makeModelTitle(model, isPlural)
  },
  translateEnum(resource) {
    if (!dictionary) {
      if (!resource.title)
        return utils.buildRef(resource).title
      return resource.title
    }
    let rtype = utils.getType(resource)
    let e = dictionary.enums[rtype]
    if (utils.isStub(resource))  {
      if (!e)
        return resource.title
      let [type, id] = resource.id.split('_')
      return e[id]  ||  resource.title
    }
    else if (e)
      return e[resource[ROOT_HASH]] || resource[utils.getEnumProperty(utils.getModel(rtype))]
    else {
      return utils.buildRef(resource, utils.getModel(rtype)).title
      // let prop = Object.keys(utils.getModel(rtype).properties)[0]
      // return resource[prop]
    }
  },
  translateString(...args) {
    const { strings } = Strings
    if (!strings)
      return utils.makeLabel(args[0])

    let s = strings[args[0]]
    if (!s)
      return utils.makeLabel(args[0])

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
  clone: _.cloneDeep,
  compare(r1, r2, isInlined) {
    if (!r1 || !r2)
      return (r1 || r2) ? false : true

    if (isInlined) return _.isEqual(r1, r2)

    let properties = utils.getModel(r1[TYPE]).properties
    let exclude = ['_time', ROOT_HASH, CUR_HASH, PREV_HASH, NONCE, 'verifications', '_sharedWith']
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
        if (!r1[p].some((r) => r2[p].some((rr2) => _.isEqual(r, rr2))))
          return false
      }
      else if (typeof r1[p] === 'object') {
        if (!r2[p])
          return false
        if (prop.ref === MONEY) {
          if (r1[p].currency !== r2[p].currency  ||  r1[p].value !== r2[p].value)
            return false
        }
        else if (prop.inlined  ||  (prop.ref  &&  utils.getModel(prop.ref).inlined)) {
          if (!utils.compare(r1[p], r2[p], true))
            return false
        }
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
    if (typeof model === 'string') {
      let m = utils.getModel(model)
      if (m)
        return utils.makeModelTitle(m, isPlural)
      else {
        let idx = model.lastIndexOf('.')
        return idx === -1 ? utils.makeLabel(model) : utils.makeLabel(model.substring(idx + 1))
      }
    }
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
    return newLabel.trim()
    // return label
    //       // insert a space before all caps
    //       .replace(/([A-Z])/g, ' $1')
    //       // uppercase the first character
    //       .replace(/^./, function(str){ return str.toUpperCase(); }).trim()
  },

  makeLabel(label, isPlural) {
    if (!utils.isCamelCase(label))
      return label.charAt(0).toUpperCase() + label.slice(1)

label = label.replace(/([a-z])([A-Z])/g, '$1 $2')
        // space before last upper in a sequence followed by lower
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        // uppercase the first character
        .replace(/^./, function(str){ return str.toUpperCase(); })

    // label = label
    //       .replace(/_/g, ' ')
    //       // insert a space before all caps
    //       .replace(/([A-Z])/g, ' $1')
    //       // uppercase the first character
    //       .replace(/^./, function(str){ return str.toUpperCase(); })
    //       .trim()
    let parts = label.split(' ')
    if (parts.length === 1)
      return label
    // keep abbreviations intact


// return parts.reduce((sum, cur) => {
//   if (!cur.length)
//     return sum + cur
//   if (cur.length === 1  &&  cur.toUpperCase() === cur) {
//     let len = sum.length - 1
//     if (len  &&  sum.charAt(len - 1).toUpperCase() === sum.charAt(len - 1))
//       return sum + cur
//   }
//   return sum + ' ' + cur
// })
    return parts.reduce((sum, cur) => sum + (!cur.length ? cur : ' ' + cur))

  },
  isCamelCase(str){
    var strArr = str.split('');
    var string = '';
    for(var i in strArr) {
      if(strArr[i].toUpperCase() === strArr[i])
        string += '-'+strArr[i].toLowerCase();
      else
        string += strArr[i];
    }

    if (utils.toCamelCase(string) === str)
      return true;
    else
      return false;

  },
  toCamelCase(str, cap1st) {
    return ((cap1st ? '-' : '') + str).replace(/-+([^-])/g, (a, b) => b.toUpperCase())
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
      var m = models[p];
      if (excludeModels) {
        var found = false
        for (var i=0; i<excludeModels.length && !found; i++) {
          if (p === excludeModels[i])
            found = true
          else {
            var em = utils.getModel(p)
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
      var m = models[p];
      if (m.subClassOf  &&  m.subClassOf === iModel)
        subclasses.push(m);
    }
    return subclasses;
  },
  isSubclassOf(type, subType) {
    if (typeof type === 'string')
      return utils.getModel(type).subClassOf === subType
    if (type.type)  {
      if (type.type === 'tradle.Model')
      return type.subClassOf === subType
    }
    return utils.getModel(type[TYPE]).subClassOf === subType
  },
  isMyProduct(type) {
    return utils.isSubclassOf(type, MY_PRODUCT)
  },
  isForm(type) {
    return utils.isSubclassOf(type, FORM)
  },
  isVerification(type) {
    return utils.isSubclassOf(type, VERIFICATION)
  },
  isInlined(m) {
    if (m.inlined)
      return true
    if (!m.subClassOf)
      return false
    return utils.isInlined(utils.getModel(m.subClassOf))
  },
  isMyMessage({resource, to}) {
    let r = resource
    if (!r.from)
      return false
    let fromId = utils.getId(r.from);
    let toId = utils.getId(r.to);
    let me = utils.getMe()
    let meId = utils.getId(me)
    if (fromId === meId)
      return true;
    if (toId === meId)
      return false

    if (me.isEmployee) {
      if (r.from.organization  &&  me.organization.id !== r.from.organization.id)
        return false
      if (r._context) {
        // check if the employee is the applicant
        let cFrom = r._context.from
        if (utils.getId(cFrom) === meId)
          return true
        if (cFrom.organization) {
          if (cFrom.organization.id === me.organization.id)
            return utils.getId(r._context.to) !== meId
        }
      }
      let myOrgId = utils.getId(me.organization)
      // bot -> bot
      if (r.from.organization  &&
          r.to.organization    &&
          r.from.organization.id === r.to.organization.id  &&
          r.from.organization.id === myOrgId) {
        return false
      }

      if (r.from.organization) {
        if (myOrgId === utils.getId(r.from.organization)) {
          if (to  &&  utils.getId(to) === myOrgId)
            return false
          else
            return true
        }
      }
      if (r._context) {
        if (r._context.from) {
          let fOrg = r._context.from.organization
          let applier = fOrg  &&  utils.getId(fOrg) === utils.getId(me.organization)
          if (applier  &&  fOrg === utils.getId(r.from.organization))
            return true
        }
      }
    }
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
      let m = utils.getModel(r[TYPE])
      if (m  &&  m.subClassOf !== ENUM)
        id +=  '_' + (r[CUR_HASH] || r[ROOT_HASH])
      // return  m  &&  (m.subClassOf === FORM  ||  m.id === VERIFICATION  ||  m.id === MY_PRODUCT)
      //       ? id + '_' + (r[CUR_HASH] || r[ROOT_HASH])
      //       : id
      return id
    }
  },
  makeId(type, permalink, link) {
    let model = utils.getModel(type)
    link = link || permalink
    return utils.buildId({model, permalink, link})
  },
  makePermId(type, permalink) {
    return `${type}_${permalink}`
  },
  getType(r) {
    if (typeof r === 'string')
      return r.split('_')[0]
    if (!r) debugger
    if (r[TYPE])
      return r[TYPE]
    let id = utils.getId(r)
    if (id)
      return id.split('_')[0]
  },
  getProduct(r) {
    return r[TYPE] === PRODUCT_APPLICATION
           ? r.product
           : r.requestFor
  },
  getItemsMeta(metadata) {
    var props = metadata.properties;
    // var required = utils.arrayToObject(metadata.required);
    // if (!required)
    //   return;
    var itemsMeta = {};
    for (var p in props) {
      if (props[p].type !== 'array')  //  &&  required[p]) {
        continue
      let ref = props[p].items.ref
      if (!ref  ||  utils.getModel(ref).subClassOf !== ENUM)
        itemsMeta[p] = props[p];
    }
    return itemsMeta;
  },
  makeTitle(resourceTitle) {
    return (resourceTitle.length > 28) ? resourceTitle.substring(0, 28) + '...' : resourceTitle;
  },
  getPropertiesWithAnnotation(model, annotation) {
    let props = {}
    let meta = model.properties
    for (let p in meta) {
      if (meta[p][annotation])
        props[p] = meta[p]
      // else if (meta[p].items  &&  meta[p].items[annotation] === annotation)
      //   props[p] = meta[p]
    }

    return props
  },

  getDisplayName(resource, model) {
    if (Array.isArray(resource))
      return
    if (!model) {
      if (utils.isStub(resource)) {
        if (!resource.title)
          return ''
        let rType = utils.getType(resource)
        let dnObj = utils.getPropertiesWithAnnotation(utils.getModel(rType), 'displayName')
        if (dnObj) {
          let dnProps = Object.values(dnObj)
          if (dnProps.length === 1  &&  dnProps[0].range === 'model') {
            let m = utils.getModel(resource.title)
            return m && utils.makeModelTitle(m) || resource.title
          }
        }
        return resource.title
      }
      model = utils.getModel(resource[TYPE])
    }
    let props = model.properties
    let rType = utils.getType(resource)
    let resourceModel = rType && utils.getModel(rType)

    var displayName = '';

    let dnProps = utils.getPropertiesWithAnnotation(resourceModel ||  model, 'displayName')
    if (dnProps) {
      for (let p in dnProps) {
        if (!resource[p])
          continue
        let dn
        if (props[p].ref  &&  utils.getModel(props[p].ref).subClassOf === ENUM)
          dn = utils.translateEnum(resource[p])
        else if (props[p].range === 'model')
          dn = utils.translate(utils.getModel(resource[p]))
        else if (rType === BOOKMARK)
          dn = utils.translate(resource.message)
        else
          dn = utils.getStringValueForProperty(resource, p, props)
        if (dn)
          displayName += displayName.length ? ' ' + dn : dn;
      }
    }
    if (displayName.length  ||  !resourceModel)
      return displayName

    // Choose ENUM prop for display name
    let refProps = utils.getPropertiesWithAnnotation(resourceModel ||  model, 'ref')
    for (var p in refProps) {
      if (p.charAt(0) === '_')
        continue
      if (!resource[p])
        continue
      let prop = props[p]
      if (resourceModel.subClassOf === ENUM)
        return resource[p]
      else if (prop.ref  &&  utils.getModel(prop.ref).subClassOf === ENUM)
        return resource[p].title
      if (utils.isContainerProp(prop, resourceModel))
        continue
      let dn = utils.getStringValueForProperty(resource, p, props)
      if (dn)
        displayName += displayName.length ? ' ' + dn : dn;
    }
    if (displayName.length)
      return displayName
    // Construct display name from viewCols
    let vCols = resourceModel.viewCols || utils.getViewCols(resourceModel)
    if (!vCols || !vCols.length)
      return displayName

    let excludeProps = []
    if (utils.isMessage(resourceModel))
      excludeProps = ['from', 'to']
    for (let i=0; i<vCols.length  &&  !displayName.length; i++) {
      let p =  vCols[i]
      let prop = props[p]
      if (prop.type === 'array' || prop.markdown  ||  prop.signature)
        continue
      if (utils.isContainerProp(p, resourceModel))
        continue
      if ((!resource[p]  &&  !prop.displayAs)  ||  excludeProps.indexOf[p])
        continue
      displayName = utils.getStringValueForProperty(resource, p, resourceModel.properties)
    }
    return displayName;
  },

  getStringValueForProperty(resource, p, meta) {
    let displayName = ''
    if (resource[p]) {
      if (meta[p].type === 'date')
        return utils.getDateValue(resource[p])
      if (meta[p].type !== 'object') {
        if (meta[p].range  ===  'model') {
          let m = utils.getModel(resource[p])
          if (m)
            return utils.makeModelTitle(m)
        }
        return resource[p] + (meta[p].units || '')
      }
      if (resource[p].title)
        return resource[p].title;
      if (meta[p].ref) {
        if (meta[p].ref == MONEY)  {
          let c = utils.normalizeCurrencySymbol(resource[p].currency)
          return (c || '') + resource[p].value
        }
        else if (resource[p][TYPE]) {
          let rm = utils.getModel(resource[p][TYPE])
          if (rm)
            return utils.getDisplayName(resource[p], rm);
        }
      }
    }
    else if (meta[p].displayAs) {
      var dn = utils.templateIt(meta[p], resource);
      if (dn)
        return dn
    }
    return displayName
  },
  getPropByTitle(props, propTitle) {
    let propTitleLC = propTitle.toLowerCase()
    for (let p in props) {
      let prop = props[p]
      let pTitle = prop.title || utils.makeLabel(p)
      if (pTitle.toLowerCase() === propTitleLC)
        return p
    }
  },
  getDateValue(value) {
    let lang = language || 'en'
    switch (lang) {
    case 'fil':
      lang = 'tl-ph'
      require('moment/locale/tl-ph')
      break
    case 'fr':
      require('moment/locale/fr')
      break
    case 'es':
      require('moment/locale/es')
      break
    case 'vi':
      require('moment/locale/vi')
      break
    case 'bn':
      require('moment/locale/bn')
      break
    case 'nl':
      require('moment/locale/nl')
      break
    default:
      moment.locale(false)
    }
    moment().locale('en')
    let valueMoment = moment.utc(value)
    let v = value instanceof Date && value.getTime()  ||  value
    let localLocale = moment(value).locale(lang === 'en' && false || lang)
    let useCalendarFormat = Math.abs(Date.now() - v) <= 24 * 3600 * 1000
    if (useCalendarFormat)
      return localLocale.calendar()

    let format
    if (!valueMoment.hours()  &&  !valueMoment.minutes()  &&  !valueMoment.seconds())
      format = 'LL'
    else
      format = 'LLL'

    // return moment.calendarFormat(valueMoment)
    return localLocale.format(format)
    // let format = 'MMMM Do, YYYY h:MMA'
    // return valueMoment && valueMoment.format(format)
  },
  isIphone10orMore() {
    const deviceID = DeviceInfo.getDeviceId()
    return deviceID  &&  deviceID.indexOf('iPhone') === 0 && parseInt(deviceID.substring(6).split(',')[0]) >= 10
  },
  getPropStringValue(prop, resource) {
    let p = prop.name
    if (!resource[p]  &&  prop.displayAs)
      return utils.templateIt(prop, resource);
    if (prop.type == 'object')
      return resource[p].title || utils.getDisplayName(resource[p], utils.getModel(resource[p][TYPE]).properties);
    else
      return resource[p] + '';
  },
  getEditCols(model) {
    let { editCols, properties } = model
    let eCols = []
    let isWeb = utils.isWeb()
    if (!editCols) {
      let viewCols = utils.getViewCols(model)
      if (viewCols)
        eCols = viewCols.map(p => properties[p])
      return eCols
    }
    editCols.forEach((p) => {
      if (properties[p].readOnly)
        return
      if (isWeb  &&  properties[p].scanner  &&  properties[p].scanner !== 'id-document')
        return
      let idx = p.indexOf('_group')
      if (idx === -1                          ||
          !properties[p].list                 ||
          properties[p].title.toLowerCase() !== p)
        eCols.push(properties[p])

      if (idx !== -1  &&  properties[p].list) {
        let eColsCnt = eCols.length
        let isLastPropGroup = eCols[eColsCnt - 1].name.indexOf('_group') !== -1
        properties[p].list.forEach((p) => {
          if (eCols.indexOf(properties[p]) === -1)
            eCols.push(properties[p])
        })
        if (eColsCnt === eCols.length  &&  isLastPropGroup)
          eCols.pop()
      }
    })
    return eCols
  },
  hasPaymentCardScannerProperty(type) {
    let m = utils.getModel(type)
    let scannedProps = utils.getPropertiesWithAnnotation(m, 'scanner')
    if (scannedProps)  {
      let p = Object.keys(scannedProps)
      if (p.length  &&  scannedProps[p[0]].scanner === 'payment-card')
        return m.properties[p[0]]
    }
    return null
  },
  getViewCols(model) {
    let { viewCols, properties } = model
    let vCols = []
    if (viewCols) {
      viewCols.forEach((p) => {
        let prop = properties[p]
        let idx = p.indexOf('_group')
        if (idx === -1  ||  !prop.list || prop.title.toLowerCase() !== p  ||  vCols.indexOf(p) !== -1)
          vCols.push(p)

        if (idx !== -1  &&  prop.list)
          prop.list.forEach((p) => vCols.push(p))
        // eCols[p] = props[p]
      })
    }
    for (let p in properties) {
      let prop = properties[p]
      if (vCols.indexOf(p) === -1  &&  !prop.readOnly  &&  !prop.hidden  &&  p.indexOf('_group') !== p.length - 6  &&  !prop.signature)
        vCols.push(p)
    }
    return vCols
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
    if (!resource[TYPE]  &&  resource.title)
      return resource.title
    let rtype = resource[TYPE] || (m  &&  m.id)
    // if (resource.id  &&  resource.title)
    //   return resource.title
    let pgroup = prop.group
    if (!pgroup.length)
      return prop.displayAs
    let group = []
    let hasSetProps
    let props = utils.getModel(rtype).properties
    for (let i=0; i<pgroup.length; i++) {
      let p = pgroup[i]
      let v =  resource[p] ? resource[p] : ''
      if (v)
        hasSetProps = true
      if (typeof v === 'object')
        v = v.title ? v.title : utils.getDisplayName(v, utils.getModel(props[p].ref))
      else if (props  &&  props[p].range  &&  props[p].range  === 'check')
        v = ''
      if (props[p].units)
        v += props[p].units
      group.push(v)
    }

    if (hasSetProps) {
      let s = utils.template(prop.displayAs, group).trim()
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
  //     return utils.template(prop.displayAs, group).trim()
  // },

  // parentModel for array type props
  templateIt(prop, resource, parentModel) {
    var template = prop.displayAs;
    if (typeof template === 'string')
      return utils.templateIt1(prop, resource, parentModel)
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
                let m = self.getModel(resource[t][TYPE])
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
  formatDate(date, showTime) {
    // var dayDiff = moment(new Date()).dayOfYear() - moment(date).dayOfYear();
    var date = new Date(date);
    var now = new Date()

    var dayDiff = Math.floor((now.getTime() - date.getTime()) / (3600 * 24 * 1000))
    if (dayDiff === 0)
      dayDiff = now.getDate() - date.getDate()
    // var noTime = true
    var val;
    switch (dayDiff) {
    case 0:
      val = dateformat(date, 'h:MM TT')
      // val = moment(date).format('h:mA') //moment(date).fromNow();
      break;
    // case 1:
    //   // noTime = false
    //   val = 'yesterday, ' + dateformat(date, 'h:MM TT')
    //   // val = moment(date).format('[yesterday], h:mA');
    //   break;
    default:
      val = utils.getDateValue(date) // dateformat(date, 'mmm d, yyyy' + (showTime ? ' h:MM TT' : ''));
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
    else if (url.indexOf('../') === 0 || Embed.isKeeperUri(url))
      return url
    // else if (url.indexOf('/var/mobile/') == 0)
    //   return url;
    else if (url.indexOf('://') !== -1)
      return url
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
        if (lastAdditionalInfoTime  &&  lastAdditionalInfoTime < r._time)
          lastAdditionalInfoTime = r._time;
      });
    }
    /*
    resource.verifications.forEach(function(r) {
      var rh = r.from[ROOT_HASH];
      if (!rh)
        rh = utils.getId(r.from).split('_')[1];

      if (rh === me[ROOT_HASH]  &&  (!lastAdditionalInfoTime  ||  lastAdditionalInfoTime < r._time))
        verifiedByMe = true
    });
    */
    return verifiedByMe
  },
  isReadOnlyChat(resource, context) {
    let me = utils.getMe()
    if (!me)
      return false
    if (resource[TYPE] === APPLICATION)
      return utils.isRM(resource)
    let {to, from} = resource
    if (!to || !from)
      return false
    let meId = utils.getId(me)
    let fromId = utils.getId(from)
    let toId = utils.getId(to)
    let isReadOnly
    if (toId !== meId  &&  fromId !== meId) {
      if (!me.isEmployee  ||  !to.organization  ||  utils.getId(me.organization) !== utils.getId(to.organization))
        isReadOnly = true
    }
    let isContext = utils.isContext(resource)
    if (isReadOnly || (!context && !isContext)  || (resource[TYPE] !== FORM_ERROR  &&   resource[TYPE] !== FORM_REQUEST))
      return isReadOnly
    // Form error can be used only by context originating contact
    // return !isReadOnly  &&  context
    //        ? meId  !== utils.getId(context.from)
    //        : isReadOnly
    if (isReadOnly  ||  !context)
      return isReadOnly
    if (meId  === utils.getId(context.from))
      return isReadOnly
    if (me.isEmployee  &&  to.organization  &&  to.organization.id  &&  to.organization.id === me.organization.id)
      return isReadOnly
    return true
  },
  buildRef(resource) {
    if (!resource[TYPE] && resource.id)
      return resource
    let ref = {
      id: utils.getId(resource),
      title: resource.id ? resource.title : utils.getDisplayName(resource)
    }
    if (resource._time)
      ref._time = resource._time
    return ref
  },
  isStub(resource) {
    if (!resource[ROOT_HASH]  &&  resource.id)
      return true
    let m = utils.getModel(utils.getType(resource))
    return m.required  &&  !resource[m.required[0]]
  },
  hasSupportLine(resource) {
    let me = utils.getMe()
    if (resource._hasSupportLine)
      return true
    if (!me.isEmployee)
      return

    if (me.organization._hasSupportLine) {
      if (resource[TYPE] === PROFILE)
        return true
      if (utils.isContext(resource[TYPE])) {
        if (resource._relationshipManager)
          return true
      }
    }
    else if (resource[TYPE] === ORGANIZATION  && utils.getId(me.organization) === utils.getId(resource))
      return true
  },
  optimizeResource(resource, doNotChangeOriginal) {
    let res = doNotChangeOriginal ? _.cloneDeep(resource) : resource
    let m = utils.getModel(res[TYPE])
    // if (!m.interfaces)
    //   res = utils.optimizeResource1(resource, doNotChangeOriginal)
    // else {
      var properties = m.properties
      var exclude = ['from', 'to', '_time', 'sealedTime', 'txId', 'blockchain', 'networkName']
      let isVerification = m.id === VERIFICATION
      let isContext = utils.isContext(m)
      let isFormRequest = m.id === FORM_REQUEST
      let isFormError = m.id === FORM_ERROR
      let isBookmark = m.id === BOOKMARK
      Object.keys(res).forEach(p => {
        if (p === '_context'  &&  res._context) {
          res._context = utils.buildRef(res._context)
          return
        }
        if (p.charAt(0) === '_'  ||  exclude.indexOf(p) !== -1)
          return
        if (isContext  &&  (p === 'requestFor' || p === 'contextId'))
          return
        if (isFormRequest  &&  (p === 'product'  ||  p === 'form'))
          return
        if (isVerification  &&  p === 'document')
          res[p] = utils.buildRef(res[p])
        else if (isFormError  &&  p === 'prefill') {
          if (res[p][ROOT_HASH])
            res[p] = utils.buildRef(res[p])
        }
        else if (isBookmark  &&  p === 'bookmark')
          return
        else if (properties[p]  &&  properties[p].ref  &&  utils.isContainerProp(properties[p], m))
          res[p] = utils.buildRef(res[p])
        else
          delete res[p]
      })
    // }
    delete res._cached
    if (!utils.isMessage(res))
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
  getContainerProp(itemModel) {
    let refs = utils.getPropertiesWithAnnotation(itemModel, 'ref')
    if (!refs)
      return
    for (let p in refs) {
      let r = refs[p]
      let refModel = utils.getModel(r.ref)
      if (refModel.subClassOf === ENUM)
        continue

      let itemsProps = utils.getPropertiesWithAnnotation(refModel, 'items')
      if (!itemsProps)
        continue
      for (let pr in itemsProps) {
        let prop = itemsProps[pr]
        if (prop.items.ref === itemModel.id)
          return prop.items.backlink
      }
    }
  },

  isContainerProp(prop, pModel) {
    if (!prop.ref  ||  !prop.readOnly)
      return
    let refM = utils.getModel(prop.ref)
    let aprops = utils.getPropertiesWithAnnotation(refM, 'items')
    if (!aprops)
      return
    for (let apName in aprops) {
      let ap = aprops[apName]
      if (!ap.items.ref)
        return
      if (ap.items.ref === pModel.id)
        return true
    }
  },
  isContext(typeOrModel) {
    let m = typeOrModel
    if (typeof typeOrModel === 'string') {
      m = utils.getModel(typeOrModel)
      if (!m)
        return
    }
    else if (typeOrModel[TYPE])
      m = utils.getModel(typeOrModel[TYPE])
    return m.interfaces  &&  m.interfaces.indexOf(CONTEXT) !== -1
  },
  isEnum(typeOrModel) {
    let m = typeOrModel
    if (typeof typeOrModel === 'string') {
      m = utils.getModel(typeOrModel)
      if (!m)
        return
    }
    return m.subClassOf === ENUM
  },

  collect,

  /**
   * fast but dangerous way to read a levelup
   * it's dangerous because it relies on the underlying implementation
   * of levelup and asyncstorage-down, and their respective key/value encoding sechemes
   */
  async dangerousReadDB(db) {
    if (Platform.OS === 'web') {
      return await collect(db.createReadStream())
    }

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
    let me = utils.getMe()
    if (!me.isEmployee)
      return false
    return utils.compareOrg(me.organization, resource)
  },
  isAgent(resource) {
    let me = utils.getMe()
    if (!me.isAgent  ||  !me.isEmployee)
      return false
    return utils.compareOrg(me.organization, resource)
  },
  compareOrg(org, resource) {
    let orgId = utils.getId(org)
    if (resource[TYPE] === ORGANIZATION)
      return utils.getId(resource) === orgId ? true : false
    if (!resource.organization)
      return true
    if (utils.getId(resource.organization) === orgId)
      return true
  },
  isVerifier(resource) {
    // return true
    if (!utils.isEmployee(resource))
      return false
    let me = utils.getMe()
    if (!me.isEmployee)
      return false
    // let model = utils.getModel(resource[TYPE])
    // if (model.subClassOf === FORM) {
    //   return  (utils.getId(me) === utils.getId(resource.to)  ||  utils.isReadOnlyChat(resource)) &&
    //          !utils.isVerifiedByMe(resource)               // !verification  &&  utils.getId(resource.to) === utils.getId(me)  &&
    // }
    // if (model.id === VERIFICATION)
    //   return  utils.getId(me) === utils.getId(resource.from)
  },
  isRM(application) {
    if (!application)
      return
    let myIdentity = utils.getId(utils.getMe()).replace(PROFILE, IDENTITY)
    if (application.relationshipManagers)
      return application.relationshipManagers.some((r) => utils.getId(r) === myIdentity)
  },
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

        const { top, height } = rect
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
    if (first[first.length - 1] === '/') first = first.slice(0, -1)
    if (rest[0] === '/') rest = rest.slice(1)

    return first + '/' + rest
  },

  promiseDelay: promiseUtils.wait,
  hangForever: () => new Promise(resolve => {
    // hang
  }),

  // TODO: add maxTries
  tryWithExponentialBackoff,

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
    return tryWithExponentialBackoff(() => {
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
    return DeviceInfo.getModel() === 'Simulator' || DeviceInfo.isEmulator()
  },

  buildId ({ model, resource, type, link, permalink }) {
    if (resource  &&  !(link && permalink)) {
      if (!resource[SIG]) {
        throw new Error(`expected resource with type "${resource[TYPE]}" to have a signature`)
      }

      const links = calcLinks(resource)
      link = links.link
      permalink = links.permalink
    }

    if (!(link && permalink)) {
      throw new Error('expected "link" and "permalink"')
    }

    if (!type) {
      if (resource) type = resource[TYPE]
      else if (model) type = model.id
    }
    return `${type}_${permalink}_${link}`
  },

  omitVirtual,

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

  getPasswordBytes: (username, encoding) => utils.getPassword(username)
    .then(password => new Buffer(password, encoding)),

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
    // if (!Component.displayName) throw new Error('component must have "displayName"')

    return (additionalParams) => {
      // var key = Component.displayName
      // if (!stylesCache[key]) {
        // stylesCache[key] = {}
      // }

      var orientation = getOrientation(Component)
      // var subCache = stylesCache[key]
      // if (!subCache[orientation]) {
      var dimensions = getDimensions(Component)
      var { width, height } = dimensions
      var switchWidthHeight = (
        (orientation === 'PORTRAIT' && width > height) ||
        (orientation === 'LANDSCAPE' && width < height)
      )

      if (switchWidthHeight) {
        dimensions = { width: height, height: width }
      }
      let params = { dimensions }
      if (additionalParams)
        _.extend(params, additionalParams)
      return create(params)
        // subCache[orientation] = create(params)
      // }

      // return subCache[orientation]
    }
  },
  resized: function (props, nextProps) {
    return props.orientation !== nextProps.orientation
  },
  restartApp: function () {
    return NativeModules.CodePush.restartApp(false)
  },
  isImageDataURL(dataUrl) {
    if (!dataUrl) return false

    const mime = utils.getMimeType({ dataUrl })
    return /^image\//.test(mime)
  },

  getMimeType({ dataUrl }) {
    // data:image/jpeg;base64,...
    return dataUrl.slice(5, dataUrl.indexOf(';'))
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
  getPropertiesWithRef(ref, model) {
    let props = utils.getPropertiesWithAnnotation(model, 'ref')
    let rProps = []
    for (let p in props) {
      let pRef = props[p].ref  ||  (props[p].items  &&  props[p].items.ref)
      if (pRef === ref  ||  model.subClassOf === pRef)
        rProps.push(props[p])
    }
    return rProps
  },
  getPropertiesWithRange(range, model) {
    let props = model.properties
    let rProps = []
    for (let p in props)
      if (props[p].range === range)
        rProps.push(props[p])
    return rProps
  },
  // fromMicroBlink: function (result) {
  //   const { mrtd, usdl, eudl, image } = result
  //   if (mrtd) {
  //     return {
  //       [TYPE]: 'tradle.Passport',
  //       givenName: mrtd.secondaryId,
  //       surname: mrtd.primaryId,
  //       nationality: {
  //         id: 'tradle.Country_abc',
  //         title: mrtd.nationality.slice(0, 2)
  //       },
  //       issuingCountry: {
  //         id: 'tradle.Country_abc',
  //         title: mrtd.issuer.slice(0, 2)
  //       },
  //       passportNumber: mrtd.documentNumber,
  //       sex: {
  //         id: 'tradle.Sex_abc',
  //         title: mrtd.sex === 'M' ? 'Male' : 'Female'
  //       },
  //       dateOfExpiry: mrtd.dateOfExpiry,
  //       dateOfBirth: mrtd.dateOfBirth,
  //       photos: [
  //         {
  //           url: image.base64,
  //           // width: image.width,
  //           // height: image.height,
  //           // isVertical: image.width < image.height
  //         }
  //       ]
  //     }
  //   }
  // },
  fromAnyline: function (result) {
    const { scanMode, cutoutBase64, data } = result
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
  submitLog: async function (noAlert) {
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
        if (!noAlert)
          Alert.alert('debugLogSent', 'logSentToDevTeam')
      }

      return true
    } catch (err) {
      if (!noAlert)
        Alert.alert('failedToSendLog', err.message)
      return false
    }
  },
  getPermalink(object) {
    return object[ROOT_HASH] || protocol.linkString(object)
  },
  addContactIdentity: async function (node, { identity, permalink }) {
    if (!permalink) permalink = utils.getPermalink(identity)

    // defensive copy
    identity = _.cloneDeep(identity)

    let match
    try {
      match = await node.addressBook.byPermalink(permalink)
      if (_.isEqual(match.object, identity)) return
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
    //   m = utils.getModel(m)
    // else if (m[TYPE])  // resource was passed
    //   m = utils.getModel(m[TYPE])

    // if (m.isInterface  &&  (m.id === MESSAGE || m.id === DOCUMENT || m.id === ITEM))
    //   return true
    // if (m.interfaces && m.interfaces.indexOf(MESSAGE) !== -1)
    //   return true
  },
  isImplementing(resource, interfaceType) {
    let model
    if (typeof resource === 'string')
      model = utils.getModel(resource)
    else if (resource[TYPE])
      model = utils.getModel(resource[TYPE])
    else
      model = resource
    return model.interfaces  &&  model.interfaces.indexOf(interfaceType) !== -1
  },

  isItem(resource) {
    let model
    if (typeof resource === 'string')
      model = utils.getModel(resource)
    else if (resource[TYPE])
      model = utils.getModel(resource[TYPE])
    else
      model = resource
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
  buildStubByEnumTitleOrId(model, titleOrId) {
    let enumEnum = model.enum
    let val
    enumEnum.forEach((r) => {
      if (r.title === titleOrId  ||  r.id === titleOrId)
        val = {
          id: [model.id, r.id].join('_'),
          title: r.title
        }
    })
    return val
  },
  getCaptureImageQualityForModel: ({ id }) => {
    if (id === 'tradle.PhotoID' || id === 'tradle.Selfie') {
      return 1
    }

    return 1 // 0.5
  },
  requestForModels() {
    let me = utils.getMe()
    var msg = {
      message: utils.translate('customerWaiting', me.firstName),
      _t: CUSTOMER_WAITING,
      from: me,
      to: me.organization,
      time: new Date().getTime()
    }
    return msg
  },
  getEditableProperties(resource) {
    let type = utils.getType(resource)
    let isFormRequest = type === FORM_REQUEST
    // let isFormError = type === FORM_ERROR
    // if (!isFormRequest  &&  !isFormError)
    //   return []
    let ftype
    if (isFormRequest)
      ftype = resource.form
    // else if (isFormError) {
    //   if (!resource.prefill)
    //     return []
    //   ftype = utils.getType(resource.prefill)
    // }
    else
      ftype = type
    const model = utils.getModel(ftype)
    const props = model.properties
    let eCols = []
    for (let p in props) {
      let prop = props[p]
      if (!prop.readOnly  &&
        !prop.hidden      &&
        !prop.list )
        eCols.push(props[p])
    }

    if (eCols.length === 1) {
      let ep = eCols[0]
      if (ftype === IPROOV_SELFIE)
        return [ep]
      if (ftype === PRODUCT_REQUEST)
        return [ep]
      if (ep  &&  ep.type === 'object'  &&  (ep.ref === PHOTO ||  utils.getModel(ep.ref).subClassOf === ENUM))
        return [ep]
      if (ep.signature)
        return [ep]
    }
    return []
  },

  isSealableModel: function (model) {
    return model.subClassOf === 'tradle.Form' || model.subClassOf === 'tradle.MyProduct' || model.id === 'tradle.Verification'
  },
  isSavedItem(r) {
    let type = utils.getType(r)
    let m = utils.getModel(type)
    if (!m.interfaces || m.interfaces.indexOf(ITEM) === -1)
      return
    let toId = utils.getId(r.to)
    let fromId = utils.getId(r.from)
    return toId === fromId  &&  toId === utils.getId(utils.getMe())
  },
  getContentSeparator(bankStyle) {
    let separator = {}
    if (bankStyle) {
      if (bankStyle.navBarBorderColor) {
        separator.borderBottomColor = bankStyle.navBarBorderColor
        separator.borderBottomWidth = bankStyle.navBarBorderWidth ||  StyleSheet.hairlineWidth
      }
    }
    return separator
  },
  parseMessage(params) {
    let { resource, message, bankStyle, noLink, idx } = params
    let i1 = message.indexOf('**')
    if (i1 === -1)
      return utils.translate(message)
    let formType = message.substring(i1 + 2)
    let i2 = formType.indexOf('**')
    let linkColor = noLink ? '#757575' : bankStyle.linkColor
    let message1, message2
    let formTitle
    if (i2 !== -1) {
      message1 = message.substring(0, i1).trim()
      message2 = i2 + 2 === formType.length ? '' : formType.substring(i2 + 2)
      formType = formType.substring(0, i2)
      if (resource[TYPE] === FORM_REQUEST) {
        let formModel = utils.getModel(resource.form)
        if (formModel.subClassOf === MY_PRODUCT)
          linkColor = '#aaaaaa'
        let title = utils.makeModelTitle(formModel)
        if (formType === title)
          formTitle = utils.translate(formModel)
      }
    }
    if (!formTitle)
      formTitle = utils.translate(formType)
    let key = utils.getDisplayName(resource).replace(' ', '_') + (idx || 0)
    idx = idx ? ++idx : 1
    let newParams = _.extend({}, params)
    newParams.idx = idx
    newParams.message = message2.trim()
    return <Text key={key} style={[chatStyles.resourceTitle, noLink ? {color: bankStyle.incomingMessageOpaqueTextColor} : {}]}>{utils.translate(message1) + ' '}
             <Text style={{color: linkColor}}>{formTitle}</Text>
             <Text>{utils.parseMessage(newParams)}</Text>
           </Text>
  },
  getMarkdownStyles(bankStyle, isItalic, isMyMessage, isChat) {
    const markdownStyles = {
      heading1: {
        fontSize: 24,
        color: 'purple',
      },
      link: {
        color: isMyMessage? 'lightblue' : bankStyle  &&  bankStyle.linkColor || '#555555',
        textDecorationLine: 'none'
      },
      mailTo: {
        color: 'orange',
      },
      text: {
        color: isMyMessage ? '#ffffff' : '#757575',
        fontSize: isChat ? 16 : 14,
        fontStyle: isItalic  &&  'italic' || 'normal'
      },
    }
    return markdownStyles
  },
  addDefaultPropertyValuesFor(provider) {
    defaultPropertyValues[utils.getId(provider)] = provider._defaultPropertyValues
  },
  addHidePropertyInEditFor(provider) {
    hidePropertyInEdit[utils.getId(provider)] = provider._hidePropertyInEdit
  },
  isHidden(p, resource) {
    let modelName = utils.getType(resource)
    let model = utils.getModel(modelName)
    let props = model.properties
    if (!utils.isMessage(resource)  ||  !resource.from)
      return props[p].hidden  ||  (model.hidden  &&  model.hidden.indexOf(p) !== -1)
    // Check if the resource is one of the remedition resources
    // and in a reviewing after scan process - there are no from or to in it
    // let isReview = !resource.from
    // if (isReview)
    //   return
    let meId = utils.getId(me)
    let provider = (utils.getId(resource.from) === meId) ? resource.to.organization : resource.from.organization
    if (provider) {
      let hiddenProps = hidePropertyInEdit[utils.getId(provider)]
      if (hiddenProps) {
        hiddenProps = hiddenProps[modelName]
        return hiddenProps  &&  hiddenProps.indexOf(p) !== -1
      }
    }
    return props[p].hidden  ||  (model.hidden  &&  model.hidden.indexOf(p) !== -1)
  },

  parseMessageFromDB(message) {
    let object = message
    while (object[TYPE] === MESSAGE) {
      let key = object.recipientPubKey
      if (key) {
        if (!Buffer.isBuffer(key.pub)) {
          key.pub = new Buffer(key.pub.data)
        }
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
        props[p].list.forEach((pr) => {
          if (newArr.indexOf(pr) === -1)
            newArr.push(pr)
        })
      }
      else if (props[p].group)
        props[p].group.forEach((pr) => {
          if (newArr.indexOf(pr) === -1)
            newArr.push(pr)
        })
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

  updateEnv: async () => {
    let env
    try {
      env = await utils.fetchEnv()
    } catch (err) {
      debug('failed to update environment from tradle server', err.message)
      return
    }

    if (!env) return

    require('../Actions/Actions').updateEnvironment(env)
  },

  fetchEnv: async () => {
    if (!ENV.tradleAPIKey) return

    const url = utils.joinURL(ENV.tradleAPIEndpoint, 'fs', DeviceInfo.getBundleId(), 'environment.json')
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

  getVersionInAppStore,

  getInstalledVersion() {
    return DeviceInfo.getVersion()
  },

  async isLatestVersion() {
    const storeVersion = await getVersionInAppStore()
    // check if installed version is >= store version
    return compareVersions(utils.getInstalledVersion(), storeVersion) >= 0
  },

  openInAppStore() {
    return Linking.openURL(ENV.APP_URL)
  },

  waitsFor: function (prerequisite, fn) {
    return async function runAfterPrerequisite (...args) {
      await prerequisite
      return fn(...args)
    }
  },

  traverse,
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
    let pinFR = rtype === VERIFICATION // || utils.getModel(rtype).subClassOf === FORM
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

  isAWSProvider: function (provider)  {
    if (provider.aws) return true
    if (provider.connectEndpoint) return provider.connectEndpoint.aws
  },

  getIotClientId: function ({ permalink, provider }) {
    const { connectEndpoint } = provider
    const prefix = connectEndpoint && connectEndpoint.clientIdPrefix || ''
    return `${prefix}${permalink}${provider.hash.slice(0, 6)}`
    // return new Buffer(`${permalink}${counterparty.slice(0, 6)}`, 'hex').toString('base64')
  },
  getPrefillProperty(model) {
    let prefillProps = utils.getPropertiesWithAnnotation(model, 'partial')
    if (!prefillProps  ||  utils.isEmpty(prefillProps))
      return
    return prefillProps[Object.keys(prefillProps)[0]]
  },
  getRootHash(r) {
    if (typeof r === 'string') {
      let keys = r.split('_')
      return keys.length &&  keys[1] || null
    }
    return r[ROOT_HASH] ? r[ROOT_HASH] : r.id.split('_')[1]
  },
  getMessageWidth(component) {
    let width = component ? utils.dimensions(component).width : utils.dimensions().width
    return Math.floor(width * 0.8)
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
  getStatusMessageForCheck({ check }) {
    const model = utils.getModel(STATUS);
    const { aspects } = check;
    // const aspectsStr = typeof aspects === 'string' ? aspects : aspects.join(', ');
    let status
    if (check.status) {
      status = model.enum.find(r => r.title === check.status.title)
      if (status)
        status = status.id
    }

    switch (status) {
      case 'pending':
        return `One or more check(s) pending: ${aspects}`;
      case 'fail':
        return `One or more check(s) failed: ${aspects}`;
      case 'error':
        return `One or more check(s) hit an error: ${aspects}`;
      case 'pass':
        return `Check(s) passed: ${aspects}`;
      default:
        throw new ValidateResourceErrors.InvalidPropertyValue(`unsupported check status: ${safeStringify(check.status)}`)
    }
  },

  logger: namespace => Debug(`tradle:app:${namespace}`),
  getBlockchainExplorerUrlsForTx: ({ blockchain, networkName, txId }) => {
    const urls = _.get(BLOCKCHAIN_EXPLORERS, [blockchain, networkName]) || []
    if (!urls.length) {
      debug(`no blockchain explorer configured for blockchain ${blockchain} network ${networkName}`)
    }

    return urls
  },
  alert: (...args) => Alert.alert(...args),
  pickNonNull: obj => _.pickBy(obj, val => val != null),
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
  // isVerifier(resource, application) {
  //   if (!utils.isEmployee(resource))
  //     return false
  //   let me = utils.getMe()
  //   if (!me.isEmployee)
  //     return false
  //   let model = utils.getModel(resource[TYPE])
  //   if (model.subClassOf === FORM) {
  //     return  (utils.getId(me) === utils.getId(resource.to)  ||  utils.isReadOnlyChat(resource)) &&
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
  // used on web
  // onTakePic(prop, data, formRequest) {
  //   if (!data)
  //     return
  //   // Disable FormRequest
  //   let isFormRequest = formRequest  && formRequest[TYPE] === FORM_REQUEST
  //   let isFormError = formRequest  && formRequest[TYPE] === FORM_ERROR

  //   if (isFormRequest) {
  //     var params = {
  //       value: {_documentCreated: true},
  //       doneWithMultiEntry: true,
  //       resource: formRequest,
  //       meta: utils.getModel(formRequest[TYPE]).value
  //     }
  //     Actions.addChatItem(params)
  //   }
  //   let photo = {
  //     url: data.data,
  //     height: data.height,
  //     width: data.width
  //   }
  //   let propName = (typeof prop === 'string') ? prop : prop.name
  //   Actions.addChatItem({
  //     disableFormRequest: isFormRequest || isFormError ? formRequest : null,
  //     resource: {
  //       [TYPE]: isFormRequest ? formRequest.form : formRequest.prefill[TYPE],
  //       [propName]: photo,
  //       _context: formRequest._context,
  //       from: utils.getMe(),
  //       to: formRequest.from  // FormRequest.from
  //     }
  //   })
  // },
