import promisify from 'pify'
import { NativeModules } from 'react-native'

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

export const setScenarioMrz = () => setScenario('Mrz')
export const setScenarioOcr = () => setScenario('Ocr')

const _scan = promisify(Regula.showScanner.bind(Regula))
export const scan = async ({ scenario='Ocr', ...opts }) => {
  await setScenario(scenario)
  // opts will be supported soon
  return _scan()
}
