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
