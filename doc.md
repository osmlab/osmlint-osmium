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

### Missing roles in turn-restriction

Detect missing `type=restriction` or `restriction=*` tags in the relation

`osmlinto redundanttroneway california.osm.pbf output.json`

### Missing roles in turn-restriction

Detect redundant TR's in `oneway` roads

`osmlinto missingtyperestrictiontr california.osm.pbf output.json`
