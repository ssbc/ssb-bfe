const tape = require('tape')
const bfe = require('../')

tape('01 msg type', function (t) {
  const values = [
    '%HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK/pijYII=.sha256', // classic
    'ssb:message/bendybutt-v1/HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK_pijYII=', // bendy-butt
    'ssb:message/gabbygrove-v1/QibgMEFVrupoOpiILKVoNXnhzdVQVZf7dkmL9MSXO5g=', // gabby-grove
  ]

  const encoded = bfe.encode(values)

  t.deepEquals(encoded[0].slice(0, 2), Buffer.from([1, 0]), 'classic feed')
  t.deepEquals(encoded[1].slice(0, 2), Buffer.from([1, 4]), 'bendy feed')
  t.deepEquals(encoded[2].slice(0, 2), Buffer.from([1, 1]), 'gabby grove feed')

  t.deepEquals(bfe.decode(encoded), values, 'decode works')

  /* unhappy paths */
  const unknownMsgId = '%' + Buffer.from('dog').toString('base64') + '.dog255'
  t.throws(() => bfe.encode(unknownMsgId), 'unknown msgId encode throws')
  t.throws(
    () => bfe.decode(Buffer.from([1, 200, 21])), // type 200 DNE
    'unknown msg type decode throws'
  )

  t.end()
})
