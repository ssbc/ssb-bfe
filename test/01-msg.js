// SPDX-FileCopyrightText: 2021 Anders Rune Jensen
//
// SPDX-License-Identifier: Unlicense

const tape = require('tape')
const bfe = require('../')

tape('01 msg type', function (t) {
  const values = [
    '%HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK/pijYII=.sha256', // classic
    'ssb:message/gabbygrove-v1/QibgMEFVrupoOpiILKVoNXnhzdVQVZf7dkmL9MSXO5g=', // gabby-grove
    '%HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK/pijYII=.cloaked', // cloaked
    'ssb:message/bendybutt-v1/HZVnEzm0NgoSVfG0Hx4gMFbMMHhFvhJsG2zK_pijYII=', // bendy-butt
    'ssb:message/buttwoo-v1/QibgMEFVrupoOpiILKVoNXnhzdVQVZf7dkmL9MSXO5g=', // butt2
    'ssb:message/indexed-v1/QibgMEFVrupoOpiILKVoNXnhzdVQVZf7dkmL9MSXO5g=', // indexed-v1
  ]

  const encoded = bfe.encode(values)

  t.deepEquals(encoded[0].slice(0, 2), Buffer.from([1, 0]), 'classic msg')
  t.deepEquals(encoded[1].slice(0, 2), Buffer.from([1, 1]), 'gabby grove msg')
  t.deepEquals(encoded[2].slice(0, 2), Buffer.from([1, 2]), 'cloaked msg')
  t.deepEquals(encoded[3].slice(0, 2), Buffer.from([1, 4]), 'bendy butt msg')
  t.deepEquals(encoded[4].slice(0, 2), Buffer.from([1, 5]), 'buttwoo msg')
  t.deepEquals(encoded[5].slice(0, 2), Buffer.from([1, 6]), 'index msg')

  t.deepEquals(bfe.decode(encoded), values, 'decode works')

  t.deepEquals(
    bfe.decodeTypeFormat(encoded[0], 'message', 'classic'),
    values[0],
    'decode classic works'
  )
  t.deepEquals(
    bfe.decodeTypeFormat(encoded[3], 'message', 'bendybutt-v1'),
    values[3],
    'decode bendy butt works'
  )

  /* unhappy paths */
  const unknownMsgId = '%' + Buffer.from('dog').toString('base64') + '.dog255'
  t.throws(() => bfe.encode(unknownMsgId), 'unknown msgId encode throws')
  t.throws(
    () => bfe.decode(Buffer.from([1, 200, 21])), // type 200 DNE
    'unknown msg type decode throws'
  )

  t.end()
})
