const tape = require('tape')
const bfe = require('../ssb-bfe')

tape('encode/decode basic types', function (t) {
  let values = [
    true,
    false,
    null,
    'this is a string',
    {
      'a': 1,
      'b': 'string'
    },
    100
  ]

  const encoded = bfe.encode.convert(values)
  t.equal(Buffer.isBuffer(encoded[0]), true, 'true')
  t.equal(Buffer.isBuffer(encoded[1]), true, 'false')
  t.equal(Buffer.isBuffer(encoded[2]), true, 'null')
  t.equal(Buffer.isBuffer(encoded[3]), true, 'string')
  t.equal(encoded[4]['a'], 1, 'numbers in object not encoded')
  t.equal(Buffer.isBuffer(encoded[4]['b']), true, 'object string values encoded')
  t.equal(encoded[5], 100, 'numbers not encoded')
  const decoded = bfe.decode.convert(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})

tape('encode/decode basic types', function (t) {
  let values = [
    'oIogDumL0H7+2TzipPTqZXmwx+04i9aE2mCDOb+hE0Pe+b0pGW0BUdVafzHdiGuDq7/r6Bi8wcNXhYoB4bSMlhNrdK7FJ40VoqXITcEHFwiQTxrkFxhD35oh2+J2J73jxxSXRzvn1fFgu+E7t22WfMkyfh3VpZSYniuh297KzwQBPDA5pjBMskp4pnuMk0ZYcxaGUrP33Q==.box1',
    'oIogDumL0H7+2TzipPTqZXmwx+04i9aE2mCDOb+hE0Pe+b0pGW0BUdVafzHdiGuDq7/r6Bi8wcNXhYoB4bSMlhNrdK7FJ40VoqXITcEHFwiQTxrkFxhD35oh2+J2J73jxxSXRzvn1fFgu+E7t22WfMkyfh3VpZSYniuh297KzwQBPDA5pjBMskp4pnuMk0ZYcxaGUrP33Q==.box2'
  ]

  const encoded = bfe.encode.convert(values)
  t.equal(Buffer.isBuffer(encoded[0]), true, 'box1 encoded correctly')
  t.equal(Buffer.isBuffer(encoded[1]), true, 'box2 encoded correctly')
  const decoded = bfe.decode.convert(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})

tape('encode/decode bendy butt', function (t) {
  let values = [
    '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.bbfeed-v1',
    '%HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK/pijYII=.bbmsg-v1',
    'az18LEvCgji1zqpAF/JcTool+y69WhyLVesvWcrnyj5pFJymXKALZ7zUDRuxOcBGr+wU4v6zN/+b3tAYsz+zBg==.sig.ed25519'
  ]

  const encoded = bfe.encode.convert(values)
  t.equal(Buffer.isBuffer(encoded[0]), true, 'bendy feed')
  t.equal(Buffer.isBuffer(encoded[1]), true, 'bendy msg')
  t.equal(Buffer.isBuffer(encoded[2]), true, 'bendy signature')
  const decoded = bfe.decode.convert(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})

tape('encode/decode classic', function (t) {
  let values = [
    '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519',
    '%HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK/pijYII=.sha256',
    'az18LEvCgji1zqpAF/JcTool+y69WhyLVesvWcrnyj5pFJymXKALZ7zUDRuxOcBGr+wU4v6zN/+b3tAYsz+zBg==.sig.ed25519'
  ]

  const encoded = bfe.encode.convert(values)
  t.equal(Buffer.isBuffer(encoded[0]), true, 'classic feed')
  t.equal(Buffer.isBuffer(encoded[1]), true, 'classic msg')
  t.equal(Buffer.isBuffer(encoded[2]), true, 'classic signature')
  const decoded = bfe.decode.convert(encoded)
  t.deepEqual(decoded, values, 'properly decoded')
  t.end()
})
