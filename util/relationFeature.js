'use strict'
var _ = require('underscore')

/**
 * @param  {object} node object
 * @param  {object} realtions tag
 * @return {object} geojson feature, it include the current tags and the relation tag
 */
module.exports = function (relation) {
  return _.extend({
    props: {
      '@id': relation.id,
      '@version': relation.version,
      '@changeset': relation.changeset,
      '@uid': relation.uid,
      '@user': relation.user,
      '@timestamp': relation.timestamp_seconds_since_epoch
    }
  }, {
    tags: relation.tags()
  }, {
    members: relation.members()
  })
}
