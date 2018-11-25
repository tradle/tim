import promisify from 'pify'
import Regula from 'react-native-regula-document-reader'
import { importFromImageStore } from './image-utils'
import { validate as validateType, types } from './validate-type'
import getValues from 'lodash/values'
import defaultsDeep from 'lodash/defaultsDeep'

export const Scenario = {
  mrz: 'Mrz',
  ocr: 'Ocr',
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
  customization: {
    showHelpAnimation: types.bool,
    showHintMessages: types.bool,
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
    showCaptureButton: true,
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
  const image = await importFromImageStore(result.image)
  const results = result.jsonResult.map(normalizeJSON)
  // see dummy response in data/sample-regula-result.json
  return { results, image }
}
