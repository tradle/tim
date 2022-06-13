import Mustache from 'mustache'
import dateformat from 'dateformat'
import constants from '@tradle/constants'
import cloneDeep from 'lodash/cloneDeep'
const {
  TYPE
} = constants
const {
  MONEY
} = constants.TYPES

import {
  getModel,
  getType,
  getCurrentHash,
  formatCurrency,
  isEnum,
  translate,
} from '../../utils/utils'

const APPLICATION = 'tradle.Application'

class ReportGenerator {
  constructor({application, template, locale, getApplication, getItem}) {
    this.application = application
    this.template = template
    this.locale = locale
    this.getApplication = getApplication
    this.getItem = getItem
  }
  async genReport() {
    const { application, template } = this
    let templateVars = Mustache.parse(template)
    let nameVars = templateVars.filter(arr => arr[0] === 'name').map(e => e[1])
    let tVars = templateVars.filter(arr => arr[0] === '#')
    // let tagVars = tVars
    //   .map(e => e.find(elm => Array.isArray(elm)))
    //   .map(arr => arr.find(a => a[0] === 'name')).map(e => e[1])
    let tags = {}
    tVars.forEach(t => {
      tags[t[1]] = t[4].filter(elm => elm[0] === 'name').map(a => a[1])
    })
    for (let tag in tags) {
      let arr = tags[tag]
      arr.forEach(a => nameVars.push(a))
    }
    let varsOnly = nameVars //nameVars.concat(tagVars)

    let formsToProps = {}
    varsOnly.forEach(v => {
      let [form, prop] = v.split('^')
      form = form.replace(/-/g, '.')
      prop = prop.replace(/-/g, '.')
      let details = formsToProps[form]
      if (!formsToProps[form])
        formsToProps[form] = {[prop]: ''}
      else
        formsToProps[form][prop] = ''
    })
    let all = []
    let formNames = Object.keys(formsToProps)
    let idx = formNames.indexOf(APPLICATION)

    if (idx !== -1)
      formNames.splice(idx, 1)
    for (let i=formNames.length-1; i>=0; i--) {
      let forms = application.forms.filter(f => getType(f) === formNames[i])
      if (forms.length) {
        for (let j=0; j<forms.length; j++)
          all.push(await this.getItem({ idOrResource: forms[j] }))
        formNames.splice(i, 1)
      }
      // HACK
      let idx = all.findIndex(r => r[TYPE].endsWith('.Quote'))
      if (idx !== -1) {
        let form = all[idx]
        if (form.loanTerm) {
          let qform = cloneDeep(form)
          let qidx = qform.terms.findIndex(t => t.term.id === qform.loanTerm.id)
          if (qidx !== -1) {
            qform.terms.splice(qidx, 1)
            all.splice(idx, 1, qform)
          }
        }
      }
      // end HACK
    }
    let forms = all
    let parentForms = formNames.length && await this.getParentForms({application, forms, formNames})

    if (formNames.length)
      debugger
    // let forms = await Promise.all(all)
    if (parentForms)
      parentForms.forEach(f => forms.push(f))

    forms.push(application)

    let resource = {}
    for (let formId in formsToProps) {
      let fforms = forms.filter(f => f[TYPE] === formId)
      if (!fforms.length)
        continue
      let props = formsToProps[formId]
      for (let i=0; i<fforms.length; i++)
        await this.addProps({resource, form: fforms[i], props, tags})
    }
    this.addTags({tags, resource})
    return Mustache.render(template, resource)
  }
  addTags({tags, resource}) {
    for (let tag in tags) {
      let props = tags[tag]
      props.forEach(prop => {
        let vals = resource[prop]
        if (!vals  ||  !vals.length)
          return
        if (!resource[tag]) {
          resource[tag] = vals.map(v => {
            return {[prop]: v}
          })
        }
        else {
          vals.forEach((v, j) => {
            let r = resource[tag][j]
            r[prop] = v
          })
        }
        delete resource[prop]
      })
    }
  }
  async getParentForms({application, forms, formNames}) {
    let parentForms = []
    if (application.parent) {
      let { forms:pForms } = await this.getApplication({resource: application.parent, backlink: getModel(APPLICATION).properties.forms})
      for (let i=formNames.length-1; i>=0; i--) {
        let forms = pForms.filter(f => getType(f) === formNames[i])
        if (forms.length) {
          forms.forEach(f => parentForms.push(f))
          formNames.splice(i, 1)
        }
      }
      return parentForms
    }
    if (application.items.length) {
      let ilinks = []
      application.items.forEach(item => ilinks.push(getCurrentHash(item)))
      debugger
      return
    }
  }
  async addProps({resource, form, props}) {
    const { locale } = this
    let ftype = getType(form)
    let fmodel = getModel(ftype)
    let prefix = ftype.replace(/\./g, '-')
    let formProps = Object.keys(props)
    let moreForms = {}
    for (let i=0; i<formProps.length; i++) {
      let prop = formProps[i].split('.')
      let propName = `${prefix}^${prop.join('-')}`
      let val
      let pForm = form
      let notFound = false
      for (let ii=0; ii<prop.length  &&  !notFound; ii++) {
        let property = prop[ii]
        // Check if backlink
        let idx = property.indexOf('[')
        if (idx !== -1) {
          let ptype = property.slice(idx + 1, -1).replace(/_/g, '.')
          let p =  property.slice(0, idx)
          let r = pForm[p] && pForm[p].find(f => f[TYPE] === ptype)
          if (!r)
            break
          r = await this.getItem({ idOrResource: r, noBacklinks: true })
          pForm = r[0]
        }

        let propValue = pForm[property]
        if (!propValue)
          continue

        let pModel = getModel(getType(pForm))
        let p = pModel.properties[property]
        if (typeof propValue !== 'object') {
          val = propValue
          if (p.type === 'date')
            val = dateformat(new Date(pForm[property]), 'dd mmm yyyy')
          break
        }
        let ref = p.ref
        if (!ref  &&  p.items)
          ref = p.items.ref
        if (ref) {
          let refModel = getModel(ref)
          if (refModel.inlined) {
            val = this.getValue({resource, form: pForm, prop: property, locale})
            break
          }
          if (isEnum(ref) || ii === prop.length - 1) {
            val = propValue.title
            break
          }
        }
        if (pModel.inlined || p.inlined) {
          if (ii !== prop.length - 1) {
            if (Array.isArray(propValue)) {
              val = propValue.map((pf, i) => {
                let propV = pf[prop[ii + 1]]
                let v = this.getValue({resource, form: pf, prop: prop[ii+1], locale})
                return v
                // pf[prop[ii + 1]]
              })
            }
            else
              val = propValue[prop[ii + 1]]
          }
          break
        }
        try {
          let link = getCurrentHash(propValue)
          let pv = moreForms[link]
          if (pv)
            propValue = pv
          else
            propValue = await this.getItem({idOrResource: propValue, noBacklinks: true})

          moreForms[link] = propValue
          val = propValue[prop[ii + 1]]
          if (!val || typeof val !== 'object')
            break
          if (typeof val !== 'object') break
          if (isEnum(prop[ii + 1])) {
            val = val.title
            break
          }
          pForm = propValue
        } catch (err) {
          notFound = true
          break
        }
      }
      this.setPropValue({resource, propName, val})
    }
  }
  setPropValue({resource, propName, val}) {
    if (val === undefined)
      return
    if (!resource[propName])
      resource[propName] = []
    if (Array.isArray(val))
      val.forEach(v => resource[propName].push(v))
    else
      resource[propName].push(val)
  }
  getValue({resource, form, prop}) {
    let ftype = getType(form)
    let properties = getModel(ftype).properties
    let { locale } = this

    if (!form[prop])
      return ''

    if (typeof form[prop] === 'object') {
      let ref = properties[prop].ref
      if (ref) {
        if (isEnum(ref))
          return translate(form[prop], properties[prop])
        if (ref === MONEY)
          return formatCurrency(form[prop], locale)
      }
      return form[prop].title
    }
    if (properties[prop].type === 'date')
      return dateformat(new Date(form[prop]), 'dd mmm yyyy')
    if (properties[prop].units)
      return `${form[prop]}${properties[prop].units}`
    return form[prop]
  }
}
module.exports = ReportGenerator
