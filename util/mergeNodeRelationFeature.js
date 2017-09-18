'use strict'
var _ = require('underscore')
var prefix = require('./prefixTag')

/**
 * @param  {object} node object
 * @param  {object} realtions tag
 * @return {object} geojson feature, it include the current tags and the relation tag
 */
module.exports = function (node, relation, rol) {
  var properties = _.extend({
    '@id': node.id,
    '@version': node.version,
    '@changeset': node.changeset,
    '@uid': node.uid,
    '@user': node.user,
    '@idrel': relation.props['@id']
  }, node.tags(), prefix('rProp_', relation.props), prefix('rTag_', relation.tags), prefix('rRol_', rol))
  var feature = {
    type: 'Feature',
    properties: properties,
    geometry: node.geojson()
  }
  return feature
}
