// Following the TFD spec (also known as TFK), the naming convention in this
// file uses "T" to mean "Type byte", "TF" to mean "Type byte and Format byte"
// and "D" to mean "Data bytes".

const TYPES = require('./bfe.json')

const BUFFED_TYPES = TYPES.map((type) => {
  return {
    ...type,
    code: Buffer.from([type.code]),
    formats: type.formats.map((format) => {
      return {
        ...format,
        code: Buffer.from([format.code]),
        TFCode: Buffer.from([type.code, format.code]),
        suffixChecks: getSuffixChecks(format.suffix),
      }
    }),
  }
})

function getSuffixChecks(suffix) {
  if (!suffix) return

  const result = []
  for (let type of TYPES) {
    for (let format of type.formats) {
      if (format.suffix) {
      }
      if (
        format.suffix &&
        format.suffix.endsWith(suffix) &&
        format.suffix !== suffix
      ) {
        result.push(format.suffix)
      }
    }
  }

  return result.length ? result : undefined
}

// WIP SUFFIX_ONLY_TFS
// SIGILLED_TFS

function convertTypesToNamedTypes(TYPES) {
  const NAMED_TYPES = {}

  function convertFormats(type) {
    const formats = {}
    for (let i = 0; i < type.formats.length; ++i) {
      const format = type.formats[i]
      formats[format.format] = format
    }

    return { ...type, formats }
  }

  for (let i = 0; i < TYPES.length; ++i) {
    const type = TYPES[i]
    NAMED_TYPES[type.type] = convertFormats(type)
  }

  return NAMED_TYPES
}

const NAMED_TYPES = convertTypesToNamedTypes(TYPES)

const GENERIC = NAMED_TYPES['generic']
const STRING_TF = Buffer.from([
  GENERIC.code,
  GENERIC.formats['UTF8 string'].code,
])
const BOOL_TF = Buffer.from([GENERIC.code, GENERIC.formats['boolean'].code])
const BOOL_TRUE = Buffer.from([1])
const BOOL_FALSE = Buffer.from([0])
const NIL_TF = Buffer.from([GENERIC.code, GENERIC.formats['nil'].code])
const NIL_TFD = NIL_TF

const encoder = {
  uri(input) {
    let [type, format, ...data] = input.slice(6).split('/')
    // *FIRE* WARNING ... are we URIEncoding our URIs?!
    type = NAMED_TYPES[type]
    if (type) {
      format = type.formats[format]
      if (format) {
        return Buffer.concat([
          Buffer.from([type.code]),
          Buffer.from([format.code]),
          Buffer.from(data.join('/'), 'base64'),
        ])
      }
    }
    throw new Error(`unknown type/format ${type.type}/${format.format}`)
  },
  boolean(input) {
    const d = input ? BOOL_TRUE : BOOL_FALSE
    return Buffer.concat([BOOL_TF, d])
  },
  string(input) {
    return Buffer.concat([Buffer.from([6, 0]), Buffer.from(input, 'utf8')])
  },
}

function findTypeFormat(input) {
  // Look for type based on sigil
  // NOTE tests guarentee that sigil is unique across types
  let type = BUFFED_TYPES.find(
    (type) => type.sigil && input.startsWith(type.sigil)
  )
  let format

  // Look for type, format based on suffix
  // NOTE tests guarentee suffixes are unique for all type-formats
  if (!type) {
    for (let type of BUFFED_TYPES) {
      for (let format of type.formats) {
        if (isInputSuffixMatch(input, format)) {
          return { type, format }
        }
      }
    }
  }

  if (type && !format) {
    format = type.formats.find(
      (format) => format.suffix && input.endsWith(format.suffix)
    )
  }

  return { type, format }
}

function isInputSuffixMatch(input, format) {
  return (
    format.suffix &&
    input.endsWith(format.suffix) &&
    !(
      // check we've not matched with part of a longer cousin suffix
      // e.g. .ed25519 in .sig.ed25519
      (
        format.suffixChecks &&
        format.suffixChecks.some((s) => input.endsWith(s))
      )
    )
  )
}

function encode(input) {
  /* cases we don't encode */
  if (input === undefined || Buffer.isBuffer(input) || Number.isInteger(input))
    return input

  if (typeof input === 'string') {
    if (input.startsWith('ssb://')) return encoder.uri(input)

    /* classic links (sigil and/or suffix matches) */
    const { type, format } = findTypeFormat(input)
    if (type && format) {
      let data = input
      if (type.sigil) data = data.slice(1)
      if (format.suffix) data = data.replace(format.suffix, '')

      return Buffer.concat([
        type.code,
        format.code,
        Buffer.from(data, 'base64'),
      ])
    }

    /* fallback */
    return encoder.string(input)
  }
  if (typeof input === 'boolean') return encoder.boolean(input)
  if (input === null) return NIL_TFD

  /* recursions */
  if (Array.isArray(input)) {
    return input.map((x) => {
      const y = encode(x)
      if (y === undefined) return NIL_TFD
      else return y
    })
  }
  if (typeof input === 'object') {
    // we know it's not: Buffer,null,Array
    const output = {}
    for (let key in input) {
      const y = encode(input[key])
      if (y !== undefined) output[key] = y
    }
    return output
  }

  throw new Error('cannot encoding, type is not defined')
}

const decoder = {
  classic(input, type, format) {
    return [
      type.sigil || '',
      input.slice(2).toString('base64'),
      format.suffix || '',
    ].join('')
  },
  bool(input) {
    if (input.size > 3) throw new Error('boolean BFE must be 3 bytes')
    if (input.slice(2, 3).equals(BOOL_FALSE)) return false
    if (input.slice(2, 3).equals(BOOL_TRUE)) return true

    throw new Error('invalid boolean BFE')
  },
  uri(input, type, format) {
    return [
      'ssb:/',
      type.type,
      format.format,
      input.slice(2).toString('base64'),
    ].join('/')
  },
}

function decode(input) {
  /* cases we don't decode */
  if (input === null) return null
  if (Number.isInteger(input)) return input

  if (Buffer.isBuffer(input)) {
    if (input.length < 2)
      throw new Error('Buffer is missing first two type & format bytes')

    if (input.slice(0, 2).equals(NIL_TF)) return null
    if (input.slice(0, 2).equals(BOOL_TF)) return decoder.bool(input)
    if (input.slice(0, 2).equals(STRING_TF))
      return input.slice(2).toString('utf8')

    const type = BUFFED_TYPES.find((type) =>
      type.code.equals(input.slice(0, 1))
    )
    if (type) {
      const format = type.formats.find((format) =>
        format.code.equals(input.slice(1, 2))
      )
      if (format) {
        if (type.sigil || format.suffix)
          return decoder.classic(input, type, format)
        else return decoder.uri(input, type, format)
      }
    }

    throw new Error('unknown type/ format')
  }

  /* recurse */
  if (Array.isArray(input)) return input.map(decode)
  if (typeof input === 'object') {
    // know it's not null, Array
    const output = {}
    for (let key in input) {
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
  toString: decode,
  bfeTypes: TYPES,
  bfeNamedTypes: NAMED_TYPES,
}
