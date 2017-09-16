'use strict';
var fs = require('fs');
var osmium = require('osmium');
var turf = require('@turf/turf');
var _ = require('underscore');

module.exports = function(pbfFile, outputFile) {
  var wstream = fs.createWriteStream(outputFile);
  var relationsMemb = {};
  var nodes = {};
  var ways = {};
  var relations = {};
  var handlerA = new osmium.Handler();
  handlerA.on('relation', function(relation) {
    if (relation.tags('type') === 'restriction') {
      var members = relation.members();
      // var tr = {}
      relations[relation.id] = _.extend({
        id: relation.id,
        version: relation.version,
        changeset: relation.changeset,
        uid: relation.uid,
        user: relation.user
      }, relation.tags(), {
        members: members
      });
      for (var i = 0; i < members.length; i++) {
        members[i].relation = relation.id;
        if (members[i].type === 'n') {
          if (nodes[members[i].ref]) {
            nodes[members[i].ref].push(members[i]);
          } else {
            nodes[members[i].ref] = [members[i]];
          }
        }
        if (members[i].type === 'w') {
          if (ways[members[i].ref]) {
            ways[members[i].ref].push(members[i]);
          } else {
            ways[members[i].ref] = [members[i]];
          }
        }
      }
    }
  });
  var reader = new osmium.BasicReader(pbfFile);
  osmium.apply(reader, handlerA);

  var handlerB = new osmium.Handler();
  handlerB.on('node', function(node) {
    if (nodes[node.id]) {
      var relationsNode = nodes[node.id];
      for (var n = 0; n < relationsNode.length; n++) {
        var properties = _.extend(node.tags(), relationsNode[n], relations[relationsNode[n].relation]);
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
    }
  });

  reader = new osmium.Reader(pbfFile);
  osmium.apply(reader, handlerB);

  var handlerC = new osmium.Handler();
  handlerC.on('way', function(way) {
    if (ways[way.id]) {
      var relationsWay = ways[way.id];
      for (var m = 0; m < relationsWay.length; m++) {
        var properties = _.extend(way.tags(), relationsWay[m], relations[relationsWay[m].relation]);
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
    }
  });

  reader = new osmium.Reader(pbfFile);
  var locationHandler = new osmium.LocationHandler();
  osmium.apply(reader, locationHandler, handlerC);

  handlerC.on('done', function() {
    for (var rel in relationsMemb) {
      var listMenbers = relationsMemb[rel];
      var flagRelation = false;
      var from = 0;
      var connectedVia = {};
      var to = 0;
      for (var k = 0; k < listMenbers.length; k++) {
        var menR = listMenbers[k];
        var coords = menR.geometry.coordinates;
        if (menR.properties.type === 'n' && menR.properties.role === 'via') {
          connectedVia[coords.join(',')] = true;
        }
        if (menR.properties.type === 'w' && menR.properties.role === 'via') {
          connectedVia[coords[0].join(',')] = true;
          connectedVia[coords[coords.length - 1].join(',')] = true;
        }
        if (menR.properties.type === 'w' && menR.properties.role === 'from') {
          from = coords[coords.length - 1].join(',');

        }
        if (menR.properties.type === 'w' && menR.properties.role === 'to') {
          to = coords[0].join(',');
        }
      }
      if (!connectedVia[from] || !connectedVia[to]) {
        var fc = {
          type: 'FeatureCollection',
          features: relationsMemb[rel]
        };
        wstream.write(JSON.stringify(fc) + '\n');
      }
    }
    wstream.end();
  });

  handlerA.end();
  handlerB.end();
  handlerC.end();
};