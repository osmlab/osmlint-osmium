'use strict'
var _ = require('underscore')
var prefix = require('./prefixTag')

/**
 * Join features with relation features.
 * @param  {object} realtions tag
 * @return {object} geojson feature, it include the current tags and the relation tag
 */
module.exports = function(obj, relation, rol) {
	var properties = _.extend(
		obj.properties, {
			'@idrel': relation.props['@id']
		}, prefix('relation_propertie_', relation.props), prefix('relation_tag_', relation.tags), prefix('relation_role_', rol))
	obj.properties = properties;
	return obj
}