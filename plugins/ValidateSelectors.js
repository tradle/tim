import { cloneDeep } from 'lodash'
import { TYPE, ROOT_HASH } from '@tradle/constants'
import {
  getModel,
  getPropertiesWithAnnotation,
  getEditCols,
  getId,
  getType,
  ungroup,
  isEmpty,
  isEnum,
  isSubclassOf,
  isInlined,
  getRootHash
} from '../utils/utils'

const MONEY = 'tradle.Money'
const BOOKMARK = 'tradle.Bookmark'
const ASSET = 'tradle.Asset'

module.exports = function ValidateSelector ({ models }) {
  return {
    validateForm: async function validateForm ({
      application,
      form,
      search
    }) {
      let ftype = form[TYPE]
      if (!application  &&  form[TYPE] !== BOOKMARK && !isSubclassOf(ftype, ASSET))
        return
      let m = this.models[form[TYPE]]
      if (!m)
        return
      const show = getPropertiesWithAnnotation(m, 'showIf')

      const hide = getPropertiesWithAnnotation(m, 'hideIf')

      const set = getPropertiesWithAnnotation(m, 'set')
      if (isEmpty(show)  &&  isEmpty(hide)  &&  isEmpty(set))
        return
      let editCols = m.editCols
      if (!editCols)
        editCols = getEditCols(m).map(p => p.name)
      else
        editCols = editCols.slice()
      let exclude = []
      let ungrouped = ungroup({model: m, viewCols: editCols, edit: true})

      let resource = normalizeEnums({ form })

      let keys = Object.keys(resource)
      let values = Object.values(resource)
      let props = m.properties
      for (let p in props) {
        if (!form[p]) {
          keys.push(p)
          values.push(null)
        }
      }

      for (let p in show) {
        let prop = show[p]
        let formula = normalizeFormula({ formula: prop.showIf })
        let showF = new Function(...keys, `return ${formula}`);
        try {
          let doShow = showF(...values)
          if (typeof doShow === 'string'  &&  !doShow.length)
            doShow = false
          // let doShow = eval(prop.showIf)
          let inCols = ungrouped.includes(prop.name)
          if (doShow) {
            if (!inCols)
              editCols.push(prop.name)
          }
          else {
            // cleanup if was previously set
            delete form[prop.name]
            exclude.push(prop.name)
          }
        } catch (err) {
          // debugger
          if (err.message.endsWith(' is not defined'))
            exclude.push(prop.name)
          continue
        }
      }

      for (let p in hide) {
        let prop = hide[p]
        // let doHide = !eval(prop.hideIf)
        let formula = normalizeFormula({ formula: prop.hideIf })
        let hideF = new Function(...keys, `return ${formula}`);
        try {
          let doHide = hideF(...values)
          if (typeof doHide === 'string'  &&  !doHide.length)
            doHide = true
          let inCols = ungrouped.includes(prop.name)
          if (!doHide)
            continue
          if (!inCols)
            continue
          let idx = editCols.indexOf(prop.name)
          if (idx !== -1)
            editCols.splice(idx, 1)
          else
            exclude.push(prop.name)
        } catch (err) {
          // debugger
          continue
        }
      }
      let newValues = {}
      for (let p in set) {
        let prop = set[p]
        let formula = normalizeFormula({ formula: prop.set })
        let setF = new Function(...keys, `return ${formula}`);
        let deps = getVariables(formula, props)
        let dontSet = await findResourceTypeValues({deps, props, form, keys, values, search})
        if (dontSet)
          continue
        let val
        try {
          let v = values.slice()
          for (let i=0; i<v.length; i++) {
            let key = keys[i]
            if (key.charAt(0) === '_')
              continue
            let pr = props[key]
            if (!pr  ||  v[i])
              continue
            if (pr.ref === MONEY)
              v[i] = { value: 0 }
            else if (pr.type === 'number')
              v[i] = 0
            else if (pr.type === 'string')
              v[i] = ''
          }
          val = setF(...v)
        } catch (err) {
          val = null
        }
        let vidx = keys.indexOf(p)
        if (!val) {
          if (val !== false || prop.type !== 'boolean') {
            values[vidx] = null
            if (!form[p]  &&  prop.readOnly) {
              let idx = editCols.indexOf(prop.name)
              if (idx !== -1)
                editCols.splice(idx, 1)
              else
                exclude.push(prop.name)
              continue
            }
          }
          delete form[p]
          continue
        }
        if (props[p].type !== 'object') {
          form[p] = val
          values[vidx] = val
          newValues[p] = val
          continue
        }
        if (typeof val !== 'string') {
          let ptype = prop.type
          if (typeof val === 'object'  ||  ptype !== 'object') {
            form[p] = val
            values[vidx] = val
            newValues[p] = val
            continue
          }
        }
        let { ref } = props[p]
        if (ref === MONEY) {
          const vars = getVariables(formula, props)
          for (let i=0; i<vars.length; i++) {
            let pName = vars[i]
            let prop = props[pName]
            if (prop.type === 'array') {
              let currency
              // find currency in the items that the property value was calculated with
              let f = form[pName][0]
              for (let c in f) {
                if (typeof f[c] === 'object' && f[c].currency) {
                  currency = f[c].currency
                  break
                }
              }
              form[p] = {
                value: val,
                currency
              }
              continue
            }
            if (!form[pName] || prop.ref !== MONEY)
              continue
            form[p] = {
              value: val,
              currency: form[pName].currency
            }
            values[vidx] = form[p]
            newValues[p] = form[p]
          }
          continue
        }
        let m = getModel(ref)
        if (!m.enum) {
          console.log(`formula could be assigned to primitive types or enums for now`)
          continue
        }
        let v = m.enum.find(e => e.id === val)
        if (!v) {
          console.log(`formula ${formula} is incorrect`)
          continue
        }
        let id = `${ref}_${v.id}`
        let oldVal = form[p]
        if (oldVal  &&  oldVal.id == id)
          continue

        val = {
          id,
          title: v.title
        }
        form[p] = val
        values[vidx] = val
        newValues[p] = val
        let idx = editCols.indexOf(prop.name)
        if (idx !== -1)
          editCols.splice(idx, 1)
        else
          exclude.push(prop.name)
      }

      if (exclude.length) {
        let props = m.properties
        editCols.forEach(p => {
          if (!p.endsWith('_group'))
            return
          let list = props[p].list
          if (!list)
            return
          let excludeGroupProps = !list.find(r => !exclude.includes(r))
          if (excludeGroupProps)
            exclude.push(props[p].name)
        })
      }

      let requestedProperties = []
      editCols.forEach(p => {
        if (!exclude.includes(p))
          requestedProperties.push({name: p})
      })
      return !form[TYPE].endsWith('.Quote') && {
        requestedProperties,
        excludeProperties: exclude.length && exclude
      }
    }
  }
}
function normalizeEnums({ form }) {
  let resource = cloneDeep(form)
  let model = getModel(resource[TYPE])
  let props = model.properties
  for (let p in resource) {
    if (!props[p]) continue
    let { ref } = props[p]
    if (ref) {
      if (!isEnum(ref)) continue
      resource[p] = resource[p].id.split('_')[1]
      continue
    }
    if (!props[p].items  ||  !props[p].items.ref)
      continue

    ref = props[p].items.ref
    if (!isEnum(ref)) continue

    resource[p] = resource[p].map(r => r.id.split('_')[1])
  }

  return resource
}
async function findResourceTypeValues({deps, props, form, keys, values, search}) {
  let propToForm = {}
  let promises = []
  let vals = []
  for (let i=0; i<deps.length; i++) {
    let dep = deps[i]
    if (!form[dep])
      continue
    if (props[dep].type !== 'object' &&  props[dep].type !== 'array')
      continue
    let ref = props[dep].ref || props[dep].items.ref
    if (isEnum(ref) || isInlined(getModel(ref)))
      continue
    if (props[dep].type === 'object') {
      // Do not try to set value for the formula for which value didn't change
      return form[dep] && !form[dep][ROOT_HASH]
      // if (form[dep] && !form[dep][ROOT_HASH]) {
      //   if (!propToForm[dep])
      //     propToForm[dep] = form[dep]
      //   let fkey = getId(form[dep])
      //   if (forms[fkey])
      //     continue
      //   // let result = await getItem({resource: form[dep], noTrigger: true})

      //   let { list } = await search({modelName: getType(form[dep]), filterResource: {_permalink: getRootHash(form[dep])}, noTrigger: true})

      //   vals.push(list[0])
      // }
    }
    if (props[dep].type === 'array') {
      propToForm[dep] = []
      let arr = form[dep]
      if (!arr.find(r => !r[ROOT_HASH]))
        vals = arr
      else {
        // Do not try to set value for the formula for which items didn't change
        if (!arr.find(r => r[ROOT_HASH]))
          return true

        let { list } = await search({modelName: ref, noTrigger: true})

        for (let j=0; j<arr.length; j++) {
          let f = arr[j]
          if (!f[ROOT_HASH]) {
            if (!propToForm[dep])
              propToForm[dep].push(f)
            let rootHash = getRootHash(f)
            let result = list.find(l => getRootHash(l) === rootHash)
            // let result = await getItem({resource: f, noTrigger: true})
            vals.push(result)
          }
        }
      }
    }
    if (vals.length) {
      // let vals = await Promise.all(promises)
      deps.forEach(dep => {
        if (props[dep].type !== 'object' &&  props[dep].type !== 'array')
          return
        if (props[dep].type === 'object') {
          if (form[dep] && !form[dep][ROOT_HASH]) {
            let fkey = getId(form[dep])
            let f = vals.filter(v => getId(v) === fkey)
            if (f) {
              let idx = keys.indexOf(dep)
              values[idx] = f
              form[dep] = f
            }
          }
        }
        else if (props[dep].type === 'array') {
          let arrIds = form[dep].map(a => getId(a))
          let arr = vals.filter(v => arrIds.find(aId => getId(v) === aId))
          if (arr.length) {
            let idx = keys.indexOf(dep)
            form[dep].forEach((f, i) => {
              if (!f[ROOT_HASH]) {
                form[dep][i] = arr.find(a => getId(a) === f.id)
              }
            })
            values[idx] = form[dep]
          }
        }
      })
    }
  }
}
function normalizeFormula({ formula }) {
  return formula.replace(/\s=\s/g, ' === ').replace(/\s!=\s/g, ' !== ')
}
function getVariables(formula, props) {
  const re = /[a-z_]\w*(?!\w*\s*\()/ig
  let vars = formula.match(re)
  let propsOnly = vars.filter(v => props[v])
  if (!propsOnly.length)
    return propsOnly
  let filtered = []
  propsOnly.forEach(p => {
    if (filtered.indexOf(p) === -1)
      filtered.push(p)
  })
  return filtered
}
/*
        let propToForm = {}
        let vals = []
        for (let i=0; i<deps.length; i++) {
          let dep = deps[i]
          if (props[dep].type !== 'object' &&  props[dep].type !== 'array')
            return
          let ref = props[dep].ref || props[dep].items.ref
          if (isEnum(ref))
            return
          if (props[dep].type === 'object') {
            if (form[dep] && !form[dep][ROOT_HASH]) {
              if (!propToForm[dep])
                propToForm[dep] = form[dep]
              let fkey = getId(form[dep])
              if (forms[fkey])
                return
              let result = await getItem({resource: form[dep], noTrigger: true})
              vals.push(result)
            }
          }
          if (props[dep].type === 'array') {
            if (form[dep])
              propToForm[dep] = []
            let arr = form[dep]
            for (let j=0; j<arr.length; j++) {
              let f = arr[j]
              if (!f[ROOT_HASH]) {
                if (!propToForm[dep])
                  propToForm[dep].push(f)
                let fkey = getId(f)
                if (forms[fkey])
                  return
                let result = await getItem({resource: f, noTrigger: true})
                vals.push(result)
              }
            }
          }
          if (vals.length) {
            // let vals = await Promise.all(promises)
            deps.forEach(dep => {
              if (props[dep].type !== 'object' &&  props[dep].type !== 'array')
                return
              if (props[dep].type === 'object') {
                if (form[dep] && !form[dep][ROOT_HASH]) {
                  let fkey = getId(form[dep])
                  let f = vals.filter(v => getId(v) === fkey)
                  if (f) {
                    let idx = keys.indexOf(dep)
                    values[idx] = f
                    form[dep] = f
                  }
                }
              }
              else if (props[dep].type === 'array') {
                let arrIds = form[dep].map(a => getId(a))
                let arr = vals.filter(v => arrIds.find(aId => getId(v) === aId))
                if (arr.length) {
                  let idx = keys.indexOf(dep)
                  form[dep].forEach((f, i) => {
                    if (!f[ROOT_HASH]) {
                      form[dep][i] = arr.find(a => getId(a) === f.id)
                    }
                  })
                  values[idx] = form[dep]
                }
              }
            })
          }
        }
*/
