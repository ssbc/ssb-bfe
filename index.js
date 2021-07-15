// Following the TFD spec (also known as TFK), the naming convention in this
// file uses "T" to mean "Type byte", "TF" to mean "Type byte and Format byte"
// and "D" to mean "Data bytes".

const STRING_TF = Buffer.from([6, 0])
const BOOL_TF = Buffer.from([6, 1])
const BOOL_TRUE = Buffer.from([1])
const BOOL_FALSE = Buffer.from([0])
const NIL_TF = Buffer.from([6, 2])
const NIL_TFD = NIL_TF

const FEED_T = Buffer.from([0])
const CLASSIC_FEED_TF = Buffer.from([0, 0])
const GG_FEED_TF = Buffer.from([0, 1])
const BB_FEED_TF = Buffer.from([0, 3])

const MSG_T = Buffer.from([1])
const CLASSIC_MSG_TF = Buffer.from([1, 0])
const GG_MSG_TF = Buffer.from([1, 1])
const BB_MSG_TF = Buffer.from([1, 4])

const SIGNATURE_TF = Buffer.from([4, 0])

const BOX_T = Buffer.from([5])
const BOX1_TF = Buffer.from([5, 0])
const BOX2_TF = Buffer.from([5, 1])

const encoder = {
  feed(feedId) {
    let tf
    if (feedId.endsWith('.ed25519')) tf = CLASSIC_FEED_TF
    else if (feedId.endsWith('.bbfeed-v1')) tf = BB_FEED_TF
    else if (feedId.endsWith('.ggfeed-v1')) tf = GG_FEED_TF
    else throw new Error('Unknown feed format: ' + feedId)

    const dotIndex = feedId.lastIndexOf('.')
    const b64part = feedId.substring(1, dotIndex)
    const d = Buffer.from(b64part, 'base64')

    return Buffer.concat([tf, d])
  },

  message(msgId) {
    let tf
    if (msgId.endsWith('.sha256')) tf = CLASSIC_MSG_TF
    else if (msgId.endsWith('.bbmsg-v1')) tf = BB_MSG_TF
    else if (msgId.endsWith('.ggmsg-v1')) tf = GG_MSG_TF
    else throw new Error('Unknown msg ID: ' + msgId)

    const dotIndex = msgId.lastIndexOf('.')
    const b64part = msgId.substring(1, dotIndex)
    const d = Buffer.from(b64part, 'base64')

    return Buffer.concat([tf, d])
  },

  box(boxedStr) {
    if (boxedStr.endsWith('.box')) {
      const b64part = boxedStr.substring(0, boxedStr.length - '.box'.length)
      const d = Buffer.from(b64part, 'base64')
      return Buffer.concat([BOX1_TF, d])
    } else if (boxedStr.endsWith('.box2')) {
      const b64part = boxedStr.substring(0, boxedStr.length - '.box2'.length)
      const d = Buffer.from(b64part, 'base64')
      return Buffer.concat([BOX2_TF, d])
    } else throw new Error('Unknown boxed string: ' + boxedStr)
  },

  signature(sig) {
    const b64part = sig.substring(0, sig.length - '.sig.ed25519'.length)
    const d = Buffer.from(b64part, 'base64')
    return Buffer.concat([SIGNATURE_TF, d])
  },

  string(str) {
    const d = Buffer.from(str, 'utf8')
    return Buffer.concat([STRING_TF, d])
  },

  boolean(bool) {
    const d = bool ? BOOL_TRUE : BOOL_FALSE
    return Buffer.concat([BOOL_TF, d])
  },
}

function encode(input) {
  if (Array.isArray(input)) {
    return input.map((x) => {
      const y = encode(x)
      if (y === undefined) return NIL_TFD
      else return y
    })
  }
  if (input === undefined) {
    return undefined
  } else if (input === null) {
    return NIL_TFD
  } else if (typeof input === 'object' && !Buffer.isBuffer(input)) {
    const output = {}
    for (let key in input) {
      const x = input[key]
      const y = encode(x)
      if (y !== undefined) output[key] = y
    }
    return output
  } else if (typeof input === 'string') {
    if (input.startsWith('@')) return encoder.feed(input)
    else if (input.startsWith('%')) return encoder.message(input)
    else if (input.endsWith('.sig.ed25519')) return encoder.signature(input)
    else if (input.endsWith('.box2') || input.endsWith('.box'))
      return encoder.box(input)
    else return encoder.string(input)
  } else if (typeof input === 'boolean') {
    return encoder.boolean(input)
  } else {
    if (!Number.isInteger(input) && !Buffer.isBuffer(input))
      console.warn('not encoding unknown value', input)
    // FIXME: more checks, including floats!
    return input
  }
}

const decoder = {
  box(buf) {
    const tf = buf.slice(0, 2)
    const d = buf.slice(2)
    if (tf.equals(BOX1_TF)) return d.toString('base64') + '.box1'
    else if (tf.equals(BOX2_TF)) return d.toString('base64') + '.box2'
    else throw new Error('Unknown box: ' + buf)
  },

  feed(buf) {
    const tf = buf.slice(0, 2)
    const d = buf.slice(2)

    let feedextension = ''
    if (tf.equals(CLASSIC_FEED_TF)) feedextension = '.ed25519'
    else if (tf.equals(BB_FEED_TF)) feedextension = '.bbfeed-v1'
    else if (tf.equals(GG_FEED_TF)) feedextension = '.ggfeed-v1'
    else throw new Error('Unknown feed: ' + buf)

    const b64part = d.toString('base64')
    return '@' + b64part + feedextension
  },

  message(buf) {
    const tf = buf.slice(0, 2)
    const d = buf.slice(2)

    let msgextension = ''
    if (tf.equals(CLASSIC_MSG_TF)) msgextension = '.sha256'
    else if (tf.equals(BB_MSG_TF)) msgextension = '.bbmsg-v1'
    else if (tf.equals(GG_MSG_TF)) msgextension = '.ggmsg-v1'
    else throw new Error('Unknown msg: ' + buf)

    const b64part = d.toString('base64')
    return '%' + b64part + msgextension
  },

  signature(buf) {
    const d = buf.slice(2)
    const b64part = d.toString('base64')
    return b64part + '.sig.ed25519'
  },

  string(buf) {
    const d = buf.slice(2)
    return d.toString('utf8')
  },

  boolean(buf) {
    const d = buf.slice(2)
    return d.equals(BOOL_TRUE)
  },
}

function decode(input) {
  if (Array.isArray(input)) {
    return input.map(decode)
  } else if (Buffer.isBuffer(input)) {
    if (input.length < 2)
      throw new Error(
        'Buffer is missing first two type&format fields: ' + input
      )
    const t = input.slice(0, 1)
    const tf = input.slice(0, 2)
    if (tf.equals(STRING_TF)) return decoder.string(input)
    else if (tf.equals(BOOL_TF)) return decoder.boolean(input)
    else if (tf.equals(NIL_TF)) return null
    else if (t.equals(FEED_T)) return decoder.feed(input)
    else if (t.equals(MSG_T)) return decoder.message(input)
    else if (t.equals(BOX_T)) return decoder.box(input)
    else if (tf.equals(SIGNATURE_TF)) return decoder.signature(input)
    else return input.toString('base64')
  } else if (typeof input === 'object' && input !== null) {
    const output = {}
    for (let key in input) {
      const y = input[key]
      const x = decode(y)
      output[key] = x
    }
    return output
  } // FIXME: more checks, including floats!
  else return input
}

module.exports = {
  encode,
  decode,
}
