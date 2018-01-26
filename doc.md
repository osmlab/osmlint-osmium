# osmlint-osmium validators

### Missing roles in turn-restriction

Detect turn-restriction with missing `from/via/to` role.

`osmlinto missingroletr california.osm.pbf output.json`

### Invalid roles in turn-restriction

Detect turn-restriction with invalid roles.

`osmlinto invalidroletr california.osm.pbf output.json`

### Excessive roles in turn-restriction

Detect turn-restriction that has more than one `from/via/to` roles.

`osmlinto excessiverolestr california.osm.pbf output.json`

### Missing type of restriction  in TR

Detect missing `type=restriction` or `restriction=*` tags in the relation.

`osmlinto missingtyperestrictiontr california.osm.pbf output.json`

### Redundant TR in one way roads

Detect redundant turn-restriction in `oneway` roads.

`osmlinto redundanttroneway california.osm.pbf output.json`

### Turn restrictions edited by the community

Filter turn-restrictions not by Mapbox data-team.

`osmlinto filterbycommunity california.osm.pbf  --since 90 test.json`

Note:

The option `--since 90` in number of days.
