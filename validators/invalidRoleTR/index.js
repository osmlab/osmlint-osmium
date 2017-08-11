'use strict';
var fs = require('fs');
var osmium = require('osmium');
var turf = require('@turf/turf');
var _ = require('underscore');

module.exports = function(pbfFile, outputFile) {
  var wstream = fs.createWriteStream(outputFile);
  var relationsMemb = {};
  var relNodes = {};
  var relWays = {};
  var relations = {};
  var handlerA = new osmium.Handler();
  var roles = ['from', 'via', 'to'];
  handlerA.on('relation', function(relation) {
    if (relation.tags('type') === 'restriction') {
      var tr = {};
      var flagTR = false;
      var members = relation.members();
      for (var d = 0; d < members.length; d++) {
        if (!members[d].role) {
          flagTR = true;
        }
        tr[members[d].ref] = members[d];
      }
      var elems = _.flatten(_.values(tr));
      if (flagTR) {
        relations[relation.id] = _.extend({
          id: relation.id,
          version: relation.version,
          changeset: relation.changeset,
          uid: relation.uid,
          user: relation.user
        }, relation.tags(), {
          members: elems
        });
        for (var i = 0; i < elems.length; i++) {
          elems[i].relation = relation.id;
          if (elems[i].type === 'n') {
            relNodes[elems[i].ref] = elems[i];
          }
          if (elems[i].type === 'w') {
            relWays[elems[i].ref] = elems[i];
          }
        }
      }
    }
  });
  var reader = new osmium.BasicReader(pbfFile);
  osmium.apply(reader, handlerA);

  var handlerB = new osmium.Handler();
  handlerB.on('node', function(node) {
    if (relNodes[node.id]) {
      var properties = _.extend(node.tags(), relNodes[node.id]);
      var feature = {
        type: 'Feature',
        properties: properties,
        geometry: node.geojson()
      };
      if (relationsMemb[properties.relation]) {
        relationsMemb[properties.relation].push(feature);
      } else {
        relationsMemb[properties.relation] = [feature];
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  osmium.apply(reader, handlerB);

  var handlerC = new osmium.Handler();
  handlerC.on('way', function(way) {
    if (relWays[way.id]) {
      var properties = _.extend(way.tags(), relWays[way.id]);
      var feature = {
        type: 'Feature',
        properties: properties,
        geometry: way.geojson()
      };
      if (relationsMemb[properties.relation]) {
        relationsMemb[properties.relation].push(feature);
      } else {
        relationsMemb[properties.relation] = [feature];
      }
    }
  });

  reader = new osmium.Reader(pbfFile);
  var locationHandler = new osmium.LocationHandler();
  osmium.apply(reader, locationHandler, handlerC);

  handlerC.on('done', function() {
    for (var rel in relationsMemb) {
      var fc = {
        type: 'FeatureCollection',
        features: relationsMemb[rel]
      };
      var line = turf.polygonToLineString(turf.bboxPolygon(turf.bbox(fc)));
      line.properties = _.extend(relations[rel], {
        relations: relationsMemb[rel]
      });
      wstream.write(JSON.stringify(line) + '\n');
    }
    wstream.end();
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
};