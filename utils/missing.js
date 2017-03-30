import Promise from 'bluebird'
import Restore from '@tradle/restore'
const debug = require('debug')('tradle:restore')
const co = Promise.coroutine
const MAX_BACKOFF = 60000
const INITIAL_BACKOFF = 1000

module.exports = function restoreMissingMessages ({ node, counterparty, url }) {
  const monitor = Restore.conversation.monitorMissing({ node, counterparty })
  Restore.batchifyMonitor({ monitor, debounce: 100 })
  // monitorMissing({ node: meDriver, debounce: 1000 }).on('batch', function (seq) {

  monitor.on('batch', co(function* (seqs) {
    const req = yield Restore.conversation.request({
      node,
      seqs,
      from: counterparty
    })

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

        msgs = yield res.json()
        msgs.forEach(msg => {
          const { recipientPubKey } = msg
          recipientPubKey.pub = new Buffer(recipientPubKey.pub.data)
        })

        break
      } catch (err) {
        debug(`failed to restore messages from ${counterparty} at ${url}`, err)
      }

      yield new Promise(resolve => setTimeout(resolve, backoff))
      backoff = Math.min(backoff * 2, MAX_BACKOFF)
    }

    yield Promise.all(msgs.map(msg => {
      return node.receive(msg, { permalink: counterparty })
    }))
  }))

  return monitor
}
