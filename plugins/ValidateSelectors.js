import { cloneDeep } from 'lodash'
import { TYPE } from '@tradle/constants'
import { getModel, getPropertiesWithAnnotation, getEditCols, ungroup, isEmpty, isEnum } from '../utils/utils'

module.exports = function ValidateSelector ({ models }) {
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
      const show = getPropertiesWithAnnotation(m, 'showIf')

      const hide = getPropertiesWithAnnotation(m, 'hideIf')
      if (isEmpty(show)  &&  isEmpty(hide))
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
          else
            exclude.push(prop.name)
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
      return {
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

function normalizeFormula({ formula }) {
  return formula.replace(/\s=\s/g, ' === ').replace(/\s!=\s/g, ' !== ')
}
