var sha = require('stable-sha1');
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

import AsyncStorage from '../../utils/async-storage'
import voc from '../voc'
import {
  makeLabel,
  isEnum,
  getModel,
  isForm,
  applyLens,
  getId,
  getMe,
  buildRef,
  makeModelTitle,
  getDisplayName,
  getStringPropertyValue,
  getEnumProperty,
  translateEnum,
  translate
} from '../../utils/utils'

const {
  TYPE,
  ROOT_HASH,
  CUR_HASH
} = constants
const STYLES_PACK = 'tradle.StylesPack'
const BOOKMARK = 'tradle.Bookmark'
const APPLICATION = 'tradle.Application'
const LANGUAGE = 'tradle.Language'
const MSG_LINK = '_msg'

const { FORM, IDENTITY, VERIFICATION, MESSAGE } = constants.TYPES
const ObjectModel = voc['tradle.Object']
var dictionary

var storeUtils = {
  addModels({models, enums}) {
    for (let id in voc) {
      let m = voc[id]
      // if (!m[ROOT_HASH])
      //   m[ROOT_HASH] = sha(m);
      storeUtils.parseOneModel(m, models, enums)
    }
    dictionary = storeUtils.makeDictionary(models)
    this.addNameAndTitleProps(ObjectModel.id)
  },
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

    if (isForm(m)) {
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
    let property = getEnumProperty(getModel(modelName))
    if (query) {
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
    if (isChooser  &&  resource[prop.name]) {
      let rmodel = getModel(resource[TYPE])
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
        if (reset)
          ret.splice(0, 0, reset)
        return ret
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

    // if (!getModel(modelName).sortProperty)
    //   return ret
    // let me = getMe()
    // if (!me.language  ||  me.languageCode === 'en')
    //   return ret

    // let propToRes = []
    // ret.map(r => propToRes.push({[translateEnum(r)]:  r}))

    // propToRes.sort((a, b) => Object.keys(a)[0] - Object.keys(b)[0])
    // ret = propToRes.map(r => Object.values(r)[0])

    return ret
  },
  checkCriteria({r, query, prop, isChooser}) {
    debugger
    if (!query)
      return r
    if (isChooser) {
      let dn = getDisplayName(r)
      return (dn.toLowerCase().indexOf(query.toLowerCase()) !== -1) ? r : null
    }
    let rtype = r[TYPE]
    let rModel = this.getModel(rtype)
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
        let title = getDisplayName(r[rr], rModel)
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
  getEmployeeBookmarks({ me, botPermalink }) {
    const from = buildRef(me)
    const etype = 'tradle.ClientOnboardingTeam'
    const amodel = getModel(APPLICATION)
    const aprops = amodel.properties
    let teams = getModel(etype).enum
    let bookmarks = [
      { type: APPLICATION,
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          analyst: me.employeePass
        },
        message: 'myCases'
      },
      { type: APPLICATION,
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          hasFailedChecks: true
        },
        message: 'hasFailedChecks'
      },
      { type: APPLICATION,
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          hasCheckOverrides: true
        },
        message: 'hasCheckOverrides'
      },
    ]
    teams.forEach(e => {
      bookmarks.push({
        type: APPLICATION,
        message: `${translate('applications')} - ${translateEnum(e)}`,
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          assignedToTeam: {
            id: `${etype}_${e.id}`,
            title: e.title
          }
        },
      })
    })

    let moreBookmarks = [
      { type: APPLICATION,
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
          status: 'started'
        },
        message: 'applicationsStarted'
      },
      { type: APPLICATION,
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
           analyst: 'NULL'
        },
        message: translate('applicationsNotAssigned')
      },
      { type: APPLICATION,
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
           parent: 'NULL'
        },
        message: 'topLevelApplications'
      },
      {
        type: APPLICATION,
        message: 'applications',
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink
        }
      },
      {
        type: APPLICATION,
        message: 'applicationDrafts',
        bookmark: {
          [TYPE]: APPLICATION,
          _org: botPermalink,
           draft: true
        },
      },
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
      const { type, bookmark, message } = b
      const model = getModel(type)
      return {
        [TYPE]: BOOKMARK,
        message: message  ||  translate(model), // makeModelTitle(model, true),
        bookmark: bookmark  ||  {
          [TYPE]: type,
          _org: botPermalink
        },
        from
      }
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
    for (var p in json) {
      json[p] = rebuf(json[p])
    }

    return json
  }
}

function parseDBValue (pair) {
  return pair[1] && rebuf(JSON.parse(pair[1]))
}
