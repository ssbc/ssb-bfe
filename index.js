const STRINGTYPE = Buffer.from([6, 0])
const BOOLTYPE = Buffer.from([6, 1])
const BOOLTRUE = Buffer.from([1])
const UNDEFINEDTYPE = Buffer.from([6, 2])

const FEEDTYPE = Buffer.from([0])
const CLASSICFEEDTYPE = Buffer.from([0, 0])
const GGFEEDTYPE = Buffer.from([0, 1])
const BBFEEDTYPE = Buffer.from([0, 3])

const MSGTYPE = Buffer.from([1])
const CLASSICMSGTYPE = Buffer.from([1, 0])
const GGMSGTYPE = Buffer.from([1, 1])
const BBMSGTYPE = Buffer.from([1, 4])
const nullMsgBytes = Buffer.alloc(32)

const SIGNATURETYPE = Buffer.from([4, 0])

const BOXTYPE = Buffer.from([5])
const BOX1TYPE = Buffer.from([5, 0])
const BOX2TYPE = Buffer.from([5, 1])

let encoder = {
  feed(feed) {
    let feedtype
    if (feed.endsWith('.ed25519'))
      feedtype = CLASSICFEEDTYPE
    else if (feed.endsWith('.bbfeed-v1'))
      feedtype = BBFEEDTYPE
    else if (feed.endsWith('.ggfeed-v1'))
      feedtype = GGFEEDTYPE
    else throw new Error("Unknown feed format: " + feed)

    const dotIndex = feed.lastIndexOf('.')

    return Buffer.concat([
      feedtype,
      Buffer.from(feed.substring(1, dotIndex), 'base64')
    ])
  },
  emptyMessage(feedformat) {
    let msgtype
    if (feedformat === 'classic')
      msgtype = CLASSICMSGTYPE
    else if (feedformat === 'bendybutt')
      msgtype = BBMSGTYPE
    else throw new Error("Unknown msg: " + msg)

    return Buffer.concat([
      msgtype,
      nullMsgBytes
    ])
  },
  message(msg) {
    let msgtype
    if (msg.endsWith('.sha256'))
      msgtype = CLASSICMSGTYPE
    else if (msg.endsWith('.bbmsg-v1'))
      msgtype = BBMSGTYPE
    else if (msg.endsWith('.ggmsg-v1'))
      msgtype = GGMSGTYPE
    else throw new Error("Unknown msg: " + msg)

    const dotIndex = msg.lastIndexOf('.')

    return Buffer.concat([
      msgtype,
      Buffer.from(msg.substring(1, dotIndex), 'base64')
    ])
  },
  box(value) {
    if (value.endsWith(".box"))
      return Buffer.concat([
        BOX1TYPE,
        Buffer.from(value.substring(0, value.length-'.box'.length), 'base64')
      ])
    else if (value.endsWith(".box2"))
      return Buffer.concat([
        BOX2TYPE,
        Buffer.from(value.substring(0, value.length-'.box2'.length), 'base64')
      ])
    else throw new Error("Unknown box: " + value)
  },
  signature(sig) {
    return Buffer.concat([
      SIGNATURETYPE,
      Buffer.from(sig.substring(0, sig.length-'.sig.ed25519'.length), 'base64')
    ])
  },
  string(str) {
    return Buffer.concat([
      STRINGTYPE,
      Buffer.from(str) // utf8 default
    ])
  },
  boolean(bool) {
    return Buffer.concat([
      BOOLTYPE,
      Buffer.from([bool ? 1 : 0])
    ])
  }
}

exports.encodeBendyButt = function encodeBendyButt(value) {
  return exports.encode('bendybutt', value)
}

exports.encodeClassic = function encodeClassic(value) {
  return exports.encode('classic', value)
}

exports.encode = function encode(feedformat, value) {
  if (Array.isArray(value)) {
    return value.map(x => exports.encode(feedformat, x))
  } else if (value === undefined) {
    return UNDEFINEDTYPE
  } else if (value === null) {
    return encoder.emptyMessage(feedformat)
  } else if (!Buffer.isBuffer(value) && typeof value === 'object' && value !== null) {
    const converted = {}
    for (var k in value)
      converted[k] = exports.encode(feedformat, value[k])
    return converted
  } else if (typeof value === 'string') {
    if (value.startsWith('@'))
      return encoder.feed(value)
    else if (value.startsWith('%'))
      return encoder.message(value)
    else if (value.endsWith('.sig.ed25519'))
      return encoder.signature(value)
    else if (value.endsWith('.box2') || value.endsWith('.box'))
      return encoder.box(value)
    else
      return encoder.string(value)
  } else if (typeof value == "boolean") {
    return encoder.boolean(value)
  } else {
    if (!Number.isInteger(value) && !Buffer.isBuffer(value))
      console.log("not encoding unknown value", value)
    // FIXME: more checks, including floats!
    return value
  }
}

// decode

let decoder = {
  box(benc) {
    if (benc.slice(0, 2).equals(BOX1TYPE))
      return benc.slice(2).toString('base64') + '.box1'
    else if (benc.slice(0, 2).equals(BOX2TYPE))
      return benc.slice(2).toString('base64') + '.box2'
    else throw new Erro("Unknown box: " + benc)
  },
  feed(benc) {
    let feedextension = ''
    if (benc.slice(0, 2).equals(CLASSICFEEDTYPE))
      feedextension = '.ed25519'
    else if (benc.slice(0, 2).equals(BBFEEDTYPE))
      feedextension = '.bbfeed-v1'
    else if (benc.slice(0, 2).equals(GGFEEDTYPE))
      feedextension = '.ggfeed-v1'
    else throw new Error("Unknown feed: " + benc)

    return '@' + benc.slice(2).toString('base64') + feedextension
  },
  message(benc) {
    if (benc.slice(2).compare(nullMsgBytes, 0, 32) === 0)
      return null

    let msgextension = ''
    if (benc.slice(0, 2).equals(CLASSICMSGTYPE))
      msgextension = '.sha256'
    else if (benc.slice(0, 2).equals(BBMSGTYPE))
      msgextension = '.bbmsg-v1'
    else if (benc.slice(0, 2).equals(GGMSGTYPE))
      msgextension = '.ggmsg-v1'
    else throw new Error("Unknown msg: " + benc)

    return '%' + benc.slice(2).toString('base64') + msgextension
  },
  signature(benc) {
    return benc.slice(2).toString('base64') + '.sig.ed25519'
  },
  string(benc) {
    return benc.slice(2).toString()
  },
  boolean(benc) {
    return benc.slice(2).equals(BOOLTRUE)
  }
}

exports.decode = function decode(value) {
  if (Array.isArray(value)) {
    return value.map(x => exports.decode(x))
  } else if (Buffer.isBuffer(value)) {
    if (value.length < 2) throw new Error("Buffer length < 2, " + value)
    if (value.slice(0, 2).equals(STRINGTYPE))
      return decoder.string(value)
    else if (value.slice(0, 2).equals(BOOLTYPE))
      return decoder.boolean(value)
    else if (value.slice(0, 2).equals(UNDEFINEDTYPE))
      return undefined
    else if (value.slice(0, 1).equals(FEEDTYPE))
      return decoder.feed(value)
    else if (value.slice(0, 1).equals(MSGTYPE))
      return decoder.message(value)
    else if (value.slice(0, 1).equals(BOXTYPE))
      return decoder.box(value)
    else if (value.slice(0, 2).equals(SIGNATURETYPE))
      return decoder.signature(value)
    else
      return value.toString('base64')
  } else if (typeof value === 'object' && value !== null) {
    const converted = {}
    for (var k in value)
      converted[k] = exports.decode(value[k])
    return converted
  } else // FIXME: more checks, including floats!
    return value
}
