
import through from 'through2'
import pump from 'pump'
import { AsyncStorage } from 'react-native'
// import { dangerousReadDB } from './utils'
import Promise from 'bluebird'
import createKeeper from '@tradle/keeper'
const collect = Promise.promisify(require('stream-collector'))

module.exports = function keeperWrapper (keeperOpts) {
  const { path, db } = keeperOpts
  const keeper = createKeeper(keeperOpts)
  const open = Promise.promisify(keeper.open.bind(keeper))
  const { get, put, batch, createReadStream } = keeper
  keeper.get = function (key, cb) {
    console.log('GET', key)
    get.call(keeper, key, function (err, val) {
      if (err) return cb(err)

      cb(null, val.value)
    })
  }

  keeper.put = function (key, value, cb) {
    value = { key, value }
    put.call(keeper, key, value, cb)
  }

  keeper.batch = function (rows, cb) {
    rows = rows.map(row => {
      return {
        type: row.type,
        key: row.key,
        value: { key: row.key, value: row.value }
      }
    })

    console.log('BATCH', rows.map(row => row.key))
    batch.call(keeper, rows, cb)
  }

  keeper.createReadStream = function (opts={}) {
    return pump(
      createReadStream.call(keeper, opts),
      through.obj(function (data, enc, cb) {
        const wrapper = opts.keys === false ? data : data.value
        const { key, value } = wrapper
        console.log('STREAM', key)
        const ret = opts.keys === false ? value :
          opts.values === false ? key : wrapper

        cb(null, ret)
      })
    )
  }

  keeper.dump = async function () {
    // TODO: optimize
    await open()
    return collect(keeper.createReadStream())
  }

  return keeper
}
