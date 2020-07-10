import promisify from 'pify'
import get from 'lodash/get'
import size from 'lodash/size'
import getValues from 'lodash/values'
import defaultsDeep from 'lodash/defaultsDeep'
import { Platform } from 'react-native'

import Regula from 'react-native-document-reader-api-beta'
const DocumentReader = Regula.RNRegulaDocumentReader
const DocumentReaderResults = Regula.DocumentReaderResults
const Enum = Regula.Enum

import once from 'once'
import { importFromImageStore } from './image-utils'
import { validate as validateType, types } from './validate-type'
import regulaVisualFieldTypes from './regulaVisualFieldTypes'
// import regulaGraphicFieldTypes from './regulaGraphicFieldTypes'
// kind of a shame to have this here
// would be better to just call setLicenseKey from the outside
import {
  regula as regulaAuth
} from './env'
const LANDSCAPE_RIGHT_IOS = 8
const LANDSCAPE_ANDROID = 2
// const DELAY_INTERVAL = 30000

export var Scenario = {}
export var isRFIDAvailable
// export const setLicenseKey = async (licenseKey) => {
//   initializeOpts.licenseKey = licenseKey
// }

const OptsTypeSpec = {
  processParams: {
    scenario: types.oneOf(Scenario), //types.oneOf(getValues(Scenario)),
    multipageProcessing: types.bool,
    dateFormat: types.string,
    logs: types.bool,
    debugSaveImages: types.bool,
    debugSaveLogs: types.bool,
    doRfid: types.bool,
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
    // orientation: Platform.OS === 'android' && LANDSCAPE_ANDROID || LANDSCAPE_RIGHT_IOS,
    orientation: Platform.OS === 'ios' ? Enum.DocReaderOrientationIOS.LANDSCAPE : Enum.DocReaderOrientationAndroid.LANDSCAPE
  },
  customization: {
    showStatusMessages: true,
    showHelpAnimation: true,
  },
  processParams: {
    // scenario: Scenario.ocr,
    dateFormat:'mm/dd/yyyy',
    logs: true,
    debugSaveImages: false,
    debugSaveLogs: false,
  },
}

class RegulaProxy {
  constructor() {
    this._prepared = new Promise((resolve, reject) => {
      this._prepareSucceeded = resolve
      this._prepareFailed = reject
    })

    this._initialized = new Promise((resolve, reject) => {
      this._initializeSucceeded = resolve
      this._initializeFailed = reject
    })

    this._initializedRfid = new Promise((resolve, reject) => {
      this._initializeRfidSucceeded = resolve
      this._initializeRfidFailed = reject
    })
    this._initializedScenarios = new Promise((resolve, reject) => {
      this._initializeScenariosSucceeded = resolve
      this._initializeScenariosFailed = reject
    })
    this.initializeOpts = {
      licenseKey: get(regulaAuth || {}, ['licenseKey', Platform.OS]),
    }
  }

  prepareDatabase = once(async (dbID) => {
    try {
      await DocumentReader.prepareDatabase(dbID, (respond) => {
      debugger
        this._prepareSucceeded()
        this.initialize(respond)
      })
    } catch (err) {
      debugger
      console.log('Prepare Regula DB failed', err)
      this._prepareFailed(err)
    }

    return this._prepared
  })

  initialize = once(async (prepared) => {
    if (!prepared)
      await this._prepared
    try {
      await DocumentReader.initializeReader(this.initializeOpts, (respond) => {
    debugger
        if (!size(Scenario)) {
          DocumentReader.getAvailableScenarios((jstring) => {
            let availableScenarios = JSON.parse(jstring)
            for (let i in availableScenarios) {
              let name = Regula.Scenario.fromJson(typeof availableScenarios[i] === "string" ? JSON.parse(availableScenarios[i]) : availableScenarios[i]).name
              Scenario[name] = name
            }
            this._initializeScenariosSucceeded()
          })
        }
        DocumentReader.getDocumentReaderIsReady(isReady => {
          debugger
          // if (isReady === true || isReady === "YES" || isReady == 1)
          //   isReady = true
          // else
          //   isReady = false
          this._initializeSucceeded()
        })
        DocumentReader.getCanRFID(canRFID => {
          debugger
          this._initializedRfidSucceeded()
          isRFIDAvailable = canRFID
        })
      })
      // this.initTime = new Date().getTime()
    } catch (err) {
      // debugger
      console.log('initialization Regula DB failed', err)
      this._initializeFailed(err)
    }
    return this._initialized
  })

  scan = async (opts={}, callback) => {
    await this._initialized
    // await this._initializedRfid
    await this._initializedScenarios
    // let delta = new Date().getTime() - this.initTime
    // if (delta < DELAY_INTERVAL)
    //   await Promise.delay(delta)
debugger
    opts = defaultsDeep(opts, DEFAULTS)

    // debugger

    validateType({
      input: opts,
      spec: OptsTypeSpec,
      allowExtraProps: false,
    })
    // opts will be supported soon
    DocumentReader.setConfig(opts, str => {
      // debugger
      console.log(str)
    })
    DocumentReader.showScanner(jstring => {
      if (jstring.substring(0, 8) != "Success:") {
        callback({error: jstring})
        return
      }
      let result = JSON.parse(jstring.substring(8))
      debugger
      let results = DocumentReaderResults.fromJson(result);
      // return normalizeResult(JSON.parse(jstring.substring(8)))
      let accessKey
      if (!opts.processParams.doRfid  ||  !results.chipPage) {
        callback(normalizeResult(result))
        return
      }
      debugger
      accessKey = results.getTextFieldValueByType(Enum.eVisualFieldType.FT_MRZ_STRINGS);
      if (accessKey) {
        DocumentReader.setRfidScenario({
          mrz: accessKey,
          pacePasswordType: Enum.eRFID_Password_Type.PPT_MRZ,
        }, () => { });
        debugger
      }
      else {
        accessKey = results.getTextFieldValueByType(159);
        if (accessKey != null && accessKey != "") {
          DocumentReader.setRfidScenario({
            password: accessKey,
            pacePasswordType: Enum.eRFID_Password_Type.PPT_CAN,
          }, () => { });
        }
      }

      DocumentReader.startRFIDReader((jstring) => {
        debugger
        if (jstring.substring(0, 8) == "Success:") {
          let result = DocumentReaderResults.fromJson(JSON.parse(jstring.substring(8)))
          callback(normalizeResult(result))
          this.displayResults(result)
        }
        else
          callback(normalizeResult(result))
      })
    })
  }

  setLicenseKey = async (licenseKey) => {
    this.initializeOpts.licenseKey = licenseKey
  }
}
export default new RegulaProxy()

const normalizeJSON = obj => typeof obj === 'string' ? JSON.parse(obj) : obj
const normalizeResult = async result => {
  result = normalizeJSON(result)
  // not necessary as long as imageStore changes are merged on the native side

  const imageFront = await importFromImageStore(result.imageFront)
  const imageBack = result.imageBack && await importFromImageStore(result.imageBack)
  const imageFace = result.imageFace && await importFromImageStore(result.imageFace)
  const imageSignature = result.imageSig && await importFromImageStore(result.imageSig)

  const results = result.jsonResult.map(normalizeJSON)
  const json = processListVerifiedFields(results)

  return { json, results, imageFront, imageBack, imageFace, imageSignature }
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

