'use strict';
var _ = require('underscore');

/**
 * Check if two member with different roles continuous or connected
 * @param  {array} array of roles 
 * @param  {array} array of roles 
 * 
 * @return {boolean}
 */
module.exports = function(role, via) {
  var viaCoords = []
  for (var i = 0; i < via.length; i++) {
    if (via[i].geometry.type === 'LineString') {
      viaCoords = viaCoords.concat(_.flatten(via[i].geometry.coordinates))

    } else if (via[i].geometry.type === 'Point') {
      viaCoords = viaCoords.concat(_.flatten(via[i].geometry.coordinates))

    }
  }
  console.log(JSON.stringify(viaCoords) + '=====' + JSON.stringify(_.flatten(role[0].geometry.coordinates)));
  if (_.intersection(viaCoords, _.flatten(role[0].geometry.coordinates)) === 2) {
    return true;
  }
  return false;
};