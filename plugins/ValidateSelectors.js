import { TYPE } from '@tradle/constants'
import { getModel, getPropertiesWithAnnotation, getEditCols, ungroup, isEmpty } from '../utils/utils'

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

      let keys = Object.keys(form)
      let values = Object.values(form)

      for (let p in show) {
        let prop = show[p]
        let showF = new Function(...keys, `return ${prop.showIf}`);
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
        let hideF = new Function(...keys, `return ${prop.hideIf}`);
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