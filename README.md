# SSB BFE

Javascript implementation of the [SSB binary field encodings] spec.

The spec only has one type of **nil**, but JavaScript has two: `null` and `undefined`. ssb-bfe will treat these two values in a way that mirrors what JSON.stringify does:

- BFE Encoding an **object** with a `null` field becomes an object with the **nil** marker
  - Similar to `JSON.stringify({a: null}) === '{"a": null}'`
- BFE Encoding an **array** with a `null` element becomes an array with the **nil** marker
  - Similar to `JSON.stringify([null]) === '[null]'`
- BFE Encoding an **object** with a `undefined` field will **omit** that field
  - Similar to `JSON.stringify({a: undefined}) === '{}'`
- BFE Encoding an **array** with an `undefined` element becomes an array with the **nil** marker
  - Similar to `JSON.stringify([undefined]) === '[null]'`

## API

### encodeBendyButt(value)

Takes a bendy butt value and returns the encoded counterpart. If value
is an array or object only the values are encoded. Similarly numbers
are not encoded.

### encodeClassic(value)

Takes a classic value and returns the encoded counterpart. This is
mostly used for encoding feed and messages.

### decode(value)

Takes an encoded value and returns the decoded counterpart.


[SSB binary field encodings]: https://github.com/ssb-ngi-pointer/ssb-binary-field-encodings-spec
