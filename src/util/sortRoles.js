'use strict'

/**
 * @param  {object} features members
 * @return {object} menbers sorted
 */
module.exports = function (members) {
  var roles = ['via', 'from', 'to']
  var sortMembers = {
    from: [],
    to: [],
    via: []
  }
  for (var key in members) {
    var role = members[key].properties.rRol_role
    if (roles.indexOf(role) > -1) {
      if (sortMembers[role].length > 0) {
        sortMembers[role].push(members[key])
      } else {
        sortMembers[role] = [members[key]]
      }
    }
  }
  return sortMembers
}
