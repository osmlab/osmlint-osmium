'use strict';
var _ = require('underscore');

/**
 * simplify any role 
 * @param  {array} array of members 
 * @return {object}
 */
module.exports = function(roles) {
  var role = {
    type: null,
    start: [],
    end: []
  }

  // if (roles.length == 1) {
  //   if (roles[0].geometry.type === 'LineString') {
  //     role.start = roles[0].geometry.coordinates[0];
  //     role.end = roles[0].geometry.coordinates[roles[0].geometry.coordinates.length - 1];
  //   } else if (roles[0].geometry.type === 'Point') {
  //     role.start = roles[0].geometry.coordinates;
  //     role.end = roles[0].geometry.coordinates;
  //   }
  // } else {
  for (var i = 0; i < roles.length; i++) {
    var feature = roles[i];
    var coords = feature.geometry.coordinates;
    if (feature.geometry.type === 'LineString') {
      var endCoord = coords[coords.length - 1];
      var startCoord = coords[0];
      role.type = 'line';
      if (role.start.length === 0) {
        role.start = startCoord;
        role.end = endCoord;
      } else {
        if (_.intersection(role.start, endCoord).length == 2) {
          role.start = startCoord;
        } else if (_.intersection(role.end, startCoord).length == 2) {
          role.end = endCoord;
        }
      }
    } else if (feature.geometry.type === 'Point') {
      if (role.start.length === 0) {
        role.type = 'node'
        role.start = coords;
        role.end = coords;
      }
    }
  }
  return role;
};