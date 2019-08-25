import { TYPE } from '@tradle/constants'
import { getModel, getPropertiesWithAnnotation, getEditCols, ungroup, isEmpty } from '../utils/utils'

const CHECK_OVERRIDE = 'tradle.CheckOverride'

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
          // let doShow = eval(prop.showIf)
          let inCols = ungrouped.indexOf(prop.name) !== -1
          if (doShow  &&  !inCols)
            editCols.push(prop.name)
        } catch (err) {
          // debugger
          continue
        }
      }

      for (let p in hide) {
        let prop = hide[p]
        // let doHide = !eval(prop.hideIf)
        let hideF = new Function(...keys, `return ${prop.hideIf}`);
        try {
          let doHide = hideF(...values)
          let inCols = ungrouped.indexOf(prop.name) !== -1
          if (doHide  &&  inCols) {
            let idx = editCols.indexOf(prop.name)
            if (idx !== -1)
              editCols.splice(idx, 1)
            else
              exclude.push(prop.name)
          }
        } catch (err) {
          // debugger
          continue
        }
      }

      let requestedProperties = []
      editCols.forEach(p => {
        if (exclude.indexOf(p) === -1)
          requestedProperties.push({name: p})
      })
      return {
        requestedProperties,
        exclude
      }
    }
  }
}
