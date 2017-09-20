'use strict'

module.exports = {
  'missingRoleTR': require('./src/validators/missingRoleTR'),
  'invalidRoleTR': require('./src/validators/invalidRoleTR'),
  'excessiveRolesTR': require('./src/validators/excessiveRolesTR'),
  'missingTypeRestrictionTR': require('./src/validators/missingTypeRestrictionTR'),
  'redundantTROneway': require('./src/validators/redundantTROneway'),
  'FilterTRByUsers': require('./src/validators/FilterTRByUsers')
}
