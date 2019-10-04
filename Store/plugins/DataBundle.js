import _ from 'lodash'
import Debug from 'debug'
var debug = Debug('tradle:app:dataBundle')

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
  getMe,
  getId,
  getType,
  getDisplayName,
  promiseDelay,
  isMyProduct,
  isItem,
  translate,
} from '../../utils/utils'
import Actions from '../../Actions/Actions'
import refreshPrefill from '../refreshPrefill.json'

const {
  VERIFICATION,
  ORGANIZATION
} = constants.TYPES

const IS_MESSAGE = '_message'
const NOT_CHAT_ITEM = '_notChatItem'
const FORM_REQUEST = 'tradle.FormRequest'
const REFRESH_PRODUCT = 'tradle.RefreshProduct'
const PRODUCT_REQUEST = 'tradle.ProductRequest'
const REFRESH = 'tradle.Refresh'
const MY_PRODUCT = 'tradle.MyProduct'

class DataBundle {
  constructor(store) {
    this.Store = store
  }
  async processDataBundle({val, context}) {
    let fromR = this.Store._getItem(val.from)
    let forg = fromR && fromR.organization
    let title = forg  &&  forg.title  ||  val.from.title
    Actions.showModal({title: translate('sendingYourData', val.items.length, title), showIndicator: true})
    setTimeout(() => Actions.hideModal(), 3000)
    let result = await Promise.all(val.items.map(item => this.Store.saveObject({object: item})))
    let orgR = this.Store._getItem(val.from).organization
    let me = getMe()
    let key = getId(val)

    // Can't do it async since the order matters forms should be processed before verifications
    for (let i=0; i<result.length; i++) {
      let item = result[i]
      let r = item.object
      this.Store.rewriteStubs(r)
      r[ROOT_HASH] = item.permalink
      r[CUR_HASH] = item.link
      let m = this.Store.getModel(r[TYPE])
      let isMyMessage = r[TYPE] !== VERIFICATION  &&  !isMyProduct(m)
      r.from = isMyMessage ?  me : val.from
      r.to = isMyMessage ? val.from : this.Store.buildRef(me)
      if (!r._time)
        r._time = new Date().getTime()
      if (!isItem(m))
        r[IS_MESSAGE] = true
      r[NOT_CHAT_ITEM] = true
      if (context)
        r._context = context
      else
        r._dataBundle = key
      r._latest = true
      await this.Store.onAddChatItem({resource: r, noTrigger: true})
    }
    await this.fireRefresh({val, dataBundle: key, context})
    Actions.hideModal()
  }
  async searchForRefresh(params) {
    let { to, resource } = params
    // let [ requestForRefresh ] = await this.Store.searchMessages({to, isRefresh: true, modelName: FORM_REQUEST, filterProps: {product: REFRESH_PRODUCT, _latest: true, _documentCreated: false}})
    let [ requestForRefresh ] = await this.Store.searchMessages({to, modelName: FORM_REQUEST, filterProps: {product: REFRESH_PRODUCT, _documentCreated: false}})
    if (!requestForRefresh)
      return

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
      return

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

    let moreForms = resource.prefill.additionalForms
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

  async fireRefresh({val, dataBundle, context}) {
    setTimeout(async () => {
      let me = getMe()
      let requestForPR = {
        [TYPE]: PRODUCT_REQUEST,
        requestFor: REFRESH_PRODUCT,
        from: me,
        to: val.from,
        _dataBundle: dataBundle
      }
      await this.Store.onAddChatItem({resource:  requestForPR, noTrigger: true})

      let requestForRefresh = {
        [TYPE]: FORM_REQUEST,
        from: val.from,
        to: me,
        product: REFRESH_PRODUCT,
        form: 'tradle.Refresh',
        message: 'Please review and confirm',
        _dataBundle: dataBundle,
        prefill: refreshPrefill
      }
      let res = await this.Store.searchMessages({to: val.from, modelName: PRODUCT_REQUEST, filterProps: {product: REFRESH_PRODUCT, _documentCreated: false}})
      let context = res && res.find(r => r.requestFor === REFRESH_PRODUCT  &&  dataBundle  &&  r._dataBundle === dataBundle)
      if (context)
        requestForRefresh._context = context
      await promiseDelay(5000)
      debug('fireRefresh: ' + JSON.stringify(context, null, 2))
      await this.Store.onAddChatItem({resource:  requestForRefresh, doNotSend: true})
    }, 5000)
  }
  async updateRequestForRefresh(to, returnVal) {
    // let requestsForRefresh = await this.Store.searchMessages({to, modelName: FORM_REQUEST, isRefresh: true, filterProps: {product: REFRESH_PRODUCT, _latest: true, _documentCreated: false}})
    let requestsForRefresh = await this.Store.searchMessages({to, modelName: FORM_REQUEST, filterProps: {product: REFRESH_PRODUCT, _documentCreated: false}})
    let requestForRefresh
    if (requestsForRefresh.length === 1)
      requestForRefresh = requestsForRefresh[0]
    else //{
      requestForRefresh = requestsForRefresh.find(r => r._dataBundle === returnVal._dataBundle) //  &&  r.contextId  &&  r._context)

    if (!requestForRefresh._context) {
      let contexts = await this.Store.searchMessages({to, modelName: PRODUCT_REQUEST, filterProps: {requestFor: REFRESH_PRODUCT, _documentCreated: false}})
      let context = contexts && contexts.find(r => r._dataBundle === returnVal._dataBundle)
      debug('updateRefresh: ' + JSON.stringify(context, null, 2))

      if (context) {
        requestForRefresh._context = context
        this.Store._setItem(getId(requestForRefresh), requestForRefresh)
      }
    }
    if (!requestForRefresh._forms)
      requestForRefresh._forms = []

    if (!requestForRefresh._forms.some(f => f.hash === returnVal[ROOT_HASH]))
      requestForRefresh._forms.push({type: returnVal[TYPE], isNew: false, hash: returnVal[ROOT_HASH]})

    let id = getId(requestForRefresh)
    await this.Store.dbPut(id, requestForRefresh)
    this.Store._setItem(id, requestForRefresh)
  }

  async _onAddAll({resource, to, reviewed, message, total}) {
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

    let items = resource.items || reviewed
    if (items.length === total)
      r._documentCreated = true
    let context = resource._context || r._context
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
      // debugger
      // let promiseAddItem = await this.Store.onAddChatItem({ resource: item, noTrigger: true, forceUpdate: true })
      let promiseAddItem = this.Store.onAddChatItem({ resource: item, noTrigger: true, forceUpdate: true })
      let promiseSentEvent = new Promise(resolve => this.Store.execOnce('sent', resolve))
      await Promise.all([
        promiseAddItem,
        Promise.race([
          promiseSentEvent,
          // force continue loop
          promiseDelay(2000)
        ])
      ])
      await promiseDelay(200)
    }
    Actions.hideModal()

    // await this.onAddMessage({msg: {
    //   [TYPE]: REMEDIATION_SIMPLE_MESSAGE,
    //   message,
    //   time: new Date().getTime(),
    //   _context: context,
    //   from: this.buildRef(me),
    //   to: this.buildRef(r.from)
    // }})
  }
}
module.exports = DataBundle