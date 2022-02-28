import { TYPE } from '@tradle/constants'
import { getModel } from '../utils/utils'
import extend from 'lodash/extend'

const QUOTATION_DETAILS = '.QuotationDetails'

module.exports = function LeasingQuotes ({ models }) {
  return {
    validateForm: function validateForm ({
      application,
      form
    }) {
      const ftype = form[TYPE]
      if (!application || ftype.indexOf(QUOTATION_DETAILS) === -1)
        return
      let m
      try {
        m = getModel(ftype)
      } catch (e) {
        return
      }

      let requestedProperties
      if (!form.term) {
        requestedProperties = [{name: 'term'}]
        return { requestedProperties }
      }

      let terms = form.terms
      if (!terms) return []

      let termId = form.term.id
      let term = terms.find(t => t.term.id === termId)

      extend(form, term)

      if (m.editCols) {
        requestedProperties = m.editCols.map(p => {
            return { name: p }
          })
      }
      return { requestedProperties } || []
    }
  }
}
