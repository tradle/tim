
const levelup = require('levelup')
const  leveldown = require('./leveldown')

module.exports = exports = level

function level (loc, opts) {
  opts = opts || {}
  opts.db = opts.db || function () {
    const db = leveldown.apply(null, arguments)
    if (db.maxSize) db.maxSize(100) // max cache size

    return db
  }

  return levelup(loc, opts)
}
