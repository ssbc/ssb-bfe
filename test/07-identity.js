const tape = require('tape')
const crypto = require('crypto')
const bfe = require('../')
const { bufferToURIData } = require('../util')

tape('07 identity', function (t) {
  const key = crypto.randomBytes(32)

  const values = ['ssb:identity/po-box/' + bufferToURIData(key)]
  const encoded = bfe.encode(values)

  t.deepEqual(encoded[0].slice(0, 2), Buffer.from([7, 0]), 'detected key')
  t.deepEqual(encoded[0].slice(2), key, 'decoded key data correctly')

  /* unhappy paths */
  t.throws(
    () => bfe.decode(Buffer.from([7, 200, 21])), // type 200 DNE
    'unknown signature type decode throws'
  )

  t.end()
})
