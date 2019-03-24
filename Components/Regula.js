import { Platform, Alert } from 'react-native'
import _ from 'lodash'

import { requestCameraAccess } from '../utils/camera'
import { getGlobalKeeper } from '../utils/keeper'
import { isSimulator, sanitize, isEmpty, getModel, buildStubByEnumTitleOrId, isAndroid } from '../utils/utils'
import { scan, Scenario } from '../utils/regula'
// import DeviceInfo from 'react-native-device-info'
const COUNTRY = 'tradle.Country'

const regulaScan = (function () {
  if (isSimulator()) return
  return async (opts) => {
    if (!await requestCameraAccess()) {
      throw new Error('user denied camera access')
    }

    let { bothSides } = opts
    let scanOpts = {
      processParams: {
        scenario: Scenario.ocr, // isLowEndDevice  &&  Scenario.ocr  ||  Scenario.fullProcess,
        multipageProcessing: bothSides,
        // rfidScenario: true,
        // sessionLogFolder: '.'
      },
      // functionality: {
      //   showCaptureButton: true
      // }
    }
    // if (isAndroid()) {
    //   let totalMem = DeviceInfo.getTotalMemory() / 1000000000
    //   if (totalMem < 2) {
    //    if set then as soon as doc is located the picture is taken and processed as a single frame
    //     scanOpts.functionality = {
    //       pictureOnBoundsReady: true
    //     }
    //   }
    // }
    let result
    try {
      result = await scan(scanOpts)
    } catch (err) {
      // debugger
      console.log('regula scan failed: ' + JSON.stringify(scanOpts, 0, 2), err.stack)
      return { canceled: err.message === 'Cancelled by user' || err.message === 'Canceled by user'}
    }
    if (!result)
      return
    let { imageFront, imageBack, imageFace, imageSignature, results, json } = result
    let { scanResult, country } = normalizeResult({results, json})
    return postProcessResult({result: scanResult, imageFront, imageBack, imageFace, imageSignature, country, json})
  }
}());

export default { regulaScan }

const normalizeResult = ({results, json}) => {
  if (isEmpty(json))
    return {}
  let address, city
  if (json.ft_Address) {
    if (json.ft_Issuing_State_Code === 'NZL') {
      let arr = json.ft_Address.split('^')
      address = arr[0]
      city = arr.length > 1  &&  arr[1]
    }
    else
      address = json.ft_Address.replace('^', ' ')
      // address = json.ft_Address
  }
  let result = {
    personal: {
      firstName: json.ft_Given_Names || json.ft_Surname_And_Given_Names,
      lastName: json.ft_Surname || json.ft_Fathers_Name,
      middleName: json.ft_Middle_Name,
      full: address,
      city,
      country: json.ft_Country,
      dateOfBirth: json.ft_Date_of_Birth,
      nationality: json.ft_Nationality_Code,
      sex: json.ft_Sex
    },
    document: {
      dateOfExpiry: json.ft_Date_of_Expiry,
      dateOfIssue: json.ft_Date_of_Issue || json.ft_Date_of_Registration,
      issuer: json.ft_Place_of_Issue || json.ft_Authority || json.ft_Issuing_State_Code,
      country: json.ft_Issuing_State_Code,
      documentNumber: json.ft_Document_Number || json.ft_RegCert_RegNumber,
      documentVersion: json.ft_DL_Restriction_Code
    }
  }
  let { personal, document } = result
  if (document.issuer === 'VNM'  &&  !personal.lastName) {
    let parts = personal.firstName  &&  personal.firstName.split(' ') || []
    if (parts.length > 2) {
      personal.lastName = parts[0]
      personal.middleName = parts.slice(1, parts.length - 1).join(' ')
      personal.firstName = parts[parts.length - 1]
    }
  }
  // debugger
  normalizeDates(result, parseDate)
  // let docType
  // switch (json.ft_Document_Class_Code) {
  // case 'P':
  //   docType = 'passport'
  //   break
  // case 'I':
  //   docType = 'id'
  //   break
  // default:
  //   docType = 'license'
  // }

  // let docTypeM = getModel('tradle.IDCardType')
  // let documentType = buildStubByEnumTitleOrId(docTypeM, docType)
  let country, countryId
  let countryCode = json.ft_Issuing_State_Code
  if (countryCode) {
    country = getModel(COUNTRY).enum.find(c => c.cca3 === countryCode)
    if (country) {
      countryId = country.id
      country = buildStubByEnumTitleOrId(getModel(COUNTRY), country.id)
    }
  }
  if (countryId === 'NZ') {
    let names = result.personal.firstName && result.personal.firstName.split('^')
    if (names  &&  names.length > 1) {
      result.personal.firstName = names[0]
      result.personal.middleName = names[1]
    }
  }

  return { scanResult: result, country }
}

const postProcessResult = ({ result, imageFront, imageBack, imageFace, imageSignature, country, json }) => {
  if (!result)
    return
  let ret = {
    scanJson: result,
    imageFront,
    imageBack,
    imageFace,
    imageSignature,
    country,
    documentType: json.ft_DL_Class && 'DL' || json.ft_Document_Class_Code
  }
  return sanitize(ret)
}

function parseDate (str) {
  const [month, day, year] = str.split('/')
  return dateFromParts({ day, month, year })
}

/**
 * @return {Number} UTC millis
 */
function dateFromParts ({ day, month, year }) {
  year = Number(year)
  month = Number(month) - 1
  day = Number(day)
  return Date.UTC(year, month, day)
}
function normalizeDates (result) {
  const { personal, document } = result
  if (personal.dateOfBirth)
    personal.dateOfBirth = parseDate(personal.dateOfBirth)
  if (document.dateOfExpiry)
    document.dateOfExpiry = parseDate(document.dateOfExpiry)
  if (document.dateOfIssue)
    document.dateOfIssue = parseDate(document.dateOfIssue)

  return result
}
