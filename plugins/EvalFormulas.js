import { cloneDeep } from 'lodash'
import { TYPE } from '@tradle/constants'
import { getModel, getPropertiesWithAnnotation, getEditCols, ungroup, isEmpty, isEnum } from '../utils/utils'

module.exports = function EvalFormulas ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      if (!application)
        return
      const m = getModel(form[TYPE])
      if (!m)
        return
      const set = getPropertiesWithAnnotation(m, 'set')

      if (isEmpty(set))
        return

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
      let newValues = []

      for (let p in set) {
        let prop = set[p]
        let formula = normalizeFormula({ formula: prop.set })
        let setF = new Function(...keys, `return ${formula}`);
        let val
        try {
          val = setF(...values)
        } catch (err) {
          debugger
          continue
        }
        if (!val  &&  prop.type !== 'boolean')
          continue
        if (props[p].type !== 'object') {
          form[p] = val
          continue
        }
        if (typeof val !== 'string') {
          form[p] = val
          continue
        }
        let { ref } = props[p]
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
        newValues.push(p)
      }
      // if (newValues.length)
      //   form._newValues = newValues
      return {}
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

function normalizeFormula({ formula }) {
  return formula.replace(/\s=\s/g, ' === ').replace(/\s!=\s/g, ' !== ')
}
