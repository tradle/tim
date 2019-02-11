import {
  getGlobalKeeper,
} from './keeper'

export const createDataUri = ({ base64, extension }) => {
  if (base64.startsWith('data:')) return base64

  if (!extension) {
    throw new Error('expected "extension"')
  }

  if (!(base64 && extension)) {
    throw new Error('expected "base64" and "extension"')
  }

  if (extension === 'jpg') extension = 'jpeg'
  if (extension !== 'jpeg' && extension !== 'png') {
    throw new Error(`unsupported extension: ${extension}`)
  }

  base64 = cleanBase64(base64)
  return `data:image/${extension};base64,${base64}`
}

// some libraries generate base64 with line breaks, spaces, etc.
export const cleanBase64 = str => str.replace(/[\s]/g, '')

export const normalizeImageCaptureData = async ({ extension, base64, imageTag, ...data }) => replaceDataUrls({
  ...data,
  url: imageTag || createDataUri({ extension, base64 })  ,
})

export const replaceDataUrls = async obj => {
  const keeper = getGlobalKeeper()
  return keeper && keeper.importFromImageStore ? keeper.replaceDataUrls(obj) : obj
}

export const importFromImageStore = async imageTag => {
  const keeper = getGlobalKeeper()
  return keeper && keeper.importFromImageStore ? await keeper.importFromImageStore(imageTag) : imageTag
}
