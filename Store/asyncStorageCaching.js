// NOTE: currently buggy, need tests

import sortedIndex from 'lodash.sortedindex'

import {
  AsyncStorage
} from 'react-native'

const {
  getAllKeys,
  multiSet,
  multiRemove
} = AsyncStorage

let pending
let keys
let tmp = []
const noop = function () {}

AsyncStorage.setItem = function (key, val, callback) {
  return AsyncStorage.multiSet([key, val], callback)
}

AsyncStorage.multiSet = async function (pairs) {
  for (var i = 0; i < pairs.length; i++) {
    insertKey(pairs[i][0])
  }

  try {
    return await multiSet.apply(AsyncStorage, arguments)
  } catch (err) {
    // undo
    for (var i = 0; i < pairs.length; i++) {
      removeKey(pairs[i][0])
    }

    throw err
  }
}

AsyncStorage.removeItem = function (key, callback) {
  return AsyncStorage.multiRemove([key], callback)
}

AsyncStorage.multiRemove = async function (keys) {
  for (var i = 0; i < keys.length; i++) {
    removeKey(keys[i])
  }

  try {
    return await multiRemove.apply(AsyncStorage, arguments)
  } catch (err) {
    debugger
    // undo
    for (var i = 0; i < keys.length; i++) {
      insertKey(keys[i])
    }

    throw err
  }
}

AsyncStorage.getAllKeys = function (callback) {
  if (!keys) {
    if (!pending) pending = doGetAllKeys()

    return pending.then(() => {
      const copy = keys.slice()
      if (callback) {
        callback(null, copy)
      }

      return copy
    }, callback || noop)

  } else {
    console.log('YAY! SAVED TIME ON getAllKeys')
  }

  return keys.slice()
}

async function doGetAllKeys () {
  keys = await getAllKeys.call(AsyncStorage)
  keys = keys.sort(alphabetical)
  for (var i = 0; i < tmp.length; i++) {
    insertKey(tmp[i])
  }

  tmp = null
}

function alphabetical (a, b) {
  const al = a.toLowerCase()
  const bl = b.toLowerCase()
  return al < bl ? -1 : al > bl ? 1 : 0
}

function insertKey (val) {
  const arr = keys || tmp
  const idx = sortedIndex(arr, val)
  if (arr[idx] !== val) {
    arr.splice(idx, 0, val)
  }
}

function removeKey (val) {
  const arr = keys || tmp
  const idx = sortedIndex(arr, val)
  if (arr[idx] === val) {
    arr.splice(idx, 1)
  }
}
