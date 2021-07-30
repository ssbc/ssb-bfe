const tape = require('tape')

tape('encode/decode basic types', function (t) {
  const { bfeNamedTypes } = require('../')
  const FEED = bfeNamedTypes['feed']
  t.equal(FEED.formats['ssb/classic'].data_length, 32, '32 bytes')
  
  const { bfeTypes } = require('../')
  const classic_key_size = bfeTypes[0].formats[0].data_length
  t.equal(classic_key_size, 32, '32 bytes')

  t.end()
})
