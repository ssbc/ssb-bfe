const tape = require('tape')
const bfe = require('../')

tape('03 diffie-hellman type ', function (t) {
  const values = [
    'ssb://diffie-hellman/curve25519/s7+cwhm6dz9si5vn4ftpk/l/ldbrmqzzjos+spzbwf4=',
  ]

  const encoded = bfe.encode(values)

  t.deepEquals(
    encoded[0].slice(0, 2),
    Buffer.from([3, 0]),
    'diffie-hellman curve25519'
  )

  t.deepEquals(bfe.decode(encoded), values, 'decode works')
  t.end()
})
