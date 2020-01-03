import _ from 'lodash'
import Debug from 'debug'
var debug = Debug('tradle:app:dataBundle')

import constants from '@tradle/constants'
const {
  TYPE,
  ROOT_HASH,
  CUR_HASH,
  PREV_HASH,
  SIG
} = constants

import {
  getMe,
  getId,
  getType,
  getRootHash,
  getDisplayName,
  promiseDelay,
  isMyProduct,
  isItem,
  translate,
} from '../../utils/utils'
import Actions from '../../Actions/Actions'
import refreshPrefill from '../refreshPrefill.json'

const {
  FORM,
  VERIFICATION,
  ORGANIZATION
} = constants.TYPES
const SOURCE_ID = '_sourceId'
const REF_ID = '_refId'

const IS_MESSAGE = '_message'
const NOT_CHAT_ITEM = '_notChatItem'
const FORM_REQUEST = 'tradle.FormRequest'
const REFRESH_PRODUCT = 'tradle.RefreshProduct'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const REFRESH = 'tradle.Refresh'
const MY_PRODUCT = 'tradle.MyProduct'
const DATA_BUNDLE = 'tradle.DataBundle'
const DATA_BUNDLE_SUBMITTED = 'tradle.DataBundleSubmitted'

class DataBundle {
  constructor(store, context) {
    this.Store = store
  }
  async processDataBundle({val}) {
    let context = await this.createProductRequest(val)

    let { items } = val

    let fromR = this.Store._getItem(val.from)
    let forg = fromR && fromR.organization
    let title = forg  &&  forg.title  ||  val.from.title

    Actions.showModal({title: translate('sendingYourData', items.length, title), showIndicator: true})

    setTimeout(() => Actions.hideModal(), 3000)

    let result = await Promise.all(items.map(item => this.Store.saveObject({object: item})))
    let resources = []
    await this.fillResources({result, context, val, resources, doAdd: true})

    if (items[0][SOURCE_ID]) {
      await this.processDataBundleWithSourceIDs({val, context, resources})
      return
    }

    await this.fireRefresh({val, context})
    Actions.hideModal()
  }

  async processUploadedDataBundle({val, context, items, productBundle}) {
    context._dataBundle = getId(val)
    let result = items
    items = result.map(item => item.object)
    val.items = items

    items = val.items

    let fromR = this.Store._getItem(val.from)
    let forg = fromR && fromR.organization
    let title = forg  &&  forg.title  ||  val.from.title
    if (!productBundle) {
      Actions.showModal({title: translate(productBundle ? 'gettingYourData' : 'sendingYourData', items.length, title), showIndicator: true})
      setTimeout(() => Actions.hideModal(), 5000)
    }
    let resources = []
    await this.fillResources({result, context, val, resources, doAdd: true})

    if (items[0][SOURCE_ID]) {
      await this.processUploadedDataBundleWithSourceIDs({val, resources})
    }

    await this.fireRefresh({val, context, productBundle})
    if (!productBundle) {
      Actions.hideModal()
    }
  }

  async processUploadedDataBundleWithSourceIDs({val, resources, dontAdd}) {
    if (!this.refs) {
      let refs = {}
      let { items } = val
      items.forEach(item => {
        let sourceId = item[SOURCE_ID]
        refs[sourceId] = {}

        for (let p in item) {
          if (typeof item[p] === 'object'  &&  item[p][REF_ID])
            refs[sourceId][p] = item[p][REF_ID]
        }
      })
      this.refs = refs
    }
    resources.forEach(async r => {
      // debugger
      let irefs = this.refs[r._sourceId]
      let props = Object.keys(irefs)
      if (!props)
        return
      props.forEach(prop => {
        let sourceId = irefs[prop]
        let rr = resources.find(r => r._sourceId === sourceId)
        if (!rr)
          return
        r[prop] = this.Store.buildRef(rr)
      })
      // Can't do it async since the order matters forms should be processed before verifications
      if (!dontAdd)
        await this.Store.onAddChatItem({resource: r, noTrigger: true})
    })
  }

  async processDataBundleWithSourceIDs({val, context, resources}) {
    let { items } = val

    let refs = {}
    items.forEach(item => {
      let sourceId = item[SOURCE_ID]
      refs[sourceId] = {}

      for (let p in item) {
        if (typeof item[p] === 'object'  &&  item[p][REF_ID])
          refs[sourceId][p] = item[p][REF_ID]
      }
    })
    resources.forEach(async r => {
      // debugger
      let irefs = refs[r._sourceId]
      let props = Object.keys(irefs)
      if (!props)
        return
      props.forEach(prop => {
        let sourceId = irefs[prop]
        let rr = resources.find(r => r._sourceId === sourceId)
        if (!rr)
          return
        r[prop] = this.Store.buildRef(rr)
      })
      // Can't do it async since the order matters forms should be processed before verifications
      await this.Store.onAddChatItem({resource: r, noTrigger: true})
    })

    await this.fireRefresh({val, context})
    Actions.hideModal()
  }

  async fillResources({result, context, val, resources, doAdd}) {
    let me = getMe()
    let dataBundle = getId(val)
    for (let i=0; i<result.length; i++) {
      let item = result[i]
      let r = item.object
      this.Store.rewriteStubs(r)
      r[ROOT_HASH] = item.permalink
      r[CUR_HASH] = item.link
      let m = this.Store.getModel(r[TYPE])
      let isMyMessage = r[TYPE] !== VERIFICATION  &&  !isMyProduct(m)
      if (isMyMessage) {
        r.from = me
        r.to = val.isUpload ? val.to : val.from
      }
      else {
        r.from = val.isUpload ? val.to : val.from
        r.to = me
      }
      if (!r._time)
        r._time = new Date().getTime()
      if (!isItem(m))
        r[IS_MESSAGE] = true
      r[NOT_CHAT_ITEM] = true
      if (context)
        r._context = context

      r._dataBundle = dataBundle
      r._latest = true
      resources.push(r)
      // Can't do it async since the order matters forms should be processed before verifications
      if (doAdd)
        await this.Store.onAddChatItem({resource: r, noTrigger: true})
    }
    return resources
  }
  async searchForRefresh(params) {
    let { to, resource } = params
    // let [ requestForRefresh ] = await this.Store.searchMessages({to, isRefresh: true, modelName: FORM_REQUEST, filterProps: {product: REFRESH_PRODUCT, _latest: true, _documentCreated: false}})
    let [ requestForRefresh ] = await this.Store.searchMessages({to, modelName: FORM_REQUEST, filterProps: {product: REFRESH_PRODUCT, _documentCreated: false}})
    if (!requestForRefresh)
      return { result: [] }

    let time = requestForRefresh._time
    let forms = requestForRefresh  &&  requestForRefresh._forms

    let refreshProducts
    let result = await this.Store.searchMessages(params)
    let me = getMe()
    result = result  &&  result.filter(r => {
      if (r[TYPE] !== PRODUCT_REQUEST) {
        // if (getModel(r[TYPE]).notEditable)
        //   return false
        if (!r._latest)
          return false
        if (!r._dataBundle)
          return false
        if (r._time < time)
          return true
        // Check if the resource that was created as new reviewed already
        if (forms  &&  _.findIndex(forms, f => r[ROOT_HASH] === f.hash) !== -1)
          return true
        return false
      }
      if (r._time > time)
        return false
      // Gather all products for the customer before the request date
      if (r._formsCount) {
        if (!refreshProducts)
          refreshProducts = []
        refreshProducts.push(r)
      }
      return false
    })
    if (!result.length)
      return { result }

    result.sort((a, b) => b._time - a._time)
    let myProducts = await this.Store.searchMessages({modelName: MY_PRODUCT, to})
    if (myProducts) {
      if (!refreshProducts)
        refreshProducts = []
      myProducts.forEach(p => {
        if (p._time > time)
          return
        let requestFor = 'tradle.' + p[TYPE].split('.')[1].substring(2)
        refreshProducts.push({
          [TYPE]: PRODUCT_REQUEST,
          requestFor
        })
      })
    }

    let moreForms = resource.prefill && resource.prefill.additionalForms
    if (!moreForms)
      return {result, refreshProducts, requestForRefresh}
    let toId = getId(to)
    moreForms.forEach(p => {
      let product = refreshProducts  &&  refreshProducts.find(r => r.requestFor === p.product)
      if (!product)
        return
      p.forms.forEach(f => {
        if (forms) {
          let form = forms.find(r => r.type === f  &&  !r.isNew)
          if (form)
            return
        }
        let context = this.Store.buildRef(product)
        let r = {
          [TYPE]: f,
          from: me,
          to: this.getRepresentative(to)
        }
        if (context.id)
          r._context = context
        result.push(r)
      })
    })
    return {result, refreshProducts, requestForRefresh}
  }

  async createProductRequest(val) {
    let me = getMe()
    let requestForPR = {
      [TYPE]: PRODUCT_REQUEST,
      requestFor: REFRESH_PRODUCT,
      from: me,
      to: val.from,
      _dataBundle: getId(val)
    }
    return await this.Store.onAddChatItem({resource: requestForPR, noTrigger: true})
  }
  async fireRefresh({val, context, productBundle}) {
    let timeout = productBundle  &&  0 || 5000
    setTimeout(async () => {
      let me = getMe()
      let from = getId(val.from) === getId(me) ? val.to : val.from
      let dataBundle = getId(val)
      let requestForRefresh = {
        [TYPE]: FORM_REQUEST,
        from,
        to: me,
        product: REFRESH_PRODUCT,
        form: REFRESH,
        message: translate('reviewAndConfirm'),
        _dataBundle: dataBundle,
        prefill: refreshPrefill
      }
      if (!context) {
        let res = await this.Store.searchMessages({to: val.from, modelName: PRODUCT_REQUEST, filterProps: {product: REFRESH_PRODUCT, _documentCreated: false}})
        context = res && res.find(r => r.requestFor === REFRESH_PRODUCT  &&  dataBundle  &&  r._dataBundle === dataBundle)
      }
      if (context)
        requestForRefresh._context = context
      if (!productBundle)
        await promiseDelay(timeout)
      debug('fireRefresh: ' + JSON.stringify(context, null, 2))
      await this.Store.onAddChatItem({resource: requestForRefresh, doNotSend: true, noTrigger: true})
    }, timeout)
  }
  async createProductBundle(resource) {
    // debugger
    let { items } = resource.prefill
    let results = await Promise.all(items.map(item => {
      item._context = resource._context
      return this.Store.meDriverCreateObject({object: item})
    }))
    let ritems = results.map((data, i) => {
      // let data = await this.Store.meDriverCreateObject({object: item})
      let hash = data.link
      let item = data.object
      item[ROOT_HASH] = hash
      item[CUR_HASH] = hash
      return item
    })
    let val = {
      [TYPE]: DATA_BUNDLE,
      items: ritems, //.map(r => r.object),
      from: getMe(),
      to: resource.from,
      isUpload: true,
      _context: resource._context
    }
    let dataBundle = await this.Store.onAddChatItem({resource: val, noTrigger: true})

    await this.processUploadedDataBundle({val: dataBundle, context: resource._context, items: results, productBundle: true})
  }

  async createDataBundle(resource, p) {
    debugger
    let dataBundles = this.Store.searchNotMessages({to: resource.to, modelName: DATA_BUNDLE})
    if (dataBundles.length) {
      if (dataBundles.some(db => db._context  &&  getRootHash(db._context) === resource._context[ROOT_HASH]))
        return
    }
    let { url } = resource[p]
    let idx = url.indexOf(',')
    let { items } = JSON.parse(Buffer.from(url.substring(idx + 1), 'base64'))
    let results = await Promise.all(items.map(item => this.Store.meDriverCreateObject({object: item})))
    let ritems = results.map((data, i) => {
      // let data = await this.Store.meDriverCreateObject({object: item})
      let hash = data.link
      let item = data.object
      item[ROOT_HASH] = hash
      item[CUR_HASH] = hash
      return item
    })

    let val = {
      [TYPE]: DATA_BUNDLE,
      items: ritems, //.map(r => r.object),
      from: getMe(),
      to: resource.to,
      isUpload: true,
      _context: resource._context
    }
    let dataBundle = await this.Store.onAddChatItem({resource: val, noTrigger: true})

    await this.processUploadedDataBundle({val: dataBundle, context: resource._context, items: results})
  }
  async updateRequestForRefresh(to, returnVal) {
    // let requestsForRefresh = await this.Store.searchMessages({to, modelName: FORM_REQUEST, isRefresh: true, filterProps: {product: REFRESH_PRODUCT, _latest: true, _documentCreated: false}})
    let requestsForRefresh = await this.Store.searchMessages({to, modelName: FORM_REQUEST, filterProps: {product: REFRESH_PRODUCT, _documentCreated: false}})
    let requestForRefresh
    if (requestsForRefresh.length === 1)
      requestForRefresh = requestsForRefresh[0]
    else //{
      requestForRefresh = requestsForRefresh.find(r => r._dataBundle === returnVal._dataBundle) //  &&  r.contextId  &&  r._context)

    let context = requestForRefresh._context
    if (!context) {
      let contexts = await this.Store.searchMessages({to, modelName: PRODUCT_REQUEST, filterProps: {requestFor: REFRESH_PRODUCT, _documentCreated: false}})
      context = contexts && contexts.find(r => r._dataBundle === returnVal._dataBundle)
      debug('updateRefresh: ' + JSON.stringify(context, null, 2))

      if (context) {
        requestForRefresh._context = context
        this.Store.setItem(getId(requestForRefresh), requestForRefresh)
      }
    }
    if (!returnVal._context  &&  context) {
      returnVal._context = context
      this.Store.setItem(getId(returnVal), returnVal)
    }

    if (!requestForRefresh._forms)
      requestForRefresh._forms = []

    if (!requestForRefresh._forms.some(f => f.hash === returnVal[ROOT_HASH]))
      requestForRefresh._forms.push({type: returnVal[TYPE], isNew: false, hash: returnVal[ROOT_HASH]})

    let id = getId(requestForRefresh)
    await this.Store.dbPut(id, requestForRefresh)
    this.Store.setItem(id, requestForRefresh)
  }

  async onAddAll({resource, to, reviewed, message}) {
    let rId = getId(resource)
    let r = this.Store._getItem(rId)
    this.Store.trigger({action: 'addItem', resource: r})
    await this.Store.dbPut(rId, r)
    // prepare some whitespace
    const numRows = 5
    const white = ' '.repeat(40)
    const messages = new Array(numRows).fill(white)
    const title = `${translate('sending')}...          ` // extra whitespace on purpose

    Actions.showModal({
      title,
      message: messages.join('\n')
    })

    let { result } = await this.searchForRefresh({to, resource, modelName: FORM})
    let total = result.length

    let items = result.filter(r => reviewed.find(rr => rr[ROOT_HASH] === r[ROOT_HASH]))

debugger
    let context = resource._context || r._context
    let isProductBundle = context  &&  context.bundleId
    let delayedItems = []
    let resources = []
    let me = getMe()
    let toRep = to[TYPE] === ORGANIZATION ? this.Store.getRepresentative(to) : to
    for (let i = 0; i < items.length; i++) {
      // debugger
      let item = { ...items[i], _context: context, from : me, to: r.from }
      delete item[NOT_CHAT_ITEM]

      let itemType = getType(item)
      let itemModel = this.Store.getModel(itemType)
      let displayName = ''
      if (itemModel) displayName += itemModel.title

      let resourceDisplayName = item.title || getDisplayName(item)
      if (resourceDisplayName) {
        displayName += ': ' + resourceDisplayName
      }

      if (i > 0) {
        let last = messages.length - 1
        messages[last] = messages[last].replace('importing', 'imported')
      }

      // let's not run out of room on the screen
      let next = displayName // `importing "${displayName}"`
      if (next.length > 30) {
        next = next.slice(0, 27) + '...'
      }

      let idx = Math.min(numRows - 1, i)
      if (messages[idx].trim()) {
        messages.shift()
        messages.push(next)
      } else {
        messages[idx] = next
      }

      Actions.showModal({
        title,
        message: messages.join('\n\n')
      })

      if (isProductBundle) {
        const propNames = Object.keys(itemModel.properties)
        const toKeep = ['_sourceId', '_context', 'from', 'to'].concat(propNames)
        item._latest = false
        this.Store._setItem(getId(item), item)
        item = _.pick(item, toKeep)
        let props = this.refs  &&  this.refs[item._sourceId]
        if (props &&  _.size(props)) {
          delayedItems.push(item)
          resources.push(item)
          continue
        }
      }
      let promiseAddItem = this.Store.onAddChatItem({ resource: item, noTrigger: true, forceUpdate: true })
      let promiseSentEvent = new Promise(resolve => this.Store.execOnce('sent', resolve))
      let ret = await Promise.all([
        promiseAddItem,
        Promise.race([
          promiseSentEvent,
          // force continue loop
          promiseDelay(2000)
        ])
      ])
      let ritem = ret[0]
      resources.push(ritem)

      await promiseDelay(200)
      let itemId = getId(ritem)
      ritem._latest = false
      this.Store.setItem(itemId, ritem)
    }
    if (delayedItems) {
      await this.processUploadedDataBundleWithSourceIDs({val: resource, resources, dontAdd: isProductBundle})

      let results = await Promise.all(delayedItems.map(item => {
        let r = resources.find(rr => item._sourceId === rr._sourceId)
        return this.Store.onAddChatItem({resource: r, noTrigger: true})
      }))
      debugger
    }
    Actions.hideModal()
    if (items.length === total) {
      r._documentCreated = true
      await this.Store.onAddChatItem({ resource: r })
      await this.Store.onAddMessage({
        msg: {
          [TYPE]: DATA_BUNDLE_SUBMITTED,
          from: me,
          to,
          message: `Submitted ${total} items`,
          _context: resource._context,
          dataBundle: getRootHash(r._dataBundle)
        }
      })
    }
  }
}
module.exports = DataBundle

