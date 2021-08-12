const tape = require('tape')
const crypto = require('crypto')
const bfe = require('../')
const { bufferToURIData } = require('../util')

tape('ssb-uri encoding', function (t) {
  /* unhappy paths */
  const wrongDataLength =
    'ssb:feed/bamboo/' + bufferToURIData(crypto.randomBytes(13))
  t.throws(() => bfe.encode(wrongDataLength), 'incorrect data length')

  t.end()
})
