const tape = require('tape')
const bfe = require('../')

tape('encode/decode basic types', function (t) {
  let values = [
    true,
    false,
    undefined,
    'this is a string',
    {
      a: 1,
      b: 'string',
    },
    100,
  ]

  const encoded = bfe.encode('classic', values)
  t.equal(encoded[0].toString('hex'), '060101', 'true')
  t.equal(encoded[1].toString('hex'), '060100', 'false')
  t.equal(encoded[2].toString('hex'), '0602', 'undefined')
  t.equal(encoded[3].slice(0, 2).toString('hex'), '0600', 'string')
  t.equal(encoded[4]['a'], 1, 'numbers in object not encoded')
  t.equal(
    encoded[4]['b'].slice(0, 2).toString('hex'),
    '0600',
    'object string values encoded'
  )
  t.equal(encoded[5], 100, 'numbers not encoded')
  const decoded = bfe.decode(encoded)
  t.deepEqual(decoded, values, 'properly decoded')

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
  const nullBuffer = Buffer.concat([
    Buffer.from([1]),
    Buffer.from([4]),
    Buffer.alloc(32),
  ])
  t.equal(encoded[2].compare(nullBuffer, 0, 32 + 2), 0, 'bendy null msg')
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
  const nullBuffer = Buffer.concat([
    Buffer.from([1]),
    Buffer.from([0]),
    Buffer.alloc(32),
  ])
  t.equal(encoded[2].compare(nullBuffer, 0, 32 + 2), 0, 'classic null msg')
  t.equal(Buffer.isBuffer(encoded[3]), true, 'classic signature')
  const decoded = bfe.decode(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})
