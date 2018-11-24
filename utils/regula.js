import promisify from 'pify'
import { NativeModules } from 'react-native'
import { replaceDataUrls } from './image-utils'
import { validate as validateType, types } from './validate-type'
import getValues from 'lodash/values'
import defaultsDeep from 'lodash/defaultsDeep'

const Regula = NativeModules.RNRegulaDocumentReaderBeta
const memoize = fn => {
  let promise
  return async (...args) => {
    if (!promise) promise = fn(...args)
    return promise
  }
}

const _init = promisify(Regula.initialize.bind(Regula))
export const init = memoize(_init)

// export const setScenario = async (name) => {
//   await init()
//   Regula.setScenario(name)
// }

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
const _scan = promisify(Regula.showScanner.bind(Regula))
export const scan = async (opts={}) => {
  opts = defaultsDeep(opts, DEFAULTS)

  validateType({
    input: opts,
    spec: OptsTypeSpec,
    allowExtraProps: false,
  })

  await init()
  // opts will be supported soon
  const result = await _scan(opts)
  return normalizeResult(result)
}

const normalizeResult = async result => {
  result = normalizeJSON(result)
  // not necessary as long as imageStore changes are merged on the native side
  result = await replaceDataUrls(result)
  const results = result.jsonResult.map(normalizeJSON)
  // see dummy response in data/sample-regula-result.json
  return {
    results,
    image: result.image,
  }
}
