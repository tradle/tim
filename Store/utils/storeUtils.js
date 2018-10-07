'use strict'

import voc from '../voc'
import utils from '../../utils/utils'
const Aviva = require('../../utils/aviva')
var sha = require('stable-sha1');

var constants = require('@tradle/constants');
// var models = {};

const {
  TYPE,
  ROOT_HASH,
  CUR_HASH
} = constants

const { FORM, IDENTITY, VERIFICATION, MESSAGE } = constants.TYPES
const ObjectModel = voc['tradle.Object']

var storeUtils = {
  addModels({models, enums}) {
    for (let id in voc) {
      let m = voc[id]
      // if (!m[ROOT_HASH])
      //   m[ROOT_HASH] = sha(m);
      this.parseOneModel(m, models, enums)
    }
  },
  parseOneModel(m, models, enums) {
    Aviva.preparseModel(m)
    // this.addNameAndTitleProps(m)
    models[m.id] = {
      key: m.id,
      value: m
    }

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
  },
  addOns(m, models, enums) {
    // Aviva.preparseModel(m)
    this.addNameAndTitleProps(m)
    // models[m.id] = {
    //   key: m.id,
    //   value: m
    // }

    // if (!m.properties._time) {
    //   m.properties._time = {
    //     type: 'date',
    //     readOnly: true,
    //     title: 'Date'
    //   }
    // }

    // if (isProductList  &&  m.subClassOf === FINANCIAL_PRODUCT)
    //   org.products.push(m.id)
    if (utils.isEnum(m))
      this.createEnumResources(m, enums)

    // if (utils.isMessage(m)) {
    if (m.subClassOf === FORM) {
      this.addVerificationsToFormModel(m)
      this.addFromAndTo(m)
    }
  },
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
  },
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
  },
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
  },
  createEnumResources(model, enums) {
    if (!utils.isEnum(model)  ||  !model.enum)
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
      this.loadStaticItem(enumItem, enums)
    })
  },
  loadStaticItem(r, enums) {
    if (!r[ROOT_HASH])
      r[ROOT_HASH] = sha(r)

    r[CUR_HASH] = r[ROOT_HASH]
    let type = r[TYPE]
    let enumList = enums[type]
    if (!enumList) {
      enumList = []
      enums[type] = enumList
    }

    if (enumList.filter((e) => e[ROOT_HASH] === r[ROOT_HASH]).length)
      return
    enumList.push(r)
    // // let id = utils.getId(r)
    // let key = [r[TYPE], r[ROOT_HASH], r[CUR_HASH]].join('_')
    // if (saveInDB)
    //   batch.push({type: 'put', key, value: r})
  },
}
module.exports = storeUtils
