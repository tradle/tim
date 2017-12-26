console.log('requiring driverLicenseParser.js')
'use strict'
/**
 * adapted from Java implementation of the same parser
 * https://github.com/tianhsky/driver_license_decoder
 */
const fields = {
    "DAA": "Name",
    "DLDAA": "Name",
    "DAB": "LastName",
    "DCS": "LastName",
    "DAC": "FirstName",
    "DCT": "FirstName",
    "DAD": "MiddleName",

    "DBC": "Sex",
    "DAU": "Height",
    "DAY": "EyeColor",

    "DAG": "Address",
    "DAI": "City",
    "DAN": "City",
    "DAJ": "State",
    "DAO": "State",
    "DAK": "ZipCode",
    "DAP": "Zipcode",
    "DCG": "Country",

    "DBB": "DOB",
    "DAQ": "DriverLicenseNumber",
    "DBD": "LicenseIssuedDate",
    "DBA": "LicenseExpirationDate",
}
var driverLicenseParser = {

  parse(data) {
    var headers = {}

    // declare
    var complianceIndicator, dataElementSeparator, recordSeparator, segmentTerminator;
    var fileType, entries, subfileType;
    var versionNumber, issuerIdentificationNumber, jurisdictionVerstion, offset, length;

    // extract headers
    complianceIndicator = data.charAt(0);
    dataElementSeparator = data.charAt(1);
    recordSeparator = data.charAt(2);
    segmentTerminator = data.charAt(3);
    fileType = data.substring(4, 9);
    headers.FileType = fileType
    issuerIdentificationNumber = parseInt(data.substring(9, 15));
    headers.IdentificationNumber = issuerIdentificationNumber
    versionNumber = parseInt(data.substring(15, 17));
    headers.VersionNumber = versionNumber

    if (versionNumber <= 1) {
      entries = data.substring(17, 19);
      subfileType = data.substring(19, 21);
      offset = parseInt(data.substring(21, 25));
      length = parseInt(data.substring(25, 29));
    }
    else {
      jurisdictionVerstion = parseInt(data.substring(17, 19));
      headers.JurisdictionVerstion = jurisdictionVerstion
      entries = data.substring(19, 21);
      subfileType = data.substring(21, 23);
      headers.SubfileType = subfileType
      offset = parseInt(data.substring(23, 27));
      length = parseInt(data.substring(27, 31));
    }

    if (fileType === "ANSI ") {
      offset += 2;
    }

    headers.SubfileOffset = offset
    headers.SubfileLength = length

    // subfile
    let subfile = data.substring(offset, offset + length);

    // store in name value pair
    let lines = subfile.split("\n");
    let hm = {}
    lines.forEach((l) => {
      if (l.length > 3) {
        let key = l.substring(0, 3);
        let value = l.substring(3);
        if (fields[key] != null)
          hm[fields[key]] = value;
      }
    })
    return hm
  },
  // makeKey(key) {
  //   let newKey = ''
  //   for (let i=0; i<key.length; i++) {
  //     if (key.charAt(i) === '\''  ||  key.charAt(i) === '\\') {
  //       if (i === 0  ||  key.charAt(i - 1) !== '\\')
  //         newKey += '\\'
  //     }
  //     newKey += key.charAt(i)
  //   }
  // }

}
module.exports = driverLicenseParser;
