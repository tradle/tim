console.log('requiring BlinkID.js')
import { Platform } from 'react-native'
import PropTypes from 'prop-types'
import withDefaults from 'lodash/defaults'
import groupBy from 'lodash/groupBy'
// import BlinkID from 'react-native-blinkid'
import { BlinkID, MRTDKeys, USDLKeys, EUDLKeys, MYKADKeys } from 'blinkid-react-native'
import validateResource from '@tradle/validate-resource'
import { microblink } from '../utils/env'
import { isSimulator } from '../utils/utils'

const { sanitize } = validateResource.utils
const defaults = {
  enableBeep: true,
  useFrontCamera: false,
  shouldReturnFaceImage: true,
  shouldReturnCroppedImage: true,
  // shouldReturnSuccessfulImage: true,
  recognizers: [
    // scans documents with face image and returns document images
    // BlinkID.RECOGNIZER_DOCUMENT_FACE,
    // scans documents with MRZ (Machine Readable Zone)
    BlinkID.RECOGNIZER_MRTD,
    // scans USDL (US Driver License)
    BlinkID.RECOGNIZER_USDL,
    // scans EUDL (EU Driver License)
    BlinkID.RECOGNIZER_EUDL,
    // scans MyKad (Malaysian ID)
    BlinkID.RECOGNIZER_MYKAD
  ]
}

let licenseKey

const setLicenseKey = value => licenseKey = value
const scan = (function () {
  if (isSimulator()) return
  if (!microblink || !BlinkID || BlinkID.notSupportedBecause) return

  licenseKey = Platform.select(microblink.licenseKey)
  if (!licenseKey) return

  return async (opts) => {
    const result = await BlinkID.scan(licenseKey, withDefaults(opts, defaults))
    const image = result.images.cropped
    if (image) {
      result.image = {
        base64: 'data:image/jpeg;base64,' + image.base64,
        ...image
      }
    }

    for (const item of result.resultList) {
      const type = item.resultType.toLowerCase().replace(/\s+result$/, '')
      result[type] = item.fields
    }

    delete result.resultList

    for (let p in result) {
      let normalize = normalizers[p]
      if (normalize) {
        result[p] = normalize(result[p])
      }
    }

    return sanitize(result).sanitized
  }
}());

const dismiss = BlinkID && (BlinkID.dismiss || BlinkID.cancel)
const recognizers = {
  mrtd: BlinkID.RECOGNIZER_MRTD,
  eudl: BlinkID.RECOGNIZER_EUDL,
  usdl: BlinkID.RECOGNIZER_USDL,
  mykad: BlinkID.RECOGNIZER_MYKAD,
  face: BlinkID.RECOGNIZER_DOCUMENT_FACE
}

export default { scan, dismiss, recognizers, setLicenseKey }

function normalizeEUDLResult (result) {
  result = {
    personal: {
      firstName: result[EUDLKeys.FirstName],
      lastName: result[EUDLKeys.LastName],
      address: result[EUDLKeys.Address],
      birthData: result[EUDLKeys.BirthData],
    },
    document: {
      dateOfExpiry: result[EUDLKeys.ExpiryDate],
      dateOfIssue: result[EUDLKeys.IssueDate],
      issuer: result[EUDLKeys.IssuingAuthority],
      documentNumber: result[EUDLKeys.DriverNumber],
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

  const sex = result[MRTDKeys.Sex]
  result = {
    personal: {
      firstName: result[MRTDKeys.SecondaryId],
      lastName: result[MRTDKeys.PrimaryId],
      sex: sex === 'M' || sex === 'F' ? sex : undefined,
      dateOfBirth: result[MRTDKeys.DateOfBirth],
      nationality: result[MRTDKeys.Nationality]
    },
    document: {
      documentNumber: result[MRTDKeys.DocumentNumber],
      dateOfExpiry: result[MRTDKeys.DateOfExpiry],
      issuer: result[MRTDKeys.Issuer],
      opt1: result[MRTDKeys.Opt1],
      opt2: result[MRTDKeys.Opt2],
      mrzText: result[MRTDKeys.MRZText],
      /*
       * Document code. Document code contains two characters. For MRTD the first character shall
       * be A, C or I. The second character shall be discretion of the issuing State or organization except
       * that V shall not be used, and `C` shall not be used after `A` except in the crew member certificate.
       * On machine-readable passports (MRP) first character shall be `P` to designate an MRP. One additional
       * letter may be used, at the discretion of the issuing State or organization, to designate a particular
       * MRP. If the second character position is not used for this purpose, it shall be filled by the filter
       * character '<'.
       */
      documentCode: result[MRTDKeys.DocumentCode],
      // US Green Card only
      applicationReceiptNumber: result[MRTDKeys.ApplicationReceiptNumber],
      alienNumber: result[MRTDKeys.AlienNumber],
      immigrantCaseNumber: result[MRTDKeys.ImmigrantCaseNumber],
    }
  }

  const { personal, document } = result
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

function normalizeUSDLResult (result) {
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

  const sex = String(result[USDLKeys.Sex])
  result = {
    personal: {
      dateOfBirth: result[USDLKeys.DateOfBirth],
      sex: sex === '1' ? 'M' : sex === '2' ? 'F' : undefined,
      firstName: result[USDLKeys.CustomerFirstName],
      lastName: result[USDLKeys.CustomerFamilyName],
      middleName: result[USDLKeys.CustomerMiddleName],
      eyeColor: result[USDLKeys.EyeColor],
      hairColor: result[USDLKeys.HairColor],
      heightCm: result[USDLKeys.HeightCm],
      heightIn: result[USDLKeys.HeightIn],
      weightKg: result[USDLKeys.WeightKilograms],
      weightLb: result[USDLKeys.WeightPounds],
      race: result[USDLKeys.RaceEthnicity],
      country: result[USDLKeys.CountryIdentification],
      address: {
        street: result[USDLKeys.AddressStreet],
        stree2: result[USDLKeys.AddressStreet2],
        city: result[USDLKeys.AddressCity],
        region: result[USDLKeys.AddressJurisdictionCode],
        postalCode: result[USDLKeys.AddressPostalCode],
        full: result[USDLKeys.FullAddress],
      }
    },
    document: {
      documentNumber: result[USDLKeys.CustomerIdNumber],
      dateOfExpiry: result[USDLKeys.DocumentExpirationDate],
      dateOfIssue: result[USDLKeys.DocumentIssueDate],
      issuer: result[USDLKeys.IssuerIdentificationNumber],
    }
  }

  normalizeDates(result, parseUSDate)
  return result
}

function normalizeDates (result, normalizer) {
  const { personal, document } = result
  if (typeof personal.dateOfBirth === 'string') {
    personal.dateOfBirth = normalizer(personal.dateOfBirth)
  }

  if (typeof document.dateOfExpiry === 'string') {
    document.dateOfExpiry = normalizer(document.dateOfExpiry)
  }

  if (typeof document.dateOfIssue === 'string') {
    document.dateOfIssue = normalizer(document.dateOfIssue)
  }

  return result
}

function parseMRTDDate (str) {
  const { day, month, year } = parseYYMMDD(str)
  return dateFromParts({ day, month, year })
}

function parseEUDate (str) {
  const [day, month, year] = str.split('.')
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

/**
 * @return {Number} UTC millis
 */
function dateFromParts ({ day, month, year }) {
  year = Number(year)
  month = Number(month) - 1
  day = Number(day)
  return Date.UTC(year, month, day)
}

const normalizers = {
  mrtd: normalizeMRTDResult,
  usdl: normalizeUSDLResult,
  eudl: normalizeEUDLResult
}
