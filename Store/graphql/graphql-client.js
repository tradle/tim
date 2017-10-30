'use strict'

import utils from '../../utils/utils'
const gql = require('graphql-tag')
var deepEqual = require('deep-equal')
const tradle = require('@tradle/engine')
const tradleUtils = tradle.utils

const { ApolloClient, createNetworkInterface } = require('apollo-client')

var constants = require('@tradle/constants');
const {
  TYPE,
  SIG,
  ROOT_HASH,
  CUR_HASH,
  PREV_HASH
} = constants

const { MONEY, ENUM, ORGANIZATION, FORM } = constants.TYPES
const PHOTO = 'tradle.Photo'
const COUNTRY = 'tradle.Country'
const PUB_KEY = 'tradle.PubKey'
var cursor = {}

var search = {
  initClient(meDriver, url) {
    // let graphqlEndpoint
    // let orgId = me.organization.id
    // let url = me.organization.url
    // if (!url)
    //   url =  SERVICE_PROVIDERS.filter((sp) => sp.org === orgId)[0].url
    // if (url)
    let graphqlEndpoint = `${url.replace(/[/]+$/, '')}/graphql`
    // else
    //   graphqlEndpoint = `${ENV.LOCAL_TRADLE_SERVER.replace(/[/]+$/, '')}/graphql`
    if (!graphqlEndpoint)
      return

    // graphqlEndpoint = `http://localhost:21012/graphql`
    const networkInterface = createNetworkInterface({
      uri: graphqlEndpoint
    })

    networkInterface.use([{
      applyMiddleware: async (req, next) => {
        const printer = require('graphql/language/printer')
        const body = tradleUtils.stringify({
          ...req.request,
          query: printer.print(req.request.query)
        })

        const { sig } = await meDriver.sign({
          object: {
            [TYPE]: 'tradle.GraphQLQuery',
            body,
            // time: Date.now()
          }
        })

        if (!req.options.headers) {
          req.options.headers = {}
        }

        req.options.headers['x-tradle-sig'] = sig
        next()
      }
    }])

    return new ApolloClient({ networkInterface })
  },

  async searchServer(params) {
    let self = this
    let {client, modelName, filterResource, sortProperty, asc, limit, direction, first, notArchive, noCursorChange} = params
    if (filterResource  &&  !Object.keys(filterResource).length)
      filterResource = null

    let table = `rl_${modelName.replace(/\./g, '_')}`
    let query = `query {\n${table}\n`
    let model = utils.getModel(modelName).value
    let props = model.properties
    let inClause = []
    let op = {
      CONTAINS: '',
      EQ: '',
      NEQ: '',
      STARTS_WITH: '',
      GT: '',
      GTE: '',
      LT: '',
      LTE: '',
    }
    let exclude = [ROOT_HASH, CUR_HASH, TYPE]
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
        }
        if (props[p].type === 'string') {
          let len = val.length
          if (val.indexOf('*') === -1)
            op.EQ += `\n   ${p}: "${val}",`
          else if (len > 1) {
            if (val.charAt(0) === '*')
              op.STARTS_WITH = `\n   ${p}: "${val.substring(1)}",`
            else if (val.charAt(len - 1) === '*')
              op.CONTAINS = `\n   ${p}: "${val.substring(1, len - 1)}",`
          }
        }
        else if (props[p].type === 'boolean') {
          if (val)
            op.EQ += `\n   ${p}: ${val},`
          else
            op.NEQ += `\n   ${p}: true,`
        }
        else if (props[p].type === 'number')
          self.addEqualsOrGreaterOrLesserNumber(val, op, props[p])

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
            let s = `${p}__id: [`
            val.forEach((r, i) => {
              if (i)
                s += ', '
              s += `"${utils.getId(r)}"`
            })
            s += ']'
            inClause.push(s)
          }
          else {
            if (props[p].ref === MONEY) {
              let {value, currency} = val
              op.EQ += `\n  ${p}__currency: "${currency}",`
              if (val.value)
                addEqualsOrGreaterOrLesserNumber(value, op, props[p])
            }
            else {
              op.EQ += `\n   ${p}__id: "${val.id}",`
            }
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
    let hasFilter = qq.length
    if (!noCursorChange) {
      if (first  ||  cursor.modelName !== modelName) {
        cursor = {endCursor: []}
      }
      if (limit) {
        if (cursor) {
          if (cursor.filter) {
            if (!filterResource  ||  deepEqual(filterResource,  cursor.filter))
              cursor = {endCursor: []}
          }
        }
        cursor.endCursor = cursor.endCursor || []
        cursor.modelName = modelName
        cursor.filter = filterResource || null

        let endCursor
        let len = cursor.endCursor.length
        if (len) {
          if (direction === 'down')
            endCursor = cursor.endCursor[len - 1]
          else {
            if (len > 2) {
              cursor.endCursor.splice(len - 2, 1)
              cursor.endCursor.splice(len - 1, 1)
              len -= 2
            }
            else
              cursor.endCursor = []
            endCursor = (len - 1) ? cursor.endCursor[len - 2] : null
          }
        }
        else
          endCursor = null
        if (endCursor)
          query += `after: "${endCursor}"\n`
        query += `first: ${limit}\n`
      }
    }
    if (hasFilter)
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
    // if (limit)
    //   query += `, limit: ${limit}`
    query += ')'
    query += `\n{\n`
    query += `pageInfo {\n endCursor\n}\n`
    query += `edges {\n node {\n`

    let arr = this.getAllPropertiesForServerSearch(model)

    query += `${arr.join('   \n')}`
    query += `\n}`   // close 'node'
    query += `\n}`   // close 'edges'
    query += `\n}`   // close properties block
    query += `\n}`   // close query

    try {
      let data = await client.query({
          fetchPolicy: 'network-only',
          query: gql(`${query}`),
        })
      let result = data.data[table]
      if (!noCursorChange) {
        let endCursor = result.pageInfo.endCursor
        if (endCursor) {
          // if (!params.direction  ||  params.direction === 'down') {
            let hasThisCursor = cursor.endCursor.some((c) => c === endCursor)
            if (!hasThisCursor)
              cursor.endCursor.push(endCursor)
          // }
        }
      }
      if (!result.edges.length) {
        // this.trigger({action: 'list', resource: filterResource, isSearch: true, direction: direction, first: first})
        return
      }
      //   // if (result.edges.length < limit)
      //   //   cursor.endCursor = null
      // let to = this.getRepresentative(utils.getId(me.organization))
      // let toId = utils.getId(to)
      // let list = result.edges.map((r) => this.convertToResource(r.node))
      // if (!noTrigger)
      //   this.trigger({action: 'list', list: list, resource: filterResource, direction: direction, first: first})
      return result.edges
    } catch(error) {
      // debugger
      console.error(error)
    }

    function prettify (obj) {
      return JSON.stringify(obj, null, 2)
    }
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
  getAllPropertiesForServerSearch(model) {
    let props = model.properties
    let arr
    if (model.inlined)
      arr = []
    else {
      arr = ['_permalink', '_link', '_time', '_author', '_authorTitle', '_virtual', 'time']
      if (model.id !== PUB_KEY) {
        let newarr = arr.concat(TYPE, SIG)
        arr = newarr
      }
    }

    for (let p in props) {
      if (p.charAt(0) === '_')
        continue
      if (p === 'from' || p === 'to' || p === 'time'  ||  p.indexOf('_group') !== -1)
        continue
      let prop = props[p]
      if (prop.displayAs)
        continue
      let ptype = prop.type
      if (ptype === 'array') {
        // HACK
        if (p === 'verifications')
          continue
        let iref = prop.items.ref
        if (iref) {
          if (iref === model.id) {
            arr.push(
              `${p} {
                id
              }`
            )
          }
          else if (prop.inlined)
            arr.push(this.addInlined(prop))
          else
            arr.push(
              `${p} {
                id
                title
              }`
            )
        }

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

      if (prop.inlined)
        arr.push(this.addInlined(prop))
      else
        arr.push(this.addRef(prop))
    }
    return arr
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

    if (ref === COUNTRY) {//   ||  ref === CURRENCY)
      return (
        `${p} {
          id
          title
        }`
      )
    }
    let m = utils.getModel(ref).value
    if (m.subClassOf === ENUM) {
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
      let mprops = m.properties
      return (
        `${p} {${this.getAllPropertiesForServerSearch(m)}}`
      )
    }
    return (
      `${p} {
        id
        title
      }`
    )
  },
  addInlined(prop) {
    let ref = prop.type === 'array' ? prop.items.ref : prop.ref
    let p = prop.name
    let refM = utils.getModel(ref).value
    if (ref === FORM  ||  refM.isInterface  ||  refM.subClassOf === ENUM) {
      if (prop.range === 'json')
        return p
      else
        return (
          `${p} {
            id
            title
          }`
        )
    }
    else {
      let allProps = this.getAllPropertiesForServerSearch(refM)
      return (
        `${p} {
          ${allProps.toString().replace(/,/g, '\n')}
        }`
      )
    }
  },
  async _getItem(id, client) {
    let parts = id.split('_')

    let modelName = parts[0]
    let m = utils.getModel(modelName)
    if (!m)
      return
    m = m.value

    let table = `r_${modelName.replace(/\./g, '_')}`

    // let _link = parts[parts.length - 1]
    let _permalink = parts[1]
    let query = `query {\n${table} (_permalink: "${_permalink}")\n`

    let arr = this.getAllPropertiesForServerSearch(m)

    query += `\n{${arr.join('   \n')}\n}\n}`
    try {
      let result = await client.query({
        fetchPolicy: 'network-only',
        query: gql(`${query}`)
      })
      return result.data[table]
    }
    catch(err) {
      console.log('graphQL._getItem', err)
      debugger
    }
  },

}
module.exports = search
