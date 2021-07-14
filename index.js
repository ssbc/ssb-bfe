const STRING_TYPE = Buffer.from([6, 0])
const BOOL_TYPE = Buffer.from([6, 1])
const BOOL_TRUE = Buffer.from([1])
const NULL_TYPE = Buffer.from([6, 2])

const FEED_TYPE = Buffer.from([0])
const CLASSIC_FEED_TYPE = Buffer.from([0, 0])
const GG_FEED_TYPE = Buffer.from([0, 1])
const BB_FEED_TYPE = Buffer.from([0, 3])

const MSG_TYPE = Buffer.from([1])
const CLASSIC_MSG_TYPE = Buffer.from([1, 0])
const GG_MSG_TYPE = Buffer.from([1, 1])
const BB_MSG_TYPE = Buffer.from([1, 4])

const SIGNATURE_TYPE = Buffer.from([4, 0])

const BOX_TYPE = Buffer.from([5])
const BOX1_TYPE = Buffer.from([5, 0])
const BOX2_TYPE = Buffer.from([5, 1])

const encoder = {
  feed(feed) {
    let feedtype
    if (feed.endsWith('.ed25519')) feedtype = CLASSIC_FEED_TYPE
    else if (feed.endsWith('.bbfeed-v1')) feedtype = BB_FEED_TYPE
    else if (feed.endsWith('.ggfeed-v1')) feedtype = GG_FEED_TYPE
    else throw new Error('Unknown feed format: ' + feed)

    const dotIndex = feed.lastIndexOf('.')

    return Buffer.concat([
      feedtype,
      Buffer.from(feed.substring(1, dotIndex), 'base64'),
    ])
  },
  message(msg) {
    let msgtype
    if (msg.endsWith('.sha256')) msgtype = CLASSIC_MSG_TYPE
    else if (msg.endsWith('.bbmsg-v1')) msgtype = BB_MSG_TYPE
    else if (msg.endsWith('.ggmsg-v1')) msgtype = GG_MSG_TYPE
    else throw new Error('Unknown msg: ' + msg)

    const dotIndex = msg.lastIndexOf('.')

    return Buffer.concat([
      msgtype,
      Buffer.from(msg.substring(1, dotIndex), 'base64'),
    ])
  },
  box(value) {
    if (value.endsWith('.box'))
      return Buffer.concat([
        BOX1_TYPE,
        Buffer.from(value.substring(0, value.length - '.box'.length), 'base64'),
      ])
    else if (value.endsWith('.box2'))
      return Buffer.concat([
        BOX2_TYPE,
        Buffer.from(
          value.substring(0, value.length - '.box2'.length),
          'base64'
        ),
      ])
    else throw new Error('Unknown box: ' + value)
  },
  signature(sig) {
    return Buffer.concat([
      SIGNATURE_TYPE,
      Buffer.from(
        sig.substring(0, sig.length - '.sig.ed25519'.length),
        'base64'
      ),
    ])
  },
  string(str) {
    return Buffer.concat([
      STRING_TYPE,
      Buffer.from(str), // utf8 default
    ])
  },
  boolean(bool) {
    return Buffer.concat([BOOL_TYPE, Buffer.from([bool ? 1 : 0])])
  },
}

function encode(feedformat, value) {
  if (Array.isArray(value)) {
    return value.map((x) => {
      const y = encode(feedformat, x)
      if (y === undefined) return NULL_TYPE
      else return y
    })
  } else if (value === undefined) {
    return undefined
  } else if (value === null) {
    return NULL_TYPE
  } else if (!Buffer.isBuffer(value) && typeof value === 'object') {
    const converted = {}
    for (var k in value) {
      const y = encode(feedformat, value[k])
      if (y !== undefined) converted[k] = y
    }
    return converted
  } else if (typeof value === 'string') {
    if (value.startsWith('@')) return encoder.feed(value)
    else if (value.startsWith('%')) return encoder.message(value)
    else if (value.endsWith('.sig.ed25519')) return encoder.signature(value)
    else if (value.endsWith('.box2') || value.endsWith('.box'))
      return encoder.box(value)
    else return encoder.string(value)
  } else if (typeof value === 'boolean') {
    return encoder.boolean(value)
  } else {
    if (!Number.isInteger(value) && !Buffer.isBuffer(value))
      console.log('not encoding unknown value', value)
    // FIXME: more checks, including floats!
    return value
  }
}

function encodeBendyButt(value) {
  return encode('bendybutt', value)
}

function encodeClassic(value) {
  return encode('classic', value)
}

// decode

const decoder = {
  box(benc) {
    if (benc.slice(0, 2).equals(BOX1_TYPE))
      return benc.slice(2).toString('base64') + '.box1'
    else if (benc.slice(0, 2).equals(BOX2_TYPE))
      return benc.slice(2).toString('base64') + '.box2'
    else throw new Erro('Unknown box: ' + benc)
  },
  feed(benc) {
    let feedextension = ''
    if (benc.slice(0, 2).equals(CLASSIC_FEED_TYPE)) feedextension = '.ed25519'
    else if (benc.slice(0, 2).equals(BB_FEED_TYPE)) feedextension = '.bbfeed-v1'
    else if (benc.slice(0, 2).equals(GG_FEED_TYPE)) feedextension = '.ggfeed-v1'
    else throw new Error('Unknown feed: ' + benc)

    return '@' + benc.slice(2).toString('base64') + feedextension
  },
  message(benc) {
    let msgextension = ''
    if (benc.slice(0, 2).equals(CLASSIC_MSG_TYPE)) msgextension = '.sha256'
    else if (benc.slice(0, 2).equals(BB_MSG_TYPE)) msgextension = '.bbmsg-v1'
    else if (benc.slice(0, 2).equals(GG_MSG_TYPE)) msgextension = '.ggmsg-v1'
    else throw new Error('Unknown msg: ' + benc)

    return '%' + benc.slice(2).toString('base64') + msgextension
  },
  signature(benc) {
    return benc.slice(2).toString('base64') + '.sig.ed25519'
  },
  string(benc) {
    return benc.slice(2).toString()
  },
  boolean(benc) {
    return benc.slice(2).equals(BOOL_TRUE)
  },
}

function decode(value) {
  if (Array.isArray(value)) {
    return value.map(decode)
  } else if (Buffer.isBuffer(value)) {
    if (value.length < 2) throw new Error('Buffer length < 2, ' + value)
    if (value.slice(0, 2).equals(STRING_TYPE)) return decoder.string(value)
    else if (value.slice(0, 2).equals(BOOL_TYPE)) return decoder.boolean(value)
    else if (value.slice(0, 2).equals(NULL_TYPE)) return null
    else if (value.slice(0, 1).equals(FEED_TYPE)) return decoder.feed(value)
    else if (value.slice(0, 1).equals(MSG_TYPE)) return decoder.message(value)
    else if (value.slice(0, 1).equals(BOX_TYPE)) return decoder.box(value)
    else if (value.slice(0, 2).equals(SIGNATURE_TYPE))
      return decoder.signature(value)
    else return value.toString('base64')
  } else if (typeof value === 'object' && value !== null) {
    const converted = {}
    for (var k in value) converted[k] = decode(value[k])
    return converted
  } // FIXME: more checks, including floats!
  else return value
}

module.exports = {
  encode,
  encodeBendyButt,
  encodeClassic,
  decode,
}
