import promisify from 'pify'
import get from 'lodash/get'
import getValues from 'lodash/values'
import defaultsDeep from 'lodash/defaultsDeep'
import { Platform } from 'react-native'
import Regula from 'react-native-regula-document-reader'
import Q from 'q'

import { importFromImageStore } from './image-utils'
import { validate as validateType, types } from './validate-type'
import regulaVisualFieldTypes from './regulaVisualFieldTypes'
import regulaGraphicFieldTypes from './regulaGraphicFieldTypes'
// kind of a shame to have this here
// would be better to just call setLicenseKey from the outside
import {
  regula as regulaAuth
} from './env'
const { Scenario } = Regula
const LANDSCAPE_RIGHT_IOS = 8
const LANDSCAPE_ANDROID = 2

const initializeOpts = {
  licenseKey: get(regulaAuth || {}, ['licenseKey', Platform.OS]),
}
var prepDB //, databaseID
export { Scenario }

export const setLicenseKey = async (licenseKey) => {
  initializeOpts.licenseKey = licenseKey
  // await Regula.prepareDatabase({dbID: 'Full'})
}
export const prepareDatabase = async (dbID) => {
  // databaseID = dbID
  if (prepDB)
    return
  prepDB = new Q.defer()
  // debugger
  console.log('Prepare Regula DB')
  try {
    await Regula.prepareDatabase({dbID})
    prepDB.resolve()
  } catch (err) {
    prepDB.reject(err)
    debugger
    return
  }
  console.log('Prepare Regula DB - completed')
  await initialize()
  console.log('Initialization Regula DB - completed')
}
const OptsTypeSpec = {
  processParams: {
    scenario: types.oneOf(getValues(Scenario)),
    multipageProcessing: types.bool,
    dateFormat: types.string,
    logs: types.bool,
    debugSaveImages: types.bool,
    debugSaveLogs: types.bool,
  },
  // https://github.com/regulaforensics/DocumentReader-iOS/wiki/Customization
  customization: {
    showHelpAnimation: types.bool,
    showStatusMessages: types.bool,
    status: types.string,
  },
  functionality: {
    // showTorchButton: types.bool,
    showCloseButton: types.bool,
    showCaptureButton: types.bool,
    showChangeFrameButton: types.bool,
    showSkipNextPageButton: types.bool,
    skipFocusingFrames: types.bool,
    videoCaptureMotionControl: types.bool,
    isOnlineMode: types.bool,
    singleResult: types.bool,
    orientation: types.number,
    pictureOnBoundsReady: types.bool
  },
}

const DEFAULTS = {
  functionality: {
    // showTorchButton: false,
    showCloseButton: true,
    showCaptureButton: false,
    skipFocusingFrames: true,
    orientation: Platform.OS === 'android' && LANDSCAPE_ANDROID || LANDSCAPE_RIGHT_IOS,
  },
  customization: {
    showStatusMessages: true,
    showHelpAnimation: true,
  },
  processParams: {
    scenario: Scenario.ocr,
    dateFormat:'mm/dd/yyyy',
    logs: true,
    debugSaveImages: false,
    debugSaveLogs: false,
  },
}

const normalizeJSON = obj => typeof obj === 'string' ? JSON.parse(obj) : obj
export const scan = async (opts={}) => {
  try {
    prepDB  &&  await prepDB.promise
  } catch (err) {
    console.log('Something went wrong', err)
    // this.prepareDatabase(databaseID)
    debugger
  }
  opts = defaultsDeep(opts, DEFAULTS)

  validateType({
    input: opts,
    spec: OptsTypeSpec,
    allowExtraProps: false,
  })

  await initialize()
  // opts will be supported soon
  const result = await Regula.scan(opts)

  return normalizeResult(result)
}
export const initialize = async () => {
  // debugger
  await Regula.initialize(initializeOpts)
}
const normalizeResult = async result => {
  result = normalizeJSON(result)
  // not necessary as long as imageStore changes are merged on the native side
  const imageFront = await importFromImageStore(result.imageFront)
  const imageBack = result.imageBack && await importFromImageStore(result.imageBack)

  const results = result.jsonResult.map(normalizeJSON)
  const json = processListVerifiedFields(results)
  // see dummy response in data/sample-regula-result.json
  return { json, results, imageFront, imageBack }
}

const processListVerifiedFields = results => {
  let fields, fieldTypes
  let result = results.find(r => r.ListVerifiedFields)
  if (!result)
    return

  fields = result.ListVerifiedFields.pFieldMaps
  if (!fields)
    return {}
  fieldTypes = regulaVisualFieldTypes
  let json = {}

  fields.forEach((f, i) => {
    let fieldTypeID = f.wFieldType
    let fName
    let val =  f.Field_Barcode  ||  f.Field_MRZ  ||  f.Field_Visual
    if (val) {
      for (let p in regulaVisualFieldTypes) {
        if (regulaVisualFieldTypes[p] === fieldTypeID) {
          fName = p
          break
        }
      }

      // fName = regulaVisualFieldTypes[fieldTypeID]
      json[fName] = val
    }
    else {
      val = f.GraphicField
    }
  })
  return json
}
