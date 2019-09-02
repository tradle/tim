import _ from 'lodash'

import validateResource, { Errors as ValidateResourceErrors } from '@tradle/validate-resource'
import Errors from '@tradle/errors'
import mcbuilder from '@tradle/build-resource'
import constants from '@tradle/constants'
const {
  TYPE,
  ROOT_HASH,
  CUR_HASH,
  PREV_HASH,
  SIG
} = constants

import {
  getId,
  getMe,
  getModel,
  getPropertiesWithAnnotation,
  isMyProduct,
  isItem,
  sanitize,
  translate,
} from '../../utils/utils'
import Actions from '../../Actions/Actions'
import refreshPrefill from '../refreshPrefill.json'

const {
  VERIFICATION
} = constants.TYPES
// import { excludeWhenSignAndSend, IS_MESSAGE, NOT_CHAT_ITEM } from '../Store'

const excludeWhenSignAndSend = [
  'to',
  'from',
  'verifications',
  CUR_HASH,
  'idOld',
  '_message',
  '_sharedWith',
  '_sendStatus',
  '_context',
  '_online',
  '_termsAccepted',
  '_latest',
  '_outbound',
  '_lens'
]

const IS_MESSAGE = '_message'
const NOT_CHAT_ITEM = '_notChatItem'
const FORM_REQUEST = 'tradle.FormRequest'
const REFRESH_PRODUCT = 'tradle.RefreshProduct'
const REFRESH = 'tradle.Refresh'
const OBJECT = 'tradle.Object'

class JsonPlugin {
  constructor(store) {
    this.Store = store
  }
  async createBundle(json, topResource) {
    let items = json.items
    delete json.items
    _.extend(topResource, json)

    let rtype = topResource[TYPE]
    let rmodel = getModel(rtype)
    let objModel = getModel(OBJECT)

    // let object = await this.Store._keeper.get(topResource[CUR_HASH])
    // _.extend(topResource, object)

    let plugin = getPropertiesWithAnnotation(rmodel, 'filePlugin')
    if (plugin)
    for (let p in plugin) {
      if (!objModel.properties[p])
        delete topResource[p]
    }
    let toChain = this.prepareItem(topResource)
    let result = await this.Store.createObject(toChain)
    // topResource = result.object
    topResource[NOT_CHAT_ITEM] = true
    topResource[ROOT_HASH] = result.permalink
    topResource[CUR_HASH] = result.link
    if (!topResource._time)
      topResource._time = new Date().getTime()
    topResource[IS_MESSAGE] = true
    topResource._latest = true

    await this.Store.onAddChatItem({resource: topResource, noTrigger: true})
    let list = this.readBundle(items, topResource)
    await this.saveBundle({items: list, to: topResource.to, context: topResource._context})
  }
  readBundle(items, topResource) {
    // let items = json.items
    // delete json.items
    // _.extend(topResource, json)
    let rtype = topResource[TYPE]
    let rmodel = getModel(rtype)
    let props = rmodel.properties
    let itemsProps = getPropertiesWithAnnotation(rmodel, 'items')
    let typeToProp = {}
    for (let p in itemsProps) {
      if (props[p].items.backlink) {
        let pref = props[p].items.ref
        let backlink = props[p].items.backlink
        if (getModel(pref).properties[backlink].ref === rtype)
          typeToProp[pref] = backlink
      }
    }
    // let refProps = getPropertiesWithAnnotation(rmodel, 'ref')
    let topStub = this.Store.buildRef(topResource)
    let list = items.map(r => {
      let type = r[TYPE]
      let m = getModel(type)
      r._context = topResource._context
      r.from = topResource.from
      r.to = topResource.to
      let prop = typeToProp[type]
      if (prop) {
        r[prop] = topStub
      }
      else {
        let sub = m.subClassOf
        prop = typeToProp[sub]
        if (!prop)
          return r
        let sprops = m.properties
        if (sprops[prop]  &&  sprops[prop].ref === rtype)
           r[prop] = topStub
        else {
          let refProps = getPropertiesWithAnnotation(m, 'ref')
          for (let p in refProps) {
            if (refProps[p].ref === rtype) {
              prop = refProps[p]
              typeToProp[type] = prop
              r[prop] = topStub
            }
          }
        }
      }
      return r
    })
    // list.splice(0, 0, topResource)
    return list
  }
  async saveBundle(val) {
    let fromR = this.Store._getItem(val.to)
    let forg = fromR && fromR.organization
    let title = forg  &&  forg.title  ||  val.to.title
    Actions.showModal({title: translate('importingData', val.items.length, title), showIndicator: true})
    setTimeout(() => Actions.hideModal(), 3000)
    let result = await Promise.all(val.items.map(item => {
       item = this.prepareItem(item)
       return this.Store.createObject(item)
    }))
    let orgR = this.Store._getItem(val.to).organization
    // Can't do it async since the order matters forms should be processed before verifications
    for (let i=0; i<result.length; i++) {
      let item = result[i]
      let r = item.object  ||  item
      this.Store.rewriteStubs(r)
      r[ROOT_HASH] = item.permalink
      r[CUR_HASH] = item.link
      let m = this.Store.getModel(r[TYPE])
      let isMyMessage = r[TYPE] !== VERIFICATION  &&  !isMyProduct(m)
      if (!r.from &&  !r.to) {
        r.from = this.Store.buildRef(getMe())
        r.to = val.to
      }
      if (!r._time)
        r._time = new Date().getTime()
      if (!isItem(m))
        r[IS_MESSAGE] = true
      r[NOT_CHAT_ITEM] = true
      // if (context)
        r._context = val.context
      // else
      //   r._dataBundle = key
      r._latest = true
      await this.Store.onAddChatItem({resource: r, noTrigger: true})
    }

     await this.fireRefresh(val.to.organization, val)
     Actions.hideModal()
  }
  prepareItem(item) {
    let rModel = getModel(item[TYPE])
    let toChain = _.omit(item, excludeWhenSignAndSend)
    let properties = rModel.properties
    let isNew = !toChain[ROOT_HASH]

    this.Store.rewriteStubs(toChain)
    let keepProps = [TYPE, ROOT_HASH, CUR_HASH, PREV_HASH, '_time']
    for (let p in toChain) {
      let prop = properties[p]
      if (!isNew  &&  !prop  &&  !keepProps.includes(p)) // !== TYPE && p !== ROOT_HASH && p !== PREV_HASH  &&  p !== '_time')
        delete toChain[p]
      if (!prop  ||  prop.partial)
        continue
      // else if (prop.filePlugin)
      //   delete toChain[p]
      let isObject = prop.type === 'object'
      let isArray = prop.type === 'array'

      let ref = prop.ref  ||  isArray  &&  prop.items.ref

      if (!ref)
        continue

      let refM = getModel(ref)
      if (!refM  ||  refM.inlined)
        continue

      if (isObject)
        toChain[p] = this.Store.buildSendRef(item[p])
      else
        toChain[p] = item[p].map(v => this.Store.buildSendRef(v))
    }
    if (!isNew) {
      if (!item[SIG]) debugger

      const nextVersionScaffold = mcbuilder.scaffoldNextVersion({
        _link: item[CUR_HASH],
        _permalink: item[ROOT_HASH],
        ...item
      })

      _.extend(toChain, nextVersionScaffold)
      _.extend(item, nextVersionScaffold)
    }
    toChain = sanitize(toChain)
    try {
      validateResource({ resource: toChain, models: this.Store.getModels() })
    } catch (err) {
      if (Errors.matches(err, ValidateResourceErrors.InvalidPropertyValue))
      // if (err.name === 'InvalidPropertyValue')
        this.Store.trigger({action: 'validationError', validationErrors: {[err.property]: translate('invalidPropertyValue')}})
      else if (Errors.matches(err, ValidateResourceErrors.Required)) {
        let validationErrors = {}
        err.properties.forEach(p => validationErrors[p] = translate('thisFieldIsRequired'))
        this.Store.trigger({action: 'validationError', validationErrors})
      }
       else
        this.Store.trigger({action: 'validationError', error: err.message})
      return
    }
    return toChain
  }
  async fireRefresh(to, val) {
    let prefill = _.cloneDeep(refreshPrefill)
    prefill.fileUpload = true
    let requestForRefresh = {
      [TYPE]: FORM_REQUEST,
      from: val.to,
      to: getMe(),
      product: REFRESH_PRODUCT,
      form: REFRESH,
      message: 'Please review and confirm',
      prefill
    }
    await this.Store.onAddChatItem({resource:  requestForRefresh, doNotSend: true})
  }
}
module.exports = JsonPlugin