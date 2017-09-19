'use strict'
var _ = require('underscore')
var prefix = require('./prefixTag')

/**
 * Convert the way obj to a geojson feature
 * @param  {object}
 * @return {object} geojson feature
 */
module.exports = function(way) {
  var properties = _.extend({
    '@id': way.id,
    '@version': way.version,
    '@changeset': way.changeset,
    '@uid': way.uid,
    '@user': way.user,
    '@timestamp': way.timestamp_seconds_since_epoch
  }, way.tags())
  var feature = {
    type: 'Feature',
    properties: properties,
    geometry: way.geojson()
  }
  return feature
}