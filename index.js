'use strict'

module.exports = {
  'missingRoleTR': require('./src/validators/missingRoleTR'),
  'invalidRoleTR': require('./src/validators/invalidRoleTR'),
  'excessiveRolesTR': require('./src/validators/excessiveRolesTR'),
  'missingTypeRestrictionTR': require('./src/validators/missingTypeRestrictionTR'),
  'redundantTROneway': require('./src/validators/redundantTROneway'),
  'filterTRByUsers': require('./src/validators/filterTRByUsers'),
  'filterTRByCommunity': require('./src/validators/filterTRByCommunity')
}
