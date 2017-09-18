'use strict'

module.exports = {
  'missingRoleTR': require('./validators/missingRoleTR'),
  'invalidRoleTR': require('./validators/invalidRoleTR'),
  'excessiveRolesTR': require('./validators/excessiveRolesTR'),
  'missingTypeRestrictionTR': require('./validators/missingTypeRestrictionTR'),
  'redundantTROneway': require('./validators/redundantTROneway')
}
