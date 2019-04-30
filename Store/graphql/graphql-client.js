'use strict'

import omit from 'lodash/omit'
import isEmpty from 'lodash/isEmpty'
import getPropertyAtPath from 'lodash/get'
// import gql from 'graphql-tag'
import { utils as tradleUtils } from '@tradle/engine'
// import { ApolloClient, createNetworkInterface } from 'apollo-client'
import { GraphQLClient } from 'graphql-request'
import constants from '@tradle/constants'
// import { print as printQuery } from 'graphql/language/printer'
import utils from '../../utils/utils'
const {
  TYPE,
  SIG,
  ROOT_HASH,
  CUR_HASH,
} = constants

const { MONEY, ORGANIZATION, MESSAGE, MODEL } = constants.TYPES
const PHOTO = 'tradle.Photo'
const COUNTRY = 'tradle.Country'
const PUB_KEY = 'tradle.PubKey'
const APPLICATION = 'tradle.Application'
const APPLICATION_SUBMISSION = 'tradle.ApplicationSubmission'
const NETWORK_FAILURE = 'Failed to fetch'
const INVALID_QUERY = 'Syntax Error GraphQL request'

const MAX_ATTEMPTS = 3

var messageMap = {
  [NETWORK_FAILURE]: 'networkFailure',
  [INVALID_QUERY]: 'invalidQuery'
}
const useApollo = false
var search = {
  initClient(meDriver, url) {
    // debugger
    // if (useApollo)
    //   return this.initClientApollo(meDriver, url)
    // else
      return this.initClientGraphQLRequest(meDriver, url)
  },

  // initClientApollo(meDriver, url) {
  //   // let graphqlEndpoint
  //   // let orgId = me.organization.id
  //   // let url = me.organization.url
  //   // if (!url)
  //   //   url =  SERVICE_PROVIDERS.filter((sp) => sp.org === orgId)[0].url
  //   // if (url)
  //   let graphqlEndpoint = `${url.replace(/[/]+$/, '')}/graphql`
  //   // else
  //   //   graphqlEndpoint = `${ENV.LOCAL_TRADLE_SERVER.replace(/[/]+$/, '')}/graphql`
  //   if (!graphqlEndpoint)
  //     return

  //   // graphqlEndpoint = `http://localhost:21012/graphql`
  //   const networkInterface = createNetworkInterface({
  //     uri: graphqlEndpoint
  //   })

  //   networkInterface.use([{
  //     applyMiddleware: async (req, next) => {
  //       const body = tradleUtils.stringify({
  //         ...req.request,
  //         query: printQuery(req.request.query)
  //       })

  //       const result = await meDriver.sign({
  //         object: {
  //           [TYPE]: 'tradle.GraphQLQuery',
  //           body,
  //           _time: Date.now()
  //         }
  //       })

  //       if (!req.options.headers) {
  //         req.options.headers = {}
  //       }

  //       req.options.headers['x-tradle-auth'] = JSON.stringify(omit(result.object, ['body', TYPE]))
  //       next()
  //     }
  //   }])

  //   // networkInterface.useAfter([
  //   //   {
  //   //     applyAfterware(result, next) {
  //   //       const { response } = result
  //   //       if (response.status > 300) {
  //   //         const err = Error('request failed')
  //   //         err.status = response.status
  //   //         err.statusText = response.statusText
  //   //         err.response = response
  //   //         throw err
  //   //       }

  //   //       next()
  //   //     }
  //   //   }
  //   // ])

  //   return new ApolloClient({ networkInterface })
  // },

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
         endCursor, properties, select, excludeProps} = params

    if (filterResource  &&  !Object.keys(filterResource).length)
      filterResource = null

    let table = `rl_${modelName.replace(/\./g, '_')}`
    let model = utils.getModel(modelName)
    let versionId = model._versionId
    let version = versionId ? '($modelsVersionId: String!)' : ''
    let query = `query ${version} {\n${table}\n`
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
        // if (!props[p]  ||  p.charAt(0) === '_')
        //   continue
        let val = filterResource[p]
        // if (p === TYPE) {
        //   if (!Array.isArray(val))
        //     continue
        //   else {
        //     let s = `${p}: [`
        //     val.forEach((r, i) => {
        //       if (i)
        //         s += ', '
        //       s += `"${r}"`
        //     })
        //     s += ']'
        //     inClause.push(s)
        //   }
        // }

        // if (p.charAt(0) === '_')
        //   debugger
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
              op.EQ += `\n   ${p}: "${val}",`
          }
          else if (p.indexOf('.') !== -1  &&  props[p.split('.')[0]]) {
            p = p.replace('.', '__')
            op.EQ += `\n   ${p}: "${val}",`
          }
          continue
        }
        else if (props[p].type === 'string') {
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
          else if (!val  ||  !val.trim().length)
            continue
          let len = val.length
          if (val.indexOf('*') === -1)
            op.EQ += `\n   ${p}: "${val}",`
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
          else if (val === null)
            op.NULL += `\n ${p}: true`
          else
            op.NEQ += `\n   ${p}: true,`
        }
        else if (props[p].type === 'number')
          this.addEqualsOrGreaterOrLesserNumber(val, op, props[p])

        else if (props[p].type === 'object') {
          // if (Array.isArray(val)) {
          //   let s = `${p}: [`
          //   val.forEach((r, i) => {
          //     if (i)
          //       s += ', '
          //     s += `{id: "${utils.getId(r)}", title: "${utils.getDisplayName(r)}"}`
          //   })
          //   s += ']'
          //   inClause.push(s)
          // }
          if (Array.isArray(val)) {
            if (!val.length)
              continue
            let isEnum = props[p].ref  &&  utils.isEnum(props[p].ref)
            if (isEnum) {
              let s = `${p}__id: [`
              val.forEach((r, i) => {
                if (i)
                  s += ', '
                s += `"${r.id}"`
              })
              s += ']'
              inClause.push(s)
            }
            else {
              let s = `${p}___permalink: [`
              val.forEach((r, i) => {
                if (i)
                  s += ', '
                s += `"${r[ROOT_HASH]}"`
              })
              s += ']'
              inClause.push(s)
            }
          }
          else {
            if (props[p].ref === MONEY) {
              let {value, currency} = val
              op.EQ += `\n  ${p}__currency: "${currency}",`
              if (val.value)
                addEqualsOrGreaterOrLesserNumber(value, op, props[p])
            }
            else {
              op.EQ += `\n   ${p}___permalink: "${val[ROOT_HASH]}",`
            }
          }
        }
        else if (props[p].type === 'array') {
          if (props[p].items.ref) {
            if (!val.length)
              continue
            let s = `${p}___permalink: [`
            val.forEach((r, i) => {
              if (i)
                s += ', '
              s += `"${r[ROOT_HASH]}"`
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

    let error, retry = true
    for (let attemptsCnt=0; attemptsCnt<MAX_ATTEMPTS  &&  retry; attemptsCnt++) {
      let data = await this.execute({client, query, table, versionId})
      if (data.result) {
        return { result:  data.result }
      }
      ({ error='',  excludeProps={}, retry=true } = await this.checkError(data, model))
      if (excludeProps.length) {
        params.excludeProps = excludeProps
        return await this.searchServer(params)
      }
      if (error  &&  error === NETWORK_FAILURE  ||  !retry)
        break

    //   let message, graphQLErrors, networkError
    //   if (useApollo) {
    //     ({ message, graphQLErrors, networkError } = data.error)
    //   }
    //   else {
    //     if (data.error.response) {
    //       graphQLErrors = data.error.response.errors
    //       message = INVALID_QUERY
    //     }
    //     else {
    //       graphQLErrors = []
    //       if (data.error.message === 'Failed to fetch') {
    //         error = NETWORK_FAILURE
    //         break
    //       }
    //       else
    //         message = data.error.message
    //     }
    //   }
    //   // let { message, graphQLErrors, networkError } = data.error
    //   if (graphQLErrors  &&  graphQLErrors.length) {
    //     let excludeProps = []
    //     let str = 'Cannot query field \"'
    //     let len = str.length
    //     graphQLErrors.forEach(err => {
    //       if (err.path) {
    //         let prop
    //         for (let i=err.path.length - 1  &&  !prop; i>=0; i--) {
    //           let p = err.path[i]
    //           if (props[p])
    //             prop = p
    //         }
    //         excludeProps.push(prop)
    //         return
    //       }
    //       let msg = err.message
    //       let idx = msg.indexOf(str)
    //       if (idx !== 0)
    //         return
    //       idx = msg.indexOf('\"', len)
    //       excludeProps.push(msg.substring(len, idx))
    //     })
    //     if (excludeProps.length) {
    //       params.excludeProps = excludeProps
    //       return await this.searchServer(params)
    //     }
    //     else {
    //       debugger
    //       return
    //     }
    //   }
    //   if (networkError  &&  networkError.message === NETWORK_FAILURE) {
    //     error = NETWORK_FAILURE
    //     break
    //   }
    //   retry = false
    //   if (message.indexOf(INVALID_QUERY) === 0)
    //     message = INVALID_QUERY
    //   else
    //     debugger
    //   await utils.submitLog(true)
    //   error = message
    }

    console.log(error)
    return { error: messageMap[error] || error, retry }
      // throw error

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
                // # _author: "3c67687a96fe59d8f98b1c90cc46f943b938d54cda852b12fb1d43396e28978a"
                // # _inbound: false
                // # _recipient: ${hash}
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
      // let result = await client.query({
      //     fetchPolicy: 'network-only',
      //     errorPolicy: 'all',
      //     query: gql(`${query}`),
      //     variables: filterResource || context ? null : {context: context}
      //   })
      return result  &&  result.result
    } catch (err) {
      debugger
    }

  },
  getSearchProperties(params) {
    let {model, inlined, properties, backlink} = params
    let props = backlink ? {[backlink.name]: backlink} : model.properties

    let arr
    if (utils.isInlined(model))
      arr = [] //[TYPE] //, '_link', '_permalink']
    else {
      arr = ['_permalink', '_link', '_time', '_author', '_org', '_authorTitle', '_time']
      if (model.id !== PUB_KEY  &&  !inlined) {
        let newarr = arr.concat(TYPE, SIG)
        arr = newarr
      }
      if (model.abstract)
        return arr
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
  addProps({isList, backlink, props, currentProp, arr, model, excludeProps}) {
    if (!arr)
      arr = []
    let isApplication = model  &&  model.id === APPLICATION
    for (let p in props) {
      if (excludeProps  &&  excludeProps.indexOf(p) !== -1)
        continue
      if (p.charAt(0) === '_')
        continue
      if (p === 'from' || p === 'to' || p === '_time'  ||  p.indexOf('_group') !== -1)
        continue
      let prop = props[p]
      if (prop.displayAs)
        continue
      let ptype = prop.type
      if (ptype === 'array') {
        this.addArrayProperty({prop, model, arr, isList, backlink, currentProp})
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
        arr.push(this.addInlined(prop))
      else {
        arr.push(this.addRef(prop))
        // // HACK
        // let add = model  &&  (model.id !== 'tradle.PhotoID'  ||  prop.name !== 'sex') &&  (model.id !== 'tradle.FormError'  ||  prop.name !== 'status')
        // if (add)
        //   arr.push(this.addRef(prop))
      }
    }
    return arr
  },
  addArrayProperty({prop, model, arr, isList, backlink, currentProp}) {
    let p = prop.name
    let isApplication = model  &&  model.id === APPLICATION
    if (p === 'verifications')
      return

    if (isApplication) {
      if (isList  &&  p !== 'relationshipManagers')
        return
      if (!backlink  &&  prop.items.ref === APPLICATION_SUBMISSION &&  p !== 'submissions')
        return
    }
    let iref = prop.items.ref
    if (iref) {
      let isInlined = iref !== MODEL  && utils.isInlined(utils.getModel(iref))

      if (prop.items.backlink  &&  !prop.inlined) { //  &&  !utils.getModel(iref).abstract) {
        if (isList  &&  !isApplication)
          return
        arr.push(`${p} {
          edges {
            node {
              ${this.getSearchProperties({model: utils.getModel(iref)})}
            }
          }
        }`)
      }
      else if (prop.inlined  ||  isInlined) {
        if (currentProp  &&  currentProp === prop)
          return
        arr.push(this.addInlined(prop))
      }
      // else if (iref === model.id) {
      //   arr.push(
      //     `${p} {
      //       ${TYPE}
      //       _permalink
      //       _link
      //       _displayName
      //     }`
      //   )
      // }
      // else if (prop.inlined)
      //   arr.push(this.addInlined(prop))
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
      let allProps = this.addProps({isList, props: prop.items.properties})
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
  addInlined(prop) {
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
      let allProps = this.getSearchProperties({model: refM, inlined: true, currentProp: prop})
      return (
        `${p} {
          ${allProps.toString().replace(/,/g, '\n')}
        }`
      )
    }
  },
  async getItem(id, client, backlink, excludeProps) {
    let parts = id.split('_')

    let modelName = parts[0]
    let model = utils.getModel(modelName)
    if (!model)
      return

    let table = `r_${modelName.replace(/\./g, '_')}`

    // let _link = parts[parts.length - 1]
    let _permalink = parts[1]
    let query = `query {\n${table} (_permalink: "${_permalink}")\n`

    let arr = this.getSearchProperties({model, backlink, excludeProps})

    query += `\n{${arr.join('   \n')}\n}\n}`
    try {
      let result = await this.execute({client, query, table})
      if (result.error  &&  !excludeProps) {
        let { excludeProps, error } = await this.checkError(result, model)
        if (excludeProps)
          return await this.getItem(id, client, backlink, excludeProps)
      }
      return result.result
    }
    catch(err) {
      console.log('graphQL._getItem', err)
      debugger
    }
  },
  async checkError(result, model) {
    let message, graphQLErrors, networkError, excludeProps
    if (useApollo) {
      ({ message, graphQLErrors, networkError } = result.error)
    }
    else {
      if (result.error.response) {
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
      excludeProps = []
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
          excludeProps.push(prop)
          return
        }

        let msg = err.message
        let idx = msg.indexOf(str)
        if (idx !== 0)
          return
        idx = msg.indexOf('\"', len)
        let field = msg.substring(len, idx)
        // check if this is the table itself that is not recognized
        if (!field.indexOf(`_${model.id.replace('.', '_')}`) === -1)
          excludeProps.push(field)
      })

      if (excludeProps.length)
        return { excludeProps }
      return { error: message, retry: message === NETWORK_FAILURE }
    }
    if (networkError  &&  networkError.message === NETWORK_FAILURE)
      return { error: NETWORK_FAILURE }

    if (message.indexOf(INVALID_QUERY) === 0)
      message = INVALID_QUERY
    await utils.submitLog(true)
    return { error: message, retry: false }
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
      // let result = await client.query({
      //   fetchPolicy: 'network-only',
      //   errorPolicy: 'all',
      //   query: gql(`${query}`)
      // })
      // return result.data[table]  &&  result.data[table].objects
    }
    catch(err) {
      console.log('graphQL._getItem', err)
      return []
      debugger
    }
  },
  getIdentity: async ({ client, _permalink, _link, pub }) => {
    if (_link) return search.getIdentityByLink({ client, link: _link })
    if (!pub) throw new Error('querying identities by _permalink is not supported at this time')

    // if (_permalink) {
    //   const id = _link ? utils.makeId('tradle.Identity', _permalink, _link) : utils.makePermId('tradle.Identity', _permalink)
    //   const result = await search._getItem(id, client)
    //   return neuter(result)
    // }

    const list = await search.searchServer({
      client,
      filterResource: { pub },
      select: ['link'],
      modelName: 'tradle.PubKey',
      noTrigger: true,
      limit: 1
    })

    if (list) {
      const pubKeyMapping = getFirstNode(list)
      if (pubKeyMapping) {
        return search.getIdentityByLink({ link: pubKeyMapping.link, client })
      }
    }

    throw new Error(`identity not found with pub: ${pub}`)
  },
  getIdentityByLink: async ({ link, client }) => {
    const results = await search.getObjects([link], client)
    if (isEmpty(results)) throw new Error(`identity not found with link: ${link}`)

    return results[0]
  },
//   async executeApollo({client, query, table, versionId}) {
// let start = Date.now()
//     try {
//       let data = await client.query({
//           fetchPolicy: 'network-only',
//           errorPolicy: 'all',
//           query: gql(`${query}`),
//           variables: versionId  &&  {modelsVersionId: versionId}
//         })
// console.log('searchServer.apollo ' + (Date.now() - start))
//       return { result: data.data[table] }
//     } catch(error) {
//       // debugger
//       console.log(error)
//       return { error }
//     }
//   },

  async execute(params) {
    if (useApollo)
      return this.executeApollo(params)
    var {query, table, versionId} = params
    // debugger
    const body = tradleUtils.stringify({
      query
    })
    let start = Date.now()
    const result = await this.meDriver.sign({
      object: {
        [TYPE]: 'tradle.GraphQLQuery',
        body,
        _time: Date.now()
      }
    })

    const headers = {
      'x-tradle-auth': JSON.stringify(omit(result.object, ['body', TYPE]))
    }
    let client = new GraphQLClient(this.graphqlEndpoint, { headers })

    let variables = versionId  &&  {modelsVersionId: versionId} || undefined
    try {
      let data = await client.rawRequest(query, variables)
      if (data.data)
        return {result: data.data[table]}
      else
        return {error: JSON.stringify(data.errors  &&  data.errors || data)}
    } catch (error) {
debugger
      return { error }
    }
  }
}

// const neuter = obj => utils.omitVirtual(utils.sanitize(obj))
const getFirstNode = result => getPropertyAtPath(result, ['edges', '0', 'node'])

module.exports = search
  // addEndCursor(params, query) {
  //   let {modelName, filterResource, limit, direction, first, noPaging} = params
  //   if (noPaging)
  //     return

  //   if (first  ||  cursor.modelName !== modelName) {
  //     cursor = {endCursor: []}
  //     return
  //   }
  //   if (!limit)
  //     return
  //   if (cursor) {
  //     if (cursor.filter) {
  //       if (!filterResource  ||  !deepEqual(filterResource,  cursor.filter))
  //         cursor = {endCursor: []}
  //     }
  //   }
  //   cursor.endCursor = cursor.endCursor || []
  //   cursor.modelName = modelName
  //   cursor.filter = filterResource || null

  //   let endCursor
  //   let len = cursor.endCursor.length
  //   if (!len)
  //     return
  //   if (direction === 'down')
  //     endCursor = cursor.endCursor[len - 1]
  //   else {
  //     if (len > 2) {
  //       cursor.endCursor.splice(len - 2, 1)
  //       cursor.endCursor.splice(len - 1, 1)
  //       len -= 2
  //     }
  //     else
  //       cursor.endCursor = []
  //     endCursor = (len - 1) ? cursor.endCursor[len - 2] : null
  //   }
  //   if (endCursor)
  //     query += `checkpoint: "${endCursor}"\n`
  //   query += `limit:  ${limit}\n`
  // }
  // async getChat1(params) {
  //   let { author, recipient, client, context, filterResource, inboundOnly, outboundOnly } = params
  //   let table = `rl_${MESSAGE.replace(/\./g, '_')}`
  //   let contextVar = filterResource || context ? '' : '($context: String)'
  //   let queryHeader =
  //      `query ${contextVar} {
  //         ${table} (
  //      `
  //   let endCursor = this.getEndCursor(params)
  //   if (endCursor)
  //     query += `checkpoint: "${endCursor}"\n`

  //   query += ` filter: {\n`
  //   let queryFooter = `
  //         }
  //         orderBy:{
  //           property: _time
  //           desc:true
  //         }
  //       )
  //       {
  //         pageInfo { endCursor }
  //         edges {
  //           node {
  //             _author
  //             _recipient
  //             _inbound
  //             originalSender
  //             object
  //             context
  //           }
  //         }
  //       }
  //     }`


  //   let eq = `
  //           EQ: {
  //             _inbound: true
  //           `
  //   if (author)
  //     eq += `              _author: "${author}"\n`

  //   let filter = ''
  //   if (filterResource) {
  //     for (let p in filterResource) {
  //       filter += '             ' + p + ': ' + `"${filterResource[p]}"\n`
  //     }
  //   }
  //   eq += filter
  //   if (context)
  //     eq += `             context: "${context}"`
  //   eq += `
  //           },
  //         `
  //   let neq = ''
  //   if (!context  &&  !filterResource) {
  //     context = null
  //     neq = `
  //           NEQ: {
  //             context: $context
  //           }
  //           `
  //   }

  //   let query = queryHeader + eq + neq + queryFooter

  //   // let query =
  //   //     `query {
  //   //         rl_tradle_Message(
  //   //         limit: 20,
  //   //         filter:{
  //   //           EQ: {
  //   //             _inbound: true
  //   //             context: "${context}"
  //   //             _author: "${author}"
  //   //           }
  //   //         },
  //   //         orderBy:{
  //   //           property: _time
  //   //           desc:true
  //   //         }
  //   //       ) {
  //   //         edges {
  //   //           node {
  //   //             _author
  //   //             _recipient
  //   //             object
  //   //           }
  //   //         }
  //   //       }
  //   //     }`
  //   let promisses = []
  //   promisses.push(client.query({
  //         fetchPolicy: 'network-only',
  //         query: gql(`${query}`),
  //       }))

  //   eq = `
  //           EQ: {
  //             _inbound: false
  //         `
  //   if (author)
  //     eq += `              _recipient: "${author}"\n`
  //   eq += filter
  //   if (context)
  //     eq += `             context: "${context}"`
  //   eq += `
  //           },
  //         `

  //   let queryOutbound = queryHeader + eq + neq + queryFooter

  //   // let queryOutbound = query.replace('_inbound: true', '_inbound: false').replace('_author', '_recipient')
  //       // `query {
  //       //     rl_tradle_Message(
  //       //     limit: 20,
  //       //     filter:{
  //       //       EQ: {
  //       //         _inbound: false
  //       //         context: "${context}"
  //       //         _recipient: "${author}"
  //       //       }
  //       //     },
  //       //     orderBy:{
  //       //       property: _time
  //       //       desc:true
  //       //     }
  //       //   ) {
  //       //     edges {
  //       //       node {
  //       //         _author
  //       //         _recipient
  //       //         object
  //       //       }
  //       //     }
  //       //   }
  //       // }`

  //   promisses.push(client.query({
  //         fetchPolicy: 'network-only',
  //         query: gql(`${queryOutbound}`),
  //         variables: filterResource || context ? null : {context: context}
  //       }))
  //   try {
  //     let all = await Promise.all(promisses)
  //     return all
  //     // let result = []
  //     // let inbound = true
  //     // let outbound = false
  //     // for (let i=0; i<2; i++) {
  //     //   let list = all[i].data[table]
  //     //   if (list.edges  &&  list.edges.length) {
  //     //     list.edges.forEach(r => {
  //     //       r.node.object._inbound = inbound
  //     //       r.node.object._outbound = outbound
  //     //       result.push(r.node)
  //     //     })
  //     //   }
  //     //   inbound = false
  //     //   outbound = true
  //     // }
  //     // // result.sort((a, b) => a._time - b._time)
  //     // return result
  //   } catch (err) {
  //     debugger
  //   }

  // },
    // function prettify (obj) {
    //   return JSON.stringify(obj, null, 2)
    // }
