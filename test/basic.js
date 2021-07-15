const tape = require('tape')
const bfe = require('../')

tape('encode/decode basic types', function (t) {
  const values = [
    true,
    false,
    null,
    'this is a string',
    {
      a: 1,
      b: 'string',
      c: 0,
    },
    100,
    0,
  ]

  const encoded = bfe.encode('classic', values)
  t.equal(encoded[0].toString('hex'), '060101', 'true')
  t.equal(encoded[1].toString('hex'), '060100', 'false')
  t.equal(encoded[2].toString('hex'), '0602', 'null')
  t.equal(encoded[3].slice(0, 2).toString('hex'), '0600', 'string')
  t.equal(encoded[4]['a'], 1, 'numbers in object not encoded')
  t.equal(
    encoded[4]['b'].slice(0, 2).toString('hex'),
    '0600',
    'object string values encoded'
  )
  t.equal(encoded[4]['c'], 0, 'falsy numbers as an object field')
  t.equal(encoded[5], 100, 'numbers not encoded')
  t.equal(encoded[6], 0, 'falsy number as an array item')
  const decoded = bfe.decode(encoded)
  t.deepEqual(decoded, values, 'properly decoded')

  t.end()
})

tape('undefined in an object disappears when encoded', function (t) {
  const obj = { a: 'alice', b: undefined, c: 'carla' }
  const encoded = bfe.encode('classic', obj)
  t.deepEquals(Object.keys(encoded), ['a', 'c'], 'key "b" is not found')
  t.equal(encoded.a.slice(0, 2).toString('hex'), '0600', '"a" is a string')
  t.notok(encoded.b, 'field "b" is not found')
  t.equal(encoded.c.slice(0, 2).toString('hex'), '0600', '"c" is a string')
  t.end()
})

tape('undefined in an array is converted to null when encoded', function (t) {
  const arr = ['alice', undefined, 'carla']
  const encoded = bfe.encode('classic', arr)
  t.equals(encoded.length, 3, 'length remains the same')
  t.equals(encoded[0].slice(0, 2).toString('hex'), '0600', '1st is a string')
  t.equals(encoded[1].slice(0, 2).toString('hex'), '0602', '2nd is null')
  t.equals(encoded[2].slice(0, 2).toString('hex'), '0600', '3rd is a string')

  const decoded = bfe.decode(encoded)
  t.deepEquals(decoded, ['alice', null, 'carla'])
  t.end()
})

tape('encode/decode box types', function (t) {
  let values = [
    'oIogDumL0H7+2TzipPTqZXmwx+04i9aE2mCDOb+hE0Pe+b0pGW0BUdVafzHdiGuDq7/r6Bi8wcNXhYoB4bSMlhNrdK7FJ40VoqXITcEHFwiQTxrkFxhD35oh2+J2J73jxxSXRzvn1fFgu+E7t22WfMkyfh3VpZSYniuh297KzwQBPDA5pjBMskp4pnuMk0ZYcxaGUrP33Q==.box1',
    'oIogDumL0H7+2TzipPTqZXmwx+04i9aE2mCDOb+hE0Pe+b0pGW0BUdVafzHdiGuDq7/r6Bi8wcNXhYoB4bSMlhNrdK7FJ40VoqXITcEHFwiQTxrkFxhD35oh2+J2J73jxxSXRzvn1fFgu+E7t22WfMkyfh3VpZSYniuh297KzwQBPDA5pjBMskp4pnuMk0ZYcxaGUrP33Q==.box2',
  ]

  const encoded = bfe.encode('classic', values)
  t.equal(Buffer.isBuffer(encoded[0]), true, 'box1 encoded correctly')
  t.equal(Buffer.isBuffer(encoded[1]), true, 'box2 encoded correctly')
  const decoded = bfe.decode(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})

tape('encode/decode bendy butt', function (t) {
  let values = [
    '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.bbfeed-v1',
    '%HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK/pijYII=.bbmsg-v1',
    null,
    'az18LEvCgji1zqpAF/JcTool+y69WhyLVesvWcrnyj5pFJymXKALZ7zUDRuxOcBGr+wU4v6zN/+b3tAYsz+zBg==.sig.ed25519',
  ]

  const encoded = bfe.encodeBendyButt(values)
  t.equal(encoded[0].slice(0, 2).toString('hex'), '0003', 'bendy feed')
  t.equal(encoded[1].slice(0, 2).toString('hex'), '0104', 'bendy msg')
  t.equal(encoded[2].toString('hex'), '0602', 'null')
  const decoded = bfe.decode(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})

tape('encode/decode classic', function (t) {
  let values = [
    '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519',
    '%HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK/pijYII=.sha256',
    null,
    'az18LEvCgji1zqpAF/JcTool+y69WhyLVesvWcrnyj5pFJymXKALZ7zUDRuxOcBGr+wU4v6zN/+b3tAYsz+zBg==.sig.ed25519',
  ]

  const encoded = bfe.encodeClassic(values)
  t.equal(encoded[0].slice(0, 2).toString('hex'), '0000', 'classic feed')
  t.equal(encoded[1].slice(0, 2).toString('hex'), '0100', 'classic msg')
  t.equal(encoded[2].toString('hex'), '0602', 'null')
  t.equal(Buffer.isBuffer(encoded[3]), true, 'classic signature')
  const decoded = bfe.decode(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})
