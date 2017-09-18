'use strict'
var _ = require('underscore')

/**
 * @param  {object} properties
 * @return {boolean}
 */
module.exports = function (tags, valueTags) {
  var match = 0
  _.each(valueTags, function (v, k) {
    if (tags[k] === v || (tags[k] && v === '*')) {
      match++
    }
  })
  if (match === _.size(valueTags)) {
    return true
  }
  return false
}
