import Promise from 'bluebird'
import Restore from '@tradle/restore'
import { constants } from '@tradle/engine'
const { parseMessageFromDB } = require('./utils')
const debug = require('debug')('tradle:restore')
const co = Promise.coroutine
const MAX_BACKOFF = 60000
const INITIAL_BACKOFF = 1000
const { SEQ, TYPE, TYPES } = constants

module.exports = function restoreMissingMessages ({ node, counterparty, url, receive }) {
  const monitor = Restore.conversation.monitorMissing({ node, counterparty })
  Restore.batchifyMonitor({ monitor, debounce: 100 })
  // monitorMissing({ node: meDriver, debounce: 1000 }).on('batch', function (seq) {

  const reqSeqs = co(function* ({ seqs=[], tip }) {
    const props = { node, counterparty, seqs }
    if (typeof tip !== 'undefined') props.tip = tip

    const req = yield Restore.conversation.request(props)

    let res
    let msgs
    let backoff = INITIAL_BACKOFF
    while (true) {
      try {
        res = yield fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(req.object)
        })

        // nothing there for us
        if (res.status >= 400) return

        msgs = yield res.json()
        if (!msgs.length) {
          debug('no messages missing')
          return
        }

        msgs.forEach(msg => {
          const { recipientPubKey } = msg
          bufferizePubKey(recipientPubKey)
          if (msg.object[TYPE] === TYPES.MESSAGE) {
            bufferizePubKey(msg.object.recipientPubKey)
          }
        })

        break
      } catch (err) {
        debug(`failed to restore messages from ${counterparty} at ${url}`, err)
      }

      debug('backing off before trying again')
      yield new Promise(resolve => setTimeout(resolve, backoff))
      backoff = Math.min(backoff * 2, MAX_BACKOFF)
    }

    debug(`recovering ${msgs.length} lost messages`)
    msgs.sort((a, b) => a[SEQ] - b[SEQ])

    for (let msg of msgs) {
      try {
        yield receive({ msg, from: counterparty })
        debug(`recovered msg from ${counterparty}`)
      } catch (err) {
        debug(`failed to recover msg from ${counterparty}`, err)
      } finally {
        yield new Promise(resolve => setTimeout(resolve, 20))
      }
    }
  })

  monitor.once('tip', function (tip) {
    reqSeqs({ tip, seqs: [] })
  })

  monitor.on('batch', reqSeqs)
  monitor.request = reqSeqs
  return monitor
}

function bufferizePubKey (key) {
  key.pub = new Buffer(key.pub.data)
}
