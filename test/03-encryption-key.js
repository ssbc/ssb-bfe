const tape = require('tape')
const crypto = require('crypto')
const bfe = require('../')
const { bufferToURIData } = require('../util')

tape('03 encryption key', function (t) {
  const key = crypto.randomBytes(32)

  const values = [
    'ssb:diffie-hellman/curve25519/' + bufferToURIData(key),
    'ssb:diffie-hellman/curve25519/' + bufferToURIData(key) + '?render=thread',
  ]
  const valuesLessQueries = values.map((value) => value.replace(/\?.*$/, ''))
  const encoded = bfe.encode(values)

  t.deepEqual(encoded[0].slice(0, 2), Buffer.from([3, 0]), 'detected key')
  t.deepEqual(encoded[0].slice(2), key, 'decoded key data correctly')

  t.deepEqual(bfe.decode(encoded), valuesLessQueries, 'properly decoded')

  /* unhappy paths */
  t.throws(
    () => bfe.decode(Buffer.from([3, 200, 21])), // type 200 DNE
    'unknown signature type decode throws'
  )

  t.end()
})
