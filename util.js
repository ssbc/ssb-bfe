const IsCanonicalBase64 = require('is-canonical-base64')

const SUFFIX = '\\.[\\w\\d-]+'
const feedPattern = IsCanonicalBase64('@', SUFFIX)
const msgPattern = IsCanonicalBase64('%', SUFFIX)
const blobPattern = IsCanonicalBase64('&', SUFFIX)

module.exports = {
  isFeedLike(str) {
    return str.startsWith('@') && feedPattern.test(str)
  },
  isMsgLike(str) {
    return str.startsWith('%') && msgPattern.test(str)
  },
  isBlobLike(str) {
    return str.startsWith('&') && blobPattern.test(str)
  },
}
