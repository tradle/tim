import Embed from '@tradle/embed'
import RNFetchBlob from 'rn-fetch-blob'
import cloneDeep from 'lodash/cloneDeep'

export const uploadLinkedMedia = async ({ keeper, client, message }) => {
  await client.awaitAuthenticated()

  message = cloneDeep(message)

  const { region, bucket, keyPrefix } = client.getS3Target()
  const replacements = Embed.replaceKeeperUris({ object, region, bucket, keyPrefix })
  if (!replacements.length) return message

  const keys = replacements.map(r => r.hash)
  // the weird order is a minor optimization:
  //   launch async process (prefetch)
  //   run sync code while we wait (genUploadRequestSkeleton performs crypto)
  const getCacheUris = Promise.all(keys.map(key => keeper.prefetch({ key })))
  const reqs = replacements.map(({ hash, mimetype }) => client.genUploadRequestSkeleton({ key: hash, mimetype }))
  const cacheUris = await getCacheUris
  await Promise.all(reqs.map((req, i) => RNFetchBlob.fetch('PUT', req.url, req.headers, cacheUris[i])))
  return message
}
