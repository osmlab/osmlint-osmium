'use strict'
var _ = require('underscore')
var prefix = require('./prefixTag')

/**
 * Convert the node objt to a geojson feature
 * @param  {object}
 * @return {object} geojson feature
 */
module.exports = function(node) {
  var properties = _.extend({
    '@id': node.id,
    '@version': node.version,
    '@changeset': node.changeset,
    '@uid': node.uid,
    '@user': node.user,
    '@timestamp': node.timestamp_seconds_since_epoch
  }, node.tags())
  var feature = {
    type: 'Feature',
    properties: properties,
    geometry: node.geojson()
  }
  return feature
}