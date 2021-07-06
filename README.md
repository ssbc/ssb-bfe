# SSB BFE

Javascript implementation of the [SSB binary field encodings] spec.

## API

### encode(value)

Takes a value and returns the encoded counterpart. If value is an
array or object only the values are encoded. Similarly numbers are not
encoded.

### decode(value)

Takes an encoded value and returns decoded counterpart.


SSB binary field encodings: https://github.com/ssb-ngi-pointer/ssb-binary-field-encodings-spec
