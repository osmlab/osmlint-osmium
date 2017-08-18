# osmlint-osmium validators

### Missing roles in turn-restriction

Detect turn-restriction where missing `from/via/to` role

`osmlinto missingroletr california-latest.osm.pbf output.json`

### Invalid roles in turn-restriction

Detect turn-restriction that has invalid roles

`osmlinto invalidrole california-latest.osm.pbf output.json`

### Excessive roles in turn-restriction

Detect turn-restriction that has more than one `from/via/to` roles

`osmlinto excessiverolestr california-latest.osm.pbf output.json`