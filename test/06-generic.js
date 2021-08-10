const tape = require('tape')
const bfe = require('../')

tape('06 generic type', function (t) {
  const values = [
    true,
    false,
    null,
    'this is a string',
    '@mention',
    '%done',
    '&co',

    /* not covered by BFE */
    100,
    0,
    Buffer.from([3, 2, 1]),
  ]

  const encoded = bfe.encode(values)

  t.deepEqual(encoded[0], Buffer.from([6, 1, 1]), 'true')
  t.deepEqual(encoded[1], Buffer.from([6, 1, 0]), 'false')
  t.deepEqual(encoded[2], Buffer.from([6, 2]), 'null')
  t.deepEqual(encoded[3].slice(0, 2), Buffer.from([6, 0]), 'string')

  t.deepEqual(encoded[4].slice(0, 2), Buffer.from([6, 0]), '@string')
  t.deepEqual(encoded[5].slice(0, 2), Buffer.from([6, 0]), '%string')
  t.deepEqual(encoded[6].slice(0, 2), Buffer.from([6, 0]), '&string')

  /* not covered by BFE */
  t.equal(encoded[7], 100, 'numbers not encoded')
  t.equal(encoded[8], 0, 'falsy number as an array item') // isn't this the same as "numbers no encoded"?
  t.deepEqual(encoded[9], Buffer.from([3, 2, 1]), 'buffer untouched')

  // WARNING! a buffer is encoded as a buffer, which can lead to strange behaviour on decoding!!
  //
  t.deepEquals(
    bfe.decode(encoded.slice(0, encoded.length - 1)),
    values.slice(0, encoded.length - 1),
    'decode works'
  )
  t.end()
})
