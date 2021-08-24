const tape = require('tape')
const crypto = require('crypto')
const SSBURI = require('ssb-uri2')
const bfe = require('../')

tape('ssb-uri encoding', function (t) {
  /* unhappy paths */
  const wrongDataLength = SSBURI.compose({
    type: 'feed',
    format: 'ed25519',
    data: crypto.randomBytes(13).toString('base64'),
  })
  t.throws(() => bfe.encode(wrongDataLength), 'incorrect data length')

  const bfelessURI =
    'ssb:address/multiserver?multiserverAddress=net%3Awx.larpa.net%3A8008~shs%3ADTNmX%2B4SjsgZ7xyDh5xxmNtFqa6pWi5Qtw7cE8aR9TQ%3D'
  const encoded1 = bfe.encode(bfelessURI)
  t.deepEqual(
    encoded1.slice(0, 2),
    Buffer.from([6, 0]),
    'unknown URIs get encoded as BFE strings'
  )

  const weirdURI = 'ssb:feed/joke/invalidCanonicalSSBURI'
  t.throws(() => bfe.encode(weirdURI), 'SSB URI with unknown format throws')

  t.end()
})
