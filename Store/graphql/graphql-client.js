'use strict'

import omit from 'lodash/omit'
import isEmpty from 'lodash/isEmpty'
import size from 'lodash/size'
import extend from 'lodash/extend'
import getPropertyAtPath from 'lodash/get'
import { utils as tradleUtils } from '@tradle/engine'
import { GraphQLClient } from 'graphql-request'
import constants from '@tradle/constants'
import utils from '../../utils/utils'
const {
  TYPE,
  SIG,
  ROOT_HASH,
  PREV_HASH,
  CUR_HASH,
} = constants

const { MONEY, ORGANIZATION, MESSAGE, MODEL, FORM, IDENTITY } = constants.TYPES
const PHOTO = 'tradle.Photo'
const COUNTRY = 'tradle.Country'
const PUB_KEY = 'tradle.PubKey'
const APPLICATION = 'tradle.Application'
const APPLICATION_SUBMISSION = 'tradle.ApplicationSubmission'
const BOOKMARKS_FOLDER = 'tradle.BookmarksFolder'
const NETWORK_FAILURE = 'Failed to fetch'
const INVALID_QUERY = 'Syntax Error GraphQL request'
const WRONG_VERSION_ID  = 'expected models with versionId: '
const INTERNAL_SERVER_ERROR_MSG = 'Internal Server Error'

const INTERNAL_SERVER_ERROR = 500
const MAX_ATTEMPTS = 3

var messageMap = {
  [NETWORK_FAILURE]: 'networkFailure',
  [INVALID_QUERY]: 'invalidQuery',
}
const useApollo = false
var search = {
  initClient(meDriver, url) {
    return this.initClientGraphQLRequest(meDriver, url)
  },

  initClientGraphQLRequest(meDriver, url, headers) {
    // debugger
    let graphqlEndpoint = `${url.replace(/[/]+$/, '')}/graphql`
    if (!graphqlEndpoint)
      return
    this.graphqlEndpoint = graphqlEndpoint
    this.meDriver = meDriver
    // Not needed but just to make it generic
    return new GraphQLClient(graphqlEndpoint, { headers })
  },

  async searchServer(params) {
    let {client, modelName, filterResource, sortProperty, asc, limit,
         endCursor, properties, select, excludeProps, bookmark, allow} = params

    if (filterResource  &&  !Object.keys(filterResource).length)
      filterResource = null

    let table = `rl_${modelName.replace(/\./g, '_')}`
    let model = utils.getModel(modelName)
    let versionId = params.versionId || model._versionId
    // let version = versionId ? '($modelsVersionId: String!)' : ''
    // let allowVar = allow ? '($allow: String!)' : ''
    let str =''
    if (versionId && !versionId.length)
      versionId = null
    if (versionId && allow)
      str = '($modelsVersionId: String!, $allow: String!)'
    else if (versionId)
      str = '($modelsVersionId: String!)'
    else if (allow)
      str = '($allow: String!)'

    let query = `query ${str} {\n${table}\n`
    let props = model.properties
    let inClause = []
    let op = {
      CONTAINS: '',
      EQ: '',
      NEQ: '',
      NULL: '',
      STARTS_WITH: '',
      GT: '',
      GTE: '',
      LT: '',
      LTE: '',
    }
    let exclude = [ROOT_HASH, CUR_HASH, TYPE]
    if (excludeProps)
      exclude.concat(excludeProps)
    if (filterResource) {
      for (let p in filterResource) {
        if (exclude.indexOf(p) !== -1)
          continue
        let val = filterResource[p]
        let neq
        if (p.endsWith('!')) {
          neq = true
          p = p.slice(0, -1)
        }
        if (!props[p]  &&  val) {
          if (p.charAt(0) === '_') {
            if (Array.isArray(val)) {
              let s = `${p}: [`
              val.forEach((r, i) => {
                if (i)
                  s += ', '
                s += `"${r}"`
              })
              s += ']'
              inClause.push(s)
            }
            else
              this.addTo(op, neq, `\n   ${p}: "${val}",`)
          }
          else if (p.indexOf('.') !== -1  &&  props[p.split('.')[0]]) {
            p = p.replace('.', '__')
            this.addTo(op, neq, `\n   ${p}: "${val}",`)
          }
          continue
        }
        if (!props[p]  ||  props[p].hidden)
          continue
        if (props[p].type === 'string') {
          if (Array.isArray(val)) {
            let s = `${p}: [`
            val.forEach((r, i) => {
              if (i)
                s += ', '
              s += `"${r}"`
            })
            s += ']'
            inClause.push(s)
            continue
          }
          if (!val  ||  !val.trim().length) {
            if (val === null)
              op.NULL += `\n ${p}: true`
            continue
          }
          let len = val.length
          if (val.indexOf('*') === -1)
            this.addTo(op, neq, `\n   ${p}: "${val}",`)
          else if (len > 1) {
            if (val.charAt(0) === '*') {
              if (val.charAt(val.length - 1) === '*')
                op.CONTAINS = `\n   ${p}: "${val.substring(1, len - 1)}",`
              else
                op.CONTAINS = `\n   ${p}: "${val.substring(1)}",`
            }
            else if (val.charAt(len - 1) === '*')
              op.STARTS_WITH = `\n   ${p}: "${val.substring(0, len - 1)}",`
          }
        }
        else if (props[p].type === 'boolean') {
          if (val)
            op.EQ += `\n   ${p}: ${val},`
          else if (val === null) {
            if (!bookmark)
              op.NULL += `\n ${p}: true`
          }
          else
            op.NEQ += `\n   ${p}: true,`
        }
        else if (props[p].type === 'number')
          addEqualsOrGreaterOrLesserNumber(val, op, props[p])
        else if (props[p].type === 'date')
          op.GTE = `\n   ${p}: "${typeof val === 'date' &&  val ||  new Date(val).getTime()}",`

        else if (props[p].type === 'object') {
          let isEnum = props[p].ref  &&  utils.isEnum(props[p].ref)
          if (Array.isArray(val)) {
            if (!val.length)
              continue
            if (isEnum) {
              if (val.length === 1) {
                this.addTo(op, neq, `\n   ${p}__id: "${val[0].id}",`)
              }
              else {
                let s = `${p}__id: [`
                val.forEach((r, i) => {
                  if (i)
                    s += ', '
                  s += `"${r.id}"`
                })
                s += ']'
                inClause.push(s)
              }
            }
            else {
              if (val.length === 1) {
                this.addTo(op, neq, `\n   ${p}___permalink: "${utils.getRootHash(val[0])}",`)
              }
              else {
                let s = `${p}___permalink: [`
                val.forEach((r, i) => {
                  if (i)
                    s += ', '
                  s += `"${utils.getRootHash(r)}"`
                })
                s += ']'
                inClause.push(s)
              }
            }
          }
          else {
            if (isEnum) {
              this.addTo(op, neq, `\n   ${p}__id: "${val.id}",`)
            }
            else if (props[p].ref === MONEY) {
              let {value, currency} = val
              this.addTo(op, neq, `\n  ${p}__currency: "${currency}",`)
              if (val.value)
                addEqualsOrGreaterOrLesserNumber(value, op, props[p])
            }
            else if (val  &&  (typeof val === 'string')  &&  val.indexOf('NULL') !== -1) {
              if (val === 'NULL')
                op.NULL += `\n ${p}: true`
              else
                op.NULL += `\n ${p}: false`
              continue
            }
            else {
              this.addTo(op, neq, `\n   ${p}___permalink: "${utils.getRootHash(val)}",`)
            }
          }
        }
        else if (props[p].type === 'array') {
          if (props[p].items.ref) {
            if (!val.length)
              continue
            if (val.length === 1  &&  val[0].indexOf('NULL') !== -1) {
              if (val[0] === 'NULL')
                op.NULL += `\n ${p}: true`
              else
                op.NULL += `\n ${p}: false`
              continue
            }
            let s = `${p}___permalink: [`
            val.forEach((r, i) => {
              if (i)
                s += ', '
              s += `"${utils.getRootHash(r)}"`
            })
            s += ']'
            inClause.push(s)
          }
        }
      }
    }
    op.IN = inClause ? inClause.join(',') : ''

    let qq = ''
    for (let o in op) {
      let q = op[o]
      if (q.length) {
        qq +=
         `\n  ${o}: {
           ${op[o]}\n},`
      }
    }
    query += '('
    if (versionId)
      query += `\nmodelsVersionId: $modelsVersionId\n`
    if (allow)
      query += `\nallow: $allow\n`
    if (limit) {
      if (endCursor)
        query += `checkpoint: "${endCursor}"\n`
      query += `limit:  ${limit}\n`
    }

    if (qq.length)
      query += `filter: { ${qq} },\n`
    if (sortProperty) {
      let sortBy
      let ref = props[sortProperty].ref
      if (ref) {
        if (ref === MONEY)
          sortBy = sortProperty + '__value'
        else
          sortBy = sortProperty + '__title'
      }
      else
        sortBy = sortProperty
      query += `\norderBy: {
        property: ${sortBy},
        desc: ${asc ? false : true}
      }`
    }
    else
      query += `\norderBy: {
        property: _time,
        desc: true
      }`
    query += ')'
    query += `\n{\n`
    query += `pageInfo {\n endCursor\n}\n`
    query += `edges {\n node {\n`

    if (!select) {
      select = this.getSearchProperties({model, properties, isList: true, excludeProps})
    }

    query += `${select.join('   \n')}`
    query += `\n}`   // close 'node'
    query += `\n}`   // close 'edges'
    query += `\n}`   // close properties block
    query += `\n}`   // close query

    let error, mapping, retry = true
    for (let attemptsCnt=0; attemptsCnt<MAX_ATTEMPTS  &&  retry; attemptsCnt++) {
      let data = await this.execute({client, query, table, versionId, allow})
      if (data.result) {
        return { result:  data.result }
      }
      let checkErrorResult = await this.checkError(data, model)
      if (model.id.indexOf('Asset') !== -1)
        debugger
      ({ error='',  excludeProps={}, retry=true, mapping={}} = checkErrorResult)
      if (params.preventRecursion)
        continue
      if (excludeProps.length) {
        params.excludeProps = excludeProps
        params.mapping = mapping
        return await this.searchServer(params)
      }
      if (checkErrorResult.versionId  &&  checkErrorResult.versionId !== versionId) {
        params.versionId = versionId
        params.preventRecursion = true
        return await this.searchServer(params)
      }
      if (error  &&  error === NETWORK_FAILURE  ||  !retry)
        break
    }

    console.log(error)
    return { error: messageMap[error] || error, retry }

    function addEqualsOrGreaterOrLesserNumber(val, op, prop) {
      let isMoney = prop.ref === MONEY
      let p = prop.name
      if (isMoney)
        p += '__value'
      let ch = val.toString().charAt(0)
      switch (ch) {
      case '>':
        if (val.charAt(1) === '=')
          op.GTE += `\n   ${p}: ${val.substring(2)},`
        else
          op.GT += `\n   ${p}: ${val.substring(1)},`
        break
      case '<':
        if (val.charAt(1) === '=')
          op.LTE += `\n   ${p}: ${val.substring(2)},`
        else
          op.LT += `\n   ${p}: ${val.substring(1)},`
        break
      default:
        op.EQ += `\n   ${p}: ${val},`
      }

    }
  },
  addTo(op, neq, condition) {
    if (neq)
      op.NEQ += condition
    else
      op.EQ += condition
  },
  async getChat(params) {
    let { author, client, context, filterResource, limit, endCursor, application } = params
    let table = `rl_${MESSAGE.replace(/\./g, '_')}`
    let contextVar = filterResource || context ? '' : '($context: String)'
    let limitP = limit ? `limit:  ${limit}` : ''
    let checkpoint = limit  &&  endCursor ? `checkpoint: "${endCursor}"\n` : ''
    // let desc = !direction || direction === 'down' ? true : false
    let desc = true
    // if (endCursor)
    //   debugger

    let queryHeader =
       `query ${contextVar} {
          ${table} (
          ${limitP}
          ${checkpoint}
          filter: {
       `
    let queryFooter = `
          }
          orderBy:{
            property: _time
            desc: ${desc}
          }
        )
        {
          pageInfo { endCursor }
          edges {
            node {
              _author
              _recipient
              _inbound
              originalSender
              object
              _time
              context
            }
          }
        }
      }`


    let eq = `
            EQ: {
            `
    // for app view prevent prevent from displaying double wrapped messages
    if (author) //  &&  (!context ||  application))
      eq += `_counterparty: "${author}"\n`

    let filter = ''
    if (filterResource) {
      for (let p in filterResource) {
        if (typeof filterResource[p] === 'boolean')
          filter += '             ' + p + ': ' + `${filterResource[p]}\n`
        else
          filter += '             ' + p + ': ' + `"${filterResource[p]}"\n`
      }
    }
    eq += filter

    if (context)
      eq += `             context: "${context}"`
    eq += `
            },
          `
    let neq = ''
    if (!context  &&  !filterResource) {
      context = null
      neq = `
            NEQ: {
              context: $context
              _payloadType: "${MESSAGE}"
            }
            `
    }
    if (!neq  &&  application) {
      neq = `
            NEQ: {
              _payloadType: "${MESSAGE}"
            }
            `
    }
    let query = queryHeader + eq + neq + queryFooter

    try {
      let result = await this.execute({client, query, table})
      return result  &&  result.result
    } catch (err) {
      debugger
    }

  },

  async getBookmarkChat(params) {
    let { author, client, context, filterResource, limit, endCursor, application,
          sortProperty, asc } = params
    let table = `rl_${MESSAGE.replace(/\./g, '_')}`
    let contextVar = filterResource || context ? '' : '($context: String)'
    let limitP = `limit:  ${limit || 20}`
    let checkpoint = limit  &&  endCursor ? `checkpoint: "${endCursor}"\n` : ''
    // let desc = !direction || direction === 'down' ? true : false
    let orderBy = sortProperty || '_time'
    let desc
    if (orderBy  &&  typeof asc !== 'undefined')
      desc = params.hasOwnProperty('asc') ? asc : true
    else
      desc = true
    let props = utils.getModel(MESSAGE).properties
    // if (endCursor)
    //   debugger

    let queryHeader =
       `query ${contextVar} {
          ${table} (
          ${limitP}
          ${checkpoint}
          filter: {
       `
    let queryFooter = `
          }
          orderBy:{
            property: ${orderBy}
            desc: ${desc}
          }
        )
        {
          pageInfo { endCursor }
          edges {
            node {
              _author
              _recipient
              _link
              _permalink
              originalSender
              _payloadType
              _payloadLink
              _time
              context
            }
          }
        }
      }`

    let op = {
      CONTAINS: '',
      EQ: '',
      IN: '',
      NEQ: '',
      NULL: '',
      STARTS_WITH: '',
      GT: '',
      GTE: '',
      LT: '',
      LTE: '',
    }


    // for app view prevent prevent from displaying double wrapped messages
    if (author) //  &&  (!context ||  application))
      op.EQ += `_counterparty: "${filterResource._counterparty || author}"\n`

    if (filterResource) {
      for (let p in filterResource) {
        if (p === TYPE)
          continue
        let val = filterResource[p]
        if (Array.isArray(val))
          op.IN += `\n   ${p}: ["${val.join('\",\"')}"],`
        else if (typeof val === 'string'  &&  props[p].type === 'string') {
          let len = val.length
          if (val.charAt(0) === '*') {
            if (val.charAt(len - 1) === '*')
              op.CONTAINS += `\n   ${p}: "${val.substring(1, len - 1)}",`
            else
              op.CONTAINS += `\n   ${p}: "${val.substring(1)}",`
          }
          else if (val.charAt(len - 1) === '*')
            op.STARTS_WITH += `\n   ${p}: "${val.substring(0, len - 1)}",`
          else
            op.EQ += '             ' + p + ': ' + `"${val}"\n`
        }
        else if (props[p].type === 'date')
          op.GTE = `\n   ${p}: "${new Date(val).getTime()}",`
        else if (typeof val === 'boolean')
          op.EQ += '             ' + p + ': ' + `${val}\n`
        else
          op.EQ += '             ' + p + ': ' + `"${val}"\n`
      }
    }

    if (context)
      op.EQ += `             context: "${context}"`
    else  //if (filterResource  &&  filterResource.hasOwnProperty('context')  &&  typeof filterResource.context !== 'string') {
      op.NULL += `             context: false            `
    if (!context  &&  !filterResource) {
      context = null
      op.NEQ += `
              context: $context
              _payloadType: "${MESSAGE}"
            `
    }
    if (!op.NEQ  &&  application) {
      op.NEQ = `             _payloadType: "${MESSAGE}"`
    }
    let qq = ''
    for (let o in op) {
      let q = op[o]
      if (q.length) {
        qq +=
         `\n  ${o}: {
           ${op[o]}\n},`
      }
    }

    let query = queryHeader + qq + queryFooter

    try {
      let result = await this.execute({client, query, table})
      return result  &&  result.result
    } catch (err) {
      debugger
    }

  },

  getSearchProperties(params) {
    let { model, inlined, properties, backlink } = params
    let props = /*backlink ? {[backlink.name]: backlink} :*/ model.properties

    let arr
    if (utils.isInlined(model))
      arr = [] //[TYPE] //, '_link', '_permalink']
    else {
      arr = ['_permalink', '_link', '_p', '_time', '_author', '_org', '_authorOrg', '_authorOrgType', '_authorTitle', '_time']
      if (model.id !== PUB_KEY  &&  !inlined) {
        let newarr = arr.concat(TYPE, SIG)
        arr = newarr
      }
      if (model.abstract)
        return arr
      if (!model.inlined)
        arr.push(TYPE)
      arr.push(`_seal {
                txId,
                blockchain,
                network,
                _time
              }`)
    }
    if (properties) {
      let newProps = {}
      properties.forEach((p) => newProps[p] = props[p])
      props = newProps
    }
    return this.addProps({...params, props, model, arr})
  },
  addRef(prop) {
    let ref = prop.type === 'array' ? prop.items.ref : prop.ref
    let p = prop.name
    if (ref === MONEY) {
      return (
        `${p} {
          value
          currency
        }`
      )
    }

    else if (ref === COUNTRY) {//   ||  ref === CURRENCY)
      return (
        `${p} {
          id
          title
        }`
      )
    }
    let m = utils.getModel(ref)
    if (utils.isEnum(m)) {
      if (m.enum)
        return (
          `${p} {
            id
            title
          }`
        )
      else
        return p
    }
    if (m.id === PHOTO) {
      return (
        `${p} {${this.getSearchProperties({model: m})}}`
      )
    }
    return (
      `${p} {
        ${TYPE}
        _permalink
        _link
        _displayName
      }`
    )
  },
  addProps({isList, backlink, props, currentProp, arr, model, excludeProps, mapping, noBacklinks}) {
    if (!arr)
      arr = []
    let isApplication = model  &&  model.id === APPLICATION
    let me = utils.getMe()
    for (let p in props) {
      if (excludeProps  &&  excludeProps.indexOf(p) !== -1)
        continue
      if (p.charAt(0) === '_') {
        if (me.isEmployee) {
          if (p === '_sourceOfData'  ||  p === '_dataLineage')
            arr.push(p)
        }
        continue
      }
      if (p === 'from' || p === 'to' ||  p.indexOf('_group') !== -1)
        continue
      let prop = props[p]
      if (prop.virtual  ||  prop === currentProp)
        continue
      if (prop.displayAs)
        continue
      let ptype = prop.type
      if (ptype === 'array') {
        let excludePropsFor
        if (prop.items.ref === model.id)
          excludePropsFor = excludeProps
        else
          excludePropsFor = mapping  &&  prop.items.ref  &&  mapping[prop.items.ref]
        this.addArrayProperty({prop, model, arr, isList, backlink, currentProp, excludeProps, noBacklinks})
        continue
      }
      if (ptype !== 'object') {
        arr.push(p)
        continue
      }
      let ref = prop.ref
      if (!ref) {
        if (prop.range === 'json')
          arr.push(p)
        continue
      }
      if (ref === ORGANIZATION)
        continue

      if (prop.inlined  ||  utils.getModel(ref).inlined)
        arr.push(this.addInlined({prop}))
      else
        arr.push(this.addRef(prop))
    }
    return arr
  },
  addArrayProperty({prop, model, arr, isList, backlink, currentProp, excludeProps, noBacklinks}) {
    let p = prop.name
    let isApplication = model  &&  model.id === APPLICATION
    let isBookmarksFolder = model  &&  model.id === BOOKMARKS_FOLDER
    // if (p === 'verifications' && noBacklinks)
    //   return

    let isSubmissions
    if (isApplication) {
      if (isList  &&  p !== 'relationshipManagers')
        return
      isSubmissions = p === 'submissions'
      if (!backlink  &&  prop.items.ref === APPLICATION_SUBMISSION &&  !isSubmissions)
        return
    }
    let iref = prop.items.ref
    if (iref) {
      let isInlined = iref !== MODEL  && utils.isInlined(utils.getModel(iref))

      if (prop.items.backlink  &&  !prop.inlined) { //  &&  !utils.getModel(iref).abstract) {
        if (isList  &&  !isApplication  &&  !isBookmarksFolder)
          return
        let props
        if (iref !== model.id) {
          if (noBacklinks) return
          props = this.getSearchProperties({model: utils.getModel(iref), noBacklinks: true})
        }
        // HACK
        else if (isApplication)
          props = arr.concat(['hasFailedChecks', 'hasCheckOverrides'])
        else
          props = arr

        arr.push(`${p}${isSubmissions && '(limit: 100)' || ''} {
          edges {
            node {
              ${props}
            }
          }
        }`)
      }
      else if (prop.inlined  ||  isInlined) {
        if (currentProp  &&  currentProp === prop)
          return
        arr.push(this.addInlined({prop, excludeProps}))
      }
      else
        arr.push(
          `${p} {
            ${TYPE}
            _permalink
            _link
            _displayName
          }`
        )
    }
    else {
      let allProps = this.addProps({isList, props: prop.items.properties, excludeProps})
      if (allProps.length) {
        arr.push(
          `${p} {
            ${allProps.toString().replace(/,/g, '\n')}
          }`
        )
      }
      else
        arr.push(p)
    }
  },
  addInlined({prop, excludeProps}) {
    let ref = prop.type === 'array' ? prop.items.ref : prop.ref
    let p = prop.name
    if (ref === MODEL)
      return `${p}`
    let refM = utils.getModel(ref)
    if (prop.range === 'json')
      return p
    if (refM.abstract)
      return p
    if (/*ref === FORM  || */ refM.isInterface  ||  utils.isEnum(refM)) {
      return (
        `${p} {
          id
          title
        }`
      )
    }
    else {
      let allProps = this.getSearchProperties({model: refM, inlined: true, currentProp: prop, noBacklinks: true, excludeProps})
      return (
        `${p} {
          ${allProps.toString().replace(/,/g, '\n')}
        }`
      )
    }
  },
  async getItem({id, client, backlink, noBacklinks, excludeProps, mapping, isChat, isThisVersion}) {
    let [modelName, _permalink, _link] = id.split('_')

    let model = utils.getModel(modelName)
    if (!model)
      return

    let table = `r_${modelName.replace(/\./g, '_')}`
    let query
    if (isChat || isThisVersion)
      query = `query {\n${table} (_link: "${_link}")\n`
    else
      query = `query {\n${table} (_permalink: "${_permalink}")\n`

    if (backlink  ||  noBacklinks) {
      if (!excludeProps)
        excludeProps = []
      let itemsProps = utils.getPropertiesWithAnnotation(model, 'items')
      if (size(itemsProps) > 1) {
        if (noBacklinks)
          itemsProps = Object.keys(itemsProps)
        else
          itemsProps = Object.keys(itemsProps).filter(item => item !== backlink.name)
        excludeProps = excludeProps.concat(itemsProps)
      }
    }
    let arr = this.getSearchProperties({model, backlink, excludeProps, mapping})

    query += `\n{${arr.join('   \n')}\n}\n}`
    try {
      let result = await this.execute({client, query, table})
      if (result.error  &&  !excludeProps) {
        let { excludeProps, error, mapping } = await this.checkError(result, model)
        if (excludeProps)
          return await this.getItem({ id, client, backlink, excludeProps, mapping, isThisVersion })
      }
      return result.result
    }
    catch(err) {
      console.log('graphQL._getItem', err)
      debugger
    }
  },
  async checkError(result, model) {
    let message, graphQLErrors, networkError
    if (useApollo) {
      ({ message, graphQLErrors, networkError } = result.error)
    }
    else {
      debugger
      if (result.error.response) {
        debugger
        const { errors, status, error } = result.error.response
        if (status === INTERNAL_SERVER_ERROR || error === INTERNAL_SERVER_ERROR_MSG) {
          if (errors  &&  errors.length === 1) {
            if (errors[0].message.indexOf(WRONG_VERSION_ID) === 0)
              return {error, retry: true, versionId: errors[0].message.split(': ')[1]}
          }
          return {error, retry: true}
        }
        graphQLErrors = result.error.response.errors
        message = INVALID_QUERY
      }
      else {
        graphQLErrors = []
        if (result.error.message === 'Failed to fetch')
          return { error: NETWORK_FAILURE }
        message = result.error.message
      }
    }
    if (graphQLErrors  &&  graphQLErrors.length) {
      let { excludeProps, mapping } = this.getExcludeProps(graphQLErrors, model)
      if (excludeProps.length)
        return { excludeProps, mapping }
      return { error: message, retry: message === NETWORK_FAILURE }
    }
    debugger

    if (networkError  &&  networkError.message === NETWORK_FAILURE)
      return { error: NETWORK_FAILURE }

    if (message.indexOf(INVALID_QUERY) === 0)
      message = INVALID_QUERY
    await utils.submitLog(true)
    return { error: message, retry: false }
  },
  getExcludeProps(graphQLErrors, model) {
    let excludeProps = []
    let mapping = {}
    let str = 'Cannot query field \"'
    let len = str.length
    let props = model.properties
    graphQLErrors.forEach(err => {
      if (err.path) {
        if (err.path === 1)
          return
        let prop
        for (let i=err.path.length - 1; i>=0  &&  !prop; i--) {
          let p = err.path[i]
          if (props[p])
            prop = p
        }
        if (prop) {
          excludeProps.push(prop)
          return
        }
      }

      let msg = err.message
      let idx = msg.indexOf(str)
      if (idx !== 0)
        return
      idx = msg.indexOf('\"', len)
      let field = msg.substring(len, idx)
      // check if this is the table itself that is not recognized
      if (field.indexOf(`_${model.id.replace('.', '_')}`) === -1) {
        excludeProps.push(field)
        let idx = msg.indexOf(' on type "')
        if (idx === -1)
          return
        let idx2 = msg.indexOf('"', idx + 10)
        if (idx2 === -1)
          return
        let type = msg.slice(idx + 10, idx2).replace(/_/g, '.')
        if (utils.getModel(type)) {
          let props = mapping[type]
          if (!props)
            mapping[type] = []
          mapping[type].push(field)
        }
      }
    })
    return { excludeProps, mapping }
  },
  // TODO: rename _getItem to getItem
  // getItem: (...args) => search._getItem(...args),
  async getObjects(links, client) {
    let table = 'rl_objects'
    let query = `
    query {
        ${table} (
          links: ["${links.join('","')}"]
        )
        {
          objects
        }
     }`
    try {
      let result = await this.execute({client, query, table})
      return result.result  &&  result.result.objects  || []
    }
    catch(err) {
      console.log('graphQL._getItem', err)
      return []
      debugger
    }
  },
  async getIdentity({ client, _permalink, _link, pub }) {
    if (_link) return search.getIdentityByLink({ client, link: _link })
    if (_permalink) return search.getIdentityByPermalink({ client, permalink: _permalink })
    if (!pub) throw new Error('querying identities by _permalink is not supported at this time')

    const list = await search.searchServer({
      client,
      filterResource: { pub, importedFrom: null },
      select: ['link', 'permalink'],
      modelName: 'tradle.PubKey',
      noTrigger: true,
      limit: 1
    })

    if (list) {
      const pubKeyMapping = getFirstNode(list.result)
      if (pubKeyMapping) {
        return search.getIdentityByPermalink({ permalink: pubKeyMapping.permalink, client })
        // return search.getIdentityByLink({ link: pubKeyMapping.link, client })
      }
    }

    throw new Error(`identity not found with pub: ${pub}`)
  },
  async getIdentityByPermalink({permalink, client}) {
    let table = 'rl_tradle_Identity'
    let arr = ['_p', '_time', '_author', '_v', '_pv', '_ph', '_time', '_s']
    let pubArr = ['type', 'purpose', 'pub', 'fingerprint', 'curve', 'importedFrom', 'networkName']

    let query = `query {
      ${table} (
        limit:1
        orderBy: {
          property: _time,
          desc: true
        }
        filter:{
          EQ: {
            _permalink: "${permalink}"
          },
        }
      ) {
        edges {
          node {
            ${arr}
            pubkeys {
              ${pubArr}
            }
          }
        }
      }
    }`
    try {
      let data = await this.execute({query, table})
      if (data.result  &&  data.result.edges.length) {
        // let ret = omit(data.result.edges[0].node, ['_permalink'])
        let ret = { ...data.result.edges[0].node }
        for (let p in ret) {
          if (!ret[p])
            delete ret[p]
        }
        if (ret._v)
          ret[ROOT_HASH] = permalink
        ret[TYPE] = IDENTITY
        ret.pubkeys.map(pub => {
          for (let p in pub)
            if (!pub[p]) delete pub[p]
        })
        // debugger
        return ret
      }
    } catch (err) {
      console.log(`unknown identity ${permalink}`, err)
      throw new Error(`identity with permalink: ${permalink}`)
    }
  },
  getIdentityByLink: async ({ link, client }) => {
    const results = await search.getObjects([link], client)
    if (isEmpty(results)) throw new Error(`identity not found with link: ${link}`)

    return results[0]
  },

  async getMasterAuthorKey({pub, importedFrom}) {
    let table = 'rl_tradle_PubKey'
    let query = `query {
      ${table}(
        limit:1
        orderBy: {
          property: _time,
          desc: true
        }
        filter:{
          EQ: {
            pub: "${pub}",
            importedFrom: "${importedFrom}"
          },
        }
      ) {
        edges {
          node {
            permalink
          }
        }
      }
    }`
    let data = await this.execute({query, table})
    if (data.result  &&  data.result.edges.length)
      return data.result.edges[0].node.permalink
  },

  async execute(params) {
    if (useApollo)
      return this.executeApollo(params)
    var {query, table, versionId, allow} = params

    let variables
    if (versionId)
      variables = { modelsVersionId: versionId }
    else if (table.indexOf('Asset') !== -1)
      debugger

    if (allow) {
      if (!variables)
        variables = {}
      variables.allow = allow
    }

    // debugger
    const rawBody = { query }
    if (variables) rawBody.variables = variables
    const body = tradleUtils.stringify(rawBody)

    let obj = {
        [TYPE]: 'tradle.GraphQLQuery',
        body,
        _time: Date.now()
      }
    let { _masterAuthor } = utils.getMe()
    if (_masterAuthor)
      extend(obj, {_masterAuthor})

    const result = await this.meDriver.sign({
      object: obj
    })
    // const result = await this.meDriver.sign({ object })


    const headers = {
      'x-tradle-auth': JSON.stringify(omit(result.object, ['body', TYPE]))
    }
    let client = new GraphQLClient(this.graphqlEndpoint, { headers })

    try {
      let data = await client.rawRequest(query, variables)
      if (data.data) {
        // if (data.data[table].objects)
        //   data.data[table].objects = data.data[table].objects.filter(r => r !== null)
        return {result: data.data[table]}
      }
      else
        return {error: JSON.stringify(data.errors  &&  data.errors || data)}
    } catch (error) {
      console.log(error)
// debugger
      return { error }
    }
  }
}

// const neuter = obj => utils.omitVirtual(utils.sanitize(obj))
const getFirstNode = result => getPropertyAtPath(result, ['edges', '0', 'node'])

module.exports = search
