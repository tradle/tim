import promisify from 'pify'
import get from 'lodash/get'
import size from 'lodash/size'
import getValues from 'lodash/values'
import defaultsDeep from 'lodash/defaultsDeep'
import { Platform } from 'react-native'

import { translate } from '../utils/utils'

import Regula from 'react-native-document-reader-api'
const DocumentReader = Regula.DocumentReader // Regula.RNRegulaDocumentReader
const DocumentReaderResults = DocumentReader.DocumentReaderResults
const Enum = DocumentReader.Enum

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
    orientation: /*Platform.OS === 'ios' ? Enum.DocReaderOrientationIOS.LANDSCAPE :*/ Enum.DocReaderOrientation.LANDSCAPE
  },
  customization: {
    showStatusMessages: true,
    showHelpAnimation: true,
    // status: translate('regulaStatus'),
    // resultStatus: translate('regulaResultStatus'),
    // customLabelStatus: translate(customLabelStatus)
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
      DocumentReader.prepareDatabase(dbID, (respond) => {
        this._prepareSucceeded()
        this.initialize(respond)
      },
      (error) => {
        console.log(error)
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

    DocumentReader.initializeReader(this.initializeOpts.licenseKey, (respond) => {
      // debugger
      if (size(Scenario))
        return
      DocumentReader.getAvailableScenarios((jstring) => {
       // debugger
        let availableScenarios = JSON.parse(jstring)
        if (!availableScenarios.length) {
          this._initializeFailed(respond)
          return
        }

        for (let i in availableScenarios) {
          let name = DocumentReader.Scenario.fromJson(typeof availableScenarios[i] === "string" ? JSON.parse(availableScenarios[i]) : availableScenarios[i]).name
          Scenario[name] = name
        }
        DocumentReader.getDocumentReaderIsReady(isReady => {
          // debugger
          if (isReady === true || isReady === "YES" || isReady == 1)
            this._initializeSucceeded()
          else {
            this._initializeFailed(respond)
            console.log(respond)
          }
        }, error => console.log(error))
      }, error => {
        console.log(error)
      })
      DocumentReader.isRFIDAvailableForUse(canRfid => {
        // debugger
        if (canRfid === true || canRfid === "YES" || canRfid == 1) {
          this._initializeRfidSucceeded()
          isRFIDAvailable = true
        }
      }, error => console.log(error))
    }, error => {
      // debugger
      console.log(error)
    })
  })

  scan = async (opts={}, callback) => {
    await this._initialized
    // await this._initializedRfid
    // await this._initializedScenarios
    // let delta = new Date().getTime() - this.initTime
    // if (delta < DELAY_INTERVAL)
    //   await Promise.delay(delta)
// debugger
    opts = defaultsDeep(opts, DEFAULTS)
    if (!opts.customization.status)
      opts.customization.status = translate('regulaStatus')
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
    }, error => console.log(error))
    DocumentReader.showScanner(jstring => {
      let scan, wasJSON
      if (typeof jstring === 'string')
        scan = JSON.parse(jstring) //.substring(8))
      else {
        scan = jstring
        wasJSON = true
      }
      let results = DocumentReaderResults.fromJson(scan);
      if (wasJSON) {
        let jsonArr = []
        scan.jsonResult.forEach(elm => jsonArr.push(JSON.parse(elm)))
        scan.jsonResult = jsonArr
      }

      // return normalizeResult(JSON.parse(jstring.substring(8)))
      let accessKey
      let readChip
debugger

      // HACK
      if (isRFIDAvailable  &&  !results.chipPage) {
        let docType = results.getTextFieldValueByType(Enum.eVisualFieldType.FT_DOCUMENT_CLASS_CODE)
        let docName = results.getTextFieldValueByType(Enum.eVisualFieldType.FT_DOCUMENT_CLASS_NAME)
        if (docType === 'ID') {
          let documentType = scan.documentType[0]
          if (documentType.name ===  'Cambodia - Id Card #2')
            readChip = true
        }
      }
      // end HACK
      if (!readChip  &&  (!isRFIDAvailable || !results.chipPage)) {
        callback(normalizeResult(scan))
        return
      }
// let imageFocus = results.getQualityResult(Enum.eImageQualityCheckType.IQC_IMAGE_FOCUS);
// // Get status of images' glares
// let imageGlares = results.getQualityResult(Enum.eImageQualityCheckType.IQC_IMAGE_GLARES);

      accessKey = results.getTextFieldValueByType(Enum.eVisualFieldType.FT_MRZ_STRINGS)
      if (accessKey) {
        accessKey = accessKey.replace(/^/g, '').replace(/\n/g, '')
        DocumentReader.setRfidScenario({
          mrz: accessKey,
          pacePasswordType: Enum.eRFID_Password_Type.PPT_MRZ,
        }, (str) => { console.log(str) }, (error) => { console.log(error) });
      }
      else {
        accessKey = results.getTextFieldValueByType(159);
        if (accessKey != null && accessKey != "") {
          DocumentReader.setRfidScenario({
            password: accessKey,
            pacePasswordType: Enum.eRFID_Password_Type.PPT_CAN,
          }, (str) => { console.log(str) }, (error) => { console.log(error) });
        }
      }

      DocumentReader.startRFIDReader((jstring) => {
        debugger
        // if (jstring.startsWith("Success:")) {
        let json = JSON.parse(jstring) //.substring(8))

        if (json.imageFace) {
          json.rfidImageFace = json.imageFace
          json.imageFace = scan.imageFace
        }
        let rfidResult = DocumentReaderResults.fromJson(json)
        let status = rfidResult.getTextFieldStatusByType(Enum.eRFID_NotificationAndErrorCodes.RFID_NOTIFICATION_ERROR)
        debugger
        callback(normalizeResult(json))
          // callback(normalizeResult(rfidResult))
        // }
        // else
        //   callback(normalizeResult(scan))
      }, error => {
        debugger
        console.log(error)
        callback(normalizeResult(scan))
      })
    }, error => {
      debugger
      console.log(error)
    })
  }

  setLicenseKey = async (licenseKey) => {
    this.initializeOpts.licenseKey = licenseKey
  }
}
export default new RegulaProxy()

const normalizeJSON = obj => typeof obj === 'string' ? JSON.parse(obj) : obj
const normalizeResult = async scan => {
  scan = normalizeJSON(scan)
  // not necessary as long as imageStore changes are merged on the native side

  const imageFront = scan.imageFront  &&  await importFromImageStore(scan.imageFront)
  const imageBack = scan.imageBack && await importFromImageStore(scan.imageBack)
  const imageFace = scan.imageFace && await importFromImageStore(scan.imageFace)
  const rfidImageFace = scan.rfidImageFace && await importFromImageStore(scan.rfidImageFace)
  const imageSignature = scan.imageSignature && await importFromImageStore(scan.imageSignature)

  const results = scan.jsonResult.map(normalizeJSON)
  const json = processListVerifiedFields(results)

  return { json, results, imageFront, imageBack, imageFace, rfidImageFace, imageSignature }
}

const processListVerifiedFields = results => {
  let fields, fieldTypes
  let scan = results.find(r => r.ListVerifiedFields)
  if (!scan)
    return

  fields = scan.ListVerifiedFields.pFieldMaps
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

