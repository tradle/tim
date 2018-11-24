import promisify from 'pify'
import { NativeModules } from 'react-native'
import { replaceDataUrls } from './image-utils'

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

export const setScenario = async (name) => {
  await init()
  Regula.setScenario(name)
}

export const Scenario = {
  mrz: 'Mrz',
  ocr: 'Ocr',
}

export const setScenarioMrz = () => setScenario(Scenario.mrz)
export const setScenarioOcr = () => setScenario(Scenario.ocr)

const normalizeJSON = obj => typeof obj === 'string' ? JSON.parse(obj) : obj
const _scan = promisify(Regula.showScanner.bind(Regula))
export const scan = async ({ scenario=Scenario.ocr, ...opts }) => {
  await setScenario(scenario)
  // opts will be supported soon
  const result = await _scan()
  return normalizeResult(result)
}

const normalizeResult = async result => {
  result = normalizeJSON(result)
  // not necessary as long as imageStore changes are merged on the native side
  result = await replaceDataUrls(result)
  const results = result.jsonResult.map(normalizeJSON)
  // dummy response in data/sample-regula-result.json
  return {
    results: result.jsonResult,
    image: result.image,
  }
}
