const tape = require('tape')
const bfe = require('../')

tape('nil envelope', function (t) {
  const bbFeed = '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.bbfeed-v1'
  const bbNull = bfe.convertNilForEnvelopeSpec(bfe.encode(null), bfe.encode(bbFeed))
  t.equal(bbNull.slice(0,2).toString('hex'), '0104', 'bendy msg')
  t.ok(bbNull.slice(2).equals(Buffer.alloc(32)), 'ends with 32 zeros')
  t.equal(bbNull.length, 32 + 2, 'length ok')

  const classicFeed = '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519'
  const classicNull = bfe.convertNilForEnvelopeSpec(bfe.encode(null), bfe.encode(classicFeed))
  t.equal(classicNull.slice(0,2).toString('hex'), '0100', 'classic msg')
  t.ok(classicNull.slice(2).equals(Buffer.alloc(32)), 'ends with 32 zeros')
  t.equal(classicNull.length, 32 + 2, 'length ok')
  t.end()
})
