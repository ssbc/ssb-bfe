const test = require('tape')

const { bufferToURIData, URIDataToBuffer } = require('../util')

test('util (ssb-uri methods)', (t) => {
  const uriData = 'g3hPVPDEO1Aj_uPl0-J2NlhFB2bbFLIHlty-YuqFZ3w='
  const buffer = URIDataToBuffer(uriData)

  t.deepEqual(
    bufferToURIData(buffer),
    uriData,
    'bufferToURIData and URIDataToBuffer are inverses'
  )

  t.end()
})
