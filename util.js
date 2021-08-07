module.exports = {
  bufferizeCodes,
  findClassicTypeFormat,
  sortByNames,
}

function bufferizeCodes(types) {
  return types.map((type) => {
    return {
      ...type,
      code: Buffer.from([type.code]),
      formats: type.formats.map((format) => {
        return {
          ...format,
          code: Buffer.from([format.code]),
          // TFCode: Buffer.from([type.code, format.code]),
          suffixChecks: getSuffixChecks(types, format.suffix),
        }
      }),
    }
  })
}

function getSuffixChecks(types, suffix) {
  if (!suffix) return

  const result = []
  for (let type of types) {
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

function sortByNames(types) {
  const NAMED_TYPES = {}

  function convertFormats(type) {
    const formats = {}
    for (let format of type.formats) {
      formats[format.format] = format
    }

    return { ...type, formats }
  }

  for (let type of types) {
    NAMED_TYPES[type.type] = convertFormats(type)
  }

  return NAMED_TYPES
}

function findClassicTypeFormat(input, types) {
  // Look for type based on sigil
  // NOTE tests guarentee that sigil is unique across types
  let type = types.find((type) => type.sigil && input.startsWith(type.sigil))
  let format

  // Look for type, format based on suffix
  // NOTE tests guarentee suffixes are unique for all type-formats
  if (!type) {
    for (let type of types) {
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
