import { DEFAULT_MERKLE_OPTS, stringify, merkleRoot as computeMerkleRoot } from '@tradle/protocol'
import { parseKeeperUri, isKeeperUri } from '@tradle/embed'
import traverse from 'traverse'
import setPropAtPath from 'lodash/set'

const TRADLE_KEEPER_URI_PREFIX = new Buffer('tradle-keeper://')
const DATA_URI_PREFIX = new Buffer('data:image/')
const isKeeperUriNode = node => node.data.indexOf(TRADLE_KEEPER_URI_PREFIX) !== -1

export const interceptTradleKeeperUris = () => {
  const { leaf } = DEFAULT_MERKLE_OPTS
  DEFAULT_MERKLE_OPTS.leaf = node => {
    if (node.data.indexOf(TRADLE_KEEPER_URI_PREFIX) !== -1) {
      const data = JSON.parse(node.data)
      let path
      let keeperUri
      traverse(data).forEach(function (value) {
        if (typeof value === 'string' && isKeeperUri(value)) {
          this.update(parseKeeperUri(value).hash)
        }
      })

      node.data = new Buffer(stringify(data))
      return DEFAULT_MERKLE_OPTS.leaf(node)
    }

    return leaf(node)
  }

  // console.log('MERKLE ROOT', computeMerkleRoot({
  //   // "_s": "CkkKBHAyNTYSQQTin4O4k9zc5zInvpVPpu6GMqTT55SHSrb9g9ANWZvITJ4VN05hTUd01A5vNVWfMy7SCLya4LcmTTkgrrhNoPlJEkYwRAIgS9Lug23D4ZgitH00nb8T2rT3tc5OMQyPhj0HMDMT8J4CICumeXw1r0oKaFhs7wQk+JfKiU2Iu29T5OGLtY5rT7uz",
  //   "context": "8b10b57aa7f550c56e8e8333d8106ea30fa7d5cb028cbcd7604dd499c93e011d",
  //   "_n": 2,
  //   "_q": "0a28dbc0e6c31ebc1babb7e784edb5bc350e6837fc26d4582f99e04f6beeaff7",
  //   "_t": "tradle.Message",
  //   "object": {
  //     "_s": "CkkKBHAyNTYSQQTin4O4k9zc5zInvpVPpu6GMqTT55SHSrb9g9ANWZvITJ4VN05hTUd01A5vNVWfMy7SCLya4LcmTTkgrrhNoPlJEkgwRgIhANfvthmMAumFyoDKuL01hB4cHoYkYzQchB5gL4feXRtAAiEAqKubnOfwRdnSvTo9B9+gRKa9xL9PlBdm1TEY3vFVnJc=",
  //     "_t": "tradle.PhotoID",
  //     "documentType": {
  //       "id": "tradle.IDCardType_license",
  //       "title": "Valid Driver Licence"
  //     },
  //     "country": {
  //       "id": "tradle.Country_NZ",
  //       "title": "New Zealand"
  //     },
  //     "scan": {
  //       "isVertical": false,
  //       "width": 128,
  //       "height": 128,
  //       "url": "tradle-keeper://6046edbdf4c7b3b2009317001c24ff068f4b7342e75a568bcc88dfbc53d6605d?algorithm=sha256&mimetype=image%2Fjpeg",
  //       "_t": "tradle.Photo"
  //     },
  //     "firstName": "SARAH MEREDYTH",
  //     "lastName": "MORGAN",
  //     "dateOfIssue": 1358553600000,
  //     "documentNumber": "MORGA753116SM9IJ 35",
  //     "issuer": "DVLA",
  //     "dateOfExpiry": 1674000000000,
  //     "scanJson": {
  //       "personal": {
  //         "firstName": "SARAH MEREDYTH",
  //         "birthData": "03/11/1976 UNITED KINGOOM",
  //         "lastName": "MORGAN"
  //       },
  //       "address": {
  //         "full": "122 BURNS CRESCENT EDINBURGH EH1 9GP"
  //       },
  //       "document": {
  //         "dateOfIssue": "01/19/2013",
  //         "country": "NZL",
  //         "documentNumber": "MORGA753116SM9IJ 35",
  //         "personalNumber": null,
  //         "issuer": "DVLA",
  //         "dateOfExpiry": "01/18/2023"
  //       }
  //     },
  //     "dateOfBirth": 195368400000,
  //     "full": "122 BURNS CRESCENT EDINBURGH EH1 9GP",
  //     "otherSideToScan": "back",
  //     "otherSideScan": {
  //       "isVertical": false,
  //       "width": 285,
  //       "height": 177,
  //       "url": "tradle-keeper://27f2d041f49a8e99ef4ed7c6b5b85a54968400115ff1e355d1714cda1b156309?algorithm=sha256&mimetype=image%2Fjpeg",
  //       "_t": "tradle.Photo"
  //     },
  //     "_time": 1542581204215,
  //     "_author": "90c7f9f8090977f0888915487b16e70b372534b8f20a5ded29b8a52213a56d6f"
  //   },
  //   "_recipient": "16ee3aacd754af1f4b75fce53d5d1da58370ba9f2a5a86ad12f4d751d88fd229",
  //   "_time": 1542581204861,
  //   "_author": "90c7f9f8090977f0888915487b16e70b372534b8f20a5ded29b8a52213a56d6f"
  // }).toString('hex'))
}

// const replaceDataUrls = (object, mapper) => {
//   object = cloneDeep(object)
//   traverse(object).forEach(function (value) {
//     if (typeof value === 'string' && value.startsWith('data:')) {
//       this.replace(mapper(value))
//     }
//   })

//   return object
// }

// isKeeperUri(leaf) ? parseKeeperUri(leaf).hash : hash(leaf)
// before merklizing, replace all embedded data urls with their hashes


// model:

// {
//   id: 'tradle.Photo1',
//   properties: {
//     hash: {
//       type: 'string'
//     },
//     _url: {
//       type: 'string,'
//       virtual: true,
//     }
//   }
// }

// // value:

// {
//   _t: 'tradle.Photo1',
//   hash: 'sha256:abcd',
//   width: 800,
//   height: 600,
//   // virtual:
//   _url: 'data:image/jpeg;base64,...',
//   _url: 's3://...',
//   _url: 'tradle-keeper://...',
// }
