'use strict'
var _ = require('underscore')
var prefix = require('./prefixTag')


module.exports = function(way) {
  // console.log(relation.tags);
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