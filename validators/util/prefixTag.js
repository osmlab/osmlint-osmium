'use strict';

/**
 * @param  {object} propertties 
 * @return {object} properties
 */
module.exports = function(prefix, props) {
  var newProps = {};
  for (var key in props) {
    newProps[prefix + key] = props[key];
  }
  return newProps;
};
