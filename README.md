# SSB BFE

Javascript implementation of the [SSB binary field encodings] spec.

For encoding, the *null* message value can be ambiguous as it depends
on the feed format we encode for. Secondly the specification allows an
empty value to be encoded as a value type. Javascript has two ways to
express the lack of a value: null and undefined. For value types we
will use undefined.

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
