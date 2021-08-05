const tape = require('tape')
const bfe = require('../')

tape('06 generic type', function (t) {
  const values = [
    true,
    false,
    null,
    'this is a string',

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

  /* not covered by BFE */
  t.equal(encoded[4], 100, 'numbers not encoded')
  t.equal(encoded[5], 0, 'falsy number as an array item') // isn't this the same as "numbers no encoded"?
  t.deepEqual(encoded[6], Buffer.from([3, 2, 1]), 'buffer untouched')

  t.deepEquals(bfe.decode(encoded), values, 'decode works')
  t.end()
})
