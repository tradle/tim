console.log('requiring ModelsStore.js')
'use strict'

import React from 'react'
import _ from 'lodash'
import sha from 'stable-sha1'
import Debug from 'debug'
const debug = Debug('tradle:app:ModelsStore')
import Lens from '@tradle/lens'
import constants from '@tradle/constants'
var {
  TYPE,
  ROOT_HASH,
  CUR_HASH
} = constants
var {
  VERIFICATION,
  FORM,
  ORGANIZATION,
  MESSAGE,
  ENUM,
  IDENTITY
} = constants.TYPES

import voc from './voc'
import utils from '../utils/utils'
const Aviva = require('../utils/aviva')

const ObjectModel = voc['tradle.Object']
const MY_PRODUCT = 'tradle.MyProduct'
const ITEM = 'tradle.Item'
const DOCUMENT = 'tradle.Document'
const CONTEXT = 'tradle.Context'

class ModelsStore {
  // constructor({models, enums}) {
  constructor() {
    // this.models = models
    // this.enums = enums
    this.models = {}
    this.enums = {}
    this.lenses = {}
    this.modelsWithAddOns = {}
    this.addModels()
  }

  getModels() {
    return this.models;
  }
  addModel(model) {
    this.models[model.id] = model
    this.createEnumResources(model)
    this.setPropertyNames(model.properties)
  }
  setPropertyNames(props) {
    for (let p in props) {
      var val = props[p]
      if (!val.name && typeof val !== 'function')
        props[p].name = p;
      if (!val.title)
        val.title = utils.makeLabel(p);
    }
  }
  addModels() {
    for (let id in voc) {
      let m = voc[id]
      // if (!m[ROOT_HASH])
      //   m[ROOT_HASH] = sha(m);
      this.parseOneModel(m)
      this.addModel(m)
    }
  }
  addLens(l) {
    this.lenses[l.id] = l
  }
  getLenses() {
    return this.lenses
  }
  getLens(id) {
    return this.lenses[id]
  }
  parseOneModel(m) {
    Aviva.preparseModel(m)
    // this.addNameAndTitleProps(m)
    this.models[m.id] = m

    if (!m.properties[TYPE]) {
      m.properties[TYPE] = {
        ...ObjectModel.properties[TYPE]
      }
    }

    if (!m.properties._time) {
      m.properties._time = {
        ...ObjectModel.properties._time
      }
    }
  }
  addOns(m) {
    // Aviva.preparseModel(m)
    this.addNameAndTitleProps(m)
    if (this.isEnum(m))
      this.createEnumResources(m)

    if (m.subClassOf === FORM) {
      this.addVerificationsToFormModel(m)
      this.addFromAndTo(m)
    }
  }
  addNameAndTitleProps(m, aprops) {
    var mprops = aprops  ||  m.properties
    for (let p in mprops) {
      if (p.charAt(0) === '_')
        continue
      if (!mprops[p].name)
        mprops[p].name = p
      if (!mprops[p].title)
        mprops[p].title = utils.makeLabel(p)
      if (mprops[p].type === 'array') {
        var aprops = mprops[p].items.properties
        if (aprops)
          this.addNameAndTitleProps(m, aprops)
      }
    }
  }
  addFromAndTo(m) {
    if (!m.interfaces  ||  m.interfaces.indexOf(MESSAGE) === -1)
      return
    let properties = m.properties
    if (properties.from  &&  properties.to)
      return
    properties.from = {
      type: 'object',
      ref: IDENTITY,
      readOnly: true
    }
    properties.to = {
      type: 'object',
      ref: IDENTITY,
      readOnly: true
    }
  }
  addVerificationsToFormModel(m) {
    if (m.subClassOf !== FORM  ||  m.verifications)
      return
    m.properties.verifications = {
      type: 'array',
      readOnly: true,
      title: 'Verifications',
      name: 'verifications',
      items: {
        backlink: 'document',
        ref: VERIFICATION
      }
    }
  }
  createEnumResources(model) {
    if (!this.isEnum(model)  ||  !model.enum)
      return
    let eProp
    for (let p in model.properties) {
      if (p !== TYPE) {
        eProp = p
        break
      }
    }
    model.enum.forEach((r) => {
      let enumItem = {
        [TYPE]: model.id,
        [ROOT_HASH]: r.id,
        [eProp]: r.title
      }
      this.loadStaticItem(enumItem)
    })
  }
  loadStaticItem(r) {
    if (!r[ROOT_HASH])
      r[ROOT_HASH] = sha(r)

    r[CUR_HASH] = r[ROOT_HASH]
    let type = r[TYPE]
    let enumList = this.enums[type]
    if (!enumList) {
      enumList = []
      this.enums[type] = enumList
    }

    if (enumList.filter((e) => e[ROOT_HASH] === r[ROOT_HASH]).length)
      return
    enumList.push(r)
    // // let id = utils.getId(r)
    // let key = [r[TYPE], r[ROOT_HASH], r[CUR_HASH]].join('_')
    // if (saveInDB)
    //   batch.push({type: 'put', key, value: r})
  }

  getModelByTitle(title) {
    let mm = Object.values(this.models)
    let idx = _.findIdx(mm, (m) => m.title === title)
    return idx && mm[idx]
  }
  // getModelsForStub() {
  //   return modelsForStub
  // },
  getOriginalModel(modelName) {
    return this.models  &&  this.models[modelName] && this.models[modelName]
  }

  getAugmentedModel(model) {
    const cached = this.modelsWithAddOns[model.id]
    if (cached) return cached
    model = _.cloneDeep(model)
    this.addOns(model)
    // let props = rModel.properties
    // for (let p in props)
    //   props[p].name = p
    return model
  }

  getLensedModel(fr, lensId) {
    const form = utils.getRequestedFormType(fr)
    let model = this.getOriginalModel(form)
    lensId = lensId  ||  fr.lens

    if (!lensId)
      return this.getAugmentedModel(model)

    let lens = this.getLens(lensId)
    if (!lens)
      return this.getAugmentedModel(model)

    let merged = Lens.merge({ models: this.getModels(), model, lens })
    // let m = _.cloneDeep(merged)
    // let props = m.properties
    // for (let p in props)
    //   props[p].name = p
    return this.getAugmentedModel(merged)
  }
  applyLens({prop, values, list }) {
    let pin = prop.pin  ||  values
    let limit = prop.limit
    if (!pin  &&  !limit)
      return list
    let isEnum = this.isEnum(prop.ref  ||  prop.items.ref)
    if (isEnum) {
      if (limit  &&  limit.length) {
        let limitMap = {}
        let newlist = list.filter((l) => {
          let id = l[ROOT_HASH]
          if (limit.indexOf(id) === -1)
            return true
          else
            limitMap[id] = l
          return false
        })
        // pin.filter((id) => pinMap[id])
        list = []
        limit.forEach(p => {
          if (limitMap[p])
            list.push(limitMap[p])
        })
      }
    }
    if (pin  &&  pin.length) {
      if (isEnum) {
        let pinMap = {}
        let newlist = list.filter((l) => {
          let id = l[ROOT_HASH]
          if (pin.indexOf(id) === -1)
            return true
          else
            pinMap[id] = l
          return false
        })
        if (this.isEmpty(pinMap))
          return list
        let newpin = [] //= pin.filter((id) => pinMap[id])
        pin.forEach(p => {
          if (pinMap[p])
            newpin.push(pinMap[p])
        })

        list = newpin.concat(newlist)
      }
    }
    return list
  }
  getLensId(resource, provider) {
    if (!resource._sharedWith)
      return
    if (provider[TYPE] !== ORGANIZATION)
      return resource._lens
    let lens
    provider.contacts.forEach(c => {
      resource._sharedWith.forEach(s => {
        if (s.bankRepresentative === c.id)
          lens = s.lens
      })
    })
    return lens || resource._lens
  }
  getModel(modelOrId) {
    const id = typeof modelOrId === 'string' ? modelOrId : modelOrId.id
    let { models, modelsWithAddOns } = this
    const cached = modelsWithAddOns[id]
    if (cached) return cached
    if (!models) return

    const model = typeof modelOrId === 'string' &&  models[id]  ||  modelOrId
    if (model) {
      modelsWithAddOns[id] = this.getAugmentedModel(model)
      return modelsWithAddOns[id]
    }

    // const model = models ? models[modelName] : null
    // // if (!model) debug(`missing model: ${modelName}`)
    // return model
  }
  makeModelTitle(model, isPlural) {
    if (typeof model === 'string') {
      let m = this.getModel(model)
      if (m)
        return this.makeModelTitle(m, isPlural)
      else {
        let idx = model.lastIndexOf('.')
        return idx === -1 ? this.makeLabel(model) : this.makeLabel(model.substring(idx + 1))
      }
    }
    if (isPlural  &&  model.plural)
      return model.plural
    if (model.title)
      return isPlural ? model.title + 's' : model.title
    let label = model.id.split('.')[1]
    if (isPlural)
      label += 's'
    let len = label.length
    let newLabel = ''

    for (let i=0; i<len; i++)  {
      let ch = label.charAt(i)
      if (ch === ch.toLowerCase())
        newLabel += ch
      else {
        let ch1 = i ? label.charAt(i - 1) : ''
        if (ch1  &&  ch1 === ch1.toLowerCase())
          newLabel += ' '
        newLabel += ch
      }
    }
    return newLabel.trim()
  }

  getImplementors(iModel, excludeModels) {
    var implementors = [];
    let { models } = this
    for (var p in models) {
      var m = models[p];
      if (excludeModels) {
        var found = false
        for (var i=0; i<excludeModels.length && !found; i++) {
          if (p === excludeModels[i])
            found = true
          else {
            var em = this.getModel(p)
            if (em.subClassOf  &&  em.subClassOf === excludeModels[i])
              found = true;
          }
        }
        if (found)
          continue
      }
      if (m.interfaces  &&  m.interfaces.indexOf(iModel) != -1)
        implementors.push(m);
    }
    return implementors;
  }
  getAllSubclasses(iModel) {
    var subclasses = [];
    let { models } = this
    for (var p in models) {
      var m = models[p];
      if (m.subClassOf  &&  m.subClassOf === iModel)
        subclasses.push(m);
    }
    return subclasses;
  }
  isSubclassOf(type, subType) {
    if (typeof type === 'string')
      return this.getModel(type).subClassOf === subType
    if (type.type)  {
      if (type.type === 'tradle.Model')
      return type.subClassOf === subType
    }
    return this.getModel(type[TYPE]).subClassOf === subType
  }
  isMyProduct(type) {
    return this.isSubclassOf(type, MY_PRODUCT)
  }
  isForm(type) {
    return this.isSubclassOf(type, FORM)
  }
  isVerification(type) {
    return this.isSubclassOf(type, VERIFICATION)
  }
  isInlined(m) {
    if (m.inlined)
      return true
    if (!m.subClassOf)
      return false
    return this.isInlined(this.getModel(m.subClassOf))
  }
  getItemsMeta(metadata) {
    var props = metadata.properties;
    // var required = utils.arrayToObject(metadata.required);
    // if (!required)
    //   return;
    var itemsMeta = {};
    for (var p in props) {
      if (props[p].type !== 'array')  //  &&  required[p]) {
        continue
      let ref = props[p].items.ref
      if (!ref  ||  this.getModel(ref).subClassOf !== ENUM)
        itemsMeta[p] = props[p];
    }
    return itemsMeta;
  }
  getPropertiesWithAnnotation(model, annotation) {
    let props = {}
    let meta = model.properties
    for (let p in meta) {
      if (meta[p][annotation])
        props[p] = meta[p]
      // else if (meta[p].items  &&  meta[p].items[annotation] === annotation)
      //   props[p] = meta[p]
    }

    return props
  }

  getPropByTitle(props, propTitle) {
    let propTitleLC = propTitle.toLowerCase()
    for (let p in props) {
      let prop = props[p]
      let pTitle = prop.title || this.makeLabel(p)
      if (pTitle.toLowerCase() === propTitleLC)
        return p
    }
  }
  getPropStringValue(prop, resource) {
    let p = prop.name
    if (!resource[p]  &&  prop.displayAs)
      return this.templateIt(prop, resource);
    if (prop.type == 'object')
      return resource[p].title || this.getDisplayName(resource[p], this.getModel(resource[p][TYPE]).properties);
    else
      return resource[p] + '';
  }
  getEditCols(model) {
    let { editCols, properties } = model
    let eCols = []
    let isWeb = utils.isWeb()
    if (!editCols) {
      let viewCols = this.getViewCols(model)
      if (viewCols)
        eCols = viewCols.map(p => properties[p])
      return eCols
    }
    editCols.forEach((p) => {
      if (properties[p].readOnly)
        return
      if (isWeb  &&  properties[p].scanner  &&  properties[p].scanner !== 'id-document')
        return
      let idx = p.indexOf('_group')
      if (idx === -1                          ||
          !properties[p].list                 ||
          properties[p].title.toLowerCase() !== p)
        eCols.push(properties[p])

      if (idx !== -1  &&  properties[p].list) {
        let eColsCnt = eCols.length
        let isLastPropGroup = eCols[eColsCnt - 1].name.indexOf('_group') !== -1
        properties[p].list.forEach((p) => {
          if (eCols.indexOf(properties[p]) === -1)
            eCols.push(properties[p])
        })
        if (eColsCnt === eCols.length  &&  isLastPropGroup)
          eCols.pop()
      }
    })
    return eCols
  }
  getViewCols(model) {
    let { viewCols, properties } = model
    let vCols = []
    if (viewCols) {
      viewCols.forEach((p) => {
        let prop = properties[p]
        let idx = p.indexOf('_group')
        if (idx === -1  ||  !prop.list || prop.title.toLowerCase() !== p  ||  vCols.indexOf(p) !== -1)
          vCols.push(p)

        if (idx !== -1  &&  prop.list)
          prop.list.forEach((p) => vCols.push(p))
        // eCols[p] = props[p]
      })
    }
    for (let p in properties) {
      let prop = properties[p]
      if (vCols.indexOf(p) === -1  &&  !prop.readOnly  &&  !prop.hidden  &&  p.indexOf('_group') !== p.length - 6  &&  !prop.signature)
        vCols.push(p)
    }
    return vCols
  }
  isContainerProp(prop, pModel) {
    if (!prop.ref  ||  !prop.readOnly)
      return
    let refM = this.getModel(prop.ref)
    let aprops = this.getPropertiesWithAnnotation(refM, 'items')
    if (!aprops)
      return
    for (let apName in aprops) {
      let ap = aprops[apName]
      if (!ap.items.ref)
        return
      if (ap.items.ref === pModel.id)
        return true
    }
  }
  isContext(typeOrModel) {
    let m = typeOrModel
    if (typeof typeOrModel === 'string') {
      m = this.getModel(typeOrModel)
      if (!m)
        return
    }
    else if (typeOrModel[TYPE])
      m = this.getModel(typeOrModel[TYPE])
    return m.interfaces  &&  m.interfaces.indexOf(CONTEXT) !== -1
  }
  isEnum(typeOrModel) {
    let m = typeOrModel
    if (typeof typeOrModel === 'string') {
      m = this.models[typeOrModel]
      if (!m)
        return
    }
    return m.subClassOf === ENUM
  }
  getEnum(type) {
    return this.enums[type]
  }
  getMainPhotoProperty(model) {
    let mainPhoto = Object.keys(this.getPropertiesWithAnnotation(model, 'mainPhoto'))
    return mainPhoto.length && mainPhoto[0]
  }
  getPropertiesWithRef(ref, model) {
    let props = this.getPropertiesWithAnnotation(model, 'ref')
    let rProps = []
    for (let p in props) {
      let pRef = props[p].ref  ||  (props[p].items  &&  props[p].items.ref)
      if (pRef === ref  ||  model.subClassOf === pRef)
        rProps.push(props[p])
    }
    return rProps
  }
  getPropertiesWithRange(range, model) {
    let props = this.getPropertiesWithAnnotation(model, 'range')
    let rProps = []
    for (let p in props)
      if (props[p].range === range)
        rProps.push(props[p])
    return rProps
  }
  isItem(resource) {
    let model
    if (typeof resource === 'string')
      model = this.getModel(resource)
    else
      model = resource
    return model.interfaces  &&  model.interfaces.indexOf(ITEM) !== -1
  }
  isDocument(model) {
    return model.interfaces  &&  model.interfaces.indexOf(DOCUMENT) !== -1
  }
  getEnumProperty(model) {
    let props = model.properties
    for (let p in props)
      if (p !== TYPE)
        return p
  }
  buildEnumStub(model, titleOrId) {
    let enumEnum = model.enum
    let val
    enumEnum.forEach((r) => {
      if (r.title === titleOrId  ||  r.id === titleOrId)
        val = {
          id: [model.id, r.id].join('_'),
          title: r.title
        }
    })
    return val
  }

  isSealableModel(model) {
    return model.subClassOf === FORM || model.subClassOf === MY_PRODUCT || model.id === VERIFICATION
  }

  hasBacklinks(model) {
    let hasBacklinks
    let props = model.properties
    for (var p in props) {
      if (props[p].hidden)
        continue
      if (p.charAt(0) === '_'  ||  !props[p].items  ||  !props[p].items.backlink)
        continue;
      hasBacklinks = true
    }
    return hasBacklinks
  }
  ungroup(model, arr, includeGroupProp) {
    if (!arr)
      return
    let props = model.properties
    let newArr = []
    arr.forEach((p) => {
      if (p.indexOf('_group') !== -1  && props[p].list) {
        if (includeGroupProp)
          newArr.push(p)
        props[p].list.forEach((pr) => {
          if (newArr.indexOf(pr) === -1)
            newArr.push(pr)
        })
      }
      else if (props[p].group)
        props[p].group.forEach((pr) => {
          if (newArr.indexOf(pr) === -1)
            newArr.push(pr)
        })
      else
        newArr.push(p)
    })
    return newArr
  }
}
module.exports = ModelsStore;
