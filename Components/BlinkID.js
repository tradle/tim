
import { NativeModules } from 'react-native'
const { RNMicroBlinkManager } = NativeModules
const scan = promisify(RNMicroBlinkManager.scan)
const resultProps = ['mrtd', 'usdl', 'eudl']
const validators = {
  mrtd: validateMRTDOptions,
  usdl: validateUSDLOptions,
  eudl: validateEUDLOptions,
  detector: validateDetectorOptions
}

let LICENSE_KEY

module.exports = {
  setLicenseKey: key => {
    LICENSE_KEY = key
    RNMicroBlinkManager.setKey(key)
  },
  /**
   * start a scan
   * @param  {Object} opts
   * @param  {Boolean} [base64] - if true, returns base64 image
   * @param  {String} [imagePath] - path to which to save image
   * @param  {String} [licenseKey=LICENSE_KEY]
   * @param  {Object} [opts.mrtd]
   * @param  {Object} [opts.usdl]
   * @param  {Object} [opts.eudl]
   * @param  {Object} [opts.detector]
   * @return {Promise}
   */
  scan: async (opts={}) => {
    const {
      licenseKey=LICENSE_KEY,
      mrtd,
      usdl,
      eudl,
      detector,
      base64,
      imagePath
    } = opts

    if (!licenseKey) {
      throw new Error('set or pass in licenseKey first')
    }

    for (let p in opts) {
      let validate = validators[p]
      if (validate) validate(opts[p])
    }

    const result = await scan(opts)
    return normalizeResults(result)
  },
  dismiss: RNMicroBlinkManager.dismiss
}

function validateMRTDOptions (options) {
  // TODO:
}

function validateUSDLOptions (options) {
  // TODO:
}

function validateEUDLOptions (options) {
  // TODO:
}

function validateDetectorOptions (options) {
  // TODO:
  throw new Error('not supported yet')
}

function normalizeResults (result) {
  // resultProps.forEach(prop => {
  //   if (result[prop]) result[prop] = xml2json(result[prop])
  // })

  // if (result.base64) result.base64 = 'data:image/png;base64,' + result.base64

  return result
}


// async function normalizeResults (result) {
//   await Promise.all(resultProps.map(async (prop) => {
//     result[prop] = await parseXML(result[prop])
//   }))

//   return result
// }

function promisify (fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      args.push((err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })

      fn.apply(this, args)
    })
  }
}
