import sha from 'stable-sha1'
import _ from 'lodash'
import levelErrors from 'levelup/lib/errors'
import Promise from 'bluebird'
import Q from 'q'
import _collect from 'stream-collector'
const collect = Promise.promisify(_collect)

import {
  Platform
} from 'react-native'
import { protocol } from '@tradle/engine'
import constants from '@tradle/constants'

import AsyncStorage from '../Storage'
import voc from '../voc'
import {
  makeLabel,
  isEnum,
  getModel,
  getType,
  isForm,
  applyLens,
  getId,
  getMe,
  buildRef,
  makeModelTitle,
  getDisplayName,
  getPropertiesWithAnnotation,
  getStringPropertyValue,
  getEnumProperty,
  getEnumValueId,
  translateEnum,
  translate,
  omitVirtual,
  isStub
} from '../../utils/utils'

const {
  TYPE,
  ROOT_HASH,
  CUR_HASH
} = constants
const { FORM, IDENTITY, VERIFICATION, MESSAGE } = constants.TYPES

const STYLES_PACK = 'tradle.StylesPack'
const BOOKMARK = 'tradle.Bookmark'
const APPLICATION = 'tradle.Application'
const LANGUAGE = 'tradle.Language'
const FORM_REQUEST = 'tradle.FormRequest'
const FORM_ERROR = 'tradle.FormError'
const MSG_LINK = '_msg'
const JURISDICTION = 'tradle.Jurisdiction'
const COUNTRY = 'tradle.Country'
const DATA_BUNDLE = 'tradle.DataBundle'

const ObjectModel = voc['tradle.Object']

let dictionary

// const FORM_BACKLINKS = (function () {
//   // debugger
//   let formBacklinks = []
//   let formProps = voc[FORM].properties
//   for (let p in formProps) {
//     let prop = formProps[p]
//     if (prop.items && prop.items.backlink) formBacklinks.push({ [p]: prop })
//   }
//   return formBacklinks
// })()

const storeUtils = {
  addModels({models, enums}) {
    // debugger
    for (let id in voc) {
      let m = voc[id]
      // if (!m[ROOT_HASH])
      //   m[ROOT_HASH] = sha(m);
      storeUtils.parseOneModel(m, models, enums)
    }
    dictionary = storeUtils.makeDictionary(models)
    // this.addFormBacklinks({ models })
    this.addNameAndTitleProps(ObjectModel.id)
  },

  // addFormBacklinks({ models }) {
  //   let modelsObj = {}
  //   if (Array.isArray(models)) {
  //     models.forEach(m => modelsObj[m.id] = m)
  //   }
  //   else
  //     modelsObj = models
  //   for (let model in modelsObj) {
  //     let m = modelsObj[model]
  //     if (m.abstract || !m.subClassOf) return
  //     let sub = m
  //     while (sub && sub.subClassOf && sub.subClassOf !== FORM) sub = models[sub.subClassOf]

  //     if (sub && sub.subClassOf) {
  //       FORM_BACKLINKS.forEach(bl => {
  //         let p = Object.keys(bl)[0]
  //         if (!m.properties[p])
  //           _.extend(m.properties, {
  //             [p]: bl[p]
  //           })
  //       })
  //     }
  //   }
  // },

  getDictionary() {
    return dictionary
  },
  makeDictionary(models) {
    let modelNames = {}
    let propNames = {}
    let enums = {}
    Object.keys(models).forEach(id => {
      const m = models[id].value
      modelNames[m.id] = modelNames[m.id]  ||  m.title
      for (let p in m.properties) {
        if (p.charAt(0) === '_')
          continue
        if (propNames[p]) {
          if (m.properties[p].title) {
            if (!propNames[p][m.id])
              propNames[p][m.id] = m.properties[p].title
          }

          continue
        }

        propNames[p] = {}

        if (m.properties[p].title)
          propNames[p][m.id] = m.properties[p].title
        else {
          let title = makeLabel(p)
          propNames[p].Default = title
        }
        if (m.enum) {
          enums[m.id] = {}
          m.enum.forEach(e => enums[m.id][e.id] = e.title)
        }
        if (m.properties[p].type === 'array'  &&  m.properties[p].items.properties) {
          let props = m.properties[p].items.properties
          propNames[p].items = {}
          for (let pp in props) {
            if (props[pp].title)
              propNames[p].items[pp] = props[pp].title
            else {
              let title = makeLabel(pp)
              propNames[p].items[pp] = title
            }
          }
        }
      }
    })
    return {
      enums,
      properties: propNames,
      models: modelNames
    }
  },
  // makeLabel(label) {
  //   return label
  //         // insert a space before all caps
  //         .replace(/([A-Z])/g, ' $1')
  //         // uppercase the first character
  //         .replace(/^./, str => str.toUpperCase()).trim()
  // },

  parseOneModel(m, models, enums) {
    // storeUtils.addNameAndTitleProps(m)
    models[m.id] = {
      key: m.id,
      value: m
    }

    if (!m.properties[TYPE]) {
      m.properties[TYPE] = {
        ...ObjectModel.properties[TYPE]
      }
    }

    if (!m.properties._time) {
      m.properties._time = {
        ...ObjectModel.properties._time
      }
    }
  },
  addOns(m, models, enums) {
    storeUtils.addNameAndTitleProps(m)
    if (isEnum(m))
      storeUtils.createEnumResources(m, enums)

    else if (isForm(m)) {
      // storeUtils.addVerificationsToFormModel(m)
      storeUtils.addFromAndTo(m)
    }
  },
  addNameAndTitleProps(m, aprops) {
    let mprops = aprops  ||  m.properties
    for (let p in mprops) {
      if (p.charAt(0) === '_'  &&  (!m  || (m.id !== MESSAGE && m.id !== ObjectModel.id)))
        continue
      if (!mprops[p].name)
        mprops[p].name = p
      if (!mprops[p].title)
        mprops[p].title = makeLabel(p.replace('_', ''))
      if (mprops[p].type === 'array') {
        let aprops = mprops[p].items.properties
        if (aprops)
          storeUtils.addNameAndTitleProps(m, aprops)
      }
    }
  },
  addFromAndTo(m) {
    if (!m.interfaces  ||  m.interfaces.indexOf(MESSAGE) === -1)
      return
    let properties = m.properties
    if (properties.from  &&  properties.to)
      return
    properties.from = {
      type: 'object',
      ref: IDENTITY,
      readOnly: true
    }
    properties.to = {
      type: 'object',
      ref: IDENTITY,
      readOnly: true
    }
  },
  addVerificationsToFormModel(m) {
    if (!isForm(m)  ||  m.verifications)
      return
    m.properties.verifications = {
      type: 'array',
      readOnly: true,
      title: 'Verifications',
      name: 'verifications',
      items: {
        backlink: 'document',
        ref: VERIFICATION
      }
    }
  },
  createEnumResources(model, enums) {
    if (!isEnum(model)  ||  !model.enum)
      return
    let eProp
    for (let p in model.properties) {
      if (p !== TYPE) {
        eProp = p
        break
      }
    }
    model.enum.forEach((r) => {
      let enumItem = {
        [TYPE]: model.id,
        [ROOT_HASH]: r.id,
        [eProp]: r.title
      }
      storeUtils.loadStaticItem(enumItem, enums)
    })
  },
  loadStaticItem(r, enums) {
    if (!r[ROOT_HASH])
      r[ROOT_HASH] = sha(r)

    r[CUR_HASH] = r[ROOT_HASH]
    let type = r[TYPE]
    let enumList = enums[type]
    if (!enumList) {
      enumList = []
      enums[type] = enumList
    }

    if (enumList.filter((e) => e[ROOT_HASH] === r[ROOT_HASH]).length)
      return
    enumList.push(r)
    // // let id = getId(r)
    // let key = [r[TYPE], r[ROOT_HASH], r[CUR_HASH]].join('_')
    // if (saveInDB)
    //   batch.push({type: 'put', key, value: r})
  },
  getPermalink(object) {
    return object[ROOT_HASH] || protocol.linkString(object)
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
  addContactIdentity: async function (node, { identity, permalink }) {
    if (!permalink) permalink = storeUtils.getPermalink(identity)

    // defensive copy
    let checkIdentity = omitVirtual(identity) //_.cloneDeep(identity)

    let match
    try {
      match = await node.addressBook.byPermalink(permalink)
      if (_.isEqual(match.object, checkIdentity)) return
    } catch (err) {
      // oh well, I guess we have to do things the long way
    }

    return node.addContactIdentity(checkIdentity)
  },
  rebuf,
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
  normalizeGetInfoResponse(json) {
    if (!json.providers) {
      json = {
        providers: [json]
      }
    }

    json.providers.forEach(provider => {
      if (provider.style) {
        provider.style = storeUtils.toStylesPack(provider.style)
      }
    })

    return json
  },
  toStylesPack(oldStylesFormat) {
    if (oldStylesFormat[TYPE] === STYLES_PACK) return oldStylesFormat

    const { properties } = getModel(STYLES_PACK)
    const pack = {
      [TYPE]: STYLES_PACK
    }

    for (let bad in oldStylesFormat) {
      let good = storeUtils.joinCamelCase(bad.split('_'))
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
  getEnum(params, enums) {
    const { modelName, limit, query, lastId, prop, pin, isChooser, resource } = params
    let enumList = enums[modelName]
    let m = getModel(modelName)
    let property = getEnumProperty(m)
    let hasReset = enumList.find(e => e[ROOT_HASH] === '__reset')
    let isJurisdiction = prop  &&  prop.ref === JURISDICTION
    if (query) {
      if (isJurisdiction)
        return storeUtils.getJurisdictions(params, enums)
      let q = query.toLowerCase()
      return enumList.filter((r) => {
        let val = modelName === LANGUAGE ? r.language : translateEnum(r)
        if (!val)
          debugger
        val = val.toLowerCase()
        return val.indexOf(q) !== -1
      })
    }
    let reset
    let rmodel = resource ? getModel(resource[TYPE]) : m
    if (resource  && !hasReset  &&  isChooser  &&  resource[prop.name]) {
      reset = {
        [TYPE]: modelName,
        [ROOT_HASH]: '__reset',
        [property]: translate('reset', translate(prop, rmodel))
      }
    }
    if (prop) {
      let ret
      if (prop.limit  ||  prop.pin)
        ret = applyLens({prop, list: enumList})
      else if (pin)
        ret = applyLens({prop, list: enumList, values: pin.map(v => v.id.split('_')[1])})
      if (ret) {
        if (!hasReset  &&  reset)
          ret.splice(0, 0, reset)
        return ret
      }
      if (isJurisdiction) {
        let list = storeUtils.getJurisdictions(params, enums)
        if (list)
          return list
      }
    }
    let lim = limit || 20
    let lastIdx
    if (lastId)
      lastIdx = _.findIndex(enumList, (item) => getId(item) === lastId) + 1
    else
      lastIdx = 0
    let ret = []
    if (reset)
      ret.push(reset)

    for (let i=lastIdx, j=0; i<enumList.length  &&  j<lim; i++, j++)
      ret.push(enumList[i])

    return ret
  },
  getJurisdictions(params, enums) {
    let {modelName, resource, query, prop} = params
    let rmodel = getModel(resource[TYPE])
    let q = query  &&  query.toLowerCase()
    let refProps = getPropertiesWithAnnotation(rmodel, 'ref')
    let countryProp = Object.keys(refProps).find(p => refProps[p].ref === COUNTRY  &&  resource[p])
    if (!countryProp) return
    let country = getEnumValueId({model: getModel(COUNTRY), value: resource[countryProp]})
    let enumL = getModel(JURISDICTION).enum
    let list = enumL.filter(r => r.country === country)
    if (!list) return

    let enumList = enums[modelName]
    let filteredList = enumList.filter(r => {
      let item = list.find(item => r.region === item.title)
      return item
    })
    if (!q) return filteredList

    return filteredList.filter(r => {
      let val = translateEnum(r)
      return val.toLowerCase().indexOf(q) !== -1
    })
  },
  checkCriteria({r, query, prop, isChooser}) {
    debugger
    if (!query)
      return r
    if (isChooser) {
      let dn = getDisplayName({ resource: r })
      return (dn.toLowerCase().indexOf(query.toLowerCase()) !== -1) ? r : null
    }
    let rtype = r[TYPE]
    let rModel = getModel(rtype)
    let props = rModel.properties
    if (prop  &&  r[prop]) {
      let val = getStringPropertyValue(r, prop, props)
      return (val.toLowerCase().indexOf(query.toLowerCase()) === -1) ? null : r
    }
    let combinedValue = '';
    for (let rr in props) {
      if (!r[rr]  ||  rr.charAt(0) === '_'  ||   Array.isArray(r[rr]))
        continue;
      if (props[rr].type === 'object') {
        let title = getDisplayName({ resource: r[rr], model: rModel })
        combinedValue += combinedValue ? ' ' + title : title
        continue
      }
      else if (props[rr].type === 'date') {
        continue
        if (!isNaN(r[rr])) {
          let d = new Date(r[rr]).toString()
          combinedValue += combinedValue ? ' ' + d : d
          continue
        }

      }

      combinedValue += combinedValue ? ' ' + r[rr] : r[rr];
    }
    if (rtype === BOOKMARK)
      combinedValue += makeModelTitle(rtype)
    if (!combinedValue)
      return
      // return r

    if (combinedValue.toLowerCase().indexOf(query.toLowerCase()) !== -1)
      return r
    return
  },
  rewriteAttestation(resource) {
    if (!resource[TYPE])
      return
    if (resource._permalink)
      resource[ROOT_HASH] = resource._permalink
    if (resource._link)
      resource[CUR_HASH] = resource._link
    if (resource._displayName)
      resource.title = resource._displayName

    delete resource._permalink
    delete resource._link
    delete resource._displayName
    let { properties } = getModel(resource[TYPE])
    for (let p in resource) {
      let val = resource[p]
      if (!val) continue
      if (typeof val === 'object'  &&  val._displayName) {
        resource[p] = storeUtils.makeStub(val)
        continue
      }
      if (typeof val === 'object') {
        if (Array.isArray(val))
          val.forEach(v => storeUtils.rewriteAttestation(v))
        else
          storeUtils.rewriteAttestation(val)
      }
    }
  },
  rewriteStubs(resource) {
    let type = getType(resource)
    let props = getModel(type).properties
    let refProps = ['_sourceOfData']
    let isDataBundle = type === DATA_BUNDLE
    for (let p in resource) {
      let prop = props[p]
      if (!prop)  {
        if (refProps.includes(p)) {
          prop = ObjectModel.properties[p]
          if (!prop)
           continue
        }
        else
          continue
      }
      if (prop.type !== 'object'  &&  prop.type !== 'array')
        continue
      if (prop.range === 'json')
        continue
      if (typeof resource[p] !== 'object')
        continue

      let stub = resource[p]
      if (!isDataBundle  &&  Array.isArray(stub)) {
        resource[p] = stub.map(s => {
          if (s._link)
            return storeUtils.makeStub(s)
          else {
            let itype = s[TYPE]
            if (!itype)
              return s
            let iprops = getModel(itype).properties
            for (let p in s) {
              if (iprops[p]  &&  iprops[p].type === 'object'  &&  s[p]._link)
                s[p] = storeUtils.makeStub(s[p])
            }
            return s
          }
        })
        continue
      }
      if (!stub[TYPE])
        continue
      let m = getModel(stub[TYPE])
      if (!m  ||  isEnum(m))  {
        continue
      }
      if (!stub._link)
        continue
      resource[p] = storeUtils.makeStub(stub)
    }
    if (type === FORM_REQUEST  ||  type === FORM_ERROR) {
      if (resource.prefill  &&  (!isStub(resource.prefill) ||  !resource.prefill.id))
        storeUtils.rewriteStubs(resource.prefill)
    }
  },
  makeStub(sub) {
    let stub = {
      id: sub.id  ||  [sub[TYPE], sub._permalink, sub._link].join('_'),
    }
    let title = sub.title || sub._displayName
    if (title)
      stub.title = title
    if (sub._refId)
      stub._refId = sub._refId
    return stub
  },
  getEmployeeBookmarks({ me, botPermalink }) {
    if (me.counterparty)
      return
    const from = buildRef(me)
    const etype = 'tradle.ClientOnboardingTeam'
    const amodel = getModel(APPLICATION)
    const aprops = amodel.properties
    let teams = getModel(etype).enum
    let bookmarks = [
      {
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          analyst: me.employeePass
        },
        message: translate('myCases')
      },
      {
        message: 'applications',
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink
        }
      },
     {
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          hasFailedChecks: true
        },
        message: translate('hasFailedChecks')
      },
     {
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          hasCheckOverrides: true
        },
        message: translate('hasCheckOverrides')
      }
    ]
    // teams.forEach(e => {
    //   bookmarks.push({
    //     message: `${translate('applications')} - ${translateEnum(e)}`,
    //     bookmark: {
    //       [TYPE]: APPLICATION,
    //       _org: botPermalink,
    //       assignedToTeam: {
    //         id: `${etype}_${e.id}`,
    //         title: e.title
    //       }
    //     }
    //   })
    // })

    let moreBookmarks = [
      {
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          status: 'started'
        },
        message: translate('applicationsStarted')
      },
      {
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
           analyst: 'NULL'
        },
        message: translate('applicationsNotAssigned')
      },
      {
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
           parent: 'NULL'
        },
        noInternalUse: true,
        message: translate('topLevelApplications'),
        grid: true
      },
      {
        message: translate('applicationDrafts'),
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
           draft: true
        }
      }
      // { type: VERIFICATION },
      // { type: SEAL },
      // { type: 'tradle.SanctionsCheck' },
      // { type: 'tradle.CorporationExistsCheck' },
      // { type: MESSAGE,
      //   bookmark: {
      //     [TYPE]: MESSAGE,
      //     _inbound: false,
      //     _counterparty: ALL_MESSAGES,
      //   },
      // }
    ]
    moreBookmarks.forEach(b => bookmarks.push(b))

    return bookmarks.map(b => {
      const { type, bookmark, message, grid, noInternalUse } = b
      let bookmarkType = type || bookmark[TYPE]
      const model = getModel(bookmarkType)
      let bookmarkR = {
        [TYPE]: BOOKMARK,
        message: message  ||  translate(model), // makeModelTitle(model, true),
        bookmark: bookmark  ||  {
          [TYPE]: bookmarkType,
          _org: botPermalink
        },
        from
      }
      if (grid)
        bookmarkR.grid = grid
      if (noInternalUse)
        bookmarkR.noInternalUse = noInternalUse
      return bookmarkR
    })
  }
}
module.exports = storeUtils
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
    for (let p in json) {
      json[p] = rebuf(json[p])
    }

    return json
  }
}

function parseDBValue (pair) {
  return pair[1] && rebuf(JSON.parse(pair[1]))
}
