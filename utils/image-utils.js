export const createDataUri = ({ base64, extension, quality }) => {
  if (base64.startsWith('data:')) return base64

  if (!extension) {
    if (typeof quality !== 'number') {
      throw new Error('expected "quality" or "extension"')
    }

    extension = quality === 1 ? 'png' : 'jpeg'
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

export const normalizeImageCaptureData = ({ quality, extension, ...data }) => ({
  ...data,
  base64: createDataUri({
    quality,
    extension,
    base64: data.base64,
  }),
})
