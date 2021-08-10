// Following the BFE TFD spec (also known as TFK), the naming convention in this
// file uses "T" to mean "Type byte", "TF" to mean "Type byte and Format byte"
// and "D" to mean "Data bytes".

const definitions = require('./bfe.json')
const {
  decorateBFE,
  definitionsToDict,
  findClassicTypeFormat,
} = require('./util')

const TYPES = decorateBFE(definitions)

const STRING = {
  TF: Buffer.from([6, 0]),
}
const BOOL = {
  TF: Buffer.from([6, 1]),
  TRUE: Buffer.from([1]),
  FALSE: Buffer.from([0]),
}
const NIL = {
  TF: Buffer.from([6, 2]),
}
NIL.TFD = NIL.TF

const encoder = {
  boolean(input) {
    const d = input ? BOOL.TRUE : BOOL.FALSE
    return Buffer.concat([BOOL.TF, d])
  },
  sigilSuffix(input, type, format) {
    let data = input
    if (type.sigil) data = data.slice(1)
    if (format.suffix) data = data.slice(0, -format.suffix.length)

    return Buffer.concat([type.code, format.code, Buffer.from(data, 'base64')])
  },
  string(input) {
    return Buffer.concat([STRING.TF, Buffer.from(input, 'utf8')])
  },
}

function encode(input) {
  /* cases we don't encode */
  if (input === undefined || Buffer.isBuffer(input) || Number.isInteger(input))
    return input

  if (typeof input === 'string') {
    /* looks for classic sigil/suffix matches */
    const { type, format } = findClassicTypeFormat(input, TYPES)
    if (type) {
      if (format) return encoder.sigilSuffix(input, type, format)
      else throw new Error(`Unknown ${type.type} format`)
    }

    /* fallback */
    return encoder.string(input)
  }

  if (typeof input === 'boolean') return encoder.boolean(input)
  if (input === null) return NIL.TFD

  /* recursions */
  if (Array.isArray(input)) {
    return input.map((x) => {
      const y = encode(x)
      if (y === undefined) return NIL.TFD
      else return y
    })
  }
  if (typeof input === 'object') {
    // we know it's not: Buffer,null,Array
    const output = {}
    for (const key in input) {
      const y = encode(input[key])
      if (y !== undefined) output[key] = y
    }
    return output
  }

  throw new Error('cannot encode input ' + input)
}

const decoder = {
  sigilSuffix(input, type, format) {
    return [
      type.sigil || '',
      input.slice(2).toString('base64'),
      format.suffix || '',
    ].join('')
  },
  bool(input) {
    if (input.size > 3)
      throw new Error('boolean BFE must be 3 bytes, was ' + input.size)
    if (input.slice(2, 3).equals(BOOL.FALSE)) return false
    if (input.slice(2, 3).equals(BOOL.TRUE)) return true

    throw new Error('invalid boolean BFE')
  },
  string(input) {
    return input.slice(2).toString('utf8')
  },
}

function decode(input) {
  /* cases we don't decode */
  if (input === null) return null
  if (Number.isInteger(input)) return input

  if (Buffer.isBuffer(input)) {
    if (input.length < 2)
      throw new Error(
        'Buffer is missing first two type&format fields: ' + input
      )

    if (input.equals(NIL.TFD)) return null
    if (input.slice(0, 2).equals(BOOL.TF)) return decoder.bool(input)
    if (input.slice(0, 2).equals(STRING.TF)) return decoder.string(input)

    const type = TYPES.find((type) => type.code.equals(input.slice(0, 1)))
    if (type) {
      const format = type.formats.find((format) =>
        format.code.equals(input.slice(1, 2))
      )
      if (format) {
        if (type.sigil || format.suffix)
          return decoder.sigilSuffix(input, type, format)
      }
    }

    throw new Error('unknown type/ format')
  }

  /* recurse */
  if (Array.isArray(input)) return input.map(decode)
  if (typeof input === 'object') {
    // know it's not null, Array
    const output = {}
    for (const key in input) {
      output[key] = decode(input[key])
    }
    return output
  }

  // FIXME: more checks, including floats!
  throw new Error("don't know how to decode: " + input)
}

module.exports = {
  encode,
  decode,
  toString: decode, // alias
  bfeTypes: definitions,
  bfeNamedTypes: definitionsToDict(TYPES),
}
