import { Platform, Alert } from 'react-native'
import _ from 'lodash'

import { isSimulator, sanitize, isEmpty } from '../utils/utils'
import { requestCameraAccess } from '../utils/camera'
import { getGlobalKeeper } from '../utils/keeper'
import { getModel, buildStubByEnumTitleOrId } from '../utils/utils'
import { scan, Scenario } from '../utils/regula'
// import regulaVisualFieldTypes from '../utils/regulaVisualFieldTypes'

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
        scenario: Scenario.ocr,
      },
      // functionality: {
      //   showCaptureButton: true
      // }
    }

    if (bothSides)
      scanOpts.processParams.multipageProcessing = true

    let result
    try {
      result = await scan(scanOpts)
    } catch (err) {
      debugger
      console.log('regula scan failed', err)
      return
    }
    if (!result)
      return
    let { imageFront, imageBack, results, json } = result
    let { scanResult, country } = normalizeResult({results, json})
    return postProcessResult({result: scanResult, imageFront, imageBack, country})
  }
}());

export default { regulaScan }

const normalizeResult = ({results, json}) => {
  if (isEmpty(json))
    return {}
  // let result = results[0].ListVerifiedFields
  // if (!result)
  //   return {}
  // let fields = result.pFieldMaps
  // let json = {}

  // fields.forEach((f, i) => {
  //   let fieldTypeID = f.FieldType
  //   let val = f.Field_Visual || f.Field_MRZ
  //   let fName
  //   if (val) {
  //     fName = regulaVisualFieldTypes[fieldTypeID]
  //     json[fName] = val
  //   }
  //   else {
  //     val = f.GraphicField
  //   }
  // })
  let result = {
    personal: {
      firstName: json.ft_Given_Names || json.ft_Surname_And_Given_Names,
      lastName: json.ft_Surname || json.ft_Fathers_Name,
      address: json.ft_Address,
      country: json.ft_Country,
      dateOfBirth: json.ft_Date_of_Birth,
      nationality: json.ft_Nationality_Code,
    },
    document: {
      dateOfExpiry: json.ft_Date_of_Expiry,
      dateOfIssue: json.ft_Date_of_Issue,
      issuer: json.ft_Place_of_Issue || json.ft_Authority || json.ft_Issuing_State_Code,
      documentNumber: json.ft_Document_Number,
      documentVersion: json.ft_DL_Restriction_Code
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

const postProcessResult = ({ result, imageFront, imageBack, country }) => {
  if (!result)
    return
  let ret = {
    scanJson: result,
    imageFront,
    imageBack,
    country
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