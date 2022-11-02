// SPDX-FileCopyrightText: 2021 Anders Rune Jensen
//
// SPDX-License-Identifier: Unlicense

const tape = require('tape')
const { toTF } = require('../')

tape('toTF() happy cases', function (t) {
  t.equals(toTF('message', 'bamboo').toString('hex'), '0103', 'bamboo msg')
  t.equals(toTF('generic', 'string-UTF8').toString('hex'), '0600', 'string')
  t.equals(toTF('generic', 'boolean').toString('hex'), '0601', 'boolean')
  t.equals(toTF('generic', 'nil').toString('hex'), '0602', 'nil')
  t.equals(toTF('generic', 'any-bytes').toString('hex'), '0603', 'bytes')
  t.equals(toTF('identity', 'group').toString('hex'), '0701', 'group identity')
  t.end()
})

tape('toTF() sad cases', function (t) {
  t.throws(() => {
    toTF('NONSENSE', 'bamboo')
  }, /Unknown type/i)

  t.throws(() => {
    toTF('message', 'NONSENSE')
  }, /Unknown format/i)

  t.end()
})
