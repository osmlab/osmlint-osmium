# osmlint-osmium validators

### Missing roles in turn-restriction

Detect turn-restriction where missing `from/via/to` role

`osmlinto missingroletr california.osm.pbf output.json`

### Invalid roles in turn-restriction

Detect turn-restriction that has invalid roles

`osmlinto invalidroletr california.osm.pbf output.json`

### Excessive roles in turn-restriction

Detect turn-restriction that has more than one `from/via/to` roles

`osmlinto excessiverolestr california.osm.pbf output.json`

### Missing type of restriction  in TR

Detect missing `type=restriction` or `restriction=*` tags in the relation

`osmlinto redundanttroneway california.osm.pbf output.json`

### Redundant TR in one way roads

Detect redundant TR's in `oneway` roads

`osmlinto missingtyperestrictiontr california.osm.pbf output.json`

# Turn restrictions edited by the community

Filter turn restrictions edited by community, we are avoiding where the Mapbox data-team users

`osmlinto filterbycommunity california.osm.pbf  --since 90 test.json`

Note:

The option `--since 90 ` neam the editions in the last 90 days