import { Platform } from 'react-native'
import Embed from '@tradle/embed'
import RNFetchBlob from 'rn-fetch-blob'
import cloneDeep from 'lodash/cloneDeep'

const getHeadersFromParsedKeeperUri = ({ length, mimetype, mimeType }) => {
  const headers = {
    'Content-Type': mimetype || mimeType,
  }

  if (length) {
    // rn-fetch-blob doesn't like numbers
    headers['Content-Length'] = String(length)
  }

  return headers
}

const uploadFile = async ({ req, fileUri }) => {
  if (Platform.OS === 'android') {
    fileUri = RNFetchBlob.wrap(fileUri)
  }

  return RNFetchBlob.fetch('PUT', req.url, req.headers, fileUri)
}

export const uploadLinkedMedia = async ({ keeper, client, object }) => {
  await client.awaitAuthenticated()

  object = cloneDeep(object)

  const s3Target = client.getS3Target()
  const replacements = Embed.replaceKeeperUris({ object, ...s3Target })
  if (!replacements.length) return object

  const keys = replacements.map(r => r.hash)
  // the weird order is a minor optimization:
  //   launch async process (prefetch)
  //   run sync code while we wait (genUploadRequestSkeleton performs crypto)
  const getCacheUris = Promise.all(keys.map(key => keeper.prefetch(key)))
  const reqs = replacements.map(replacement => client.genUploadRequestSkeleton({
    key: replacement.hash,
    headers: getHeadersFromParsedKeeperUri(replacement),
  }))

  const cacheUris = await getCacheUris
  await Promise.all(reqs.map((req, i) => uploadFile({ req, fileUri: cacheUris[i] })))
  return object
}

// export const _commitCacheUris(object) {
//   await traverse(object).forEach(function (value) {
//   })
// }
