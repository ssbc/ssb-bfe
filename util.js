module.exports = {
  definitionsToDict,
}

function definitionsToDict(types) {
  const NAMED_TYPES = {}

  function convertFormats(type) {
    const formats = {}
    for (const format of type.formats) {
      formats[format.format] = format
    }

    return { ...type, formats }
  }

  for (const type of types) {
    NAMED_TYPES[type.type] = convertFormats(type)
  }

  return NAMED_TYPES
}
