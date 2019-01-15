/*
import { Platform, Alert } from 'react-native'
// import withDefaults from 'lodash/defaults'
// import groupBy from 'lodash/groupBy'
// import BlinkID from 'react-native-blinkid'
import * as BlinkID from 'blinkid-react-native';
// import { BlinkID , MrtdKeys, UsdlKeys, EUDLKeys, NzdlFrontKeys as NZDLKeys, MYKADKeys } from 'blinkid-react-native'
const UsdlKeys = BlinkID.UsdlKeys
import { microblink } from '../utils/env'
import _ from 'lodash'
import { isSimulator, keyByValue, sanitize } from '../utils/utils'
import { requestCameraAccess } from '../utils/camera'
import { replaceDataUrls } from '../utils/image-utils'

const recognizers = {
  // scans documents with face image and returns document images
  // BlinkID.RECOGNIZER_DOCUMENT_FACE,
  // scans documents with MRZ (Machine Readable Zone)
  mrtd:  BlinkID.MrtdRecognizer, // BlinkID.RECOGNIZER_MRTD,
  mrtdCombined: BlinkID.MrtdCombinedRecognizer,
  // scans EUDL (EU Driver License)
  eudl: BlinkID.EudlRecognizer,
  // scans USDL (US Driver License)
  usdl: BlinkID.UsdlRecognizer,
  usdlCombined: BlinkID.UsdlCombinedRecognizer,
  // scans NZDL (NZ Driver License)
  nzdl: BlinkID.NewZealandDlFrontRecognizer,
  // Australia DL
  australiaFront: BlinkID.AustraliaDlFrontRecognizer,
  australiaBack: BlinkID.AustraliaDlBackRecognizer,
  // scans MyKad (Malaysian ID)
  // myKadBack: BlinkID.MyKadBackRecognizer,
  // myKadFront: BlinkID.MyKadFrontRecognizer,
  documentFace: BlinkID.DocumentFaceRecognizer,
  pdf417: BlinkID.Pdf417Recognizer,
  barcode: BlinkID.BarcodeRecognizer,
}

// const defaults = {
//   enableBeep: true,
//   useFrontCamera: false,
//   shouldReturnFaceImage: true,
//   shouldReturnDocumentImage: true,
//   // shouldReturnSignatureImage: true,
//   // shouldReturnSuccessfulImage: true,
//   recognizers: getValues(recognizers)
// }
// const parser = new xml2js.Parser({ explicitArray: false, strict: false })
// // parser = Promise.promisifyAll(parser)
// // TODO: make checkIDDocument ready at the end of constructor
// // don't make people wait for ready promise to resolve
// var parseXML = parser.parseString.bind(parser)

let licenseKey

const setLicenseKey = async (value) => licenseKey = value

const scan = (function () {
  if (isSimulator()) return
  if (!microblink || !BlinkID || BlinkID.notSupportedBecause) return

  licenseKey = Platform.select(microblink.licenseKey)
  if (!licenseKey) return

  return async (opts) => {
    if (!await requestCameraAccess()) {
      throw new Error('user denied camera access')
    }

    let types = []
    let isCombined
    let frameGrabbers = opts.recognizers.map(r => {
      // const type = keyByValue(recognizers, r)
      // let rec = new BlinkID[r]()
      let rec = new r()
      isCombined = rec.recognizerType.indexOf('Combined') !== -1
      types.push(keyByValue(recognizers, r))

      rec.returnFullDocumentImage = true
      if (rec instanceof BlinkID.DocumentFaceRecognizer)
        rec.returnFaceImage = true
      else {
        // TODO: this component shouldn't need to know about Tradle's enum structures!
        // rec.returnFaceImage = true
        // rec.returnSignatureImage = true
        // rec.setAllowUnparsedResults = true
        // rec.setAllowUnverifiedResults = true
        if (opts.country.title === 'Bangladesh'  &&
            opts.documentType.id.indexOf('_id') !== -1) {
          rec.allowUnverifiedResults = true
          rec.allowUnparsedResults = true
        }
      }
      if (rec instanceof BlinkID.BarcodeRecognizer) {
        if (opts.country.title === 'Bangladesh')
          rec.scanPdf417 = true
      }
      if (rec instanceof BlinkID.MrtdCombinedRecognizer  ||  rec instanceof BlinkID.UsdlCombinedRecognizer) {
        rec.numStableDetectionsThreshold = 10
        rec.fullDocumentImageDpi = 400
      }
      // let fName = type.charAt(0).toUpperCase() + type.slice(1);
      return isCombined ? rec : new BlinkID.SuccessFrameGrabberRecognizer(rec)
    })

    const { firstSideInstructions, secondSideInstructions, scanBothSides } = opts
    let overlaySettings
    if (isCombined) {
      overlaySettings = new BlinkID.DocumentVerificationOverlaySettings({
        firstSideInstructions,
        secondSideInstructions,
      })
    } else {
      overlaySettings = new BlinkID.DocumentOverlaySettings({
        tooltipText: firstSideInstructions,
      })
    }

    let result
    if (scanBothSides) {
      try {
        result = []
        let r = await BlinkID.BlinkID.scanWithCamera(
          overlaySettings,
          new BlinkID.RecognizerCollection([frameGrabbers[0]]),
          licenseKey) //, withDefaults(opts, defaults))
        if (r.length  &&  r[0].resultState === 3)
          result.push(r[0])
        r = await BlinkID.BlinkID.scanWithCamera(
          overlaySettings,
          new BlinkID.RecognizerCollection([frameGrabbers[1]]),
          licenseKey) //, withDefaults(opts, defaults))
        if (r.length  &&  r[0].resultState === 3)
          result.push(r[0])
      } catch (err) {
        Alert.alert(err)
        return
      }
    }
    else {
      try {
        result = await BlinkID.BlinkID.scanWithCamera(
          overlaySettings,
          new BlinkID.RecognizerCollection(frameGrabbers),
          licenseKey) //, withDefaults(opts, defaults))
      } catch (err) {
        Alert.alert(err)
        return
      }
    }
    if (!result.length)
      return
    let normalized = result.map((r, i) =>  postProcessResult({ type: types[i], result: r, isCombined }))
    if (scanBothSides  &&  normalized.length === 2)
      _.merge(normalized[0], normalized[1])
    // debugger
    return replaceDataUrls(normalized[0])
  }
}());


const postProcessResult = ({ type, result, isCombined }) => {
  let scanData = isCombined ? result : result.slaveRecognizerResult
  if (!scanData)
    return

  const normalize = normalizers[type]
  let photoId
  if (normalize)
    photoId = normalize(scanData)

  const image = scanData.fullDocumentImage       ||
                scanData.fullDocumentFrontImage  ||
                result.successFrame
  const backImage = scanData.fullDocumentBackImage
  let ret = {
    [type]: photoId,
    images: {
      face: scanData.faceImage,
      successful: result.successful || result.resultImageSuccessful,
      signature: scanData.signatureImage,
      document: image,
    },
    image: image  &&  { base64: 'data:image/jpeg;base64,' + image },
    backImage: backImage  &&  { base64: 'data:image/jpeg;base64,' + backImage },
  }
  return sanitize(ret)
}

const dismiss = BlinkID && (BlinkID.dismiss || BlinkID.cancel)

export default { scan, dismiss, recognizers, setLicenseKey }
export { scan, dismiss, recognizers, setLicenseKey }

function normalizeEUDLResult (result) {

  // "resultState": 2,
  // "address": "CRESCENT I,J EDINBURGH I- EH1 9GP",
  // "birthData": "11.03.1976 UNITED KINGDOM",
  // "country": 1,
  // "driverNumber": "MORGA753116SM9IJ 35",
  // "expiryDate": { ... },
  // "issueDate": { ... }
  // "issuingAuthority": "DVLA",
  // "lastName": "MORGAN L.I",
  // "personalNumber": ""
  result = {
    personal: {
      firstName: result.firstName,
      lastName: result.lastName,
      address: result.address,
      birthData: result.birthData,
    },
    document: {
      dateOfExpiry: result.expiryDate,
      dateOfIssue: result.issueDate,
      issuer: result.issuingAuthority,
      documentNumber: result.driverNumber,
    }
  }

  const { personal } = result
  const { birthData } = personal
  if (birthData) {
    const match = birthData.match(/^(\d+\.\d+\.\d+)/)
    if (match) {
      personal.dateOfBirth = match[1]
    }
  }

  normalizeDates(result, parseEUDate)
  return result
}

function normalizeNZDLResult (result) {
  // NewZealandDLAddress.Address:""
  // NewZealandDLCardVersion.CardVersion:"453"
  // NewZealandDLCardVersionNew.CardVersion:"453"
  // NewZealandDLCardVersionOld.CardVersion:""
  // NewZealandDLDonorIndicator.DonorIndicator:"1"
  // NewZealandDLFirstNames.FirstName:"JOHN JACOB DEAN"
  // NewZealandDLLicenseNumber.LicenseNumber:"AB123456"
  // NewZealandDLLicenseNumberNew.LicenseNumber:"AB123456"
  // NewZealandDLLicenseNumberOld.LicenseNumber:""
  // NewZealandDLSurname.Surname:"SMITH"
  // PaymentDataType:"NewZealandDLFront"
  // documentClassification:"NewZealandDLFrontNew"

  const personal = {
    dateOfBirth: result.dateOfBirth,
    firstName: normalizeWhitespace(result.firstNames),
    lastName: normalizeWhitespace(result.surname),
  }

  const document = {
    documentNumber: result.licenseNumber,
    documentVersion: result.cardVersion,
    // this is scanned incorrectly as dateOfBirth sometimes
    // and is not present on most licenses' front sides
    // dateOfIssue: result[NZDLKeys.IssueDate],
    dateOfExpiry: result.expiryDate,
    isDonor: result.donorIndicator
  }

  result = { personal, document }
  normalizeDates(result, parseNZDate)
  return result
}

function normalizeMRTDResult (result) {
  // "ImmigrantCaseNumber": "",
  // "MRTDRaw": "P<GBROTHER<<ADAM<NORMAN<<<<<<<<<<<<<<<<<<<<<\n0740254727GBS6001010M2002020<<<<<<<<<<<<<<04\n",
  // "Opt1": "<<<<<<<<<<<<<<",
  // "AlienNumber": "",
  // "PaymentDataType": "MRTD data",
  // "ApplicationRecieptNumber": "",
  // "Issuer": "GBR",
  // "Nationality": "GBS",
  // "DateOfExpiry": "200202",
  // "MrtdDocumentType": "2",
  // "MrtdParsed": "1",
  // "DocumentCode": "P<",
  // "DocumentNumber": "074025472",
  // "DateOfBirth": "600101",
  // "MrtdVerified": "1",
  // "Sex": "M",
  // "Opt2": "",
  // "PrimaryId": "OTHER",
  // "SecondaryId": "ADAM NORMAN"
  let mrzResult = result.mrzResult || result
  const sex = mrzResult.gender
  result = {
    personal: {
      firstName: mrzResult.secondaryId,
      lastName: mrzResult.primaryId,
      sex: sex === 'M' || sex === 'F' ? sex : undefined,
      dateOfBirth: mrzResult.dateOfBirth,
      nationality: mrzResult.nationality
    },
    document: {
      documentNumber: mrzResult.documentNumber,
      dateOfExpiry: mrzResult.dateOfExpiry,
      issuer: mrzResult.issuer,
      opt1: mrzResult.opt1,
      opt2: mrzResult.opt2,
      mrzText: mrzResult.mrzText,
      mrzParsed: mrzResult.mrzParsed,
      mrzVerified: mrzResult.mrzVerified,

       * Document code. Document code contains two characters. For MRTD the first character shall
       * be A, C or I. The second character shall be discretion of the issuing State or organization except
       * that V shall not be used, and `C` shall not be used after `A` except in the crew member certificate.
       * On machine-readable passports (MRP) first character shall be `P` to designate an MRP. One additional
       * letter may be used, at the discretion of the issuing State or organization, to designate a particular
       * MRP. If the second character position is not used for this purpose, it shall be filled by the filter
       * character '<'.

      documentCode: mrzResult.documentCode,
      // US Green Card only
      applicationReceiptNumber: mrzResult.applicationReceiptNumber,
      alienNumber: mrzResult.alienNumber,
      immigrantCaseNumber: mrzResult.immigrantCaseNumber,
    }
  }
  normalizeDates(result, parseMRTDDate)

  // const { mrzText } = document
  // const mrzParts = mrzText
  //   .split('\n')
  //   .map(s => s.trim())
  //   .filter(s => s)

  // const mrz = MRZ.parse(mrzParts)
  // const { birthDate, expirationDate } = mrz.fields
  // personal.dateOBirthStr = birthDate
  // personal.dateOfBirth = dateFromParts(parseYYMMDD(birthDate))
  // document.dateOfExpiryStr = expirationDate
  // document.dateOfExpiry = dateFromParts(parseYYMMDD(expirationDate))
  return result
}

// courtesy of https://github.com/newtondev/mrz-parser
function parseYYMMDD (str) {
  let d = new Date()
  d.setFullYear(d.getFullYear() + 15)
  let centennial = (""+d.getFullYear()).substring(2, 4)

  let year
  if (str.slice(0, 2) > centennial) {
    year = '19' + str.slice(0, 2)
  } else {
    year = '20' + str.slice(0, 2)
  }

  return {
    year: parseInt(year, 10),
    month: parseInt(str.slice(2, 4), 10),
    day: parseInt(str.slice(4, 6), 10),
    original: str
  }
}
function normalizeBarcodeResult (result) {
  let ret = {}
  let s = `<xml>${result.stringData}</xml>`
  this.parseXML(s, (err, result) => {
     ret = JSON.stringify(result, 0, 2)
  })
  return ret
}
function normalizeUSDLResult (scanned) {
  // "Full Address": "2345 ANYWHERE STREET, YOUR CITY, NY, 123450000",
  // "Jurisdiction-specific restriction codes": "NONE",
  // "pdf417": "@\n\u001e\rANSI 636001070002DL00410392ZN04330047DLDCANONE  \nDCBNONE        \nDCDNONE \nDBA08312013\nDCSMichael                                 \nDACM                                       \nDADMotorist                                \nDBD08312013\nDBB08312013\nDBC1\nDAYBRO\nDAU064 in\nDAG2345 ANYWHERE STREET               \nDAIYOUR CITY           \nDAJNY\nDAK123450000  \nDAQNONE                     \nDCFNONE                     \nDCGUSA\nDDEN\nDDFN\nDDGN\n\rZNZNAMDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5\n\r",
  // "PaymentDataType": "US Driver's License",
  // "Address - Postal Code": "123450000",
  // "Address - City": "YOUR CITY",
  // "Country Identification": "USA",
  // "Document Discriminator": "NONE",
  // "Address - Jurisdiction Code": "NY",
  // "Jurisdiction Version Number": "0",
  // "Jurisdiction-specific vehicle class": "NONE",
  // "Sex": "1",
  // "Document Issue Date": "08312013",
  // "Jurisdiction-specific endorsement codes": "NONE",
  // "Customer Family Name": "Michael",
  // "Customer First Name": "M",
  // "Customer ID Number": "NONE",
  // "Height": "64 in",
  // "Family name truncation": "N",
  // "Standard Version Number": "7",
  // "Customer Name": "Michael,M,Motorist",
  // "Address - Street 1": "2345 ANYWHERE STREET",
  // "Document Type": "AAMVA",
  // "Eye Color": "BRO",
  // "Height in": "64",
  // "Customer Middle Name": "Motorist",
  // "Issuing jurisdiction": "ZN",
  // "Date of Birth": "08312013",
  // "Issuing jurisdiction name": "New York",
  // "Issuer Identification Number": "636001",
  // "Middle name truncation": "N",
  // "Document Expiration Date": "08312013",
  // "uncertain": "0",
  // "Height cm": "163",
  // "First name truncation": "N",
  // "ZNA": "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5"
  let result = scanned.fields
  const sex = String(result[UsdlKeys.Sex])
  result = {
    personal: {
      dateOfBirth: result[UsdlKeys.DateOfBirth],
      sex: sex === '1' ? 'M' : sex === '2' ? 'F' : undefined,
      firstName: result[UsdlKeys.CustomerFirstName],
      lastName: result[UsdlKeys.CustomerFamilyName],
      middleName: result[UsdlKeys.CustomerMiddleName],
      eyeColor: result[UsdlKeys.EyeColor],
      hairColor: result[UsdlKeys.HairColor],
      heightCm: result[UsdlKeys.HeightCm],
      heightIn: result[UsdlKeys.HeightIn],
      weightKg: result[UsdlKeys.WeightKilograms],
      weightLb: result[UsdlKeys.WeightPounds],
      race: result[UsdlKeys.RaceEthnicity],
      country: result[UsdlKeys.CountryIdentification],
      address: {
        street: result[UsdlKeys.AddressStreet],
        stree2: result[UsdlKeys.AddressStreet2],
        city: result[UsdlKeys.AddressCity],
        region: result[UsdlKeys.AddressJurisdictionCode],
        postalCode: result[UsdlKeys.AddressPostalCode],
        full: result[UsdlKeys.FullAddress],
      }
    },
    document: {
      documentNumber: result[UsdlKeys.CustomerIdNumber],
      dateOfExpiry: result[UsdlKeys.DocumentExpirationDate],
      dateOfIssue: result[UsdlKeys.DocumentIssueDate],
      issuer: result[UsdlKeys.IssuerIdentificationNumber],
    }
  }

  normalizeDates(result, parseUSDate)
  return result
}
function normalizeAUFront(scanned) {
// {
//   "resultState": 3,
//   "address": "FLAT 10\n77 SAMPLE PARADE\nKEVV EAST VIC 3102",
//   "dateOfBirth": {
//     "day": 29,
//     "month": 7,
//     "year": 1983
//   },
//   "dateOfExpiry": {
//     "day": 20,
//     "month": 5,
//     "year": 2019
//   },
//   "licenceNumber": "987654321",
//   "licenceType": "CAR",
//   "name": "JANE CITIZEN"
// }"
  let result = {
    personal: {
      firstName: scanned.name,
      lastName: scanned.name,
      address: scanned.address,
      birthData: scanned.dateOfBirth,
    },
    document: {
      dateOfExpiry: scanned.dateOfExpiry,
      documentNumber: scanned.licenceNumber,
      "licenceType": scanned.licenceType
    }
  }
  normalizeDates(result)
  return result
}
function normalizeAUBack(scanned) {
  // "address",
  // "dateOfExpiry"
  // "fullDocumentImage"
  // "lastName"
  // "licenceNumber"
  return scanned
}

function normalizeDates (result, normalizer) {
  const { personal, document } = result
  if (personal.dateOfBirth) {
    if (typeof personal.dateOfBirth === 'string')
      personal.dateOfBirth = normalizer(personal.dateOfBirth)
    else
      personal.dateOfBirth = getUTCDate(personal.dateOfBirth)
  }
  if (document.dateOfExpiry) {
    if (typeof document.dateOfExpiry === 'string')
      document.dateOfExpiry = normalizer(document.dateOfExpiry)
    else
      document.dateOfExpiry = getUTCDate(document.dateOfExpiry)
  }
  if (document.dateOfIssue) {
    if (typeof document.dateOfIssue === 'string')
      document.dateOfIssue = normalizer(document.dateOfIssue)
    else
      document.dateOfIssue = getUTCDate(document.dateOfIssue)
  }

  return result
}
function getUTCDate({year, month, day}) {
  return dateFromParts({ day, month, year })
}

function parseMRTDDate (str) {
  const { day, month, year } = parseYYMMDD(str)
  return dateFromParts({ day, month, year })
}

function parseEUDate (str) {
  const [day, month, year] = str.split('.')
  return dateFromParts({ day, month, year })
}

function parseNZDate (str) {
  const [day, month, year] = str.split('-')
  return dateFromParts({ day, month, year })
}

function parseUSDate (str) {
  const [month, day, year] = [
    str.slice(0, 2),
    str.slice(2, 4),
    str.slice(4)
  ]

  return dateFromParts({ day, month, year })
}

**
 * @return {Number} UTC millis
 *
function dateFromParts ({ day, month, year }) {
  year = Number(year)
  month = Number(month) - 1
  day = Number(day)
  return Date.UTC(year, month, day)
}

const normalizers = {
  mrtd: normalizeMRTDResult,
  mrtdCombined: normalizeMRTDResult,
  usdl: normalizeUSDLResult,
  usdlCombined: normalizeUSDLResult,
  eudl: normalizeEUDLResult,
  nzdl: normalizeNZDLResult,
  australiaFront: normalizeAUFront,
  australiaBack: normalizeAUBack,
  barcode: normalizeBarcodeResult,
}

const normalizeWhitespace = str => {
  if (!str) return str

  // normalize spaces
  return str.replace(/[\s]+/g, ' ').trim()
}
*/
/*
const scan1 = (function () {
  if (isSimulator()) return
  if (!microblink || !BlinkID || BlinkID.notSupportedBecause) return

  licenseKey = Platform.select(microblink.licenseKey)
  if (!licenseKey) return

  return async (opts) => {
    let types = []
    let isCombined
    let res = []
    for (let i=0; i<opts.recognizers.length; i++) {
      let r = opts.recognizers[i]
      // const type = keyByValue(recognizers, r)
      // let rec = new BlinkID[r]()
      let rec = new r()
      isCombined = rec.recognizerType.indexOf('Combined') !== -1
      let type = keyByValue(recognizers, r)
      types.push(type)

      rec.returnFullDocumentImage = true
      if (rec instanceof BlinkID.DocumentFaceRecognizer)
        rec.returnFaceImage = true
      else {
        // rec.returnFaceImage = true
        // rec.returnSignatureImage = true
        // rec.setAllowUnparsedResults = true
        // rec.setAllowUnverifiedResults = true
        rec.allowUnparsedResults = true
        if (opts.country.title === 'Bangladesh'  &&
            opts.documentType.id.indexOf('_id') !== -1)
          rec.allowUnverifiedResults = true
      }
      if (rec instanceof BlinkID.BarcodeRecognizer) {
        if (opts.country.title === 'Bangladesh')
          rec.scanPdf417 = true
      }
      // let fName = type.charAt(0).toUpperCase() + type.slice(1);
      let fr = isCombined ? rec : new BlinkID.SuccessFrameGrabberRecognizer(rec)

      const result = await BlinkID.BlinkID.scanWithCamera(
        isCombined ? new BlinkID.DocumentVerificationOverlaySettings() : new BlinkID.DocumentOverlaySettings(),
        new BlinkID.RecognizerCollection([fr]),
        licenseKey) //, withDefaults(opts, defaults))
      if (!result.length)
        return
      let normalized = postProcessResult({ type, result: result[0], isCombined })
      // debugger
      res.push(normalized)
    }
    if (res.length === 1)
      return res[0]

    let idx = types.indexOf('documentFace')
    if (idx === -1)
      return res[0]
      // res.images.face = res[idx].image
    let r = res[idx && 0 || 1]
    r.image = res[idx].image

    return r
  }
}());
*/
