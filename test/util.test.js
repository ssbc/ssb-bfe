const test = require('tape')

const { bufferToURIData, URIDataToBuffer } = require('../util')

test('util (ssb-uri methods)', (t) => {
  const uriData = '8LFJ/YVGqcypcXXf0KlHXJsB/0vC9ynu/DxJKX8jlC0='
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
  const buffer = URIDataToBuffer(uriData)

  t.deepEqual(
    bufferToURIData(buffer),
    uriData,
    'bufferToURIData and URIDataToBuffer are inverses'
  )

  t.end()
})
