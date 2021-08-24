const tape = require('tape')
const crypto = require('crypto')
const SSBURI = require('ssb-uri2')
const bfe = require('../')

tape('07 identity', function (t) {
  const key = crypto.randomBytes(32)

  const values = [
    SSBURI.compose({
      type: 'identity',
      format: 'po-box',
      data: key.toString('base64'),
    }),
  ]
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
