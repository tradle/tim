import promisify from 'pify'
import Regula from 'react-native-regula-document-reader'
import { importFromImageStore } from './image-utils'
import { validate as validateType, types } from './validate-type'
import getValues from 'lodash/values'
import defaultsDeep from 'lodash/defaultsDeep'
import regulaVisualFieldTypes from './regulaVisualFieldTypes'
import regulaGraphicFieldTypes from './regulaGraphicFieldTypes'

const { Scenario } = Regula

export { Scenario }

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
    showHintMessages: types.bool,
    status: types.string,
  },
  functionality: {
    showTorchButton: types.bool,
    showCloseButton: types.bool,
    showCaptureButton: types.bool,
    showChangeFrameButton: types.bool,
    showSkipNextPageButton: types.bool,
    skipFocusingFrames: types.bool,
    videoCaptureMotionControl: types.bool,
    isOnlineMode: types.bool,
    singleResult: types.bool,
  },
}

const DEFAULTS = {
  functionality: {
    showTorchButton: true,
    showCloseButton: true,
    showCaptureButton: false,
  },
  customization: {
    showHintMessages: true,
    showHelpAnimation: true,
  },
  processParams: {
    scenario: Scenario.mrz,
  },
}

const normalizeJSON = obj => typeof obj === 'string' ? JSON.parse(obj) : obj
export const scan = async (opts={}) => {
  opts = defaultsDeep(opts, DEFAULTS)

  validateType({
    input: opts,
    spec: OptsTypeSpec,
    allowExtraProps: false,
  })

  await Regula.initialize()
  // opts will be supported soon
  const result = await Regula.scan(opts)
  return normalizeResult(result)
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
    let fieldTypeID = f.FieldType
    let val = f.Field_Visual || f.Field_MRZ
    let fName
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
