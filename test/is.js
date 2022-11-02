// SPDX-FileCopyrightText: 2022 Andre 'Staltz' Medeiros
//
// SPDX-License-Identifier: Unlicense

const tape = require('tape')
const bfe = require('../')

tape('enumerate all is*() helpers', function (t) {
  const allFunctions = Object.keys(bfe).filter((key) =>
    key.startsWith('isEncoded')
  )
  t.deepEquals(allFunctions, [
    'isEncodedFeedClassic',
    'isEncodedFeedGabbygroveV1',
    'isEncodedFeedBamboo',
    'isEncodedFeedBendybuttV1',
    'isEncodedFeedButtwooV1',
    'isEncodedFeedIndexedV1',
    'isEncodedFeed',
    'isEncodedMessageClassic',
    'isEncodedMessageGabbygroveV1',
    'isEncodedMessageCloaked',
    'isEncodedMessageBamboo',
    'isEncodedMessageBendybuttV1',
    'isEncodedMessageButtwooV1',
    'isEncodedMessageIndexedV1',
    'isEncodedMessage',
    'isEncodedBlobClassic',
    'isEncodedBlob',
    'isEncodedEncryptionKeyBox2DmDh',
    'isEncodedEncryptionKeyBox2PoboxDh',
    'isEncodedEncryptionKey',
    'isEncodedSignatureMsgEd25519',
    'isEncodedSignature',
    'isEncodedEncryptedBox1',
    'isEncodedEncryptedBox2',
    'isEncodedEncrypted',
    'isEncodedGenericStringUTF8',
    'isEncodedGenericBoolean',
    'isEncodedGenericNil',
    'isEncodedGenericAnyBytes',
    'isEncodedGeneric',
    'isEncodedIdentityPoBox',
    'isEncodedIdentityGroup',
    'isEncodedIdentity',
  ])
  for (const fnName of allFunctions) {
    t.equals(typeof bfe[fnName], 'function')
  }
  t.end()
})

tape('isEncodedFeed*() happy cases', function (t) {
  t.true(
    bfe.isEncodedFeed(
      bfe.encode('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519')
    ),
    'isEncodedFeed classic'
  )
  t.true(
    bfe.isEncodedFeed(
      bfe.encode(
        'ssb:feed/bendybutt-v1/6CAxOI3f-LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4-Uv0='
      )
    ),
    'isEncodedFeed bendybutt-v1'
  )
  t.true(
    bfe.isEncodedFeed(
      bfe.encode(
        'ssb:feed/gabbygrove-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeed gabbygrove-v1'
  )
  t.true(
    bfe.isEncodedFeed(
      bfe.encode(
        'ssb:feed/buttwoo-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeed buttwoo-v1'
  )
  t.true(
    bfe.isEncodedFeed(
      bfe.encode(
        'ssb:feed/indexed-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeed indexed-v1'
  )

  t.true(
    bfe.isEncodedFeedClassic(
      bfe.encode('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519')
    ),
    'isEncodedFeedClassic'
  )
  t.true(
    bfe.isEncodedFeedBendybuttV1(
      bfe.encode(
        'ssb:feed/bendybutt-v1/6CAxOI3f-LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4-Uv0='
      )
    ),
    'isEncodedFeedBendyButtV1'
  )
  t.true(
    bfe.isEncodedFeedGabbygroveV1(
      bfe.encode(
        'ssb:feed/gabbygrove-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeedGabbyGroveV1'
  )
  t.true(
    bfe.isEncodedFeedButtwooV1(
      bfe.encode(
        'ssb:feed/buttwoo-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeedButtwooV1'
  )
  t.true(
    bfe.isEncodedFeedIndexedV1(
      bfe.encode(
        'ssb:feed/indexed-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeedIndexedV1'
  )

  t.end()
})

tape('isEncodedFeed*() sad cases', function (t) {
  t.false(
    bfe.isEncodedFeed(
      bfe.encode('%6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.sha256')
    ),
    'isEncodedFeed invalid type'
  )
  t.false(
    bfe.isEncodedFeed(bfe.encode('@6CAxOI3f+LUOVrbw9LC4+Uv0=.ed25519')),
    'isEncodedFeed classic wrong length'
  )
  t.false(
    bfe.isEncodedFeedBendybuttV1(
      bfe.encode('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519')
    ),
    'isEncodedFeedBendyButtV1 classic'
  )
  t.false(
    bfe.isEncodedFeedGabbygroveV1(
      bfe.encode(
        'ssb:feed/bendybutt-v1/6CAxOI3f-LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4-Uv0='
      )
    ),
    'isEncodedFeedGabbyGroveV1 bendybutt-v1'
  )
  t.false(
    bfe.isEncodedFeedButtwooV1(
      bfe.encode(
        'ssb:feed/gabbygrove-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeedButtwooV1 gabbygrove-v1'
  )
  t.false(
    bfe.isEncodedFeedClassic(
      bfe.encode(
        'ssb:feed/buttwoo-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedFeedClassic buttwoo-v1'
  )

  t.end()
})

tape('isEncodedMessage*() happy cases', function (t) {
  t.true(
    bfe.isEncodedMessage(
      bfe.encode('%6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.sha256')
    ),
    'isEncodedMessage classic'
  )
  t.true(
    bfe.isEncodedMessage(
      bfe.encode(
        'ssb:message/bendybutt-v1/6CAxOI3f-LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4-Uv0='
      )
    ),
    'isEncodedMessage bendybutt-v1'
  )
  t.true(
    bfe.isEncodedMessage(
      bfe.encode(
        'ssb:message/gabbygrove-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessage gabbygrove-v1'
  )
  t.true(
    bfe.isEncodedMessage(
      bfe.encode(
        'ssb:message/buttwoo-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessage buttwoo-v1'
  )
  t.true(
    bfe.isEncodedMessage(
      bfe.encode(
        'ssb:message/indexed-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessage indexed-v1'
  )

  t.true(
    bfe.isEncodedMessageClassic(
      bfe.encode('%6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.sha256')
    ),
    'isEncodedMessageClassic'
  )
  t.true(
    bfe.isEncodedMessageBendybuttV1(
      bfe.encode(
        'ssb:message/bendybutt-v1/6CAxOI3f-LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4-Uv0='
      )
    ),
    'isEncodedMessageBendyButtV1'
  )
  t.true(
    bfe.isEncodedMessageGabbygroveV1(
      bfe.encode(
        'ssb:message/gabbygrove-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessageGabbyGroveV1'
  )
  t.true(
    bfe.isEncodedMessageButtwooV1(
      bfe.encode(
        'ssb:message/buttwoo-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessageButtwooV1'
  )
  t.true(
    bfe.isEncodedMessageIndexedV1(
      bfe.encode(
        'ssb:message/indexed-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessageIndexedV1'
  )

  t.end()
})

tape('isEncodedMessage*() sad cases', function (t) {
  t.false(
    bfe.isEncodedMessage(
      bfe.encode('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519')
    ),
    'isEncodedMessage invalid type'
  )
  t.false(
    bfe.isEncodedMessage(bfe.encode('%6CAxOI3f+LUOVrbw9LC4+Uv0=.sha256')),
    'isEncodedMessage classic wrong length'
  )
  t.false(
    bfe.isEncodedMessageBendybuttV1(
      bfe.encode('%6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.sha256')
    ),
    'isEncodedMessageBendyButtV1 classic'
  )
  t.false(
    bfe.isEncodedMessageGabbygroveV1(
      bfe.encode(
        'ssb:message/bendybutt-v1/6CAxOI3f-LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4-Uv0='
      )
    ),
    'isEncodedMessageGabbyGroveV1 bendybutt-v1'
  )
  t.false(
    bfe.isEncodedMessageButtwooV1(
      bfe.encode(
        'ssb:message/gabbygrove-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessageButtwooV1 gabbygrove-v1'
  )
  t.false(
    bfe.isEncodedMessageClassic(
      bfe.encode(
        'ssb:message/buttwoo-v1/FY5OG311W4j_KPh8H9B2MZt4WSziy_p-ABkKERJdujQ='
      )
    ),
    'isEncodedMessageClassic buttwoo-v1'
  )

  t.end()
})

tape('isEncodedBlob*() happy cases', function (t) {
  t.true(
    bfe.isEncodedBlob(
      bfe.encode('&s7+cwhm6dz9si5vn4ftpk/l/ldbrmqzzjos+spzbwf4=.sha256')
    ),
    'isEncodedBlob classic'
  )
  t.true(
    bfe.isEncodedBlobClassic(
      bfe.encode('&s7+cwhm6dz9si5vn4ftpk/l/ldbrmqzzjos+spzbwf4=.sha256')
    ),
    'isEncodedBlobClassic'
  )

  t.end()
})

tape('isEncodedBlob*() sad cases', function (t) {
  t.false(
    bfe.isEncodedBlob(
      bfe.encode('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519')
    ),
    'isEncodedBlob invalid type'
  )
  t.false(
    bfe.isEncodedBlob(bfe.encode('&s7+cwhm6dz9si5vn4ftqzzjos+spzbwf4=.sha256')),
    'isEncodedBlob classic wrong length'
  )
  t.false(
    bfe.isEncodedBlobClassic(
      bfe.encode('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519')
    ),
    'isEncodedBlobClassic invalid type'
  )

  t.end()
})

tape('isEncodedGeneric*() happy cases', function (t) {
  t.true(bfe.isEncodedGeneric(bfe.encode('hello'), 'isEncodedGeneric string'))
  t.true(
    bfe.isEncodedGenericStringUTF8(
      bfe.encode('hello'),
      'isEncodedGenericStringUTF8'
    )
  )
  t.true(
    bfe.isEncodedGenericBoolean(bfe.encode(true), 'isEncodedGenericBoolean')
  )
  t.true(bfe.isEncodedGenericNil(bfe.encode(null), 'isEncodedGenericNil'))
  t.true(
    bfe.isEncodedGenericAnyBytes(
      bfe.encode(Buffer.from([3, 2, 1])),
      'isEncodedGenericAnyBytes'
    )
  )

  t.end()
})

tape('isEncodedGeneric*() sad cases', function (t) {
  t.false(
    bfe.isEncodedGeneric(
      bfe.encode('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519')
    ),
    'isEncodedGeneric invalid type'
  )
  t.false(
    bfe.isEncodedGenericBoolean(bfe.encode(null)),
    'isEncodedGenericBoolean null'
  )

  t.end()
})
